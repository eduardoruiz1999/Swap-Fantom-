'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ExternalLink, Clock, CheckCircle, XCircle } from 'lucide-react'

interface Transaction {
  id: string
  type: 'swap' | 'approve'
  fromToken: string
  toToken?: string
  amount: string
  status: 'pending' | 'success' | 'failed'
  hash: string
  timestamp: Date
}

const mockTransactions: Transaction[] = [
  {
    id: '1',
    type: 'swap',
    fromToken: 'FTM',
    toToken: 'JEFE',
    amount: '100',
    status: 'success',
    hash: '0x1234...5678',
    timestamp: new Date(Date.now() - 300000)
  },
  {
    id: '2',
    type: 'approve',
    fromToken: 'USDC',
    amount: '1000',
    status: 'pending',
    hash: '0x9876...5432',
    timestamp: new Date(Date.now() - 60000)
  }
]

export default function TransactionHistory() {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-300'
      case 'success':
        return 'bg-green-500/20 text-green-300'
      case 'failed':
        return 'bg-red-500/20 text-red-300'
      default:
        return 'bg-gray-500/20 text-gray-300'
    }
  }

  return (
    <Card className="bg-white/10 backdrop-blur-lg border-white/20 mt-6">
      <CardHeader>
        <CardTitle className="text-white">Historial de Transacciones</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {mockTransactions.map((tx) => (
          <div key={tx.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
            <div className="flex items-center gap-3">
              {getStatusIcon(tx.status)}
              <div>
                <div className="text-white font-medium">
                  {tx.type === 'swap' 
                    ? `${tx.amount} ${tx.fromToken} → ${tx.toToken}`
                    : `Approve ${tx.fromToken}`
                  }
                </div>
                <div className="text-gray-400 text-sm">
                  {tx.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={getStatusColor(tx.status)}>
                {tx.status}
              </Badge>
              <a
                href={`https://ftmscan.com/tx/${tx.hash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
