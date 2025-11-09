# 🥛 The Great Milk Heist - StackBlitz Edition

## ✅ Fully Functional - No Setup Required!

This game now runs perfectly on StackBlitz in **standalone mode** without requiring any database setup.

## 🎮 What Works

✅ **All Core Features**:
- 15 procedurally generated rooms
- Boss fights every 5 rooms
- 8 enemy types with special abilities
- 25 weapons with unlocking system
- 30 cosmetics with gameplay abilities
- 35 achievements
- Local co-op mode (2 players, same keyboard)
- Reverse mode (start at room 15, fight backwards)
- 4 difficulty levels including MILK mode (250%)
- Controller support (PS3/PS4/PS5/Xbox)
- Custom background music system
- **NEW: "Back to Menu" button during gameplay**

✅ **Progress Saving**:
- All progress saved in browser's localStorage
- Cosmetics, weapons, achievements persist
- Coins and upgrades saved automatically

✅ **No Authentication Required**:
- Jump straight into the game
- No login/signup needed
- Works offline after first load

## 🎵 Custom Music

Your custom Dropbox music is configured and ready:
- Edit `/config/audio.ts` to change the music URL
- Music loops infinitely
- Volume controls in bottom-right corner

## 🕹️ Controls

### Single Player:
- **WASD** or **Arrow Keys**: Move
- **Auto-aim**: Shoots at nearest enemy
- **Space**: Use superpower (when available)

### Local Co-op:
- **Player 1**: WASD + Space
- **Player 2**: Arrow Keys + Enter

### Controller:
- Plug in any Xbox/PlayStation controller
- Auto-detected and ready to use
- Haptic feedback supported

## 🆕 Back to Menu Feature

During any run, click the **"Back to Menu"** button in the top-right to:
- Quit the current run safely
- Keep all coins earned so far
- Return to the main menu
- No progress lost on purchases/unlocks

## 📊 Local Storage Keys

Data is saved under these keys:
- `milkHeist_totalCoins`
- `milkHeist_unlockedCosmetics`
- `milkHeist_weaponUpgrades`
- `milkHeist_selectedCosmetic`
- `milkHeist_achievements`

## 🔧 Technical Changes

### What Was Removed:
- ❌ Supabase authentication
- ❌ Database connection requirements
- ❌ Friends list functionality
- ❌ Online multiplayer (was already removed)
- ❌ Cloud save syncing

### What Was Added:
- ✅ localStorage persistence
- ✅ Instant game start
- ✅ "Back to Menu" quit button
- ✅ Standalone mode console messages

## 🚀 Getting Started

1. Just click "Run" in StackBlitz
2. Wait for the game to load
3. Click "Start Game" and choose your settings
4. Play!

No configuration, no setup, no databases. It just works.

## 🎯 Features Still Work:

- ✅ All 8 enemy types
- ✅ All 25 weapons  
- ✅ All 30 cosmetics
- ✅ All 35 achievements
- ✅ Weapon upgrade system
- ✅ Loot boxes
- ✅ Coin economy
- ✅ Difficulty scaling
- ✅ Boss fights
- ✅ Room generation
- ✅ Particle effects
- ✅ Sound effects
- ✅ Background music
- ✅ Controller support
- ✅ Local co-op revival system
- ✅ Reverse mode downgrade system
- ✅ Achievement tracking
- ✅ Cosmetic abilities
- ✅ Special Platinum Champion cosmetic

## 📝 Notes

- Progress is browser-specific (won't sync across devices)
- Clearing browser data will reset your progress
- Works in any modern browser
- Best experience in Chrome/Edge

---

**Enjoy stealing back your milk! 🥛**
