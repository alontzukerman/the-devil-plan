/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./src/index.css", // Ensure index.css is scanned for @apply directives
  ],
  theme: {
    extend: {},
  },
  plugins: [],
} 