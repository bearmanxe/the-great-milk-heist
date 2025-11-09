# Quick Reference Card

## 🚀 Super Quick Setup (2 Minutes)

1. **Run ONE script:**
   ```
   Supabase → SQL Editor → Run: /supabase/migrations/COMPLETE_SETUP.sql
   ```

2. **Disable email confirmation:**
   ```
   Supabase → Authentication → Providers → Email → Toggle OFF "Confirm email"
   ```

3. **Sign up and play!**

---

## 🔍 Troubleshooting Quick Fixes

### Error: "Error fetching user data: The result contains 0 rows"

**Quick Fix:**
```sql
-- Run in SQL Editor:
-- Step 1: Diagnostic
Run: diagnostic_check.sql

-- Step 2: If trigger is missing
Run: COMPLETE_SETUP.sql

-- Step 3: Clean up orphaned users
DELETE FROM auth.users WHERE id NOT IN (SELECT id FROM public.users);

-- Step 4: Try signing up again
```

### Already Have an Orphaned User?

```sql
-- Get your user ID from Authentication → Users, then:
SELECT public.create_user_profile(
  'YOUR_USER_ID_HERE'::UUID,
  'YourDesiredUsername'
);
```

---

## 📁 File Guide

### Setup Files (Run in Order)
1. **COMPLETE_SETUP.sql** ⭐ - All-in-one (RECOMMENDED)
   - OR run these three individually:
   - 20250107000000_initial_schema.sql
   - 20250107000001_fix_trigger.sql  
   - create_user_profile_function.sql

### Diagnostic Files
- **diagnostic_check.sql** - Check what's wrong
- **test_complete_setup.sql** - Test everything
- **manual_user_creation.sql** - Emergency fix

### Documentation
- **START_HERE.md** ⭐ - Start here if confused
- **README.md** - Game overview
- **TROUBLESHOOTING.md** - Detailed solutions
- **FIXED_ISSUES.md** - What was fixed and how
- **QUICK_REFERENCE.md** - This file

---

## 🎮 Game Controls

**Keyboard:**
- WASD - Move
- Mouse - Aim/Shoot
- Space - Dodge
- ESC - Pause

**Controller:**
- Left Stick - Move
- Right Stick - Aim
- RT - Shoot
- A/X - Dodge
- Start - Pause

---

## ✅ Setup Checklist

Before playing, verify:
- [ ] Ran COMPLETE_SETUP.sql (or all 3 migrations)
- [ ] Email confirmation is OFF
- [ ] test_complete_setup.sql passes
- [ ] Can sign up without errors
- [ ] User appears in both:
  - Authentication → Users
  - Table Editor → users

---

## 🆘 Emergency Contacts

**Database Won't Set Up:**
- Run: diagnostic_check.sql
- Read output
- Follow instructions

**Can't Sign Up:**
- Delete orphaned users
- Run COMPLETE_SETUP.sql again
- Try test_complete_setup.sql

**Can't Log In:**
- Check email confirmation is OFF
- Verify user exists in both auth.users and public.users
- Try password reset

**Still Broken:**
- Check browser console for errors
- Run diagnostic_check.sql
- Read TROUBLESHOOTING.md
- Check FIXED_ISSUES.md

---

## 📊 How the System Works

**Signup Process:**
```
User fills form
    ↓
Supabase creates auth user
    ↓
Trigger fires → Creates profile ✅
    ↓
If trigger fails:
    ↓
App calls RPC function → Creates profile ✅
    ↓
If RPC fails:
    ↓
Manual SQL script → Creates profile ✅
```

**Three-layer protection = 99%+ success rate**

---

## 🎯 Common Commands

### Check Setup Status
```sql
-- Run diagnostic_check.sql
```

### Clean Database
```sql
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.create_user_profile(UUID, TEXT);
DROP TABLE IF EXISTS public.session_invites CASCADE;
DROP TABLE IF EXISTS public.friend_requests CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;
```

### Start Fresh
```sql
-- Run clean commands above, then:
-- Run COMPLETE_SETUP.sql
```

### Fix Orphaned User
```sql
SELECT public.create_user_profile(
  '<user-id>'::UUID,
  'Username'
);
```

### Delete All Users (Start Over)
```sql
DELETE FROM public.users;
DELETE FROM auth.users;
```

---

## 💡 Tips

- **First time?** Read START_HERE.md
- **Having issues?** Run diagnostic_check.sql first
- **Resetting?** Use reset_and_reapply.sql
- **Testing?** Use test_complete_setup.sql
- **Quick answer?** This file

---

**Ready to Play?** 🥛

Sign up → Choose difficulty → Get your milk back!

Auto-saves every 30 seconds to Supabase.
