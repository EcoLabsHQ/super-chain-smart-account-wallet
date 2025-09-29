import { Card, Stack, Typography, Avatar } from '@mui/material'
import GiftIcon from '@/public/images/common/gift.svg'
import SuperchainPointIcon from '@/public/images/common/superChain.svg'

export default function CampaignBadge() {
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
                Soneium User
              </Typography>
              <GiftIcon style={{ width: '20px', height: '20px' }} />
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
                  60
                </Typography>
                <Typography variant="caption" fontWeight="600" sx={{ color: '#75757A' }}>
                  /150
                </Typography>
              </Stack>
              <SuperchainPointIcon style={{ width: '16px', height: '16px' }} />
            </div>
          </Stack>
          <Typography variant="body2" style={{ color: '#75757A' }}>
            Transactions made on Soneium
          </Typography>

          <Stack direction="row" alignItems="center" gap="6px" mt="8px">
            <span style={{ width: '25%', height: '6px', backgroundColor: '#39D551', borderRadius: '100px' }}></span>
            <span style={{ width: '25%', height: '6px', backgroundColor: '#39D551', borderRadius: '100px' }}></span>
            <span style={{ width: '25%', height: '6px', backgroundColor: '#39D551', borderRadius: '100px' }}></span>
            <span style={{ width: '25%', height: '6px', backgroundColor: '#39D551', borderRadius: '100px' }}></span>
          </Stack>
        </Stack>
      </Stack>
    </Card>
  )
}
