# Browser Deployment Guide

## ✅ Game is Ready!

Your game is already configured for browser deployment! The `index.html` file at the root includes all necessary optimizations for browser play.

## 🎮 Playing in Browser

### Method 1: Direct Development Server (Recommended)
The game will run automatically when you start the development server. All features work including:
- ✅ Weapon upgrades (damage, speed, range)
- ✅ Loot boxes for random cosmetics  
- ✅ Reroll button (10 coins) for upgrade choices
- ✅ 30 cosmetics with abilities
- ✅ All enemy types with special abilities
- ✅ Lifesteal system
- ✅ Local storage for progress

### Method 2: itch.io Upload

1. **Export Your Game**
   - Click the "Export" or "Download" button in your development environment
   - This will create a ZIP file with your game

2. **Upload to itch.io**
   - Go to https://itch.io/dashboard
   - Click "Create new project"
   - Fill in game details:
     - Title: "The Great Milk Heist"
     - Project URL: your-username/the-great-milk-heist
     - Classification: Games
     - Kind of project: HTML
   
3. **Upload Files**
   - Upload the ZIP file
   - Check "This file will be played in the browser"
   - Set embed options:
     - Width: 1200px
     - Height: 800px
     - Enable fullscreen button
     - Mobile friendly: ON

4. **Configure Settings**
   - Pricing: Free or set a price
   - Visibility: Public/Restricted/Private
   - Add screenshots and description

5. **Save & View**
   - Click "Save & view page"
   - Test your game in the browser!

## 🎯 New Features

### Weapon Shop
- **Damage Boost**: +5 damage for 50 coins
- **Speed Boost**: +0.2 attack speed for 75 coins  
- **Range Boost**: +10 range for 40 coins
- Upgrades are permanent and apply to ALL weapons!

### Reroll System
- After completing a room, you get 3 upgrade choices
- Click "Reroll (10 🪙)" to get 3 new random options
- Costs 10 coins per reroll
- Your coin balance is shown at the top

### Loot Boxes
- **Basic Box** (50 coins): Common cosmetics
- **Premium Box** (150 coins): Rare cosmetics
- **Legendary Box** (300 coins): Legendary cosmetics

## 🐛 Troubleshooting

### Game Won't Load
- Clear browser cache (Ctrl+Shift+Delete)
- Try a different browser (Chrome, Firefox, Safari)
- Disable browser extensions
- Check browser console for errors (F12)

### Controls Not Working
- Make sure the game area is focused (click on it)
- Use WASD or Arrow Keys to move
- Game auto-attacks nearest enemy

### Progress Not Saving
- Make sure cookies/local storage is enabled
- Don't use private/incognito mode
- Check browser storage settings

## 📱 Mobile Support

The game includes mobile optimizations:
- Touch controls prevention (use touch screen carefully)
- Responsive UI
- No zooming on mobile
- Optimized for landscape mode

Note: For best experience, play on desktop with keyboard controls!

## 🎨 Controls

- **Movement**: WASD or Arrow Keys
- **Attack**: Automatic (targets nearest enemy)
- **Shop**: Click "Shop" button on main menu
- **Reroll**: Click "Reroll" button after room completion

## 💾 Save Data

Game progress is saved automatically in your browser:
- Total coins earned
- Unlocked cosmetics
- Equipped cosmetic
- Weapon upgrade levels

To reset progress, clear your browser's local storage for the game's domain.

---

**Have fun saving your milk! 🥛**
