# The Great Milk Heist 🥛

A bright, colorful roguelike game where your milk gets stolen and you must fight through 15 procedurally generated rooms to get it back!

## ⚠️ Getting "Error fetching user data"?

**👉 Quick fix: `START_HERE.md` (5 minutes)**  
**📋 Super quick: `QUICK_REFERENCE.md` (2 minutes)**

## Quick Start

1. **Database Setup** (Required - 5 minutes)
   - **New users:** Follow `START_HERE.md` (easiest)
   - **Detailed guide:** See `SETUP_CHECKLIST.md`
   - **Technical details:** See `SUPABASE_SETUP.md`

2. **Play the Game**
   - Create an account or sign in
   - Choose your difficulty
   - Fight through rooms to get your milk back!

## Features

### Core Gameplay
- 🎮 **15 procedurally generated rooms** with boss fights every 5 rooms
- 👾 **8 different enemy types** with unique abilities
- 🔫 **25 weapons** with unlocking system
- 💪 **Power-ups** and weapon selection after each room
- 🏆 **4 difficulty levels** including "MILK" mode at 250% difficulty
- 💰 **Coin/currency system** for upgrades
- 🎨 **30 cosmetics** all with gameplay abilities

### Multiplayer & Social
- 👥 **Friends list system** for multiplayer invites
- 🎯 **35 custom achievements**
- 📊 **Stats tracking** (rooms cleared, enemies killed, etc.)
- 🔐 **User authentication** with Supabase (saves progress)

### Technical Features
- 🎮 **Full controller support** (PS3/PS4/PS5/Xbox)
- 🔒 **AI-powered username filtering**
- 💾 **Cloud save** via Supabase
- 🎵 **Sound effects** and music

## Troubleshooting

### Common Issues

**"Error fetching user data: The result contains 0 rows"**
- This is a timing issue with the database trigger
- The app automatically retries for up to 7.5 seconds
- If it persists, see `TROUBLESHOOTING.md` issue #1B

**"Database not set up"**
- Run the migration in Supabase (see `SUPABASE_SETUP.md`)
- Make sure tables are created

**"Please confirm your email before signing in"**
- Disable email confirmation in Supabase settings
- See `SUPABASE_SETUP.md` for instructions

**More Issues?**
- Check `TROUBLESHOOTING.md` for detailed solutions
- Run the diagnostic script: `/supabase/migrations/diagnostic_check.sql`

## Documentation

- 📚 `SUPABASE_SETUP.md` - Complete database setup guide
- 🔧 `TROUBLESHOOTING.md` - Common issues and solutions
- 📖 `AUTH_REFERENCE.md` - Technical authentication details
- 📝 `CHANGELOG.md` - Recent updates and changes
- 🎯 `Attributions.md` - Credits and attributions

## Game Controls

### Keyboard
- **WASD** - Move
- **Mouse** - Aim and shoot
- **Space** - Dodge/dash
- **ESC** - Pause menu

### Controller
- **Left Stick** - Move
- **Right Stick** - Aim
- **Right Trigger** - Shoot
- **A/X Button** - Dodge/dash
- **Start** - Pause menu

## Development

Built with:
- React + TypeScript
- Tailwind CSS
- Supabase (authentication & database)
- Canvas API (game rendering)

## Deployment

- 🌐 **Browser**: See `BROWSER_DEPLOYMENT.md`
- 🎮 **Itch.io**: See `ITCH_IO_DEPLOYMENT.md`

## Credits

See `Attributions.md` for full credits and licensing information.

---

**Have fun getting your milk back!** 🥛✨
