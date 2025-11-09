# 🥛 START HERE - The Great Milk Heist Setup Guide

**Getting the "Error fetching user data" error?** You're in the right place!

## The Problem

The database trigger that automatically creates user profiles isn't working. This is a common Supabase setup issue.

## The Solution (5 Minutes)

Follow these steps **in order**:

### Step 1: Run the Complete Setup Script

**EASIEST METHOD** - One script does everything:

1. Go to Supabase Dashboard → SQL Editor
2. Copy the contents of `/supabase/migrations/COMPLETE_SETUP.sql`
3. Paste and click "Run"
4. Wait for "SETUP COMPLETE!" message

This single script:
- ✅ Creates all tables
- ✅ Sets up RLS policies
- ✅ Creates the auto-user trigger
- ✅ Adds the fallback function
- ✅ Sets up cleanup functions

**ALTERNATIVE** - Run individual migrations:

If you prefer to run them separately:

```
1. /supabase/migrations/20250107000000_initial_schema.sql
2. /supabase/migrations/20250107000001_fix_trigger.sql
3. /supabase/migrations/create_user_profile_function.sql
```

### Step 2: Disable Email Confirmation

1. Supabase Dashboard → Authentication → Providers
2. Click "Email"
3. Find "Confirm email" and toggle it **OFF**
4. Click "Save"

### Step 3: Clean Up Old Attempts

If you already tried to sign up:

```sql
-- Run this in SQL Editor to delete orphaned accounts
DELETE FROM auth.users WHERE id NOT IN (SELECT id FROM public.users);
```

### Step 4: Test Your Setup (Optional but Recommended)

Before trying to sign up, verify everything works:

```
Copy and run: /supabase/migrations/test_complete_setup.sql
```

This will:
- Create a test user
- Verify the trigger fires
- Test the fallback function
- Clean up after itself

Look for: "✓✓✓ ALL TESTS PASSED ✓✓✓"

If you see errors, the script will tell you which migration to run.

### Step 5: Try Signing Up

Now the signup should work! The app will:
1. Try the trigger first (should work now)
2. If trigger fails, automatically call the fallback function
3. Create your profile successfully either way

## Verify It Worked

After signing up, check:
1. **Authentication → Users** - Your email should be there
2. **Table Editor → users** - Your profile should exist
3. Game should load to the start screen

## Still Having Issues?

### Run the Diagnostic
```
Copy and run: /supabase/migrations/diagnostic_check.sql
```

Look for:
- ✓ marks = Everything is good
- ✗ marks = Something needs fixing

### Check the Logs

If signup fails, check your browser console for:
- "Trigger failed to create user profile, attempting manual creation..."
- "User profile created via RPC: ..."

### Manual Fix for Orphaned Users

If you have an account in Authentication but can't log in:

```sql
-- Get your user ID from Authentication → Users, then run:
SELECT public.create_user_profile(
  'YOUR_USER_ID_HERE'::UUID,
  'YourUsername'
);
```

## Quick Links

- 📋 **Full Setup Checklist**: `SETUP_CHECKLIST.md`
- 🔧 **Troubleshooting Guide**: `TROUBLESHOOTING.md`
- 📖 **Technical Details**: `AUTH_REFERENCE.md`
- 📝 **Recent Changes**: `CHANGELOG.md`

## What Each File Does

### Migration Files
- `20250107000000_initial_schema.sql` - Creates tables, RLS policies, indexes
- `20250107000001_fix_trigger.sql` - Sets up auto user creation trigger
- `create_user_profile_function.sql` - Backup user creation method
- `diagnostic_check.sql` - Checks if everything is set up correctly
- `manual_user_creation.sql` - Emergency manual user creation
- `reset_and_reapply.sql` - Start fresh if needed

### Documentation
- `START_HERE.md` (this file) - Quick setup guide
- `README.md` - Game overview and features
- `SETUP_CHECKLIST.md` - Step-by-step setup
- `TROUBLESHOOTING.md` - Common issues and fixes
- `SUPABASE_SETUP.md` - Detailed database setup
- `AUTH_REFERENCE.md` - Technical auth details
- `CHANGELOG.md` - Recent updates

## Understanding the Fix

**The Problem:**
Database triggers run asynchronously. When you sign up, the auth user is created, but the trigger might not finish before the app tries to load your data.

**The Solution:**
1. **Retry with exponential backoff** - App waits up to 7.5 seconds
2. **Improved trigger** - Better error handling and logging
3. **RPC fallback** - If trigger fails, app creates profile via RPC function
4. **Better error messages** - Clear guidance when something fails

**Why it works now:**
The app has THREE ways to create your profile:
1. Database trigger (automatic)
2. RPC function call (automatic fallback)
3. Manual SQL (last resort)

One of these will work!

---

## Ready to Play? 🎮

Once setup is complete:
- Create an account
- Choose your difficulty
- Fight through 15 rooms
- Get your milk back!

Your progress autosaves every 30 seconds to Supabase.

**Good luck, and enjoy the game!** 🥛✨
