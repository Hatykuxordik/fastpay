"use client";

import React, { useState } from "react";
import { ChevronDown, Globe, Check } from "lucide-react";
import { useI18n } from "@/providers/I18nProvider";
import { languageConfig } from "@/lib/i18n";

interface LanguageSelectorProps {
  variant?: "default" | "compact";
  showFlag?: boolean;
  showNativeName?: boolean;
}

export function LanguageSelector({
  variant = "default",
  showFlag = true,
  showNativeName = true,
}: LanguageSelectorProps) {
  const { language, setLanguage, t } = useI18n();
  const [isOpen, setIsOpen] = useState(false);

  const handleLanguageChange = async (newLanguage: string) => {
    await setLanguage(newLanguage);
    setIsOpen(false);
  };

  const currentLanguageConfig =
    languageConfig[language as keyof typeof languageConfig];

  if (variant === "compact") {
    return (
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          {showFlag && (
            <span className="text-lg">{currentLanguageConfig?.flag}</span>
          )}
          <Globe className="h-4 w-4 text-gray-600 dark:text-gray-400" />
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
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-20">
              {Object.entries(languageConfig).map(([code, config]) => (
                <button
                  key={code}
                  onClick={() => handleLanguageChange(code)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors first:rounded-t-lg last:rounded-b-lg ${
                    language === code
                      ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                      : "text-gray-700 dark:text-gray-300"
                  }`}
                >
                  <span className="text-lg">{config.flag}</span>
                  <div className="flex-1">
                    <div className="font-medium">{config.name}</div>
                    {showNativeName && (
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {config.nativeName}
                      </div>
                    )}
                  </div>
                  {language === code && (
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
        {t("common.language")}
      </label>
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <div className="flex items-center space-x-3">
            {showFlag && (
              <span className="text-lg">{currentLanguageConfig?.flag}</span>
            )}
            <div className="text-left">
              <div className="font-medium text-gray-900 dark:text-white">
                {currentLanguageConfig?.name}
              </div>
              {showNativeName && (
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {currentLanguageConfig?.nativeName}
                </div>
              )}
            </div>
          </div>
          <ChevronDown
            className={`h-5 w-5 text-gray-400 transition-transform ${
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
            <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-20 max-h-60 overflow-y-auto">
              {Object.entries(languageConfig).map(([code, config]) => (
                <button
                  key={code}
                  onClick={() => handleLanguageChange(code)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors first:rounded-t-lg last:rounded-b-lg ${
                    language === code
                      ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                      : "text-gray-700 dark:text-gray-300"
                  }`}
                >
                  <span className="text-lg">{config.flag}</span>
                  <div className="flex-1">
                    <div className="font-medium">{config.name}</div>
                    {showNativeName && (
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {config.nativeName}
                      </div>
                    )}
                  </div>
                  {language === code && (
                    <Check className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  )}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default LanguageSelector;
