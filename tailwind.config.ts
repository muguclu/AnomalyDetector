import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        anomaly: {
          bg: "#0a0a0f", surface: "#111118", card: "#16161f", border: "#1e1e2e",
          accent: "#6c63ff", "accent-dim": "#4a44b3", danger: "#ff4757",
          "danger-dim": "#c0392b", warning: "#ffa502", success: "#2ed573",
          text: "#e8e8f0", muted: "#6b6b80",
        },
        "anomaly-bg": "#0d0d14",
        "anomaly-card": "#16161f",
        "anomaly-surface": "#1e1e2e",
        "anomaly-border": "#252535",
        "anomaly-text": "#e8e8f0",
        "anomaly-muted": "#6b6b80",
        "anomaly-accent": "#6c63ff",
        "anomaly-accent-dim": "#5b54ee",
        "anomaly-danger": "#ff4757",
        "anomaly-success": "#2ed573",
        "anomaly-warning": "#ffa502",
      },
      fontFamily: {
        mono: ["'JetBrains Mono'", "monospace"],
        display: ["'Space Grotesk'", "sans-serif"],
        body: ["'DM Sans'", "sans-serif"],
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "fade-in": "fadeIn 0.3s ease-out",
        "slide-up": "slideUp 0.4s ease-out",
      },
      keyframes: {
        fadeIn: { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        slideUp: { "0%": { opacity: "0", transform: "translateY(16px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
      },
    },
  },
  plugins: [],
};
export default config;