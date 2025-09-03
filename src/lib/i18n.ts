import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import resourcesToBackend from "i18next-resources-to-backend";

// Import translation files
import enTranslations from "../locales/en.json";
import esTranslations from "../locales/es.json";
import frTranslations from "../locales/fr.json";

export const defaultNS = "common";
export const fallbackLng = "en";
export const languages = ["en", "es", "fr"];

// Language configuration
export const languageConfig = {
  en: {
    name: "English",
    nativeName: "English",
    flag: "🇺🇸",
  },
  es: {
    name: "Spanish",
    nativeName: "Español",
    flag: "🇪🇸",
  },
  fr: {
    name: "French",
    nativeName: "Français",
    flag: "🇫🇷",
  },
};

// Initialize i18next
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .use(
    resourcesToBackend((language: string, namespace: string) => {
      // Dynamic import of translation files
      switch (language) {
        case "es":
          return import("../locales/es.json");
        case "fr":
          return import("../locales/fr.json");
        default:
          return import("../locales/en.json");
      }
    })
  )
  .init({
    debug: process.env.NODE_ENV === "development",
    fallbackLng,
    lng: fallbackLng,
    defaultNS,
    ns: ["common"],

    // Resources (fallback for when dynamic imports fail)
    resources: {
      en: {
        common: enTranslations,
      },
      es: {
        common: esTranslations,
      },
      fr: {
        common: frTranslations,
      },
    },

    interpolation: {
      escapeValue: false, // React already escapes values
    },

    detection: {
      order: ["localStorage", "navigator", "htmlTag"],
      caches: ["localStorage"],
      lookupLocalStorage: "fastpay-language",
    },

    react: {
      useSuspense: false,
    },
  });

export default i18n;
