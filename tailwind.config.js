/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        'light-gradient': 'linear-gradient(to top right, #f5f7fb, #dde4ec)', // Example gradient
      }
    },
  },
  plugins: [],
}

