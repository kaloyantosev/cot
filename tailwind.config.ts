import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: '#050810',
        surface: '#0d1117',
        border: '#1e2d3d',
        accent: '#6366f1',
        'accent-glow': 'rgba(99,102,241,0.15)',
        positive: '#10b981',
        negative: '#ef4444',
        amber: '#f59e0b',
        blue: '#3b82f6',
        purple: '#8b5cf6',
        indigo: '#6366f1',
        muted: '#64748b',
        secondary: '#94a3b8',
        primary: '#f1f5f9',
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'IBM Plex Mono', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
export default config;
