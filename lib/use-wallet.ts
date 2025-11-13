"use client"

import { useAccount, useConnect, useDisconnect, useBalance, useConnectors, injected } from 'wagmi'
import { useMemo } from 'react'

export function useWallet() {
  const { address, isConnected } = useAccount()
  const { connect } = useConnect()
  const { disconnect } = useDisconnect()
  const connectors = useConnectors()
  
  // Get balance - you might want to specify a token or use ETH
  const { data: balanceData } = useBalance({
    address: address,
  })

  // Get the injected connector (MetaMask, etc.)
  const injectedConnector = useMemo(() => {
    return connectors.find(connector => connector.id === 'injected')
  }, [connectors])

  const handleConnect = () => {
      connect({ connector: injected() })
  }

  const formatAddress = (addr: string | undefined) => {
    if (!addr) return null
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  return {
    address: formatAddress(address),
    connected: isConnected,
    connect: handleConnect,
    disconnect,
    balance: balanceData?.formatted || "0.00",
    rawAddress: address, // Full address if needed
  }
}