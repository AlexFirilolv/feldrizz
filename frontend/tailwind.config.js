/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        // Anniversary romantic palette
        'light-yellow': '#FEF9E7',
        'warm-orange': '#FEB47B',
        'soft-pink': '#F8BBD9',
        
        // Additional romantic colors
        'peach': '#FFDBCC',
        'cream': '#FFF8DC',
        'rose-gold': '#E8B4B8',
        'sunset': '#FF6B6B',
        
        // Neutral supporting colors
        'warm-gray': {
          50: '#FAFAF9',
          100: '#F5F5F4',
          200: '#E7E5E4',
          300: '#D6D3D1',
          400: '#A8A29E',
          500: '#78716C',
          600: '#57534E',
          700: '#44403C',
          800: '#292524',
          900: '#1C1917',
        }
      },
      fontFamily: {
        'romantic': ['Dancing Script', 'cursive'],
        'elegant': ['Playfair Display', 'serif'],
        'modern': ['Inter', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-romantic': 'linear-gradient(135deg, #FEF9E7 0%, #FEB47B 50%, #F8BBD9 100%)',
        'gradient-sunset': 'linear-gradient(135deg, #FEB47B 0%, #FF6B6B 100%)',
        'gradient-soft': 'linear-gradient(135deg, #FFF8DC 0%, #FFDBCC 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'bounce-gentle': 'bounceGentle 2s infinite',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        bounceGentle: {
          '0%, 20%, 50%, 80%, 100%': { transform: 'translateY(0)' },
          '40%': { transform: 'translateY(-5px)' },
          '60%': { transform: 'translateY(-3px)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
      boxShadow: {
        'romantic': '0 10px 25px -5px rgba(248, 187, 217, 0.3), 0 10px 10px -5px rgba(254, 249, 231, 0.2)',
        'warm': '0 10px 25px -5px rgba(254, 180, 123, 0.3), 0 10px 10px -5px rgba(255, 107, 107, 0.2)',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      }
    },
  },
  plugins: [],
} 