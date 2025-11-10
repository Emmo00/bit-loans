"use client"

import { WalletProvider, useWallet } from "@/lib/wallet-context"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import Link from "next/link"

function RepayContent() {
  const { connected } = useWallet()

  const activeLoans = [
    {
      id: "LOAN-001",
      borrowed: "₦10,000",
      owed: "₦10,206",
      collateral: "1.5 ETH",
      dueDate: "2025-02-15",
    },
    {
      id: "LOAN-002",
      borrowed: "₦5,000",
      owed: "₦5,104",
      collateral: "1.0 ETH",
      dueDate: "2025-03-20",
    },
  ]

  if (!connected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
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

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Repay Loans</h1>
          <p className="text-muted-foreground">Select a loan to make a payment</p>
        </div>

        {activeLoans.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="glass p-12 text-center"
          >
            <h2 className="text-xl font-semibold mb-2">No Active Loans</h2>
            <p className="text-muted-foreground mb-6">You don't have any active loans to repay.</p>
            <Link href="/borrow">
              <Button className="rounded-lg bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 text-white border-0">
                Start Borrowing
              </Button>
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {activeLoans.map((loan, idx) => (
              <motion.div
                key={loan.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1, duration: 0.5 }}
                className="glass p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
              >
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">{loan.id}</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                    <div>
                      <p>Borrowed: {loan.borrowed}</p>
                      <p>Owed: {loan.owed}</p>
                    </div>
                    <div>
                      <p>Collateral: {loan.collateral}</p>
                      <p>Due: {loan.dueDate}</p>
                    </div>
                  </div>
                </div>
                <Link href={`/repay/${loan.id}`} className="sm:flex-shrink-0">
                  <Button className="w-full sm:w-auto rounded-lg bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 text-white border-0">
                    Repay <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
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
