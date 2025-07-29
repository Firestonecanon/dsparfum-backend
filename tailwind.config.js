/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        'hero-pattern': "url('https://raw.githubusercontent.com/Firestonecanon/dsparfum-images/main/smoke-1830840.jpg')",
        'marbre-collections': "url('https://raw.githubusercontent.com/Firestonecanon/dsparfum-images/main/marbre-noir-collections.jpg')",
      },
    },
  },
  plugins: [],
}
