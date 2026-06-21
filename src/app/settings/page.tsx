"use client";

import React from "react";
import { useAuth } from "@/context/AuthContext";
import Sidebar from "@/components/Sidebar";

export default function SettingsPage() {
  const { user, org } = useAuth();

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-cc-navy tracking-tight">Settings</h1>
            <p className="text-sm text-cc-text-muted mt-0.5">
              System configuration and account management
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Profile Card */}
            <div className="glass-card">
              <h2 className="text-base font-semibold text-cc-text mb-4">Account</h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] font-medium text-cc-text-muted uppercase tracking-wider mb-1">
                    Email
                  </label>
                  <p className="text-sm text-cc-text font-mono">
                    {user?.email || "—"}
                  </p>
                </div>
                <div>
                  <label className="block text-[10px] font-medium text-cc-text-muted uppercase tracking-wider mb-1">
                    Role
                  </label>
                  <p className="text-sm text-cc-text capitalize">
                    {user?.role || "—"}
                  </p>
                </div>
                <div>
                  <label className="block text-[10px] font-medium text-cc-text-muted uppercase tracking-wider mb-1">
                    User ID
                  </label>
                  <p className="text-xs text-cc-text-muted font-mono">
                    {user?.id || "—"}
                  </p>
                </div>
              </div>
            </div>

            {/* Organization Card */}
            <div className="glass-card">
              <h2 className="text-base font-semibold text-cc-text mb-4">Organization</h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] font-medium text-cc-text-muted uppercase tracking-wider mb-1">
                    Name
                  </label>
                  <p className="text-sm text-cc-text">
                    {org?.name || "—"}
                  </p>
                </div>
                <div>
                  <label className="block text-[10px] font-medium text-cc-text-muted uppercase tracking-wider mb-1">
                    Org ID
                  </label>
                  <p className="text-xs text-cc-text-muted font-mono">
                    {org?.id || "—"}
                  </p>
                </div>
              </div>
            </div>

            {/* API Connection Card */}
            <div className="glass-card">
              <h2 className="text-base font-semibold text-cc-text mb-4">API Connection</h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] font-medium text-cc-text-muted uppercase tracking-wider mb-1">
                    API
                  </label>
                  <code className="text-xs text-cc-cyan bg-cc-cyan/5 px-2 py-1 rounded block">
                    /api (same-origin Next.js routes)
                  </code>
                </div>
                <div>
                  <label className="block text-[10px] font-medium text-cc-text-muted uppercase tracking-wider mb-1">
                    WebSocket
                  </label>
                  <code className="text-xs text-cc-cyan bg-cc-cyan/5 px-2 py-1 rounded block">
                    Same origin (custom server)
                  </code>
                </div>
                <div>
                  <label className="block text-[10px] font-medium text-cc-text-muted uppercase tracking-wider mb-1">
                    Database
                  </label>
                  <code className="text-xs text-cc-cyan bg-cc-cyan/5 px-2 py-1 rounded block">
                    PostgreSQL via Prisma ORM
                  </code>
                </div>
              </div>
            </div>

            {/* System Info Card */}
            <div className="glass-card">
              <h2 className="text-base font-semibold text-cc-text mb-4">System</h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] font-medium text-cc-text-muted uppercase tracking-wider mb-1">
                    Version
                  </label>
                  <p className="text-sm text-cc-text">v0.1.0</p>
                </div>
                <div>
                  <label className="block text-[10px] font-medium text-cc-text-muted uppercase tracking-wider mb-1">
                    Framework
                  </label>
                  <p className="text-sm text-cc-text-dim">
                    Next.js 15 · React 19 · Tailwind CSS
                  </p>
                </div>
                <div>
                  <label className="block text-[10px] font-medium text-cc-text-muted uppercase tracking-wider mb-1">
                    Transport
                  </label>
                  <p className="text-sm text-cc-text-dim">
                    Socket.IO WebSocket
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="glass-card !border-cc-red/20">
            <h2 className="text-base font-semibold text-cc-red mb-2">Danger Zone</h2>
            <p className="text-xs text-cc-text-muted mb-4">
              Destructive actions that cannot be undone
            </p>
            <div className="flex flex-wrap gap-3">
              <button className="btn-danger text-sm !py-2">
                Reset All Headsets
              </button>
              <button className="btn-ghost text-sm !py-2 !border-cc-red/20 hover:!bg-cc-red/10 hover:!text-cc-red">
                Clear All Logs
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
