import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#1A6BFF",
          dark: "#1454CC",
          light: "#EBF1FF",
        },
        accent: {
          DEFAULT: "#FF6B35",
          dark: "#E55520",
          light: "#FFF0EB",
        },
        surface: {
          DEFAULT: "#FFFFFF",
          2: "#F2F5FA",
          3: "#E8EDF5",
        },
        "text-primary": "#0F1923",
        "text-muted": "#6B7A90",
        success: {
          DEFAULT: "#00C48C",
          light: "#E6FAF4",
        },
        warning: {
          DEFAULT: "#FFB547",
          light: "#FFF8E8",
        },
        error: {
          DEFAULT: "#FF4757",
          light: "#FFF0F1",
        },
      },
      fontFamily: {
        sans: ["var(--font-jakarta)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        sm: "6px",
        md: "12px",
        lg: "16px",
        xl: "20px",
        "2xl": "28px",
        "3xl": "36px",
      },
      boxShadow: {
        "primary-sm": "0 2px 8px rgba(26, 107, 255, 0.20)",
        "primary-md": "0 4px 16px rgba(26, 107, 255, 0.24)",
        "primary-lg": "0 8px 32px rgba(26, 107, 255, 0.28)",
        "accent-sm": "0 2px 8px rgba(255, 107, 53, 0.20)",
        "accent-md": "0 4px 16px rgba(255, 107, 53, 0.24)",
        "card": "0 2px 12px rgba(15, 25, 35, 0.08)",
        "card-hover": "0 8px 32px rgba(15, 25, 35, 0.12)",
        "sheet": "0 -8px 40px rgba(15, 25, 35, 0.14)",
        "nav": "0 -2px 16px rgba(15, 25, 35, 0.07)",
      },
      backgroundImage: {
        "shimmer": "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.6) 50%, transparent 100%)",
      },
      keyframes: {
        shimmer: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        "pulse-ring": {
          "0%": { transform: "scale(1)", opacity: "0.8" },
          "100%": { transform: "scale(2.5)", opacity: "0" },
        },
        "pin-bounce": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        shimmer: "shimmer 1.6s infinite",
        "pulse-ring": "pulse-ring 1.4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "pin-bounce": "pin-bounce 0.5s ease-in-out",
        "fade-up": "fade-up 0.3s ease-out",
      },
    },
  },
  plugins: [],
};
export default config;
