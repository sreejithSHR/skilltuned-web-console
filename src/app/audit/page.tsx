"use client";

import React, { useState, useEffect, useCallback } from "react";
import Sidebar from "@/components/Sidebar";
import Icon from "@/components/Icon";
import { AuditLog } from "@/types";
import api from "@/lib/api";

const typeStyle: Record<string, { label: string; cls: string }> = {
  session_start: { label: "Session start", cls: "bg-cc-green/10 text-cc-green" },
  session_end: { label: "Session end", cls: "bg-cc-text-muted/15 text-cc-text-dim" },
  scene_play: { label: "Scene played", cls: "bg-cc-cyan/10 text-cc-cyan" },
};

function fmt(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = useCallback(async () => {
    const res = await api.get<AuditLog[]>("/audit");
    if (res.data) setLogs(res.data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchLogs();
    const t = setInterval(fetchLogs, 10000);
    return () => clearInterval(t);
  }, [fetchLogs]);

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="p-4 md:p-6 lg:p-8 max-w-[1100px] mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-cc-navy tracking-tight">Audit Log</h1>
              <p className="text-sm text-cc-text-muted mt-0.5">Every session and scene action, newest first</p>
            </div>
            <button onClick={fetchLogs} className="btn-ghost text-sm">
              Refresh
            </button>
          </div>

          {/* Log card */}
          <div className="glass-card !p-2">
            {loading ? (
              <p className="text-center text-sm text-cc-text-muted py-12">Loading…</p>
            ) : logs.length === 0 ? (
              <div className="text-center py-16">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-cc-surface-light text-cc-text-muted mb-3">
                  <Icon name="audit" size={22} />
                </div>
                <p className="text-sm text-cc-text-dim">No activity yet</p>
                <p className="text-xs text-cc-text-muted mt-1">Sessions and scene plays will show up here</p>
              </div>
            ) : (
              <div className="divide-y divide-cc-border">
                {logs.map((log) => {
                  const t = typeStyle[log.type] || { label: log.type, cls: "bg-cc-text-muted/15 text-cc-text-dim" };
                  return (
                    <div key={log.id} className="flex items-center gap-4 px-4 py-3.5">
                      <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full whitespace-nowrap ${t.cls}`}>
                        {t.label}
                      </span>
                      <p className="flex-1 text-sm text-cc-text min-w-0 truncate">{log.message}</p>
                      {log.actor && (
                        <span className="text-xs text-cc-text-muted hidden sm:block">{log.actor}</span>
                      )}
                      <span className="text-xs text-cc-text-muted whitespace-nowrap">{fmt(log.createdAt)}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
