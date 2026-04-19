import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#00CED1',
          light: '#48D1CC',
          dark: '#20B2AA',
        },
        secondary: {
          DEFAULT: '#FFA726',
          light: '#FFB74D',
          dark: '#FB8C00',
        },
        success: '#00E676',
        danger: '#FF5252',
        warning: '#FFA726',
        'background-primary': '#0F1625',
        'background-secondary': '#1A2332',
        'background-tertiary': '#232E42',
        'text-primary': '#E4E8EF',
        'text-secondary': '#B0B8C5',
        'text-muted': '#6B7280',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        sm: '6px',
        md: '10px',
        lg: '14px',
        xl: '18px',
      },
    },
  },
  plugins: [],
}

export default config
