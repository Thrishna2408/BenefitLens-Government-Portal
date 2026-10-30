/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#F0F6FC',
          100: '#E1EDF9',
          200: '#C3DCF3',
          300: '#90BDE8',
          400: '#4D96DB',
          500: '#1D4ED8', // Navy royal
          600: '#1E40AF',
          700: '#1D3557', // Deep federal navy
          800: '#0F2447',
          900: '#0A192F', // Deep navy
          950: '#050D1A',
        },
        teal: {
          50: '#F0FDFA',
          100: '#CCFBF1',
          200: '#99F6E4',
          300: '#5EEAD4',
          400: '#2DD4BF',
          500: '#0D9488', // Transparent Teal
          600: '#0F766E',
          700: '#115E59',
          800: '#134E4A',
          900: '#042F2E',
        },
        ochre: {
          50: '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          300: '#FCD34D',
          400: '#FBBF24',
          500: '#D97706',
          600: '#B45309',
          700: '#92400E',
          800: '#78350F',
          900: '#451A03',
        },
        stoneWarm: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
          950: '#020617',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Outfit', 'Cabinet Grotesk', 'Plus Jakarta Sans', 'sans-serif'],
      },
      boxShadow: {
        'subtle': '0 2px 10px rgba(15, 23, 42, 0.04), 0 1px 3px rgba(15, 23, 42, 0.03)',
        'card': '0 4px 20px -2px rgba(15, 23, 42, 0.06), 0 2px 6px -1px rgba(15, 23, 42, 0.03)',
        'modal': '0 20px 40px -10px rgba(15, 23, 42, 0.2), 0 8px 16px -4px rgba(15, 23, 42, 0.12)',
      }
    },
  },
  plugins: [],
}
