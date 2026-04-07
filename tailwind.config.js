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
        edge: {
          supports: '#22c55e',
          contrasts: '#ef4444',
          explains: '#a855f7',
          fulfills: '#f59e0b',
          references: '#6b7280',
          crossTopic: '#3b82f6',
        },
        verse: {
          main: '#6366f1',
          supporting: '#22c55e',
          contrast: '#ef4444',
          context: '#6b7280',
        },
      },
    },
  },
  plugins: [],
}
