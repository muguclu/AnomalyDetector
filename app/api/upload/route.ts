import { NextRequest, NextResponse } from "next/server";
import Papa from "papaparse";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file) return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    const text = await file.text();
    const result = Papa.parse<Record<string, unknown>>(text, { header: true, dynamicTyping: true, skipEmptyLines: true, transformHeader: (h) => h.trim() });
    const fatalErrors = result.errors.filter((e) => e.type === "Delimiter");
    if (fatalErrors.length > 0) return NextResponse.json({ error: "CSV parse error: " + fatalErrors[0].message }, { status: 400 });
    const data = result.data as Record<string, unknown>[];
    if (!data.length) return NextResponse.json({ error: "CSV file is empty" }, { status: 400 });
    const columns = Object.keys(data[0]);
    const numericColumns = columns.filter((col) =>
      data.slice(0, 20).map((r) => r[col]).some((v) => typeof v === "number" && !isNaN(v as number))
    );
    return NextResponse.json({ data, columns, numericColumns, rowCount: data.length, fileName: file.name });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Upload failed" }, { status: 500 });
  }
}
