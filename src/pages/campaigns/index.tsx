import Campaigns from '@/components/campaigns'
import Head from 'next/head'
import React from 'react'
import { Box, Typography, Stack, Divider, TextField, MenuItem, Select, Button, InputAdornment } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'

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
            {/* Search */}
            <TextField
              placeholder="Search"
              variant="outlined"
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ fontSize: 18 }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                width: 238,
                height: 36,
                borderRadius: '12px',
                backgroundColor: '#F1F2F5',
                '& .MuiOutlinedInput-root': {
                  fontFamily: 'DM Sans',
                  fontSize: 14,
                  fontWeight: 600,
                  letterSpacing: '0.14px',
                  lineHeight: '16px',
                  padding: '0 8px',
                  '& fieldset': {
                    border: 'none',
                  },
                  '& input::placeholder': {
                    color: '#000',
                    opacity: 1,
                  },
                },
              }}
            />

            {/* Chain Select */}
            <Select
              value=""
              displayEmpty
              size="small"
              renderValue={() => 'Chain'}
              sx={{
                height: 36,
                borderRadius: '12px',
                backgroundColor: '#F1F2F5',
                fontFamily: 'DM Sans',
                fontSize: 14,
                fontWeight: 600,
                letterSpacing: '0.14px',
                padding: '0 8px',
                '& .MuiOutlinedInput-notchedOutline': {
                  border: 'none',
                },
              }}
            >
              <MenuItem value="op">Optimism</MenuItem>
              <MenuItem value="base">Base</MenuItem>
              <MenuItem value="arb">Arbitrum</MenuItem>
            </Select>

            {/* Clear All */}
            <Button
              variant="text"
              disableRipple
              sx={{
                height: 36,
                borderRadius: '12px',
                padding: '0 4px',
                fontFamily: 'DM Sans',
                fontSize: 14,
                fontWeight: 600,
                letterSpacing: '0.14px',
                textTransform: 'none',
                color: '#000',
                '&:hover': {
                  backgroundColor: 'transparent',
                },
              }}
            >
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
