# 🚀 Deploy Multiplayer Server - Quick Guide

## Current Status

Your game is currently using **LOCAL MODE** for multiplayer. This means:
- ✅ You can test multiplayer features
- ❌ Players must be in the same browser tab
- ❌ No real online multiplayer yet

To enable **REAL MULTIPLAYER**, deploy the Edge Function.

---

## 🚀 One-Command Deployment

### Automated Script (Easiest)

```bash
chmod +x deploy.sh
./deploy.sh
```

This script will:
1. Check if Supabase CLI is installed
2. Login if needed
3. Link your project
4. Deploy the Edge Function
5. Test that it's working

---

## 📋 Manual Deployment (5 Minutes)

### Step 0: Create Database Table

**IMPORTANT:** Run this SQL first in Supabase SQL Editor:

```sql
-- See supabase/migrations/create_kv_store.sql for full SQL
CREATE TABLE IF NOT EXISTS kv_store_55cb4193 (
  key TEXT NOT NULL PRIMARY KEY,
  value JSONB NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_kv_store_prefix ON kv_store_55cb4193(key text_pattern_ops);
GRANT ALL ON kv_store_55cb4193 TO service_role;
```

Or run the complete migration:
1. Go to Supabase Dashboard → SQL Editor
2. Copy contents of `/supabase/migrations/create_kv_store.sql`
3. Run it

### Step 1: Install Supabase CLI

Choose your platform:

**macOS/Linux:**
```bash
brew install supabase/tap/supabase
```

**Windows:**
```powershell
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

**npm (any platform):**
```bash
npm install -g supabase
```

### Step 2: Login

```bash
supabase login
```

This opens your browser to authenticate.

### Step 3: Link Your Project

```bash
supabase link --project-ref symyhtogzjmuibiayvnr
```

### Step 4: Deploy

```bash
supabase functions deploy make-server
```

### Step 5: Test

Visit the multiplayer menu. If the server status shows green ✅, you're done!

Or test via command line:
```bash
curl https://symyhtogzjmuibiayvnr.supabase.co/functions/v1/make-server/health
```

Should return: `{"status":"ok"}`

---

## Verify Deployment

Test the health endpoint:

```bash
curl https://symyhtogzjmuibiayvnr.supabase.co/functions/v1/make-server/health
```

Should return: `{"status":"ok"}`

---

## Troubleshooting

### "Command not found: supabase"
- Make sure you installed the CLI
- Restart your terminal
- Check PATH is configured

### "Permission denied"
- Run `supabase login` first
- Make sure you're the project owner

### "Project not found"
- Check your project ID in Supabase dashboard
- It should match: `symyhtogzjmuibiayvnr`

### "Table does not exist" errors
- Run the SQL from Step 0 to create `kv_store_55cb4193` table
- Check Dashboard → Database → Tables to verify it exists

### "Edge Function deployed but not working"
- Check logs: `supabase functions logs make-server`
- Verify table permissions: `GRANT ALL ON kv_store_55cb4193 TO service_role;`
- Test health endpoint

### Still not working?
1. Check Supabase dashboard → Edge Functions
2. Look for `make-server` in the list
3. View logs if there are errors
4. See DEPLOY_EDGE_FUNCTION.md for detailed troubleshooting

---

## What Gets Deployed

The `make-server` Edge Function includes:
- Session creation and management
- Player join/leave handling  
- Heartbeat system
- Real-time synchronization
- Chat infrastructure

Once deployed, your game will support true online multiplayer! 🎮
