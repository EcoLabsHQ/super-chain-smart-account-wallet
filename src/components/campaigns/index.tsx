import { BACKEND_BASE_URI } from '@/config/constants'
import { Box, Card, Divider, Drawer, Grid, Skeleton, Stack, Typography } from '@mui/material'
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
  network: string
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
        boxShadow: 2,
        backgroundColor: 'grey.50',
        cursor: 'pointer',
        height: '100%',
      }}
      onClick={handlePickCampaign}
    >
      <Box
        sx={{
          position: 'relative',
          background: '#eee',
          aspectRatio: '16/9',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <img
          src={campaign.banner}
          alt={campaign.name}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            position: 'absolute',
            top: 0,
            left: 0,
          }}
        />
        {isLive && (
          <Box
            sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              display: 'flex',
              alignItems: 'center',
              background: '#EBFBEE',
              border: '1px solid #39D551',
              borderRadius: '100px',
              padding: '0px 8px',
              boxShadow: '0 1px 4px rgba(44, 204, 64, 0.08)',
              zIndex: 2,
              height: '28px',
              gap: 1,
            }}
          >
            <Box
              sx={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: '#39D551',
              }}
            />
            <Typography
              variant="h6"
              sx={{
                fontWeight: 500,
                fontSize: 14,
              }}
            >
              Live
            </Typography>
          </Box>
        )}
      </Box>
      <Box sx={{ p: 2 }}>
        <Typography variant="subtitle1" fontWeight={600} fontSize={18} fontFamily="Sora" gutterBottom>
          {campaign.name}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box
              component="span"
              sx={{
                color: 'text.secondary',
                backgroundColor: 'grey.300',
                borderRadius: 1,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '4px',
                width: 24,
                height: 24,
              }}
            >
              <InsertInvitationTwoToneIcon fontSize="small" />
            </Box>
            <Typography variant="body2" color="grey.900">
              {formatDate(start)}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mx: 0.5 }}>
              →
            </Typography>
            <Typography variant="body2" color="grey.700">
              {formatDate(end)}
            </Typography>
          </Box>
        </Box>
        <Typography variant="body2" color="grey.800" fontSize={14} fontWeight={400} sx={{ mb: 2 }}>
          {campaign.description}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            sx={{
              padding: '0px 8px',
              borderRadius: '100px',
              display: 'flex',
              border: '1px solid #386AFF',
              alignItems: 'center',
              background: '#EBF0FF',
              px: 1.5,
              py: 0.5,
            }}
          >
            <OfflineBoltOutlinedIcon sx={{ color: ' #386AFF', pr: '4px' }} />
            <Typography variant="body2" color="primary" fontWeight={500} fontSize={14}>
              {campaign.totalBoost}% Boost
            </Typography>
          </Box>

          <Box
            sx={{
              ml: 'auto',
              borderRadius: '100px',
              border: '1px solid #E1E2EA',
              width: '30px',
              pl: '2px',
              pt: '2px',
              height: '30px',
            }}
          >
            <NetworkChip key={`${campaign.id}`} network={campaign.network} style="badge" isFavorite={false} />
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
