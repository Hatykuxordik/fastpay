'use client'

import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'

export interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  timestamp: Date
  read: boolean
  action?: {
    label: string
    onClick: () => void
  }
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [permission, setPermission] = useState<NotificationPermission>('default')

  useEffect(() => {
    // Check if browser supports notifications
    if ('Notification' in window) {
      setPermission(Notification.permission)
    }

    // Load notifications from localStorage
    const savedNotifications = localStorage.getItem('fastpay-notifications')
    if (savedNotifications) {
      try {
        const parsed = JSON.parse(savedNotifications).map((n: any) => ({
          ...n,
          timestamp: new Date(n.timestamp)
        }))
        setNotifications(parsed)
      } catch (error) {
        console.error('Failed to load notifications:', error)
      }
    }
  }, [])

  // Save notifications to localStorage
  useEffect(() => {
    localStorage.setItem('fastpay-notifications', JSON.stringify(notifications))
  }, [notifications])

  const requestPermission = async (): Promise<boolean> => {
    if (!('Notification' in window)) {
      toast.error('This browser does not support notifications')
      return false
    }

    if (permission === 'granted') {
      return true
    }

    const result = await Notification.requestPermission()
    setPermission(result)
    
    if (result === 'granted') {
      toast.success('Notifications enabled!')
      return true
    } else {
      toast.error('Notifications permission denied')
      return false
    }
  }

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      read: false
    }

    setNotifications(prev => [newNotification, ...prev.slice(0, 49)]) // Keep only 50 notifications

    // Show browser notification if permission granted
    if (permission === 'granted') {
      try {
        const browserNotification = new Notification(notification.title, {
          body: notification.message,
          icon: '/fastpay-logo.png',
          badge: '/fastpay-logo.png',
          tag: newNotification.id,
          requireInteraction: notification.type === 'error' || notification.type === 'warning'
        })

        browserNotification.onclick = () => {
          window.focus()
          browserNotification.close()
          if (notification.action) {
            notification.action.onClick()
          }
        }

        // Auto close after 5 seconds for non-critical notifications
        if (notification.type === 'info' || notification.type === 'success') {
          setTimeout(() => {
            browserNotification.close()
          }, 5000)
        }
      } catch (error) {
        console.error('Failed to show browser notification:', error)
      }
    }

    // Show toast notification as fallback
    switch (notification.type) {
      case 'success':
        toast.success(notification.message)
        break
      case 'error':
        toast.error(notification.message)
        break
      case 'warning':
        toast(notification.message, { icon: '⚠️' })
        break
      default:
        toast(notification.message)
    }

    return newNotification.id
  }

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    )
  }

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(n => ({ ...n, read: true }))
    )
  }

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const clearAllNotifications = () => {
    setNotifications([])
  }

  // Predefined notification templates
  const notifyTransfer = (amount: number, recipient: string, success: boolean) => {
    addNotification({
      title: success ? 'Transfer Successful' : 'Transfer Failed',
      message: success 
        ? `Successfully transferred $${amount} to ${recipient}`
        : `Failed to transfer $${amount} to ${recipient}`,
      type: success ? 'success' : 'error'
    })
  }

  const notifyLowBalance = (balance: number, threshold: number = 100) => {
    if (balance <= threshold) {
      addNotification({
        title: 'Low Balance Alert',
        message: `Your account balance is low: $${balance}. Consider adding funds.`,
        type: 'warning'
      })
    }
  }

  const notifyLoanApproval = (amount: number, approved: boolean) => {
    addNotification({
      title: approved ? 'Loan Approved' : 'Loan Declined',
      message: approved
        ? `Your loan of $${amount} has been approved and disbursed`
        : `Your loan application for $${amount} has been declined`,
      type: approved ? 'success' : 'error'
    })
  }

  const notifyBillPayment = (billType: string, amount: number, cashback: number) => {
    addNotification({
      title: 'Bill Payment Successful',
      message: `${billType} bill paid: $${amount}. Cashback earned: $${cashback}`,
      type: 'success'
    })
  }

  const unreadCount = notifications.filter(n => !n.read).length

  return {
    notifications,
    unreadCount,
    permission,
    requestPermission,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications,
    // Predefined notifications
    notifyTransfer,
    notifyLowBalance,
    notifyLoanApproval,
    notifyBillPayment
  }
}

