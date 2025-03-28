module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      height: {
        'screen-minus-header': 'calc(100vh - 64px)',
      },
      screens: {
        'xs': '480px',
      },
    },
  },
  plugins: [],
} 