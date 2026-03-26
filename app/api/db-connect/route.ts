import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";
import { DatabaseConfig } from "@/types";

export async function POST(req: NextRequest) {
  const config: DatabaseConfig = await req.json();
  const pool = new Pool({
    host: config.host, port: config.port, database: config.database,
    user: config.user, password: config.password,
    ssl: config.ssl ? { rejectUnauthorized: false } : false,
    connectionTimeoutMillis: 10000,
  });
  try {
    const client = await pool.connect();
    const result = await client.query(config.query);
    client.release();
    await pool.end();
    const data = result.rows;
    if (!data.length) return NextResponse.json({ error: "Query returned no rows" }, { status: 400 });
    const columns = Object.keys(data[0]);
    const numericColumns = columns.filter((col) =>
      data.slice(0, 20).map((r: Record<string, unknown>) => r[col])
        .some((v) => typeof v === "number" || (!isNaN(Number(v)) && v !== null && v !== ""))
    );
    return NextResponse.json({ data, columns, numericColumns, rowCount: data.length });
  } catch (error) {
    await pool.end().catch(() => {});
    return NextResponse.json({ error: error instanceof Error ? error.message : "DB connection failed" }, { status: 500 });
  }
}
