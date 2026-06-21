"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Sidebar from "@/components/Sidebar";
import Icon from "@/components/Icon";
import { useSocket } from "@/hooks/useSocket";
import { Headset, VRUser } from "@/types";
import api from "@/lib/api";

function timeAgo(iso: string): string {
  const secs = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (secs < 60) return `${secs}s`;
  if (secs < 3600) return `${Math.floor(secs / 60)}m`;
  return `${Math.floor(secs / 3600)}h`;
}

export default function SessionsPage() {
  const { isConnected, vrUserStatuses, headsetStatuses } = useSocket();
  const [headsets, setHeadsets] = useState<Headset[]>([]);
  const [users, setUsers] = useState<VRUser[]>([]);
  const [newUsername, setNewUsername] = useState("");

  const fetchAll = useCallback(async () => {
    const [h, u] = await Promise.all([
      api.get<Headset[]>("/headsets"),
      api.get<VRUser[]>("/vr-users"),
    ]);
    if (h.data) setHeadsets(h.data);
    if (u.data) setUsers(u.data);
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const liveSessions = useMemo(() => Array.from(vrUserStatuses.values()), [vrUserStatuses]);

  // merge live headset scene info onto registered headsets
  const mergedHeadsets = headsets.map((h) => {
    const live = headsetStatuses.get(h.deviceId);
    return live ? { ...h, ...live } : h;
  });

  const addUser = async () => {
    const name = newUsername.trim();
    if (!name) return;
    const res = await api.post<VRUser>("/vr-users", { username: name });
    if (res.data) {
      setUsers((p) => [...p, res.data!]);
      setNewUsername("");
    }
  };

  const removeUser = async (id: string) => {
    await api.delete(`/vr-users/${id}`);
    setUsers((p) => p.filter((u) => u.id !== id));
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-cc-navy tracking-tight">Sessions</h1>
              <p className="text-sm text-cc-text-muted mt-0.5">
                Headsets &amp; the students currently in VR
              </p>
            </div>
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${
                isConnected
                  ? "bg-cc-green/10 text-cc-green border border-cc-green/20"
                  : "bg-cc-red/10 text-cc-red border border-cc-red/20"
              }`}
            >
              <div className={`w-2 h-2 rounded-full ${isConnected ? "bg-cc-green animate-status-pulse" : "bg-cc-red"}`} />
              {liveSessions.length} live now
            </div>
          </div>

          {/* Live sessions */}
          <div>
            <h2 className="text-sm font-semibold text-cc-text mb-3">Live in VR</h2>
            {liveSessions.length === 0 ? (
              <div className="glass-card text-center py-10 text-sm text-cc-text-muted">
                No one is in VR right now. When a student logs in on a headset they appear here.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {liveSessions.map((s) => (
                  <div key={s.vrUserId} className="glass-card flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-cc-navy flex items-center justify-center text-white font-semibold uppercase">
                      {s.username?.[0] || "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-cc-text truncate">{s.username}</p>
                      <p className="text-[11px] text-cc-text-muted">in session · {timeAgo(s.connectedAt)}</p>
                    </div>
                    <span className="badge-online">live</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Registered headsets */}
          <div>
            <h2 className="text-sm font-semibold text-cc-text mb-3">Registered Headsets</h2>
            {mergedHeadsets.length === 0 ? (
              <div className="glass-card text-center py-8 text-sm text-cc-text-muted">
                No headsets registered yet.
              </div>
            ) : (
              <div className="glass-card !p-0 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-[10px] uppercase tracking-wider text-cc-text-muted border-b border-cc-border">
                      <th className="px-4 py-3 font-medium">Device</th>
                      <th className="px-4 py-3 font-medium">Current Scene</th>
                      <th className="px-4 py-3 font-medium">Battery</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mergedHeadsets.map((h) => (
                      <tr key={h.id} className="border-b border-cc-border last:border-0">
                        <td className="px-4 py-3">
                          <p className="font-medium text-cc-text">{h.label}</p>
                          <p className="text-[10px] text-cc-text-muted font-mono">{h.deviceId}</p>
                        </td>
                        <td className="px-4 py-3 text-cc-text-dim">{h.currentScene || "—"}</td>
                        <td className="px-4 py-3 text-cc-text-dim">{h.batteryLevel}%</td>
                        <td className="px-4 py-3">
                          <span className={h.status === "online" ? "badge-online" : "badge-offline"}>
                            {h.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Allowed users */}
          <div>
            <h2 className="text-sm font-semibold text-cc-text mb-3">Allowed Usernames</h2>
            <p className="text-xs text-cc-text-muted mb-3">
              Students can only log into a headset with a username on this list.
            </p>
            <div className="glass-card">
              <div className="flex gap-2 mb-4">
                <input
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addUser()}
                  placeholder="Add a username…"
                  className="input-dark flex-1"
                />
                <button onClick={addUser} className="btn-primary" disabled={!newUsername.trim()}>
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {users.length === 0 ? (
                  <p className="text-sm text-cc-text-muted">No usernames yet.</p>
                ) : (
                  users.map((u) => (
                    <span
                      key={u.id}
                      className="inline-flex items-center gap-2 text-sm px-3 py-1 rounded-full bg-cc-surface-light border border-cc-border text-cc-text"
                    >
                      {u.username}
                      <button
                        onClick={() => removeUser(u.id)}
                        className="text-cc-text-muted hover:text-cc-red"
                        title="Remove"
                      >
                        <Icon name="close" size={13} />
                      </button>
                    </span>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
