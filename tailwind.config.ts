import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Light theme — white primary, navy-blue accent
        "cc-bg": "#f4f6fb",
        "cc-bg-alt": "#eaeef6",
        "cc-surface": "#ffffff",
        "cc-surface-light": "#f5f7fb",
        "cc-border": "#e6eaf2",
        "cc-border-glow": "rgba(37, 84, 235, 0.25)",
        "cc-navy": "#1e3a8a",
        "cc-cyan": "#2f54eb",
        "cc-cyan-dim": "#1d39c4",
        "cc-teal": "#4361ee",
        "cc-green": "#16a34a",
        "cc-amber": "#d97706",
        "cc-red": "#ef4444",
        "cc-purple": "#6366f1",
        "cc-text": "#1e293b",
        "cc-text-dim": "#64748b",
        "cc-text-muted": "#94a3b8",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      animation: {
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "fade-in": "fade-in 0.5s ease-out forwards",
        "slide-up": "slide-up 0.4s ease-out forwards",
        "slide-in-left": "slide-in-left 0.3s ease-out forwards",
        "status-pulse": "status-pulse 2s ease-in-out infinite",
        "glow-border": "glow-border 3s ease-in-out infinite",
        "float": "float 6s ease-in-out infinite",
        "shimmer": "shimmer 2s linear infinite",
        "ripple": "ripple 0.6s ease-out",
        "scan-line": "scan-line 8s linear infinite",
      },
      keyframes: {
        "pulse-glow": {
          "0%, 100%": {
            boxShadow: "0 0 5px rgba(0, 212, 255, 0.2), 0 0 20px rgba(0, 212, 255, 0.1)",
          },
          "50%": {
            boxShadow: "0 0 20px rgba(0, 212, 255, 0.4), 0 0 40px rgba(0, 212, 255, 0.2)",
          },
        },
        "fade-in": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in-left": {
          from: { opacity: "0", transform: "translateX(-20px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        "status-pulse": {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.7", transform: "scale(1.2)" },
        },
        "glow-border": {
          "0%, 100%": {
            borderColor: "rgba(0, 212, 255, 0.2)",
          },
          "50%": {
            borderColor: "rgba(0, 212, 255, 0.5)",
          },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        ripple: {
          "0%": { transform: "scale(0)", opacity: "0.5" },
          "100%": { transform: "scale(4)", opacity: "0" },
        },
        "scan-line": {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100vh)" },
        },
      },
      backdropBlur: {
        xs: "2px",
      },
      boxShadow: {
        "glow-cyan": "0 6px 20px rgba(37, 84, 235, 0.12)",
        "glow-cyan-lg": "0 10px 30px rgba(37, 84, 235, 0.18)",
        "glow-green": "0 6px 20px rgba(22, 163, 74, 0.12)",
        "glow-red": "0 6px 20px rgba(239, 68, 68, 0.12)",
        "glow-amber": "0 6px 20px rgba(217, 119, 6, 0.12)",
        "soft": "0 4px 24px rgba(30, 41, 59, 0.06)",
        "inner-glow": "inset 0 1px 0 0 rgba(255, 255, 255, 0.6)",
      },
    },
  },
  plugins: [],
};

export default config;
