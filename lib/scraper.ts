import * as cheerio from "cheerio";
import axios from "axios";
import { DownloadItem, MediaType } from "@/types";
import path from "path";

function generateId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

// Detect media type from URL/extension
export function detectMediaType(url: string, contentType?: string): MediaType {
  const ext = path.extname(url.split("?")[0]).toLowerCase();
  const ct = contentType?.toLowerCase() || "";

  if (ct.includes("video") || [".mp4", ".webm", ".mov", ".avi", ".mkv", ".m4v", ".flv"].includes(ext)) return "video";
  if (ct.includes("gif") || ext === ".gif") return "gif";
  if (ct.includes("audio") || [".mp3", ".wav", ".ogg", ".aac", ".flac"].includes(ext)) return "audio";
  if (ct.includes("image") || [".jpg", ".jpeg", ".png", ".webp", ".bmp", ".svg", ".avif"].includes(ext)) return "image";

  // URL pattern hints
  if (/\.(mp4|webm|mov|avi|mkv|m4v|flv)/i.test(url)) return "video";
  if (/\.(gif)/i.test(url)) return "gif";
  if (/\.(jpg|jpeg|png|webp|bmp|avif)/i.test(url)) return "image";

  return "unknown";
}

// Extract filename from URL
export function extractFilename(url: string, type: MediaType, index: number): string {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const basename = path.basename(pathname.split("?")[0]);
    if (basename && basename.includes(".")) return basename;
  } catch {}

  const ext = type === "video" ? ".mp4" : type === "gif" ? ".gif" : type === "audio" ? ".mp3" : ".jpg";
  return `harveey_${type}_${index + 1}${ext}`;
}

// Detect platform from URL
export function detectPlatform(url: string): string {
  try {
    const hostname = new URL(url).hostname.replace("www.", "");
    const platforms: Record<string, string> = {
      "xvideos.com": "XVideos",
      "xhamster.com": "xHamster",
      "xhamster.desi": "xHamster",
      "redgifs.com": "RedGIFs",
      "erome.com": "Erome",
      "instagram.com": "Instagram",
      "twitter.com": "Twitter",
      "x.com": "Twitter/X",
      "facebook.com": "Facebook",
      "reddit.com": "Reddit",
      "imgur.com": "Imgur",
      "gfycat.com": "Gfycat",
      "pornhub.com": "PornHub",
      "xnxx.com": "XNXX",
      "spankbang.com": "SpankBang",
      "tiktok.com": "TikTok",
      "youtube.com": "YouTube",
      "youtu.be": "YouTube",
      "vimeo.com": "Vimeo",
      "tumblr.com": "Tumblr",
      "bunkr.si": "Bunkr",
      "bunkr.ru": "Bunkr",
      "cyberdrop.me": "Cyberdrop",
      "coomer.party": "Coomer",
      "kemono.party": "Kemono",
    };
    return platforms[hostname] || hostname;
  } catch {
    return "Unknown";
  }
}

// Generic HTML scraper — extracts all media from a page (OPTIMIZED)
export async function scrapeGenericPage(url: string): Promise<DownloadItem[]> {
  const items: DownloadItem[] = [];

  try {
    const response = await axios.get(url, {
      timeout: 15000, // Reduced from 20s
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Accept-Encoding": "gzip, deflate, br", // Enable compression
        Referer: url,
      },
      maxRedirects: 3, // Reduced from 5
      decompress: true, // Auto-decompress gzip
    });

    const html = response.data as string;
    const $ = cheerio.load(html);
    const seen = new Set<string>();

    const addItem = (mediaUrl: string, thumbnail?: string) => {
      try {
        const absolute = new URL(mediaUrl, url).href;
        if (seen.has(absolute)) return;
        seen.add(absolute);

        const type = detectMediaType(absolute);
        if (type === "unknown") return; // skip non-media

        items.push({
          id: generateId(),
          url: absolute,
          filename: extractFilename(absolute, type, items.length),
          type,
          thumbnail,
          status: "pending",
          sourceUrl: url,
          platform: detectPlatform(url),
        });
      } catch {}
    };

    // Images
    $("img").each((_, el) => {
      const src = $(el).attr("src") || $(el).attr("data-src") || $(el).attr("data-lazy-src");
      if (src && !src.startsWith("data:") && src.length > 10) addItem(src);
    });

    // Videos
    $("video").each((_, el) => {
      const src = $(el).attr("src");
      const poster = $(el).attr("poster");
      if (src) addItem(src, poster ? new URL(poster, url).href : undefined);

      $(el).find("source").each((_, source) => {
        const ssrc = $(source).attr("src");
        if (ssrc) addItem(ssrc, poster ? new URL(poster, url).href : undefined);
      });
    });

    // Direct links to media files
    $("a[href]").each((_, el) => {
      const href = $(el).attr("href");
      if (!href) return;
      const type = detectMediaType(href);
      if (type !== "unknown") addItem(href);
    });

    // OG / meta tags
    const ogImage = $('meta[property="og:image"]').attr("content");
    const ogVideo = $('meta[property="og:video"]').attr("content") || $('meta[property="og:video:url"]').attr("content");
    if (ogImage) addItem(ogImage);
    if (ogVideo) addItem(ogVideo, ogImage);

    // JSON-LD
    $('script[type="application/ld+json"]').each((_, el) => {
      try {
        const json = JSON.parse($(el).html() || "{}");
        const extract = (obj: Record<string, unknown>) => {
          if (!obj || typeof obj !== "object") return;
          for (const [k, v] of Object.entries(obj)) {
            if (typeof v === "string" && (k.toLowerCase().includes("url") || k.toLowerCase().includes("image") || k.toLowerCase().includes("video"))) {
              const t = detectMediaType(v);
              if (t !== "unknown") addItem(v);
            } else if (typeof v === "object") {
              extract(v as Record<string, unknown>);
            }
          }
        };
        extract(json);
      } catch {}
    });

    // Background images in style attributes
    $("[style]").each((_, el) => {
      const style = $(el).attr("style") || "";
      const match = style.match(/url\(['"]?([^'")\s]+)['"]?\)/);
      if (match) addItem(match[1]);
    });

    // data-* attributes that might contain media URLs
    $("[data-video],[data-src],[data-image],[data-url],[data-media]").each((_, el) => {
      const attrs = ["data-video", "data-src", "data-image", "data-url", "data-media"];
      attrs.forEach((attr) => {
        const val = $(el).attr(attr);
        if (val) {
          const t = detectMediaType(val);
          if (t !== "unknown") addItem(val);
        }
      });
    });

  } catch (err) {
    console.error("Scrape error:", err);
  }

  return items;
}

// Erome-specific scraper
export async function scrapeErome(url: string): Promise<DownloadItem[]> {
  const items: DownloadItem[] = [];

  try {
    const response = await axios.get(url, {
      timeout: 20000,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        Referer: "https://www.erome.com/",
      },
    });

    const $ = cheerio.load(response.data);

    $(".album-image img, .album-image source").each((i, el) => {
      const src = $(el).attr("src") || $(el).attr("data-src");
      if (src) {
        const absolute = new URL(src, url).href;
        items.push({
          id: generateId(),
          url: absolute,
          filename: extractFilename(absolute, "image", items.length),
          type: "image",
          thumbnail: absolute,
          status: "pending",
          sourceUrl: url,
          platform: "Erome",
        });
      }
    });

    $(".album-video video, .album-video source").each((i, el) => {
      const src = $(el).attr("src") || $(el).attr("data-src");
      const poster = $(el).closest(".album-video").find("video").attr("poster");
      if (src) {
        const absolute = new URL(src, url).href;
        items.push({
          id: generateId(),
          url: absolute,
          filename: extractFilename(absolute, "video", items.length),
          type: "video",
          thumbnail: poster ? new URL(poster, url).href : undefined,
          status: "pending",
          sourceUrl: url,
          platform: "Erome",
        });
      }
    });

    // Fallback to generic
    if (items.length === 0) {
      return scrapeGenericPage(url);
    }
  } catch {
    return scrapeGenericPage(url);
  }

  return items;
}

// RedGIFs scraper
export async function scrapeRedGifs(url: string): Promise<DownloadItem[]> {
  try {
    // Extract ID from URL
    const match = url.match(/redgifs\.com\/watch\/([a-zA-Z0-9]+)/);
    if (!match) return scrapeGenericPage(url);

    const id = match[1];
    const apiUrl = `https://api.redgifs.com/v2/gifs/${id}`;

    const res = await axios.get(apiUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        Referer: "https://www.redgifs.com/",
      },
      timeout: 10000,
    });

    const gif = res.data?.gif;
    if (!gif) return scrapeGenericPage(url);

    const urls = gif.urls || {};
    const videoUrl = urls.hd || urls.sd || urls.gif;
    const thumbnail = gif.thumbnail || gif.poster;

    if (!videoUrl) return scrapeGenericPage(url);

    return [
      {
        id: generateId(),
        url: videoUrl,
        filename: `${id}.mp4`,
        type: "gif",
        thumbnail,
        status: "pending",
        sourceUrl: url,
        platform: "RedGIFs",
      },
    ];
  } catch {
    return scrapeGenericPage(url);
  }
}

// Imgur scraper
export async function scrapeImgur(url: string): Promise<DownloadItem[]> {
  try {
    const response = await axios.get(url, {
      timeout: 15000,
      headers: { "User-Agent": "Mozilla/5.0" },
    });

    const $ = cheerio.load(response.data);
    const items: DownloadItem[] = [];

    // Imgur embeds media in JSON
    const scriptContent = $('script[type="application/json"]').first().html() || "";
    if (scriptContent) {
      try {
        const data = JSON.parse(scriptContent);
        const images = data?.album_images?.images || data?.image ? [data.image] : [];
        images.forEach((img: Record<string, string>, i: number) => {
          if (img?.link) {
            const type = detectMediaType(img.link);
            items.push({
              id: generateId(),
              url: img.link,
              filename: extractFilename(img.link, type, i),
              type,
              thumbnail: img.link,
              status: "pending",
              sourceUrl: url,
              platform: "Imgur",
            });
          }
        });
      } catch {}
    }

    if (items.length === 0) return scrapeGenericPage(url);
    return items;
  } catch {
    return scrapeGenericPage(url);
  }
}

// Main dispatcher
export async function scrapeUrl(url: string): Promise<{ items: DownloadItem[]; platform: string }> {
  const platform = detectPlatform(url);
  const hostname = (() => {
    try { return new URL(url).hostname.replace("www.", ""); } catch { return ""; }
  })();

  let items: DownloadItem[] = [];

  if (hostname.includes("erome.com")) {
    items = await scrapeErome(url);
  } else if (hostname.includes("redgifs.com")) {
    items = await scrapeRedGifs(url);
  } else if (hostname.includes("imgur.com")) {
    items = await scrapeImgur(url);
  } else if (hostname.includes("twitter.com") || hostname.includes("x.com")) {
    items = await scrapeTwitterPost(url);
  } else if (hostname.includes("instagram.com")) {
    items = await scrapeInstagramPost(url);
  } else {
    items = await scrapeGenericPage(url);
  }

  return { items, platform };
}

// Twitter/X single post scraper via fxtwitter public API
export async function scrapeTwitterPost(url: string): Promise<DownloadItem[]> {
  try {
    // Extract tweet ID from URL
    const match = url.match(/(?:twitter\.com|x\.com)\/[^/]+\/status\/(\d+)/);
    if (!match) return scrapeGenericPage(url);
    const tweetId = match[1];

    // Use fxtwitter's free public API — no auth needed
    const apiUrl = `https://api.fxtwitter.com/status/${tweetId}`;
    const res = await axios.get(apiUrl, {
      timeout: 10000,
      headers: { "User-Agent": "Harveey/1.0" },
    });

    const tweet = res.data?.tweet;
    if (!tweet) return scrapeGenericPage(url);

    const items: DownloadItem[] = [];
    const media: unknown[] = tweet.media?.all ?? tweet.media?.photos ?? tweet.media?.videos ?? [];

    for (const m of media as Array<Record<string, unknown>>) {
      const type = m.type as string;
      if (type === "photo") {
        const imgUrl = m.url as string;
        items.push({
          id: generateId(),
          url: imgUrl,
          thumbnail: imgUrl,
          type: "image",
          filename: `tweet_${tweetId}_${items.length + 1}.jpg`,
          status: "pending",
          sourceUrl: url,
          platform: "Twitter",
        });
      } else if (type === "video" || type === "gif") {
        const variants = m.variants as Array<Record<string, unknown>> | undefined;
        const videoUrl = (m.url ?? variants?.[0]?.url) as string;
        const thumb = m.thumbnail_url as string;
        if (videoUrl) {
          items.push({
            id: generateId(),
            url: videoUrl,
            thumbnail: thumb,
            type: type === "gif" ? "gif" : "video",
            filename: `tweet_${tweetId}_${items.length + 1}.mp4`,
            status: "pending",
            sourceUrl: url,
            platform: "Twitter",
          });
        }
      }
    }

    return items.length > 0 ? items : scrapeGenericPage(url);
  } catch {
    return scrapeGenericPage(url);
  }
}

// Instagram single post scraper - tries Python scraper first, then falls back to GraphQL
export async function scrapeInstagramPost(url: string): Promise<DownloadItem[]> {
  // First, try the Python-based scraper (more reliable)
  try {
    const pythonResult = await tryPythonInstagramScraper(url);
    if (pythonResult.length > 0) {
      return pythonResult;
    }
  } catch (error) {
    console.log("Python Instagram scraper not available, falling back to GraphQL...");
  }

  // Fallback to GraphQL method (often rate-limited)
  return scrapeInstagramPostGraphQL(url);
}

// Try Python-based Instagram scraper
async function tryPythonInstagramScraper(url: string): Promise<DownloadItem[]> {
  try {
    const res = await fetch("http://localhost:3000/api/instagram", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });

    if (!res.ok) return [];

    const data = await res.json();
    if (!data.success || !data.items?.length) return [];

    return data.items.map((item: any) => ({
      id: item.id || generateId(),
      url: item.url,
      thumbnail: item.thumbnail,
      type: item.type,
      filename: item.filename,
      status: "pending" as const,
      sourceUrl: url,
      platform: "Instagram",
    }));
  } catch {
    return [];
  }
}

// GraphQL fallback (often rate-limited)
async function scrapeInstagramPostGraphQL(url: string): Promise<DownloadItem[]> {
  try {
    const match = url.match(/instagram\.com\/(?:p|reel|reels)\/([A-Za-z0-9_-]+)/);
    if (!match) return scrapeGenericPage(url);
    const shortcode = match[1];

    const IG_APP_ID = "936619743392459";
    const CHROME_UA =
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

    const gqlUrl = new URL("https://www.instagram.com/api/graphql");
    gqlUrl.searchParams.set("variables", JSON.stringify({ shortcode }));
    gqlUrl.searchParams.set("doc_id", "10015901848480474");
    gqlUrl.searchParams.set("lsd", "AVqbxe3J_YA");

    const res = await axios.post(
      gqlUrl.toString(),
      null,
      {
        timeout: 12000,
        headers: {
          "User-Agent": CHROME_UA,
          "Content-Type": "application/x-www-form-urlencoded",
          "X-IG-App-ID": IG_APP_ID,
          "X-FB-LSD": "AVqbxe3J_YA",
          "X-ASBD-ID": "129477",
          "Sec-Fetch-Site": "same-origin",
          Referer: "https://www.instagram.com/",
        },
      }
    );

    const node = res.data?.data?.xdt_shortcode_media;
    if (!node) return scrapeGenericPage(url);

    const items: DownloadItem[] = [];

    const processNode = (n: Record<string, unknown>, idx: number) => {
      const isVideo = n.is_video as boolean;
      const videoUrl = n.video_url as string;
      const displayUrl = n.display_url as string;
      const url = isVideo ? videoUrl : displayUrl;
      if (!url) return;
      items.push({
        id: generateId(),
        url,
        thumbnail: displayUrl,
        type: isVideo ? "video" : "image",
        filename: `instagram_${shortcode}_${idx + 1}${isVideo ? ".mp4" : ".jpg"}`,
        status: "pending",
        sourceUrl: `https://www.instagram.com/p/${shortcode}/`,
        platform: "Instagram",
      });
    };

    // Carousel
    const sidecar = (node.edge_sidecar_to_children as Record<string, unknown>)
      ?.edges as Array<Record<string, unknown>>;
    if (sidecar?.length) {
      sidecar.forEach((e, i) => processNode(e.node as Record<string, unknown>, i));
    } else {
      processNode(node, 0);
    }

    return items.length > 0 ? items : scrapeGenericPage(url);
  } catch {
    return scrapeGenericPage(url);
  }
}
