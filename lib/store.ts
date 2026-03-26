import { create } from "zustand";
import { AppState, DataSource, DataRow, DetectionConfig, DetectionResult } from "@/types";

interface AppStore extends AppState {
  setDataSource: (source: DataSource | null) => void;
  setData: (data: DataRow[], columns: string[], numericColumns: string[], fileName?: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setDetectionResult: (result: DetectionResult | null) => void;
  updateConfig: (config: Partial<DetectionConfig>) => void;
  reset: () => void;
}

const defaultConfig: DetectionConfig = {
  algorithm: "zscore", columns: [], sensitivity: 0.5, zScoreThreshold: 3,
  iqrMultiplier: 1.5, isolationContamination: 0.1, isolationTrees: 100,
  dbscanEps: 0.5, dbscanMinPoints: 5, claudeContext: "",
};

export const useAppStore = create<AppStore>((set) => ({
  dataSource: null, rawData: [], columns: [], numericColumns: [],
  fileName: undefined, isLoading: false, error: null, detectionResult: null, config: defaultConfig,

  setDataSource: (source) => set({ dataSource: source, detectionResult: null, error: null }),
  setData: (data, columns, numericColumns, fileName) =>
    set({ rawData: data, columns, numericColumns, fileName, detectionResult: null, error: null,
      config: { ...defaultConfig, columns: numericColumns.slice(0, 5) } }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error, isLoading: false }),
  setDetectionResult: (result) => set({ detectionResult: result, isLoading: false }),
  updateConfig: (config) => set((state) => ({ config: { ...state.config, ...config } })),
  reset: () => set({ dataSource: null, rawData: [], columns: [], numericColumns: [],
    fileName: undefined, isLoading: false, error: null, detectionResult: null, config: defaultConfig }),
}));
