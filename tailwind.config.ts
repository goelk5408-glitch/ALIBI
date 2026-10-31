import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Retro green
        green: '#33ff66',
        // Black background (used via bg-black)
        black: '#000000',
      },
      fontFamily: {
        mono: ['ui-monospace', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      animation: {
        blink: 'blink 1.2s steps(2, start) infinite',
        scanline: 'scanline 3s linear infinite',
      },
      keyframes: {
        blink: {
          '0%, 50%': { opacity: '1' },
          '51%, 100%': { opacity: '0' },
        },
        scanline: {
          '0%': { backgroundPosition: '0% 0%' },
          '100%': { backgroundPosition: '0% 100%' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
