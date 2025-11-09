import { useEffect, useRef, useState } from 'react';
import { Player, Enemy, Room, Weapon, Projectile, Particle } from '../types/game';
import { motion } from 'motion/react';
import { Heart, Shield, Zap, Sword, Skull, Crosshair, Coins } from 'lucide-react';
import { soundManager } from '../utils/soundManager';
import { controllerManager } from '../utils/controllerManager';

interface GameRoomProps {
  player: Player;
  room: Room;
  weapon: Weapon;
  onPlayerUpdate: (player: Player) => void;
  onRoomComplete: (coinsEarned: number) => void;
  onGameOver: (coinsEarned: number) => void;
}

const COINS_PER_ENEMY = 2;
const COINS_PER_BOSS = 10;
const COINS_PER_ROOM = 5;

const ARENA_WIDTH = 800;
const ARENA_HEIGHT = 600;
const PLAYER_SIZE = 40;

export function GameRoom({ player, room, weapon, onPlayerUpdate, onRoomComplete, onGameOver }: GameRoomProps) {
  const [enemies, setEnemies] = useState<Enemy[]>(room.enemies);
  const [projectiles, setProjectiles] = useState<Projectile[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [coinsEarned, setCoinsEarned] = useState(0);
  
  const keysPressed = useRef<Set<string>>(new Set());
  const gameLoopRef = useRef<number>();
  const canvasRef = useRef<HTMLDivElement>(null);
  const lastAttackTimeRef = useRef(0);
  const playerRef = useRef(player);
  const weaponRef = useRef(weapon);
  const obstaclesRef = useRef(room.obstacles); // Fix obstacle glitch - use ref!
  const lastRegenTimeRef = useRef(Date.now());

  // Keep refs updated
  useEffect(() => {
    playerRef.current = player;
  }, [player]);

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
    const newParticles: Particle[] = [];
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
      const speed = 2 + Math.random() * 3;
      newParticles.push({
        id: Math.random().toString(36),
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
    setParticles(prev => [...prev, ...newParticles]);
  };

  useEffect(() => {
    const gameLoop = () => {
      // Update controller state
      controllerManager.update();
      
      const now = Date.now();
      const currentPlayer = playerRef.current;
      const currentWeapon = weaponRef.current;
      
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
        onPlayerUpdate({
          ...currentPlayer,
          health: Math.min(playerMaxHealth, currentPlayer.health + regenRate)
        });
      }
      
      // Auto-attack closest enemy
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
                  id: Math.random().toString(36),
                  x: currentPlayer.x,
                  y: currentPlayer.y,
                  vx,
                  vy,
                  damage: currentWeapon.damage + playerDamage,
                  size: 12,
                  color: currentWeapon.color,
                  emoji: currentWeapon.emoji,
                  isEnemyProjectile: false
                };

                setProjectiles(prev => [...prev, projectile]);
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
                  id: Math.random().toString(36),
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

                setProjectiles(prev => [...prev, enemyProjectile]);
              }
            }
          }
        });

        return currentEnemies;
      });

      // Move player
      let newX = currentPlayer.x;
      let newY = currentPlayer.y;

      // Keyboard movement
      if (keysPressed.current.has('w') || keysPressed.current.has('arrowup')) {
        newY = Math.max(PLAYER_SIZE / 2, currentPlayer.y - playerSpeed);
      }
      if (keysPressed.current.has('s') || keysPressed.current.has('arrowdown')) {
        newY = Math.min(ARENA_HEIGHT - PLAYER_SIZE / 2, currentPlayer.y + playerSpeed);
      }
      if (keysPressed.current.has('a') || keysPressed.current.has('arrowleft')) {
        newX = Math.max(PLAYER_SIZE / 2, currentPlayer.x - playerSpeed);
      }
      if (keysPressed.current.has('d') || keysPressed.current.has('arrowright')) {
        newX = Math.min(ARENA_WIDTH - PLAYER_SIZE / 2, currentPlayer.x + playerSpeed);
      }

      // Controller movement (left stick + d-pad)
      const controllerMovement = controllerManager.getMovement();
      if (controllerMovement.x !== 0 || controllerMovement.y !== 0) {
        newX = Math.max(PLAYER_SIZE / 2, Math.min(ARENA_WIDTH - PLAYER_SIZE / 2, currentPlayer.x + controllerMovement.x * playerSpeed));
        newY = Math.max(PLAYER_SIZE / 2, Math.min(ARENA_HEIGHT - PLAYER_SIZE / 2, currentPlayer.y + controllerMovement.y * playerSpeed));
      }

      // Check player collision with obstacles
      const validPlayerPos = getValidPosition(currentPlayer.x, currentPlayer.y, newX, newY, PLAYER_SIZE, false);
      newX = validPlayerPos.x;
      newY = validPlayerPos.y;

      // Update projectiles
      setProjectiles(prev => {
        return prev
          .map(proj => ({
            ...proj,
            x: proj.x + proj.vx,
            y: proj.y + proj.vy
          }))
          .filter(proj => {
            if (proj.x < 0 || proj.x > ARENA_WIDTH || proj.y < 0 || proj.y > ARENA_HEIGHT) {
              return false;
            }
            
            for (const obstacle of obstaclesRef.current) {
              if (checkCircleRectCollision(proj.x, proj.y, proj.size / 2, obstacle.x, obstacle.y, obstacle.width, obstacle.height)) {
                return false;
              }
            }
            
            return true;
          });
      });

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

      // Accumulate all health changes in this frame
      let totalHealthChange = 0;
      let shouldUpdatePlayer = false;

      // Update enemies and check collisions
      setEnemies(prevEnemies => {
        const updatedEnemies = prevEnemies.map(enemy => {
          // Different movement for different enemy types
          let moveSpeed = enemy.speed;
          
          const dx = newX - enemy.x;
          const dy = newY - enemy.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance === 0) return enemy;
          
          const moveX = (dx / distance) * moveSpeed;
          const moveY = (dy / distance) * moveSpeed;
          
          const targetX = enemy.x + moveX;
          const targetY = enemy.y + moveY;
          
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

        // Check projectile-enemy collisions and enemy projectile-player collisions
        setProjectiles(prevProjectiles => {
          const projectilesToRemove = new Set<string>();
          let healAmount = 0;
          let projectileDamage = 0;

          // Player projectiles hitting enemies
          updatedEnemies.forEach(enemy => {
            prevProjectiles.forEach(proj => {
              if (projectilesToRemove.has(proj.id)) return;
              if (proj.isEnemyProjectile) return; // Skip enemy projectiles

              const dx = proj.x - enemy.x;
              const dy = proj.y - enemy.y;
              const distance = Math.sqrt(dx * dx + dy * dy);

              if (distance < enemy.size / 2 + proj.size / 2) {
                enemy.health -= proj.damage;
                projectilesToRemove.add(proj.id);
                createBloodParticles(enemy.x, enemy.y, 6);
                soundManager.playHitSound();
              }
            });
          });

          // Enemy projectiles hitting player
          prevProjectiles.forEach(proj => {
            if (!proj.isEnemyProjectile) return;
            if (projectilesToRemove.has(proj.id)) return;
            
            const dx = proj.x - newX;
            const dy = proj.y - newY;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < PLAYER_SIZE / 2 + proj.size / 2) {
              const damageReduction = Math.min(playerDefense * 0.02, 0.75);
              const damageTaken = Math.max(1, proj.damage * (1 - damageReduction));
              projectileDamage += damageTaken;
              
              projectilesToRemove.add(proj.id);
              createBloodParticles(newX, newY, 3);
              soundManager.playHitSound();
            }
          });

          // Accumulate total health change
          totalHealthChange += healAmount - projectileDamage;
          shouldUpdatePlayer = true;

          return prevProjectiles.filter(p => !projectilesToRemove.has(p.id));
        });

        // Check enemy-player collisions
        let collisionDamage = 0;

        updatedEnemies.forEach(enemy => {
          const dx = newX - enemy.x;
          const dy = newY - enemy.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const collisionDistance = (PLAYER_SIZE + enemy.size) / 2;

          if (distance < collisionDistance) {
            const damageReduction = Math.min(playerDefense * 0.02, 0.75);
            const damageTaken = Math.max(1, enemy.damage * (1 - damageReduction));
            collisionDamage += damageTaken * 0.016;
            
            // Thorns damage
            if (thorns > 0) {
              const reflectDamage = damageTaken * (thorns / 100);
              enemy.health -= reflectDamage;
            }
            
            if (Math.random() < 0.1) {
              createBloodParticles(newX, newY, 3);
            }
          }
        });

        // Apply collision damage
        totalHealthChange -= collisionDamage;

        // Calculate final health
        const finalHealth = Math.max(0, Math.min(playerMaxHealth, currentPlayer.health + totalHealthChange));

        if (finalHealth <= 0) {
          onGameOver(coinsEarned);
          return updatedEnemies;
        }

        // Remove dead enemies and award coins
        const aliveEnemies = updatedEnemies.filter(enemy => {
          if (enemy.health <= 0) {
            createBloodParticles(enemy.x, enemy.y, 12);
            soundManager.playDeathSound();
            const coinReward = enemy.isBoss ? COINS_PER_BOSS : COINS_PER_ENEMY;
            setCoinsEarned(prev => prev + coinReward);
            
            // Apply lifesteal: heal % of max health per kill
            if (playerLifesteal > 0) {
              healAmount += (playerLifesteal / 100) * playerMaxHealth;
            }
            
            return false;
          }
          return true;
        });

        // Check for room completion
        if (aliveEnemies.length === 0 && prevEnemies.length > 0) {
          soundManager.playRoomClearSound();
          const roomBonus = COINS_PER_ROOM;
          const totalCoins = coinsEarned + roomBonus;
          setCoinsEarned(totalCoins);
          setTimeout(() => onRoomComplete(totalCoins), 500);
        }

        // Single player update per frame with all accumulated changes
        onPlayerUpdate({
          ...currentPlayer,
          x: newX,
          y: newY,
          health: finalHealth
        });

        return aliveEnemies;
      });

      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoopRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [onPlayerUpdate, onRoomComplete, onGameOver, coinsEarned]);

  const getEnemyEmoji = (enemy: Enemy) => {
    if (enemy.isBoss) return '👹';
    switch (enemy.type) {
      case 'brute': return '💪';
      case 'shortie': return '🐁';
      case 'ranged': return '🏹';
      case 'ghost': return '👻';
      default: return '👾';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: room.backgroundColor }}>
      <div className="space-y-4 w-full max-w-5xl">
        {/* HUD */}
        <div className="bg-white rounded-2xl shadow-lg p-4">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-center">
            <div className="space-y-1">
              <div className="flex items-center justify-center gap-2">
                <Heart className="w-5 h-5 text-red-500" />
                <span className="text-sm">Health</span>
              </div>
              <div className="text-2xl">{Math.ceil(player.health)}/{player.maxHealth}</div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-red-500 to-pink-500 h-2 rounded-full transition-all"
                  style={{ width: `${(player.health / player.maxHealth) * 100}%` }}
                />
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center justify-center gap-2">
                <Sword className="w-5 h-5 text-orange-500" />
                <span className="text-sm">Weapon</span>
              </div>
              <div className="text-2xl">{weapon.emoji}</div>
              <div className="text-xs text-gray-600">{weapon.name}</div>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center justify-center gap-2">
                <Zap className="w-5 h-5 text-yellow-500" />
                <span className="text-sm">Damage</span>
              </div>
              <div className="text-2xl">{weapon.damage + player.damage}</div>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center justify-center gap-2">
                <Crosshair className="w-5 h-5 text-purple-500" />
                <span className="text-sm">Range</span>
              </div>
              <div className="text-2xl">{weapon.range}</div>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center justify-center gap-2">
                <Shield className="w-5 h-5 text-blue-500" />
                <span className="text-sm">Defense</span>
              </div>
              <div className="text-2xl">{player.defense}</div>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center justify-center gap-2">
                <Skull className="w-5 h-5 text-purple-500" />
                <span className="text-sm">Room</span>
              </div>
              <div className="text-2xl">{room.number}/15</div>
              {room.isBoss && <div className="text-xs text-red-600">👹 BOSS</div>}
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
                animate={{ rotate: enemy.type === 'brute' ? 0 : 360 }}
                transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
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
              </motion.div>
            ))}
          </div>
        </div>

        {/* Controls hint */}
        <div className="text-center text-sm text-gray-700 bg-white rounded-lg p-2 flex items-center justify-center gap-4">
          <span>🎮 Use Arrow Keys or WASD to move</span>
          <span>•</span>
          <span>🎯 Auto-shooting {weapon.emoji} at enemies!</span>
          <span>•</span>
          <div className="flex items-center gap-1">
            <Coins className="w-4 h-4 text-yellow-600" />
            <span>{coinsEarned} 🪙</span>
          </div>
        </div>
      </div>
    </div>
  );
}
