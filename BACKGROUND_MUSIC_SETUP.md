# Background Music Setup Guide

## 🎵 Current Status

The background music system is **ACTIVE and WORKING**! 

**Next Step:** Copy your "Milk Mayhem.mp4" file to `/public/assets/` folder!

👉 **See detailed instructions in: `/SETUP_YOUR_MUSIC.md`**

Currently using: **🎮 Chiptune Music** (will auto-switch to your MP4 once you copy the file)

## 🔧 How to Set Up Your Suno Music

### Option 1: Direct Suno CDN URL (Easiest!)

1. **Find the direct audio URL:**
   - Go to your Suno song page: https://suno.com/s/Spi1mCwxWwTrwPJAH
   - Right-click on the page and select "Inspect" or press F12
   - Go to the "Network" tab in DevTools
   - Click the filter icon and select "Media" or "All"
   - Refresh the page or play the song
   - Look for an MP3 file request (usually from `cdn1.suno.ai`, `cdn2.suno.ai`, or similar)
   - Right-click the file → Copy → Copy URL
   - It will look something like: `https://cdn1.suno.ai/abc123def456.mp3`

2. **Update the config:**
   - Open `/config/audio.ts`
   - Find the line: `export const BACKGROUND_MUSIC_URL: string | null = null;`
   - Replace it with: `export const BACKGROUND_MUSIC_URL = 'YOUR_DIRECT_URL_HERE';`
   - Example: `export const BACKGROUND_MUSIC_URL = 'https://cdn1.suno.ai/abc123.mp3';`

### Option 2: Download and Host

1. **Download the song:**
   - On the Suno page, click the download button
   - Save the MP3/MP4 file

2. **Host the file:**
   - **Option A - Use a CDN:**
     - Upload to Cloudinary, AWS S3, or similar
     - Get the public URL
   
   - **Option B - Use a local file (for development):**
     - Create a `public` folder in your project root (if it doesn't exist)
     - Move the audio file there as `public/background-music.mp3`
     - Update the URL to `/background-music.mp3`

3. **Update the config:**
   - Open `/config/audio.ts`
   - Replace the `BACKGROUND_MUSIC_URL` with your file URL

### Option 3: Use a Different Track

If you want to use a different background music file:
1. Get the direct URL or download the MP3/MP4
2. Update `/config/audio.ts` with the new URL

## 🎮 Features

The background music player includes:

- **Auto-play** - Starts playing when the game loads (after first user interaction)
- **Volume controls** - Slider in the bottom-right corner (disabled for chiptune mode)
- **Mute button** - Quick mute/unmute toggle (works for both modes)
- **Looping** - Music loops continuously
- **Persistent controls** - Available on all game screens
- **Smart fallback** - Uses chiptune music if no audio file is provided
- **Mode indicator** - 🎮 for chiptune, 🎵 for custom audio

## 🎛️ Volume Controls

Look for the music controls in the **bottom-right corner** of the screen:
- 🔊 Volume icon (click to mute/unmute)
- Volume slider (0-100)
- Current volume percentage display

## ⚠️ Important Notes

1. **Browser Autoplay Policy:**
   - Most browsers block autoplay until the user interacts with the page
   - The music will auto-start on first click/keypress

2. **CORS Issues:**
   - If using an external URL, make sure it has CORS enabled
   - Suno's CDN should work fine
   - If you get CORS errors, you may need to download and self-host the file

3. **File Format:**
   - MP3 is widely supported (recommended)
   - MP4 with audio track also works
   - WAV and OGG are supported but larger file sizes

## 🧪 Testing

**Current Setup (Chiptune Mode):**
- ✅ Music should be playing automatically with a retro chiptune melody
- Look for the 🎮 icon in the bottom-right corner
- Click the mute button to toggle music on/off

**After Adding Your Suno Track:**
1. Open the browser console (F12)
2. Look for messages like:
   - "Background music loaded successfully" ✅
   - "Background music started" ✅
3. The icon should change from 🎮 to 🎵
4. Volume slider will become active (not greyed out)

## 🔧 Troubleshooting

**No music playing at all:**
- Check if `enabled: true` in `/config/audio.ts` under `BACKGROUND_MUSIC_CONFIG`
- Click anywhere on the page (browsers block autoplay until user interaction)
- Check the mute button in bottom-right corner isn't active

**Custom music doesn't load:**
- ✅ **Good news:** The system automatically falls back to chiptune music!
- Check the browser console for error messages
- Verify the URL is a direct link to an audio file (not a webpage)
- Try opening the URL directly in your browser - it should download or play the file
- Check for CORS errors - if so, you'll need to host the file yourself

**CORS errors:**
- Download the MP3 from Suno
- Upload to a service like Cloudinary, Dropbox, or your own hosting
- Or place it in your project's public folder
- Update the URL in `/config/audio.ts`

**Volume slider greyed out:**
- This is normal when using chiptune mode (🎮 icon)
- The slider will activate when you add a custom audio file (🎵 icon)

**Want to disable music entirely:**
- Open `/config/audio.ts`
- Change `enabled: true` to `enabled: false`

## 📁 Files Modified

- `/utils/backgroundMusicManager.ts` - Core music player logic
- `/components/BackgroundMusicPlayer.tsx` - UI component with controls
- `/config/audio.ts` - Audio configuration
- `/App.tsx` - Integration into the main app

Enjoy your game with epic background music! 🎮🥛
