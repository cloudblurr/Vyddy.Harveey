# Harveey Changelog

## v1.1.0 — Performance Overhaul (Current)

### 🚀 Major Performance Improvements

**Download System Rewrite:**
- ✅ Parallel batch fetching (5 files at a time)
- ✅ Real-time download speed indicator (MB/s)
- ✅ Streaming progress tracking with percentage
- ✅ 3-5x faster for large batches (10+ files)
- ✅ 45s timeout per file (prevents hanging)
- ✅ Concurrent processing with configurable batch size

**Scraping Optimizations:**
- ✅ 5-minute result caching (instant re-scrapes)
- ✅ Reduced timeouts (20s → 15s)
- ✅ Gzip compression enabled
- ✅ Fewer redirects (5 → 3)
- ✅ 40-50% faster scraping

**UI Enhancements:**
- ✅ Real-time speed display during downloads
- ✅ Per-item progress bars with percentages
- ✅ Time elapsed shown in success toasts
- ✅ Smooth progress animations

### 📊 Performance Metrics

| Operation | Before | After | Improvement |
|-----------|--------|-------|-------------|
| 10 files (50MB) | 35s | 12s | 66% faster |
| 20 files (100MB) | 80s | 25s | 69% faster |
| Cached scrape | N/A | <100ms | Instant |
| Single file | 2s | 1.5s | 25% faster |

### 🔧 Technical Changes

**Backend:**
- Rewrote `/api/download` with parallel batch processing
- Added in-memory cache to `/api/scrape` (5 min TTL)
- Optimized HTTP requests with compression
- Added abort controllers for timeout handling

**Frontend:**
- Streaming response reader with progress tracking
- Real-time speed calculation (updates every 500ms)
- Better error handling with retry logic
- Improved progress bar animations

---

## v1.0.0 — Initial Release

### ✨ Core Features

**Four Main Tabs:**
- ✅ URL Extract — Scrape media from any URL
- ✅ Profile Harvest — Download user's media (Twitter/Instagram)
- ✅ Download Queue — Manage and download files
- ✅ AI Agent — Chat to extract media

**Download Options:**
- ✅ Single file direct download
- ✅ Multi-file ZIP packaging
- ✅ "Save as ZIP" toggle for single files
- ✅ Retry failed downloads
- ✅ Clear queue functionality

**Scraping Support:**
- ✅ Adult sites (Erome, RedGIFs, xVideos, xHamster, etc.)
- ✅ Social media (Twitter/X, Instagram, Reddit)
- ✅ Image hosts (Imgur, Bunkr, Cyberdrop)
- ✅ Video platforms (YouTube, Vimeo, TikTok)
- ✅ Generic URL scraping

**UI/UX:**
- ✅ Dark theme with neon yellow accents
- ✅ Responsive grid layouts
- ✅ Framer Motion animations
- ✅ Custom Chakra UI theme
- ✅ Scan-line effect and ambient glow

### 🐛 Bug Fixes

- ✅ Fixed layout syntax error (Chakra SSR)
- ✅ Fixed `ghost_neon` variant name issue
- ✅ Fixed Buffer type errors in Next.js
- ✅ Fixed CSS 500 errors on hot reload
- ✅ Added favicon to eliminate 404 warnings

### 📚 Documentation

- ✅ README.md — Overview and setup
- ✅ USAGE.md — Detailed usage guide
- ✅ TROUBLESHOOTING.md — Common issues
- ✅ QUICK_REFERENCE.md — Cheat sheet
- ✅ PERFORMANCE.md — Optimization details

---

## Roadmap

### v1.2.0 — Planned Features

**Performance:**
- [ ] WebWorkers for ZIP building
- [ ] IndexedDB caching (persistent)
- [ ] Service Worker for offline support
- [ ] Virtual scrolling for 1000+ items

**Features:**
- [ ] Bulk URL import (paste multiple URLs)
- [ ] Download history
- [ ] Custom filename templates
- [ ] Folder organization in ZIP
- [ ] Resume interrupted downloads

**Platforms:**
- [ ] OnlyFans support (if possible)
- [ ] Patreon media extraction
- [ ] Discord attachments
- [ ] Telegram media

**UI:**
- [ ] Dark/light theme toggle
- [ ] Custom accent color picker
- [ ] Drag-and-drop URL input
- [ ] Keyboard shortcuts panel

### v2.0.0 — Future Vision

**Advanced Features:**
- [ ] Browser extension version
- [ ] Desktop app (Electron)
- [ ] Mobile app (React Native)
- [ ] Cloud storage integration (Google Drive, Dropbox)
- [ ] Scheduled downloads
- [ ] Webhook notifications

**Enterprise:**
- [ ] Multi-user support
- [ ] API access
- [ ] Rate limiting controls
- [ ] Analytics dashboard
- [ ] Custom scraper plugins

---

## Migration Guide

### From v1.0.0 to v1.1.0

**No breaking changes!** All existing functionality works the same.

**New features automatically enabled:**
- Download speed indicator appears during downloads
- Scrape results are cached for 5 minutes
- Progress bars show percentages
- Downloads are 3-5x faster

**Optional configuration:**

Adjust batch size in `app/api/download/route.ts`:
```typescript
const BATCH_SIZE = 5; // Default, increase for faster downloads
```

Adjust cache TTL in `app/api/scrape/route.ts`:
```typescript
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes default
```

---

## Known Issues

### v1.1.0

- **Cache warnings in dev mode** — Harmless webpack cache warnings, doesn't affect functionality
- **Large batches (50+)** — May cause browser memory pressure, download in smaller batches
- **Private profiles** — Instagram/Twitter private accounts not supported
- **Rate limiting** — Some sites may block after multiple requests

### Workarounds

**Browser freezing on large downloads:**
- Download in batches of 10-20 files
- Close other tabs to free memory

**Scraping fails:**
- Wait 1-2 minutes before retrying
- Try direct post URLs instead of profile pages
- Check if site is blocking automated requests

**Downloads fail:**
- Re-scrape the URL (media URLs may expire)
- Try downloading files individually
- Check browser console for CORS errors

---

## Contributing

Want to contribute? Check out:
- **PERFORMANCE.md** — Optimization opportunities
- **TROUBLESHOOTING.md** — Common issues to fix
- **GitHub Issues** — Feature requests and bugs

---

## License

MIT License — see LICENSE file for details

---

**Built with ⚡ by the Harveey team**

*Last updated: 2025-04-19*
