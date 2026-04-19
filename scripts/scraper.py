#!/usr/bin/env python3
"""
Harveey Python Media Scraper
Uses yt-dlp and gallery-dl for robust media extraction from adult sites and social media.
Called by the Next.js API when Node.js scraping is insufficient.
"""

import sys
import json
import os
import subprocess
import tempfile
import re
from urllib.parse import urlparse

def detect_platform(url: str) -> str:
    """Detect the platform from a URL."""
    hostname = urlparse(url).netloc.replace("www.", "")
    platforms = {
        "xvideos.com": "xvideos",
        "xhamster.com": "xhamster",
        "xhamster.desi": "xhamster",
        "redgifs.com": "redgifs",
        "erome.com": "erome",
        "instagram.com": "instagram",
        "twitter.com": "twitter",
        "x.com": "twitter",
        "facebook.com": "facebook",
        "reddit.com": "reddit",
        "imgur.com": "imgur",
        "pornhub.com": "pornhub",
        "xnxx.com": "xnxx",
        "spankbang.com": "spankbang",
        "tiktok.com": "tiktok",
        "youtube.com": "youtube",
        "youtu.be": "youtube",
        "vimeo.com": "vimeo",
        "bunkr.si": "bunkr",
        "cyberdrop.me": "cyberdrop",
    }
    for domain, platform in platforms.items():
        if domain in hostname:
            return platform
    return "generic"


def scrape_with_ytdlp(url: str) -> list:
    """Use yt-dlp to extract media info from a URL."""
    items = []
    try:
        result = subprocess.run(
            [
                "yt-dlp",
                "--dump-json",
                "--no-download",
                "--flat-playlist",
                "--no-warnings",
                url,
            ],
            capture_output=True,
            text=True,
            timeout=30,
        )

        for line in result.stdout.strip().split("\n"):
            if not line.strip():
                continue
            try:
                data = json.loads(line)
                item = {
                    "id": data.get("id", ""),
                    "url": data.get("url") or data.get("webpage_url", ""),
                    "filename": f"{data.get('title', 'media')}.{data.get('ext', 'mp4')}",
                    "type": "video",
                    "thumbnail": data.get("thumbnail"),
                    "platform": data.get("extractor_key", detect_platform(url)),
                    "status": "pending",
                }
                if item["url"]:
                    items.append(item)
            except json.JSONDecodeError:
                continue

    except (subprocess.TimeoutExpired, FileNotFoundError):
        pass

    return items


def scrape_with_gallery_dl(url: str) -> list:
    """Use gallery-dl to extract image/media URLs."""
    items = []
    try:
        result = subprocess.run(
            [
                "gallery-dl",
                "--dump-json",
                "--no-download",
                url,
            ],
            capture_output=True,
            text=True,
            timeout=30,
        )

        for line in result.stdout.strip().split("\n"):
            if not line.strip():
                continue
            try:
                data = json.loads(line)
                if isinstance(data, list) and len(data) >= 3:
                    media_url = data[2] if isinstance(data[2], str) else None
                    if media_url:
                        ext = os.path.splitext(media_url.split("?")[0])[1].lower()
                        media_type = "video" if ext in [".mp4", ".webm", ".mov"] else "image"
                        items.append({
                            "id": str(hash(media_url)),
                            "url": media_url,
                            "filename": os.path.basename(media_url.split("?")[0]) or f"media_{len(items)+1}{ext}",
                            "type": media_type,
                            "thumbnail": media_url if media_type == "image" else None,
                            "platform": detect_platform(url),
                            "status": "pending",
                        })
            except (json.JSONDecodeError, IndexError):
                continue

    except (subprocess.TimeoutExpired, FileNotFoundError):
        pass

    return items


def main():
    if len(sys.argv) < 2:
        print(json.dumps({"success": False, "error": "No URL provided", "items": []}))
        sys.exit(1)

    url = sys.argv[1]
    platform = detect_platform(url)

    items = []

    # Try yt-dlp first for video platforms
    video_platforms = ["xvideos", "xhamster", "redgifs", "pornhub", "xnxx", "spankbang", "youtube", "vimeo", "tiktok", "twitter", "instagram", "facebook", "reddit"]
    if platform in video_platforms:
        items = scrape_with_ytdlp(url)

    # Try gallery-dl for image-heavy platforms
    if not items:
        image_platforms = ["erome", "imgur", "instagram", "twitter", "reddit", "bunkr", "cyberdrop"]
        if platform in image_platforms or not items:
            items = scrape_with_gallery_dl(url)

    # Final fallback: try both
    if not items:
        items = scrape_with_ytdlp(url)
    if not items:
        items = scrape_with_gallery_dl(url)

    print(json.dumps({
        "success": len(items) > 0,
        "items": items,
        "platform": platform,
        "totalFound": len(items),
    }))


if __name__ == "__main__":
    main()
