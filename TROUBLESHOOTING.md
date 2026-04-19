# Troubleshooting Guide

## Common Issues

### 1. "No media found at this URL"

**Causes:**
- The page doesn't contain any media
- Media is loaded dynamically via JavaScript
- Site is blocking automated requests

**Solutions:**
- Try a direct media URL instead of a gallery page
- Check if the site requires login
- Use browser DevTools to find direct media URLs
- For heavily JS-dependent sites, the Python scraper (yt-dlp) may help

### 2. "Network error" when scraping

**Causes:**
- Site is blocking the User-Agent
- CORS restrictions
- Rate limiting
- Timeout

**Solutions:**
- Wait a few minutes and try again
- Try a different URL from the same site
- Check your internet connection
- Some sites actively block scrapers

### 3. Profile harvest returns no results

**Causes:**
- Profile is private
- Username is incorrect
- Nitter instances are down (Twitter)
- Instagram changed their page structure

**Solutions:**
- Verify the username is correct (no @ symbol needed)
- Check if the profile is public
- For Twitter, try using a direct tweet URL in URL Extract instead
- For Instagram, try a direct post URL

### 4. Downloads fail or are corrupted

**Causes:**
- Media URL expired
- CORS restrictions
- File too large
- Network interruption

**Solutions:**
- Re-scrape the URL to get fresh media URLs
- Try downloading individual files instead of bulk
- Check browser console for specific errors
- Some sites use signed URLs that expire quickly

### 5. AI Agent not responding

**Causes:**
- Invalid API endpoint or key
- DigitalOcean AI service is down
- Network timeout

**Solutions:**
- Check `.env.local` has correct `AGENT_ENDPOINT` and `AGENT_API_KEY`
- The agent is optional - you can still use URL Extract and Profile Harvest
- Try refreshing the page

### 6. Port 3000 already in use

**Solution:**
Next.js will automatically try the next available port (3001, 3002, etc.). Check the terminal output for the actual port.

### 7. Build errors with TypeScript

**Solutions:**
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Rebuild
npm run build
```

### 8. Chakra UI styles not loading

**Causes:**
- CSS not imported
- Theme provider missing

**Solutions:**
- Ensure `app/globals.css` is imported in `app/layout.tsx`
- Check that `Providers` component wraps children in layout
- Clear browser cache

## Platform-Specific Issues

### Erome
- Albums work best
- Single posts may have limited media
- Some albums require age verification

### RedGIFs
- API-based scraping is reliable
- Direct video URLs are extracted
- GIF format is actually MP4

### Twitter/X
- Uses Nitter proxy (may be slow or down)
- Private accounts won't work
- Rate limiting is common
- Try direct tweet URLs in URL Extract as fallback

### Instagram
- Public profiles only
- May break if Instagram changes their page structure
- Stories are not supported
- Reels may not work consistently

### xVideos / xHamster / Adult Sites
- Generic scraper works for most
- Some sites have anti-bot measures
- Video quality depends on what's in the HTML
- Embedded players may not be extractable

## Getting Help

1. Check browser console for errors (F12)
2. Check terminal/server logs
3. Try the URL in a regular browser first
4. Verify the site is accessible
5. Test with a known working URL (e.g., Imgur album)

## Known Limitations

- **No browser automation:** Sites requiring JavaScript execution may not work
- **No login support:** Private/authenticated content is not accessible
- **Rate limits:** Bulk scraping may trigger rate limits
- **Dynamic content:** SPAs with client-side rendering are challenging
- **DRM content:** Protected media cannot be extracted
- **Live streams:** Real-time content is not supported

## Performance Tips

- Scrape one URL at a time for best results
- Avoid scraping huge galleries (100+ items) at once
- Download in batches rather than all at once
- Clear download queue regularly
- Use direct media URLs when possible

## Security Notes

- Never share your `.env.local` file
- Be cautious with untrusted URLs
- Some sites may log scraping attempts
- Respect robots.txt and terms of service
- Use responsibly and legally
