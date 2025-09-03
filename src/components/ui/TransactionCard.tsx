import React from 'react'
import { ArrowUpRight, ArrowDownLeft, CreditCard, Smartphone, Zap } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'

export interface Transaction {
  id: string
  type: 'income' | 'expense' | 'transfer'
  category: 'transfer' | 'bill_pay' | 'airtime' | 'loan' | 'other'
  amount: number
  description: string
  recipient?: string
  date: string
  status: 'completed' | 'pending' | 'failed'
}

interface TransactionCardProps {
  transaction: Transaction
  onClick?: () => void
}

export const TransactionCard: React.FC<TransactionCardProps> = ({
  transaction,
  onClick
}) => {
  const getIcon = () => {
    switch (transaction.category) {
      case 'transfer':
        return transaction.type === 'income' ? 
          <ArrowDownLeft className="h-5 w-5 text-green-600" /> :
          <ArrowUpRight className="h-5 w-5 text-red-600" />
      case 'bill_pay':
        return <CreditCard className="h-5 w-5 text-blue-600" />
      case 'airtime':
        return <Smartphone className="h-5 w-5 text-purple-600" />
      case 'loan':
        return <Zap className="h-5 w-5 text-orange-600" />
      default:
        return <CreditCard className="h-5 w-5 text-gray-600" />
    }
  }

  const getAmountColor = () => {
    if (transaction.type === 'income') return 'text-green-600'
    if (transaction.type === 'expense') return 'text-red-600'
    return 'text-gray-900'
  }

  const getStatusColor = () => {
    switch (transaction.status) {
      case 'completed':
        return 'text-green-600'
      case 'pending':
        return 'text-yellow-600'
      case 'failed':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  return (
    <div 
      className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gray-100 rounded-full">
            {getIcon()}
          </div>
          <div>
            <p className="font-medium text-gray-900">{transaction.description}</p>
            {transaction.recipient && (
              <p className="text-sm text-gray-500">To: {transaction.recipient}</p>
            )}
            <p className="text-xs text-gray-400">{formatDate(transaction.date)}</p>
          </div>
        </div>
        <div className="text-right">
          <p className={`font-semibold ${getAmountColor()}`}>
            {transaction.type === 'income' ? '+' : '-'}{formatCurrency(Math.abs(transaction.amount))}
          </p>
          <p className={`text-xs capitalize ${getStatusColor()}`}>
            {transaction.status}
          </p>
        </div>
      </div>
    </div>
  )
}

