export type BadgeTierMetadataDto = {
  badgeId: number
  level: number
  minValue: number
  image: string
  points: number
}

export type BadgeTierDto = {
  points: string
  tier: string
  uri: string
  metadata: BadgeTierMetadataDto
  rewards?: {
    amount: string
    symbol: string
  }
}

export type BadgeMetadataDto = {
  name: string
  description: string
  platform: string
  chains: string[]
  condition: string
  'stack-image': string
  season: number
  image?: string
}

export type BadgeWithPrize = {
  badgeId: string
  uri: string
  badgeTiers: BadgeTierDto[]
  metadata: BadgeMetadataDto
  points: number
  tier: number
  claimableTier: number
  claimable: boolean
  claimableByPerk: boolean
  campaigns: string[]
  currentCount: number
  totalClaimed?: number
  moreInfo?: string
  countUnit?: string
  action_description?: string
  action_link?: string
  statistics?: {
    totalClaimed: number
    tier: number
    percentage: number
  }[]
  rewards?: {
    tier_id: string
    symbol: string
    amount: string
  }
  tokenBadge?: {
    symbol: string
    amount: string
    maxClaims?: string
  }
}
