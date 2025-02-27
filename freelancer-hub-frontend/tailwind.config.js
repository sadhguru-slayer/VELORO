const colors = require('tailwindcss/colors');

export default {
  content: ['./src/**/*.{js,jsx,ts,tsx}',"./node_modules/react-tailwindcss-datepicker/dist/index.esm.{js,ts}", "./node_modules/tailwind-datepicker-react/dist/**/*.js",], // Adjust according to your project
  theme: {
    extend: {
      colors: {
        primary: '#1E3A8A', // Deep Blue
        charcolBlue: '#2C3E50', // Sky Blue
        mutedGold: '#C49A6C', // Sky Blue
        client_teal: '#008080', // teal
        background: '#F3F4F6', // Light Gray
        card: '#FFFFFF', // White
        textPrimary: '#111827', // Dark Gray/Black
        textSecondary: '#6B7280', // Gray
        error: '#EF4444', // Red
        success: '#10B981', // Green
      },
      spacing: {
        sm: '0.5rem', // 8px
        md: '1rem', // 16px
        lg: '1.5rem', // 24px
      },
      fontSize: {
        sm: '0.875rem', // 14px
        md: '1rem', // 16px
        lg: '1.25rem', // 20px
        xl: '1.5rem', // 24px
      },
      borderRadius: {
        sm: '0.25rem', // 4px
        md: '0.5rem', // 8px
        lg: '1rem', // 16px
      },
      boxShadow: {
        card: '0 1px 4px rgba(0, 0, 0, 0.1)',
        buttonHover: '0 2px 8px rgba(0, 0, 0, 0.15)',
      },
      height: {
        btnSm: '32px',
        btnMd: '40px',
        btnLg: '48px',
      },
    },
  },
  plugins: [
    require('tailwind-scrollbar'), // Add the scrollbar plugin here
  ],
};
