/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require("daisyui"),
    require("@tailwindcss/typography"),
  ],
  daisyui: {
    themes: [
      {
        claro: {
          ...require("daisyui/src/theming/themes")["light"],
          "primary": "#0159dc"
        },
      },
      {
        escuro: {
          ...require("daisyui/src/theming/themes")["dark"],
          "primary": "#0159dc"
        },
      },
    ],
  }
}
