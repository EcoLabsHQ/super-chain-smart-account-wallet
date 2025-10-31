import type { ResponseBadge } from '@/types/super-chain'
import type { BadgeRenderStrategy } from '../BadgeStrategyRenderer'
import { AuthKitProvider, SignInButton, UseSignInData } from '@farcaster/auth-kit'
import '@farcaster/auth-kit/styles.css'
import React, { useEffect, useRef, useState } from 'react'
import useSafeAddress from '@/hooks/useSafeAddress'
import { Box } from '@mui/material'

import { JSON_RPC_PROVIDER } from '@/features/superChain/constants'
import { BACKEND_AUTH_URI, BACKEND_BASE_URI } from '@/config/constants'
import axios from 'axios'
import FailedTxnModal from '@/components/common/ErrorModal'
import { getSiweToken } from '@/utils/helpers'

// ⬇️ Opcional: si estás usando el Provider headless
import { useClaimBadges } from '@/components/badges/claimBadges'

/** ———————————————————————————————
 * Estrategia: ahora acepta onClaim en el constructor
 * ——————————————————————————————— */
class FarcasterLinkStrategy implements BadgeRenderStrategy {
  private readonly onClaim?: () => void
  constructor(params?: { onClaim?: () => void }) {
    this.onClaim = params?.onClaim
  }
  canRender(badge: ResponseBadge): boolean {
    return badge.metadata.name === 'FarCaster Connection'
  }
  render(badge: ResponseBadge): React.ReactNode {
    return <MemoizedFarcasterVerificationComponent badge={badge} onClaim={this.onClaim} />
  }
}

export { FarcasterLinkStrategy }

const domain = 'account.superchain.eco'
const siweUri = BACKEND_AUTH_URI + '/verify'
const rpcUrl = JSON_RPC_PROVIDER

type FarcasterVerificationProps = {
  badge: ResponseBadge
  /** Handler provisto por el padre para disparar el claim; si no viene, se intenta usar el Provider */
  onClaim?: () => void
}

export function FarcasterVerificationComponent({ badge, onClaim }: FarcasterVerificationProps) {
  const address = useSafeAddress()
  const buttonRef = useRef<HTMLDivElement>(null)
  const [currentUser, setCurrentUser] = useState('Link Account')
  const [errorDetail, setErrorDetail] = useState<string>('')
  const [isError, setIsError] = useState<boolean>(false)

  // Intentar obtener claim() del Provider si no nos pasan onClaim
  let claimFromProvider: (() => void) | undefined
  try {
    const { claim } = useClaimBadges()
    claimFromProvider = claim
  } catch {
    claimFromProvider = undefined
  }

  const triggerClaim = () => {
    const fire = onClaim ?? claimFromProvider
    if (fire) fire()
    // window.dispatchEvent(new CustomEvent('claim-badges'))
  }

  const onCloseError = () => setIsError(false)

  useEffect(() => {
    const innerSpan = buttonRef.current?.querySelector('span')
    if (innerSpan) innerSpan.textContent = currentUser
  }, [currentUser])

  const onSucess = async (res: UseSignInData) => {
    setCurrentUser(res.displayName!)
    const httpInstance = axios.create({ baseURL: BACKEND_BASE_URI })
    const token = getSiweToken()

    try {
      await httpInstance.post(
        `${BACKEND_BASE_URI}/farcaster/verify/${address}`,
        { ...res },
        { headers: { Authorization: `Bearer ${token}` } },
      )
      // ⬇️ Dispara el flujo de claim desde este componente
      triggerClaim()
    } catch (e) {
      setErrorDetail(String(e))
      setIsError(true)
      // eslint-disable-next-line no-console
      console.error('Verification failed:', e)
    }
  }

  if (Number(badge.tier) === 0)
    return (
      <AuthKitProvider
        config={{
          domain,
          siweUri,
          rpcUrl,
        }}
      >
        <Box ref={buttonRef} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <SignInButton hideSignOut={true} onSuccess={onSucess} />
        </Box>
        <FailedTxnModal
          open={isError}
          onClose={onCloseError}
          handleRetry={() => {
            const btn = buttonRef.current?.querySelector('button')
            btn?.click()
          }}
          errorDetail={errorDetail}
        />
      </AuthKitProvider>
    )
  return <></>
}

export const MemoizedFarcasterVerificationComponent = React.memo(FarcasterVerificationComponent)
