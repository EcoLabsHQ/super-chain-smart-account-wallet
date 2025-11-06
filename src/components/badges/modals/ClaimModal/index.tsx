import { Box, Button, Dialog, Stack, SvgIcon, Typography } from '@mui/material'
import React from 'react'
import Shiny from '@/public/images/common/shiny-animation.svg'
import SuperChainPoints from '@/public/images/common/superChain.svg'
import css from './styles.module.css'

import { useAppSelector } from '@/store'
import { selectSuperChainAccount } from '@/store/superChainAccountSlice'
import CheckCircleIcon from '@/public/images/common/check-circle.svg'
import { GradientProgress } from '../..'
import { getBadgeStrategy } from '@/components/badges/badgeInfo/BadgeStrategyRenderer'
import ETHVaultStrategy from '@/components/badges/badgeInfo/strategies/ETHVaultStrategy'
import { tokens } from '@/config/tokens'
import { ClaimData } from '../../claimBadges'

function ClaimModal({
  open,
  onClose,
  data,
  onLevelUp,
}: {
  open: boolean
  onClose: () => void
  data: ClaimData | null
  onLevelUp: () => void
}) {
  const { data: superChainAccount } = useAppSelector(selectSuperChainAccount)
  const progress =
    Number(superChainAccount.points) > Number(superChainAccount.pointsToNextLevel)
      ? 100
      : (Number(superChainAccount.points) / Number(superChainAccount.pointsToNextLevel)) * 100

  const claimData = {
    claimedBadges: data?.badgeUpdates.flatMap((badge: any) => {
      const updatedBadge = data.updatedBadges.find((ub: any) => ub.badgeId === badge.badgeId)
      if (!updatedBadge) return []

      const previousLevel = Number(badge.previousLevel || 0)
      const currentLevel = Number(badge.level)
      const levels = Array.from({ length: currentLevel - previousLevel }, (_, i) => previousLevel + i + 1)

      return levels
        .map((level) => {
          const badgeTier = updatedBadge.badgeTiers.find((tier: any) => Number(tier.metadata.level) === level)
          if (!badgeTier) return ''
          const strategy = getBadgeStrategy(updatedBadge, [new ETHVaultStrategy()])
          const customLabel = strategy?.formatTierLabel?.(updatedBadge as any, level, badgeTier)
          if (customLabel) return customLabel
          return updatedBadge.metadata.condition.replace('{{variable}}', badgeTier.metadata.minValue)
        })
        .filter(Boolean)
    }),
  }

  return (
    <Dialog className={css.claimModal} open={open} onClose={onClose}>
      <Box display="flex" flexDirection="column" gap="24px" padding="24px" justifyContent="center" alignItems="center">
        <Typography id="modal-modal-title" fontSize={24} fontWeight={600} component="h2">
          Claim success
        </Typography>
        <Box
          width="100%"
          border={1}
          borderRadius="12px"
          borderColor="#CDCED5"
          sx={{ borderStyle: 'dashed', backgroundColor: 'transparent' }}
          padding="12px"
        >
          <Box sx={{ maxHeight: '200px', overflowY: 'auto' }}>
            {claimData.claimedBadges?.slice(0, 6).map((tx, index) => (
              <Box key={index}>
                <Box display="flex" justifyContent="space-between" alignItems="center" paddingY="6px">
                  <Typography color="#4B4B4E" fontSize="12px" fontWeight={500}>
                    {tx}
                  </Typography>
                  <SvgIcon
                    inheritViewBox
                    component={CheckCircleIcon}
                    sx={{
                      color: '#39D551',
                      fontSize: '16px',
                      width: '16px',
                      height: '16px',
                      borderRadius: '50%',
                    }}
                  />
                </Box>
              </Box>
            ))}
          </Box>
        </Box>

        <Box display="flex" justifyContent="space-between" alignItems="center" paddingLeft="12px" fontSize="16px">
          <Typography color="#75757A" fontWeight={400} fontSize="14px" pr={1}>
            You have received:
          </Typography>
          <Stack direction="row" alignItems="center" gap="4px">
            {Array.isArray(data?.rewards) &&
              data.rewards.map((reward, idx) => (
                <Stack key={idx} direction="row" gap="4px" alignItems="center">
                  <Typography variant="h5" fontWeight={600}>
                    {reward.amount ?? '0'}
                  </Typography>
                  <SvgIcon
                    component={(tokens as any)?.[reward.symbol ?? '']?.icon ?? (tokens as any)?.USDC?.icon}
                    sx={{ width: '24px', height: '24px', marginTop: '2px' }}
                  />
                  <Typography variant="body2" fontWeight={600}>
                    {reward.symbol}
                  </Typography>
                </Stack>
              ))}

            <Box
              sx={{ display: 'flex', alignItems: 'center', gap: '4px' }}
              border={1}
              borderRadius="100px"
              borderColor="#E1E2EA"
              paddingX="8px"
            >
              <Typography fontSize="12px" fontWeight={600} p="4px 2px">
                {data?.totalPoints ?? 0}
              </Typography>
              <SuperChainPoints style={{ width: '16px', height: '16px' }} />
            </Box>
          </Stack>
        </Box>
        <Box flex={1} width="100%">
          <GradientProgress variant="determinate" value={progress} />
          {!data?.isLevelUp && (
            <>
              <Stack justifyContent="center">
                <Typography variant="caption" textAlign="center" fontWeight={500} mt="6px" mx="auto" color="#75757A">
                  {Number(superChainAccount.points)} / {Number(superChainAccount.pointsToNextLevel)} Superchain Points
                  to level {Number(superChainAccount.level)}
                </Typography>
              </Stack>
              <Button
                onClick={onClose}
                variant="contained"
                sx={{ width: '100%', mt: '30px', borderRadius: '30px', height: '48px' }}
              >
                Continue
              </Button>
            </>
          )}
          {data?.isLevelUp && (
            <>
              <Typography variant="body2" align="center" mt={1} color="#75757A">
                You have enough Superchain Points to level-up!
              </Typography>
              <button onClick={onLevelUp} className={css.levelUpButton}>
                Level-up
                <Shiny className={css.shine} />
              </button>
            </>
          )}
        </Box>
      </Box>
    </Dialog>
  )
}

export default ClaimModal
