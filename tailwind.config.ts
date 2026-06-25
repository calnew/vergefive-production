import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
    "./public/**/*.{html,js}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        brand: {
          navy: "#0E1A2B",
          blue: "#2563EB",
          ready: "#15803D",
          unlock: "#B45309",
          flagged: "#DC2626",
        },
        navy: {
          DEFAULT: "#0E1A2B",
          deep: "#07111F",
        },
        ready: {
          DEFAULT: "#15803D",
          surface: "#EAF7EF",
          border: "#BDE8CB",
        },
        unlock: {
          DEFAULT: "#B45309",
          surface: "#FFF4DE",
          border: "#F7D38A",
        },
        flagged: {
          DEFAULT: "#DC2626",
          surface: "#FEECEC",
          border: "#F7BBBB",
        },
        surface: {
          page: "#F1F4F9",
          card: "#FFFFFF",
          muted: "#F4F7FC",
          dark: "#0E1A2B",
        },
        vfBorder: {
          DEFAULT: "#E5EAF1",
          subtle: "#EAEEF4",
          strong: "#D6DEEA",
        },
        vfText: {
          strong: "#0F1B2D",
          body: "#5B6B82",
          muted: "#8A97AB",
          inverse: "#FFFFFF",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        soft: "0 12px 30px rgba(15, 23, 42, 0.08)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
