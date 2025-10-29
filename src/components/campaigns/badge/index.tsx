import { useState } from 'react'
import { Box, Card, Stack, Typography, Avatar } from '@mui/material'
import GiftIcon from '@/public/images/common/gift.svg'
import CheckCircleIcon from '@/public/images/common/check-circle-white.svg'
import SuperchainPointIcon from '@/public/images/common/superChain.svg'
import { type CampaignBadge } from '..'
import SeasonChip from '@/components/badges/seasonChip'
import { AppRoutes } from '@/config/routes'
import router from 'next/router'

type Props = {
  badge: CampaignBadge
  myPoints?: { id: number; points: number }[]
  pointsOnHover?: boolean
}

const handlePickBadge = (id: string) => {
  router.push({ pathname: `${AppRoutes.badges.allTime}/${id}`, query: { safe: router.query.safe } })
}

export default function CampaignBadge({ badge, myPoints, pointsOnHover }: Props) {
  const [hovered, setHovered] = useState(false)

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text
    return text.slice(0, maxLength) + '...'
  }

  const shouldShowPoints = !pointsOnHover || hovered

  return (
    <Box sx={{ position: 'relative', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ zIndex: 2, position: 'absolute', top: -1, left: -1 }}>
        <SeasonChip season={badge?.season ?? 0} />
      </Box>

      <Card
        onClick={() => handlePickBadge(badge.id)}
        variant="outlined"
        sx={{
          cursor: 'pointer',
          position: 'relative',
          borderRadius: '12px',
          backgroundColor: 'white',
          border: '1px solid #E1E2EA',
          p: 2,
          overflow: 'visible',
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <Stack direction="row" alignItems="center" gap="16px" sx={{ flex: 1 }}>
          {/* Icono principal */}
          <Box sx={{ position: 'relative', border: '1px solid #E1E2EA', borderRadius: '12px' }}>
            <Avatar
              src={badge.image}
              sx={{ width: { xs: 40, sm: 60 }, height: { xs: 40, sm: 60 } }}
              variant="rounded"
            />
            {badge.completed && (
              <CheckCircleIcon sx={{ position: 'absolute', right: -1, bottom: -1.25, width: 16, height: 16 }} />
            )}
          </Box>

          <Stack width="100%">
            <Stack direction="row" alignItems="center" justifyContent="space-between" gap="8px">
              <Stack direction="row" alignItems="center" gap="8px" minWidth="80px">
                <Typography variant="body1" fontWeight={600} fontSize={{ xs: '12px', sm: '16px' }} lineHeight="24px">
                  {badge.badgeName}
                </Typography>
                {badge.tokenBadge && <GiftIcon style={{ width: '20px', height: '20px' }} />}
              </Stack>

              {myPoints && (
                <Box
                  sx={{
                    visibility: shouldShowPoints ? 'visible' : 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    border: '1px solid #E1E2EA',
                    borderRadius: '100px',
                    px: 1,
                    py: 0.5,
                  }}
                >
                  <Stack direction="row" alignItems="center">
                    <Typography variant="caption" fontWeight={600} sx={{ color: 'black' }}>
                      {myPoints.find((x) => x.id.toString() == badge.id)?.points ?? 0}
                    </Typography>
                    <Typography variant="caption" fontWeight={600} sx={{ color: '#75757A' }}>
                      /{badge.maxPoints ?? 0}
                    </Typography>
                  </Stack>
                  <SuperchainPointIcon style={{ width: 16, height: 16 }} />
                </Box>
              )}
            </Stack>
            <Typography variant="body2" sx={{ color: '#75757A' }} fontSize={{ xs: '12px', sm: '14px' }} lineHeight="20px">
              {truncateText(badge.description, 40)}
            </Typography>

            <Stack direction="row" alignItems="center" gap={1} mt={1} sx={{ width: '100%' }}>
              {Array.from({ length: badge.maxLevel }).map((_, i) => (
                <span
                  key={i}
                  style={{
                    flex: 1,
                    height: '6px',
                    backgroundColor: badge.currentLevel >= i + 1 ? '#39D551' : '#EBECF1',
                    borderRadius: '100px',
                  }}
                ></span>
              ))}
            </Stack>
          </Stack>
        </Stack>
      </Card>
    </Box>
  )
}
