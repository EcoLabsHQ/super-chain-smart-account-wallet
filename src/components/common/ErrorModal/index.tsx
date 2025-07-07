import React from 'react'
import { Box, Button, Dialog, Link, Stack, SvgIcon, Typography } from '@mui/material'
import SuperChainBrokenStart from '@/public/images/common/superchain-star-broken.svg'
import css from './styles.module.css'

function FailedTxnModal({
  open,
  onClose,
  handleRetry,
  errorDetail,
}: {
  open: boolean
  onClose: () => void
  handleRetry: () => void
  errorDetail: string
}) {
  const handleCopyError = () => {
    if (errorDetail) {
      navigator.clipboard.writeText(errorDetail)
    }
  }
  return (
    <Dialog className={css.container} open={open} onClose={onClose}>
      <Box
        display="flex"
        flexDirection="column"
        gap="20px"
        padding="36px 24px 36px 24px"
        justifyContent="center"
        alignItems="center"
        fontSize="64px"
      >
        <Typography fontSize={24} fontWeight={600}>
          Error occurred
        </Typography>
        <Typography color="GrayText">Something went wrong during the transaction.</Typography>

        <SvgIcon component={SuperChainBrokenStart} inheritViewBox fontSize="inherit" />
        {errorDetail && (
          <Link
            component="button"
            onClick={handleCopyError}
            fontSize={12}
            color="text.secondary"
            sx={{ mt: 1, textDecoration: 'underline' }}
          >
            Click to copy error detail
          </Link>
        )}
      </Box>
      <Stack spacing={1} className={css.outsideButtonContainer} direction="row">
        <Button fullWidth onClick={onClose} variant="contained">
          Return to dashboard
        </Button>
        <Button onClick={handleRetry} fullWidth color="secondary" variant="contained">
          Retry
        </Button>
      </Stack>
    </Dialog>
  )
}

export default FailedTxnModal
