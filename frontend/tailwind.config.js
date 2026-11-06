/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          bg: '#090d16',
          sidebar: '#060911',
          card: '#0f172a',
          cardHover: '#131e36',
          border: '#1e293b',
          accent: '#10b981',      // Emerald / lime
          accentBright: '#22c55e',// Bright lime
          cyan: '#06b6d4',        // Cyan / teal secondary
          purple: '#8b5cf6',
          yellow: '#f59e0b',
          red: '#f43f5e',
          textMuted: '#94a3b8',
          textLight: '#f8fafc'
        }
      }
    },
  },
  plugins: [],
}

