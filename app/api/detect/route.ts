import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { zScoreDetection, iqrDetection, computeColumnStats } from "@/lib/algorithms/statistical";
import { isolationForestDetection } from "@/lib/algorithms/isolationForest";
import { dbscanDetection } from "@/lib/algorithms/dbscan";
import { DataRow, DetectionConfig, DetectionResult, AnomalyResult } from "@/types";

const anthropic = new Anthropic();

async function claudeAIDetection(data: DataRow[], config: DetectionConfig): Promise<{ results: AnomalyResult[]; summary: string }> {
  const { columns, claudeContext = "" } = config;
  const sampleSize = Math.min(200, data.length);
  const preview = data.slice(0, sampleSize).map((row, i) => ({
    index: i, ...columns.reduce((obj, col) => ({ ...obj, [col]: row[col] }), {}),
  }));
  const prompt = `You are an expert data analyst specializing in anomaly detection.
${claudeContext ? `\nDomain context: ${claudeContext}` : ""}
Analyze this dataset (${data.length} total rows, showing first ${sampleSize}):
Columns: ${columns.join(", ")}
Data: ${JSON.stringify(preview, null, 2)}

Identify anomalies and explain why each is unusual. Respond ONLY with valid JSON (no markdown):
{
  "anomalies": [{ "index": <row index>, "reason": "<why anomalous>", "score": <0.0-1.0> }],
  "summary": "<2-3 sentence summary of anomaly patterns>"
}`;

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4000,
    messages: [{ role: "user", content: prompt }],
  });
  const text = response.content.filter((c) => c.type === "text").map((c) => (c as { type: "text"; text: string }).text).join("");
  const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
  const anomalyMap = new Map<number, { reason: string; score: number }>();
  for (const a of parsed.anomalies) anomalyMap.set(a.index, { reason: a.reason, score: a.score });
  return {
    results: data.map((row, rowIndex) => {
      const found = anomalyMap.get(rowIndex);
      return { rowIndex, row, isAnomaly: !!found, score: found?.score ?? 0, reason: found?.reason, algorithm: "claude_ai" as const };
    }),
    summary: parsed.summary,
  };
}

export async function POST(req: NextRequest) {
  try {
    const { data, config }: { data: DataRow[]; config: DetectionConfig } = await req.json();
    if (!data?.length) return NextResponse.json({ error: "No data provided" }, { status: 400 });
    if (!config.columns?.length) return NextResponse.json({ error: "No columns selected" }, { status: 400 });

    const startTime = Date.now();
    let anomalies: AnomalyResult[] = [];
    let claudeSummary: string | undefined;

    switch (config.algorithm) {
      case "zscore": anomalies = zScoreDetection(data, config); break;
      case "iqr": anomalies = iqrDetection(data, config); break;
      case "isolation_forest": anomalies = isolationForestDetection(data, config); break;
      case "dbscan": anomalies = dbscanDetection(data, config); break;
      case "claude_ai": {
        const { results, summary } = await claudeAIDetection(data, config);
        anomalies = results; claudeSummary = summary; break;
      }
      default: return NextResponse.json({ error: "Unknown algorithm" }, { status: 400 });
    }

    const anomalyList = anomalies.filter((a) => a.isAnomaly);
    const columnStats = computeColumnStats(data, config.columns);
    for (const stat of columnStats) {
      stat.anomalyCount = anomalyList.filter((a) => a.affectedColumns?.includes(stat.name)).length;
    }

    const result: DetectionResult = {
      algorithm: config.algorithm, totalRows: data.length,
      anomalyCount: anomalyList.length, anomalyRate: anomalyList.length / data.length,
      anomalies, executionTimeMs: Date.now() - startTime, columnStats, claudeSummary,
    };
    return NextResponse.json(result);
  } catch (error) {
    console.error("Detection error:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Detection failed" }, { status: 500 });
  }
}
