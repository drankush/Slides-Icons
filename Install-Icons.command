#!/bin/bash
#
# Slides Icons - PowerPoint Add-in Installer for macOS
# 
# Double-click this file to install the add-in.
# After installation, restart PowerPoint and go to Insert > My Add-ins.
#

# Set window title
echo -n -e "\033]0;Slides Icons Installer\007"

# Get the directory where this script is located
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Define the target directory for PowerPoint Add-ins on macOS
TARGET_DIR="$HOME/Library/Containers/com.microsoft.Powerpoint/Data/Documents/wef"

echo ""
echo "╔═══════════════════════════════════════════════╗"
echo "║       Slides Icons - Add-in Installer         ║"
echo "║          94,000+ icons for PowerPoint         ║"
echo "╚═══════════════════════════════════════════════╝"
echo ""

# Check if PowerPoint is installed
if [ ! -d "$HOME/Library/Containers/com.microsoft.Powerpoint" ]; then
    echo "❌ Error: Microsoft PowerPoint doesn't seem to be installed."
    echo ""
    echo "Please install Microsoft PowerPoint first, then run this installer again."
    echo ""
    read -p "Press Enter to close..."
    exit 1
fi

echo "📦 Installing Slides Icons Add-in..."
echo ""

# Create the directory if it doesn't exist
mkdir -p "$TARGET_DIR"

# Copy the manifest file from the script's folder to the target folder
if [ -f "$DIR/manifest.xml" ]; then
    cp "$DIR/manifest.xml" "$TARGET_DIR/"
    echo "✅ Success! The add-in has been installed."
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "📝 Next Steps:"
    echo ""
    echo "   1. Restart PowerPoint (quit and reopen)"
    echo "   2. Go to Insert → My Add-ins"
    echo "   3. Look under 'Developer Add-ins' or 'Shared Folder'"
    echo "   4. Click on 'Slides Icons' to open the panel"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
else
    echo "❌ Error: manifest.xml not found in the same folder as this installer."
    echo ""
    echo "Please make sure manifest.xml is in the same folder as Install-Icons.command"
fi

echo ""
read -p "Press Enter to close..."
