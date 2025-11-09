import { useEffect, useState } from 'react';
import { backgroundMusicManager } from '../utils/backgroundMusicManager';
import { Volume2, VolumeX } from 'lucide-react';
import { Button } from './ui/button';
import { Slider } from './ui/slider';

interface BackgroundMusicPlayerProps {
  audioUrl: string | null;
  autoPlay?: boolean;
}

export function BackgroundMusicPlayer({ audioUrl, autoPlay = true }: BackgroundMusicPlayerProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(30);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Initialize custom background music
    if (audioUrl) {
      const success = backgroundMusicManager.initialize(audioUrl);
      if (success) {
        backgroundMusicManager.setVolume(volume / 100);
        if (autoPlay) {
          // Try to start immediately
          backgroundMusicManager.play();
        }
      }
      setIsInitialized(true);
    }

    // Add multiple listeners to catch any user interaction and start music ASAP
    const handleFirstInteraction = () => {
      if (autoPlay) {
        // Always try to resume/play on first interaction
        backgroundMusicManager.play();
      }
    };

    // Listen to multiple event types to catch first interaction quickly
    const eventTypes = ['click', 'keydown', 'touchstart', 'mousedown'];
    eventTypes.forEach(type => {
      document.addEventListener(type, handleFirstInteraction, { once: true });
    });

    return () => {
      eventTypes.forEach(type => {
        document.removeEventListener(type, handleFirstInteraction);
      });
    };
  }, [audioUrl, autoPlay, volume]);

  const handleToggleMute = () => {
    const muted = backgroundMusicManager.toggleMute();
    setIsMuted(muted);
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    
    backgroundMusicManager.setVolume(newVolume / 100);
    
    // Unmute if volume is changed
    if (isMuted && newVolume > 0) {
      setIsMuted(false);
      backgroundMusicManager.setMuted(false);
    }
  };

  if (!isInitialized) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-purple-900/80 backdrop-blur-sm border-2 border-purple-400 rounded-lg p-3 flex items-center gap-3 shadow-lg">
      <Button
        onClick={handleToggleMute}
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-white hover:bg-purple-700"
        title={isMuted ? 'Unmute music' : 'Mute music'}
      >
        {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
      </Button>
      
      <div className="flex items-center gap-2 min-w-[120px]">
        <Slider
          value={[isMuted ? 0 : volume]}
          onValueChange={handleVolumeChange}
          max={100}
          step={1}
          className="w-full"
          title="Adjust volume"
        />
        <span className="text-xs text-white min-w-[3ch]">{Math.round(isMuted ? 0 : volume)}</span>
      </div>

      <span 
        className="text-xs text-purple-300 hidden sm:block"
        title="Custom background music playing"
      >
        🎵
      </span>
    </div>
  );
}
