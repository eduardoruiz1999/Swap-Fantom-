import os
from dataclasses import dataclass
from typing import Dict, List

@dataclass
class TokenConfig:
    symbol: str
    name: str
    address: str
    decimals: int
    logo_uri: str

@dataclass
class NetworkConfig:
    name: str
    chain_id: int
    rpc_url: str
    explorer_url: str
    native_token: str

class AppConfig:
    # Fantom Network Configuration
    FANTOM_MAINNET = NetworkConfig(
        name="Fantom Opera",
        chain_id=250,
        rpc_url="https://rpc.ftm.tools/",
        explorer_url="https://ftmscan.com",
        native_token="FTM"
    )
    
    # Token Configurations
    TOKENS: Dict[str, TokenConfig] = {
        "FTM": TokenConfig(
            symbol="FTM",
            name="Fantom",
            address="0x0000000000000000000000000000000000000000",
            decimals=18,
            logo_uri="/placeholder.svg?height=32&width=32&text=FTM"
        ),
        "JEFE": TokenConfig(
            symbol="JEFE",
            name="JEFE Token",
            address="0x0000000000000000000000000000000000000001",
            decimals=18,
            logo_uri="/placeholder.svg?height=32&width=32&text=JEFE"
        ),
        "USDC": TokenConfig(
            symbol="USDC",
            name="USD Coin",
            address="0x04068DA6C83AFCFA0e13ba15A6696662335D5B75",
            decimals=6,
            logo_uri="/placeholder.svg?height=32&width=32&text=USDC"
        ),
        "WFTM": TokenConfig(
            symbol="WFTM",
            name="Wrapped Fantom",
            address="0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83",
            decimals=18,
            logo_uri="/placeholder.svg?height=32&width=32&text=WFTM"
        ),
        "BOO": TokenConfig(
            symbol="BOO",
            name="SpookyToken",
            address="0x841FAD6EAe12c286d1Fd18d1d525DFfA75C7EFFE",
            decimals=18,
            logo_uri="/placeholder.svg?height=32&width=32&text=BOO"
        )
    }
    
    # DEX Router Addresses
    SPOOKYSWAP_ROUTER = "0xF491e7B69E4244ad4002BC14e878a34207E38c29"
    SPIRITSWAP_ROUTER = "0x16327E3FbDaCA3bcF7E38F5Af2599D2DDc33aE52"
    
    # Default Settings
    DEFAULT_SLIPPAGE = 0.5
    DEFAULT_DEADLINE = 20  # minutes
    DEFAULT_GAS_LIMIT = 300000
    
    @classmethod
    def get_token_by_symbol(cls, symbol: str) -> TokenConfig:
        """Get token configuration by symbol"""
        return cls.TOKENS.get(symbol.upper())
    
    @classmethod
    def get_all_tokens(cls) -> List[TokenConfig]:
        """Get all token configurations"""
        return list(cls.TOKENS.values())
    
    @classmethod
    def is_native_token(cls, address: str) -> bool:
        """Check if address is native token (FTM)"""
        return address == "0x0000000000000000000000000000000000000000"

# Environment variables
class EnvConfig:
    # Private keys (for development only - use environment variables in production)
    PRIVATE_KEY = os.getenv("PRIVATE_KEY", "")
    
    # API Keys
    FTMSCAN_API_KEY = os.getenv("FTMSCAN_API_KEY", "")
    COINGECKO_API_KEY = os.getenv("COINGECKO_API_KEY", "")
    
    # RPC URLs
    FANTOM_RPC_URL = os.getenv("FANTOM_RPC_URL", "https://rpc.ftm.tools/")
    BACKUP_RPC_URL = os.getenv("BACKUP_RPC_URL", "https://fantom-mainnet.gateway.pokt.network/v1/lb/62759259ea1b320039c9e7ac")
    
    # Security
    ENCRYPTION_KEY = os.getenv("ENCRYPTION_KEY", "")
    
    @classmethod
    def validate_config(cls) -> bool:
        """Validate required environment variables"""
        required_vars = ["PRIVATE_KEY"]
        missing_vars = [var for var in required_vars if not getattr(cls, var)]
        
        if missing_vars:
            print(f"Missing required environment variables: {missing_vars}")
            return False
        return True

# Export configurations
__all__ = ["AppConfig", "EnvConfig", "TokenConfig", "NetworkConfig"]
