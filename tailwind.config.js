module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './index.html'
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        border: '#e5e5e5',
        muted: '#f5f5f5',
        'text-primary': '#000000',
        'text-secondary': '#666666',
        'text-muted': '#999999',
      }
    }
  },
  plugins: []
};
