/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        pine: {
          950: '#0A201B',
          900: '#0E2B25',
          800: '#133830', // Sepetbox signature sidebar dark green
          700: '#1B4A3F',
          600: '#266355',
          500: '#357F6F',
          100: '#E6F4F0',
          50: '#F2FAF7',
        },
        foodresq: {
          orange: '#FA8128', // Sepetbox signature vibrant orange pill & button
          'orange-hover': '#E6711B',
          'orange-light': '#FFF3E8',
          'orange-subtle': '#FFF8F2',
          cream: '#FAF7F2', // Warm Ivory canvas background
          'border-cream': '#F0EAE1',
        },
        pastel: {
          peach: '#FFEEDB',
          peachIcon: '#FF9238',
          sky: '#E0F2FE',
          skyIcon: '#0284C7',
          sunlight: '#FEF9C3',
          sunlightIcon: '#EAB308',
          rose: '#FFE4E6',
          roseIcon: '#F43F5E',
          mint: '#DCFCE7',
          mintIcon: '#16A34A',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 12px -2px rgba(19, 56, 48, 0.06), 0 1px 4px -1px rgba(19, 56, 48, 0.04)',
        'card': '0 4px 20px -2px rgba(19, 56, 48, 0.05)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
};
