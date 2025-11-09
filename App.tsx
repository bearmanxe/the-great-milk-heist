import { useState, useEffect, useMemo } from 'react';
import { Player, Weapon, PowerUp, Difficulty, Cosmetic, Achievement, Friend, FriendRequest, UserData } from './types/game';
import { WEAPONS } from './data/weapons';
import { POWERUPS } from './data/powerups';
import { COSMETICS } from './data/cosmetics';
import { generateRoom } from './utils/roomGenerator';
import { AuthScreen } from './components/AuthScreen';
import { StartScreen } from './components/StartScreen';
import { GameRoom } from './components/GameRoom';
import { LocalCoopGameRoom } from './components/LocalCoopGameRoom';
import { UpgradeSelection } from './components/UpgradeSelection';
import { DowngradeSelection } from './components/DowngradeSelection';
import { VictoryScreen } from './components/VictoryScreen';
import { GameOver } from './components/GameOver';
import { Shop } from './components/Shop';
import { Achievements } from './components/Achievements';
import { FriendsList } from './components/FriendsList';
import { soundManager } from './utils/soundManager';
import { toast, Toaster } from 'sonner@2.0.3';
import { controllerManager } from './utils/controllerManager';
import { achievementManager } from './utils/achievementManager';
import { showCleanStatus } from './utils/consoleWelcome';
import { 
  signIn, 
  signUp, 
  signOut, 
  getCurrentUser, 
  getUserData, 
  updateUserData,
  searchUsers,
  sendFriendRequest,
  getFriendRequests,
  acceptFriendRequest,
  rejectFriendRequest,
  getFriends,
  removeFriend,
  checkDatabaseSetup
} from './utils/supabaseClient';
import { DatabaseSetupWarning } from './components/DatabaseSetupWarning';
import { ControllerCursor } from './components/ControllerCursor';
import { BackgroundMusicPlayer } from './components/BackgroundMusicPlayer';
import { BACKGROUND_MUSIC_URL, BACKGROUND_MUSIC_CONFIG } from './config/audio';

type GameState = 'auth' | 'start' | 'playing' | 'upgrade' | 'downgrade' | 'victory' | 'gameover' | 'shop' | 'achievements' | 'friends';

function App() {
  // Database setup check (disabled for standalone mode)
  const [isDatabaseSetup, setIsDatabaseSetup] = useState<boolean>(true);
  const [isDatabaseChecking, setIsDatabaseChecking] = useState<boolean>(false);
  
  // Auth state (simplified for standalone mode)
  const [gameState, setGameState] = useState<GameState>('start');
  const [currentUserId, setCurrentUserId] = useState<string>('local-player');
  const [currentUsername, setCurrentUsername] = useState<string>('Player');
  const [userData, setUserData] = useState<UserData | null>(null);
  
  // Game state
  const [difficulty, setDifficulty] = useState<Difficulty>('normal');
  const [currentRoomNumber, setCurrentRoomNumber] = useState(1);
  const [isEndlessMode, setIsEndlessMode] = useState(false);
  const [isReverseMode, setIsReverseMode] = useState(false);
  const [isLocalCoopMode, setIsLocalCoopMode] = useState(false);
  const [totalCoins, setTotalCoins] = useState(0);
  const [unlockedCosmetics, setUnlockedCosmetics] = useState<string[]>(['default']);
  const [weaponUpgrades, setWeaponUpgrades] = useState({ damage: 0, attackSpeed: 0, range: 0, knockback: 0 });
  const [selectedCosmetic, setSelectedCosmetic] = useState('🧑');
  
  // Achievements & Friends
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  
  const [player, setPlayer] = useState<Player>({
    x: 400,
    y: 300,
    health: 100,
    maxHealth: 100,
    speed: 6,
    damage: 0,
    defense: 0,
    lifesteal: 0,
    piercing: 0,
    coins: 0,
    cosmetic: selectedCosmetic,
    accumulatedDamage: 0,
  });
  const [player2, setPlayer2] = useState<Player>({
    x: 400,
    y: 300,
    health: 100,
    maxHealth: 100,
    speed: 6,
    damage: 0,
    defense: 0,
    lifesteal: 0,
    piercing: 0,
    coins: 0,
    cosmetic: '🧑',
    accumulatedDamage: 0,
  });
  const [currentWeapon, setCurrentWeapon] = useState<Weapon>(WEAPONS[0]);
  const [currentWeapon2, setCurrentWeapon2] = useState<Weapon>(WEAPONS[0]);
  const [upgradeOptions, setUpgradeOptions] = useState<(Weapon | PowerUp)[]>([]);
  const [reverseActiveUpgrades, setReverseActiveUpgrades] = useState<(Weapon | PowerUp)[]>([]);

  // Check authentication on mount
  useEffect(() => {
    // Show helpful console message
    console.log('%c╔════════════════════════════════════════════════════════════════╗', 'color: #667eea;');
    console.log('%c║          🥛 THE GREAT MILK HEIST 🥛                          ║', 'color: #667eea; font-weight: bold;');
    console.log('%c╠════════════════════════════════════════════════════════════════╣', 'color: #667eea;');
    console.log('%c║  ⚠️  DATABASE SETUP REQUIRED - READ THIS!  ⚠️                ║', 'color: #dc2626; font-weight: bold;');
    console.log('%c╠════════════════════════════════════════════════════════════════╣', 'color: #667eea;');
    console.log('%c║                                                                ║', 'color: #667eea;');
    console.log('%c║  If you see errors like:                                      ║', 'color: #667eea;');
    console.log('%c║  • "Could not find the function create_user_profile"          ║', 'color: #667eea;');
    console.log('%c║  • "The result contains 0 rows"                               ║', 'color: #667eea;');
    console.log('%c║                                                                ║', 'color: #667eea;');
    console.log('%c║  👉 YOU MUST RUN THE MIGRATION FIRST! 👈                      ║', 'color: #dc2626; font-weight: bold;');
    console.log('%c║                                                                ║', 'color: #667eea;');
    console.log('%c╠════════════════════════════════════════════════════════════════╣', 'color: #667eea;');
    console.log('%c║  📋 QUICK SETUP (30 seconds):                                 ║', 'color: #10b981; font-weight: bold;');
    console.log('%c║                                                                ║', 'color: #667eea;');
    console.log('%c║  1️⃣  Open: /supabase/migrations/COMPLETE_SETUP.sql           ║', 'color: #667eea;');
    console.log('%c║  2️⃣  Copy the entire file (Ctrl+A, Ctrl+C)                   ║', 'color: #667eea;');
    console.log('%c║  3️⃣  Go to Supabase SQL Editor (link below)                  ║', 'color: #667eea;');
    console.log('%c║  4️⃣  Paste and click "Run" (Ctrl+V, Ctrl+Enter)              ║', 'color: #667eea;');
    console.log('%c║  5️⃣  Refresh this page                                        ║', 'color: #667eea;');
    console.log('%c║                                                                ║', 'color: #667eea;');
    console.log('%c║  🔗 SQL Editor:                                               ║', 'color: #667eea;');
    console.log('%c║  https://supabase.com/dashboard/project/symyhtogzjmuibiayvnr/sql', 'color: #667eea;');
    console.log('%c║                                                                ║', 'color: #667eea;');
    console.log('%c╠════════════════════════════════════════════════════════════════╣', 'color: #667eea;');
    console.log('%c║  📖 More Help:                                                ║', 'color: #667eea;');
    console.log('%c║  • /DATABASE_SETUP_REQUIRED.md                                ║', 'color: #667eea;');
    console.log('%c║  • /START_DATABASE_SETUP.md                                   ║', 'color: #667eea;');
    console.log('%c║  • /TROUBLESHOOTING.md                                        ║', 'color: #667eea;');
    console.log('%c║                                                                ║', 'color: #667eea;');
    console.log('%c╚═════════════════════════��══════════════════════════════════════╝', 'color: #667eea;');
    console.log('');
    
    // Show clean status after database setup message
    setTimeout(() => {
      showCleanStatus();
    }, 100);
    
    // Skip Supabase auth, use local storage instead
    loadLocalData();
  }, []);

  // Update controller every frame
  useEffect(() => {
    const interval = setInterval(() => {
      controllerManager.update();
    }, 16);
    return () => clearInterval(interval);
  }, []);

  // Load achievements
  useEffect(() => {
    setAchievements(achievementManager.getAchievements());
  }, []);

  // Early music preloading - start as soon as app loads
  useEffect(() => {
    if (BACKGROUND_MUSIC_CONFIG.enabled && BACKGROUND_MUSIC_URL) {
      // Import the backgroundMusicManager
      import('./utils/backgroundMusicManager').then(({ backgroundMusicManager }) => {
        // Initialize immediately to start preloading the audio
        backgroundMusicManager.initialize(BACKGROUND_MUSIC_URL);
        backgroundMusicManager.setVolume(BACKGROUND_MUSIC_CONFIG.defaultVolume);
        
        // Try to play immediately (will be blocked until user interaction, but audio will be preloaded)
        if (BACKGROUND_MUSIC_CONFIG.autoPlay) {
          backgroundMusicManager.play();
        }
      });
    }
  }, []);

  // Auto-save to localStorage periodically
  useEffect(() => {
    const interval = setInterval(() => {
      saveToLocalStorage();
    }, 5000); // Save every 5 seconds
    return () => clearInterval(interval);
  }, [totalCoins, unlockedCosmetics, weaponUpgrades, selectedCosmetic]);

  const loadLocalData = () => {
    try {
      const savedCoins = localStorage.getItem('milkHeist_totalCoins');
      const savedCosmetics = localStorage.getItem('milkHeist_unlockedCosmetics');
      const savedUpgrades = localStorage.getItem('milkHeist_weaponUpgrades');
      const savedCosmetic = localStorage.getItem('milkHeist_selectedCosmetic');
      const savedAchievements = localStorage.getItem('milkHeist_achievements');
      const savedStats = localStorage.getItem('milkHeist_stats');

      if (savedCoins) setTotalCoins(parseInt(savedCoins));
      if (savedCosmetics) setUnlockedCosmetics(JSON.parse(savedCosmetics));
      if (savedUpgrades) setWeaponUpgrades(JSON.parse(savedUpgrades));
      if (savedCosmetic) setSelectedCosmetic(savedCosmetic);
      
      if (savedAchievements) {
        achievementManager.setUnlockedAchievements(JSON.parse(savedAchievements));
      }
      if (savedStats) {
        achievementManager.setStats(JSON.parse(savedStats));
      }
      
      setAchievements(achievementManager.getAchievements());
      
      console.log('%c✅ Progress loaded from local storage', 'color: #10b981; font-weight: bold');
    } catch (error) {
      console.error('Error loading from localStorage:', error);
    }
  };

  const saveToLocalStorage = () => {
    try {
      localStorage.setItem('milkHeist_totalCoins', totalCoins.toString());
      localStorage.setItem('milkHeist_unlockedCosmetics', JSON.stringify(unlockedCosmetics));
      localStorage.setItem('milkHeist_weaponUpgrades', JSON.stringify(weaponUpgrades));
      localStorage.setItem('milkHeist_selectedCosmetic', selectedCosmetic);
      localStorage.setItem('milkHeist_achievements', JSON.stringify(
        achievementManager.getAchievements().filter(a => a.unlocked).map(a => a.id)
      ));
      localStorage.setItem('milkHeist_stats', JSON.stringify(achievementManager.getStats()));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  };

  // These functions are now no-ops for standalone mode
  const handleSignIn = async (email: string, username: string, password: string) => {
    // Standalone mode - no authentication needed
    setGameState('start');
    
    // Get the username from user data
    const data = await getUserData(result.user.id, username);
    const displayName = data?.username || email;
    setGameState('start');
    toast.success(`Welcome back, ${displayName}!`);
  };

  const handleSignUp = async (email: string, username: string, password: string) => {
    // Standalone mode - no signup needed
    setGameState('start');
    toast.success('Welcome to The Great Milk Heist!');
  };

  const handleLogout = async () => {
    // Save before "logging out"
    saveToLocalStorage();
    setGameState('start');
    toast.success('Progress saved!');
  };

  // Memoize room generation
  const currentRoom = useMemo(() => {
    return generateRoom(currentRoomNumber, difficulty, isEndlessMode);
  }, [currentRoomNumber, difficulty, isEndlessMode]);

  const getInitialStats = (diff: Difficulty): Player => {
    const currentCosmetic = COSMETICS.find(c => c.emoji === selectedCosmetic);
    
    const baseStats = {
      x: 400,
      y: 300,
      health: 100,
      maxHealth: 100,
      speed: 6,
      damage: 0,
      defense: 0,
      lifesteal: 0,
      piercing: 0,
      coins: 0,
      cosmetic: selectedCosmetic,
      cosmeticAbility: currentCosmetic?.ability,
      accumulatedDamage: 0,
    };

    const difficultyModifiers = {
      easy: { maxHealth: 100, health: 100, defense: 5 },
      normal: { maxHealth: 80, health: 80, defense: 3 },
      hard: { maxHealth: 60, health: 60, defense: 1},
      milk: { maxHealth: 40, health: 40, defense: 0 }
    };

    const mods = difficultyModifiers[diff];
    
    // Apply cosmetic ability bonuses
    let bonusMaxHealth = 0;
    let bonusDefense = 0;
    let bonusSpeed = 0;
    let bonusDamage = 0;
    let bonusLifesteal = 0;
    
    if (currentCosmetic?.ability) {
      switch (currentCosmetic.ability.type) {
        case 'health':
          bonusMaxHealth = currentCosmetic.ability.value;
          break;
        case 'defense':
          bonusDefense = currentCosmetic.ability.value;
          break;
        case 'speed':
          bonusSpeed = currentCosmetic.ability.value;
          break;
        case 'damage':
          bonusDamage = currentCosmetic.ability.value;
          break;
        case 'lifesteal':
          bonusLifesteal = currentCosmetic.ability.value;
          break;
        case 'ultimate':
          // Platinum Champion: Ultimate power (+50 Damage, +100 HP, +5 Defense, +5 Speed, +25% Lifesteal)
          bonusDamage = 50;
          bonusMaxHealth = 100;
          bonusDefense = 5;
          bonusSpeed = 5;
          bonusLifesteal = 25;
          break;
      }
    }
    
    return {
      ...baseStats,
      health: mods.health + bonusMaxHealth,
      maxHealth: mods.maxHealth + bonusMaxHealth,
      defense: mods.defense + bonusDefense,
      speed: baseStats.speed + bonusSpeed,
      damage: baseStats.damage + bonusDamage,
      lifesteal: baseStats.lifesteal + bonusLifesteal
    };
  };

  const startGame = (selectedDifficulty: Difficulty, reverse: boolean = false, localCoop: boolean = false) => {
    setDifficulty(selectedDifficulty);
    setGameState('playing');
    setCurrentRoomNumber(reverse ? 15 : 1);
    setIsEndlessMode(false);
    setIsReverseMode(reverse);
    setIsLocalCoopMode(localCoop);
    
    let initialPlayer = getInitialStats(selectedDifficulty);
    
    // In reverse mode, start with 15 random upgrades
    if (reverse) {
      const allOptions = [...WEAPONS.slice(1), ...POWERUPS]; // Exclude starting spoon
      const shuffled = allOptions.sort(() => Math.random() - 0.5);
      const startingUpgrades = shuffled.slice(0, 15);
      setReverseActiveUpgrades([...startingUpgrades]);
      
      // Apply all the upgrades to the initial player stats
      let buffedPlayer = { ...initialPlayer };
      let startWeapon = WEAPONS[0];
      
      startingUpgrades.forEach(upgrade => {
        if ('damage' in upgrade && 'attackSpeed' in upgrade && 'range' in upgrade) {
          // It's a weapon - use the last one selected
          startWeapon = {
            ...upgrade,
            damage: upgrade.damage + weaponUpgrades.damage,
            attackSpeed: upgrade.attackSpeed + weaponUpgrades.attackSpeed,
            range: upgrade.range + weaponUpgrades.range,
            knockback: upgrade.knockback + weaponUpgrades.knockback
          };
        } else {
          // It's a powerup - apply the stat boost
          switch (upgrade.effect.type) {
            case 'health':
              // Instant health - just add to current health
              buffedPlayer.health = Math.min(buffedPlayer.maxHealth + upgrade.effect.value, buffedPlayer.maxHealth + 1000);
              break;
            case 'maxHealth':
              buffedPlayer.maxHealth += upgrade.effect.value;
              buffedPlayer.health += upgrade.effect.value;
              break;
            case 'speed':
              buffedPlayer.speed += upgrade.effect.value;
              break;
            case 'damage':
              buffedPlayer.damage += upgrade.effect.value;
              break;
            case 'defense':
              buffedPlayer.defense += upgrade.effect.value;
              break;
            case 'lifesteal':
              buffedPlayer.lifesteal += upgrade.effect.value;
              break;
            case 'piercing':
              buffedPlayer.piercing += upgrade.effect.value;
              break;
          }
        }
      });
      
      setPlayer(buffedPlayer);
      setCurrentWeapon(startWeapon);
      if (localCoop) {
        setPlayer2(buffedPlayer);
        setCurrentWeapon2(startWeapon);
      }
      
      toast.success('🔮 Reverse Mode: Starting with 15 random upgrades!');
    } else {
      setPlayer(initialPlayer);
      if (localCoop) {
        setPlayer2(initialPlayer);
      }
      setReverseActiveUpgrades([]);
      
      const upgradedStartWeapon = {
        ...WEAPONS[0],
        damage: WEAPONS[0].damage + weaponUpgrades.damage,
        attackSpeed: WEAPONS[0].attackSpeed + weaponUpgrades.attackSpeed,
        range: WEAPONS[0].range + weaponUpgrades.range
      };
      setCurrentWeapon(upgradedStartWeapon);
      setCurrentWeapon2(upgradedStartWeapon);
    }
    
    achievementManager.onGameStart();
    if (localCoop) {
      achievementManager.onLocalCoopGameStart();
    }
    achievementManager.onWeaponUsed(WEAPONS[0].id);
    soundManager.initialize();
  };

  const generateUpgradeOptions = () => {
    const allOptions = [...WEAPONS, ...POWERUPS];
    const shuffled = allOptions.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 3);
  };

  const handleRoomComplete = (coinsEarned: number) => {
    setTotalCoins(prev => prev + coinsEarned);
    achievementManager.onCoinsEarned(coinsEarned);
    achievementManager.onRoomCleared();
    
    // Check victory conditions
    const isVictory = isReverseMode ? currentRoomNumber === 1 : currentRoomNumber === 15;
    
    if (isVictory && !isEndlessMode) {
      achievementManager.onGameComplete(difficulty, isReverseMode, isLocalCoopMode);
      if (controllerManager.isUsingController()) {
        achievementManager.setUsedController(true);
      }
      setGameState('victory');
      soundManager.stopBackgroundMusic();
    } else {
      // In reverse mode, show downgrade selection instead
      if (isReverseMode && reverseActiveUpgrades.length > 0) {
        setGameState('downgrade');
      } else {
        setUpgradeOptions(generateUpgradeOptions());
        setGameState('upgrade');
      }
    }
    
    setAchievements(achievementManager.getAchievements());
  };

  const handleReroll = () => {
    if (totalCoins >= 10) {
      setTotalCoins(prev => prev - 10);
      setUpgradeOptions(generateUpgradeOptions());
      achievementManager.onReroll();
      soundManager.playPowerUpSound();
      toast.success('Rerolled options!');
    } else {
      toast.error('Not enough coins to reroll!');
    }
  };

  const handleUpgradeSelect = (option: Weapon | PowerUp) => {
    if ('damage' in option && 'attackSpeed' in option && 'range' in option) {
      const upgradedWeapon = {
        ...option,
        damage: option.damage + weaponUpgrades.damage,
        attackSpeed: option.attackSpeed + weaponUpgrades.attackSpeed,
        range: option.range + weaponUpgrades.range,
        knockback: option.knockback + weaponUpgrades.knockback
      };
      setCurrentWeapon(upgradedWeapon);
      if (isLocalCoopMode) {
        setCurrentWeapon2(upgradedWeapon);
      }
      achievementManager.onWeaponUsed(option.id);
    } else {
      let updatedPlayer = { ...player };
      
      switch (option.effect.type) {
        case 'health':
          updatedPlayer.health = Math.min(player.maxHealth, player.health + option.effect.value);
          break;
        case 'maxHealth':
          updatedPlayer.maxHealth += option.effect.value;
          updatedPlayer.health += option.effect.value;
          break;
        case 'speed':
          updatedPlayer.speed += option.effect.value;
          break;
        case 'damage':
          updatedPlayer.damage += option.effect.value;
          break;
        case 'defense':
          updatedPlayer.defense += option.effect.value;
          break;
        case 'lifesteal':
          updatedPlayer.lifesteal = (updatedPlayer.lifesteal || 0) + option.effect.value;
          break;
        case 'piercing':
          updatedPlayer.piercing = (updatedPlayer.piercing || 0) + option.effect.value;
          break;
      }
      
      setPlayer(updatedPlayer);
      achievementManager.onPlayerStats(updatedPlayer);
      
      // Also apply to player 2 in local co-op mode
      if (isLocalCoopMode) {
        let updatedPlayer2 = { ...player2 };
        
        switch (option.effect.type) {
          case 'health':
            updatedPlayer2.health = Math.min(player2.maxHealth, player2.health + option.effect.value);
            break;
          case 'maxHealth':
            updatedPlayer2.maxHealth += option.effect.value;
            updatedPlayer2.health += option.effect.value;
            break;
          case 'speed':
            updatedPlayer2.speed += option.effect.value;
            break;
          case 'damage':
            updatedPlayer2.damage += option.effect.value;
            break;
          case 'defense':
            updatedPlayer2.defense += option.effect.value;
            break;
          case 'lifesteal':
            updatedPlayer2.lifesteal = (updatedPlayer2.lifesteal || 0) + option.effect.value;
            break;
          case 'piercing':
            updatedPlayer2.piercing = (updatedPlayer2.piercing || 0) + option.effect.value;
            break;
        }
        
        setPlayer2(updatedPlayer2);
      }
    }
    
    const nextRoom = isReverseMode ? currentRoomNumber - 1 : currentRoomNumber + 1;
    setCurrentRoomNumber(nextRoom);
    setPlayer(prev => ({ ...prev, x: 400, y: 300 }));
    if (isLocalCoopMode) {
      // Revive dead players with half their max HP when transitioning to next room
      setPlayer(prev => ({
        ...prev,
        x: 400,
        y: 300,
        health: prev.health <= 0 ? Math.floor(prev.maxHealth / 2) : prev.health
      }));
      setPlayer2(prev => ({
        ...prev,
        x: 400,
        y: 300,
        health: prev.health <= 0 ? Math.floor(prev.maxHealth / 2) : prev.health
      }));
    }
    setGameState('playing');
  };

  const handleDowngradeSelect = (option: Weapon | PowerUp) => {
    // Remove the selected upgrade from active upgrades
    setReverseActiveUpgrades(prev => prev.filter(u => u.id !== option.id));
    
    if ('damage' in option && 'attackSpeed' in option && 'range' in option) {
      // It's a weapon - revert to previous weapon or default
      const remainingWeapons = reverseActiveUpgrades.filter(u => 
        'damage' in u && 'attackSpeed' in u && 'range' in u && u.id !== option.id
      ) as Weapon[];
      
      if (remainingWeapons.length > 0) {
        const newWeapon = {
          ...remainingWeapons[remainingWeapons.length - 1],
          damage: remainingWeapons[remainingWeapons.length - 1].damage + weaponUpgrades.damage,
          attackSpeed: remainingWeapons[remainingWeapons.length - 1].attackSpeed + weaponUpgrades.attackSpeed,
          range: remainingWeapons[remainingWeapons.length - 1].range + weaponUpgrades.range,
          knockback: remainingWeapons[remainingWeapons.length - 1].knockback + weaponUpgrades.knockback
        };
        setCurrentWeapon(newWeapon);
        if (isLocalCoopMode) {
          setCurrentWeapon2(newWeapon);
        }
      } else {
        // Revert to default weapon
        const defaultWeapon = {
          ...WEAPONS[0],
          damage: WEAPONS[0].damage + weaponUpgrades.damage,
          attackSpeed: WEAPONS[0].attackSpeed + weaponUpgrades.attackSpeed,
          range: WEAPONS[0].range + weaponUpgrades.range
        };
        setCurrentWeapon(defaultWeapon);
        if (isLocalCoopMode) {
          setCurrentWeapon2(defaultWeapon);
        }
      }
    } else {
      // It's a powerup - remove the stat boost
      let updatedPlayer = { ...player };
      
      switch (option.effect.type) {
        case 'maxHealth':
          const healthLoss = option.effect.value;
          updatedPlayer.maxHealth = Math.max(1, updatedPlayer.maxHealth - healthLoss);
          updatedPlayer.health = Math.min(updatedPlayer.health, updatedPlayer.maxHealth);
          break;
        case 'speed':
          updatedPlayer.speed = Math.max(1, updatedPlayer.speed - option.effect.value);
          break;
        case 'damage':
          updatedPlayer.damage = Math.max(0, updatedPlayer.damage - option.effect.value);
          break;
        case 'defense':
          updatedPlayer.defense = Math.max(0, updatedPlayer.defense - option.effect.value);
          break;
        case 'lifesteal':
          updatedPlayer.lifesteal = Math.max(0, updatedPlayer.lifesteal - option.effect.value);
          break;
        case 'piercing':
          updatedPlayer.piercing = Math.max(0, updatedPlayer.piercing - option.effect.value);
          break;
        case 'health':
          // Health potions don't need to be reverted, skip
          break;
      }
      
      setPlayer(updatedPlayer);
      
      // Also apply to player 2 in local co-op mode
      if (isLocalCoopMode) {
        let updatedPlayer2 = { ...player2 };
        
        switch (option.effect.type) {
          case 'maxHealth':
            const healthLoss = option.effect.value;
            updatedPlayer2.maxHealth = Math.max(1, updatedPlayer2.maxHealth - healthLoss);
            updatedPlayer2.health = Math.min(updatedPlayer2.health, updatedPlayer2.maxHealth);
            break;
          case 'speed':
            updatedPlayer2.speed = Math.max(1, updatedPlayer2.speed - option.effect.value);
            break;
          case 'damage':
            updatedPlayer2.damage = Math.max(0, updatedPlayer2.damage - option.effect.value);
            break;
          case 'defense':
            updatedPlayer2.defense = Math.max(0, updatedPlayer2.defense - option.effect.value);
            break;
          case 'lifesteal':
            updatedPlayer2.lifesteal = Math.max(0, updatedPlayer2.lifesteal - option.effect.value);
            break;
          case 'piercing':
            updatedPlayer2.piercing = Math.max(0, updatedPlayer2.piercing - option.effect.value);
            break;
        }
        
        setPlayer2(updatedPlayer2);
      }
    }
    
    soundManager.playPowerUpSound();
    toast.error(`Lost upgrade: ${option.name}`);
    
    // Move to next room (which is lower in reverse mode)
    const nextRoom = currentRoomNumber - 1;
    setCurrentRoomNumber(nextRoom);
    setPlayer(prev => ({ ...prev, x: 400, y: 300 }));
    if (isLocalCoopMode) {
      // Revive dead players with half their max HP when transitioning to next room
      setPlayer(prev => ({
        ...prev,
        x: 400,
        y: 300,
        health: prev.health <= 0 ? Math.floor(prev.maxHealth / 2) : prev.health
      }));
      setPlayer2(prev => ({
        ...prev,
        x: 400,
        y: 300,
        health: prev.health <= 0 ? Math.floor(prev.maxHealth / 2) : prev.health
      }));
    }
    setGameState('playing');
  };

  const handleGameOver = (coinsEarned: number) => {
    setTotalCoins(prev => prev + coinsEarned);
    achievementManager.onCoinsEarned(coinsEarned);
    setGameState('gameover');
    soundManager.stopBackgroundMusic();
  };

  const handleRestart = () => {
    setGameState('start');
  };

  const handleQuitToMenu = () => {
    // Stop music when quitting
    soundManager.stopBackgroundMusic();
    // Return to start screen
    setGameState('start');
  };

  const handleContinueEndless = () => {
    setIsEndlessMode(true);
    const nextRoom = currentRoomNumber + 1;
    setCurrentRoomNumber(nextRoom);
    setPlayer(prev => ({ ...prev, x: 400, y: 300 }));
    setGameState('playing');
    soundManager.initialize();
  };

  const openShop = () => {
    setGameState('shop');
  };

  const closeShop = () => {
    setGameState('start');
  };

  const handlePurchaseCosmetic = (cosmetic: Cosmetic) => {
    if (totalCoins >= cosmetic.price && !unlockedCosmetics.includes(cosmetic.id)) {
      setTotalCoins(prev => prev - cosmetic.price);
      setUnlockedCosmetics(prev => {
        const updated = [...prev, cosmetic.id];
        achievementManager.onCosmeticUnlocked(updated.length);
        return updated;
      });
      soundManager.playPowerUpSound();
      toast.success(`Purchased ${cosmetic.name}!`);
    } else if (unlockedCosmetics.includes(cosmetic.id)) {
      toast.info(`${cosmetic.name} is already unlocked!`);
    } else {
      toast.error(`Not enough coins to purchase ${cosmetic.name}!`);
    }
  };

  const handleEquipCosmetic = (cosmeticId: string) => {
    const cosmetic = COSMETICS.find(c => c.id === cosmeticId);
    if (cosmetic && unlockedCosmetics.includes(cosmeticId)) {
      setSelectedCosmetic(cosmetic.emoji);
      setPlayer(prev => ({ 
        ...prev, 
        cosmetic: cosmetic.emoji,
        cosmeticAbility: cosmetic.ability
      }));
      soundManager.playPowerUpSound();
      toast.success(`Equipped ${cosmetic.name}!`);
    } else {
      toast.error(`You don't own ${cosmetic.name}!`);
    }
  };

  const handleUpgradeWeapon = (stat: 'damage' | 'attackSpeed' | 'range' | 'knockback') => {
    const costs = { damage: 50, attackSpeed: 75, range: 40, knockback: 60 };
    const price = costs[stat];
    
    if (totalCoins >= price) {
      setTotalCoins(prev => prev - price);
      setWeaponUpgrades(prev => ({
        ...prev,
        [stat]: stat === 'damage' ? prev.damage + 5 : 
                stat === 'attackSpeed' ? prev.attackSpeed + 0.2 :
                stat === 'knockback' ? prev.knockback + 10 :
                prev.range + 10
      }));
      soundManager.playPowerUpSound();
      toast.success(`Weapon ${stat} upgraded!`);
    } else {
      toast.error('Not enough coins!');
    }
  };

  const handlePurchaseLootBox = (boxType: 'basic' | 'premium' | 'legendary') => {
    const prices = { basic: 50, premium: 150, legendary: 300 };
    const price = prices[boxType];

    if (totalCoins < price) {
      toast.error('Not enough coins for this loot box!');
      return;
    }

    setTotalCoins(prev => prev - price);

    const lockedCosmetics = COSMETICS.filter(c => !unlockedCosmetics.includes(c.id));
    
    if (lockedCosmetics.length === 0) {
      toast.info('You have unlocked all cosmetics! 🎉');
      setTotalCoins(prev => prev + price);
      return;
    }

    let availableCosmetics = lockedCosmetics;
    if (boxType === 'basic') {
      availableCosmetics = lockedCosmetics.filter(c => c.price <= 150);
    } else if (boxType === 'premium') {
      availableCosmetics = lockedCosmetics.filter(c => c.price > 100 && c.price <= 300);
    } else if (boxType === 'legendary') {
      availableCosmetics = lockedCosmetics.filter(c => c.price > 200);
    }

    if (availableCosmetics.length === 0) {
      availableCosmetics = lockedCosmetics;
    }

    const randomCosmetic = availableCosmetics[Math.floor(Math.random() * availableCosmetics.length)];
    
    setUnlockedCosmetics(prev => {
      const updated = [...prev, randomCosmetic.id];
      achievementManager.onCosmeticUnlocked(updated.length);
      return updated;
    });
    achievementManager.onLootBoxOpened();
    soundManager.playPowerUpSound();
    
    setTimeout(() => {
      toast.success(`🎉 You got ${randomCosmetic.name} ${randomCosmetic.emoji}!`, {
        duration: 5000,
      });
    }, 100);
  };

  const handleOpenAchievements = () => {
    setGameState('achievements');
  };

  const handleCloseAchievements = () => {
    setGameState('start');
  };

  const handleOpenFriends = async () => {
    if (currentUserId) {
      const friendsList = await getFriends(currentUserId);
      setFriends(friendsList);
      const requests = await getFriendRequests(currentUserId);
      setFriendRequests(requests);
    }
    setGameState('friends');
  };

  const handleCloseFriends = () => {
    setGameState('start');
  };

  const handleInviteToSession = async (friendId: string) => {
    // This function is not used in the current setup, but it's here for future use
    // if (multiplayerSession) {
    //   await inviteFriendToSession(multiplayerSession.id, friendId, currentUsername);
    // }
  };

  return (
    <div className="min-h-screen">
      {/* Global controller cursor - available on all screens */}
      <ControllerCursor />
      
      {/* Background music player with controls */}
      {BACKGROUND_MUSIC_CONFIG.enabled && (
        <BackgroundMusicPlayer 
          audioUrl={BACKGROUND_MUSIC_URL} 
          autoPlay={BACKGROUND_MUSIC_CONFIG.autoPlay}
        />
      )}
      
      {/* Removed: Database setup warning - Not needed in standalone mode */}
      
      {/* Removed: Auth screen - Not needed in standalone mode */}
      
      {gameState === 'start' && (
        <StartScreen 
          onStart={startGame} 
          totalCoins={totalCoins}
          onOpenShop={openShop}
          onOpenAchievements={handleOpenAchievements}
          onOpenFriends={handleOpenFriends}
          onLogout={handleLogout}
          username={currentUsername}
        />
      )}
      
      {gameState === 'shop' && (
        <Shop
          coins={totalCoins}
          unlockedCosmetics={unlockedCosmetics}
          currentCosmetic={selectedCosmetic}
          weaponUpgrades={weaponUpgrades}
          onPurchaseCosmetic={handlePurchaseCosmetic}
          onUpgradeWeapon={handleUpgradeWeapon}
          onPurchaseLootBox={handlePurchaseLootBox}
          onEquip={handleEquipCosmetic}
          onClose={closeShop}
          hasAllAchievements={achievements.length > 0 && achievements.every(a => a.unlocked)}
        />
      )}
      
      {gameState === 'achievements' && (
        <Achievements 
          achievements={achievements}
          onClose={handleCloseAchievements}
          unlockedCosmetics={unlockedCosmetics}
        />
      )}
      
      {gameState === 'friends' && (
        <FriendsList 
          friends={friends}
          friendRequests={friendRequests}
          onClose={handleCloseFriends}
          onSearchUsers={searchUsers}
          onSendFriendRequest={(userId) => sendFriendRequest(currentUserId, userId)}
          onAcceptRequest={(requestId, friendId) => acceptFriendRequest(requestId, currentUserId, friendId)}
          onRejectRequest={rejectFriendRequest}
          onRemoveFriend={(friendId) => removeFriend(currentUserId, friendId)}
          onInviteToSession={handleInviteToSession}
        />
      )}
      
      {gameState === 'playing' && !isLocalCoopMode && (
        <GameRoom
          player={player}
          room={currentRoom}
          weapon={currentWeapon}
          difficulty={difficulty}
          onPlayerUpdate={setPlayer}
          onRoomComplete={handleRoomComplete}
          onGameOver={handleGameOver}
          onQuitToMenu={handleQuitToMenu}
        />
      )}
      
      {gameState === 'playing' && isLocalCoopMode && (
        <LocalCoopGameRoom
          player1={player}
          player2={player2}
          room={currentRoom}
          weapon1={currentWeapon}
          weapon2={currentWeapon2}
          difficulty={difficulty}
          onPlayer1Update={setPlayer}
          onPlayer2Update={setPlayer2}
          onRoomComplete={handleRoomComplete}
          onGameOver={handleGameOver}
          onQuitToMenu={handleQuitToMenu}
        />
      )}
      
      {gameState === 'upgrade' && (
        <UpgradeSelection
          options={upgradeOptions}
          onSelect={handleUpgradeSelect}
          onReroll={handleReroll}
          roomNumber={currentRoomNumber}
          coins={totalCoins}
          canReroll={true}
        />
      )}
      
      {gameState === 'downgrade' && (
        <DowngradeSelection
          activeUpgrades={reverseActiveUpgrades}
          onSelect={handleDowngradeSelect}
          roomNumber={currentRoomNumber}
        />
      )}
      
      {gameState === 'victory' && (
        <VictoryScreen 
          onRestart={handleRestart}
          onContinueEndless={handleContinueEndless}
          onOpenShop={openShop}
          totalCoins={totalCoins}
        />
      )}
      
      {gameState === 'gameover' && (
        <GameOver 
          onRestart={handleRestart}
          onOpenShop={openShop}
          roomNumber={currentRoomNumber}
          totalCoins={totalCoins}
        />
      )}
      
      <Toaster />
    </div>
  );
}

export default App;