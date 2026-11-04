/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          // Primary: Garissa University green (gau.ac.ke)
          green: {
            DEFAULT: "#008000",
            50:  "#e6f4e6",
            100: "#c2e3c2",
            200: "#8fcc8f",
            300: "#5cb35c",
            400: "#2e9a2e",
            500: "#008000",
            600: "#006b00",
            700: "#005200",
            800: "#003d00",
            900: "#002400",
          },
          // Accent: Garissa University crimson (gau.ac.ke)
          red: {
            DEFAULT: "#ae152d",
            50:  "#fbe9ec",
            100: "#f5c9d0",
            200: "#eb98a6",
            300: "#df6478",
            400: "#c9344b",
            500: "#ae152d",
            600: "#8f1125",
            700: "#700d1d",
            800: "#510a15",
            900: "#32060d",
          },
        },
      },
    },
  },
  plugins: [],
};
