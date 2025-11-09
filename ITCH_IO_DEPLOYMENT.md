# Deploying "The Great Milk Heist" to itch.io

## Instructions for Browser Deployment

### Step 1: Build the Game
Run the following command to build the game for production:
```bash
npm run build
```

This will create a `dist` folder with all the compiled assets.

### Step 2: Prepare for Upload
1. Navigate to the `dist` folder
2. Compress ALL files in the `dist` folder into a ZIP file (e.g., `milk-heist.zip`)
   - Make sure you're zipping the CONTENTS of the dist folder, not the dist folder itself
   - The zip file should have `index.html` at the root level

### Step 3: Upload to itch.io
1. Go to [itch.io](https://itch.io/) and log in to your account
2. Click on "Upload new project" from your dashboard
3. Fill out the game details:
   - **Title**: The Great Milk Heist
   - **Classification**: Game
   - **Kind of project**: HTML
   - **Description**: "Your milk has been stolen! Fight through 15 procedurally generated rooms full of enemies to get it back. Features boss fights every 5 rooms, weapon/power-up selection, four difficulty levels, and a cosmetics shop with gameplay abilities!"
   
4. Under "Uploads", click "Upload files"
5. Upload your `milk-heist.zip` file
6. Check the box "This file will be played in the browser"
7. Set the viewport dimensions to 1024x768 or "Automatically detect"
8. Set "Frame options" to "Fullscreen button" for the best experience

### Step 4: Configure Settings
- **Embed options**: Enable "Fullscreen button" for better player experience
- **Mobile friendly**: Check "Enable mobile layout" if you want mobile support
- **Pricing**: Set to free or name your price
- **Community**: Enable comments and ratings

### Step 5: Publish
1. Review all settings
2. Set visibility to "Public" when you're ready
3. Click "Save & view page"

## Important Notes

- The game is optimized for desktop browsers but will work on mobile with touch controls
- The game uses localStorage to save progress (coins, unlocked cosmetics)
- Audio works best when the user interacts with the page first (browser requirement)
- The game should work in all modern browsers (Chrome, Firefox, Safari, Edge)

## Testing Before Upload

Before uploading, you can test the build locally:
```bash
npm run build
npm run preview
```

This will serve your production build locally for testing.

## Troubleshooting

**Game doesn't load:**
- Make sure the ZIP file has `index.html` at the root level
- Check browser console for errors
- Try a different browser

**Missing assets:**
- Ensure all files in the `dist` folder are included in the ZIP
- Check that file paths are relative, not absolute

**Audio doesn't play:**
- Users need to interact with the page first (click/tap anywhere)
- This is a browser security requirement for auto-playing audio

## Game Features to Highlight

When creating your itch.io page, highlight these features:
- ✨ 15 procedurally generated rooms with increasing difficulty
- 👹 Boss fights every 5 rooms
- 🔫 25 unique weapons to unlock
- ⚡ 20 power-ups and 25 superpowers
- 🎨 15 cosmetic skins with gameplay abilities
- 💀 8 enemy types including Reaper (poison), Vampire (lifesteal), and Mutant (obstacle throwing)
- 🎮 4 difficulty levels: Easy, Normal, Hard, and MILK (250% harder!)
- ♾️ Endless mode after beating the game
- 🪙 Coin system for purchasing cosmetics
- 🎵 Dynamic music and sound effects

## Credits

Remember to credit:
- Game created with React and Tailwind CSS
- Built with Vite
- Icons from lucide-react
- Motion animations from motion/react
- Sound effects from sonner

Enjoy sharing your game on itch.io! 🥛🎮
