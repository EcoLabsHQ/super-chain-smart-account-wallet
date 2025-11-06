'use client'
import Campaigns from '@/components/campaigns'
import Head from 'next/head'
import React, { useState } from 'react'
import { Typography, Stack, Divider, TextField, MenuItem, Select, Button, InputAdornment } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'

function CampaignsPage() {
  const [chain, setChain] = useState('')
  const [search, setSearch] = useState('')
  return (
    <>
      <Head>
        <title>Super Account - Campaigns</title>
      </Head>

      <main>
        <Stack sx={{ padding: '32px 24px 32px 24px', maxWidth: '900px', mx: 'auto' }}>
          <Stack gap="8px">
            <Typography variant="h4" fontWeight={700} fontFamily="Sora" fontSize={28}>
              Campaigns
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Participate in Super Account Campaigns to earn rewards.
            </Typography>
          </Stack>
          <Divider style={{ marginTop: '10px', marginBottom: '16px' }} />
          {/* Header con buscador y filtro */}
          <Stack direction="row" alignItems="center" gap="8px" sx={{ mb: 3 }}>
            {/* Search */}
            <TextField
              value={search}
              placeholder="Search"
              onChange={(event) => setSearch(event.target.value)}
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
              value={chain}
              displayEmpty
              size="small"
              onChange={(event) => setChain(event.target.value ?? '')}
              renderValue={() => (chain == '' ? 'Chain' : chain)}
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
              <MenuItem value="Lisk">Lisk</MenuItem>
              <MenuItem value="Optimism">Optimism</MenuItem>
              <MenuItem value="Base">Base</MenuItem>
              <MenuItem value="Celo">Celo</MenuItem>
            </Select>

            {/* Clear All */}
            <Button
              variant="text"
              disableRipple
              onClick={() => {
                setSearch('')
                setChain('')
              }}
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

          {/* Listado de campañas */}
          <Campaigns chain={chain} search={search} />
        </Stack>
      </main>
    </>
  )
}

export default CampaignsPage
