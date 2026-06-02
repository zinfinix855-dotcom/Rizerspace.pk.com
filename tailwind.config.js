/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#000000',
        secondary: '#DC2626',
        accent: '#FF3B3B',
        muted: '#D1D5DB',
        card: '#111111',
        border: '#1F1F1F',
        danger: '#DC2626',
        success: '#22C55E',
        neon: {
          red: '#DC2626',
          crimson: '#990000',
          ember: '#FF3B3B',
          glow: '#FF4C4C'
        },
        dark: {
          900: '#000000',
          800: '#111111',
          700: '#1F1F1F',
          600: '#161616',
          500: '#222222',
        },
        glass: 'rgba(255,255,255,0.04)',
      },
      fontFamily: {
        syne:   ['Syne', 'sans-serif'],
        outfit: ['Outfit', 'sans-serif'],
      },
      boxShadow: {
        neon:        '0 0 20px rgba(220,38,38,0.4)',
        'neon-blue': '0 0 20px rgba(153,0,0,0.4)',
        'neon-cyan': '0 0 20px rgba(255,59,59,0.3)',
        glass:       '0 8px 32px rgba(0,0,0,0.5)',
      },
      backgroundImage: {
        'hero-gradient':   'linear-gradient(135deg, #000000 0%, #111111 50%, #1F1F1F 100%)',
        'card-gradient':   'linear-gradient(135deg, rgba(220,38,38,0.08), rgba(153,0,0,0.03))',
        'neon-gradient':   'linear-gradient(90deg, #DC2626, #990000, #FF3B3B)',
        'purple-gradient': 'linear-gradient(135deg, #DC2626, #990000)',
        'blue-gradient':   'linear-gradient(135deg, #990000, #FF3B3B)',
      },
      animation: {
        'float':       'float 6s ease-in-out infinite',
        'glow':        'glow 2s ease-in-out infinite alternate',
        'slide-in':    'slideIn 0.3s ease-out',
        'fade-in':     'fadeIn 0.4s ease-out',
        'pulse-neon':  'pulseNeon 2s ease-in-out infinite',
      },
      keyframes: {
        float:      { '0%,100%': { transform: 'translateY(0px)' }, '50%': { transform: 'translateY(-12px)' } },
        glow:       { from: { boxShadow: '0 0 10px rgba(229,9,20,0.3)' }, to: { boxShadow: '0 0 30px rgba(229,9,20,0.8), 0 0 60px rgba(153,0,0,0.3)' } },
        slideIn:    { from: { transform: 'translateX(100%)' }, to: { transform: 'translateX(0)' } },
        fadeIn:     { from: { opacity: 0, transform: 'translateY(10px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        pulseNeon:  { '0%,100%': { opacity: 1 }, '50%': { opacity: 0.5 } },
      },
      backdropBlur: { xs: '2px' },
    },
  },
  plugins: [],
}
