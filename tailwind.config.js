/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Bảng màu chủ đạo – xem thêm biến CSS trong src/index.css
        cream: '#FBF6EA',
        rice: '#FFFDF8',
        forest: {
          50: '#EEF6F0',
          100: '#D7E8DC',
          200: '#B0D2BA',
          300: '#82B692',
          400: '#4F9266',
          500: '#2F7550',
          600: '#1F5B3D',
          700: '#1A4A32',
          800: '#163C2A',
          900: '#102B1F',
        },
        cham: {
          50: '#EEF1F7',
          100: '#D8DFEC',
          400: '#5A6C8E',
          600: '#36496B',
          700: '#2B3A55',
          800: '#1F2C42',
        },
        shoot: {
          100: '#EDF7DE',
          200: '#D8EDBB',
          400: '#A8D06B',
          500: '#8FBF5A',
          600: '#6E9C3E',
        },
        honey: {
          100: '#FDF0D2',
          200: '#FADFA4',
          400: '#F0B23C',
          500: '#E8A020',
          600: '#D97706',
          700: '#B45309',
        },
        cam: {
          500: '#D2601A',
          600: '#B44E12',
        },
        wood: {
          100: '#F1E6D6',
          300: '#C9A77C',
          500: '#8A6440',
          700: '#6B4A2F',
          900: '#442E1D',
        },
        thocam: {
          500: '#A3463B',
          600: '#8C3B32',
          700: '#732F28',
        },
        ink: '#1F2A1C',
      },
      fontFamily: {
        sans: ['"Be Vietnam Pro"', 'system-ui', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['"Playfair Display"', 'Georgia', 'serif'],
      },
      boxShadow: {
        card: '0 2px 4px rgba(31, 42, 28, 0.05), 0 12px 28px -12px rgba(31, 42, 28, 0.18)',
        float: '0 18px 45px -18px rgba(31, 42, 28, 0.35)',
        ringHoney: '0 0 0 3px rgba(232, 160, 32, 0.35)',
      },
      borderRadius: {
        xl2: '1.25rem',
      },
      keyframes: {
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(14px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'ring-pulse': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(20, 184, 166, 0.55)' },
          '50%': { boxShadow: '0 0 0 6px rgba(20, 184, 166, 0)' },
        },
        'cart-shake': {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-2px) rotate(-4deg)' },
          '50%': { transform: 'translateX(2px) rotate(4deg)' },
          '75%': { transform: 'translateX(-1px) rotate(-2deg)' },
        },
        'count-pop': {
          '0%': { transform: 'scale(1)' },
          '40%': { transform: 'scale(1.35)' },
          '100%': { transform: 'scale(1)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        radar: {
          '0%': { transform: 'scale(0.4)', opacity: '0.85' },
          '100%': { transform: 'scale(2.4)', opacity: '0' },
        },
        float: {
          '0%, 100%': { transform: 'translate3d(0,0,0) rotate(-6deg)' },
          '50%': { transform: 'translate3d(6px,-12px,0) rotate(8deg)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.5s cubic-bezier(0.22, 1, 0.36, 1) both',
        'ring-pulse': 'ring-pulse 1.2s ease-in-out 2',
        'cart-shake': 'cart-shake 0.45s ease-in-out',
        'count-pop': 'count-pop 0.35s ease-out',
        shimmer: 'shimmer 1.4s infinite',
        radar: 'radar 2.4s ease-out infinite',
        float: 'float 7s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
