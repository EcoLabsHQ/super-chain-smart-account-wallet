import { BACKEND_BASE_URI } from '@/config/constants'
import { Box, Button, Card, Skeleton, Stack, SvgIcon, Typography } from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import React, { useState } from 'react'
import useSafeAddress from '@/hooks/useSafeAddress'
import ArrowRightIcon from '@/public/images/common/arrow_right_alt.svg'
import CalendarIcon from '@/public/images/common/calendar-gray.svg'
import NetworkChip from '../badges/networkChip'
import { tokens } from '@/config/tokens'
import { useRouter } from 'next/router'
import { AppRoutes } from '@/config/routes'
import Image from 'next/image'
export interface Campaign {
  id: string
  name: string
  description: string
  banner: string
  network: string[]
  participate_description: string
  campaign_link: string
  myPoints: number
  my_points: { id: number; points: number }[]
  boosts: Array<{
    type: string
    level?: number
    boostPercent: number
    description: string
    currentLevel?: number
    maxLevel?: number
    name?: string
    image?: string
    minLevel?: number
    applies: boolean
  }>
  totalBoost: number
  campaign_badges: Array<CampaignBadge>
  more_info: string
  distributed_points: number
  can_claim: boolean
  max_claim_date: Date
  campaign_reward: { symbol: string; amount: number; decimals: number,token: string }
  claimable_reward: { symbol: string; amount: string; decimals: number,token: string }
  start_date: string | Date
  end_date: string | Date,
  airdrop_condition_id: number
}

export interface CampaignBadge {
  id: string
  type: string
  badgeName: string
  description: string
  currentLevel: number
  maxLevel: number
  image: string
  tokenBadge?: boolean
  season?: number
  completed?: boolean
  currentPoints: number
  maxPoints: number
}

// utils (arriba del componente o en un helper)
const formatClaimBy = (value?: string | Date) => {
  if (!value) return '--'
  const d = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(d.getTime())) return '--'
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export const formatAmount = (amount?: number): string => {
  // si amount es null o undefined, devolvemos "0"
  if (amount == null) return '0'

  // para cifras < 1000 devolvemos el número tal cual (como string)
  if (amount < 1000) return String(amount)

  // convertimos a 'k'
  const valueK = amount / 1000
  // redondeo a 1 decimal (ej: 1.55 -> 1.6)
  const rounded = Math.round(valueK * 10) / 10

  // si el resultado es entero (ej 2.0) mostramos "2k", sino "1.6k"
  if (Number.isInteger(rounded)) {
    return `${rounded.toFixed(0)}k`
  } else {
    return `${rounded.toFixed(1)}k`
  }
}

function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength - 3) + '...'
}

function CampaignCard({
  campaign,
  setCurrentCampaign,
}: {
  campaign: Campaign
  setCurrentCampaign: (campaign: Campaign) => void
}) {
  const now = new Date()
  const start = new Date(campaign.start_date)
  const end = new Date(campaign.end_date)
  const isLive = now >= start && now <= end
  const router = useRouter()

  const formatDate = (date: Date) =>
    date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })

  const handlePickCampaign = () => {
    if (campaign.can_claim) {
      router.push({
        pathname: `${AppRoutes.campaigns}/${campaign.id}/claim-rewards`,
        query: { safe: router.query.safe },
      })
      return
    }
    router.push({ pathname: `${AppRoutes.campaigns}/${campaign.id}`, query: { safe: router.query.safe } })
  }

  return (
    <Card
      variant="outlined"
      sx={{
        p: 0,
        borderRadius: '12px',
        overflow: 'hidden',
        backgroundColor: '#ffffff', // fondo claro consistente
        border: '1px solid #E1E2EA',
        cursor: 'pointer',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
      onClick={handlePickCampaign}
    >
      {/* Banner */}
      <Box sx={{ position: 'relative', aspectRatio: '16/9', width: '100%', overflow: 'hidden' }}>
        <img
          src={campaign.banner}
          alt={campaign.name}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover', // importante para cubrir el área como en el diseño
            display: 'block',
          }}
        />

        {/* Live badge */}
        {isLive && (
          <Box
            sx={{
              position: 'absolute',
              top: 12,
              right: 12,
              display: 'flex',
              alignItems: 'center',
              background: '#EBFBEE',
              border: '1px solid #39D551',
              borderRadius: '100px',
              px: 1,
              py: '4px',
              gap: 0.5,
              zIndex: 2,
            }}
          >
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#39D551' }} />
            <Typography fontSize={12} fontWeight={600} fontFamily="Sora">
              Live
            </Typography>
          </Box>
        )}
      </Box>

      {/* Content */}
      <Stack padding="16px" gap="12px">
        {/* Fecha */}

        {/* Título */}
        <Typography variant="h6" fontWeight={500} sx={{ fontSize: 18 }}>
          {campaign.name}
        </Typography>
        <Stack direction="row" gap="6px" alignItems="center">
          <CalendarIcon style={{ width: '20px', heigth: '20px' }} />
          <Typography variant="body2" color="#4B4B4E" fontWeight={500}>
            {formatDate(start)}
          </Typography>
          <ArrowRightIcon style={{ width: '16px', heigth: '16px' }} />
          <Typography variant="body2" color="#A0A0A6" fontWeight={500}>
            {formatDate(end)}
          </Typography>
        </Stack>

        {/* Descripción (truncate) */}
        <Typography
          variant="body2"
          color="text.secondary"
          fontFamily="Sora"
          sx={{
            fontSize: 14,
            fontWeight: 400,
            color: '#75757A',
          }}
        >
          {truncateText(campaign.description, 100)}
        </Typography>

        <Box sx={{ mt: '4px', display: 'flex', alignItems: 'center', gap: 1 }}>
          {campaign.can_claim && (
            <>
              <Button
                variant="contained"
                endIcon={<Image src="/images/diamond_shine.svg" alt="Claim" width={16} height={16} />}
                sx={{
                  borderRadius: '100px',
                  background: '#000',
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '14px',
                  lineHeight: '20px',
                  height: '28px',
                  fontFamily: 'DM Sans',
                  px: '50px',
                  boxShadow: 'none',
                  '&:hover': { background: '#000', boxShadow: 'none' },
                }}
              >
                <Typography variant="caption" fontWeight={600}>
                  Claim Rewards
                </Typography>
              </Button>

              {/* Empuja el label a la derecha */}
              <Typography
                sx={{
                  ml: 'auto',
                  color: '#75757A', // var(--Foundation-Grey-grey-800)
                  fontFamily: 'DM Sans',
                  fontSize: '12px',
                  fontStyle: 'normal',
                  fontWeight: 500,
                  lineHeight: '16px',
                  whiteSpace: 'nowrap',
                }}
              >
                {`Claim by ${formatClaimBy(campaign.max_claim_date)}`}
              </Typography>
            </>
          )}
          {campaign.can_claim && campaign.end_date < new Date() && (
            <Box sx={{ marginTop: '4px', display: 'flex', alignItems: 'center', gap: 1 }}>
              <Stack
                alignItems="center"
                direction="row"
                gap="4px"
                style={{
                  border: '1px solid #E1E2EA',
                  borderRadius: '100px',
                  padding: '4px',
                  paddingLeft: '10px',
                  paddingRight: '4px',
                }}
              >
                <Typography variant="caption" fontWeight={600} color="black">
                  {formatAmount(campaign?.campaign_reward?.amount ?? 0)} {campaign?.campaign_reward?.symbol ?? '--'}
                </Typography>
                <SvgIcon
                  component={tokens[campaign?.campaign_reward?.symbol ?? 'USDC'].icon}
                  sx={{ width: 18, height: 18, transform: 'translateY(1px)' }}
                />
              </Stack>

              {/* Network chips (overlap estilo) */}
              <Box sx={{ display: 'flex', alignItems: 'center', ml: 'auto' }}>
                {campaign.network.map((network: string, index: number) => (
                  <Box
                    key={`${campaign.id}-${network}`}
                    sx={{
                      ml: index === 0 ? 0 : -1.4,
                      borderRadius: '50%',
                      border: '1px solid #fff',
                      width: 30,
                      height: 30,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: '#fff',
                      boxShadow: '0 1px 2px rgba(16,24,40,0.06)',
                    }}
                  >
                    <NetworkChip network={network} style="badge" isFavorite={false} width={20} height={20} />
                  </Box>
                ))}
              </Box>
            </Box>
          )}
        </Box>
      </Stack>
    </Card>
  )
}

function Campaigns({ chain, search }: { chain: string; search: string }) {
  const address = useSafeAddress()
  const [currentCampaign, setCurrentCampaign] = useState<Campaign | null>(null)
  const { data: campaigns, isLoading: isLoadingCampaigns } = useQuery<Campaign[]>({
    queryKey: ['campaigns', address],
    queryFn: async () => {
      const response = await axios.get(`${BACKEND_BASE_URI}/campaigns/${address}`)
      return response.data
    },
    refetchInterval: 10000,
    enabled: !!address,
  })
  const filterCampaign = (campaign: Campaign) => {
    if (chain == '' && search == '') {
      return true
    }
    const searchValue = search.toUpperCase()
    let searchFilter = false
    if (
      search != '' &&
      (campaign.name.toUpperCase().includes(searchValue) || campaign.description.toUpperCase().includes(searchValue))
    ) {
      searchFilter = true
    }
    let chainFilter = false
    campaign.network.forEach((network) => {
      console.log('net: ', network)
      chainFilter = network == chain ? true : chainFilter
    })
    return chainFilter || searchFilter
  }

  if (isLoadingCampaigns || !campaigns) {
    return (
      <Stack gap={2} sx={{ width: '100%' }}>
        <Skeleton variant="text" width={200} height={40} />
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '16px',
            width: '100%',
            gridAutoRows: '1fr',
            '& > *': {
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
            },
          }}
        >
          {[1, 2, 3].map((index) => (
            <Card key={index} variant="outlined" sx={{ p: 0, borderRadius: '12px', overflow: 'hidden', maxWidth: 340 }}>
              <Skeleton variant="rectangular" height={192} />
              <Box sx={{ p: 2 }}>
                <Skeleton variant="text" width="80%" height={32} sx={{ mb: 1 }} />
                <Skeleton variant="text" width="60%" height={24} sx={{ mb: 1 }} />
                <Skeleton variant="text" width="90%" height={20} sx={{ mb: 1 }} />
                <Skeleton variant="text" width="70%" height={20} sx={{ mb: 2 }} />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Skeleton variant="rounded" width={120} height={30} />
                  <Skeleton variant="circular" width={30} height={30} sx={{ ml: 'auto' }} />
                </Box>
              </Box>
            </Card>
          ))}
        </Box>
      </Stack>
    )
  }

  if (campaigns.length > 0) {
    return (
      <Stack gap={2} sx={{ width: '100%' }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '16px',
            width: '100%',
            gridAutoRows: '1fr',
            '& > *': {
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
            },
          }}
        >
          {campaigns
            .filter((campaign) => filterCampaign(campaign))
            .map((campaign) => {
              return <CampaignCard campaign={campaign} key={campaign.name} setCurrentCampaign={setCurrentCampaign} />
            })}
        </Box>
        {/* <Drawer variant="temporary" anchor="right" onClose={() => setCurrentCampaign(null)} open={!!currentCampaign}>
        <CampaignInfo setCurrentCampaign={setCurrentCampaign} currentCampaign={currentCampaign} />
      </Drawer> */}
      </Stack>
    )
  }
}

export default Campaigns
