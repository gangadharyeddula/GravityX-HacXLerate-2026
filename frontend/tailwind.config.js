export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#F0FDFA',
          100: '#CCFBF1',
          500: '#5EEAD4',
          600: '#2DD4BF',
          700: '#0F766E',
        },
        ink: '#10131F',
        coral: '#FF6B5E',
        cream: '#F7F4ED',
        lavender: '#B8B2FF',
        slate: {
          500: '#667085',
          600: '#667085',
          700: '#394150',
          800: '#1f2937',
          900: '#10131F',
        },
      },
      fontFamily: {
        display: ['"Syne"', 'sans-serif'],
        body: ['"DM Sans"', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 10px 30px rgba(17, 24, 39, 0.08)',
      },
    },
  },
  plugins: [],
};
