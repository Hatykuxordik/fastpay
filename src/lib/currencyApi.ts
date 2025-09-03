// Enhanced Currency API service for real-time exchange rates
// Uses secure server-side API routes to protect API keys

export interface ExchangeRates {
  [key: string]: number;
}

export interface CurrencyConversionResult {
  success: boolean;
  amount: number;
  from: string;
  to: string;
  converted: number;
  rate: number;
  timestamp: string;
}

export interface ExchangeRateResult {
  success: boolean;
  base: string;
  rates: ExchangeRates;
  timestamp: string;
}

// Currency symbols mapping
export const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  NGN: "₦",
  CAD: "C$",
  AUD: "A$",
  JPY: "¥",
  CHF: "CHF",
  CNY: "¥",
  INR: "₹",
};

// Supported currencies with their full names
export const SUPPORTED_CURRENCIES = [
  { code: "USD", name: "US Dollar", symbol: "$" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "GBP", name: "British Pound", symbol: "£" },
  { code: "NGN", name: "Nigerian Naira", symbol: "₦" },
  { code: "CAD", name: "Canadian Dollar", symbol: "C$" },
  { code: "AUD", name: "Australian Dollar", symbol: "A$" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥" },
  { code: "CHF", name: "Swiss Franc", symbol: "CHF" },
  { code: "CNY", name: "Chinese Yuan", symbol: "¥" },
  { code: "INR", name: "Indian Rupee", symbol: "₹" },
];

// Cache for client-side
let cachedRates: ExchangeRates | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

export async function getExchangeRates(
  baseCurrency = "USD"
): Promise<ExchangeRates> {
  const now = Date.now();

  // Return cached rates if they're still fresh and for the same base currency
  if (cachedRates && now - lastFetchTime < CACHE_DURATION) {
    return cachedRates;
  }

  try {
    const response = await fetch(`/api/currency?base=${baseCurrency}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: ExchangeRateResult = await response.json();

    if (data.success && data.rates) {
      cachedRates = data.rates;
      lastFetchTime = now;
      return cachedRates;
    } else {
      throw new Error("Invalid API response format");
    }
  } catch (error) {
    console.error("Failed to fetch exchange rates:", error);

    // Return fallback rates
    return {
      USD: 1,
      EUR: 0.85,
      GBP: 0.73,
      NGN: 1650,
      CAD: 1.35,
      AUD: 1.45,
      JPY: 150,
      CHF: 0.88,
      CNY: 7.2,
      INR: 83,
    };
  }
}

export async function convertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string
): Promise<number> {
  if (fromCurrency === toCurrency) {
    return amount;
  }

  try {
    const response = await fetch("/api/currency", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount,
        from: fromCurrency,
        to: toCurrency,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: CurrencyConversionResult = await response.json();

    if (data.success) {
      return data.converted;
    } else {
      throw new Error("Currency conversion failed");
    }
  } catch (error) {
    console.error("Currency conversion failed:", error);

    // Fallback conversion using cached rates
    try {
      const rates = await getExchangeRates("USD");
      const fromRate = rates[fromCurrency] || 1;
      const toRate = rates[toCurrency] || 1;
      const usdAmount = amount / fromRate;
      const convertedAmount = usdAmount * toRate;

      return Math.round(convertedAmount * 100) / 100;
    } catch (fallbackError) {
      console.error("Fallback conversion also failed:", fallbackError);
      return amount; // Return original amount as last resort
    }
  }
}

export function formatCurrencyAmount(
  amount: number,
  currencyCode: string
): string {
  const symbol = CURRENCY_SYMBOLS[currencyCode] || currencyCode;

  // Format number with appropriate decimal places
  const formattedNumber = amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return `${symbol}${formattedNumber}`;
}

export function getCurrencySymbol(currencyCode: string): string {
  return CURRENCY_SYMBOLS[currencyCode] || currencyCode;
}

export function getCurrencyName(currencyCode: string): string {
  const currency = SUPPORTED_CURRENCIES.find((c) => c.code === currencyCode);
  return currency?.name || currencyCode;
}

// Batch conversion for multiple amounts
export async function convertMultipleAmounts(
  amounts: number[],
  fromCurrency: string,
  toCurrency: string
): Promise<number[]> {
  if (fromCurrency === toCurrency) {
    return amounts;
  }

  try {
    const rates = await getExchangeRates("USD");
    const fromRate = rates[fromCurrency] || 1;
    const toRate = rates[toCurrency] || 1;
    const exchangeRate = toRate / fromRate;

    return amounts.map(
      (amount) => Math.round(amount * exchangeRate * 100) / 100
    );
  } catch (error) {
    console.error("Batch currency conversion failed:", error);
    return amounts; // Return original amounts as fallback
  }
}

// Get historical exchange rate (placeholder for future implementation)
export async function getHistoricalRate(
  fromCurrency: string,
  toCurrency: string,
  date: string
): Promise<number> {
  // This would require a different API endpoint for historical data
  // For now, return current rate
  console.warn("Historical rates not implemented, returning current rate");

  try {
    const rates = await getExchangeRates("USD");
    const fromRate = rates[fromCurrency] || 1;
    const toRate = rates[toCurrency] || 1;

    return Math.round((toRate / fromRate) * 10000) / 10000;
  } catch (error) {
    console.error("Failed to get historical rate:", error);
    return 1;
  }
}
