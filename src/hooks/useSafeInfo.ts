import { useMemo } from 'react'
import isEqual from 'lodash/isEqual'
import { useAppSelector } from '@/store'
import { defaultSafeInfo, type ExtendedSafeInfo, selectSafeInfo } from '@/store/safeInfoSlice'
import { useQuery } from '@tanstack/react-query'
import badgesService from '@/features/superChain/services/badges.service'
import { BadgeWithPrize } from '@/types/badges'

const useSafeInfo = (): {
  safe: ExtendedSafeInfo
  safeAddress: string
  safeLoaded: boolean
  safeLoading: boolean
  safeError?: string
  badges: BadgeWithPrize[] | undefined
} => {
  const { data, error, loading } = useAppSelector(selectSafeInfo, isEqual)

  const result = useMemo(
    () => ({
      safe: data || defaultSafeInfo,
      safeAddress: data?.address.value || '',
      safeLoaded: !!data,
      safeError: error,
      safeLoading: loading,
    }),
    [data, error, loading],
  )

  const { data: badges } = useQuery<{
    currentBadges: BadgeWithPrize[]
  }>({
    queryKey: ['badges', result.safeAddress, result.safeLoaded],
    queryFn: async () => await badgesService.getBadgesWithPrizes((result.safeAddress as `0x${string}`) ?? []),
    refetchInterval: 10000,
    enabled: !!result.safeLoaded,
  })

  return { badges: badges?.currentBadges, ...result }
}
export default useSafeInfo
