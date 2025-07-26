"use client"

import { useState } from "react"
import { useAccount, useBalance } from "wagmi"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowUpDown, Settings, Zap } from "lucide-react"
import { FANTOM_TOKENS } from "@/lib/web3-config"
import { formatUnits } from "viem"
import { WalletConnect } from "@/components/wallet-connect"
import TransactionHistory from "@/components/transaction-history"
import { PrivateKeyWallet } from "@/components/private-key-wallet"

export default function SwapPage() {
  const { address, isConnected } = useAccount()
  const [fromToken, setFromToken] = useState(FANTOM_TOKENS[0])
  const [toToken, setToToken] = useState(FANTOM_TOKENS[1])
  const [fromAmount, setFromAmount] = useState("")
  const [toAmount, setToAmount] = useState("")
  const [slippage, setSlippage] = useState("0.5")

  const [privateKeyWallet, setPrivateKeyWallet] = useState<{
    address: string
    balance: number
    network: string
    chainId: number
  } | null>(null)
  const [isPrivateKeyConnected, setIsPrivateKeyConnected] = useState(false)

  const [transactions] = useState([
    {
      id: "1",
      type: "swap" as const,
      fromToken: "FTM",
      toToken: "JEFE",
      amount: "100",
      status: "success" as const,
      hash: "0x1234567890abcdef1234567890abcdef12345678",
      timestamp: new Date(Date.now() - 300000),
    },
    {
      id: "2",
      type: "approve" as const,
      fromToken: "USDC",
      amount: "1000",
      status: "pending" as const,
      hash: "0x9876543210fedcba9876543210fedcba98765432",
      timestamp: new Date(Date.now() - 60000),
    },
  ])

  const { data: fromBalance } = useBalance({
    address: address,
    token:
      fromToken.address === "0x0000000000000000000000000000000000000000"
        ? undefined
        : (fromToken.address as `0x${string}`),
  })

  const handlePrivateKeyConnect = (walletInfo: any) => {
    setPrivateKeyWallet(walletInfo)
    setIsPrivateKeyConnected(true)
  }

  const handlePrivateKeyDisconnect = () => {
    setPrivateKeyWallet(null)
    setIsPrivateKeyConnected(false)
  }

  const handleSwapTokens = () => {
    const tempToken = fromToken
    setFromToken(toToken)
    setToToken(tempToken)
    setFromAmount(toAmount)
    setToAmount(fromAmount)
  }

  const handleSwap = async () => {
    const isAnyWalletConnected = isConnected || isPrivateKeyConnected
    if (!isAnyWalletConnected || !fromAmount) return

    console.log("Executing swap:", {
      from: fromToken.symbol,
      to: toToken.symbol,
      amount: fromAmount,
      slippage,
    })

    alert(`Swap de ${fromAmount} ${fromToken.symbol} a ${toToken.symbol} ejecutado exitosamente!`)
  }

  const calculateToAmount = (amount: string) => {
    if (!amount) return ""
    const rate = fromToken.symbol === "FTM" ? 0.5 : 2
    return (Number.parseFloat(amount) * rate).toFixed(6)
  }

  const handleFromAmountChange = (value: string) => {
    setFromAmount(value)
    setToAmount(calculateToAmount(value))
  }

  const isAnyWalletConnected = isConnected || isPrivateKeyConnected // Declare the variable here

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black p-4 relative overflow-hidden">
      {/* Efectos de brillo de fondo */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-800/20 to-transparent animate-pulse"></div>
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gray-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>

      <div className="container mx-auto max-w-md relative z-10">
        {/* Header */}
        <div className="flex justify-between items-center mb-8 pt-4">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Zap className="h-8 w-8 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
              <div className="absolute inset-0 h-8 w-8 bg-white/20 rounded-full blur-md"></div>
            </div>
            <h1 className="text-2xl font-bold text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]">Fantom Swap</h1>
          </div>
          <div className="flex items-center gap-2">
            <WalletConnect />
            <PrivateKeyWallet
              onConnect={handlePrivateKeyConnect}
              onDisconnect={handlePrivateKeyDisconnect}
              isConnected={isPrivateKeyConnected}
              walletInfo={privateKeyWallet}
            />
          </div>
        </div>

        {/* Swap Card */}
        <Card className="bg-black/80 backdrop-blur-xl border border-gray-700/50 shadow-2xl shadow-white/10 relative overflow-hidden">
          {/* Efecto de brillo en el borde */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-20 animate-pulse"></div>
          <div className="absolute inset-[1px] bg-black/90 rounded-lg"></div>
          <div className="relative z-10">
            <CardHeader className="pb-4">
              <div className="flex justify-between items-center">
                <CardTitle className="text-white">Swap Tokens</CardTitle>
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* From Token */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-300">
                  <span>From</span>
                  <span>
                    Balance: {fromBalance ? formatUnits(fromBalance.value, fromBalance.decimals) : "9"}
                    {"1500000000"}
                    {fromToken.symbol}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="0.0"
                    value={fromAmount}
                    onChange={(e) => handleFromAmountChange(e.target.value)}
                    className="flex-1 bg-black/60 border border-gray-600/50 text-white placeholder:text-gray-400 input-glow focus:border-white/50 focus:ring-1 focus:ring-white/30"
                  />
                  <Select
                    value={fromToken.symbol}
                    onValueChange={(value) => {
                      const token = FANTOM_TOKENS.find((t) => t.symbol === value)
                      if (token) setFromToken(token)
                    }}
                  >
                    <SelectTrigger className="w-32 bg-black/60 border border-gray-600/50 text-white select-glow focus:border-white/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-black/95 border border-gray-700/50 backdrop-blur-xl">
                      {FANTOM_TOKENS.map((token) => (
                        <SelectItem
                          key={token.symbol}
                          value={token.symbol}
                          className="text-white hover:bg-white/10 focus:bg-white/10"
                        >
                          <div className="flex items-center gap-2">
                            <img
                              src={token.logoURI || "/placeholder.svg"}
                              alt={token.symbol}
                              className="w-5 h-5 rounded-full shadow-sm shadow-white/20"
                            />
                            <span className="drop-shadow-[0_0_5px_rgba(255,255,255,0.2)]">{token.symbol}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Swap Button */}
              <div className="flex justify-center">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleSwapTokens}
                  className="rounded-full bg-black/80 hover:bg-black/90 text-white border border-gray-600/50 shadow-lg shadow-white/20 hover:shadow-white/30 transition-all duration-300 btn-glow relative overflow-hidden"
                >
                  <ArrowUpDown className="h-4 w-4 drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]" />
                </Button>
              </div>

              {/* To Token */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-300">
                  <span>To</span>
                  <span>≈ ${(Number.parseFloat(toAmount || "0") * 1.2).toFixed(2)}</span>
                </div>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="0.0"
                    value={toAmount}
                    readOnly
                    className="flex-1 bg-black/60 border border-gray-600/50 text-white placeholder:text-gray-400 focus:border-white/50 focus:ring-1 focus:ring-white/30 shadow-inner"
                  />
                  <Select
                    value={toToken.symbol}
                    onValueChange={(value) => {
                      const token = FANTOM_TOKENS.find((t) => t.symbol === value)
                      if (token) setToToken(token)
                    }}
                  >
                    <SelectTrigger className="w-32 bg-black/60 border border-gray-600/50 text-white focus:border-white/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FANTOM_TOKENS.map((token) => (
                        <SelectItem key={token.symbol} value={token.symbol}>
                          <div className="flex items-center gap-2">
                            <img
                              src={token.logoURI || "/placeholder.svg"}
                              alt={token.symbol}
                              className="w-5 h-5 rounded-full"
                            />
                            {token.symbol}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Slippage Settings */}
              <div className="flex justify-between items-center text-sm text-gray-300">
                <span>Slippage Tolerance</span>
                <div className="flex gap-1">
                  {["0.1", "0.5", "1.0"].map((value) => (
                    <Button
                      key={value}
                      variant={slippage === value ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setSlippage(value)}
                      className={`h-6 px-2 text-xs transition-all duration-300 ${
                        slippage === value
                          ? "bg-white/20 text-white shadow-lg shadow-white/20 border border-white/30"
                          : "bg-black/40 text-gray-300 hover:bg-white/10 hover:text-white border border-gray-600/30"
                      }`}
                    >
                      <span className="drop-shadow-[0_0_5px_rgba(255,255,255,0.2)]">{value}%</span>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Swap Button */}
              <Button
                onClick={handleSwap}
                disabled={!isAnyWalletConnected || !fromAmount || Number.parseFloat(fromAmount) <= 0}
                className="w-full bg-black/80 hover:bg-black/90 text-white font-semibold py-3 border border-gray-600/50 shadow-lg shadow-white/20 hover:shadow-white/30 transition-all duration-300 btn-glow relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="relative z-10 drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">
                  {!isAnyWalletConnected
                    ? "Connect Wallet"
                    : !fromAmount || Number.parseFloat(fromAmount) <= 0
                      ? "Enter Amount"
                      : `Swap ${fromToken.symbol} for ${toToken.symbol}`}
                </span>
              </Button>

              {/* Transaction Details */}
              {fromAmount && toAmount && (
                <div className="space-y-2 text-sm text-gray-300 bg-white/5 rounded-lg p-3">
                  <div className="flex justify-between">
                    <span>Rate</span>
                    <span>
                      1 {fromToken.symbol} = {(Number.parseFloat(toAmount) / Number.parseFloat(fromAmount)).toFixed(6)}{" "}
                      {toToken.symbol}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Network Fee</span>
                    <span>~0.001 FTM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Price Impact</span>
                    <span className="text-green-400">{"<0.01%"}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </div>
        </Card>

        {/* Network Info */}
        <div className="mt-6 text-center text-gray-300 text-sm">
          <p>Connected to Fantom Network</p>
          <p className="text-xs mt-1">Powered by SpookySwap & SpiritSwap</p>
        </div>

        {/* Transaction History */}
        {isAnyWalletConnected && <TransactionHistory transactions={transactions} />}
      </div>
    </div>
  )
}
