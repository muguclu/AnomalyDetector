export type DataSource = "csv" | "database" | "api" | "manual";
export type Algorithm = "zscore" | "iqr" | "isolation_forest" | "dbscan" | "claude_ai";

export interface DataRow { [key: string]: string | number | null; }

export interface AnomalyResult {
  rowIndex: number; row: DataRow; isAnomaly: boolean; score: number;
  reason?: string; affectedColumns?: string[]; algorithm: Algorithm;
}

export interface DetectionConfig {
  algorithm: Algorithm; columns: string[]; sensitivity: number;
  zScoreThreshold?: number; iqrMultiplier?: number;
  isolationContamination?: number; isolationTrees?: number;
  dbscanEps?: number; dbscanMinPoints?: number; claudeContext?: string;
}

export interface DetectionResult {
  algorithm: Algorithm; totalRows: number; anomalyCount: number; anomalyRate: number;
  anomalies: AnomalyResult[]; executionTimeMs: number;
  columnStats?: ColumnStat[]; claudeSummary?: string;
}

export interface ColumnStat {
  name: string; mean: number; std: number; min: number; max: number;
  q1: number; median: number; q3: number; anomalyCount: number;
}

export interface DatabaseConfig {
  host: string; port: number; database: string;
  user: string; password: string; ssl: boolean; query: string;
}

export interface ApiConfig {
  url: string; method: "GET" | "POST";
  headers?: Record<string, string>; body?: string; dataPath?: string;
}

export interface AppState {
  dataSource: DataSource | null; rawData: DataRow[]; columns: string[];
  numericColumns: string[]; fileName?: string; isLoading: boolean;
  error: string | null; detectionResult: DetectionResult | null; config: DetectionConfig;
}
