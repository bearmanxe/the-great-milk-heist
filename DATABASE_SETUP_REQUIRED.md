# 🚨 YOU MUST RUN THE DATABASE MIGRATION FIRST! 🚨

## The error you're seeing means you haven't set up the database yet.

---

## 🎯 ONE-TIME SETUP (30 seconds)

### **STEP 1** - Copy the SQL
1. Open the file: `/supabase/migrations/COMPLETE_SETUP.sql`
2. Select all the text (Ctrl+A)
3. Copy it (Ctrl+C)

### **STEP 2** - Open Supabase
1. Click this link: https://supabase.com/dashboard/project/symyhtogzjmuibiayvnr/sql
2. You'll see the SQL Editor

### **STEP 3** - Run the Migration
1. Paste the SQL you copied (Ctrl+V)
2. Click the green **"Run"** button (or press Ctrl+Enter)
3. Wait for "Success" message (about 5 seconds)

### **STEP 4** - Refresh & Play
1. Come back to this page
2. Refresh (F5 or Ctrl+R)
3. Try signing up again!

---

## 🎮 What You're Seeing Now

The app is showing you a **red popup warning** with the same instructions.

**If you don't see the popup:**
- Look for a red warning box on the screen
- Check your browser console (F12) for setup instructions
- The console shows exactly what to do

---

## ❌ The Errors You're Getting

```
Error calling create_user_profile RPC: PGRST202
Could not find the function public.create_user_profile
```

**Translation:** The database functions don't exist yet because you haven't run the migration.

```
For security purposes, you can only request this after X seconds
```

**Translation:** You tried to sign up multiple times. Wait, then try again AFTER running the migration.

---

## ✅ How You'll Know It Worked

After running the migration, you'll see this in Supabase:

```
NOTICE:  ========================================
NOTICE:  SETUP COMPLETE!
NOTICE:  ========================================
```

Then when you refresh the game and sign up:
- ✅ No more errors
- ✅ You'll see "Welcome, [username]!"
- ✅ The game will start

---

## 🆘 Troubleshooting

### Problem: "I don't see the COMPLETE_SETUP.sql file"
**Solution:** It's in the file structure at `/supabase/migrations/COMPLETE_SETUP.sql`

### Problem: "The SQL Editor won't load"
**Solution:** Make sure you're logged into Supabase at https://supabase.com

### Problem: "I ran it but still getting errors"
**Solution:** 
1. Make sure you saw "Success" in Supabase
2. Refresh the game page
3. Try signing up with a NEW email address

### Problem: "Can't copy the SQL"
**Solution:** The popup has a "Copy SQL Migration" button that copies it for you!

---

## 📖 More Help

- See the **RED POPUP** in the game for step-by-step buttons
- Check `/START_DATABASE_SETUP.md` for detailed walkthrough
- Read `/TROUBLESHOOTING.md` if you're still stuck
- Look at `/supabase/migrations/README.md` for technical details

---

## 🎯 Remember

**This is a ONE-TIME setup!** 

Once you run the migration:
- ✅ Database is set up forever
- ✅ All features work
- ✅ You can create accounts
- ✅ Friends, achievements, stats all work

**Don't skip this step!** The game literally cannot work without it.

---

**👉 Go run COMPLETE_SETUP.sql NOW, then come back and play! 🥛**
