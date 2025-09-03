"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { databaseService, Account, Transaction } from "@/lib/database";
import { toast } from "react-hot-toast";
export const useAccount = () => {
  const { user } = useAuth();
  const isGuest =
    typeof window !== "undefined" &&
    localStorage.getItem("isGuestMode") === "true";

  const [account, setAccount] = useState<Account | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isGuest) {
      let guestData = localStorage.getItem("guestAccount");
      if (!guestData) {
        const initialAccount = {
          id: `guest-${Date.now()}`,
          accountNumber: `264763${Math.floor(Math.random() * 1000000000)
            .toString()
            .padStart(9, "0")}`,
          name: localStorage.getItem("guestName") || "Guest User",
          balance: 250000.0,
          currency: "USD",
          transactions: [
            {
              id: `guest_txn_${Date.now()}`,
              type: "income",
              amount: 250000.0,
              description: "Initial demo balance",
              date: new Date().toISOString(),
              status: "completed",
            },
          ],
          loans: [],
        };
        localStorage.setItem("guestAccount", JSON.stringify(initialAccount));
        guestData = JSON.stringify(initialAccount);
      }
      setAccount(JSON.parse(guestData));
      setLoading(false);
      return;
    }

    if (!user) {
      setLoading(false);
      return;
    }
    const loadAccount = async () => {
      try {
        setLoading(true);
        let userAccount = await databaseService.getAccount(user.id);

        // Create account if it doesn't exist
        if (!userAccount) {
          userAccount = await databaseService.createAccount(user.id, {
            name: user.user_metadata?.name || user.email || "User",
            phone: user.user_metadata?.phone,
          });
          toast.success("Account created successfully!");
        }

        setAccount(userAccount);
        setError(null);
      } catch (err: any) {
        setError(err.message);
        toast.error("Failed to load account: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    loadAccount();
  }, [user]);

  // Set up real-time subscription
  useEffect(() => {
    if (!user) return;

    const subscription = databaseService.subscribeToAccountChanges(
      user.id,
      (payload) => {
        if (payload.eventType === "UPDATE" && payload.new) {
          setAccount(payload.new);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  // Account operations
  const addTransaction = async (transaction: Omit<Transaction, "id">) => {
    if (!user) throw new Error("User not authenticated");

    try {
      const result = await databaseService.addTransaction(user.id, transaction);
      setAccount(result.account);
      toast.success("Transaction completed successfully!");
      return result.transaction;
    } catch (err: any) {
      toast.error("Transaction failed: " + err.message);
      throw err;
    }
  };

  const transferMoney = async (
    toAccountNumber: string,
    amount: number,
    description: string
  ) => {
    if (!user) throw new Error("User not authenticated");

    try {
      const result = await databaseService.transferMoney(
        user.id,
        toAccountNumber,
        amount,
        description
      );

      // Refresh account data
      const updatedAccount = await databaseService.getAccount(user.id);
      setAccount(updatedAccount);

      toast.success(
        `Successfully transferred $${amount} to ${toAccountNumber}`
      );
      return result;
    } catch (err: any) {
      toast.error("Transfer failed: " + err.message);
      throw err;
    }
  };

  const requestLoan = async (amount: number, termMonths: number) => {
    if (!user) throw new Error("User not authenticated");

    try {
      const result = await databaseService.requestLoan(
        user.id,
        amount,
        termMonths
      );
      setAccount(result.account);
      toast.success(`Loan of $${amount} approved and disbursed!`);
      return result.loan;
    } catch (err: any) {
      toast.error("Loan request failed: " + err.message);
      throw err;
    }
  };

  const getTransactions = async (limit?: number) => {
    if (!user) return [];

    try {
      return await databaseService.getTransactions(user.id, limit);
    } catch (err: any) {
      toast.error("Failed to load transactions: " + err.message);
      return [];
    }
  };

  const refreshAccount = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const updatedAccount = await databaseService.getAccount(user.id);
      setAccount(updatedAccount);
    } catch (err: any) {
      setError(err.message);
      toast.error("Failed to refresh account: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    account,
    loading,
    error,
    addTransaction,
    transferMoney,
    requestLoan,
    getTransactions,
    refreshAccount,
  };
};

// Hook for guest mode (localStorage-based)
export const useGuestAccount = () => {
  const [account, setAccount] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize guest account if it doesn't exist
    let guestData = localStorage.getItem("guestAccount");
    if (!guestData) {
      // Get currency from guest user data first, then settings, then fallback
      const userData = localStorage.getItem("fastpay-user-data");
      const settings = localStorage.getItem("fastpay-settings");
      let currency = "USD";
      
      // Priority 1: Guest user data (from guest selection page)
      if (userData) {
        try {
          const parsedUserData = JSON.parse(userData);
          currency = parsedUserData.guestCurrency || "USD";
        } catch (e) {
          // Continue to next priority
        }
      }
      
      // Priority 2: Settings preferences
      if (currency === "USD" && settings) {
        try {
          const parsedSettings = JSON.parse(settings);
          currency = parsedSettings.preferences?.currency || "USD";
        } catch (e) {
          // Continue to fallback
        }
      }
      
      // Priority 3: Selected currency from localStorage
      if (currency === "USD") {
        currency = localStorage.getItem("selectedCurrency") || "USD";
      }
      
      const initialAccount = {
        id: "guest_account",
        accountNumber: "2647634099",
        name: "Demo User",
        balance: 1000.0, // Always store in USD as base currency
        currency: "USD", // Base currency for storage
        displayCurrency: currency, // User's preferred display currency
        transactions: [
          {
            id: "demo_1",
            type: "income",
            amount: 1000.0, // Always store in USD
            description: "Initial demo balance",
            date: new Date().toISOString(),
            status: "completed",
          },
        ],
        loans: [],
      };
      localStorage.setItem("guestAccount", JSON.stringify(initialAccount));
      setAccount(initialAccount);
    } else {
      const parsedAccount = JSON.parse(guestData);
      
      // Always check and update display currency from current settings or user data
      const userData = localStorage.getItem("fastpay-user-data");
      const settings = localStorage.getItem("fastpay-settings");
      let currentDisplayCurrency = parsedAccount.displayCurrency || parsedAccount.currency;
      
      // Check guest user data first
      if (userData) {
        try {
          const parsedUserData = JSON.parse(userData);
          if (parsedUserData.guestCurrency && parsedUserData.guestCurrency !== currentDisplayCurrency) {
            currentDisplayCurrency = parsedUserData.guestCurrency;
          }
        } catch (e) {
          // Continue
        }
      }
      
      // Check settings
      if (settings) {
        try {
          const parsedSettings = JSON.parse(settings);
          const settingsCurrency = parsedSettings.preferences?.currency;
          if (settingsCurrency && settingsCurrency !== currentDisplayCurrency) {
            currentDisplayCurrency = settingsCurrency;
          }
        } catch (e) {
          // Ignore parsing errors
        }
      }
      
      // Update account display currency if it changed
      if (currentDisplayCurrency !== parsedAccount.displayCurrency) {
        parsedAccount.displayCurrency = currentDisplayCurrency;
        // Keep base currency as USD for storage
        parsedAccount.currency = "USD";
        localStorage.setItem("guestAccount", JSON.stringify(parsedAccount));
      }
      
      setAccount(parsedAccount);
    }
    setLoading(false);
  }, []);

  const updateGuestAccount = (updates: any) => {
    const updatedAccount = { ...account, ...updates };
    setAccount(updatedAccount);
    localStorage.setItem("guestAccount", JSON.stringify(updatedAccount));
  };

  const addTransaction = async (transaction: Omit<Transaction, "id">) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newTransaction: Transaction = {
          ...transaction,
          id: `guest_txn_${Date.now()}`,
          date: new Date().toISOString(),
          status: "completed",
        };

        const transactions = account?.transactions || [];
        const updatedTransactions = [...transactions, newTransaction];

        let newBalance = account?.balance || 0;
        if (transaction.type === "income") {
          newBalance += transaction.amount;
        } else if (transaction.type === "expense") {
          newBalance -= transaction.amount;
        }

        updateGuestAccount({
          transactions: updatedTransactions,
          balance: newBalance,
        });

        toast.success("Transaction completed successfully!");
        resolve(newTransaction);
      }, 1000); // Simulate network delay
    });
  };

  const transferMoney = async (
    toAccountNumber: string,
    amount: number,
    description: string
  ) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (amount > account.balance) {
          toast.error("Insufficient balance");
          reject(new Error("Insufficient balance"));
          return;
        }

        const transferTransaction: Transaction = {
          id: `transfer_${Date.now()}`,
          type: "expense",
          amount: amount,
          description: `Transfer to ${toAccountNumber}: ${description}`,
          date: new Date().toISOString(),
          status: "completed",
          category: "transfer",
          recipient: toAccountNumber,
        };

        const transactions = account?.transactions || [];
        const updatedTransactions = [...transactions, transferTransaction];
        const newBalance = account.balance - amount;

        updateGuestAccount({
          transactions: updatedTransactions,
          balance: newBalance,
        });

        toast.success(
          `Successfully transferred ₦${amount.toLocaleString("en-NG", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })} to ${toAccountNumber}`
        );
        resolve(transferTransaction);
      }, 1500); // Simulate network delay
    });
  };

  const requestLoan = async (amount: number, termMonths: number) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const loan = {
          id: `loan_${Date.now()}`,
          amount: amount,
          termMonths: termMonths,
          interestRate: 5.5,
          monthlyPayment: (amount * 1.055) / termMonths,
          status: "active",
          disbursedAt: new Date().toISOString(),
          nextPaymentDate: new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000
          ).toISOString(),
        };

        const loanTransaction: Transaction = {
          id: `loan_disbursement_${Date.now()}`,
          type: "income",
          amount: amount,
          description: `Loan disbursement - ${termMonths} months term`,
          date: new Date().toISOString(),
          status: "completed",
          category: "loan",
        };

        const loans = account?.loans || [];
        const transactions = account?.transactions || [];
        const updatedLoans = [...loans, loan];
        const updatedTransactions = [...transactions, loanTransaction];
        const newBalance = account.balance + amount;

        updateGuestAccount({
          loans: updatedLoans,
          transactions: updatedTransactions,
          balance: newBalance,
        });

        toast.success(
          `Loan of ₦${amount.toLocaleString("en-NG", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })} approved and disbursed!`
        );
        resolve(loan);
      }, 2000); // Simulate processing time
    });
  };

  const getTransactions = async (limit?: number) => {
    const transactions = account?.transactions || [];
    return limit
      ? transactions.slice(-limit).reverse()
      : transactions.reverse();
  };

  return {
    account,
    loading,
    error: null,
    addTransaction,
    transferMoney,
    requestLoan,
    getTransactions,
    refreshAccount: () => Promise.resolve(),
  };
};
