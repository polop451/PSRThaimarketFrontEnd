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
          50: '#fef7ee',
          100: '#fdecd3',
          200: '#fad5a5',
          300: '#f7b76d',
          400: '#f38e33',
          500: '#f0700d',
          600: '#e15503',
          700: '#ba3f06',
          800: '#94320c',
          900: '#772b0d',
        },
      },
    },
  },
  plugins: [],
}
