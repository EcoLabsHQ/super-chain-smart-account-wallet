import { Box, Stack, Typography, IconButton, Button, Divider, Tooltip, Link } from '@mui/material'
import OfflineBoltOutlinedIcon from '@mui/icons-material/OfflineBoltOutlined'
import InsertInvitationTwoToneIcon from '@mui/icons-material/InsertInvitationTwoTone'
import CloseIcon from '@mui/icons-material/Close'
import React from 'react'
import css from './styles.module.css'
import { Campaign } from '..'
import NetworkChip from '@/components/badges/networkChip'
import Image from 'next/image'
import router from 'next/router'
import { AppRoutes } from '@/config/routes'

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

  const handleBadgeClick = () => {
    router.push({
      pathname: AppRoutes.badges.allTime,
      query: { safe: router.query.safe, campaign: currentCampaign.name },
    })
  }

  const formatDate = (date: Date) =>
    date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    })

  return (
    <Stack
      justifyContent="flex-start"
      alignItems="center"
      spacing={2}
      className={css.drawer}
      sx={{
        height: '100%',
        overflowY: 'auto',
        '&::-webkit-scrollbar': {
          width: '4px',
        },
        '&::-webkit-scrollbar-track': {
          background: '#f1f1f1',
        },
        '&::-webkit-scrollbar-thumb': {
          background: '#888',
          borderRadius: '4px',
        },
        '&::-webkit-scrollbar-thumb:hover': {
          background: '#555',
        },
        pb: 3,
      }}
    >
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
          {currentCampaign.network.map((network: string, index: number) => (
            <Box
              key={`box${currentCampaign.id + network}`}
              sx={{
                ml: index === 0 ? 0 : '-15px',
                borderRadius: '100px',
                border: '1px solid #E1E2EA',
                width: '30px',
                height: '30px',
                pl: '2px',
                pt: '2px',
                backgroundColor: 'white',
                zIndex: currentCampaign.network.length - index,
                position: 'relative',
              }}
            >
              <NetworkChip key={`${currentCampaign.id + network}`} network={network} style="badge" isFavorite={false} />
            </Box>
          ))}
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

      {currentCampaign.boosts.length > 0 && (
        <Box borderRadius={2} border="1px solid" borderColor="#E1E2EA" bgcolor="grey.50" width={340}>
          <Box display="flex" justifyContent="space-between" alignItems="center" p="16px">
            <Typography fontWeight={600}>Increase Your Boost</Typography>
            <Tooltip
              title="Your Super Account boosts the yield you earn from eligible Lisk Surge pools. The more traits you unlock, the higher the multiplier."
              componentsProps={{
                tooltip: {
                  sx: {
                    bgcolor: 'rgba(56, 106, 255, 0.95)',
                    color: 'white',
                    fontSize: '14px',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    '& .MuiTooltip-arrow': {
                      color: 'rgba(56, 106, 255, 0.95)',
                    },
                  },
                },
              }}
            >
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
                  cursor: 'pointer',
                  userSelect: 'none',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    background: '#D6E0FF',
                    boxShadow: '0 2px 8px rgba(56, 106, 255, 0.15)',
                  },
                }}
              >
                <OfflineBoltOutlinedIcon sx={{ color: '#386AFF', fontSize: 18 }} />
                <Typography fontSize={14} fontWeight={500} color="primary">
                  {currentCampaign.totalBoost}% Boost
                </Typography>
              </Box>
            </Tooltip>
          </Box>
          <Box width="100%">
            <Divider sx={{ borderColor: '#E1E2EA' }} />
          </Box>
          <Stack p="16px" gap="16px" spacing="0">
            {currentCampaign.boosts.map((boost: any, index: number) => {
              const displayName = boost.badgeName || boost.name || ''
              const currentLevel = typeof boost.currentLevel === 'number' ? boost.currentLevel : 0
              const maxLevel = typeof boost.maxLevel === 'number' ? boost.maxLevel : 0
              const isActive = boost.applies === true
              return (
                <Box key={displayName} display="flex" alignItems="center" gap={2}>
                  <Box
                    width={58}
                    height={58}
                    padding="8px"
                    borderRadius="12px"
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    justifyContent="center"
                    gap="6px"
                    border={isActive ? '1px solid #39D551' : '1px solid #E1E2EA'}
                    sx={{
                      backgroundColor: isActive ? '#EBFBEE' : '#FFF',
                      transition: 'all 0.2s ease-in-out',
                      animation: 'fadeIn 0.3s ease-out',
                      '&:hover': {
                        boxShadow: isActive ? '0 0 16px rgba(57, 213, 81, 0.35)' : '0 0 8px rgba(0, 0, 0, 0.05)',
                      },
                      '@keyframes fadeIn': {
                        '0%': {
                          opacity: 0.8,
                          transform: 'scale(0.98)',
                        },
                        '100%': {
                          opacity: 1,
                          transform: 'scale(1)',
                        },
                      },
                    }}
                  >
                    {boost.image && <Image src={boost.image} alt={displayName} width={32} height={32} />}
                    {boost.type === 'badge' && maxLevel > 0 && (
                      <Box display="flex" gap="2px" justifyContent="center">
                        {[...Array(currentLevel)].map((_, i) => (
                          <Box key={i} width={4} height={4} borderRadius="100px" bgcolor="#39D551" />
                        ))}
                        {[...Array(maxLevel - currentLevel)].map((_, i) => (
                          <Box key={i} width={4} height={4} borderRadius="100px" bgcolor="#EBECF1" />
                        ))}
                      </Box>
                    )}
                    {boost.type === 'level' && (
                      <Box display="flex" flexDirection="column" alignItems="center">
                        <Image src="/images/badges/star.svg" alt="Badge" width={32} height={32} />

                        <Typography
                          variant="h5"
                          fontWeight={700}
                          color="white"
                          sx={{
                            position: 'absolute',
                            transform: 'translateY(-63%)',
                            backgroundColor: 'transparent',
                            pt: '50px',
                          }}
                        >
                          {currentLevel}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                  <Box flex={1}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography fontWeight={600}>
                        {boost.type === 'level' ? 'Level ' + boost.level : displayName}
                      </Typography>
                      <Box
                        sx={{
                          borderRadius: '100px',
                          display: 'flex',
                          alignItems: 'center',
                          border: '1px solid #386AFF',
                          background: '#EBF0FF',
                          fontSize: 10,
                          fontWeight: 500,
                          height: '20px',
                          padding: '0px 4px',
                        }}
                      >
                        +{boost.boostPercent}%
                      </Box>
                    </Box>
                    <Typography
                      fontSize={10}
                      fontWeight={400}
                      lineHeight="14px"
                      textOverflow="ellipsis"
                      color="text.secondary"
                    >
                      {boost.description}
                    </Typography>
                  </Box>
                </Box>
              )
            })}
          </Stack>
        </Box>
      )}
      {currentCampaign.campaign_badges.length > 0 && (
        <Box borderRadius={2} border="1px solid" borderColor="#E1E2EA" bgcolor="grey.50" width={340}>
          <Box display="flex" justifyContent="space-between" alignItems="center" p="16px">
            <Typography fontWeight={600}>Earn Campaign Badge</Typography>
          </Box>
          <Box width="100%">
            <Divider sx={{ borderColor: '#E1E2EA' }} />
          </Box>
          <Stack p="16px" gap="16px" spacing="0">
            {currentCampaign.campaign_badges.map((badge: any, index: number) => {
              const isActive = badge.applies === true
              const currentLevel = typeof badge.currentLevel === 'number' ? badge.currentLevel : 0
              const maxLevel = typeof badge.maxLevel === 'number' ? badge.maxLevel : 0
              return (
                <Box key={badge.badgeName} display="flex" alignItems="center" gap={2}>
                  <Link onClick={handleBadgeClick} sx={{ cursor: 'pointer' }}>
                    <Box
                      width={58}
                      height={58}
                      padding="8px"
                      borderRadius="12px"
                      display="flex"
                      flexDirection="column"
                      alignItems="center"
                      justifyContent="center"
                      gap="6px"
                      border={isActive ? '1px solid #39D551' : '1px solid #E1E2EA'}
                      sx={{
                        backgroundColor: isActive ? '#EBFBEE' : '#FFF',
                        transition: 'all 0.2s ease-in-out',
                        animation: 'fadeIn 0.3s ease-out',
                        '&:hover': {
                          boxShadow: isActive ? '0 0 16px rgba(57, 213, 81, 0.35)' : '0 0 8px rgba(0, 0, 0, 0.05)',
                        },
                        '@keyframes fadeIn': {
                          '0%': {
                            opacity: 0.8,
                            transform: 'scale(0.98)',
                          },
                          '100%': {
                            opacity: 1,
                            transform: 'scale(1)',
                          },
                        },
                      }}
                    >
                      {badge.image && <Image src={badge.image} alt={badge.badgeName} width={32} height={32} />}
                      {maxLevel > 0 && (
                        <Box display="flex" gap="2px" justifyContent="center">
                          {[...Array(currentLevel)].map((_, i) => (
                            <Box key={i} width={4} height={4} borderRadius="100px" bgcolor="#39D551" />
                          ))}
                          {[...Array(maxLevel - currentLevel)].map((_, i) => (
                            <Box key={i} width={4} height={4} borderRadius="100px" bgcolor="#EBECF1" />
                          ))}
                        </Box>
                      )}
                    </Box>
                  </Link>
                  <Box flex={1}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography fontWeight={600}>{badge.badgeName}</Typography>
                    </Box>
                    <Typography fontSize={12} color="text.secondary">
                      {badge.description}
                    </Typography>
                  </Box>
                </Box>
              )
            })}
          </Stack>
        </Box>
      )}
      <Box width="100%" px={3} pb={3}>
        <Button
          variant="contained"
          fullWidth
          size="large"
          sx={{ borderRadius: 999, height: '48px' }}
          href={currentCampaign.campaign_link}
          target="_blank"
          rel="noopener noreferrer"
        >
          Participate
        </Button>
        <Typography textAlign="center" fontSize={12} mt={1} color=" #75757A">
          {currentCampaign.participate_description}
        </Typography>
      </Box>
    </Stack>
  )
}

export default CampaignInfo
