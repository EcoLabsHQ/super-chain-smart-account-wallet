import type { ResponseBadge } from '@/types/super-chain'
import type { BadgeRenderStrategy } from '../BadgeStrategyRenderer'
import { AuthKitProvider, useSignIn, useProfile } from '@farcaster/auth-kit'
import '@farcaster/auth-kit/styles.css'
import QRCode from 'qrcode.react'
import React, { useEffect, useState } from 'react'
import useSafeAddress from '@/hooks/useSafeAddress'
import { Box, Button, Dialog, DialogContent, DialogTitle, Divider, IconButton, Typography } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'

class FarcasterLinkStrategy implements BadgeRenderStrategy {
  canRender(badge: ResponseBadge): boolean {
    return badge.metadata.name === 'Farcaster Link'
  }

  render(badge: ResponseBadge): React.ReactNode {
    return <MemoizedFarcasterVerificationComponent badge={badge} />
  }
}

export { FarcasterLinkStrategy }

const appId = 'TU_APP_ID_AQUI' // tu App ID real de Farcaster
const domain = 'tudominio.com' // tu dominio configurado en AuthKit
const redirectUri = 'https://TU_DOMINIO/api/auth/farcaster-callback' // tu backend callback

export function FarcasterVerificationComponent({ badge }: { badge: ResponseBadge }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const address = useSafeAddress()

  const handleOpen = () => setIsDialogOpen(true)
  const handleClose = () => setIsDialogOpen(false)

  // Si el usuario ya está autenticado simplemente no mostramos el botón
  return (
    <AuthKitProvider
      config={{
        domain,
        siweUri: redirectUri,
        rpcUrl: 'https://hub.farcaster.network',
      }}
    >
      <Button
        variant="contained"
        color="primary"
        onClick={handleOpen}
        sx={{
          borderRadius: '999px',
          backgroundColor: '#000',
          color: '#fff',
          textTransform: 'none',
          fontWeight: 600,
          padding: '12px 24px',
          ':hover': { backgroundColor: '#222' },
        }}
      >
        Link Account
      </Button>

      <FarcasterQRCodeDialog open={isDialogOpen} onClose={handleClose} />
    </AuthKitProvider>
  )
}

function FarcasterQRCodeDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { isConnected, isError, isPolling, url, isSuccess, data } = useSignIn({
    onSuccess: (data) => {
      console.log('✅ Login success:', data)
      // Aquí puedes llamar a tu backend para vincular el FID con la cuenta wallet
    },
  })

  const profile = useProfile()

  useEffect(() => {
    if (profile.isAuthenticated) {
      console.log('✅ Profile authenticated:', profile.profile)
      onClose()
    }
  }, [profile.isAuthenticated])

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{ sx: { borderRadius: '12px', p: 0, minWidth: 400 } }}
    >
      <Box display="flex" alignItems="center" justifyContent="space-between" px={3} pt="24px" pb="0px">
        <DialogTitle sx={{ fontWeight: 600, fontSize: '24px', fontFamily: 'Inter', p: 0 }}>
          Scan to Link Accounts
        </DialogTitle>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </Box>

      <Divider sx={{ mt: '24px', mb: '10px' }} />

      <DialogContent sx={{ textAlign: 'center', px: 3 }}>
        {!isConnected && (
          <>
            <Box display="flex" justifyContent="center" mb="24px">
              <QRCode value={url ?? ''} size={256} />
            </Box>
            <Typography variant="body2" color="textSecondary">
              Scan this QR code with the Camera app on your phone to connect your Super Account with your Farcaster
              profile.
            </Typography>
          </>
        )}

        {isPolling && (
          <Typography variant="body2" color="textSecondary">
            Generating QR code...
          </Typography>
        )}

        {isError && (
          <Typography variant="body2" color="error">
            An error occurred. Please try again.
          </Typography>
        )}
      </DialogContent>
    </Dialog>
  )
}

export const MemoizedFarcasterVerificationComponent = React.memo(FarcasterVerificationComponent)
