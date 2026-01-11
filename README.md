# Slides Icons

**A PowerPoint Add-in with 9,000+ free icons from 12 popular open-source libraries.**

![Slides Icons Screenshot](https://raw.githubusercontent.com/drankush/Slides-Icons/main/docs/screenshot.png)

## Features

- 🎨 **12 Icon Libraries** with 9,000+ icons
- 🔍 **Fast Search** - filter icons instantly by name
- 🎯 **One-Click Insert** - add icons directly to slides
- 🌈 **Color Picker** - customize icon color before inserting
- 📐 **Size Options** - 24px to 128px
- ⚡ **On-Demand Loading** - icons load from CDN as needed

## Supported Libraries

| Library | Icons |
|---------|-------|
| Bootstrap Icons | 1,000 |
| Heroicons | 324 |
| Feather Icons | 287 |
| Lucide Icons | 500 |
| Tabler Icons | 1,000 |
| Ionicons | 1,000 |
| Iconoir | 1,000 |
| Phosphor Icons | 1,000 |
| Boxicons | 814 |
| GitHub Octicons | 720 |
| Radix Icons | 332 |
| Eva Icons | 244 |

## Quick Start

### 1. Install & Build
```bash
npm install
npm run dev
```

### 2. Sideload in PowerPoint (Mac)
```bash
mkdir -p ~/Library/Containers/com.microsoft.Powerpoint/Data/Documents/wef
cp manifest.xml ~/Library/Containers/com.microsoft.Powerpoint/Data/Documents/wef/
```

### 3. Use in PowerPoint
1. Open PowerPoint
2. Go to **Insert** → **Add-ins** → **Slides Icons**
3. Browse libraries, search icons, click to insert!

## Architecture

**Hybrid CDN Approach:**
1. Lightweight JSON manifests contain icon names (~50KB per library)
2. Individual SVGs are fetched on-demand from jsDelivr CDN
3. Icons are cached in-memory for fast re-access

This approach provides fast initial load while supporting 9,000+ icons without bundling large files.

## Development

```bash
# Generate manifests from GitHub API
npm run generate-manifests

# Build for production
npm run build

# Start dev server
npm start
```

## Credits

Icons are sourced from their respective open-source projects. All icons are MIT or similarly licensed.

## License

MIT License
