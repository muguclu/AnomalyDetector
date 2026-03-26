import { DataRow, DetectionConfig, AnomalyResult } from "@/types";

interface IsolationNode {
  isLeaf: boolean; size?: number; splitFeature?: string;
  splitValue?: number; left?: IsolationNode; right?: IsolationNode;
}

function c(n: number): number {
  if (n <= 1) return 0;
  return 2 * (Math.log(n - 1) + 0.5772156649) - (2 * (n - 1)) / n;
}

function buildTree(data: number[][], featureNames: string[], currentDepth: number, maxDepth: number): IsolationNode {
  if (currentDepth >= maxDepth || data.length <= 1) return { isLeaf: true, size: data.length };
  const featureIdx = Math.floor(Math.random() * featureNames.length);
  const featureName = featureNames[featureIdx];
  const values = data.map((d) => d[featureIdx]);
  const min = Math.min(...values);
  const max = Math.max(...values);
  if (min === max) return { isLeaf: true, size: data.length };
  const splitValue = min + Math.random() * (max - min);
  return {
    isLeaf: false, splitFeature: featureName, splitValue,
    left: buildTree(data.filter((d) => d[featureIdx] < splitValue), featureNames, currentDepth + 1, maxDepth),
    right: buildTree(data.filter((d) => d[featureIdx] >= splitValue), featureNames, currentDepth + 1, maxDepth),
  };
}

function pathLength(point: number[], node: IsolationNode, featureNames: string[], depth: number): number {
  if (node.isLeaf) return depth + c(node.size ?? 1);
  const featureIdx = featureNames.indexOf(node.splitFeature!);
  if (point[featureIdx] < node.splitValue!) return pathLength(point, node.left!, featureNames, depth + 1);
  return pathLength(point, node.right!, featureNames, depth + 1);
}

export function isolationForestDetection(data: DataRow[], config: DetectionConfig): AnomalyResult[] {
  const { columns, isolationTrees = 100, isolationContamination = 0.1 } = config;
  const sampleSize = Math.min(256, data.length);
  const maxDepth = Math.ceil(Math.log2(sampleSize));
  const matrix: number[][] = data.map((row) =>
    columns.map((col) => { const v = Number(row[col]); return isNaN(v) ? 0 : v; })
  );
  const trees: IsolationNode[] = [];
  for (let t = 0; t < isolationTrees; t++) {
    const indices: number[] = [];
    while (indices.length < sampleSize) {
      const idx = Math.floor(Math.random() * data.length);
      if (!indices.includes(idx)) indices.push(idx);
    }
    trees.push(buildTree(indices.map((i) => matrix[i]), columns, 0, maxDepth));
  }
  const scores = matrix.map((point) => {
    const avgLen = trees.reduce((sum, tree) => sum + pathLength(point, tree, columns, 0), 0) / trees.length;
    return Math.pow(2, -avgLen / c(sampleSize));
  });
  const threshold = scores.slice().sort((a, b) => b - a)[Math.floor(isolationContamination * scores.length)];
  return data.map((row, rowIndex) => ({
    rowIndex, row, isAnomaly: scores[rowIndex] >= threshold,
    score: scores[rowIndex], algorithm: "isolation_forest" as const,
  }));
}
