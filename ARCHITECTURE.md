# 🏗️ The Great Milk Heist - Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    THE GREAT MILK HEIST                      │
│                    React + TypeScript Game                   │
└─────────────────────────────────────────────────────────────┘
                              │
                ┌─────────────┼─────────────┐
                │             │             │
                ▼             ▼             ▼
        ┌──────────┐   ┌──────────┐   ┌──────────┐
        │ SINGLE   │   │  MULTI   │   │   AUTH   │
        │  PLAYER  │   │  PLAYER  │   │ SYSTEM   │
        └──────────┘   └──────────┘   └──────────┘
             │              │               │
             ▼              ▼               ▼
        ┌─────────┐   ┌──────────┐   ┌──────────┐
        │ Local   │   │  Local   │   │ Supabase │
        │ Storage │   │  Server  │   │   Auth   │
        └─────────┘   └──────────┘   └──────────┘
                           │               │
                           │               │
                           ▼               ▼
                      [OPTIONAL]      [OPTIONAL]
                    ┌──────────┐   ┌──────────┐
                    │   Edge   │   │ Database │
                    │ Function │   │Migration │
                    └──────────┘   └──────────┘
                         │              │
                         ▼              ▼
                    🌐 Online     💾 Persistent
                    Multiplayer      Save Data
```

## Components Breakdown

### Core Game (Always Working)
```
App.tsx
├── GameRoom.tsx          ← Main gameplay
│   ├── Enemy spawning
│   ├── Combat system
│   ├── Weapon handling
│   └── Boss fights
│
├── StartScreen.tsx       ← Menu & difficulty
├── UpgradeSelection.tsx  ← Post-room choices
├── Shop.tsx              ← Buy/upgrade items
├── VictoryScreen.tsx     ← Win/endless mode
└── GameOver.tsx          ← Death screen
```

### Multiplayer System
```
MultiplayerManager
├── Tries: Edge Function (remote)
│   └── If fails ↓
├── Falls back: Local Server
│   ├── In-memory sessions
│   ├── Same-browser only
│   └── Full functionality
│
└── Components:
    ├── MultiplayerMenu.tsx   ← Create/join UI
    ├── MultiplayerLobby.tsx  ← Waiting room
    ├── Chat.tsx              ← Messaging
    └── EdgeFunctionCheck.tsx ← Status display
```

### Authentication
```
Supabase Auth
├── User registration
├── User login
├── Session management
└── Profile data
    │
    └── Optional: Database Migration
        ├── profiles table
        ├── friends table
        └── friend_requests table
```

## Data Flow

### Single-Player Game Loop
```
Start Game
    ↓
Generate Room (roomGenerator.ts)
    ↓
Spawn Enemies (data/enemies)
    ↓
Combat Loop
    ↓
Room Complete
    ↓
Choose Upgrade (weapons.ts / powerups.ts)
    ↓
Next Room or Boss Fight
    ↓
Repeat until Room 15
    ↓
Victory or Death
```

### Multiplayer Game Flow
```
Host: Create Session
    ↓
Try Edge Function
    ├─ Success → Online Mode 🌐
    └─ Fail → Local Mode 🏠
    ↓
Display Session Code
    ↓
Other Players: Join Session
    ↓
Host: Start Game
    ↓
Sync Game State (Realtime)
    ├─ Player positions
    ├─ Enemy health
    ├─ Projectiles
    └─ Room number
    ↓
Play Together!
```

### Authentication Flow
```
User Registration
    ↓
Create Account (Supabase)
    ↓
Check Database
    ├─ Migration Done → Create Profile ✅
    └─ Not Done → Error ⚠️
    ↓
Store Session
    ↓
Save Game Data
```

## Technology Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Tailwind v4** - Styling
- **Motion** - Animations
- **Lucide** - Icons
- **Sonner** - Toast notifications

### Backend (Supabase)
- **Auth** - User accounts
- **Database** - PostgreSQL
- **Realtime** - WebSocket channels
- **Edge Functions** - Deno runtime

### Game Systems
- **Controllers** - Gamepad API
- **Sound** - Web Audio API
- **Canvas** - 2D rendering
- **LocalStorage** - Client-side saves

## File Structure Logic

```
/App.tsx                  ← Main game controller
/components/              ← React components
    /ui/                  ← Shadcn UI components
/data/                    ← Game content
    weapons.ts            ← 25 weapons
    cosmetics.ts          ← 30 cosmetics
    achievements.ts       ← 35 achievements
    powerups.ts           ← Temporary buffs
/utils/                   ← Game systems
    multiplayerManager    ← Network logic
    localMultiplayerServer← Fallback server
    controllerManager     ← Gamepad support
    achievementManager    ← Progress tracking
    soundManager          ← Audio system
/supabase/                ← Backend code
    /functions/           ← Edge Functions
    /migrations/          ← Database setup
/types/                   ← TypeScript types
```

## Deployment Modes

### Mode 1: Local Only (Current)
```
✅ Single-player: Full
✅ Multiplayer: Same browser
✅ Auth: Works (limited saves)
⚠️ Saves: Session only
```

### Mode 2: Database Enabled
```
✅ Single-player: Full
✅ Multiplayer: Same browser
✅ Auth: Full with profiles
✅ Saves: Persistent
✅ Friends: Working
```

### Mode 3: Fully Deployed
```
✅ Single-player: Full
✅ Multiplayer: Online
✅ Auth: Full with profiles
✅ Saves: Persistent
✅ Friends: Working
✅ Cross-device: Yes
```

## Network Architecture

### Local Mode (Current)
```
Browser Tab A          Browser Tab B
     │                      │
     └──────► LocalStorage ◄┘
              (Same session)
```

### Online Mode (After Deploy)
```
Player A                     Player B
   │                            │
   ├─► Supabase Realtime ◄──────┤
   │          │                 │
   └──► Edge Function ◄─────────┘
          (Deno KV)
```

## State Management

### Single-Player State
- All in App.tsx useState
- No external state management
- Saves to localStorage
- Loads on mount

### Multiplayer State
- Session data in KV store
- Player data synced via Realtime
- Local state for UI
- Polling for updates

### Auth State
- Supabase session
- User data in database
- Friends list cached
- Achievements tracked

## Performance Optimization

### Game Loop
- 60 FPS target
- requestAnimationFrame
- Efficient collision detection
- Object pooling for projectiles

### Network
- Polling every 1 second
- Debounced updates
- Optimistic UI updates
- Fallback on failure

### Memory
- Clean up on unmount
- Remove event listeners
- Clear intervals
- Reset state properly

## Error Handling

### Network Errors
```
Try Edge Function
    ├─ Success → Continue
    └─ Fail → Auto fallback to local
        └─ Silent (no console spam)
            └─ Show status to user
```

### Auth Errors
```
Try Auth Action
    ├─ Success → Continue
    └─ Fail → Show toast
        └─ Check database setup
            └─ Guide user to fix
```

### Game Errors
```
Try Game Action
    ├─ Success → Continue
    └─ Fail → Graceful degradation
        └─ Show error screen
            └─ Allow retry
```

## Security Model

### Authentication
- Supabase Auth (JWT)
- Row Level Security
- Username validation
- AI content filtering

### Multiplayer
- Session-based access
- Host-only controls
- Rate limiting (Edge Function)
- Input sanitization

### Database
- RLS policies
- Authenticated only
- User-scoped queries
- Prepared statements

## Scalability

### Current Limits
- Local: 4 players max
- Sessions: In-memory only
- Saves: Per browser

### After Deployment
- Online: 4 players max
- Sessions: KV store
- Saves: PostgreSQL
- Can scale to 1000s users

## Monitoring

### Available Logs
- Browser console (F12)
- Supabase logs
- Edge Function logs
- Network tab

### Key Metrics
- Session creation success
- Player join rate
- Game completion %
- Error frequency

---

**Current Status:** Mode 1 (Local Only) ✅
**Fully Functional:** Yes!
**Ready to Deploy:** Yes (optional)
