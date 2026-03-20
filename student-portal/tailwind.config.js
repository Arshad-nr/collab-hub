/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Lora', 'serif'],
        display: ['Playfair Display', 'serif'],
        cinzel: ['Cinzel', 'serif'],
      },
      colors: {
        royal: {
          50:  '#f4eef7',
          100: '#e3d5ea',
          400: '#af89c2',
          500: '#a074b7',
          600: '#8e61a5',
          700: '#73448b',
          800: '#4a235a',
          900: '#2b1d31', 
        },
        cream: {
          50: '#ffffff',
          100: '#fdfcf9',
          200: '#fdfaf5',
          300: '#eaddcf',
        },
        gold: {
          200: '#ebdfee', 
          300: '#eaddcf',
          400: '#e3c785',
          500: '#d4af37',
          600: '#c69940',
        }
      }
    },
  },
  plugins: [],
}
