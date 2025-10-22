import { BadgeTier, ResponseBadge } from '@/types/super-chain'
import { Avatar, Stack, Typography } from '@mui/material'
import CheckCircleIcon from '@/public/images/common/check-circle-white.svg'
import SuperchainPointIcon from '@/public/images/common/superChain.svg'
import DotIcon from '@/public/images/common/dot_soft_gray.svg'
import React from 'react'
import { formatAmount } from '@/components/campaigns'

type Props = {
  tier: BadgeTier
  currentBadge: ResponseBadge
}
function formatPercentage(num: number): string {
  if (Number.isInteger(num)) {
    return num.toString()
  }

  if (num > 10) {
    return Math.floor(num).toString()
  }

  return num.toFixed(2)
}

export default function BadgeTierCard({ tier, currentBadge }: Props) {
  const completed = parseInt(tier.tier) <= parseInt(currentBadge.tier)
  return (
    <Stack direction="row" alignItems="end" justifyContent="space-between" padding="12px 8px 12px 8px">
      <Stack direction="row" alignItems="center" gap="16px">
        <div style={{ position: 'relative', border: '1px solid #E1E2EA', borderRadius: '12px' }}>
          <Avatar src="" sx={{ width: 40, height: 40 }} variant="rounded" />
          {completed && (
            <CheckCircleIcon
              style={{ position: 'absolute', right: '-5px', bottom: '-5px', width: '16px', height: '16px' }}
            />
          )}
        </div>
        <Stack>
          <Stack direction="row">
            <Typography variant="caption" fontWeight={500} color="#75757A">
              Tier {tier.tier}
            </Typography>
            <DotIcon style={{ width: '16px', heigth: '16px' }} />
            <Typography variant="caption" fontWeight={500} color="#75757A">
              {`${formatAmount(10800)} (${formatPercentage(84)}%) Users Completed`}
            </Typography>
          </Stack>
          <Typography variant="h5" fontWeight={500}>
            Unlock at 100K XP during SuperStacks
          </Typography>
        </Stack>
      </Stack>
      <Stack direction="row" gap="4px" alignItems="center">
        <Typography variant="h5" fontWeight={600}>
          {tier.points}
        </Typography>
        <SuperchainPointIcon style={{ width: '24px', height: '24px' }} />
      </Stack>
    </Stack>
  )
}
