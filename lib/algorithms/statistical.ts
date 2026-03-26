import { DataRow, DetectionConfig, AnomalyResult, ColumnStat } from "@/types";

function mean(arr: number[]): number {
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}
function std(arr: number[], m?: number): number {
  const avg = m ?? mean(arr);
  return Math.sqrt(arr.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / arr.length);
}
function percentile(arr: number[], p: number): number {
  const sorted = [...arr].sort((a, b) => a - b);
  const idx = (p / 100) * (sorted.length - 1);
  const lower = Math.floor(idx);
  const upper = Math.ceil(idx);
  return sorted[lower] + (sorted[upper] - sorted[lower]) * (idx - lower);
}

export function computeColumnStats(data: DataRow[], columns: string[]): ColumnStat[] {
  return columns.map((col) => {
    const values = data.map((r) => Number(r[col])).filter((v) => !isNaN(v));
    const m = mean(values);
    return {
      name: col, mean: m, std: std(values, m),
      min: Math.min(...values), max: Math.max(...values),
      q1: percentile(values, 25), median: percentile(values, 50), q3: percentile(values, 75),
      anomalyCount: 0,
    };
  });
}

export function zScoreDetection(data: DataRow[], config: DetectionConfig): AnomalyResult[] {
  const threshold = config.zScoreThreshold ?? 3;
  const { columns } = config;
  const colStats: Record<string, { mean: number; std: number }> = {};
  for (const col of columns) {
    const vals = data.map((r) => Number(r[col])).filter((v) => !isNaN(v));
    const m = mean(vals);
    colStats[col] = { mean: m, std: std(vals, m) };
  }
  return data.map((row, rowIndex) => {
    const scores: number[] = [];
    const affected: string[] = [];
    for (const col of columns) {
      const val = Number(row[col]);
      if (isNaN(val)) continue;
      const { mean: m, std: s } = colStats[col];
      if (s === 0) continue;
      const z = Math.abs((val - m) / s);
      scores.push(z);
      if (z > threshold) affected.push(col);
    }
    const maxScore = scores.length ? Math.max(...scores) : 0;
    return { rowIndex, row, isAnomaly: affected.length > 0,
      score: Math.min(maxScore / (threshold * 2), 1), affectedColumns: affected, algorithm: "zscore" as const };
  });
}

export function iqrDetection(data: DataRow[], config: DetectionConfig): AnomalyResult[] {
  const multiplier = config.iqrMultiplier ?? 1.5;
  const { columns } = config;
  const bounds: Record<string, { lower: number; upper: number; iqr: number }> = {};
  for (const col of columns) {
    const vals = data.map((r) => Number(r[col])).filter((v) => !isNaN(v));
    const q1 = percentile(vals, 25);
    const q3 = percentile(vals, 75);
    const iqr = q3 - q1;
    bounds[col] = { lower: q1 - multiplier * iqr, upper: q3 + multiplier * iqr, iqr };
  }
  return data.map((row, rowIndex) => {
    const scores: number[] = [];
    const affected: string[] = [];
    for (const col of columns) {
      const val = Number(row[col]);
      if (isNaN(val)) continue;
      const { lower, upper, iqr } = bounds[col];
      if (val < lower || val > upper) {
        affected.push(col);
        const dist = Math.max(lower - val, val - upper, 0);
        scores.push(iqr > 0 ? dist / iqr : 1);
      }
    }
    const maxScore = scores.length ? Math.max(...scores) : 0;
    return { rowIndex, row, isAnomaly: affected.length > 0,
      score: Math.min(maxScore / (multiplier * 3), 1), affectedColumns: affected, algorithm: "iqr" as const };
  });
}
