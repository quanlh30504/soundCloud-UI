import { storageService } from '../storage';

export interface SleepTimerOptions {
  duration: number; // minutes
  stopAtEndOfTrack: boolean;
}

class SleepTimerService {
  private static instance: SleepTimerService;
  private sleepTimestamp: number | null = null;
  private stopAtEndOfTrack: boolean = false;
  private isActive: boolean = false;

  public static getInstance(): SleepTimerService {
    if (!SleepTimerService.instance) {
      SleepTimerService.instance = new SleepTimerService();
    }
    return SleepTimerService.instance;
  }

  public async setSleepTimer(options: SleepTimerOptions): Promise<void> {
    try {
      const now = Date.now();
      this.sleepTimestamp = now + (options.duration * 60 * 1000); // convert minutes to milliseconds
      this.stopAtEndOfTrack = options.stopAtEndOfTrack;
      this.isActive = true;

      // Persist sleep timer data
      await storageService.setSleepTimer({
        timestamp: this.sleepTimestamp,
        stopAtEndOfTrack: this.stopAtEndOfTrack,
        isActive: this.isActive,
      });

      console.log(`Sleep timer set for ${options.duration} minutes`);
    } catch (error) {
      console.error('Error setting sleep timer:', error);
      throw error;
    }
  }

  public async clearSleepTimer(): Promise<void> {
    try {
      this.sleepTimestamp = null;
      this.stopAtEndOfTrack = false;
      this.isActive = false;

      await storageService.clearSleepTimer();
      console.log('Sleep timer cleared');
    } catch (error) {
      console.error('Error clearing sleep timer:', error);
      throw error;
    }
  }

  public async initializeFromStorage(): Promise<void> {
    try {
      const timerData = await storageService.getSleepTimer();
      if (timerData && timerData.isActive) {
        // Check if the stored timer is still valid (not expired)
        if (timerData.timestamp > Date.now()) {
          this.sleepTimestamp = timerData.timestamp;
          this.stopAtEndOfTrack = timerData.stopAtEndOfTrack;
          this.isActive = true;
        } else {
          // Timer expired while app was closed, clear it
          await this.clearSleepTimer();
        }
      }
    } catch (error) {
      console.error('Error initializing sleep timer from storage:', error);
    }
  }

  public shouldPausePlayback(): boolean {
    if (!this.isActive || !this.sleepTimestamp) {
      return false;
    }

    const now = Date.now();
    return now >= this.sleepTimestamp;
  }

  public shouldStopAtEndOfTrack(): boolean {
    return this.stopAtEndOfTrack && this.isActive;
  }
  public getTimeRemaining(): number {
    if (!this.isActive || !this.sleepTimestamp) {
      return 0;
    }

    const now = Date.now();
    const remaining = Math.max(0, this.sleepTimestamp - now);
    return remaining / (60 * 1000); // return as decimal minutes for better precision
  }

  public isTimerActive(): boolean {
    return this.isActive;
  }

  public getSleepTimestamp(): number | null {
    return this.sleepTimestamp;
  }

  // This method should be called when a track ends to check if we should stop
  public async onTrackEnd(): Promise<boolean> {
    if (this.stopAtEndOfTrack && this.shouldPausePlayback()) {
      await this.clearSleepTimer();
      return true; // Should stop playback
    }
    return false;
  }
}

export default SleepTimerService.getInstance();
