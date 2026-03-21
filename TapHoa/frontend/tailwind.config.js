/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#9d0b0f",
        secondary: "#faa519",
        "text-brown": "#88694f",
      },
    },
  },
  plugins: [],
};
