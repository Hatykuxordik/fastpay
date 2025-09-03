"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import "../lib/i18n"; // Initialize i18n

interface I18nContextType {
  language: string;
  setLanguage: (lang: string) => void;
  t: (key: string, options?: any) => string;
  isLoading: boolean;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const { t, i18n } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const [language, setLanguageState] = useState(i18n.language || "en");

  useEffect(() => {
    // Wait for i18n to be initialized
    if (i18n.isInitialized) {
      setIsLoading(false);
      setLanguageState(i18n.language);
    } else {
      const handleInitialized = () => {
        setIsLoading(false);
        setLanguageState(i18n.language);
      };

      i18n.on("initialized", handleInitialized);
      return () => i18n.off("initialized", handleInitialized);
    }
  }, [i18n]);

  useEffect(() => {
    const handleLanguageChanged = (lng: string) => {
      setLanguageState(lng);
      // Update document language
      document.documentElement.lang = lng;
    };

    i18n.on("languageChanged", handleLanguageChanged);
    return () => i18n.off("languageChanged", handleLanguageChanged);
  }, [i18n]);

  const setLanguage = async (lang: string) => {
    try {
      await i18n.changeLanguage(lang);
      setLanguageState(lang);

      // Save to localStorage
      localStorage.setItem("fastpay-language", lang);

      // Update document language
      document.documentElement.lang = lang;
    } catch (error) {
      console.error("Failed to change language:", error);
    }
  };

  const contextValue: I18nContextType = {
    language,
    setLanguage,
    t,
    isLoading,
  };

  return (
    <I18nContext.Provider value={contextValue}>{children}</I18nContext.Provider>
  );
}

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return context;
};
