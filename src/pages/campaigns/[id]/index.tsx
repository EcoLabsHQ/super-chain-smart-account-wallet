'use client'
import Head from 'next/head'
import React, { useState } from 'react'
import {
  Button,
  Card,
  Dialog,
  Divider,
  Skeleton,
  Stack,
  SvgIcon,
  Typography,
  Grid,
  IconButton,
  Box,
} from '@mui/material'
import InfoIcon from '@/public/images/notifications/info.svg'
import SuperchainPointIcon from '@/public/images/common/superChain.svg'
import { ArrowBack, Launch, Close } from '@mui/icons-material'
import CampaignBadge from '@/components/campaigns/badge'
import { useRouter } from 'next/router'
import { AppRoutes } from '@/config/routes'
import { useQuery } from '@tanstack/react-query'
import useSafeAddress from '@/hooks/useSafeAddress'
import axios from 'axios'
import { BACKEND_BASE_URI } from '@/config/constants'
import { Campaign } from '@/components/campaigns'
import NetworkChip from '@/components/badges/networkChip'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { tokens } from '@/config/tokens'
import useSafeInfo from '@/hooks/useSafeInfo'
import { ClaimBadgesProvider } from '@/components/badges/claimBadges'
import { Address } from 'viem'
import { InlineClaimButton } from '@/pages/badges/[id]'

export default function Page() {
  const router = useRouter()
  const [openInfo, setOpenInfo] = useState(false)
  const [token, setToken] = useState<string | null>(null)
  const address = useSafeAddress()
  const campaignId = router.query.id as string | undefined

  const { data: campaign, isLoading } = useQuery<Campaign | undefined>({
    queryKey: ['campaign', address, campaignId],
    enabled: !!address && !!campaignId,
    refetchInterval: 10000,
    queryFn: async () => {
      const { data } = await axios.get(`${BACKEND_BASE_URI}/campaigns/${address}`)
      console.debug('Fetched campaigns data:', data)
      return (data as Campaign[]).find((c) => c.id === campaignId)
    },
  })
  const { safeAddress, safeLoaded, badges } = useSafeInfo()

  function getCalendarValues(date: string | Date): { day: number; month: string } {
    const d = new Date(date)

    // Extrae el día del mes (número)
    const day = d.getDate()

    // Extrae las 3 letras del mes en mayúscula
    const month = d.toLocaleString('en-US', { month: 'short' }).toUpperCase()

    return { day, month }
  }

  function formatDates(date: string | Date): string {
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', month: 'long', day: 'numeric' }
    return new Date(date).toLocaleDateString('en-US', options)
  }

  if (isLoading || !campaign) {
    return (
      <>
        <Head>
          <title>Super Account - Campaigns</title>
        </Head>
        <main>
          <Stack gap="32px" sx={{ p: { xs: 0, sm: 3, md: 4 }, maxWidth: { xs: '100%', sm: 720 }, mx: 'auto' }}>
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

            {/* Info cards grid */}
            <Grid container spacing={1}>
              {Array.from({ length: 4 }).map((_, i) => (
                <Grid item xs={12} sm={6} key={i}>
                  <Card sx={{ border: '1px solid #E1E2EA', borderRadius: '12px', p: 2 }}>
                    <Stack direction="row" gap={2} alignItems="center">
                      <Skeleton variant="rounded" width={40} height={40} />
                      <Stack>
                        <Skeleton variant="text" width={100} />
                        <Skeleton variant="text" width={60} />
                      </Stack>
                    </Stack>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {/* Badges section */}
            <Card sx={{ border: '1px solid #E1E2EA', borderRadius: '12px', padding: '48px' }}>
              <Stack gap="16px">
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Skeleton variant="text" width={160} height={28} />
                  <Skeleton variant="rounded" width={90} height={26} />
                </Stack>

                {/* Simulated list of badges */}
                <Stack spacing={3}>
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} variant="rounded" width="100%" height={72} sx={{ borderRadius: '12px' }} />
                  ))}
                </Stack>
              </Stack>
            </Card>
          </Stack>
        </main>
      </>
    )
  }

  const networks: string[] = Array.isArray(campaign.network) ? campaign.network : []
  const avatarStripWidth = Math.max(40, 40 + 28 * Math.max(networks.length - 1, 0))
  const rewardSymbol = campaign.campaign_reward?.symbol ?? 'USDC'
  const rewardIcon = (tokens as any)?.[rewardSymbol]?.icon ?? (tokens as any)?.USDC?.icon
  const rewardAmount = formatBeautifulAmount(campaign.campaign_reward?.amount ?? 0)
  const { day, month } = getCalendarValues(campaign.start_date)
  const now = new Date()
  const isLive = now >= new Date(campaign.start_date) && now <= new Date(campaign.end_date)
  const claimableBadges = badges?.some((badge) =>
    campaign.campaign_badges?.some((cb) => cb.id === badge.badgeId && (badge.claimable || badge.claimableByPerk)),
  )

  return (
    <>
      <Head>
        <title>Super Account - Campaigns</title>
      </Head>

      <main>
        <ClaimBadgesProvider
          safeAddress={safeAddress as Address}
          safeLoaded={!!safeLoaded}
          token={token}
          data={{ currentBadges: badges ?? [] }}
        >
          <Stack gap="32px" sx={{ p: { xs: 2, sm: 4 }, maxWidth: 718, mx: 'auto' }}>
            {/* Header */}
            <Stack direction="row" justifyContent="space-between" alignItems="center" gap="4px">
              <Stack direction="row" gap="16px" alignItems="center">
                <button
                  onClick={() => router.push({ pathname: AppRoutes.campaigns, query: { safe: router.query.safe } })}
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
                <Stack
                  sx={{
                    flexDirection: { xs: 'column', md: 'row' },
                    alignItems: { xs: 'flex-start', md: 'center' },
                    gap: { xs: 0, sm: '8px' },
                  }}
                >
                  <Typography
                    variant="h3"
                    fontWeight={600}
                    sx={{
                      display: 'inline-block',
                      fontSize: { xs: '20px', sm: '24px' }, // opcional: subí xs para consistencia visual
                      lineHeight: { xs: 1.1, sm: 1.1 }, // caja del título sin altura extra
                      m: 0,
                    }}
                  >
                    {campaign.name}
                  </Typography>

                  <Typography
                    component="span"
                    variant="body2"
                    color="#A0A0A6"
                    sx={{
                      display: 'inline-flex', // same trick as badge
                      alignItems: 'center',
                      whiteSpace: 'nowrap',
                      fontSize: { xs: '12px', sm: '14px' },
                      lineHeight: { xs: 1, sm: 1 },
                      m: 0,
                    }}
                  >
                    Campaign
                  </Typography>
                </Stack>
              </Stack>
              <Stack direction="row" spacing={2}>
                <Button
                  onClick={() => setOpenInfo(true)}
                  variant="text"
                  sx={{
                    height: '36px',
                    backgroundColor: '#F1F2F5',
                    borderRadius: '12px',
                    color: 'black',
                    ':hover': { backgroundColor: '#F1F2F5' },
                    padding: { xs: '4px 10px 4px 8px', sm: '15px 10px 15px 12px' },
                  }}
                >
                  <Typography variant="body2" fontWeight={600} fontSize={{ xs: '12px', sm: '14px' }}>
                    Details
                  </Typography>
                  <SvgIcon
                    component={InfoIcon}
                    sx={{ width: { xs: '12px', sm: '16px' }, height: { xs: '12px', sm: '16px' }, marginLeft: '4px' }}
                  />
                </Button>
                {campaign.campaign_link && (
                  <Button
                    component="a"
                    href={campaign.campaign_link}
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
                      Participate
                    </Typography>
                    <Launch sx={{ width: '16px', height: '16px', marginLeft: '4px' }} />
                  </Button>
                )}
              </Stack>
            </Stack>
            <Divider />

            <Stack gap="8px">
              <Card sx={{ border: '1px solid #E1E2EA', borderRadius: '12px', p: 2 }}>
                <Typography color="text.secondary">{campaign.description}</Typography>
              </Card>
              <Grid container spacing={1}>
                {/* Dates */}
                <Grid item xs={12} sm={6}>
                  <Card sx={{ border: '1px solid #E1E2EA', borderRadius: '12px', p: 2 }}>
                    <Stack direction="row" gap={2} alignItems="center">
                      <div style={{ position: 'relative' }}>
                        {isLive && (
                          <div
                            style={{
                              position: 'absolute',
                              left: '-4px',
                              top: '-4px',
                              width: '13px',
                              height: '13px',
                              backgroundColor: '#39D551',
                              borderRadius: '100%',
                              border: '2px solid white',
                            }}
                          />
                        )}

                        <div>
                          <Stack
                            alignItems="center"
                            justifyContent="center"
                            style={{
                              width: '40px',
                              height: '16px',
                              borderTopLeftRadius: '12px',
                              borderTopRightRadius: '12px',
                              background: '#E1E2EA',
                            }}
                          >
                            <Typography fontSize="8px" fontWeight={600} style={{ transform: 'translateY(1px)' }}>
                              {month}
                            </Typography>
                          </Stack>
                          <Stack
                            alignItems="center"
                            justifyContent="center"
                            style={{
                              width: '40px',
                              height: '24px',
                              borderRadius: '0px 0px 12px 12px',
                              border: '1px solid #E1E2EA',
                              background: 'white',
                            }}
                          >
                            <Typography variant="h5" fontWeight={600}>
                              {day}
                            </Typography>
                          </Stack>
                        </div>
                      </div>
                      <Stack gap="2px">
                        <Typography sx={{ fontWeight: 500, fontSize: '16px', lineHeight: '24px' }}>
                          {formatDates(campaign.start_date)}
                        </Typography>
                        <Typography sx={{ fontWeight: 500, fontSize: '12px', lineHeight: '16px', color: '#75757A' }}>
                          till {formatDates(campaign.end_date)}
                        </Typography>
                      </Stack>
                    </Stack>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Card sx={{ border: '1px solid #E1E2EA', borderRadius: '12px', p: 2 }}>
                    <Stack direction="row" gap={2} alignItems="center">
                      <Stack
                        style={{ width: `${avatarStripWidth}px`, position: 'relative', zIndex: 0 }}
                        direction="row"
                        alignItems="center"
                      >
                        {networks.map((network, index) => (
                          <div
                            key={`${campaign.id}-${network}-${index}`}
                            style={{
                              zIndex: (networks.length + 1 - index) * 10,
                              display: 'flex',
                              justifyContent: 'center',
                              alignItems: 'center',
                              width: '40px',
                              minWidth: '40px',
                              height: '40px',
                              border: '1px solid #E1E2EA',
                              background: '#FFFFFF',
                              borderRadius: '12px',
                              transform: `translateX(${-index * 12}px)`,
                            }}
                          >
                            <NetworkChip network={network} style="badge" isFavorite={false} />
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
                          {networks.length === 1 ? networks[0] : `${networks.length} Chains`}
                        </Typography>
                      </Stack>
                    </Stack>
                  </Card>
                </Grid>

                {/* Rewards (con fallback de tokens) */}
                <Grid item xs={12} sm={6}>
                  <Card sx={{ border: '1px solid #E1E2EA', background: 'white', borderRadius: '12px', p: 2 }}>
                    <Stack direction="row" gap={2} alignItems="center">
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          width: '40px',
                          height: '40px',
                          background: '#FFFFFF',
                          border: '1px solid #E1E2EA',
                          borderRadius: '12px',
                        }}
                      >
                        {rewardIcon && (
                          <SvgIcon
                            component={rewardIcon}
                            sx={{ width: 24, height: 24, marginTop: '2px', marginLeft: '3px' }}
                          />
                        )}
                      </div>
                      <Stack>
                        <Typography sx={{ fontWeight: 500, fontSize: '12px', lineHeight: '16px', color: '#75757A' }}>
                          Campaign Rewards
                        </Typography>
                        <Typography sx={{ fontWeight: 500, fontSize: '16px', lineHeight: '24px' }}>
                          {rewardAmount} {rewardSymbol}
                        </Typography>
                      </Stack>
                    </Stack>
                  </Card>
                </Grid>

                {/* Points */}
                <Grid item xs={12} sm={6}>
                  <Card sx={{ border: '1px solid #E1E2EA', borderRadius: '12px', p: 2 }}>
                    <Stack direction="row" gap={2} alignItems="center">
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          width: '40px',
                          height: '40px',
                          border: '1px solid #E1E2EA',
                          background: '#FFFFFF',
                          borderRadius: '12px',
                        }}
                      >
                        <SuperchainPointIcon style={{ width: '24px', height: '24px' }} />
                      </div>
                      <Stack>
                        <Typography sx={{ fontWeight: 500, fontSize: '12px', lineHeight: '16px', color: '#75757A' }}>
                          Total points distributed
                        </Typography>
                        <Typography sx={{ fontWeight: 500, fontSize: '16px', lineHeight: '24px' }}>
                          {formatBeautifulAmount(campaign.distributed_points ?? 0)}
                        </Typography>
                      </Stack>
                    </Stack>
                  </Card>
                </Grid>
              </Grid>

              {/* Badges */}
              <Card sx={{ border: '1px solid #E1E2EA', borderRadius: '12px', p: { xs: 3, md: 6 } }}>
                <Stack gap="16px">
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="body1" fontWeight="500" sx={{ fontSize: { xs: '14px', sm: '16px' } }}>
                      Campaign Badges
                    </Typography>
                    <Stack
                      direction="row"
                      alignItems="center"
                      spacing={0.25}
                      sx={{
                        border: '1px solid #E1E2EA',
                        borderRadius: '100px',
                        px: { xs: 0.5, sm: 1, md: 1.25 },
                        py: { xs: 0.25, sm: 0.4 },
                        display: 'inline-flex',
                        minWidth: 0,
                      }}
                    >
                      <Typography
                        component="span"
                        variant="caption"
                        fontWeight={500}
                        sx={{
                          color: '#75757A',
                          fontSize: { xs: '9px', sm: '10px', md: '11px' },
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: 'inline-block',
                          maxWidth: { xs: '64px', sm: '84px' },
                        }}
                      >
                        My Points:&nbsp;
                        <Typography
                          component="span"
                          variant="caption"
                          fontWeight={600}
                          sx={{ color: 'black', fontSize: { xs: '9px', sm: '10px', md: '11px' } }}
                        >
                          {campaign.myPoints ?? 0}
                        </Typography>
                      </Typography>
                      <Box
                        component="span"
                        sx={{
                          display: 'inline-flex',
                          ml: 0.5,
                          width: { xs: 12, sm: 14, md: 16 },
                          height: { xs: 12, sm: 14, md: 16 },
                        }}
                      >
                        <SuperchainPointIcon style={{ width: '100%', height: '100%' }} />
                      </Box>
                    </Stack>
                  </Stack>

                  <Stack gap="12px">
                    {(campaign.campaign_badges ?? []).map((badge, idx) => (
                      <CampaignBadge
                        key={badge?.badgeName ?? `badge-${idx}`}
                        badge={badge}
                        myPoints={campaign.my_points}
                      />
                    ))}
                  </Stack>
                </Stack>

                {claimableBadges && (
                  <Stack mt={2} alignItems="end" justifyContent="center">
                    <InlineClaimButton>
                      Claim Badges <span style={{ fontSize: '20px' }}>›</span>
                    </InlineClaimButton>
                  </Stack>
                )}
              </Card>
            </Stack>
          </Stack>

          <Dialog
            open={openInfo}
            onClose={() => setOpenInfo(false)}
            fullWidth
            maxWidth="md"
            PaperProps={{ sx: { p: { xs: 2, md: 3 }, borderRadius: 2 } }}
          >
            <Card sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Header */}
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography
                  variant="h3"
                  fontWeight={600}
                  sx={{ transform: 'translateY(0px)', display: 'inline-block' }}
                >
                  {campaign.name}{' '}
                  <Typography
                    sx={{ transform: 'translateY(-2px)', display: 'inline-block' }}
                    component="span"
                    variant="body2"
                    color="#A0A0A6"
                  >
                    Campaign Details
                  </Typography>
                </Typography>
                <IconButton onClick={() => setOpenInfo(false)} sx={{ bgcolor: '#F1F2F5', width: 36, height: 36 }}>
                  <Close sx={{ width: 16, height: 16 }} />
                </IconButton>
              </Stack>
              <Divider sx={{ width: '100%' }} />
              <div style={{ color: '#4B4B4E' }}>
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h1: ({ children }) => (
                      <Typography component="h1" variant="h4" fontWeight={700} gutterBottom>
                        {children}
                      </Typography>
                    ),
                    h2: ({ children }) => (
                      <Typography component="h2" variant="h5" fontWeight={700} gutterBottom>
                        {children}
                      </Typography>
                    ),
                    h3: ({ children }) => (
                      <Typography component="h3" variant="h6" fontWeight={700} gutterBottom>
                        {children}
                      </Typography>
                    ),
                    p: ({ children }) => (
                      <Typography component="p" variant="body1" sx={{ mb: 2 }}>
                        {children}
                      </Typography>
                    ),
                    li: ({ children }) => (
                      <Typography component="li" variant="body1" sx={{ ml: 2 }}>
                        {children}
                      </Typography>
                    ),
                    code: (props: any) => {
                      const { inline, className, children, ...rest } = props
                      return inline ? (
                        <code style={{ padding: '0 4px', borderRadius: 6, background: '#F5F5F7' }} {...rest}>
                          {children}
                        </code>
                      ) : (
                        <pre
                          style={{ padding: 12, borderRadius: 12, background: '#F5F5F7', overflowX: 'auto' }}
                          {...rest}
                        >
                          <code className={className}>{children}</code>
                        </pre>
                      )
                    },
                    ul: ({ children }) => <ul style={{ paddingLeft: 20, marginBottom: 16 }}>{children}</ul>,
                    ol: ({ children }) => <ol style={{ paddingLeft: 20, marginBottom: 16 }}>{children}</ol>,
                  }}
                >
                  {campaign.more_info ?? '--'}
                </ReactMarkdown>
              </div>
            </Card>
          </Dialog>
        </ClaimBadgesProvider>
      </main>
    </>
  )
}

import type { GetServerSideProps } from 'next'
import { formatBeautifulAmount } from '@/utils/formatNumber'

export const getServerSideProps: GetServerSideProps = async ({ params, query }) => {
  // puedes pasar props si quieres; lo importante es forzar SSR
  return { props: {} }
}
