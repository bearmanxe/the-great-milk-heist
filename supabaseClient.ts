import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from './supabase/info';
import { UserData, Friend, FriendRequest, Achievement } from '../types/game';
import { isUsernameAppropriate } from './usernameFilter';

const supabaseUrl = `https://${projectId}.supabase.co`;
const supabaseKey = publicAnonKey;

// Helper functions to convert between camelCase and snake_case
function toSnakeCase(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) return obj.map(toSnakeCase);
  if (typeof obj !== 'object') return obj;
  
  const result: any = {};
  for (const key in obj) {
    const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    result[snakeKey] = toSnakeCase(obj[key]);
  }
  return result;
}

function toCamelCase(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) return obj.map(toCamelCase);
  if (typeof obj !== 'object') return obj;
  
  const result: any = {};
  for (const key in obj) {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    result[camelKey] = toCamelCase(obj[key]);
  }
  return result;
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// Database connection check
export async function checkDatabaseSetup(): Promise<{ isSetup: boolean; error?: string }> {
  try {
    // Try to query the users table to see if it exists
    const { error } = await supabase
      .from('users')
      .select('id')
      .limit(1);
    
    if (error) {
      if (error.code === 'PGRST205' || error.message?.includes('could not find') || error.message?.includes('schema cache')) {
        return { isSetup: false, error: 'Database tables not found. Please run the migration.' };
      }
      // Other errors might be permissions-related, but table exists
      return { isSetup: true };
    }
    
    return { isSetup: true };
  } catch (error) {
    console.error('Database check error:', error);
    return { isSetup: false, error: 'Unable to connect to database' };
  }
}

// Auth functions
export async function signUp(email: string, username: string, password: string) {
  // Check if username is appropriate (content filtering)
  const appropriatenessCheck = isUsernameAppropriate(username);
  if (!appropriatenessCheck.isValid) {
    throw new Error(appropriatenessCheck.reason || 'Username is not appropriate.');
  }
  
  // Check if username already exists
  const { data: existingUsers, error: searchError } = await supabase
    .from('users')
    .select('username')
    .eq('username', username)
    .limit(1);
  
  if (searchError) {
    console.error('Error checking username:', searchError);
    
    // Check if it's a database setup issue
    if (searchError.code === 'PGRST205' || searchError.message?.includes('could not find') || searchError.message?.includes('schema cache')) {
      throw new Error('Database not set up. Please run the migration in Supabase Dashboard. See SUPABASE_SETUP.md for instructions.');
    }
  }
  
  if (existingUsers && existingUsers.length > 0) {
    throw new Error('Username already taken. Please choose a different username.');
  }
  
  // Sign up with real email
  // NOTE: To disable email confirmation, go to Supabase Dashboard > Authentication > Settings
  // and disable "Enable email confirmations" under Email Auth settings
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username
      },
      emailRedirectTo: undefined // Disable email redirect since we don't want confirmation
    }
  });

  if (error) throw error;

  // User profile is automatically created by database trigger (handle_new_user function)
  // Wait briefly to ensure the trigger has time to complete
  if (data.user) {
    await new Promise(resolve => setTimeout(resolve, 300));
  }

  return data;
}

export async function signIn(email: string, username: string, password: string) {
  // Sign in with email and password
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

// Helper function to create user profile if it doesn't exist (fallback if trigger fails)
async function ensureUserProfile(userId: string, username: string): Promise<boolean> {
  try {
    // First check if profile already exists
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .single();

    // Profile already exists
    if (data && !error) {
      return true;
    }

    // Profile doesn't exist - call the RPC function to create it
    // This bypasses RLS using SECURITY DEFINER
    console.log('User profile not found, creating via RPC...');
    const { data: rpcResult, error: rpcError } = await supabase.rpc('create_user_profile', {
      user_id: userId,
      user_name: username
    });

    if (rpcError) {
      console.error('Error calling create_user_profile RPC:', rpcError);
      
      // Check if it's a "function not found" error
      if (rpcError.code === 'PGRST202') {
        console.error('❌ DATABASE NOT SET UP! The create_user_profile function does not exist.');
        console.error('📋 You MUST run the migration first: /supabase/migrations/COMPLETE_SETUP.sql');
        console.error('🔗 Go to: https://supabase.com/dashboard/project/symyhtogzjmuibiayvnr/sql');
      }
      
      return false;
    }

    if (rpcResult?.success) {
      console.log('User profile created via RPC:', rpcResult.message);
      return true;
    }

    console.error('RPC returned failure:', rpcResult);
    return false;
  } catch (error) {
    console.error('Error ensuring user profile:', error);
    return false;
  }
}

// User data functions
export async function getUserData(userId: string, username?: string, retries = 5, delay = 500): Promise<UserData | null> {
  for (let i = 0; i < retries; i++) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (!error && data) {
      return toCamelCase(data) as UserData;
    }

    // If this is the last retry and we have a username, try to create the profile
    if (i === retries - 1 && error?.code === 'PGRST116' && username) {
      console.log('Trigger failed to create user profile, attempting manual creation...');
      const created = await ensureUserProfile(userId, username);
      
      if (created) {
        // Try one more time to fetch the data
        const { data: retryData, error: retryError } = await supabase
          .from('users')
          .select('*')
          .eq('id', userId)
          .single();
          
        if (!retryError && retryData) {
          return toCamelCase(retryData) as UserData;
        }
      }
      
      console.error('Failed to create user profile manually');
      return null;
    }

    // If it's an error other than "no rows", return null immediately
    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching user data:', error);
      return null;
    }

    // Wait before retrying (exponential backoff)
    await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
  }

  return null;
}

export async function updateUserData(userId: string, updates: Partial<UserData>) {
  try {
    const { error } = await supabase
      .from('users')
      .update(toSnakeCase(updates))
      .eq('id', userId);

    if (error) throw error;
  } catch (error: any) {
    // Only throw meaningful errors, skip network errors silently
    if (error.message && !error.message.includes('Failed to fetch') && !error.message.includes('NetworkError')) {
      throw error;
    }
    // Silently fail for network errors during background sync
  }
}

// Achievement functions
export async function unlockAchievement(userId: string, achievementId: string) {
  const userData = await getUserData(userId);
  if (!userData) return;

  if (!userData.achievements.includes(achievementId)) {
    const updatedAchievements = [...userData.achievements, achievementId];
    await updateUserData(userId, { achievements: updatedAchievements });
  }
}

// Friends functions
export async function searchUsers(searchTerm: string): Promise<UserData[]> {
  const { data, error } = await supabase
    .from('users')
    .select('id, username')
    .ilike('username', `%${searchTerm}%`)
    .limit(10);

  if (error) {
    console.error('Error searching users:', error);
    return [];
  }

  return data;
}

export async function sendFriendRequest(fromUserId: string, toUserId: string) {
  const fromUser = await getUserData(fromUserId);
  if (!fromUser) throw new Error('User not found');

  const friendRequest = {
    from_user_id: fromUserId,
    from_username: fromUser.username,
    to_user_id: toUserId,
    status: 'pending',
    created_at: Date.now()
  };

  const { error } = await supabase.from('friend_requests').insert([friendRequest]);
  if (error) throw error;
}

export async function getFriendRequests(userId: string): Promise<FriendRequest[]> {
  const { data, error } = await supabase
    .from('friend_requests')
    .select('*')
    .eq('to_user_id', userId)
    .eq('status', 'pending');

  if (error) {
    console.error('Error fetching friend requests:', error);
    return [];
  }

  return toCamelCase(data) as FriendRequest[];
}

export async function acceptFriendRequest(requestId: string, userId: string, friendId: string) {
  // Update request status
  await supabase
    .from('friend_requests')
    .update({ status: 'accepted' })
    .eq('id', requestId);

  // Add friend to both users
  const userData = await getUserData(userId);
  const friendData = await getUserData(friendId);

  if (userData && friendData) {
    await updateUserData(userId, { 
      friends: [...userData.friends, friendId] 
    });
    await updateUserData(friendId, { 
      friends: [...friendData.friends, userId] 
    });
  }
}

export async function rejectFriendRequest(requestId: string) {
  await supabase
    .from('friend_requests')
    .update({ status: 'rejected' })
    .eq('id', requestId);
}

export async function getFriends(userId: string): Promise<Friend[]> {
  const userData = await getUserData(userId);
  if (!userData) return [];

  const { data, error } = await supabase
    .from('users')
    .select('id, username')
    .in('id', userData.friends);

  if (error) {
    console.error('Error fetching friends:', error);
    return [];
  }

  return data.map(user => ({
    id: user.id,
    username: user.username,
    status: 'offline' as const, // TODO: Implement real-time status
  }));
}

export async function removeFriend(userId: string, friendId: string) {
  const userData = await getUserData(userId);
  const friendData = await getUserData(friendId);

  if (userData && friendData) {
    await updateUserData(userId, { 
      friends: userData.friends.filter(id => id !== friendId) 
    });
    await updateUserData(friendId, { 
      friends: friendData.friends.filter(id => id !== userId) 
    });
  }
}

// Multiplayer session management
export async function inviteFriendToSession(sessionId: string, friendId: string, inviterName: string) {
  // Store invitation in database
  const invitation = {
    session_id: sessionId,
    friend_id: friendId,
    inviter_name: inviterName,
    created_at: Date.now()
  };

  const { error } = await supabase.from('session_invites').insert([invitation]);
  if (error) throw error;
}

export async function getSessionInvites(userId: string) {
  const { data, error } = await supabase
    .from('session_invites')
    .select('*')
    .eq('friend_id', userId)
    .gte('created_at', Date.now() - 300000); // Last 5 minutes

  if (error) {
    console.error('Error fetching invites:', error);
    return [];
  }

  return toCamelCase(data);
}