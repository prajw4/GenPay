// Tailwind v4 moved the PostCSS plugin to a separate package: @tailwindcss/postcss
// Use the package's exported function here so PostCSS can run Tailwind correctly.
module.exports = {
  plugins: {
    // require the new PostCSS plugin entry
    '@tailwindcss/postcss': {},
    autoprefixer: {},
  },
};