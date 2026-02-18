/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          // Primary: hsl(224, 52%, 23%) ≈ #1c2d5e — deep navy blue
          navy: {
            DEFAULT: "#1c2d5e",
            50:  "#eef0f8",
            100: "#d4d9ee",
            200: "#a9b3dd",
            300: "#7e8dcc",
            400: "#5367bb",
            500: "#1c2d5e",
            600: "#16244c",
            700: "#111b3a",
            800: "#0b1228",
            900: "#060916",
          },
          // Secondary: hsl(50, 65%, 45%) ≈ #bfa529 — golden amber
          gold: {
            DEFAULT: "#bfa529",
            50:  "#fdf7e3",
            100: "#f9ecb8",
            200: "#f2d870",
            300: "#e8c42a",
            400: "#d4ae1f",
            500: "#bfa529",
            600: "#9a7d19",
            700: "#766013",
            800: "#52430d",
            900: "#2e2607",
          },
        },
      },
    },
  },
  plugins: [],
};
