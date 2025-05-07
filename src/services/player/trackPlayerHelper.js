import { getTrackInfo } from '../../services/api';
import { convertPathToUrl } from '../../ultis/convertUrl';
import TrackPlayer from 'react-native-track-player';

export const loadAndPlayTrack = async (
  track, 
  setLoadingId = null,
  navigation = null,
  maxAttempts = 10,
  pollingInterval = 4000
) => {
  try {
    const trackId = track.spotifyId || track.id;
    if (!trackId) {
      console.error('Track ID not found');
      return false;
    }
    
    // Set loading state if provided
    if (setLoadingId) setLoadingId(trackId);
    console.log('Loading track:', track);
    
    let trackInfo = await getTrackInfo(trackId);
    let streamUrl;

    let attempts = 0;
    while (!trackInfo.filePath && attempts < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, pollingInterval));
      trackInfo = await getTrackInfo(trackId);
      attempts++;
      console.log(`Polling attempt ${attempts}/${maxAttempts}`);
    }

    if (!trackInfo.filePath) {
      if (setLoadingId) setLoadingId(null);
      throw new Error('Bài hát chưa được load.');
    }

    streamUrl = trackInfo.filePath;
    const newTrack = {
      id: trackId,
      url: String(convertPathToUrl(streamUrl)),
      title: trackInfo.name,
      artist: trackInfo.artists?.join(' & ') || 'Unknown Artist',
      artwork: track.albumImages?.[0]?.url || '',
    };

    console.log('New track ready to play:', newTrack);
    
    await TrackPlayer.reset();
    
    await TrackPlayer.add(newTrack);
    await new Promise(resolve => setTimeout(resolve, 300));
    await TrackPlayer.play();
    
    if (setLoadingId) setLoadingId(null);
    
    // Navigate to player screen if navigation provided
    // if (navigation) {
    //   navigation.navigate('MusicPlayer');
    // }
    
    return true;
  } catch (error) {
    if (setLoadingId) setLoadingId(null);
    console.error('Error playing track:', error);
    return false;
  }
};

export const playFirstTrack = async (tracks, setLoadingId = null, navigation = null) => {
  if (!tracks || tracks.length === 0) {
    console.error('No tracks available to play');
    return false;
  }
  
  return await loadAndPlayTrack(tracks[0], setLoadingId, navigation);
};