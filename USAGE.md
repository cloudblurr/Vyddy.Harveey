# Harveey Usage Guide

## Quick Start

1. **Start the dev server:**
   ```bash
   npm run dev
   ```

2. **Open in browser:**
   - Navigate to http://localhost:3002 (or whatever port Next.js assigns)

3. **Start harvesting media!**

---

## Tab 1: URL Extract

**Purpose:** Extract all media from any URL

### How to Use:
1. Paste a URL in the input field (e.g., `https://www.erome.com/a/albumID`)
2. Click **Extract** or press Enter
3. Wait for the AI agent to scan the page
4. Review the media grid — all items are auto-selected
5. Click **Add to Queue** to add selected items to downloads

### Tips:
- Works best with direct media pages (albums, galleries, posts)
- Supports images, videos, GIFs, and embedded content
- Click platform chips below the input to quickly test URLs
- Use the checkboxes to select/deselect specific items

### Supported Platforms:
- **Adult sites:** Erome, RedGIFs, xVideos, xHamster, PornHub, XNXX, SpankBang
- **Image hosts:** Imgur, Bunkr, Cyberdrop
- **Social media:** Twitter/X posts, Instagram posts, Reddit threads
- **Generic:** Any URL with `<img>`, `<video>`, or embedded media

---

## Tab 2: Profile Harvest

**Purpose:** Browse and download all media from a user's profile

### How to Use:
1. Select platform (Twitter/X or Instagram)
2. Enter username (without the @ symbol)
3. Click **Harvest**
4. Browse the media grid with profile info at top
5. Multi-select items you want
6. Click **Add to Queue**

### Tips:
- Only works with **public** profiles
- Twitter uses Nitter proxy (may be slow)
- Instagram scraping may break if they change their page structure
- For private accounts, try using direct post URLs in URL Extract instead

### Limitations:
- Stories are not supported
- Reels may not work consistently
- Rate limiting is common on Twitter
- Instagram may require multiple attempts

---

## Tab 3: Download Queue

**Purpose:** Manage and download all queued media

### How to Use:

#### Single Item:
1. Toggle **"Save as ZIP"** if you want it zipped (off by default)
2. Click **Download** button in header, or
3. Click the download icon on the individual item

#### Multiple Items:
1. All items are automatically zipped
2. Click **Download All (N) as ZIP** button
3. Wait for the progress bar to complete
4. Browser will download the ZIP file

### Features:
- **Status indicators:** Pending (gray), Downloading (yellow), Done (green), Error (red)
- **Retry failed downloads:** Click the refresh icon on error items
- **Remove items:** Click the X icon on any item
- **Clear all:** Click "Clear All" button to empty the queue
- **Progress tracking:** See real-time download progress

### ZIP Behavior:
- **1 item + toggle OFF** → Direct download (single file)
- **1 item + toggle ON** → ZIP with 1 file inside
- **2+ items** → Always ZIP (toggle hidden)
- ZIP filename format: `harveey_YYYY-MM-DD_Nfiles.zip`

### Troubleshooting:
- **Download fails:** Media URL may have expired — re-scrape the source URL
- **CORS errors:** Some sites block direct downloads — try a different URL
- **Slow downloads:** Large files or many items take time — be patient
- **Corrupted files:** Network interruption — retry the failed items

---

## Tab 4: AI Agent

**Purpose:** Chat with Harveey to extract media using natural language

### How to Use:
1. Type a message or paste a URL
2. Press Enter or click Send
3. Agent responds and auto-scrapes any URLs found
4. Media thumbnails appear inline
5. Click **Add All to Queue** to add them

### Example Prompts:
- `Extract all videos from https://example.com`
- `Find all images on this page and download them`
- `Scrape media from a Twitter thread`
- `Download all media from an Erome album`

### Tips:
- Agent auto-detects URLs in your messages
- Can handle multiple URLs in one message
- Shows up to 8 thumbnails inline (+ count if more)
- Requires valid `AGENT_ENDPOINT` and `AGENT_API_KEY` in `.env.local`

### Fallback:
If the agent is unavailable, you can still use URL Extract and Profile Harvest tabs — they work independently.

---

## Download Locations

- **Windows:** `C:\Users\YourName\Downloads\`
- **Mac:** `~/Downloads/`
- **Linux:** `~/Downloads/`

Files are saved with their original names or auto-generated names like:
- `harveey_image_1.jpg`
- `harveey_video_2.mp4`
- `harveey_2025-04-19_5files.zip`

---

## Keyboard Shortcuts

- **Enter** in URL input → Extract
- **Enter** in Profile input → Harvest
- **Enter** in Agent chat → Send message

---

## Common Workflows

### Workflow 1: Download an Erome Album
1. Go to **URL Extract** tab
2. Paste Erome album URL
3. Click **Extract**
4. All media auto-selected → **Add to Queue**
5. Go to **Download Queue** tab
6. Click **Download All as ZIP**

### Workflow 2: Download Twitter User's Media
1. Go to **Profile Harvest** tab
2. Select **Twitter/X**
3. Enter username (e.g., `username`)
4. Click **Harvest**
5. Multi-select desired media
6. **Add to Queue**
7. Go to **Download Queue** → **Download All as ZIP**

### Workflow 3: Extract from Multiple URLs
1. Go to **URL Extract** tab
2. Extract from first URL → **Add to Queue**
3. Clear the input, paste second URL
4. Extract → **Add to Queue**
5. Repeat for more URLs
6. Go to **Download Queue** → **Download All as ZIP**
7. All media from all URLs in one ZIP!

### Workflow 4: Use AI Agent
1. Go to **AI Agent** tab
2. Type: `Extract all media from https://example.com/gallery`
3. Agent scrapes and shows thumbnails
4. Click **Add All to Queue**
5. Go to **Download Queue** → **Download**

---

## Best Practices

✅ **DO:**
- Test with known working URLs first (Imgur, Erome)
- Use direct media page URLs (albums, galleries, posts)
- Download in batches rather than all at once
- Clear the queue after downloading
- Retry failed items before re-scraping

❌ **DON'T:**
- Scrape private/authenticated content
- Hammer the same site repeatedly (rate limits)
- Download 100+ items at once (browser may freeze)
- Expect 100% success rate (some sites block scrapers)
- Share your `.env.local` file (contains API keys)

---

## Performance Tips

- **Slow scraping?** The site may be rate-limiting — wait a few minutes
- **Downloads timing out?** Try downloading items individually instead of bulk
- **Browser freezing?** Too many items — download in smaller batches
- **Media not loading?** Thumbnails may be broken — the actual files might still work

---

## Legal & Ethical Use

⚠️ **Important:**
- Respect copyright and intellectual property
- Follow each platform's Terms of Service
- Don't redistribute downloaded content without permission
- Use responsibly and legally
- Some content may be protected or private

Harveey is a tool — you are responsible for how you use it.

---

## Getting Help

1. Check **TROUBLESHOOTING.md** for common issues
2. Check browser console (F12) for errors
3. Check terminal/server logs for API errors
4. Try a different URL or platform
5. Clear `.next` cache and restart: `rm -rf .next && npm run dev`

---

**Happy harvesting! ⚡**
