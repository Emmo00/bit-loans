"use client"

import { WalletProvider } from "@/lib/wallet-context"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { BarChart3, Users, Zap, AlertCircle } from "lucide-react"

function AdminContent() {
  const stats = [
    { icon: Zap, label: "Total Volume", value: "$125.4M", change: "+15.2%", color: "text-blue-500" },
    { icon: Users, label: "Active Users", value: "45,280", change: "+8.5%", color: "text-cyan-400" },
    { icon: BarChart3, label: "Total Loans", value: "$85.2M", change: "+12.3%", color: "text-purple-500" },
    { icon: AlertCircle, label: "System Health", value: "99.8%", change: "Optimal", color: "text-green-500" },
  ]

  const recentTransactions = [
    { id: 1, user: "0x742d...8E0C", action: "Borrowed 1.5 ETH", amount: "$3,150", time: "2 min ago" },
    { id: 2, user: "0x8F2a...3B9D", action: "Repaid 5,000 USDC", amount: "$5,000", time: "15 min ago" },
    { id: 3, user: "0x5C3e...7F2A", action: "Borrowed 10,000 DAI", amount: "$10,000", time: "32 min ago" },
    { id: 4, user: "0xB1d2...4K8J", action: "Repaid 2.5 ETH", amount: "$5,250", time: "1 hour ago" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Platform overview and analytics</p>
        </div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {stats.map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
              className="glass p-6 group hover:bg-white/15 transition-all"
            >
              <stat.icon className={`w-8 h-8 mb-4 ${stat.color}`} />
              <p className="text-sm text-muted-foreground mb-2">{stat.label}</p>
              <h3 className="text-2xl font-bold mb-2">{stat.value}</h3>
              <p
                className={`text-xs font-medium ${stat.change.includes("-") ? "text-red-500" : stat.change === "Optimal" ? "text-green-500" : "text-green-500"}`}
              >
                {stat.change}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* System Status */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8"
        >
          <div className="glass p-6 lg:col-span-2">
            <h2 className="text-lg font-bold mb-6">Protocol Status</h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Collateral Ratio</span>
                  <span className="text-sm text-muted-foreground">152%</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-cyan-400 h-2 rounded-full"
                    style={{ width: "76%" }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Utilization Rate</span>
                  <span className="text-sm text-muted-foreground">68%</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full"
                    style={{ width: "68%" }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Emergency Reserve</span>
                  <span className="text-sm text-muted-foreground">45%</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-green-500 to-emerald-400 h-2 rounded-full"
                    style={{ width: "45%" }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="glass p-6">
            <h3 className="text-lg font-bold mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Button className="w-full rounded-lg bg-blue-500 hover:bg-blue-600 text-white border-0">
                Update Rates
              </Button>
              <Button variant="outline" className="w-full rounded-lg bg-transparent">
                View Reports
              </Button>
              <Button variant="outline" className="w-full rounded-lg bg-transparent">
                System Settings
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Recent Transactions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <h2 className="text-lg font-bold mb-4">Recent Transactions</h2>
          <div className="glass p-6 overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-semibold">User</th>
                  <th className="text-left py-3 px-4 font-semibold">Action</th>
                  <th className="text-left py-3 px-4 font-semibold">Amount</th>
                  <th className="text-left py-3 px-4 font-semibold">Time</th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.map((tx, idx) => (
                  <tr key={idx} className="border-b border-border/50 hover:bg-white/5 transition-colors">
                    <td className="py-4 px-4 font-mono text-sm">{tx.user}</td>
                    <td className="py-4 px-4">{tx.action}</td>
                    <td className="py-4 px-4 font-semibold text-blue-400">{tx.amount}</td>
                    <td className="py-4 px-4 text-muted-foreground text-sm">{tx.time}</td>
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

export default function Admin() {
  return (
    <WalletProvider>
      <AdminContent />
    </WalletProvider>
  )
}
