import { BACKEND_BASE_URI } from '@/config/constants'
import axios from 'axios'

type CheckAirdropEligibilityResponse = {
  eligible: boolean
  value: number
  proofs: string[]
  claimed: boolean
  reasons: string[]
  token: string | null
}

export async function checkAirdropEligibility(
  address: string,
  label: string,
): Promise<CheckAirdropEligibilityResponse> {
  const response = await axios.get<CheckAirdropEligibilityResponse>(`${BACKEND_BASE_URI}/airdrop/${address}/${label}`)
  return response.data
}
