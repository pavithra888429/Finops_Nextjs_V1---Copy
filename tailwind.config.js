/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Poppins", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        dark: {
          bg: "#070a11",
          surface: "#0b0f19",
          card: "#0d1322",
          cardHover: "#11182c",
          border: "#1a2438",
          borderHover: "#283754",
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
    },
  },
  plugins: [],
};
