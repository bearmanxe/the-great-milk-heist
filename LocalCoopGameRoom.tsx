import { useEffect, useRef, useState } from 'react';
import { Player, Enemy, Room, Weapon, Projectile, Particle, Difficulty, EnemyType } from '../types/game';
import { motion } from 'motion/react';
import { Heart, Shield, Zap, Sword, Skull, Crosshair, Coins, LogOut } from 'lucide-react';
import { soundManager } from '../utils/soundManager';
import { Button } from './ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';

interface LocalCoopGameRoomProps {
  player1: Player;
  player2: Player;
  room: Room;
  weapon1: Weapon;
  weapon2: Weapon;
  difficulty: Difficulty;
  onPlayer1Update: (player: Player) => void;
  onPlayer2Update: (player: Player) => void;
  onRoomComplete: (coinsEarned: number) => void;
  onGameOver: (coinsEarned: number) => void;
  onQuitToMenu?: () => void;
}

const INVINCIBILITY_TIME = 250; // 0.25 seconds in milliseconds

const ARENA_WIDTH = 800;
const ARENA_HEIGHT = 600;
const PLAYER_SIZE = 40;

export function LocalCoopGameRoom({ 
  player1, 
  player2, 
  room, 
  weapon1, 
  weapon2, 
  difficulty, 
  onPlayer1Update, 
  onPlayer2Update, 
  onRoomComplete, 
  onGameOver,
  onQuitToMenu
}: LocalCoopGameRoomProps) {
  // Difficulty-based coin rewards
  const difficultyCoins = {
    easy: { enemy: 2, boss: 8, room: 3 },
    normal: { enemy: 5, boss: 15, room: 5 },
    hard: { enemy: 7, boss: 20, room: 7 },
    milk: { enemy: 10, boss: 30, room: 10 }
  };
  
  const COINS_PER_ENEMY = difficultyCoins[difficulty].enemy;
  const COINS_PER_BOSS = difficultyCoins[difficulty].boss;
  const COINS_PER_ROOM = difficultyCoins[difficulty].room;
  
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [projectiles, setProjectiles] = useState<Projectile[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [coinsEarned, setCoinsEarned] = useState(0);
  const [showQuitDialog, setShowQuitDialog] = useState(false);
  
  const keysPressed = useRef<Set<string>>(new Set());
  const gameLoopRef = useRef<number>();
  const canvasRef = useRef<HTMLDivElement>(null);
  const lastAttackTime1Ref = useRef(0);
  const lastAttackTime2Ref = useRef(0);
  const player1Ref = useRef(player1);
  const player2Ref = useRef(player2);
  const weapon1Ref = useRef(weapon1);
  const weapon2Ref = useRef(weapon2);
  const obstaclesRef = useRef(room.obstacles);
  const lastRegenTime1Ref = useRef(Date.now());
  const lastRegenTime2Ref = useRef(Date.now());
  const lastPoisonTickRef = useRef(Date.now());
  const isGameOverRef = useRef(false);
  const pendingProjectilesRef = useRef<Projectile[]>([]);
  const pendingParticlesRef = useRef<Particle[]>([]);
  const pendingCoinsRef = useRef<number>(0);
  const pendingPlayer1UpdateRef = useRef<Player | null>(null);
  const pendingPlayer2UpdateRef = useRef<Player | null>(null);
  const projectilesToRemoveRef = useRef<Set<string>>(new Set());
  const projectileIdCounterRef = useRef<number>(0);
  const enemyIdCounterRef = useRef<number>(0);
  const particleIdCounterRef = useRef<number>(0);
  const projectilesRef = useRef<Projectile[]>([]);
  const lifestealHealing1Ref = useRef<number>(0);
  const lifestealHealing2Ref = useRef<number>(0);
  const enemiesToSpawnRef = useRef<Enemy[]>(room.enemies);
  const spawnIndexRef = useRef<number>(0);
  const allEnemiesSpawnedRef = useRef<boolean>(false);
  const tookDamageThisRoomRef = useRef<boolean>(false);
  const roomCompletedRef = useRef<boolean>(false);
  const hadEnemiesRef = useRef<boolean>(false); // Track if we've had enemies alive

  // Keep refs updated
  useEffect(() => {
    player1Ref.current = player1;
  }, [player1]);
  
  useEffect(() => {
    player2Ref.current = player2;
  }, [player2]);
  
  useEffect(() => {
    projectilesRef.current = projectiles;
  }, [projectiles]);

  useEffect(() => {
    weapon1Ref.current = weapon1;
  }, [weapon1]);
  
  useEffect(() => {
    weapon2Ref.current = weapon2;
  }, [weapon2]);

  useEffect(() => {
    // Start appropriate music
    if (room.isBoss) {
      soundManager.playBossMusic();
    } else if (room.number === 1 || room.number === 16) {
      soundManager.playBackgroundMusic();
    }

    return () => {
      if (room.number === 15) {
        soundManager.stopBackgroundMusic();
      }
    };
  }, [room.isBoss, room.number]);

  // Gradual enemy spawn system
  useEffect(() => {
    enemiesToSpawnRef.current = room.enemies;
    spawnIndexRef.current = 0;
    allEnemiesSpawnedRef.current = false; // Reset spawn flag
    tookDamageThisRoomRef.current = false; // Reset damage tracking
    roomCompletedRef.current = false; // Reset room completion flag
    hadEnemiesRef.current = false; // Reset had enemies flag
    setEnemies([]); // Reset enemies when room changes

    const spawnInterval = setInterval(() => {
      if (spawnIndexRef.current < enemiesToSpawnRef.current.length) {
        const enemyToSpawn = enemiesToSpawnRef.current[spawnIndexRef.current];
        
        setEnemies(prev => [...prev, enemyToSpawn]);
        
        // Create spawn particles
        const spawnParticles: Particle[] = [];
        for (let i = 0; i < 12; i++) {
          const angle = (Math.PI * 2 * i) / 12;
          const speed = 2 + Math.random() * 2;
          spawnParticles.push({
            id: `spawn-particle-${Date.now()}-${i}`,
            x: enemyToSpawn.x,
            y: enemyToSpawn.y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 30,
            maxLife: 30,
            color: enemyToSpawn.color,
            size: 6,
          });
        }
        setParticles(prev => [...prev, ...spawnParticles]);
        
        soundManager.playHitSound(); // Small sound effect for spawn
        spawnIndexRef.current++;
      } else {
        allEnemiesSpawnedRef.current = true; // Mark all enemies as spawned
        clearInterval(spawnInterval);
      }
    }, 350); // Spawn a new enemy every 350ms

    return () => clearInterval(spawnInterval);
  }, [room.number]); // Re-run when room changes

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) {
        e.preventDefault();
        keysPressed.current.add(key);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      keysPressed.current.delete(key);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const checkCircleRectCollision = (
    circleX: number,
    circleY: number,
    circleRadius: number,
    rectX: number,
    rectY: number,
    rectWidth: number,
    rectHeight: number
  ): boolean => {
    const rectLeft = rectX - rectWidth / 2;
    const rectRight = rectX + rectWidth / 2;
    const rectTop = rectY - rectHeight / 2;
    const rectBottom = rectY + rectHeight / 2;

    const closestX = Math.max(rectLeft, Math.min(circleX, rectRight));
    const closestY = Math.max(rectTop, Math.min(circleY, rectBottom));

    const distanceX = circleX - closestX;
    const distanceY = circleY - closestY;

    return (distanceX * distanceX + distanceY * distanceY) < (circleRadius * circleRadius);
  };

  const isPositionBlocked = (x: number, y: number, size: number, canPassThrough: boolean = false): boolean => {
    if (canPassThrough) return false;
    
    for (const obstacle of obstaclesRef.current) {
      if (checkCircleRectCollision(x, y, size / 2, obstacle.x, obstacle.y, obstacle.width, obstacle.height)) {
        return true;
      }
    }
    return false;
  };

  const getValidPosition = (
    currentX: number,
    currentY: number,
    targetX: number,
    targetY: number,
    size: number,
    canPassThrough: boolean = false
  ): { x: number; y: number } => {
    if (!isPositionBlocked(targetX, targetY, size, canPassThrough)) {
      return { x: targetX, y: targetY };
    }

    if (!isPositionBlocked(targetX, currentY, size, canPassThrough)) {
      return { x: targetX, y: currentY };
    }

    if (!isPositionBlocked(currentX, targetY, size, canPassThrough)) {
      return { x: currentX, y: targetY };
    }

    return { x: currentX, y: currentY };
  };

  const createBloodParticles = (x: number, y: number, count: number = 8) => {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
      const speed = 2 + Math.random() * 3;
      pendingParticlesRef.current.push({
        id: `particle_${++particleIdCounterRef.current}`,
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 30,
        maxLife: 30,
        color: '#DC143C',
        size: 3 + Math.random() * 3
      });
    }
  };

  const getCosmeticBonuses = (player: Player) => {
    let playerSpeed = player.speed;
    let playerDamage = player.damage;
    let playerDefense = player.defense;
    let playerLifesteal = player.lifesteal;
    let playerMaxHealth = player.maxHealth;
    let multishot = 1;
    let thorns = 0;
    let regenRate = 0;

    if (player.cosmeticAbility) {
      const ability = player.cosmeticAbility;
      switch (ability.type) {
        case 'speed':
          playerSpeed += ability.value;
          break;
        case 'damage':
          playerDamage += ability.value;
          break;
        case 'defense':
          playerDefense += ability.value;
          break;
        case 'lifesteal':
          playerLifesteal += ability.value;
          break;
        case 'health':
          playerMaxHealth += ability.value;
          break;
        case 'multishot':
          multishot = ability.value;
          break;
        case 'thorns':
          thorns = ability.value;
          break;
        case 'regen':
          regenRate = ability.value;
          break;
        case 'ultimate':
          // Platinum Champion: Ultimate power
          playerDamage += 50;
          playerMaxHealth += 100;
          playerDefense += 5;
          playerSpeed += 5;
          multishot = 5;
          playerLifesteal += 25;
          regenRate = 5;
          thorns = 100;
          break;
      }
    }

    return { playerSpeed, playerDamage, playerDefense, playerLifesteal, playerMaxHealth, multishot, thorns, regenRate };
  };

  useEffect(() => {
    const gameLoop = () => {
      // Skip game loop if game is over
      if (isGameOverRef.current) return;
      
      const now = Date.now();
      const currentPlayer1 = player1Ref.current;
      const currentPlayer2 = player2Ref.current;
      const currentWeapon1 = weapon1Ref.current;
      const currentWeapon2 = weapon2Ref.current;
      
      // Reset lifesteal healing refs at start of game loop
      lifestealHealing1Ref.current = 0;
      lifestealHealing2Ref.current = 0;
      
      // Track all player updates to batch them
      let pendingHealth1Change = 0;
      let pendingHealth2Change = 0;
      let shouldUpdatePlayer1 = false;
      let shouldUpdatePlayer2 = false;
      let newAccumulatedDamage1 = currentPlayer1.accumulatedDamage || 0;
      let newAccumulatedDamage2 = currentPlayer2.accumulatedDamage || 0;
      
      // Apply cosmetic ability bonuses for both players
      const player1Bonuses = getCosmeticBonuses(currentPlayer1);
      const player2Bonuses = getCosmeticBonuses(currentPlayer2);

      // Handle regeneration for player 1
      if (player1Bonuses.regenRate > 0 && now - lastRegenTime1Ref.current > 1000) {
        lastRegenTime1Ref.current = now;
        pendingHealth1Change += player1Bonuses.regenRate;
        shouldUpdatePlayer1 = true;
      }
      
      // Handle regeneration for player 2
      if (player2Bonuses.regenRate > 0 && now - lastRegenTime2Ref.current > 1000) {
        lastRegenTime2Ref.current = now;
        pendingHealth2Change += player2Bonuses.regenRate;
        shouldUpdatePlayer2 = true;
      }
      
      // Handle player auto-attacks (outside of setState)
      setEnemies(currentEnemies => {
        if (currentEnemies.length > 0) {
          // Player 1 attack (only if alive)
          if (currentPlayer1.health > 0) {
            const timeSinceLastAttack1 = now - lastAttackTime1Ref.current;
            const attackCooldown1 = 1000 / currentWeapon1.attackSpeed;

            if (timeSinceLastAttack1 >= attackCooldown1) {
            let closestEnemy: Enemy | null = null;
            let closestDistance = Infinity;

            currentEnemies.forEach(enemy => {
              const dx = enemy.x - currentPlayer1.x;
              const dy = enemy.y - currentPlayer1.y;
              const distance = Math.sqrt(dx * dx + dy * dy);

              if (distance < closestDistance) {
                closestDistance = distance;
                closestEnemy = enemy;
              }
            });

            if (closestEnemy && closestDistance > 0) {
              // Fire projectiles (multishot support)
              for (let i = 0; i < player1Bonuses.multishot; i++) {
                const dx = closestEnemy.x - currentPlayer1.x;
                const dy = closestEnemy.y - currentPlayer1.y;

                // Add spread for multishot
                let angle = Math.atan2(dy, dx);
                if (player1Bonuses.multishot > 1) {
                  const spreadAngle = 0.3;
                  angle += (i - (player1Bonuses.multishot - 1) / 2) * spreadAngle / player1Bonuses.multishot;
                }

                const speed = 8;
                const vx = Math.cos(angle) * speed;
                const vy = Math.sin(angle) * speed;

                const projectile: Projectile = {
                  id: `proj_p1_${++projectileIdCounterRef.current}`,
                  x: currentPlayer1.x,
                  y: currentPlayer1.y,
                  vx,
                  vy,
                  damage: currentWeapon1.damage + player1Bonuses.playerDamage,
                  size: 12,
                  color: currentWeapon1.color,
                  emoji: currentWeapon1.emoji,
                  isEnemyProjectile: false,
                  piercedEnemies: 0,
                  knockback: currentWeapon1.knockback
                };

                pendingProjectilesRef.current.push(projectile);
              }
              lastAttackTime1Ref.current = now;
              soundManager.playAttackSound();
            }
          }
          }
          
          // Player 2 attack (only if alive)
          if (currentPlayer2.health > 0) {
            const timeSinceLastAttack2 = now - lastAttackTime2Ref.current;
            const attackCooldown2 = 1000 / currentWeapon2.attackSpeed;

            if (timeSinceLastAttack2 >= attackCooldown2) {
            let closestEnemy: Enemy | null = null;
            let closestDistance = Infinity;

            currentEnemies.forEach(enemy => {
              const dx = enemy.x - currentPlayer2.x;
              const dy = enemy.y - currentPlayer2.y;
              const distance = Math.sqrt(dx * dx + dy * dy);

              if (distance < closestDistance) {
                closestDistance = distance;
                closestEnemy = enemy;
              }
            });

            if (closestEnemy && closestDistance > 0) {
              // Fire projectiles (multishot support)
              for (let i = 0; i < player2Bonuses.multishot; i++) {
                const dx = closestEnemy.x - currentPlayer2.x;
                const dy = closestEnemy.y - currentPlayer2.y;

                // Add spread for multishot
                let angle = Math.atan2(dy, dx);
                if (player2Bonuses.multishot > 1) {
                  const spreadAngle = 0.3;
                  angle += (i - (player2Bonuses.multishot - 1) / 2) * spreadAngle / player2Bonuses.multishot;
                }

                const speed = 8;
                const vx = Math.cos(angle) * speed;
                const vy = Math.sin(angle) * speed;

                const projectile: Projectile = {
                  id: `proj_p2_${++projectileIdCounterRef.current}`,
                  x: currentPlayer2.x,
                  y: currentPlayer2.y,
                  vx,
                  vy,
                  damage: currentWeapon2.damage + player2Bonuses.playerDamage,
                  size: 12,
                  color: currentWeapon2.color,
                  emoji: currentWeapon2.emoji,
                  isEnemyProjectile: false,
                  piercedEnemies: 0,
                  knockback: currentWeapon2.knockback
                };

                pendingProjectilesRef.current.push(projectile);
              }
              lastAttackTime2Ref.current = now;
              soundManager.playAttackSound();
            }
          }
          }
        }

        // Enemy ranged attacks - target closest ALIVE player
        currentEnemies.forEach(enemy => {
          if (enemy.canShoot && enemy.type === 'ranged') {
            const enemyShootCooldown = 2000;
            const timeSinceLastShot = now - (enemy.lastShotTime || 0);
            
            if (timeSinceLastShot >= enemyShootCooldown) {
              enemy.lastShotTime = now;
              
              // Find closest ALIVE player
              const player1Alive = currentPlayer1.health > 0;
              const player2Alive = currentPlayer2.health > 0;
              
              let targetPlayer = null;
              
              if (!player1Alive && !player2Alive) {
                return; // No alive players to shoot
              } else if (player1Alive && !player2Alive) {
                targetPlayer = currentPlayer1;
              } else if (!player1Alive && player2Alive) {
                targetPlayer = currentPlayer2;
              } else {
                // Both alive, shoot closest one
                const dist1 = Math.sqrt(
                  Math.pow(currentPlayer1.x - enemy.x, 2) + 
                  Math.pow(currentPlayer1.y - enemy.y, 2)
                );
                const dist2 = Math.sqrt(
                  Math.pow(currentPlayer2.x - enemy.x, 2) + 
                  Math.pow(currentPlayer2.y - enemy.y, 2)
                );
                targetPlayer = dist1 < dist2 ? currentPlayer1 : currentPlayer2;
              }
              
              if (targetPlayer) {
                const dx = targetPlayer.x - enemy.x;
                const dy = targetPlayer.y - enemy.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance > 0) {
                const speed = 5;
                const vx = (dx / distance) * speed;
                const vy = (dy / distance) * speed;

                const enemyProjectile: Projectile = {
                  id: `eproj_${++projectileIdCounterRef.current}`,
                  x: enemy.x,
                  y: enemy.y,
                  vx,
                  vy,
                  damage: enemy.damage * 0.5,
                  size: 10,
                  color: '#FF4500',
                  emoji: '🔴',
                  isEnemyProjectile: true
                };

                  pendingProjectilesRef.current.push(enemyProjectile);
                }
              }
            }
          }
          
          // Mutant obstacle throwing - target closest ALIVE player
          if (enemy.canThrowObstacles && enemy.type === 'mutant') {
            const throwCooldown = 3000;
            const timeSinceLastThrow = now - (enemy.lastObstacleThrowTime || 0);
            
            if (timeSinceLastThrow >= throwCooldown) {
              enemy.lastObstacleThrowTime = now;
              
              // Find closest ALIVE player
              const player1Alive = currentPlayer1.health > 0;
              const player2Alive = currentPlayer2.health > 0;
              
              let targetPlayer = null;
              
              if (!player1Alive && !player2Alive) {
                return; // No alive players to throw at
              } else if (player1Alive && !player2Alive) {
                targetPlayer = currentPlayer1;
              } else if (!player1Alive && player2Alive) {
                targetPlayer = currentPlayer2;
              } else {
                // Both alive, throw at closest one
                const dist1 = Math.sqrt(
                  Math.pow(currentPlayer1.x - enemy.x, 2) + 
                  Math.pow(currentPlayer1.y - enemy.y, 2)
                );
                const dist2 = Math.sqrt(
                  Math.pow(currentPlayer2.x - enemy.x, 2) + 
                  Math.pow(currentPlayer2.y - enemy.y, 2)
                );
                targetPlayer = dist1 < dist2 ? currentPlayer1 : currentPlayer2;
              }
              
              if (targetPlayer) {
                const dx = targetPlayer.x - enemy.x;
                const dy = targetPlayer.y - enemy.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance > 0) {
                const speed = 6;
                const vx = (dx / distance) * speed;
                const vy = (dy / distance) * speed;

                const obstacleProjectile: Projectile = {
                  id: `obproj_${++projectileIdCounterRef.current}`,
                  x: enemy.x,
                  y: enemy.y,
                  vx,
                  vy,
                  damage: enemy.damage * 0.8,
                  size: 20,
                  color: '#8B4513',
                  emoji: '🪨',
                  isEnemyProjectile: true
                };

                  pendingProjectilesRef.current.push(obstacleProjectile);
                  soundManager.playAttackSound();
                }
              }
            }
          }
        });
        
        // Boss enemy summoning
        let updatedEnemiesWithBoss = currentEnemies;
        const bossEnemy = currentEnemies.find(e => e.isBoss);
        if (bossEnemy) {
          const summonCooldown = 8000; // Summon every 8 seconds
          const timeSinceLastSummon = now - (bossEnemy.lastSummonTime || 0);
          
          if (timeSinceLastSummon >= summonCooldown) {
            // Update boss's lastSummonTime
            updatedEnemiesWithBoss = currentEnemies.map(e => 
              e.isBoss ? { ...e, lastSummonTime: now } : e
            );
            
            // Spawn 1-2 minions near the boss
            const summonCount = Math.floor(Math.random() * 2) + 1;
            const newMinions: Enemy[] = [];
            
            for (let i = 0; i < summonCount; i++) {
              // Try multiple times to find a valid spawn position
              let spawnX = 0;
              let spawnY = 0;
              let validPosition = false;
              
              for (let attempt = 0; attempt < 20; attempt++) {
                const angle = Math.random() * Math.PI * 2;
                const distance = 80 + Math.random() * 40;
                const testX = Math.max(20, Math.min(ARENA_WIDTH - 20, bossEnemy.x + Math.cos(angle) * distance));
                const testY = Math.max(20, Math.min(ARENA_HEIGHT - 20, bossEnemy.y + Math.sin(angle) * distance));
                
                // Check if position overlaps with any obstacle
                let overlapsObstacle = false;
                const minionSize = 40; // Default size, will adjust based on type
                
                for (const obstacle of room.obstacles) {
                  const dx = Math.abs(testX - obstacle.x);
                  const dy = Math.abs(testY - obstacle.y);
                  const minDistX = (minionSize + obstacle.width) / 2;
                  const minDistY = (minionSize + obstacle.height) / 2;
                  
                  if (dx < minDistX && dy < minDistY) {
                    overlapsObstacle = true;
                    break;
                  }
                }
                
                if (!overlapsObstacle) {
                  spawnX = testX;
                  spawnY = testY;
                  validPosition = true;
                  break;
                }
              }
              
              // If we couldn't find a valid position after 20 attempts, skip this minion
              if (!validPosition) continue;
              
              // Create a random enemy type
              const minionTypes: EnemyType[] = ['normal', 'shortie', 'brute', 'ranged'];
              const minionType = minionTypes[Math.floor(Math.random() * minionTypes.length)];
              
              const minion: Enemy = {
                id: `minion_${++enemyIdCounterRef.current}`,
                x: spawnX,
                y: spawnY,
                health: 40,
                maxHealth: 40,
                damage: 10,
                speed: 2,
                color: minionType === 'brute' ? '#8b5cf6' : minionType === 'shortie' ? '#06b6d4' : minionType === 'ranged' ? '#f97316' : '#ef4444',
                size: minionType === 'brute' ? 52 : minionType === 'shortie' ? 28 : 40,
                type: minionType,
                canShoot: minionType === 'ranged',
                canPassThroughObstacles: false,
                canThrowObstacles: false,
                poisonDamage: 0,
                lifestealPercent: 0,
                lastShotTime: 0,
                lastObstacleThrowTime: 0
              };
              
              newMinions.push(minion);
            }
            
            // Add summoned minions to the enemies list
            if (newMinions.length > 0) {
              updatedEnemiesWithBoss = [...updatedEnemiesWithBoss, ...newMinions];
              soundManager.playAttackSound();
            }
          }
        }

        // Return enemies with boss summoning handled
        return updatedEnemiesWithBoss;
      });

      // Move both players
      let newX1 = currentPlayer1.x;
      let newY1 = currentPlayer1.y;
      let newX2 = currentPlayer2.x;
      let newY2 = currentPlayer2.y;

      // Check if players are confused (inverted controls)
      const isConfused1 = currentPlayer1.confusedUntil && now < currentPlayer1.confusedUntil;
      const isConfused2 = currentPlayer2.confusedUntil && now < currentPlayer2.confusedUntil;
      const directionMultiplier1 = isConfused1 ? -1 : 1;
      const directionMultiplier2 = isConfused2 ? -1 : 1;

      // Player 1 movement (WASD) - only if alive
      if (currentPlayer1.health > 0) {
        if (keysPressed.current.has('w')) {
          newY1 = Math.max(PLAYER_SIZE / 2, Math.min(ARENA_HEIGHT - PLAYER_SIZE / 2, currentPlayer1.y - player1Bonuses.playerSpeed * directionMultiplier1));
        }
        if (keysPressed.current.has('s')) {
          newY1 = Math.max(PLAYER_SIZE / 2, Math.min(ARENA_HEIGHT - PLAYER_SIZE / 2, currentPlayer1.y + player1Bonuses.playerSpeed * directionMultiplier1));
        }
        if (keysPressed.current.has('a')) {
          newX1 = Math.max(PLAYER_SIZE / 2, Math.min(ARENA_WIDTH - PLAYER_SIZE / 2, currentPlayer1.x - player1Bonuses.playerSpeed * directionMultiplier1));
        }
        if (keysPressed.current.has('d')) {
          newX1 = Math.max(PLAYER_SIZE / 2, Math.min(ARENA_WIDTH - PLAYER_SIZE / 2, currentPlayer1.x + player1Bonuses.playerSpeed * directionMultiplier1));
        }
      }

      // Player 2 movement (Arrow Keys) - only if alive
      if (currentPlayer2.health > 0) {
        if (keysPressed.current.has('arrowup')) {
          newY2 = Math.max(PLAYER_SIZE / 2, Math.min(ARENA_HEIGHT - PLAYER_SIZE / 2, currentPlayer2.y - player2Bonuses.playerSpeed * directionMultiplier2));
        }
        if (keysPressed.current.has('arrowdown')) {
          newY2 = Math.max(PLAYER_SIZE / 2, Math.min(ARENA_HEIGHT - PLAYER_SIZE / 2, currentPlayer2.y + player2Bonuses.playerSpeed * directionMultiplier2));
        }
        if (keysPressed.current.has('arrowleft')) {
          newX2 = Math.max(PLAYER_SIZE / 2, Math.min(ARENA_WIDTH - PLAYER_SIZE / 2, currentPlayer2.x - player2Bonuses.playerSpeed * directionMultiplier2));
        }
        if (keysPressed.current.has('arrowright')) {
          newX2 = Math.max(PLAYER_SIZE / 2, Math.min(ARENA_WIDTH - PLAYER_SIZE / 2, currentPlayer2.x + player2Bonuses.playerSpeed * directionMultiplier2));
        }
      }

      // Check player collision with obstacles
      const validPlayer1Pos = getValidPosition(currentPlayer1.x, currentPlayer1.y, newX1, newY1, PLAYER_SIZE, false);
      newX1 = validPlayer1Pos.x;
      newY1 = validPlayer1Pos.y;
      
      const validPlayer2Pos = getValidPosition(currentPlayer2.x, currentPlayer2.y, newX2, newY2, PLAYER_SIZE, false);
      newX2 = validPlayer2Pos.x;
      newY2 = validPlayer2Pos.y;

      // Update particles
      setParticles(prev => {
        return prev
          .map(particle => ({
            ...particle,
            x: particle.x + particle.vx,
            y: particle.y + particle.vy,
            vy: particle.vy + 0.2,
            life: particle.life - 1
          }))
          .filter(particle => particle.life > 0);
      });

      // Update enemies and check collisions - NO NESTED SETSTATE
      setEnemies(prevEnemies => {
        const updatedEnemies = prevEnemies.map((enemy, index) => {
          // Different movement for different enemy types
          let moveSpeed = enemy.speed;
          
          // Find closest ALIVE player to chase
          const player1Alive = currentPlayer1.health > 0;
          const player2Alive = currentPlayer2.health > 0;
          
          let dx = 0;
          let dy = 0;
          let distance = 0;
          
          if (!player1Alive && !player2Alive) {
            // Both players dead, don't move
            return enemy;
          } else if (player1Alive && !player2Alive) {
            // Only player 1 alive, chase them
            dx = newX1 - enemy.x;
            dy = newY1 - enemy.y;
            distance = Math.sqrt(dx * dx + dy * dy);
          } else if (!player1Alive && player2Alive) {
            // Only player 2 alive, chase them
            dx = newX2 - enemy.x;
            dy = newY2 - enemy.y;
            distance = Math.sqrt(dx * dx + dy * dy);
          } else {
            // Both players alive, chase closest one
            const dx1 = newX1 - enemy.x;
            const dy1 = newY1 - enemy.y;
            const distance1 = Math.sqrt(dx1 * dx1 + dy1 * dy1);
            
            const dx2 = newX2 - enemy.x;
            const dy2 = newY2 - enemy.y;
            const distance2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
            
            dx = distance1 < distance2 ? dx1 : dx2;
            dy = distance1 < distance2 ? dy1 : dy2;
            distance = Math.min(distance1, distance2);
          }
          
          if (distance === 0) return enemy;
          
          const moveX = (dx / distance) * moveSpeed;
          const moveY = (dy / distance) * moveSpeed;
          
          let targetX = enemy.x + moveX;
          let targetY = enemy.y + moveY;
          
          // Check collision with other enemies
          for (let i = 0; i < prevEnemies.length; i++) {
            if (i === index) continue;
            
            const other = prevEnemies[i];
            const otherDx = targetX - other.x;
            const otherDy = targetY - other.y;
            const otherDist = Math.sqrt(otherDx * otherDx + otherDy * otherDy);
            const minDist = (enemy.size + other.size) / 2;
            
            if (otherDist < minDist) {
              // Push away from other enemy
              const pushAngle = Math.atan2(otherDy, otherDx);
              targetX = other.x + Math.cos(pushAngle) * minDist;
              targetY = other.y + Math.sin(pushAngle) * minDist;
            }
          }
          
          // Ghosts can pass through obstacles
          const validEnemyPos = getValidPosition(
            enemy.x, 
            enemy.y, 
            targetX, 
            targetY, 
            enemy.size,
            enemy.canPassThroughObstacles || false
          );
          
          return {
            ...enemy,
            x: validEnemyPos.x,
            y: validEnemyPos.y
          };
        });

        // Check enemy-player collisions for both players
        let newHealth1 = currentPlayer1.health;
        let newHealth2 = currentPlayer2.health;
        let thornsDamage1 = 0;
        let thornsDamage2 = 0;
        let newPoisonStacks1 = currentPlayer1.poisonStacks || 0;
        let newPoisonStacks2 = currentPlayer2.poisonStacks || 0;
        let newLastHitTime1 = currentPlayer1.lastHitTime || 0;
        let newLastHitTime2 = currentPlayer2.lastHitTime || 0;

        // Check if players can take damage (not invincible)
        const timeSinceLastPlayer1Hit = now - newLastHitTime1;
        const timeSinceLastPlayer2Hit = now - newLastHitTime2;
        const canTakeDamage1 = timeSinceLastPlayer1Hit >= INVINCIBILITY_TIME;
        const canTakeDamage2 = timeSinceLastPlayer2Hit >= INVINCIBILITY_TIME;

        updatedEnemies.forEach(enemy => {
          // Player 1 collision (only if alive)
          if (currentPlayer1.health > 0) {
            const dx1 = newX1 - enemy.x;
            const dy1 = newY1 - enemy.y;
            const distance1 = Math.sqrt(dx1 * dx1 + dy1 * dy1);
            const collisionDistance = (PLAYER_SIZE + enemy.size) / 2;

            if (distance1 < collisionDistance && canTakeDamage1) {
            const damageReduction = Math.min(player1Bonuses.playerDefense * 0.02, 0.75);
            const damageTaken = Math.max(1, enemy.damage * (1 - damageReduction));
            newHealth1 -= damageTaken;
            newLastHitTime1 = now;
            
            // Track damage for Untouchable achievement
            if (!tookDamageThisRoomRef.current) {
              tookDamageThisRoomRef.current = true;
              import('../utils/achievementManager').then(({ achievementManager }) => {
                achievementManager.onPlayerDamaged();
              });
            }
            
            // Vampire healing
            if (enemy.lifestealPercent && enemy.lifestealPercent > 0) {
              const vampireHeal = damageTaken * (enemy.lifestealPercent / 100);
              enemy.health = Math.min(enemy.maxHealth, enemy.health + vampireHeal);
            }
            
            // Reaper poison
            if (enemy.poisonDamage && enemy.poisonDamage > 0) {
              newPoisonStacks1 = Math.min(10, newPoisonStacks1 + 1);
            }
            
            // Possessed Milk confusion debuff
            if (enemy.confusionDuration && enemy.confusionDuration > 0) {
              pendingPlayer1UpdateRef.current = {
                ...(pendingPlayer1UpdateRef.current || currentPlayer1),
                confusedUntil: now + enemy.confusionDuration
              };
            }
            
            // Thorns damage
            if (player1Bonuses.thorns > 0) {
              const reflectDamage = damageTaken * (player1Bonuses.thorns / 100);
              enemy.health -= reflectDamage;
              thornsDamage1 += reflectDamage;
            }
            
              if (Math.random() < 0.1) {
                createBloodParticles(newX1, newY1, 3);
              }
            }
          }
          
          // Player 2 collision (only if alive)
          if (currentPlayer2.health > 0) {
            const dx2 = newX2 - enemy.x;
            const dy2 = newY2 - enemy.y;
            const distance2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
            const collisionDistance = (PLAYER_SIZE + enemy.size) / 2;

            if (distance2 < collisionDistance && canTakeDamage2) {
            const damageReduction = Math.min(player2Bonuses.playerDefense * 0.02, 0.75);
            const damageTaken = Math.max(1, enemy.damage * (1 - damageReduction));
            newHealth2 -= damageTaken;
            newLastHitTime2 = now;
            
            // Track damage for Untouchable achievement
            if (!tookDamageThisRoomRef.current) {
              tookDamageThisRoomRef.current = true;
              import('../utils/achievementManager').then(({ achievementManager }) => {
                achievementManager.onPlayerDamaged();
              });
            }
            
            // Vampire healing
            if (enemy.lifestealPercent && enemy.lifestealPercent > 0) {
              const vampireHeal = damageTaken * (enemy.lifestealPercent / 100);
              enemy.health = Math.min(enemy.maxHealth, enemy.health + vampireHeal);
            }
            
            // Reaper poison
            if (enemy.poisonDamage && enemy.poisonDamage > 0) {
              newPoisonStacks2 = Math.min(10, newPoisonStacks2 + 1);
            }
            
            // Possessed Milk confusion debuff
            if (enemy.confusionDuration && enemy.confusionDuration > 0) {
              pendingPlayer2UpdateRef.current = {
                ...(pendingPlayer2UpdateRef.current || currentPlayer2),
                confusedUntil: now + enemy.confusionDuration
              };
            }
            
            // Thorns damage
            if (player2Bonuses.thorns > 0) {
              const reflectDamage = damageTaken * (player2Bonuses.thorns / 100);
              enemy.health -= reflectDamage;
              thornsDamage2 += reflectDamage;
            }
            
              if (Math.random() < 0.1) {
                createBloodParticles(newX2, newY2, 3);
              }
            }
          }
        });

        // Apply poison damage over time
        if (newPoisonStacks1 > 0 && now - lastPoisonTickRef.current > 1000) {
          const poisonDamage = newPoisonStacks1 * 0.5;
          pendingHealth1Change -= poisonDamage;
          newAccumulatedDamage1 += poisonDamage;
          shouldUpdatePlayer1 = true;
          newPoisonStacks1 = Math.max(0, newPoisonStacks1 - 0.5);
          
          // Track damage for Untouchable achievement
          if (!tookDamageThisRoomRef.current) {
            tookDamageThisRoomRef.current = true;
            import('../utils/achievementManager').then(({ achievementManager }) => {
              achievementManager.onPlayerDamaged();
            });
          }
        }
        
        if (newPoisonStacks2 > 0 && now - lastPoisonTickRef.current > 1000) {
          lastPoisonTickRef.current = now;
          const poisonDamage = newPoisonStacks2 * 0.5;
          pendingHealth2Change -= poisonDamage;
          newAccumulatedDamage2 += poisonDamage;
          shouldUpdatePlayer2 = true;
          newPoisonStacks2 = Math.max(0, newPoisonStacks2 - 0.5);
          
          // Track damage for Untouchable achievement (only if not already tracked)
          if (!tookDamageThisRoomRef.current) {
            tookDamageThisRoomRef.current = true;
            import('../utils/achievementManager').then(({ achievementManager }) => {
              achievementManager.onPlayerDamaged();
            });
          }
        }

        // Check if both players died
        if (newHealth1 + pendingHealth1Change <= 0 && newHealth2 + pendingHealth2Change <= 0) {
          isGameOverRef.current = true;
          setTimeout(() => onGameOver(coinsEarned), 0);
          return updatedEnemies;
        }

        // Remove dead enemies and award coins
        const aliveEnemies = updatedEnemies.filter(enemy => {
          if (enemy.health <= 0) {
            createBloodParticles(enemy.x, enemy.y, 12);
            soundManager.playDeathSound();
            const coinReward = enemy.isBoss ? COINS_PER_BOSS : COINS_PER_ENEMY;
            pendingCoinsRef.current += coinReward;
            
            // Apply lifesteal: heal % of max health per kill for the player who killed the enemy
            if (enemy.lastHitByPlayer === 1 && player1Bonuses.playerLifesteal > 0) {
              const healAmount = (player1Bonuses.playerLifesteal / 100) * player1Bonuses.playerMaxHealth;
              pendingHealth1Change += healAmount;
              shouldUpdatePlayer1 = true;
            } else if (enemy.lastHitByPlayer === 2 && player2Bonuses.playerLifesteal > 0) {
              const healAmount = (player2Bonuses.playerLifesteal / 100) * player2Bonuses.playerMaxHealth;
              pendingHealth2Change += healAmount;
              shouldUpdatePlayer2 = true;
            }
            
            // Track achievement
            import('../utils/achievementManager').then(({ achievementManager }) => {
              achievementManager.onEnemyKilled(enemy.isBoss);
            });
            
            return false;
          }
          return true;
        });

        // Apply pending coins from enemy kills BEFORE room completion check
        let currentCoinsEarned = coinsEarned;
        if (pendingCoinsRef.current > 0) {
          currentCoinsEarned += pendingCoinsRef.current;
          setCoinsEarned(currentCoinsEarned);
          pendingCoinsRef.current = 0;
        }

        // Track if we have enemies (for transition detection)
        if (prevEnemies.length > 0) {
          hadEnemiesRef.current = true;
        }

        // Check for room completion (only after all enemies have been spawned)
        // Use hadEnemiesRef to ensure we detect the transition from "has enemies" to "no enemies"
        if (aliveEnemies.length === 0 && hadEnemiesRef.current && allEnemiesSpawnedRef.current && !roomCompletedRef.current) {
          // Mark room as completed to prevent multiple calls
          roomCompletedRef.current = true;
          
          soundManager.playRoomClearSound();
          const roomBonus = COINS_PER_ROOM;
          const totalCoins = currentCoinsEarned + roomBonus;
          setCoinsEarned(totalCoins);
          
          // Track no-damage room clear for Untouchable achievement
          if (!tookDamageThisRoomRef.current) {
            import('../utils/achievementManager').then(({ achievementManager }) => {
              achievementManager.onRoomClearedNoDamage();
            });
          }
          
          // Use requestAnimationFrame + setTimeout for reliability
          requestAnimationFrame(() => {
            setTimeout(() => {
              onRoomComplete(totalCoins);
            }, 500);
          });
          
          return aliveEnemies;
        }

        // Apply all pending health changes
        const finalHealth1 = Math.min(player1Bonuses.playerMaxHealth, Math.max(0, newHealth1 + pendingHealth1Change));
        const finalHealth2 = Math.min(player2Bonuses.playerMaxHealth, Math.max(0, newHealth2 + pendingHealth2Change));
        
        // Only update if position or health changed
        if (newX1 !== currentPlayer1.x || newY1 !== currentPlayer1.y || finalHealth1 !== currentPlayer1.health || shouldUpdatePlayer1) {
          pendingPlayer1UpdateRef.current = {
            ...currentPlayer1,
            x: newX1,
            y: newY1,
            health: finalHealth1,
            poisonStacks: newPoisonStacks1,
            lastHitTime: newLastHitTime1,
            accumulatedDamage: newAccumulatedDamage1
          };
        }
        
        if (newX2 !== currentPlayer2.x || newY2 !== currentPlayer2.y || finalHealth2 !== currentPlayer2.health || shouldUpdatePlayer2) {
          pendingPlayer2UpdateRef.current = {
            ...currentPlayer2,
            x: newX2,
            y: newY2,
            health: finalHealth2,
            poisonStacks: newPoisonStacks2,
            lastHitTime: newLastHitTime2,
            accumulatedDamage: newAccumulatedDamage2
          };
        }

        return aliveEnemies;
      });

      // Apply damage to enemies from projectiles
      setEnemies(currentEnemies => {
        const projectilesToRemove = new Set<string>();
        const projectilesHitCount = new Map<string, number>();
        
        const currentProjectiles = projectilesRef.current;
        
        const updatedEnemiesWithDamage = currentEnemies.map(enemy => {
          let enemyHealth = enemy.health;
          let enemyLastHitTime = enemy.lastHitTime;
          let lastHitByPlayer = enemy.lastHitByPlayer || 0; // Track which player last hit this enemy
          
          // Check collisions with projectiles
          currentProjectiles.forEach(proj => {
            if (projectilesToRemove.has(proj.id)) return;
            if (proj.isEnemyProjectile) return;

            const dx = proj.x - enemy.x;
            const dy = proj.y - enemy.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < enemy.size / 2 + proj.size / 2) {
              const timeSinceLastHit = now - (enemyLastHitTime || 0);
              if (timeSinceLastHit >= INVINCIBILITY_TIME) {
                enemyHealth -= proj.damage;
                enemyLastHitTime = now;
                createBloodParticles(enemy.x, enemy.y, 6);
                soundManager.playHitSound();
                
                // Track which player last hit this enemy for kill credit
                if (proj.id.includes('_p1_')) {
                  lastHitByPlayer = 1;
                } else if (proj.id.includes('_p2_')) {
                  lastHitByPlayer = 2;
                }
                
                // Apply knockback
                if (proj.knockback && proj.knockback > 0) {
                  const knockbackDistance = proj.knockback * 0.5;
                  const knockbackAngle = Math.atan2(-dy, -dx);
                  const knockbackX = Math.cos(knockbackAngle) * knockbackDistance;
                  const knockbackY = Math.sin(knockbackAngle) * knockbackDistance;
                  
                  enemy.x = Math.max(enemy.size / 2, Math.min(ARENA_WIDTH - enemy.size / 2, enemy.x + knockbackX));
                  enemy.y = Math.max(enemy.size / 2, Math.min(ARENA_HEIGHT - enemy.size / 2, enemy.y + knockbackY));
                }
              }
              
              const currentHits = projectilesHitCount.get(proj.id) || 0;
              projectilesHitCount.set(proj.id, currentHits + 1);
              
              // Check piercing from the correct player
              const piercingValue = proj.id.includes('_p1_') ? currentPlayer1.piercing : currentPlayer2.piercing;
              if (currentHits >= piercingValue) {
                projectilesToRemove.add(proj.id);
              }
            }
          });
          
          if (enemyHealth !== enemy.health || enemyLastHitTime !== enemy.lastHitTime || lastHitByPlayer !== (enemy.lastHitByPlayer || 0)) {
            return { ...enemy, health: enemyHealth, lastHitTime: enemyLastHitTime, lastHitByPlayer };
          }
          return enemy;
        });
        
        // Store projectiles to remove for next call
        projectilesToRemoveRef.current = projectilesToRemove;
        
        return updatedEnemiesWithDamage;
      });
      
      // Capture pending projectiles and clear immediately
      const projectilesToAdd = [...pendingProjectilesRef.current];
      pendingProjectilesRef.current = [];
      
      // Update projectiles
      setProjectiles(prevProjectiles => {
        const movedProjectiles = prevProjectiles
          .map(proj => ({
            ...proj,
            x: proj.x + proj.vx,
            y: proj.y + proj.vy
          }))
          .filter(proj => {
            // Remove out of bounds projectiles
            if (proj.x < 0 || proj.x > ARENA_WIDTH || proj.y < 0 || proj.y > ARENA_HEIGHT) {
              return false;
            }
            
            // Remove projectiles that hit obstacles
            for (const obstacle of obstaclesRef.current) {
              if (checkCircleRectCollision(proj.x, proj.y, proj.size / 2, obstacle.x, obstacle.y, obstacle.width, obstacle.height)) {
                return false;
              }
            }
            
            return true;
          });
        
        // Check enemy projectile hits on players
        movedProjectiles.forEach(proj => {
          if (!proj.isEnemyProjectile) return;
          
          // Check Player 1 (only if alive)
          if (currentPlayer1.health > 0) {
            const dx1 = proj.x - newX1;
            const dy1 = proj.y - newY1;
            const distance1 = Math.sqrt(dx1 * dx1 + dy1 * dy1);

            if (distance1 < PLAYER_SIZE / 2 + proj.size / 2) {
            const timeSinceLastHit = now - (pendingPlayer1UpdateRef.current?.lastHitTime || currentPlayer1.lastHitTime || 0);
            if (timeSinceLastHit >= INVINCIBILITY_TIME) {
              const damageReduction = Math.min(player1Bonuses.playerDefense * 0.02, 0.75);
              const damageTaken = Math.max(1, proj.damage * (1 - damageReduction));
              
              // Track damage for Untouchable achievement
              if (!tookDamageThisRoomRef.current) {
                tookDamageThisRoomRef.current = true;
                import('../utils/achievementManager').then(({ achievementManager }) => {
                  achievementManager.onPlayerDamaged();
                });
              }
              
              if (pendingPlayer1UpdateRef.current) {
                pendingPlayer1UpdateRef.current.health = Math.max(0, pendingPlayer1UpdateRef.current.health - damageTaken);
                pendingPlayer1UpdateRef.current.accumulatedDamage = (pendingPlayer1UpdateRef.current.accumulatedDamage || 0) + damageTaken;
                pendingPlayer1UpdateRef.current.lastHitTime = now;
              } else {
                pendingPlayer1UpdateRef.current = {
                  ...currentPlayer1,
                  x: newX1,
                  y: newY1,
                  health: Math.max(0, currentPlayer1.health - damageTaken),
                  accumulatedDamage: (currentPlayer1.accumulatedDamage || 0) + damageTaken,
                  lastHitTime: now
                };
              }
              
              createBloodParticles(newX1, newY1, 3);
              soundManager.playHitSound();
            }
            
            projectilesToRemoveRef.current.add(proj.id);
            }
          }
          
          // Check Player 2 (only if alive)
          if (currentPlayer2.health > 0) {
            const dx2 = proj.x - newX2;
            const dy2 = proj.y - newY2;
            const distance2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);

            if (distance2 < PLAYER_SIZE / 2 + proj.size / 2) {
            const timeSinceLastHit = now - (pendingPlayer2UpdateRef.current?.lastHitTime || currentPlayer2.lastHitTime || 0);
            if (timeSinceLastHit >= INVINCIBILITY_TIME) {
              const damageReduction = Math.min(player2Bonuses.playerDefense * 0.02, 0.75);
              const damageTaken = Math.max(1, proj.damage * (1 - damageReduction));
              
              // Track damage for Untouchable achievement
              if (!tookDamageThisRoomRef.current) {
                tookDamageThisRoomRef.current = true;
                import('../utils/achievementManager').then(({ achievementManager }) => {
                  achievementManager.onPlayerDamaged();
                });
              }
              
              if (pendingPlayer2UpdateRef.current) {
                pendingPlayer2UpdateRef.current.health = Math.max(0, pendingPlayer2UpdateRef.current.health - damageTaken);
                pendingPlayer2UpdateRef.current.accumulatedDamage = (pendingPlayer2UpdateRef.current.accumulatedDamage || 0) + damageTaken;
                pendingPlayer2UpdateRef.current.lastHitTime = now;
              } else {
                pendingPlayer2UpdateRef.current = {
                  ...currentPlayer2,
                  x: newX2,
                  y: newY2,
                  health: Math.max(0, currentPlayer2.health - damageTaken),
                  accumulatedDamage: (currentPlayer2.accumulatedDamage || 0) + damageTaken,
                  lastHitTime: now
                };
              }
              
              createBloodParticles(newX2, newY2, 3);
              soundManager.playHitSound();
            }
            
            projectilesToRemoveRef.current.add(proj.id);
            }
          }
        });

        return [...movedProjectiles.filter(p => !projectilesToRemoveRef.current.has(p.id)), ...projectilesToAdd];
      });
      
      // Apply pending particles
      if (pendingParticlesRef.current.length > 0) {
        setParticles(prev => [...prev, ...pendingParticlesRef.current]);
        pendingParticlesRef.current = [];
      }
      
      // Apply pending player updates
      if (pendingPlayer1UpdateRef.current) {
        onPlayer1Update(pendingPlayer1UpdateRef.current);
        pendingPlayer1UpdateRef.current = null;
      }
      
      if (pendingPlayer2UpdateRef.current) {
        onPlayer2Update(pendingPlayer2UpdateRef.current);
        pendingPlayer2UpdateRef.current = null;
      }

      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoopRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [onPlayer1Update, onPlayer2Update, onRoomComplete, onGameOver, coinsEarned]);

  const getEnemyEmoji = (enemy: Enemy) => {
    if (enemy.isBoss) return '👹';
    switch (enemy.type) {
      case 'brute': return '💪';
      case 'shortie': return '🐁';
      case 'ranged': return '🏹';
      case 'ghost': return '👻';
      case 'reaper': return '💀';
      case 'vampire': return '🧛';
      case 'mutant': return '🧟';
      case 'possessed-milk': return '🥛';
      default: return '👾';
    }
  };

  const handleQuitClick = () => {
    setShowQuitDialog(true);
  };

  const handleConfirmQuit = () => {
    setShowQuitDialog(false);
    if (onQuitToMenu) {
      onQuitToMenu();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: room.backgroundColor }}>
      <div className="space-y-4 w-full max-w-5xl">
        {/* Back to Menu Button */}
        <div className="flex justify-end">
          <Button
            onClick={handleQuitClick}
            variant="outline"
            size="sm"
            className="bg-white/90 hover:bg-red-50 border-red-200 hover:border-red-400 text-red-600 hover:text-red-700"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Back to Menu
          </Button>
        </div>

        {/* HUD */}
        <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-xl p-3">
          <div className="grid grid-cols-2 gap-4">
            {/* Player 1 Stats */}
            <div className="space-y-2">
              <div className="text-center text-sm text-gray-600">Player 1 (WASD)</div>
              <div className="grid grid-cols-4 gap-2">
                <div className="flex flex-col items-center justify-center p-2 bg-gradient-to-br from-red-50 to-pink-50 rounded-lg">
                  <Heart className="w-4 h-4 text-red-500 mb-1" />
                  <div className="text-xs text-gray-600">Health</div>
                  <div>{Math.ceil(player1.health)}/{player1.maxHealth}</div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                    <div 
                      className="bg-gradient-to-r from-red-500 to-pink-500 h-1.5 rounded-full transition-all"
                      style={{ width: `${(player1.health / player1.maxHealth) * 100}%` }}
                    />
                  </div>
                </div>
                
                <div className="flex flex-col items-center justify-center p-2 bg-gradient-to-br from-orange-50 to-yellow-50 rounded-lg">
                  <Sword className="w-4 h-4 text-orange-500 mb-1" />
                  <div className="text-xs text-gray-600">Weapon</div>
                  <div className="text-2xl">{weapon1.emoji}</div>
                </div>
                
                <div className="flex flex-col items-center justify-center p-2 bg-gradient-to-br from-yellow-50 to-amber-50 rounded-lg">
                  <Zap className="w-4 h-4 text-yellow-600 mb-1" />
                  <div className="text-xs text-gray-600">Damage</div>
                  <div>{weapon1.damage + player1.damage}</div>
                </div>
                
                <div className="flex flex-col items-center justify-center p-2 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg">
                  <Shield className="w-4 h-4 text-blue-500 mb-1" />
                  <div className="text-xs text-gray-600">Defense</div>
                  <div>{player1.defense}</div>
                </div>
              </div>
            </div>
            
            {/* Player 2 Stats */}
            <div className="space-y-2">
              <div className="text-center text-sm text-gray-600">Player 2 (Arrows)</div>
              <div className="grid grid-cols-4 gap-2">
                <div className="flex flex-col items-center justify-center p-2 bg-gradient-to-br from-red-50 to-pink-50 rounded-lg">
                  <Heart className="w-4 h-4 text-red-500 mb-1" />
                  <div className="text-xs text-gray-600">Health</div>
                  <div>{Math.ceil(player2.health)}/{player2.maxHealth}</div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                    <div 
                      className="bg-gradient-to-r from-red-500 to-pink-500 h-1.5 rounded-full transition-all"
                      style={{ width: `${(player2.health / player2.maxHealth) * 100}%` }}
                    />
                  </div>
                </div>
                
                <div className="flex flex-col items-center justify-center p-2 bg-gradient-to-br from-orange-50 to-yellow-50 rounded-lg">
                  <Sword className="w-4 h-4 text-orange-500 mb-1" />
                  <div className="text-xs text-gray-600">Weapon</div>
                  <div className="text-2xl">{weapon2.emoji}</div>
                </div>
                
                <div className="flex flex-col items-center justify-center p-2 bg-gradient-to-br from-yellow-50 to-amber-50 rounded-lg">
                  <Zap className="w-4 h-4 text-yellow-600 mb-1" />
                  <div className="text-xs text-gray-600">Damage</div>
                  <div>{weapon2.damage + player2.damage}</div>
                </div>
                
                <div className="flex flex-col items-center justify-center p-2 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg">
                  <Shield className="w-4 h-4 text-blue-500 mb-1" />
                  <div className="text-xs text-gray-600">Defense</div>
                  <div>{player2.defense}</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Shared Stats */}
          <div className="grid grid-cols-3 gap-3 mt-3">
            <div className="flex flex-col items-center justify-center p-2 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg">
              <Skull className="w-4 h-4 text-purple-500 mb-1" />
              <div className="text-xs text-gray-600">Room</div>
              <div>{room.number}</div>
              {room.isBoss && <div className="text-xs text-red-600">BOSS</div>}
            </div>
            
            <div className="flex flex-col items-center justify-center p-2 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg">
              <Coins className="w-4 h-4 text-yellow-600 mb-1" />
              <div className="text-xs text-gray-600">Coins</div>
              <div>{coinsEarned} 🪙</div>
            </div>
            
            <div className="flex flex-col items-center justify-center p-2 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg">
              <div className="text-xs text-gray-600">Enemies</div>
              <div>{enemies.length}</div>
            </div>
          </div>
        </div>

        {/* Game Arena */}
        <div className="bg-white rounded-2xl shadow-2xl p-4">
          <div 
            ref={canvasRef}
            className="relative bg-gradient-to-br from-purple-100 to-blue-100 rounded-xl overflow-hidden mx-auto"
            style={{ width: ARENA_WIDTH, height: ARENA_HEIGHT }}
          >
            {/* Obstacles */}
            {obstaclesRef.current.map(obstacle => (
              <div
                key={obstacle.id}
                className="absolute rounded-lg shadow-md flex items-center justify-center border-2 border-gray-700"
                style={{
                  width: obstacle.width,
                  height: obstacle.height,
                  left: obstacle.x - obstacle.width / 2,
                  top: obstacle.y - obstacle.height / 2,
                  backgroundColor: obstacle.color,
                }}
              >
                <span className="text-3xl">{obstacle.emoji}</span>
              </div>
            ))}

            {/* Player 1 */}
            <motion.div
              className={`absolute rounded-full flex items-center justify-center shadow-lg border-4 ${
                player1.health <= 0 
                  ? 'bg-gradient-to-br from-gray-400 to-gray-600 border-gray-300 opacity-60' 
                  : 'bg-gradient-to-br from-green-400 to-blue-500 border-white'
              }`}
              style={{
                width: PLAYER_SIZE,
                height: PLAYER_SIZE,
                left: player1.x - PLAYER_SIZE / 2,
                top: player1.y - PLAYER_SIZE / 2,
              }}
              animate={player1.health > 0 ? { scale: [1, 1.05, 1] } : {}}
              transition={{ repeat: Infinity, duration: 0.5 }}
            >
              <span className="text-2xl">{player1.cosmetic}</span>
              {player1.health <= 0 && (
                <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-red-600 text-white text-xs px-2 py-0.5 rounded-full whitespace-nowrap">
                  DEAD
                </div>
              )}
            </motion.div>
            
            {/* Player 2 */}
            <motion.div
              className={`absolute rounded-full flex items-center justify-center shadow-lg border-4 ${
                player2.health <= 0 
                  ? 'bg-gradient-to-br from-gray-400 to-gray-600 border-gray-300 opacity-60' 
                  : 'bg-gradient-to-br from-purple-400 to-pink-500 border-white'
              }`}
              style={{
                width: PLAYER_SIZE,
                height: PLAYER_SIZE,
                left: player2.x - PLAYER_SIZE / 2,
                top: player2.y - PLAYER_SIZE / 2,
              }}
              animate={player2.health > 0 ? { scale: [1, 1.05, 1] } : {}}
              transition={{ repeat: Infinity, duration: 0.5 }}
            >
              <span className="text-2xl">{player2.cosmetic}</span>
              {player2.health <= 0 && (
                <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-red-600 text-white text-xs px-2 py-0.5 rounded-full whitespace-nowrap">
                  DEAD
                </div>
              )}
            </motion.div>

            {/* Enemies */}
            {enemies.map(enemy => (
              <motion.div
                key={enemy.id}
                className="absolute rounded-full flex flex-col items-center justify-center shadow-lg border-2 border-gray-800"
                style={{
                  width: enemy.size,
                  height: enemy.size,
                  left: enemy.x - enemy.size / 2,
                  top: enemy.y - enemy.size / 2,
                  backgroundColor: enemy.color,
                }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ 
                  scale: { duration: 0.3, ease: 'backOut' },
                  opacity: { duration: 0.3 }
                }}
              >
                <span className="text-2xl">{getEnemyEmoji(enemy)}</span>
                {enemy.isBoss && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-red-600 text-white text-xs px-2 py-0.5 rounded-full whitespace-nowrap">
                    {enemy.name}
                  </div>
                )}
                <div className="absolute -bottom-2 left-0 right-0 mx-1">
                  <div className="bg-gray-800 rounded-full h-1">
                    <div 
                      className="bg-red-500 h-1 rounded-full transition-all"
                      style={{ width: `${(enemy.health / enemy.maxHealth) * 100}%` }}
                    />
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Projectiles */}
            {projectiles.map(proj => (
              <div
                key={proj.id}
                className="absolute rounded-full flex items-center justify-center shadow-md"
                style={{
                  width: proj.size,
                  height: proj.size,
                  left: proj.x - proj.size / 2,
                  top: proj.y - proj.size / 2,
                  backgroundColor: proj.color,
                }}
              >
                <span className="text-xs">{proj.emoji}</span>
              </div>
            ))}

            {/* Particles */}
            {particles.map(particle => (
              <div
                key={particle.id}
                className="absolute rounded-full"
                style={{
                  width: particle.size,
                  height: particle.size,
                  left: particle.x,
                  top: particle.y,
                  backgroundColor: particle.color,
                  opacity: particle.life / particle.maxLife,
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Quit Confirmation Dialog */}
      <AlertDialog open={showQuitDialog} onOpenChange={setShowQuitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Quit to Menu?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to quit this co-op run? Both players will lose all progress in this game, but you'll keep any coins you've earned so far ({coinsEarned} 🪙).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continue Playing</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmQuit} className="bg-red-600 hover:bg-red-700">
              Quit to Menu
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}