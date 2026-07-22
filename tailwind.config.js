/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Calm, ADHD-friendly palette
        background: "#FAF9F7",
        surface: "#FFFFFF",
        "surface-muted": "#F5F3F0",

        // Primary greens — calm, reassuring
        primary: "#5B8C5A",
        "primary-light": "#E8F5E8",
        "primary-dark": "#3D6B3C",

        // Warm accent — gentle yellow/amber
        accent: "#F0A04B",
        "accent-light": "#FFF3E5",

        // Bill status colors — soft, not alarming
        "status-paid": "#7CB77C",
        "status-due": "#F0A04B",
        "status-overdue": "#E07A6E",
        "status-upcoming": "#8CB8D8",

        // Text colors — warm, high contrast
        "text-primary": "#2C2C2C",
        "text-secondary": "#6B6B6B",
        "text-muted": "#A0A0A0",
        "text-inverse": "#FFFFFF",

        // Borders and dividers
        border: "#E8E5E0",
        "border-light": "#F0EDE8",
      },
      borderRadius: {
        DEFAULT: "16px",
        sm: "12px",
        lg: "20px",
        xl: "24px",
      },
      fontSize: {
        xs: ["12px", { lineHeight: "16px" }],
        sm: ["14px", { lineHeight: "20px" }],
        base: ["16px", { lineHeight: "24px" }],
        lg: ["18px", { lineHeight: "26px" }],
        xl: ["20px", { lineHeight: "28px" }],
        "2xl": ["24px", { lineHeight: "32px" }],
        "3xl": ["30px", { lineHeight: "38px" }],
      },
      spacing: {
        touch: "48px",
      },
      minHeight: {
        touch: "48px",
      },
      minWidth: {
        touch: "48px",
      },
    },
  },
  plugins: [],
};
