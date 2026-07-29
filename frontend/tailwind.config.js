/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Duolingo Iconic Color System
        duo: {
          green: "#58CC02",
          greenDark: "#46A302",
          gold: "#FFC800",
          goldDark: "#E5B200",
          blue: "#1CB0F6",
          blueDark: "#1899D6",
          red: "#FF4B4B",
          redDark: "#EA2B2B",
          purple: "#CE82FF",
          purpleDark: "#B855FF",
          darkBg: "#131F24",
          darkCard: "#1B2A32",
        },
        // Emotional Companion Palette
        charcoal: {
          bg: "#0F121A",
          frame: "#161A26",
          card: "#1A1F2C",
          cardAlt: "#242B3D",
        },
        teal: {
          brand: "#58CC02", // Duolingo Green primary accent
          light: "#22D3EE",
          dark: "#0891B2",
        },
        fresh: {
          green: "#58CC02",
          emerald: "#10B981",
          mint: "#34D399",
        },
        warm: {
          orange: "#FF9600",
          amber: "#FFC800",
          gold: "#FFC800",
        },
        lime: {
          success: "#58CC02",
          bright: "#A3E635",
        },
        // Backward compatibility mappings
        fitx: {
          bg: "#0F121A",
          frame: "#161A26",
          card: "#1A1F2C",
          cardAlt: "#242B3D",
          textPrimary: "#F8FAFC",
          textSecondary: "#94A3B8",
          textMuted: "#64748B",
          sage: "#58CC02",
          teal: "#58CC02",
          lavender: "#CE82FF",
          solar: "#FFC800",
          solarAmber: "#FF9600",
          emerald: "#58CC02",
          emeraldRadiant: "#46A302",
          cyan: "#1CB0F6",
          cyanAurora: "#1899D6",
          coral: "#FF4B4B",
          coralFlame: "#EA2B2B",
          gold: "#FFC800",
          goldGlow: "#FFE875",
          amber: "#FFC800",
          bronze: "#B45309",
          goldLight: "#FEF3C7",
          neonGreen: "#58CC02",
          warningAmber: "#FFC800",
          alertRed: "#FF4B4B",
          iris: "#CE82FF",
          purpleGlow: "#C4B5FD",
          borderSubtle: "rgba(255, 255, 255, 0.1)",
          borderActive: "rgba(255, 255, 255, 0.2)",
        }
      },
      fontFamily: {
        sans: ['SF Pro Display', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'monospace'],
      },
      boxShadow: {
        'duo-3d': '0 4px 0 #46A302',
        'duo-gold-3d': '0 4px 0 #E5B200',
        'duo-blue-3d': '0 4px 0 #1899D6',
        'premium': '0 12px 32px -8px rgba(0, 0, 0, 0.4)',
        'teal-glow': '0 0 30px -5px rgba(88, 204, 2, 0.4)',
        'gold-glow': '0 0 30px -5px rgba(255, 200, 0, 0.4)',
        'orange-glow': '0 0 30px -5px rgba(255, 150, 0, 0.4)',
      }
    },
  },
  plugins: [],
}
