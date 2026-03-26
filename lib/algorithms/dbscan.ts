import { DataRow, DetectionConfig, AnomalyResult } from "@/types";

function euclideanDistance(a: number[], b: number[]): number {
  return Math.sqrt(a.reduce((sum, val, i) => sum + Math.pow(val - b[i], 2), 0));
}

function normalize(matrix: number[][]): number[][] {
  if (!matrix.length) return [];
  const numCols = matrix[0].length;
  const mins = Array(numCols).fill(Infinity);
  const maxs = Array(numCols).fill(-Infinity);
  for (const row of matrix) {
    for (let j = 0; j < numCols; j++) {
      mins[j] = Math.min(mins[j], row[j]);
      maxs[j] = Math.max(maxs[j], row[j]);
    }
  }
  return matrix.map((row) =>
    row.map((val, j) => { const range = maxs[j] - mins[j]; return range === 0 ? 0 : (val - mins[j]) / range; })
  );
}

export function dbscanDetection(data: DataRow[], config: DetectionConfig): AnomalyResult[] {
  const { columns, dbscanEps = 0.5, dbscanMinPoints = 5 } = config;
  const matrix: number[][] = data.map((row) =>
    columns.map((col) => { const v = Number(row[col]); return isNaN(v) ? 0 : v; })
  );
  const normalized = normalize(matrix);
  const n = normalized.length;
  const labels: number[] = new Array(n).fill(-2);
  let clusterId = 0;

  function rangeQuery(idx: number): number[] {
    return Array.from({ length: n }, (_, i) => i)
      .filter((i) => euclideanDistance(normalized[idx], normalized[i]) <= dbscanEps);
  }
  function expandCluster(idx: number, neighbors: number[], cId: number) {
    labels[idx] = cId;
    let i = 0;
    while (i < neighbors.length) {
      const nb = neighbors[i];
      if (labels[nb] === -2) {
        labels[nb] = cId;
        const newNbs = rangeQuery(nb);
        if (newNbs.length >= dbscanMinPoints) neighbors.push(...newNbs.filter((n) => !neighbors.includes(n)));
      } else if (labels[nb] === -1) { labels[nb] = cId; }
      i++;
    }
  }

  for (let i = 0; i < n; i++) {
    if (labels[i] !== -2) continue;
    const neighbors = rangeQuery(i);
    if (neighbors.length < dbscanMinPoints) { labels[i] = -1; }
    else { expandCluster(i, neighbors, clusterId); clusterId++; }
  }

  const clusterCenters: Record<number, number[]> = {};
  for (let cId = 0; cId < clusterId; cId++) {
    const members = normalized.filter((_, idx) => labels[idx] === cId);
    if (!members.length) continue;
    clusterCenters[cId] = members[0].map((_, j) =>
      members.reduce((sum, m) => sum + m[j], 0) / members.length
    );
  }

  return data.map((row, rowIndex) => {
    const label = labels[rowIndex];
    const isAnomaly = label === -1;
    let score = 0;
    if (isAnomaly) { score = 1.0; }
    else if (clusterCenters[label]) {
      score = Math.min(euclideanDistance(normalized[rowIndex], clusterCenters[label]) / dbscanEps, 1) * 0.5;
    }
    return { rowIndex, row, isAnomaly, score, algorithm: "dbscan" as const };
  });
}
