"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Key, AlertTriangle, CheckCircle } from "lucide-react"

interface WalletInfo {
  address: string
  balance: number
  network: string
  chainId: number
}

interface PrivateKeyWalletProps {
  onConnect: (walletInfo: WalletInfo) => void
  onDisconnect: () => void
  isConnected: boolean
  walletInfo?: WalletInfo
}

export function PrivateKeyWallet({ onConnect, onDisconnect, isConnected, walletInfo }: PrivateKeyWalletProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [privateKey, setPrivateKey] = useState("")
  const [showPrivateKey, setShowPrivateKey] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState("")

  const handleConnect = async () => {
    if (!privateKey.trim()) {
      setError("Please enter a private key")
      return
    }

    setIsConnecting(true)
    setError("")

    try {
      // Import the wallet connector dynamically
      const { PrivateKeyWallet } = await import("../scripts/wallet-connector.js")
      const wallet = new PrivateKeyWallet()

      const result = await wallet.connectWithPrivateKey(privateKey)

      if (result.success) {
        onConnect({
          address: result.address,
          balance: result.balance,
          network: result.network,
          chainId: result.chainId,
        })
        setIsOpen(false)
        setPrivateKey("")
        setError("")
      } else {
        setError(result.error || "Failed to connect wallet")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to connect wallet")
    } finally {
      setIsConnecting(false)
    }
  }

  const handleDisconnect = () => {
    onDisconnect()
    setPrivateKey("")
    setError("")
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  if (isConnected && walletInfo) {
    return (
      <div className="flex items-center gap-2">
        <div className="bg-black/80 backdrop-blur-xl border border-gray-600/50 rounded-lg px-3 py-2 shadow-lg shadow-white/10 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse"></div>
          <div className="relative z-10 flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-400" />
            <span className="text-white text-sm font-mono drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">
              {formatAddress(walletInfo.address)}
            </span>
          </div>
        </div>
        <div className="bg-black/80 backdrop-blur-xl border border-gray-600/50 rounded-lg px-3 py-2 shadow-lg shadow-white/10">
          <span className="text-white text-sm drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">
            {walletInfo.balance.toFixed(4)} FTM
          </span>
        </div>
        <Button
          onClick={handleDisconnect}
          variant="ghost"
          size="sm"
          className="text-white hover:bg-white/10 hover:shadow-lg hover:shadow-white/20 transition-all duration-300"
        >
          Disconnect
        </Button>
      </div>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-black/80 hover:bg-black/90 text-white border border-gray-600/50 shadow-lg shadow-white/20 hover:shadow-white/30 transition-all duration-300 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
          <Key className="h-4 w-4 mr-2" />
          <span className="relative z-10 drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">Connect with Private Key</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-black/95 border border-gray-700/50 text-white shadow-2xl shadow-white/10 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)] flex items-center gap-2">
            <Key className="h-5 w-5" />
            Connect with Private Key
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Alert className="bg-yellow-500/10 border-yellow-500/30 text-yellow-300">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Security Warning:</strong> Only use this method with wallets you trust. Never share your private
              key with anyone.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <label htmlFor="privateKey" className="text-sm font-medium text-gray-300">
              Private Key
            </label>
            <div className="relative">
              <Input
                id="privateKey"
                type={showPrivateKey ? "text" : "password"}
                placeholder="Enter your private key (with or without 0x prefix)"
                value={privateKey}
                onChange={(e) => setPrivateKey(e.target.value)}
                className="bg-black/60 border border-gray-600/50 text-white placeholder:text-gray-400 pr-10 input-glow focus:border-white/50 focus:ring-1 focus:ring-white/30"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0 text-gray-400 hover:text-white"
                onClick={() => setShowPrivateKey(!showPrivateKey)}
              >
                {showPrivateKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {error && (
            <Alert className="bg-red-500/10 border-red-500/30 text-red-300">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2">
            <Button
              onClick={handleConnect}
              disabled={isConnecting || !privateKey.trim()}
              className="flex-1 bg-white/10 hover:bg-white/20 text-white border border-gray-600/50 shadow-lg shadow-white/20 hover:shadow-white/30 transition-all duration-300 btn-glow relative overflow-hidden disabled:opacity-50"
            >
              <span className="relative z-10 drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">
                {isConnecting ? "Connecting..." : "Connect Wallet"}
              </span>
            </Button>
            <Button onClick={() => setIsOpen(false)} variant="ghost" className="text-white hover:bg-white/10">
              Cancel
            </Button>
          </div>

          <div className="text-xs text-gray-400 space-y-1">
            <p>• Your private key is processed locally and never sent to any server</p>
            <p>• Make sure you're on the correct network (Fantom Mainnet)</p>
            <p>• Double-check the website URL before entering sensitive information</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
