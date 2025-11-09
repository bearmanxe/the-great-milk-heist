# Troubleshooting Guide - The Great Milk Heist

## Common Issues and Solutions

### 1. "new row violates row-level security policy for table 'users'"

**Problem:** Getting RLS (Row-Level Security) errors when trying to sign up.

**Solution:**
This happens if you're using the old migration without the database trigger. Follow these steps:

1. **Open Supabase Dashboard** → SQL Editor
2. **Drop the old tables:**
   ```sql
   DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
   DROP FUNCTION IF EXISTS public.handle_new_user();
   DROP TABLE IF EXISTS public.session_invites CASCADE;
   DROP TABLE IF EXISTS public.friend_requests CASCADE;
   DROP TABLE IF EXISTS public.users CASCADE;
   ```
3. **Run the updated migration:**
   - Copy the entire contents of `/supabase/migrations/20250107000000_initial_schema.sql`
   - Paste into SQL Editor and click "Run"
4. **Verify the trigger was created:**
   - Go to Database → Triggers
   - You should see `on_auth_user_created`

---

### 1B. "Error fetching user data: The result contains 0 rows"

**Problem:** After signing up, the app can't find your user data.

**Root Cause:** The database trigger isn't creating your user profile automatically.

**QUICK FIX (Recommended):**

1. **Run the diagnostic script first:**
   - Go to Supabase Dashboard → SQL Editor
   - Copy contents of `/supabase/migrations/diagnostic_check.sql`
   - Run it and look for any ✗ marks

2. **Apply the trigger fix:**
   - Go to SQL Editor
   - Copy contents of `/supabase/migrations/20250107000001_fix_trigger.sql`
   - Run it
   - You should see "✓ Trigger created successfully"

3. **Apply the fallback function:**
   - Copy contents of `/supabase/migrations/create_user_profile_function.sql`
   - Run it in SQL Editor
   - This creates a backup method that the app will use if the trigger fails

4. **Delete your orphaned account and try again:**
   - Go to Authentication → Users
   - Delete your account
   - Sign up again
   - It should work now (either via trigger or fallback function)

**ALTERNATIVE - Fix existing orphaned users:**

If you already have an account in Authentication but no profile:

```sql
-- Run this in SQL Editor after copying your user ID from Authentication → Users
SELECT public.create_user_profile(
  'YOUR_USER_ID'::UUID,  -- Replace with your actual UUID
  'YourUsername'          -- Replace with your desired username
);
```

This will create your profile and you can then log in.

---

### 2. "Database not set up" or "Could not find table 'public.users'"

**Problem:** The database tables haven't been created yet.

**Solution:**
See `SUPABASE_SETUP.md` for full instructions. Quick fix:

1. Go to Supabase Dashboard → SQL Editor
2. Copy contents of `/supabase/migrations/20250107000000_initial_schema.sql`
3. Paste and run in SQL Editor
4. Verify tables exist in Table Editor

---

### 3. "Please confirm your email before signing in"

**Problem:** Supabase is requiring email verification.

**Solution:**
Disable email confirmation in Supabase:

1. Go to Supabase Dashboard → **Authentication** → **Providers**
2. Click on **Email** provider
3. Find **"Confirm email"** setting
4. Toggle it **OFF**
5. Click **Save**

Now users can sign up and play immediately without email verification.

---

### 4. Username Already Taken (during signup)

**Problem:** Username exists in the database already.

**Solution:**
Choose a different username. The app checks for uniqueness before creating the account.

If you're getting this error incorrectly:
- The database might have leftover data from testing
- Drop and recreate the tables using the steps in issue #1

---

### 5. Can't Sign In After Creating Account

**Possible Causes:**

**A. Email confirmation is enabled**
- Follow solution in issue #3

**B. Wrong email or password**
- Remember: Login uses EMAIL and PASSWORD (not username)
- Username is only used during signup

**C. Account wasn't created properly**
- Check Supabase Dashboard → Authentication → Users
- Your email should be listed there
- If not, try signing up again

---

### 6. Multiplayer Not Working

**Problem:** This is a known issue that's still being debugged.

**Current Status:**
- Friends system works
- Can send invites
- Actual multiplayer gameplay needs debugging

This is on the roadmap to fix.

---

### 7. Database Trigger Not Working

**Problem:** User profile isn't being created automatically after signup.

**Check:**
1. Go to Supabase Dashboard → Database → Triggers
2. Verify `on_auth_user_created` trigger exists
3. Click on it to see the function details

**If trigger is missing:**
Run this SQL to create it:
```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  username_to_use TEXT;
BEGIN
  username_to_use := COALESCE(NEW.raw_user_meta_data->>'username', 'Player_' || substr(NEW.id::text, 1, 8));
  
  INSERT INTO public.users (id, username, unlocked_cosmetics, weapon_upgrades, achievements, total_coins, selected_cosmetic, stats, friends)
  VALUES (
    NEW.id,
    username_to_use,
    ARRAY['default']::TEXT[],
    '{"damage": 0, "attackSpeed": 0, "range": 0, "knockback": 0}'::JSONB,
    ARRAY[]::TEXT[],
    0,
    '🧑',
    '{"roomsCleared": 0, "enemiesKilled": 0, "bossesDefeated": 0, "coinsEarned": 0, "hasWonOnce": false}'::JSONB,
    ARRAY[]::UUID[]
  );
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    INSERT INTO public.users (id, username, unlocked_cosmetics, weapon_upgrades, achievements, total_coins, selected_cosmetic, stats, friends)
    VALUES (
      NEW.id,
      username_to_use || '_' || substr(NEW.id::text, 1, 4),
      ARRAY['default']::TEXT[],
      '{"damage": 0, "attackSpeed": 0, "range": 0, "knockback": 0}'::JSONB,
      ARRAY[]::TEXT[],
      0,
      '🧑',
      '{"roomsCleared": 0, "enemiesKilled": 0, "bossesDefeated": 0, "coinsEarned": 0, "hasWonOnce": false}'::JSONB,
      ARRAY[]::UUID[]
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

---

### 8. Inappropriate Username Rejected

**Problem:** AI filter is blocking your username.

**Reason:** The game has an AI-powered filter to prevent inappropriate usernames.

**Solution:**
- Try a different username
- Usernames must be 3-20 characters
- Can only contain letters, numbers, underscores, and hyphens
- Avoid offensive or inappropriate words

---

### 9. Supabase Project Paused

**Problem:** Free tier Supabase projects auto-pause after 7 days of inactivity.

**Solution:**
1. Go to Supabase Dashboard
2. Click "Restore" or "Resume" button
3. Wait a few minutes for the project to wake up
4. Try accessing the game again

---

### 10. Lost All My Progress

**Problem:** Game data was reset.

**Possible Causes:**
- Database was dropped and recreated (see issue #1)
- Different account was used
- Browser cache was cleared (for local development)

**Prevention:**
- Don't drop the database tables unless necessary
- Always use the same email to sign in
- Data is saved to Supabase every 30 seconds during gameplay

---

## Still Having Issues?

### Check the Logs

**Supabase Logs:**
1. Go to Supabase Dashboard
2. Click "Logs" in the sidebar
3. Check "Postgres Logs" for database errors
4. Check "API Logs" for authentication issues

**Browser Console:**
1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for red error messages
4. Copy the error and search for it in this guide

### Verify Your Setup

**Required Configuration:**
- ✅ Database tables created (`users`, `friend_requests`, `session_invites`)
- ✅ Database trigger created (`on_auth_user_created`)
- ✅ Email confirmation disabled in Supabase settings
- ✅ Supabase project is active (not paused)
- ✅ Project ID matches: `symyhtogzjmuibiayvnr`

### Get Help

If none of these solutions work:
1. Check the error message in the browser console
2. Check Supabase logs for more details
3. Verify all setup steps in `SUPABASE_SETUP.md`
4. Make sure you're using the latest migration file
