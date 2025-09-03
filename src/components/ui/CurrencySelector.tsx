"use client";

import React, { useState } from "react";
import { ChevronDown, DollarSign, Check } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { useI18n } from "@/providers/I18nProvider";
import { SUPPORTED_CURRENCIES, getCurrencySymbol } from "@/lib/currencyApi";

interface CurrencySelectorProps {
  variant?: "default" | "compact";
  showSymbol?: boolean;
  showFullName?: boolean;
  onCurrencyChange?: (currency: string) => void;
}

export function CurrencySelector({
  variant = "default",
  showSymbol = true,
  showFullName = true,
  onCurrencyChange,
}: CurrencySelectorProps) {
  const { currentCurrency, updatePreference, isConverting } = useApp();
  const { t } = useI18n();
  const [isOpen, setIsOpen] = useState(false);

  const handleCurrencyChange = async (newCurrency: string) => {
    if (newCurrency === currentCurrency) {
      setIsOpen(false);
      return;
    }

    try {
      updatePreference("currency", newCurrency);
      onCurrencyChange?.(newCurrency);
      setIsOpen(false);
    } catch (error) {
      console.error("Failed to change currency:", error);
    }
  };

  const currentCurrencyData = SUPPORTED_CURRENCIES.find(
    (c) => c.code === currentCurrency
  );

  if (variant === "compact") {
    return (
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          disabled={isConverting}
          className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {showSymbol && (
            <span className="text-lg font-semibold text-gray-700 dark:text-gray-300">
              {getCurrencySymbol(currentCurrency)}
            </span>
          )}
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {currentCurrency}
          </span>
          <ChevronDown
            className={`h-4 w-4 text-gray-600 dark:text-gray-400 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-20 max-h-64 overflow-y-auto">
              {SUPPORTED_CURRENCIES.map((currency) => (
                <button
                  key={currency.code}
                  onClick={() => handleCurrencyChange(currency.code)}
                  disabled={isConverting}
                  className={`w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors first:rounded-t-lg last:rounded-b-lg disabled:opacity-50 disabled:cursor-not-allowed ${
                    currentCurrency === currency.code
                      ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                      : "text-gray-700 dark:text-gray-300"
                  }`}
                >
                  <span className="text-lg font-semibold w-8 text-center">
                    {currency.symbol}
                  </span>
                  <div className="flex-1">
                    <div className="font-medium">{currency.code}</div>
                    {showFullName && (
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {currency.name}
                      </div>
                    )}
                  </div>
                  {currentCurrency === currency.code && (
                    <Check className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  )}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {t("common.currency")}
      </label>
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          disabled={isConverting}
          className="w-full flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="flex items-center space-x-3">
            {showSymbol && (
              <span className="text-xl font-semibold text-gray-700 dark:text-gray-300 w-8 text-center">
                {currentCurrencyData?.symbol}
              </span>
            )}
            <div className="text-left">
              <div className="font-medium text-gray-900 dark:text-white">
                {currentCurrency}
              </div>
              {showFullName && currentCurrencyData && (
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {currentCurrencyData.name}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {isConverting && (
              <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full" />
            )}
            <ChevronDown
              className={`h-5 w-5 text-gray-400 transition-transform ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </div>
        </button>

        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />
            <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-20 max-h-64 overflow-y-auto">
              {SUPPORTED_CURRENCIES.map((currency) => (
                <button
                  key={currency.code}
                  onClick={() => handleCurrencyChange(currency.code)}
                  disabled={isConverting}
                  className={`w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors first:rounded-t-lg last:rounded-b-lg disabled:opacity-50 disabled:cursor-not-allowed ${
                    currentCurrency === currency.code
                      ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                      : "text-gray-700 dark:text-gray-300"
                  }`}
                >
                  <span className="text-xl font-semibold w-8 text-center">
                    {currency.symbol}
                  </span>
                  <div className="flex-1">
                    <div className="font-medium">{currency.code}</div>
                    {showFullName && (
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {currency.name}
                      </div>
                    )}
                  </div>
                  {currentCurrency === currency.code && (
                    <Check className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  )}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {isConverting && (
        <div className="text-sm text-blue-600 dark:text-blue-400 flex items-center space-x-2">
          <div className="animate-spin h-3 w-3 border-2 border-blue-500 border-t-transparent rounded-full" />
          <span>Converting currency...</span>
        </div>
      )}
    </div>
  );
}

export default CurrencySelector;
