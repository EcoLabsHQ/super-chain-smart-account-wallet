import { BACKEND_BASE_URI } from '@/config/constants'
import { Box, Card, Divider, Drawer, Skeleton, Stack, Typography } from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import React, { useState } from 'react'
import useSafeAddress from '@/hooks/useSafeAddress'
import InsertInvitationTwoToneIcon from '@mui/icons-material/InsertInvitationTwoTone'
import OfflineBoltOutlinedIcon from '@mui/icons-material/OfflineBoltOutlined'
import NetworkChip from '../badges/networkChip'
import CampaignInfo from './campaignInfo'
export interface Campaign {
  id: string
  name: string
  description: string
  banner: string
  network: string[]
  participate_description: string
  campaign_link: string
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
  campaign_badges: Array<{
    type: string
    badgeName: string
    description: string
    currentLevel: number
    maxLevel: number
  }>
  start_date: string | Date
  end_date: string | Date
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

  const formatDate = (date: Date) =>
    date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })

  const handlePickCampaign = () => {
    setCurrentCampaign(campaign)
  }

  return (
    <Card
      variant="outlined"
      sx={{
        p: 0,
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: 1,
        backgroundColor: 'white',
        cursor: 'pointer',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
      onClick={handlePickCampaign}
    >
      {/* Banner */}
      <Box sx={{ position: 'relative', aspectRatio: '16/9', width: '100%' }}>
        <img
          src={campaign.banner}
          alt={campaign.name}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            position: 'absolute',
            top: 0,
            left: 0,
          }}
        />
        {isLive && (
          <Box
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              display: 'flex',
              alignItems: 'center',
              background: '#EBFBEE',
              border: '1px solid #39D551',
              borderRadius: '100px',
              px: 1,
              py: 0.25,
              gap: 0.5,
            }}
          >
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: '#39D551',
              }}
            />
            <Typography fontSize={12} fontWeight={500}>
              Live
            </Typography>
          </Box>
        )}
      </Box>

      {/* Info */}
      <Box sx={{ p: 2, flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Fecha */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <InsertInvitationTwoToneIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
          <Typography variant="body2" color="text.secondary">
            {formatDate(start)} → {formatDate(end)}
          </Typography>
        </Box>

        {/* Nombre */}
        <Typography variant="h6" fontWeight={600} fontFamily="Sora" sx={{ mb: 1 }}>
          {campaign.name}
        </Typography>

        {/* Descripción */}
        <Typography variant="body2" color="text.secondary" sx={{ flexGrow: 1, mb: 2 }} noWrap>
          {campaign.description}
        </Typography>

        {/* Footer con reward y chain */}
        <Box sx={{ display: 'flex', alignItems: 'center', mt: 'auto' }}>
          <Box
            sx={{
              border: '1px solid #E1E2EA',
              borderRadius: '100px',
              px: 1.5,
              py: 0.5,
              display: 'flex',
              alignItems: 'center',
              fontSize: 14,
              fontWeight: 500,
              color: 'text.primary',
            }}
          >
            50K USDC
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', ml: 'auto' }}>
            {campaign.network.map((network: string) => (
              <NetworkChip key={`${campaign.id}-${network}`} network={network} style="badge" isFavorite={false} />
            ))}
          </Box>
        </Box>
      </Box>
    </Card>
  )
}

function Campaigns() {
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

  if (isLoadingCampaigns || !campaigns) {
    return (
      <Stack gap={2} p={1} sx={{ width: '100%' }}>
        <Skeleton variant="text" width={200} height={40} />
        <Divider />
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
    <Stack gap={2} p={1} sx={{ width: '100%' }}>
      <Typography variant="h4" fontWeight={700} fontFamily="Sora" fontSize={24} gutterBottom>
        Campaigns
      </Typography>
      <Divider />
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
        {campaigns.map((campaign) => {
          return <CampaignCard campaign={campaign} key={campaign.name} setCurrentCampaign={setCurrentCampaign} />
        })}
      </Box>
      <Drawer variant="temporary" anchor="right" onClose={() => setCurrentCampaign(null)} open={!!currentCampaign}>
        <CampaignInfo setCurrentCampaign={setCurrentCampaign} currentCampaign={currentCampaign} />
      </Drawer>
    </Stack>
  )
}

export default Campaigns
