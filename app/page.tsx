"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { DataSourceSelector } from "@/components/forms/DataSourceSelector";
import { CSVUploadForm } from "@/components/forms/CSVUploadForm";
import { DatabaseForm } from "@/components/forms/DatabaseForm";
import { APIEndpointForm, ManualInputForm } from "@/components/forms/OtherForms";
import { AlgorithmConfig } from "@/components/forms/AlgorithmConfig";
import { ResultsPanel } from "@/components/charts/ResultsPanel";
import { Activity, Loader2, Play, RotateCcw, ChevronRight, Table2 } from "lucide-react";

export default function HomePage() {
  const {
    dataSource, rawData, columns, numericColumns, fileName,
    isLoading, error, config,
    setDetectionResult, setLoading, setError, reset,
  } = useAppStore();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const canDetect = rawData.length > 0 && config.columns.length > 0;

  const handleDetect = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/detect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: rawData, config }),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.error ?? "Detection failed"); return; }
      setDetectionResult(json);
      setStep(3);
    } catch (e) {
      setError("Detection failed: " + (e instanceof Error ? e.message : "unknown"));
    } finally { setLoading(false); }
  };

  const renderDataForm = () => {
    switch (dataSource) {
      case "csv": return <CSVUploadForm />;
      case "database": return <DatabaseForm />;
      case "api": return <APIEndpointForm />;
      case "manual": return <ManualInputForm />;
      default: return (
        <div className="text-center py-12 text-anomaly-muted">
          <p className="text-sm">← Select a data source first</p>
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-anomaly-bg text-anomaly-text">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: `linear-gradient(#6c63ff 1px, transparent 1px), linear-gradient(90deg, #6c63ff 1px, transparent 1px)`, backgroundSize: "60px 60px" }} />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-anomaly-accent/5 rounded-full blur-[120px]" />
      </div>

      {/* Header */}
      <header className="relative border-b border-anomaly-border bg-anomaly-surface/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-lg bg-anomaly-accent/20">
              <Activity className="w-5 h-5 text-anomaly-accent" />
            </div>
            <div>
              <span className="font-display font-bold text-anomaly-text">AnomalyDetector</span>
              <span className="text-anomaly-muted text-xs ml-2 font-mono">v1.0</span>
            </div>
          </div>

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm">
            {[{ n: 1, label: "Data Source" }, { n: 2, label: "Algorithm" }, { n: 3, label: "Results" }].map(({ n, label }, i) => (
              <div key={n} className="flex items-center gap-2">
                {i > 0 && <ChevronRight className="w-3.5 h-3.5 text-anomaly-border" />}
                <button
                  onClick={() => { if (n === 1 || (n === 2 && dataSource) || (n === 3 && rawData.length > 0)) setStep(n as 1 | 2 | 3); }}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-colors ${step === n ? "bg-anomaly-accent/20 text-anomaly-accent font-medium" : "text-anomaly-muted hover:text-anomaly-text"}`}>
                  <span className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-bold ${step === n ? "bg-anomaly-accent text-white" : "bg-anomaly-border"}`}>{n}</span>
                  {label}
                </button>
              </div>
            ))}
          </div>

          <button onClick={reset} className="flex items-center gap-1.5 text-xs text-anomaly-muted hover:text-anomaly-text transition-colors">
            <RotateCcw className="w-3.5 h-3.5" />Reset
          </button>
        </div>
      </header>

      <main className="relative max-w-7xl mx-auto px-6 py-8">

        {/* ── STEP 1: Data Source ── */}
        {step === 1 && (
          <div className="max-w-5xl mx-auto animate-fade-in">
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-display font-bold text-anomaly-text mb-2">Data Source & Upload</h1>
              <p className="text-anomaly-muted">Select and load the data you want to analyze</p>
            </div>
            <div className="grid grid-cols-5 gap-6">
              <div className="col-span-2 bg-anomaly-card border border-anomaly-border rounded-2xl p-6">
                <DataSourceSelector />
              </div>
              <div className="col-span-3 bg-anomaly-card border border-anomaly-border rounded-2xl p-6">
                <h2 className="text-lg font-display font-semibold text-anomaly-text mb-4">
                  {dataSource === "csv" && "Upload CSV File"}
                  {dataSource === "database" && "Database Connection"}
                  {dataSource === "api" && "API Endpoint"}
                  {dataSource === "manual" && "Manual Data Entry"}
                  {!dataSource && "Load Data"}
                </h2>
                {renderDataForm()}
              </div>
            </div>

            {/* Data loaded summary */}
            {rawData.length > 0 && (
              <div className="mt-6 bg-anomaly-card border border-anomaly-success/30 rounded-2xl p-5 animate-slide-up">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-anomaly-success/20">
                      <Table2 className="w-5 h-5 text-anomaly-success" />
                    </div>
                    <div>
                      <p className="font-display font-semibold text-anomaly-text">
                        Data Loaded{fileName && <span className="font-mono text-anomaly-accent text-sm ml-2">— {fileName}</span>}
                      </p>
                      <p className="text-sm text-anomaly-muted">
                        {rawData.length.toLocaleString()} rows · {columns.length} columns · {numericColumns.length} numeric columns
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 max-w-xs">
                    {numericColumns.slice(0, 6).map((col) => (
                      <span key={col} className="text-[11px] px-2 py-0.5 rounded-full bg-anomaly-accent/10 text-anomaly-accent font-mono border border-anomaly-accent/20">{col}</span>
                    ))}
                    {numericColumns.length > 6 && (
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-anomaly-border text-anomaly-muted font-mono">+{numericColumns.length - 6}</span>
                    )}
                  </div>
                </div>

                {/* Data preview */}
                <div className="overflow-x-auto rounded-xl border border-anomaly-border">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-anomaly-border bg-anomaly-surface">
                        <th className="text-left px-3 py-2 text-anomaly-muted font-mono">#</th>
                        {columns.slice(0, 7).map((col) => <th key={col} className="text-left px-3 py-2 text-anomaly-muted font-mono">{col}</th>)}
                        {columns.length > 7 && <th className="px-3 py-2 text-anomaly-muted">...</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {rawData.slice(0, 5).map((row, i) => (
                        <tr key={i} className="border-b border-anomaly-border/50 hover:bg-anomaly-surface/50">
                          <td className="px-3 py-2 text-anomaly-muted font-mono">{i + 1}</td>
                          {columns.slice(0, 7).map((col) => (
                            <td key={col} className="px-3 py-2 text-anomaly-text font-mono truncate max-w-[120px]">{String(row[col] ?? "—")}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {error && <div className="mt-4 p-4 rounded-xl bg-anomaly-danger/10 border border-anomaly-danger/30 text-sm text-anomaly-danger animate-fade-in">{error}</div>}

            {dataSource && rawData.length > 0 && (
              <div className="mt-6 flex justify-end">
                <button onClick={() => setStep(2)}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-anomaly-accent hover:bg-anomaly-accent-dim text-white font-display font-semibold transition-all shadow-[0_0_20px_rgba(108,99,255,0.3)] hover:shadow-[0_0_30px_rgba(108,99,255,0.5)]">
                  Continue to Algorithm <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── STEP 2: Algorithm ── */}
        {step === 2 && (
          <div className="max-w-5xl mx-auto animate-fade-in">
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-display font-bold text-anomaly-text mb-2">Algorithm Configuration</h1>
              <p className="text-anomaly-muted">Select an algorithm and tune its parameters</p>
            </div>
            <div className="grid grid-cols-5 gap-6">
              <div className="col-span-3 bg-anomaly-card border border-anomaly-border rounded-2xl p-6">
                <AlgorithmConfig />
              </div>
              <div className="col-span-2 space-y-4">
                <div className="bg-anomaly-card border border-anomaly-border rounded-2xl p-5">
                  <h3 className="text-sm font-display font-semibold text-anomaly-text mb-3">Current Configuration</h3>
                  <div className="space-y-2 text-xs">
                    {[
                      { label: "Algorithm", value: config.algorithm },
                      { label: "Columns", value: `${config.columns.length} selected` },
                      { label: "Total Rows", value: rawData.length.toLocaleString() },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex justify-between">
                        <span className="text-anomaly-muted">{label}</span>
                        <span className="font-mono text-anomaly-accent">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-anomaly-card border border-anomaly-border rounded-2xl p-5">
                  <h3 className="text-sm font-display font-semibold text-anomaly-text mb-3">Algorithm Comparison</h3>
                  <div className="space-y-3">
                    {[
                      { name: "Z-Score", speed: 5, accuracy: 3, explain: 4 },
                      { name: "IQR", speed: 5, accuracy: 3, explain: 4 },
                      { name: "Isolation Forest", speed: 3, accuracy: 5, explain: 2 },
                      { name: "DBSCAN", speed: 2, accuracy: 4, explain: 3 },
                      { name: "Claude AI", speed: 1, accuracy: 4, explain: 5 },
                    ].map(({ name, speed, accuracy, explain }) => (
                      <div key={name} className="text-xs">
                        <div className="font-mono text-anomaly-muted mb-1">{name}</div>
                        {[
                          { label: "Speed", val: speed, color: "bg-anomaly-success" },
                          { label: "Accuracy", val: accuracy, color: "bg-anomaly-accent" },
                          { label: "Explainability", val: explain, color: "bg-anomaly-warning" },
                        ].map(({ label, val, color }) => (
                          <div key={label} className="flex items-center gap-2">
                            <span className="text-anomaly-muted w-20">{label}</span>
                            <div className="flex gap-0.5">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <div key={i} className={`w-4 h-1.5 rounded-full ${i < val ? color : "bg-anomaly-border"}`} />
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {error && <div className="mt-4 p-4 rounded-xl bg-anomaly-danger/10 border border-anomaly-danger/30 text-sm text-anomaly-danger">{error}</div>}

            <div className="mt-6 flex items-center justify-between">
              <button onClick={() => setStep(1)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-anomaly-border text-anomaly-muted hover:text-anomaly-text hover:border-anomaly-accent/50 transition-all font-display text-sm">
                ← Back
              </button>
              <button onClick={handleDetect} disabled={!canDetect || isLoading}
                className="flex items-center gap-2 px-8 py-3 rounded-xl bg-anomaly-accent hover:bg-anomaly-accent-dim text-white font-display font-semibold transition-all shadow-[0_0_20px_rgba(108,99,255,0.3)] hover:shadow-[0_0_30px_rgba(108,99,255,0.5)] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none text-sm">
                {isLoading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" />{config.algorithm === "claude_ai" ? "Claude is analyzing..." : "Analyzing..."}</>
                ) : (
                  <><Play className="w-4 h-4" />Run Anomaly Detection</>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3: Results ── */}
        {step === 3 && (
          <div className="max-w-5xl mx-auto animate-fade-in">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-display font-bold text-anomaly-text mb-1">Detection Results</h1>
                <p className="text-anomaly-muted">Anomaly detection complete</p>
              </div>
              <button onClick={() => setStep(2)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-anomaly-accent/10 border border-anomaly-accent/30 text-anomaly-accent hover:bg-anomaly-accent/20 transition-all font-display text-sm font-medium">
                <Play className="w-4 h-4" />Run Again
              </button>
            </div>
            <ResultsPanel />
          </div>
        )}
      </main>
    </div>
  );
}
