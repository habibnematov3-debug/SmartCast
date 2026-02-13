import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#0f172a",
        skywash: "#f1f5f9",
        accent: "#0ea5e9"
      },
      boxShadow: {
        card: "0 12px 35px -18px rgba(15, 23, 42, 0.45)"
      }
    }
  },
  plugins: []
};

export default config;