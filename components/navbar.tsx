"use client"

import { useWallet } from "@/lib/wallet-context"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"

export function Navbar() {
  const { connected, connect, disconnect, address } = useWallet()
  const pathname = usePathname()

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/dashboard", label: "Dashboard" },
    { href: "/borrow", label: "Borrow" },
    { href: "/repay", label: "Repay" },
    { href: "/admin", label: "Admin" },
  ]

  return (
    <nav className="glass sticky top-0 z-50 border-b bg-white/80 dark:bg-black/60 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-lg" />
            <span className="font-bold text-lg hidden sm:inline">BitLoans</span>
          </Link>

          <div className="hidden md:flex gap-1">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button variant={pathname === item.href ? "default" : "ghost"} className="rounded-lg">
                  {item.label}
                </Button>
              </Link>
            ))}
          </div>

          <Button
            onClick={connected ? disconnect : connect}
            className="rounded-lg bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 text-white border-0"
          >
            {connected ? `${address}` : "Connect Wallet"}
          </Button>
        </div>
      </div>
    </nav>
  )
}
