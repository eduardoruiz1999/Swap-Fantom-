"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ArrowUpDown, Settings, TrendingUp, Info } from "lucide-react"
import { FANTOM_TOKENS } from "@/lib/web3-config"
import { FEE_TIERS } from "@/lib/uniswap-v3-config"
import { useUniswapV3 } from "@/hooks/useUniswapV3"
import { useAccount } from "wagmi"

export function UniswapV3Swap() {
  const { address, isConnected } = useAccount()
  const { getQuote, executeSwap, getPoolInfo, isLoading } = useUniswapV3()

  const [fromToken, setFromToken] = useState(FANTOM_TOKENS[0])
  const [toToken, setToToken] = useState(FANTOM_TOKENS[1])
  const [fromAmount, setFromAmount] = useState("")
  const [toAmount, setToAmount] = useState("")
  const [slippage, setSlippage] = useState(0.5)
  const [selectedFee, setSelectedFee] = useState(FEE_TIERS.MEDIUM)
  const [priceImpact, setPriceImpact] = useState(0)
  const [gasEstimate, setGasEstimate] = useState("")
  const [poolInfo, setPoolInfo] = useState<any>(null)

  // Get quote when amount or tokens change
  useEffect(() => {
    const fetchQuote = async () => {
      if (!fromAmount || !fromToken || !toToken || fromAmount === "0") {
        setToAmount("")
        return
      }

      const quote = await getQuote(fromToken.address, toToken.address, fromAmount, selectedFee)
      if (quote) {
        setToAmount(quote.amountOut)
        setPriceImpact(quote.priceImpact)
        setGasEstimate(quote.gasEstimate)
      }
    }

    const timeoutId = setTimeout(fetchQuote, 500) // Debounce
    return () => clearTimeout(timeoutId)
  }, [fromAmount, fromToken, toToken, selectedFee, getQuote])

  // Get pool info when tokens change
  useEffect(() => {
    const fetchPoolInfo = async () => {
      if (!fromToken || !toToken) return

      const info = await getPoolInfo(fromToken.address, toToken.address, selectedFee)
      setPoolInfo(info)
    }

    fetchPoolInfo()
  }, [fromToken, toToken, selectedFee, getPoolInfo])

  const handleSwapTokens = () => {
    const tempToken = fromToken
    setFromToken(toToken)
    setToToken(tempToken)
    setFromAmount(toAmount)
    setToAmount(fromAmount)
  }

  const handleSwap = async () => {
    if (!isConnected || !fromAmount || !address) return

    const result = await executeSwap({
      tokenIn: fromToken.address,
      tokenOut: toToken.address,
      amountIn: fromAmount,
      slippage,
    })

    if (result.success) {
      alert(`Swap successful! Transaction: ${result.txHash}`)
      setFromAmount("")
      setToAmount("")
    } else {
      alert(`Swap failed: ${result.error}`)
    }
  }

  const getFeeLabel = (fee: number) => {
    switch (fee) {
      case FEE_TIERS.LOWEST:
        return "0.01%"
      case FEE_TIERS.LOW:
        return "0.05%"
      case FEE_TIERS.MEDIUM:
        return "0.3%"
      case FEE_TIERS.HIGH:
        return "1%"
      default:
        return `${fee / 10000}%`
    }
  }

  const getPriceImpactColor = (impact: number) => {
    if (impact < 0.1) return "text-green-400"
    if (impact < 1) return "text-yellow-400"
    return "text-red-400"
  }

  return (
    <Card className="bg-black/80 backdrop-blur-xl border border-gray-700/50 shadow-2xl shadow-white/10 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-20 animate-pulse"></div>
      <div className="absolute inset-[1px] bg-black/90 rounded-lg"></div>
      <div className="relative z-10">
        <CardHeader className="pb-4">
          <div className="flex justify-between items-center">
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Uniswap V3 Swap
            </CardTitle>
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Fee Tier Selection */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm text-gray-300">
              <span>Fee Tier</span>
              {poolInfo && (
                <Badge variant="outline" className="text-xs">
                  Pool exists
                </Badge>
              )}
            </div>
            <div className="flex gap-1">
              {Object.entries(FEE_TIERS).map(([key, fee]) => (
                <Button
                  key={key}
                  variant={selectedFee === fee ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setSelectedFee(fee)}
                  className={`h-8 px-3 text-xs transition-all duration-300 ${
                    selectedFee === fee
                      ? "bg-white/20 text-white shadow-lg shadow-white/20 border border-white/30"
                      : "bg-black/40 text-gray-300 hover:bg-white/10 hover:text-white border border-gray-600/30"
                  }`}
                >
                  {getFeeLabel(fee)}
                </Button>
              ))}
            </div>
          </div>

          {/* From Token */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-300">
              <span>From</span>
              <span>Balance: 1500.0 {fromToken.symbol}</span>
            </div>
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="0.0"
                value={fromAmount}
                onChange={(e) => setFromAmount(e.target.value)}
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
                          className="w-5 h-5 rounded-full"
                        />
                        <span>{token.symbol}</span>
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
              className="rounded-full bg-black/80 hover:bg-black/90 text-white border border-gray-600/50 shadow-lg shadow-white/20 hover:shadow-white/30 transition-all duration-300"
            >
              <ArrowUpDown className="h-4 w-4" />
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
              {[0.1, 0.5, 1.0].map((value) => (
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
                  {value}%
                </Button>
              ))}
            </div>
          </div>

          {/* Swap Button */}
          <Button
            onClick={handleSwap}
            disabled={!isConnected || !fromAmount || Number.parseFloat(fromAmount) <= 0 || isLoading}
            className="w-full bg-black/80 hover:bg-black/90 text-white font-semibold py-3 border border-gray-600/50 shadow-lg shadow-white/20 hover:shadow-white/30 transition-all duration-300 btn-glow relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="relative z-10 drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">
              {!isConnected
                ? "Connect Wallet"
                : isLoading
                  ? "Loading..."
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
                <span>Price Impact</span>
                <span className={getPriceImpactColor(priceImpact)}>{priceImpact.toFixed(2)}%</span>
              </div>
              <div className="flex justify-between">
                <span>Network Fee</span>
                <span>~{gasEstimate ? (Number.parseInt(gasEstimate) / 1000000).toFixed(3) : "0.001"} FTM</span>
              </div>
              <div className="flex justify-between">
                <span>Fee Tier</span>
                <span>{getFeeLabel(selectedFee)}</span>
              </div>
            </div>
          )}

          {/* Pool Info */}
          {poolInfo && (
            <div className="flex items-center gap-2 text-xs text-gray-400 bg-white/5 rounded-lg p-2">
              <Info className="h-3 w-3" />
              <span>Pool Liquidity: {Number.parseInt(poolInfo.liquidity).toLocaleString()}</span>
            </div>
          )}
        </CardContent>
      </div>
    </Card>
  )
}
