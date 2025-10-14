import { Card, Stack, Typography, Box, LinearProgress, Avatar, Skeleton } from '@mui/material'
import GiftIcon from '@/public/images/common/gift.svg'
import CheckCircleIcon from '@/public/images/common/check-circle-white.svg'
import SuperchainPointIcon from '@/public/images/common/superChain.svg'
import { type CampaignBadge } from '..'
import SeasonChip from '@/components/badges/seasonChip'
type Props = {
  badge: CampaignBadge
}

export default function CampaignBadge({ badge }: Props) {
  return (
    <div style={{ position: 'relative' }}>
      <div style={{ zIndex: '10', position: 'absolute', top: '-4px', left: '-4px' }}>
        <SeasonChip season={badge?.season ?? 0} />
      </div>
      <Card
        variant="outlined"
        sx={{
          position: 'relative',
          borderRadius: '12px',
          border: '1px solid #E1E2EA',
          padding: '16px',
          overflow: 'auto',
        }}
      >
        <Stack direction="row" alignItems="center" gap="16px">
          {/* Icono principal */}
          <div style={{ position: 'relative' }}>
            <Avatar src={badge.image} sx={{ width: 60, height: 60 }} variant="rounded" />
            <CheckCircleIcon
              style={{ position: 'absolute', right: '-5px', bottom: '-5px', width: '16px', height: '16px' }}
            />
          </div>

          <Stack width="100%">
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Stack direction="row" alignItems="center" gap="8px">
                <Typography variant="body1" fontWeight={600}>
                  {badge.badgeName}
                </Typography>
                {badge.tokenBadge && <GiftIcon style={{ width: '20px', height: '20px' }} />}
              </Stack>

              <div
                style={{
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
                    {badge.currentPoints ?? 0}
                  </Typography>
                  <Typography variant="caption" fontWeight="600" sx={{ color: '#75757A' }}>
                    /{badge.maxPoints ?? 0}
                  </Typography>
                </Stack>
                <SuperchainPointIcon style={{ width: '16px', height: '16px' }} />
              </div>
            </Stack>
            <Typography variant="body2" style={{ color: '#75757A' }}>
              {badge.description}
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
