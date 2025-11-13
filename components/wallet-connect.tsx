"use client"

import { useWallet } from "@/lib/use-wallet"
import { Button } from "@/components/ui/button"
import { Wallet, AlertCircle } from "lucide-react"
import { useState, useEffect } from "react"

export function WalletConnect() {
  const { connected, connect, disconnect, address, balance } = useWallet()
  const [isClient, setIsClient] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setIsClient(true)
  }, [])

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
        <div className="text-xs text-muted-foreground">{balance} ETH</div>
      </div>
      <Button
        onClick={handleDisconnect}
        variant="outline"
        size="sm"
        className="rounded-lg"
      >
        Disconnect
      </Button>
    </div>
  )
}