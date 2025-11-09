# 🎵 Setup Your Background Music - "Milk Mayhem.mp4"

## Quick Setup (3 Easy Steps!)

### Step 1: Copy Your Music File

Copy your `Milk Mayhem.mp4` file from:
```
file:///media/fuse/drivefs-0418886b0c804ba5b01328df08652e33/root/Milk Mayhem.mp4
```

To this project folder:
```
/public/assets/
```

**You can either:**
- **Option A:** Keep the original name → `/public/assets/Milk Mayhem.mp4`
- **Option B:** Rename it for simplicity → `/public/assets/background-music.mp4`

### Step 2: Update the Config (Already Done! ✅)

I've already updated `/config/audio.ts` to use `/assets/background-music.mp4`

**If you kept the original name**, change this line in `/config/audio.ts`:
```typescript
export const BACKGROUND_MUSIC_URL = '/assets/Milk%20Mayhem.mp4';
```
(The `%20` represents the space in the filename)

### Step 3: Refresh the Page

Once the file is in place, just refresh your browser! The music should start playing automatically.

---

## Visual Guide

### Your Project Structure Should Look Like This:

```
your-project/
├── public/
│   └── assets/
│       └── background-music.mp4  ← YOUR FILE GOES HERE
├── config/
│   └── audio.ts  ← Already configured!
└── ... (other files)
```

### How to Copy the File:

**On Windows:**
1. Open File Explorer
2. Navigate to your Google Drive folder (the path in the file:// URL)
3. Find "Milk Mayhem.mp4"
4. Copy it (Ctrl+C)
5. Navigate to your project folder → `/public/assets/`
6. Paste it (Ctrl+V)
7. Optional: Rename to "background-music.mp4"

**On Mac/Linux:**
1. Open Finder/File Browser
2. Navigate to the mounted drive folder
3. Find "Milk Mayhem.mp4"
4. Copy it
5. Navigate to your project → `/public/assets/`
6. Paste it
7. Optional: Rename to "background-music.mp4"

**Using Command Line:**
```bash
# Navigate to your project
cd /path/to/your/project

# Create the folder if it doesn't exist
mkdir -p public/assets

# Copy the file (update the source path as needed)
cp "/media/fuse/drivefs-0418886b0c804ba5b01328df08652e33/root/Milk Mayhem.mp4" public/assets/background-music.mp4
```

---

## Verify It's Working

After copying the file and refreshing:

1. **Check the music controls** in the bottom-right corner
2. **Look for the icon:**
   - 🎵 = Your custom music is playing! ✅
   - 🎮 = Still using chiptune (file not found)
3. **Check browser console** (F12):
   - Should see: "Background music loaded successfully"
   - Should NOT see errors about loading

4. **Volume slider should be active:**
   - If using your MP4: Slider is enabled (not greyed out)
   - If still chiptune: Slider is disabled

---

## Troubleshooting

### Music still sounds like chiptune (retro 8-bit)?
**Problem:** The file isn't in the right location or the filename doesn't match.

**Solution:**
1. Verify the file is at `/public/assets/background-music.mp4`
2. Check the filename matches exactly (including spaces and capitalization)
3. If you kept "Milk Mayhem.mp4", update the config to:
   ```typescript
   export const BACKGROUND_MUSIC_URL = '/assets/Milk%20Mayhem.mp4';
   ```

### Console shows "Background music file not accessible"?
**Problem:** The file path is wrong or the file isn't in the public folder.

**Solution:**
1. Make sure the file is in `/public/assets/` (not `/assets/`)
2. The `public` folder should be at the root of your project
3. Try renaming to a simple name without spaces: `background-music.mp4`

### File won't play in browser?
**Problem:** MP4 codec might not be supported.

**Solution:**
1. Check if the MP4 plays in your browser directly (drag and drop the file into a browser tab)
2. If it doesn't play, you may need to convert it to MP3
3. Use a converter like: https://cloudconvert.com/mp4-to-mp3
4. Or use a local tool: `ffmpeg -i "Milk Mayhem.mp4" background-music.mp3`

### Volume is too loud/quiet?
**Solution:**
Open `/config/audio.ts` and change:
```typescript
defaultVolume: 0.3,  // 30% - adjust this value (0.0 to 1.0)
```

---

## Configuration Options

In `/config/audio.ts`, you can customize:

```typescript
export const BACKGROUND_MUSIC_CONFIG = {
  enabled: true,              // Set false to disable music
  autoPlay: true,             // Auto-start on page load
  defaultVolume: 0.3,         // 30% volume (0.0 = mute, 1.0 = max)
  loop: true,                 // Loop continuously
  useChiptuneIfNoFile: true,  // Fall back to chiptune if file missing
};
```

---

## Why file:// URLs Don't Work

Browsers block `file://` URLs for security reasons:
- Web pages can't access your local file system directly
- This prevents malicious websites from reading your files
- The solution is to include the file IN your project (public folder)
- Then the file is served by your web server, not accessed directly

---

## Alternative: Use a URL Instead

If you don't want to include the file in your project, you can:

1. **Upload to a file hosting service:**
   - Google Drive (get a direct link)
   - Dropbox (get a direct link)
   - Cloudinary
   - Your own web server

2. **Update the config with the URL:**
   ```typescript
   export const BACKGROUND_MUSIC_URL = 'https://example.com/your-music.mp4';
   ```

---

## That's It! 🎮

Once your file is in `/public/assets/background-music.mp4`, refresh the page and enjoy your custom background music!

**Current Status:**
- ✅ Music system ready
- ✅ Config file updated
- ⏳ Waiting for you to copy the file
- 🎵 Will automatically switch from chiptune to your track once file is in place!
