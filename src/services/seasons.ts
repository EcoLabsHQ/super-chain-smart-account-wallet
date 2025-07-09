import { AppRoutes } from '@/config/routes'
import Season7 from '@/public/images/badges/season-7.svg'
import Season8 from '@/public/images/badges/season-8.svg'

function createSeason(name: string, code: number, toDate: Date, icon: any, link: string) {
  return {
    name,
    code,
    toDate,
    icon,
    link,
    isActive: function () {
      return this.toDate > new Date()
    },
    status: function (): 'active' | 'inactive' | 'ending' {
      const now = new Date()
      const diff = this.toDate.getTime() - now.getTime()
      if (!this.isActive()) return 'inactive'
      else if (diff <= 10 * 24 * 60 * 60 * 1000) return 'ending'
      else return 'active'
    },
  }
}

export function getCurrentSeason() {
  const now = new Date()
  return seasons.find((season) => season.toDate > now) || seasons[seasons.length - 1]
}
export function getSeasonByCode(code: number) {
  return seasons.find((season) => season.code === code)
}

export function getSeasonByName(name: string) {
  return seasons.find((season) => season.name === name)
}

export const seasons = [
  createSeason('Season 7', 7, new Date(Date.UTC(2025, 5, 11, 23, 59, 59, 999)), Season7, AppRoutes.badges.season7),
  createSeason('Season 8', 8, new Date(Date.UTC(2025, 6, 16, 17, 59, 59, 999)), Season8, AppRoutes.badges.season8),
]
