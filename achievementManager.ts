import { Achievement, GameStats, Player } from '../types/game';
import { ACHIEVEMENTS } from '../data/achievements';
import { toast } from 'sonner@2.0.3';

class AchievementManager {
  private unlockedAchievements: Set<string> = new Set();
  private listeners: ((achievement: Achievement) => void)[] = [];
  private stats: GameStats = {
    roomsCleared: 0,
    enemiesKilled: 0,
    bossesDefeated: 0,
    coinsEarned: 0,
    hasWonOnce: false
  };
  private weaponsUsed: Set<string> = new Set();
  private lootBoxesOpened: number = 0;
  private rerollCount: number = 0;
  private localCoopGamesPlayed: number = 0;
  private roomsWithoutDamage: number = 0;
  private gameStartTime: number = 0;
  private usedController: boolean = false;
  private cosmeticsUnlocked: number = 0;

  constructor() {
    this.loadFromLocalStorage();
  }

  private loadFromLocalStorage() {
    const saved = localStorage.getItem('milkHeistAchievements');
    if (saved) {
      this.unlockedAchievements = new Set(JSON.parse(saved));
    }

    const savedStats = localStorage.getItem('milkHeistStats');
    if (savedStats) {
      this.stats = JSON.parse(savedStats);
    }

    const savedWeapons = localStorage.getItem('milkHeistWeaponsUsed');
    if (savedWeapons) {
      this.weaponsUsed = new Set(JSON.parse(savedWeapons));
    }

    const savedProgress = localStorage.getItem('milkHeistProgress');
    if (savedProgress) {
      const progress = JSON.parse(savedProgress);
      this.rerollCount = progress.rerollCount || 0;
      this.localCoopGamesPlayed = progress.localCoopGamesPlayed || 0;
      this.lootBoxesOpened = progress.lootBoxesOpened || 0;
      this.roomsWithoutDamage = progress.roomsWithoutDamage || 0;
      this.usedController = progress.usedController || false;
      this.cosmeticsUnlocked = progress.cosmeticsUnlocked || 0;
    }
  }

  private saveToLocalStorage() {
    localStorage.setItem('milkHeistAchievements', JSON.stringify(Array.from(this.unlockedAchievements)));
    localStorage.setItem('milkHeistStats', JSON.stringify(this.stats));
    localStorage.setItem('milkHeistWeaponsUsed', JSON.stringify(Array.from(this.weaponsUsed)));
    localStorage.setItem('milkHeistProgress', JSON.stringify({
      rerollCount: this.rerollCount,
      localCoopGamesPlayed: this.localCoopGamesPlayed,
      lootBoxesOpened: this.lootBoxesOpened,
      roomsWithoutDamage: this.roomsWithoutDamage,
      usedController: this.usedController,
      cosmeticsUnlocked: this.cosmeticsUnlocked
    }));
  }

  public setUnlockedAchievements(achievements: string[]) {
    this.unlockedAchievements = new Set(achievements);
  }

  public setStats(stats: GameStats) {
    this.stats = stats;
  }

  public onAchievementUnlocked(callback: (achievement: Achievement) => void) {
    this.listeners.push(callback);
  }

  private unlockAchievement(achievementId: string) {
    if (this.unlockedAchievements.has(achievementId)) return;

    const achievement = ACHIEVEMENTS.find(a => a.id === achievementId);
    if (!achievement) return;

    this.unlockedAchievements.add(achievementId);
    this.saveToLocalStorage();

    toast.success(`🏆 Achievement Unlocked: ${achievement.name}`, {
      description: achievement.description,
      duration: 5000,
    });

    this.listeners.forEach(listener => listener(achievement));
  }

  public checkAchievements() {
    // Kill achievements
    if (this.stats.enemiesKilled >= 1) this.unlockAchievement('first-blood');
    if (this.stats.enemiesKilled >= 100) this.unlockAchievement('mass-murderer');
    if (this.stats.enemiesKilled >= 500) this.unlockAchievement('genocide');
    if (this.stats.enemiesKilled >= 1000) this.unlockAchievement('death-incarnate');

    // Boss achievements
    if (this.stats.bossesDefeated >= 1) this.unlockAchievement('boss-slayer');
    if (this.stats.bossesDefeated >= 10) this.unlockAchievement('boss-master');
    if (this.stats.bossesDefeated >= 25) this.unlockAchievement('boss-legend');

    // Room achievements
    if (this.stats.roomsCleared >= 10) this.unlockAchievement('explorer');
    if (this.stats.roomsCleared >= 50) this.unlockAchievement('adventurer');
    if (this.stats.roomsCleared >= 100) this.unlockAchievement('dungeon-master');
    if (this.stats.roomsCleared >= 250) this.unlockAchievement('endless-wanderer');

    // Coin achievements
    if (this.stats.coinsEarned >= 100) this.unlockAchievement('penny-pincher');
    if (this.stats.coinsEarned >= 500) this.unlockAchievement('treasure-hunter');
    if (this.stats.coinsEarned >= 1000) this.unlockAchievement('rich-beyond-dreams');
    if (this.stats.coinsEarned >= 5000) this.unlockAchievement('coin-hoarder');

    // Weapon achievements
    if (this.weaponsUsed.size >= 5) this.unlockAchievement('weapon-novice');
    if (this.weaponsUsed.size >= 15) this.unlockAchievement('weapon-expert');
    if (this.weaponsUsed.size >= 27) this.unlockAchievement('arsenal-master');

    // Loot box achievement
    if (this.lootBoxesOpened >= 10) this.unlockAchievement('lucky-gambler');

    // Reroll achievement
    if (this.rerollCount >= 25) this.unlockAchievement('reroll-addict');

    // Local co-op achievements
    if (this.localCoopGamesPlayed >= 10) this.unlockAchievement('team-player');

    // Untouchable achievement
    if (this.roomsWithoutDamage >= 5) this.unlockAchievement('untouchable');

    // Controller achievement
    if (this.usedController) this.unlockAchievement('controller-pro');
    
    // Platinum achievement (all other achievements unlocked)
    const allAchievements = ACHIEVEMENTS.filter(a => a.id !== 'plat');
    const unlockedCount = allAchievements.filter(a => this.unlockedAchievements.has(a.id)).length;
    if (unlockedCount === allAchievements.length) {
      this.unlockAchievement('plat');
    }
  }

  public onEnemyKilled(isBoss: boolean = false) {
    this.stats.enemiesKilled++;
    if (isBoss) {
      this.stats.bossesDefeated++;
    }
    this.saveToLocalStorage();
    this.checkAchievements();
  }

  public onRoomCleared() {
    this.stats.roomsCleared++;
    this.saveToLocalStorage();
    this.checkAchievements();
  }

  public onCoinsEarned(amount: number) {
    this.stats.coinsEarned += amount;
    this.saveToLocalStorage();
    this.checkAchievements();
  }

  public onWeaponUsed(weaponId: string) {
    this.weaponsUsed.add(weaponId);
    this.saveToLocalStorage();
    this.checkAchievements();
  }

  public onCosmeticUnlocked(count: number) {
    this.cosmeticsUnlocked = count;
    this.saveToLocalStorage();
    if (count >= 5) this.unlockAchievement('fashionista');
    if (count >= 15) this.unlockAchievement('style-icon');
    if (count >= 30) this.unlockAchievement('collector');
  }

  public onLootBoxOpened() {
    this.lootBoxesOpened++;
    this.checkAchievements();
  }

  public onReroll() {
    this.rerollCount++;
    this.checkAchievements();
  }

  public onGameComplete(difficulty: string, isReverse: boolean = false, isLocalCoop: boolean = false) {
    this.stats.hasWonOnce = true;
    this.unlockAchievement('milk-retrieved');
    
    if (difficulty === 'easy') this.unlockAchievement('easy-victory');
    if (difficulty === 'normal') this.unlockAchievement('normal-victory');
    if (difficulty === 'hard') this.unlockAchievement('hard-victory');
    if (difficulty === 'milk') this.unlockAchievement('milk-victory');

    // Reverse mode achievement
    if (isReverse) {
      this.unlockAchievement('reverse-mode');
    }

    // Local co-op achievement
    if (isLocalCoop) {
      this.unlockAchievement('local-coop-master');
    }

    // Check for speedrun
    if (this.gameStartTime > 0) {
      const timeElapsed = Date.now() - this.gameStartTime;
      const minutes = timeElapsed / 1000 / 60;
      if (minutes < 15) {
        this.unlockAchievement('speedrunner');
      }
    }
    
    this.checkAchievements();
  }

  public onGameStart() {
    this.gameStartTime = Date.now();
    this.roomsWithoutDamage = 0; // Reset at start of each game
    this.saveToLocalStorage();
    console.log('Game started - reset rooms without damage counter');
  }

  public onPlayerDamaged() {
    if (this.roomsWithoutDamage > 0) {
      console.log(`Took damage! Resetting rooms without damage from ${this.roomsWithoutDamage} to 0`);
    }
    this.roomsWithoutDamage = 0;
    this.saveToLocalStorage();
  }

  public onRoomClearedNoDamage() {
    this.roomsWithoutDamage++;
    this.saveToLocalStorage();
    console.log(`Rooms without damage: ${this.roomsWithoutDamage}/5`);
    this.checkAchievements();
  }

  public onPlayerStats(player: Player) {
    // Tank achievement
    if (player.maxHealth >= 200) {
      this.unlockAchievement('tank');
    }

    // Glass cannon achievement
    if (player.damage >= 50) {
      this.unlockAchievement('glass-cannon');
    }
  }

  public onLocalCoopGameStart() {
    this.localCoopGamesPlayed++;
    this.checkAchievements();
  }

  public setUsedController(used: boolean) {
    this.usedController = used;
    this.checkAchievements();
  }

  public getAchievements(): Achievement[] {
    return ACHIEVEMENTS.map(achievement => ({
      ...achievement,
      unlocked: this.unlockedAchievements.has(achievement.id)
    }));
  }

  public getStats(): GameStats {
    return { ...this.stats };
  }

  public getProgress(achievementId: string): { current: number; required: number } | null {
    const achievement = ACHIEVEMENTS.find(a => a.id === achievementId);
    if (!achievement) return null;

    const req = achievement.requirement;
    
    switch (req.type) {
      case 'kills':
        return { current: this.stats.enemiesKilled, required: req.value as number };
      case 'bosses':
        return { current: this.stats.bossesDefeated, required: req.value as number };
      case 'rooms':
        return { current: this.stats.roomsCleared, required: req.value as number };
      case 'coins':
        return { current: this.stats.coinsEarned, required: req.value as number };
      case 'weapon':
        return { current: this.weaponsUsed.size, required: req.value as number };
      case 'cosmetic':
        return { current: this.cosmeticsUnlocked, required: req.value as number };
      case 'special':
        if (req.value === 'reroll-25') {
          return { current: this.rerollCount, required: 25 };
        }
        if (req.value === 'local-coop-10') {
          return { current: this.localCoopGamesPlayed, required: 10 };
        }
        if (req.value === 'untouchable') {
          return { current: this.roomsWithoutDamage, required: 5 };
        }
        return null;
      default:
        return null;
    }
  }

  public getWeaponsUsed(): string[] {
    return Array.from(this.weaponsUsed);
  }

  public getRemainingCount(): number {
    const allAchievements = ACHIEVEMENTS.filter(a => a.id !== 'plat');
    return allAchievements.length - this.unlockedAchievements.size;
  }

  public reset() {
    this.unlockedAchievements.clear();
    this.stats = {
      roomsCleared: 0,
      enemiesKilled: 0,
      bossesDefeated: 0,
      coinsEarned: 0,
      hasWonOnce: false
    };
    this.weaponsUsed.clear();
    this.saveToLocalStorage();
  }
}

export const achievementManager = new AchievementManager();
