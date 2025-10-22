import { Grid, LinearProgress, Stack, styled, Typography } from '@mui/material'
import React, { useMemo, useState } from 'react'
import BadgesActions from './actions'
import BadgesContent from './content'
import type { ResponseBadge } from '@/types/super-chain'
import { useQuery } from '@tanstack/react-query'
import { useAppSelector } from '@/store'
import { selectSuperChainAccount } from '@/store/superChainAccountSlice'
import badgesService from '@/features/superChain/services/badges.service'
import useSafeInfo from '@/hooks/useSafeInfo'
import { useRouter } from 'next/router'

export const networks = [
  {
    label: 'Optimism',
    value: 'optimism',
    icon: 'https://safe-transaction-assets.safe.global/chains/10/chain_logo.png',
  },
  { label: 'Base', value: 'base', icon: 'https://safe-transaction-assets.safe.global/chains/8453/chain_logo.png' },
  { label: 'Mode', value: 'mode', icon: '/chains/34443/chain_logo.svg' },
  { label: 'Ethereum', value: 'ethereum', icon: 'https://safe-transaction-assets.safe.global/chains/1/chain_logo.png' },
  { label: 'Lisk', value: 'lisk', icon: '/chains/1135/chain_logo.svg' },
  {
    label: 'Unichain',
    value: 'unichain',
    icon: 'https://safe-transaction-assets.safe.global/chains/130/chain_logo.png',
  },
  {
    label: 'Ink',
    value: 'ink',
    icon: '/chains/57073/chain_logo.svg',
  },
  {
    label: 'Soneium',
    value: 'soneium',
    icon: '/chains/1868/chain_logo.svg',
  },
  {
    label: 'World',
    value: 'worldcoin',
    icon: 'https://safe-transaction-assets.safe.global/chains/480/chain_logo.png',
  },
]

export const GradientProgress = styled(LinearProgress)(({ theme }) => ({
  height: 10,
  borderRadius: 5,
  backgroundColor: 'transparent',
  border: '1px solid #D0D0D0',
  '& .MuiLinearProgress-bar': {
    background: 'linear-gradient(90deg, rgba(255, 148, 159, 1) 0%, rgba(255, 77, 97, 1) 100%)',
    borderRadius: 5,
  },
}))

function Badges({
  season,
  captchaToken,
}: {
  season?: { code: number; name: string; isActive: boolean }
  captchaToken: string | null
}) {
  const { data: superChainAccount, loading: isSuperChainLoading } = useAppSelector(selectSuperChainAccount)
  const { safeAddress, safeLoaded } = useSafeInfo()
  const [searchTerm, setSearchTerm] = useState<string | undefined>(undefined)
  const [selectedNetworks, setSelectedNetworks] = useState<string[]>([])
  const router = useRouter()
  const { campaign } = router.query
  const [selectedCampaign, setSelectedCampaign] = useState<string>(campaign as string)

  const { data, isLoading, error } = useQuery<{
    currentBadges: ResponseBadge[]
  }>({
    queryKey: ['badges', safeAddress, safeLoaded],
    queryFn: async () => await badgesService.getBadges(safeAddress as `0x${string}`),
    refetchInterval: 10000,
    enabled: !!safeLoaded,
  })
  const isClaimable = useMemo(() => data?.currentBadges.some((badge) => badge.claimable), [data?.currentBadges])
  const currentPageBadges = season
    ? data?.currentBadges.filter((x) => x.metadata.season === season.code)
    : data?.currentBadges
  const filteredBadges = useMemo(() => {
    if (!data || !currentPageBadges) return []

    let filtered = currentPageBadges

    if (searchTerm) {
      filtered = filtered.filter(
        (badge) =>
          badge.metadata.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          badge.metadata.platform.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }
    if (selectedNetworks.length > 0) {
      filtered = filtered.filter((badge) =>
        badge.metadata.chains?.some((chain: string) =>
          selectedNetworks.some((selected) => chain.toLowerCase() === selected.toLowerCase()),
        ),
      )
    }
    if (selectedCampaign) {
      console.debug(selectedCampaign)
      filtered = filtered.filter((badge) => badge.campaigns.includes(selectedCampaign))
    }

    return filtered
  }, [data?.currentBadges, searchTerm, selectedNetworks, selectedCampaign])
  return (
    <Grid spacing={2} container>
      <Stack gap="8px">
        <Typography variant="h3" fontWeight={600}>
          Badges
        </Typography>
        <Typography variant="body2" fontWeight={400} color="#4B4B4E">
          Earn badges to gain SC points and unlock rewards.
        </Typography>
      </Stack>
      <BadgesActions
        captchaToken={captchaToken}
        setNetworks={setSelectedNetworks}
        setFilter={setSearchTerm}
        setCampaign={setSelectedCampaign}
        claimable={isClaimable ?? false}
        selectedNetworks={selectedNetworks}
        selectedCampaign={selectedCampaign}
      />
      <BadgesContent badges={filteredBadges} isLoading={isLoading} error={error} />
    </Grid>
  )
}

export default Badges
