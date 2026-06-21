"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useSocket } from "@/hooks/useSocket";
import { Headset, Scene, VRUser, AuditLog } from "@/types";
import api from "@/lib/api";
import Icon, { IconName } from "@/components/Icon";

const auditStyle: Record<string, string> = {
  session_start: "bg-cc-green/10 text-cc-green",
  session_end: "bg-cc-text-muted/15 text-cc-text-dim",
  scene_play: "bg-cc-cyan/10 text-cc-cyan",
};
const auditLabel: Record<string, string> = {
  session_start: "Joined",
  session_end: "Left",
  scene_play: "Scene",
};

function StatCard({
  icon,
  label,
  value,
  accent = "cyan",
}: {
  icon: IconName;
  label: string;
  value: string | number;
  accent?: "cyan" | "green" | "amber" | "purple";
}) {
  const tint = {
    cyan: "bg-cc-cyan/10 text-cc-cyan",
    green: "bg-cc-green/10 text-cc-green",
    amber: "bg-cc-amber/10 text-cc-amber",
    purple: "bg-cc-purple/10 text-cc-purple",
  };
  return (
    <div className="glass-card">
      <div className="flex items-center gap-4">
        <div className={`inline-flex items-center justify-center w-11 h-11 rounded-2xl ${tint[accent]}`}>
          <Icon name={icon} size={20} />
        </div>
        <div>
          <p className="text-xs font-medium text-cc-text-muted mb-0.5">{label}</p>
          <p className="text-2xl font-bold text-cc-text tabular-nums">{value}</p>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user, org } = useAuth();
  const { isConnected, vrUserStatuses, lastEvent } = useSocket();

  const [headsets, setHeadsets] = useState<Headset[]>([]);
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [users, setUsers] = useState<VRUser[]>([]);
  const [audit, setAudit] = useState<AuditLog[]>([]);

  const fetchData = useCallback(async () => {
    const [h, s, u, a] = await Promise.all([
      api.get<Headset[]>("/headsets"),
      api.get<Scene[]>("/scenes"),
      api.get<VRUser[]>("/vr-users"),
      api.get<AuditLog[]>("/audit"),
    ]);
    if (h.data) setHeadsets(h.data);
    if (s.data) setScenes(s.data);
    if (u.data) setUsers(u.data);
    if (a.data) setAudit(a.data);
  }, []);

  useEffect(() => {
    fetchData();
    const t = setInterval(fetchData, 10000);
    return () => clearInterval(t);
  }, [fetchData]);

  const liveSessions = useMemo(() => Array.from(vrUserStatuses.values()), [vrUserStatuses]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-cc-navy tracking-tight">
            Welcome{user?.email ? `, ${user.email.split("@")[0]}` : ""}
          </h1>
          <p className="text-sm text-cc-text-muted mt-0.5">
            {org?.name || "Organization"} · classroom overview
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${
              isConnected
                ? "bg-cc-green/10 text-cc-green border border-cc-green/20"
                : "bg-cc-red/10 text-cc-red border border-cc-red/20"
            }`}
          >
            <div className={`w-2 h-2 rounded-full ${isConnected ? "bg-cc-green animate-status-pulse" : "bg-cc-red"}`} />
            {isConnected ? "Connected" : "Disconnected"}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon="sessions" label="Live in VR" value={liveSessions.length} accent="green" />
        <StatCard icon="headset" label="Headsets" value={headsets.length} accent="cyan" />
        <StatCard icon="scenes" label="Scenes" value={scenes.length} accent="amber" />
        <StatCard icon="users" label="Allowed Users" value={users.length} accent="purple" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Live sessions */}
        <div className="xl:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-cc-text">Live in VR</h2>
            <Link href="/sessions" className="text-xs text-cc-cyan hover:underline">
              View all sessions
            </Link>
          </div>
          {liveSessions.length === 0 ? (
            <div className="glass-card text-center py-12">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-cc-surface-light text-cc-text-muted mb-3">
                <Icon name="headset" size={22} />
              </div>
              <p className="text-cc-text-dim text-sm">No students in VR yet</p>
              <p className="text-cc-text-muted text-xs mt-1">They appear here the moment they log in on a headset</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {liveSessions.map((s) => (
                <div key={s.vrUserId} className="glass-card flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cc-navy flex items-center justify-center text-white font-semibold uppercase">
                    {s.username?.[0] || "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-cc-text truncate">{s.username}</p>
                    <p className="text-[11px] text-cc-text-muted">in session</p>
                  </div>
                  <span className="badge-online">live</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick scenes */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-cc-text">Scenes</h2>
            <Link href="/scenes" className="text-xs text-cc-cyan hover:underline">
              Manage &amp; play
            </Link>
          </div>
          <div className="glass-card !p-3 space-y-1">
            {scenes.length === 0 ? (
              <p className="text-center text-sm text-cc-text-muted py-6">No scenes yet</p>
            ) : (
              scenes.slice(0, 6).map((s) => (
                <Link
                  key={s.id}
                  href="/scenes"
                  className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-cc-surface-light transition-colors"
                >
                  <span className="text-sm text-cc-text truncate">{s.name}</span>
                  <code className="text-[10px] font-mono text-cc-cyan">{s.sceneKey}</code>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Activity + at a glance */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-cc-text">Recent Activity</h2>
            <Link href="/audit" className="text-xs text-cc-cyan hover:underline">View audit log</Link>
          </div>
          <div className="glass-card !p-2">
            {audit.length === 0 ? (
              <p className="text-center text-sm text-cc-text-muted py-8">No activity yet</p>
            ) : (
              <div className="divide-y divide-cc-border">
                {audit.slice(0, 6).map((log) => (
                  <div key={log.id} className="flex items-center gap-3 px-3 py-3">
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full whitespace-nowrap ${auditStyle[log.type] || "bg-cc-text-muted/15 text-cc-text-dim"}`}>
                      {auditLabel[log.type] || log.type}
                    </span>
                    <p className="flex-1 text-sm text-cc-text truncate min-w-0">{log.message}</p>
                    <span className="text-[11px] text-cc-text-muted whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* At a glance */}
        <div>
          <h2 className="text-lg font-semibold text-cc-text mb-4">At a glance</h2>
          <div className="glass-card space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-cc-text-dim">Server link</span>
              <span className={`text-sm font-medium ${isConnected ? "text-cc-green" : "text-cc-red"}`}>
                {isConnected ? "Connected" : "Offline"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-cc-text-dim">In VR now</span>
              <span className="text-sm font-medium text-cc-text">{liveSessions.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-cc-text-dim">Scenes available</span>
              <span className="text-sm font-medium text-cc-text">{scenes.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-cc-text-dim">Events logged</span>
              <span className="text-sm font-medium text-cc-text">{audit.length}</span>
            </div>
            <Link href="/scenes" className="btn-primary w-full mt-2"><Icon name="play" size={15} /> Play a scene</Link>
          </div>
        </div>
      </div>

      {lastEvent && <p className="text-xs text-cc-text-muted">{lastEvent}</p>}
    </div>
  );
}
