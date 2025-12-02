"use client"

import { useAccount, useDisconnect, useBalance, useChainId, useSwitchChain } from 'wagmi'
import { useAppKit } from '@reown/appkit/react'
import { baseSepolia } from 'wagmi/chains'
import { formatEther } from 'viem'
import { useCallback } from 'react'

const TARGET_CHAIN = baseSepolia

export function useWallet() {
  const { open } = useAppKit()
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()
  const chainId = useChainId()
  const { switchChain } = useSwitchChain()
  
  const { data: balance, refetch: refetchBalance } = useBalance({
    address,
    chainId: TARGET_CHAIN.id,
  })

  const isCorrectChain = chainId === TARGET_CHAIN.id
  const formattedBalance = balance ? Number(formatEther(balance.value)).toFixed(4) : "0.0000"
  const truncatedAddress = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : ""

  const connect = useCallback(async () => {
    await open()
  }, [open])

  const handleSwitchChain = useCallback(async () => {
    await switchChain({ chainId: TARGET_CHAIN.id })
  }, [switchChain])

  return {
    // Connection state
    connected: isConnected,
    address: truncatedAddress,
    fullAddress: address,
    
    // Chain state  
    chain: chainId === TARGET_CHAIN.id ? TARGET_CHAIN : null,
    isCorrectChain,
    targetChain: TARGET_CHAIN,
    
    // Balance
    balance: formattedBalance,
    balanceRaw: balance?.value || BigInt(0),
    
    // Actions
    connect,
    disconnect,
    switchChain: handleSwitchChain,
    refetchBalance,
  }
}