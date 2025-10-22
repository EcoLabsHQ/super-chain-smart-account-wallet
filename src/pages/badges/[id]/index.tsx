import NetworkChip from '@/components/badges/networkChip'
import badgesService from '@/features/superChain/services/badges.service'
import useSafeInfo from '@/hooks/useSafeInfo'
import { ResponseBadge } from '@/types/super-chain'
import { ArrowBack, Launch } from '@mui/icons-material'
import { Button, Card, Divider, Skeleton, Stack, Typography } from '@mui/material'
import InfoIcon from '@/public/images/common/info-soft-gray.svg'
import InfoBlackIcon from '@/public/images/common/info-black.svg'
import BadgesClaimedIcon from '@/public/images/common/badges-claimed.svg'
import { useQuery } from '@tanstack/react-query'
import Head from 'next/head'
import { useRouter } from 'next/router'
import React from 'react'
import { formatAmount } from '@/components/campaigns'
import BadgeTierCard from '@/components/badges/tier'
import SeasonChip from '@/components/badges/seasonChip'

export default function BadgePage() {
  const router = useRouter()
  const { safeAddress, safeLoaded } = useSafeInfo()
  const { data, isLoading, error } = useQuery<{
    currentBadges: ResponseBadge[]
  }>({
    queryKey: ['badges', safeAddress, safeLoaded],
    queryFn: async () => await badgesService.getBadges((safeAddress as `0x${string}`) ?? []),
    refetchInterval: 10000,
    enabled: !!safeLoaded,
  })
  if (isLoading || !data)
    return (
      <>
        <Head>
          <title>Super Account - Campaigns</title>
        </Head>
        <main>
          <Stack gap="32px" sx={{ p: 4, maxWidth: 672, mx: 'auto' }}>
            {/* Header skeleton */}
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Stack direction="row" gap="16px" alignContent="center">
                <Skeleton variant="circular" width={36} height={36} />
                <Skeleton variant="text" width={220} height={40} />
              </Stack>
              <Stack direction="row" spacing={2}>
                <Skeleton variant="rounded" width={118} height={36} />
                <Skeleton variant="rounded" width={118} height={36} />
              </Stack>
            </Stack>

            <Divider />

            {/* Description card */}
            <Card sx={{ border: '1px solid #E1E2EA', borderRadius: '12px', padding: '16px' }}>
              <Skeleton variant="text" height={20} width="80%" />
              <Skeleton variant="text" height={20} width="90%" />
              <Skeleton variant="text" height={20} width="60%" />
            </Card>
          </Stack>
        </main>
      </>
    )
  const currentBadge = data?.currentBadges.find((badge) => badge.badgeId == router.query.id)
  const avatarStripWidth = Math.max(40, 40 + 24 * Math.max((currentBadge?.metadata.chains.length ?? 0) - 1, 0))

  return (
    <>
      <Head>
        <title>Super Account - Campaigns</title>
      </Head>

      <main>
        {currentBadge && (
          <Stack gap="32px" sx={{ paddingTop: '32px', maxWidth: 672, mx: 'auto' }}>
            {/* Header */}
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Stack direction="row" gap="16px" alignContent="center">
                <button
                  // onClick={() => router.push({ pathname: AppRoutes.campaigns, query: { safe: router.query.safe } })}
                  style={{
                    width: '36px',
                    height: '36px',
                    backgroundColor: '#F1F2F5',
                    borderRadius: '12px',
                    color: 'black',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <ArrowBack sx={{ width: '16px', height: '16px' }} />
                </button>
                <Stack direction="row" alignItems="center" gap="12px">
                  <Typography variant="h3" fontWeight={600}>
                    {currentBadge.metadata.name}
                  </Typography>
                  <Typography
                    sx={{ transform: 'translateY(2px)', display: 'inline-block' }}
                    component="span"
                    variant="body2"
                    color="#A0A0A6"
                  >
                    Badge
                  </Typography>
                </Stack>
              </Stack>
              <Stack direction="row" gap="8px">
                <Button
                  component="a"
                  target="_blank"
                  rel="noreferrer"
                  variant="text"
                  sx={{
                    width: '118px',
                    height: '36px',
                    backgroundColor: '#F1F2F5',
                    borderRadius: '12px',
                    color: 'black',
                    ':hover': { backgroundColor: '#F1F2F5' },
                    padding: '15px 10px 15px 8px',
                  }}
                >
                  <Typography variant="body2" fontWeight={600}>
                    Get Started
                  </Typography>
                  <InfoBlackIcon
                    style={{ width: '16px', heigth: '16px', transform: 'translateY(-1px)', marginLeft: '4px' }}
                  />
                </Button>
                <Button
                  component="a"
                  target="_blank"
                  rel="noreferrer"
                  variant="text"
                  sx={{
                    width: '118px',
                    height: '36px',
                    backgroundColor: 'black',
                    borderRadius: '12px',
                    color: 'white',
                    ':hover': { backgroundColor: 'black' },
                    padding: '15px 10px 15px 8px',
                  }}
                >
                  <Typography variant="body2" fontWeight={600}>
                    Get Started
                  </Typography>
                  <Launch sx={{ width: '16px', height: '16px', marginLeft: '4px' }} />
                </Button>
              </Stack>
            </Stack>
            <Divider />

            <Stack gap="8px">
              <Card sx={{ border: '1px solid #E1E2EA', borderRadius: '12px', padding: '16px' }}>
                <Stack direction="row" gap="16px">
                  {currentBadge.metadata.season >= 7 && currentBadge.metadata.season <= 8 && (
                    <Stack
                      alignItems="center"
                      justifyContent="center"
                      style={{
                        position: 'relative',
                        width: '40px',
                        height: '40px',
                        border: '1px solid #E1E2EA',
                        borderRadius: '12px',
                      }}
                    >
                      <div style={{ transform: 'translateY(2px)' }}>
                        <SeasonChip season={currentBadge?.metadata.season ?? 0} width="20px" height="20px" />
                      </div>
                    </Stack>
                  )}
                  <Typography variant="body2" fontWeight={500} color="#4B4B4E">
                    {currentBadge.metadata.description}
                  </Typography>
                </Stack>
              </Card>
              <Stack direction="row" gap="8px">
                <Card sx={{ flex: 1, border: '1px solid #E1E2EA', borderRadius: '12px', padding: '16px' }}>
                  <Stack direction="row" gap="16px" alignItems="center">
                    <Stack
                      style={{ width: `${avatarStripWidth}px`, position: 'relative', zIndex: 0 }}
                      direction="row"
                      alignItems="center"
                    >
                      {currentBadge.metadata.chains.map((network, index) => (
                        <div
                          key={`${currentBadge.badgeId}-${network}-${index}`}
                          style={{
                            zIndex: (currentBadge.metadata.chains.length + 1 - index) * 10,
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            width: '40px',
                            minWidth: '40px',
                            height: '40px',
                            border: '1px solid #E1E2EA',
                            background: '#FFFFFF',
                            borderRadius: '12px',
                            transform: `translateX(${-index * 16}px)`,
                          }}
                        >
                          <NetworkChip network={network} style="badge" isFavorite={false} width={20} height={20} />
                        </div>
                      ))}
                    </Stack>
                    <Stack>
                      <Typography sx={{ fontWeight: 500, fontSize: '12px', lineHeight: '16px', color: '#75757A' }}>
                        Network
                      </Typography>
                      <Typography
                        sx={{ fontWeight: 500, fontSize: '16px', lineHeight: '24px', textTransform: 'capitalize' }}
                      >
                        {currentBadge.metadata.chains.length === 1
                          ? currentBadge.metadata.chains[0]
                          : `${currentBadge.metadata.chains.length} Chains`}
                      </Typography>
                    </Stack>
                  </Stack>
                </Card>
                <Card sx={{ flex: 1, border: '1px solid #E1E2EA', borderRadius: '12px', padding: '16px' }}>
                  <Stack direction="row" gap="16px" alignItems="center">
                    <Stack style={{ position: 'relative', zIndex: 0 }} direction="row" alignItems="center">
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          width: '40px',
                          minWidth: '40px',
                          height: '40px',
                          border: '1px solid #E1E2EA',
                          background: '#FFFFFF',
                          borderRadius: '12px',
                        }}
                      >
                        <BadgesClaimedIcon style={{ width: '24px', heigth: '24px' }} />
                      </div>
                    </Stack>
                    <Stack>
                      <Typography sx={{ fontWeight: 500, fontSize: '12px', lineHeight: '16px', color: '#75757A' }}>
                        Badges Claimed
                      </Typography>
                      <Typography
                        sx={{ fontWeight: 500, fontSize: '16px', lineHeight: '24px', textTransform: 'capitalize' }}
                      >
                        {formatAmount(0)}
                      </Typography>
                    </Stack>
                  </Stack>
                </Card>
              </Stack>
              <Card sx={{ flex: 1, border: '1px solid #E1E2EA', borderRadius: '12px', padding: '48px' }}>
                <Stack gap="8px">
                  <Card
                    sx={{ flex: 1, border: '1px solid #E1E2EA', borderRadius: '12px', padding: '16px 24px 16px 24px' }}
                  >
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Stack direction="row" alignItems="center" gap="4px">
                        <Typography variant="body2" fontWeight={500} color="#75757A">
                          Your Progress
                        </Typography>
                        <InfoIcon style={{ width: '16px', heigth: '16px', transform: 'translateY(1px)' }} />
                      </Stack>
                      <Stack direction="row" alignItems="center" gap="4px">
                        <Typography variant="body2" fontWeight={700}>
                          {currentBadge.currentCount}
                        </Typography>
                        <Typography variant="body2" fontWeight={500} color="#75757A">
                          XP
                        </Typography>
                      </Stack>
                    </Stack>
                  </Card>
                  <Card
                    sx={{ flex: 1, border: '1px solid #E1E2EA', borderRadius: '12px', padding: '12px 16px 12px 16px' }}
                  >
                    <Stack gap="12px">
                      {currentBadge.badgeTiers.map((tier) => (
                        <Stack gap="12px" key={tier.tier}>
                          <BadgeTierCard tier={tier} currentBadge={currentBadge} />
                          <Divider />
                        </Stack>
                      ))}
                    </Stack>
                  </Card>
                </Stack>
              </Card>
            </Stack>
          </Stack>
        )}
      </main>
    </>
  )
}
