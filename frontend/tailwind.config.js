/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        surface: {
          0: '#000000',
          1: '#0a0a0a',
          2: '#111111',
          3: '#171717',
          4: '#1c1c1c',
        },
        accent: {
          DEFAULT: '#F97316',
          hover:   '#EA580C',
          muted:   'rgba(249,115,22,0.12)',
          glow:    'rgba(249,115,22,0.08)',
        },
        green: {
          accent: '#34D399',
          muted:  'rgba(52,211,153,0.12)',
        },
        text: {
          primary:   '#FAFAFA',
          secondary: '#A3A3A3',
          muted:     '#525252',
        },
        line: {
          DEFAULT: 'rgba(255,255,255,0.04)',
          hover:   'rgba(255,255,255,0.08)',
        }
      },
      fontFamily: {
        sans:    ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Poppins', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'display-lg': ['4rem',   { lineHeight: '1.05', letterSpacing: '-0.035em' }],
        'display-md': ['2.5rem', { lineHeight: '1.1',  letterSpacing: '-0.03em'  }],
        'display-sm': ['1.75rem',{ lineHeight: '1.15', letterSpacing: '-0.02em'  }],
        'body-lg':    ['1.125rem',{ lineHeight: '1.6' }],
        'body':       ['0.9375rem',{ lineHeight: '1.6' }],
        'caption':    ['0.8125rem',{ lineHeight: '1.5' }],
        'micro':      ['0.6875rem',{ lineHeight: '1.4' }],
      },
      boxShadow: {
        'glow':       '0 0 60px rgba(249,115,22,0.08)',
        'card':       '0 1px 2px rgba(0,0,0,0.3), 0 8px 24px rgba(0,0,0,0.15)',
        'card-hover': '0 2px 4px rgba(0,0,0,0.35), 0 12px 36px rgba(0,0,0,0.2)',
        'button':     '0 1px 2px rgba(0,0,0,0.2), 0 0 20px rgba(249,115,22,0.2)',
        'button-h':   '0 2px 4px rgba(0,0,0,0.3), 0 0 32px rgba(249,115,22,0.3)',
        'inner':      'inset 0 1px 0 rgba(255,255,255,0.03)',
      },
      borderRadius: {
        '2xl': '0.875rem',
        '3xl': '1.25rem',
      },
      animation: {
        'fade-in':    'fadeIn 0.5s ease-out forwards',
        'pulse-soft': 'pulseSoft 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.5' },
        },
      },
    },
  },
  plugins: [],
}
