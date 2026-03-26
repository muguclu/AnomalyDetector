"use client";

import { useAppStore } from "@/lib/store";
import { AnomalyResult } from "@/types";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { AlertTriangle, CheckCircle, Brain, Clock, Download, TrendingUp } from "lucide-react";
import { useState } from "react";

function ScoreBar({ score }: { score: number }) {
  const pct = Math.round(score * 100);
  const color = score > 0.7 ? "#ff4757" : score > 0.4 ? "#ffa502" : "#2ed573";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-anomaly-border rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      <span className="text-xs font-mono w-8 text-right" style={{ color }}>{pct}%</span>
    </div>
  );
}

export function ResultsPanel() {
  const { detectionResult, config } = useAppStore();
  const [activeTab, setActiveTab] = useState<"overview" | "anomalies" | "chart">("overview");

  if (!detectionResult) return null;

  const { anomalyCount, totalRows, anomalyRate, anomalies, executionTimeMs, columnStats, claudeSummary } = detectionResult;
  const anomalyList = anomalies.filter((a) => a.isAnomaly).sort((a, b) => b.score - a.score);

  const handleExport = () => {
    if (!anomalyList.length) return;
    const rows = anomalyList.map((a) => ({ row_index: a.rowIndex, anomaly_score: a.score.toFixed(4), reason: a.reason ?? "", ...a.row }));
    const csv = [Object.keys(rows[0]).join(","), ...rows.map((r) => Object.values(r).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "anomalies.csv"; a.click();
  };

  const tabClass = (tab: typeof activeTab) =>
    `px-4 py-2 text-sm font-display font-medium transition-colors rounded-lg ${activeTab === tab ? "bg-anomaly-accent/20 text-anomaly-accent" : "text-anomaly-muted hover:text-anomaly-text"}`;

  const xCol = config.columns[0];
  const yCol = config.columns[1] ?? config.columns[0];
  const scatterData = anomalies.map((a, i) => ({ x: Number(a.row[xCol]) || i, y: Number(a.row[yCol]) || 0, isAnomaly: a.isAnomaly }));

  return (
    <div className="bg-anomaly-card border border-anomaly-border rounded-2xl overflow-hidden animate-slide-up">
      <div className="p-6 border-b border-anomaly-border">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-xl font-display font-bold text-anomaly-text">Analysis Results</h2>
            <p className="text-sm text-anomaly-muted mt-1">{config.algorithm.replace(/_/g, " ").toUpperCase()} · {config.columns.join(", ")}</p>
          </div>
          {anomalyList.length > 0 && (
            <button onClick={handleExport} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-display text-anomaly-muted border border-anomaly-border hover:border-anomaly-accent/60 hover:text-anomaly-accent transition-all">
              <Download className="w-3.5 h-3.5" />Download CSV
            </button>
          )}
        </div>
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Total Rows", value: totalRows.toLocaleString(), icon: <TrendingUp className="w-4 h-4" />, color: "text-anomaly-muted" },
            { label: "Anomalies", value: anomalyCount.toLocaleString(), icon: <AlertTriangle className="w-4 h-4" />, color: "text-anomaly-danger" },
            { label: "Anomaly Rate", value: `${(anomalyRate * 100).toFixed(1)}%`, icon: <CheckCircle className="w-4 h-4" />, color: anomalyRate > 0.2 ? "text-anomaly-danger" : "text-anomaly-warning" },
            { label: "Duration", value: `${executionTimeMs}ms`, icon: <Clock className="w-4 h-4" />, color: "text-anomaly-muted" },
          ].map((stat) => (
            <div key={stat.label} className="bg-anomaly-surface rounded-xl p-4 border border-anomaly-border">
              <div className={`flex items-center gap-1.5 ${stat.color} mb-2`}>{stat.icon}<span className="text-xs font-display">{stat.label}</span></div>
              <div className="text-2xl font-display font-bold text-anomaly-text">{stat.value}</div>
            </div>
          ))}
        </div>
      </div>

      {claudeSummary && (
        <div className="mx-6 mt-6 p-4 rounded-xl bg-anomaly-accent/10 border border-anomaly-accent/30">
          <div className="flex items-center gap-2 mb-2">
            <Brain className="w-4 h-4 text-anomaly-accent" />
            <span className="text-sm font-display font-semibold text-anomaly-accent">Claude AI Summary</span>
          </div>
          <p className="text-sm text-anomaly-text leading-relaxed">{claudeSummary}</p>
        </div>
      )}

      <div className="px-6 pt-6">
        <div className="flex gap-2 mb-4">
          {(["overview", "anomalies", "chart"] as const).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={tabClass(tab)}>
              {tab === "overview" ? "Overview" : tab === "anomalies" ? `Anomalies (${anomalyList.length})` : "Chart"}
            </button>
          ))}
        </div>

        {activeTab === "overview" && columnStats && (
          <div className="space-y-3 pb-6">
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={columnStats} barCategoryGap="30%">
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2e" />
                  <XAxis dataKey="name" tick={{ fill: "#6b6b80", fontSize: 11 }} />
                  <YAxis tick={{ fill: "#6b6b80", fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: "#16161f", border: "1px solid #1e1e2e", borderRadius: 8, color: "#e8e8f0" }} />
                  <Bar dataKey="mean" name="Mean" fill="#6c63ff" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {columnStats.map((stat) => (
                <div key={stat.name} className="bg-anomaly-surface rounded-xl p-4 border border-anomaly-border">
                  <div className="text-xs font-mono text-anomaly-accent mb-2">{stat.name}</div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                    {[["Avg", stat.mean.toFixed(2)], ["Std", stat.std.toFixed(2)], ["Min", stat.min.toFixed(2)], ["Max", stat.max.toFixed(2)], ["Q1", stat.q1.toFixed(2)], ["Q3", stat.q3.toFixed(2)]].map(([k, v]) => (
                      <div key={k} className="flex justify-between">
                        <span className="text-anomaly-muted">{k}</span>
                        <span className="text-anomaly-text font-mono">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "anomalies" && (
          <div className="pb-6 space-y-2 max-h-96 overflow-y-auto pr-1">
            {anomalyList.length === 0 ? (
              <div className="text-center py-8 text-anomaly-muted">
                <CheckCircle className="w-8 h-8 mx-auto mb-2 text-anomaly-success" />
                <p className="text-sm">No anomalies found</p>
              </div>
            ) : (
              anomalyList.map((a: AnomalyResult) => (
                <div key={a.rowIndex} className="bg-anomaly-surface border border-anomaly-border rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-anomaly-danger flex-shrink-0" />
                    <span className="text-xs font-mono text-anomaly-muted">Row #{a.rowIndex + 1}</span>
                    {a.affectedColumns?.map((c) => (
                      <span key={c} className="text-[10px] px-1.5 py-0.5 rounded bg-anomaly-danger/20 text-anomaly-danger font-mono">{c}</span>
                    ))}
                  </div>
                  <ScoreBar score={a.score} />
                  {a.reason && (
                    <p className="mt-2 text-xs text-anomaly-muted leading-relaxed border-t border-anomaly-border pt-2">
                      <Brain className="w-3 h-3 inline mr-1 text-anomaly-accent" />{a.reason}
                    </p>
                  )}
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-0.5">
                    {config.columns.map((col) => (
                      <span key={col} className="text-[11px] font-mono text-anomaly-muted">
                        <span className="text-anomaly-text">{col}:</span> {String(a.row[col] ?? "—")}
                      </span>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "chart" && config.columns.length >= 1 && (
          <div className="pb-6">
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2e" />
                  <XAxis dataKey="x" name={xCol} tick={{ fill: "#6b6b80", fontSize: 11 }} label={{ value: xCol, position: "bottom", fill: "#6b6b80", fontSize: 11 }} />
                  <YAxis dataKey="y" name={yCol} tick={{ fill: "#6b6b80", fontSize: 11 }} label={{ value: yCol, angle: -90, position: "left", fill: "#6b6b80", fontSize: 11 }} />
                  <Tooltip cursor={{ strokeDasharray: "3 3" }} contentStyle={{ background: "#16161f", border: "1px solid #1e1e2e", borderRadius: 8, color: "#e8e8f0", fontSize: 12 }} formatter={(val: number, name: string) => [val?.toFixed(2), name]} />
                  <Scatter data={scatterData} shape={(props: { cx?: number; cy?: number; payload?: { isAnomaly: boolean } }) => {
                    const { cx = 0, cy = 0, payload } = props;
                    const isAnom = payload?.isAnomaly;
                    return <circle cx={cx} cy={cy} r={isAnom ? 6 : 4} fill={isAnom ? "#ff4757" : "#6c63ff"} fillOpacity={isAnom ? 0.9 : 0.5} stroke={isAnom ? "#ff4757" : "none"} strokeWidth={isAnom ? 1.5 : 0} />;
                  }} />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-center gap-6 mt-3">
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-anomaly-accent" /><span className="text-xs text-anomaly-muted">Normal</span></div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-anomaly-danger" /><span className="text-xs text-anomaly-muted">Anomaly</span></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
