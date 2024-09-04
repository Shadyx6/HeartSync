/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [".//**/*.{ejs,html,js}"],
  theme: {
    extend: {
      animation: {
        popUp: 'popUp 2s linear',
      },
      keyframes: {
        popUp: {
          '0%': { top:' 45%' , opacity: '0' },
          '20%': { top: '50%', opacity: '1' },
          '90%' : { opacity: '1'},
          '100%': { opacity: '0' },
        },
      },
    },
  },
  plugins: [],
}