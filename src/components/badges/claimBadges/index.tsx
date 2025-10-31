// ClaimBadgesContext.tsx
import React, { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/router'
import badgesService from '@/features/superChain/services/badges.service'
import LoadingModal from '@/components/common/LoadingModal'
import FailedTxnModal from '@/components/common/ErrorModal'
import ClaimModal from '@/components/badges/modals/ClaimModal'
import { AppRoutes } from '@/config/routes'
import { type Address } from 'viem'
import { type BadgeWithPrize } from '@/types/badges'
import { type ClaimData } from '@/components/badges/actions'
import { type ResponseBadge, type SuperChainAccount } from '@/types/super-chain'

type ClaimBadgesProviderProps = {
  safeAddress: Address
  safeLoaded: boolean
  token: string | null
  data: { currentBadges: BadgeWithPrize[] }
  children: ReactNode
}

type ClaimBadgesContextValue = {
  claim: () => void
  retry: () => void
  closeAll: () => void
  isPending: boolean
  isError: boolean
  canClaim: boolean
  claimData: ClaimData | null
  errorDetail: string
}

const ClaimBadgesContext = createContext<ClaimBadgesContextValue | null>(null)

export function ClaimBadgesProvider({ safeAddress, safeLoaded, token, data, children }: ClaimBadgesProviderProps) {
  const router = useRouter()
  const queryClient = useQueryClient()

  const [openClaimDialog, setOpenClaimDialog] = useState<boolean>(false)
  const [claimData, setClaimData] = useState<ClaimData | null>(null)
  const [errorDetail, setErrorDetail] = useState<string>('')

  const canClaim: boolean = useMemo(() => data.currentBadges.some((b) => b.claimable), [data.currentBadges])

  const { mutate, isPending, isError } = useMutation({
    mutationFn: async (): Promise<ClaimData> => {
      return await badgesService.attestBadges(safeAddress, token)
    },
    onError: (error: unknown) => {
      setErrorDetail(String(error))
      // Consola para debug; no UI extra aquí
      // eslint-disable-next-line no-console
      console.error(error)
    },
    onSuccess: (response: ClaimData) => {
      // ——— Cache updates ———
      void queryClient.cancelQueries({ queryKey: ['superChainAccount', safeAddress] })
      void queryClient.cancelQueries({ queryKey: ['badges', safeAddress, safeLoaded] })

      queryClient.setQueryData(['superChainAccount', safeAddress], (old: SuperChainAccount | undefined) => {
        if (!old) return old
        return { ...old, points: response.points }
      })

      queryClient.setQueryData(
        ['badges', safeAddress, safeLoaded],
        (old: { currentBadges: ResponseBadge[] } | undefined) => {
          if (!old) return old
          const badgeUpdates: ResponseBadge[] = old.currentBadges.map((badge) => {
            const upd = response.badgeUpdates.find((u) => u.badgeId === badge.badgeId)
            return upd ? { ...badge, level: upd.level, points: upd.points, claimable: false } : badge
          })
          return { currentBadges: [...old.currentBadges, ...badgeUpdates] }
        },
      )

      void queryClient.refetchQueries({ queryKey: ['superChainAccount', safeAddress] })

      // ——— Modales ———
      setClaimData(response)
      setOpenClaimDialog(true)
    },
  })

  const claim = (): void => mutate()
  const retry = (): void => mutate()

  const closeAll = (): void => {
    setOpenClaimDialog(false)
    router.push({ pathname: AppRoutes.home, query: { safe: router.query.safe } })
  }

  const value: ClaimBadgesContextValue = {
    claim,
    retry,
    closeAll,
    isPending,
    isError,
    canClaim,
    claimData,
    errorDetail,
  }

  return (
    <ClaimBadgesContext.Provider value={value}>
      {children}

      {/* ——— Modales centralizados, se renderizan siempre aquí ——— */}
      <LoadingModal open={isPending} title="Claiming badges" />
      <FailedTxnModal open={isError} onClose={closeAll} handleRetry={retry} errorDetail={errorDetail} />
      <ClaimModal
        onLevelUp={() => setOpenClaimDialog(false)}
        open={openClaimDialog}
        onClose={() => setOpenClaimDialog(false)}
        data={claimData}
      />
    </ClaimBadgesContext.Provider>
  )
}

export function useClaimBadges(): ClaimBadgesContextValue {
  const ctx = useContext(ClaimBadgesContext)
  if (!ctx) throw new Error('useClaimBadges must be used within <ClaimBadgesProvider>')
  return ctx
}
