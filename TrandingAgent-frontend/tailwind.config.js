/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        haze: '#E9F1FB',
        haze2: '#DCE9F9',
        haze3: '#C7DBF2',
        ink: '#0A1B2E',
        ink2: '#2C4B69',
        ink3: '#5E7E9B',
        line: '#CBDDEF',
        azure: '#0B63F6',
        azure2: '#0849BE',
        teal: '#00A6B8',
        cyan: '#0B93B3',
        violet: '#6D5CFF',
        steel: '#7FA6CC',
        neon: '#22D3EE',
        ice: '#F7FBFF',
      },
      fontFamily: {
        display: ['"Space Grotesk"', '"Noto Sans SC"', 'sans-serif'],
        serif: ['"Space Grotesk"', '"Noto Sans SC"', 'sans-serif'],
        sans: ['Inter', '"Noto Sans SC"', '"PingFang SC"', '"Microsoft YaHei"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        tag: '0 1px 0 rgba(10,27,46,.04), 0 16px 32px -22px rgba(10,45,90,.45)',
        lift: '0 2px 0 rgba(10,27,46,.04), 0 30px 50px -26px rgba(10,45,90,.5)',
        cut: 'inset 0 0 0 1px rgba(11,99,246,.14)',
        glow: '0 0 0 1px rgba(11,99,246,.18), 0 0 28px -8px rgba(11,99,246,.55)',
        hud: 'inset 0 1px 0 rgba(255,255,255,.85), 0 24px 48px -32px rgba(10,45,90,.4)',
      },
      backgroundImage: {
        'grid-soft':
          'linear-gradient(to right, rgba(11,99,246,.07) 1px, transparent 1px), linear-gradient(to bottom, rgba(11,99,246,.07) 1px, transparent 1px)',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(14px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        floaty: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        stampIn: {
          '0%': { opacity: '0', transform: 'scale(1.8)' },
          '60%': { opacity: '1', transform: 'scale(.94)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        pulseDot: {
          '0%,100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '.4', transform: 'scale(.82)' },
        },
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(600%)' },
        },
        dash: {
          to: { strokeDashoffset: '0' },
        },
      },
      animation: {
        fadeUp: 'fadeUp .55s cubic-bezier(.22,.8,.32,1) both',
        marquee: 'marquee 36s linear infinite',
        floaty: 'floaty 6s ease-in-out infinite',
        stampIn: 'stampIn .5s cubic-bezier(.2,1.2,.4,1) both',
        pulseDot: 'pulseDot 1.8s ease-in-out infinite',
        scan: 'scan 5s linear infinite',
      },
    },
  },
  plugins: [],
}
