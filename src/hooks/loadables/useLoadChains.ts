import { useEffect } from 'react'
import { getChainsConfig, setBaseUrl, type ChainInfo } from '@safe-global/safe-gateway-typescript-sdk'
import useAsync, { type AsyncResult } from '../useAsync'
import { logError, Errors } from '@/services/exceptions'
import { GATEWAY_URL_PRODUCTION } from '@/config/constants'

const getConfigs = async (): Promise<ChainInfo[]> => {
  setBaseUrl(GATEWAY_URL_PRODUCTION)
  const data = await getChainsConfig()
  return data.results || []
}

export const useLoadChains = (): AsyncResult<ChainInfo[]> => {
  const [data, error, loading] = useAsync<ChainInfo[]>(getConfigs, [])

  // Log errors
  useEffect(() => {
    if (error) {
      logError(Errors._620, error.message)
    }
  }, [error])

  return [data, error, loading]
}

export default useLoadChains
