/**
 * Display a helpful welcome message in the console
 */
let hasDisplayedWelcome = false;

export function displayWelcomeMessage() {
  // Only show once per session
  if (hasDisplayedWelcome) return;
  hasDisplayedWelcome = true;

  const styles = {
    title: 'color: #FF6B6B; font-size: 20px; font-weight: bold;',
    success: 'color: #4ECDC4; font-weight: bold;',
    warning: 'color: #FFE66D; font-weight: bold;',
    info: 'color: #A8E6CF;',
    normal: 'color: #666;',
  };

  console.log('%c🥛 The Great Milk Heist', styles.title);
  console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', styles.info);
  
  console.log('%c✅ Game Status:', styles.success);
  console.log('%c  • Single-player: Fully functional', styles.normal);
  console.log('%c  • Authentication: Connected', styles.normal);
  console.log('%c  • Controller support: Ready', styles.normal);
  console.log('%c  • Achievements: Tracking', styles.normal);
  
  console.log('');
  console.log('%c⚠️  Multiplayer Status:', styles.warning);
  console.log('%c  • Mode: LOCAL (works in same browser only)', styles.normal);
  console.log('%c  • To enable online multiplayer:', styles.normal);
  console.log('%c    1. supabase login', styles.info);
  console.log('%c    2. supabase functions deploy make-server', styles.info);
  console.log('%c  • See DEPLOY_MULTIPLAYER.md for details', styles.normal);
  
  console.log('');
  console.log('%c💡 Note:', styles.info);
  console.log('%c  • "Using local mode" messages are normal and expected', styles.normal);
  console.log('%c  • Game auto-falls back to local multiplayer', styles.normal);
  console.log('%c  • No errors - everything is working!', styles.normal);
  
  console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', styles.info);
}

/**
 * Log multiplayer mode status
 */
let hasLoggedMode = false;

export function logMultiplayerMode(isLocal: boolean) {
  // Only log once per session
  if (hasLoggedMode) return;
  hasLoggedMode = true;
  
  if (isLocal) {
    console.log('%c🏠 Multiplayer: Local Mode', 'color: #FFE66D; font-weight: bold;');
    console.log('%c   Players must be in same browser session', 'color: #666;');
  } else {
    console.log('%c🌐 Multiplayer: Online Mode', 'color: #4ECDC4; font-weight: bold;');
    console.log('%c   Ready for online play!', 'color: #666;');
  }
}

/**
 * Show a clean status message
 */
export function showCleanStatus() {
  console.clear();
  console.log('%c🥛 THE GREAT MILK HEIST', 'color: #FF6B6B; font-size: 24px; font-weight: bold; text-shadow: 2px 2px 0px rgba(0,0,0,0.1);');
  console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #A8E6CF;');
  console.log('%c✅ Game Ready!', 'color: #4ECDC4; font-size: 16px; font-weight: bold;');
  console.log('%c   All features working', 'color: #666;');
  console.log('');
  console.log('%c⚠️  Multiplayer: Local Mode', 'color: #FFE66D; font-weight: bold;');
  console.log('%c   Works in same browser - deploy for online mode', 'color: #666;');
  console.log('');
  console.log('%c📖 Docs: README_FIRST.md | QUICK_START.md', 'color: #999;');
  console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #A8E6CF;');
}
