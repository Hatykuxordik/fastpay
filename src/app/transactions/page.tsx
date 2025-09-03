'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Download, FileText, Calendar } from 'lucide-react'
import { Layout } from '@/components/layout/Layout'
import { Button } from '@/components/ui/Button'
import { TransactionCard, Transaction } from '@/components/ui/TransactionCard'
import { SearchBar } from '@/components/features/SearchBar'
import { Modal } from '@/components/ui/Modal'
import { useAuth } from '@/components/auth/AuthProvider'
import { useAccount, useGuestAccount } from '@/hooks/useAccount'
import { formatCurrency, formatDate } from '@/lib/utils'

export default function TransactionsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([])

  // Use appropriate hook based on authentication status
  const isGuest = !user && typeof window !== 'undefined' && localStorage.getItem('isGuestMode') === 'true'
  const authenticatedAccount = useAccount()
  const guestAccount = useGuestAccount()
  
  const { account, loading, getTransactions } = isGuest ? guestAccount : authenticatedAccount

  useEffect(() => {
    // Redirect to auth if not authenticated and not in guest mode
    if (!user && !isGuest) {
      router.push('/auth/signin')
      return
    }

    // Load all transactions
    if (account && !isGuest) {
      getTransactions?.().then(transactions => {
        setAllTransactions(transactions)
        setFilteredTransactions(transactions)
      })
    } else if (account?.transactions) {
      const transactions = [...account.transactions].sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      )
      setAllTransactions(transactions)
      setFilteredTransactions(transactions)
    }
  }, [user, isGuest, account, router])

  if (loading) {
    return (
      <Layout user={user}>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    )
  }

  const handleExportTransactions = () => {
    const csvContent = [
      ['Date', 'Type', 'Category', 'Description', 'Amount', 'Recipient', 'Status'],
      ...filteredTransactions.map(t => [
        formatDate(t.date),
        t.type,
        t.category,
        t.description,
        t.amount.toString(),
        t.recipient || '',
        t.status
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `fastpay-transactions-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  const getTransactionSummary = () => {
    const income = filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)
    
    const expenses = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)

    return { income, expenses, net: income - expenses }
  }

  const summary = getTransactionSummary()

  return (
    <Layout user={user}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Transaction History
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                View and manage all your transactions
              </p>
            </div>
            <div className="flex items-center space-x-4 mt-4 sm:mt-0">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportTransactions}
                disabled={filteredTransactions.length === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Total Income
                  </p>
                  <p className="text-2xl font-bold text-green-600 mt-2">
                    {formatCurrency(summary.income)}
                  </p>
                </div>
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-full">
                  <div className="h-6 w-6 bg-green-500 rounded-full"></div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Total Expenses
                  </p>
                  <p className="text-2xl font-bold text-red-600 mt-2">
                    {formatCurrency(summary.expenses)}
                  </p>
                </div>
                <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-full">
                  <div className="h-6 w-6 bg-red-500 rounded-full"></div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Net Amount
                  </p>
                  <p className={`text-2xl font-bold mt-2 ${
                    summary.net >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatCurrency(summary.net)}
                  </p>
                </div>
                <div className={`p-3 rounded-full ${
                  summary.net >= 0 ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'
                }`}>
                  <div className={`h-6 w-6 rounded-full ${
                    summary.net >= 0 ? 'bg-green-500' : 'bg-red-500'
                  }`}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="mb-6">
            <SearchBar
              transactions={allTransactions}
              onFilteredResults={setFilteredTransactions}
              placeholder="Search by description, recipient, amount, or category..."
            />
          </div>

          {/* Results Info */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Showing {filteredTransactions.length} of {allTransactions.length} transactions
            </p>
            {filteredTransactions.length !== allTransactions.length && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFilteredTransactions(allTransactions)}
              >
                Clear filters
              </Button>
            )}
          </div>

          {/* Transactions List */}
          <div className="space-y-3">
            {filteredTransactions.length > 0 ? (
              filteredTransactions.map((transaction) => (
                <TransactionCard
                  key={transaction.id}
                  transaction={transaction}
                  onClick={() => setSelectedTransaction(transaction)}
                />
              ))
            ) : allTransactions.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg p-12 text-center">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No transactions yet
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  Start by making a transfer, paying bills, or purchasing airtime.
                </p>
                <Button onClick={() => router.push('/dashboard')}>
                  Go to Dashboard
                </Button>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-lg p-12 text-center">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No matching transactions
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  Try adjusting your search criteria or filters.
                </p>
                <Button
                  variant="outline"
                  onClick={() => setFilteredTransactions(allTransactions)}
                >
                  Clear filters
                </Button>
              </div>
            )}
          </div>

          {/* Load More (if needed for pagination) */}
          {filteredTransactions.length > 0 && filteredTransactions.length >= 50 && (
            <div className="text-center mt-8">
              <Button variant="outline">
                Load More Transactions
              </Button>
            </div>
          )}
        </div>

        {/* Transaction Details Modal */}
        {selectedTransaction && (
          <Modal
            isOpen={!!selectedTransaction}
            onClose={() => setSelectedTransaction(null)}
            title="Transaction Details"
            size="md"
          >
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Transaction ID
                  </label>
                  <p className="text-sm text-gray-900 dark:text-white font-mono">
                    {selectedTransaction.id}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Status
                  </label>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    selectedTransaction.status === 'completed' ? 'bg-green-100 text-green-800' :
                    selectedTransaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {selectedTransaction.status.charAt(0).toUpperCase() + selectedTransaction.status.slice(1)}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Description
                </label>
                <p className="text-sm text-gray-900 dark:text-white">
                  {selectedTransaction.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Type
                  </label>
                  <p className="text-sm text-gray-900 dark:text-white capitalize">
                    {selectedTransaction.type}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Category
                  </label>
                  <p className="text-sm text-gray-900 dark:text-white capitalize">
                    {selectedTransaction.category.replace('_', ' ')}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Amount
                  </label>
                  <p className={`text-lg font-semibold ${
                    selectedTransaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {selectedTransaction.type === 'income' ? '+' : '-'}
                    {formatCurrency(Math.abs(selectedTransaction.amount))}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Date & Time
                  </label>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {formatDate(selectedTransaction.date)}
                  </p>
                </div>
              </div>

              {selectedTransaction.recipient && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Recipient
                  </label>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {selectedTransaction.recipient}
                  </p>
                </div>
              )}
            </div>
          </Modal>
        )}
      </div>
    </Layout>
  )
}

