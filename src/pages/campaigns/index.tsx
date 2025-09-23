import Campaigns from '@/components/campaigns'
import Head from 'next/head'
import React from 'react'
import { Box, Typography, Stack, Divider, TextField, Button } from '@mui/material'

function CampaignsPage() {
  return (
    <>
      <Head>
        <title>Super Account - Campaigns</title>
      </Head>

      <main>
        <Box sx={{ p: 3, maxWidth: '1200px', mx: 'auto' }}>
          <Typography variant="h4" fontWeight={700} fontFamily="Sora" fontSize={28} gutterBottom>
            Campaigns
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Discover builder and user campaigns across the Superchain.
          </Typography>

          {/* Header con buscador y filtro */}
          <Stack direction="row" alignItems="center" gap={2} sx={{ mb: 3 }}>
            <TextField placeholder="Search" variant="outlined" size="small" fullWidth sx={{ maxWidth: 300 }} />
            <Button variant="outlined" size="small">
              Chain
            </Button>
            <Button variant="text" size="small" color="inherit">
              Clear All
            </Button>
          </Stack>

          <Divider sx={{ mb: 3 }} />

          {/* Listado de campañas */}
          <Campaigns />
        </Box>
      </main>
    </>
  )
}

export default CampaignsPage
