import { useCurrentChain } from '@/hooks/useChains'
import { useCallback, useContext } from 'react'
import type { PendingSafeData } from '../../types'
import { PendingSafeContext } from './PendingSafeContext'

export const usePendingSafe = (): [PendingSafeData | undefined, (safe: PendingSafeData | undefined) => void] => {
  const { pendingSafes, setPendingSafes } = useContext(PendingSafeContext)
  const chainInfo = useCurrentChain()

  const pendingSafe = chainInfo && pendingSafes?.[chainInfo.chainId]
  const setPendingSafe = useCallback(
    (safe: PendingSafeData | undefined) => {
      if (!chainInfo?.chainId) {
        return
      }

      const newPendingSafes = { ...pendingSafes }
      newPendingSafes[chainInfo.chainId] = safe
      setPendingSafes(newPendingSafes)
    },
    [chainInfo?.chainId, pendingSafes, setPendingSafes],
  )

  return [pendingSafe, setPendingSafe]
}
