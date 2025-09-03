import { NextRequest, NextResponse } from "next/server";

// ExchangeRate-API endpoints (free tier)
const EXCHANGE_RATE_API_BASE = "https://v6.exchangerate-api.com/v6";
// For demo purposes, we'll use a demo API key. In production, this should be in environment variables
const API_KEY = "demo-key"; // Replace with actual API key from ExchangeRate-API

// Fallback free API endpoints
const FALLBACK_API = "https://api.exchangerate.host/latest";
const BACKUP_API = "https://api.exchangerate-api.com/v4/latest";

// Fallback rates in case all APIs fail
const FALLBACK_RATES: Record<string, number> = {
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

interface ExchangeRateResponse {
  result?: string;
  base_code?: string;
  conversion_rates?: Record<string, number>;
  base?: string;
  date?: string;
  rates?: Record<string, number>;
}

interface PairConversionResponse {
  result: string;
  base_code: string;
  target_code: string;
  conversion_rate: number;
  conversion_result?: number;
}

// Cache for exchange rates
let cachedRates: Record<string, number> | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

async function fetchExchangeRates(
  baseCurrency = "USD"
): Promise<Record<string, number>> {
  const now = Date.now();

  // Return cached rates if they're still fresh
  if (cachedRates && now - lastFetchTime < CACHE_DURATION) {
    return cachedRates;
  }

  try {
    // Try ExchangeRate-API first (primary)
    let response = await fetch(
      `${EXCHANGE_RATE_API_BASE}/${API_KEY}/latest/${baseCurrency}`,
      {
        next: { revalidate: 3600 }, // Cache for 1 hour
      }
    );

    if (response.ok) {
      const data: ExchangeRateResponse = await response.json();
      if (data.result === "success" && data.conversion_rates) {
        cachedRates = data.conversion_rates;
        lastFetchTime = now;
        return cachedRates;
      }
    }

    // Try first fallback API
    response = await fetch(`${FALLBACK_API}?base=${baseCurrency}`, {
      next: { revalidate: 3600 },
    });

    if (response.ok) {
      const data: ExchangeRateResponse = await response.json();
      if (data && data.rates) {
        cachedRates = data.rates;
        lastFetchTime = now;
        return cachedRates;
      }
    }

    // Try backup API
    response = await fetch(`${BACKUP_API}/${baseCurrency}`, {
      next: { revalidate: 3600 },
    });

    if (response.ok) {
      const data: ExchangeRateResponse = await response.json();
      if (data && data.rates) {
        cachedRates = data.rates;
        lastFetchTime = now;
        return cachedRates;
      }
    }

    throw new Error("All APIs failed");
  } catch (error) {
    console.warn("Failed to fetch exchange rates, using fallback:", error);
    return FALLBACK_RATES;
  }
}

async function convertCurrencyDirect(
  amount: number,
  from: string,
  to: string
): Promise<{ rate: number; converted: number }> {
  try {
    // Try ExchangeRate-API pair conversion first
    const response = await fetch(
      `${EXCHANGE_RATE_API_BASE}/${API_KEY}/pair/${from}/${to}/${amount}`,
      {
        next: { revalidate: 3600 },
      }
    );

    if (response.ok) {
      const data: PairConversionResponse = await response.json();
      if (data.result === "success") {
        return {
          rate: data.conversion_rate,
          converted: data.conversion_result || amount * data.conversion_rate,
        };
      }
    }
  } catch (error) {
    console.warn("Direct conversion failed, falling back to standard method:", error);
  }

  // Fallback to standard conversion method
  const rates = await fetchExchangeRates("USD");
  const fromRate = rates[from] || 1;
  const toRate = rates[to] || 1;

  const usdAmount = from === "USD" ? amount : amount / fromRate;
  const convertedAmount = to === "USD" ? usdAmount : usdAmount * toRate;

  return {
    rate: Math.round((toRate / fromRate) * 10000) / 10000,
    converted: Math.round(convertedAmount * 100) / 100,
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const base = searchParams.get("base") || "USD";

    // Validate base currency
    if (!base || typeof base !== "string" || base.length !== 3) {
      return NextResponse.json(
        { error: "Invalid base currency" },
        { status: 400 }
      );
    }

    const rates = await fetchExchangeRates(base.toUpperCase());

    return NextResponse.json({
      success: true,
      base: base.toUpperCase(),
      rates,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Currency API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch exchange rates",
        fallback: FALLBACK_RATES,
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, from, to } = body;

    // Validate input
    if (!amount || !from || !to) {
      return NextResponse.json(
        { error: "Missing required parameters: amount, from, to" },
        { status: 400 }
      );
    }

    if (typeof amount !== "number" || amount < 0) {
      return NextResponse.json(
        { error: "Amount must be a positive number" },
        { status: 400 }
      );
    }

    if (typeof from !== "string" || typeof to !== "string") {
      return NextResponse.json(
        { error: "Currency codes must be strings" },
        { status: 400 }
      );
    }

    const fromUpper = from.toUpperCase();
    const toUpper = to.toUpperCase();

    // Same currency conversion
    if (fromUpper === toUpper) {
      return NextResponse.json({
        success: true,
        amount,
        from: fromUpper,
        to: toUpper,
        converted: amount,
        rate: 1,
        timestamp: new Date().toISOString(),
      });
    }

    // Get conversion result
    const { rate, converted } = await convertCurrencyDirect(amount, fromUpper, toUpper);

    return NextResponse.json({
      success: true,
      amount,
      from: fromUpper,
      to: toUpper,
      converted,
      rate,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Currency conversion error:", error);
    return NextResponse.json(
      { 
        success: false,
        error: "Failed to convert currency" 
      },
      { status: 500 }
    );
  }
}
