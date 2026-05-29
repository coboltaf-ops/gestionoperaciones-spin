import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      animation: {
        'float-bg': 'floatBG 15s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        floatBG: {
          '0%, 100%': { backgroundPosition: 'center center' },
          '50%': { backgroundPosition: '70% 30%' },
        },
      },
    },
  },
  plugins: [],
}

export default config
