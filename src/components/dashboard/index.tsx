import useSafeInfo from '@/hooks/useSafeInfo'
import { useEffect, type ReactElement } from 'react'
import dynamic from 'next/dynamic'
import { Box, Grid } from '@mui/material'
import Overview from '@/components/dashboard/Overview/Overview'
import CreationDialog from '@/components/dashboard/CreationDialog'
import { useRouter } from 'next/router'
import { CREATION_MODAL_QUERY_PARAM } from '../new-safe/create/logic'
import { useIsRecoverySupported } from '@/features/recovery/hooks/useIsRecoverySupported'
import Balances from '@/pages/_balances'
import SuperChainEOAS from '../common/SuperChainEOAS'
import EOAAddedModal from './EOAAddedModal'
import { ADD_OWNER_MODAL_QUERY_PARAM } from '../accept-invite/alert-modal'
import useWallet from '@/hooks/wallets/useWallet'

import WrongNetworkModal from './WrongNetworkModal'
import useIsWrongChain from '@/hooks/useIsWrongChain'
import { useAppSelector } from '@/store'
import { selectUndeployedSafe } from '@/store/slices'
import ActivatingSuperAccount from './ActivatingSuperAccount'
const RecoveryHeader = dynamic(() => import('@/features/recovery/components/RecoveryHeader'))

const Dashboard = (): ReactElement => {
  const router = useRouter()
  const wallet = useWallet()

  const { safe, safeLoaded, safeLoading, safeAddress } = useSafeInfo()
  const { [CREATION_MODAL_QUERY_PARAM]: showCreationModal = '' } = router.query
  const { [ADD_OWNER_MODAL_QUERY_PARAM]: showEOAAddedModal = '' } = router.query
  const isWrongChain = useIsWrongChain()
  const supportsRecovery = useIsRecoverySupported()
  const undeployedSafe = useAppSelector((state) => selectUndeployedSafe(state, safe.chainId, safeAddress))

  const isActivating = !!undeployedSafe
  useEffect(() => {
    if (!safeLoaded || safeLoading) return
    if (!wallet) {
      router.push('/')
    } else {
      const isOwner = safe.owners.find((owner) => owner.value.toLowerCase() == wallet?.address.toLowerCase())
      if (!isOwner) {
        router.push('/')
      }
    }
  }, [wallet])

  if (isActivating) return <ActivatingSuperAccount />

  return (
    <main style={{ padding: '0px' }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - var(--header-height))', p: 3 }}>
        <Box sx={{ mb: 5 }}>
          <Overview />
        </Box>

        {safe.deployed && (
          <Grid container spacing={3} flex={1}>
            <Grid item xs={12} lg={8}>
              <Balances />
            </Grid>

            <Grid item xs={12} lg={4}>
              <SuperChainEOAS />
            </Grid>
          </Grid>
        )}
      </Box>
      {showCreationModal ? <CreationDialog /> : null}
      {showEOAAddedModal ? <EOAAddedModal /> : null}
      {isWrongChain && <WrongNetworkModal />}
    </main>
  )
}

export default Dashboard
