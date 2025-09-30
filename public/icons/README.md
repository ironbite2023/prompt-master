# PWA Icons

## Required Icons

This directory should contain the following PWA icons:

- `icon-192x192.png` - 192x192 pixels
- `icon-512x512.png` - 512x512 pixels

## Generating Icons

You can use the included `icon.svg` as a template and convert it to PNG using:

### Option 1: Online Tools
- [Favicon Generator](https://favicon.io/)
- [RealFaviconGenerator](https://realfavicongenerator.net/)

### Option 2: Command Line (ImageMagick)
```bash
# Install ImageMagick first
convert icon.svg -resize 192x192 icon-192x192.png
convert icon.svg -resize 512x512 icon-512x512.png
```

### Option 3: Design Tools
Use Figma, Adobe Illustrator, or any design tool to export the icons at the required sizes.

## Design Guidelines

- **Background Color**: #9333ea (purple)
- **Accent Color**: #db2777 (pink)
- **Theme**: Modern, tech-focused, AI-related
- **Content**: Should include "PM" or "Prompt Master" branding
