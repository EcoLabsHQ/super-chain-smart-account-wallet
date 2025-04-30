import React, { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  InputAdornment,
  Link,
  Stack,
  Divider,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import { SvgIcon } from '@mui/material'
import useCompound from '@/hooks/compound/useCompound'
import { useMutation } from '@tanstack/react-query'
import { Address, erc20Abi } from 'viem'
import axios from 'axios'
import { BACKEND_BASE_URI } from '@/config/constants'
import useSafeAddress from '@/hooks/useSafeAddress'

interface DepositModalProps {
  open: boolean
  onClose: () => void
  symbol: string
  icon: any
  maxAmount?: number
  tokenAddress: Address
  supplyTokenAddress: Address
}

function DepositModal({
  open,
  onClose,
  symbol,
  icon,
  maxAmount = 0,
  tokenAddress,
  supplyTokenAddress,
}: DepositModalProps) {
  const address = useSafeAddress()
  const { getCompoundDepositCallable, getCompoundWithdrawCallable } = useCompound()
  const [amount, setAmount] = useState<string>('')
  const { mutate: deposit, isPending: isDepositing } = useMutation({
    mutationFn: async () => {
      const depositCallable = getCompoundDepositCallable(tokenAddress, supplyTokenAddress)
      console.debug('depositCallable', depositCallable)
      const tx = await depositCallable.callContract(amount)
      console.debug('tx', tx)
      await axios.post(`${BACKEND_BASE_URI}/vaults${address}/refresh`)
      console.debug('refreshed')
      return tx
    },
  })

  const handleSetMax = () => {
    setAmount(maxAmount.toString())
  }

  const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    if (value === '' || !isNaN(Number(value))) {
      setAmount(value)
    }
  }

  const handleDeposit = () => {
    deposit()
    onClose()
  }

  const handleWithdraw = async () => {
    const withdrawCallable = getCompoundWithdrawCallable(tokenAddress, supplyTokenAddress)

    const tx = await withdrawCallable.callContract(amount)
    console.debug('tx', tx)
    await axios.post(`${BACKEND_BASE_URI}/vaults${address}/refresh`)
    console.debug('refreshed')
    onClose()
  }

  const isValidAmount = Boolean(amount) && Number(amount) >= 1

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: '24px' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Box width={24} height={24} fontSize="24px">
            <SvgIcon component={icon} inheritViewBox fontSize="inherit" width={24} height={24} />
          </Box>
          <Typography fontSize="24px" fontWeight="bold">
            {symbol} Vault
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        <Box padding="24px" display="flex" flexDirection="column" gap="8px">
          <Typography variant="subtitle1" gutterBottom>
            Deposit
          </Typography>
          <Box
            display="flex"
            flexDirection="column"
            gap="8px"
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: '12px',
              p: '12px',
            }}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <TextField
                value={amount}
                onChange={handleAmountChange}
                variant="standard"
                type="number"
                inputMode="numeric"
                placeholder="0.00"
                InputProps={{
                  disableUnderline: true,
                  sx: {
                    fontSize: '24px',
                    fontWeight: 500,
                    '& input': {
                      p: 0,
                      '&::-webkit-inner-spin-button, &::-webkit-outer-spin-button': {
                        '-webkit-appearance': 'none',
                        margin: 0,
                      },
                      '-moz-appearance': 'textfield',
                    },
                  },
                }}
              />
              <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Box width={24} height={24} fontSize="24px">
                  <SvgIcon component={icon} inheritViewBox fontSize="inherit" width={24} height={24} />
                </Box>
                <Typography fontSize="16px" fontWeight="bold">
                  {symbol}
                </Typography>
              </Box>
            </Stack>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mt={1}>
              <Typography color="text.secondary" fontSize="14px">
                ${(Number(amount) || 0).toFixed(2)}
              </Typography>
              <Typography color="text.secondary" fontSize="14px">
                Available: {maxAmount}{' '}
                <Button
                  onClick={handleSetMax}
                  size="small"
                  sx={{
                    minWidth: 'auto',
                    p: 0,
                    ml: 0.5,
                    textTransform: 'uppercase',
                    fontWeight: 600,
                    fontSize: '12px',
                    textDecoration: 'underline',
                  }}
                >
                  MAX
                </Button>
              </Typography>
            </Stack>
          </Box>
        </Box>
        <Divider />
        <Box padding="24px" display="flex" flexDirection="column" gap="8px">
          <Button
            variant="contained"
            fullWidth
            disabled={!isValidAmount}
            sx={{ p: '16px', borderRadius: '100px', color: 'white !important' }}
            onClick={handleDeposit}
          >
            Deposit
          </Button>
          <Button
            variant="contained"
            fullWidth
            disabled={!isValidAmount}
            sx={{ p: '16px', borderRadius: '100px', color: 'white !important' }}
            onClick={handleWithdraw}
          >
            Withdraw
          </Button>

          <Box display="flex" flexDirection="column" gap="4px">
            {!isValidAmount && (
              <Typography color="error" fontSize="14px" textAlign="center">
                Min. deposit: $100 to activate this vault.
              </Typography>
            )}

            <Typography fontSize="14px" textAlign="center" color="text.secondary">
              Low on {symbol}?{' '}
              <Link href="#" underline="always" sx={{ cursor: 'pointer' }}>
                Top up balance
              </Link>
            </Typography>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  )
}

export default DepositModal
