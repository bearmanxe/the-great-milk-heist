// Background Music Configuration
// 
// Your custom background music is loaded from Dropbox.
// The music will auto-play when the game starts (after first user interaction).
// 
// HOW TO CHANGE YOUR MUSIC:
// 1. Upload your MP4/MP3 file to Dropbox
// 2. Get the share link
// 3. Change the end of the link from "dl=0" to "dl=1" 
// 4. Replace the URL below

// Custom music URL from Dropbox (must end with dl=1)
export const BACKGROUND_MUSIC_URL: string | null = 'https://www.dropbox.com/scl/fi/tv692rm4skfl9lr5kbcbo/background-music.mp4?rlkey=09t4xxri4ref2cmvmwqdmrqln&st=dkpcvta1&dl=1';

export const BACKGROUND_MUSIC_CONFIG = {
  enabled: true,         // Set to false to disable background music entirely
  autoPlay: true,        // Auto-play when game starts (after user interaction)
  defaultVolume: 0.3,    // 30% volume (0.0 to 1.0)
  loop: true,            // Loop the music infinitely ✅
  preload: true,         // Start loading immediately when app starts
};