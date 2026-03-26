"use client";

import { useAppStore } from "@/lib/store";
import { Algorithm } from "@/types";
import { Brain, TrendingDown, Trees, Layers, Zap } from "lucide-react";

const algorithms: { id: Algorithm; label: string; desc: string; badge: string; icon: React.ReactNode; color: string }[] = [
  { id: "zscore", label: "Z-Score", desc: "Standard deviation-based detection from the mean", badge: "Fast", icon: <TrendingDown className="w-5 h-5" />, color: "text-blue-400" },
  { id: "iqr", label: "IQR", desc: "Outlier detection via interquartile range", badge: "Robust", icon: <Layers className="w-5 h-5" />, color: "text-green-400" },
  { id: "isolation_forest", label: "Isolation Forest", desc: "Isolation-based detection via random partitioning", badge: "ML", icon: <Trees className="w-5 h-5" />, color: "text-orange-400" },
  { id: "dbscan", label: "DBSCAN", desc: "Density-based clustering — noise points = anomalies", badge: "Clustering", icon: <Zap className="w-5 h-5" />, color: "text-yellow-400" },
  { id: "claude_ai", label: "Claude AI", desc: "Contextual anomaly analysis & explanation via LLM", badge: "AI", icon: <Brain className="w-5 h-5" />, color: "text-anomaly-accent" },
];

export function AlgorithmConfig() {
  const { config, updateConfig, numericColumns } = useAppStore();
  const inputClass = "w-full bg-anomaly-bg border border-anomaly-border rounded-lg px-3 py-2 text-sm text-anomaly-text focus:outline-none focus:border-anomaly-accent transition-colors font-mono";
  const labelClass = "text-xs text-anomaly-muted font-display font-medium uppercase tracking-wide";

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-display font-semibold text-anomaly-text mb-3">Algorithm Selection</h3>
        <div className="space-y-2">
          {algorithms.map((alg) => (
            <button key={alg.id} onClick={() => updateConfig({ algorithm: alg.id })}
              className={`w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-all ${
                config.algorithm === alg.id ? "border-anomaly-accent bg-anomaly-accent/10" : "border-anomaly-border hover:border-anomaly-accent/40 hover:bg-anomaly-surface"
              }`}>
              <span className={alg.color}>{alg.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-display font-medium text-anomaly-text">{alg.label}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-anomaly-border text-anomaly-muted font-mono">{alg.badge}</span>
                </div>
                <p className="text-xs text-anomaly-muted mt-0.5 truncate">{alg.desc}</p>
              </div>
              {config.algorithm === alg.id && <div className="w-2 h-2 rounded-full bg-anomaly-accent flex-shrink-0" />}
            </button>
          ))}
        </div>
      </div>

      {numericColumns.length > 0 && (
        <div>
          <h3 className="text-sm font-display font-semibold text-anomaly-text mb-3">Columns to Analyze</h3>
          <div className="flex flex-wrap gap-2">
            {numericColumns.map((col) => (
              <button key={col}
                onClick={() => {
                  const cols = config.columns.includes(col) ? config.columns.filter((c) => c !== col) : [...config.columns, col];
                  updateConfig({ columns: cols });
                }}
                className={`px-3 py-1 rounded-full text-xs font-mono transition-all border ${
                  config.columns.includes(col) ? "bg-anomaly-accent/20 border-anomaly-accent text-anomaly-accent" : "bg-anomaly-surface border-anomaly-border text-anomaly-muted hover:border-anomaly-accent/50"
                }`}>
                {col}
              </button>
            ))}
          </div>
        </div>
      )}

      {config.algorithm === "zscore" && (
        <div>
          <h3 className="text-sm font-display font-semibold text-anomaly-text mb-3">Z-Score Parameters</h3>
          <label className={`${labelClass} mb-1.5 block`}>Threshold (σ): {config.zScoreThreshold}</label>
          <input type="range" min={1} max={5} step={0.5} value={config.zScoreThreshold}
            onChange={(e) => updateConfig({ zScoreThreshold: Number(e.target.value) })} className="w-full" />
          <div className="flex justify-between text-xs text-anomaly-muted mt-1"><span>1 (very sensitive)</span><span>5 (less sensitive)</span></div>
        </div>
      )}

      {config.algorithm === "iqr" && (
        <div>
          <h3 className="text-sm font-display font-semibold text-anomaly-text mb-3">IQR Parameters</h3>
          <label className={`${labelClass} mb-1.5 block`}>IQR Multiplier: {config.iqrMultiplier}</label>
          <input type="range" min={1} max={3} step={0.25} value={config.iqrMultiplier}
            onChange={(e) => updateConfig({ iqrMultiplier: Number(e.target.value) })} className="w-full" />
          <div className="flex justify-between text-xs text-anomaly-muted mt-1"><span>1.0 (strict)</span><span>3.0 (loose)</span></div>
        </div>
      )}

      {config.algorithm === "isolation_forest" && (
        <div className="space-y-4">
          <h3 className="text-sm font-display font-semibold text-anomaly-text">Isolation Forest Parameters</h3>
          <div>
            <label className={`${labelClass} mb-1.5 block`}>Contamination: {(config.isolationContamination! * 100).toFixed(0)}%</label>
            <input type="range" min={0.01} max={0.3} step={0.01} value={config.isolationContamination}
              onChange={(e) => updateConfig({ isolationContamination: Number(e.target.value) })} className="w-full" />
          </div>
          <div>
            <label className={`${labelClass} mb-1.5 block`}>Number of Trees: {config.isolationTrees}</label>
            <input type="range" min={10} max={200} step={10} value={config.isolationTrees}
              onChange={(e) => updateConfig({ isolationTrees: Number(e.target.value) })} className="w-full" />
          </div>
        </div>
      )}

      {config.algorithm === "dbscan" && (
        <div className="space-y-4">
          <h3 className="text-sm font-display font-semibold text-anomaly-text">DBSCAN Parameters</h3>
          <div>
            <label className={`${labelClass} mb-1.5 block`}>Epsilon (ε): {config.dbscanEps}</label>
            <input type="range" min={0.05} max={2} step={0.05} value={config.dbscanEps}
              onChange={(e) => updateConfig({ dbscanEps: Number(e.target.value) })} className="w-full" />
          </div>
          <div>
            <label className={`${labelClass} mb-1.5 block`}>Min Points: {config.dbscanMinPoints}</label>
            <input type="range" min={2} max={20} step={1} value={config.dbscanMinPoints}
              onChange={(e) => updateConfig({ dbscanMinPoints: Number(e.target.value) })} className="w-full" />
          </div>
        </div>
      )}

      {config.algorithm === "claude_ai" && (
        <div>
          <h3 className="text-sm font-display font-semibold text-anomaly-text mb-3">Claude AI Context</h3>
          <label className={`${labelClass} mb-1.5 block`}>Domain / Context Description</label>
          <textarea className={`${inputClass} h-24 resize-none`}
            placeholder="e.g. This is e-commerce sales data containing daily order count and revenue. High return rates and low AOV should be considered anomalous."
            value={config.claudeContext} onChange={(e) => updateConfig({ claudeContext: e.target.value })} />
          <p className="text-xs text-anomaly-muted mt-1">The more detailed the context, the better Claude&apos;s analysis</p>
        </div>
      )}
    </div>
  );
}
