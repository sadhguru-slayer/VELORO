const colors = require('tailwindcss/colors');

export default {
  content: ['./src/**/*.{js,jsx,ts,tsx}',"./node_modules/react-tailwindcss-datepicker/dist/index.esm.{js,ts}", "./node_modules/tailwind-datepicker-react/dist/**/*.js",], // Adjust according to your project
  theme: {
    extend: {
      colors: {
        // Client theme colors extracted from CHomepage
        client: {
          // Primary colors
          primary: {
            DEFAULT: '#1B2B65', // Main brand color
            light: '#395693',
            dark: '#162454',
            hover: '#2A4178'
          },
          // Secondary colors
          secondary: {
            DEFAULT: '#CBD5E0', // Muted text and borders
            light: '#F8FAFD',
            dark: '#4A5568'
          },
          // Accent colors
          accent: {
            blue: {
              light: '#A3B8F6',
              DEFAULT: '#003366',
              dark: '#002347'
            },
            gray: {
              lightest: '#F9FAFB',
              lighter: '#F0F4F8',
              light: '#E5E7EB',
              DEFAULT: '#64748b',
              dark: '#333333'
            }
          },
          // Status colors
          status: {
            success: '#10B981',
            warning: '#F59E0B',
            error: '#EF4444'
          },
          // Text colors
          text: {
            primary: '#333333',
            secondary: '#666666',
            muted: '#64748b',
            light: '#CBD5E0'
          },
          // Background colors
          bg: {
            primary: '#F8FAFD',
            card: '#FFFFFF',
            gradient: {
              start: '#1B2B65',
              middle: '#2A4178',
              end: '#395693'
            }
          },
          // Border colors
          border: {
            light: 'rgba(255, 255, 255, 0.1)',
            DEFAULT: '#E5E7EB',
            hover: '#C0C0C0'
          }
        }
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
        'client-sm': '0 4px 6px -1px rgba(27, 43, 101, 0.05), 0 2px 4px -1px rgba(27, 43, 101, 0.03)',
        'client-md': '0 10px 15px -3px rgba(27, 43, 101, 0.08), 0 4px 6px -2px rgba(27, 43, 101, 0.05)',
        'client-lg': '0 20px 25px -5px rgba(27, 43, 101, 0.1), 0 10px 10px -5px rgba(27, 43, 101, 0.04)',
        'client-button': '0 2px 4px rgba(27, 43, 101, 0.1)',
        'client-button-hover': '0 4px 6px rgba(27, 43, 101, 0.15)',
      },
      height: {
        btnSm: '32px',
        btnMd: '40px',
        btnLg: '48px',
      },
      animation: {
        'gradient': 'gradient 8s linear infinite',
      },
      keyframes: {
        gradient: {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'left center'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center'
          },
        },
      },
    },
  },
  plugins: [
    require('tailwind-scrollbar'), // Add the scrollbar plugin here
  ],
};
