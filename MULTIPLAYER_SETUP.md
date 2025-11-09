# Multiplayer Setup Guide

## Overview
The multiplayer functionality requires a Supabase Edge Function to be deployed. This guide will help you deploy the `make-server` Edge Function.

## Prerequisites
- Supabase account and project created
- Supabase CLI installed

## Installation Steps

### 1. Install Supabase CLI (if not already installed)

**macOS/Linux:**
```bash
brew install supabase/tap/supabase
```

**Windows (PowerShell):**
```powershell
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

**npm:**
```bash
npm install -g supabase
```

### 2. Login to Supabase

```bash
supabase login
```

This will open a browser window to authenticate.

### 3. Link Your Project

Get your project reference from the Supabase dashboard (it's in the project URL or settings).

```bash
supabase link --project-ref symyhtogzjmuibiayvnr
```

Replace `symyhtogzjmuibiayvnr` with your actual project ID if different.

### 4. Deploy the Edge Function

From your project root directory:

```bash
supabase functions deploy make-server
```

This will deploy the Edge Function located at `/supabase/functions/make-server/`.

### 5. Verify Deployment

You can test the Edge Function with:

```bash
curl -i --location --request GET 'https://symyhtogzjmuibiayvnr.supabase.co/functions/v1/make-server/health' \
  --header 'Authorization: Bearer YOUR_ANON_KEY'
```

Replace:
- `symyhtogzjmuibiayvnr` with your project ID
- `YOUR_ANON_KEY` with your anon key (found in `/utils/supabase/info.tsx`)

You should get a response like: `{"status":"ok"}`

## Troubleshooting

### Permission Denied
If you get a permission error, make sure you're logged in:
```bash
supabase login
```

### Function Not Found
Make sure you're in the correct directory and the function exists at:
```
/supabase/functions/make-server/index.tsx
```

### CORS Errors
The Edge Function is already configured with CORS to allow all origins. If you still see CORS errors, check your browser console for the specific error.

### 403 Forbidden
This usually means:
1. You're not logged in to Supabase CLI
2. You haven't linked the project
3. Your user doesn't have permission to deploy functions

### Connection Failed
If you get "Failed to fetch" or "Cannot connect to multiplayer server":
1. Verify the Edge Function is deployed
2. Check that the project ID in `/utils/supabase/info.tsx` matches your Supabase project
3. Ensure your Supabase project is active

## Alternative: Manual Deployment via Dashboard

If CLI deployment fails, you can deploy via the Supabase Dashboard:

1. Go to your Supabase project dashboard
2. Navigate to "Edge Functions" in the left sidebar
3. Click "New function"
4. Name it `make-server`
5. Copy the contents of `/supabase/functions/make-server/index.tsx` into the editor
6. Create additional files for `kv_store.tsx` and `multiplayerRoutes.tsx`
7. Click "Deploy"

## Checking Deployment Status

To see all deployed functions:
```bash
supabase functions list
```

To view function logs (useful for debugging):
```bash
supabase functions logs make-server
```

## Need Help?

If you're still having issues:
1. Check the Supabase dashboard for any error messages
2. View the Edge Function logs
3. Verify your project ID and anon key are correct
4. Make sure the database migrations have been run (see DATABASE_SETUP_REQUIRED.md)

## What This Edge Function Does

The `make-server` Edge Function provides:
- Session creation and management
- Player join/leave handling
- Heartbeat system to track active players
- Game state synchronization
- Real-time updates via Supabase Realtime

All multiplayer features depend on this Edge Function being deployed and running.
