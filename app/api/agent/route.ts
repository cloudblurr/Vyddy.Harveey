import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { scrapeUrl } from "@/lib/scraper";
import { DownloadItem } from "@/types";

const AGENT_ENDPOINT = process.env.AGENT_ENDPOINT || "https://fujduaaklpje5mkns7vwjpqw.agents.do-ai.run";
const AGENT_API_KEY = process.env.AGENT_API_KEY || "fIhPlDAAOiA_3VJMj_cg3QHN5lz5q0K_";

// Extract URLs from text
function extractUrls(text: string): string[] {
  const urlRegex = /https?:\/\/[^\s<>"{}|\\^`[\]]+/gi;
  return [...new Set(text.match(urlRegex) || [])];
}

// Call the DigitalOcean AI agent
async function callAgent(message: string, history: Array<{ role: string; content: string }>): Promise<string> {
  try {
    const response = await axios.post(
      `${AGENT_ENDPOINT}/api/v1/chat/completions`,
      {
        model: "harveey-agent",
        messages: [
          {
            role: "system",
            content: `You are Harveey, an AI-powered media extraction assistant. Your job is to help users extract, scrape, and download media (images, videos, GIFs) from any URL or platform. 

When a user provides a URL, acknowledge it and tell them you're extracting media from it. Be concise and helpful. If they ask about a specific platform (Twitter, Instagram, Erome, RedGIFs, xVideos, xHamster, etc.), explain what you can do.

Always be direct and action-oriented. When you detect a URL in the user's message, confirm you'll extract media from it.`,
          },
          ...history.map((m) => ({ role: m.role, content: m.content })),
          { role: "user", content: message },
        ],
        max_tokens: 500,
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${AGENT_API_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 30000,
      }
    );

    return response.data?.choices?.[0]?.message?.content || "I'm ready to help you extract media. Please provide a URL.";
  } catch (err: unknown) {
    // Fallback response if agent is unavailable
    const urls = extractUrls(message);
    if (urls.length > 0) {
      return `I found ${urls.length} URL${urls.length > 1 ? "s" : ""} in your message. Extracting media now...`;
    }
    return "I'm here to help you extract media from any URL. Just paste a link and I'll harvest all the media from it!";
  }
}

export async function POST(req: NextRequest) {
  try {
    const { message, history = [] } = await req.json();

    if (!message) {
      return NextResponse.json({ error: "Message is required." }, { status: 400 });
    }

    // Extract URLs from the message
    const urls = extractUrls(message);
    let mediaItems: DownloadItem[] = [];

    // Get agent reply
    const reply = await callAgent(message, history);

    // If URLs found, scrape them
    if (urls.length > 0) {
      const scrapePromises = urls.slice(0, 3).map((url) => scrapeUrl(url)); // Limit to 3 URLs
      const results = await Promise.allSettled(scrapePromises);

      results.forEach((result) => {
        if (result.status === "fulfilled") {
          mediaItems = [...mediaItems, ...result.value.items];
        }
      });
    }

    return NextResponse.json({
      reply,
      mediaItems: mediaItems.slice(0, 50), // Cap at 50 items in chat
    });
  } catch (err) {
    console.error("Agent API error:", err);
    return NextResponse.json(
      { reply: "I encountered an error. Please try again.", mediaItems: [] },
      { status: 500 }
    );
  }
}
