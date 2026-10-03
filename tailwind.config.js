export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bsi: {
           50: '#f4fbf6', 100: '#dff0e4', 200: '#bfe3cc', 300: '#86ecb0',
           400: '#4ed58f', 500: '#27c06d', 600: '#1a9e57', 700: '#177c48',
           800: '#16623c', 900: '#135033', 950: '#081a13'
         },
         gold: { 400: '#fbbf24', 500: '#f59e0b', 600: '#d97706' }
      }
    }
  },
  plugins: []
}
