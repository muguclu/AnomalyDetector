"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { Database, Loader2 } from "lucide-react";

export function DatabaseForm() {
  const { setData, setLoading, setError, isLoading } = useAppStore();
  const [form, setForm] = useState({
    host: "localhost", port: 5432, database: "", user: "", password: "",
    ssl: false, query: "SELECT * FROM your_table LIMIT 1000",
  });

  const handleSubmit = async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetch("/api/db-connect", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const json = await res.json();
      if (!res.ok) { setError(json.error ?? "Connection failed"); return; }
      setData(json.data, json.columns, json.numericColumns);
    } catch (e) {
      setError("Connection failed: " + (e instanceof Error ? e.message : "unknown"));
    } finally { setLoading(false); }
  };

  const inputClass = "w-full bg-anomaly-surface border border-anomaly-border rounded-lg px-3 py-2 text-sm text-anomaly-text placeholder-anomaly-muted focus:outline-none focus:border-anomaly-accent transition-colors font-mono";
  const labelClass = "block text-xs text-anomaly-muted mb-1.5 font-display font-medium uppercase tracking-wide";

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-2">
          <label className={labelClass}>Host</label>
          <input className={inputClass} value={form.host} onChange={(e) => setForm({ ...form, host: e.target.value })} placeholder="localhost" />
        </div>
        <div>
          <label className={labelClass}>Port</label>
          <input className={inputClass} type="number" value={form.port} onChange={(e) => setForm({ ...form, port: Number(e.target.value) })} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Database</label>
          <input className={inputClass} value={form.database} onChange={(e) => setForm({ ...form, database: e.target.value })} placeholder="mydb" />
        </div>
        <div>
          <label className={labelClass}>Username</label>
          <input className={inputClass} value={form.user} onChange={(e) => setForm({ ...form, user: e.target.value })} placeholder="postgres" />
        </div>
      </div>
      <div>
        <label className={labelClass}>Password</label>
        <input className={inputClass} type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="••••••••" />
      </div>
      <div>
        <label className={labelClass}>SQL Query</label>
        <textarea className={`${inputClass} resize-none h-24`} value={form.query} onChange={(e) => setForm({ ...form, query: e.target.value })} />
      </div>
      <div className="flex items-center gap-3">
        <button type="button" onClick={() => setForm({ ...form, ssl: !form.ssl })}
          className={`relative w-10 h-5 rounded-full transition-colors ${form.ssl ? "bg-anomaly-accent" : "bg-anomaly-border"}`}>
          <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${form.ssl ? "translate-x-5" : "translate-x-0"}`} />
        </button>
        <span className="text-sm text-anomaly-muted">SSL Connection</span>
      </div>
      <button onClick={handleSubmit} disabled={isLoading || !form.host || !form.database}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-anomaly-accent hover:bg-anomaly-accent-dim text-white font-display font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
        {isLoading ? "Connecting..." : "Connect & Fetch Data"}
      </button>
    </div>
  );
}
