/** @type {import('tailwindcss').Config} */
// The Triage design system lives here: warm paper canvas, an ink rail, one
// confident iris accent, and semantic colours for priority/category/status.
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        canvas: '#f4f3ef',
        surface: { DEFAULT: '#ffffff', soft: '#faf9f6' },
        rail: { DEFAULT: '#15141c', soft: '#1e1c28' },
        ink: { DEFAULT: '#16151c', soft: '#4a4856', faint: '#87838f' },
        onrail: { DEFAULT: '#f4f3ef', soft: '#9c98ad' },
        line: { DEFAULT: '#e7e4dd', strong: '#d8d4ca' },
        accent: { DEFAULT: '#5646e6', press: '#4536c9', soft: '#ecebfb' },
        high: { DEFAULT: '#e5484d', soft: '#fcebec' },
        medium: { DEFAULT: '#c2710c', soft: '#fbf0dd' },
        low: { DEFAULT: '#1f9a64', soft: '#e3f5ec' },
        cat: {
          finance: '#0e7490',
          legal: '#7c3aed',
          procurement: '#b45309',
          operations: '#0f766e',
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        card: '14px',
        field: '10px',
      },
      boxShadow: {
        sm: '0 1px 2px rgba(20, 18, 30, 0.06), 0 1px 1px rgba(20, 18, 30, 0.04)',
        md: '0 12px 28px -12px rgba(20, 18, 30, 0.28)',
        lg: '0 30px 60px -20px rgba(20, 18, 30, 0.4)',
        glow: '0 8px 18px -10px #5646e6',
      },
      keyframes: {
        shimmer: {
          to: { backgroundPosition: '-200% 0' },
        },
        'fade-in': {
          from: { opacity: '0' },
        },
        'slide-in': {
          from: { transform: 'translateX(40px)', opacity: '0.4' },
        },
        pop: {
          from: { transform: 'scale(0.96) translateY(8px)', opacity: '0' },
        },
      },
      animation: {
        shimmer: 'shimmer 1.3s ease-in-out infinite',
        'fade-in': 'fade-in 160ms ease',
        'slide-in': 'slide-in 240ms cubic-bezier(0.22, 1, 0.36, 1)',
        pop: 'pop 200ms cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  plugins: [],
};
