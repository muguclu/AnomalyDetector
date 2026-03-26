"use client";

import { DataSource } from "@/types";
import { useAppStore } from "@/lib/store";
import { FileSpreadsheet, Database, Globe, PenLine } from "lucide-react";

const sources: { id: DataSource; label: string; desc: string; icon: React.ReactNode }[] = [
  { id: "csv", label: "CSV File", desc: "Upload a local CSV file", icon: <FileSpreadsheet className="w-6 h-6" /> },
  { id: "database", label: "Database", desc: "PostgreSQL / Supabase connection", icon: <Database className="w-6 h-6" /> },
  { id: "api", label: "API Endpoint", desc: "Fetch data from a REST API", icon: <Globe className="w-6 h-6" /> },
  { id: "manual", label: "Manual Entry", desc: "Enter data in JSON format", icon: <PenLine className="w-6 h-6" /> },
];

export function DataSourceSelector() {
  const { dataSource, setDataSource } = useAppStore();
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-display font-semibold text-anomaly-text mb-1">Data Source</h2>
        <p className="text-sm text-anomaly-muted">Select the data you want to analyze</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {sources.map((src) => (
          <button key={src.id} onClick={() => setDataSource(src.id)}
            className={`relative p-4 rounded-xl border text-left transition-all duration-200 group ${
              dataSource === src.id
                ? "border-anomaly-accent bg-anomaly-accent/10 shadow-[0_0_20px_rgba(108,99,255,0.15)]"
                : "border-anomaly-border bg-anomaly-card hover:border-anomaly-accent/50 hover:bg-anomaly-accent/5"
            }`}>
            <div className={`mb-3 transition-colors ${dataSource === src.id ? "text-anomaly-accent" : "text-anomaly-muted group-hover:text-anomaly-accent/70"}`}>
              {src.icon}
            </div>
            <div className="font-display font-medium text-anomaly-text text-sm mb-0.5">{src.label}</div>
            <div className="text-xs text-anomaly-muted">{src.desc}</div>
            {dataSource === src.id && <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-anomaly-accent animate-pulse-slow" />}
          </button>
        ))}
      </div>
    </div>
  );
}
