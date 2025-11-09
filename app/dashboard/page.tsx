"use client"

import { WalletProvider, useWallet } from "@/lib/wallet-context"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { ArrowUpRight, ArrowDownLeft, Plus, TrendingUp } from "lucide-react"
import Link from "next/link"

function DashboardContent() {
  const { connected, balance } = useWallet()

  const portfolio = [
    { asset: "ETH", amount: "2.5842", value: "$5,234.18", change: "+12.5%", changeType: "up" },
    { asset: "USDC", amount: "10,500", value: "$10,500.00", change: "-2.3%", changeType: "down" },
    { asset: "DAI", amount: "5,000", value: "$5,000.00", change: "+0.1%", changeType: "up" },
  ]

  const loans = [
    { id: 1, asset: "ETH", borrowed: "1.5", rate: "8.5%", due: "2025-02-15", status: "Active" },
    { id: 2, asset: "USDC", borrowed: "5,000", rate: "6.2%", due: "2025-03-20", status: "Active" },
  ]

  if (!connected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Manage your portfolio and loans</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Portfolio Value Card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="glass p-6 col-span-1 md:col-span-2"
          >
            <div className="mb-4">
              <p className="text-sm text-muted-foreground mb-2">Total Portfolio Value</p>
              <h2 className="text-4xl font-bold mb-2">${Number.parseFloat(balance) * 2000}</h2>
              <p className="text-sm text-green-500 flex items-center gap-1">
                <TrendingUp className="w-4 h-4" /> +8.2% this month
              </p>
            </div>
            <div className="flex gap-2">
              <Link href="/borrow">
                <Button className="rounded-lg bg-blue-500 hover:bg-blue-600 text-white border-0 flex-1">
                  <Plus className="w-4 h-4 mr-2" /> Borrow
                </Button>
              </Link>
              <Button variant="outline" className="rounded-lg flex-1 bg-transparent">
                Deposit
              </Button>
            </div>
          </motion.div>

          {/* Balance Card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="glass p-6"
          >
            <p className="text-sm text-muted-foreground mb-2">Wallet Balance</p>
            <h3 className="text-2xl font-bold mb-4">{balance} ETH</h3>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="rounded-lg flex-1 bg-transparent">
                <ArrowDownLeft className="w-3 h-3 mr-1" /> Receive
              </Button>
              <Button size="sm" variant="outline" className="rounded-lg flex-1 bg-transparent">
                <ArrowUpRight className="w-3 h-3 mr-1" /> Send
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Portfolio Assets */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mb-8"
        >
          <h3 className="text-xl font-bold mb-4">Your Assets</h3>
          <div className="glass p-6 overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-semibold">Asset</th>
                  <th className="text-left py-3 px-4 font-semibold">Amount</th>
                  <th className="text-left py-3 px-4 font-semibold">Value</th>
                  <th className="text-left py-3 px-4 font-semibold">24h Change</th>
                </tr>
              </thead>
              <tbody>
                {portfolio.map((item, idx) => (
                  <tr key={idx} className="border-b border-border/50 hover:bg-white/5 transition-colors">
                    <td className="py-4 px-4 font-medium">{item.asset}</td>
                    <td className="py-4 px-4">{item.amount}</td>
                    <td className="py-4 px-4">{item.value}</td>
                    <td
                      className={`py-4 px-4 font-medium ${item.changeType === "up" ? "text-green-500" : "text-red-500"}`}
                    >
                      {item.change}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Active Loans */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <h3 className="text-xl font-bold mb-4">Active Loans</h3>
          <div className="grid gap-4">
            {loans.map((loan) => (
              <div key={loan.id} className="glass p-6 flex justify-between items-center">
                <div>
                  <p className="font-semibold mb-1">{loan.asset} Loan</p>
                  <p className="text-sm text-muted-foreground">
                    Amount: {loan.borrowed} • Rate: {loan.rate}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground mb-2">Due: {loan.due}</p>
                  <Link href="/repay">
                    <Button size="sm" className="rounded-lg bg-blue-500 hover:bg-blue-600 text-white border-0">
                      Repay Loan
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
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
