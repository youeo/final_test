/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}", "./src/screens/*.{js,jsx,ts,tsx}", "./src/components/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ye: '#ffab00',
        gr: '#43794b',
      }
    },
  },
  plugins: [],
}

