# Brand Fonts

This directory stores the Roots & Fruit brand font files.

## Required Files

Place the following WOFF2 font files in this directory:

### Knile (Serif)
- `knile-regular-webfont.woff2` (weight 400)
- `knile-semibold-webfont.woff2` (weight 600)
- `knile-bold-webfont.woff2` (weight 700)

### Nunito Sans (Sans-serif)
- `nunito-sans-latin-wght-normal.woff2` (variable font, weight range 200-1000)
- `nunito-sans-latin-wght-italic.woff2` (variable font, weight range 200-1000)

## Source

- **Knile**: Custom/commercial font licensed for Roots & Fruit use
- **Nunito Sans**: Available from [Fontsource](https://fontsource.org/fonts/nunito-sans) - use the Latin subset variable weight files

## Usage

Font files are loaded via `css/fonts.css` with relative paths (`../fonts/...`). The WordPress compiler (`scripts/compile-wordpress.mjs`) automatically copies these files to `wordpress/rf/assets/fonts/` during the build process.

## Important

- Each project (brand, website, slides) maintains its own copy of these font files
- Do not reference fonts hosted on external sites or cross-project
- Font binaries are not committed to version control - obtain them from the licensed source
