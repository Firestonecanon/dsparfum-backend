export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./src/components/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Playfair Display', 'serif'],
      },
      animation: {
        'fadeInUp': 'fadeInUp 0.8s ease-out forwards',
        'float': 'float 8s ease-in-out infinite',
      },
      keyframes: {
        fadeInUp: {
          '0%': {
            opacity: '0',
            transform: 'translateY(30px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        float: {
          '0%, 100%': {
            transform: 'translateY(0px) rotate(0deg)',
          },
          '33%': {
            transform: 'translateY(-8px) rotate(120deg)',
          },
          '66%': {
            transform: 'translateY(-4px) rotate(240deg)',
          },
        },
      },
      backdropBlur: {
        'xl': '24px',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(circle, var(--tw-gradient-from), var(--tw-gradient-to))',
      },
    },
  },
  plugins: [],
}