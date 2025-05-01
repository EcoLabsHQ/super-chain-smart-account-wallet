import React, { useMemo, useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  Link,
  Stack,
  Divider,
  CircularProgress,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import { SvgIcon } from '@mui/material'
import useCompound from '@/hooks/compound/useCompound'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Address } from 'viem'
import axios from 'axios'
import { BACKEND_BASE_URI } from '@/config/constants'
import useSafeAddress from '@/hooks/useSafeAddress'
import useBalances from '@/hooks/useBalances'
import SuccessModal from './SuccessModal'
import useSuperChainAccount from '@/hooks/super-chain/useSuperChainAccount'

interface DepositModalProps {
  open: boolean
  onClose: () => void
  symbol: string
  icon: any
  tokenAddress: Address
  supplyTokenAddress: Address
  vaultBalance: string
  onSuccess: (amount: string, hash: string, balance: string) => void
}

function DepositModal({
  open,
  onClose,
  symbol,
  icon,
  tokenAddress,
  supplyTokenAddress,
  vaultBalance,
  onSuccess,
}: DepositModalProps) {
  const address = useSafeAddress()
  const { publicClient } = useSuperChainAccount()
  const { getCompoundDepositCallable } = useCompound()
  const queryClient = useQueryClient()
  const { balances, loading } = useBalances()
  const [amount, setAmount] = useState<string>('')
  const [showSuccess, setShowSuccess] = useState(false)
  const [txHash, setTxHash] = useState<string>('')
  const [newBalance, setNewBalance] = useState<string>('')
  const [isTouched, setIsTouched] = useState(false)

  const maxAmount = useMemo(() => {
    const token = balances.items.find((item) => item.tokenInfo.address === tokenAddress)
    if (!token) return 0
    const balance = token.balance
    const decimals = token.tokenInfo.decimals
    return balance ? Number(balance) / 10 ** decimals : 0
  }, [balances, tokenAddress])

  const { mutate: deposit, isPending: isDepositing } = useMutation({
    mutationFn: async () => {
      const depositCallable = getCompoundDepositCallable(tokenAddress, supplyTokenAddress)
      const tx = await depositCallable.callContract(amount)
      const hash = tx.toString()
      await publicClient.waitForTransactionReceipt({ hash: hash as `0x${string}` })
      const calculatedNewBalance = (Number(vaultBalance) + Number(amount)).toString()
      await axios.post(`${BACKEND_BASE_URI}/vaults/${address}/refresh`)
      setTxHash(hash)
      setNewBalance(calculatedNewBalance)
      onSuccess(amount, hash, calculatedNewBalance)
      setShowSuccess(true)
    },
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ['vaults', address] })
    },
  })

  const handleSetMax = () => {
    setAmount(maxAmount.toString())
  }

  const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    if (value === '' || !isNaN(Number(value))) {
      setAmount(value)
      setIsTouched(true)
    }
  }

  const handleDeposit = () => {
    if (isDepositing) return
    deposit()
  }

  const handleClose = () => {
    setAmount('')
    onClose()
  }

  const handleCloseSuccess = () => {
    setShowSuccess(false)
    setAmount('')
    setTxHash('')
    setNewBalance('')
  }

  const isValidAmount = Boolean(amount) && Number(amount) >= 0 && (Number(vaultBalance) > 0 || Number(amount) >= 100)

  return (
    <>
      <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: '24px' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Box width={24} height={24} fontSize="24px">
              <SvgIcon component={icon} inheritViewBox fontSize="inherit" width={24} height={24} />
            </Box>
            <Typography fontSize="24px" fontWeight="bold">
              {symbol} Vault
            </Typography>
          </Box>
          <IconButton onClick={handleClose} size="small">
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
              sx={{ p: '16px', borderRadius: '100px', color: 'white !important', display: 'flex', gap: 1 }}
              onClick={handleDeposit}
            >
              {isDepositing ? (
                <>
                  <CircularProgress color="inherit" size={24} />
                  <Typography fontSize="16px" fontWeight="bold">
                    Depositing...
                  </Typography>
                </>
              ) : (
                'Deposit'
              )}
            </Button>

            <Box display="flex" flexDirection="column" gap="4px">
              {!isValidAmount && isTouched && (
                <Typography color="error" fontSize="14px" textAlign="center">
                  {Number(vaultBalance) === 0
                    ? 'Min. deposit: $100 to activate this vault.'
                    : 'Please enter a valid amount.'}
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

      <SuccessModal
        open={showSuccess}
        onClose={handleCloseSuccess}
        amount={amount}
        symbol={symbol}
        icon={icon}
        txHash={txHash}
        vaultBalance={newBalance}
        type="deposit"
      />
    </>
  )
}

export default DepositModal
