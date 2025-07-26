import { ethers } from "ethers"

class PrivateKeyWallet {
  constructor(rpcUrl = "https://rpc.ftm.tools/") {
    this.provider = new ethers.JsonRpcProvider(rpcUrl)
    this.wallet = null
    this.signer = null
  }

  /**
   * Connect wallet using private key
   * @param {string} privateKey - The private key (with or without 0x prefix)
   * @returns {Promise<Object>} Connection result
   */
  async connectWithPrivateKey(privateKey) {
    try {
      // Ensure private key has 0x prefix
      if (!privateKey.startsWith("0x")) {
        privateKey = "0x" + privateKey
      }

      // Create wallet instance
      this.wallet = new ethers.Wallet(privateKey, this.provider)
      this.signer = this.wallet

      // Get balance
      const balance = await this.provider.getBalance(this.wallet.address)
      const balanceInFTM = ethers.formatEther(balance)

      // Get network info
      const network = await this.provider.getNetwork()

      return {
        success: true,
        address: this.wallet.address,
        balance: Number.parseFloat(balanceInFTM),
        network: network.name,
        chainId: Number(network.chainId),
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
      }
    }
  }

  /**
   * Get ERC20 token balance
   * @param {string} tokenAddress - Token contract address
   * @param {number} decimals - Token decimals (default: 18)
   * @returns {Promise<number>} Token balance
   */
  async getTokenBalance(tokenAddress, decimals = 18) {
    if (!this.wallet) {
      throw new Error("Wallet not connected")
    }

    const erc20Abi = [
      "function balanceOf(address owner) view returns (uint256)",
      "function decimals() view returns (uint8)",
      "function symbol() view returns (string)",
    ]

    const contract = new ethers.Contract(tokenAddress, erc20Abi, this.provider)
    const balance = await contract.balanceOf(this.wallet.address)

    return Number.parseFloat(ethers.formatUnits(balance, decimals))
  }

  /**
   * Approve token spending
   * @param {string} tokenAddress - Token contract address
   * @param {string} spenderAddress - Spender contract address
   * @param {string} amount - Amount to approve
   * @param {number} decimals - Token decimals
   * @returns {Promise<Object>} Transaction result
   */
  async approveToken(tokenAddress, spenderAddress, amount, decimals = 18) {
    if (!this.signer) {
      return { success: false, error: "Wallet not connected" }
    }

    try {
      const erc20Abi = ["function approve(address spender, uint256 amount) returns (bool)"]

      const contract = new ethers.Contract(tokenAddress, erc20Abi, this.signer)
      const amountWei = ethers.parseUnits(amount, decimals)

      const tx = await contract.approve(spenderAddress, amountWei)

      return {
        success: true,
        txHash: tx.hash,
        message: "Approval transaction sent",
        transaction: tx,
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
      }
    }
  }

  /**
   * Execute a token swap (example implementation)
   * @param {Object} swapParams - Swap parameters
   * @returns {Promise<Object>} Swap result
   */
  async executeSwap(swapParams) {
    if (!this.signer) {
      return { success: false, error: "Wallet not connected" }
    }

    try {
      const { fromToken, toToken, amount, slippage, routerAddress } = swapParams

      // This is a simplified example - in reality you'd interact with a DEX router
      console.log("Executing swap:", {
        from: fromToken,
        to: toToken,
        amount: amount,
        slippage: slippage,
      })

      // Example router ABI (simplified)
      const routerAbi = [
        "function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)",
      ]

      const router = new ethers.Contract(routerAddress, routerAbi, this.signer)

      // Calculate minimum amount out with slippage
      const amountIn = ethers.parseUnits(amount, 18)
      const amountOutMin = (amountIn * BigInt(100 - Number.parseInt(slippage))) / BigInt(100)

      const path = [fromToken, toToken]
      const deadline = Math.floor(Date.now() / 1000) + 60 * 20 // 20 minutes

      const tx = await router.swapExactTokensForTokens(amountIn, amountOutMin, path, this.wallet.address, deadline)

      return {
        success: true,
        txHash: tx.hash,
        message: "Swap transaction sent",
        transaction: tx,
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
      }
    }
  }

  /**
   * Get current gas price
   * @returns {Promise<string>} Gas price in gwei
   */
  async getGasPrice() {
    const gasPrice = await this.provider.getFeeData()
    return ethers.formatUnits(gasPrice.gasPrice, "gwei")
  }

  /**
   * Estimate gas for transaction
   * @param {Object} transaction - Transaction object
   * @returns {Promise<string>} Estimated gas
   */
  async estimateGas(transaction) {
    const gasEstimate = await this.provider.estimateGas(transaction)
    return gasEstimate.toString()
  }
}

// Example usage
async function main() {
  const wallet = new PrivateKeyWallet()

  // Example private key (DO NOT use in production)
  const privateKey = "your_private_key_here"

  // Connect wallet
  const result = await wallet.connectWithPrivateKey(privateKey)
  console.log("Connection result:", result)

  if (result.success) {
    console.log(`Connected to address: ${result.address}`)
    console.log(`FTM Balance: ${result.balance}`)

    // Get USDC balance
    const usdcAddress = "0x04068DA6C83AFCFA0e13ba15A6696662335D5B75"
    try {
      const usdcBalance = await wallet.getTokenBalance(usdcAddress, 6)
      console.log(`USDC Balance: ${usdcBalance}`)
    } catch (error) {
      console.log(`Error getting USDC balance: ${error.message}`)
    }

    // Get current gas price
    const gasPrice = await wallet.getGasPrice()
    console.log(`Current gas price: ${gasPrice} gwei`)
  }
}

export { PrivateKeyWallet }
