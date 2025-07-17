import { SvgIcon } from '@mui/material'
import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { getSeasonByCode } from '@/services/seasons'

function SeasonChip({ season, defaultActive }: { season: number; defaultActive?: boolean }) {
  const router = useRouter()
  const query = router.query.safe ? { safe: router.query.safe } : undefined

  const seasonObject = getSeasonByCode(season)
  const isActive = seasonObject?.isActive() ?? false
  return (
    <Link
      onClick={(e) => e.stopPropagation()}
      href={{ pathname: seasonObject?.link, query }}
      passHref
      style={{ visibility: !season ? 'collapse' : 'visible' }}
    >
      <SvgIcon
        component={seasonObject?.icon}
        inheritViewBox
        fontSize="inherit"
        sx={{
          width: '24px',
          height: '24px',
          opacity: isActive ? 1 : 0.5,
          mixBlendMode: isActive ? 'none' : 'luminosity',
        }}
      />
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
