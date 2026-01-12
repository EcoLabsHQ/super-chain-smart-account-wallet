import { useState, useEffect, useCallback } from 'react'
import type {
  SafeAppAccessPolicyTypes,
  SafeAppData,
  SafeAppSocialPlatforms,
} from '@safe-global/safe-gateway-typescript-sdk'
import local from '@/services/local-storage/local'
import { fetchSafeAppFromManifest } from '@/services/safe-apps/manifest'
import useChainId from '@/hooks/useChainId'

type ReturnType = {
  customSafeApps: SafeAppData[]
  loading: boolean
  updateCustomSafeApps: (newCustomSafeApps: SafeAppData[]) => void
}

const CUSTOM_SAFE_APPS_STORAGE_KEY = 'customSafeApps'

const getChainSpecificSafeAppsStorageKey = (chainId: string) => `${CUSTOM_SAFE_APPS_STORAGE_KEY}-${chainId}`

type StoredCustomSafeApp = { url: string }

/*
  This hook is used to manage the list of custom safe apps.
  What it does:
  1. Loads a list of custom safe apps from local storage
  2. Does some backward compatibility checks (supported app networks, etc)
  3. Tries to fetch the app info (manifest.json) from the app url
*/
const useCustomSafeApps = (): ReturnType => {
  const [customSafeApps, setCustomSafeApps] = useState<SafeAppData[]>(fakeSafeApps)
  const [loading, setLoading] = useState(false)
  const chainId = useChainId()

  const updateCustomSafeApps = useCallback(
    (newCustomSafeApps: SafeAppData[]) => {
      setCustomSafeApps(newCustomSafeApps)

      const chainSpecificSafeAppsStorageKey = getChainSpecificSafeAppsStorageKey(chainId)
      local.setItem(
        chainSpecificSafeAppsStorageKey,
        newCustomSafeApps.map((app) => ({ url: app.url })),
      )
    },
    [chainId],
  )

  useEffect(() => {
    const loadCustomApps = async () => {
      setLoading(true)
      const chainSpecificSafeAppsStorageKey = getChainSpecificSafeAppsStorageKey(chainId)
      const storedApps = local.getItem<StoredCustomSafeApp[]>(chainSpecificSafeAppsStorageKey) || []
      const appManifests = await Promise.allSettled(storedApps.map((app) => fetchSafeAppFromManifest(app.url, chainId)))
      const resolvedApps = appManifests
        .filter((promiseResult) => promiseResult.status === 'fulfilled')
        .map((promiseResult) => (promiseResult as PromiseFulfilledResult<SafeAppData>).value)

      setLoading(false)
    }

    loadCustomApps()
  }, [chainId])

  return { customSafeApps, loading, updateCustomSafeApps }
}

export { useCustomSafeApps }

const fakeSafeApps: SafeAppData[] = [
  {
    id: 0.21472726789485663,
    url: 'https://miniraffle.superchain.eco/',
    name: 'SuperChain Raffle',
    description:
      'Claim free tickets in the weekly Superchain Raffle based on your Super Account level for a chance to win rewards.',
    accessControl: {
      type: 'NO_RESTRICTIONS' as SafeAppAccessPolicyTypes,
      value: [],
    },
    tags: ['DeFi', 'Gaming'],
    features: [],
    socialProfiles: [],
    developerWebsite: '',
    chainIds: ['10'],
    iconUrl: 'https://account.superchain.eco/images/apps/raffle.jpg',
  },
  {
    id: 48,
    url: 'https://eco-vaulti-v2.vercel.app',
    name: 'EcoVaults Beta',
    iconUrl: 'https://eco-vaults-v2.vercel.app/favicon.ico?57646a737cc87321',
    description:
      'This is a Beta app produced by EcoLabs providing the best cross-chain yield opportunities from Optimism Mainnet. Use with caution.',
    chainIds: ['10', '1135'],
    accessControl: {
      type: 'NO_RESTRICTIONS' as SafeAppAccessPolicyTypes,
      value: [],
    },
    tags: ['Yield', 'Vaults'],
    features: [],
    socialProfiles: [],
  },
  {
    id: 152,
    url: 'https://velodrome.finance',
    name: 'Velodrome Finance',
    iconUrl: 'https://account.superchain.eco/images/apps/velodrome.jpg',
    description:
      'Velodrome Finance is a next-generation AMM that combines the best of Curve, Convex and Uniswap, designed to serve as the central liquidity hub on Optimism network. Velodrome NFTs vote on token emissio',
    chainIds: ['10'],
    provider: undefined,
    accessControl: {
      type: 'NO_RESTRICTIONS' as SafeAppAccessPolicyTypes,
      value: [],
    },
    tags: ['DeFi', 'Governance', 'Yield'],
    features: [],
    developerWebsite: 'https://velodrome.finance',
    socialProfiles: [
      {
        platform: 'DISCORD' as SafeAppSocialPlatforms,
        url: 'https://discord.gg/velodrome',
      },
      {
        platform: 'GITHUB' as SafeAppSocialPlatforms,
        url: 'https://github.com/velodrome-finance',
      },
      {
        platform: 'TWITTER' as SafeAppSocialPlatforms,
        url: 'https://twitter.com/velodromeFi',
      },
    ],
  },
]
