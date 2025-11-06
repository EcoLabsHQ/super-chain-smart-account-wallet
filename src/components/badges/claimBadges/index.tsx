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
import { type ResponseBadge, type SuperChainAccount } from '@/types/super-chain'

export type ClaimData = {
  totalPoints: number
  isLevelUp: boolean
  rewards?: {
    tier_id: string
    symbol: string
    amount: string
  }[]
  badgeUpdates: {
    badgeId: string
    level: number
    points: number
    previousLevel: number
  }[]
  updatedBadges: {
    badgeId: string
    metadata: {
      condition: string
    }
    badgeTiers: {
      metadata: {
        minValue: string
      }
    }[]
  }[]
}

type ClaimBadgesProviderProps = {
  safeAddress: Address
  safeLoaded: boolean
  token: string | null
  data: { currentBadges: BadgeWithPrize[] }
  children: ReactNode
}

type ClaimBadgesContextValue = {
  claim: (extraData?: any) => void
  retry: (extraData?: any) => void
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

  const canClaim: boolean = useMemo(() => {
    return data.currentBadges.some(
      (b) =>
        (b.claimable && (b.badgeId != '11' || (b.badgeId == '11' && b.claimableTier != b.totalClaimed))) || //COHORT STAGING BADGE TEMP FIX
        (b.claimableByPerk ?? false),
    )
  }, [data.currentBadges])

  // p.ej. en ClaimBadgesContext.tsx
  type ClaimResponse = ClaimData & {
    points: number // <- agrega lo que realmente devuelve el backend
    badgeUpdates: ResponseBadge[] // <- asegúrate de que esté tipado
  }

  const { mutate, isPending, isError } = useMutation({
    mutationFn: async (extraData: any): Promise<ClaimResponse> => {
      return await badgesService.attestBadges(
        safeAddress,
        extraData ? { captchaToken: token, ...extraData } : { captchaToken: token },
      )
    },
    onError: (error) => {
      setErrorDetail(String(error))
      console.error(error)
    },
    onSuccess: (response) => {
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
            if (!upd) return badge

            // ResponseBadge: { tier: string; points: string; ... }
            return {
              ...badge,
              tier: String(upd.level ?? badge.tier), // ← antes: level
              points: String(upd.points ?? badge.points),
              // si ResponseBadge no define 'claimable', NO lo agregues aquí
            } as ResponseBadge
          })

          return { currentBadges: badgeUpdates }
        },
      )

      void queryClient.refetchQueries({ queryKey: ['superChainAccount', safeAddress] })

      setClaimData(response)
      setOpenClaimDialog(true)
    },
  })

  const claim = (extraData?: any): void => mutate(extraData)
  const retry = (extraData?: any): void => mutate(extraData)

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
      <LoadingModal open={isPending} title="Claiming badges" />
      <FailedTxnModal open={isError} onClose={closeAll} handleRetry={() => claim()} errorDetail={errorDetail} />
      <ClaimModal
        onLevelUp={() => {
          setOpenClaimDialog(false)
          router.push({ pathname: AppRoutes.home, query: { safe: router.query.safe } })
        }}
        open={openClaimDialog}
        onClose={() => {
          setOpenClaimDialog(false)
          router.push({ pathname: AppRoutes.home, query: { safe: router.query.safe } })
        }}
        data={claimData}
      />
    </ClaimBadgesContext.Provider>
  )
}

export function useClaimBadges(): ClaimBadgesContextValue {
  const ctx = useContext(ClaimBadgesContext)
  if (!ctx) {
    console.error('useClaimBadges must be used within <ClaimBadgesProvider>')
    return undefined as unknown as ClaimBadgesContextValue
  }
  return ctx
}
