"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { authService, AuthContextType } from "@/lib/auth";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        // Check if we're in guest mode first
        const isGuestMode = typeof window !== "undefined" && localStorage.getItem("isGuestMode") === "true";
        if (isGuestMode) {
           const guestAccount = JSON.parse(localStorage.getItem("guestAccount") || null);
          if (guestAccount) {
            setUser({ 
              id: guestAccount.id,
              email: `guest-${guestAccount.id}@example.com`,
              user_metadata: { name: guestAccount.name },
              aud: 'authenticated',
              created_at: new Date().toISOString(),
              app_metadata: { provider: 'guest' },
              identities: [],
              phone: '',
              role: '',
              updated_at: new Date().toISOString(),
            });
          }
          setLoading(false);
          return;
        }

        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        // Only log error if not in guest mode
        const isGuestMode =
          typeof window !== "undefined" &&
          localStorage.getItem("isGuestMode") === "true";
        if (!isGuestMode && error) {
          console.error("Error getting initial session:", error);
        }
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = authService.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, userData: any) => {
    setLoading(true);
    try {
      const result = await authService.signUp(email, password, userData);
      return result;
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string, provider?: string) => {
    setLoading(true);
    try {
      const result = await authService.signIn(email, password, provider);
      return result;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await authService.signOut();
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    return await authService.resetPassword(email);
  };

  const value: AuthContextType = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
