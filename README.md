# Slides Icons

**A PowerPoint Add-in with 94,000+ free icons from 100+ open-source libraries.**

![Slides Icons Screenshot](https://raw.githubusercontent.com/drankush/Slides-Icons/main/docs/screenshot.png)

## Features

- 🎨 **100+ Icon Libraries** (Bootstrap, FontAwesome, Material, Octicons, etc.)
- 🖼️ **94,000+ Total Icons**
- ☀️ **Light Mode UI** for better visibility
- 🔍 **Fast Search** & Filtering
- 🌈 **Custom Color & Size**
- 🔲 **Background Color** support for icons
- ⚡ **Local JSON Architecture** - loads fast without external API limits

## Supported Libraries

Includes all libraries from [Open-Icons](https://cenfun.github.io/open-icons/):
- Bootstrap Icons (2000+)
- Material Design Icons (7000+)
- FontAwesome (1400+)
- GitHub Octicons
- Radix Icons
- Feather, Lucide, Ionicons, Tabler, and 90+ more.

## Architecture

**Server-Side Extraction (Build Time):**
We leverage the `open-icons` npm package but solve the browser decompression issue by extracting all icons at build time.
- `scripts/extract-open-icons.js`: Runs in Node.js (JSDOM), loads the UMD bundles, decompresses using the library's native logic, and saves static JSON manifests.
- **Frontend**: Loads these lightweight JSON files on-demand. No heavy decompression in browser!

## development

### 1. Install & Extract Icons
```bash
npm install
# Extracts all 100+ libraries to src/manifests/ (takes ~1 min)
npm run extract-icons
# Generate index
npm run generate-index
```

### 2. Build & Run
```bash
npm run build
npm start
```

### 3. Sideload in PowerPoint (Mac)
```bash
# Copy manifest
mkdir -p ~/Library/Containers/com.microsoft.Powerpoint/Data/Documents/wef
cp manifest.xml ~/Library/Containers/com.microsoft.Powerpoint/Data/Documents/wef/
```

## Credits

Powered by [Open-Icons](https://github.com/cenfun/open-icons) by Cenfun.
All icons are licensed under their respective open-source licenses.

## License

MIT License
