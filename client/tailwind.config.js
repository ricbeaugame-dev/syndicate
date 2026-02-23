/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        syndicate: {
          bg: '#0a0a0b',
          bg2: '#111114',
          bg3: '#18181d',
          border: '#2a2a35',
          border2: '#3a3a48',
          red: '#e03c3c',
          'red-dim': '#7a1f1f',
          gold: '#c9a84c',
          'gold-dim': '#6b5520',
          green: '#3cba6e',
          'green-dim': '#1a5c35',
          blue: '#4a90d9',
          'blue-dim': '#1e3f6a',
          muted: '#55556a',
          text: '#d0d0e0',
          'text-dim': '#7a7a90',
        },
      },
      fontFamily: {
        mono: ['"Share Tech Mono"', 'monospace'],
        heading: ['"Bebas Neue"', 'cursive'],
        body: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
