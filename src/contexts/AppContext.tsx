"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { useTheme } from "next-themes";
import {
  convertCurrency,
  formatCurrencyAmount,
  getExchangeRates,
  SUPPORTED_CURRENCIES,
} from "@/lib/currencyApi";
import { useI18n } from "@/providers/I18nProvider";

// Types
export interface UserSettings {
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
    lowBalance: boolean;
    transactions: boolean;
    marketing: boolean;
  };
  privacy: {
    profileVisibility: "public" | "private";
    transactionHistory: "visible" | "hidden";
    analytics: boolean;
    twoFactorAuth: boolean;
    biometricAuth: boolean;
  };
  preferences: {
    currency: string;
    language: string;
    theme: "light" | "dark" | "system";
    lowBalanceThreshold: number;
    dateFormat: "DD/MM/YYYY" | "MM/DD/YYYY" | "YYYY-MM-DD";
    timeFormat: "12h" | "24h";
    autoLogout: number; // minutes
  };
  display: {
    showBalance: boolean;
    compactView: boolean;
    animationsEnabled: boolean;
    soundEnabled: boolean;
  };
}

interface CurrencyConversionCache {
  [key: string]: {
    value: number;
    timestamp: number;
  };
}

interface AppContextType {
  // Settings
  settings: UserSettings;
  updateSettings: (newSettings: UserSettings) => void;
  updatePreference: (
    key: keyof UserSettings["preferences"],
    value: any
  ) => void;
  updateNotificationSetting: (
    key: keyof UserSettings["notifications"],
    value: boolean
  ) => void;
  updatePrivacySetting: (
    key: keyof UserSettings["privacy"],
    value: any
  ) => void;
  updateDisplaySetting: (
    key: keyof UserSettings["display"],
    value: any
  ) => void;

  // Currency
  currentCurrency: string;
  supportedCurrencies: typeof SUPPORTED_CURRENCIES;
  formatAmount: (
    amount: number,
    fromCurrency?: string,
    toCurrency?: string
  ) => Promise<string>;
  formatAmountSync: (
    amount: number,
    fromCurrency?: string,
    toCurrency?: string
  ) => string;
  convertAmount: (
    amount: number,
    fromCurrency?: string,
    toCurrency?: string
  ) => Promise<number>;
  convertMultipleAmounts: (
    amounts: number[],
    fromCurrency?: string,
    toCurrency?: string
  ) => Promise<number[]>;

  // Theme (integrated with next-themes)
  theme: string | undefined;
  isDark: boolean;
  setTheme: (theme: string) => void;
  toggleTheme: () => void;

  // Language (integrated with i18n)
  currentLanguage: string;
  setLanguage: (language: string) => Promise<void>;

  // Loading states
  isLoading: boolean;
  isConverting: boolean;

  // User data
  userData: {
    isGuest: boolean;
    guestName?: string;
    userId?: string;
    email?: string;
  };
  setUserData: (data: Partial<AppContextType["userData"]>) => void;

  // Utilities
  resetSettings: () => void;
  exportSettings: () => string;
  importSettings: (settingsJson: string) => boolean;
}

const defaultSettings: UserSettings = {
  notifications: {
    email: true,
    push: true,
    sms: false,
    lowBalance: true,
    transactions: true,
    marketing: false,
  },
  privacy: {
    profileVisibility: "private",
    transactionHistory: "visible",
    analytics: true,
    twoFactorAuth: false,
    biometricAuth: false,
  },
  preferences: {
    currency: "USD",
    language: "en",
    theme: "system",
    lowBalanceThreshold: 100,
    dateFormat: "MM/DD/YYYY",
    timeFormat: "12h",
    autoLogout: 30,
  },
  display: {
    showBalance: true,
    compactView: false,
    animationsEnabled: true,
    soundEnabled: true,
  },
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [conversionCache, setConversionCache] =
    useState<CurrencyConversionCache>({});
  const [userData, setUserDataState] = useState({
    isGuest: false,
    guestName: undefined,
    userId: undefined,
    email: undefined,
  });

  // Use next-themes for theme management
  const { theme, setTheme: setNextTheme, resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  // Use i18n for language management
  const { setLanguage: setI18nLanguage } = useI18n();

  // Load settings from localStorage on mount
  useEffect(() => {
    const loadSettings = () => {
      try {
        const savedSettings = localStorage.getItem("fastpay-settings");
        const savedUserData = localStorage.getItem("fastpay-user-data");

        if (savedSettings) {
          const parsed = JSON.parse(savedSettings);
          // Merge with defaults to ensure all properties exist
          const mergedSettings = {
            ...defaultSettings,
            ...parsed,
            notifications: {
              ...defaultSettings.notifications,
              ...parsed.notifications,
            },
            privacy: { ...defaultSettings.privacy, ...parsed.privacy },
            preferences: {
              ...defaultSettings.preferences,
              ...parsed.preferences,
            },
            display: { ...defaultSettings.display, ...parsed.display },
          };
          setSettings(mergedSettings);

          if (savedUserData) {
            const parsedUserData = JSON.parse(savedUserData);
            setUserDataState((prev) => ({ ...prev, ...parsedUserData }));
            if (parsedUserData.isGuest && parsedUserData.guestCurrency) {
              mergedSettings.preferences.currency = parsedUserData.guestCurrency;
            }
            // Call updatePreference to ensure the currency is set and effects are triggered
            updatePreference("currency", mergedSettings.preferences.currency);
          }

          setSettings(mergedSettings);
        }
      } catch (error) {
        console.error("Failed to load settings:", error);
      }
    };

    loadSettings();

    // Pre-fetch exchange rates
    getExchangeRates().catch(console.error);
  }, []);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("fastpay-settings", JSON.stringify(settings));
  }, [settings]);

  // Save user data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("fastpay-user-data", JSON.stringify(userData));
  }, [userData]);

  const updateSettings = (newSettings: UserSettings) => {
    setSettings(newSettings);
  };

  // Effect to preload exchange rates when currency changes
  useEffect(() => {
    const preloadExchangeRates = async () => {
      const currentCurrency = settings.preferences.currency;
      if (currentCurrency !== "USD") {
        try {
          // Preload the conversion rate for immediate use
          await convertAmount(1, "USD", currentCurrency);
        } catch (error) {
          console.error("Failed to preload exchange rates:", error);
        }
      }
    };

    preloadExchangeRates();
  }, [settings.preferences.currency]);

  // Enhanced updatePreference to trigger rate preloading
  const updatePreference = (
    key: keyof UserSettings["preferences"],
    value: any
  ) => {
    const newSettings = {
      ...settings,
      preferences: {
        ...settings.preferences,
        [key]: value,
      },
    };
    setSettings(newSettings);

    // Handle special cases
    if (key === "theme") {
      setNextTheme(value);
    } else if (key === "language") {
      setI18nLanguage(value).catch(console.error);
    } else if (key === "currency") {
      // Clear conversion cache when currency changes
      setConversionCache({});
      // Preload rates for new currency
      convertAmount(1, "USD", value).catch(console.error);
      // Update user data if guest
      if (userData.isGuest) {
        setUserDataState((prev) => ({
          ...prev,
          guestCurrency: value,
        }));
      }
    }
  };

  const updateNotificationSetting = (
    key: keyof UserSettings["notifications"],
    value: boolean
  ) => {
    const newSettings = {
      ...settings,
      notifications: {
        ...settings.notifications,
        [key]: value,
      },
    };
    setSettings(newSettings);
  };

  const updatePrivacySetting = (
    key: keyof UserSettings["privacy"],
    value: any
  ) => {
    const newSettings = {
      ...settings,
      privacy: {
        ...settings.privacy,
        [key]: value,
      },
    };
    setSettings(newSettings);
  };

  const updateDisplaySetting = (
    key: keyof UserSettings["display"],
    value: any
  ) => {
    const newSettings = {
      ...settings,
      display: {
        ...settings.display,
        [key]: value,
      },
    };
    setSettings(newSettings);
  };

  // Enhanced formatAmountSync function with real currency conversion
  const formatAmountSync = useCallback(
    (amount: number, fromCurrency = "USD", toCurrency?: string) => {
      const targetCurrency = toCurrency || settings.preferences.currency;

      if (fromCurrency === targetCurrency) {
        return formatCurrencyAmount(amount, targetCurrency);
      }

      // Check if we have cached conversion rate
      const cacheKey = `1-${fromCurrency}-${targetCurrency}`;
      const cached = conversionCache[cacheKey];
      const now = Date.now();

      if (cached && now - cached.timestamp < 300000) {
        const convertedAmount = amount * cached.value;
        return formatCurrencyAmount(convertedAmount, targetCurrency);
      }

      // If no cached rate, use fallback rates for immediate display
      const fallbackRates: { [key: string]: number } = {
        "USD-EUR": 0.85,
        "USD-GBP": 0.73,
        "USD-NGN": 1650,
        "USD-CAD": 1.35,
        "USD-AUD": 1.45,
        "EUR-USD": 1.18,
        "GBP-USD": 1.37,
        "NGN-USD": 0.00061,
        "CAD-USD": 0.74,
        "AUD-USD": 0.69,
      };

      const rateKey = `${fromCurrency}-${targetCurrency}`;
      const rate = fallbackRates[rateKey] || 1;
      const convertedAmount = amount * rate;

      return formatCurrencyAmount(convertedAmount, targetCurrency);
    },
    [settings.preferences.currency, conversionCache]
  );

  const convertAmount = useCallback(
    async (amount: number, fromCurrency = "USD", toCurrency?: string) => {
      const targetCurrency = toCurrency || settings.preferences.currency;

      if (fromCurrency === targetCurrency) {
        return amount;
      }

      // Check cache first
      const cacheKey = `${amount}-${fromCurrency}-${targetCurrency}`;
      const cached = conversionCache[cacheKey];
      const now = Date.now();

      if (cached && now - cached.timestamp < 300000) {
        return cached.value;
      }

      setIsConverting(true);
      try {
        const converted = await convertCurrency(
          amount,
          fromCurrency,
          targetCurrency
        );

        // Update cache
        setConversionCache((prev) => ({
          ...prev,
          [cacheKey]: {
            value: converted,
            timestamp: now,
          },
        }));

        return converted;
      } finally {
        setIsConverting(false);
      }
    },
    [settings.preferences.currency, conversionCache]
  );

  // Async version that fetches real rates
  const formatAmount = useCallback(
    async (amount: number, fromCurrency = "USD", toCurrency?: string) => {
      const targetCurrency = toCurrency || settings.preferences.currency;

      if (fromCurrency === targetCurrency) {
        return formatCurrencyAmount(amount, targetCurrency);
      }

      try {
        const convertedAmount = await convertAmount(
          amount,
          fromCurrency,
          targetCurrency
        );
        return formatCurrencyAmount(convertedAmount, targetCurrency);
      } catch (error) {
        console.error("Currency conversion failed:", error);
        // Fallback to sync version
        return formatAmountSync(amount, fromCurrency, targetCurrency);
      }
    },
    [settings.preferences.currency, convertAmount, formatAmountSync]
  );

  const convertMultipleAmounts = useCallback(
    async (amounts: number[], fromCurrency = "USD", toCurrency?: string) => {
      const targetCurrency = toCurrency || settings.preferences.currency;

      if (fromCurrency === targetCurrency) {
        return amounts;
      }

      setIsConverting(true);
      try {
        // Get exchange rates once and apply to all amounts
        const rates = await getExchangeRates("USD");
        const fromRate = rates[fromCurrency] || 1;
        const toRate = rates[targetCurrency] || 1;
        const exchangeRate = toRate / fromRate;

        return amounts.map(
          (amount) => Math.round(amount * exchangeRate * 100) / 100
        );
      } finally {
        setIsConverting(false);
      }
    },
    [settings.preferences.currency]
  );

  const setTheme = (newTheme: string) => {
    setNextTheme(newTheme);
    updatePreference("theme", newTheme);
  };

  const toggleTheme = () => {
    const newTheme = isDark ? "light" : "dark";
    setTheme(newTheme);
  };

  const setLanguage = async (language: string) => {
    try {
      await setI18nLanguage(language);
      updatePreference("language", language);
    } catch (error) {
      console.error("Failed to change language:", error);
      throw error;
    }
  };

  const setUserData = (data: Partial<AppContextType["userData"]>) => {
    setUserDataState((prev) => ({ ...prev, ...data }));
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
    setNextTheme(defaultSettings.preferences.theme);
    setI18nLanguage(defaultSettings.preferences.language).catch(console.error);
  };

  const exportSettings = () => {
    const exportData = {
      settings,
      userData,
      exportDate: new Date().toISOString(),
      version: "1.0.0",
    };
    return JSON.stringify(exportData, null, 2);
  };

  const importSettings = (settingsJson: string) => {
    try {
      const importData = JSON.parse(settingsJson);

      if (importData.settings) {
        // Validate and merge settings
        const mergedSettings = {
          ...defaultSettings,
          ...importData.settings,
          notifications: {
            ...defaultSettings.notifications,
            ...importData.settings.notifications,
          },
          privacy: {
            ...defaultSettings.privacy,
            ...importData.settings.privacy,
          },
          preferences: {
            ...defaultSettings.preferences,
            ...importData.settings.preferences,
          },
          display: {
            ...defaultSettings.display,
            ...importData.settings.display,
          },
        };
        setSettings(mergedSettings);

        // Apply theme and language
        setNextTheme(mergedSettings.preferences.theme);
        setI18nLanguage(mergedSettings.preferences.language).catch(
          console.error
        );
      }

      return true;
    } catch (error) {
      console.error("Failed to import settings:", error);
      return false;
    }
  };

  return (
    <AppContext.Provider
      value={{
        settings,
        updateSettings,
        updatePreference,
        updateNotificationSetting,
        updatePrivacySetting,
        updateDisplaySetting,
        currentCurrency: settings.preferences.currency,
        supportedCurrencies: SUPPORTED_CURRENCIES,
        formatAmount,
        formatAmountSync,
        convertAmount,
        convertMultipleAmounts,
        theme,
        isDark,
        setTheme,
        toggleTheme,
        currentLanguage: settings.preferences.language,
        setLanguage,
        isLoading,
        isConverting,
        userData,
        setUserData,
        resetSettings,
        exportSettings,
        importSettings,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
