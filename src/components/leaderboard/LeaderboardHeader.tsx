import React from 'react'
import PageHeader from '@/components/common/PageHeader'
import css from '@/components/common/PageHeader/styles.module.css'
import LeaderboardNavigation from './LeaderboardNavigation'
import { Box, Typography } from '@mui/material'
import RefreshTimer from './RefreshTimer'
function getNextDeadlineUTC(): Date {
  const now: Date = new Date()
  const result: Date = new Date(now)

  result.setUTCDate(now.getUTCDate() + 1)
  result.setUTCHours(13, 0, 0, 0)

  return result
}

function LeaderboardHeader({ children }: { children?: React.ReactNode }) {
  return (
    <PageHeader
      title={
        <Box display="flex" alignItems="center" gap={2}>
          <Typography variant="h3" fontWeight={700}>
            Leaderboard
          </Typography>
          <RefreshTimer deadLine={getNextDeadlineUTC()} message="Refreshes in " />
        </Box>
      }
      action={
        <div>
          <div className={css.pageHeader}>
            <div className={css.navWrapper}>
              <LeaderboardNavigation />
            </div>
            {children && <div className={css.actionsWrapper}>{children}</div>}
          </div>
        </div>
      }
    />
  )
}

export default LeaderboardHeader
