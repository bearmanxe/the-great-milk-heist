# 🎵 Audio Assets Folder

## Place Your Background Music Here!

### Quick Instructions:

1. **Copy** your `Milk Mayhem.mp4` file to this folder
2. **Rename** it to `background-music.mp4` (or keep the original name)
3. **Refresh** your browser

That's it! The music will automatically start playing.

https://www.dropbox.com/home?preview=background+music.mp4

## Current Configuration

The app is looking for: `/assets/background-music.mp4`

If you keep the original filename "Milk Mayhem.mp4", update `/config/audio.ts`:
```typescript
export const BACKGROUND_MUSIC_URL = '/assets/Milk%20Mayhem.mp4';
```

---

## Expected File

**Name:** `Milk Mayhem.mp4` or `background-music.mp4`  
**Type:** MP4 video file (with audio track) or MP3 audio file  
**Location:** This folder (`/public/assets/`)

---

## How It Works

Files in the `/public/` folder are served directly by your web server:
- `/public/assets/background-music.mp4` → Available at `/assets/background-music.mp4`
- The browser can load it without any CORS or security issues
- Works offline and in production builds

---

## Troubleshooting

**Not working?**
1. Check the filename matches exactly (case-sensitive!)
2. Make sure the file is IN this folder (not in a subfolder)
3. Refresh your browser (Ctrl+Shift+R for hard refresh)
4. Check browser console (F12) for errors

**File is here but still hearing chiptune music?**
- The file path in `/config/audio.ts` might not match the actual filename
- Check for spaces in the filename (use `%20` in the URL for spaces)
- Try renaming to a simple name: `background-music.mp4`

---

For detailed setup instructions, see: `/SETUP_YOUR_MUSIC.md`
