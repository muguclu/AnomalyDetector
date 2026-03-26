# 🔍 AnomalyDetector

> AI-powered anomaly detection tool supporting multiple algorithms and data sources — built with Next.js 14 and Claude AI.

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38bdf8?style=flat-square&logo=tailwindcss)
![Claude AI](https://img.shields.io/badge/Claude-AI-orange?style=flat-square)

---

## Overview

AnomalyDetector is a full-stack web application that lets you load data from multiple sources and run anomaly detection using classical statistical algorithms or Claude AI. Each algorithm provides anomaly scores, affected columns, and visual results. Claude AI goes a step further by explaining *why* each data point is anomalous in plain English.

---

## Features

### Data Sources
- **CSV Upload** — Drag & drop any CSV file directly into the browser
- **PostgreSQL / Supabase** — Connect to a live database and run a custom SQL query
- **REST API** — Fetch data from any external API endpoint (GET or POST)
- **Manual Entry** — Paste raw JSON data directly into the app

### Algorithms
| Algorithm | Type | Best For |
|---|---|---|
| **Z-Score** | Statistical | Normally distributed data, fast results |
| **IQR** | Statistical | Skewed distributions, robust to outliers |
| **Isolation Forest** | ML (from scratch) | High-dimensional, multi-column anomalies |
| **DBSCAN** | Clustering (from scratch) | Spatial anomalies, irregular cluster shapes |
| **Claude AI** | LLM | Contextual analysis with natural language explanations |

### Results & Visualization
- Anomaly count, rate, and execution time at a glance
- Per-row anomaly scores with color-coded severity bars
- Affected column tags for statistical algorithms
- Claude AI natural language summary of detected patterns
- Scatter plot visualizing normal vs anomalous points
- Column statistics: mean, std, min, max, Q1, Q3
- Export anomalies as CSV with scores and explanations

---

## Tech Stack

- **Framework** — Next.js 14 (App Router)
- **Language** — TypeScript
- **Styling** — Tailwind CSS (custom dark theme)
- **State Management** — Zustand
- **Charts** — Recharts
- **AI** — Anthropic Claude API (`claude-sonnet-4-20250514`)
- **Database** — `pg` (PostgreSQL client)
- **CSV Parsing** — PapaParse
- **File Upload** — react-dropzone
- **Fonts** — Space Grotesk, JetBrains Mono

> Isolation Forest and DBSCAN are implemented from scratch in TypeScript — no external ML libraries.

---

## Project Structure

```
anomaly-detector/
├── app/
│   ├── api/
│   │   ├── upload/route.ts         # CSV parsing endpoint
│   │   ├── db-connect/route.ts     # PostgreSQL connection
│   │   ├── api-fetch/route.ts      # External REST API proxy
│   │   └── detect/route.ts         # All algorithms + Claude AI
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                    # 3-step wizard UI
├── components/
│   ├── forms/
│   │   ├── DataSourceSelector.tsx
│   │   ├── CSVUploadForm.tsx
│   │   ├── DatabaseForm.tsx
│   │   ├── OtherForms.tsx          # API + Manual entry
│   │   └── AlgorithmConfig.tsx
│   └── charts/
│       └── ResultsPanel.tsx        # Results, charts, export
├── lib/
│   ├── algorithms/
│   │   ├── statistical.ts          # Z-Score + IQR
│   │   ├── isolationForest.ts      # Isolation Forest (from scratch)
│   │   └── dbscan.ts               # DBSCAN (from scratch)
│   └── store.ts                    # Zustand global state
├── types/
│   └── index.ts
└── public/
    └── sample-data.csv             # Test dataset with planted anomalies
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- An [Anthropic API key](https://console.anthropic.com/) (for Claude AI algorithm)

### Installation

```bash
git clone https://github.com/muguclu/AnomalyDetector.git
cd AnomalyDetector
npm install
```

Create a `.env.local` file in the project root:

```env
ANTHROPIC_API_KEY=sk-ant-your-key-here
```

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Usage

The app follows a 3-step wizard:

**Step 1 — Load Data**
Select a data source (CSV, Database, API, or Manual), load your data, and preview the first rows.

**Step 2 — Configure Algorithm**
Choose an algorithm and tune its parameters using the sliders. Select which numeric columns to include in the analysis. For Claude AI, optionally provide domain context to improve accuracy.

**Step 3 — View Results**
Inspect the detected anomalies, review per-row scores and explanations, explore the scatter plot, and export results as CSV.

---

## Sample Dataset

`public/sample-data.csv` contains 41 rows of synthetic e-commerce sales data with 3 planted anomalies:

| Row | Anomaly |
|-----|---------|
| 6 | Revenue spike — 14,800 vs ~1,200 average |
| 18 | Revenue crash — 98 vs ~1,200 average |
| 37 | Abnormal unit price — 7,166 vs ~24 average |

---

## Algorithm Details

### Z-Score
Computes the number of standard deviations each value is from the column mean. Values beyond the threshold (default: 3σ) are flagged as anomalies.

### IQR (Interquartile Range)
Calculates Q1 and Q3 for each column. Values outside `[Q1 - k*IQR, Q3 + k*IQR]` (default k=1.5) are flagged. More robust than Z-Score for skewed distributions.

### Isolation Forest
Builds an ensemble of random binary trees by repeatedly splitting data on random features and values. Anomalies are isolated closer to the root (shorter path length) and receive higher anomaly scores. Implemented from scratch in TypeScript.

### DBSCAN
Groups data points into clusters based on density (epsilon neighborhood + minimum points). Points that don't belong to any cluster are labeled as noise — these are the anomalies. Features are normalized before clustering. Implemented from scratch in TypeScript.

### Claude AI
Sends a sample of the dataset to Claude with optional domain context. Claude identifies anomalies, explains the reasoning behind each one in natural language, and provides an overall summary of detected patterns. Limited to 200 rows per request.

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `ANTHROPIC_API_KEY` | Yes (for Claude AI) | Your Anthropic API key |

---
