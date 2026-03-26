"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { Globe, PenLine, Loader2 } from "lucide-react";

export function APIEndpointForm() {
  const { setData, setLoading, setError, isLoading } = useAppStore();
  const [form, setForm] = useState({ url: "", method: "GET" as "GET" | "POST", headers: "", body: "", dataPath: "" });

  const handleSubmit = async () => {
    setLoading(true); setError(null);
    let headers: Record<string, string> = {};
    try { if (form.headers) headers = JSON.parse(form.headers); }
    catch { setError("Headers must be valid JSON"); setLoading(false); return; }
    try {
      const res = await fetch("/api/api-fetch", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, headers }) });
      const json = await res.json();
      if (!res.ok) { setError(json.error ?? "Fetch failed"); return; }
      setData(json.data, json.columns, json.numericColumns);
    } catch (e) {
      setError("Fetch failed: " + (e instanceof Error ? e.message : "unknown"));
    } finally { setLoading(false); }
  };

  const inputClass = "w-full bg-anomaly-surface border border-anomaly-border rounded-lg px-3 py-2 text-sm text-anomaly-text placeholder-anomaly-muted focus:outline-none focus:border-anomaly-accent transition-colors font-mono";
  const labelClass = "block text-xs text-anomaly-muted mb-1.5 font-display font-medium uppercase tracking-wide";

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <select className={`${inputClass} w-24 flex-shrink-0`} value={form.method} onChange={(e) => setForm({ ...form, method: e.target.value as "GET" | "POST" })}>
          <option value="GET">GET</option>
          <option value="POST">POST</option>
        </select>
        <input className={`${inputClass} flex-1`} placeholder="https://api.example.com/data" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} />
      </div>
      <div>
        <label className={labelClass}>Headers (JSON)</label>
        <textarea className={`${inputClass} h-20 resize-none`} placeholder={'{"Authorization": "Bearer token"}'} value={form.headers} onChange={(e) => setForm({ ...form, headers: e.target.value })} />
      </div>
      {form.method === "POST" && (
        <div>
          <label className={labelClass}>Request Body (JSON)</label>
          <textarea className={`${inputClass} h-20 resize-none`} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} />
        </div>
      )}
      <div>
        <label className={labelClass}>Data Path (optional)</label>
        <input className={inputClass} placeholder="data.rows  or  results" value={form.dataPath} onChange={(e) => setForm({ ...form, dataPath: e.target.value })} />
        <p className="text-xs text-anomaly-muted mt-1">Where does the array start in the response JSON?</p>
      </div>
      <button onClick={handleSubmit} disabled={isLoading || !form.url}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-anomaly-accent hover:bg-anomaly-accent-dim text-white font-display font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />}
        {isLoading ? "Fetching..." : "Fetch Data"}
      </button>
    </div>
  );
}

export function ManualInputForm() {
  const { setData, isLoading } = useAppStore();
  const [json, setJson] = useState(`[
  {"date": "2024-01-01", "revenue": 1200, "quantity": 50, "price": 24},
  {"date": "2024-01-02", "revenue": 1150, "quantity": 48, "price": 23.9},
  {"date": "2024-01-03", "revenue": 15000, "quantity": 600, "price": 25},
  {"date": "2024-01-04", "revenue": 1100, "quantity": 45, "price": 24.4},
  {"date": "2024-01-05", "revenue": 1300, "quantity": 55, "price": 23.6}
]`);
  const [parseError, setParseError] = useState<string | null>(null);

  const handleSubmit = () => {
    setParseError(null);
    let data: Record<string, unknown>[];
    try {
      data = JSON.parse(json);
      if (!Array.isArray(data)) throw new Error("JSON must be an array");
    } catch (e) { setParseError(e instanceof Error ? e.message : "Invalid JSON"); return; }
    if (!data.length) { setParseError("Array is empty"); return; }
    const columns = Object.keys(data[0]);
    const numericColumns = columns.filter((col) => data.slice(0, 10).some((r) => typeof r[col] === "number"));
    setData(data as Record<string, string | number | null>[], columns, numericColumns);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs text-anomaly-muted mb-1.5 font-display font-medium uppercase tracking-wide">JSON Data</label>
        <textarea
          className="w-full bg-anomaly-surface border border-anomaly-border rounded-lg px-3 py-2 text-sm text-anomaly-text focus:outline-none focus:border-anomaly-accent transition-colors font-mono h-48 resize-none"
          value={json} onChange={(e) => { setJson(e.target.value); setParseError(null); }}
        />
        {parseError && <p className="text-xs text-anomaly-danger mt-1">{parseError}</p>}
      </div>
      <button onClick={handleSubmit} disabled={isLoading}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-anomaly-accent hover:bg-anomaly-accent-dim text-white font-display font-medium text-sm transition-colors disabled:opacity-50">
        <PenLine className="w-4 h-4" />
        Load Data
      </button>
    </div>
  );
}
