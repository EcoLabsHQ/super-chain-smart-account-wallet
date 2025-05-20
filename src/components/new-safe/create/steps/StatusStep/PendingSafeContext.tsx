import { createContext, ReactNode, useState } from 'react'
import type { PendingSafeByChain } from '../../types'

export const PendingSafeContext = createContext<{
  pendingSafes: PendingSafeByChain
  setPendingSafes: (safes: PendingSafeByChain) => void
}>({
  pendingSafes: {},
  setPendingSafes: () => {},
})

export const PendingSafeProvider = ({ children }: { children: ReactNode }) => {
  const [pendingSafes, setPendingSafes] = useState<PendingSafeByChain>({})

  return <PendingSafeContext.Provider value={{ pendingSafes, setPendingSafes }}>{children}</PendingSafeContext.Provider>
}
