/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        sage: {
          50: "#f3faf4",
          100: "#e2f5e6",
          200: "#c5ecce",
          300: "#9adcac",
          400: "#6ac384",
          500: "#45a866",
          600: "#328a51",
          700: "#296e43",
          800: "#235838",
          900: "#1d4830",
        },
        charcoal: {
          800: "#1a211d",
          900: "#10140f",
          950: "#0a0d09",
        },
      },
      backgroundImage: {
        "gradient-app-light": "linear-gradient(135deg, #eafaf0 0%, #dcf3e3 35%, #cdeadc 65%, #bfe6d4 100%)",
        "gradient-app-dark": "linear-gradient(135deg, #10140f 0%, #14201a 40%, #16281f 70%, #122019 100%)",
        "gradient-card-light": "linear-gradient(160deg, rgba(255,255,255,0.55) 0%, rgba(226,245,230,0.35) 100%)",
        "gradient-card-dark": "linear-gradient(160deg, rgba(35,50,42,0.55) 0%, rgba(20,30,25,0.35) 100%)",
        "gradient-primary": "linear-gradient(135deg, #6ac384 0%, #328a51 100%)",
      },
      boxShadow: {
        glass: "0 8px 32px 0 rgba(31, 89, 56, 0.15)",
        "glass-dark": "0 8px 32px 0 rgba(0, 0, 0, 0.4)",
        nav: "0 10px 40px -10px rgba(31, 89, 56, 0.35)",
      },
      borderRadius: {
        "2.5xl": "1.375rem",
        "3.5xl": "1.75rem",
      },
      fontFamily: {
        sans: ["DM Sans", "system-ui", "sans-serif"],
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.6s ease-out forwards",
      },
    },
  },
  plugins: [],
};
