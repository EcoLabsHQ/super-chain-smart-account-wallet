import type { ResponseBadge } from '@/types/super-chain'
import type { BadgeRenderStrategy } from '../BadgeStrategyRenderer'
import { Button } from '@mui/material'
import axios from 'axios'
import { IDKitWidget, ISuccessResult, VerificationLevel } from '@worldcoin/idkit'
import { BACKEND_BASE_URI, WORLD_ID_ACTION, WORLD_ID_APP_ID, WORLD_ID_SIGNAL } from '@/config/constants'
import React from 'react'
import useSafeAddress from '@/hooks/useSafeAddress'

class WorldIDVerificationStrategy implements BadgeRenderStrategy {
  canRender(badge: ResponseBadge): boolean {
    return badge.metadata.name === 'Worldcoin Verification'
  }

  render(badge: ResponseBadge): React.ReactNode {
    return <MemoizedWorldIDVerificationComponent badge={badge} />
  }
}

export { WorldIDVerificationStrategy }

export function WorldIDVerificationComponent({ badge }: { badge: ResponseBadge }) {
  const address = useSafeAddress()
  async function onSuccess(result: ISuccessResult): Promise<void> {
    const httpInstance = axios.create({
      baseURL: BACKEND_BASE_URI,
      withCredentials: true,
    })

    try {
      await httpInstance.post(`${BACKEND_BASE_URI}/world-id/verify/${address}`, { ...result })
      window.dispatchEvent(new CustomEvent('claim-badges'))
    } catch (error) {
      console.error('Verification failed:', error)
    }
  }
  console.log('Badge info here: ', badge.tier)
  return (
    <>
      <IDKitWidget
        app_id={WORLD_ID_APP_ID as `app_${string}`}
        action={WORLD_ID_ACTION}
        signal={WORLD_ID_SIGNAL}
        onSuccess={onSuccess}
        verification_level={VerificationLevel.Orb}
      >
        {({ open }) => {
          return (
            <Button
              variant="contained"
              color="primary"
              onClick={open}
              disabled={Number(badge.tier) > 0}
              sx={{ borderRadius: '6px', textTransform: 'none', fontWeight: 600, padding: '8px 24px', mt: 2, mb: 2 }}
            >
              Verify
            </Button>
          )
        }}
      </IDKitWidget>
    </>
  )
}
export const MemoizedWorldIDVerificationComponent = React.memo(WorldIDVerificationComponent)
