/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Dark backgrounds
        bg: {
          primary:   '#07070e',
          secondary: '#0d0d1a',
          card:      '#111120',
          elevated:  '#161628',
          border:    'rgba(255,255,255,0.07)',
        },
        // Brand palette
        neon: {
          DEFAULT: '#00ff87',
          dim:     '#00cc6a',
          glow:    'rgba(0,255,135,0.18)',
          muted:   'rgba(0,255,135,0.08)',
        },
        violet: {
          DEFAULT: '#7c3aed',
          light:   '#8b5cf6',
          glow:    'rgba(124,58,237,0.25)',
        },
        fire: {
          DEFAULT: '#ff6b35',
          light:   '#ff8c61',
          glow:    'rgba(255,107,53,0.2)',
        },
        cyan: {
          brand:   '#06b6d4',
          glow:    'rgba(6,182,212,0.2)',
        },
        // Semantic
        success: '#00ff87',
        warning: '#fbbf24',
        danger:  '#f87171',
        info:    '#60a5fa',
      },
      fontFamily: {
        sans:    ['Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'system-ui', 'sans-serif'],
        mono:    ['JetBrains Mono', 'monospace'],
      },
      backgroundImage: {
        'neon-gradient':    'linear-gradient(135deg, #00ff87 0%, #00cc6a 100%)',
        'violet-gradient':  'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
        'fire-gradient':    'linear-gradient(135deg, #ff6b35 0%, #ff0099 100%)',
        'cyan-gradient':    'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
        'dark-gradient':    'linear-gradient(135deg, #07070e 0%, #0d0d1a 50%, #111120 100%)',
        'glass-gradient':   'linear-gradient(135deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.02) 100%)',
        'hero-glow':        'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(0,255,135,0.12) 0%, transparent 60%)',
        'sidebar-glow':     'radial-gradient(ellipse at 0% 50%, rgba(0,255,135,0.06) 0%, transparent 70%)',
      },
      boxShadow: {
        'neon':     '0 0 20px rgba(0,255,135,0.35), 0 0 60px rgba(0,255,135,0.12)',
        'neon-sm':  '0 0 12px rgba(0,255,135,0.25)',
        'neon-lg':  '0 0 40px rgba(0,255,135,0.45), 0 0 120px rgba(0,255,135,0.15)',
        'violet':   '0 0 20px rgba(124,58,237,0.4)',
        'fire':     '0 0 20px rgba(255,107,53,0.4)',
        'glass':    '0 8px 32px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.06)',
        'glass-lg': '0 20px 60px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.06)',
        'card':     '0 4px 24px rgba(0,0,0,0.3)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      animation: {
        'float':          'float 6s ease-in-out infinite',
        'pulse-neon':     'pulseNeon 2s ease-in-out infinite',
        'glow':           'glow 2s ease-in-out infinite alternate',
        'slide-in-left':  'slideInLeft 0.4s ease-out',
        'slide-in-right': 'slideInRight 0.4s ease-out',
        'fade-up':        'fadeUp 0.5s ease-out',
        'scale-in':       'scaleIn 0.3s ease-out',
        'shimmer':        'shimmer 1.8s linear infinite',
        'spin-slow':      'spin 8s linear infinite',
        'bounce-slow':    'bounce 3s ease-in-out infinite',
      },
      keyframes: {
        float:         { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-12px)' } },
        pulseNeon:     { '0%,100%': { boxShadow: '0 0 10px rgba(0,255,135,0.2)' }, '50%': { boxShadow: '0 0 30px rgba(0,255,135,0.55)' } },
        glow:          { '0%': { textShadow: '0 0 8px rgba(0,255,135,0.5)' }, '100%': { textShadow: '0 0 24px rgba(0,255,135,0.95), 0 0 48px rgba(0,255,135,0.3)' } },
        slideInLeft:   { from: { transform: 'translateX(-100%)', opacity: '0' }, to: { transform: 'translateX(0)', opacity: '1' } },
        slideInRight:  { from: { transform: 'translateX(100%)', opacity: '0' }, to: { transform: 'translateX(0)', opacity: '1' } },
        fadeUp:        { from: { transform: 'translateY(24px)', opacity: '0' }, to: { transform: 'translateY(0)', opacity: '1' } },
        scaleIn:       { from: { transform: 'scale(0.9)', opacity: '0' }, to: { transform: 'scale(1)', opacity: '1' } },
        shimmer:       { '0%': { backgroundPosition: '-1000px 0' }, '100%': { backgroundPosition: '1000px 0' } },
      },
      backdropBlur: { xs: '2px', '4xl': '40px' },
      transitionTimingFunction: { 'bounce-out': 'cubic-bezier(0.34,1.56,0.64,1)' },
    },
  },
  plugins: [],
}
