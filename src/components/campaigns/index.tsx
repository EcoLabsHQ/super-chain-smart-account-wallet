import { BACKEND_BASE_URI } from '@/config/constants'
import { Box, Card, Grid, Skeleton, Stack, Typography } from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import React from 'react'
import useSafeAddress from '@/hooks/useSafeAddress'

interface Campaign {
  name: string
  start_date: Date
  end_date: Date
  description: string
  tag: string
  network: string
}

function CampaignCard({ campaign }: { campaign: Campaign }) {
  return (
    <Grid item xs={4}>
      <Card variant="outlined" sx={{ p: 0 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2 }}></Box>
      </Card>
    </Grid>
  )
}

function Campaigns() {
  const address = useSafeAddress()
  const { data: campaigns, isLoading: isLoadingCampaigns } = useQuery<Campaign[]>({
    queryKey: ['campaigns', address],
    queryFn: async () => {
      const response = await axios.get(`${BACKEND_BASE_URI}/campaigns/${address}`)
      return response.data
    },
    enabled: !!address,
  })

  if (isLoadingCampaigns || !campaigns) {
    return <Skeleton variant="rectangular" height={100} />
  }

  return (
    <Stack gap={2} p={1} sx={{ width: '100%' }}>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Campaigns
      </Typography>

      <Grid container spacing={2}>
        {campaigns.map((campaign) => {
          return <CampaignCard campaign={campaign} key={campaign.name} />
        })}
      </Grid>
    </Stack>
  )
}

export default Campaigns
