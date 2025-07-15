/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: 'var(--color-primary)',       // e.g., background cards, inputs
        accent: 'var(--color-accent)',         // e.g., buttons
        'accent-light': 'var(--color-accent-light)',
        text: 'var(--color-text)',             // main text
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
