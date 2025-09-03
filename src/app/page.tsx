"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Shield,
  Zap,
  Smartphone,
  CreditCard,
  TrendingUp,
  Users,
  Globe,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function HomePage() {
  const features = [
    {
      icon: Shield,
      title: "Secure Banking",
      description:
        "Bank-grade security with end-to-end encryption and multi-factor authentication.",
    },
    {
      icon: Zap,
      title: "Instant Transfers",
      description:
        "Send money instantly to any account with zero fees and real-time notifications.",
    },
    {
      icon: Smartphone,
      title: "Mobile First",
      description:
        "Optimized for mobile with offline support and progressive web app capabilities.",
    },
    {
      icon: CreditCard,
      title: "Bill Payments",
      description:
        "Pay all your bills in one place with automatic cashback rewards.",
    },
    {
      icon: TrendingUp,
      title: "Analytics",
      description:
        "Track your spending with detailed analytics and financial insights.",
    },
    {
      icon: Users,
      title: "Multi-User",
      description:
        "Support for multiple accounts with role-based access control.",
    },
  ];

  const stats = [
    { number: "10K+", label: "Active Users" },
    { number: "$2M+", label: "Transactions" },
    { number: "99.9%", label: "Uptime" },
    { number: "24/7", label: "Support" },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <Image
                src="/fastpay-logo.png"
                alt="Fastpay"
                width={32}
                height={32}
                className="h-8 w-8"
              />
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                Fastpay
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/auth/signin">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/auth/signup">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              Modern Banking
              <span className="block text-blue-600">Simplified</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-3xl mx-auto">
              Experience the future of banking with Fastpay. Secure, fast, and
              intuitive financial management with real-time analytics and
              seamless transactions.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Link href="/auth/signup">
                <Button size="lg" className="w-full sm:w-auto">
                  Start Banking Today
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/auth/guest">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto border-2 border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400"
                >
                  Try Demo Mode
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Background decoration */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full opacity-20 blur-3xl"></div>
          <div className="absolute right-0 bottom-0 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-gradient-to-br from-green-400 to-blue-600 rounded-full opacity-20 blur-3xl"></div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 dark:text-gray-400">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Everything you need for modern banking
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              From instant transfers to detailed analytics, Fastpay provides all
              the tools you need to manage your finances effectively.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="p-6 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
              >
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg w-fit mb-4">
                  <feature.icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="py-24 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                Your security is our priority
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
                We use industry-leading security measures to protect your data
                and transactions. Your financial information is encrypted and
                secured with multiple layers of protection.
              </p>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Lock className="h-5 w-5 text-green-600" />
                  <span className="text-gray-700 dark:text-gray-300">
                    End-to-end encryption
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <Shield className="h-5 w-5 text-green-600" />
                  <span className="text-gray-700 dark:text-gray-300">
                    Multi-factor authentication
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <Globe className="h-5 w-5 text-green-600" />
                  <span className="text-gray-700 dark:text-gray-300">
                    SOC 2 Type II compliant
                  </span>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-8 text-white">
                <div className="text-center">
                  <Shield className="h-16 w-16 mx-auto mb-4 opacity-80" />
                  <h3 className="text-2xl font-bold mb-2">
                    Bank-Grade Security
                  </h3>
                  <p className="opacity-90">
                    Your data is protected with the same security standards used
                    by major financial institutions.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
            Ready to get started?
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
            Join thousands of users who trust Fastpay for their banking needs.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link href="/auth/signup">
              <Button size="lg" className="w-full sm:w-auto">
                Create Free Account
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/auth/guest">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Try Demo First
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-700 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Image
                src="/fastpay-logo.png"
                alt="Fastpay"
                width={24}
                height={24}
                className="h-6 w-6"
              />
              <span className="font-semibold text-gray-900 dark:text-white">
                Fastpay
              </span>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-center md:text-right">
              © 2025 Fastpay. All rights reserved. This is a demo banking
              application.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
