import React, { useState, useEffect } from "react";
import { Search, Filter, X, Calendar } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Transaction } from "@/components/ui/TransactionCard";

interface SearchBarProps {
  transactions: Transaction[];
  onFilteredResults: (filtered: Transaction[]) => void;
  placeholder?: string;
}

interface FilterOptions {
  type: "all" | "income" | "expense" | "transfer";
  category: "all" | "transfer" | "bill_pay" | "airtime" | "loan" | "other";
  dateRange: "all" | "7d" | "30d" | "90d";
  amountRange: {
    min: string;
    max: string;
  };
}

export const SearchBar: React.FC<SearchBarProps> = ({
  transactions,
  onFilteredResults,
  placeholder = "Search transactions...",
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    type: "all",
    category: "all",
    dateRange: "all",
    amountRange: { min: "", max: "" },
  });

  // Apply filters and search
  useEffect(() => {
    let filtered = [...transactions];

    // Text search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (transaction) =>
          transaction.description.toLowerCase().includes(query) ||
          transaction.recipient?.toLowerCase().includes(query) ||
          transaction.amount.toString().includes(query) ||
          transaction.category.toLowerCase().includes(query)
      );
    }

    // Type filter
    if (filters.type !== "all") {
      filtered = filtered.filter((t) => t.type === filters.type);
    }

    // Category filter
    if (filters.category !== "all") {
      filtered = filtered.filter((t) => t.category === filters.category);
    }

    // Date range filter
    if (filters.dateRange !== "all") {
      const now = new Date();
      const daysBack =
        filters.dateRange === "7d" ? 7 : filters.dateRange === "30d" ? 30 : 90;
      const startDate = new Date(
        now.getTime() - daysBack * 24 * 60 * 60 * 1000
      );

      filtered = filtered.filter((t) => new Date(t.date) >= startDate);
    }

    // Amount range filter
    if (filters.amountRange.min || filters.amountRange.max) {
      const min = parseFloat(filters.amountRange.min) || 0;
      const max = parseFloat(filters.amountRange.max) || Infinity;

      filtered = filtered.filter((t) => t.amount >= min && t.amount <= max);
    }

    // Sort by date (newest first)
    filtered.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    onFilteredResults(filtered);
  }, [searchQuery, filters, transactions, onFilteredResults]);

  const handleFilterChange = (key: keyof FilterOptions, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleAmountRangeChange = (key: "min" | "max", value: string) => {
    setFilters((prev) => ({
      ...prev,
      amountRange: { ...prev.amountRange, [key]: value },
    }));
  };

  const clearFilters = () => {
    setFilters({
      type: "all",
      category: "all",
      dateRange: "all",
      amountRange: { min: "", max: "" },
    });
    setSearchQuery("");
  };

  const hasActiveFilters =
    filters.type !== "all" ||
    filters.category !== "all" ||
    filters.dateRange !== "all" ||
    filters.amountRange.min ||
    filters.amountRange.max ||
    searchQuery.trim();

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
        <input
          type="text"
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-16 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              title="Clear filters"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-1 transition-colors ${
              showFilters || hasActiveFilters
                ? "text-blue-600 dark:text-blue-400"
                : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            }`}
            title="Toggle filters"
          >
            <Filter className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Transaction Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Transaction Type
              </label>
              <select
                value={filters.type}
                onChange={(e) => handleFilterChange("type", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="all">All Types</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
                <option value="transfer">Transfer</option>
              </select>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category
              </label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange("category", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="all">All Categories</option>
                <option value="transfer">Transfer</option>
                <option value="bill_pay">Bill Payment</option>
                <option value="airtime">Airtime</option>
                <option value="loan">Loan</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Date Range
              </label>
              <select
                value={filters.dateRange}
                onChange={(e) =>
                  handleFilterChange("dateRange", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="all">All Time</option>
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
              </select>
            </div>

            {/* Amount Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Amount Range
              </label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.amountRange.min}
                  onChange={(e) =>
                    handleAmountRangeChange("min", e.target.value)
                  }
                  className="w-full px-2 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.amountRange.max}
                  onChange={(e) =>
                    handleAmountRangeChange("max", e.target.value)
                  }
                  className="w-full px-2 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                />
              </div>
            </div>
          </div>

          {/* Filter Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {transactions.length} total transactions
            </p>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                disabled={!hasActiveFilters}
              >
                Clear All
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFilters(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
