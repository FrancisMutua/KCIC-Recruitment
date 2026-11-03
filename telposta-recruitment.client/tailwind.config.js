/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          // Primary: TelPosta logo navy
          navy: {
            DEFAULT: "#2e3175",
            50:  "#eeeef8",
            100: "#d5d6ee",
            200: "#abaddd",
            300: "#8083cb",
            400: "#5659b9",
            500: "#2e3175",
            600: "#252760",
            700: "#1c1e4a",
            800: "#131434",
            900: "#0a0a1d",
          },
          // Secondary: TelPosta logo green. Use 600+ for text and for backgrounds
          // behind white text; DEFAULT does not meet AA contrast at body sizes.
          green: {
            DEFAULT: "#369750",
            50:  "#ebf7ee",
            100: "#cdead5",
            200: "#a0d7af",
            300: "#6fc286",
            400: "#4aad65",
            500: "#369750",
            600: "#2b7a40",
            700: "#215d31",
            800: "#174022",
            900: "#0c2312",
          },
        },
      },
    },
  },
  plugins: [],
};
