import { useState } from 'react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseUnits } from 'viem'

// ABI simplificado para ERC20
const ERC20_ABI = [
  {
    name: 'transfer',
    type: 'function',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ],
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable'
  },
  {
    name: 'approve',
    type: 'function',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ],
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable'
  }
] as const

export function useSwap() {
  const { address } = useAccount()
  const [isSwapping, setIsSwapping] = useState(false)
  const { writeContract, data: hash } = useWriteContract()
  
  const { isLoading: isConfirming, isSuccess: isConfirmed } = 
    useWaitForTransactionReceipt({ hash })

  const executeSwap = async (
    fromToken: string,
    toToken: string,
    amount: string,
    decimals: number
  ) => {
    if (!address) return

    setIsSwapping(true)
    
    try {
      // En una implementación real, aquí harías:
      // 1. Aprobar el token si es necesario
      // 2. Llamar al contrato del DEX para hacer el swap
      // 3. Manejar la transacción
      
      // Ejemplo de aprobación de token
      if (fromToken !== '0x0000000000000000000000000000000000000000') {
        await writeContract({
          address: fromToken as `0x${string}`,
          abi: ERC20_ABI,
          functionName: 'approve',
          args: [
            '0x0000000000000000000000000000000000000000', // Dirección del router del DEX
            parseUnits(amount, decimals)
          ]
        })
      }

      console.log('Swap ejecutado exitosamente')
    } catch (error) {
      console.error('Error en el swap:', error)
    } finally {
      setIsSwapping(false)
    }
  }

  return {
    executeSwap,
    isSwapping: isSwapping || isConfirming,
    isConfirmed,
    hash
  }
}
