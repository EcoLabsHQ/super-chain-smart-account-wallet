'use client'
import Head from 'next/head'
import React from 'react'
import { Button, Card, Divider, Stack, SvgIcon, Typography } from '@mui/material'
import InfoIcon from '@/public/images/notifications/info.svg'
import OpIcon from '@/public/images/common/op_mainnet.svg'
import SuperchainPointIcon from '@/public/images/common/superChain.svg'
import UsdcIcon from '@/public/images/currencies/usdc.svg'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
import { ArrowBack, Launch } from '@mui/icons-material'
import CampaignBadge from '@/components/campaigns/badge'
import { useRouter } from 'next/router'
import { AppRoutes } from '@/config/routes'

export default function Page() {
  const router = useRouter()
  return (
    <>
      <Head>
        <title>Super Account - Campaigns</title>
      </Head>

      <main>
        <Stack gap="32px" sx={{ p: 4, maxWidth: 1000, mx: 'auto' }}>
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
              <Typography variant="h3" fontWeight={600} sx={{ transform: 'translateY(3px)', display: 'inline-block' }}>
                SuperStacks{' '}
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
              <Typography color="text.secondary">
                SuperStacks is an experimental pilot campaign designed to show how the Superchain can create a more
                connected onchain experience.
              </Typography>
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
                  <CalendarTodayIcon color="success" />
                  <Stack gap="2px">
                    <Typography sx={{ fontWeight: '500', fontSize: '16px', lineHeight: '24px' }}>
                      Saturday, November 11
                    </Typography>
                    <Typography sx={{ fontWeight: '500', fontSize: '12px', lineHeight: '16px', color: '#75757A' }}>
                      till Monday, November 13
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
                    <OpIcon style={{ width: '20px', height: '20px' }} />
                  </div>
                  <Stack>
                    <Typography sx={{ fontWeight: '500', fontSize: '12px', lineHeight: '16px', color: '#75757A' }}>
                      Network
                    </Typography>
                    <Typography sx={{ fontWeight: '500', fontSize: '16px', lineHeight: '24px' }}>OP Mainnet</Typography>
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
                    <Typography sx={{ fontWeight: '500', fontSize: '16px', lineHeight: '24px' }}>50K USDC</Typography>
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
                    <Typography sx={{ fontWeight: '500', fontSize: '16px', lineHeight: '24px' }}>4.5K</Typography>
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
                        240
                      </Typography>
                    </Typography>
                    <SuperchainPointIcon style={{ width: '16px', height: '16px' }} />
                  </div>
                </Stack>

                <Stack spacing={3}>
                  <CampaignBadge />
                  <CampaignBadge />
                  <CampaignBadge />
                  <CampaignBadge />
                  <CampaignBadge />
                </Stack>
              </Stack>
            </Card>
          </Stack>
        </Stack>
      </main>
    </>
  )
}
