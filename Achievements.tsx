import { Achievement } from '../types/game';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';
import { Lock, Trophy } from 'lucide-react';
import { achievementManager } from '../utils/achievementManager';
import { AchievementDetail } from './AchievementDetail';
import { useState } from 'react';

interface AchievementsProps {
  achievements: Achievement[];
  onClose: () => void;
  unlockedCosmetics: string[];
}

export function Achievements({ achievements, onClose, unlockedCosmetics }: AchievementsProps) {
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  
  // Filter out the platinum trophy from the count (it's a meta-achievement)
  const countableAchievements = achievements.filter(a => a.id !== 'plat');
  const unlockedCount = countableAchievements.filter(a => a.unlocked).length;
  const totalCount = countableAchievements.length;
  const percentage = Math.round((unlockedCount / totalCount) * 100);

  // Show detail view if an achievement is selected
  if (selectedAchievement) {
    return (
      <AchievementDetail 
        achievement={selectedAchievement} 
        onBack={() => setSelectedAchievement(null)}
        unlockedCosmetics={unlockedCosmetics}
      />
    );
  }

  const categories = {
    combat: achievements.filter(a => 
      a.requirement.type === 'kills' || 
      a.requirement.type === 'bosses'
    ),
    progression: achievements.filter(a => 
      a.requirement.type === 'rooms' || 
      a.requirement.type === 'difficulty'
    ),
    collection: achievements.filter(a => 
      a.requirement.type === 'coins' || 
      a.requirement.type === 'cosmetic' || 
      a.requirement.type === 'weapon'
    ),
    special: achievements.filter(a => 
      a.requirement.type === 'special'
    ),
  };

  return (
    <div 
      className="min-h-screen p-8"
      style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-4xl text-white mb-2">🏆 Achievements</h1>
            <p className="text-white/80">
              {unlockedCount} / {totalCount} Unlocked ({percentage}%)
            </p>
          </div>
          <Button onClick={onClose} variant="secondary">
            Close
          </Button>
        </div>

        <div className="grid gap-6">
          {Object.entries(categories).map(([category, achievementList]) => (
            <Card key={category} className="p-6">
              <h2 className="text-2xl mb-4 capitalize">{category}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {achievementList.map(achievement => (
                  <AchievementCard 
                    key={achievement.id} 
                    achievement={achievement}
                    onClick={() => setSelectedAchievement(achievement)}
                  />
                ))}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

function AchievementCard({ achievement, onClick }: { achievement: Achievement; onClick: () => void }) {
  const isLocked = !achievement.unlocked;
  const isHidden = achievement.hidden && isLocked;
  const progress = achievementManager.getProgress(achievement.id);

  return (
    <Card 
      className={`p-4 transition-all cursor-pointer hover:scale-105 ${
        isLocked ? 'opacity-60 bg-muted hover:opacity-80' : 'border-yellow-500/50 shadow-lg hover:shadow-xl'
      }`}
      onClick={onClick}
    >
      <div className="flex gap-3">
        <div className="text-4xl">
          {isHidden ? '❓' : achievement.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="truncate">
              {isHidden ? '???' : achievement.name}
            </h3>
            {achievement.unlocked && (
              <Trophy className="size-4 text-yellow-500 flex-shrink-0" />
            )}
            {isLocked && (
              <Lock className="size-4 text-muted-foreground flex-shrink-0" />
            )}
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {isHidden ? 'Hidden achievement' : achievement.description}
          </p>
          {progress && !isHidden && (
            <div className="mt-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                <span>Progress</span>
                <span>{Math.min(progress.current, progress.required)}/{progress.required}</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all ${
                    achievement.unlocked ? 'bg-yellow-500' : 'bg-primary'
                  }`}
                  style={{ width: `${Math.min((progress.current / progress.required) * 100, 100)}%` }}
                />
              </div>
            </div>
          )}
          {!isLocked && !progress && (
            <Badge variant="secondary" className="mt-2">
              Unlocked
            </Badge>
          )}
        </div>
      </div>
    </Card>
  );
}
