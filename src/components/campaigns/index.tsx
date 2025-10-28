import { BACKEND_BASE_URI } from '@/config/constants'
import { Box, Button, Card, Skeleton, Stack, SvgIcon, Typography } from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import React, { useState } from 'react'
import useSafeAddress from '@/hooks/useSafeAddress'
import ArrowRightIcon from '@/public/images/common/arrow_right_alt.svg'
import CalendarIcon from '@/public/images/common/calendar-gray.svg'
import NetworkChip from '../badges/networkChip'
import { tokens } from '@/config/tokens'
import { useRouter } from 'next/router'
import { AppRoutes } from '@/config/routes'
import Image from 'next/image'
export interface Campaign {
  claimed: boolean
  id: string
  name: string
  description: string
  banner: string
  network: string[]
  participate_description: string
  campaign_link: string
  myPoints: number
  my_points: { id: number; points: number }[]
  boosts: Array<{
    type: string
    level?: number
    boostPercent: number
    description: string
    currentLevel?: number
    maxLevel?: number
    name?: string
    image?: string
    minLevel?: number
    applies: boolean
  }>
  totalBoost: number
  campaign_badges: Array<CampaignBadge>
  more_info: string
  distributed_points: number
  can_claim: boolean
  max_claim_date: Date
  campaign_reward: { symbol: string; amount: number; decimals: number; token: string }
  claimable_reward: { symbol: string; amount: string; decimals: number; token: string }
  start_date: string | Date
  end_date: string | Date
  airdrop_condition_id: number
}

export interface CampaignBadge {
  id: string
  type: string
  badgeName: string
  description: string
  currentLevel: number
  maxLevel: number
  image: string
  tokenBadge?: boolean
  season?: number
  completed?: boolean
  currentPoints: number
  maxPoints: number
}

// utils (arriba del componente o en un helper)
const formatClaimBy = (value?: string | Date) => {
  if (!value) return '--'
  const d = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(d.getTime())) return '--'
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export const formatAmount = (amount?: number): string => {
  // si amount es null o undefined, devolvemos "0"
  if (amount == null) return '0'

  // para cifras < 1000 devolvemos el número tal cual (como string)
  if (amount < 1000) return String(amount)

  // convertimos a 'k'
  const valueK = amount / 1000
  // redondeo a 1 decimal (ej: 1.55 -> 1.6)
  const rounded = Math.round(valueK * 10) / 10

  // si el resultado es entero (ej 2.0) mostramos "2k", sino "1.6k"
  if (Number.isInteger(rounded)) {
    return `${rounded.toFixed(0)}k`
  } else {
    return `${rounded.toFixed(1)}k`
  }
}

function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength - 3) + '...'
}

function CampaignCard({
  campaign,
  setCurrentCampaign,
}: {
  campaign: Campaign
  setCurrentCampaign: (campaign: Campaign) => void
}) {
  const now = new Date()
  const start = new Date(campaign.start_date)
  const end = new Date(campaign.end_date)
  const isLive = now >= start && now <= end
  const isEnded = now > end
  const router = useRouter()

  const formatDate = (date: Date) =>
    date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })

  const handlePickCampaign = () => {
    if (campaign.can_claim && !campaign.claimed) {
      router.push({
        pathname: `${AppRoutes.campaigns}/${campaign.id}/claim-rewards`,
        query: { safe: router.query.safe },
      })
      return
    }
    router.push({ pathname: `${AppRoutes.campaigns}/${campaign.id}`, query: { safe: router.query.safe } })
  }

  return (
    <Card
      variant="outlined"
      sx={{
        p: 0,
        borderRadius: '12px',
        overflow: 'hidden',
        backgroundColor: '#ffffff', // fondo claro consistente
        border: '1px solid #E1E2EA',
        cursor: 'pointer',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
      onClick={handlePickCampaign}
    >
      {/* Banner */}
      <Box sx={{ position: 'relative', aspectRatio: '16/9', width: '100%', overflow: 'hidden' }}>
        <img
          src={campaign.banner}
          alt={campaign.name}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
            filter: isEnded ? 'grayscale(100%) brightness(0.9)' : 'none',
            transition: 'filter 0.3s ease-in-out',
          }}
        />

        {isLive && (
          <Box
            sx={{
              position: 'absolute',
              top: 12,
              right: 12,
              display: 'flex',
              height: 28,
              padding: '0 8px',
              justifyContent: 'center',
              alignItems: 'center',
              borderRadius: '100px',
              border: '1px solid var(--Foundation-Lime-lime-500, #39D551)',
              background: 'var(--Foundation-Lime-lime-50, #EBFBEE)',
              zIndex: 2,
              gap: 0.5,
            }}
          >
            {/* punto verde */}
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: 'var(--Foundation-Lime-lime-500, #39D551)',
              }}
            />
            <Typography
              sx={{
                color: 'var(--Foundation-Black, #000)',
                fontFamily: '"DM Sans"',
                fontSize: '12px',
                fontStyle: 'normal',
                fontWeight: 500,
                lineHeight: '16px',
              }}
            >
              Live
            </Typography>
          </Box>
        )}

        {isEnded && (
          <Box
            sx={{
              position: 'absolute',
              top: 12,
              right: 12,
              display: 'flex',
              height: 28,
              padding: '0 8px',
              justifyContent: 'center',
              alignItems: 'center',
              borderRadius: '100px',
              border: '1px solid var(--Foundation-Grey-grey-500, #E1E2EA)',
              background: 'var(--Foundation-Grey-grey-50, #FCFCFD)',
              zIndex: 2,
            }}
          >
            <Typography
              sx={{
                color: 'var(--Foundation-Grey-grey-900, #4B4B4E)',
                fontFamily: '"DM Sans"',
                fontSize: '12px',
                fontStyle: 'normal',
                fontWeight: 500,
                lineHeight: '16px',
              }}
            >
              Ended
            </Typography>
          </Box>
        )}
      </Box>

      {/* Content */}
      <Stack padding="16px" gap="12px">
        {/* Fecha */}

        {/* Título */}
        <Typography variant="h6" fontWeight={500} sx={{ fontSize: 18 }}>
          {campaign.name}
        </Typography>
        <Stack direction="row" gap="6px" alignItems="center">
          <CalendarIcon style={{ width: '20px', heigth: '20px' }} />
          <Typography variant="body2" color="#4B4B4E" fontWeight={500}>
            {formatDate(start)}
          </Typography>
          <ArrowRightIcon style={{ width: '16px', heigth: '16px' }} />
          <Typography variant="body2" color="#A0A0A6" fontWeight={500}>
            {formatDate(end)}
          </Typography>
        </Stack>

        {/* Descripción (truncate) */}
        <Typography
          variant="body2"
          color="text.secondary"
          fontFamily="Sora"
          sx={{
            fontSize: 14,
            fontWeight: 400,
            color: '#75757A',
          }}
        >
          {truncateText(campaign.description, 100)}
        </Typography>

        <Box sx={{ mt: '4px', display: 'flex', alignItems: 'center', gap: 1 }}>
          {campaign.can_claim && !campaign.claimed ? (
            <>
              <Button
                variant="contained"
                endIcon={<Image src="/images/diamond_shine.svg" alt="Claim" width={16} height={16} />}
                sx={{
                  borderRadius: '100px',
                  background: '#000',
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '14px',
                  lineHeight: '20px',
                  height: '28px',
                  fontFamily: 'DM Sans',
                  px: '50px',
                  boxShadow: 'none',
                  '&:hover': { background: '#000', boxShadow: 'none' },
                }}
              >
                <Typography variant="caption" fontWeight={600}>
                  Claim Rewards
                </Typography>
              </Button>

              {/* Empuja el label a la derecha */}
              <Typography
                sx={{
                  ml: 'auto',
                  color: '#75757A', // var(--Foundation-Grey-grey-800)
                  fontFamily: 'DM Sans',
                  fontSize: '12px',
                  fontStyle: 'normal',
                  fontWeight: 500,
                  lineHeight: '16px',
                  whiteSpace: 'nowrap',
                }}
              >
                {`Claim by ${formatClaimBy(campaign.max_claim_date)}`}
              </Typography>
            </>
          ) : (
            <Box
              sx={{
                mt: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between', // ✅ separa a los extremos
                width: '100%',
              }}
            >
              {/* Reward chip */}
              <Stack
                alignItems="center"
                direction="row"
                gap="4px"
                sx={{
                  border: '1px solid #E1E2EA',
                  borderRadius: '100px',
                  padding: '4px 4px 4px 10px',
                  flexShrink: 0, // evita que se contraiga
                }}
              >
                <Typography variant="caption" fontWeight={600} color="black" sx={{ whiteSpace: 'nowrap' }}>
                  {formatAmount(campaign?.campaign_reward?.amount ?? 0)} {campaign?.campaign_reward?.symbol ?? '--'}
                </Typography>
                <SvgIcon
                  component={tokens[campaign?.campaign_reward?.symbol ?? 'USDC'].icon}
                  sx={{ width: 18, height: 18, transform: 'translateY(1px)' }}
                />
              </Stack>

              {/* Network icon(s) */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end', // ✅ asegura alineación completa a la derecha
                  flexGrow: 1,
                }}
              >
                {campaign.network.map((network: string, index: number) => (
                  <Box
                    key={`${campaign.id}-${network}`}
                    sx={{
                      ml: index === 0 ? 0 : -1.4,
                      borderRadius: '50%',
                      border: '1px solid #fff',
                      width: 30,
                      height: 30,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: '#fff',
                      boxShadow: '0 1px 2px rgba(16,24,40,0.06)',
                    }}
                  >
                    <NetworkChip network={network} style="badge" isFavorite={false} width={20} height={20} />
                  </Box>
                ))}
              </Box>
            </Box>
          )}
        </Box>
      </Stack>
    </Card>
  )
}

function Campaigns({ chain, search }: { chain: string; search: string }) {
  const address = useSafeAddress()
  const [currentCampaign, setCurrentCampaign] = useState<Campaign | null>(null)
  const { data: campaigns, isLoading: isLoadingCampaigns } = useQuery<Campaign[]>({
    queryKey: ['campaigns', address],
    queryFn: async () => {
      const response = await axios.get(`${BACKEND_BASE_URI}/campaigns/${address}`)
      return response.data
    },
    refetchInterval: 10000,
    enabled: !!address,
  })
  const filterCampaign = (campaign: Campaign): boolean => {
    const q = (search ?? '').trim().toLowerCase()
    const sel = (chain ?? '').trim().toLowerCase()

    // Coincide con texto si NO hay búsqueda o si name/description contiene q
    const matchesSearch =
      !q || campaign.name?.toLowerCase().includes(q) || campaign.description?.toLowerCase().includes(q)

    // Coincide con chain si NO hay chain o si alguna network === sel
    const matchesChain =
      !sel || (Array.isArray(campaign.network) && campaign.network.some((n) => (n ?? '').toLowerCase() === sel))

    // Si ambos filtros existen, exige ambos; si uno está vacío, el otro decide
    return matchesSearch && matchesChain
  }

  if (isLoadingCampaigns || !campaigns) {
    return (
      <Stack gap={2} sx={{ width: '100%' }}>
        <Skeleton variant="text" width={200} height={40} />
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '16px',
            width: '100%',
            gridAutoRows: '1fr',
            '& > *': {
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
            },
          }}
        >
          {[1, 2, 3].map((index) => (
            <Card key={index} variant="outlined" sx={{ p: 0, borderRadius: '12px', overflow: 'hidden', maxWidth: 340 }}>
              <Skeleton variant="rectangular" height={192} />
              <Box sx={{ p: 2 }}>
                <Skeleton variant="text" width="80%" height={32} sx={{ mb: 1 }} />
                <Skeleton variant="text" width="60%" height={24} sx={{ mb: 1 }} />
                <Skeleton variant="text" width="90%" height={20} sx={{ mb: 1 }} />
                <Skeleton variant="text" width="70%" height={20} sx={{ mb: 2 }} />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Skeleton variant="rounded" width={120} height={30} />
                  <Skeleton variant="circular" width={30} height={30} sx={{ ml: 'auto' }} />
                </Box>
              </Box>
            </Card>
          ))}
        </Box>
      </Stack>
    )
  }

  if (campaigns.length > 0) {
    return (
      <Stack gap={2} sx={{ width: '100%' }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '16px',
            width: '100%',
            gridAutoRows: '1fr',
            '& > *': {
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
            },
          }}
        >
          {campaigns
            .filter((campaign) => filterCampaign(campaign))
            .map((campaign) => {
              return <CampaignCard campaign={campaign} key={campaign.name} setCurrentCampaign={setCurrentCampaign} />
            })}
        </Box>
        {/* <Drawer variant="temporary" anchor="right" onClose={() => setCurrentCampaign(null)} open={!!currentCampaign}>
        <CampaignInfo setCurrentCampaign={setCurrentCampaign} currentCampaign={currentCampaign} />
      </Drawer> */}
      </Stack>
    )
  }
}

export default Campaigns
