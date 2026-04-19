# Instagram Quick Start - Get Your Session ID

## 🚀 Quick Steps (5 minutes)

### 1. Open Instagram in Chrome
Go to: https://instagram.com and login with your account

### 2. Open DevTools
Press `F12` (or right-click → Inspect)

### 3. Navigate to Cookies
- Click **Application** tab at the top
- In left sidebar: **Cookies** → **https://www.instagram.com**
- Find the row named `sessionid`

### 4. Copy the Value
- Click on the `sessionid` row
- The **Value** column shows a long string
- **Double-click to select all** → Copy it
- It looks like: `12345678%3A1a2b3c4d5e6f7g8h9i0j...`

### 5. Run Login Command
Open your terminal in the project folder and run:

```bash
python scripts/instagram_scraper.py --sessionid "PASTE_YOUR_SESSIONID_HERE"
```

**Example:**
```bash
python scripts/instagram_scraper.py --sessionid "12345678%3A1a2b3c4d5e6f7g8h9i0j"
```

### 6. Test It
Try extracting from a real Instagram post:

```bash
python scripts/instagram_scraper.py "https://www.instagram.com/p/ABC123/"
```

---

## ✅ Success!

If you see JSON output with media URLs, it worked! The session is now saved to `scripts/.ig_session.json` and the app will use it automatically.

---

## 🎯 Use in the App

1. Start dev server: `npm run dev`
2. Go to **URL Extractor** tab
3. Paste Instagram post URL
4. Click **Extract Media**
5. Download!

---

## 🔄 Session Expires?

Instagram sessions last ~90 days. If you get "session expired" error, just repeat these steps to get a fresh sessionid.

---

## 📸 Visual Guide

```
Chrome DevTools → Application Tab
├── Storage
│   ├── Local Storage
│   ├── Session Storage
│   ├── Cookies  ← Click here
│   │   └── https://www.instagram.com  ← Expand this
│   │       ├── csrftoken
│   │       ├── sessionid  ← COPY THIS VALUE
│   │       ├── ds_user_id
│   │       └── ...
```

---

## ⚠️ Important Notes

- **Keep your sessionid private** - it's like a password
- **Don't share** the `.ig_session.json` file
- **Use responsibly** - don't spam requests
- **Session expires** after ~90 days of inactivity
