// Sound Manager for game audio effects
// This manager provides basic sound effects for the game
// Background music is handled separately by backgroundMusicManager

class SoundManager {
  private context: AudioContext | null = null;
  private initialized = false;

  initialize(): void {
    if (this.initialized) return;
    
    try {
      // Create audio context on user interaction
      if (typeof window !== 'undefined' && 'AudioContext' in window) {
        this.context = new (window.AudioContext || (window as any).webkitAudioContext)();
        this.initialized = true;
      }
    } catch (error) {
      console.warn('Failed to initialize audio context:', error);
    }
  }

  private playTone(frequency: number, duration: number, type: OscillatorType = 'sine', volume = 0.1): void {
    if (!this.context) return;

    try {
      const oscillator = this.context.createOscillator();
      const gainNode = this.context.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.context.destination);

      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, this.context.currentTime);

      gainNode.gain.setValueAtTime(volume, this.context.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + duration);

      oscillator.start(this.context.currentTime);
      oscillator.stop(this.context.currentTime + duration);
    } catch (error) {
      // Silently fail - sound effects are not critical
    }
  }

  playBackgroundMusic(): void {
    // Background music is handled by BackgroundMusicPlayer component
    // This is a stub to prevent errors
  }

  stopBackgroundMusic(): void {
    // Background music is handled by BackgroundMusicPlayer component
    // This is a stub to prevent errors
  }

  playBossMusic(): void {
    // Boss music could be added later if needed
    // For now, this is a stub
  }

  playAttackSound(): void {
    this.playTone(400, 0.1, 'square', 0.05);
  }

  playHitSound(): void {
    this.playTone(200, 0.1, 'sawtooth', 0.08);
  }

  playDeathSound(): void {
    if (!this.context) return;
    
    try {
      // Descending tone for death
      const oscillator = this.context.createOscillator();
      const gainNode = this.context.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.context.destination);

      oscillator.type = 'sawtooth';
      oscillator.frequency.setValueAtTime(300, this.context.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(50, this.context.currentTime + 0.3);

      gainNode.gain.setValueAtTime(0.1, this.context.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + 0.3);

      oscillator.start(this.context.currentTime);
      oscillator.stop(this.context.currentTime + 0.3);
    } catch (error) {
      // Silently fail
    }
  }

  playPowerUpSound(): void {
    if (!this.context) return;
    
    try {
      // Ascending tone for power-up
      const oscillator = this.context.createOscillator();
      const gainNode = this.context.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.context.destination);

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(400, this.context.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(800, this.context.currentTime + 0.2);

      gainNode.gain.setValueAtTime(0.15, this.context.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + 0.2);

      oscillator.start(this.context.currentTime);
      oscillator.stop(this.context.currentTime + 0.2);
    } catch (error) {
      // Silently fail
    }
  }

  playRoomClearSound(): void {
    if (!this.context) return;
    
    try {
      // Victory fanfare - three ascending notes
      const notes = [523.25, 659.25, 783.99]; // C, E, G
      
      notes.forEach((frequency, index) => {
        const oscillator = this.context!.createOscillator();
        const gainNode = this.context!.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.context!.destination);

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(frequency, this.context!.currentTime + index * 0.15);

        gainNode.gain.setValueAtTime(0.12, this.context!.currentTime + index * 0.15);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.context!.currentTime + index * 0.15 + 0.3);

        oscillator.start(this.context!.currentTime + index * 0.15);
        oscillator.stop(this.context!.currentTime + index * 0.15 + 0.3);
      });
    } catch (error) {
      // Silently fail
    }
  }

  destroy(): void {
    if (this.context) {
      this.context.close();
      this.context = null;
      this.initialized = false;
    }
  }
}

export const soundManager = new SoundManager();
