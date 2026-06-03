import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: ['./src/**/*.{ts,tsx}', './app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        surface: 'var(--surface)',
        'surface-2': 'var(--surface-2)',
        'accent-dark': 'var(--accent-dark)',
        primary: {
          DEFAULT: '#0A0A0A',
          hover: '#1a1a1a',
          dark: '#000000',
          foreground: '#FFFFFF',
        },
      },
      boxShadow: {
        'primary': '0 4px 14px 0 rgba(200, 241, 53, 0.3)',
        'primary-lg': '0 8px 25px 0 rgba(200, 241, 53, 0.4)',
      }
    },
  },
  plugins: [],
}
export default config
