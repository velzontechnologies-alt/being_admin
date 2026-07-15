/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#FAF8F5',
          100: '#F0EAE1',
          200: '#E5E0DB',
          300: '#D8CEB9',
          400: '#C5A880',
          500: '#B3925B',
          600: '#A3845A',
          700: '#8C6D45',
          800: '#73552F',
          900: '#5E4321',
          950: '#3D2912',
        },
      },
    },
  },
  plugins: [],
}
