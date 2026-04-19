import { NextRequest, NextResponse } from "next/server";
import { ProfileMedia } from "@/types";
import path from "path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function generateId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

// ─── Shared headers ────────────────────────────────────────────────────────────
const USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:125.0) Gecko/20100101 Firefox/125.0",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36 Edg/123.0.0.0",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
];

function getRandomUserAgent(): string {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ─── Twitter / X ───────────────────────────────────────────────────────────────
// Public bearer token embedded in every Twitter web client build
const TWITTER_BEARER =
  "AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA";

async function getGuestToken(): Promise<string> {
  const res = await fetch("https://api.twitter.com/1.1/guest/activate.json", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${TWITTER_BEARER}`,
      "Content-Type": "application/json",
      "User-Agent": getRandomUserAgent(),
    },
  });
  if (!res.ok) throw new Error(`Guest token HTTP ${res.status}`);
  const json = await res.json();
  return json.guest_token as string;
}

async function fetchTwitterMedia(handle: string): Promise<{
  items: ProfileMedia[];
  profile: { name: string; avatar?: string; count: number } | null;
}> {
  // Twitter/X has significantly restricted their API
  // Guest tokens are often rate limited or blocked
  throw new Error("Twitter/X has restricted API access. Use URL Extract tab with direct post URLs instead.");
}

// ─── Instagram ─────────────────────────────────────────────────────────────────
async function fetchInstagramMedia(handle: string): Promise<{
  items: ProfileMedia[];
  profile: { name: string; avatar?: string; count: number } | null;
}> {
  // Instagram has locked down their API significantly
  // Most public endpoints are rate limited or blocked
  throw new Error("Instagram has restricted API access. Use URL Extract tab with direct post URLs instead.");
}

// ─── Route handler ─────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { platform, handle, instagramUsername, instagramPassword } = body;

    if (!platform || !handle) {
      return NextResponse.json(
        { success: false, error: "Platform and handle are required." },
        { status: 400 }
      );
    }

    const cleanHandle = handle.replace(/^@/, "").trim();

    let result: {
      items: ProfileMedia[];
      profile: { name: string; avatar?: string; count: number } | null;
    };

    try {
      if (platform === "twitter") {
        result = await fetchTwitterMedia(cleanHandle);
      } else if (platform === "instagram") {
        result = await fetchInstagramMedia(cleanHandle);
      } else {
        return NextResponse.json(
          { success: false, error: "Unsupported platform." },
          { status: 400 }
        );
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`Profile fetch error [${platform}/@${cleanHandle}]:`, msg);
      
      let userError = `Could not fetch media for @${cleanHandle}. `;
      
      if (msg.includes("429") || msg.includes("rate limit") || msg.includes("RATE_LIMITED")) {
        userError += "Instagram/Twitter is rate limiting our requests. ";
        userError += "Try again in a few minutes, or use the URL Extract tab with direct post URLs instead.";
      } else if (msg.includes("private")) {
        userError += "The profile appears to be private. ";
        userError += "Try using the URL Extract tab with direct post URLs instead.";
      } else {
        userError += "The platform may have changed its API. ";
        userError += "Try using the URL Extract tab with direct post URLs instead.";
      }
      
      return NextResponse.json({
        success: false,
        error: userError,
      });
    }

    if (result.items.length === 0) {
      return NextResponse.json({
        success: false,
        error: `No media found for @${cleanHandle}. The profile may be private, have no posts, or the platform is rate-limiting requests.`,
      });
    }

    return NextResponse.json({
      success: true,
      items: result.items,
      profile: result.profile,
    });
  } catch (err) {
    console.error("Profile API error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to fetch profile media." },
      { status: 500 }
    );
  }
}
