"use client"

import { useWallet } from "@/lib/use-wallet"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { ArrowRight, AlertCircle } from "lucide-react"
import { useState } from "react"
import Link from "next/link"

function BorrowContent() {
  const { connected } = useWallet()
  const [borrowAmount, setBorrowAmount] = useState("")

  const ethPrice = 3500 // cNGN per ETH
  const fee = 0.005 // 0.5% fee

  const requiredETH =
    borrowAmount && borrowAmount !== "0" ? ((Number.parseFloat(borrowAmount) / ethPrice) * (1 + fee)).toFixed(4) : "0"

  const estimatedRepayment =
    borrowAmount && borrowAmount !== "0" ? (Number.parseFloat(borrowAmount) * (1 + fee)).toFixed(0) : "0"

  if (!connected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
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

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Borrow cNGN</h1>
          <p className="text-muted-foreground">Enter the amount of cNGN you want to borrow</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="glass p-8 mb-6"
        >
          <div className="mb-6">
            <label className="block text-sm font-medium mb-3">Amount to Borrow (cNGN)</label>
            <div className="relative">
              <input
                type="number"
                placeholder="10,000"
                value={borrowAmount}
                onChange={(e) => setBorrowAmount(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-4 text-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">cNGN</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Min: ₦1,000 • Max: ₦100,000</p>
          </div>

          {/* Required ETH Calculation */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-6">
            <p className="text-sm font-medium mb-2">ETH Required</p>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold">{requiredETH}</p>
              <p className="text-muted-foreground">ETH</p>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              You need to deposit {requiredETH} ETH as collateral (includes 0.5% fee)
            </p>
          </div>

          {/* Loan Summary */}
          <div className="bg-white/5 rounded-lg p-4 mb-6 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Borrowing Amount</span>
              <span className="font-semibold">₦{borrowAmount || "0"}</span>
            </div>
            <div className="border-t border-border/50"></div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Fee (0.5%)</span>
              <span className="font-semibold">
                ₦{borrowAmount ? (Number.parseFloat(borrowAmount) * 0.005).toFixed(0) : "0"}
              </span>
            </div>
            <div className="border-t border-border/50"></div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Estimated Repayment</span>
              <span className="text-lg font-bold text-blue-500">₦{estimatedRepayment}</span>
            </div>
          </div>

          {/* Warning */}
          <div className="flex items-start gap-3 bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 mb-6">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-900 dark:text-amber-200">
              <p className="font-medium mb-1">Important</p>
              <p>
                You will be locked into this rate for 30 days. Make sure you understand the terms before proceeding.
              </p>
            </div>
          </div>

          <Button
            disabled={!borrowAmount || Number.parseFloat(borrowAmount) === 0}
            className="w-full rounded-lg bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 text-white border-0 py-6 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Proceed to Borrow <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </motion.div>

        <p className="text-xs text-muted-foreground text-center">
          By proceeding, you agree to our terms and conditions
        </p>
      </main>
    </div>
  )
}

export default function Borrow() {
  return <BorrowContent />
}
