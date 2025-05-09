import axios from 'axios';
import { API_BASE_URL } from '../../config/constants';
import { authHeader } from './authHeader';

export const playlistApi = {
  // Add a track to a playlist
  addTrackToOwnPlaylist: (playlistId: string, spotifyId: string) => {
    return axios.post(
      `${API_BASE_URL}/api/own-playlists/${playlistId}/tracks/${spotifyId}`,
      {}, // Empty body
      { headers: authHeader() }
    );
  },
  
  // Other existing methods...
};