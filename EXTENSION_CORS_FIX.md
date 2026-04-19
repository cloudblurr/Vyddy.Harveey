# Extension CORS Error - Fixed

## Problem

The extension was getting this error:
```
Access to fetch at 'http://localhost:3000/api/extension/send' from origin 'https://www.instagram.com' 
has been blocked by CORS policy: Response to preflight request doesn't pass access control check: 
Redirect is not allowed for a preflight request.
```

## Root Cause

1. **CORS preflight requests** - Browser sends OPTIONS request before POST
2. **Missing CORS headers** - API endpoint wasn't allowing cross-origin requests
3. **Possible redirect** - Next.js might be redirecting requests

## ✅ What Was Fixed

### 1. Added CORS Headers to API Endpoint

Updated `app/api/extension/send/route.ts`:
- ✅ Added `Access-Control-Allow-Origin: *` header
- ✅ Added `Access-Control-Allow-Methods` header
- ✅ Added `Access-Control-Allow-Headers` header
- ✅ Added OPTIONS handler for preflight requests
- ✅ Applied headers to all responses (GET, POST, OPTIONS)

### 2. How to Test

#### Step 1: Make sure dev server is running
```bash
npm run dev
```

Server should be at: `http://localhost:3000`

#### Step 2: Load the extension
1. Open Chrome → Extensions → Enable "Developer mode"
2. Click "Load unpacked"
3. Select the `extension` folder
4. Extension should load without errors

#### Step 3: Test on Instagram
1. Go to any Instagram post: `https://www.instagram.com/p/DXQLPGACHZu/`
2. Look for the ⚡ floating button (bottom-right corner)
3. Click it → panel should open showing detected media
4. Select media → Click "Send to Harveey"
5. Should see success notification

#### Step 4: Check main app
1. Go to `http://localhost:3000`
2. Check **Download Queue** tab
3. Media from extension should appear there

---

## Troubleshooting

### Still getting CORS error?

**Check 1: Dev server is running**
```bash
# In terminal, you should see:
# ▲ Next.js 14.x.x
# - Local: http://localhost:3000
```

**Check 2: Extension settings**
1. Open extension popup
2. Check "App URL" is set to: `http://localhost:3000`
3. Click "Test Connection" → should show "✓ Connected"

**Check 3: Browser console**
Open DevTools (F12) on Instagram page:
- Should NOT see CORS errors anymore
- Should see: `POST http://localhost:3000/api/extension/send 200 OK`

### "Failed to fetch" error?

This means the dev server is not running or not accessible.

**Solution:**
```bash
# Start the dev server
npm run dev
```

### Extension button not showing?

**Check 1: Extension is loaded**
- Go to `chrome://extensions`
- Find "Harveey Media Extractor"
- Should be enabled (toggle ON)

**Check 2: Refresh the page**
- After loading extension, refresh Instagram page
- Button should appear in bottom-right

**Check 3: Check console for errors**
- F12 → Console tab
- Look for any red errors related to Harveey

---

## Production Deployment

When deploying to production, update CORS settings:

### Option 1: Allow specific origins (more secure)
```typescript
const corsHeaders = {
  "Access-Control-Allow-Origin": "https://www.instagram.com, https://twitter.com, https://x.com",
  // ... rest of headers
};
```

### Option 2: Keep wildcard (less secure, but works everywhere)
```typescript
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  // ... rest of headers
};
```

### Update extension for production
In `extension/popup/popup.js`, change default URL:
```javascript
const DEFAULT_APP_URL = 'https://your-production-domain.com';
```

---

## Files Modified

- ✅ `app/api/extension/send/route.ts` - Added CORS headers and OPTIONS handler
- ✅ `EXTENSION_CORS_FIX.md` - This documentation

---

## Next Steps

1. **Test the extension** - Follow testing steps above
2. **Check Instagram login** - See `INSTAGRAM_QUICK_START.md` for sessionid method
3. **Test full workflow** - Extract → Download → Verify

---

## Quick Test Command

Test the API endpoint directly:
```bash
curl -X OPTIONS http://localhost:3000/api/extension/send -v
```

Should return:
```
< HTTP/1.1 200 OK
< Access-Control-Allow-Origin: *
< Access-Control-Allow-Methods: GET, POST, OPTIONS
< Access-Control-Allow-Headers: Content-Type, Authorization
```

Then test POST:
```bash
curl -X POST http://localhost:3000/api/extension/send \
  -H "Content-Type: application/json" \
  -H "Origin: https://www.instagram.com" \
  -d '{"urls":["https://example.com/image.jpg"]}'
```

Should return:
```json
{
  "success": true,
  "count": 1,
  "message": "Added 1 items to download queue"
}
```
