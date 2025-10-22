import type { NextPage } from 'next'
import Head from 'next/head'
import { useMemo, useState } from 'react'
import SearchIcon from '@mui/icons-material/Search'
import { Box, Button, Divider, InputAdornment, MenuItem, Select, Stack, TextField, Typography } from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import { ResponseBadge } from '@/types/super-chain'
import useSafeInfo from '@/hooks/useSafeInfo'
import LoadIcon from '@/public/images/common/load.svg'
import badgesService from '@/features/superChain/services/badges.service'
import CampaignBadge from '@/components/campaigns/badge'
import { useRouter } from 'next/router'
import { AppRoutes } from '@/config/routes'

const Home: NextPage = () => {
  const router = useRouter()
  const [token, setToken] = useState<string | null>(null)
  const [chain, setChain] = useState('')
  const [season, setSeason] = useState<undefined | string>()
  const [campaign, setCampaign] = useState('')
  const [search, setSearch] = useState('')
  const { safeAddress, safeLoaded } = useSafeInfo()
  const { data, isLoading, error } = useQuery<{
    currentBadges: ResponseBadge[]
  }>({
    queryKey: ['badges', safeAddress, safeLoaded],
    queryFn: async () => await badgesService.getBadges((safeAddress as `0x${string}`) ?? []),
    refetchInterval: 10000,
    enabled: !!safeLoaded,
  })
  const filterBadges = (badges: ResponseBadge[]): ResponseBadge[] => {
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
    if (season) {
      filtered = filtered.filter((badge) => badge.metadata.season == (parseInt(season) ?? 0))
    }
    if (season) {
      filtered = filtered.filter((badge) => badge.metadata.season == (parseInt(season) ?? 0))
    }
    if (campaign) {
      filtered = filtered.filter((badge) => badge.campaigns.includes(campaign))
    }

    return filtered
  }
  const filteredBadges = useMemo<ResponseBadge[]>(
    () => filterBadges(data?.currentBadges ?? []),
    [data?.currentBadges, search, chain, season, campaign],
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
            <Stack direction="row" alignItems="center" gap="8px">
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
                  width: 238,
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
                value={season}
                displayEmpty
                size="small"
                onChange={(event) => setSeason(event.target.value ?? undefined)}
                renderValue={() => (season == undefined ? 'Season' : season)}
                sx={{
                  height: 36,
                  borderRadius: '12px',
                  backgroundColor: '#F1F2F5',
                  fontFamily: 'DM Sans',
                  fontSize: 14,
                  fontWeight: 600,
                  letterSpacing: '0.14px',
                  padding: '0 8px',
                  '& .MuiOutlinedInput-notchedOutline': {
                    border: 'none',
                  },
                }}
              >
                <MenuItem value={undefined}>All time</MenuItem>
                <MenuItem value={7}>7</MenuItem>
                <MenuItem value={8}>8</MenuItem>
              </Select>
              <Select
                value={chain}
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
                  setSeason(undefined)
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
                  '&:hover': {
                    backgroundColor: 'transparent',
                  },
                }}
              >
                Clear All
              </Button>
              <Button
                component="a"
                // href={campaign.campaign_link}
                target="_blank"
                rel="noreferrer"
                variant="text"
                sx={{
                  height: '36px',
                  backgroundColor: 'black',
                  borderRadius: '12px',
                  color: 'white',
                  ':hover': { backgroundColor: 'black' },
                  padding: '15px 10px 15px 8px',
                }}
              >
                <Stack direction="row" alignItems="center" gap="4px">
                  <LoadIcon style={{ width: '16px', heigth: '16px' }} />
                  <Typography variant="body2" fontWeight={600}>
                    Claim Badges
                  </Typography>
                </Stack>
              </Button>
            </Stack>
          </Stack>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '8px',
            }}
          >
            {(filteredBadges ?? []).map((badge, idx) => (
              <div
                key={badge?.metadata.name ?? `badge-${idx}`}
                onClick={() => handlePickBadge(badge.badgeId)}
                style={{ cursor: 'pointer' }}
              >
                <CampaignBadge
                  badge={{
                    id: badge.badgeId,
                    completed: badge.claimable,
                    badgeName: badge.metadata.name,
                    currentPoints: 0,
                    maxPoints: 0,
                    currentLevel: parseInt(badge.tier) > 0 ? parseInt(badge.tier) : 0,
                    maxLevel: badge.badgeTiers.length,
                    description: badge.metadata.description,
                    season: badge.metadata.season,
                    image: badge.metadata.image,
                    type: '',
                  }}
                />
              </div>
            ))}
          </Box>
        </Stack>
        {/* <Badges captchaToken={token} />
        <Turnstile onSuccess={handleToken} sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!} /> */}
      </main>
    </>
  )
}

export default Home
