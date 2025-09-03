"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Bell,
  Shield,
  Palette,
  Globe,
  Download,
  Trash2,
  Eye,
  EyeOff,
  Save,
  LogOut,
} from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { useAuth } from "@/components/auth/AuthProvider";
import { useAccount, useGuestAccount } from "@/hooks/useAccount";
import { useNotifications } from "@/hooks/useNotifications";
import { useOfflineStorage } from "@/hooks/useOfflineStorage";
import { useApp } from "@/contexts/AppContext";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";

interface UserSettings {
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
    currency: "USD" | "EUR" | "GBP" | "NGN" | "CAD" | "AUD";
    language: "en" | "es" | "fr";
    theme: "light" | "dark" | "system";
    lowBalanceThreshold: number;
  };
}

export default function SettingsPage() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("profile");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();
  // Use the new AppContext
  const {
    settings,
    updateSettings,
    updatePreference,
    formatAmount,
    convertAmount,
    currentCurrency,
    theme,
    setTheme,
    currentLanguage,
    setLanguage,
  } = useApp();

  // Use appropriate hook based on authentication status
  const isGuest =
    !user &&
    typeof window !== "undefined" &&
    localStorage.getItem("isGuestMode") === "true";
  const authenticatedAccount = useAccount();
  const guestAccount = useGuestAccount();

  const { account } = isGuest ? guestAccount : authenticatedAccount;
  const { clearAllNotifications, requestPermission, permission } =
    useNotifications();
  const { clearOfflineData, isOnline, syncInProgress } = useOfflineStorage();

  const [profileData, setProfileData] = useState({
    name: user?.user_metadata?.full_name || "Demo User",
    email: user?.email || "demo@fastpay.com",
    phone: "+1 (555) 123-4567",
    accountNumber: account?.account_number || "FP-DEMO-001",
  });

  const [passwordData, setPasswordData] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  useEffect(() => {
    // Redirect to auth if not authenticated and not in guest mode
    if (!user && !isGuest) {
      router.push("/auth/signin");
      return;
    }
  }, [user, isGuest, router]);

  const saveSettings = async () => {
    setLoading(true);
    try {
      // Settings are automatically saved via AppContext, but we can add additional logic here
      await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate API call
      toast.success("Settings saved successfully!");
    } catch (error) {
      toast.error("Failed to save settings");
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = (
    category: keyof typeof settings,
    key: string,
    value: any
  ) => {
    const newSettings = {
      ...settings,
      [category]: {
        ...settings[category],
        [key]: value,
      },
    };
    updateSettings(newSettings);
  };

  const handlePreferenceChange = (
    key: keyof typeof settings.preferences,
    value: any
  ) => {
    updatePreference(key, value);

    // Apply changes immediately
    if (key === "theme") {
      setTheme(value);
    } else if (key === "language") {
      setLanguage(value);
    }
  };

  const handleProfileUpdate = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.new !== passwordData.confirm) {
      toast.error("New passwords do not match");
      return;
    }

    if (passwordData.new.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("Password changed successfully!");
      setPasswordData({ current: "", new: "", confirm: "" });
      setShowPasswordModal(false);
    } catch (error) {
      toast.error("Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Clear all data
      clearAllNotifications();
      clearOfflineData();
      localStorage.clear();

      toast.success("Account deleted successfully");

      if (user) {
        await signOut();
      } else {
        localStorage.removeItem("isGuestMode");
        router.push("/");
      }
    } catch (error) {
      toast.error("Failed to delete account");
    } finally {
      setLoading(false);
      setShowDeleteModal(false);
    }
  };

  const exportData = () => {
    const data = {
      profile: profileData,
      settings,
      account: account,
      exportDate: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `fastpay-data-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast.success("Data exported successfully!");
  };

  const tabs = [
    { id: "profile", label: t("settings.tabs.profile"), icon: User },
    {
      id: "notifications",
      label: t("settings.tabs.notifications"),
      icon: Bell,
    },
    { id: "privacy", label: t("settings.tabs.privacySecurity"), icon: Shield },
    { id: "preferences", label: t("settings.tabs.preferences"), icon: Palette },
  ];

  const supportedCurrencies = [
    { code: "USD" },
    { code: "EUR" },
    { code: "GBP" },
    { code: "NGN" },
    { code: "CAD" },
    { code: "AUD" },
  ];

  return (
    <Layout user={user}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {t("settings.title")}
            </h1>
            <p className="text-gray-400 dark:text-gray-800 mt-2">
              {t("settings.description")}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      activeTab === tab.id
                        ? "bg-gray-100  text-gray-800 dark:text-gray-100 dark:bg-gray-800"
                        : "text-gray-300 dark:text-gray-500 dark:hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-400"
                    }`}
                  >
                    <tab.icon className="h-5 w-5" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>

            {/* Content */}
            <div className="lg:col-span-3">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                {/* Profile Tab */}
                {activeTab === "profile" && (
                  <div className="p-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                      {t("settings.profileInfo")}
                    </h2>

                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input
                          label={t("common.fullName")}
                          value={profileData.name}
                          onChange={(e) =>
                            setProfileData((prev) => ({
                              ...prev,
                              name: e.target.value,
                            }))
                          }
                        />
                        <Input
                          label={t("common.email")}
                          type="email"
                          value={profileData.email}
                          onChange={(e) =>
                            setProfileData((prev) => ({
                              ...prev,
                              email: e.target.value,
                            }))
                          }
                          disabled={isGuest}
                        />
                        <Input
                          label={t("common.phoneNumber")}
                          value={profileData.phone}
                          onChange={(e) =>
                            setProfileData((prev) => ({
                              ...prev,
                              phone: e.target.value,
                            }))
                          }
                        />
                        <Input
                          label={t("common.accountNumber")}
                          value={profileData.accountNumber}
                          disabled
                        />
                      </div>

                      <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
                        <div>
                          <Button
                            variant="outline"
                            onClick={() => setShowPasswordModal(true)}
                            disabled={isGuest}
                          >
                            {t("settings.changePassword")}
                          </Button>
                        </div>
                        <Button onClick={handleProfileUpdate} loading={loading}>
                          <Save className="h-4 w-4 mr-2" />
                          {t("common.saveChanges")}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Notifications Tab */}
                {activeTab === "notifications" && (
                  <div className="p-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                      {t("settings.notificationPrefs")}
                    </h2>

                    <div className="space-y-6">
                      {/* Browser Notifications */}
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium text-blue-900 dark:text-blue-100">
                              {t("settings.browserNotifications")}
                            </h3>
                            <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                              {t("settings.status")}:{" "}
                              {permission === "granted"
                                ? t("settings.enabled")
                                : permission === "denied"
                                ? t("settings.blocked")
                                : t("settings.notEnabled")}
                            </p>
                          </div>
                          {permission !== "granted" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={requestPermission}
                            >
                              {t("settings.enable")}
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Notification Types */}
                      <div className="space-y-4">
                        {Object.entries(settings.notifications).map(
                          ([key, value]) => (
                            <div
                              key={key}
                              className="flex items-center justify-between"
                            >
                              <div>
                                <label className="font-medium text-gray-900 dark:text-white capitalize">
                                  {t(`settings.${key}Notifications`)}
                                </label>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {key === "lowBalance" &&
                                    t("settings.lowBalanceDescription")}
                                  {key === "transactions" &&
                                    t("settings.transactionsDescription")}
                                  {key === "marketing" &&
                                    t("settings.marketingDescription")}
                                  {key === "email" &&
                                    t("settings.emailDescription")}
                                  {key === "push" &&
                                    t("settings.pushDescription")}
                                  {key === "sms" &&
                                    t("settings.smsDescription")}
                                </p>
                              </div>
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={value}
                                  onChange={(e) =>
                                    handleSettingChange(
                                      "notifications",
                                      key,
                                      e.target.checked
                                    )
                                  }
                                  className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                              </label>
                            </div>
                          )
                        )}
                      </div>

                      <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                        <Button onClick={saveSettings}>
                          <Save className="h-4 w-4 mr-2" />
                          {t("common.savePreferences")}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Privacy Tab */}
                {activeTab === "privacy" && (
                  <div className="p-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                      {t("settings.privacySecurity")}
                    </h2>

                    <div className="space-y-6">
                      {/* Privacy Settings */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <label className="font-medium text-gray-900 dark:text-white">
                              {t("settings.profileVisibility")}
                            </label>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {t("settings.profileVisibilityDescription")}
                            </p>
                          </div>
                          <select
                            value={settings.privacy.profileVisibility}
                            onChange={(e) =>
                              handleSettingChange(
                                "privacy",
                                "profileVisibility",
                                e.target.value
                              )
                            }
                            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                          >
                            <option value="public">{t("common.public")}</option>
                            <option value="private">
                              {t("common.private")}
                            </option>
                          </select>
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <label className="font-medium text-gray-900 dark:text-white">
                              {t("settings.transactionHistory")}
                            </label>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {t("settings.transactionHistoryDescription")}
                            </p>
                          </div>
                          <select
                            value={settings.privacy.transactionHistory}
                            onChange={(e) =>
                              handleSettingChange(
                                "privacy",
                                "transactionHistory",
                                e.target.value
                              )
                            }
                            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                          >
                            <option value="visible">
                              {t("common.visible")}
                            </option>
                            <option value="hidden">{t("common.hidden")}</option>
                          </select>
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <label className="font-medium text-gray-900 dark:text-white">
                              {t("settings.analyticsCollection")}
                            </label>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {t("settings.analyticsCollectionDescription")}
                            </p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={settings.privacy.analytics}
                              onChange={(e) =>
                                handleSettingChange(
                                  "privacy",
                                  "analytics",
                                  e.target.checked
                                )
                              }
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                          </label>
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <label className="font-medium text-gray-900 dark:text-white">
                              {t("settings.twoFactorAuth")}
                            </label>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {t("settings.twoFactorAuthDescription")}
                            </p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={settings.privacy.twoFactorAuth}
                              onChange={(e) =>
                                handleSettingChange(
                                  "privacy",
                                  "twoFactorAuth",
                                  e.target.checked
                                )
                              }
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                          </label>
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <label className="font-medium text-gray-900 dark:text-white">
                              {t("settings.biometricAuth")}
                            </label>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {t("settings.biometricAuthDescription")}
                            </p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={settings.privacy.biometricAuth}
                              onChange={(e) =>
                                handleSettingChange(
                                  "privacy",
                                  "biometricAuth",
                                  e.target.checked
                                )
                              }
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                      </div>

                      <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                        <Button onClick={saveSettings}>
                          <Save className="h-4 w-4 mr-2" />
                          {t("common.savePreferences")}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Preferences Tab */}
                {activeTab === "preferences" && (
                  <div className="p-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                      {t("settings.preferences")}
                    </h2>

                    <div className="space-y-6">
                      {/* Currency Preference */}
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="font-medium text-gray-900 dark:text-white">
                            {t("settings.currency")}
                          </label>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {t("settings.currencyDescription")}
                          </p>
                        </div>
                        <select
                          value={settings.preferences.currency}
                          onChange={(e) =>
                            handlePreferenceChange("currency", e.target.value)
                          }
                          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        >
                          {supportedCurrencies.map((c) => (
                            <option key={c.code} value={c.code}>
                              {c.code}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Language Preference */}
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="font-medium text-gray-900 dark:text-white">
                            {t("settings.language")}
                          </label>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {t("settings.languageDescription")}
                          </p>
                        </div>
                        <select
                          value={settings.preferences.language}
                          onChange={(e) =>
                            handlePreferenceChange("language", e.target.value)
                          }
                          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        >
                          <option value="en">English</option>
                          <option value="es">Español</option>
                          <option value="fr">Français</option>
                        </select>
                      </div>

                      {/* Theme Preference */}
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="font-medium text-gray-900 dark:text-white">
                            {t("settings.theme")}
                          </label>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {t("settings.themeDescription")}
                          </p>
                        </div>
                        <select
                          value={settings.preferences.theme}
                          onChange={(e) =>
                            handlePreferenceChange("theme", e.target.value)
                          }
                          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        >
                          <option value="light">Light</option>
                          <option value="dark">Dark</option>
                          <option value="system">System</option>
                        </select>
                      </div>

                      {/* Low Balance Threshold */}
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="font-medium text-gray-900 dark:text-white">
                            {t("settings.lowBalanceThreshold")}
                          </label>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {t("settings.lowBalanceThresholdDescription")}
                          </p>
                        </div>
                        <Input
                          type="number"
                          value={settings.preferences.lowBalanceThreshold}
                          onChange={(e) =>
                            handlePreferenceChange(
                              "lowBalanceThreshold",
                              Number(e.target.value)
                            )
                          }
                          className="w-24"
                        />
                      </div>

                      <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                        <Button onClick={saveSettings}>
                          <Save className="h-4 w-4 mr-2" />
                          {t("common.savePreferences")}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Data & Export Tab */}
                {activeTab === "data" && (
                  <div className="p-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                      {t("settings.dataExport")}
                    </h2>

                    <div className="space-y-6">
                      {/* Export Data */}
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="font-medium text-gray-900 dark:text-white">
                            {t("settings.exportUserData")}
                          </label>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {t("settings.exportUserDataDescription")}
                          </p>
                        </div>
                        <Button onClick={exportData}>
                          <Download className="h-4 w-4 mr-2" />
                          {t("common.export")}
                        </Button>
                      </div>

                      {/* Clear Offline Data */}
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="font-medium text-gray-900 dark:text-white">
                            {t("settings.clearOfflineData")}
                          </label>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {t("settings.clearOfflineDataDescription")}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          onClick={clearOfflineData}
                          disabled={!isOnline || syncInProgress}
                        >
                          {t("common.clear")}
                        </Button>
                      </div>

                      {/* Delete Account */}
                      <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 pt-6 mt-6">
                        <div>
                          <label className="font-medium text-red-600 dark:text-red-400">
                            {t("settings.deleteAccount")}
                          </label>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {t("settings.deleteAccountDescription")}
                          </p>
                        </div>
                        <Button
                          variant="destructive"
                          onClick={() => setShowDeleteModal(true)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          {t("common.delete")}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      <Modal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        title={t("settings.changePassword")}
      >
        <div className="space-y-4">
          <Input
            label={t("settings.currentPassword")}
            type={showPasswords.current ? "text" : "password"}
            value={passwordData.current}
            onChange={(e) =>
              setPasswordData((prev) => ({
                ...prev,
                current: e.target.value,
              }))
            }
            icon={
              showPasswords.current ? (
                <EyeOff
                  className="h-5 w-5 text-gray-400 cursor-pointer"
                  onClick={() =>
                    setShowPasswords((prev) => ({ ...prev, current: false }))
                  }
                />
              ) : (
                <Eye
                  className="h-5 w-5 text-gray-400 cursor-pointer"
                  onClick={() =>
                    setShowPasswords((prev) => ({ ...prev, current: true }))
                  }
                />
              )
            }
          />
          <Input
            label={t("settings.newPassword")}
            type={showPasswords.new ? "text" : "password"}
            value={passwordData.new}
            onChange={(e) =>
              setPasswordData((prev) => ({ ...prev, new: e.target.value }))
            }
            icon={
              showPasswords.new ? (
                <EyeOff
                  className="h-5 w-5 text-gray-400 cursor-pointer"
                  onClick={() =>
                    setShowPasswords((prev) => ({ ...prev, new: false }))
                  }
                />
              ) : (
                <Eye
                  className="h-5 w-5 text-gray-400 cursor-pointer"
                  onClick={() =>
                    setShowPasswords((prev) => ({ ...prev, new: true }))
                  }
                />
              )
            }
          />
          <Input
            label={t("settings.confirmNewPassword")}
            type={showPasswords.confirm ? "text" : "password"}
            value={passwordData.confirm}
            onChange={(e) =>
              setPasswordData((prev) => ({ ...prev, confirm: e.target.value }))
            }
            icon={
              showPasswords.confirm ? (
                <EyeOff
                  className="h-5 w-5 text-gray-400 cursor-pointer"
                  onClick={() =>
                    setShowPasswords((prev) => ({ ...prev, confirm: false }))
                  }
                />
              ) : (
                <Eye
                  className="h-5 w-5 text-gray-400 cursor-pointer"
                  onClick={() =>
                    setShowPasswords((prev) => ({ ...prev, confirm: true }))
                  }
                />
              )
            }
          />
        </div>
        <div className="mt-6 flex justify-end space-x-3">
          <Button variant="outline" onClick={() => setShowPasswordModal(false)}>
            {t("common.cancel")}
          </Button>
          <Button onClick={handlePasswordChange} loading={loading}>
            {t("common.change")}
          </Button>
        </div>
      </Modal>

      {/* Delete Account Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title={t("settings.confirmDeleteAccount")}
      >
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          {t("settings.deleteAccountWarning")}
        </p>
        <div className="mt-6 flex justify-end space-x-3">
          <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
            {t("common.cancel")}
          </Button>
          <Button variant="destructive" onClick={handleDeleteAccount}>
            {t("common.delete")}
          </Button>
        </div>
      </Modal>
    </Layout>
  );
}
