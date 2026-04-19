import { NextRequest, NextResponse } from "next/server";
import { scrapeUrl } from "@/lib/scraper";

// Simple in-memory cache (5 minute TTL)
const cache = new Map<string, { data: unknown; expires: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getCached(key: string): unknown | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expires) {
    cache.delete(key);
    return null;
  }
  return entry.data;
}

function setCache(key: string, data: unknown): void {
  cache.set(key, { data, expires: Date.now() + CACHE_TTL });
  // Clean old entries periodically
  if (cache.size > 100) {
    const now = Date.now();
    for (const [k, v] of cache.entries()) {
      if (now > v.expires) cache.delete(k);
    }
  }
}

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url || typeof url !== "string") {
      return NextResponse.json({ success: false, error: "Invalid URL provided." }, { status: 400 });
    }

    // Basic URL validation
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
    } catch {
      return NextResponse.json({ success: false, error: "Invalid URL format." }, { status: 400 });
    }

    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      return NextResponse.json({ success: false, error: "Only HTTP/HTTPS URLs are supported." }, { status: 400 });
    }

    // Check cache first
    const cacheKey = `scrape:${url}`;
    const cached = getCached(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }

    const { items, platform } = await scrapeUrl(url);

    const response = {
      success: true,
      items,
      platform,
      totalFound: items.length,
    };

    // Cache the result
    setCache(cacheKey, response);

    return NextResponse.json(response);
  } catch (err) {
    console.error("Scrape API error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to scrape the URL. The site may be blocking requests." },
      { status: 500 }
    );
  }
}
