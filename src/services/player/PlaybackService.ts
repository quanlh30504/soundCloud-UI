import TrackPlayer, { Event, Track, State } from 'react-native-track-player';
import { userHistoryApi, likedTracksApi, trackApi } from 'services/api';

module.exports = async function() {

  TrackPlayer.addEventListener(Event.RemotePlay, () => TrackPlayer.play());
  TrackPlayer.addEventListener(Event.RemotePause, () => TrackPlayer.pause());
  TrackPlayer.addEventListener(Event.RemoteNext, () => TrackPlayer.skipToNext());
  TrackPlayer.addEventListener(Event.RemotePrevious, () => TrackPlayer.skipToPrevious());
  TrackPlayer.addEventListener(Event.RemoteSeek, (data) => {
    const position = data.position;
    TrackPlayer.seekTo(position);
  });

  TrackPlayer.addEventListener(Event.PlaybackActiveTrackChanged, async (data) => {
    console.log('Active track changed:', data.track?.title);
    if (data.track && data.index) {
      if (!data.track.rating || data.track.rating === undefined) {
        console.log('Track not in liked tracks:', data.track.title);
        const isLiked = await likedTracksApi.isTrackInLikedTracks(data.track.id);
        TrackPlayer.updateMetadataForTrack(data.index, {
          ...data.track,
          rating: isLiked ? 1 : 0,
        });
      }
      await trackApi.syncTrackToDb(data.track.id);
      await userHistoryApi.addSongToListenHistory(data.track.id);
    }
  }); 
};