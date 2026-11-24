/** @type {import('tailwindcss').Config} */
// Brand colours are sampled from src/assets/images/logo.png (Kenya Climate Innovation Center).
// Each scale is tints/shades of the exact logo colour (base value marked "logo").
// Error and destructive states use Tailwind's red scale.
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          // KCIC leaf green. 400 is the logo value (2.0:1 on white): fills, accents and
          // decoration only. DEFAULT/600 (5.1:1) and darker are safe for text and white-on-green.
          green: {
            DEFAULT: "#547828",
            50: "#f6fbf0",
            100: "#eaf5dd",
            200: "#d3eab8",
            300: "#b4db85",
            400: "#8cc843", // logo
            500: "#6d9c34",
            600: "#547828",
            700: "#436020",
            800: "#324818",
            900: "#223010",
          },
          // KCIC wordmark grey. 400 is the logo value (3.0:1 on white). Use 500+ for text.
          grey: {
            DEFAULT: "#595a5c",
            50: "#f7f7f7",
            100: "#ececed",
            200: "#d7d7d9",
            300: "#babbbd",
            400: "#95969a", // logo
            500: "#747578",
            600: "#595a5c",
            700: "#48484a",
            800: "#363637",
            900: "#242425",
          },
        },
      },
    },
  },
  plugins: [],
};
