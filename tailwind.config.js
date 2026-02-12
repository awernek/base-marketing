/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      colors: {
        primary: {
          blue: '#3B82F6',
          'blue-dark': '#2563EB',
          'blue-light': '#DBEAFE',
        },
        secondary: {
          green: '#10B981',
          yellow: '#F59E0B',
          red: '#EF4444',
          purple: '#8B5CF6',
        },
        gray: {
          50: '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827',
        },
      },
      boxShadow: {
        'ds-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'ds': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'ds-md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'ds-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'ds-xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      },
      borderRadius: {
        'ds-sm': '0.25rem',
        'ds': '0.375rem',
        'ds-md': '0.5rem',
        'ds-lg': '0.75rem',
        'ds-xl': '1rem',
        'ds-2xl': '1.5rem',
        'ds-full': '9999px',
      },
    },
  },
  plugins: [],
};
