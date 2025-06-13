import type { ResponseBadge } from '@/types/super-chain'
import type { BadgeRenderStrategy } from '../BadgeStrategyRenderer'
import { Button } from '@mui/material'
import axios from 'axios'
import { AuthKitProvider, useSignIn, useProfile } from '@farcaster/auth-kit'
import '@farcaster/auth-kit/styles.css'
import QRCode from 'qrcode.react'
import { BACKEND_BASE_URI } from '@/config/constants'
import React from 'react'
import useSafeAddress from '@/hooks/useSafeAddress'
import { ur } from '@faker-js/faker'

class FarcasterLinkStrategy implements BadgeRenderStrategy {
  canRender(badge: ResponseBadge): boolean {
    return badge.metadata.name === 'Base User'
  }

  render(badge: ResponseBadge): React.ReactNode {
    return <MemoizedFarcasterLinkComponent badge={badge} />
  }
}

export { FarcasterLinkStrategy }

const appId = 'TU_APP_ID_AQUI' // tu App ID real de Farcaster
const domain = 'tudominio.com' // el dominio configurado para AuthKit
const redirectUri = 'https://TU_DOMINIO/api/auth/farcaster-callback' // tu backend callback

export function FarcasterLinkComponent({ badge }: { badge: ResponseBadge }) {
  const address = useSafeAddress()

  return (
    <AuthKitProvider
      config={{
        domain: domain,
        siweUri: redirectUri,
        rpcUrl: 'https://hub.farcaster.network',
      }}
    >
      <LoginWithQRCode />
    </AuthKitProvider>
  )
}

function LoginWithQRCode() {
  const { isConnected, isError, isPolling, url, isSuccess } = useSignIn({
    onSuccess: (data) => {
      console.log('✅ Login success:', data)
      // Aquí puedes llamar a tu backend para vincular el FID con la cuenta wallet
      // Por ejemplo:
      // axios.post(`${BACKEND_BASE_URI}/farcaster/link`, { fid: data.fid, address: userWallet })
    },
  })

  const profile = useProfile()

  if (profile.profile) {
    return (
      <div style={{ textAlign: 'center' }}>
        <h2>Bienvenido {profile.profile.username}</h2>
        <img src={profile.profile.pfpUrl} alt="Avatar" width={80} />
      </div>
    )
  }

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h2>Login with Farcaster</h2>

      {url && !isConnected && (
        <>
          <QRCode value={url} size={256} />
          <p>Escanea con Warpcast para iniciar sesión</p>
        </>
      )}

      {isPolling && <p>Generando QR…</p>}
      {isError && <p>Ocurrió un error, intenta nuevamente.</p>}
    </div>
  )
}

export const MemoizedFarcasterLinkComponent = React.memo(FarcasterLinkComponent)
