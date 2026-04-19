import { NextRequest, NextResponse } from "next/server";
import { DownloadItem } from "@/types";
import path from "path";
import fs from "fs";

// ── AdjectiveAdjectiveAnimal ZIP name generator ────────────────────────────
const ADJECTIVES = [
  "Amber","Arctic","Blazing","Bold","Brave","Bright","Calm","Clever","Cosmic",
  "Crimson","Crystal","Daring","Dark","Dawn","Deep","Divine","Dusty","Electric",
  "Emerald","Epic","Fierce","Fiery","Frosty","Fuzzy","Giant","Gilded","Glowing",
  "Golden","Grand","Gritty","Hidden","Hollow","Icy","Indigo","Iron","Jade",
  "Jolly","Keen","Lazy","Lofty","Lone","Lucky","Lunar","Majestic","Marble",
  "Mighty","Misty","Neon","Noble","Obsidian","Odd","Onyx","Pale","Phantom",
  "Primal","Proud","Quiet","Radiant","Rapid","Rogue","Royal","Ruby","Rustic",
  "Sacred","Savage","Scarlet","Shadow","Sharp","Silent","Silver","Sleek","Sly",
  "Solar","Sonic","Spectral","Stealthy","Steel","Stormy","Strange","Swift",
  "Teal","Thunder","Tiny","Toxic","Turbo","Twilight","Ultra","Velvet","Vibrant",
  "Violet","Vivid","Wild","Windy","Wired","Wise","Witty","Zany","Zealous","Zen",
];

const ANIMALS = [
  "Albatross","Axolotl","Badger","Basilisk","Bear","Bison","Bobcat","Buffalo",
  "Capybara","Caracal","Cheetah","Chimera","Cobra","Condor","Cougar","Coyote",
  "Crane","Crow","Dingo","Dolphin","Dragon","Eagle","Falcon","Ferret","Fox",
  "Gecko","Gorilla","Griffin","Grizzly","Hawk","Hedgehog","Hippo","Hyena",
  "Ibis","Iguana","Jaguar","Kestrel","Komodo","Kraken","Lemur","Leopard",
  "Lynx","Mamba","Manta","Marmot","Mongoose","Moose","Narwhal","Ocelot",
  "Osprey","Otter","Panther","Parrot","Pelican","Phoenix","Puma","Python",
  "Raven","Rhino","Salamander","Scorpion","Serval","Shark","Sloth","Sphinx",
  "Stallion","Stingray","Stoat","Tiger","Titan","Toucan","Viper","Vulture",
  "Walrus","Weasel","Wolf","Wolverine","Wombat","Wyvern","Yak","Zebra",
];

function generateZipName(): string {
  const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
  const adj1 = pick(ADJECTIVES);
  let adj2 = pick(ADJECTIVES);
  // Avoid duplicate adjectives
  while (adj2 === adj1) adj2 = pick(ADJECTIVES);
  const animal = pick(ANIMALS);
  return `${adj1}${adj2}${animal}.zip`;
}

// Save completed downloads to history
async function saveToHistory(items: DownloadItem[]) {
  const historyPath = path.join(process.cwd(), ".harveey-history.json");
  
  let history: any[] = [];
  try {
    if (fs.existsSync(historyPath)) {
      const data = fs.readFileSync(historyPath, "utf-8");
      history = JSON.parse(data);
    }
  } catch {
    history = [];
  }

  const newItems = items.map(item => ({
    id: item.id,
    url: item.url,
    filename: item.filename,
    type: item.type,
    platform: item.platform,
    thumbnail: item.thumbnail,
    status: "completed",
    timestamp: Date.now(),
    source: "app",
  }));

  history = [...newItems, ...history].slice(0, 500);

  try {
    fs.writeFileSync(historyPath, JSON.stringify(history, null, 2));
  } catch (error) {
    console.error("Failed to save history:", error);
  }
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300; // 5 minutes for large batches

// Parallel fetch with concurrency limit for speed
async function fetchMediaBuffer(
  url: string
): Promise<{ buffer: Buffer; contentType: string; filename: string }> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 45000); // 45s timeout per file

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "*/*",
        Referer: (() => {
          try {
            return new URL(url).origin;
          } catch {
            return "";
          }
        })(),
      },
      signal: controller.signal,
      redirect: "follow",
    });

    clearTimeout(timeout);

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const contentType = res.headers.get("content-type") || "application/octet-stream";
    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Derive filename
    const cd = res.headers.get("content-disposition") || "";
    const cdMatch = cd.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
    let filename = cdMatch ? cdMatch[1].replace(/['"]/g, "").trim() : "";
    if (!filename) {
      try {
        filename = path.basename(new URL(url).pathname.split("?")[0]) || "media";
      } catch {
        filename = "media";
      }
    }

    return { buffer, contentType, filename };
  } catch (err) {
    clearTimeout(timeout);
    throw err;
  }
}

// Build ZIP with streaming: fetch one file, add to archive, fetch next
// This starts the ZIP download immediately and streams files as they arrive
async function buildZipStreaming(items: DownloadItem[]): Promise<Buffer> {
  const archiver = (await import("archiver")).default;

  return new Promise((resolve, reject) => {
    const arc = archiver("zip", {
      zlib: { level: 6 }, // Balanced compression
      store: false, // Don't store uncompressed (faster)
    });

    const chunks: Buffer[] = [];

    arc.on("data", (chunk: Buffer) => chunks.push(chunk));
    arc.on("end", () => resolve(Buffer.concat(chunks)));
    arc.on("error", reject);

    // Process files with controlled concurrency (3 at a time for speed)
    const CONCURRENCY = 3;
    let activeCount = 0;
    let currentIndex = 0;
    let hasError = false;

    const processNext = () => {
      if (hasError || currentIndex >= items.length) {
        // All queued, check if we're done
        if (activeCount === 0 && currentIndex >= items.length) {
          arc.finalize();
        }
        return;
      }

      while (activeCount < CONCURRENCY && currentIndex < items.length) {
        const index = currentIndex++;
        const item = items[index];

        activeCount++;

        fetchMediaBuffer(item.url)
          .then(({ buffer, filename }) => {
            const safeName =
              item.filename ||
              filename ||
              `media_${index + 1}${path.extname(item.url.split("?")[0]) || ""}`;

            // Append to archive immediately
            arc.append(buffer, { name: safeName });
          })
          .catch((err) => {
            console.error(`Failed to fetch ${item.url}:`, err);
            // Add error file instead of failing entire download
            arc.append(
              Buffer.from(
                `Failed to download: ${item.url}\nError: ${err.message || "Unknown error"}\n`
              ),
              { name: `error_${index + 1}.txt` }
            );
          })
          .finally(() => {
            activeCount--;
            processNext(); // Process next file
          });
      }
    };

    // Start processing
    processNext();
  });
}

// Alternative: Parallel fetch all at once (fastest for small batches)
async function buildZipParallel(items: DownloadItem[]): Promise<Buffer> {
  const archiver = (await import("archiver")).default;

  // Fetch all files in parallel with concurrency limit
  const BATCH_SIZE = 5;
  const results: Array<{ buffer: Buffer; name: string }> = [];

  for (let i = 0; i < items.length; i += BATCH_SIZE) {
    const batch = items.slice(i, i + BATCH_SIZE);
    const batchResults = await Promise.allSettled(
      batch.map((item, batchIdx) =>
        fetchMediaBuffer(item.url)
          .then(({ buffer, filename }) => ({
            buffer,
            name:
              item.filename ||
              filename ||
              `media_${i + batchIdx + 1}${path.extname(item.url.split("?")[0]) || ""}`,
          }))
          .catch((err) => ({
            buffer: Buffer.from(
              `Failed to download: ${item.url}\nError: ${err.message || "Unknown"}\n`
            ),
            name: `error_${i + batchIdx + 1}.txt`,
          }))
      )
    );

    batchResults.forEach((result) => {
      if (result.status === "fulfilled") {
        results.push(result.value);
      }
    });
  }

  // Build ZIP from collected buffers
  return new Promise((resolve, reject) => {
    const arc = archiver("zip", { zlib: { level: 6 } });
    const chunks: Buffer[] = [];

    arc.on("data", (chunk: Buffer) => chunks.push(chunk));
    arc.on("end", () => resolve(Buffer.concat(chunks)));
    arc.on("error", reject);

    results.forEach(({ buffer, name }) => arc.append(buffer, { name }));
    arc.finalize();
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const items: DownloadItem[] = body.items ?? [];
    const forceZip: boolean = body.forceZip ?? false;

    if (!items.length) {
      return NextResponse.json({ error: "No items provided." }, { status: 400 });
    }

    // ── Single file, no zip requested ──────────────────────────────────────
    if (items.length === 1 && !forceZip) {
      const item = items[0];
      try {
        const { buffer, contentType, filename } = await fetchMediaBuffer(item.url);
        const safeName = item.filename || filename;

        // Save to history
        saveToHistory([item]);

        return new NextResponse(new Uint8Array(buffer), {
          status: 200,
          headers: {
            "Content-Type": contentType,
            "Content-Disposition": `attachment; filename="${encodeURIComponent(safeName)}"`,
            "Content-Length": String(buffer.length),
            "Cache-Control": "no-store",
          },
        });
      } catch (err) {
        console.error("Single download error:", err);
        return NextResponse.json(
          { error: "Failed to fetch the file." },
          { status: 502 }
        );
      }
    }

    // ── Multiple files (or forceZip) → ZIP with optimized strategy ─────────
    try {
      // Use parallel batching for speed (5 at a time)
      // This is faster than streaming for most use cases
      const zipBuffer = await buildZipParallel(items);

      const zipName = generateZipName();

      // Save to history
      saveToHistory(items);

      return new NextResponse(new Uint8Array(zipBuffer), {
        status: 200,
        headers: {
          "Content-Type": "application/zip",
          "Content-Disposition": `attachment; filename="${zipName}"`,
          "Content-Length": String(zipBuffer.length),
          "Cache-Control": "no-store",
        },
      });
    } catch (err) {
      console.error("ZIP build error:", err);
      return NextResponse.json({ error: "Failed to build ZIP." }, { status: 502 });
    }
  } catch (err) {
    console.error("Download route error:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
