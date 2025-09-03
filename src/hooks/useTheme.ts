import { useState, useEffect } from 'react'

type Theme = 'light' | 'dark' | 'system'

export function useTheme() {
  const [theme, setTheme] = useState<Theme>('system')
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    // Load theme preference from localStorage
    const savedTheme = localStorage.getItem("fastpay-theme");
    if (savedTheme && (savedTheme === "light" || savedTheme === "dark" || savedTheme === "system")) {
      setTheme(savedTheme);
    } else {
      // If no theme saved, check system preference
      const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setTheme(systemPrefersDark ? "dark" : "light");
    }
  }, [])

  useEffect(() => {
    const applyTheme = () => {
      const root = document.documentElement
      
      if (theme === 'system') {
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        setIsDark(systemPrefersDark)
        if (systemPrefersDark) {
          root.classList.add('dark')
        } else {
          root.classList.remove('dark')
        }
      } else if (theme === 'dark') {
        setIsDark(true)
        root.classList.add('dark')
      } else {
        setIsDark(false)
        root.classList.remove('dark')
      }
    }

    applyTheme()

    // Listen for system theme changes when using system theme
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      const handleChange = () => applyTheme()
      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    }
  }, [theme])

  const setThemePreference = (newTheme: Theme) => {
    setTheme(newTheme)
    
    // Save theme preference to localStorage
    localStorage.setItem('fastpay-theme', newTheme);

    // Update localStorage settings
    const savedSettings = localStorage.getItem('fastpay-settings');
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        settings.preferences = settings.preferences || {};
        settings.preferences.theme = newTheme;
        localStorage.setItem('fastpay-settings', JSON.stringify(settings));
      } catch (error) {
        console.error('Failed to save theme preference:', error);
      }
    } else {
      // Create new settings if none exist
      const newSettings = {
        preferences: {
          theme: newTheme,
          currency: 'USD',
          language: 'en',
          lowBalanceThreshold: 100
        }
      };
      localStorage.setItem('fastpay-settings', JSON.stringify(newSettings));
    }
  }

  const toggleTheme = () => {
    const newTheme = isDark ? 'light' : 'dark'
    setThemePreference(newTheme)
  }

  return {
    theme,
    isDark,
    setTheme: setThemePreference,
    toggleTheme
  }
}

