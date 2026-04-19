import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        black: "#000000",
        "dark-bg": "#050505",
        "dark-card": "#111111",
        "dark-border": "#1a1a1a",
        "neon-yellow": "#ffeb3b",
        "neon-yellow-dark": "#fdd835",
        "neon-yellow-light": "#ffff72",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        "neon-yellow":
          "0 0 20px rgba(255, 235, 59, 0.3), 0 0 40px rgba(255, 235, 59, 0.15)",
        "neon-yellow-lg":
          "0 0 40px rgba(255, 235, 59, 0.4), 0 0 80px rgba(255, 235, 59, 0.2)",
      },
      backgroundImage: {
        "gradient-neon":
          "radial-gradient(circle at top, rgba(255, 235, 59, 0.12), transparent 26%), linear-gradient(180deg, #020202 0%, #090909 100%)",
      },
      animation: {
        "pulse-neon": "pulse-neon 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        "pulse-neon": {
          "0%, 100%": {
            opacity: "1",
            boxShadow: "0 0 20px rgba(255, 235, 59, 0.3)",
          },
          "50%": {
            opacity: "0.8",
            boxShadow: "0 0 40px rgba(255, 235, 59, 0.5)",
          },
        },
      },
    },
  },
  plugins: [],
};

export default config;
