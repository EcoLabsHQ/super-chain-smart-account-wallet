import { Box, Button, Card, CardContent, CardHeader, Divider, Grid, Stack, SvgIcon, Typography } from '@mui/material'
import React from 'react'
import USDC_OP from '@/public/images/vaults/icons/USDC-OP.svg'
import USDT_OP from '@/public/images/vaults/icons/USDT-OP.svg'
import ETH_OP from '@/public/images/vaults/icons/ETH-OP.svg'
import Compound from '@/public/images/vaults/protocols/Compound.svg'

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
  const vaults = [
    { title: 'USDC', value: 110.0, apy: 4.9, icon: USDC_OP },
    { title: 'ETH', value: 25.48, apy: 5.2, icon: ETH_OP },
    { title: 'USDT', value: 0.0, apy: 3.8, icon: USDT_OP },
  ]

  // Calcular el total de depósitos
  const totalDeposits = vaults.reduce((sum, vault) => sum + vault.value, 0)

  // Calcular el APY promedio (ponderado por el valor de los depósitos)
  const totalWeightedApy = vaults.reduce((sum, vault) => sum + vault.value * vault.apy, 0)
  const averageApy = totalDeposits > 0 ? totalWeightedApy / totalDeposits : 0

  return (
    <Stack gap={2} p={1} sx={{ width: '100%' }}>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Vaults
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <Card variant="outlined">
            <CardHeader title="Total Vault Deposits" />
            <CardContent>
              <Typography variant="h3" fontWeight={700}>
                ${totalDeposits.toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6}>
          <Card variant="outlined">
            <CardHeader title="Average APY" />
            <CardContent>
              <Typography variant="h3" fontWeight={700}>
                {averageApy.toFixed(2)}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <Grid container spacing={2}>
        {vaults.map((vault) => (
          <VaultCard key={vault.title} title={vault.title} value={vault.value} apy={vault.apy} icon={vault.icon} />
        ))}
      </Grid>
    </Stack>
  )
}

export default Vaults
