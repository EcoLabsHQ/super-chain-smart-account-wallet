import { BACKEND_BASE_URI } from '@/config/constants'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { Address } from 'viem'

type Noun = {
  accessory: number
  background: number
  body: number
  glasses: number
  head: number
}

type UserRank = {
  rank: number
  data: {
    level: number
    noun: string
    superChainId: string
    superaccount: string
    total_points: string
    total_badges: number
  }
}

export const useUserRank = (userAddress: Address) => {
  const {
    data: response,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['userRank', userAddress],
    queryFn: async () => {
      const response = await axios.get<UserRank>(`${BACKEND_BASE_URI}/leaderboard/${userAddress}`)
      if (response.data === null) {
        return null
      }
      return {
        rank: response.data.rank,
        data: {
          ...response.data.data,
          noun: JSON.parse(response.data.data.noun) as Noun,
        },
      }
    },
    enabled: !!userAddress,
  })

  return { rank: response?.rank, user: response?.data, loading: isLoading, error }
}
