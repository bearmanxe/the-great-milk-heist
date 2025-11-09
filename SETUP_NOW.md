# ⚡ SETUP CHECKLIST - DO THIS NOW!

## Getting these errors?
- ❌ `Could not find the function public.create_user_profile`
- ❌ `The result contains 0 rows`
- ❌ `For security purposes, you can only request this after X seconds`

## ✅ Follow this checklist:

### □ Step 1: Find the File
- [ ] Open the file explorer/sidebar
- [ ] Navigate to `/supabase/migrations/`
- [ ] Find `COMPLETE_SETUP.sql`
- [ ] Click to open it

### □ Step 2: Copy Everything
- [ ] Click inside the file
- [ ] Press `Ctrl+A` (Windows/Linux) or `Cmd+A` (Mac) to select all
- [ ] Press `Ctrl+C` (Windows/Linux) or `Cmd+C` (Mac) to copy
- [ ] You should see ~300+ lines copied

### □ Step 3: Open Supabase
- [ ] Open a new browser tab
- [ ] Go to: https://supabase.com/dashboard/project/symyhtogzjmuibiayvnr/sql
- [ ] You should see the SQL Editor with a text area

### □ Step 4: Paste and Run
- [ ] Click in the SQL Editor text area
- [ ] Press `Ctrl+V` (Windows/Linux) or `Cmd+V` (Mac) to paste
- [ ] You should see the SQL code appear
- [ ] Click the green **"Run"** button (or press `Ctrl+Enter`)
- [ ] Wait 5-10 seconds

### □ Step 5: Verify Success
- [ ] You should see output at the bottom
- [ ] Look for: `NOTICE: SETUP COMPLETE!`
- [ ] You should see: `NOTICE: Now: 1. Disable email confirmation...`
- [ ] If you see errors, read them and check `/TROUBLESHOOTING.md`

### □ Step 6: Refresh Game
- [ ] Go back to the game tab
- [ ] Press `F5` or `Ctrl+R` to refresh
- [ ] The red warning should be gone
- [ ] Try signing up with a NEW email

### □ Step 7: Test
- [ ] Enter email: `test@example.com` (or any email)
- [ ] Enter username: `testuser` (or any username)
- [ ] Enter password: `password123` (or any password)
- [ ] Click "Sign Up"
- [ ] You should see: `Welcome, testuser!`
- [ ] You should go to the start screen

---

## ✅ Done?

If you completed all steps and can sign up:
- 🎉 **SUCCESS!** The database is set up!
- 🎮 You can now play the game
- 💾 Your progress will be saved
- 👥 You can add friends
- 🏆 You can unlock achievements

---

## ❌ Still Not Working?

### Try These:

1. **Run the migration again**
   - Maybe it didn't finish
   - Check for error messages in Supabase

2. **Use a different email**
   - Don't reuse emails from failed signups
   - Try: `yourname123@example.com`

3. **Wait if rate limited**
   - If you see "request this after X seconds"
   - Wait the specified time
   - Then try again

4. **Check the console**
   - Press `F12` in the game
   - Look at the Console tab
   - See what errors appear
   - Copy them and check `/TROUBLESHOOTING.md`

5. **Run diagnostics**
   - Open `/supabase/migrations/diagnostic_check.sql`
   - Copy and run it in Supabase SQL Editor
   - Check the output for problems

6. **Read the docs**
   - `/DATABASE_SETUP_REQUIRED.md` - Overview
   - `/START_DATABASE_SETUP.md` - Detailed guide
   - `/TROUBLESHOOTING.md` - Common issues
   - `/AUTH_REFERENCE.md` - How auth works

---

## 🆘 Emergency Reset

If nothing works, you can reset and start over:

1. Open `/supabase/migrations/reset_and_reapply.sql`
2. Copy and run it in Supabase
3. Then copy and run `COMPLETE_SETUP.sql` again
4. Refresh the game

---

## 📞 Need More Help?

Check these files in order:
1. `/DATABASE_SETUP_REQUIRED.md` ← Start here
2. `/START_DATABASE_SETUP.md` ← Detailed walkthrough
3. `/TROUBLESHOOTING.md` ← Solutions to problems
4. `/AUTH_REFERENCE.md` ← Technical details

---

**Don't give up! This is just a one-time setup. Once it's done, everything works!** 🥛
