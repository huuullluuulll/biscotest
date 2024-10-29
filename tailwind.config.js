/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['IBM Plex Sans Arabic', 'sans-serif'],
      },
      colors: {
        // Primary Theme Colors
        primary: {
          DEFAULT: '#2D5A4C',    // Dark green
          light: '#4A7C6E',      // Lighter green
          dark: '#1E3D33',       // Darker green
        },
        accent: {
          DEFAULT: '#C5FF6B',    // Bright lime
          light: '#D8FFB9',      // Light lime
          dark: '#A8E650',       // Dark lime
        },
        surface: {
          DEFAULT: '#FFFFFF',
          secondary: '#F3F4F6',
          dark: '#1F2937',
          'dark-secondary': '#374151',
        },
        text: {
          DEFAULT: '#1F2937',
          secondary: '#4B5563',
          light: '#9CA3AF',
          inverse: '#FFFFFF',
        },
        status: {
          success: '#10B981',
          warning: '#F59E0B',
          error: '#EF4444',
          info: '#3B82F6',
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-in': 'slideIn 0.5s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};