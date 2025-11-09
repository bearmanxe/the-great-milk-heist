# 🥛 The Great Milk Heist - Quick Start

## What's Working Right Now

✅ **Fully Functional:**
- Single-player game (all 15 rooms + endless mode)
- 8 enemy types with special abilities
- 25 weapons with unlock system
- 30 cosmetics with gameplay abilities
- 4 difficulty levels including MILK mode
- Boss fights every 5 rooms
- Weapon upgrades and power-ups
- Coin/currency system
- Shop with loot boxes
- 35 custom achievements
- User authentication (Supabase)
- Friends list system
- Controller support (PS3/PS4/PS5/Xbox)
- Custom username system with AI filtering

⚠️ **Local Mode Only:**
- Multiplayer (works but only in same browser)
- Chat system (works locally)

## Playing the Game

### First Time Setup

1. **Start the game**
2. **Create an account** with a username and password
3. **Choose difficulty:**
   - Easy (100 HP, +5 defense)
   - Normal (80 HP, +3 defense)
   - Hard (60 HP, +1 defense)
   - MILK (40 HP, 250% difficulty!)

4. **Fight through 15 rooms** to get your milk back!

### Controls

**Keyboard & Mouse:**
- WASD or Arrow Keys: Move
- Mouse: Aim
- Left Click: Attack
- ESC: Pause

**Controller:**
- Left Stick: Move
- Right Stick: Aim
- Right Trigger: Attack
- Start/Options: Pause

### Game Features

**After Each Room:**
- Choose weapon upgrade OR power-up
- Spend 10 coins to reroll options

**Boss Fights:**
- Every 5th room (rooms 5, 10, 15)
- Tougher enemies with more health
- Greater rewards!

**Shop:**
- Buy cosmetics (they have gameplay bonuses!)
- Upgrade weapons permanently
- Open loot boxes for random cosmetics

**Multiplayer (Local Mode):**
- Create or join a game
- Enemy scaling: 2x, 2.5x, 3x based on player count
- Chat with other players
- Works only in same browser currently

## Enabling Real Online Multiplayer

Your game is using **local mode** for multiplayer. To enable true online multiplayer:

### Quick Deploy (5 minutes):

```bash
# 1. Install Supabase CLI
npm install -g supabase

# 2. Login
supabase login

# 3. Link your project
supabase link --project-ref symyhtogzjmuibiayvnr

# 4. Deploy
supabase functions deploy make-server
```

**That's it!** Reload the game and multiplayer will work online.

📖 Full instructions: **DEPLOY_MULTIPLAYER.md**

## Troubleshooting

### "Database not set up"
1. Open Supabase Dashboard
2. Go to SQL Editor
3. Run the migration in `supabase/migrations/COMPLETE_SETUP.sql`

### "Multiplayer server unavailable"
- You're in local mode (this is okay for testing)
- To enable online multiplayer, follow steps above

### "Username taken" or "Invalid username"
- Usernames must be 3-20 characters
- Letters, numbers, underscores, hyphens only
- AI filter prevents inappropriate names

### Controller not working
- Make sure controller is connected before starting game
- Supported: PS3/PS4/PS5/Xbox controllers
- Check browser compatibility (Chrome/Edge work best)

## File Structure Guide

- **App.tsx** - Main game logic
- **components/** - All React components
- **data/** - Weapons, enemies, cosmetics, achievements
- **utils/** - Game systems (multiplayer, sound, controllers)
- **supabase/** - Database migrations and Edge Functions

## Documentation

- **DEPLOY_MULTIPLAYER.md** - Deploy online multiplayer
- **DATABASE_SETUP_REQUIRED.md** - Supabase database setup
- **CONTROLLER_AND_CHAT_GUIDE.md** - Controller & chat details
- **TROUBLESHOOTING.md** - Common issues & solutions
- **AUTH_REFERENCE.md** - Authentication system guide

## Need Help?

1. Check **TROUBLESHOOTING.md** first
2. Review error messages in browser console (F12)
3. Verify database setup in Supabase dashboard
4. Make sure Edge Function is deployed for multiplayer

## Tips & Tricks

💡 **Save coins early** - Permanent weapon upgrades are powerful
💡 **Try all cosmetics** - Each has unique gameplay abilities
💡 **Boss strategy** - Focus on dodging, chip away slowly
💡 **MILK mode** - For the truly brave (or foolish)
💡 **Endless mode** - Continue after room 15 for glory
💡 **Achievements** - Check progress often for secret challenges

Enjoy the Great Milk Heist! 🥛🎮
