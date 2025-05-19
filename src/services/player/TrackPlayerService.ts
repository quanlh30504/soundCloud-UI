import TrackPlayer, { Capability, RatingType, RepeatMode, State, Track, AppKilledPlaybackBehavior } from "react-native-track-player";
import { trackApi } from "../api";
import { likedTracksApi } from "../../services/api";
import { SongData } from "types/zing";
import { historyApi } from "../api";

export interface TrackInfo {
  id: string;
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
        compactCapabilities: [Capability.Play, Capability.Pause],
        android: {
        // This is the default behavior
            appKilledPlaybackBehavior: AppKilledPlaybackBehavior.StopPlaybackAndRemoveNotification
        },
        ratingType: RatingType.Heart,
      });

      this.isInitialized = true;

      return true;
    } catch (error) {
      console.error("Error setting up TrackPlayer:", error);
      return false;
    }
  }

  public async addTracks(tracks: Track[]): Promise<void> {
    try {
      await TrackPlayer.add(tracks);
    } catch (error) {
      console.error("Error adding tracks:", error);
    }
  }

  public async getPlayBackState(): Promise<State> {
    try {
      const state = await TrackPlayer.getPlaybackState();
      return state.state;
    } catch (error) {
      console.error("Error getting playback state:", error);
      return State.None;
    }
  }

  public async togglePlayback(): Promise<boolean> {
    try {
      const state = await this.getPlayBackState();
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
      const currentIndex = await this.getCurrentTrackIndex();
      const queue = await TrackPlayer.getQueue();
      if (currentIndex !== null && currentIndex < queue.length - 1) {
        await TrackPlayer.skip(0);
      } else {
        await TrackPlayer.skipToNext();
      }
    } catch (error) {
      console.error("Error skipping to previous track:", error);
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
    }
  }

  public async seekTo(position: number): Promise<void> {
    try {
      await TrackPlayer.seekTo(position);
    } catch (error) {
      console.error("Error seeking:", error);
    }
  }

  public async playTrack(track: SongData): Promise<void> {
    try {
      const streamingUrl = (await trackApi.getTrackStreamUrl(track.encodeId)).data;
      if (!streamingUrl) {
        console.error('Failed to get streaming URL');
        return;
      }
      await TrackPlayer.reset();
      await TrackPlayer.add({
        id: track.encodeId,
        url: streamingUrl?.[320] || streamingUrl?.[128],
        title: track.title,
        artist: track.artistsNames,
        artwork: track.thumbnailM,
      });
      await TrackPlayer.play();
      console.log('all infor:', track);
    } catch (error) {
      console.error('Error playing track:', error);
    }
  }

  public async skipToTrack(trackId: string): Promise<void> {
    try {
      const index = await this.getTrackIndexFromID(trackId);
      if (index !== null) {
        await TrackPlayer.skip(index);
      }
    } catch (error) {
      console.error("Error skipping to track:", error);
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

  private async getCurrentTrackIndex(): Promise<number | undefined> {
    try {
      const index = await TrackPlayer.getActiveTrackIndex();
      return index;
    } catch (error) {
      console.error("Error getting current track index:", error);
      return undefined;
    }
  }

  public async getCurrentTrackInfo(): Promise<TrackInfo | null> {
    try {      
      const trackIndex = await this.getCurrentTrackIndex();

      if (trackIndex !== undefined) {
        const track = await TrackPlayer.getTrack(trackIndex);
        
        if (track) {
          return {
            id: track.id || "",
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
          id: firstTrack.id || "",
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

  public async getCurrentTrackId(): Promise<string | null> {
    try {
      const track = await TrackPlayer.getActiveTrack();
      if (track) {
        return track.id;
      }
      return null;
    } catch (error) {
      console.error("Error getting current track ID:", error);
      return null;
    }
  }

  public async getTrackIndexFromID(trackId: string): Promise<number | null> {
    try {
      const queue = await TrackPlayer.getQueue();
      const trackIndex = queue.findIndex((track) => track.id === trackId);
      return trackIndex !== -1 ? trackIndex : null;
    } catch (error) {
      console.error("Error getting track index:", error);
      return null;
    }
  }

  public async isTrackLiked(trackId: string | null): Promise<boolean> {
    try {
      if (!trackId) return false;
      
      // First check if the track has rating set in the player
      const trackIndex = await this.getTrackIndexFromID(trackId);
      if (trackIndex !== null) {
        const track = await TrackPlayer.getTrack(trackIndex);
        if (track && track.rating && track.rating === 1) {
          return true;
        }
      }
      
      // If no rating found in player metadata, check with API
      const response = await likedTracksApi.isTrackInLikedTracks(trackId);
      return response.data;
    } catch (error) {
      console.error("Error checking if track is liked:", error);
      return false;
    }
  }
  
  public async likeTrack(trackId: string | null): Promise<boolean> {
    try {
      if (!trackId) return false;
      await likedTracksApi.addSongToLikedTracks(trackId);

      // Update track metadata
      const trackIndex = await this.getTrackIndexFromID(trackId);
      if (trackIndex !== null) {
        const track = await TrackPlayer.getTrack(trackIndex);
        await TrackPlayer.updateMetadataForTrack(trackIndex, {
          ...track,
          rating: 1,
        });
      }

      return true;
    } catch (error) {
      console.error("Error liking track:", error);
      return false;
    }
  }
  
  public async unlikeTrack(trackId: string | null): Promise<boolean> {
    try {
      if (!trackId) return false;
      
      // Call API to unlike the track
      await likedTracksApi.deleteSongFromLikedTracks(trackId);
      
      // Update track metadata
      const trackIndex = await this.getTrackIndexFromID(trackId);
      if (trackIndex !== null) {
        const track = await TrackPlayer.getTrack(trackIndex);
        await TrackPlayer.updateMetadataForTrack(trackIndex, { ...track, rating: 0 });
      }
      
      return true;
    } catch (error) {
      console.error("Error unliking track:", error);
      return false;
    }
  }
  
  public async toggleLikeTrack(trackId: string | null): Promise<boolean> {
    try {
      if (!trackId) return false;
      
      const isLiked = await this.isTrackLiked(trackId);
      if (isLiked) {
        return await this.unlikeTrack(trackId);
      } else {
        return await this.likeTrack(trackId);
      }
    } catch (error) {
      console.error("Error toggling like:", error);
      return false;
    }
  }

  public async moveTrackInQueue(fromIndex: number, toIndex: number): Promise<boolean> {
    try {
      // Get the current active track index to ensure we don't disrupt playback
      const currentIndex = await this.getCurrentTrackIndex();
      if (currentIndex === null) return false;

      console.log(`Moving track from index ${fromIndex} to index ${toIndex}`);
      console.log(`Current active track index: ${currentIndex}`);

      // Only allow moving tracks that are after the current track
      if (fromIndex <= currentIndex) {
        console.warn("Cannot move tracks before or at the current track position");
        return false;
      }

      // Get the current queue
      const queue = await TrackPlayer.getQueue();
      if (fromIndex >= queue.length || toIndex >= queue.length) {
        console.error("Invalid index for queue movement");
        return false;
      }

      // Make sure we're not moving a track to before the current track
      if (toIndex <= currentIndex) {
        console.warn("Cannot move track to before or at the current track position");
        return false;
      }

      // Remove the track from its current position
      const trackToMove = queue[fromIndex];
      console.log('Track to move:', trackToMove.title);
      
      // Use TrackPlayer's methods to reorder the queue
      await TrackPlayer.remove(fromIndex);
      await TrackPlayer.add(trackToMove, toIndex > fromIndex ? toIndex - 1 : toIndex);
      
      console.log('Queue movement successful');
      return true;
    } catch (error) {
      console.error("Error moving track in queue:", error);
      return false;
    }
  }

  public async getQueueWithStatus(): Promise<{ 
    beforeActive: Track[], 
    active: Track | null, 
    afterActive: Track[] 
  }> {
    try {
      const queue = await TrackPlayer.getQueue();
      const currentIndex = await this.getCurrentTrackIndex();
      // const currentIndex = await TrackPlayer.getActiveTrackIndex();
      console.log(`Current track index: ${currentIndex}`);

      if (currentIndex === undefined) {
        return { beforeActive: [], active: null, afterActive: queue };
      }

      return {
        beforeActive: queue.slice(0, currentIndex),
        active: queue[currentIndex] || null,
        afterActive: queue.slice(currentIndex + 1),
      };
    } catch (error) {
      console.error("Error getting queue with status:", error);
      return { beforeActive: [], active: null, afterActive: [] };
    }
  }

  // Clears the current queue and adds the supplied tracks to the now empty queue.
  public async setQueue(tracks: Track[]): Promise<void> {
    try {
      await TrackPlayer.setQueue(tracks);
      await TrackPlayer.play();
    } catch (error) {
      console.error("Error setting queue:", error);
    }
  }

  //Replaces the current track with the supplied track or creates a track when the queue is empty.
  public async loadTrack(track: Track): Promise<void> {
    try {
      TrackPlayer.load(track);
      TrackPlayer.play();
    } catch (error) {
      console.error("Error loading track:", error);
    }
  }

  public async setRepeatMode(mode: RepeatMode): Promise<void> {
    try {
      await TrackPlayer.setRepeatMode(mode);
    } catch (error) {
      console.error("Error setting repeat mode:", error);
    }
  }

  public async getRepeatMode(): Promise<RepeatMode> {
    try {
      return await TrackPlayer.getRepeatMode();
    } catch (error) {
      console.error("Error getting repeat mode:", error);
      return RepeatMode.Off;
    }
  }

  // đảo các bài sau bài đang phát trong queue, giữ nguyên thứ tự các bài trước bài đang phát
  public async shuffleNextInQueue(): Promise<void> {
    try {
      const queue = await TrackPlayer.getQueue();
      const currentIndex = await this.getCurrentTrackIndex();

      if (currentIndex === undefined || currentIndex >= queue.length - 1) {
        console.warn("No tracks to shuffle after the current track");
        return;
      }

      const nextTracks = queue.slice(currentIndex + 1);
      const shuffledTracks = nextTracks.sort(() => Math.random() - 0.5);

      // Remove the original next tracks from the queue
      const nextTracksIndexRaw = await Promise.all(
        nextTracks.map(track => this.getTrackIndexFromID(track.id))
      );
      const nextTracksIndex = nextTracksIndexRaw.filter(
        (index): index is number => index !== null
      );
      await TrackPlayer.remove(nextTracksIndex);
      
      // Add the shuffled tracks back to the queue
      await TrackPlayer.add(shuffledTracks);
    } catch (error) {
      console.error("Error shuffling next tracks in queue:", error);
    }
  }

}

export default TrackPlayerService.getInstance();