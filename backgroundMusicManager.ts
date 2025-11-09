class BackgroundMusicManager {
  private audio: HTMLAudioElement | null = null;
  private musicVolume = 0.5;
  private isMuted = false;
  private isPlaying = false;
  private loadError = false;
  private isReady = false;
  private pendingPlay = false;

  initialize(audioUrl: string): boolean {
    if (!audioUrl || audioUrl.trim() === '') {
      console.warn('No audio URL provided for background music');
      return false;
    }

    try {
      if (!this.audio) {
        this.audio = new Audio();
        this.audio.loop = true; // Enable looping
        this.audio.volume = this.musicVolume;
        this.audio.preload = 'auto'; // Start loading immediately
        
        // Handle loading errors gracefully
        this.audio.addEventListener('error', (e) => {
          console.warn('Background music file not accessible');
          this.loadError = true;
          this.isPlaying = false;
          this.isReady = false;
          this.pendingPlay = false;
        });
        
        // Start playing as soon as enough data is available (faster start)
        this.audio.addEventListener('canplay', () => {
          this.isReady = true;
          console.log('%c🎵 Background Music: Ready to play!', 'color: #10b981; font-weight: bold');
          
          // If play was requested while loading, start now
          if (this.pendingPlay && !this.isPlaying) {
            this.play();
          }
        });
        
        this.audio.addEventListener('canplaythrough', () => {
          console.log('%c✅ Background Music: Fully loaded and looping enabled!', 'color: #10b981');
          this.loadError = false;
        });

        // Ensure loop continues
        this.audio.addEventListener('ended', () => {
          console.log('Track ended - looping...');
          if (this.audio && this.audio.loop) {
            this.audio.currentTime = 0;
            this.audio.play().catch(console.warn);
          }
        });

        // Prevent unexpected pauses - auto-resume if paused unexpectedly
        this.audio.addEventListener('pause', () => {
          // Only auto-resume if we think we should be playing
          if (this.isPlaying && !this.isMuted && !this.loadError) {
            console.log('Music paused unexpectedly - resuming...');
            setTimeout(() => {
              if (this.audio && this.isPlaying) {
                this.audio.play().catch(() => {
                  // Silently fail if auto-resume doesn't work
                });
              }
            }, 100);
          }
        });

        // Handle audio stalling/waiting
        this.audio.addEventListener('waiting', () => {
          console.log('Music buffering...');
        });

        this.audio.addEventListener('playing', () => {
          console.log('Music playing');
        });

        // Set the source and immediately start loading
        this.audio.src = audioUrl;
        this.audio.load();
      }
      return true;
    } catch (error) {
      console.warn('Failed to initialize background music:', error);
      this.loadError = true;
      return false;
    }
  }

  hasLoadError(): boolean {
    return this.loadError;
  }

  play() {
    // Don't try to play if there was a load error
    if (this.loadError) {
      return;
    }
    
    if (!this.audio) {
      return;
    }

    // If audio is not ready yet, mark as pending
    if (!this.isReady) {
      this.pendingPlay = true;
      console.log('Audio still loading - will play when ready');
      return;
    }

    // Clear pending flag since we're playing now
    this.pendingPlay = false;
    
    if (!this.isPlaying) {
      const playPromise = this.audio.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            this.isPlaying = true;
            console.log('Background music started and looping');
          })
          .catch((error) => {
            // Only log autoplay errors, not load errors (those are already logged)
            if (error.name !== 'NotSupportedError') {
              console.warn('Background music autoplay prevented:', error.message);
            }
            // Mark as pending so it will try again on user interaction
            this.pendingPlay = true;
          });
      }
    }
  }

  pause() {
    if (this.audio && this.isPlaying) {
      this.audio.pause();
      this.isPlaying = false;
    }
  }

  stop() {
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
      this.isPlaying = false;
    }
  }

  setVolume(volume: number) {
    this.musicVolume = Math.max(0, Math.min(1, volume));
    if (this.audio && !this.isMuted) {
      this.audio.volume = this.musicVolume;
    }
  }

  getVolume(): number {
    return this.musicVolume;
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.audio) {
      this.audio.volume = this.isMuted ? 0 : this.musicVolume;
    }
    return this.isMuted;
  }

  setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.audio) {
      this.audio.volume = muted ? 0 : this.musicVolume;
    }
  }

  isMusicMuted(): boolean {
    return this.isMuted;
  }

  isMusicPlaying(): boolean {
    return this.isPlaying;
  }

  // Restart playback (useful when user interacts with the page)
  resume() {
    this.play();
  }

  destroy() {
    if (this.audio) {
      this.stop();
      this.audio.src = '';
      this.audio = null;
    }
  }
}

export const backgroundMusicManager = new BackgroundMusicManager();