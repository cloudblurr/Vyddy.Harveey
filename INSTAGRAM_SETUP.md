# Instagram Setup Guide - UPDATED

## ⚠️ Problem: Instagram Blocks Direct Login

Instagram has aggressive anti-bot measures that often block direct username/password logins, especially from new IPs or data centers. 

**Your current error:** "IP address added to blacklist of Instagram Server"

---

## ✅ RECOMMENDED SOLUTION: Use Session ID Method

Instead of logging in with username/password, we'll use your existing browser session. This is more reliable and bypasses IP blocks.

### Step-by-Step Instructions:

#### 1. Login to Instagram in Chrome
- Open Chrome and go to https://instagram.com
- Login with your account (duniqueguy)

#### 2. Extract Your Session ID
- Press `F12` to open Chrome DevTools
- Click the **Application** tab (or **Storage** in Firefox)
- In the left sidebar, expand **Cookies** → **https://www.instagram.com**
- Find the cookie named `sessionid`
- **Copy the entire value** (it's a long string like `12345678%3A...`)

#### 3. Login with Session ID
Run this command with your copied sessionid:

```bash
python scripts/instagram_scraper.py --sessionid "YOUR_SESSIONID_HERE"
```

Example:
```bash
python scripts/instagram_scraper.py --sessionid "12345678%3A1a2b3c4d5e6f7g8h9i0j"
```

#### 4. Test Extraction
Once logged in, test with a real Instagram post:

```bash
python scripts/instagram_scraper.py "https://www.instagram.com/p/ABC123/"
```

---

## Alternative: Use VPN or Proxy

If you want to use username/password login:

1. **Use a VPN** to change your IP address to a residential IP
2. **Use a proxy** in the Python script (requires code modification)
3. **Wait 24-48 hours** for Instagram to unblock your IP

---

## How the App Uses Instagram Scraper

Once you've logged in with `--sessionid`, the session is saved to `scripts/.ig_session.json`. The app will automatically use this session for all Instagram extractions.

### Testing in the App:

1. Start the dev server: `npm run dev`
2. Go to **Profile Browser** tab
3. Enter an Instagram handle (e.g., `duniqueguy`)
4. Click "Open Profile" → browse posts in new tab
5. Copy post URLs and paste into **URL Extractor**
6. Click "Extract Media" → should work now!

---

## Python Dependencies

Make sure these are installed:

```bash
pip install instagrapi python-dotenv
```

---

## Environment Variables

The scraper reads credentials from `.env.local`:

```env
USERNAME=duniqueguy
PASSWORD=Mikrlo123$
PYTHON_COMMAND=python
```

However, **sessionid method is recommended** over username/password due to Instagram's IP blocking.

---

## Troubleshooting

### "Session expired" error
- Your sessionid has expired (Instagram sessions last ~90 days)
- Re-extract sessionid from Chrome and run `--sessionid` command again

### "Not logged in" error
- The `.ig_session.json` file is missing or corrupted
- Run the `--sessionid` command to create a new session

### "Rate limit" error
- Instagram is throttling your requests
- Wait 5-10 minutes before trying again
- Reduce the number of requests

### "Challenge required" error
- Instagram wants you to verify your account
- Login to Instagram in the app or browser
- Complete any verification challenges
- Then try the sessionid method again

### Python not found
- Make sure Python is installed: `python --version`
- Update `.env.local` with correct Python command if needed

---

## API Endpoint

The app exposes an Instagram API at:

```
POST /api/instagram
{
  "url": "https://www.instagram.com/p/ABC123/"
}
```

Or for profiles:

```
POST /api/instagram
{
  "action": "profile",
  "username": "instagram"
}
```

---

## Why This Approach?

Instagram's public APIs (`?__a=1`) are deprecated and return 429 errors. The official Graph API only works for Business accounts. The `instagrapi` Python library uses Instagram's private mobile API, which is more reliable but requires authentication.

**Session ID method is best** because:
- ✅ Bypasses IP blocks
- ✅ Uses your existing browser session
- ✅ No need to expose credentials to the script
- ✅ More reliable than username/password
