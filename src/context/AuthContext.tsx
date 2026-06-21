"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { User, Org, AuthState, LoginCredentials } from "@/types";
import api from "@/lib/api";

interface AuthContextType extends AuthState {
  login: (creds: LoginCredentials) => Promise<string | null>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    org: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // Restore from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem("cc_token");
    const userStr = localStorage.getItem("cc_user");
    const orgStr = localStorage.getItem("cc_org");

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr) as User;
        const org = orgStr ? (JSON.parse(orgStr) as Org) : null;
        setState({
          user,
          token,
          org,
          isAuthenticated: true,
          isLoading: false,
        });
      } catch {
        localStorage.removeItem("cc_token");
        localStorage.removeItem("cc_user");
        localStorage.removeItem("cc_org");
        setState((s) => ({ ...s, isLoading: false }));
      }
    } else {
      setState((s) => ({ ...s, isLoading: false }));
    }
  }, []);

  const login = useCallback(async (creds: LoginCredentials): Promise<string | null> => {
    const res = await api.post<{
      token: string;
      user: User;
      org: Org;
    }>("/auth/login", creds);

    if (res.error) return res.error;
    if (!res.data) return "Invalid response from server";

    const { token, user, org } = res.data;

    localStorage.setItem("cc_token", token);
    localStorage.setItem("cc_user", JSON.stringify(user));
    localStorage.setItem("cc_org", JSON.stringify(org));

    setState({
      user,
      token,
      org,
      isAuthenticated: true,
      isLoading: false,
    });

    return null;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("cc_token");
    localStorage.removeItem("cc_user");
    localStorage.removeItem("cc_org");
    setState({
      user: null,
      token: null,
      org: null,
      isAuthenticated: false,
      isLoading: false,
    });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
