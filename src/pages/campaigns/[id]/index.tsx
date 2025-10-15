'use client'
import Head from 'next/head'
import React, { useState } from 'react'
import { Button, Card, Dialog, Divider, Stack, SvgIcon, Typography } from '@mui/material'
import InfoIcon from '@/public/images/notifications/info.svg'
import CalendarIcon from '@/public/images/calendars/nov_11.svg'
import SuperchainPointIcon from '@/public/images/common/superChain.svg'
import UsdcIcon from '@/public/images/currencies/usdc.svg'
import { ArrowBack, Launch, Close } from '@mui/icons-material'
import CampaignBadge from '@/components/campaigns/badge'
import { useRouter } from 'next/router'
import { AppRoutes } from '@/config/routes'
import { useQuery } from '@tanstack/react-query'
import useSafeAddress from '@/hooks/useSafeAddress'
import axios from 'axios'
import { BACKEND_BASE_URI } from '@/config/constants'
import { Campaign, formatAmount } from '@/components/campaigns'
import NetworkChip from '@/components/badges/networkChip'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export default function Page() {
  const router = useRouter()
  const [openInfo, setOpenInfo] = useState(false)
  const address = useSafeAddress()
  const { data: campaign, isLoading: isLoadingCampaigns } = useQuery<Campaign>({
    queryKey: ['campaigns', address],
    queryFn: async () => {
      const response = await axios.get(`${BACKEND_BASE_URI}/campaigns/${address}`)
      return response.data.filter((campaign: Campaign) => campaign.id === (router.query.id as string))[0]
    },
    refetchInterval: 10000,
    enabled: !!address,
  })
  function formatDates(date: string | Date): string {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    }

    const dateFormatted = new Date(date).toLocaleDateString('en-US', options)
    return dateFormatted
  }
  if (campaign)
    return (
      <>
        <Head>
          <title>Super Account - Campaigns</title>
        </Head>

        <main>
          <Stack gap="32px" sx={{ p: 4, maxWidth: 718, mx: 'auto' }}>
            {/* Header */}
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Stack direction="row" gap="16px" alignContent="center">
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
                <Typography
                  variant="h3"
                  fontWeight={600}
                  sx={{ transform: 'translateY(3px)', display: 'inline-block' }}
                >
                  {campaign.name}{' '}
                  <Typography
                    sx={{ transform: 'translateY(-2px)', display: 'inline-block' }}
                    component="span"
                    variant="body2"
                    color="#A0A0A6"
                  >
                    Campaign
                  </Typography>
                </Typography>
              </Stack>
              <Stack direction="row" spacing={2}>
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
                  <Typography variant="body2" fontWeight={600}>
                    Learn More
                  </Typography>
                  <SvgIcon component={InfoIcon} sx={{ width: '16px', height: '16px', marginLeft: '4px' }} />
                </Button>
                <Button
                  variant="text"
                  href={campaign.campaign_link}
                  target="_blank"
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
              </Stack>
            </Stack>
            <Divider />

            <Stack gap="8px">
              <Card sx={{ border: '1px solid #E1E2EA', borderRadius: '12px', padding: '16px' }}>
                <Typography color="text.secondary">{campaign.description}</Typography>
              </Card>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '8px',
                }}
              >
                {/* Info Cards */}
                <Card sx={{ border: '1px solid #E1E2EA', borderRadius: '12px', padding: '16px' }}>
                  <Stack direction="row" gap="16px" alignItems="center">
                    <div style={{ position: 'relative' }}>
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
                      ></div>
                      <CalendarIcon style={{ width: '40px', height: '40px' }} />
                    </div>
                    <Stack gap="2px">
                      <Typography sx={{ fontWeight: '500', fontSize: '16px', lineHeight: '24px' }}>
                        {formatDates(campaign.start_date)}
                      </Typography>
                      <Typography sx={{ fontWeight: '500', fontSize: '12px', lineHeight: '16px', color: '#75757A' }}>
                        till {formatDates(campaign.end_date)}
                      </Typography>
                    </Stack>
                  </Stack>
                </Card>
                <Card sx={{ border: '1px solid #E1E2EA', borderRadius: '12px', padding: '16px' }}>
                  <Stack direction="row" gap="16px" alignItems="center">
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        width: '40px',
                        height: '40px',
                        border: '1px solid #E1E2EA',
                        borderRadius: '12px',
                      }}
                    >
                      {/* <OpIcon style={{ width: '20px', height: '20px' }} /> */}
                      <NetworkChip
                        key={`${campaign.id + campaign.network}`}
                        network={campaign.network && campaign.network.length > 0 ? campaign.network[0] : ''}
                        style="badge"
                        isFavorite={false}
                      />
                    </div>
                    <Stack>
                      <Typography
                        sx={{
                          fontWeight: '500',
                          fontSize: '12px',
                          lineHeight: '16px',
                          color: '#75757A',
                        }}
                      >
                        Network
                      </Typography>
                      <Typography
                        sx={{ fontWeight: '500', fontSize: '16px', lineHeight: '24px', textTransform: 'capitalize' }}
                      >
                        {campaign.network}
                      </Typography>
                    </Stack>
                  </Stack>
                </Card>
                <Card sx={{ border: '1px solid #E1E2EA', borderRadius: '12px', padding: '16px' }}>
                  <Stack direction="row" gap="16px" alignItems="center">
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        width: '40px',
                        height: '40px',
                        border: '1px solid #E1E2EA',
                        borderRadius: '12px',
                      }}
                    >
                      <UsdcIcon style={{ width: '20px', height: '20px' }} />
                    </div>
                    <Stack>
                      <Typography sx={{ fontWeight: '500', fontSize: '12px', lineHeight: '16px', color: '#75757A' }}>
                        Campaign Rewards
                      </Typography>
                      <Typography sx={{ fontWeight: '500', fontSize: '16px', lineHeight: '24px' }}>
                        {formatAmount(parseInt(campaign.campaign_reward?.amount) ?? 0)}{' '}
                        {campaign.campaign_reward?.symbol ?? '--'}
                      </Typography>
                    </Stack>
                  </Stack>
                </Card>
                <Card sx={{ border: '1px solid #E1E2EA', borderRadius: '12px', padding: '16px' }}>
                  <Stack direction="row" gap="16px" alignItems="center">
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        width: '40px',
                        height: '40px',
                        border: '1px solid #E1E2EA',
                        borderRadius: '12px',
                      }}
                    >
                      <SuperchainPointIcon style={{ width: '20px', height: '20px' }} />
                    </div>
                    <Stack>
                      <Typography sx={{ fontWeight: '500', fontSize: '12px', lineHeight: '16px', color: '#75757A' }}>
                        Total points distributed
                      </Typography>
                      <Typography sx={{ fontWeight: '500', fontSize: '16px', lineHeight: '24px' }}>
                        {campaign.distributed_points ?? 0}
                      </Typography>
                    </Stack>
                  </Stack>
                </Card>
              </div>

              {/* Badges */}
              <Card sx={{ border: '1px solid #E1E2EA', borderRadius: '12px', padding: '48px' }}>
                <Stack gap="16px">
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="body1" fontWeight="500">
                      Campaign Badges
                    </Typography>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        border: '1px solid #E1E2EA',
                        borderRadius: '100px',
                        padding: '6px',
                      }}
                    >
                      <Typography variant="caption" fontWeight="500" sx={{ color: '#75757A' }}>
                        My Points:{' '}
                        <Typography variant="caption" fontWeight="600" sx={{ color: 'black' }}>
                          {campaign.myPoints ?? 0}
                        </Typography>
                      </Typography>
                      <SuperchainPointIcon style={{ width: '16px', height: '16px' }} />
                    </div>
                  </Stack>

                  <Stack spacing={3}>
                    {campaign.campaign_badges &&
                      campaign.campaign_badges.map((badge) => (
                        <CampaignBadge key={badge?.badgeName ?? '0'} badge={badge} my_points={campaign.my_points} />
                      ))}
                  </Stack>
                </Stack>
              </Card>
            </Stack>
          </Stack>

          <Dialog
            open={openInfo}
            onClose={() => setOpenInfo(false)}
            sx={{ margin: 'auto', width: '720px', overflow: 'visible' }}
          >
            <Card
              sx={{
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '24px',
              }}
            >
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

              <div
                // estilos básicos para MD
                style={{ color: '#4B4B4E' }}
              >
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  // Si necesitas soportar HTML dentro del MD, descomenta:
                  // rehypePlugins={[rehypeRaw, rehypeSanitize]}
                  components={{
                    h1: (props) => <Typography variant="h4" fontWeight={700} gutterBottom {...props} />,
                    h2: (props) => <Typography variant="h5" fontWeight={700} gutterBottom {...props} />,
                    h3: (props) => <Typography variant="h6" fontWeight={700} gutterBottom {...props} />,
                    p: (props) => <Typography variant="body1" sx={{ mb: 2 }} {...props} />,
                    li: (props) => <Typography component="li" variant="body1" sx={{ ml: 2 }} {...props} />,
                    a: (props) => <a {...props} target="_blank" rel="noopener noreferrer" />,
                    strong: (props) => <strong {...props} />,
                    code: ({ inline, ...props }) =>
                      inline ? (
                        <code style={{ padding: '0 4px', borderRadius: 6, background: '#F5F5F7' }} {...props} />
                      ) : (
                        <pre style={{ padding: 12, borderRadius: 12, background: '#F5F5F7', overflowX: 'auto' }}>
                          <code {...props} />
                        </pre>
                      ),
                    ul: (props) => <ul style={{ paddingLeft: 20, marginBottom: 16 }} {...props} />,
                    ol: (props) => <ol style={{ paddingLeft: 20, marginBottom: 16 }} {...props} />,
                  }}
                >
                  {campaign.more_info ?? '--'}
                </ReactMarkdown>
              </div>
            </Card>
          </Dialog>
        </main>
      </>
    )
}
