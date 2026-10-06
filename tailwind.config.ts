import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Plus Jakarta Sans", "Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        dark: {
          bg: "#080d1a",
          surface: "#0d1527",
          card: "#0f172a",
          cardHover: "#131f38",
          border: "#1e293b",
          borderHover: "#334155",
          muted: "#64748b",
          text: "#94a3b8",
          heading: "#f8fafc",
        },
        brand: {
          blue: "#2563eb",
          blueHover: "#1d4ed8",
          emerald: "#10b981",
          amber: "#f59e0b",
          purple: "#8b5cf6",
        },
      },
      boxShadow: {
        '2xs': '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        'xs': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      },
    },
  },
  plugins: [],
};

export default config;
