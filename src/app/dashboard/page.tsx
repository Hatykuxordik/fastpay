"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  CreditCard,
  Send,
  Smartphone,
  Zap,
  Plus,
  Eye,
  EyeOff,
  ArrowUpRight,
  ArrowDownLeft,
  TrendingUp,
  DollarSign,
  Euro,
  PoundSterling,
  Banknote,
} from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/Button";
import { TransactionCard, Transaction } from "@/components/ui/TransactionCard";
import { Modal } from "@/components/ui/Modal";
import { useAuth } from "@/components/auth/AuthProvider";
import { useAccount, useGuestAccount } from "@/hooks/useAccount";
import { useApp } from "@/contexts/AppContext";
import { useTranslation } from "react-i18next";
import { TransferModal } from "@/components/features/TransferModal";
import { BillPayModal } from "@/components/features/BillPayModal";
import { AirtimeModal } from "@/components/features/AirtimeModal";
import { LoanModal } from "@/components/features/LoanModal";

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [showBalance, setShowBalance] = useState(true);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>(
    []
  );
  const { t } = useTranslation();

  // Use the AppContext for currency formatting
  const { formatAmountSync, convertAmount, currentCurrency } = useApp();

  // Use appropriate hook based on authentication status
  const isGuest =
    !user &&
    typeof window !== "undefined" &&
    localStorage.getItem("isGuestMode") === "true";
  const authenticatedAccount = useAccount();
  const guestAccount = useGuestAccount();

  const {
    account,
    loading,
    addTransaction,
    transferMoney,
    requestLoan,
    getTransactions,
  } = isGuest ? guestAccount : authenticatedAccount;

  // Create a user object for guest mode to pass to Layout
  const effectiveUser = user || (isGuest ? {
    id: 'guest',
    email: 'guest@example.com',
    user_metadata: { name: localStorage.getItem('guestName') || 'Guest User' }
  } : null);

  const getCurrencyIcon = (currency: string) => {
    switch (currency || currentCurrency) {
      case "EUR":
        return Euro;
      case "GBP":
        return PoundSterling;
      case "NGN":
        return Banknote;
      default:
        return DollarSign;
    }
  };

  // Add effect to update currency icon when currency changes
  const [currencyIcon, setCurrencyIcon] = useState(() => getCurrencyIcon(currentCurrency));
  
  useEffect(() => {
    setCurrencyIcon(getCurrencyIcon(currentCurrency));
  }, [currentCurrency]);

  useEffect(() => {
    // Redirect to auth if not authenticated and not in guest mode
    if (!user && !isGuest) {
      router.push("/auth/signin");
      return;
    }
  }, [user, isGuest, router]);

  // Separate effect for loading transactions that updates when account changes
  useEffect(() => {
    const loadTransactions = async () => {
      if (account && !isGuest) {
        try {
          const transactions = await getTransactions?.(5);
          if (transactions) {
            setRecentTransactions(transactions);
          }
        } catch (error) {
          console.error("Failed to load transactions:", error);
        }
      } else if (account?.transactions) {
        setRecentTransactions(account.transactions.slice(-5).reverse());
      }
    };

    loadTransactions();
  }, [account, isGuest, getTransactions]);

  if (loading) {
    return (
      <Layout user={user}>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  if (!account) {
    return (
      <Layout user={user}>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Account Not Found
            </h2>
            <p className="text-gray-600 mb-6">
              Unable to load your account information.
            </p>
            <Button onClick={() => router.push("/auth/signin")}>
              Sign In Again
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  const quickActions = [
    {
      id: "transfer",
      title: t("dashboard.quickActions.transferMoney.title"),
      description: t("dashboard.quickActions.transferMoney.description"),
      icon: Send,
      color: "bg-blue-500",
      action: () => setActiveModal("transfer"),
    },
    {
      id: "bill-pay",
      title: t("dashboard.quickActions.payBills.title"),
      description: t("dashboard.quickActions.payBills.description"),
      icon: CreditCard,
      color: "bg-green-500",
      action: () => setActiveModal("bill-pay"),
    },
    {
      id: "airtime",
      title: t("dashboard.quickActions.buyAirtime.title"),
      description: t("dashboard.quickActions.buyAirtime.description"),
      icon: Smartphone,
      color: "bg-purple-500",
      action: () => setActiveModal("airtime"),
    },
    {
      id: "loan",
      title: t("dashboard.quickActions.requestLoan.title"),
      description: t("dashboard.quickActions.requestLoan.description"),
      icon: Zap,
      color: "bg-orange-500",
      action: () => setActiveModal("loan"),
    },
  ];

  const handleModalClose = () => {
    setActiveModal(null);
    // Force refresh of transactions when modal closes
    if (account && !isGuest) {
      getTransactions?.(5).then(setRecentTransactions).catch(console.error);
    } else if (account?.transactions) {
      setRecentTransactions(account.transactions.slice(-5).reverse());
    }
  };

  const handleTransferComplete = async (result: any) => {
    // The transferMoney function already updates the account state
    // Just close the modal and let the useEffect handle the refresh
    setActiveModal(null);
  };

  const handleTransactionComplete = async (result: any) => {
    // The addTransaction function already updates the account state
    // Just close the modal and let the useEffect handle the refresh
    setActiveModal(null);
  };

  const handleLoanComplete = async (result: any) => {
    // The requestLoan function already updates the account state
    // Just close the modal and let the useEffect handle the refresh
    setActiveModal(null);
  };

  const stats = [
    {
      title: t("dashboard.totalBalance"),
      value: formatAmountSync(account.balance || 0, account.currency, currentCurrency),
      icon: currencyIcon,
      change: "+2.5%",
      changeType: "positive" as const,
    },
    {
      title: t("dashboard.thisMonth"),
      value: formatAmountSync(
        recentTransactions
          .filter(
            (t) =>
              t.type === "income" &&
              new Date(t.date).getMonth() === new Date().getMonth()
          )
          .reduce((sum, t) => sum + t.amount, 0),
        account.currency,
        currentCurrency
      ),
      icon: ArrowDownLeft,
      change: "+12.3%",
      changeType: "positive" as const,
    },
    {
      title: t("dashboard.expenses"),
      value: formatAmountSync(
        recentTransactions
          .filter(
            (t) =>
              t.type === "expense" &&
              new Date(t.date).getMonth() === new Date().getMonth()
          )
          .reduce((sum, t) => sum + t.amount, 0),
        account.currency,
        currentCurrency
      ),
      icon: ArrowUpRight,
      change: "-5.2%",
      changeType: "negative" as const,
    },
    {
      title: t("dashboard.activeLoans"),
      value: account.loans?.filter((l) => l.status === "active").length || 0,
      icon: TrendingUp,
      change: "0",
      changeType: "neutral" as const,
    },
  ];

   return (
    <Layout user={effectiveUser}>
      <div className="min-h-screen bg-theme-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-theme-foreground">
              {t("dashboard.welcome", {
                name:
                  effectiveUser?.user_metadata?.name || account.name || t("common.user"),
              })}
            </h1>
            <p className="text-theme-muted mt-2">
              {t("dashboard.account")}:{" "}
              {account.account_number || account.accountNumber}
              {isGuest && (
                <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                  {t("dashboard.guestMode")}
                </span>
              )}
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="bg-theme-card rounded-lg p-6 shadow-sm border border-theme"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-theme-muted">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-theme-card-foreground mt-2">
                      {typeof stat.value === "string"
                        ? stat.value
                        : stat.value.toString()}
                    </p>
                  </div>
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-full">
                    <stat.icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  <span
                    className={`text-sm font-medium ${
                      stat.changeType === "positive"
                        ? "text-green-600"
                        : stat.changeType === "negative"
                        ? "text-red-600"
                        : "text-theme-muted"
                    }`}
                  >
                    {stat.change}
                  </span>
                  <span className="text-sm text-theme-muted ml-2">
                    from last month
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Balance Card */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white mb-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Available Balance</p>
                <div className="flex items-center mt-2">
                  <p className="text-3xl font-bold">
                    {showBalance
                      ? formatAmountSync(account.balance || 0, account.currency, currentCurrency)
                      : "••••••"}
                  </p>
                  <button
                    onClick={() => setShowBalance(!showBalance)}
                    className="ml-3 p-1 hover:bg-white/20 rounded-full transition-colors"
                  >
                    {showBalance ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
              <div className="text-right">
                <p className="text-blue-100 text-sm">Account Number</p>
                <p className="text-lg font-semibold mt-1">
                  {account.account_number || account.accountNumber}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-theme-foreground mb-4">
              Quick Actions
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {quickActions.map((action) => (
                <button
                  key={action.id}
                  onClick={action.action}
                  className="bg-theme-card p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow text-left border border-theme"
                >
                  <div
                    className={`${action.color} p-3 rounded-full w-fit mb-4`}
                  >
                    <action.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-theme-card-foreground mb-1">
                    {action.title}
                  </h3>
                  <p className="text-sm text-theme-muted">
                    {action.description}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Recent Transactions */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-theme-foreground">
                Recent Transactions
              </h2>
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </div>
            <div className="space-y-3">
              {recentTransactions.length > 0 ? (
                recentTransactions.map((transaction) => (
                  <TransactionCard
                    key={transaction.id}
                    transaction={transaction}
                    onClick={() => {
                      /* Handle transaction details */
                    }}
                  />
                ))
              ) : (
                <div className="bg-theme-card rounded-lg p-8 text-center border border-theme">
                  <p className="text-theme-muted">
                    No transactions yet. Start by making a transfer or payment!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modals */}
        <TransferModal
          isOpen={activeModal === "transfer"}
          onClose={handleModalClose}
          onTransfer={async (toAccountNumber, amount, description) => {
            try {
              await transferMoney(toAccountNumber, amount, description);
              handleTransferComplete(null);
            } catch (error) {
              console.error("Transfer failed:", error);
            }
          }}
          currentBalance={account.balance || 0}
        />

        <BillPayModal
          isOpen={activeModal === "bill-pay"}
          onClose={handleModalClose}
          onPayment={async (transaction) => {
            try {
              await addTransaction(transaction);
              handleTransactionComplete(null);
            } catch (error) {
              console.error("Payment failed:", error);
            }
          }}
          currentBalance={account.balance || 0}
        />

        <AirtimeModal
          isOpen={activeModal === "airtime"}
          onClose={handleModalClose}
          onPurchase={async (transaction) => {
            try {
              await addTransaction(transaction);
              handleTransactionComplete(null);
            } catch (error) {
              console.error("Airtime purchase failed:", error);
            }
          }}
          currentBalance={account.balance || 0}
        />

        <LoanModal
          isOpen={activeModal === "loan"}
          onClose={handleModalClose}
          onLoanRequest={async (amount, termMonths) => {
            try {
              await requestLoan(amount, termMonths);
              handleLoanComplete(null);
            } catch (error) {
              console.error("Loan request failed:", error);
            }
          }}
          existingLoans={account.loans || []}
        />
      </div>
    </Layout>
  );
}
