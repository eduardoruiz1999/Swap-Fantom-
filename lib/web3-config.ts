import { createConfig, http } from "wagmi"
import { fantom } from "wagmi/chains"
import { injected, walletConnect, coinbaseWallet } from "wagmi/connectors"

// Configuración de la red Fantom
export const fantomChain = {
  ...fantom,
  rpcUrls: {
    default: {
      http: ["https://rpc.ftm.tools/", "https://fantom-mainnet.gateway.pokt.network/v1/lb/62759259ea1b320039c9e7ac"],
    },
    public: {
      http: ["https://rpc.ftm.tools/"],
    },
  },
}

// Lista de tokens de Fantom
export const FANTOM_TOKENS = [
  {
    symbol: "FTM",
    name: "Fantom",
    address: "0x0000000000000000000000000000000000000000",
    decimals: 18,
    logoURI: "/placeholder.svg?height=32&width=32&text=FTM",
  },
  {
    symbol: "JEFE",
    name: "JEFE Token",
    address: "0x0000000000000000000000000000000000000001",
    decimals: 18,
    logoURI: "/placeholder.svg?height=32&width=32&text=JEFE",
  },
  {
    symbol: "USDC",
    name: "USD Coin",
    address: "0x04068DA6C83AFCFA0e13ba15A6696662335D5B75",
    decimals: 6,
    logoURI: "/placeholder.svg?height=32&width=32&text=USDC",
  },
  {
    symbol: "WFTM",
    name: "Wrapped Fantom",
    address: "0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83",
    decimals: 18,
    logoURI: "/placeholder.svg?height=32&width=32&text=WFTM",
  },
  {
    symbol: "BOO",
    name: "SpookyToken",
    address: "0x841FAD6EAe12c286d1Fd18d1d525DFfA75C7EFFE",
    decimals: 18,
    logoURI: "/placeholder.svg?height=32&width=32&text=BOO",
  },
]

export const config = createConfig({
  chains: [fantomChain],
  connectors: [
    injected(),
    walletConnect({
      projectId: "YOUR_WALLETCONNECT_PROJECT_ID",
      metadata: {
        name: "Fantom Swap DApp",
        description: "Swap tokens on Fantom network",
        url: "https://fantomswap.app",
        icons: ["https://fantomswap.app/icon.png"],
      },
    }),
    coinbaseWallet({
      appName: "Fantom Swap DApp",
      appLogoUrl: "https://fantomswap.app/icon.png",
    }),
  ],
  transports: {
    [fantomChain.id]: http(),
  },
})
