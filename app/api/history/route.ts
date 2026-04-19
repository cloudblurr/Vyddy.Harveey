import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const HISTORY_FILE = path.join(process.cwd(), ".harveey-history.json");

interface HistoryItem {
  id: string;
  url: string;
  filename: string;
  type: string;
  platform?: string;
  status: string;
  timestamp: number;
  source?: string;
  thumbnail?: string;
}

function readHistory(): HistoryItem[] {
  try {
    if (fs.existsSync(HISTORY_FILE)) {
      const data = fs.readFileSync(HISTORY_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (error) {
    console.error("Failed to read history:", error);
  }
  return [];
}

function writeHistory(history: HistoryItem[]) {
  try {
    fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2));
  } catch (error) {
    console.error("Failed to write history:", error);
  }
}

// GET - Retrieve history
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const limit = parseInt(searchParams.get("limit") || "100");
  const offset = parseInt(searchParams.get("offset") || "0");
  const source = searchParams.get("source"); // 'extension' or 'app'
  const platform = searchParams.get("platform");

  let history = readHistory();

  // Filter by source
  if (source) {
    history = history.filter(item => item.source === source);
  }

  // Filter by platform
  if (platform) {
    history = history.filter(item => 
      item.platform?.toLowerCase().includes(platform.toLowerCase())
    );
  }

  // Paginate
  const total = history.length;
  const items = history.slice(offset, offset + limit);

  return NextResponse.json({
    success: true,
    items,
    total,
    limit,
    offset,
  });
}

// POST - Add to history
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { items } = body;

    if (!items || !Array.isArray(items)) {
      return NextResponse.json(
        { success: false, error: "No items provided" },
        { status: 400 }
      );
    }

    const history = readHistory();
    const newItems: HistoryItem[] = items.map((item: any) => ({
      id: item.id || Math.random().toString(36).slice(2) + Date.now().toString(36),
      url: item.url,
      filename: item.filename || "Unknown",
      type: item.type || "unknown",
      platform: item.platform,
      status: item.status || "completed",
      timestamp: item.timestamp || Date.now(),
      source: item.source || "app",
      thumbnail: item.thumbnail,
    }));

    // Prepend new items and limit to 500
    const updatedHistory = [...newItems, ...history].slice(0, 500);
    writeHistory(updatedHistory);

    return NextResponse.json({
      success: true,
      added: newItems.length,
      total: updatedHistory.length,
    });
  } catch (error) {
    console.error("History POST error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to add to history" },
      { status: 500 }
    );
  }
}

// DELETE - Clear history
export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const clearAll = searchParams.get("all") === "true";
  const itemId = searchParams.get("id");

  if (clearAll) {
    writeHistory([]);
    return NextResponse.json({ success: true, message: "History cleared" });
  }

  if (itemId) {
    const history = readHistory();
    const updatedHistory = history.filter(item => item.id !== itemId);
    writeHistory(updatedHistory);
    return NextResponse.json({ success: true, message: "Item removed" });
  }

  return NextResponse.json(
    { success: false, error: "Specify 'all=true' or 'id=<itemId>'" },
    { status: 400 }
  );
}
