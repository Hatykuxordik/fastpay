import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { convertCurrency, formatCurrencyAmount, getExchangeRates } from '@/lib/currencyApi'

interface CurrencyContextType {
  currentCurrency: string
  setCurrency: (currency: string) => void
  formatAmount: (amount: number) => string
  convertAmount: (amount: number, fromCurrency?: string) => Promise<number>
  isLoading: boolean
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined)

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currentCurrency, setCurrentCurrency] = useState('USD')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Load currency preference from localStorage
    const savedSettings = localStorage.getItem('fastpay-settings')
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings)
        if (settings.preferences?.currency) {
          setCurrentCurrency(settings.preferences.currency)
        }
      } catch (error) {
        console.error('Failed to load currency preference:', error)
      }
    }

    // Pre-fetch exchange rates
    getExchangeRates().catch(console.error)
  }, [])

  const setCurrency = (currency: string) => {
    setCurrentCurrency(currency)
    
    // Update localStorage settings
    const savedSettings = localStorage.getItem('fastpay-settings')
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings)
        settings.preferences = settings.preferences || {}
        settings.preferences.currency = currency
        localStorage.setItem('fastpay-settings', JSON.stringify(settings))
      } catch (error) {
        console.error('Failed to save currency preference:', error)
      }
    }
  }

  const formatAmount = (amount: number) => {
    return formatCurrencyAmount(amount, currentCurrency)
  }

  const convertAmount = async (amount: number, fromCurrency = 'USD') => {
    setIsLoading(true)
    try {
      const converted = await convertCurrency(amount, fromCurrency, currentCurrency)
      return converted
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <CurrencyContext.Provider value={{
      currentCurrency,
      setCurrency,
      formatAmount,
      convertAmount,
      isLoading
    }}>
      {children}
    </CurrencyContext.Provider>
  )
}

export function useCurrency() {
  const context = useContext(CurrencyContext)
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider')
  }
  return context
}

