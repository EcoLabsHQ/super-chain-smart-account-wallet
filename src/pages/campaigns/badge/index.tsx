import { Card, Stack, Typography, Avatar } from '@mui/material'
import SuperchainPointIcon from '@/public/images/common/superChain.svg'
type Props = {
  badge: {
    type: string
    badgeName: string
    description: string
    currentLevel: number
    maxLevel: number
    currentPoints: number
    maxPoints: number
  }
}

export default function CampaignBadge({ badge }: Props) {
  if (!badge) {
    return (
      <Card
        variant="outlined"
        sx={{
          borderRadius: '12px',
          border: '1px solid #E1E2EA',
          padding: '16px',
        }}
      >
        <Stack direction="row" alignItems="center" gap="16px">
          {/* Icono principal */}
          <Avatar
            src="/images/soneium.png" // tu ícono aquí
            sx={{ width: 60, height: 60 }}
            variant="rounded"
          />

          <Stack width="100%">
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Stack direction="row" alignItems="center" gap="8px">
                <Typography variant="body1" fontWeight={600}></Typography>
                {/* <GiftIcon style={{ width: '20px', height: '20px' }} /> */}
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
                    {0}
                  </Typography>
                  <Typography variant="caption" fontWeight="600" sx={{ color: '#75757A' }}>
                    /{0}
                  </Typography>
                </Stack>
                <SuperchainPointIcon style={{ width: '16px', height: '16px' }} />
              </div>
            </Stack>
            <Typography variant="body2" style={{ color: '#75757A' }}></Typography>

            <Stack direction="row" alignItems="center" gap="6px" mt="8px">
              {Array.from({ length: 0 }).map((_, i) => (
                <span
                  key={i}
                  style={{
                    flex: 1,
                    height: '6px',
                    backgroundColor: 0 >= i + 1 ? '#39D551' : '#EBECF1',
                    borderRadius: '100px',
                  }}
                ></span>
              ))}
            </Stack>
          </Stack>
        </Stack>
      </Card>
    )
  }
  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: '12px',
        border: '1px solid #E1E2EA',
        padding: '16px',
      }}
    >
      <Stack direction="row" alignItems="center" gap="16px">
        {/* Icono principal */}
        <Avatar
          src="/images/soneium.png" // tu ícono aquí
          sx={{ width: 60, height: 60 }}
          variant="rounded"
        />

        <Stack width="100%">
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Stack direction="row" alignItems="center" gap="8px">
              <Typography variant="body1" fontWeight={600}>
                {badge?.badgeName ?? ''}
              </Typography>
              {/* <GiftIcon style={{ width: '20px', height: '20px' }} /> */}
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
                  {badge?.currentPoints ?? 0}
                </Typography>
                <Typography variant="caption" fontWeight="600" sx={{ color: '#75757A' }}>
                  /{badge?.maxPoints ?? 0}
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
  )
}
