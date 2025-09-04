"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, AlertCircle, Globe } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { generateAccountNumber } from "@/lib/utils";
import { toast } from "react-hot-toast";

const currencies = [
  { code: "USD", name: "US Dollar", symbol: "$" },
  { code: "NGN", name: "Nigerian Naira", symbol: "₦" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "GBP", name: "British Pound", symbol: "£" },
  { code: "CAD", name: "Canadian Dollar", symbol: "C$" },
  { code: "AUD", name: "Australian Dollar", symbol: "A$" },
];

export default function GuestPage() {
  const [guestName, setGuestName] = useState("");
  const [selectedCurrency, setSelectedCurrency] = useState("USD");
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleGuestLogin = async () => {
    if (!guestName.trim()) {
      toast.error("Please enter your name to continue as guest");
      return;
    }

    if (!pin || pin.length !== 4) {
      toast.error("Please enter a 4-digit PIN");
      return;
    }

    if (pin !== confirmPin) {
      toast.error("PINs do not match");
      return;
    }

    if (!/^\d{4}$/.test(pin)) {
      toast.error("PIN must be exactly 4 digits");
      return;
    }

    setLoading(true);

    // Simulate guest account creation
    const guestAccount = {
      id: "guest-" + Date.now(),
      name: guestName.trim(),
      accountNumber: generateAccountNumber(),
      balance:
        selectedCurrency === "NGN"
          ? 250000
          : selectedCurrency === "EUR"
          ? 850
          : selectedCurrency === "GBP"
          ? 750
          : selectedCurrency === "CAD"
          ? 1300
          : selectedCurrency === "AUD"
          ? 1450
          : 1000, // Starting balance for demo
      currency: selectedCurrency,
      pin: pin, // Store the PIN for transaction validation
      isGuest: true,
      createdAt: new Date().toISOString(),
    };

    // Store guest data in localStorage
    localStorage.setItem("guestAccount", JSON.stringify(guestAccount));
    localStorage.setItem("isGuestMode", "true");
    localStorage.setItem("selectedCurrency", selectedCurrency);
    localStorage.setItem(
      "fastpay-user-data",
      JSON.stringify({
        isGuest: true,
        guestName: guestName.trim(),
        guestCurrency: selectedCurrency,
      })
    );
    
    // Store settings with selected currency
    const guestSettings = {
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
        currency: selectedCurrency,
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
    localStorage.setItem("fastpay-settings", JSON.stringify(guestSettings));

    const currencySymbol =
      currencies.find((c) => c.code === selectedCurrency)?.symbol || "$";
    toast.success(
      `Welcome ${guestName.trim()}! Exploring in guest mode with ${currencySymbol} currency.`
    );

    router.push("/dashboard");
  };

  return (
    <div className="min-h-scree flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="h-6 w-6 text-blue-600" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:!text-gray-900">
            Continue as Guest
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Explore Fastpay with limited features
          </p>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-yellow-400 mt-0.5" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Guest Mode Limitations
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <ul className="list-disc list-inside space-y-1">
                  <li>No data persistence across sessions</li>
                  <li>Limited transfer capabilities</li>
                  <li>No real banking features</li>
                  <li>Demo data only</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <form
          className="mt-8 space-y-6"
          onSubmit={(e) => {
            e.preventDefault();
            handleGuestLogin();
          }}
        >
          <Input
            label="Your Name"
            name="guestName"
            type="text"
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            icon={<User className="h-5 w-5 text-gray-400" />}
            placeholder="Enter your name for the demo"
            required
          />

          <div>
            <label
              htmlFor="currency"
              className="block text-sm font-medium text-gray-700 dark:text-gray-900 mb-2"
            >
              Preferred Currency
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Globe className="h-5 w-5 text-gray-400" />
              </div>
              <select
                id="currency"
                value={selectedCurrency}
                onChange={(e) => setSelectedCurrency(e.target.value)}
                className="block w-full !pl-16 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-700 !text-gray-900 dark:!text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                {currencies.map((currency) => (
                  <option key={currency.code} value={currency.code}>
                    {currency.symbol} {currency.name} ({currency.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <Input
            label="Create 4-Digit PIN"
            name="pin"
            type="password"
            value={pin}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '').slice(0, 4);
              setPin(value);
            }}
            placeholder="Enter 4-digit PIN for transactions"
            maxLength={4}
            required
          />

          <Input
            label="Confirm PIN"
            name="confirmPin"
            type="password"
            value={confirmPin}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '').slice(0, 4);
              setConfirmPin(value);
            }}
            placeholder="Confirm your 4-digit PIN"
            maxLength={4}
            required
          />

          <div className="space-y-4">
            <Button type="submit" className="w-full" loading={loading}>
              Continue as Guest
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400">
                  Or
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Link href="/auth/signin">
                <Button variant="outline" className="w-full">
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button variant="outline" className="w-full">
                  Sign Up
                </Button>
              </Link>
            </div>
          </div>
        </form>

        <div className="text-center">
          <p className="text-xs text-gray-500">
            By continuing as a guest, you agree to our{" "}
            <Link href="/terms" className="text-blue-600 hover:text-blue-500">
              Terms of Service
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
