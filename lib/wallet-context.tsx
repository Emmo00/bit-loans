"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

interface WalletContextType {
  address: string | null
  connected: boolean
  connect: () => void
  disconnect: () => void
  balance: string
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null)
  const [connected, setConnected] = useState(false)
  const [balance, setBalance] = useState("0.00")

  const connect = () => {
    // Simulated wallet connection
    setAddress("0x742d...8E0C")
    setConnected(true)
    setBalance("2.5842")
  }

  const disconnect = () => {
    setAddress(null)
    setConnected(false)
    setBalance("0.00")
  }

  return (
    <WalletContext.Provider value={{ address, connected, connect, disconnect, balance }}>
      {children}
    </WalletContext.Provider>
  )
}

export function useWallet() {
  const context = useContext(WalletContext)
  if (!context) {
    throw new Error("useWallet must be used within WalletProvider")
  }
  return context
}
