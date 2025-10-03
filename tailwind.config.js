/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sage: {
          50: '#f8faf8',
          100: '#e8f2e8',
          200: '#d1e5d1',
          300: '#a8d0a8',
          400: '#7fb87f',
          500: '#6b9b6b',
          600: '#5a8a5a',
          700: '#4a6b4a',
          800: '#3d563d',
          900: '#334533',
        },
        stone: {
          50: '#fafaf9',
          100: '#f5f5f4',
          200: '#e7e5e4',
          300: '#d6d3d1',
          400: '#a8a29e',
          500: '#78716c',
          600: '#57534e',
          700: '#44403c',
          800: '#292524',
          900: '#1c1917',
        },
        lavender: {
          50: '#faf8ff',
          100: '#f3f0ff',
          200: '#e9e5ff',
          300: '#d4c5fd',
          400: '#c4b5fd',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Crimson Text', 'serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'gentle-bounce': 'gentleBounce 0.4s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        gentleBounce: {
          '0%, 20%, 50%, 80%, 100%': { transform: 'translateY(0)' },
          '40%': { transform: 'translateY(-2px)' },
          '60%': { transform: 'translateY(-1px)' },
        },
      },
      transitionDuration: {
        '250': '250ms',
        '350': '350ms',
      },
      transitionTimingFunction: {
        'gentle': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      }
    },
  },
  plugins: [],
}