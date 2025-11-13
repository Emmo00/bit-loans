"use client"

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { config } from './wagmi-config'
import { useState, type ReactNode } from "react"

const queryClient = new QueryClient()

export function WalletProvider({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  )
}

// Re-export wagmi hooks for convenience
export { 
  useAccount, 
  useConnect, 
  useDisconnect, 
  useBalance,
  useConnectors 
} from 'wagmi'
