# 🚀 Deploy Multiplayer Edge Function

This guide will help you deploy the actual multiplayer Edge Function to enable **real online multiplayer**.

## Prerequisites

- Supabase project (Project ID: `symyhtogzjmuibiayvnr`)
- Supabase CLI installed
- Database access to create tables

---

## Step 1: Create the KV Store Table

The Edge Function needs a key-value store table in your database. Run this SQL in your Supabase SQL Editor:

```sql
CREATE TABLE IF NOT EXISTS kv_store_55cb4193 (
  key TEXT NOT NULL PRIMARY KEY,
  value JSONB NOT NULL
);

-- Add index for prefix searches
CREATE INDEX IF NOT EXISTS idx_kv_store_prefix ON kv_store_55cb4193(key text_pattern_ops);

-- Grant access to service role
GRANT ALL ON kv_store_55cb4193 TO service_role;
```

### Verify Table Creation

Run this query to verify:

```sql
SELECT * FROM kv_store_55cb4193 LIMIT 1;
```

---

## Step 2: Install Supabase CLI

Choose your platform:

### macOS/Linux
```bash
brew install supabase/tap/supabase
```

### Windows (Scoop)
```powershell
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

### npm (Any Platform)
```bash
npm install -g supabase
```

### Verify Installation
```bash
supabase --version
```

---

## Step 3: Login to Supabase

```bash
supabase login
```

This will open your browser for authentication. Make sure you're logged in to the account that owns the project.

---

## Step 4: Link Your Project

From your project root directory, run:

```bash
supabase link --project-ref symyhtogzjmuibiayvnr
```

You may be prompted for your database password. Find it in:
- Supabase Dashboard → Settings → Database → Connection String

---

## Step 5: Deploy the Edge Function

Deploy the `make-server` function:

```bash
supabase functions deploy make-server
```

This will:
1. Upload the function code
2. Build it in the cloud
3. Deploy it to your Supabase project
4. Make it available at: `https://symyhtogzjmuibiayvnr.supabase.co/functions/v1/make-server`

---

## Step 6: Test the Deployment

### Test the Health Endpoint

```bash
curl https://symyhtogzjmuibiayvnr.supabase.co/functions/v1/make-server/health
```

**Expected response:**
```json
{"status":"ok"}
```

### Test from Your Game

1. Open your game
2. Go to Multiplayer menu
3. The server status should show **✅ Online**
4. Try creating a session

---

## Step 7: Monitor the Function

### View Logs

```bash
supabase functions logs make-server
```

Or view in the dashboard:
- Supabase Dashboard → Edge Functions → make-server → Logs

### Check Invocation Stats

Dashboard → Edge Functions → make-server shows:
- Total invocations
- Error rate
- Average response time

---

## Troubleshooting

### "Command not found: supabase"

**Solution:**
- Restart your terminal after installation
- Check that Supabase CLI is in your PATH
- Try installing via npm instead

### "Permission denied"

**Solution:**
- Run `supabase login` first
- Make sure you're the project owner or have deployment permissions
- Check your Supabase organization settings

### "Project not found"

**Solution:**
- Verify project ID: `symyhtogzjmuibiayvnr`
- Make sure you're logged into the correct account
- Try `supabase projects list` to see your projects

### "Failed to deploy"

**Solution:**
- Check that the table `kv_store_55cb4193` exists
- Verify service role has permissions
- Check function logs for specific errors

### "Table does not exist" errors in logs

**Solution:**
Run the SQL from Step 1 again to create the table.

### Edge Function times out

**Solution:**
- Check your database connection
- Ensure RLS policies don't block service role
- View logs for specific error messages

---

## What Gets Deployed

The Edge Function includes:

- **Session Management**: Create, join, leave multiplayer sessions
- **Player Sync**: Real-time player position and state updates
- **Heartbeat System**: Keep players connected and detect disconnects
- **Settings Control**: Host can modify difficulty and game mode
- **Game Start**: Coordinate game start across all players
- **Chat Infrastructure**: (Coming soon)

---

## Configuration

### Environment Variables

The Edge Function automatically has access to:
- `SUPABASE_URL` - Your project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Full database access

No additional configuration needed!

### CORS

CORS is enabled for all origins (`*`). In production, you may want to restrict this to your domain.

To modify CORS, edit `/supabase/functions/make-server/index.tsx`:

```typescript
cors({
  origin: "https://yourdomain.com",
  // ... other settings
})
```

Then redeploy:
```bash
supabase functions deploy make-server
```

---

## Updating the Function

Made changes to the multiplayer code? Redeploy:

```bash
supabase functions deploy make-server
```

Changes are live immediately!

---

## Costs

Supabase Edge Functions are billed by:
- **Invocations**: First 500K/month free, then $2 per 1M
- **Compute time**: First 400K CPU seconds/month free

For a game with moderate traffic, you'll likely stay within the free tier.

---

## Next Steps

Once deployed:

1. ✅ Test multiplayer in-game
2. 🎮 Invite friends to test
3. 📊 Monitor logs and performance
4. 🚀 Share your game!

---

## Rollback

Need to rollback? Supabase keeps function versions.

Dashboard → Edge Functions → make-server → Versions → Restore

Or redeploy an older commit from your git history.

---

## Support

Issues? Check:
- [Supabase Edge Functions Docs](https://supabase.com/docs/guides/functions)
- [Supabase Community](https://github.com/supabase/supabase/discussions)
- Your function logs: `supabase functions logs make-server`

Happy deploying! 🎮🚀
