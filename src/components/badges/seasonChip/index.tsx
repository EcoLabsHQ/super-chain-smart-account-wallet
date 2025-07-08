import { Box, SvgIcon, Typography } from '@mui/material'
import React from 'react'
import { Chip } from '@/components/common/Chip'
import Image from 'next/image'
import Link from 'next/link'
import { AppRoutes } from '@/config/routes'
import { useRouter } from 'next/router'
import Season7 from '@/public/images/badges/season-7.svg'
import Season8 from '@/public/images/badges/season-8.svg'

function getSeasonIcon(season: number) {
  switch (season) {
    case 7:
      return Season7
    case 8:
      return Season8
    default:
      break
  }
}

function SeasonChip({ season, style }: { season: number; style: 'info' | 'badge' }) {
  //  const isBadge = style === 'badge'
  const link = AppRoutes.badges.season7
  const router = useRouter()
  const query = router.query.safe ? { safe: router.query.safe } : undefined

  const seasonIcon = getSeasonIcon(season)
  return (
    <Link
      onClick={(e) => e.stopPropagation()}
      href={{ pathname: link, query }}
      passHref
      style={{ visibility: !season ? 'collapse' : 'visible' }}
    >
      <SvgIcon component={seasonIcon} inheritViewBox fontSize="inherit" sx={{ width: '24px', height: '24px' }} />
      {/* <Chip
        label={
          <Box display="flex" alignItems="center" gap={0.5}>
            <Typography
              fontWeight={600}
              sx={{
                color: '#6B5DE7',
                margin: '-5px',
              }}
            >
              S{season}
            </Typography>
            <Image
              src="/images/badges/stars_custom.svg"
              alt="Star Icon"
              width={14}
              height={14}
              style={{ margin: '2px' }}
            />
          </Box>
        }
        sx={{
          borderRadius: '18px',
          border: '1px solid #6B5DE7',
          backgroundColor: '#F4F0FF',
          padding: '6px 10px',
          height: '32px',
          maxWidth: '60px',
          fontWeight: 600,
          transform: isBadge ? 'scale(0.8)' : 'scale(1)',
          transformOrigin: 'top left',
        }}
      /> */}
    </Link>
  )
}

export default SeasonChip
