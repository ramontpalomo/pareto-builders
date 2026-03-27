import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        white: "#FFFFFF",
        off: "#F5F5F3",
        g50: "#EFEEEB",
        g100: "#E0DFDB",
        g200: "#C2C1BC",
        g400: "#8A8985",
        g600: "#4A4946",
        g800: "#252420",
        g900: "#141310",
        lime: "#C8F230",
        "lime-dim": "#A8CF1A",
      },
      fontFamily: {
        serif: ["Playfair Display", "Georgia", "serif"],
        sans: ["DM Sans", "system-ui", "sans-serif"],
      },
      fontSize: {
        "10": "10px",
        "11": "11px",
        "12": "12px",
        "13": "13px",
        "15": "15px",
      },
      borderRadius: {
        "2": "2px",
        "3": "3px",
      },
      borderWidth: {
        "0.5": "0.5px",
      },
    },
  },
  plugins: [],
};

export default config;
