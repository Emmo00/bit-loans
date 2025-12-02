"use client"

import { useAppKit } from "@reown/appkit/react"
import { useAccount, useDisconnect, useBalance, useChainId, useSwitchChain } from "wagmi"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, RefreshCw } from "lucide-react"
import { useState, useEffect } from "react"
import { baseSepolia } from "wagmi/chains"
import { formatEther } from "viem"

const TARGET_CHAIN = baseSepolia

export function WalletConnect() {
  const { open } = useAppKit()
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()
  const chainId = useChainId()
  const { switchChain } = useSwitchChain()
  
  const { data: balance } = useBalance({
    address,
    chainId: TARGET_CHAIN.id,
  })
  
  const [isClient, setIsClient] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSwitching, setIsSwitching] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const isCorrectChain = chainId === TARGET_CHAIN.id
  const formattedBalance = balance ? Number(formatEther(balance.value)).toFixed(4) : "0.0000"
  const truncatedAddress = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : ""

  const handleSwitchChain = async () => {
    try {
      setError(null)
      setIsSwitching(true)
      await switchChain({ chainId: TARGET_CHAIN.id })
    } catch (err) {
      setError(`Failed to switch to ${TARGET_CHAIN.name}`)
      console.error("Chain switch error:", err)
    } finally {
      setIsSwitching(false)
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

  if (!isClient) {
    return (
      <Button disabled className="rounded-lg">
        Loading...
      </Button>
    )
  }

  if (!isConnected) {
    return (
      <div className="space-y-2">
        <Button
          onClick={() => open()}
          className="rounded-lg bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 text-white border-0"
        >
          Connect Wallet
        </Button>
        <div className="text-xs text-muted-foreground text-center">
          Connect to {TARGET_CHAIN.name}
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
        <div className="text-sm font-medium">{truncatedAddress}</div>
        <div className="text-xs text-muted-foreground flex items-center gap-1">
          {formattedBalance} ETH
          <Badge 
            variant={isCorrectChain ? "default" : "destructive"} 
            className="ml-1 text-xs"
          >
            {isCorrectChain ? TARGET_CHAIN.name : "Wrong Network"}
          </Badge>
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
          Switch to {TARGET_CHAIN.name}
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