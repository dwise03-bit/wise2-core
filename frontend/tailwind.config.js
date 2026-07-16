/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: {
          base: "#0a0e1a",
          surface: "#0f1729",
          card: "#111a2e",
          elevated: "#1a2540",
        },
        neon: {
          cyan: "#00d4ff",
          blue: "#00a8ff",
          deep: "#0077b6",
        },
        led: {
          green: "#22c55e",
          yellow: "#eab308",
          orange: "#f97316",
          red: "#ef4444",
        },
      },
      fontFamily: {
        display: ["Orbitron", "Rajdhani", "sans-serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        neon: "0 0 12px rgba(0,212,255,0.55), 0 0 24px rgba(0,212,255,0.25)",
        "neon-sm": "0 0 6px rgba(0,212,255,0.6)",
      },
      keyframes: {
        pulseGlow: {
          "0%,100%": { boxShadow: "0 0 6px rgba(0,212,255,0.4)" },
          "50%": { boxShadow: "0 0 14px rgba(0,212,255,0.8)" },
        },
      },
      animation: {
        pulseGlow: "pulseGlow 2s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
