import {
  Box,
  Button,
  Checkbox,
  Divider,
  Grid,
  InputAdornment,
  MenuItem,
  Select,
  SelectChangeEvent,
  SvgIcon,
  TextField,
  Typography,
} from '@mui/material'
import React, { useEffect, useState } from 'react'

import SearchIcon from '@/public/images/common/search.svg'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import useSafeInfo from '@/hooks/useSafeInfo'
import badgesService from '@/features/superChain/services/badges.service'
import type { Address } from 'viem'
import ClaimModal from '../modals/ClaimModal'
import LevelUpModal from '../modals/LevelUpModal'
import { useRouter } from 'next/router'
import { AppRoutes } from '@/config/routes'
import LoadingModal from '@/components/common/LoadingModal'
import Image from 'next/image'
import FailedTxnModal from '@/components/common/ErrorModal'
import { useAppSelector } from '@/store'
import { selectSuperChainAccount } from '@/store/superChainAccountSlice'
import { ResponseBadge, SuperChainAccount } from '@/types/super-chain'
import AutorenewIcon from '@mui/icons-material/Autorenew'
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank'
import CheckBoxIcon from '@mui/icons-material/CheckBox'
import { networks } from '..'

export type ClaimData = {
  totalPoints: number
  isLevelUp: boolean
  badgeUpdates: {
    badgeId: string
    level: number
    points: number
    previousLevel: number
  }[]
  updatedBadges: {
    badgeId: string
    metadata: {
      condition: string
    }
    badgeTiers: {
      metadata: {
        minValue: string
      }
    }[]
  }[]
}
function BadgesActions({
  claimable,
  setFilter,
  setNetworks,
  setCampaign,
  selectedCampaign,
  selectedNetworks,
  captchaToken,
}: {
  claimable: boolean
  setFilter: (filter: string) => void
  setNetworks: (networks: string[]) => void
  setCampaign: (campaign: string) => void
  selectedNetworks: string[]
  selectedCampaign: string
  captchaToken: string | null
}) {
  const { safeAddress, safeLoaded } = useSafeInfo()
  const { data: superChainAccount } = useAppSelector(selectSuperChainAccount)
  const [captchaFailed, setcaptchaFailed] = useState<boolean>(false)

  const router = useRouter()
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false)
  const [claimData, setClaimData] = useState<ClaimData | null>(null)
  const [claimRequestBody, setClaimRequestBody] = useState<any | null>(null)

  const [isLevelUpModalOpen, setIsLevelUpModalOpen] = useState(false)
  const queryClient = useQueryClient()

  useEffect(() => {
    const timeout = setTimeout(() => {
      setcaptchaFailed(true)
    }, 10000)

    return () => clearTimeout(timeout)
  }, [captchaFailed])

  const { mutate, isPending, isError } = useMutation({
    mutationFn: async () => {
      return await badgesService.attestBadges(safeAddress as Address, captchaToken)
    },
    onError: (error) => {
      console.error(error)
    },
    onSuccess: (data) => {
      queryClient.cancelQueries({ queryKey: ['superChainAccount', safeAddress] })
      queryClient.cancelQueries({ queryKey: ['badges', safeAddress, safeLoaded] })
      queryClient.setQueryData(['superChainAccount', safeAddress], (old: SuperChainAccount) => {
        return {
          ...old,
          points: data.points,
        }
      })
      queryClient.setQueryData(['badges', safeAddress, safeLoaded], (old: { currentBadges: ResponseBadge[] }) => {
        const badgeUpdates = old.currentBadges.map((badge) => {
          const update = data.badgeUpdates.find((update: ResponseBadge) => update.badgeId === badge.badgeId)
          if (update) {
            return {
              ...badge,
              level: update.level,
              points: update.points,
              claimable: false,
            }
          }
          return badge
        })
        return {
          currentBadges: [...old.currentBadges, ...badgeUpdates],
        }
      })
      queryClient.refetchQueries({ queryKey: ['superChainAccount', safeAddress] })
      setClaimData(data)
      setIsClaimModalOpen(true)
    },
  })
  useEffect(() => {
    const handler = (event: Event) => {
      const customEvent = event as CustomEvent
      const data = customEvent.detail
      setClaimRequestBody(data ?? {})
      mutate()
    }

    window.addEventListener('claim-badges', handler)

    return () => {
      window.removeEventListener('claim-badges', handler)
    }
  }, [mutate])
  const handleCloseClaimModal = () => {
    setIsClaimModalOpen(false)
  }

  const handleCloseLevelUpModal = () => {
    setIsLevelUpModalOpen(false)
    router.push({ pathname: AppRoutes.home, query: { safe: router.query.safe } })
  }

  const handleLevelUp = () => {
    setIsClaimModalOpen(false)
    setIsLevelUpModalOpen(true)
  }

  const handleNetworksChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value
    setNetworks(typeof value === 'string' ? value.split(',') : value)
  }

  const handleCampaignChange = (event: SelectChangeEvent<string>) => {
    const value = event.target.value
    setCampaign(value)
  }

  return (
    <>
      <ClaimModal onLevelUp={handleLevelUp} data={claimData} open={isClaimModalOpen} onClose={handleCloseClaimModal} />
      <LevelUpModal
        open={isLevelUpModalOpen}
        level={Number(superChainAccount?.level)}
        onClose={handleCloseLevelUpModal}
      />
      <LoadingModal open={isPending} title="Claiming badges" />
      <FailedTxnModal open={isError} onClose={handleCloseLevelUpModal} handleRetry={() => mutate()} />
      <Grid container spacing={1} item>
        <Divider sx={{ mt: 1, mb: 2, width: '100%' }} />
        <Grid container spacing={2} item xs={12}>
          <Grid item xs={12} lg={3}>
            <TextField
              placeholder="Search"
              sx={{
                borderRadius: '20px',
                overflow: 'hidden',
                backgroundColor: '#F4F4F5',
                '& .MuiFilledInput-root': {
                  borderRadius: '20px',
                  backgroundColor: '#F4F4F5',
                  paddingX: '12px',
                  height: '34px',
                  '&:hover': {
                    backgroundColor: '#E0E0E0',
                  },
                  '&.Mui-focused': {
                    backgroundColor: '#FFFFFF',
                  },
                  '& input': {
                    padding: '4px 0',
                    '&::placeholder': {
                      color: 'black',
                      fontWeight: 'bold',
                      opacity: 1,
                    },
                  },
                },
              }}
              variant="filled"
              onChange={(e) => setFilter(e.target.value)}
              hiddenLabel
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SvgIcon component={SearchIcon} inheritViewBox color="primary" fontSize="small" />
                  </InputAdornment>
                ),
                disableUnderline: true,
              }}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} lg={4}>
            <Box display="flex" gap={2}>
              <Select
                fullWidth
                value={selectedCampaign}
                onChange={handleCampaignChange}
                displayEmpty
                renderValue={(selected) => (
                  <Box sx={{ fontWeight: 600, color: 'black' }}>{selected || 'All Campaigns'}</Box>
                )}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      borderRadius: '16px',
                    },
                  },
                }}
                sx={{
                  borderRadius: '25px',
                  backgroundColor: '#F4F4F5',
                  height: '34px',
                  border: '1px solid transparent',
                  boxShadow: 'none',
                  maxWidth: { xs: '100%', lg: '200px' },
                  lineHeight: '2em',
                  '& .MuiSelect-select': {
                    paddingX: '12px',
                    height: '34px',
                    display: 'flex',
                    alignItems: 'center',
                  },
                  '&:hover': {
                    backgroundColor: '#E0E0E0',
                  },
                  '&.Mui-focused': {
                    backgroundColor: '#FFFFFF',
                    border: '1px solid black',
                  },
                  '&:before, &:after': {
                    border: 'none !important',
                    display: 'none !important',
                  },
                  '& .MuiOutlinedInput-notchedOutline': {
                    border: 'none !important',
                  },
                }}
              >
                <MenuItem value="">
                  <Typography fontSize={14}>All Campaigns</Typography>
                </MenuItem>
                <MenuItem value="SuperStacks">
                  <Typography fontSize={14}>SuperStacks</Typography>
                </MenuItem>
                <MenuItem value="Lisk Surge">
                  <Typography fontSize={14}>Lisk Surge</Typography>
                </MenuItem>
              </Select>
              <Select
                multiple
                fullWidth
                value={selectedNetworks}
                onChange={handleNetworksChange}
                displayEmpty
                renderValue={(selected) => (
                  <Box sx={{ fontWeight: 600, color: 'black' }}>
                    {selected.length > 0 ? `${selected.length} selected` : 'Select networks'}
                  </Box>
                )}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      borderRadius: '16px',
                    },
                  },
                }}
                sx={{
                  borderRadius: '25px',
                  backgroundColor: '#F4F4F5',
                  height: '34px',
                  border: '1px solid transparent',
                  boxShadow: 'none',
                  maxWidth: { xs: '100%', lg: '200px' },
                  lineHeight: '2em',
                  '& .MuiSelect-select': {
                    paddingX: '12px',
                    height: '34px',
                    display: 'flex',
                    alignItems: 'center',
                  },
                  '&:hover': {
                    backgroundColor: '#E0E0E0',
                  },
                  '&.Mui-focused': {
                    backgroundColor: '#FFFFFF',
                    border: '1px solid black',
                  },
                  '&:before, &:after': {
                    border: 'none !important',
                    display: 'none !important',
                  },
                  '& .MuiOutlinedInput-notchedOutline': {
                    border: 'none !important',
                  },
                }}
              >
                {networks.map((net, idx) => (
                  <MenuItem key={net.value} value={net.value} divider>
                    <Box display="flex" justifyContent="space-between" alignItems="center" width="100%">
                      <Box display="flex" gap={1} alignItems="center">
                        <Image src={net.icon} alt={`${net.label} Logo`} width={20} height={20} />
                        <Typography fontSize={14}>{net.label}</Typography>
                      </Box>

                      <Checkbox
                        checked={selectedNetworks.includes(net.value)}
                        icon={<CheckBoxOutlineBlankIcon sx={{ fontSize: 18 }} />}
                        checkedIcon={<CheckBoxIcon sx={{ fontSize: 18 }} />}
                        sx={{
                          padding: 0,
                          color: '#999',
                          '&.Mui-checked': {
                            color: '#111',
                          },
                        }}
                      />
                    </Box>
                  </MenuItem>
                ))}
              </Select>
              <Box
                component="button"
                onClick={() => {
                  setFilter('')
                  setNetworks([])
                }}
                sx={{
                  borderRadius: '20px',
                  minWidth: '100px',
                  height: '34px',
                  padding: '12px',
                  backgroundColor: 'transparent',
                  color: 'black',
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  '&:hover': {
                    backgroundColor: '#E0E0E0',
                  },
                }}
              >
                Clear All
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} lg={5}>
            <Box display="flex" justifyContent="flex-end" width="100%">
              <Button
                fullWidth
                disabled={!claimable || isPending || (!captchaToken && !captchaFailed)}
                variant="contained"
                onClick={() => mutate()}
                endIcon={<SvgIcon component={AutorenewIcon} width={16} height={16} inheritViewBox color="inherit" />}
                sx={{
                  height: '34px',
                  borderRadius: '20px',
                  fontSize: '16px',
                  backgroundColor: 'black',
                  paddingX: '16px',
                  color: 'white',
                  maxWidth: { xs: '100%', lg: 'fit-content' },
                  '&:hover': {
                    backgroundColor: '#333',
                  },
                  '&.Mui-disabled': {
                    backgroundColor: '#EBECF1',
                    color: '#A0A0A6',
                  },
                }}
              >
                {isPending ? 'Loading' : 'Claim Badges'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Grid>
    </>
  )
}

export default BadgesActions
