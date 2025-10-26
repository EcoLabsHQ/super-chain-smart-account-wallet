import { Avatar, Divider, Stack, SvgIcon, Typography } from '@mui/material'
import CheckCircleIcon from '@/public/images/common/check-circle-white.svg'
import PadLockIcon from '@/public/images/common/padlock.svg'
import SuperchainPointIcon from '@/public/images/common/superChain.svg'
import DotIcon from '@/public/images/common/dot_soft_gray.svg'
import React from 'react'
import { formatAmount } from '@/components/campaigns'
import { BadgeTierDto, BadgeWithPrize } from '@/types/badges'
import { formatXP } from '../badge'
import { tokens } from '@/config/tokens'

type Props = {
  tier: BadgeTierDto
  currentBadge: BadgeWithPrize
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
  const completed = parseInt(tier.tier) <= currentBadge.tier
  const statistics = currentBadge.statistics?.find((stat) => stat.tier === parseInt(tier.tier))
  const rewardIcon = (tokens as any)?.[tier.rewards?.symbol ?? '']?.icon ?? (tokens as any)?.USDC?.icon
  return (
    <Stack
      direction="row"
      alignItems="end"
      justifyContent="space-between"
      padding="12px 15px 12px 8px"
      style={{ opacity: completed ? 1 : 0.4, filter: completed ? '' : 'grayscale(100%)' }}
    >
      <Stack direction="row" alignItems="center" gap="16px">
        <div style={{ position: 'relative', border: '1px solid #E1E2EA', borderRadius: '12px' }}>
          <Avatar
            src={currentBadge.metadata.image?.replace('/Badge.svg', `/T${tier.tier}.svg`)}
            sx={{ width: 40, height: 40 }}
            variant="rounded"
          />
          {completed ? (
            <CheckCircleIcon
              style={{ position: 'absolute', right: '-5px', bottom: '-5px', width: '16px', height: '16px' }}
            />
          ) : (
            <PadLockIcon
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
              {`${formatAmount(statistics?.totalClaimed ?? 0)} (${formatPercentage(
                statistics?.percentage ?? 0,
              )}%) Users Completed`}
            </Typography>
          </Stack>
          <Typography variant="h5" fontWeight={500}>
            {currentBadge.metadata.condition.replace('{{variable}}', formatXP(tier.metadata.minValue))}
          </Typography>
        </Stack>
      </Stack>
      <Stack direction="row" gap="8px">
        {tier.rewards && (
          <Stack direction="row" gap="4px" alignItems="center">
            <Typography variant="h5" fontWeight={600}>
              {tier.rewards?.amount ?? '0'}
            </Typography>
            <SvgIcon component={rewardIcon} sx={{ width: '24px', height: '24px', marginTop: '2px' }} />
          </Stack>
        )}
        {tier.rewards && <Divider sx={{ width: '1px', height: '24px' }} orientation="vertical" />}
        <Stack direction="row" gap="4px" alignItems="center">
          <Typography variant="h5" fontWeight={600}>
            {tier.points}
          </Typography>
          <SuperchainPointIcon style={{ width: '24px', height: '24px' }} />
        </Stack>
      </Stack>
    </Stack>
  )
}
