'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  CreditCard,
  Calendar,
  Download,
  Filter
} from 'lucide-react'
import { Layout } from '@/components/layout/Layout'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/components/auth/AuthProvider'
import { useAccount, useGuestAccount } from '@/hooks/useAccount'
import { formatCurrency } from '@/lib/utils'
import { Transaction } from '@/components/ui/TransactionCard'
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts'

export default function AnalyticsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [timeRange, setTimeRange] = useState('30d')
  const [transactions, setTransactions] = useState<Transaction[]>([])

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

    // Load transactions
    if (account && !isGuest) {
      getTransactions?.().then(setTransactions)
    } else if (account?.transactions) {
      setTransactions(account.transactions)
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

  // Calculate analytics data
  const calculateAnalytics = () => {
    const now = new Date()
    const daysBack = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90
    const startDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000)
    
    const filteredTransactions = transactions.filter(t => 
      new Date(t.date) >= startDate
    )

    const income = filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)

    const expenses = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)

    const netIncome = income - expenses

    // Group by category
    const categoryData = filteredTransactions.reduce((acc, t) => {
      const category = t.category
      if (!acc[category]) {
        acc[category] = { income: 0, expense: 0, count: 0 }
      }
      if (t.type === 'income') {
        acc[category].income += t.amount
      } else {
        acc[category].expense += t.amount
      }
      acc[category].count += 1
      return acc
    }, {} as Record<string, { income: number; expense: number; count: number }>)

    // Daily spending trend
    const dailyData = []
    for (let i = daysBack - 1; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      const dayTransactions = filteredTransactions.filter(t => {
        const tDate = new Date(t.date)
        return tDate.toDateString() === date.toDateString()
      })
      
      const dayIncome = dayTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0)
      
      const dayExpenses = dayTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0)

      dailyData.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        income: dayIncome,
        expenses: dayExpenses,
        net: dayIncome - dayExpenses
      })
    }

    return {
      income,
      expenses,
      netIncome,
      categoryData,
      dailyData,
      transactionCount: filteredTransactions.length
    }
  }

  const analytics = calculateAnalytics()

  // Prepare chart data
  const categoryChartData = Object.entries(analytics.categoryData).map(([category, data]) => ({
    name: category.replace('_', ' ').toUpperCase(),
    value: data.expense,
    income: data.income,
    count: data.count
  }))

  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4']

  const stats = [
    {
      title: 'Total Income',
      value: formatCurrency(analytics.income),
      icon: TrendingUp,
      change: '+12.5%',
      changeType: 'positive' as const,
      color: 'text-green-600'
    },
    {
      title: 'Total Expenses',
      value: formatCurrency(analytics.expenses),
      icon: TrendingDown,
      change: '-3.2%',
      changeType: 'negative' as const,
      color: 'text-red-600'
    },
    {
      title: 'Net Income',
      value: formatCurrency(analytics.netIncome),
      icon: DollarSign,
      change: analytics.netIncome >= 0 ? '+15.8%' : '-8.4%',
      changeType: analytics.netIncome >= 0 ? 'positive' : 'negative',
      color: analytics.netIncome >= 0 ? 'text-green-600' : 'text-red-600'
    },
    {
      title: 'Transactions',
      value: analytics.transactionCount.toString(),
      icon: CreditCard,
      change: '+5',
      changeType: 'positive' as const,
      color: 'text-blue-600'
    }
  ]

  return (
    <Layout user={user}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Analytics Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Track your financial performance and spending patterns
              </p>
            </div>
            <div className="flex items-center space-x-4 mt-4 sm:mt-0">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
              </select>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {stat.title}
                    </p>
                    <p className={`text-2xl font-bold mt-2 ${stat.color}`}>
                      {stat.value}
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-full">
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  <span className={`text-sm font-medium ${
                    stat.changeType === 'positive' ? 'text-green-600' :
                    stat.changeType === 'negative' ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {stat.change}
                  </span>
                  <span className="text-sm text-gray-500 ml-2">vs last period</span>
                </div>
              </div>
            ))}
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Income vs Expenses Trend */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Income vs Expenses Trend
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={analytics.dailyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="income" 
                    stackId="1" 
                    stroke="#10B981" 
                    fill="#10B981" 
                    fillOpacity={0.6}
                    name="Income"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="expenses" 
                    stackId="2" 
                    stroke="#EF4444" 
                    fill="#EF4444" 
                    fillOpacity={0.6}
                    name="Expenses"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Spending by Category */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Spending by Category
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Net Income Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm mb-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Daily Net Income
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.dailyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Bar 
                  dataKey="net" 
                  fill="#3B82F6"
                  name="Net Income"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Insights */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Financial Insights
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                  Savings Rate
                </h4>
                <p className="text-2xl font-bold text-blue-600 mb-1">
                  {analytics.income > 0 ? ((analytics.netIncome / analytics.income) * 100).toFixed(1) : 0}%
                </p>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  {analytics.netIncome >= 0 ? 'Great job saving!' : 'Consider reducing expenses'}
                </p>
              </div>

              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">
                  Average Daily Spending
                </h4>
                <p className="text-2xl font-bold text-green-600 mb-1">
                  {formatCurrency(analytics.expenses / (timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90))}
                </p>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Per day in selected period
                </p>
              </div>

              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <h4 className="font-medium text-purple-900 dark:text-purple-100 mb-2">
                  Most Active Category
                </h4>
                <p className="text-lg font-bold text-purple-600 mb-1">
                  {categoryChartData.length > 0 ? 
                    categoryChartData.reduce((max, cat) => cat.count > max.count ? cat : max).name :
                    'No data'
                  }
                </p>
                <p className="text-sm text-purple-700 dark:text-purple-300">
                  {categoryChartData.length > 0 ? 
                    `${categoryChartData.reduce((max, cat) => cat.count > max.count ? cat : max).count} transactions` :
                    'Start making transactions'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

