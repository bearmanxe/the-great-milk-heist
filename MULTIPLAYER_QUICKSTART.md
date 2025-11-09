# 🚀 Multiplayer Quick Start

Get real online multiplayer working in **5 minutes**.

---

## 🎯 What You'll Do

1. Create database table (1 minute)
2. Run deployment script (3 minutes)
3. Test multiplayer (1 minute)

---

## Step 1️⃣: Create Database Table (1 minute)

### Option A: Copy-Paste SQL (Easiest)

1. Open [Supabase Dashboard](https://supabase.com/dashboard/project/symyhtogzjmuibiayvnr/sql/new)
2. Paste this SQL:

```sql
CREATE TABLE IF NOT EXISTS kv_store_55cb4193 (
  key TEXT NOT NULL PRIMARY KEY,
  value JSONB NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_kv_store_prefix 
  ON kv_store_55cb4193(key text_pattern_ops);

GRANT ALL ON kv_store_55cb4193 TO service_role;
```

3. Click **"Run"**
4. ✅ Should see "Success. No rows returned"

### Option B: Run Migration File

1. Open [Supabase Dashboard SQL Editor](https://supabase.com/dashboard/project/symyhtogzjmuibiayvnr/sql/new)
2. Copy entire contents of `/supabase/migrations/create_kv_store.sql`
3. Paste and run
4. ✅ Should see success message

---

## Step 2️⃣: Deploy Edge Function (3 minutes)

### 🪟 Windows Users

```batch
deploy.bat
```

### 🍎 macOS/Linux Users

```bash
chmod +x deploy.sh
./deploy.sh
```

The script will:
- ✅ Check if Supabase CLI is installed (installs if needed)
- ✅ Login to Supabase
- ✅ Link your project
- ✅ Deploy the Edge Function
- ✅ Test that it's working

---

## Step 3️⃣: Test Multiplayer (1 minute)

### In-Game Test

1. Open your game
2. Click **"Multiplayer"**
3. Look for server status:
   - ✅ **Green "Online"** = Working!
   - ❌ **Red "Offline"** = See troubleshooting below
4. Click **"Create Session"**
5. Share session code with a friend
6. Friend clicks **"Join Session"** and enters code
7. You see each other in lobby
8. Host clicks **"Start Game"**
9. **🎮 Play together!**

### Command Line Test

```bash
curl https://symyhtogzjmuibiayvnr.supabase.co/functions/v1/make-server/health
```

**Expected:** `{"status":"ok"}`

---

## 🐛 Troubleshooting

### "Supabase CLI not found"

**Install it:**

- **macOS/Linux:** `brew install supabase/tap/supabase`
- **Windows (Scoop):** `scoop install supabase`
- **npm (any OS):** `npm install -g supabase`

Then run the deployment script again.

### "Table does not exist" in logs

**Fix:**
Run Step 1 again (create the database table)

### Server status shows "Offline" in game

**Check:**
1. Health endpoint: `curl https://symyhtogzjmuibiayvnr.supabase.co/functions/v1/make-server/health`
2. If fails, check logs: `supabase functions logs make-server`
3. Common issue: Table not created (run Step 1)

### "Permission denied" during deployment

**Fix:**
```bash
supabase login
supabase link --project-ref symyhtogzjmuibiayvnr
```

Then try deploying again.

### Deployment succeeds but health check fails

**Check table permissions:**
```sql
GRANT ALL ON kv_store_55cb4193 TO service_role;
```

Run this in Supabase SQL Editor.

---

## 📚 Need More Help?

- **Detailed guide**: See `DEPLOY_EDGE_FUNCTION.md`
- **Step-by-step checklist**: See `DEPLOYMENT_CHECKLIST.md`
- **Bug fixes**: See `FIXES_APPLIED.md`
- **Supabase docs**: https://supabase.com/docs

---

## 🎉 Success!

If you can:
- ✅ Create a session
- ✅ Join with a session code
- ✅ See other players in lobby
- ✅ Start game and play together

**Congratulations! Your multiplayer is live!** 🚀

Share your game and play with friends worldwide! 🌍

---

## 💰 Costs

**Free tier includes:**
- 500,000 invocations/month
- 400,000 CPU seconds/month

For a small-medium game, you'll stay in free tier. Monitor usage in [Supabase Dashboard](https://supabase.com/dashboard/project/symyhtogzjmuibiayvnr/reports/api).

---

## 🔄 Updates

Made changes to multiplayer code? Redeploy:

```bash
supabase functions deploy make-server
```

Changes are live immediately!

---

**That's it! Enjoy your multiplayer game! 🥛🎮**
