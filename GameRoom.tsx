import { useEffect, useRef, useState } from 'react';
import { Player, Enemy, Room, Weapon, Projectile, Particle, Difficulty, EnemyType } from '../types/game';
import { motion } from 'motion/react';
import { Heart, Shield, Zap, Sword, Skull, Crosshair, Coins, LogOut } from 'lucide-react';
import { soundManager } from '../utils/soundManager';
import { controllerManager } from '../utils/controllerManager';
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

interface GameRoomProps {
  player: Player;
  room: Room;
  weapon: Weapon;
  difficulty: Difficulty;
  onPlayerUpdate: (player: Player) => void;
  onRoomComplete: (coinsEarned: number) => void;
  onGameOver: (coinsEarned: number) => void;
  onQuitToMenu?: () => void;
}

const INVINCIBILITY_TIME = 250; // 0.25 seconds in milliseconds

const ARENA_WIDTH = 800;
const ARENA_HEIGHT = 600;
const PLAYER_SIZE = 40;

export function GameRoom({ player, room, weapon, difficulty, onPlayerUpdate, onRoomComplete, onGameOver, onQuitToMenu }: GameRoomProps) {
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
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [coinsEarned, setCoinsEarned] = useState(0);
  const [showQuitDialog, setShowQuitDialog] = useState(false);
  
  const keysPressed = useRef<Set<string>>(new Set());
  const gameLoopRef = useRef<number>();
  const canvasRef = useRef<HTMLDivElement>(null);
  const lastAttackTimeRef = useRef(0);
  const lastSuperpowerUseRef = useRef(0);
  const playerRef = useRef(player);
  const weaponRef = useRef(weapon);
  const obstaclesRef = useRef(room.obstacles); // Fix obstacle glitch - use ref!
  const lastRegenTimeRef = useRef(Date.now());
  const lastPoisonTickRef = useRef(Date.now());
  const isGameOverRef = useRef(false);
  const pendingProjectilesRef = useRef<Projectile[]>([]);
  const pendingParticlesRef = useRef<Particle[]>([]);
  const pendingCoinsRef = useRef<number>(0);
  const pendingPlayerUpdateRef = useRef<Player | null>(null);
  const projectilesToRemoveRef = useRef<Set<string>>(new Set());
  const enemyDamageMapRef = useRef<Map<string, { damage: number; hitTime: number }>>(new Map());
  const projectileIdCounterRef = useRef<number>(0);
  const enemyIdCounterRef = useRef<number>(0);
  const particleIdCounterRef = useRef<number>(0);
  const projectilesRef = useRef<Projectile[]>([]);
  const enemiesToSpawnRef = useRef<Enemy[]>(room.enemies);
  const spawnIndexRef = useRef<number>(0);
  const allEnemiesSpawnedRef = useRef<boolean>(false);
  const tookDamageThisRoomRef = useRef<boolean>(false);
  const roomCompletedRef = useRef<boolean>(false);
  const hadEnemiesRef = useRef<boolean>(false); // Track if we've had enemies alive

  // Keep refs updated
  useEffect(() => {
    playerRef.current = player;
  }, [player]);
  
  useEffect(() => {
    projectilesRef.current = projectiles;
  }, [projectiles]);

  useEffect(() => {
    weaponRef.current = weapon;
  }, [weapon]);

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
    const handleMouseMove = (e: MouseEvent) => {
      if (canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        setMousePos({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        });
      }
    };

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
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousemove', handleMouseMove);
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

  useEffect(() => {
    const gameLoop = () => {
      // Skip game loop if game is over
      if (isGameOverRef.current) return;
      
      // Update controller state
      controllerManager.update();
      
      const now = Date.now();
      const currentPlayer = playerRef.current;
      const currentWeapon = weaponRef.current;
      
      // Track all player updates to batch them
      let pendingHealthChange = 0;
      let shouldUpdatePlayer = false;
      let newAccumulatedDamage = currentPlayer.accumulatedDamage || 0;
      
      // Apply cosmetic ability bonuses
      let playerSpeed = currentPlayer.speed;
      let playerDamage = currentPlayer.damage;
      let playerDefense = currentPlayer.defense;
      let playerLifesteal = currentPlayer.lifesteal;
      let playerMaxHealth = currentPlayer.maxHealth;
      let multishot = 1;
      let thorns = 0;
      let regenRate = 0;

      if (currentPlayer.cosmeticAbility) {
        const ability = currentPlayer.cosmeticAbility;
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

      // Handle regeneration
      if (regenRate > 0 && now - lastRegenTimeRef.current > 1000) {
        lastRegenTimeRef.current = now;
        pendingHealthChange += regenRate;
        shouldUpdatePlayer = true;
      }
      
      // Handle player auto-attack (outside of setState)
      setEnemies(currentEnemies => {
        if (currentEnemies.length > 0) {
          const timeSinceLastAttack = now - lastAttackTimeRef.current;
          const attackCooldown = 1000 / currentWeapon.attackSpeed;

          if (timeSinceLastAttack >= attackCooldown) {
            let closestEnemy: Enemy | null = null;
            let closestDistance = Infinity;

            currentEnemies.forEach(enemy => {
              const dx = enemy.x - currentPlayer.x;
              const dy = enemy.y - currentPlayer.y;
              const distance = Math.sqrt(dx * dx + dy * dy);

              if (distance < closestDistance) {
                closestDistance = distance;
                closestEnemy = enemy;
              }
            });

            if (closestEnemy && closestDistance > 0) {
              // Fire projectiles (multishot support)
              for (let i = 0; i < multishot; i++) {
                const dx = closestEnemy.x - currentPlayer.x;
                const dy = closestEnemy.y - currentPlayer.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                // Add spread for multishot
                let angle = Math.atan2(dy, dx);
                if (multishot > 1) {
                  const spreadAngle = 0.3;
                  angle += (i - (multishot - 1) / 2) * spreadAngle / multishot;
                }

                const speed = 8;
                const vx = Math.cos(angle) * speed;
                const vy = Math.sin(angle) * speed;

                const projectile: Projectile = {
                  id: `proj_${++projectileIdCounterRef.current}`,
                  x: currentPlayer.x,
                  y: currentPlayer.y,
                  vx,
                  vy,
                  damage: currentWeapon.damage + playerDamage,
                  size: 12,
                  color: currentWeapon.color,
                  emoji: currentWeapon.emoji,
                  isEnemyProjectile: false,
                  piercedEnemies: 0,
                  knockback: currentWeapon.knockback
                };

                // Add to pending instead of setState
                pendingProjectilesRef.current.push(projectile);
              }
              lastAttackTimeRef.current = now;
              soundManager.playAttackSound();
            }
          }
        }

        // Enemy ranged attacks
        currentEnemies.forEach(enemy => {
          if (enemy.canShoot && enemy.type === 'ranged') {
            const enemyShootCooldown = 2000;
            const timeSinceLastShot = now - (enemy.lastShotTime || 0);
            
            if (timeSinceLastShot >= enemyShootCooldown) {
              enemy.lastShotTime = now;
              
              const dx = currentPlayer.x - enemy.x;
              const dy = currentPlayer.y - enemy.y;
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

                // Add to pending instead of setState
                pendingProjectilesRef.current.push(enemyProjectile);
              }
            }
          }
          
          // Mutant obstacle throwing
          if (enemy.canThrowObstacles && enemy.type === 'mutant') {
            const throwCooldown = 3000;
            const timeSinceLastThrow = now - (enemy.lastObstacleThrowTime || 0);
            
            if (timeSinceLastThrow >= throwCooldown) {
              enemy.lastObstacleThrowTime = now;
              
              const dx = currentPlayer.x - enemy.x;
              const dy = currentPlayer.y - enemy.y;
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

                // Add to pending instead of setState
                pendingProjectilesRef.current.push(obstacleProjectile);
                soundManager.playAttackSound();
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
                confusionDuration: 0,
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

      // Move player
      let newX = currentPlayer.x;
      let newY = currentPlayer.y;

      // Check if player is confused (inverted controls)
      const isConfused = currentPlayer.confusedUntil && now < currentPlayer.confusedUntil;
      const directionMultiplier = isConfused ? -1 : 1;

      // Keyboard movement (inverted if confused)
      if (keysPressed.current.has('w') || keysPressed.current.has('arrowup')) {
        newY = Math.max(PLAYER_SIZE / 2, Math.min(ARENA_HEIGHT - PLAYER_SIZE / 2, currentPlayer.y - playerSpeed * directionMultiplier));
      }
      if (keysPressed.current.has('s') || keysPressed.current.has('arrowdown')) {
        newY = Math.max(PLAYER_SIZE / 2, Math.min(ARENA_HEIGHT - PLAYER_SIZE / 2, currentPlayer.y + playerSpeed * directionMultiplier));
      }
      if (keysPressed.current.has('a') || keysPressed.current.has('arrowleft')) {
        newX = Math.max(PLAYER_SIZE / 2, Math.min(ARENA_WIDTH - PLAYER_SIZE / 2, currentPlayer.x - playerSpeed * directionMultiplier));
      }
      if (keysPressed.current.has('d') || keysPressed.current.has('arrowright')) {
        newX = Math.max(PLAYER_SIZE / 2, Math.min(ARENA_WIDTH - PLAYER_SIZE / 2, currentPlayer.x + playerSpeed * directionMultiplier));
      }

      // Controller movement (left stick + d-pad, inverted if confused)
      const controllerMovement = controllerManager.getMovement();
      if (controllerMovement.x !== 0 || controllerMovement.y !== 0) {
        newX = Math.max(PLAYER_SIZE / 2, Math.min(ARENA_WIDTH - PLAYER_SIZE / 2, currentPlayer.x + controllerMovement.x * playerSpeed * directionMultiplier));
        newY = Math.max(PLAYER_SIZE / 2, Math.min(ARENA_HEIGHT - PLAYER_SIZE / 2, currentPlayer.y + controllerMovement.y * playerSpeed * directionMultiplier));
      }

      // Check player collision with obstacles
      const validPlayerPos = getValidPosition(currentPlayer.x, currentPlayer.y, newX, newY, PLAYER_SIZE, false);
      newX = validPlayerPos.x;
      newY = validPlayerPos.y;

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
          
          const dx = newX - enemy.x;
          const dy = newY - enemy.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
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

        // Check enemy-player collisions
        let newHealth = currentPlayer.health;
        let thornsDamage = 0;
        let newPoisonStacks = currentPlayer.poisonStacks || 0;
        let newLastHitTime = currentPlayer.lastHitTime || 0;

        // Check if player can take damage (not invincible)
        const timeSinceLastPlayerHit = now - newLastHitTime;
        const canTakeDamage = timeSinceLastPlayerHit >= INVINCIBILITY_TIME;

        updatedEnemies.forEach(enemy => {
          const dx = newX - enemy.x;
          const dy = newY - enemy.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const collisionDistance = (PLAYER_SIZE + enemy.size) / 2;

          if (distance < collisionDistance && canTakeDamage) {
            const damageReduction = Math.min(playerDefense * 0.02, 0.75);
            const damageTaken = Math.max(1, enemy.damage * (1 - damageReduction));
            newHealth -= damageTaken; // Removed the 0.016 multiplier since we have i-frames now
            newLastHitTime = now; // Update last hit time for player
            
            // Track damage for Untouchable achievement
            if (!tookDamageThisRoomRef.current) {
              tookDamageThisRoomRef.current = true;
              import('../utils/achievementManager').then(({ achievementManager }) => {
                achievementManager.onPlayerDamaged();
              });
            }
            
            // Vampire healing - only heal this specific vampire
            if (enemy.lifestealPercent && enemy.lifestealPercent > 0) {
              const vampireHeal = damageTaken * (enemy.lifestealPercent / 100);
              enemy.health = Math.min(enemy.maxHealth, enemy.health + vampireHeal);
            }
            
            // Reaper poison - add poison stack
            if (enemy.poisonDamage && enemy.poisonDamage > 0) {
              newPoisonStacks = Math.min(10, newPoisonStacks + 1); // Max 10 stacks
            }
            
            // Possessed Milk confusion debuff
            if (enemy.confusionDuration && enemy.confusionDuration > 0) {
              // Set confusion to expire after the duration
              pendingPlayerUpdateRef.current = {
                ...(pendingPlayerUpdateRef.current || currentPlayer),
                confusedUntil: now + enemy.confusionDuration
              };
            }
            
            // Thorns damage
            if (thorns > 0) {
              const reflectDamage = damageTaken * (thorns / 100);
              enemy.health -= reflectDamage;
              thornsDamage += reflectDamage;
            }
            
            if (Math.random() < 0.1) {
              createBloodParticles(newX, newY, 3);
            }
          }
        });

        // Apply poison damage over time
        if (newPoisonStacks > 0 && now - lastPoisonTickRef.current > 1000) {
          lastPoisonTickRef.current = now;
          const poisonDamage = newPoisonStacks * 0.5; // 0.5 damage per stack per second
          pendingHealthChange -= poisonDamage;
          newAccumulatedDamage += poisonDamage; // Track poison damage for lifesteal
          shouldUpdatePlayer = true;
          // Decay poison stacks slowly
          newPoisonStacks = Math.max(0, newPoisonStacks - 0.5);
          
          // Track damage for Untouchable achievement
          if (!tookDamageThisRoomRef.current) {
            tookDamageThisRoomRef.current = true;
            import('../utils/achievementManager').then(({ achievementManager }) => {
              achievementManager.onPlayerDamaged();
            });
          }
        }

        if (newHealth + pendingHealthChange <= 0) {
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
            
            // Apply lifesteal: heal % of max health per kill
            if (playerLifesteal > 0) {
              const healAmount = (playerLifesteal / 100) * playerMaxHealth;
              pendingHealthChange += healAmount;
              shouldUpdatePlayer = true;
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
          
          return aliveEnemies; // Don't continue processing after room complete
        }

        // Apply all pending health changes
        const finalHealth = Math.min(playerMaxHealth, Math.max(0, newHealth + pendingHealthChange));
        
        // Only update if position or health changed, or if we have pending updates
        if (newX !== currentPlayer.x || newY !== currentPlayer.y || finalHealth !== currentPlayer.health || shouldUpdatePlayer) {
          pendingPlayerUpdateRef.current = {
            ...currentPlayer,
            x: newX,
            y: newY,
            health: finalHealth,
            poisonStacks: newPoisonStacks,
            lastHitTime: newLastHitTime,
            accumulatedDamage: newAccumulatedDamage
          };
        }

        return aliveEnemies;
      });

      // Apply damage to enemies from projectiles (done in next setEnemies call)
      setEnemies(currentEnemies => {
        const projectilesToRemove = new Set<string>();
        const projectilesHitCount = new Map<string, number>();
        
        // Read projectiles from ref (updated in previous frame)
        const currentProjectiles = projectilesRef.current;
        
        const updatedEnemiesWithDamage = currentEnemies.map(enemy => {
          let enemyHealth = enemy.health;
          let enemyLastHitTime = enemy.lastHitTime;
          
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
                
                // Apply knockback - push enemy away from projectile
                if (proj.knockback && proj.knockback > 0) {
                  const knockbackDistance = proj.knockback * 0.5; // Scale knockback
                  // Reverse the angle to push away (enemy - proj instead of proj - enemy)
                  const knockbackAngle = Math.atan2(-dy, -dx);
                  const knockbackX = Math.cos(knockbackAngle) * knockbackDistance;
                  const knockbackY = Math.sin(knockbackAngle) * knockbackDistance;
                  
                  // Apply knockback to enemy position (will be validated later)
                  enemy.x = Math.max(enemy.size / 2, Math.min(ARENA_WIDTH - enemy.size / 2, enemy.x + knockbackX));
                  enemy.y = Math.max(enemy.size / 2, Math.min(ARENA_HEIGHT - enemy.size / 2, enemy.y + knockbackY));
                }
              }
              
              const currentHits = projectilesHitCount.get(proj.id) || 0;
              projectilesHitCount.set(proj.id, currentHits + 1);
              
              if (currentHits >= currentPlayer.piercing) {
                projectilesToRemove.add(proj.id);
              }
            }
          });
          
          if (enemyHealth !== enemy.health || enemyLastHitTime !== enemy.lastHitTime) {
            return { ...enemy, health: enemyHealth, lastHitTime: enemyLastHitTime };
          }
          return enemy;
        });
        
        // Store projectiles to remove for next call
        projectilesToRemoveRef.current = projectilesToRemove;
        
        return updatedEnemiesWithDamage;
      });
      
      // Capture pending projectiles and clear immediately to prevent duplicates
      const projectilesToAdd = [...pendingProjectilesRef.current];
      pendingProjectilesRef.current = [];
      
      // Update projectiles - combined movement, filtering, collision, and adding new projectiles
      setProjectiles(prevProjectiles => {
        // First, move and filter projectiles
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
        
        // Check enemy projectile hits on player
        movedProjectiles.forEach(proj => {
          if (!proj.isEnemyProjectile) return;
          
          const dx = proj.x - newX;
          const dy = proj.y - newY;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < PLAYER_SIZE / 2 + proj.size / 2) {
            const timeSinceLastHit = now - (pendingPlayerUpdateRef.current?.lastHitTime || currentPlayer.lastHitTime || 0);
            if (timeSinceLastHit >= INVINCIBILITY_TIME) {
              const damageReduction = Math.min(playerDefense * 0.02, 0.75);
              const damageTaken = Math.max(1, proj.damage * (1 - damageReduction));
              
              // Track damage for Untouchable achievement
              if (!tookDamageThisRoomRef.current) {
                tookDamageThisRoomRef.current = true;
                import('../utils/achievementManager').then(({ achievementManager }) => {
                  achievementManager.onPlayerDamaged();
                });
              }
              
              // If player update is already pending, update it directly
              if (pendingPlayerUpdateRef.current) {
                pendingPlayerUpdateRef.current.health = Math.max(0, pendingPlayerUpdateRef.current.health - damageTaken);
                pendingPlayerUpdateRef.current.accumulatedDamage = (pendingPlayerUpdateRef.current.accumulatedDamage || 0) + damageTaken;
                pendingPlayerUpdateRef.current.lastHitTime = now;
              } else {
                // Create a new pending player update with the damage and updated lastHitTime
                pendingPlayerUpdateRef.current = {
                  ...currentPlayer,
                  x: newX,
                  y: newY,
                  health: Math.max(0, currentPlayer.health - damageTaken),
                  accumulatedDamage: (currentPlayer.accumulatedDamage || 0) + damageTaken,
                  lastHitTime: now
                };
              }
              
              createBloodParticles(newX, newY, 3);
              soundManager.playHitSound();
            }
            
            projectilesToRemoveRef.current.add(proj.id);
          }
        });

        // Filter removed projectiles and add new ones
        return [...movedProjectiles.filter(p => !projectilesToRemoveRef.current.has(p.id)), ...projectilesToAdd];
      });
      
      // Apply pending particles after enemy state update completes
      if (pendingParticlesRef.current.length > 0) {
        setParticles(prev => [...prev, ...pendingParticlesRef.current]);
        pendingParticlesRef.current = [];
      }
      
      // Coins are now applied earlier (before room completion check)
      
      // Apply pending player update after all state updates complete
      if (pendingPlayerUpdateRef.current) {
        onPlayerUpdate(pendingPlayerUpdateRef.current);
        pendingPlayerUpdateRef.current = null;
      }

      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoopRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [onPlayerUpdate, onRoomComplete, onGameOver]);

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
          <div className="grid grid-cols-3 md:grid-cols-8 gap-3">
            <div className="flex flex-col items-center justify-center p-2 bg-gradient-to-br from-red-50 to-pink-50 rounded-lg">
              <Heart className="w-4 h-4 text-red-500 mb-1" />
              <div className="text-xs text-gray-600">Health</div>
              <div className="font-bold">{Math.ceil(player.health)}/{player.maxHealth}</div>
              <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                <div 
                  className="bg-gradient-to-r from-red-500 to-pink-500 h-1.5 rounded-full transition-all"
                  style={{ width: `${(player.health / player.maxHealth) * 100}%` }}
                />
              </div>
            </div>
            
            <div className="flex flex-col items-center justify-center p-2 bg-gradient-to-br from-orange-50 to-yellow-50 rounded-lg">
              <Sword className="w-4 h-4 text-orange-500 mb-1" />
              <div className="text-xs text-gray-600">Weapon</div>
              <div className="text-2xl">{weapon.emoji}</div>
            </div>
            
            <div className="flex flex-col items-center justify-center p-2 bg-gradient-to-br from-yellow-50 to-amber-50 rounded-lg">
              <Zap className="w-4 h-4 text-yellow-600 mb-1" />
              <div className="text-xs text-gray-600">Damage</div>
              <div className="font-bold">{weapon.damage + player.damage}</div>
            </div>
            
            <div className="flex flex-col items-center justify-center p-2 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg">
              <Shield className="w-4 h-4 text-blue-500 mb-1" />
              <div className="text-xs text-gray-600">Defense</div>
              <div className="font-bold">{player.defense}</div>
            </div>
            
            <div className="flex flex-col items-center justify-center p-2 bg-gradient-to-br from-pink-50 to-red-50 rounded-lg">
              <Heart className="w-4 h-4 text-pink-500 mb-1" />
              <div className="text-xs text-gray-600">Lifesteal</div>
              <div className="font-bold">{player.lifesteal}%</div>
              {player.lifesteal > 0 && (
                <div className="text-xs text-pink-600">
                  +{Math.ceil((player.lifesteal / 100) * player.maxHealth)} HP/kill
                </div>
              )}
            </div>
            
            <div className="flex flex-col items-center justify-center p-2 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg">
              <Crosshair className="w-4 h-4 text-indigo-500 mb-1" />
              <div className="text-xs text-gray-600">Piercing</div>
              <div className="font-bold">{player.piercing}</div>
            </div>
            
            <div className="flex flex-col items-center justify-center p-2 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg">
              <Skull className="w-4 h-4 text-purple-500 mb-1" />
              <div className="text-xs text-gray-600">Room</div>
              <div className="font-bold">{room.number}</div>
              {room.isBoss && <div className="text-xs text-red-600 font-bold">BOSS</div>}
            </div>
            
            <div className="flex flex-col items-center justify-center p-2 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg">
              <Coins className="w-4 h-4 text-yellow-600 mb-1" />
              <div className="text-xs text-gray-600">Coins</div>
              <div className="font-bold">{coinsEarned} 🪙</div>
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

            {/* Player */}
            <motion.div
              className="absolute bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center shadow-lg border-4 border-white"
              style={{
                width: PLAYER_SIZE,
                height: PLAYER_SIZE,
                left: player.x - PLAYER_SIZE / 2,
                top: player.y - PLAYER_SIZE / 2,
              }}
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 0.5 }}
            >
              <span className="text-2xl">{player.cosmetic}</span>
            </motion.div>

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
                  left: particle.x - particle.size / 2,
                  top: particle.y - particle.size / 2,
                  backgroundColor: particle.color,
                  opacity: particle.life / particle.maxLife
                }}
              />
            ))}

            {/* Enemies */}
            {enemies.map(enemy => (
              <motion.div
                key={enemy.id}
                className={`absolute rounded-full flex items-center justify-center shadow-lg border-2 ${
                  enemy.type === 'ghost' ? 'border-gray-400 opacity-70' : 'border-gray-800'
                }`}
                style={{
                  width: enemy.size,
                  height: enemy.size,
                  left: enemy.x - enemy.size / 2,
                  top: enemy.y - enemy.size / 2,
                  backgroundColor: enemy.color,
                }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ 
                  scale: 1, 
                  opacity: enemy.type === 'ghost' ? 0.7 : 1,
                  rotate: enemy.type === 'brute' ? 0 : 360 
                }}
                transition={{ 
                  scale: { duration: 0.3, ease: 'backOut' },
                  opacity: { duration: 0.3 },
                  rotate: { repeat: Infinity, duration: 2, ease: 'linear' }
                }}
              >
                <span className={enemy.isBoss ? "text-3xl" : "text-xl"}>
                  {getEnemyEmoji(enemy)}
                </span>
                {/* Enemy health bar */}
                <div className="absolute -top-6 left-0 right-0">
                  <div className="w-full bg-gray-800 rounded-full h-1">
                    <div 
                      className="bg-red-500 h-1 rounded-full transition-all"
                      style={{ width: `${(enemy.health / enemy.maxHealth) * 100}%` }}
                    />
                  </div>
                </div>
                {/* Enemy type and damage indicator */}
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs whitespace-nowrap bg-black bg-opacity-75 text-white px-1 py-0.5 rounded pointer-events-none">
                  DMG: {Math.round(enemy.damage)}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Controls hint */}
        <div className="text-center text-sm text-gray-700 bg-white rounded-lg p-2 flex items-center justify-center gap-4 flex-wrap">
          <span>🎮 Use Arrow Keys or WASD to move</span>
          <span>•</span>
          <span>🎯 Auto-shooting {weapon.emoji} at enemies!</span>
          {player.lifesteal > 0 && (
            <>
              <span>•</span>
              <span>🩸 +{player.lifesteal} HP per hit</span>
            </>
          )}
          {player.piercing > 0 && (
            <>
              <span>•</span>
              <span>➡️ Projectiles pierce {player.piercing} enemies</span>
            </>
          )}
          {(player.poisonStacks || 0) > 0 && (
            <>
              <span>•</span>
              <span className="text-green-600">☠️ Poisoned ({Math.round(player.poisonStacks || 0)} stacks)</span>
            </>
          )}
          {player.confusedUntil && Date.now() < player.confusedUntil && (
            <>
              <span>•</span>
              <span className="text-purple-600 font-bold animate-pulse">😵 CONFUSED - Controls Inverted!</span>
            </>
          )}
          <span>•</span>
          <div className="flex items-center gap-1">
            <Coins className="w-4 h-4 text-yellow-600" />
            <span>{coinsEarned} 🪙</span>
          </div>
        </div>
      </div>

      {/* Quit Confirmation Dialog */}
      <AlertDialog open={showQuitDialog} onOpenChange={setShowQuitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Quit to Menu?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to quit this run? You'll lose all progress in this game, but you'll keep any coins you've earned so far ({coinsEarned} 🪙).
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