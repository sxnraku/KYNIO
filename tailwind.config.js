/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./hooks/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: "rgb(var(--color-background) / <alpha-value>)",
        surface: "rgb(var(--color-surface) / <alpha-value>)",
        "surface-raised": "rgb(var(--color-surface-raised) / <alpha-value>)",
        border: "rgb(var(--color-border) / <alpha-value>)",
        foreground: "rgb(var(--color-foreground) / <alpha-value>)",
        muted: "rgb(var(--color-muted) / <alpha-value>)",
        success: "#10B981",
        "success-dark": "rgb(var(--color-success-dark) / <alpha-value>)",
        xp: "#6366F1",
      },
      fontFamily: {
        body: ["HankenGrotesk_400Regular"],
        headline: ["HankenGrotesk_700Bold"],
        label: ["JetBrainsMono_500Medium"],
      },
    },
  },
  plugins: [],
};
