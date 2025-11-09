import { AlertCircle, ExternalLink } from 'lucide-react';
import { Alert } from './ui/alert';
import { Button } from './ui/button';
import { useState } from 'react';

export function DatabaseSetupWarning() {
  const projectId = 'symyhtogzjmuibiayvnr';
  const dashboardUrl = `https://supabase.com/dashboard/project/${projectId}/editor`;
  const [copied, setCopied] = useState(false);
  const [showSQL, setShowSQL] = useState(false);
  
  const migrationSQL = `-- ========================================
-- THE GREAT MILK HEIST - COMPLETE SETUP
-- Run this in Supabase SQL Editor
-- ========================================

-- NOTE: This is a condensed version. For full version with logging,
-- see /supabase/migrations/COMPLETE_SETUP.sql in the file structure

-- Create users table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  unlocked_cosmetics TEXT[] DEFAULT ARRAY['default']::TEXT[],
  weapon_upgrades JSONB DEFAULT '{"damage": 0, "attackSpeed": 0, "range": 0, "knockback": 0}'::JSONB,
  achievements TEXT[] DEFAULT ARRAY[]::TEXT[],
  total_coins INTEGER DEFAULT 0,
  selected_cosmetic TEXT DEFAULT '🧑',
  stats JSONB DEFAULT '{"roomsCleared": 0, "enemiesKilled": 0, "bossesDefeated": 0, "coinsEarned": 0, "hasWonOnce": false}'::JSONB,
  friends UUID[] DEFAULT ARRAY[]::UUID[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.friend_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  from_username TEXT NOT NULL,
  to_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS public.session_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  friend_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  inviter_name TEXT NOT NULL,
  created_at BIGINT NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);
CREATE INDEX IF NOT EXISTS idx_friend_requests_to_user ON public.friend_requests(to_user_id) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_session_invites_friend ON public.session_invites(friend_id);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friend_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_invites ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can read their own data" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own data" ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own data" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can read other users' basic info" ON public.users FOR SELECT USING (true);

CREATE POLICY "Users can read their own friend requests" ON public.friend_requests FOR SELECT USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);
CREATE POLICY "Users can create friend requests" ON public.friend_requests FOR INSERT WITH CHECK (auth.uid() = from_user_id);
CREATE POLICY "Users can update their received friend requests" ON public.friend_requests FOR UPDATE USING (auth.uid() = to_user_id);

CREATE POLICY "Users can read their own invites" ON public.session_invites FOR SELECT USING (auth.uid() = friend_id);
CREATE POLICY "Users can create invites" ON public.session_invites FOR INSERT WITH CHECK (true);

-- Auto-user-creation trigger (CRITICAL!)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  username_to_use TEXT;
BEGIN
  username_to_use := COALESCE(NEW.raw_user_meta_data->>'username', 'Player_' || substr(NEW.id::text, 1, 8));
  INSERT INTO public.users (id, username, unlocked_cosmetics, weapon_upgrades, achievements, total_coins, selected_cosmetic, stats, friends)
  VALUES (NEW.id, username_to_use, ARRAY['default']::TEXT[], '{"damage": 0, "attackSpeed": 0, "range": 0, "knockback": 0}'::JSONB, ARRAY[]::TEXT[], 0, '🧑', '{"roomsCleared": 0, "enemiesKilled": 0, "bossesDefeated": 0, "coinsEarned": 0, "hasWonOnce": false}'::JSONB, ARRAY[]::UUID[]);
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    INSERT INTO public.users (id, username, unlocked_cosmetics, weapon_upgrades, achievements, total_coins, selected_cosmetic, stats, friends)
    VALUES (NEW.id, username_to_use || '_' || substr(NEW.id::text, 1, 4), ARRAY['default']::TEXT[], '{"damage": 0, "attackSpeed": 0, "range": 0, "knockback": 0}'::JSONB, ARRAY[]::TEXT[], 0, '🧑', '{"roomsCleared": 0, "enemiesKilled": 0, "bossesDefeated": 0, "coinsEarned": 0, "hasWonOnce": false}'::JSONB, ARRAY[]::UUID[]);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO postgres;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Fallback RPC function (CRITICAL!)
CREATE OR REPLACE FUNCTION public.create_user_profile(user_id UUID, user_name TEXT)
RETURNS JSONB
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.users WHERE id = user_id) THEN
    RETURN jsonb_build_object('success', true, 'message', 'User profile already exists');
  END IF;
  INSERT INTO public.users (id, username, unlocked_cosmetics, weapon_upgrades, achievements, total_coins, selected_cosmetic, stats, friends)
  VALUES (user_id, user_name, ARRAY['default']::TEXT[], '{"damage": 0, "attackSpeed": 0, "range": 0, "knockback": 0}'::JSONB, ARRAY[]::TEXT[], 0, '🧑', '{"roomsCleared": 0, "enemiesKilled": 0, "bossesDefeated": 0, "coinsEarned": 0, "hasWonOnce": false}'::JSONB, ARRAY[]::UUID[]);
  RETURN jsonb_build_object('success', true, 'message', 'User profile created');
EXCEPTION
  WHEN unique_violation THEN
    INSERT INTO public.users (id, username, unlocked_cosmetics, weapon_upgrades, achievements, total_coins, selected_cosmetic, stats, friends)
    VALUES (user_id, user_name || '_' || substr(user_id::text, 1, 4), ARRAY['default']::TEXT[], '{"damage": 0, "attackSpeed": 0, "range": 0, "knockback": 0}'::JSONB, ARRAY[]::TEXT[], 0, '🧑', '{"roomsCleared": 0, "enemiesKilled": 0, "bossesDefeated": 0, "coinsEarned": 0, "hasWonOnce": false}'::JSONB, ARRAY[]::UUID[]);
    RETURN jsonb_build_object('success', true, 'message', 'Profile created with modified username');
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION public.create_user_profile(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_user_profile(UUID, TEXT) TO anon;

-- Cleanup function
CREATE OR REPLACE FUNCTION clean_old_session_invites()
RETURNS void AS $$
BEGIN
  DELETE FROM public.session_invites WHERE created_at < (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT - 300000;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'SETUP COMPLETE!';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Now:';
  RAISE NOTICE '1. Disable email confirmation in Supabase';
  RAISE NOTICE '2. Refresh this page';
  RAISE NOTICE '3. Try signing up!';
END $$;`;

  const handleCopySQL = () => {
    // Fallback copy method for environments where Clipboard API is blocked
    try {
      // Try modern Clipboard API first
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(migrationSQL).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }).catch(() => {
          // Fallback to old method
          fallbackCopyTextToClipboard(migrationSQL);
        });
      } else {
        // Use fallback method
        fallbackCopyTextToClipboard(migrationSQL);
      }
    } catch (err) {
      fallbackCopyTextToClipboard(migrationSQL);
    }
  };
  
  const fallbackCopyTextToClipboard = (text: string) => {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.top = '0';
    textArea.style.left = '0';
    textArea.style.width = '2em';
    textArea.style.height = '2em';
    textArea.style.padding = '0';
    textArea.style.border = 'none';
    textArea.style.outline = 'none';
    textArea.style.boxShadow = 'none';
    textArea.style.background = 'transparent';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      const successful = document.execCommand('copy');
      if (successful) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err) {
      console.error('Fallback copy failed:', err);
    }
    
    document.body.removeChild(textArea);
  };
  
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50" onClick={(e) => e.stopPropagation()}>
      <Alert className="max-w-2xl bg-white shadow-2xl border-4 border-red-500 animate-pulse-slow">
        <AlertCircle className="h-6 w-6 text-red-600" />
        <div className="ml-4 space-y-4">
          <div>
            <h3 className="text-2xl text-red-600">⚠️ DATABASE SETUP REQUIRED</h3>
            <p className="text-sm mt-2">
              <strong className="text-red-600">The database tables haven't been created yet.</strong> You must run the migration before you can sign up or sign in.
            </p>
          </div>
          
          <div className="space-y-3 bg-red-50 p-6 rounded-lg border-2 border-red-300">
            <p className="text-center mb-4"><strong>Follow these 4 steps:</strong></p>
            
            <div className="flex gap-3 items-start">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center font-bold">1</span>
              <div className="flex-1">
                <p className="font-medium">Click "Copy SQL Migration" below</p>
              </div>
            </div>
            
            <div className="flex gap-3 items-start">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center font-bold">2</span>
              <div className="flex-1">
                <p className="font-medium">Click "Open SQL Editor" to go to Supabase</p>
              </div>
            </div>
            
            <div className="flex gap-3 items-start">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center font-bold">3</span>
              <div className="flex-1">
                <p className="font-medium">In Supabase: Paste the SQL and click "Run"</p>
                <p className="text-xs text-muted-foreground mt-1">(Or press Ctrl+Enter / Cmd+Enter)</p>
              </div>
            </div>
            
            <div className="flex gap-3 items-start">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center font-bold">4</span>
              <div className="flex-1">
                <p className="font-medium">Click "Refresh Page" below</p>
              </div>
            </div>
          </div>
          
          <div className="flex gap-3 pt-4 flex-col sm:flex-row">
            <Button 
              onClick={handleCopySQL}
              className="flex items-center gap-2 flex-1 text-lg py-6"
              style={{ background: copied ? '#10b981' : '#dc2626' }}
            >
              {copied ? '✓ Copied!' : '📋 Step 1: Copy SQL Migration'}
            </Button>
            
            <Button 
              onClick={() => window.open(dashboardUrl, '_blank')}
              className="flex items-center gap-2 flex-1 text-lg py-6"
              style={{ background: '#dc2626' }}
            >
              🔗 Step 2: Open SQL Editor
              <ExternalLink className="h-5 w-5" />
            </Button>
          </div>
          
          <div className="flex gap-3 flex-col sm:flex-row">
            <Button 
              onClick={() => window.location.reload()}
              className="flex items-center gap-2 flex-1 text-lg py-6"
              style={{ background: '#dc2626' }}
            >
              🔄 Step 4: Refresh Page
            </Button>
            
            <Button 
              onClick={() => setShowSQL(!showSQL)}
              variant="outline"
              className="flex-1"
            >
              {showSQL ? 'Hide SQL' : 'View SQL Code'}
            </Button>
          </div>
          
          {showSQL && (
            <div className="mt-4">
              <textarea
                readOnly
                value={migrationSQL}
                className="w-full h-64 p-3 text-xs font-mono border rounded bg-gray-50 resize-none"
                onClick={(e) => e.currentTarget.select()}
              />
              <p className="text-xs text-muted-foreground mt-2">
                👆 Click the text to select all, then Ctrl+C to copy
              </p>
            </div>
          )}
          
          <div className="bg-yellow-50 border-2 border-yellow-400 rounded p-4 mt-4">
            <p className="text-sm"><strong>⏱️ This takes 30 seconds!</strong></p>
            <p className="text-xs text-muted-foreground mt-1">
              Full migration file: <code className="text-xs bg-gray-100 px-1 rounded">/supabase/migrations/COMPLETE_SETUP.sql</code>
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              This creates tables, triggers, and RPC functions needed for authentication.
            </p>
          </div>
        </div>
      </Alert>
    </div>
  );
}