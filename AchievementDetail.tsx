import { Achievement } from '../types/game';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Lock, Trophy, ArrowLeft } from 'lucide-react';
import { achievementManager } from '../utils/achievementManager';
import { WEAPONS } from '../data/weapons';
import { COSMETICS } from '../data/cosmetics';

interface AchievementDetailProps {
  achievement: Achievement;
  onBack: () => void;
  unlockedCosmetics: string[];
}

export function AchievementDetail({ achievement, onBack, unlockedCosmetics }: AchievementDetailProps) {
  const isLocked = !achievement.unlocked;
  const isHidden = achievement.hidden && isLocked;
  const progress = achievementManager.getProgress(achievement.id);
  const weaponsUsed = achievementManager.getWeaponsUsed();

  const renderRequirementDetails = () => {
    const req = achievement.requirement;

    // For weapon achievements, show which weapons haven't been used
    if (req.type === 'weapon' && !achievement.unlocked) {
      const unusedWeapons = WEAPONS.filter(w => !weaponsUsed.includes(w.id));
      const needed = (req.value as number) - weaponsUsed.length;
      
      return (
        <div className="mt-6">
          <h3 className="text-xl mb-3">Weapons to Use ({needed} more needed)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-64 overflow-y-auto">
            {unusedWeapons.slice(0, needed + 5).map(weapon => (
              <Card key={weapon.id} className="p-3 flex items-center gap-2">
                <span className="text-2xl">{weapon.emoji}</span>
                <div className="flex-1">
                  <p className="font-medium">{weapon.name}</p>
                  <p className="text-xs text-muted-foreground">{weapon.description}</p>
                </div>
              </Card>
            ))}
            {unusedWeapons.length > needed + 5 && (
              <p className="text-sm text-muted-foreground col-span-2 text-center py-2">
                ...and {unusedWeapons.length - needed - 5} more weapons
              </p>
            )}
          </div>
        </div>
      );
    }

    // For cosmetic achievements, show which cosmetics haven't been unlocked
    if (req.type === 'cosmetic' && !achievement.unlocked) {
      const lockedCosmetics = COSMETICS.filter(c => !unlockedCosmetics.includes(c.id));
      const currentCount = unlockedCosmetics.length;
      const needed = (req.value as number) - currentCount;
      
      return (
        <div className="mt-6">
          <h3 className="text-xl mb-3">Cosmetics to Unlock ({needed} more needed)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-64 overflow-y-auto">
            {lockedCosmetics.slice(0, needed + 5).map(cosmetic => (
              <Card key={cosmetic.id} className="p-3 flex items-center gap-2">
                <span className="text-2xl">{cosmetic.emoji}</span>
                <div className="flex-1">
                  <p className="font-medium">{cosmetic.name}</p>
                  <p className="text-xs text-muted-foreground">{cosmetic.description}</p>
                  {cosmetic.price > 0 && (
                    <p className="text-xs text-yellow-500 mt-1">💰 {cosmetic.price} coins</p>
                  )}
                </div>
              </Card>
            ))}
            {lockedCosmetics.length > needed + 5 && (
              <p className="text-sm text-muted-foreground col-span-2 text-center py-2">
                ...and {lockedCosmetics.length - needed - 5} more cosmetics
              </p>
            )}
          </div>
        </div>
      );
    }

    // For numeric achievements, show what's needed
    if (progress && !achievement.unlocked) {
      const remaining = progress.required - progress.current;
      let actionText = '';
      
      switch (req.type) {
        case 'kills':
          actionText = `Defeat ${remaining} more ${remaining === 1 ? 'enemy' : 'enemies'}`;
          break;
        case 'bosses':
          actionText = `Defeat ${remaining} more ${remaining === 1 ? 'boss' : 'bosses'}`;
          break;
        case 'rooms':
          actionText = `Clear ${remaining} more ${remaining === 1 ? 'room' : 'rooms'}`;
          break;
        case 'coins':
          actionText = `Collect ${remaining} more coins`;
          break;
        case 'special':
          if (req.value === 'reroll-25') {
            actionText = `Reroll ${remaining} more times`;
          } else if (req.value === 'local-coop-10') {
            actionText = `Play ${remaining} more local co-op ${remaining === 1 ? 'game' : 'games'}`;
          } else if (req.value === 'untouchable') {
            actionText = `Clear ${remaining} more ${remaining === 1 ? 'room' : 'rooms'} without taking damage`;
          }
          break;
      }
      
      if (actionText) {
        return (
          <div className="mt-6">
            <Card className="p-4 bg-primary/10 border-primary">
              <p className="text-center">
                <span className="text-2xl mr-2">🎯</span>
                {actionText}
              </p>
            </Card>
          </div>
        );
      }
    }

    // For special achievements without numeric progress
    if (req.type === 'special' && !achievement.unlocked) {
      let hint = '';
      
      switch (req.value) {
        case 'complete-game':
          hint = 'Complete all 15 rooms and defeat the final boss';
          break;
        case 'speedrun':
          hint = 'Complete the entire game in under 15 minutes';
          break;
        case 'tank':
          hint = 'Upgrade your max health to 200 or higher during a run';
          break;
        case 'glass-cannon':
          hint = 'Upgrade your damage to 50 or higher during a run';
          break;
        case 'controller':
          hint = 'Complete a full game using a PS3/PS4/PS5/Xbox controller';
          break;
        case 'local-coop-complete':
          hint = 'Complete all 15 rooms in local co-op mode';
          break;
        case 'reverse-complete':
          hint = 'Complete all rooms in Reverse mode (start at room 15)';
          break;
        case 'achievements-35':
          hint = `Unlock all ${achievementManager.getRemainingCount()} remaining achievements`;
          break;
      }
      
      if (hint) {
        return (
          <div className="mt-6">
            <Card className="p-4 bg-blue-500/10 border-blue-500">
              <p className="text-center">
                <span className="text-2xl mr-2">💡</span>
                {hint}
              </p>
            </Card>
          </div>
        );
      }
    }

    // For difficulty achievements
    if (req.type === 'difficulty' && !achievement.unlocked) {
      const difficultyNames = {
        easy: 'Easy',
        normal: 'Normal',
        hard: 'Hard',
        milk: 'MILK (250% difficulty)'
      };
      const diffName = difficultyNames[req.value as keyof typeof difficultyNames];
      
      return (
        <div className="mt-6">
          <Card className="p-4 bg-purple-500/10 border-purple-500">
            <p className="text-center">
              <span className="text-2xl mr-2">🎮</span>
              Complete the game on {diffName} difficulty
            </p>
          </Card>
        </div>
      );
    }

    return null;
  };

  return (
    <div 
      className="min-h-screen p-8"
      style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}
    >
      <div className="max-w-4xl mx-auto">
        <Button onClick={onBack} variant="secondary" className="mb-6">
          <ArrowLeft className="mr-2 size-4" />
          Back to Achievements
        </Button>

        <Card className="p-8">
          <div className="flex items-start gap-6 mb-6">
            <div className="text-7xl">
              {isHidden ? '❓' : achievement.emoji}
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between mb-2">
                <h1 className="text-3xl">
                  {isHidden ? '???' : achievement.name}
                </h1>
                {achievement.unlocked ? (
                  <Trophy className="size-8 text-yellow-500 flex-shrink-0" />
                ) : (
                  <Lock className="size-8 text-muted-foreground flex-shrink-0" />
                )}
              </div>
              <p className="text-muted-foreground text-lg">
                {isHidden ? 'This achievement is hidden. Keep playing to discover it!' : achievement.description}
              </p>
              
              {achievement.unlocked && (
                <Badge variant="default" className="mt-4 bg-yellow-500 hover:bg-yellow-600">
                  Unlocked! 🎉
                </Badge>
              )}
            </div>
          </div>

          {!isHidden && (progress || achievement.requirement.type === 'cosmetic' || achievement.unlocked) && (() => {
            // If achievement is unlocked but has no progress tracking, show it as completed
            const displayProgress = achievement.unlocked && !progress && achievement.requirement.type !== 'cosmetic' 
              ? { current: 1, required: 1 }
              : progress || (achievement.requirement.type === 'cosmetic' ? {
                current: unlockedCosmetics.length,
                required: achievement.requirement.value as number
              } : null);
            
            if (!displayProgress) return null;
            
            return (
              <div className="mb-6">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Progress</span>
                  <span>
                    {Math.min(displayProgress.current, displayProgress.required)} / {displayProgress.required}
                    {' '}({Math.min(Math.round((displayProgress.current / displayProgress.required) * 100), 100)}%)
                  </span>
                </div>
                <Progress 
                  value={Math.min((displayProgress.current / displayProgress.required) * 100, 100)} 
                  className="h-3"
                />
              </div>
            );
          })()}

          {!isHidden && renderRequirementDetails()}

          {achievement.unlocked && (
            <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/50 rounded-lg">
              <p className="text-center text-yellow-600 dark:text-yellow-400">
                ✨ Congratulations on unlocking this achievement! ✨
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
