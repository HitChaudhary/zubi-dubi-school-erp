/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "background": "#f8f9ff",
        "surface": "#f8f9ff",
        "on-surface": "#0b1c30",
        "on-surface-variant": "#464555",
        "primary": "#3525cd",
        "primary-container": "#4f46e5",
        "secondary": "#006591",
        "tertiary": "#005338",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        headline: ["Plus Jakarta Sans", "sans-serif"],
      },
    },
  },
  plugins: [],
}