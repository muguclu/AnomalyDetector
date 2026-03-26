import { NextRequest, NextResponse } from "next/server";
import { ApiConfig } from "@/types";

function getNestedValue(obj: unknown, path: string): unknown {
  if (!path) return obj;
  return path.split(".").reduce((acc: unknown, key: string) => {
    if (acc && typeof acc === "object") return (acc as Record<string, unknown>)[key];
    return undefined;
  }, obj);
}

export async function POST(req: NextRequest) {
  const config: ApiConfig = await req.json();
  try {
    const response = await fetch(config.url, {
      method: config.method,
      headers: { "Content-Type": "application/json", ...config.headers },
      body: config.method === "POST" && config.body ? config.body : undefined,
    });
    if (!response.ok) return NextResponse.json({ error: `API returned ${response.status}: ${response.statusText}` }, { status: 400 });
    const json = await response.json();
    const rawData = config.dataPath ? getNestedValue(json, config.dataPath) : json;
    if (!Array.isArray(rawData)) return NextResponse.json({ error: "Response data is not an array. Check your data path." }, { status: 400 });
    const data = rawData as Record<string, unknown>[];
    if (!data.length) return NextResponse.json({ error: "API returned empty array" }, { status: 400 });
    const columns = Object.keys(data[0]);
    const numericColumns = columns.filter((col) =>
      data.slice(0, 20).map((r) => r[col]).some((v) => typeof v === "number" || (!isNaN(Number(v)) && v !== null && v !== ""))
    );
    return NextResponse.json({ data, columns, numericColumns, rowCount: data.length });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "API fetch failed" }, { status: 500 });
  }
}
