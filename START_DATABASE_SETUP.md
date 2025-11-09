# ⚠️ DATABASE SETUP REQUIRED

## You're seeing this because the database hasn't been set up yet!

The game **cannot work** until you run the migration SQL file. This is a **one-time setup** that takes **30 seconds**.

---

## 🚀 Quick Setup (4 Steps)

### Step 1: Copy the Migration
Open this file and copy everything inside:
```
/supabase/migrations/COMPLETE_SETUP.sql
```

### Step 2: Open Supabase SQL Editor
Go to this URL:
```
https://supabase.com/dashboard/project/symyhtogzjmuibiayvnr/sql
```

### Step 3: Run the Migration
1. Paste the SQL you copied
2. Click the **"Run"** button (or press Ctrl+Enter)
3. Wait for "Success" message

### Step 4: Refresh the Game
Refresh the game page and try signing up again!

---

## 🎯 What This Does

The migration creates:

- ✅ **Database Tables** - stores user data, friends, achievements
- ✅ **Auto-Creation Trigger** - automatically creates user profiles on signup
- ✅ **Fallback Function** - creates profiles if the trigger fails
- ✅ **Security Policies** - protects user data with Row Level Security
- ✅ **Performance Indexes** - makes queries faster

---

## 🔍 How to Know It Worked

After running the migration, you should see output like:
```
NOTICE:  ========================================
NOTICE:  SETUP COMPLETE!
NOTICE:  ========================================
NOTICE:  Now:
NOTICE:  1. Disable email confirmation in Supabase
NOTICE:  2. Refresh this page
NOTICE:  3. Try signing up!
```

---

## ⚡ Common Errors

### "Could not find the function public.create_user_profile"
**Cause:** Migration hasn't been run yet  
**Fix:** Follow the 4 steps above

### "The result contains 0 rows"
**Cause:** Trigger didn't run or migration incomplete  
**Fix:** Run `/supabase/migrations/COMPLETE_SETUP.sql` again

### "For security purposes, you can only request this after X seconds"
**Cause:** Too many signup attempts  
**Fix:** Wait the specified time, then try again after running migration

---

## 🆘 Still Having Problems?

1. **Check the console** - Press F12 to see detailed error messages
2. **Run diagnostics** - Open and run `/supabase/migrations/diagnostic_check.sql` in Supabase
3. **Read troubleshooting** - See `/TROUBLESHOOTING.md` for detailed solutions
4. **Verify setup** - Run `/supabase/migrations/test_complete_setup.sql` to test

---

## 📚 Additional Resources

- `/SUPABASE_SETUP.md` - Comprehensive Supabase setup guide
- `/AUTH_REFERENCE.md` - How the authentication system works
- `/TROUBLESHOOTING.md` - Solutions to common issues
- `/supabase/migrations/README.md` - Details about migration files

---

## ✨ After Setup

Once the database is set up, you'll be able to:

- 🎮 Create an account and play the game
- 🏆 Unlock achievements
- 👥 Add friends
- 💰 Buy cosmetics with coins
- ⚔️ Upgrade weapons
- 📊 Track your stats

---

**Remember: This is a ONE-TIME setup. You only need to do this once!**

🥛 **Welcome to The Great Milk Heist!** 🥛
