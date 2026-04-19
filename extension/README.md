# Harveey Chrome Extension

A Chrome extension that integrates with the Harveey media extraction app, allowing you to quickly send media URLs from any webpage directly to Harveey for downloading.

## Features

- **Floating Action Button**: Appears on social media sites (Twitter, Instagram, Facebook, Reddit, TikTok) with a badge showing detected media count
- **Context Menu Integration**: Right-click on any image, video, or link to send it directly to Harveey
- **Bulk URL Support**: Paste multiple URLs at once in the popup
- **Auto-Detection**: Automatically detects media on the current page
- **Download History**: Tracks all downloads from both the extension and main app
- **Keyboard Shortcut**: Press `Ctrl+Shift+H` (or `Cmd+Shift+H` on Mac) to quickly extract media

## Installation

### Development Mode

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" in the top right
3. Click "Load unpacked"
4. Select the `extension` folder from this project
5. The extension icon should appear in your toolbar

### Configuration

1. Click the extension icon to open the popup
2. By default, it connects to `http://localhost:3000`
3. If your Harveey app is running on a different port, update the URL in settings

## Usage

### Method 1: Floating Button
1. Navigate to a social media page (Twitter, Instagram, etc.)
2. Look for the yellow ⚡ button in the bottom right corner
3. Click it to open the media panel
4. Select the media you want and click "Send to Harveey"

### Method 2: Context Menu
1. Right-click on any image, video, or link
2. Select "Send to Harveey" from the context menu
3. The URL will be sent to the app for processing

### Method 3: Popup
1. Click the extension icon in the toolbar
2. Paste one or more URLs in the text area
3. Click "Send to Harveey"

### Method 4: Extract Current Page
1. Click the extension icon
2. Click "Extract Current Page"
3. All detected media will be sent to Harveey

## Supported Sites

- Twitter / X
- Instagram
- Facebook
- Reddit
- TikTok
- YouTube
- RedGIFs
- And any other site with direct media links

## Permissions

The extension requires the following permissions:

- **storage**: To save settings and history
- **activeTab**: To detect media on the current page
- **contextMenus**: For right-click menu integration
- **clipboardRead**: For the paste button functionality
- **host_permissions**: To access social media sites and communicate with the local app

## API Endpoints

The extension communicates with the Harveey app through these endpoints:

- `POST /api/extension/send` - Send URLs to the app
- `GET /api/health` - Check connection status
- `GET /api/history` - Retrieve download history

## Troubleshooting

### Extension shows "Disconnected"
- Make sure the Harveey app is running
- Check that the app URL in settings is correct
- Verify no firewall is blocking the connection

### No media detected on page
- Some sites use lazy loading - try scrolling down first
- Click the refresh button in the media panel
- The page might not have any supported media

### Context menu not appearing
- Reload the page after installing the extension
- Check that you're right-clicking on an image, video, or link

## Development

### File Structure
```
extension/
├── manifest.json       # Extension configuration
├── popup/
│   ├── popup.html      # Popup UI
│   ├── popup.css       # Popup styles
│   └── popup.js        # Popup logic
├── content/
│   ├── content.js      # Content script (runs on pages)
│   └── content.css     # Content styles
├── background/
│   └── background.js   # Service worker
└── icons/
    └── icon*.png       # Extension icons
```

### Building Icons
The extension needs PNG icons in sizes 16, 32, 48, and 128 pixels. You can:
1. Create them manually from the SVG template
2. Use an online converter
3. Use ImageMagick: `convert icon.svg -resize 48x48 icon48.png`

## License

MIT
