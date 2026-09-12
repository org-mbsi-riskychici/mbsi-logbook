export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bsi: {
          50: '#effef5', 100: '#d9fbe5', 200: '#b5f5cd', 300: '#86ecb0',
          400: '#50d98b', 500: '#27c06d', 600: '#1a9e57', 700: '#177c48',
          800: '#16623c', 900: '#135033', 950: '#072c1b'
        },
        gold: { 400: '#fbbf24', 500: '#f59e0b', 600: '#d97706' }
      }
    }
  },
  plugins: []
}
