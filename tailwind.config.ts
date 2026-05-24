import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: ['./src/**/*.{ts,tsx}', './app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#F5C518',
          hover: '#E6B800',
          dark: '#CC9F00',
          foreground: '#000000',
        },
      },
      boxShadow: {
        'primary': '0 4px 14px 0 rgba(245, 197, 24, 0.3)',
        'primary-lg': '0 8px 25px 0 rgba(245, 197, 24, 0.4)',
      }
    },
  },
  plugins: [],
}
export default config
