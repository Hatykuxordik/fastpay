import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { AppProvider } from "@/contexts/AppContext";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { I18nProvider } from "@/providers/I18nProvider";
import { Toaster } from "react-hot-toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FastPay - Modern Banking Simulator",
  description:
    "An enhanced interactive web app for simulating banking operations with secure authentication, real-time updates, analytics, multi-language support, and modern features in a user-friendly interface with dark/light mode support.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground transition-colors duration-300`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange={false}
        >
          <I18nProvider>
            <AppProvider>
              <AuthProvider>
                {children}
                <Toaster
                  position="top-right"
                  toastOptions={{
                    duration: 4000,
                    className: "dark:bg-gray-800 dark:text-white",
                    style: {
                      background: "var(--color-card)",
                      color: "var(--color-card-foreground)",
                      border: "1px solid var(--color-border)",
                    },
                    success: {
                      duration: 3000,
                      style: {
                        background: "var(--color-success)",
                        color: "#ffffff",
                      },
                    },
                    error: {
                      duration: 5000,
                      style: {
                        background: "var(--color-error)",
                        color: "#ffffff",
                      },
                    },
                  }}
                />
              </AuthProvider>
            </AppProvider>
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
