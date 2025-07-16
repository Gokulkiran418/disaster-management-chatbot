/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: 'var(--color-primary, rgba(241, 250, 238, 0.8))', // Default to your --primary-bg
        accent: 'var(--color-accent, #457b9d)',                 // Default to medium blue
        'accent-light': 'var(--color-accent-light, #a8dadc)',   // Default to light blue
        text: 'var(--color-text, #1d3557)',                     // Default to dark blue
      },
      boxShadow: {
        glow: '0 0 15px rgba(96, 165, 250, 0.5)', // for hover glows
      },
      fontFamily: {
        sans: ['Roboto', 'sans-serif'], // global font
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};