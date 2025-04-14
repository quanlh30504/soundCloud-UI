import TrackPlayer, { Capability, Event, RepeatMode, State, Track } from "react-native-track-player";
import { sampleTracks } from "../../data/tracks/sampleTracks";

export interface TrackInfo {
  title: string;
  artist: string;
  artwork: any;
}

class TrackPlayerService {
  private static instance: TrackPlayerService;
  private isInitialized = false;

  public static getInstance(): TrackPlayerService {
    if (!TrackPlayerService.instance) {
      TrackPlayerService.instance = new TrackPlayerService();
    }
    return TrackPlayerService.instance;
  }

  public async setup(): Promise<boolean> {
    if (this.isInitialized) return true;
    
    try {
      await TrackPlayer.setupPlayer();
      await TrackPlayer.updateOptions({
        capabilities: [
          Capability.Play,
          Capability.Pause,
          Capability.SkipToNext,
          Capability.SkipToPrevious,
          Capability.SeekTo,
        ],
      });
      
      // await this.loadSampleTracks();
      
      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error("Error setting up TrackPlayer:", error);
      return false;
    }
  }

  public async loadSampleTracks(): Promise<void> {
    try {
      const queue = await TrackPlayer.getQueue();
      if (queue.length === 0) {
        await this.addTracks(sampleTracks);
        console.log("Sample tracks loaded successfully");
      }
    } catch (error) {
      console.error("Error loading sample tracks:", error);
    }
  }

  public async addTracks(tracks: Track[]): Promise<void> {
    try {
      await TrackPlayer.add(tracks);
    } catch (error) {
      console.error("Error adding tracks:", error);
    }
  }

  public async togglePlayback(): Promise<boolean> {
    try {
      await this.loadSampleTracks();
      
      const state = await TrackPlayer.getState();
      if (state === State.Playing) {
        await TrackPlayer.pause();
        return false;
      } else {
        await TrackPlayer.play();
        return true;
      }
    } catch (error) {
      console.error("Error toggling playback:", error);
      return false;
    }
  }
  
  public async skipToNext(): Promise<void> {
    try {
      const queue = await TrackPlayer.getQueue();
      const currentIndex = await this.getCurrentTrackIndex();
      
      if (currentIndex !== null && currentIndex >= queue.length - 1) {
        await TrackPlayer.skip(0);
      } else {
        await TrackPlayer.skipToNext();
      }
    } catch (error) {
      console.error("Error skipping to next track:", error);
      await this.loadSampleTracks();
    }
  }

  public async skipToPrevious(): Promise<void> {
    try {
      const currentIndex = await this.getCurrentTrackIndex();
      
      if (currentIndex !== null && currentIndex <= 0) {
        const queue = await TrackPlayer.getQueue();
        await TrackPlayer.skip(queue.length - 1);
      } else {
        await TrackPlayer.skipToPrevious();
      }
    } catch (error) {
      console.error("Error skipping to previous track:", error);
      await this.loadSampleTracks();
    }
  }

  public async seekTo(position: number): Promise<void> {
    try {
      await TrackPlayer.seekTo(position);
    } catch (error) {
      console.error("Error seeking:", error);
    }
  }

  // public async playTrack(trackId: string): Promise<void> {
  //   try {
  //     await this.loadSampleTracks();
      
  //     const queue = await TrackPlayer.getQueue();
  //     const trackIndex = queue.findIndex((track) => track.id === trackId);
      
  //     if (trackIndex > -1) {
  //       await TrackPlayer.skip(trackIndex);
  //       await TrackPlayer.play();
  //     } else {
  //       console.warn("Track not found:", trackId);
  //       if (queue.length > 0) {
  //         await TrackPlayer.skip(0);
  //         await TrackPlayer.play();
  //       }
  //     }
  //   } catch (error) {
  //     console.error("Error playing track:", error);
  //   }
  // }

  public async playTrack(trackId: string): Promise<void> {
    try {
      if (!trackId) {
        console.error('Cannot play track: trackId is undefined or null');
        return;
      }
      
      console.log(`Attempting to play track with ID: ${trackId}`);
      
      if (!this.isInitialized) {
        const setupSuccess = await this.setup();
        if (!setupSuccess) {
          console.error('Failed to initialize player when playing track');
          return;
        }
      }
      
      const queue = await TrackPlayer.getQueue();
      console.log(`Current queue has ${queue.length} tracks`);
      
      const trackIndex = queue.findIndex((track) => 
        track.id === trackId || 
        (track.metadata && track.metadata.spotifyId === trackId)
      );
      console.log(`Track index in queue: ${trackIndex}`);
      
      if (trackIndex > -1) {
        await TrackPlayer.skip(trackIndex);
        await TrackPlayer.play();
        console.log(`Skipped to track at index ${trackIndex} and started playback`);
      } else {
        console.warn(`Track with ID ${trackId} not found in queue`);
        
        if (queue.length === 0) {
          console.warn('Queue is empty, no fallback track to play');
        } else {
          await TrackPlayer.skip(0);
          await TrackPlayer.play();
          console.log('Playing first track in queue as fallback');
        }
      }
      
      const playerState = await TrackPlayer.getState();
      console.log(`Player state after playTrack: ${playerState}`);
      
    } catch (error) {
      console.error("Error playing track:", error);
      
      try {
        await this.setup();
        console.log('Re-initialized player after error');
      } catch (e) {
        console.error('Could not recover player:', e);
      }
    }
  }
  
  public async toggleRepeatMode(): Promise<number> {
    try {
      const currentMode = await TrackPlayer.getRepeatMode();
      const newMode =
        currentMode === RepeatMode.Off
          ? RepeatMode.Track
          : currentMode === RepeatMode.Track
          ? RepeatMode.Queue
          : RepeatMode.Off;
      await TrackPlayer.setRepeatMode(newMode);
      return newMode;
    } catch (error) {
      console.error("Error toggling repeat mode:", error);
      return RepeatMode.Off;
    }
  }

  private async getCurrentTrackIndex(): Promise<number | null> {
    try {
      const index = await TrackPlayer.getCurrentTrack();
      return index;
    } catch (error) {
      console.error("Error getting current track index:", error);
      return null;
    }
  }

  public async getCurrentTrackInfo(): Promise<TrackInfo | null> {
    try {
      await this.loadSampleTracks();
      
      const trackIndex = await this.getCurrentTrackIndex();
      
      if (trackIndex !== null) {
        const track = await TrackPlayer.getTrack(trackIndex);
        
        if (track) {
          return {
            title: track.title || "Unknown Title",
            artist: track.artist || "Unknown Artist",
            artwork: track.artwork || null,
          };
        }
      }
      
      const queue = await TrackPlayer.getQueue();
      if (queue.length > 0) {
        const firstTrack = queue[0];
        return {
          title: firstTrack.title || "Unknown Title",
          artist: firstTrack.artist || "Unknown Artist",
          artwork: firstTrack.artwork || null,
        };
      }
      
      return null;
    } catch (error) {
      console.error("Error getting current track info:", error);
      return null;
    }
  }
  
  public async isPlaying(): Promise<boolean> {
    try {
      const state = await TrackPlayer.getState();
      return state === State.Playing;
    } catch (error) {
      console.error("Error checking play state:", error);
      return false;
    }
  }
  
  public async getQueue(): Promise<Track[]> {
    try {
      return await TrackPlayer.getQueue();
    } catch (error) {
      console.error("Error getting queue:", error);
      return [];
    }
  }
}

export default TrackPlayerService.getInstance();