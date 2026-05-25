import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#F8F5EE",
        "bg-2": "#F2EAD8",
        paper: "#FFFFFF",
        line: "#EDE5D2",
        "line-2": "#DCD0B4",
        ink: { DEFAULT: "#1F1A14", 2: "#6E6457", 3: "#A6997F" },
        accent: { DEFAULT: "#E66B3D", 2: "#F2BC8E", bg: "#FCE7D4" },
        sage: { DEFAULT: "#BFC7A0", 2: "#8C9963", bg: "#ECEFDC" },
        warn: { DEFAULT: "#D38D1B", bg: "#FBEFD0" },
        danger: { DEFAULT: "#A14525", bg: "#F8D8CE" },
      },
      fontFamily: {
        ui: ["Rubik", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
        display: ["Rubik", "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', '"SF Mono"', "ui-monospace", "monospace"],
      },
      fontSize: {
        "display-lg": ["36px", { lineHeight: "1.05", letterSpacing: "-0.025em", fontWeight: "600" }],
        "display-md": ["28px", { lineHeight: "1.1", letterSpacing: "-0.025em", fontWeight: "600" }],
        "display-sm": ["22px", { lineHeight: "1.15", letterSpacing: "-0.02em", fontWeight: "600" }],
        heading: ["17px", { lineHeight: "1.3", letterSpacing: "-0.015em", fontWeight: "700" }],
        "body-lg": ["16px", { lineHeight: "1.5", fontWeight: "400" }],
        body: ["14px", { lineHeight: "1.5", fontWeight: "400" }],
        label: ["14px", { lineHeight: "1.4", fontWeight: "500" }],
        small: ["12px", { lineHeight: "1.45", fontWeight: "500" }],
        tiny: ["11px", { lineHeight: "1.4", fontWeight: "500" }],
        eyebrow: ["11px", { lineHeight: "1", letterSpacing: "0.08em", fontWeight: "600" }],
      },
      borderRadius: {
        xs: "6px",
        sm: "10px",
        DEFAULT: "14px",
        md: "14px",
        lg: "18px",
        xl: "22px",
        "2xl": "24px",
        "3xl": "28px",
      },
      boxShadow: {
        sm: "0 1px 0 rgba(31,26,20,.04), 0 4px 12px rgba(31,26,20,.04)",
        DEFAULT: "0 1px 0 rgba(31,26,20,.04), 0 6px 24px rgba(31,26,20,.06)",
        lg: "0 1px 0 rgba(31,26,20,.04), 0 16px 40px rgba(31,26,20,.10)",
        cta: "0 1px 0 rgba(0,0,0,.06), 0 10px 24px rgba(230,107,61,.32)",
        sheet: "0 -10px 40px rgba(0,0,0,.18)",
      },
      transitionDuration: {
        fast: "120ms",
        base: "200ms",
        slow: "300ms",
        delib: "450ms",
      },
      transitionTimingFunction: {
        out: "cubic-bezier(0.22, 1, 0.36, 1)",
        "in-out": "cubic-bezier(0.4, 0, 0.2, 1)",
        spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
      },
      zIndex: {
        sticky: "10",
        sheet: "50",
        toast: "100",
        overlay: "200",
      },
      minHeight: {
        touch: "44px",
        cta: "56px",
      },
      minWidth: {
        touch: "44px",
      },
    },
  },
  plugins: [],
};

export default config;
