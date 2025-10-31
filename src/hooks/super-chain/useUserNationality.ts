import { useQuery } from '@tanstack/react-query'
import { Address } from 'viem'
import { fetchNationalities } from './useLeaderboard'

export const useUserNationality = (userAddress: Address) => {
  return useQuery({
    queryKey: ['userNationality', userAddress],
    queryFn: async () => {
      const nationality = await fetchNationalities([userAddress])
      return {
        nationality: nationality[userAddress.trim().toUpperCase()],
      }
    },
    enabled: !!userAddress,
  })
}
