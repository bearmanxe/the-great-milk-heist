# Setup Checklist - The Great Milk Heist

Follow this checklist to get your game up and running with working authentication.

## ✅ Step 1: Database Migration

- [ ] Go to your Supabase Dashboard: https://supabase.com/dashboard/project/symyhtogzjmuibiayvnr
- [ ] Click on "SQL Editor" in the sidebar
- [ ] **First migration** - Copy the contents of `/supabase/migrations/20250107000000_initial_schema.sql`
- [ ] Paste into the SQL Editor and click "Run"
- [ ] Wait for "Success. No rows returned" message
- [ ] **Trigger fix** - Copy the contents of `/supabase/migrations/20250107000001_fix_trigger.sql`
- [ ] Paste and run - should see "✓ Trigger created successfully"
- [ ] **Fallback function** - Copy the contents of `/supabase/migrations/create_user_profile_function.sql`
- [ ] Paste and run - creates backup user creation method

## ✅ Step 2: Verify Migration

- [ ] Go to "Table Editor" in your Supabase Dashboard
- [ ] Verify you see these tables:
  - `users`
  - `friend_requests`
  - `session_invites`
- [ ] Go to "Database" → "Triggers"
- [ ] Verify you see the trigger: `on_auth_user_created`

**Optional:** Run the diagnostic script:
- [ ] Copy contents of `/supabase/migrations/diagnostic_check.sql`
- [ ] Paste and run in SQL Editor
- [ ] Check for all ✓ marks (no ✗ marks)

## ✅ Step 3: Disable Email Confirmation

- [ ] In Supabase Dashboard, go to "Authentication" → "Providers"
- [ ] Click on "Email" provider
- [ ] Find "Confirm email" setting
- [ ] Toggle it **OFF** (disabled)
- [ ] Click "Save"

## ✅ Step 4: Test Authentication

- [ ] Run the game
- [ ] Click "Sign Up"
- [ ] Enter:
  - Email: (your real email)
  - Username: (3-20 chars, alphanumeric + `_` or `-`)
  - Password: (min 6 chars)
  - Confirm Password: (same as password)
- [ ] Click "Sign Up"
- [ ] Wait for success message
- [ ] You should see the game start screen

## ✅ Step 5: Verify User Creation

- [ ] Go to Supabase Dashboard → "Authentication" → "Users"
- [ ] Your email should be listed
- [ ] Go to "Table Editor" → "users"
- [ ] Your user record should exist with your username

## 🔍 Troubleshooting

If you encounter errors during signup:

### Error: "new row violates row-level security policy"
- The migration wasn't applied correctly
- Solution: Run reset script (`/supabase/migrations/reset_and_reapply.sql`) then reapply migration

### Error: "The result contains 0 rows"
- The trigger hasn't created your user profile yet
- Solution: Wait a few seconds - the app retries automatically
- If it persists, check if the trigger exists (Step 2)

### Error: "Please confirm your email"
- Email confirmation is still enabled
- Solution: Disable it in Step 3

### Error: "Username already taken"
- That username already exists in the database
- Solution: Try a different username

### Still Having Issues?
1. Run the diagnostic script (`diagnostic_check.sql`)
2. Check `TROUBLESHOOTING.md` for detailed solutions
3. Verify your Supabase project isn't paused

## 📚 Additional Resources

- **Full Setup Guide**: `SUPABASE_SETUP.md`
- **Troubleshooting**: `TROUBLESHOOTING.md`
- **Technical Details**: `AUTH_REFERENCE.md`
- **Recent Changes**: `CHANGELOG.md`

## 🎮 After Setup

Once authentication is working:
- Your progress is automatically saved every 30 seconds
- Unlocked cosmetics, weapons, and achievements are saved
- You can add friends and send multiplayer invites
- Your stats are tracked across sessions

## 🚨 Emergency Fixes

### If trigger doesn't work at all:
Use manual user creation script:
1. Create account (will fail to load data)
2. Copy your user ID from Authentication → Users
3. Run `/supabase/migrations/manual_user_creation.sql` with your ID
4. Log in again

### If you need to start fresh:
1. Delete all users from Authentication → Users
2. Run reset script (`reset_and_reapply.sql`)
3. Run main migration again
4. Try creating account again

---

**Ready to play?** Once all checkboxes are complete, you're good to go! 🥛✨
