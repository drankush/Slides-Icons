<div align="center">

<h1>✦ Slides Icons</h1>

<a href="https://opensource.org/licenses/MIT">
  <img src="https://img.shields.io/badge/License-MIT-blue.svg" />
</a>
<a href="https://github.com/drankush/Slides-Icons">
  <img src="https://img.shields.io/badge/Icons-94%2C000%2B-brightgreen" />
</a>
<a href="https://github.com/drankush/Slides-Icons">
  <img src="https://img.shields.io/badge/Libraries-107-orange" />
</a>
<a href="https://github.com/drankush/Slides-Icons">
  <img src="https://img.shields.io/badge/PowerPoint-Add--in-red?logo=microsoft-powerpoint" />
</a>
<a href="https://github.com/cenfun/open-icons">
  <img src="https://img.shields.io/badge/Powered%20by-Open%20Icons-purple" />
</a>

<p>
<b>A PowerPoint Add-in with 94,000+ free icons from 107 open-source libraries.</b>
</p>

<img src="images/slides-icons-demo.jpg" alt="Slides Icons Demo" width="900" />

</div>

## ✨ Features

- **107 Icon Libraries** - Bootstrap, FontAwesome, Material Design, Tabler, Phosphor, and 100+ more
- **94,000+ Icons** - Comprehensive coverage for any presentation need
- **Collapsible Sidebar** - Toggle libraries panel for more icon grid space
- **Load More** - Browse all icons with incremental loading (50 at a time)
- **Custom Colors** - Apply any color to icons with live preview
- **Background Support** - Add background colors to icon cards
- **Multiple Sizes** - Export at 24px, 48px, 64px, 96px, or 128px
- **Fast Search** - Instantly filter icons by name
- **Offline-Ready** - All icons embedded locally, no CDN dependencies

## 📚 Library Categories

| Category | Libraries |
|----------|-----------|
| **General** | Bootstrap, Feather, Lucide, Tabler, Heroicons, Iconoir |
| **Material** | Material Design Icons (7000+), Material Symbols |
| **Brands** | Simple Icons, Logos, Dev Icons |
| **Specialized** | Crypto (coins), Flag (countries), Weather, Maps |
| **Multi-color** | Crypto, Flag, Logos, Ant Design Mobile |

## 🏗 Architecture

This add-in leverages the excellent [open-icons](https://github.com/cenfun/open-icons) npm package:

1. **Build Time**: Extract compressed icon bundles using Node.js + JSDOM
2. **Runtime**: Load lightweight JSON manifests on-demand (no heavy decompression in browser)
3. **Rendering**: Direct SVG embedding with intelligent color handling:
   - Stroke-based icons (Tabler, Feather) → stroke styling only
   - Multi-color icons (Crypto, Flag) → preserve original colors
   - Fill-based icons (Bootstrap, etc.) → currentColor fill

## 🚀 Development

### Prerequisites
- Node.js 18+
- npm

### Setup
```bash
# Install dependencies
npm install

# Extract icons from open-icons package (~1 min)
npm run extract-icons

# Build the add-in
npm run build

# Start local server
npm start
```

### Sideload in PowerPoint (macOS)
```bash
mkdir -p ~/Library/Containers/com.microsoft.Powerpoint/Data/Documents/wef
cp manifest.xml ~/Library/Containers/com.microsoft.Powerpoint/Data/Documents/wef/
```

### Sideload in PowerPoint (Windows)
1. Open PowerPoint → Insert → My Add-ins → Shared Folder
2. Add the network share containing `manifest.xml`

## 📁 Project Structure

```
Slides-Icons/
├── src/
│   ├── taskpane/          # Main UI (HTML, CSS, JS)
│   └── manifests/         # Extracted icon JSON files (107 libraries)
├── scripts/
│   ├── extract-open-icons.js   # Icon extraction script
│   └── build.js                # Build script
├── images/                # Screenshots and assets
├── dist/                  # Built output
└── manifest.xml          # Office Add-in manifest
```

## 🙏 Credits

- **Icons**: Powered by [Open-Icons](https://github.com/cenfun/open-icons) by Cenfun
- All icons are licensed under their respective open-source licenses (MIT, Apache, etc.)

## 📄 License

MIT License - Free for personal and commercial use.
