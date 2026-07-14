import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      colors: {
        background: "#F6FAFF",
        foreground: "#111827",
        primary: {
          DEFAULT: "#2563EB",
          foreground: "#ffffff",
          brand: "#2f66e9",
        },
        secondary: {
          DEFAULT: "#EFF6FF",
          foreground: "#1D4ED8",
        },
        muted: {
          DEFAULT: "#F1F5F9",
          foreground: "#6B7280",
        },
        border: "#E5E7EB",
        card: {
          DEFAULT: "#ffffff",
          foreground: "#111827",
        },
      },
      borderRadius: {
        lg: "0.75rem",
        xl: "1rem",
        "2xl": "1.25rem",
      },
    },
  },
  plugins: [],
};
export default config;
