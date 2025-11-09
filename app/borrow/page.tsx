"use client"

import { WalletProvider, useWallet } from "@/lib/wallet-context"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { ArrowRight, Info } from "lucide-react"
import { useState } from "react"
import Link from "next/link"

function BorrowContent() {
  const { connected } = useWallet()
  const [selectedAsset, setSelectedAsset] = useState("ETH")
  const [borrowAmount, setBorrowAmount] = useState("")

  const assets = [
    { symbol: "ETH", rate: "8.5%", liquidity: "5,000 ETH", ltv: "80%" },
    { symbol: "USDC", rate: "6.2%", liquidity: "50M USDC", ltv: "85%" },
    { symbol: "DAI", rate: "7.1%", liquidity: "25M DAI", ltv: "80%" },
    { symbol: "WBTC", rate: "9.2%", liquidity: "500 WBTC", ltv: "75%" },
  ]

  const selectedAssetData = assets.find((a) => a.symbol === selectedAsset)

  if (!connected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h1 className="text-3xl font-bold mb-4">Connect Your Wallet</h1>
          <p className="text-muted-foreground mb-6">Please connect your wallet to borrow</p>
          <Link href="/">
            <Button className="rounded-lg bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 text-white border-0">
              Go Home
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Borrow</h1>
          <p className="text-muted-foreground">Choose an asset and set your loan parameters</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Asset Selection */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-2"
          >
            <div className="glass p-6 mb-6">
              <h2 className="text-xl font-bold mb-6">Select Asset</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {assets.map((asset) => (
                  <button
                    key={asset.symbol}
                    onClick={() => setSelectedAsset(asset.symbol)}
                    className={`glass p-4 text-center rounded-xl transition-all ${
                      selectedAsset === asset.symbol ? "bg-blue-500/20 border-blue-400" : "hover:bg-white/10"
                    }`}
                  >
                    <div className="font-bold mb-2">{asset.symbol}</div>
                    <div className="text-xs text-muted-foreground">{asset.rate}</div>
                  </button>
                ))}
              </div>

              {selectedAssetData && (
                <div className="bg-white/5 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Interest Rate</span>
                    <span className="font-semibold text-blue-500">{selectedAssetData.rate}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Available Liquidity</span>
                    <span className="font-semibold">{selectedAssetData.liquidity}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Max LTV</span>
                    <span className="font-semibold">{selectedAssetData.ltv}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Borrow Amount */}
            <div className="glass p-6">
              <h2 className="text-xl font-bold mb-6">Borrow Amount</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Amount ({selectedAsset})</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="0.00"
                      value={borrowAmount}
                      onChange={(e) => setBorrowAmount(e.target.value)}
                      className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                    <Button variant="outline" className="rounded-lg bg-transparent">
                      Max
                    </Button>
                  </div>
                </div>

                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <Info className="w-4 h-4 mt-0.5 text-blue-500 flex-shrink-0" />
                    <div className="text-sm">
                      <p className="font-medium mb-1">You will receive</p>
                      <p className="text-muted-foreground">
                        {borrowAmount || "0"} {selectedAsset}
                      </p>
                    </div>
                  </div>
                </div>

                <Button className="w-full rounded-lg bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 text-white border-0 py-6">
                  Borrow <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Loan Summary */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <div className="glass p-6 sticky top-24">
              <h3 className="text-lg font-bold mb-6">Loan Summary</h3>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Borrowed Amount</p>
                  <p className="text-2xl font-bold">
                    {borrowAmount || "0"} {selectedAsset}
                  </p>
                </div>

                <div className="border-t border-border pt-4">
                  <p className="text-sm text-muted-foreground mb-1">Interest Rate</p>
                  <p className="text-xl font-bold text-blue-500">{selectedAssetData?.rate}</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-1">Monthly Interest</p>
                  <p className="text-lg font-semibold">
                    {borrowAmount
                      ? (
                          (Number.parseFloat(borrowAmount) *
                            (Number.parseFloat(selectedAssetData?.rate || "0") / 100)) /
                          12
                        ).toFixed(4)
                      : "0"}{" "}
                    {selectedAsset}
                  </p>
                </div>

                <div className="bg-white/5 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground">You will be locked into this rate for 30 days</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  )
}

export default function Borrow() {
  return (
    <WalletProvider>
      <BorrowContent />
    </WalletProvider>
  )
}
