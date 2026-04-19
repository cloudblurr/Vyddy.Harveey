import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import path from "path";

const execAsync = promisify(exec);

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SCRIPT_PATH = path.join(process.cwd(), "scripts", "instagram_scraper.py");
const PYTHON_CMD = process.env.PYTHON_COMMAND || "python";

function generateId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { url, username, action } = body;

    // Validate input
    if (action === "profile" && username) {
      return await scrapeProfile(username);
    } else if (url) {
      return await scrapePost(url);
    } else {
      return NextResponse.json(
        { success: false, error: "Provide a 'url' or 'username' with action='profile'" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Instagram scraper error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process request" },
      { status: 500 }
    );
  }
}

async function scrapePost(url: string): Promise<NextResponse> {
  try {
    // Run Python scraper
    const { stdout, stderr } = await execAsync(
      `"${PYTHON_CMD}" "${SCRIPT_PATH}" "${url}"`,
      {
        timeout: 30000,
        maxBuffer: 1024 * 1024 * 10, // 10MB buffer
      }
    );

    if (stderr && !stdout) {
      console.error("Python stderr:", stderr);
      return NextResponse.json({
        success: false,
        error: "Instagram scraper failed. Make sure instagrapi is installed: pip install instagrapi",
      });
    }

    const result = JSON.parse(stdout);

    if (result.error) {
      return NextResponse.json({
        success: false,
        error: result.error,
      });
    }

    // Transform to our format
    const items = (result.items || []).map((item: any, index: number) => ({
      id: generateId(),
      url: item.url,
      thumbnail: item.thumbnail || item.url,
      type: item.type,
      filename: item.filename || `instagram_${index + 1}.${item.type === "video" ? "mp4" : "jpg"}`,
      status: "pending",
      platform: "Instagram",
    }));

    return NextResponse.json({
      success: true,
      items,
      meta: {
        caption: result.caption,
        username: result.username,
        likes: result.likes,
        comments: result.comments,
      },
    });
  } catch (error: any) {
    console.error("Scrape post error:", error);
    
    // Check if it's a Python not found error
    if (error.message?.includes("not found") || error.message?.includes("ENOENT")) {
      return NextResponse.json({
        success: false,
        error: "Python not found. Install Python and instagrapi: pip install instagrapi",
      });
    }
    
    return NextResponse.json({
      success: false,
      error: error.message || "Failed to scrape Instagram post",
    });
  }
}

async function scrapeProfile(username: string): Promise<NextResponse> {
  try {
    const { stdout, stderr } = await execAsync(
      `"${PYTHON_CMD}" "${SCRIPT_PATH}" --profile "${username}"`,
      {
        timeout: 60000, // 1 minute for profiles
        maxBuffer: 1024 * 1024 * 50, // 50MB buffer for large profiles
      }
    );

    if (stderr && !stdout) {
      return NextResponse.json({
        success: false,
        error: "Instagram scraper failed",
      });
    }

    const result = JSON.parse(stdout);

    if (result.error) {
      return NextResponse.json({
        success: false,
        error: result.error,
      });
    }

    const items = (result.items || []).map((item: any, index: number) => ({
      id: generateId(),
      url: item.url,
      thumbnail: item.thumbnail || item.url,
      type: item.type,
      filename: item.filename || `instagram_${index + 1}.${item.type === "video" ? "mp4" : "jpg"}`,
      status: "pending",
      platform: "Instagram",
      postUrl: item.post_url,
    }));

    return NextResponse.json({
      success: true,
      items,
      meta: {
        username: result.username,
        total: result.total,
      },
    });
  } catch (error: any) {
    console.error("Scrape profile error:", error);
    return NextResponse.json({
      success: false,
      error: error.message || "Failed to scrape Instagram profile",
    });
  }
}

// Health check
export async function GET() {
  try {
    // Check if Python is available
    await execAsync(`"${PYTHON_CMD}" --version`, { timeout: 5000 });
    
    return NextResponse.json({
      status: "ok",
      python: "available",
      message: "Instagram scraper ready. Install instagrapi: pip install instagrapi",
    });
  } catch {
    return NextResponse.json({
      status: "warning",
      python: "not found",
      message: "Python not installed or not in PATH",
    });
  }
}
