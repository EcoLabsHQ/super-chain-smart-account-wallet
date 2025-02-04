import { useEffect, useMemo, useRef } from 'react'
import isEqual from 'lodash/isEqual'
import { useAppSelector } from '@/store'
import { defaultSafeInfo, type ExtendedSafeInfo, selectSafeInfo } from '@/store/safeInfoSlice'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import badgesService from '@/features/superChain/services/badges.service'

const useSafeInfo = (): {
  safe: ExtendedSafeInfo
  safeAddress: string
  safeLoaded: boolean
  safeLoading: boolean
  safeError?: string
} => {
  const { data, error, loading } = useAppSelector(selectSafeInfo, isEqual)

  const result = useMemo(
    () => ({
      safe: data || defaultSafeInfo,
      safeAddress: data?.address.value || '',
      safeLoaded: !!data,
      safeError: error,
      safeLoading: loading,
    }),
    [data, error, loading],
  )
  const queryClient = useQueryClient();
  const isFirstLoad = useRef(true);

  useEffect(() => {
    if (!result.safeAddress || !result.safeLoaded || !isFirstLoad.current) return

    console.log("🔌 Conectando WebSocket para badges...")
    const socket = new WebSocket(`ws://localhost:3003`)

    socket.onopen = () => {
      socket.send(JSON.stringify({ address: result.safeAddress }))
    }

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data)
      if (data.message === 'BADGES') {
        console.log("✅ Badges actualizados desde WebSocket 🎉")
        queryClient.invalidateQueries({ queryKey: ['badges', result.safeAddress] })
        socket.close()
      }
    }

    socket.onclose = () => console.log("⚡ WebSocket cerrado")

    // 🔹 Marcar como inicializado para evitar reconexiones innecesarias
    isFirstLoad.current = false

    return () => {
      socket.close()
    }
  }, [result.safeAddress, result.safeLoaded, queryClient])

  useQuery({
    queryKey: ['badges', result.safeAddress],
    queryFn: () => {
      console.log("📡 Obteniendo badges para:", result.safeAddress)
      return badgesService.getBadges(result.safeAddress as `0x${string}`)
    },
    enabled: !!result.safeAddress && !!result.safeLoaded,
  })

  return result
}

export default useSafeInfo
