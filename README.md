# Harveey — AI Media Extractor

An AI-powered media harvester for adult sites, social media, and any URL with embedded content.

![Harveey](https://img.shields.io/badge/Next.js-14-black?logo=next.js) ![Chakra UI](https://img.shields.io/badge/Chakra_UI-Dark_Theme-319795?logo=chakraui) ![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue?logo=typescript)

## ✨ Features

- **🔗 URL Extract** — Paste any URL to extract all images, videos, and GIFs from the page
- **👤 Profile Harvest** — Enter a Twitter/X or Instagram handle to browse and multi-select all their posted media
- **📥 Download Queue** — Manage downloads; single files download directly, multiple files are zipped
- **🤖 AI Agent** — Chat with the Harveey agent to extract media from any URL using natural language

## 🎯 Supported Platforms

**Adult Sites:** Erome, RedGIFs, xVideos, xHamster, PornHub, XNXX, SpankBang, Bunkr, Cyberdrop, Coomer, Kemono

**Social Media:** Twitter/X, Instagram, Reddit, Facebook, TikTok

**Video Platforms:** YouTube, Vimeo

**Image Hosts:** Imgur, Gfycat, Tumblr

**Generic:** Any URL with embedded images, videos, or media content

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Copy environment file
cp .env.example .env.local

# 3. Run dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🎨 UI/UX

- **Dark theme** with neon yellow (`#ffeb3b`) accents
- **Chakra UI** components with custom variants
- **Framer Motion** animations throughout
- **Responsive grid** layouts for media browsing
- **Scan-line effect** and ambient glow for cyberpunk aesthetic

## 🔧 Environment Variables

Create a `.env.local` file with:

```env
# DigitalOcean AI Agent (optional - for AI chat feature)
AGENT_ENDPOINT=https://fujduaaklpje5mkns7vwjpqw.agents.do-ai.run
AGENT_API_KEY=fIhPlDAAOiA_3VJMj_cg3QHN5lz5q0K_

# Python command (optional - for extended scraping)
PYTHON_COMMAND=python3
```

## 📦 Tech Stack

- **Next.js 14** (App Router)
- **React 18** with TypeScript
- **Chakra UI** + **Framer Motion** — UI components and animations
- **Cheerio** — HTML parsing and scraping
- **Axios** — HTTP requests
- **Archiver** — ZIP file creation for bulk downloads
- **DigitalOcean AI** — Agent backend (optional)

## 🛠️ How It Works

### URL Extraction
1. User pastes a URL
2. Backend fetches the HTML
3. Cheerio parses the page for:
   - `<img>` tags (src, data-src, data-lazy-src)
   - `<video>` tags and `<source>` elements
   - Direct media links in `<a>` tags
   - Open Graph meta tags
   - JSON-LD structured data
   - Background images in style attributes
4. Platform-specific scrapers for Erome, RedGIFs, Imgur
5. Results displayed in responsive grid with thumbnails

### Profile Harvesting
- **Twitter/X:** Uses Nitter instances (public proxy) to fetch media
- **Instagram:** Parses public profile data from Instagram's shared data
- Multi-select interface with profile card

### Downloads
- Single file: Direct download
- Multiple files: Zipped with timestamp filename
- Progress tracking and error handling
- Retry failed downloads

### AI Agent
- Chat interface powered by DigitalOcean AI
- Auto-detects URLs in messages
- Scrapes and displays media inline
- "Add All to Queue" button for batch operations

## 🎯 Usage Examples

### Extract from Adult Site
```
1. Go to URL Extract tab
2. Paste: https://www.erome.com/a/albumID
3. Click Extract
4. Select media items
5. Add to queue and download
```

### Harvest Twitter Profile
```
1. Go to Profile Harvest tab
2. Select Twitter/X
3. Enter: username (without @)
4. Click Harvest
5. Multi-select media
6. Add to queue
```

### Use AI Agent
```
1. Go to AI Agent tab
2. Type: "Extract all videos from https://example.com"
3. Agent scrapes and shows results
4. Click "Add All to Queue"
```

## ⚠️ Limitations

- **Rate Limiting:** Some sites may block automated requests
- **Private Profiles:** Instagram/Twitter private accounts won't work
- **Dynamic Content:** Sites with heavy JavaScript may need browser automation
- **CORS:** Some media URLs may have CORS restrictions
- **Legal:** Respect copyright and terms of service

## 🔐 Privacy & Security

- All scraping happens server-side
- No data is stored or logged
- Downloads are streamed directly to your browser
- No third-party tracking or analytics

## 📝 License

MIT License - feel free to use for personal projects.

## 🤝 Contributing

This is a personal project, but suggestions and improvements are welcome!

---

**Built with ⚡ by the Harveey team**
