/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        // HireAI / Synthweb Primary Purple Palette
        primary: {
          DEFAULT: '#5935E8',
          hover: '#4926D6',
          light: '#F0EDFF',
          50: '#F5F3FF',
          100: '#EDE9FE',
          200: '#DDD6FE',
          500: '#5935E8',
          600: '#4926D6',
          700: '#3D1CB8',
        },
        // Sidebar Dark Navy
        navy: {
          DEFAULT: '#101329',
          dark: '#0C0E1E',
          active: '#35278C',
          hover: '#1B1F3B',
          border: '#1E2345',
        },
        // Surface & Backgrounds
        surface: {
          bg: '#F7F8FC',
          card: '#FFFFFF',
          border: '#E8EAF1',
          muted: '#F1F3F9',
          'dark-bg': '#0B0D1B',
          'dark-card': '#12162E',
          'dark-border': '#1E2448',
          'dark-muted': '#191E3D',
        },
        // Typography Colors
        text: {
          primary: '#172033',
          secondary: '#687386',
          muted: '#9AA3B2',
        },
        // Status Colors
        status: {
          success: '#16A36A',
          'success-bg': '#EBFBF3',
          warning: '#E6A23C',
          'warning-bg': '#FEF7EC',
          danger: '#DC5555',
          'danger-bg': '#FDF2F2',
        },
      },
      boxShadow: {
        card: '0 1px 3px 0 rgba(16, 19, 41, 0.04), 0 1px 2px 0 rgba(16, 19, 41, 0.02)',
        'card-hover': '0 4px 12px 0 rgba(16, 19, 41, 0.08), 0 2px 4px 0 rgba(16, 19, 41, 0.04)',
        modal: '0 20px 25px -5px rgba(16, 19, 41, 0.1), 0 10px 10px -5px rgba(16, 19, 41, 0.04)',
      },
    },
  },
  plugins: [],
};
