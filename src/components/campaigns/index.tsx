import { Box, Card, Grid, Stack, Typography } from '@mui/material'
import React from 'react'

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
  const campaigns: Campaign[] = []
  return (
    <Stack gap={2} p={1} sx={{ width: '100%' }}>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Campaigns
      </Typography>

      <Grid container spacing={2}>
        {campaigns.map((campaign) => {
          return <CampaignCard campaign={campaign} />
        })}
      </Grid>
    </Stack>
  )
}

export default Campaigns
