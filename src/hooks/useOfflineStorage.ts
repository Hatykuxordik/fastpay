'use client'

import { useState, useEffect } from 'react'
import { Transaction } from '@/components/ui/TransactionCard'

interface OfflineData {
  transactions: Transaction[]
  balance: number
  lastSync: string
  pendingActions: PendingAction[]
}

interface PendingAction {
  id: string
  type: 'transfer' | 'bill_pay' | 'airtime' | 'loan'
  data: any
  timestamp: string
  retryCount: number
}

export const useOfflineStorage = () => {
  const [isOnline, setIsOnline] = useState(true)
  const [offlineData, setOfflineData] = useState<OfflineData | null>(null)
  const [syncInProgress, setSyncInProgress] = useState(false)

  useEffect(() => {
    // Check initial online status
    setIsOnline(navigator.onLine)

    // Listen for online/offline events
    const handleOnline = () => {
      setIsOnline(true)
      syncPendingActions()
    }

    const handleOffline = () => {
      setIsOnline(false)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Load offline data
    loadOfflineData()

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const loadOfflineData = () => {
    try {
      const stored = localStorage.getItem('fastpay-offline-data')
      if (stored) {
        const parsed = JSON.parse(stored)
        setOfflineData(parsed)
      }
    } catch (error) {
      console.error('Failed to load offline data:', error)
    }
  }

  const saveOfflineData = (data: OfflineData) => {
    try {
      localStorage.setItem('fastpay-offline-data', JSON.stringify(data))
      setOfflineData(data)
    } catch (error) {
      console.error('Failed to save offline data:', error)
    }
  }

  const cacheAccountData = (transactions: Transaction[], balance: number) => {
    const data: OfflineData = {
      transactions,
      balance,
      lastSync: new Date().toISOString(),
      pendingActions: offlineData?.pendingActions || []
    }
    saveOfflineData(data)
  }

  const addPendingAction = (action: Omit<PendingAction, 'id' | 'timestamp' | 'retryCount'>) => {
    const pendingAction: PendingAction = {
      ...action,
      id: `pending_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      retryCount: 0
    }

    const updatedData: OfflineData = {
      ...offlineData!,
      pendingActions: [...(offlineData?.pendingActions || []), pendingAction]
    }

    saveOfflineData(updatedData)
    return pendingAction.id
  }

  const removePendingAction = (actionId: string) => {
    if (!offlineData) return

    const updatedData: OfflineData = {
      ...offlineData,
      pendingActions: offlineData.pendingActions.filter(action => action.id !== actionId)
    }

    saveOfflineData(updatedData)
  }

  const syncPendingActions = async () => {
    if (!isOnline || !offlineData || offlineData.pendingActions.length === 0) {
      return
    }

    setSyncInProgress(true)

    try {
      const actionsToSync = [...offlineData.pendingActions]
      
      for (const action of actionsToSync) {
        try {
          // Simulate API call - in real app, this would call the actual API
          await new Promise(resolve => setTimeout(resolve, 1000))
          
          // Remove successful action
          removePendingAction(action.id)
          
          console.log(`Synced pending action: ${action.type}`, action.data)
        } catch (error) {
          console.error(`Failed to sync action ${action.id}:`, error)
          
          // Increment retry count
          const updatedActions = offlineData.pendingActions.map(a =>
            a.id === action.id ? { ...a, retryCount: a.retryCount + 1 } : a
          )

          // Remove actions that have failed too many times
          const filteredActions = updatedActions.filter(a => a.retryCount < 3)

          const updatedData: OfflineData = {
            ...offlineData,
            pendingActions: filteredActions
          }

          saveOfflineData(updatedData)
        }
      }
    } finally {
      setSyncInProgress(false)
    }
  }

  const getOfflineTransactions = (): Transaction[] => {
    return offlineData?.transactions || []
  }

  const getOfflineBalance = (): number => {
    return offlineData?.balance || 0
  }

  const addOfflineTransaction = (transaction: Omit<Transaction, 'id'>) => {
    if (!offlineData) return

    const newTransaction: Transaction = {
      ...transaction,
      id: `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }

    // Update balance
    let newBalance = offlineData.balance
    if (transaction.type === 'income') {
      newBalance += transaction.amount
    } else if (transaction.type === 'expense') {
      newBalance -= transaction.amount
    }

    const updatedData: OfflineData = {
      ...offlineData,
      transactions: [newTransaction, ...offlineData.transactions],
      balance: newBalance
    }

    saveOfflineData(updatedData)
    return newTransaction
  }

  const clearOfflineData = () => {
    localStorage.removeItem('fastpay-offline-data')
    setOfflineData(null)
  }

  const getLastSyncTime = (): Date | null => {
    return offlineData?.lastSync ? new Date(offlineData.lastSync) : null
  }

  const hasPendingActions = (): boolean => {
    return (offlineData?.pendingActions.length || 0) > 0
  }

  return {
    isOnline,
    syncInProgress,
    offlineData,
    cacheAccountData,
    addPendingAction,
    removePendingAction,
    syncPendingActions,
    getOfflineTransactions,
    getOfflineBalance,
    addOfflineTransaction,
    clearOfflineData,
    getLastSyncTime,
    hasPendingActions,
    pendingActionsCount: offlineData?.pendingActions.length || 0
  }
}

