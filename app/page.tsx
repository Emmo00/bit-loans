"use client"

import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/navbar"
import Link from "next/link"
import { ArrowRight, TrendingUp, Shield, Zap } from "lucide-react"
import { motion } from "framer-motion"
import { WalletProvider } from "@/lib/wallet-context"

function HomeContent() {
  const features = [
    {
      icon: TrendingUp,
      title: "Competitive Rates",
      description: "Get the best lending rates in the DeFi ecosystem with transparent pricing",
    },
    {
      icon: Shield,
      title: "Secure Smart Contracts",
      description: "Your assets are protected by audited smart contracts with multi-signature security",
    },
    {
      icon: Zap,
      title: "Instant Settlement",
      description: "Fast transactions with sub-second confirmation times on the blockchain",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <div className="inline-block mb-6">
            <div className="glass px-4 py-2">
              <span className="text-sm font-medium bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">
                Welcome to the future of lending
              </span>
            </div>
          </div>

          <h1 className="text-5xl sm:text-6xl font-bold mb-6 text-balance">
            Decentralized{" "}
            <span className="bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">Lending</span>{" "}
            Protocol
          </h1>

          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto text-balance">
            Borrow and lend crypto assets with competitive rates, transparent pricing, and complete control over your
            funds.
          </p>

          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/dashboard">
              <Button className="rounded-lg bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 text-white border-0 px-8 h-12 text-base">
                Launch App <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
            <Button variant="outline" className="rounded-lg px-8 h-12 text-base bg-transparent">
              Learn More
            </Button>
          </div>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20"
        >
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + idx * 0.1, duration: 0.5 }}
              className="glass glass-hover p-6 group"
            >
              <feature.icon className="w-8 h-8 mb-4 text-blue-500 group-hover:text-cyan-400 transition-colors" />
              <h3 className="font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="glass p-8 md:p-12 gradient-accent"
        >
          <div className="grid grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl md:text-4xl font-bold mb-2 text-blue-500">$2.5B</div>
              <div className="text-sm text-muted-foreground">Total Value Locked</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold mb-2 text-cyan-400">45K+</div>
              <div className="text-sm text-muted-foreground">Active Users</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold mb-2 text-blue-400">12.5%</div>
              <div className="text-sm text-muted-foreground">Average APY</div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  )
}

export default function Home() {
  return (
    <WalletProvider>
      <HomeContent />
    </WalletProvider>
  )
}
