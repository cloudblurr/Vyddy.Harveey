# Harveey Chrome Extension + Download History

## What's New

### Chrome Extension
A full-featured Chrome extension that integrates with the Harveey app:

**Location**: `extension/` folder

**Features**:
- Floating action button (⚡) on social media sites showing detected media count
- Right-click context menu to send any image/video/link to Harveey
- Popup with bulk URL paste support
- Auto-detection of media on current page
- Download history synced with main app
- Keyboard shortcut: `Ctrl+Shift+H` (or `Cmd+Shift+H` on Mac)

**Install**:
1. Go to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `extension` folder

### Download History Tab
New tab in the main app showing all downloads:

- Grid and list view modes
- Search by filename, URL, or platform
- Filter by platform and source (app vs extension)
- Shows thumbnails, timestamps, and status
- Clear individual items or all history

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/extension/send` | POST | Send URLs from extension |
| `/api/extension/send` | GET | Get pending extension items |
| `/api/history` | GET | Get download history |
| `/api/history` | POST | Add items to history |
| `/api/history` | DELETE | Clear history |
| `/api/health` | GET | Health check for extension |

### Files Created

**Extension**:
- `extension/manifest.json` - Extension config
- `extension/popup/popup.html` - Popup UI
- `extension/popup/popup.css` - Popup styles
- `extension/popup/popup.js` - Popup logic
- `extension/content/content.js` - Content script
- `extension/content/content.css` - Content styles
- `extension/background/background.js` - Service worker
- `extension/README.md` - Extension docs

**Main App**:
- `app/api/extension/send/route.ts` - Extension API
- `app/api/history/route.ts` - History API
- `app/api/health/route.ts` - Health check
- `components/DownloadHistory.tsx` - History UI

**Updated**:
- `app/page.tsx` - Added history tab
- `components/TabNav.tsx` - Added history tab
- `types/index.ts` - Added history tab type
- `app/api/download/route.ts` - Saves to history
- `.gitignore` - Ignores history file

## Usage Flow

1. **From Extension**:
   - Browse social media
   - Click floating button or right-click media
   - Send to Harveey
   - Items appear in History tab

2. **From Main App**:
   - Use URL Extract or Profile Browser
   - Download media
   - Items automatically saved to History

3. **History Tab**:
   - View all downloads from both sources
   - Search, filter, and manage
   - Re-download if needed
