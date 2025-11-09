#!/bin/bash

# The Great Milk Heist - Multiplayer Deployment Script
# This script deploys the Edge Function for real online multiplayer

set -e

echo "🥛 The Great Milk Heist - Multiplayer Deployment"
echo "=================================================="
echo ""

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found!"
    echo ""
    echo "Install it with:"
    echo "  macOS/Linux: brew install supabase/tap/supabase"
    echo "  Windows:     scoop install supabase"
    echo "  npm:         npm install -g supabase"
    echo ""
    exit 1
fi

echo "✅ Supabase CLI found"
echo ""

# Project ID
PROJECT_REF="symyhtogzjmuibiayvnr"

echo "📡 Checking if you're logged in..."
if ! supabase projects list &> /dev/null; then
    echo "❌ Not logged in to Supabase"
    echo ""
    echo "Run: supabase login"
    echo ""
    exit 1
fi

echo "✅ Logged in to Supabase"
echo ""

echo "🔗 Linking to project..."
if supabase link --project-ref $PROJECT_REF 2>/dev/null; then
    echo "✅ Project linked successfully"
else
    echo "⚠️  Project already linked or link failed"
fi
echo ""

echo "🚀 Deploying Edge Function..."
if supabase functions deploy make-server; then
    echo ""
    echo "✅ Deployment successful!"
    echo ""
    echo "🧪 Testing deployment..."
    echo ""
    
    FUNCTION_URL="https://$PROJECT_REF.supabase.co/functions/v1/make-server/health"
    
    if curl -s "$FUNCTION_URL" | grep -q "ok"; then
        echo "✅ Edge Function is online and responding!"
        echo ""
        echo "🎮 Multiplayer is now ready!"
        echo ""
        echo "Next steps:"
        echo "  1. Open your game"
        echo "  2. Go to Multiplayer menu"
        echo "  3. Create a session"
        echo "  4. Share the session code with friends"
        echo ""
        echo "Happy gaming! 🥛🎮"
    else
        echo "⚠️  Edge Function deployed but health check failed"
        echo "Check logs with: supabase functions logs make-server"
    fi
else
    echo ""
    echo "❌ Deployment failed!"
    echo ""
    echo "Common issues:"
    echo "  - Missing KV store table (see DEPLOY_EDGE_FUNCTION.md Step 1)"
    echo "  - Incorrect project ID"
    echo "  - Permission issues"
    echo ""
    echo "Check: supabase functions logs make-server"
    exit 1
fi
