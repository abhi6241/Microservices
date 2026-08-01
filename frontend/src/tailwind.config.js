/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#FBFBF9",
        surface: "#FFFFFF",
        ink: "#17181C",
        muted: "#6B6F76",
        faint: "#9AA0A6",
        hairline: "#E9E8E3",
        accent: {
          DEFAULT: "#4F46E5",
          soft: "#EEF0FE",
          hover: "#4338CA",
        },
      },
      fontFamily: {
        serif: ['"Fraunces"', "ui-serif", "Georgia", "serif"],
        sans: ['"Inter"', "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', "ui-monospace", "SFMono-Regular", "monospace"],
      },
      fontSize: {
        "2xs": ["0.6875rem", { lineHeight: "1rem" }],
      },
      maxWidth: {
        feed: "40rem",
      },
      boxShadow: {
        card: "0 1px 2px rgba(23, 24, 28, 0.04), 0 1px 1px rgba(23, 24, 28, 0.02)",
        lift: "0 8px 30px rgba(23, 24, 28, 0.08)",
        focus: "0 0 0 3px rgba(79, 70, 229, 0.15)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) both",
        "fade-in": "fade-in 0.3s ease both",
      },
    },
  },
  plugins: [],
};
