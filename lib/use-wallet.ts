"use client"

import { useAccount, useConnect, useDisconnect, useBalance, useConnectors, useSwitchChain, useChainId } from 'wagmi'
import { useMemo, useEffect } from 'react'
import { TARGET_CHAIN } from './wagmi-config'
import { metaMask } from 'wagmi/connectors'

export function useWallet() {
  const { address, isConnected, chain } = useAccount()
  const { connect } = useConnect()
  const { disconnect } = useDisconnect()
  const { switchChain } = useSwitchChain()
  const chainId = useChainId()
  const connectors = useConnectors()
  
  // Get balance from the correct chain (Base Sepolia)
  const { data: balanceData, refetch: refetchBalance } = useBalance({
    address: address,
    chainId: TARGET_CHAIN.id,
  })

  // Check if we're on the correct chain
  const isCorrectChain = chain?.id === TARGET_CHAIN.id

  // Get the MetaMask connector
  const metaMaskConnector = useMemo(() => {
    return connectors.find(connector => connector.id === 'metaMaskSDK' || connector.id === 'metaMask')
  }, [connectors])

  // Auto-switch to Base Sepolia when connected to wrong chain
  useEffect(() => {
    if (isConnected && !isCorrectChain && switchChain) {
      switchChain({ chainId: TARGET_CHAIN.id })
    }
  }, [isConnected, isCorrectChain, switchChain])

  const handleConnect = async () => {
    try {
      // Try MetaMask first, then fall back to injected
      const connector = metaMaskConnector || connectors[0]
      if (connector) {
        await connect({ connector, chainId: TARGET_CHAIN.id })
      }
    } catch (error) {
      console.error('Failed to connect:', error)
    }
  }

  const handleSwitchChain = async () => {
    if (switchChain) {
      try {
        await switchChain({ chainId: TARGET_CHAIN.id })
        // Refetch balance after chain switch
        setTimeout(() => refetchBalance(), 1000)
      } catch (error) {
        console.error('Failed to switch chain:', error)
      }
    }
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
    chain: chain,
    isCorrectChain,
    switchChain: handleSwitchChain,
    targetChain: TARGET_CHAIN,
    refetchBalance,
  }
}