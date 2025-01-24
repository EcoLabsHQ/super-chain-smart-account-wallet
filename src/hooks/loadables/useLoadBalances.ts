import { getCounterfactualBalance } from '@/features/counterfactual/utils'
import { useWeb3 } from '@/hooks/wallets/web3'
import { useEffect, useMemo } from 'react'
import { getBalances, type SafeBalanceResponse } from '@safe-global/safe-gateway-typescript-sdk'
import { useAppSelector } from '@/store'
import useAsync, { type AsyncResult } from '../useAsync'
import { Errors, logError } from '@/services/exceptions'
import { selectCurrency, selectSettings, TOKEN_LISTS } from '@/store/settingsSlice'
import { useCurrentChain } from '../useChains'
import { FEATURES, hasFeature } from '@/utils/chains'
import { POLLING_INTERVAL } from '@/config/constants'
import useIntervalCounter from '../useIntervalCounter'
import useSafeInfo from '../useSafeInfo'
import { SUNNY_TOKEN_ADDRESS } from '@/features/superChain/constants'

const useTokenListSetting = (): boolean | undefined => {
  const chain = useCurrentChain()
  const settings = useAppSelector(selectSettings)

  const isTrustedTokenList = useMemo(() => {
    if (settings.tokenList === TOKEN_LISTS.ALL) return false
    return chain ? hasFeature(chain, FEATURES.DEFAULT_TOKENLIST) : undefined
  }, [chain, settings.tokenList])

  return isTrustedTokenList
}

const tokensLogoToInject = [
  {
    address: '0x4200000000000000000000000000000000000042',
    logoUri: '/tokens/0x4200000000000000000000000000000000000042.png',
  },
  {
    address: SUNNY_TOKEN_ADDRESS,
    logoUri: '/tokens/sunny.png',
  },
]

export const useLoadBalances = (): AsyncResult<SafeBalanceResponse> => {
  const [pollCount, resetPolling] = useIntervalCounter(POLLING_INTERVAL)
  const currency = useAppSelector(selectCurrency)
  const isTrustedTokenList = useTokenListSetting()
  const { safe, safeAddress } = useSafeInfo()
  const web3 = useWeb3()
  const chain = useCurrentChain()
  const chainId = safe.chainId

  // Re-fetch assets when the entire SafeInfo updates
  const [data, error, loading] = useAsync<SafeBalanceResponse | undefined>(
    async () => {
      if (!chainId || !safeAddress || isTrustedTokenList === undefined) return

      if (!safe.deployed) {
        return getCounterfactualBalance(safeAddress, web3, chain)
      }

      let balances = await getBalances(chainId, safeAddress, currency, {
        trusted: false,
        exclude_spam: true,
      })

      balances.items = balances.items
        .map((balance) => {
          const logo = tokensLogoToInject.find(
            (token) => token.address.toLowerCase() === balance.tokenInfo.address.toLowerCase(),
          )
          return logo ? { ...balance, tokenInfo: { ...balance.tokenInfo, logoUri: logo.logoUri } } : balance
        })
        .filter((balance) => {
          const isSunnyToken = balance.tokenInfo.address.toLowerCase() === SUNNY_TOKEN_ADDRESS.toLowerCase()
          const fiatValue = parseFloat(balance.fiatBalance)
          return isSunnyToken || fiatValue !== 0
        })
      const sunnyTokenIndex = balances.items.findIndex(
        (item) => item.tokenInfo.address.toLowerCase() === SUNNY_TOKEN_ADDRESS.toLowerCase(),
      )
      if (sunnyTokenIndex > -1) {
        const [sunnyToken] = balances.items.splice(sunnyTokenIndex, 1)
        balances.items.unshift(sunnyToken)
      }
      return balances
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [safeAddress, chainId, currency, isTrustedTokenList, pollCount, safe.deployed, web3, chain],
    false, // don't clear data between polls
  )

  // Reset the counter when safe address/chainId changes
  useEffect(() => {
    resetPolling()
  }, [resetPolling, safeAddress, chainId])

  // Log errors
  useEffect(() => {
    if (error) {
      logError(Errors._601, error.message)
    }
  }, [error])

  return [data, error, loading]
}

export default useLoadBalances
