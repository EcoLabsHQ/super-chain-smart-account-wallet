import React from 'react'
import type { ResponseBadge } from '@/types/super-chain'
import type { BadgeRenderStrategy } from '../BadgeStrategyRenderer'
import { Box, Typography, SvgIcon } from '@mui/material'
import CheckCircleIcon from '@/public/images/common/check-circle.svg'
import Link from 'next/link'
import useSafeAddress from '@/hooks/useSafeAddress'

type VaultTier = { level: number; amountETH: string; days: number; label?: string }

class ETHVaultStrategy implements BadgeRenderStrategy {
  private tiers: VaultTier[]

  constructor(tiers?: VaultTier[]) {
    this.tiers = tiers ?? [
      { level: 1, amountETH: '0.01', days: 7 },
      { level: 2, amountETH: '0.05', days: 7 },
      { level: 3, amountETH: '0.1', days: 7 },
      { level: 4, amountETH: '1', days: 7 },
      { level: 5, amountETH: '1', days: 28 },
    ]
  }

  canRender(badge: any): boolean {
    try {
      if (badge?.badgeId !== undefined) return Number(badge.badgeId) === 26
      const name = badge?.metadata?.name?.toLowerCase() || ''
      const desc = badge?.metadata?.description?.toLowerCase() || ''
      return name.includes('vault') || name.includes('eth') || desc.includes('vault')
    } catch {
      return false
    }
  }

  formatTierLabel(badge: any, level: number, tier?: any): string | undefined {
    const t = this.tiers.find((x) => x.level === Number(level))
    if (t) return t.label ?? `Deposit ${t.amountETH} ETH for ${t.days} days`
    if (tier?.metadata?.minValue) return `Deposit ${tier.metadata.minValue} ETH`
    return undefined
  }

  renderDescription(_: ResponseBadge): React.ReactNode {
    const VaultDescription: React.FC = () => {
      const account = useSafeAddress()
      return (
        <Typography color="#75757A">
          Deposit ETH in the WETH{' '}
          <Link href={`/vaults?safe=oeth:${account}`} style={{ color: '#1976d2', textDecoration: 'underline' }}>
            Super Vaults
          </Link>
        </Typography>
      )
    }
    return <VaultDescription />
  }

  renderBadgeTiers(badge: ResponseBadge): React.ReactNode {
    const currentLevel = Number(badge.tier) || 0
    return (
      <>
        {this.tiers.map((t) => (
          <Box key={t.level}>
            <Box display="flex" justifyContent="space-between" alignItems="center" paddingY="4px">
              <Typography color="#4B4B4E" fontSize="12px">
                {t.label ?? `Deposit ${t.amountETH} ETH for ${t.days} days`}
              </Typography>
              <SvgIcon
                inheritViewBox
                component={t.level <= currentLevel ? CheckCircleIcon : null}
                sx={{
                  color: t.level <= currentLevel ? '#A3E635' : 'grey',
                  fontSize: '16px',
                  width: '16px',
                  height: '16px',
                  border: t.level <= currentLevel ? 'none' : '1px dashed #E1E2EA',
                  borderRadius: '50%',
                }}
              />
            </Box>
          </Box>
        ))}
      </>
    )
  }
}

export { ETHVaultStrategy }
export default ETHVaultStrategy
