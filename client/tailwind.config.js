/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./app/**/*.{js,ts,jsx,tsx}",   // Next.js App Router
      "./pages/**/*.{js,ts,jsx,tsx}", // Next.js Pages Router
      "./components/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        fontFamily: {
          sans: ['Inter', 'sans-serif']
        },
        keyframes: {
          'slide-gradient': {
            '0%': { backgroundPosition: '0% 50%' },
            '100%': { backgroundPosition: '200% 50%' },
          },
        },
        animation: {
          'gradient-move': 'slide-gradient 3s linear infinite',
        },
      },
    },
    plugins: [],
  }
