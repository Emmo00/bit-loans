"use client"

import { useWallet } from "@/lib/use-wallet"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { Check, ArrowLeft, AlertCircle } from "lucide-react"
import { useState } from "react"
import Link from "next/link"

function RepayLoanContent({ params }: { params: { loanId: string } }) {
  const { connected } = useWallet()
  const [repayAmount, setRepayAmount] = useState("")
  const [showConfirm, setShowConfirm] = useState(false)

  const loanData = {
    id: params.loanId,
    borrowed: 10000,
    owed: 10206,
    collateral: 1.5,
    dueDate: "2025-02-15",
  }

  const remainingBalance =
    repayAmount && repayAmount !== "0"
      ? Math.max(0, loanData.owed - Number.parseFloat(repayAmount)).toFixed(2)
      : loanData.owed.toFixed(2)

  const collateralToRelease =
    repayAmount && repayAmount !== "0"
      ? ((Number.parseFloat(repayAmount) / loanData.owed) * loanData.collateral).toFixed(4)
      : "0"

  if (!connected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h1 className="text-3xl font-bold mb-4">Connect Your Wallet</h1>
          <p className="text-muted-foreground mb-6">Please connect your wallet to repay</p>
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
        <Link
          href="/repay"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Loans
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Repay {loanData.id}</h1>
          <p className="text-muted-foreground">Make a payment toward your loan</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="glass p-8 mb-6"
        >
          {/* Loan Summary Card */}
          <div className="bg-gradient-accent rounded-lg p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Loan Summary</h2>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Borrowed</p>
                <p className="text-2xl font-bold">₦{loanData.borrowed.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Owed</p>
                <p className="text-2xl font-bold text-red-500">₦{loanData.owed.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Collateral</p>
                <p className="text-2xl font-bold">{loanData.collateral} ETH</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Due Date</p>
                <p className="text-2xl font-bold">{loanData.dueDate}</p>
              </div>
            </div>
          </div>

          {/* Repayment Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-3">Repayment Amount (cNGN)</label>
            <div className="relative mb-3">
              <input
                type="number"
                placeholder="0"
                value={repayAmount}
                onChange={(e) => setRepayAmount(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-4 text-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">cNGN</span>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="rounded-lg bg-transparent flex-1"
                onClick={() => setRepayAmount((loanData.owed * 0.25).toFixed(0))}
              >
                25%
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="rounded-lg bg-transparent flex-1"
                onClick={() => setRepayAmount((loanData.owed * 0.5).toFixed(0))}
              >
                50%
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="rounded-lg bg-transparent flex-1"
                onClick={() => setRepayAmount(loanData.owed.toFixed(0))}
              >
                Max
              </Button>
            </div>
          </div>

          {/* Dynamic Feedback */}
          <div className="space-y-3 bg-white/5 rounded-lg p-4 mb-6">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Repaying Amount</span>
              <span className="font-semibold">₦{repayAmount || "0"}</span>
            </div>
            <div className="border-t border-border/50"></div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">After this payment, you'll owe</span>
              <span className="text-lg font-bold text-blue-500">₦{remainingBalance}</span>
            </div>
            <div className="border-t border-border/50"></div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Collateral to be released</span>
              <span className="font-semibold">{collateralToRelease} ETH</span>
            </div>
          </div>

          {/* Info Alert */}
          <div className="flex items-start gap-3 bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-6">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900 dark:text-blue-200">
              <p className="font-medium mb-1">Note</p>
              <p>Your collateral will be proportionally released based on the amount repaid.</p>
            </div>
          </div>

          <Button
            onClick={() => setShowConfirm(true)}
            disabled={!repayAmount || Number.parseFloat(repayAmount) === 0}
            className="w-full rounded-lg bg-gradient-to-r from-green-500 to-emerald-400 hover:from-green-600 hover:to-emerald-500 text-white border-0 py-6 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Check className="mr-2 w-4 h-4" /> Confirm Repayment
          </Button>
        </motion.div>

        {/* Confirmation Modal */}
        {showConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-background p-8 max-w-sm rounded-xl border border-border shadow-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold mb-4">Confirm Repayment</h3>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="font-semibold">₦{repayAmount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Remaining Balance</span>
                  <span className="font-semibold text-blue-500">₦{remainingBalance}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ETH Released</span>
                  <span className="font-semibold">{collateralToRelease} ETH</span>
                </div>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 rounded-lg bg-transparent"
                  onClick={() => setShowConfirm(false)}
                >
                  Cancel
                </Button>
                <Button className="flex-1 rounded-lg bg-gradient-to-r from-green-500 to-emerald-400 hover:from-green-600 hover:to-emerald-500 text-white border-0">
                  <Check className="mr-2 w-4 h-4" /> Confirm
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </main>
    </div>
  )
}

export default function RepayLoan({
  params,
}: {
  params: { loanId: string }
}) {
  return <RepayLoanContent params={params} />
}
