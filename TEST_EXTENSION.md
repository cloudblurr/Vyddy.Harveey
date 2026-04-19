# Test Extension - Step by Step

## ✅ CORS Fix Applied

The CORS headers have been added to `app/api/extension/send/route.ts`. Now you need to restart the dev server to apply the changes.

---

## 🔄 Step 1: Restart Dev Server

**IMPORTANT:** You must restart the dev server for the CORS changes to take effect.

```bash
# Stop the current dev server (Ctrl+C in the terminal where it's running)
# Then start it again:
npm run dev
```

Wait for:
```
✓ Ready in X.Xs
○ Compiling /api/extension/send ...
✓ Compiled /api/extension/send in XXXms
```

---

## 🧪 Step 2: Test CORS Headers

Open a new terminal and test:

```bash
# Test OPTIONS (preflight)
curl -X OPTIONS http://localhost:3000/api/extension/send -i

# Should see:
# HTTP/1.1 200 OK
# Access-Control-Allow-Origin: *
# Access-Control-Allow-Methods: GET, POST, OPTIONS
```

```bash
# Test POST with CORS
curl -X POST http://localhost:3000/api/extension/send \
  -H "Content-Type: application/json" \
  -H "Origin: https://www.instagram.com" \
  -d "{\"urls\":[\"https://example.com/test.jpg\"]}" \
  -i

# Should see:
# HTTP/1.1 200 OK
# Access-Control-Allow-Origin: *
# {"success":true,"count":1,"message":"Added 1 items to download queue"}
```

---

## 🔌 Step 3: Reload Extension

1. Go to `chrome://extensions`
2. Find "Harveey Media Extractor"
3. Click the **refresh icon** (🔄) to reload the extension
4. Make sure it's **enabled** (toggle should be ON)

---

## 📸 Step 4: Test on Instagram

1. **Go to Instagram post:**
   - Example: `https://www.instagram.com/p/DXQLPGACHZu/`
   - Or any other Instagram post

2. **Look for the ⚡ button:**
   - Should appear in bottom-right corner
   - Has a yellow/neon glow effect
   - Shows badge with number of detected media

3. **Click the button:**
   - Panel should slide in from right
   - Shows detected images/videos
   - All items should be checked by default

4. **Click "Send to Harveey":**
   - Should see success notification
   - Panel should close
   - No CORS errors in console (F12)

5. **Check main app:**
   - Go to `http://localhost:3000`
   - Open **Download Queue** tab
   - Media should appear there

---

## 🐛 Troubleshooting

### Still seeing CORS error?

**Check 1: Did you restart the dev server?**
- The CORS changes only apply after restart
- Stop with Ctrl+C, then `npm run dev` again

**Check 2: Is the extension reloaded?**
- Go to `chrome://extensions`
- Click refresh icon on Harveey extension

**Check 3: Check browser console**
- F12 on Instagram page
- Console tab
- Should NOT see CORS errors
- Should see: `POST http://localhost:3000/api/extension/send 200`

### Button not appearing?

**Check 1: Extension is loaded**
- `chrome://extensions` → Harveey should be enabled

**Check 2: Refresh Instagram page**
- After loading/reloading extension, refresh the page

**Check 3: Check for JavaScript errors**
- F12 → Console
- Look for errors related to Harveey or content.js

### "Failed to fetch" error?

**Dev server not running:**
```bash
npm run dev
```

**Wrong URL in extension:**
1. Click extension icon in toolbar
2. Check "App URL" is `http://localhost:3000`
3. Click "Test Connection"

---

## ✅ Success Checklist

- [ ] Dev server restarted after CORS changes
- [ ] Extension reloaded in Chrome
- [ ] ⚡ button appears on Instagram
- [ ] Panel opens when clicking button
- [ ] Media is detected and shown
- [ ] "Send to Harveey" works without CORS error
- [ ] Media appears in main app's Download Queue
- [ ] No errors in browser console

---

## 📝 What Changed

### Before (CORS Error):
```
❌ Access to fetch blocked by CORS policy
❌ Redirect is not allowed for preflight request
```

### After (Working):
```
✅ OPTIONS request returns CORS headers
✅ POST request includes CORS headers
✅ Extension can send data from Instagram to app
✅ No CORS errors in console
```

---

## 🎯 Next: Instagram Login

Once the extension is working, follow the Instagram setup:

1. **Get your sessionid** - See `INSTAGRAM_QUICK_START.md`
2. **Login with sessionid** - `python scripts/instagram_scraper.py --sessionid "..."`
3. **Test extraction** - Try extracting from Instagram posts
4. **Full workflow** - Profile Browser → Copy URLs → Extract → Download

---

## 📞 Still Having Issues?

Check these files:
- `EXTENSION_CORS_FIX.md` - Detailed CORS explanation
- `EXTENSION_GUIDE.md` - Full extension documentation
- `TROUBLESHOOTING.md` - General troubleshooting
