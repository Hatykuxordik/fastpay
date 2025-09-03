// Currency utilities for multi-currency support

export interface Currency {
  symbol: string;
  code: string;
  name: string;
  rate: number; // Exchange rate to USD
}

export const CURRENCIES: Record<string, Currency> = {
  USD: {
    symbol: '$',
    code: 'USD',
    name: 'US Dollar',
    rate: 1
  },
  EUR: {
    symbol: '€',
    code: 'EUR',
    name: 'Euro',
    rate: 0.85
  },
  GBP: {
    symbol: '£',
    code: 'GBP',
    name: 'British Pound',
    rate: 0.73
  },
  NGN: {
    symbol: '₦',
    code: 'NGN',
    name: 'Nigerian Naira',
    rate: 1650
  }
}

export const formatCurrency = (amount: number, currencyCode: string = 'USD'): string => {
  const currency = CURRENCIES[currencyCode] || CURRENCIES.USD;
  return `${currency.symbol}${amount.toLocaleString('en-US', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  })}`;
}

export const convertCurrency = (amount: number, fromCurrency: string, toCurrency: string): number => {
  const from = CURRENCIES[fromCurrency] || CURRENCIES.USD;
  const to = CURRENCIES[toCurrency] || CURRENCIES.USD;
  
  // Convert to USD first, then to target currency
  const usdAmount = amount / from.rate;
  return usdAmount * to.rate;
}

// For backward compatibility with nigerianData
export const formatNaira = (amount: number): string => {
  return formatCurrency(amount, 'NGN');
}

// Nigerian mobile networks for airtime functionality
export const NIGERIAN_MOBILE_NETWORKS = [
  {
    id: 'mtn',
    name: 'MTN Nigeria',
    code: 'MTN',
    prefixes: ['0803', '0806', '0813', '0816', '0810', '0814', '0903', '0906', '0913', '0916', '0704'],
    color: '#FFCC00'
  },
  {
    id: 'airtel',
    name: 'Airtel Nigeria',
    code: 'AIRTEL',
    prefixes: ['0802', '0808', '0812', '0701', '0902', '0907', '0901'],
    color: '#FF0000'
  },
  {
    id: 'glo',
    name: 'Globacom',
    code: 'GLO',
    prefixes: ['0805', '0807', '0815', '0811', '0905', '0915'],
    color: '#00B04F'
  },
  {
    id: '9mobile',
    name: '9mobile',
    code: '9MOBILE',
    prefixes: ['0809', '0817', '0818', '0908', '0909'],
    color: '#00A651'
  }
];

export const AIRTIME_DENOMINATIONS = [
  100, 200, 500, 1000, 1500, 2000, 2500, 5000, 10000
];

