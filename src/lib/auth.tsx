"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface AuthContextType {
  isAuthenticated: boolean;
  loginStep: 1 | 2;
  login: (password: string) => boolean;
  verifyPin: (pin: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "bedcave2026";
const ADMIN_PIN = process.env.NEXT_PUBLIC_ADMIN_PIN || "123456";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginStep, setLoginStep] = useState<1 | 2>(1);

  useEffect(() => {
    // Check if already authenticated
    const auth = localStorage.getItem("bedcave_admin_auth");
    if (auth === "true") {
      setIsAuthenticated(true);
      setLoginStep(2);
    }
  }, []);

  const login = (password: string): boolean => {
    if (password === ADMIN_PASSWORD) {
      setLoginStep(2);
      return true;
    }
    return false;
  };

  const verifyPin = (pin: string): boolean => {
    if (pin === ADMIN_PIN) {
      setIsAuthenticated(true);
      localStorage.setItem("bedcave_admin_auth", "true");
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setLoginStep(1);
    localStorage.removeItem("bedcave_admin_auth");
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, loginStep, login, verifyPin, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be within an AuthProvider");
  }
  return context;
}
