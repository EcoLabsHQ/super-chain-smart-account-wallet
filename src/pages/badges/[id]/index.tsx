import NetworkChip from '@/components/badges/networkChip'
import DotIcon from '@/public/images/common/dot_soft_gray.svg'
import badgesService from '@/features/superChain/services/badges.service'
import useSafeInfo from '@/hooks/useSafeInfo'
import { ArrowBack, Close, Launch } from '@mui/icons-material'
import { Box, Button, Card, Dialog, Divider, IconButton, Skeleton, Stack, SvgIcon, Tooltip, Typography } from '@mui/material'
import GiftIcon from '@/public/images/common/gift.svg'
import InfoIcon from '@/public/images/common/info-soft-gray.svg'
import InfoBlackIcon from '@/public/images/common/info-black.svg'
import BadgesClaimedIcon from '@/public/images/common/badges-claimed.svg'
import { useQuery } from '@tanstack/react-query'
import Head from 'next/head'
import { useRouter } from 'next/router'
import React, { useState } from 'react'
import { formatAmount } from '@/components/campaigns'
import BadgeTierCard from '@/components/badges/tier'
import SeasonChip from '@/components/badges/seasonChip'
import { AppRoutes } from '@/config/routes'
import { BadgeWithPrize } from '@/types/badges'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { tokens } from '@/config/tokens'
import { BadgeRenderStrategy } from '@/components/badges/badgeInfo/BadgeStrategyRenderer'
import { WorldIDVerificationStrategy } from '@/components/badges/badgeInfo/strategies/WorldVerificationStrategy'
import { FarcasterLinkStrategy } from '@/components/badges/badgeInfo/strategies/FarcasterLinkStrategy'
import ETHVaultStrategy from '@/components/badges/badgeInfo/strategies/ETHVaultStrategy'
import { SelfVerificationStrategy } from '@/components/badges/badgeInfo/strategies/SelfVerificationStrategy'

export const getBadgeStrategy = (
  badgeOrClaim: any,
  strategies: BadgeRenderStrategy[],
): BadgeRenderStrategy | undefined => {
  return strategies.find((s) => {
    try {
      return s.canRender(badgeOrClaim)
    } catch (err) {
      // si la estrategia falla al evaluar, no la consideramos
      return false
    }
  })
}

const strategies = [
  new WorldIDVerificationStrategy(),
  new FarcasterLinkStrategy(),
  new ETHVaultStrategy(),
  new SelfVerificationStrategy(),
]

export default function BadgePage() {
  const router = useRouter()
  const [openInfo, setOpenInfo] = useState<boolean>(false)
  const { safeAddress, safeLoaded } = useSafeInfo()
  const { data, isLoading, error } = useQuery<{
    currentBadges: BadgeWithPrize[]
  }>({
    queryKey: ['badges', safeAddress, safeLoaded],
    queryFn: async () => await badgesService.getBadgesWithPrizes((safeAddress as `0x${string}`) ?? []),
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
  const rewardIcon = (tokens as any)?.[currentBadge?.tokenBadge?.symbol ?? '']?.icon ?? (tokens as any)?.USDC?.icon
  const strategy = getBadgeStrategy(currentBadge, strategies)
  console.log('Current Badge:', currentBadge)
  console.log('Strategy:', strategy)

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
                  onClick={() =>
                    router.push({ pathname: AppRoutes.badges.allTime, query: { safe: router.query.safe } })
                  }
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
                <Stack sx={{ flexDirection: { xs: 'column', md: 'row' }, gap: { xs: '0px', sm: '8px' }, alignItems: { xs: 'start', md: 'center' } }}>
                  <Typography variant="h3" fontWeight={600}
                    sx={{
                      display: 'inline-block',
                      fontSize: { xs: '12px', sm: '24px' },
                      lineHeight: { xs: '20px', sm: '32px' },
                    }}
                  >
                    {currentBadge.metadata.name}
                  </Typography>
                  <Typography
                    sx={{
                      transform: 'translateY(-2px)',
                      display: 'inline-block',
                      fontSize: { xs: '12px', sm: '14px' },
                      lineHeight: { xs: '20px', sm: '32px' },
                    }}
                    component="span"
                    variant="body2"
                    color="#A0A0A6"
                  >
                    Badge
                  </Typography>
                </Stack>
              </Stack>
              <Stack direction="row" gap="8px">
                {currentBadge.moreInfo && (
                  <Button
                    onClick={() => setOpenInfo(true)}
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
                    <Typography variant="body2" fontWeight={600} sx={{
                      fontSize: { xs: '12px', sm: '14px' },
                    }}>
                      Learn More
                    </Typography>
                    <Box sx={{ width: { xs: '12px', sm: '16px' }, height: { xs: '12px', sm: '16px' } }}>
                      <InfoBlackIcon
                        style={{ width: '100%', heigth: '100%', transform: 'translateY(-1px)', marginLeft: '4px' }}
                      />
                    </Box>
                  </Button>
                )}
                {strategy?.render
                  ? strategy.render(currentBadge as any)
                  : currentBadge.action_description && (
                    <Button
                      component="a"
                      href={currentBadge.action_link}
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
                        {currentBadge.action_description}
                      </Typography>
                      <Launch sx={{ width: '16px', height: '16px', marginLeft: '4px' }} />
                    </Button>
                  )}
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
              <Stack direction="row" gap="8px" sx={{ flexDirection: { xs: 'column', sm: 'row' } }}>
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
                <Tooltip
                  sx={{ flex: 1 }}
                  title={`Total number of ${currentBadge.metadata.name} badges claimed across all Super Accounts.`}
                >
                  <Button sx={{ flex: 1, padding: '0px' }}>
                    <Card sx={{ flex: 1, border: '1px solid #E1E2EA', borderRadius: '12px', padding: '16px' }}>
                      <Stack direction="row" gap="16px" alignItems="center">
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
                        <Stack>
                          <Typography sx={{ fontWeight: 500, fontSize: '12px', lineHeight: '16px', color: '#75757A' }}>
                            Badges Claimed
                          </Typography>
                          <Typography
                            sx={{ fontWeight: 500, fontSize: '16px', lineHeight: '24px', textTransform: 'capitalize', textAlign: 'start' }}
                          >
                            {formatAmount(currentBadge.totalClaimed ?? 0)}
                          </Typography>
                        </Stack>
                      </Stack>
                    </Card>
                  </Button>
                </Tooltip>
              </Stack>
              <Card sx={{ flex: 1, border: '1px solid #E1E2EA', borderRadius: '12px', padding: { xs: '16px', sm: '48px' } }}>
                <Stack gap="8px">
                  {currentBadge.countUnit && (
                    <Card
                      sx={{
                        flex: 1,
                        border: '1px solid #E1E2EA',
                        borderRadius: '12px',
                        padding: '16px 24px 16px 24px',
                      }}
                    >
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Stack direction="row" alignItems="center" sx={{ gap: { xs: '2px', sm: '4px' } }}>
                          <Typography variant="body2" fontWeight={500} color="#75757A" sx={{ fontSize: { xs: '12px', sm: '14px' } }}>
                            Your Progress
                          </Typography>
                          <Tooltip title="Progress data is refreshed every 2 hours to reflect your latest activity.">
                            <IconButton sx={{ padding: '0px' }}>
                              <InfoIcon style={{ width: '16px', heigth: '16px' }} />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                        <Stack direction="row" alignItems="center" gap="4px">
                          <Typography variant="body2" fontWeight={700}>
                            {currentBadge.currentCount}
                          </Typography>
                          <Typography variant="body2" fontWeight={500} color="#75757A">
                            {currentBadge.countUnit && currentBadge.countUnit != '' ? currentBadge.countUnit : '--'}
                          </Typography>
                        </Stack>
                      </Stack>
                    </Card>
                  )}
                  {currentBadge.badgeTiers.length > 1 && (
                    <Card
                      sx={{
                        flex: 1,
                        border: '1px solid #E1E2EA',
                        borderRadius: '12px',
                        padding: { xs: '12px 8px 12px 8px', sm: '12px 16px 12px 16px' },
                      }}
                    >
                      <Stack gap="12px">
                        {currentBadge.badgeTiers.slice(0, -1).map((tier, index) => (
                          <Stack key={index} gap="12px">
                            <BadgeTierCard tier={tier} currentBadge={currentBadge} />
                            {index < currentBadge.badgeTiers.length - 1 && <Divider />}
                          </Stack>
                        ))}
                      </Stack>
                    </Card>
                  )}
                  <Card
                    sx={{ flex: 1, border: '1px solid #E1E2EA', borderRadius: '12px', padding: { xs: '12px 8px 12px 8px', sm: '12px 16px 12px 16px' } }}
                  >
                    <Stack gap="12px">
                      <BadgeTierCard
                        tier={currentBadge.badgeTiers[currentBadge.badgeTiers.length - 1]}
                        currentBadge={currentBadge}
                      />
                      {currentBadge.tokenBadge?.amount && (
                        <Stack
                          direction="row"
                          alignItems="center"
                          justifyContent="space-between"
                          sx={{
                            width: '100%',
                            background: 'linear-gradient(180deg, #E7F8F8 0%, #F6FEFD 100%)',
                            borderRadius: '12px',
                            border: '1px solid #1FC1BF',
                            p: { xs: '8px 12px', sm: '8px 12px' },
                            minHeight: { xs: 64, sm: 64 },
                          }}
                        >
                          <Stack direction="row" alignItems="center" gap={2} sx={{ width: '100%' }}>
                            <Box
                              sx={{
                                width: 40,
                                height: 40,
                                position: 'relative',
                                border: '1px solid #1FC1BF',
                                background: 'white',
                                borderRadius: 2,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flex: '0 0 40px',
                              }}
                            >
                              <GiftIcon style={{ width: '24px', height: '24px' }} />
                            </Box>
                            <Stack sx={{ flex: 1, minWidth: 0 }}>
                              <Stack justifyContent="space-between" alignItems="center" direction="row">
                                <Typography variant="h5" fontWeight={500} sx={{ fontSize: { xs: '14px', sm: '16px' } }}>
                                  Exclusive Bonus
                                </Typography>
                                <Stack direction="row" alignItems="center" justifyContent="center" sx={{ gap: { xs: '2px', sm: 4 } }}>
                                  <Typography variant="h5" fontWeight={600} sx={{ fontSize: { xs: '10px', sm: '16px' } }}>
                                    {currentBadge.tokenBadge?.amount}
                                  </Typography>
                                  {rewardIcon && (
                                    <SvgIcon component={rewardIcon} sx={{ width: { xs: 16, sm: 24 }, height: { xs: 16, sm: 24 }, mt: '2px', ml: '4px' }} />
                                  )}
                                </Stack>
                              </Stack>
                              <Stack sx={{ flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'start', sm: 'center' }, mt: 0.5 }}>
                                <Typography variant="caption" fontWeight={500} color="#75757A" sx={{ fontSize: { xs: '10px', sm: '12px' }, lineHeight: { xs: '14px', sm: '16px' } }}>
                                  Limited to first 100 users who reach Tier MAX
                                </Typography>
                                <Box sx={{ display: { xs: 'none', sm: 'block' }, width: 16, height: 16 }}>
                                  <DotIcon style={{ width: '100%', height: '100%' }} />
                                </Box>
                                <Typography variant="caption" fontWeight={500} color="#75757A" sx={{ fontSize: { xs: '10px', sm: '12px' }, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {currentBadge.totalClaimed}/{currentBadge.tokenBadge.maxClaims ?? 0}
                                </Typography>
                              </Stack>
                            </Stack>
                          </Stack>
                        </Stack>
                      )}
                    </Stack>
                  </Card>
                </Stack>
              </Card>
            </Stack>
          </Stack>
        )}
        <Dialog
          open={openInfo}
          onClose={() => setOpenInfo(false)}
          sx={{ margin: 'auto', width: '720px', overflow: 'visible' }}
        >
          <Card sx={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Header */}
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="h3" fontWeight={600} sx={{ transform: 'translateY(0px)', display: 'inline-block' }}>
                {currentBadge?.metadata.name}{' '}
                <Typography
                  sx={{ transform: 'translateY(-2px)', display: 'inline-block' }}
                  component="span"
                  variant="body2"
                  color="#A0A0A6"
                >
                  Badge Details
                </Typography>
              </Typography>
              <button
                onClick={() => setOpenInfo(false)}
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
                <Close sx={{ width: '16px', height: '16px' }} />
              </button>
            </Stack>
            <Divider style={{ width: '720px', margin: '0 auto', transform: 'translateX(-24px)' }} />
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
                {currentBadge?.moreInfo ?? '--'}
              </ReactMarkdown>
            </div>
          </Card>
        </Dialog>
      </main>
    </>
  )
}
