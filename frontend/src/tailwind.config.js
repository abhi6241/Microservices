/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Google Material 3 baseline
        canvas: "#f0f4f9",
        surface: "#ffffff",
        container: "#e9eef6",
        "container-low": "#f8fafd",
        ink: "#1f1f1f",
        muted: "#444746",
        faint: "#5e5e5e",
        hairline: "#dadce0",
        outline: "#c4c7c5",
        google: {
          blue: "#1a73e8",
          darkblue: "#0b57d0",
          red: "#d93025",
          yellow: "#f9ab00",
          green: "#188038",
        },
        primary: {
          DEFAULT: "#0b57d0",
          hover: "#0842a0",
          container: "#d3e3fd",
          soft: "#e8f0fe",
        },
      },
      fontFamily: {
        sans: ['"Google Sans"', '"Roboto"', "ui-sans-serif", "system-ui", "sans-serif"],
        roboto: ['"Roboto"', "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ['"Roboto Mono"', "ui-monospace", "SFMono-Regular", "monospace"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(60,64,67,.18), 0 1px 3px 1px rgba(60,64,67,.10)",
        pop: "0 4px 12px rgba(60,64,67,.22)",
        focus: "0 0 0 3px rgba(26,115,232,.18)",
      },
      borderRadius: {
        xl2: "1.5rem",
        xl3: "1.75rem",
      },
      maxWidth: {
        feed: "42rem",
        app: "80rem",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
      animation: {
        "fade-up": "fade-up .35s cubic-bezier(.2,0,0,1) both",
        "fade-in": "fade-in .25s ease both",
      },
    },
  },
  plugins: [],
};
