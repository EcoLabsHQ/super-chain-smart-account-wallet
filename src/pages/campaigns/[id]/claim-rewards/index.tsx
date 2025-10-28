'use client'
import Head from 'next/head'
import React from 'react'
import { Button, Card, Dialog, Divider, Skeleton, Stack, Typography } from '@mui/material'
import InfoIcon from '@/public/images/common/info-light.svg'
import CheckCircleIcon from '@/public/images/common/check-circle-outlined.svg'
import SuperchainPointIcon from '@/public/images/common/superChain.svg'
import { ArrowBack, Launch } from '@mui/icons-material'
import { useRouter } from 'next/router'
import { AppRoutes } from '@/config/routes'
import useSafeAddress from '@/hooks/useSafeAddress'
import { BACKEND_BASE_URI } from '@/config/constants'
import { Campaign, formatAmount } from '@/components/campaigns'
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

const getTokenIcon = (symbol: string) => {
  const usdc = '/images/currencies/usdc.svg'
  const usdt = '/images/currencies/usdt.svg'
  const weth = '/images/currencies/weth.svg'
  switch (symbol) {
    case 'USDC':
      return usdc
    case 'USDT':
      return usdt
    case 'WETH':
      return weth
    default:
      return usdc
  }
}
function getCalendarValues(date: string | Date): { day: number; month: string } {
  const d = new Date(date)

  // Extrae el día del mes (número)
  const day = d.getDate()

  // Extrae las 3 letras del mes en mayúscula
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
    queryKey: ['check-airdrop', safeAddress],
    queryFn: () => checkAirdropEligibility(safeAddress),
    enabled: !!safeAddress,
  })
  const erc20Token = (airdropData?.token ?? '0x471EcE3750Da237f93B8E339c536989b8978a438') as Address

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
      const hash = await airdropContract.write.claimERC20([
        erc20Token,
        safeAddress as Address,
        BigInt(airdropData?.value ?? 0),
        1, //TODO: this is the condition_ID, IDK if we need to get it from the backend or not
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
      setClaimTransactionLink(data.recipient)
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
          <Stack gap="32px" sx={{ p: 4, maxWidth: 720, mx: 'auto' }}>
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
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '8px',
                }}
              >
                {Array.from({ length: 4 }).map((_, i) => (
                  <Card key={i} sx={{ borderRadius: '12px', padding: '16px' }}>
                    <Stack direction="row" gap="16px" alignItems="center">
                      <Skeleton variant="rounded" width={40} height={40} />
                      <Stack>
                        <Skeleton variant="text" width={120} height={16} />
                        <Skeleton variant="text" width={80} height={16} />
                      </Stack>
                    </Stack>
                  </Card>
                ))}
              </div>

              {/* Rewards / badges section */}
              <Card sx={{ borderRadius: '12px', padding: '48px' }}>
                <Stack justifyContent="center" alignItems="center">
                  <Stack gap="8px" width="352px">
                    <Card
                      sx={{
                        width: '100%',
                        borderRadius: '12px',
                        padding: '48px',
                        backgroundColor: 'white',
                      }}
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

  return (
    <>
      <Head>
        <title>Super Account - Campaigns</title>
      </Head>

      <main>
        <Stack gap="32px" sx={{ p: 4, maxWidth: 720, mx: 'auto' }}>
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
              <Card sx={{ border: '1px solid #E1E2EA', borderRadius: '12px', padding: '16px' }}>
                <Stack direction="row" gap="16px" alignItems="center">
                  <Stack
                    style={{ width: `${40 + 28 * (campaign.network.length - 1)}px` }}
                    direction="row"
                    alignItems="center"
                  >
                    {campaign.network.map((network, index) => (
                      <div
                        key={`${campaign.id + network}`}
                        style={{
                          zIndex: `${(campaign.network.length + 1 - index) * 10}`,
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          width: '40px',
                          minWidth: '40px',
                          height: '40px',
                          border: '1px solid #E1E2EA',
                          backgroundColor: 'white',
                          borderRadius: '12px',
                          transform: `translateX(${-index * 12}px)`,
                        }}
                      >
                        <NetworkChip network={network} style="badge" isFavorite={false} />
                      </div>
                    ))}
                  </Stack>
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
                      {campaign.network.length == 1 ? campaign.network : `${campaign.network.length} Chains`}
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
                    <Image
                      src={getTokenIcon(campaign.campaign_reward?.symbol)}
                      alt={`${campaign.campaign_reward?.symbol}-icon`}
                      width={20}
                      height={20}
                    />
                  </div>
                  <Stack>
                    <Typography sx={{ fontWeight: '500', fontSize: '12px', lineHeight: '16px', color: '#75757A' }}>
                      Campaign Rewards
                    </Typography>
                    <Typography sx={{ fontWeight: '500', fontSize: '16px', lineHeight: '24px' }}>
                      {formatAmount(campaign.campaign_reward?.amount ?? 0)} {campaign.campaign_reward?.symbol ?? '--'}
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
                      {formatAmount(campaign.distributed_points ?? 0)}
                    </Typography>
                  </Stack>
                </Stack>
              </Card>
            </div>

            {/* Badges */}
            <Card sx={{ border: '1px solid #E1E2EA', borderRadius: '12px', padding: '48px' }}>
              <Stack justifyContent="center" alignItems="center">
                <Stack gap="8px" width="352px">
                  <Stack alignItems="center" justifyContent="center">
                    <Card
                      sx={{
                        width: '100%',
                        border: '1px solid #E1E2EA',
                        borderRadius: '12px',
                        padding: '48px',
                        backgroundColor: 'white',
                      }}
                    >
                      <Stack gap="16px" justifyContent="center" alignItems="center">
                        <div>
                          <Typography
                            style={{
                              fontSize: '12px',
                              fontWeight: '400',
                              color: '#75757A',
                              textAlign: 'center',
                              margin: '0px',
                            }}
                          >
                            This campaign has ended.
                          </Typography>
                          <Typography
                            style={{
                              fontSize: '12px',
                              fontWeight: '400',
                              color: '#75757A',
                              textAlign: 'center',
                              margin: '0px',
                            }}
                          >
                            Claim your rewards{' '}
                            <span style={{ fontWeight: '500', color: '#4B4B4E' }}>by December 15, 2025</span>
                          </Typography>
                        </div>
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
                  <Button
                    sx={{
                      background: '#000000',
                      borderRadius: '12px',
                      padding: '15px',
                      color: 'white',
                      ':hover': { background: 'black' },
                    }}
                    onClick={() => mutate()}
                  >
                    {isPending ? 'Claiming Rewards...' : isError ? 'Error! Try Again' : 'Claim Rewards'}
                  </Button>
                  <Stack direction="row" gap="4px" justifyContent="center" alignItems="center">
                    <Typography variant="caption" color="#75757A">
                      Reward Formula{' '}
                    </Typography>
                    <InfoIcon style={{ width: '16px', height: '16px' }} />
                  </Stack>
                </Stack>
              </Stack>
            </Card>
          </Stack>
        </Stack>
        <Dialog
          open={openClaimDialog}
          onClose={() => setOpenClaimDialog(false)}
          sx={{ margin: 'auto', width: '410px', overflow: 'visible' }}
        >
          <Card
            sx={{
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}
          >
            {/* Header */}
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="h4" fontWeight="600">
                Claim Complete
              </Typography>
              <CheckCircleIcon style={{ width: '24px', height: '24px' }} />
              {/* <CheckCircleIcon sx={{ color: "success.main" }} /> */}
            </Stack>
            <Divider style={{ width: '345px', margin: '0 auto', transform: 'translateX(-20px)' }} />
            <div>
              <Typography style={{ fontSize: '12px', fontWeight: '400', color: '#75757A', margin: '0px' }}>
                You’ve successfully claimed your rewards
              </Typography>
              <Typography
                style={{ fontSize: '12px', fontWeight: '400', color: '#75757A', margin: '0px', lineHeight: '12px' }}
              >
                from the <span style={{ fontWeight: '500', color: '#4B4B4E' }}>{campaign.name} Campaign.</span>
              </Typography>
            </div>

            {/* Subtitle */}

            {/* Reward Box */}
            {/* <Image src="/imgs/usd-coin.svg" alt="usd coin" width={36} height={36} /> */}
            <Card sx={{ border: '1px solid #E1E2EA', borderRadius: '12px', padding: '16px' }}>
              <Stack direction="row" alignItems="center" gap="12px">
                <div style={{ position: 'relative' }}>
                  <Image
                    src={getTokenIcon(campaign.campaign_reward?.symbol)}
                    alt={`${campaign.campaign_reward?.symbol}-icon`}
                    width={44}
                    height={44}
                  />
                  <div style={{ position: 'absolute', right: '-6px', bottom: '3px' }}>
                    <NetworkChip
                      key={`${campaign.id + campaign.network}`}
                      network={campaign.network && campaign.network.length > 0 ? campaign.network[0] : ''}
                      style="badge"
                      width={16}
                      height={16}
                      isFavorite={false}
                    />
                  </div>
                </div>
                <Stack gap="4px">
                  <Typography variant="h4" fontWeight="600">
                    {formatUnits(BigInt(campaign?.claimable_reward?.amount), campaign?.claimable_reward.decimals)}
                  </Typography>
                  <Typography variant="caption" color="#75757A" fontWeight={400}>
                    $ {formatUnits(BigInt(campaign?.claimable_reward?.amount), campaign?.claimable_reward.decimals)}
                  </Typography>
                </Stack>
              </Stack>
            </Card>
            <Divider style={{ width: '345px', margin: '0 auto', transform: 'translateX(-20px)' }} />
            <Stack gap="8px">
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

            <Button href={claimTransactionLink} target="_blank" sx={{ '&:hover': { background: 'transparent' } }}>
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
