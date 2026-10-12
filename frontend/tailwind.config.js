/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      boxShadow: {
        card: '0 10px 24px rgba(0,0,0,0.16)'
      }
    }
  },
  plugins: [require('@tailwindcss/forms')]
};
