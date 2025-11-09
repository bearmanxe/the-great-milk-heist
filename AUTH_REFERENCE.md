# Authentication System Reference

## Quick Overview

The Great Milk Heist uses **real email authentication** with custom usernames.

---

## Sign Up Flow

### User Provides:
1. **Email** (real email address)
2. **Username** (3-20 chars, alphanumeric + underscore/hyphen)
3. **Password** (min 6 chars)
4. **Confirm Password**

### Validation Checks:
- ✅ Email format is valid
- ✅ Username is unique
- ✅ Username passes AI content filter
- ✅ Username format is valid (alphanumeric + `_` and `-` only)
- ✅ Passwords match

### What Happens:
1. App calls `signUp(email, username, password)`
2. Supabase creates auth user with email
3. Username stored in `user_metadata`
4. **Database trigger automatically creates user profile**
5. User is immediately logged in
6. Redirected to game start screen

---

## Sign In Flow

### User Provides:
1. **Email** (same email used during signup)
2. **Password**

**Note:** Username is NOT required for login.

### What Happens:
1. App calls `signIn(email, '', password)`
2. Supabase authenticates with email/password
3. User data loaded from database (including username)
4. Username displayed throughout the game
5. Redirected to game start screen

---

## Database Structure

### auth.users (Supabase Auth)
- `id` - UUID (primary key)
- `email` - User's email
- `encrypted_password` - Hashed password
- `raw_user_meta_data` - Contains `{ username: "..." }`

### public.users (Game Data)
- `id` - UUID (references auth.users.id)
- `username` - Display name
- `unlocked_cosmetics` - Array of cosmetic IDs
- `weapon_upgrades` - Upgrade levels
- `achievements` - Array of achievement IDs
- `total_coins` - Currency
- `selected_cosmetic` - Current cosmetic
- `stats` - Game statistics
- `friends` - Array of friend user IDs
- `created_at` - Timestamp

---

## Database Trigger

### Function: `handle_new_user()`
**Purpose:** Automatically creates user profile when someone signs up

**Trigger:** `on_auth_user_created`
- Fires AFTER INSERT on `auth.users`
- Runs with SECURITY DEFINER (bypasses RLS)
- Extracts username from `raw_user_meta_data`
- Creates record in `public.users`
- Handles username conflicts gracefully

**Why This Matters:**
Without this trigger, you'd get RLS policy violations because the client code can't insert into the `users` table due to Row-Level Security policies.

---

## Row-Level Security Policies

### Users Table
- ✅ Users can INSERT their own data (via trigger only)
- ✅ Users can SELECT their own data
- ✅ Users can UPDATE their own data
- ✅ Users can SELECT other users' basic info (for friends)

### Friend Requests Table
- ✅ Users can SELECT requests they sent or received
- ✅ Users can INSERT requests they are sending
- ✅ Users can UPDATE requests sent to them

### Session Invites Table
- ✅ Users can SELECT their own invites
- ✅ Anyone can INSERT invites (for multiplayer)

---

## Configuration Requirements

### Supabase Dashboard Settings

**1. Disable Email Confirmation:**
- Path: Authentication → Providers → Email
- Setting: "Confirm email" → OFF
- Reason: Allows instant signup without email verification

**2. Database Setup:**
- Must run migration: `20250107000000_initial_schema.sql`
- Verify trigger exists: Database → Triggers → `on_auth_user_created`

---

## Code Files

### Authentication Flow
- `/components/AuthScreen.tsx` - UI for sign up/sign in
- `/utils/supabaseClient.ts` - Auth functions
- `/App.tsx` - Auth handlers and state management

### Database
- `/supabase/migrations/20250107000000_initial_schema.sql` - Full schema
- `/supabase/migrations/reset_and_reapply.sql` - Reset script

### Documentation
- `/SUPABASE_SETUP.md` - Setup instructions
- `/TROUBLESHOOTING.md` - Common issues
- `/CHANGELOG.md` - Recent changes

---

## Username Validation

### Format Rules
- Length: 3-20 characters
- Allowed: Letters, numbers, underscore (`_`), hyphen (`-`)
- Regex: `/^[a-zA-Z0-9_-]+$/`

### Content Filtering
- AI-powered inappropriate content detection
- Checks for offensive words
- Provides helpful error messages
- See `/utils/usernameFilter.ts`

---

## Common Patterns

### Creating New User
```typescript
// Client calls:
await signUp('user@example.com', 'cool_player', 'password123');

// Behind the scenes:
// 1. Supabase creates auth.users record
// 2. Trigger fires automatically
// 3. public.users record created
// 4. User is logged in
```

### Checking If Logged In
```typescript
const user = await getCurrentUser();
if (user) {
  const userData = await getUserData(user.id);
  console.log('Username:', userData.username);
}
```

### Updating User Data
```typescript
await updateUserData(userId, {
  totalCoins: 500,
  selectedCosmetic: '🐉'
});
```

---

## Security Notes

- ✅ Passwords are never stored in plain text
- ✅ Auth handled by Supabase (industry standard)
- ✅ RLS policies prevent unauthorized data access
- ✅ Database trigger runs with elevated permissions (SECURITY DEFINER)
- ✅ Email validation prevents invalid addresses
- ✅ Username uniqueness enforced at database level
- ✅ AI filter prevents inappropriate usernames

---

## Migration History

### Version 1 (Original)
- Used synthetic emails: `username@milkheist.app`
- Manual user record creation
- RLS policy violations

### Version 2 (Current)
- Real email addresses
- Automatic user record creation via trigger
- Fixed RLS issues
- Better error handling
