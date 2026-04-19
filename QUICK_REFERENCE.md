# Harveey Quick Reference

## 🚀 Start App
```bash
npm run dev
# Open http://localhost:3002
```

## 📑 Four Tabs

| Tab | Purpose | Input | Output |
|-----|---------|-------|--------|
| **URL Extract** | Scrape any URL | Paste URL → Extract | Media grid → Add to Queue |
| **Profile Harvest** | User's media | Platform + Handle → Harvest | Media grid → Add to Queue |
| **Download Queue** | Manage downloads | Toggle ZIP → Download | Files saved to Downloads folder |
| **AI Agent** | Chat to extract | Type/paste URL → Send | Inline media → Add to Queue |

## ⚡ Quick Actions

### Extract from URL
```
1. URL Extract tab
2. Paste URL
3. Extract
4. Add to Queue
5. Download Queue tab
6. Download All as ZIP
```

### Harvest Profile
```
1. Profile Harvest tab
2. Select platform (Twitter/Instagram)
3. Enter username
4. Harvest
5. Select items
6. Add to Queue
7. Download
```

### Use AI Agent
```
1. AI Agent tab
2. Type: "Extract media from [URL]"
3. Add All to Queue
4. Download Queue → Download
```

## 🎯 Supported Sites

**Adult:** Erome, RedGIFs, xVideos, xHamster, PornHub, XNXX, SpankBang, Bunkr, Cyberdrop  
**Social:** Twitter/X, Instagram, Reddit, Facebook  
**Images:** Imgur, Gfycat, Tumblr  
**Video:** YouTube, Vimeo, TikTok  
**Generic:** Any URL with media

## 💾 Download Behavior

| Items | ZIP Toggle | Result |
|-------|-----------|--------|
| 1 item | OFF | Direct download (single file) |
| 1 item | ON | ZIP with 1 file |
| 2+ items | N/A | Always ZIP |

## 🔧 Troubleshooting

| Issue | Solution |
|-------|----------|
| No media found | Try direct media URL, not homepage |
| Download fails | Re-scrape URL (media URLs expire) |
| Profile harvest fails | Check username, ensure public profile |
| CSS 500 errors | Clear cache: `rm -rf .next && npm run dev` |
| Agent not responding | Check `.env.local` has valid keys |

## 📁 File Locations

- **Queue items:** In-memory (lost on refresh)
- **Downloads:** Browser's Downloads folder
- **ZIP format:** `harveey_YYYY-MM-DD_Nfiles.zip`

## ⌨️ Keyboard Shortcuts

- **Enter** in URL input → Extract
- **Enter** in Profile input → Harvest  
- **Enter** in Agent chat → Send

## 🎨 UI Elements

- **Yellow dot** = Downloading
- **Green dot** = Done
- **Red dot** = Error
- **Gray dot** = Pending
- **Refresh icon** = Retry failed
- **X icon** = Remove from queue

## 🔑 Environment Variables

```env
# .env.local
AGENT_ENDPOINT=https://your-agent-endpoint
AGENT_API_KEY=your-api-key
PYTHON_COMMAND=python3  # optional
```

## 📊 Status Badges

In Download Queue header:
- **N pending** = Items waiting to download
- **N active** = Currently downloading
- **N done** = Successfully downloaded
- **N failed** = Errors occurred

## 🚨 Common Errors

| Error | Meaning | Fix |
|-------|---------|-----|
| "No media found" | Page has no extractable media | Try different URL |
| "Network error" | Site blocking requests | Wait and retry |
| "Download failed" | Media URL expired/blocked | Re-scrape source |
| "Profile not found" | Username wrong or private | Check spelling, try public profile |

## 💡 Pro Tips

✅ Test with Imgur/Erome first (most reliable)  
✅ Use direct album/post URLs, not homepages  
✅ Download in batches (10-20 items max)  
✅ Clear queue after downloading  
✅ Retry failed items before re-scraping  

❌ Don't scrape private content  
❌ Don't hammer sites (rate limits)  
❌ Don't download 100+ items at once  

## 📚 Documentation

- **README.md** — Overview and setup
- **USAGE.md** — Detailed usage guide
- **TROUBLESHOOTING.md** — Common issues and solutions
- **QUICK_REFERENCE.md** — This file

## 🎯 Example URLs to Test

```
# Imgur album
https://imgur.com/a/albumID

# Erome album
https://www.erome.com/a/albumID

# RedGIFs
https://www.redgifs.com/watch/gifID

# Twitter post (use URL Extract, not Profile)
https://twitter.com/username/status/123456789
```

---

**Harveey v1.0 — AI Media Extractor ⚡**
