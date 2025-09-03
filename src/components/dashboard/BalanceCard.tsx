"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/contexts/AppContext";

interface BalanceCardProps {
  balance: number;
  label: string;
  change?: number;
  changeLabel?: string;
  className?: string;
}

export const BalanceCard: React.FC<BalanceCardProps> = ({
  balance,
  label,
  change,
  changeLabel,
  className = "",
}) => {
  const { formatAmountSync, convertAmount, currentCurrency } = useApp();
  const [convertedBalance, setConvertedBalance] = useState(balance);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const convertBalance = async () => {
      if (currentCurrency === "USD") {
        setConvertedBalance(balance);
        return;
      }

      setIsLoading(true);
      try {
        const converted = await convertAmount(balance, "USD");
        setConvertedBalance(converted);
      } catch (error) {
        console.error("Failed to convert balance:", error);
        setConvertedBalance(balance);
      } finally {
        setIsLoading(false);
      }
    };

    convertBalance();
  }, [balance, currentCurrency, convertAmount]);

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 ${className}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {label}
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {isLoading ? (
              <span className="animate-pulse">Loading...</span>
            ) : (
              formatAmountSync(convertedBalance)
            )}
          </p>
          {change !== undefined && changeLabel && (
            <p
              className={`text-sm ${
                change >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {change >= 0 ? "+" : ""}
              {change.toFixed(1)}% {changeLabel}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
