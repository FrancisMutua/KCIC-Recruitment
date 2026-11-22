/** @type {import('tailwindcss').Config} */
// Every brand colour below is sampled from src/assets/images/logo.png.
// Scales are tints/shades of those exact logo colours (base value marked "logo").
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          // "Garissa University" wordmark green. 500 is the logo value (3.6:1 on white:
          // fills, icons, large text). Use 600+ for small text and white-on-green buttons.
          green: {
            DEFAULT: "#339966",
            50: "#eff7f3",
            100: "#daede3",
            200: "#b1d8c5",
            300: "#85c2a3",
            400: "#58ab82",
            500: "#339966", // logo
            600: "#297a52",
            700: "#205f3f",
            800: "#17452e",
            900: "#0e2b1d",
          },
          // "Oasis of Innovation" tagline brown (6.8:1 on white).
          brown: {
            DEFAULT: "#6f573d",
            50: "#f5f3f1",
            100: "#e8e4e0",
            200: "#cec6bd",
            300: "#b4a89a",
            400: "#9a8977",
            500: "#836f58",
            600: "#6f573d", // logo
            700: "#594631",
            800: "#433425",
            900: "#2c2318",
          },
          // Seal: lime ring, pale gold centre, tree green, camel brown, black outline.
          lime: { DEFAULT: "#c8e03a", 50: "#f7fae1", 100: "#ecf4ba" },
          gold: { DEFAULT: "#ebe899", 50: "#f7f6d6" },
          forest: "#35480b",
          camel: "#927237",
        },
      },
    },
  },
  plugins: [],
};
