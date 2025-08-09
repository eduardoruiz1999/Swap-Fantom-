"use client"

import { useState, useCallback } from "react"
import { ethers } from "ethers"
import { useAccount, usePublicClient, useWalletClient } from "wagmi"
import {
  UNISWAP_V3_ADDRESSES,
  FEE_TIERS,
  SWAP_ROUTER_ABI,
  QUOTER_ABI,
  FACTORY_ABI,
  POOL_ABI,
} from "@/lib/uniswap-v3-config"

interface SwapParams {
  tokenIn: string
  tokenOut: string
  amountIn: string
  slippage: number
  deadline?: number
}

interface QuoteResult {
  amountOut: string
  gasEstimate: string
  priceImpact: number
}

export function useUniswapV3() {
  const { address } = useAccount()
  const publicClient = usePublicClient()
  const { data: walletClient } = useWalletClient()
  const [isLoading, setIsLoading] = useState(false)

  const getQuote = useCallback(
    async (
      tokenIn: string,
      tokenOut: string,
      amountIn: string,
      fee: number = FEE_TIERS.MEDIUM,
    ): Promise<QuoteResult | null> => {
      if (!publicClient) return null

      try {
        setIsLoading(true)

        const quoterContract = {
          address: UNISWAP_V3_ADDRESSES.QUOTER as `0x${string}`,
          abi: QUOTER_ABI,
        }

        const amountInWei = ethers.parseUnits(amountIn, 18)

        const result = await publicClient.readContract({
          ...quoterContract,
          functionName: "quoteExactInputSingle",
          args: [tokenIn as `0x${string}`, tokenOut as `0x${string}`, fee, amountInWei, 0n],
        })

        const [amountOut, , , gasEstimate] = result as [bigint, bigint, number, bigint]

        return {
          amountOut: ethers.formatUnits(amountOut, 18),
          gasEstimate: gasEstimate.toString(),
          priceImpact: 0.1, // Calculate actual price impact
        }
      } catch (error) {
        console.error("Error getting quote:", error)
        return null
      } finally {
        setIsLoading(false)
      }
    },
    [publicClient],
  )

  const executeSwap = useCallback(
    async (params: SwapParams): Promise<{ success: boolean; txHash?: string; error?: string }> => {
      if (!walletClient || !address) {
        return { success: false, error: "Wallet not connected" }
      }

      try {
        setIsLoading(true)

        const { tokenIn, tokenOut, amountIn, slippage, deadline = 20 } = params

        // Get quote first
        const quote = await getQuote(tokenIn, tokenOut, amountIn)
        if (!quote) {
          return { success: false, error: "Failed to get quote" }
        }

        // Calculate minimum amount out with slippage
        const amountOutMinimum =
          (BigInt(ethers.parseUnits(quote.amountOut, 18).toString()) * BigInt(100 - slippage * 100)) / BigInt(100)

        const swapParams = {
          tokenIn: tokenIn as `0x${string}`,
          tokenOut: tokenOut as `0x${string}`,
          fee: FEE_TIERS.MEDIUM,
          recipient: address,
          deadline: BigInt(Math.floor(Date.now() / 1000) + deadline * 60),
          amountIn: ethers.parseUnits(amountIn, 18),
          amountOutMinimum,
          sqrtPriceLimitX96: 0n,
        }

        // Execute swap
        const txHash = await walletClient.writeContract({
          address: UNISWAP_V3_ADDRESSES.ROUTER as `0x${string}`,
          abi: SWAP_ROUTER_ABI,
          functionName: "exactInputSingle",
          args: [swapParams],
          value: tokenIn === "0x0000000000000000000000000000000000000000" ? ethers.parseUnits(amountIn, 18) : 0n,
        })

        return { success: true, txHash }
      } catch (error) {
        console.error("Swap error:", error)
        return { success: false, error: error instanceof Error ? error.message : "Swap failed" }
      } finally {
        setIsLoading(false)
      }
    },
    [walletClient, address, getQuote],
  )

  const getPoolInfo = useCallback(
    async (tokenA: string, tokenB: string, fee: number = FEE_TIERS.MEDIUM) => {
      if (!publicClient) return null

      try {
        // Get pool address
        const poolAddress = await publicClient.readContract({
          address: UNISWAP_V3_ADDRESSES.FACTORY as `0x${string}`,
          abi: FACTORY_ABI,
          functionName: "getPool",
          args: [tokenA as `0x${string}`, tokenB as `0x${string}`, fee],
        })

        if (poolAddress === "0x0000000000000000000000000000000000000000") {
          return null // Pool doesn't exist
        }

        // Get pool state
        const [slot0, liquidity] = await Promise.all([
          publicClient.readContract({
            address: poolAddress as `0x${string}`,
            abi: POOL_ABI,
            functionName: "slot0",
          }),
          publicClient.readContract({
            address: poolAddress as `0x${string}`,
            abi: POOL_ABI,
            functionName: "liquidity",
          }),
        ])

        const [sqrtPriceX96, tick] = slot0 as [bigint, number, number, number, number, number, boolean]

        return {
          poolAddress,
          sqrtPriceX96: sqrtPriceX96.toString(),
          tick,
          liquidity: liquidity.toString(),
        }
      } catch (error) {
        console.error("Error getting pool info:", error)
        return null
      }
    },
    [publicClient],
  )

  return {
    getQuote,
    executeSwap,
    getPoolInfo,
    isLoading,
  }
}
