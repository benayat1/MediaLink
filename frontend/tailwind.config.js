/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        gray: {
          100: '#f5f5f5',
          200: '#e5e5e5',
          800: '#2d2d2d',
        },
        indigo: {
          100: '#e0e7ff',
          600: '#4f46e5',
          800: '#3730a3',
        },
        blue: {
          600: '#2563eb',
        },
      },
    },
  },
  plugins: [],
};
