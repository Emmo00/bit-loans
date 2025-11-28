"use client"

import { useWallet } from "@/lib/use-wallet"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Wallet, AlertCircle, RefreshCw } from "lucide-react"
import { useState, useEffect } from "react"

export function WalletConnect() {
  const { 
    connected, 
    connect, 
    disconnect, 
    address, 
    balance, 
    chain, 
    isCorrectChain, 
    switchChain, 
    targetChain,
    refetchBalance 
  } = useWallet()
  const [isClient, setIsClient] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSwitching, setIsSwitching] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Refetch balance when chain changes
  useEffect(() => {
    if (connected && isCorrectChain) {
      refetchBalance()
    }
  }, [connected, isCorrectChain, refetchBalance])

  const handleConnect = async () => {
    try {
      setError(null)
      await connect()
    } catch (err) {
      setError("Failed to connect wallet. Please make sure MetaMask is installed.")
      console.error("Wallet connection error:", err)
    }
  }

  const handleDisconnect = async () => {
    try {
      setError(null)
      await disconnect()
    } catch (err) {
      setError("Failed to disconnect wallet")
      console.error("Wallet disconnection error:", err)
    }
  }

  const handleSwitchChain = async () => {
    try {
      setError(null)
      setIsSwitching(true)
      await switchChain()
    } catch (err) {
      setError(`Failed to switch to ${targetChain.name}`)
      console.error("Chain switch error:", err)
    } finally {
      setIsSwitching(false)
    }
  }

  if (!isClient) {
    return (
      <Button disabled className="rounded-lg">
        Loading...
      </Button>
    )
  }

  if (!connected) {
    return (
      <div className="space-y-2">
        <Button
          onClick={handleConnect}
          className="rounded-lg bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 text-white border-0"
        >
          <Wallet className="w-4 h-4 mr-2" />
          Connect Wallet
        </Button>
        <div className="text-xs text-muted-foreground text-center">
          Connect to {targetChain.name}
        </div>
        {error && (
          <div className="flex items-center gap-2 text-sm text-red-500">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <div className="text-right hidden sm:block">
        <div className="text-sm font-medium">{address}</div>
        <div className="text-xs text-muted-foreground flex items-center gap-1">
          {balance} ETH
          {chain && (
            <Badge 
              variant={isCorrectChain ? "default" : "destructive"} 
              className="ml-1 text-xs"
            >
              {chain.name}
            </Badge>
          )}
        </div>
      </div>
      
      {!isCorrectChain && (
        <Button
          onClick={handleSwitchChain}
          disabled={isSwitching}
          variant="outline"
          size="sm"
          className="rounded-lg border-orange-500 text-orange-600 hover:bg-orange-50"
        >
          {isSwitching ? (
            <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
          ) : (
            <AlertCircle className="w-4 h-4 mr-1" />
          )}
          Switch to {targetChain.name}
        </Button>
      )}
      
      <Button
        onClick={handleDisconnect}
        variant="outline"
        size="sm"
        className="rounded-lg"
      >
        Disconnect
      </Button>
      
      {error && (
        <div className="flex items-center gap-1 text-sm text-red-500 ml-2">
          <AlertCircle className="w-3 h-3" />
          {error}
        </div>
      )}
    </div>
  )
}