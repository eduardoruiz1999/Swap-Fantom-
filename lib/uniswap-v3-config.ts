// Uniswap V3 Contract Addresses on Fantom (if available) or use SpiritSwap V3
export const UNISWAP_V3_ADDRESSES = {
  // For Fantom, we'll use SpiritSwap V3 or similar DEX addresses
  FACTORY: "0x1F98431c8aD98523631AE4a59f267346ea31F984", // Example address
  ROUTER: "0xE592427A0AEce92De3Edee1F18E0157C05861564", // SwapRouter address
  QUOTER: "0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6", // Quoter V2 address
  POSITION_MANAGER: "0xC36442b4a4522E871399CD717aBDD847Ab11FE88", // NonfungiblePositionManager
}

// Fee tiers for Uniswap V3 pools
export const FEE_TIERS = {
  LOWEST: 100, // 0.01%
  LOW: 500, // 0.05%
  MEDIUM: 3000, // 0.3%
  HIGH: 10000, // 1%
}

// Pool configurations for common pairs
export const POOL_CONFIGS = [
  {
    token0: "0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83", // WFTM
    token1: "0x04068DA6C83AFCFA0e13ba15A6696662335D5B75", // USDC
    fee: FEE_TIERS.MEDIUM,
  },
  {
    token0: "0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83", // WFTM
    token1: "0x841FAD6EAe12c286d1Fd18d1d525DFfA75C7EFFE", // BOO
    fee: FEE_TIERS.MEDIUM,
  },
]

// Uniswap V3 SwapRouter ABI (simplified)
export const SWAP_ROUTER_ABI = [
  {
    inputs: [
      {
        components: [
          { name: "tokenIn", type: "address" },
          { name: "tokenOut", type: "address" },
          { name: "fee", type: "uint24" },
          { name: "recipient", type: "address" },
          { name: "deadline", type: "uint256" },
          { name: "amountIn", type: "uint256" },
          { name: "amountOutMinimum", type: "uint256" },
          { name: "sqrtPriceLimitX96", type: "uint256" },
        ],
        name: "params",
        type: "tuple",
      },
    ],
    name: "exactInputSingle",
    outputs: [{ name: "amountOut", type: "uint256" }],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          { name: "tokenIn", type: "address" },
          { name: "tokenOut", type: "address" },
          { name: "fee", type: "uint24" },
          { name: "recipient", type: "address" },
          { name: "deadline", type: "uint256" },
          { name: "amountOut", type: "uint256" },
          { name: "amountInMaximum", type: "uint256" },
          { name: "sqrtPriceLimitX96", type: "uint256" },
        ],
        name: "params",
        type: "tuple",
      },
    ],
    name: "exactOutputSingle",
    outputs: [{ name: "amountIn", type: "uint256" }],
    stateMutability: "payable",
    type: "function",
  },
]

// Quoter V2 ABI (simplified)
export const QUOTER_ABI = [
  {
    inputs: [
      { name: "tokenIn", type: "address" },
      { name: "tokenOut", type: "address" },
      { name: "fee", type: "uint24" },
      { name: "amountIn", type: "uint256" },
      { name: "sqrtPriceLimitX96", type: "uint160" },
    ],
    name: "quoteExactInputSingle",
    outputs: [
      { name: "amountOut", type: "uint256" },
      { name: "sqrtPriceX96After", type: "uint160" },
      { name: "initializedTicksCrossed", type: "uint32" },
      { name: "gasEstimate", type: "uint256" },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
]

// Factory ABI (simplified)
export const FACTORY_ABI = [
  {
    inputs: [
      { name: "tokenA", type: "address" },
      { name: "tokenB", type: "address" },
      { name: "fee", type: "uint24" },
    ],
    name: "getPool",
    outputs: [{ name: "pool", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
]

// Pool ABI (simplified)
export const POOL_ABI = [
  {
    inputs: [],
    name: "slot0",
    outputs: [
      { name: "sqrtPriceX96", type: "uint160" },
      { name: "tick", type: "int24" },
      { name: "observationIndex", type: "uint16" },
      { name: "observationCardinality", type: "uint16" },
      { name: "observationCardinalityNext", type: "uint16" },
      { name: "feeProtocol", type: "uint8" },
      { name: "unlocked", type: "bool" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "liquidity",
    outputs: [{ name: "", type: "uint128" }],
    stateMutability: "view",
    type: "function",
  },
]
