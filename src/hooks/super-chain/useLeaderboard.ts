import { BACKEND_BASE_URI } from '@/config/constants'
import { useInfiniteQuery } from '@tanstack/react-query'
import axios from 'axios'

type Noun = {
  accessory: number
  background: number
  body: number
  glasses: number
  head: number
}

export type Leaderboard = {
  data: {
    levels: number
    noun: string
    superChainId: string
    superaccount: string
    total_points: string
    total_badges: number
  }[]
  hasNextPage: boolean
}

export function useLeaderboard() {
  return useInfiniteQuery({
    queryKey: ['leaderboard'],
    queryFn: async ({ pageParam }) => {
      const response = await axios.get<Leaderboard>(`${BACKEND_BASE_URI}/leaderboard`, {
        params: {
          page: pageParam,
        },
      })
      const nationalities = await fetchNationalities(response.data.data.map((user) => user.superaccount))
      return {
        data: response.data.data.map((user) => ({
          ...user,
          nationality: nationalities[user.superaccount.trim().toUpperCase()],
          noun: JSON.parse(user.noun) as Noun,
        })),
        hasNextPage: response.data.hasNextPage,
        nextPage: pageParam + 1,
      }
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => (lastPage.hasNextPage ? lastPage.nextPage : undefined),
  })
}
export async function fetchNationalities(safeAddresses: string[]): Promise<Record<string, string>> {
  const normalizedAddresses = Array.from(new Set(safeAddresses.map((addr) => addr.trim().toUpperCase())))

  try {
    const response = await axios.post<any>(
      `${BACKEND_BASE_URI}/leaderboard/nationalities`,
      { addresses: normalizedAddresses },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 5000,
      },
    )

    const nationalities: Record<string, string> = {}

    normalizedAddresses.forEach((address) => {
      nationalities[address] = response.data[address] || 'UNKNOWN'
    })

    return nationalities
  } catch (error) {
    console.error('Error fetching nationalities:', error)

    if (axios.isAxiosError(error)) {
      console.error('Details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      })
    }

    const fallback: Record<string, string> = {}
    normalizedAddresses.forEach((address) => {
      fallback[address] = 'UNKNOWN'
    })

    return fallback
  }
}
