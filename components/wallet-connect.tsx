"use client"

import { useState } from "react"
import { useConnect, useDisconnect, useAccount } from "wagmi"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Wallet, Smartphone, Globe, LogOut } from "lucide-react"

export function WalletConnect() {
  const { connectors, connect, status, error } = useConnect()
  const { disconnect } = useDisconnect()
  const { address, isConnected } = useAccount()
  const [isOpen, setIsOpen] = useState(false)

  const getConnectorIcon = (name: string) => {
    if (name.toLowerCase().includes("metamask")) return <Wallet className="h-5 w-5" />
    if (name.toLowerCase().includes("coinbase")) return <Smartphone className="h-5 w-5" />
    if (name.toLowerCase().includes("walletconnect")) return <Globe className="h-5 w-5" />
    return <Wallet className="h-5 w-5" />
  }

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-2">
        <div className="bg-black/80 backdrop-blur-xl border border-gray-600/50 rounded-lg px-3 py-2 shadow-lg shadow-white/10 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse"></div>
          <span className="text-white text-sm font-mono relative z-10 drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">
            {formatAddress(address)}
          </span>
        </div>
        <Button
          onClick={() => disconnect()}
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/10 hover:shadow-lg hover:shadow-white/20 transition-all duration-300"
        >
          <LogOut className="h-4 w-4 drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]" />
        </Button>
      </div>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-black/80 hover:bg-black/90 text-white border border-gray-600/50 shadow-lg shadow-white/20 hover:shadow-white/30 transition-all duration-300 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
          <span className="relative z-10 drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">Connect Wallet</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-black/95 border border-gray-700/50 text-white shadow-2xl shadow-white/10 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
            Connect Your Wallet
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          {connectors.map((connector) => (
            <Card
              key={connector.uid}
              className="bg-black/60 border border-gray-700/50 hover:bg-black/80 hover:border-gray-600/70 transition-all duration-300 hover:shadow-lg hover:shadow-white/10"
            >
              <CardContent className="p-4">
                <Button
                  onClick={() => {
                    connect({ connector })
                    setIsOpen(false)
                  }}
                  disabled={status === "pending"}
                  className="w-full justify-start gap-3 bg-transparent hover:bg-white/5 text-white relative overflow-hidden group"
                  variant="ghost"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <span className="relative z-10 flex items-center gap-3">
                    {getConnectorIcon(connector.name)}
                    <span className="drop-shadow-[0_0_5px_rgba(255,255,255,0.2)]">{connector.name}</span>
                    {status === "pending" && <span className="ml-auto text-sm animate-pulse">Connecting...</span>}
                  </span>
                </Button>
              </CardContent>
            </Card>
          ))}
          {error && (
            <div className="text-red-400 text-sm mt-2 drop-shadow-[0_0_5px_rgba(239,68,68,0.5)]">
              Error: {error.message}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
