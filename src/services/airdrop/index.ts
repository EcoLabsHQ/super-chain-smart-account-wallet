import { BACKEND_BASE_URI } from '@/config/constants'
import axios from 'axios'

export async function checkAirdropEligibility(address: string) {
  const response = await axios.get(`${BACKEND_BASE_URI}/airdrop/${address}`)
  return response.data
}
