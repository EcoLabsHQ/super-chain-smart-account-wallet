import { Box, Stack, Typography, IconButton, Button, Divider } from '@mui/material'
import OfflineBoltOutlinedIcon from '@mui/icons-material/OfflineBoltOutlined'
import InsertInvitationTwoToneIcon from '@mui/icons-material/InsertInvitationTwoTone'
import CloseIcon from '@mui/icons-material/Close'
import React from 'react'
import css from './styles.module.css'
import { Campaign } from '..'
import NetworkChip from '@/components/badges/networkChip'

function CampaignInfo({
  currentCampaign,
  setCurrentCampaign,
}: {
  currentCampaign: Campaign | null
  setCurrentCampaign: (_: null | Campaign) => void
}) {
  if (!currentCampaign) return null
  const now = new Date()
  const start = new Date(currentCampaign.start_date)
  const end = new Date(currentCampaign.end_date)
  const isLive = now >= start && now <= end

  const formatDate = (date: Date) =>
    date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    })

  return (
    <Stack justifyContent="flex-start" alignItems="center" spacing={2} className={css.drawer}>
      <Box display="flex" width="100%" paddingTop="24px" px={3} justifyContent="space-between" alignItems="center">
        <Box display="flex" alignItems="center" gap={1}>
          {isLive && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                background: '#EBFBEE',
                border: '1px solid #39D551',
                borderRadius: '100px',
                padding: '0px 8px',
                boxShadow: '0 1px 4px rgba(44, 204, 64, 0.08)',
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
              <Typography variant="h6" sx={{ fontWeight: 500, fontSize: 14 }}>
                Live
              </Typography>
            </Box>
          )}
          <Box
            sx={{
              borderRadius: '100px',
              border: '1px solid #E1E2EA',
              width: '30px',
              pl: '2px',
              pt: '2px',
              height: '30px',
            }}
          >
            <NetworkChip
              key={`${currentCampaign.id}`}
              network={currentCampaign.network}
              style="badge"
              isFavorite={false}
            />
          </Box>
        </Box>

        <IconButton size="small" onClick={() => setCurrentCampaign(null)}>
          <CloseIcon />
        </IconButton>
      </Box>
      <Box width="100%">
        <Divider />
      </Box>

      <Box width="100%" px={3}>
        <Typography fontSize={20} fontWeight={600}>
          {currentCampaign.name}
        </Typography>
        <Box display="flex" alignItems="center" gap={1} mt={1}>
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
        <Typography fontSize={14} mt={1.5} color="grey.900">
          {currentCampaign.description}
        </Typography>
      </Box>
      <Box width="100%">
        <Divider />
      </Box>
      <Box borderRadius={2} border="1px solid" borderColor="grey.500" bgcolor="grey.50" width={340}>
        <Box display="flex" justifyContent="space-between" alignItems="center" px={3} py={1.5}>
          <Typography fontWeight={600}>Increase Your Boost</Typography>
          <Box
            sx={{
              px: 1.5,
              py: 0.5,
              borderRadius: '100px',
              display: 'flex',
              alignItems: 'center',
              border: '1px solid #386AFF',
              background: '#EBF0FF',
              gap: 0.75,
            }}
          >
            <OfflineBoltOutlinedIcon sx={{ color: '#386AFF', fontSize: 18 }} />
            <Typography fontSize={14} fontWeight={500} color="primary">
              {currentCampaign.totalBoost}% Boost
            </Typography>
          </Box>
        </Box>
        <Box width="100%">
          <Divider sx={{ borderColor: 'grey.500' }} />
        </Box>
        <Stack my={2} spacing={1.5} px={3}>
          {currentCampaign.boosts.map((boost, index) => (
            <Box key={boost.badgeName} display="flex" alignItems="center" gap={2}>
              <Box
                width={58}
                height={58}
                borderRadius="12px"
                display="flex"
                alignItems="center"
                justifyContent="center"
                border="2px solid  #39D551"
                sx={{ backgroundColor: ' #EBFBEE' }}
              >
                <Typography fontWeight={700}>{boost.level}</Typography>
              </Box>
              <Box flex={1}>
                <Box display="flex" alignItems="center" gap={1}>
                  <Typography fontWeight={600}>{boost.badgeName}</Typography>
                  <Box
                    sx={{
                      px: 1,
                      py: 0.2,
                      borderRadius: '100px',
                      display: 'flex',
                      alignItems: 'center',
                      border: '1px solid #386AFF',
                      background: '#EBF0FF',
                      gap: 0.75,
                      fontSize: 13,
                    }}
                  >
                    +{boost.boostPercent}%
                  </Box>
                </Box>
                <Typography fontSize={12} color="text.secondary">
                  {boost.description}
                </Typography>
              </Box>
            </Box>
          ))}
        </Stack>
      </Box>

      <Box borderRadius={2} border="1px solid" borderColor="grey.500" bgcolor="grey.50" width={340}>
        <Box display="flex" justifyContent="space-between" alignItems="center" px={3} py={2}>
          <Typography fontWeight={600}>Earn Campaign Badge</Typography>
        </Box>
        <Box width="100%">
          <Divider sx={{ borderColor: 'grey.500' }} />
        </Box>
        <Stack my={2} spacing={1.5} px={3}>
          {currentCampaign.campaign_badges.map((badge, index) => (
            <Box key={badge.badgeName} display="flex" alignItems="center" gap={2}>
              <Box
                width={58}
                height={58}
                borderRadius="12px"
                display="flex"
                alignItems="center"
                justifyContent="center"
                border="2px solid  #39D551"
                sx={{ backgroundColor: ' #EBFBEE' }}
              >
                <Typography fontWeight={700}>ICON</Typography>
              </Box>
              <Box flex={1}>
                <Box display="flex" alignItems="center" gap={1}>
                  <Typography fontWeight={600}>{badge.badgeName}</Typography>
                </Box>
                <Typography fontSize={12} color="text.secondary">
                  {badge.description}
                </Typography>
              </Box>
            </Box>
          ))}
        </Stack>
      </Box>

      <Box width="100%" px={3} pb={3}>
        <Button variant="contained" fullWidth size="large" sx={{ borderRadius: 999, height: '48px' }}>
          Participate
        </Button>
        <Typography textAlign="center" fontSize={12} mt={1} color=" #75757A">
          Participating increases your Season 7 progress and may result in additional rewards at a later point.
        </Typography>
      </Box>
    </Stack>
  )
}

export default CampaignInfo
