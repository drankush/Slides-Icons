# OpenIcons PowerPoint Add-in

Insert **6,500+ free icons** from 6 open-source libraries directly into your PowerPoint presentations.

## Supported Icon Libraries

| Library | Icons | License |
|---------|-------|---------|
| [Health Icons](https://healthicons.org) | 740 | CC0 |
| [Bootstrap Icons](https://icons.getbootstrap.com) | 2,078 | MIT |
| [Ionicons](https://ionic.io/ionicons) | 396 | MIT |
| [Iconoir](https://iconoir.com) | 1,000 | MIT |
| [Remix Icon](https://remixicon.com) | 1,537 | Apache 2.0 |
| [Boxicons](https://boxicons.com) | 814 | MIT |

## Quick Start

### 1. Install & Build
```bash
npm install
npm run dev
```
This builds the project and starts an HTTPS server at `https://localhost:3000`.

### 2. Sideload in PowerPoint (Mac)
```bash
mkdir -p ~/Library/Containers/com.microsoft.Powerpoint/Data/Documents/wef
cp manifest.xml ~/Library/Containers/com.microsoft.Powerpoint/Data/Documents/wef/
```

### 3. Use in PowerPoint
1. Open PowerPoint
2. Go to **Insert** → **Add-ins** → **OpenIcons**
3. Select a library, browse/search icons, and click to insert!

## Features

- 🎨 **6 icon libraries** with 6,500+ icons
- 🔄 **Multiple styles** per library (Filled, Outline, Solid, etc.)
- 📐 **Adjustable sizes**: 48px, 96px, 128px
- 🔍 **Search**: Find icons by name or keywords
- ⚡ **One-click insert**: Click any icon to add to your slide
- 💾 **CDN caching**: Fast icon loading after first fetch

## License

- **Add-in code**: MIT License
- **Icons**: See individual library licenses above

---

> **Looking for more icons?** Check out [Slides Icons](https://github.com/drankush/Slides-Icons) - our newer add-in with 94,000+ icons!
