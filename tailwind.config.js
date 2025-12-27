/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        neu: {
          base: "#E0E5EC",
          text: "#4A5568",
          accent: "#6D28D9",
        },
      },
      boxShadow: {
        neu: "9px 9px 16px rgb(163,177,198,0.6), -9px -9px 16px rgba(255,255,255, 0.5)",
        "neu-pressed": "inset 6px 6px 10px 0 rgba(163,177,198, 0.7), inset -6px -6px 10px 0 rgba(255,255,255, 0.8)",
      },
    },
  },
  // ADD THIS PLUGIN:
  plugins: [
    require('@tailwindcss/typography'),
  ],
};