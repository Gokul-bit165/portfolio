/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f4f5f7',
          500: '#7C5CFF',
          600: '#6842FF',
          accent: '#FF6B35',
          mint: '#00E5A0',
          dark: '#0B0E14'
        }
      }
    },
  },
  plugins: [],
}
