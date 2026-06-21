"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Icon, { IconName } from "@/components/Icon";

interface NavItem {
  label: string;
  href: string;
  icon: IconName;
  roles?: string[]; // if set, only these roles see the item
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: "dashboard" },
  { label: "Institutions", href: "/institutions", icon: "institution", roles: ["superadmin"] },
  { label: "Sessions", href: "/sessions", icon: "sessions" },
  { label: "Scenes", href: "/scenes", icon: "scenes" },
  { label: "Audit Log", href: "/audit", icon: "audit" },
  { label: "Settings", href: "/settings", icon: "settings" },
];

const roleLabel: Record<string, string> = {
  superadmin: "Super Admin",
  admin: "Admin",
  viewer: "Viewer",
};

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, org, logout, isAuthenticated, isLoading } = useAuth();
  const [open, setOpen] = useState(false);

  // Auth guard: bounce logged-out visitors to the login page
  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.replace("/");
  }, [isLoading, isAuthenticated, router]);

  // Don't render the console chrome for unauthenticated users (prevents the
  // empty-shell flash before the redirect lands).
  if (!isAuthenticated) return null;

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setOpen(!open)}
        className="lg:hidden fixed top-4 left-4 z-50 icon-btn"
        aria-label="Toggle sidebar"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d={open ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
        </svg>
      </button>

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex flex-col transition-transform duration-300 ease-in-out
          ${open ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 lg:static lg:w-[260px]
          w-[260px] bg-white border-r border-cc-border p-4`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-2 py-3 mb-2">
          <div className="w-10 h-10 rounded-2xl bg-cc-navy flex items-center justify-center text-base font-bold text-white">
            VR
          </div>
          <div>
            <h1 className="text-sm font-bold text-cc-navy leading-tight">VR Command</h1>
            <p className="text-[11px] text-cc-text-muted">Control Center</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1 overflow-y-auto">
          {navItems
            .filter((item) => !item.roles || (user?.role && item.roles.includes(user.role)))
            .map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-3 rounded-2xl text-sm font-medium transition-all duration-200
                  ${
                    isActive
                      ? "bg-cc-navy text-white shadow-sm"
                      : "text-cc-text-dim hover:text-cc-text hover:bg-cc-surface-light"
                  }`}
              >
                <Icon name={item.icon} size={19} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User */}
        <div className="mt-2 pt-4 border-t border-cc-border">
          <div className="flex items-center gap-3 px-1">
            <div className="w-9 h-9 rounded-full bg-cc-navy flex items-center justify-center text-sm font-semibold text-white uppercase">
              {user?.email?.[0] || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-cc-text truncate">{user?.email || "admin@console"}</p>
              <div className="flex items-center gap-1.5">
                {user?.role && (
                  <span
                    className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${
                      user.role === "superadmin"
                        ? "bg-cc-purple/10 text-cc-purple"
                        : user.role === "admin"
                        ? "bg-cc-cyan/10 text-cc-cyan"
                        : "bg-cc-text-muted/15 text-cc-text-muted"
                    }`}
                  >
                    {roleLabel[user.role] || user.role}
                  </span>
                )}
                <p className="text-[11px] text-cc-text-muted truncate">{org?.name || "Org"}</p>
              </div>
            </div>
            <button onClick={logout} className="icon-btn !w-9 !h-9" title="Sign out">
              <Icon name="logout" size={16} />
            </button>
          </div>
        </div>
      </aside>

      {open && (
        <div className="lg:hidden fixed inset-0 z-30 bg-black/30" onClick={() => setOpen(false)} />
      )}
    </>
  );
}
