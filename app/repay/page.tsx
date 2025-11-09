"use client"

import { WalletProvider, useWallet } from "@/lib/wallet-context"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { Check } from "lucide-react"
import { useState } from "react"
import Link from "next/link"

function RepayContent() {
  const { connected } = useWallet()
  const [selectedLoan, setSelectedLoan] = useState(0)
  const [repayAmount, setRepayAmount] = useState("")

  const loans = [
    { id: 1, asset: "ETH", borrowed: "1.5", rate: "8.5%", due: "2025-02-15", interest: "0.0892", total: "1.5892" },
    { id: 2, asset: "USDC", borrowed: "5,000", rate: "6.2%", due: "2025-03-20", interest: "155.50", total: "5155.50" },
  ]

  const currentLoan = loans[selectedLoan]

  if (!connected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h1 className="text-3xl font-bold mb-4">Connect Your Wallet</h1>
          <p className="text-muted-foreground mb-6">Please connect your wallet to repay loans</p>
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
          <h1 className="text-3xl font-bold mb-2">Repay Loan</h1>
          <p className="text-muted-foreground">Select a loan and pay your balance</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Loan Selection */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-2"
          >
            <div className="glass p-6 mb-6">
              <h2 className="text-xl font-bold mb-6">Select Loan to Repay</h2>
              <div className="space-y-3">
                {loans.map((loan, idx) => (
                  <button
                    key={loan.id}
                    onClick={() => setSelectedLoan(idx)}
                    className={`glass p-4 w-full text-left rounded-xl transition-all ${
                      selectedLoan === idx ? "bg-blue-500/20 border-blue-400" : "hover:bg-white/10"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold mb-1">
                          {loan.borrowed} {loan.asset}
                        </p>
                        <p className="text-xs text-muted-foreground">Rate: {loan.rate}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold">
                          {loan.total} {loan.asset}
                        </p>
                        <p className="text-xs text-red-500">Due: {loan.due}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Repay Form */}
            <div className="glass p-6">
              <h2 className="text-xl font-bold mb-6">Repayment Details</h2>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Principal</p>
                    <p className="text-2xl font-bold">{currentLoan.borrowed}</p>
                    <p className="text-xs text-muted-foreground">{currentLoan.asset}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Accrued Interest</p>
                    <p className="text-2xl font-bold text-orange-500">{currentLoan.interest}</p>
                    <p className="text-xs text-muted-foreground">{currentLoan.asset}</p>
                  </div>
                </div>

                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-sm font-medium mb-1">Total Amount Due</p>
                  <p className="text-3xl font-bold text-blue-500 mb-2">
                    {currentLoan.total} {currentLoan.asset}
                  </p>
                  <p className="text-xs text-muted-foreground">Due by {currentLoan.due}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Repay Amount</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="0.00"
                      value={repayAmount}
                      onChange={(e) => setRepayAmount(e.target.value)}
                      className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                    <Button
                      variant="outline"
                      className="rounded-lg bg-transparent"
                      onClick={() => setRepayAmount(currentLoan.total)}
                    >
                      Full Amount
                    </Button>
                  </div>
                </div>

                <Button className="w-full rounded-lg bg-gradient-to-r from-green-500 to-emerald-400 hover:from-green-600 hover:to-emerald-500 text-white border-0 py-6">
                  <Check className="mr-2 w-4 h-4" /> Repay Loan
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Summary */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <div className="glass p-6 sticky top-24">
              <h3 className="text-lg font-bold mb-6">Repayment Summary</h3>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Repaying</p>
                  <p className="text-2xl font-bold">
                    {repayAmount || "0"} {currentLoan.asset}
                  </p>
                </div>

                <div className="border-t border-border pt-4">
                  <p className="text-sm text-muted-foreground mb-1">Remaining Balance</p>
                  <p className="text-xl font-bold">
                    {repayAmount
                      ? (Number.parseFloat(currentLoan.total) - Number.parseFloat(repayAmount || 0)).toFixed(4)
                      : currentLoan.total}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-1">Transaction Fee</p>
                  <p className="text-lg font-semibold">~$2.50</p>
                </div>

                <div className="bg-white/5 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground">Transaction will complete in ~15 seconds</p>
                </div>

                <Button className="w-full rounded-lg bg-gradient-to-r from-green-500 to-emerald-400 hover:from-green-600 hover:to-emerald-500 text-white border-0 py-6">
                  Confirm & Repay
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  )
}

export default function Repay() {
  return (
    <WalletProvider>
      <RepayContent />
    </WalletProvider>
  )
}
