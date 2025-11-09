# 🚀 Multiplayer Deployment Checklist

Use this checklist to deploy real online multiplayer for The Great Milk Heist.

---

## ✅ Pre-Deployment

- [ ] You have a Supabase account
- [ ] Your Supabase project is created (Project: `symyhtogzjmuibiayvnr`)
- [ ] You can access the Supabase Dashboard
- [ ] You have the database password

---

## 📦 Step 1: Database Setup

- [ ] Open Supabase Dashboard → SQL Editor
- [ ] Copy SQL from `/supabase/migrations/create_kv_store.sql`
- [ ] Run the SQL in SQL Editor
- [ ] Verify table created: Dashboard → Database → Tables → `kv_store_55cb4193`
- [ ] Verify permissions granted to `service_role`

**Expected Result:** Table `kv_store_55cb4193` appears in your tables list

---

## 🛠️ Step 2: Install Supabase CLI

Choose ONE method:

### Option A: Homebrew (macOS/Linux)
- [ ] Run: `brew install supabase/tap/supabase`
- [ ] Verify: `supabase --version`

### Option B: Scoop (Windows)
- [ ] Run: `scoop bucket add supabase https://github.com/supabase/scoop-bucket.git`
- [ ] Run: `scoop install supabase`
- [ ] Verify: `supabase --version`

### Option C: npm (Any platform)
- [ ] Run: `npm install -g supabase`
- [ ] Verify: `supabase --version`

**Expected Result:** Version number displays (e.g., `1.x.x`)

---

## 🔐 Step 3: Authentication

- [ ] Run: `supabase login`
- [ ] Browser opens automatically
- [ ] Click "Authorize" in browser
- [ ] Terminal shows "Logged in successfully"
- [ ] Test: `supabase projects list` shows your projects

**Expected Result:** You see your project listed

---

## 🔗 Step 4: Link Project

- [ ] Navigate to your project directory in terminal
- [ ] Run: `supabase link --project-ref symyhtogzjmuibiayvnr`
- [ ] Enter database password when prompted
- [ ] Terminal shows "Linked to project..."

**Expected Result:** Project is linked

---

## 🚀 Step 5: Deploy

### Option A: Automated Script (Recommended)
- [ ] Run: `chmod +x deploy.sh`
- [ ] Run: `./deploy.sh`
- [ ] Wait for deployment to complete
- [ ] Script shows "✅ Deployment successful!"

### Option B: Manual Deployment
- [ ] Run: `supabase functions deploy make-server`
- [ ] Wait for build and deployment
- [ ] Terminal shows "Deployed successfully"

**Expected Result:** No errors, shows deployment URL

---

## 🧪 Step 6: Testing

### Test 1: Health Check (Command Line)
- [ ] Run: `curl https://symyhtogzjmuibiayvnr.supabase.co/functions/v1/make-server/health`
- [ ] Response: `{"status":"ok"}`

### Test 2: Dashboard Check
- [ ] Open Supabase Dashboard → Edge Functions
- [ ] Find `make-server` in list
- [ ] Status shows as "Active" or "Healthy"

### Test 3: In-Game Test
- [ ] Open your game
- [ ] Go to Multiplayer menu
- [ ] Server status shows **✅ Online** (green checkmark)
- [ ] Click "Create Session"
- [ ] Session code appears (e.g., `ABC123`)

### Test 4: Full Multiplayer Test
- [ ] Create a session
- [ ] Copy session code
- [ ] Open game in another browser/incognito window
- [ ] Join with session code
- [ ] Both players appear in lobby
- [ ] Host can start game

**Expected Result:** All tests pass!

---

## 📊 Step 7: Monitoring

- [ ] Check function logs: `supabase functions logs make-server`
- [ ] Or view in Dashboard → Edge Functions → make-server → Logs
- [ ] Verify invocations are working
- [ ] No error messages appear

**Expected Result:** Logs show successful requests

---

## 🎉 Deployment Complete!

If all checkboxes are checked, your multiplayer is LIVE! 🚀

### What to do next:

1. **Test with friends**: Share a session code and play together
2. **Monitor usage**: Check Dashboard for invocation stats
3. **Watch costs**: You're likely in free tier (500K invocations/month)
4. **Share your game**: Post on social media, game forums, etc.

---

## 🐛 Troubleshooting

If something didn't work, check these common issues:

### ❌ Health check fails

**Cause:** Edge Function not deployed or crashed

**Fix:**
1. Check logs: `supabase functions logs make-server`
2. Look for specific error messages
3. Common issue: Table doesn't exist → Run Step 1 SQL again

### ❌ "Session not found" in game

**Cause:** KV store table missing or no permissions

**Fix:**
```sql
-- Run in SQL Editor
GRANT ALL ON kv_store_55cb4193 TO service_role;
```

### ❌ CORS errors in browser console

**Cause:** CORS not configured (shouldn't happen, but just in case)

**Fix:** Edge Function already has CORS enabled for all origins

### ❌ High latency / slow responses

**Cause:** Cold starts or database connection issues

**Fix:** 
- First request is always slower (cold start)
- Subsequent requests should be fast
- Check database connection in Dashboard

### ❌ "Permission denied" errors

**Cause:** Not logged in or wrong project

**Fix:**
1. Run `supabase login` again
2. Verify project ID: `symyhtogzjmuibiayvnr`
3. Check you're the owner or have deployment permissions

---

## 📚 More Help

- **Detailed Guide**: See `/DEPLOY_EDGE_FUNCTION.md`
- **Quick Reference**: See `/DEPLOY_MULTIPLAYER.md`
- **Supabase Docs**: https://supabase.com/docs/guides/functions
- **Function Code**: `/supabase/functions/make-server/`

---

## 🔄 Updating After Changes

Made changes to multiplayer code? Redeploy:

```bash
supabase functions deploy make-server
```

Changes are live immediately!

---

**Happy gaming! 🥛🎮**
