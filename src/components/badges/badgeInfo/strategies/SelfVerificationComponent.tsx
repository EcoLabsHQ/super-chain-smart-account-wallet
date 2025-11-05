import React, { useEffect, useState } from 'react'
import { Box, Button, Dialog, DialogContent, DialogTitle, Divider, IconButton, Stack, Typography } from '@mui/material'
import axios from 'axios'
import { BACKEND_BASE_URI } from '@/config/constants'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import useSafeAddress from '@/hooks/useSafeAddress'
import CloseIcon from '@mui/icons-material/Close'
import { ResponseBadge } from '@/types/super-chain'
import { uuidv4 } from '@walletconnect/utils'
import dynamic from 'next/dynamic'
import CountryFlag from '@/components/CountryFlag'
import { useClaimBadges } from '@/components/badges/claimBadges'
import QrCodeIcon from '@/public/images/common/qr_code.svg'
import { ENV } from '@/features/superChain/constants'

const SelfQRcodeWrapper = dynamic(() => import('@selfxyz/qrcode').then((mod) => mod.SelfQRcodeWrapper), { ssr: false })

export function SelfVerificationComponent({ badge }: { badge: ResponseBadge }) {
  const [isValidationModalOpen, setValidationModalOpen] = useState(false)
  const [isSuccessModalOpen, setSuccessModalOpen] = useState(false)
  const [selfApp, setSelfApp] = useState<any>(null)
  const [userId] = useState<string | undefined>(uuidv4())
  const address = useSafeAddress()
  const queryClient = useQueryClient()
  const { claim, isPending } = useClaimBadges()

  useEffect(() => {
    const init = async () => {
      const { SelfAppBuilder } = await import('@selfxyz/qrcode')

      const app = new SelfAppBuilder({
        appName: 'Super Accounts',
        scope: 'super-accounts',
        endpoint:
          ENV == 'production'
            ? 'https://scsa-backend-staging.up.railway.app/api/self/verify'
            : 'https://scsa-backend-staging.up.railway.app/api/self/verify',
        endpointType: 'https',
        logoBase64: 'https://account.superchain.eco/images/logo.png',
        userId, //address,
        userIdType: 'uuid',
        version: 2,
        disclosures: {
          nationality: true,
        },
      }).build()

      setSelfApp(app)
    }

    if (userId) {
      init()
    }
  }, [userId])

  const handleOpenModal = () => {
    setValidationModalOpen(true)
  }

  const handleCloseModal = () => {
    setValidationModalOpen(false)
  }

  const handleVerificationSuccess = () => {
    if (isValidationModalOpen && data?.check) {
      // keep cache key consistent with useQuery
      queryClient.invalidateQueries({ queryKey: ['self-verification', userId] })

      setValidationModalOpen(false)
      setSuccessModalOpen(true)
    }
  }

  const handleSuccessModalClose = () => {
    setSuccessModalOpen(false)
    claim({ userId: userId?.toString() })
  }

  const { data } = useQuery({
    queryKey: ['self-verification', userId],
    refetchInterval: (query) => {
      if (query.state.data?.check) return false
      console.log('Refetch:', query.state.data)
      if (isValidationModalOpen || query.state == undefined) return 1000
      return false
    },
    queryFn: async () => (await axios.get(`${BACKEND_BASE_URI}/self/check?userId=${userId}&account=${address}`)).data,
    enabled: !!userId,
  })

  useEffect(() => {
    if (data?.check) handleVerificationSuccess()
  }, [data])

  console.debug('Self Verification Data:')

  if (!address || !selfApp) return null

  return (
    <>
      <Button
        variant="contained"
        color="primary"
        onClick={handleOpenModal}
        sx={{
          borderRadius: '12px',
          padding: '8px 10px 8px 10px',
          textTransform: 'none',
          fontWeight: 600,
          fontSize: '14px',
          mt: 2,
          mb: 2,
        }}
        disabled={!data || data?.check}
      >
        {!data?.check && <QrCodeIcon style={{ width: '16px', height: '16px', marginRight: '4px' }} />}
        {data?.check ? 'Verified' : 'Verify Now'}
      </Button>

      <Dialog
        open={isValidationModalOpen}
        onClose={handleCloseModal}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: '12px', p: 0, minWidth: 392 } }}
      >
        <Box display="flex" alignItems="center" justifyContent="space-between" px={3} py={3}>
          <DialogTitle
            sx={{
              fontWeight: 600,
              fontSize: '24px',
              fontFamily: 'Inter',
              p: 0,
              m: 0,
              lineHeight: '32px',
            }}
          >
            Self Verification
          </DialogTitle>

          <IconButton
            onClick={handleCloseModal}
            sx={{
              width: 36,
              height: 36,
              backgroundColor: '#F1F2F5',
              borderRadius: '12px',
              p: 0,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              '&:hover': { backgroundColor: '#E4E5E9' },
            }}
          >
            <CloseIcon sx={{ width: 16, height: 16, color: '#4B4B4E' }} />
          </IconButton>
        </Box>

        <Divider sx={{ m: 0 }} />

        <DialogContent sx={{ p: 3 }}>
          <Stack spacing={3} alignItems="center">
            <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
              {selfApp ? (
                <SelfQRcodeWrapper
                  selfApp={selfApp}
                  onSuccess={handleVerificationSuccess}
                  size={300} // cabe: 392 - (24*2) = 344px de ancho útil
                  onError={() => console.error('Error generating QR code')}
                />
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Loading QR code...
                </Typography>
              )}
            </Box>

            <Typography
              variant="body2"
              color="text.secondary"
              align="center"
              sx={{ a: { color: '#4B4B4E', fontWeight: 500, textDecoration: 'underline' } }}
            >
              Scan this QR code to verify your identity through{' '}
              <Typography
                component="a"
                href="https://self.xyz/"
                target="_blank"
                rel="noopener noreferrer"
                variant="body2"
              >
                self.xyz
              </Typography>
              .
            </Typography>
          </Stack>
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
          {data?.data && (
            <Box display="flex" justifyContent="center" mb="24px">
              <CountryFlag alpha3={data.data?.nationality ?? ''} size={75} />
            </Box>
          )}

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
            disabled={isPending}
            sx={{
              mx: 0,
              backgroundColor: '#000',
              color: '#fff',
              textTransform: 'none',
              borderRadius: '12px',
              padding: '8px 10px 8px 10px',
              ':hover': { backgroundColor: '#222' },
            }}
          >
            {isPending ? 'Claiming…' : 'Claim Badge'}
          </Button>
        </DialogContent>
      </Dialog>
    </>
  )
}
export const MemoizedSelfVerificationComponent = React.memo(SelfVerificationComponent)
