"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Sidebar from "@/components/Sidebar";
import Icon from "@/components/Icon";
import { useAuth } from "@/context/AuthContext";
import { Institution } from "@/types";
import api from "@/lib/api";

interface GlobalLog {
  id: string;
  type: string;
  message: string;
  actor: string | null;
  createdAt: string;
  orgName: string;
}

const auditStyle: Record<string, string> = {
  session_start: "bg-cc-green/10 text-cc-green",
  session_end: "bg-cc-text-muted/15 text-cc-text-dim",
  scene_play: "bg-cc-cyan/10 text-cc-cyan",
};

function AddInstitutionModal({
  onAdd,
  onClose,
}: {
  onAdd: (data: { name: string; adminEmail: string; adminPassword: string }) => Promise<string | null>;
  onClose: () => void;
}) {
  const [name, setName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    const err = await onAdd({ name: name.trim(), adminEmail, adminPassword });
    setSaving(false);
    if (err) setError(err);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-cc-navy/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative glass-strong rounded-3xl p-6 max-w-lg w-full animate-slide-up">
        <h2 className="text-lg font-semibold text-cc-text mb-4">Add Institution</h2>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-cc-text-dim mb-1.5">Institution Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Lincoln High School" className="input-dark" autoFocus />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-cc-text-dim mb-1.5">Admin Email (optional)</label>
              <input value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} placeholder="admin@school.edu" className="input-dark" />
            </div>
            <div>
              <label className="block text-xs font-medium text-cc-text-dim mb-1.5">Admin Password</label>
              <input value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} type="text" placeholder="set a password" className="input-dark" />
            </div>
          </div>
          <p className="text-[11px] text-cc-text-muted">Add an admin to let this institution sign in. You can leave it blank and add one later.</p>
          {error && <p className="text-sm text-cc-red">{error}</p>}
          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={onClose} className="btn-ghost">Cancel</button>
            <button type="submit" className="btn-primary" disabled={!name.trim() || saving}>
              {saving ? "Creating…" : "Create Institution"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="text-center">
      <p className="text-xl font-bold text-cc-text tabular-nums">{value}</p>
      <p className="text-[10px] text-cc-text-muted uppercase tracking-wider">{label}</p>
    </div>
  );
}

export default function InstitutionsPage() {
  const { user, isLoading } = useAuth();
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [globalLogs, setGlobalLogs] = useState<GlobalLog[]>([]);
  const [showAdd, setShowAdd] = useState(false);

  const isSuper = user?.role === "superadmin";
  const canManage = user?.role === "admin" || isSuper;

  const fetchData = useCallback(async () => {
    const res = await api.get<Institution[]>("/orgs");
    if (res.data) setInstitutions(res.data);
    if (user?.role === "superadmin") {
      const a = await api.get<GlobalLog[]>("/admin/audit");
      if (a.data) setGlobalLogs(a.data);
    }
  }, [user?.role]);

  useEffect(() => {
    if (canManage) {
      fetchData();
      const t = setInterval(fetchData, 10000);
      return () => clearInterval(t);
    }
  }, [canManage, fetchData]);

  const handleAdd = async (data: { name: string; adminEmail: string; adminPassword: string }) => {
    const res = await api.post("/orgs", data);
    if (res.error) return res.error;
    setShowAdd(false);
    fetchData();
    return null;
  };

  const totals = useMemo(() => {
    return institutions.reduce(
      (acc, i) => ({
        live: acc.live + i.liveCount,
        students: acc.students + i.counts.vrUsers,
        scenes: acc.scenes + i.counts.scenes,
        headsets: acc.headsets + i.counts.headsets,
      }),
      { live: 0, students: 0, scenes: 0, headsets: 0 }
    );
  }, [institutions]);

  if (!isLoading && !canManage) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center">
          <div className="glass-card text-center max-w-sm">
            <p className="text-cc-text font-medium">Not authorized</p>
            <p className="text-sm text-cc-text-muted mt-1">This area is for institution admins and the super admin.</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div>
                <h1 className="text-2xl font-bold text-cc-navy tracking-tight">Institutions</h1>
                <p className="text-sm text-cc-text-muted mt-0.5">
                  {isSuper ? "Monitoring every institution on the platform" : "Institutions you manage"}
                </p>
              </div>
              <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${isSuper ? "bg-cc-purple/10 text-cc-purple" : "bg-cc-cyan/10 text-cc-cyan"}`}>
                {isSuper ? "SUPER ADMIN" : "ADMIN"}
              </span>
            </div>
            <button onClick={() => setShowAdd(true)} className="btn-primary"><Icon name="plus" size={16} /> Add Institution</button>
          </div>

          {/* Super-admin global summary */}
          {isSuper && (
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="glass-card"><Stat label="Institutions" value={institutions.length} /></div>
              <div className="glass-card"><Stat label="Live in VR" value={totals.live} /></div>
              <div className="glass-card"><Stat label="Students" value={totals.students} /></div>
              <div className="glass-card"><Stat label="Scenes" value={totals.scenes} /></div>
              <div className="glass-card"><Stat label="Headsets" value={totals.headsets} /></div>
            </div>
          )}

          {/* Institution cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {institutions.map((inst) => (
              <div key={inst.id} className="glass-card">
                <div className="flex items-start justify-between mb-4">
                  <div className="inline-flex items-center justify-center w-11 h-11 rounded-2xl bg-cc-navy text-white font-semibold uppercase">
                    {inst.name[0]}
                  </div>
                  {inst.liveCount > 0 && (
                    <span className="badge-online">{inst.liveCount} live</span>
                  )}
                </div>
                <h3 className="font-semibold text-cc-text truncate">{inst.name}</h3>
                <p className="text-[11px] text-cc-text-muted mb-4">
                  since {new Date(inst.createdAt).toLocaleDateString()}
                </p>
                <div className="grid grid-cols-4 gap-2 pt-3 border-t border-cc-border">
                  <Stat label="Admins" value={inst.counts.users} />
                  <Stat label="Students" value={inst.counts.vrUsers} />
                  <Stat label="Scenes" value={inst.counts.scenes} />
                  <Stat label="Headsets" value={inst.counts.headsets} />
                </div>
              </div>
            ))}
          </div>

          {/* Super-admin global activity */}
          {isSuper && (
            <div>
              <h2 className="text-lg font-semibold text-cc-text mb-4">Global Activity</h2>
              <div className="glass-card !p-2">
                {globalLogs.length === 0 ? (
                  <p className="text-center text-sm text-cc-text-muted py-8">No activity across institutions yet</p>
                ) : (
                  <div className="divide-y divide-cc-border">
                    {globalLogs.map((log) => (
                      <div key={log.id} className="flex items-center gap-3 px-3 py-3">
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full whitespace-nowrap ${auditStyle[log.type] || "bg-cc-text-muted/15 text-cc-text-dim"}`}>
                          {log.type.replace("_", " ")}
                        </span>
                        <p className="flex-1 text-sm text-cc-text truncate min-w-0">{log.message}</p>
                        <span className="text-[11px] text-cc-cyan whitespace-nowrap hidden sm:block">{log.orgName}</span>
                        <span className="text-[11px] text-cc-text-muted whitespace-nowrap">
                          {new Date(log.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {showAdd && <AddInstitutionModal onAdd={handleAdd} onClose={() => setShowAdd(false)} />}
        </div>
      </main>
    </div>
  );
}
