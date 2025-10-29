import { useState } from 'react'
import { Card, Stack, Typography, Avatar } from '@mui/material'
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
    <div style={{ position: 'relative' }}>
      <div style={{ zIndex: 2, position: 'absolute', top: '-4px', left: '-4px' }}>
        <SeasonChip season={badge?.season ?? 0} />
      </div>

      <Card
        onClick={() => handlePickBadge(badge.id)}
        variant="outlined"
        sx={{
          cursor: 'pointer',
          position: 'relative',
          borderRadius: '12px',
          backgroundColor: 'white',
          border: '1px solid #E1E2EA',
          padding: '16px',
          overflow: 'auto',
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <Stack direction="row" alignItems="center" gap="16px">
          {/* Icono principal */}
          <div style={{ position: 'relative', border: '1px solid #E1E2EA', borderRadius: '12px' }}>
            <Avatar src={badge.image} sx={{ width: 60, height: 60 }} variant="rounded" />
            {badge.completed && (
              <CheckCircleIcon
                style={{ position: 'absolute', right: '-5px', bottom: '-5px', width: '16px', height: '16px' }}
              />
            )}
          </div>

          <Stack width="100%">
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Stack direction="row" alignItems="center" gap="8px">
                <Typography variant="body1" fontWeight={600}>
                  {badge.badgeName}
                </Typography>
                {badge.tokenBadge && <GiftIcon style={{ width: '20px', height: '20px' }} />}
              </Stack>

              {myPoints && (
                <div
                  style={{
                    visibility: shouldShowPoints ? 'visible' : 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    border: '1px solid #E1E2EA',
                    borderRadius: '100px',
                    padding: '4px 6px 4px 6px',
                  }}
                >
                  <Stack direction="row" alignItems="center">
                    <Typography variant="caption" fontWeight="600" sx={{ color: 'black' }}>
                      {myPoints.find((x) => x.id.toString() == badge.id)?.points ?? 0}
                    </Typography>
                    <Typography variant="caption" fontWeight="600" sx={{ color: '#75757A' }}>
                      /{badge.maxPoints ?? 0}
                    </Typography>
                  </Stack>
                  <SuperchainPointIcon style={{ width: '16px', height: '16px' }} />
                </div>
              )}
            </Stack>

            <Typography variant="body2" style={{ color: '#75757A' }}>
              {truncateText(badge.description, 40)}
            </Typography>

            <Stack direction="row" alignItems="center" gap="6px" mt="8px">
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
    </div>
  )
}
