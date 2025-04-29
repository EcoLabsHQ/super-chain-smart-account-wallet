import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  Skeleton,
  Stack,
  SvgIcon,
  Typography,
} from '@mui/material'
import React from 'react'
import USDC_OP from '@/public/images/vaults/icons/USDC-OP.svg'
import USDT_OP from '@/public/images/vaults/icons/USDT-OP.svg'
import ETH_OP from '@/public/images/vaults/icons/ETH-OP.svg'
import Compound from '@/public/images/vaults/protocols/Compound.svg'
import { useQuery } from '@tanstack/react-query'
import { BACKEND_BASE_URI } from '@/config/constants'
import axios from 'axios'
import useSafeAddress from '@/hooks/useSafeAddress'

interface Vault {
  comet: string
  rewards_apr: string
  asset: string
  symbol: string
  decimals: number
  image: string | null
  interest_apr: string
  balance?: number
}

function VaultCard({ title, value, apy, icon }: { title: string; value: number; apy: number; icon: any }) {
  return (
    <Grid item xs={4}>
      <Card variant="outlined" sx={{ p: 0 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* Aquí puedes agregar el logo específico del token */}
            <Box width={36} height={36} fontSize={36}>
              <SvgIcon component={icon} inheritViewBox alt={title} fontSize="inherit" width={36} height={36} />
            </Box>
            <Typography fontSize={18} fontWeight={600} fontFamily="Sora">
              {title}
            </Typography>
          </Box>
          <Box
            sx={{
              bgcolor: 'grey.100',
              px: 2,
              py: 0.5,
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '16px',
            }}
          >
            <Typography fontSize={14}>
              APY: <strong>{apy.toFixed(1)}%</strong>
            </Typography>
            <SvgIcon component={Compound} inheritViewBox alt="Compound" fontSize="inherit" width={16} height={16} />
          </Box>
        </Box>
        <Divider />

        <Box
          sx={{
            border: value > 0 ? '1px dashed #1FC1BF' : '1px dashed #e0e0e0',
            borderRadius: 2,
            p: 3,
            m: 3,
            textAlign: 'center',
            bgcolor: value > 0 ? '#E9F9F9' : 'transparent',
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
            <>
              <Button fullWidth sx={{ borderRadius: 10, backgroundColor: '#F1F2F5' }}>
                Withdraw
              </Button>
              <Button variant="contained" fullWidth sx={{ borderRadius: 10 }}>
                Deposit
              </Button>
            </>
          ) : (
            <Button variant="contained" color="secondary" fullWidth sx={{ borderRadius: 10 }}>
              Activate
            </Button>
          )}
        </Box>
      </Card>
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

  // Calcular el total de depósitos
  const totalDeposits = vaults.reduce((sum: number, vault: Vault) => sum + (Number(vault.balance) || 0), 0)

  // Calcular el APY promedio (ponderado por el valor de los depósitos)
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
              value={Number(vault.balance) || 0}
              apy={(Number(vault.rewards_apr) + Number(vault.interest_apr)) * 100}
              icon={icon}
            />
          )
        })}
      </Grid>
    </Stack>
  )
}

export default Vaults
