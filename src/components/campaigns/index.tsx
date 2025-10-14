import { BACKEND_BASE_URI } from '@/config/constants'
import { Box, Card, Divider, Drawer, Skeleton, Stack, SvgIcon, Typography } from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import React, { useState } from 'react'
import useSafeAddress from '@/hooks/useSafeAddress'
import ArrowRightIcon from '@/public/images/common/arrow_right_alt.svg'
import CalendarIcon from '@/public/images/common/calendar-gray.svg'
import NetworkChip from '../badges/networkChip'
import CampaignInfo from './campaignInfo'
import { tokens } from '@/config/tokens'
import { useRouter } from 'next/router'
import { AppRoutes } from '@/config/routes'
export interface Campaign {
  id: string
  name: string
  description: string
  banner: string
  network: string[]
  participate_description: string
  campaign_link: string
  myPoints: number
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
  campaign_reward: { symbol: string; amount: string }
  claimable_reward: { symbol: string; amount: string }
  start_date: string | Date
  end_date: string | Date
}

export interface CampaignBadge {
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
export const formatAmount = (amount?: number) => {
  if (!amount) return 0
  if (amount >= 1000) {
    return `${Math.round(amount / 1000)}k`
  }
  return amount
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
      <Stack padding="16px" gap="16px">
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
          {campaign.description}
        </Typography>

        {/* Footer: reward pill + networks */}
        <Box sx={{ display: 'flex', alignItems: 'center', mt: 'auto', gap: 1 }}>
          {/* REWARD pill (con icono token). Cambia la ruta del img si la tienes dinámica */}
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
              {formatAmount(parseInt(campaign?.campaign_reward?.amount) ?? 0)}{' '}
              {campaign?.claimable_reward?.symbol ?? '--'}
            </Typography>
            <SvgIcon component={tokens['USDC'].icon} sx={{ width: 18, height: 18, transform: 'translateY(1px)' }} />
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

export default Campaigns
