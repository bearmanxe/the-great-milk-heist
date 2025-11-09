import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card } from './ui/card';
import { toast } from 'sonner@2.0.3';
import { isUsernameAppropriate, suggestAlternativeUsernames } from '../utils/usernameFilter';
import { DatabaseSetupWarning } from './DatabaseSetupWarning';
import { checkDatabaseSetup } from '../utils/supabaseClient';

interface AuthScreenProps {
  onSignIn: (email: string, username: string, password: string) => Promise<void>;
  onSignUp: (email: string, username: string, password: string) => Promise<void>;
}

export function AuthScreen({ onSignIn, onSignUp }: AuthScreenProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [usernameError, setUsernameError] = useState('');
  const [showDatabaseWarning, setShowDatabaseWarning] = useState(false);

  useEffect(() => {
    const checkSetup = async () => {
      const result = await checkDatabaseSetup();
      if (!result.isSetup) {
        setShowDatabaseWarning(true);
      }
    };
    checkSetup();
  }, []);

  const handleUsernameChange = (value: string) => {
    setUsername(value);
    
    // Only validate during signup and if username is not empty
    if (isSignUp && value.length > 0) {
      const check = isUsernameAppropriate(value);
      if (!check.isValid) {
        setUsernameError(check.reason || 'Invalid username');
      } else if (value.length < 3) {
        setUsernameError('Username must be at least 3 characters');
      } else if (value.length > 20) {
        setUsernameError('Username must be 20 characters or less');
      } else if (!/^[a-zA-Z0-9_-]+$/.test(value)) {
        setUsernameError('Can only contain letters, numbers, underscores, and hyphens');
      } else {
        setUsernameError('');
      }
    } else {
      setUsernameError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    // Basic email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    if (isSignUp && !username) {
      toast.error('Please enter a username');
      return;
    }

    if (isSignUp && username.length < 3) {
      toast.error('Username must be at least 3 characters');
      return;
    }

    if (isSignUp && username.length > 20) {
      toast.error('Username must be 20 characters or less');
      return;
    }

    // Validate username format (alphanumeric, underscores, hyphens only)
    if (isSignUp && !/^[a-zA-Z0-9_-]+$/.test(username)) {
      toast.error('Username can only contain letters, numbers, underscores, and hyphens');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    if (isSignUp && password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        await onSignUp(email, username, password);
      } else {
        await onSignIn(email, '', password);
      }
    } catch (error: any) {
      // Check if it's a database setup error
      if (
        error.message?.includes('Database not set up') || 
        error.message?.includes('DATABASE NOT SET UP') ||
        error.message?.includes('PGRST202') || 
        error.message?.includes('PGRST205') ||
        error.message?.includes('function') ||
        error.message?.includes('trigger') ||
        error.message?.includes('user profile')
      ) {
        setShowDatabaseWarning(true);
        toast.error('⚠️ Database not set up! See the popup for instructions.');
      } else {
        toast.error(error.message || 'Authentication failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {showDatabaseWarning && <DatabaseSetupWarning />}
      
      <div className="min-h-screen flex items-center justify-center p-4"
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        }}>
        <Card className="w-full max-w-md p-8 space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-4xl">🥛</h1>
            <h2 className="text-2xl">The Great Milk Heist</h2>
            <p className="text-muted-foreground">
              {isSignUp 
                ? 'Create an account to start playing' 
                : 'Sign in with your email and password'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                autoComplete="email"
                disabled={loading}
              />
            </div>

            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => handleUsernameChange(e.target.value)}
                  placeholder="Choose a username"
                  autoComplete="username"
                  disabled={loading}
                />
                {usernameError && <p className="text-red-500 text-sm">{usernameError}</p>}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                autoComplete={isSignUp ? 'new-password' : 'current-password'}
                disabled={loading}
              />
            </div>

            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm password"
                  autoComplete="new-password"
                  disabled={loading}
                />
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading}
              style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
            >
              {loading ? 'Processing...' : (isSignUp ? 'Sign Up' : 'Sign In')}
            </Button>
          </form>

          <div className="text-center">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm text-muted-foreground hover:underline"
              disabled={loading}
            >
              {isSignUp 
                ? 'Already have an account? Sign in' 
                : "Don't have an account? Sign up"}
            </button>
          </div>

          <div className="text-center pt-4 space-y-2 border-t">
            <p className="text-xs text-muted-foreground">
              🎮 Controller Support • 🏆 35 Achievements • 👥 Friends & Co-op
            </p>
          </div>
        </Card>
      </div>
    </>
  );
}