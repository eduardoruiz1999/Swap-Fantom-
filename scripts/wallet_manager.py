import os
import json
from web3 import Web3
from eth_account import Account
from typing import Optional, Dict, Any
import requests

class WalletManager:
    def __init__(self, rpc_url: str = "https://rpc.ftm.tools/"):
        self.w3 = Web3(Web3.HTTPProvider(rpc_url))
        self.account: Optional[Account] = None
        self.private_key: Optional[str] = None
        
    def connect_with_private_key(self, private_key: str) -> Dict[str, Any]:
        """Connect wallet using private key"""
        try:
            # Remove '0x' prefix if present
            if private_key.startswith('0x'):
                private_key = private_key[2:]
            
            # Create account from private key
            self.account = Account.from_key(private_key)
            self.private_key = private_key
            
            # Get balance
            balance_wei = self.w3.eth.get_balance(self.account.address)
            balance_ftm = self.w3.from_wei(balance_wei, 'ether')
            
            return {
                "success": True,
                "address": self.account.address,
                "balance": float(balance_ftm),
                "network": "Fantom Mainnet"
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    def get_token_balance(self, token_address: str, decimals: int = 18) -> float:
        """Get ERC20 token balance"""
        if not self.account:
            raise Exception("Wallet not connected")
        
        # ERC20 ABI for balanceOf function
        erc20_abi = [
            {
                "constant": True,
                "inputs": [{"name": "_owner", "type": "address"}],
                "name": "balanceOf",
                "outputs": [{"name": "balance", "type": "uint256"}],
                "type": "function"
            }
        ]
        
        contract = self.w3.eth.contract(
            address=Web3.to_checksum_address(token_address),
            abi=erc20_abi
        )
        
        balance = contract.functions.balanceOf(self.account.address).call()
        return balance / (10 ** decimals)
    
    def approve_token(self, token_address: str, spender_address: str, amount: int) -> Dict[str, Any]:
        """Approve token spending"""
        if not self.account:
            return {"success": False, "error": "Wallet not connected"}
        
        try:
            erc20_abi = [
                {
                    "constant": False,
                    "inputs": [
                        {"name": "_spender", "type": "address"},
                        {"name": "_value", "type": "uint256"}
                    ],
                    "name": "approve",
                    "outputs": [{"name": "", "type": "bool"}],
                    "type": "function"
                }
            ]
            
            contract = self.w3.eth.contract(
                address=Web3.to_checksum_address(token_address),
                abi=erc20_abi
            )
            
            # Build transaction
            transaction = contract.functions.approve(
                Web3.to_checksum_address(spender_address),
                amount
            ).build_transaction({
                'from': self.account.address,
                'gas': 100000,
                'gasPrice': self.w3.to_wei('20', 'gwei'),
                'nonce': self.w3.eth.get_transaction_count(self.account.address)
            })
            
            # Sign and send transaction
            signed_txn = self.w3.eth.account.sign_transaction(transaction, self.private_key)
            tx_hash = self.w3.eth.send_raw_transaction(signed_txn.rawTransaction)
            
            return {
                "success": True,
                "tx_hash": tx_hash.hex(),
                "message": "Approval transaction sent"
            }
            
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def get_gas_price(self) -> int:
        """Get current gas price"""
        return self.w3.eth.gas_price
    
    def estimate_gas(self, transaction: Dict[str, Any]) -> int:
        """Estimate gas for transaction"""
        return self.w3.eth.estimate_gas(transaction)

# Example usage
if __name__ == "__main__":
    # Initialize wallet manager
    wallet = WalletManager()
    
    # Example private key (DO NOT use in production)
    private_key = "your_private_key_here"
    
    # Connect wallet
    result = wallet.connect_with_private_key(private_key)
    print("Connection result:", result)
    
    if result["success"]:
        print(f"Connected to address: {result['address']}")
        print(f"FTM Balance: {result['balance']}")
        
        # Get USDC balance (example)
        usdc_address = "0x04068DA6C83AFCFA0e13ba15A6696662335D5B75"
        try:
            usdc_balance = wallet.get_token_balance(usdc_address, 6)
            print(f"USDC Balance: {usdc_balance}")
        except Exception as e:
            print(f"Error getting USDC balance: {e}")
