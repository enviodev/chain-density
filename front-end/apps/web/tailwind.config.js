/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        orange: {
          500: "#ff5722",
          600: "#e64a19",
          700: "#d84315",
        },
      },
    },
  },
  plugins: [],
};
