'use client'
import Head from 'next/head'
import React from 'react'
import {
  Button,
  Card,
  Dialog,
  Divider,
  Skeleton,
  Stack,
  Typography,
  Grid,
  Box,
  CircularProgress,
  Tooltip,
} from '@mui/material'
import InfoIcon from '@/public/images/common/info-light.svg'
import CheckCircleIcon from '@/public/images/common/check-circle-outlined.svg'
import SuperchainPointIcon from '@/public/images/common/superChain.svg'
import { ArrowBack, Launch } from '@mui/icons-material'
import { useRouter } from 'next/router'
import { AppRoutes } from '@/config/routes'
import useSafeAddress from '@/hooks/useSafeAddress'
import { BACKEND_BASE_URI } from '@/config/constants'
import { Campaign } from '@/components/campaigns'
import { useMutation, useQuery } from '@tanstack/react-query'
import NetworkChip from '@/components/badges/networkChip'
import Image from 'next/image'
import axios from 'axios'
import { Address, createWalletClient, custom, formatUnits, getContract } from 'viem'
import { optimism } from 'viem/chains'
import useWallet from '@/hooks/wallets/useWallet'
import { EthereumProvider } from 'permissionless/utils/toOwner'
import { publicClient } from '@/services/pimlico'
import { AIRDROP_ABI, AIRDROP_ADDRESS } from '@/constants/contracts'
import { checkAirdropEligibility } from '@/services/airdrop'
import { formatBeautifulAmount } from '@/utils/formatNumber'

const getTokenIcon = (symbol: string) => {
  const usdc = '/images/currencies/usdc.svg'
  const usdt = '/images/currencies/usdt.svg'
  const weth = '/images/currencies/weth.svg'
  const op = '/images/currencies/optimism.svg'
  switch (symbol) {
    case 'USDC':
      return usdc
    case 'USDT':
      return usdt
    case 'WETH':
      return weth
    case 'OP':
      return op
    default:
      return usdc
  }
}
function getCalendarValues(date: string | Date): { day: number; month: string } {
  const d = new Date(date)
  const day = d.getDate()
  const month = d.toLocaleString('en-US', { month: 'short' }).toUpperCase()
  return { day, month }
}

export default function Page() {
  const router = useRouter()
  const safeAddress = useSafeAddress()
  const [openClaimDialog, setOpenClaimDialog] = React.useState(false)
  const [claimTransactionLink, setClaimTransactionLink] = React.useState('')
  const wallet = useWallet()
  const address = useSafeAddress()
  const campaignId = router.query.id as string | undefined

  const { data: campaign, isLoading } = useQuery<Campaign | undefined>({
    queryKey: ['campaign', address, campaignId],
    enabled: !!address && !!campaignId,
    refetchInterval: 10000,
    queryFn: async () => {
      const { data } = await axios.get(`${BACKEND_BASE_URI}/campaigns/${address}`)
      return (data as Campaign[]).find((c) => c.id === campaignId)
    },
  })

  const {
    data: airdropData,
    isLoading: isCheckLoading,
    refetch: refetchAirdrop,
  } = useQuery({
    queryKey: ['check-airdrop', safeAddress, campaignId],
    queryFn: () => checkAirdropEligibility(safeAddress, campaignId!),
    enabled: !!safeAddress && !!campaignId,
  })

  const erc20Token = campaign?.claimable_reward?.token as Address

  const isAirdropReady =
    !!airdropData &&
    !isCheckLoading &&
    airdropData.value > 0 &&
    Array.isArray(airdropData.proofs) &&
    airdropData.proofs.length > 0

  const { mutate, isPending, isError } = useMutation({
    mutationFn: async () => {
      const walletClient = createWalletClient({
        chain: optimism,
        transport: custom(wallet?.provider as EthereumProvider),
        account: wallet?.address as Address,
      })
      const airdropContract = getContract({
        address: AIRDROP_ADDRESS,
        abi: AIRDROP_ABI,
        client: {
          public: publicClient,
          wallet: walletClient,
        },
      })
      console.log('Airdrop Data:', airdropData)
      const hash = await airdropContract.write.claimERC20([
        erc20Token,
        safeAddress as Address,
        BigInt(airdropData?.value ?? 0),
        campaign?.airdrop_condition_id,
        airdropData?.proofs,
      ])

      await publicClient.waitForTransactionReceipt({ hash })
      console.log('Airdrop claim tx hash:', hash)
      return await axios.post(`${BACKEND_BASE_URI}/airdrop/${router.query.safe}`, {
        airdropId: campaignId,
        txHash: hash,
      })
    },
    onError: (error) => {
      console.error(error)
    },
    onSuccess: (data: any) => {
      setOpenClaimDialog(true)
      const link = 'https://optimistic.etherscan.io/tx/' + data.data.recipient
      setClaimTransactionLink(link)
      refetchAirdrop()
    },
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
  const handleClaimRewards = () => {
    setOpenClaimDialog(true)
  }
  if (!campaign || isLoading)
    return (
      <>
        <Head>
          <title>Super Account - Campaigns</title>
        </Head>
        <main>
          <Stack gap="32px" sx={{ p: { xs: 2, sm: 3, md: 4 }, maxWidth: { xs: '100%', sm: 720 }, mx: 'auto' }}>
            {/* Header */}
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Stack direction="row" gap="16px" alignItems="center">
                <Skeleton variant="circular" width={36} height={36} />
                <Stack>
                  <Skeleton variant="text" width={180} height={28} />
                  <Skeleton variant="text" width={100} height={20} />
                </Stack>
              </Stack>
            </Stack>

            <Divider />

            <Stack gap="8px">
              {/* Description */}
              <Card sx={{ borderRadius: '12px', padding: '16px' }}>
                <Skeleton variant="text" width="90%" height={24} />
                <Skeleton variant="text" width="95%" height={24} />
                <Skeleton variant="text" width="80%" height={24} />
              </Card>

              {/* Info cards grid */}
              <Grid container spacing={1}>
                {Array.from({ length: 4 }).map((_, i) => (
                  <Grid item xs={12} sm={6} key={i}>
                    <Card sx={{ borderRadius: '12px', p: 2 }}>
                      <Stack direction="row" gap={2} alignItems="center">
                        <Skeleton variant="rounded" width={40} height={40} />
                        <Stack>
                          <Skeleton variant="text" width={120} height={16} />
                          <Skeleton variant="text" width={80} height={16} />
                        </Stack>
                      </Stack>
                    </Card>
                  </Grid>
                ))}
              </Grid>

              {/* Rewards / badges section */}
              <Card sx={{ borderRadius: '12px', p: { xs: 2, sm: 3, md: 6 } }}>
                <Stack justifyContent="center" alignItems="center">
                  <Stack gap="8px" sx={{ width: { xs: '100%', sm: 352 } }}>
                    <Card
                      sx={{ width: '100%', borderRadius: '12px', p: { xs: 2, sm: 3, md: 6 }, backgroundColor: 'white' }}
                    >
                      <Stack gap="16px" justifyContent="center" alignItems="center">
                        <Skeleton variant="text" width={220} height={20} />
                        <Skeleton variant="text" width={180} height={20} />
                        <Stack direction="row" gap="8px" alignItems="center">
                          <Skeleton variant="text" width={80} height={32} />
                          <Skeleton variant="circular" width={24} height={24} />
                        </Stack>
                      </Stack>
                    </Card>

                    <Skeleton variant="rounded" width="100%" height={50} />
                    <Skeleton variant="text" width={140} height={16} sx={{ mx: 'auto' }} />
                  </Stack>
                </Stack>
              </Card>
            </Stack>
          </Stack>
        </main>
      </>
    )

  const now = new Date()
  const { day, month } = getCalendarValues(campaign.start_date)
  const isLive = now >= campaign.start_date && now <= campaign.end_date

  // Estados para el botón
  const isChecking = !isAirdropReady && !isPending
  const showSpinner = isPending || isChecking
  const label = isPending
    ? 'Claiming Rewards...'
    : isChecking
    ? 'Checking eligibility...'
    : isError
    ? 'Error! Try Again'
    : 'Claim Rewards'

  return (
    <>
      <Head>
        <title>Super Account - Campaigns</title>
      </Head>

      <main>
        <Stack gap="32px" sx={{ p: { xs: 2, sm: 3, md: 4 }, maxWidth: { xs: '100%', sm: 720 }, mx: 'auto' }}>
          {/* Header */}
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Stack direction="row" gap={2} alignItems="center">
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
                sx={{ flexDirection: { xs: 'column', sm: 'row' }, gap: { xs: '0px', sm: '8px' } }}
                alignItems="flex-start"
              >
                <Typography
                  variant="h3"
                  fontWeight={600}
                  sx={{
                    display: 'inline-block',
                    fontSize: { xs: '14px', sm: '20px', md: '24px' },
                    lineHeight: { xs: '20px', sm: '32px' },
                  }}
                >
                  {campaign.name}
                </Typography>
                <Typography
                  sx={{ transform: 'translateY(2px)', display: 'inline-block', fontSize: { xs: '12px', sm: '14px' } }}
                  component="span"
                  variant="body2"
                  color="#A0A0A6"
                >
                  &nbsp;Campaign
                </Typography>
              </Stack>
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
                    <Box sx={{ position: 'relative' }}>
                      {isLive && (
                        <Box
                          sx={{
                            position: 'absolute',
                            left: -0.5,
                            top: -0.5,
                            width: 13,
                            height: 13,
                            backgroundColor: '#39D551',
                            borderRadius: '100%',
                            border: '2px solid white',
                          }}
                        />
                      )}

                      <Box>
                        <Stack
                          alignItems="center"
                          justifyContent="center"
                          sx={{
                            width: 40,
                            height: 16,
                            borderTopLeftRadius: '12px',
                            borderTopRightRadius: '12px',
                            background: '#E1E2EA',
                          }}
                        >
                          <Typography fontSize="8px" fontWeight={600} sx={{ transform: 'translateY(1px)' }}>
                            {month}
                          </Typography>
                        </Stack>
                        <Stack
                          alignItems="center"
                          justifyContent="center"
                          sx={{
                            width: 40,
                            height: 24,
                            borderRadius: '0px 0px 12px 12px',
                            border: '1px solid #E1E2EA',
                            background: 'white',
                          }}
                        >
                          <Typography variant="h5" fontWeight={600}>
                            {day}
                          </Typography>
                        </Stack>
                      </Box>
                    </Box>
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
                    <Box sx={{ width: `${40 + 28 * (campaign.network.length - 1)}px`, position: 'relative' }}>
                      {campaign.network.map((network, index) => (
                        <Box
                          key={`${campaign.id + network}`}
                          sx={{
                            zIndex: (campaign.network.length + 1 - index) * 10,
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            width: 40,
                            minWidth: 40,
                            height: 40,
                            border: '1px solid #E1E2EA',
                            backgroundColor: 'white',
                            borderRadius: '12px',
                            transform: `translateX(${-index * 12}px)`,
                          }}
                        >
                          <NetworkChip network={network} style="badge" isFavorite={false} />
                        </Box>
                      ))}
                    </Box>
                    <Stack>
                      <Typography sx={{ fontWeight: '500', fontSize: '12px', lineHeight: '16px', color: '#75757A' }}>
                        Network
                      </Typography>
                      <Typography
                        sx={{ fontWeight: '500', fontSize: '16px', lineHeight: '24px', textTransform: 'capitalize' }}
                      >
                        {campaign.network.length == 1 ? campaign.network : `${campaign.network.length} Chains`}
                      </Typography>
                    </Stack>
                  </Stack>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Card sx={{ border: '1px solid #E1E2EA', borderRadius: '12px', p: 2 }}>
                  <Stack direction="row" gap={2} alignItems="center">
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        width: 40,
                        height: 40,
                        border: '1px solid #E1E2EA',
                        borderRadius: '12px',
                      }}
                    >
                      <Image
                        src={getTokenIcon(campaign.campaign_reward?.symbol)}
                        alt={`${campaign.campaign_reward?.symbol}-icon`}
                        width={20}
                        height={20}
                      />
                    </Box>
                    <Stack>
                      <Typography sx={{ fontWeight: '500', fontSize: '12px', lineHeight: '16px', color: '#75757A' }}>
                        Campaign Rewards
                      </Typography>
                      <Typography sx={{ fontWeight: '500', fontSize: '16px', lineHeight: '24px' }}>
                        {formatBeautifulAmount(campaign.campaign_reward?.amount ?? 0)}{' '}
                        {campaign.campaign_reward?.symbol ?? '--'}
                      </Typography>
                    </Stack>
                  </Stack>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Card sx={{ border: '1px solid #E1E2EA', borderRadius: '12px', p: 2 }}>
                  <Stack direction="row" gap={2} alignItems="center">
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        width: 40,
                        height: 40,
                        border: '1px solid #E1E2EA',
                        borderRadius: '12px',
                      }}
                    >
                      <SuperchainPointIcon style={{ width: 20, height: 20 }} />
                    </Box>
                    <Stack>
                      <Typography sx={{ fontWeight: '500', fontSize: '12px', lineHeight: '16px', color: '#75757A' }}>
                        Total points distributed
                      </Typography>
                      <Typography sx={{ fontWeight: '500', fontSize: '16px', lineHeight: '24px' }}>
                        {formatBeautifulAmount(campaign.distributed_points ?? 0)}
                      </Typography>
                    </Stack>
                  </Stack>
                </Card>
              </Grid>
            </Grid>

            {/* Badges */}
            <Card sx={{ border: '1px solid #E1E2EA', borderRadius: '12px', p: { xs: 2, sm: 3, md: 6 } }}>
              <Stack justifyContent="center" alignItems="center">
                <Stack gap="8px" sx={{ width: { xs: '100%', sm: 352 } }}>
                  <Stack alignItems="center" justifyContent="center">
                    <Card
                      sx={{
                        width: '100%',
                        border: campaign.claimed ? '1px solid #39D551' : '1px solid #E1E2EA',
                        borderRadius: '12px',
                        p: { xs: 2, sm: 3, md: 6 },
                        backgroundColor: campaign.claimed ? '#EBFBEE' : 'white',
                      }}
                    >
                      <Stack gap="16px" justifyContent="center" alignItems="center">
                        <Box>
                          <Typography
                            sx={{ fontSize: '12px', fontWeight: 400, color: '#75757A', textAlign: 'center', m: 0 }}
                          >
                            {campaign.claimed ? 'You’ve successfully claimed your rewards' : 'This campaign has ended.'}
                          </Typography>
                          {!campaign.claimed ? (
                            <>
                              {' '}
                              <Typography
                                sx={{ fontSize: '12px', fontWeight: 400, color: '#75757A', textAlign: 'center', m: 0 }}
                              >
                                Claim your rewards{' '}
                                <Box component="span" sx={{ fontWeight: 500, color: '#4B4B4E' }}>
                                  by Feb 6, 2026
                                </Box>
                              </Typography>
                            </>
                          ) : null}
                        </Box>
                        <Stack direction="row" gap="8px" alignItems="center">
                          <Typography sx={{ fontSize: '24px', fontWeight: '600', lineHeight: '32px' }}>
                            {formatUnits(
                              BigInt(campaign?.claimable_reward?.amount),
                              campaign?.claimable_reward.decimals,
                            )}
                          </Typography>
                          <Image
                            src={getTokenIcon(campaign.claimable_reward?.symbol)}
                            alt={`${campaign.campaign_reward?.symbol}-icon`}
                            width={24}
                            height={24}
                          />
                        </Stack>
                      </Stack>
                    </Card>
                  </Stack>

                  {!campaign.claimed && (
                    <>
                      <Button
                        sx={{
                          background: '#000000',
                          borderRadius: '12px',
                          padding: '15px',
                          color: 'white',
                          ':hover': { background: 'black' },
                          opacity: isChecking ? 0.5 : 1,
                          cursor: isChecking ? 'not-allowed' : 'pointer',
                          '&.Mui-disabled': {
                            background: '#000000',
                            color: 'white',
                            opacity: 0.5,
                          },
                          '& .MuiCircularProgress-root': {
                            color: 'white',
                          },
                        }}
                        onClick={() => mutate()}
                        disabled={isChecking || isPending}
                        aria-busy={showSpinner ? 'true' : 'false'}
                      >
                        <Stack direction="row" alignItems="center" gap={1}>
                          {showSpinner && <CircularProgress size={18} thickness={4} />}
                          {label}
                        </Stack>
                      </Button>

                      <Stack direction="row" gap="4px" justifyContent="center" alignItems="center">
                        <Typography variant="caption" color="#75757A">
                          Reward Formula{' '}
                        </Typography>
                        <Tooltip
                          arrow
                          placement="top"
                          title={
                            <Typography variant="caption" component="div">
                              25 OP for 400–499 points
                              <br />
                              70 OP for 600–749 points
                              <br />
                              125 OP for 750 points
                            </Typography>
                          }
                        >
                          <InfoIcon sx={{ width: 16, height: 16 }} />
                        </Tooltip>
                      </Stack>
                    </>
                  )}
                </Stack>
              </Stack>
            </Card>
          </Stack>
        </Stack>
        <Dialog
          open={openClaimDialog}
          onClose={() => setOpenClaimDialog(false)}
          PaperProps={{ sx: { width: '345px', paddingY: '4px', borderRadius: 2 } }}
        >
          <Card
            sx={{
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Header */}
            <Stack direction="row" justifyContent="space-between" alignItems="center" padding="16px">
              <Typography variant="h4" fontWeight="600">
                Claim Complete
              </Typography>
              <CheckCircleIcon sx={{ width: 24, height: 24 }} />
            </Stack>
            <Divider sx={{ width: '100%' }} />
            <Box padding="16px 16px 0 16px">
              <Typography sx={{ fontSize: '12px', fontWeight: 400, color: '#75757A', m: 0 }}>
                You’ve successfully claimed your rewards
              </Typography>
              <Typography sx={{ fontSize: '12px', fontWeight: 400, color: '#75757A', m: 0, lineHeight: '12px' }}>
                from the{' '}
                <Box component="span" sx={{ fontWeight: 500, color: '#4B4B4E' }}>
                  {campaign.name} Campaign.
                </Box>
              </Typography>
            </Box>

            <Card sx={{ border: '1px solid #E1E2EA', borderRadius: '12px', padding: 2, margin: '16px' }}>
              <Stack direction="row" alignItems="center" gap={2}>
                <Box sx={{ position: 'relative' }}>
                  <Image
                    src={getTokenIcon(campaign.campaign_reward?.symbol)}
                    alt={`${campaign.campaign_reward?.symbol}-icon`}
                    width={44}
                    height={44}
                  />
                  <Box sx={{ position: 'absolute', right: -1.5, bottom: 0.5 }}>
                    <NetworkChip
                      key={`${campaign.id + campaign.network}`}
                      network={campaign.network && campaign.network.length > 0 ? campaign.network[0] : ''}
                      style="badge"
                      width={16}
                      height={16}
                      isFavorite={false}
                    />
                  </Box>
                </Box>
                <Stack gap={0.5}>
                  <Typography variant="h4" fontWeight="600">
                    {formatUnits(BigInt(campaign?.claimable_reward?.amount), campaign?.claimable_reward.decimals)}
                  </Typography>
                  <Typography variant="caption" color="#75757A" fontWeight={400}>
                    $ {formatUnits(BigInt(campaign?.claimable_reward?.amount), campaign?.claimable_reward.decimals)}
                  </Typography>
                </Stack>
              </Stack>
            </Card>
            <Divider sx={{ width: '100%' }} />
            <Stack gap="8px" padding="16px">
              <Button
                onClick={() => router.push({ pathname: AppRoutes.vaults.index, query: { safe: router.query.safe } })}
                sx={{
                  background: '#000000',
                  borderRadius: '12px',
                  padding: '15px',
                  ':hover': { background: 'black' },
                }}
              >
                <Typography variant="body2" fontWeight={600} color="white">
                  Earn 8% APR on Rewards
                </Typography>
              </Button>
              <Button
                onClick={() => router.push({ pathname: AppRoutes.campaigns, query: { safe: router.query.safe } })}
                sx={{ background: '#F1F2F5', borderRadius: '12px', padding: '15px' }}
              >
                <Typography variant="body2" fontWeight={600} color="black">
                  Back to Campaigns
                </Typography>
              </Button>
            </Stack>

            <Button
              href={claimTransactionLink}
              target="_blank"
              sx={{ '&:hover': { background: 'transparent' }, paddingBottom: '16px' }}
            >
              <Stack direction="row" gap="4px" justifyContent="center" alignItems="center">
                <Typography variant="caption" color="#75757A">
                  View on Explorer
                </Typography>
                <Launch sx={{ width: '16px', height: '16px' }} />
              </Stack>
            </Button>
          </Card>
        </Dialog>
      </main>
    </>
  )
}
