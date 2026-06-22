"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { User, Org, AuthState, LoginCredentials } from "@/types";
import api from "@/lib/api";

interface AuthContextType extends AuthState {
  login: (creds: LoginCredentials) => Promise<string | null>;
  logout: () => void;
  viewingAs: string | null;
  enterViewAs: (token: string, org: Org) => void;
  exitViewAs: () => void;
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
  const [viewingAs, setViewingAs] = useState<string | null>(null);

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
        setViewingAs(localStorage.getItem("cc_viewing_as"));
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
    ["cc_token", "cc_user", "cc_org", "cc_super_token", "cc_super_user", "cc_super_org", "cc_viewing_as"].forEach(
      (k) => localStorage.removeItem(k)
    );
    setViewingAs(null);
    setState({
      user: null,
      token: null,
      org: null,
      isAuthenticated: false,
      isLoading: false,
    });
  }, []);

  // Super Admin enters an institution's context (impersonation)
  const enterViewAs = useCallback((token: string, org: Org) => {
    setState((s) => {
      if (!s.user) return s;
      // Stash the super-admin session once, so we can restore it on exit
      if (!localStorage.getItem("cc_super_token")) {
        localStorage.setItem("cc_super_token", s.token || "");
        localStorage.setItem("cc_super_user", JSON.stringify(s.user));
        localStorage.setItem("cc_super_org", JSON.stringify(s.org));
      }
      const impUser: User = { ...s.user, orgId: org.id, role: "admin" };
      localStorage.setItem("cc_token", token);
      localStorage.setItem("cc_user", JSON.stringify(impUser));
      localStorage.setItem("cc_org", JSON.stringify(org));
      localStorage.setItem("cc_viewing_as", org.name);
      return { ...s, token, user: impUser, org, isAuthenticated: true };
    });
    setViewingAs(org.name);
  }, []);

  const exitViewAs = useCallback(() => {
    const superToken = localStorage.getItem("cc_super_token");
    const superUser = localStorage.getItem("cc_super_user");
    const superOrg = localStorage.getItem("cc_super_org");
    if (!superToken || !superUser) return;
    const user = JSON.parse(superUser) as User;
    const org = superOrg ? (JSON.parse(superOrg) as Org) : null;
    localStorage.setItem("cc_token", superToken);
    localStorage.setItem("cc_user", superUser);
    if (superOrg) localStorage.setItem("cc_org", superOrg);
    ["cc_super_token", "cc_super_user", "cc_super_org", "cc_viewing_as"].forEach((k) => localStorage.removeItem(k));
    setState((s) => ({ ...s, token: superToken, user, org, isAuthenticated: true }));
    setViewingAs(null);
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, logout, viewingAs, enterViewAs, exitViewAs }}>
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
