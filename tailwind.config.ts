import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        bg: '#0A0A0B',
        surface: '#141416',
        midnight: '#0D1B2A',
        walnut: '#2C1A0E',
        ivory: '#F5F0E8',
        champagne: '#C9A96E',
        amber: '#D4884A',
        muted: '#2A2A2D',
        'text-primary': '#F5F0E8',
        'text-secondary': '#9A9490'
      },
      fontFamily: {
        display: ['Cormorant Garamond', 'Georgia', 'Times New Roman', 'serif'],
        body: ['Inter', 'system-ui', '-apple-system', 'sans-serif']
      },
      letterSpacing: {
        cinematic: '0.2em',
        wide: '0.12em',
        normal: '0.02em'
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'marquee-reverse': {
          '0%': { transform: 'translateX(-50%)' },
          '100%': { transform: 'translateX(0)' },
        }
      },
      animation: {
        marquee: 'marquee 40s linear infinite',
        'marquee-reverse': 'marquee-reverse 40s linear infinite',
      }
    }
  },
  plugins: [],
};

export default config;
