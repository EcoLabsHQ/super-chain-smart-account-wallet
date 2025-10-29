import type { NextPage } from 'next'
import Head from 'next/head'
import { useEffect, useMemo, useState } from 'react'
import SearchIcon from '@mui/icons-material/Search'
import { Box, Button, Divider, Grid, InputAdornment, MenuItem, Select, Stack, TextField, Typography } from '@mui/material'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import useSafeInfo from '@/hooks/useSafeInfo'
import LoadIcon from '@/public/images/common/load.svg'
import badgesService from '@/features/superChain/services/badges.service'
import CampaignBadge from '@/components/campaigns/badge'
import { useRouter } from 'next/router'
import { AppRoutes } from '@/config/routes'
import { BadgeWithPrize } from '@/types/badges'
import ClaimModal from '@/components/badges/modals/ClaimModal'
import { ClaimData } from '@/components/badges/actions'
import { Address } from 'viem'
import { ResponseBadge, SuperChainAccount } from '@/types/super-chain'
import Turnstile from 'react-turnstile'
import LoadingModal from '@/components/common/LoadingModal'

const Home: NextPage = () => {
  const router = useRouter()
  const [token, setToken] = useState<string | null>(null)
  const [openClaimDialog, setOpenClaimDialog] = useState<boolean>(false)
  const [chain, setChain] = useState('')
  const [withRewards, setWithRewards] = useState<undefined | string>()
  const [campaign, setCampaign] = useState('')
  const [search, setSearch] = useState('')
  const [claimData, setClaimData] = useState<ClaimData | null>(null)
  const { safeAddress, safeLoaded } = useSafeInfo()
  const queryClient = useQueryClient()
  const { data, isLoading, error } = useQuery<{
    currentBadges: BadgeWithPrize[]
  }>({
    queryKey: ['badges', safeAddress, safeLoaded],
    queryFn: async () => await badgesService.getBadgesWithPrizes((safeAddress as `0x${string}`) ?? []),
    refetchInterval: 10000,
    enabled: !!safeLoaded,
  })
  const { mutate, isPending, isError } = useMutation({
    mutationFn: async () => {
      return await badgesService.attestBadges(safeAddress as Address, token)
    },
    onError: (error) => {
      console.error(error)
    },
    onSuccess: (data) => {
      queryClient.cancelQueries({ queryKey: ['superChainAccount', safeAddress] })
      queryClient.cancelQueries({ queryKey: ['badges', safeAddress, safeLoaded] })
      queryClient.setQueryData(['superChainAccount', safeAddress], (old: SuperChainAccount) => {
        return {
          ...old,
          points: data.points,
        }
      })
      queryClient.setQueryData(['badges', safeAddress, safeLoaded], (old: { currentBadges: ResponseBadge[] }) => {
        const badgeUpdates = old.currentBadges.map((badge) => {
          const update = data.badgeUpdates.find((update: ResponseBadge) => update.badgeId === badge.badgeId)
          if (update) {
            return {
              ...badge,
              level: update.level,
              points: update.points,
              claimable: false,
            }
          }
          return badge
        })
        return {
          currentBadges: [...old.currentBadges, ...badgeUpdates],
        }
      })
      queryClient.refetchQueries({ queryKey: ['superChainAccount', safeAddress] })
      setClaimData(data)
      setOpenClaimDialog(true)
    },
  })
  useEffect(() => {
    const handler = (event: Event) => {
      const customEvent = event as CustomEvent
      const data = customEvent.detail
      mutate()
    }

    window.addEventListener('claim-badges', handler)

    return () => {
      window.removeEventListener('claim-badges', handler)
    }
  }, [mutate])

  const filterBadges = (badges: BadgeWithPrize[]): BadgeWithPrize[] => {
    let filtered = badges
    if (search) {
      filtered = filtered.filter(
        (badge) =>
          badge.metadata.name.toLowerCase().includes(search.toLowerCase()) ||
          badge.metadata.platform.toLowerCase().includes(search.toLowerCase()),
      )
    }
    if (chain) {
      filtered = filtered.filter((badge) =>
        badge.metadata.chains?.some((currentChain: string) => currentChain == chain),
      )
    }
    if (withRewards) {
      filtered = filtered.filter((badge) =>
        withRewards == 'Available' ? badge.tokenBadge != null : badge.tokenBadge == null,
      )
    }

    if (campaign) {
      filtered = filtered.filter((badge) => badge.campaigns.includes(campaign))
    }

    return filtered
  }
  const filteredBadges = useMemo<BadgeWithPrize[]>(
    () => filterBadges(data?.currentBadges ?? []),
    [data?.currentBadges, search, chain, withRewards, campaign],
  )

  const handlePickBadge = (id: string) => {
    router.push({ pathname: `${AppRoutes.badges.allTime}/${id}`, query: { safe: router.query.safe } })
  }

  if (isLoading || !data?.currentBadges)
    return (
      <>
        <Head>
          <title>Super Account - Badges</title>
        </Head>

        <main>
          <Stack gap="32px" sx={{ maxWidth: 852, mx: 'auto' }}>
            <Stack gap="8px">
              <Typography variant="h3" fontWeight={600}>
                Badges
              </Typography>
              <Typography variant="body2" fontWeight={400} color="#4B4B4E">
                Earn badges to gain SC points and unlock rewards.
              </Typography>
            </Stack>
            <Stack gap="16px">
              <Divider />
            </Stack>
          </Stack>
        </main>
      </>
    )

  return (
    <>
      <Head>
        <title>Super Account - Badges</title>
      </Head>

      <main>
        <Stack gap="32px" sx={{ maxWidth: { xs: '100%', md: 852 }, mx: 'auto', px: { xs: 2, md: 0 } }}>
          <Stack gap="8px">
            <Typography variant="h3" fontWeight={600}>
              Badges
            </Typography>
            <Typography variant="body2" fontWeight={400} color="#4B4B4E">
              Earn badges to gain SC points and unlock rewards.
            </Typography>
          </Stack>
          <Stack gap="16px">
            <Divider />
            <Stack
              sx={{
                flexDirection: { xs: 'column', sm: 'row' },
                justifyContent: 'space-between',
                alignItems: { xs: 'stretch', sm: 'center' },
                gap: { xs: 1, sm: 0 },
              }}
            >
              <Stack direction="row" alignItems="center" gap={1} sx={{ flexWrap: 'wrap' }}>
                {/* Search */}
                <TextField
                  value={search}
                  placeholder="Search"
                  onChange={(event) => setSearch(event.target.value)}
                  variant="outlined"
                  size="small"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ fontSize: 18 }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    width: { xs: '100%', sm: 238 },
                    height: 36,
                    borderRadius: '12px',
                    backgroundColor: '#F1F2F5',
                    '& .MuiOutlinedInput-root': {
                      fontFamily: 'DM Sans',
                      fontSize: 14,
                      fontWeight: 600,
                      letterSpacing: '0.14px',
                      lineHeight: '16px',
                      padding: '0 8px',
                      '& fieldset': {
                        border: 'none',
                      },
                      '& input::placeholder': {
                        color: '#000',
                        opacity: 1,
                      },
                    },
                  }}
                />

                {/* Chain Select */}
                <Select
                  value={chain}
                  displayEmpty
                  size="small"
                  onChange={(event) => setChain(event.target.value ?? '')}
                  renderValue={() => (chain == '' ? 'Chain' : chain)}
                  sx={{
                    height: 36,
                    borderRadius: '12px',
                    backgroundColor: '#F1F2F5',
                    fontFamily: 'DM Sans',
                    fontSize: 14,
                    fontWeight: 600,
                    letterSpacing: '0.14px',
                    padding: '0 8px',
                    width: { xs: '48%', sm: 'auto' },
                    '& .MuiOutlinedInput-notchedOutline': {
                      border: 'none',
                    },
                  }}
                >
                  <MenuItem value="Ink">Ink</MenuItem>
                  <MenuItem value="lisk">Lisk</MenuItem>
                  <MenuItem value="Soneium">Soneium</MenuItem>
                  <MenuItem value="Base">Base</MenuItem>
                  <MenuItem value="Optimism">Optimisim</MenuItem>
                  <MenuItem value="Mode">Mode</MenuItem>
                  <MenuItem value="Unichain">Unichain</MenuItem>
                  <MenuItem value="arb">Arbitrum</MenuItem>
                </Select>
                <Select
                  value={withRewards}
                  displayEmpty
                  size="small"
                  onChange={(event) => setWithRewards(event.target.value)}
                  renderValue={() => (withRewards == undefined ? 'Rewards' : withRewards)}
                  sx={{
                    height: 36,
                    borderRadius: '12px',
                    backgroundColor: '#F1F2F5',
                    fontFamily: 'DM Sans',
                    fontSize: 14,
                    fontWeight: 600,
                    letterSpacing: '0.14px',
                    padding: '0 8px',
                    width: { xs: '48%', sm: 'auto' },
                    '& .MuiOutlinedInput-notchedOutline': {
                      border: 'none',
                    },
                  }}
                >
                  <MenuItem value={undefined}>All</MenuItem>
                  <MenuItem value="Available">Available</MenuItem>
                  <MenuItem value="Not Available">Not Available</MenuItem>
                </Select>
                <Select
                  value={campaign}
                  displayEmpty
                  size="small"
                  onChange={(event) => setCampaign(event.target.value ?? '')}
                  renderValue={() => (campaign == '' ? 'Campaign' : campaign)}
                  sx={{
                    height: 36,
                    borderRadius: '12px',
                    backgroundColor: '#F1F2F5',
                    fontFamily: 'DM Sans',
                    fontSize: 14,
                    fontWeight: 600,
                    letterSpacing: '0.14px',
                    padding: '0 8px',
                    width: { xs: '48%', sm: 'auto' },
                    '& .MuiOutlinedInput-notchedOutline': {
                      border: 'none',
                    },
                  }}
                >
                  <MenuItem>All</MenuItem>
                  <MenuItem value="SuperStacks">SuperStacks</MenuItem>
                  <MenuItem value="Lisk Surge">Lisk Surge</MenuItem>
                </Select>

                {/* Clear All */}
                <Button
                  variant="text"
                  disableRipple
                  onClick={() => {
                    setSearch('')
                    setChain('')
                    setWithRewards(undefined)
                    setCampaign('')
                  }}
                  sx={{
                    height: 36,
                    borderRadius: '12px',
                    padding: '0 4px',
                    fontFamily: 'DM Sans',
                    fontSize: 14,
                    fontWeight: 600,
                    letterSpacing: '0.14px',
                    textTransform: 'none',
                    color: '#000',
                    width: { xs: '100%', sm: 'auto' },
                    '&:hover': {
                      backgroundColor: 'transparent',
                    },
                  }}
                >
                  Clear All
                </Button>
              </Stack>
              <Stack direction="row" alignItems="center" gap={1} sx={{ mt: { xs: 1, sm: 0 }, justifyContent: { xs: 'flex-start', sm: 'flex-end' } }}>
                <Button
                  component="a"
                  onClick={() => mutate()}
                  disabled={!data.currentBadges.some((badge) => badge.claimable)}
                  target="_blank"
                  rel="noreferrer"
                  variant="text"
                  sx={{
                    height: 36,
                    backgroundColor: 'black',
                    borderRadius: '12px',
                    color: 'white',
                    ':hover': { backgroundColor: 'black' },
                    '&.Mui-disabled': {
                      backgroundColor: '#EBECF1',
                      color: '#A0A0A6',
                    },
                    padding: '10px 12px',
                  }}
                >
                  <Stack direction="row" alignItems="center" gap={1}>
                    <Box
                      sx={{
                        width: 16,
                        height: 16,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        // definimos la animación aquí
                        '@keyframes spin': {
                          '0%': { transform: 'rotate(0deg)' },
                          '100%': { transform: 'rotate(360deg)' },
                        },
                        animation: isPending ? 'spin 1s linear infinite' : 'none',
                        // opcional: suavizar el giro
                        transformOrigin: 'center',
                      }}
                    >
                      <LoadIcon sx={{ width: '100%', height: '100%' }} />
                    </Box>
                    <Typography variant="body2" fontWeight={600} color="white" sx={{ whiteSpace: 'nowrap' }}>
                      Claim badges
                    </Typography>
                  </Stack>
                </Button>
              </Stack>
            </Stack>
          </Stack>
          <Box>
            <Grid container spacing={2} alignItems="stretch">
              {(filteredBadges ?? []).map((badge, idx) => (
                <Grid item xs={12} sm={6} key={badge?.metadata.name ?? `badge-${idx}`} sx={{ display: 'flex' }}>
                  <Box
                    onClick={() => handlePickBadge(badge.badgeId)}
                    sx={{
                      flex: 1,
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      '& > *': { flex: 1 },
                    }}
                  >
                    <CampaignBadge
                      badge={{
                        id: badge.badgeId,
                        completed: badge.claimable,
                        badgeName: badge.metadata.name,
                        currentPoints: 0,
                        maxPoints: 0,
                        currentLevel: badge.tier,
                        maxLevel: badge.badgeTiers.length,
                        description: badge.metadata.description,
                        season: badge.metadata.season,
                        image: badge.metadata.image?.replace('/Badge.svg', `/T${badge.tier}.svg`) ?? '',
                        type: '',
                        tokenBadge: !!badge.tokenBadge,
                      }}
                      myPoints={[{ id: Number(badge.badgeId), points: badge.points }]}
                      pointsOnHover={true}
                    />
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Stack>
        <LoadingModal open={isPending} title="Claiming badges" />
        <ClaimModal
          onLevelUp={() => setOpenClaimDialog(false)}
          open={openClaimDialog}
          onClose={() => setOpenClaimDialog(false)}
          data={claimData}
        ></ClaimModal>
        <Turnstile onSuccess={(token) => setToken(token)} sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!} />
        {/* <Badges captchaToken={token} />
        <Turnstile onSuccess={handleToken} sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!} /> */}
      </main>
    </>
  )
}

export default Home
