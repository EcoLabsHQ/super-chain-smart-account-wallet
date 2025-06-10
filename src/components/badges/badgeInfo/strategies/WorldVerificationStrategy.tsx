import React, { useState } from 'react'
import type { ResponseBadge } from '@/types/super-chain'
import type { BadgeRenderStrategy } from '../BadgeStrategyRenderer'
import { Box, Button, Dialog, DialogContent, DialogTitle, Divider, IconButton, Typography } from '@mui/material'
import { useQueryClient } from '@tanstack/react-query'
import useSafeAddress from '@/hooks/useSafeAddress'
import CloseIcon from '@mui/icons-material/Close'
import { uuidv4 } from '@walletconnect/utils'
import { ISuccessResult } from '@worldcoin/idkit'

class WorldIDVerificationStrategy implements BadgeRenderStrategy {
  canRender(badge: ResponseBadge): boolean {
    return badge.metadata.name === 'Worldcoin Verification'
  }

  render(badge: ResponseBadge): React.ReactNode {
    return <MemoizedWorldIDVerificationComponent badge={badge} />
  }
}

export { WorldIDVerificationStrategy }

export function WorldIDVerificationComponent({ badge }: { badge: ResponseBadge }) {
  const [isValidationModalOpen, setValidationModalOpen] = useState(false)
  const [isSuccessModalOpen, setSuccessModalOpen] = useState(false)
  const [userId] = useState<string | undefined>(uuidv4())
  const address = useSafeAddress()
  const queryClient = useQueryClient()

  const handleOpenModal = () => {
    setValidationModalOpen(true)
  }

  const handleCloseModal = () => {
    setValidationModalOpen(false)
  }

  const handleVerificationSuccess = () => {
    if (isValidationModalOpen) {
      queryClient.invalidateQueries({ queryKey: ['self-verification', address] })
      setValidationModalOpen(false)
      setSuccessModalOpen(true)
    }
  }

  const handleSuccessModalClose = () => {
    setSuccessModalOpen(false)
    window.dispatchEvent(new CustomEvent('claim-badges', { detail: { userId: userId?.toString() } }))
  }

  function onSuccess(result: ISuccessResult): void | Promise<void> {
    throw new Error('Function not implemented.')
  }

  return (
    <>
      {/* <IDKitWidget
        app_id="app_staging_7b1ab4e8a1f7e1e26a23b6040af1bded"
        action="worldcoin-badge-validation"
        signal="user_value"
        onSuccess={onSuccess}
        verification_level={VerificationLevel.Device}
      >
        {({ open }) => {
          return (
            <Button
              variant="contained"
              color="primary"
              onClick={open}
              sx={{ borderRadius: '6px', textTransform: 'none', fontWeight: 600, padding: '8px 24px', mt: 2, mb: 2 }}
            >
              Verify
            </Button>
          )
        }}
      </IDKitWidget> */}

      <Dialog
        open={isValidationModalOpen}
        onClose={handleCloseModal}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: '12px', p: 0, minWidth: 500 } }}
      >
        <Box display="flex" alignItems="center" justifyContent="space-between" px={3} pt="24px" pb="0px">
          <DialogTitle sx={{ fontWeight: 600, fontSize: '24px', fontFamily: 'Inter', p: 0 }}>
            Self Verification
          </DialogTitle>
          <IconButton onClick={handleCloseModal}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Divider sx={{ mt: '24px', mb: '10px' }} />
        <DialogContent sx={{ textAlign: 'center', px: 3 }}>
          <Box display="flex" justifyContent="center" mb="24px"></Box>

          <Typography variant="body2" color="textSecondary">
            Scan this QR code to verify your identity through{' '}
            <Typography
              component="a"
              href="https://self.xyz/"
              target="_blank"
              rel="noopener noreferrer"
              sx={{ color: '#476520', fontWeight: 500, textDecorationLine: 'underline' }}
            >
              self.xyz
            </Typography>
            .
          </Typography>
          <Typography variant="caption" color="textSecondary" sx={{ fontStyle: 'italic', mb: '24px' }}>
            We&apos;ll only confirm your Self verification status and validate your country.
          </Typography>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isSuccessModalOpen}
        onClose={handleSuccessModalClose}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: '12px', p: 0, minWidth: 392 } }}
      >
        <Box display="flex" justifyContent="center" pt="24px" px="24px">
          <DialogTitle
            sx={{
              fontWeight: 600,
              fontSize: '24px',
              fontFamily: 'Inter',
              p: 0,
              textAlign: 'center',
            }}
          >
            Self Verification Successful
          </DialogTitle>
        </Box>

        <DialogContent sx={{ textAlign: 'center', px: '24px', pt: '24px', pb: '24px' }}>
          <Typography
            sx={{
              mb: '24px',
              color: '#75757A',
              textAlign: 'center',
              fontFamily: 'Inter',
              fontSize: '14px',
              fontStyle: 'normal',
              fontWeight: 400,
              lineHeight: '20px',
            }}
          >
            Your country flag is now visible on your profile and the leaderboard.
          </Typography>

          <Button
            fullWidth
            variant="contained"
            onClick={handleSuccessModalClose}
            sx={{
              mx: 0,
              backgroundColor: '#000',
              color: '#fff',
              textTransform: 'none',
              borderRadius: '8px',
              padding: '10px 24px',
              ':hover': { backgroundColor: '#222' },
            }}
          >
            Claim Badge
          </Button>
        </DialogContent>
      </Dialog>
    </>
  )
}
export const MemoizedWorldIDVerificationComponent = React.memo(WorldIDVerificationComponent)
