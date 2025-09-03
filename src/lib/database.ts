import { supabase } from './supabase'
import { generateAccountNumber } from './utils'

export interface Account {
  id: string
  user_id: string
  account_number: string
  balance: number
  transactions: Transaction[] | null
  loans: Loan[] | null
  created_at: string
  updated_at: string
}

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

export interface Loan {
  id: string
  amount: number
  interest_rate: number
  term_months: number
  monthly_payment: number
  remaining_balance: number
  status: 'active' | 'paid' | 'defaulted'
  created_at: string
  due_date: string
}

export const databaseService = {
  // Account Management
  async createAccount(userId: string, userData: { name: string; phone?: string }) {
    const accountNumber = generateAccountNumber()
    
    const { data, error } = await supabase
      .from('accounts')
      .insert({
        user_id: userId,
        account_number: accountNumber,
        balance: 0,
        transactions: [],
        loans: []
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  async getAccount(userId: string): Promise<Account | null> {
    // Validate userId format to prevent UUID errors
    if (!userId || typeof userId !== 'string') {
      console.warn('Invalid userId provided to getAccount:', userId);
      return null;
    }

    // For guest users, return null to use guest account logic
    if (userId.startsWith('guest-')) {
      return null;
    }

    const { data, error } = await supabase
      .from('accounts')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null // No rows returned
      console.warn('Database error in getAccount:', error.message);
      return null; // Return null instead of throwing to prevent crashes
    }
    return data
  },

  async updateBalance(userId: string, newBalance: number) {
    const { data, error } = await supabase
      .from('accounts')
      .update({ 
        balance: newBalance,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Transaction Management
  async addTransaction(userId: string, transaction: Omit<Transaction, 'id'>) {
    // Validate userId to prevent UUID errors
    if (!userId || typeof userId !== 'string') {
      throw new Error('Invalid user ID provided');
    }

    // For guest users, handle locally
    if (userId.startsWith('guest-')) {
      throw new Error('Guest users cannot add transactions to database');
    }

    const account = await this.getAccount(userId)
    if (!account) throw new Error('Account not found')

    const newTransaction: Transaction = {
      ...transaction,
      id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }

    const updatedTransactions = [...(account.transactions || []), newTransaction]
    
    // Update balance based on transaction type
    let newBalance = account.balance
    if (transaction.type === 'income') {
      newBalance += transaction.amount
    } else if (transaction.type === 'expense') {
      newBalance -= transaction.amount
    }

    const { data, error } = await supabase
      .from('accounts')
      .update({ 
        transactions: updatedTransactions,
        balance: newBalance,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .select()
      .single()

    if (error) throw error
    return { account: data, transaction: newTransaction }
  },

  async getTransactions(userId: string, limit?: number): Promise<Transaction[]> {
    // Validate userId to prevent UUID errors
    if (!userId || typeof userId !== 'string') {
      console.warn('Invalid userId provided to getTransactions:', userId);
      return [];
    }

    // For guest users, return empty array (they handle transactions locally)
    if (userId.startsWith('guest-')) {
      return [];
    }

    const account = await this.getAccount(userId)
    if (!account || !account.transactions) return []

    const transactions = account.transactions.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    )

    return limit ? transactions.slice(0, limit) : transactions
  },

  // Transfer Operations
  async transferMoney(fromUserId: string, toAccountNumber: string, amount: number, description: string) {
    // Get sender account
    const senderAccount = await this.getAccount(fromUserId)
    if (!senderAccount) throw new Error('Sender account not found')
    
    if (senderAccount.balance < amount) {
      throw new Error('Insufficient balance')
    }

    // Check if recipient account exists
    const { data: recipientAccount, error: recipientError } = await supabase
      .from('accounts')
      .select('*')
      .eq('account_number', toAccountNumber)
      .single()

    if (recipientError || !recipientAccount) {
      throw new Error('Recipient account not found')
    }

    // Create transactions for both accounts
    const transferId = `transfer_${Date.now()}`
    const timestamp = new Date().toISOString()

    // Sender transaction (expense)
    const senderTransaction: Transaction = {
      id: `${transferId}_out`,
      type: 'expense',
      category: 'transfer',
      amount: amount,
      description: description,
      recipient: toAccountNumber,
      date: timestamp,
      status: 'completed'
    }

    // Recipient transaction (income)
    const recipientTransaction: Transaction = {
      id: `${transferId}_in`,
      type: 'income',
      category: 'transfer',
      amount: amount,
      description: `Transfer from ${senderAccount.account_number}`,
      recipient: senderAccount.account_number,
      date: timestamp,
      status: 'completed'
    }

    // Update sender account
    const senderTransactions = [...(senderAccount.transactions || []), senderTransaction]
    const senderNewBalance = senderAccount.balance - amount

    // Update recipient account
    const recipientTransactions = [...(recipientAccount.transactions || []), recipientTransaction]
    const recipientNewBalance = recipientAccount.balance + amount

    // Execute both updates
    const { error: senderUpdateError } = await supabase
      .from('accounts')
      .update({
        transactions: senderTransactions,
        balance: senderNewBalance,
        updated_at: timestamp
      })
      .eq('user_id', fromUserId)

    if (senderUpdateError) throw senderUpdateError

    const { error: recipientUpdateError } = await supabase
      .from('accounts')
      .update({
        transactions: recipientTransactions,
        balance: recipientNewBalance,
        updated_at: timestamp
      })
      .eq('user_id', recipientAccount.user_id)

    if (recipientUpdateError) throw recipientUpdateError

    return {
      transferId,
      senderTransaction,
      recipientTransaction,
      senderNewBalance,
      recipientNewBalance
    }
  },

  // Loan Management
  async requestLoan(userId: string, amount: number, termMonths: number) {
    const account = await this.getAccount(userId)
    if (!account) throw new Error('Account not found')

    const interestRate = 0.15 // 15% annual interest rate
    const monthlyRate = interestRate / 12
    const monthlyPayment = (amount * monthlyRate * Math.pow(1 + monthlyRate, termMonths)) / 
                          (Math.pow(1 + monthlyRate, termMonths) - 1)

    const newLoan: Loan = {
      id: `loan_${Date.now()}`,
      amount: amount,
      interest_rate: interestRate,
      term_months: termMonths,
      monthly_payment: Math.round(monthlyPayment * 100) / 100,
      remaining_balance: amount,
      status: 'active',
      created_at: new Date().toISOString(),
      due_date: new Date(Date.now() + termMonths * 30 * 24 * 60 * 60 * 1000).toISOString()
    }

    const updatedLoans = [...(account.loans || []), newLoan]
    const newBalance = account.balance + amount

    // Add loan transaction
    const loanTransaction: Transaction = {
      id: `txn_${newLoan.id}`,
      type: 'income',
      category: 'loan',
      amount: amount,
      description: `Loan disbursement - ${termMonths} months`,
      date: new Date().toISOString(),
      status: 'completed'
    }

    const updatedTransactions = [...(account.transactions || []), loanTransaction]

    const { data, error } = await supabase
      .from('accounts')
      .update({
        loans: updatedLoans,
        transactions: updatedTransactions,
        balance: newBalance,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .select()
      .single()

    if (error) throw error
    return { account: data, loan: newLoan }
  },

  // Real-time subscriptions
  subscribeToAccountChanges(userId: string, callback: (payload: any) => void) {
    return supabase
      .channel('account-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'accounts',
          filter: `user_id=eq.${userId}`
        },
        callback
      )
      .subscribe()
  }
}

