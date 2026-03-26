"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useAppStore } from "@/lib/store";
import { Upload, FileText, X } from "lucide-react";

export function CSVUploadForm() {
  const { setData, setLoading, setError, isLoading } = useAppStore();
  const [fileName, setFileName] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;
    setFileName(file.name);
    setLoading(true);
    setError(null);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const json = await res.json();
      if (!res.ok) { setError(json.error ?? "Upload failed"); return; }
      setData(json.data, json.columns, json.numericColumns, json.fileName);
    } catch (e) {
      setError("Upload failed: " + (e instanceof Error ? e.message : "unknown"));
    } finally { setLoading(false); }
  }, [setData, setLoading, setError]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { "text/csv": [".csv"], "text/plain": [".txt"] }, maxFiles: 1, disabled: isLoading,
  });

  return (
    <div className="space-y-4">
      <div {...getRootProps()} className={`relative rounded-xl border-2 border-dashed p-10 text-center cursor-pointer transition-all duration-200 ${
        isDragActive ? "border-anomaly-accent bg-anomaly-accent/10" : "border-anomaly-border hover:border-anomaly-accent/60 hover:bg-anomaly-accent/5"
      } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}>
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-3">
          <div className={`p-3 rounded-full ${isDragActive ? "bg-anomaly-accent/20" : "bg-anomaly-surface"}`}>
            <Upload className={`w-6 h-6 ${isDragActive ? "text-anomaly-accent" : "text-anomaly-muted"}`} />
          </div>
          <div>
            <p className="text-sm font-medium text-anomaly-text">
              {isDragActive ? "Drop the file here..." : "Drag & drop a CSV file or click to browse"}
            </p>
            <p className="text-xs text-anomaly-muted mt-1">Only .csv files are supported</p>
          </div>
        </div>
      </div>
      {fileName && (
        <div className="flex items-center gap-3 p-3 rounded-lg bg-anomaly-surface border border-anomaly-border">
          <FileText className="w-4 h-4 text-anomaly-accent flex-shrink-0" />
          <span className="text-sm text-anomaly-text truncate flex-1">{fileName}</span>
          <button onClick={() => setFileName(null)} className="text-anomaly-muted hover:text-anomaly-danger transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      <div className="p-3 rounded-lg bg-anomaly-surface border border-anomaly-border">
        <p className="text-xs text-anomaly-muted font-mono">
          💡 For testing: you can use the <span className="text-anomaly-accent">public/sample-data.csv</span> file
        </p>
      </div>
    </div>
  );
}
