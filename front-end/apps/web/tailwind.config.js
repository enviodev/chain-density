/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        orange: {
          50: "#fff7ed",
          100: "#ffedd5",
          200: "#fed7aa",
          300: "#fdba74",
          400: "#fb923c",
          500: "#f97316",
          600: "#ea580c",
          700: "#c2410c",
          800: "#9a3412",
          900: "#7c2d12",
        },
        blue: {
          50: "#f0f7ff",
          100: "#e0efff",
          200: "#bae0ff",
          300: "#7cc6ff",
          400: "#36a9ff",
          500: "#0090ff",
          600: "#0072e6",
          700: "#0059b3",
          800: "#004a99",
          900: "#003F80",
        },
        envio: {
          50: "#fff5f2",
          100: "#ffe6e0",
          200: "#ffc2b3",
          300: "#ff9e85",
          400: "#ff7a57",
          500: "#ff6347",
          600: "#e54c34",
          700: "#cc3d29",
          800: "#a32f1f",
          900: "#7a2115",
        },
      },
      animation: {
        blob: "blob 7s infinite",
        fadeIn: "fadeIn 1s ease-in-out",
        slideUp: "slideUp 0.6s ease-in-out",
        slideDown: "slideDown 0.6s ease-in-out",
      },
      keyframes: {
        blob: {
          "0%": {
            transform: "translate(0px, 0px) scale(1)",
          },
          "33%": {
            transform: "translate(30px, -50px) scale(1.1)",
          },
          "66%": {
            transform: "translate(-20px, 20px) scale(0.9)",
          },
          "100%": {
            transform: "translate(0px, 0px) scale(1)",
          },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        slideDown: {
          "0%": { transform: "translateY(-20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
    },
  },
  plugins: [
    function ({ addUtilities, addComponents, addBase, theme }) {
      addUtilities({
        ".animation-delay-2000": {
          "animation-delay": "2s",
        },
        ".animation-delay-3000": {
          "animation-delay": "3s",
        },
        ".animation-delay-4000": {
          "animation-delay": "4s",
        },
        ".animation-delay-5000": {
          "animation-delay": "5s",
        },
        ".animation-delay-300": {
          "animation-delay": "300ms",
        },
        ".animation-delay-500": {
          "animation-delay": "500ms",
        },
        ".animation-delay-700": {
          "animation-delay": "700ms",
        },
      });
    },
  ],
};
