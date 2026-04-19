#!/usr/bin/env python3
"""
Instagram Media Scraper for Harveey
Uses instagrapi for reliable media extraction

Install dependencies:
    pip install instagrapi requests

Usage:
    python instagram_scraper.py <post_url>
    python instagram_scraper.py --login <username> <password>
    python instagram_scraper.py --sessionid <session_id>

Environment Variables:
    USERNAME - Instagram username
    PASSWORD - Instagram password
"""

import sys
import json
import re
import os
from typing import Optional, List, Dict, Any
from dotenv import load_dotenv

try:
    from instagrapi import Client
    from instagrapi.exceptions import LoginRequired, ChallengeRequired, PleaseWaitFewMinutes
except ImportError:
    print(json.dumps({"error": "instagrapi not installed. Run: pip install instagrapi"}))
    sys.exit(1)

# Load environment variables
load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env.local"))

# Session file for persistence
SESSION_FILE = os.path.join(os.path.dirname(__file__), ".ig_session.json")


class InstagramScraper:
    def __init__(self):
        self.cl = Client()
        self.cl.delay_range = [1, 3]  # Add delay between requests
        self.logged_in = False
        
        # Try to auto-login from session or env vars
        self._try_auto_login()
        
    def _try_auto_login(self):
        """Try to login automatically from session file or env vars"""
        try:
            # First, try to load existing session
            if os.path.exists(SESSION_FILE):
                self.cl.load_settings(SESSION_FILE)
                self.cl.login(os.getenv("USERNAME", ""), os.getenv("PASSWORD", ""))
                self.logged_in = True
                return
        except Exception:
            pass
        
        # Try env vars if session failed
        username = os.getenv("USERNAME")
        password = os.getenv("PASSWORD")
        if username and password:
            try:
                self.login(username, password)
            except Exception:
                pass
        
    def login(self, username: str, password: str) -> bool:
        """Login to Instagram with credentials"""
        try:
            # Try to load existing session first
            if os.path.exists(SESSION_FILE):
                try:
                    self.cl.load_settings(SESSION_FILE)
                    self.cl.login(username, password)
                    self.cl.dump_settings(SESSION_FILE)
                    self.logged_in = True
                    return True
                except Exception:
                    # Session expired, try fresh login
                    pass
            
            # Fresh login
            self.cl.login(username, password)
            self.cl.dump_settings(SESSION_FILE)
            self.logged_in = True
            return True
            
        except ChallengeRequired as e:
            return {"error": "Instagram requires verification. Please verify your account in the Instagram app and try again."}
        except PleaseWaitFewMinutes as e:
            return {"error": "Instagram rate limit. Please wait a few minutes and try again."}
        except LoginRequired as e:
            return {"error": "Login failed. Instagram may have blocked this IP. Try using --sessionid with a browser session cookie."}
        except Exception as e:
            error_msg = str(e)
            if "blacklist" in error_msg.lower() or "ip address" in error_msg.lower():
                return {"error": "Instagram has blocked this IP address. Use --sessionid method instead: 1) Login to Instagram in Chrome, 2) Open DevTools (F12), 3) Go to Application > Cookies > instagram.com, 4) Copy 'sessionid' value, 5) Run: python instagram_scraper.py --sessionid <your_sessionid>"}
            return {"error": f"Login failed: {error_msg}"}
    
    def login_by_sessionid(self, session_id: str) -> bool:
        """Login using session ID (from browser cookies) - RECOMMENDED METHOD"""
        try:
            self.cl.login_by_sessionid(session_id)
            self.cl.dump_settings(SESSION_FILE)
            self.logged_in = True
            return True
        except Exception as e:
            return {"error": f"Session login failed: {str(e)}. Make sure the sessionid is valid and not expired."}
    
    def extract_from_url(self, url: str) -> Dict[str, Any]:
        """Extract media from Instagram post URL"""
        try:
            # Check if logged in
            if not self.logged_in:
                return {"error": "Not logged in. Run: python instagram_scraper.py --sessionid <your_sessionid>"}
            
            # Extract media PK from URL
            media_pk = self.cl.media_pk_from_url(url)
            
            if not media_pk:
                return {"error": "Could not extract media ID from URL"}
            
            # Get media info
            media_info = self.cl.media_info(media_pk)
            
            # Extract media items
            items = []
            
            # Check if it's a carousel (album)
            if hasattr(media_info, 'resources') and media_info.resources:
                for i, resource in enumerate(media_info.resources):
                    item = self._process_media_resource(resource, i)
                    if item:
                        items.append(item)
            else:
                # Single media
                item = self._process_single_media(media_info)
                if item:
                    items.append(item)
            
            return {
                "success": True,
                "items": items,
                "caption": getattr(media_info, 'caption_text', ''),
                "username": getattr(media_info.user, 'username', '') if hasattr(media_info, 'user') else '',
                "likes": getattr(media_info, 'like_count', 0),
                "comments": getattr(media_info, 'comment_count', 0),
            }
            
        except LoginRequired:
            return {"error": "Session expired. Please login again with --sessionid"}
        except Exception as e:
            return {"error": f"Failed to extract media: {str(e)}"}
    
    def _process_media_resource(self, resource, index: int) -> Optional[Dict[str, Any]]:
        """Process a media resource from carousel"""
        try:
            media_type = getattr(resource, 'media_type', 0)
            
            if media_type == 1:  # Photo
                return {
                    "type": "image",
                    "url": getattr(resource, 'thumbnail_url', '') or getattr(resource, 'image_url', ''),
                    "thumbnail": getattr(resource, 'thumbnail_url', ''),
                    "filename": f"instagram_{index + 1}.jpg",
                }
            elif media_type == 2:  # Video
                return {
                    "type": "video",
                    "url": getattr(resource, 'video_url', ''),
                    "thumbnail": getattr(resource, 'thumbnail_url', ''),
                    "filename": f"instagram_{index + 1}.mp4",
                    "duration": getattr(resource, 'video_duration', 0),
                }
            elif media_type == 8:  # Carousel
                return None
        except:
            pass
        return None
    
    def _process_single_media(self, media_info) -> Optional[Dict[str, Any]]:
        """Process single media post"""
        try:
            media_type = getattr(media_info, 'media_type', 0)
            
            if media_type == 1:  # Photo
                return {
                    "type": "image",
                    "url": getattr(media_info, 'thumbnail_url', '') or getattr(media_info, 'image_url', ''),
                    "thumbnail": getattr(media_info, 'thumbnail_url', ''),
                    "filename": "instagram_1.jpg",
                }
            elif media_type == 2:  # Video
                return {
                    "type": "video",
                    "url": getattr(media_info, 'video_url', ''),
                    "thumbnail": getattr(media_info, 'thumbnail_url', ''),
                    "filename": "instagram_1.mp4",
                    "duration": getattr(media_info, 'video_duration', 0),
                }
            elif media_type == 8:  # Carousel - handled separately
                return None
        except:
            pass
        return None
    
    def get_user_media(self, username: str, amount: int = 50) -> Dict[str, Any]:
        """Get recent media from a user's profile"""
        try:
            user_id = self.cl.user_id_from_username(username)
            medias = self.cl.user_medias(user_id, amount)
            
            items = []
            for media in medias:
                if hasattr(media, 'resources') and media.resources:
                    for i, resource in enumerate(media.resources):
                        item = self._process_media_resource(resource, len(items))
                        if item:
                            item["post_url"] = f"https://www.instagram.com/p/{media.code}/"
                            items.append(item)
                else:
                    item = self._process_single_media(media)
                    if item:
                        item["post_url"] = f"https://www.instagram.com/p/{media.code}/"
                        items.append(item)
            
            return {
                "success": True,
                "items": items,
                "username": username,
                "total": len(items),
            }
        except Exception as e:
            return {"error": str(e)}


def main():
    if len(sys.argv) < 2:
        print(json.dumps({
            "error": "Usage: python instagram_scraper.py <post_url>",
            "usage": {
                "extract_post": "python instagram_scraper.py https://www.instagram.com/p/ABC123/",
                "extract_reel": "python instagram_scraper.py https://www.instagram.com/reel/ABC123/",
                "get_profile": "python instagram_scraper.py --profile <username>",
                "login": "python instagram_scraper.py --login <username> <password>",
                "sessionid": "python instagram_scraper.py --sessionid <session_id>",
            }
        }))
        sys.exit(1)
    
    scraper = InstagramScraper()
    
    # Handle login command
    if sys.argv[1] == "--login":
        if len(sys.argv) < 4:
            print(json.dumps({"error": "Usage: python instagram_scraper.py --login <username> <password>"}))
            sys.exit(1)
        result = scraper.login(sys.argv[2], sys.argv[3])
        print(json.dumps({"success": result} if result else {"error": "Login failed"}))
        sys.exit(0)
    
    # Handle session ID login
    if sys.argv[1] == "--sessionid":
        if len(sys.argv) < 3:
            print(json.dumps({"error": "Usage: python instagram_scraper.py --sessionid <session_id>"}))
            sys.exit(1)
        result = scraper.login_by_sessionid(sys.argv[2])
        print(json.dumps({"success": result} if result else {"error": "Session login failed"}))
        sys.exit(0)
    
    # Handle profile command
    if sys.argv[1] == "--profile":
        if len(sys.argv) < 3:
            print(json.dumps({"error": "Usage: python instagram_scraper.py --profile <username>"}))
            sys.exit(1)
        result = scraper.get_user_media(sys.argv[2])
        print(json.dumps(result, indent=2))
        sys.exit(0)
    
    # Extract from URL
    url = sys.argv[1]
    result = scraper.extract_from_url(url)
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
