"use client"

import { WalletProvider, useWallet } from "@/lib/wallet-context"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import Link from "next/link"

function DashboardContent() {
  const { connected } = useWallet()

  const activeLoansSummary = {
    totalBorrowed: "₦15,000",
    totalOwed: "₦15,310",
    collateral: "2.5 ETH",
  }

  const activeLoans = [
    {
      id: 1,
      loanId: "LOAN-001",
      borrowed: "₦10,000",
      owed: "₦10,206",
      collateral: "1.5 ETH",
      status: "Active",
    },
    {
      id: 2,
      loanId: "LOAN-002",
      borrowed: "₦5,000",
      owed: "₦5,104",
      collateral: "1.0 ETH",
      status: "Active",
    },
  ]

  const loanHistory = [
    {
      id: 1,
      loanId: "LOAN-000",
      borrowed: "₦8,000",
      repaid: "₦8,000",
      status: "Repaid",
      date: "2025-01-15",
    },
    {
      id: 2,
      loanId: "LOAN-001",
      borrowed: "₦5,000",
      repaid: "₦5,000",
      status: "Repaid",
      date: "2025-01-10",
    },
  ]

  if (!connected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h1 className="text-3xl font-bold mb-4">Connect Your Wallet</h1>
          <p className="text-muted-foreground mb-6">Please connect your wallet to view your dashboard</p>
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

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your borrowing activity</p>
        </div>

        {/* Summary Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="glass p-8 mb-8 gradient-accent"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Total Borrowed</p>
              <p className="text-3xl font-bold mb-1">{activeLoansSummary.totalBorrowed}</p>
              <p className="text-xs text-muted-foreground">All time</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">Total Owed</p>
              <p className="text-3xl font-bold text-red-500 mb-1">{activeLoansSummary.totalOwed}</p>
              <p className="text-xs text-muted-foreground">Including interest</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">Collateral</p>
              <p className="text-3xl font-bold mb-1">{activeLoansSummary.collateral}</p>
              <p className="text-xs text-muted-foreground">Deposited</p>
            </div>
          </div>
        </motion.div>

        {/* Active Loans */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="mb-8"
        >
          <h2 className="text-xl font-bold mb-4">Active Loans</h2>
          <div className="glass p-6 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-semibold">Loan ID</th>
                  <th className="text-left py-3 px-4 font-semibold">Borrowed</th>
                  <th className="text-left py-3 px-4 font-semibold">Owed</th>
                  <th className="text-left py-3 px-4 font-semibold">Collateral</th>
                  <th className="text-left py-3 px-4 font-semibold">Status</th>
                  <th className="text-left py-3 px-4 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {activeLoans.map((loan) => (
                  <tr key={loan.id} className="border-b border-border/50 hover:bg-white/5 transition-colors">
                    <td className="py-4 px-4 font-medium">{loan.loanId}</td>
                    <td className="py-4 px-4">{loan.borrowed}</td>
                    <td className="py-4 px-4 text-red-500 font-medium">{loan.owed}</td>
                    <td className="py-4 px-4">{loan.collateral}</td>
                    <td className="py-4 px-4">
                      <span className="inline-block px-2 py-1 rounded-full bg-green-500/20 text-green-600 text-xs font-medium">
                        {loan.status}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <Link href={`/repay/${loan.loanId}`}>
                        <Button size="sm" className="rounded-lg bg-blue-500 hover:bg-blue-600 text-white border-0">
                          Repay
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Loan History */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <h2 className="text-xl font-bold mb-4">Loan History</h2>
          <div className="glass p-6 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-semibold">Loan ID</th>
                  <th className="text-left py-3 px-4 font-semibold">Borrowed</th>
                  <th className="text-left py-3 px-4 font-semibold">Repaid</th>
                  <th className="text-left py-3 px-4 font-semibold">Status</th>
                  <th className="text-left py-3 px-4 font-semibold">Date</th>
                </tr>
              </thead>
              <tbody>
                {loanHistory.map((loan) => (
                  <tr key={loan.id} className="border-b border-border/50 hover:bg-white/5 transition-colors">
                    <td className="py-4 px-4 font-medium">{loan.loanId}</td>
                    <td className="py-4 px-4">{loan.borrowed}</td>
                    <td className="py-4 px-4">{loan.repaid}</td>
                    <td className="py-4 px-4">
                      <span className="inline-block px-2 py-1 rounded-full bg-blue-500/20 text-blue-600 text-xs font-medium">
                        {loan.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-muted-foreground">{loan.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </main>
    </div>
  )
}

export default function Dashboard() {
  return (
    <WalletProvider>
      <DashboardContent />
    </WalletProvider>
  )
}
