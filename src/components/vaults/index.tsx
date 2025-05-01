import { Box, Button, Card, CardContent, Divider, Grid, Skeleton, Stack, SvgIcon, Typography } from '@mui/material'
import React, { useState } from 'react'
import USDC_OP from '@/public/images/vaults/icons/USDC-OP.svg'
import USDT_OP from '@/public/images/vaults/icons/USDT-OP.svg'
import ETH_OP from '@/public/images/vaults/icons/ETH-OP.svg'
import Compound from '@/public/images/vaults/protocols/Compound.svg'
import { useQuery } from '@tanstack/react-query'
import { BACKEND_BASE_URI } from '@/config/constants'
import axios from 'axios'
import useSafeAddress from '@/hooks/useSafeAddress'
import DepositModal from './DepositModal'
import WithdrawModal from './WithdrawModal'
import { Address } from 'viem'
import SuccessModal from './SuccessModal'

interface Vault {
  comet: string
  rewards_apr: string
  asset: string
  symbol: string
  decimals: number
  image: string | null
  interest_apr: string
  balance?: number
  deprecated?: boolean
}

function VaultCard({
  title,
  value,
  apy,
  icon,
  comet,
  tokenAddress,
  deprecated = false,
}: {
  title: string
  value: number
  apy: number
  icon: any
  comet: string
  tokenAddress: string
  deprecated?: boolean
}) {
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false)
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [depositAmount, setDepositAmount] = useState('')
  const [txHash, setTxHash] = useState('')
  const [newBalance, setNewBalance] = useState(value.toString())
  const [maxAmount, setMaxAmount] = useState(value)

  const handleOpenDepositModal = () => {
    setIsDepositModalOpen(true)
  }

  const handleCloseDepositModal = () => {
    setIsDepositModalOpen(false)
  }

  const handleOpenWithdrawModal = () => {
    setIsWithdrawModalOpen(true)
  }

  const handleCloseWithdrawModal = () => {
    setIsWithdrawModalOpen(false)
  }

  const handleCloseSuccess = () => {
    setShowSuccess(false)
    setDepositAmount('')
    setTxHash('')
  }

  const handleDepositSuccess = (amount: string, hash: string, balance: string) => {
    setDepositAmount(amount)
    setTxHash(hash)
    setNewBalance(balance)
    setMaxAmount(Number(balance))
    setShowSuccess(true)
    setIsDepositModalOpen(false)
  }

  const handleWithdrawSuccess = (amount: string, hash: string, balance: string) => {
    setDepositAmount(amount)
    setTxHash(hash)
    setNewBalance(balance)
    setMaxAmount(Number(balance))
    setShowSuccess(true)
    setIsWithdrawModalOpen(false)
  }

  return (
    <Grid item xs={4}>
      <Card variant="outlined" sx={{ p: 0 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box width={36} height={36} fontSize={36}>
              <SvgIcon component={icon} inheritViewBox alt={title} fontSize="inherit" width={36} height={36} />
            </Box>
            <Typography fontSize={18} fontWeight={600} fontFamily="Sora">
              {title}
            </Typography>
          </Box>
          <Box
            sx={{
              bgcolor: deprecated ? '#FFF4E5' : 'grey.100',
              px: 2,
              py: 0.5,
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '16px',
            }}
          >
            {deprecated ? (
              <Typography fontSize={14} color="warning.main" fontWeight="medium">
                Deprecated
              </Typography>
            ) : (
              <>
                <Typography fontSize={14}>
                  APY: <strong>{apy.toFixed(1)}%</strong>
                </Typography>
                <SvgIcon component={Compound} inheritViewBox alt="Compound" fontSize="inherit" width={16} height={16} />
              </>
            )}
          </Box>
        </Box>
        <Divider />

        <Box
          sx={{
            border: value > 0 ? (deprecated ? '1px dashed #ED6C02' : '1px dashed #1FC1BF') : '1px dashed #e0e0e0',
            borderRadius: 2,
            p: 3,
            m: 3,
            textAlign: 'center',
            bgcolor: value > 0 ? (deprecated ? '#FFF4E5' : '#E9F9F9') : 'transparent',
          }}
        >
          <Typography variant="body2" color="text.secondary" gutterBottom>
            My Balance
          </Typography>
          <Typography variant="h4" fontWeight="bold">
            ${value.toFixed(2)}
          </Typography>
        </Box>
        <Divider />

        <Box sx={{ display: 'flex', gap: 2, p: 2 }}>
          {value > 0 ? (
            deprecated ? (
              <Button fullWidth sx={{ borderRadius: 10, backgroundColor: '#F1F2F5' }} onClick={handleOpenWithdrawModal}>
                Withdraw
              </Button>
            ) : (
              <>
                <Button
                  fullWidth
                  sx={{ borderRadius: 10, backgroundColor: '#F1F2F5' }}
                  onClick={handleOpenWithdrawModal}
                >
                  Withdraw
                </Button>
                <Button variant="contained" fullWidth sx={{ borderRadius: 10 }} onClick={handleOpenDepositModal}>
                  Deposit
                </Button>
              </>
            )
          ) : (
            !deprecated && (
              <Button
                variant="contained"
                color="secondary"
                fullWidth
                sx={{ borderRadius: 10 }}
                onClick={handleOpenDepositModal}
              >
                Activate
              </Button>
            )
          )}
        </Box>
      </Card>

      {!deprecated && (
        <DepositModal
          open={isDepositModalOpen}
          onClose={handleCloseDepositModal}
          symbol={title}
          icon={icon}
          tokenAddress={tokenAddress as Address}
          supplyTokenAddress={comet as Address}
          vaultBalance={value.toString()}
          onSuccess={handleDepositSuccess}
        />
      )}

      <WithdrawModal
        open={isWithdrawModalOpen}
        onClose={handleCloseWithdrawModal}
        symbol={title}
        icon={icon}
        maxAmount={value}
        tokenAddress={tokenAddress as Address}
        supplyTokenAddress={comet as Address}
        onSuccess={handleWithdrawSuccess}
      />

      <SuccessModal
        open={showSuccess}
        onClose={handleCloseSuccess}
        amount={depositAmount}
        symbol={title}
        txHash={txHash}
        vaultBalance={newBalance}
        icon={icon}
        type={deprecated ? 'withdraw' : 'deposit'}
      />
    </Grid>
  )
}

function Vaults() {
  const address = useSafeAddress()
  const { data: vaults, isLoading: isLoadingVaults } = useQuery<Vault[]>({
    queryKey: ['vaults', address],
    queryFn: async () => {
      const response = await axios.get(`${BACKEND_BASE_URI}/vaults/${address}`)
      return response.data
    },
    enabled: !!address,
  })

  if (isLoadingVaults || !vaults) {
    return <Skeleton variant="rectangular" height={100} />
  }

  const totalDeposits = vaults.reduce((sum: number, vault: Vault) => sum + (Number(vault.balance) || 0), 0)

  const totalWeightedApy = vaults.reduce((sum: number, vault: Vault) => {
    const totalApr = Number(vault.rewards_apr) + Number(vault.interest_apr)
    return sum + (Number(vault.balance) || 0) * totalApr
  }, 0)
  const averageApy = totalDeposits > 0 ? totalWeightedApy / totalDeposits : 0

  const getVaultIcon = (symbol: string) => {
    switch (symbol) {
      case 'USDC':
        return USDC_OP
      case 'USDT':
        return USDT_OP
      case 'WETH':
        return ETH_OP
      default:
        return null
    }
  }

  return (
    <Stack gap={2} p={1} sx={{ width: '100%' }}>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Vaults
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <Card variant="outlined">
            <CardContent>
              <Stack gap={1}>
                <Typography fontSize="16px" color="GrayText">
                  Total Vault Deposits
                </Typography>
                <Typography fontSize="24px" fontWeight={700}>
                  ${totalDeposits.toFixed(2)}
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6}>
          <Card variant="outlined">
            <CardContent>
              <Stack gap={1}>
                <Typography fontSize="16px" color="GrayText">
                  Average APY
                </Typography>
                <Typography fontSize="24px" fontWeight={700}>
                  {averageApy.toFixed(2)}%
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <Grid container spacing={2}>
        {vaults.map((vault) => {
          const icon = getVaultIcon(vault.symbol)
          if (!icon) return null

          return (
            <VaultCard
              key={vault.comet}
              title={vault.symbol}
              value={10}
              apy={(Number(vault.rewards_apr) + Number(vault.interest_apr)) * 100}
              icon={icon}
              comet={vault.comet}
              tokenAddress={vault.asset}
              deprecated={vault.deprecated}
            />
          )
        })}
      </Grid>
    </Stack>
  )
}

export default Vaults
