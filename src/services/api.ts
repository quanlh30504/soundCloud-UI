import axiosInstance from '../config/axios';
import { User } from '../types/user';
import { CreatePlaylistDTO, PagedResponse, Playlist, Track } from '../types/playlist';
import { SongData, Artist, Album,
  Genre, Composer, StreamData,
  SyncResponse, Top100, HubDetail,
  ChartHomeData, ChartItemInfo, WeekChartInfo } from '../types/zing';

// User API
export const userApi = {
  // Lấy thông tin user
  getProfile: () => axiosInstance.get('/users/profile'),
  
  // Cập nhật thông tin user
  updateProfile: (data: any) => axiosInstance.put('/users/profile', data),
  
  // Lấy danh sách bài hát đã thích
  getLikedTracks: () => axiosInstance.get('/users/liked-tracks'),
  
  // Lấy danh sách playlist
  getPlaylists: () => axiosInstance.get('/users/playlists'),
  
  // Lấy danh sách người theo dõi
  getFollowing: () => axiosInstance.get('/users/following'),
};

// Playlist API
export const playlistApi = {
  // Get personal playlists
  getOwnPlaylists: (page = 0, size = 20, sortBy = 'createdAt', direction = 'desc') => 
    axiosInstance.get<PagedResponse<Playlist>>('/own-playlists/me', { 
      params: { page, size, sortBy, direction } 
    }),
  
  // Get details of a playlist
  getOwnPlaylistById: (id: string) => 
    axiosInstance.get<Playlist>(`/own-playlists/${id}`),
  
  // Get tracks in a playlist
  getOwnPlaylistTracks: (playlistId: string, page = 0, size = 20, sortBy = 'name', direction = 'asc') => 
    axiosInstance.get<PagedResponse<Track>>(`/own-playlists/${playlistId}/tracks`, { 
      params: { page, size, sortBy, direction } 
    }),
  
  // Create a new playlist
  createOwnPlaylist: (data: CreatePlaylistDTO) => 
    axiosInstance.post<Playlist>('/own-playlists', data),
  
  // Add track to a playlist
  addTrackToOwnPlaylist: (playlistId: string, spotifyId: string) => 
    axiosInstance.post(`/own-playlists/${playlistId}/tracks/${spotifyId}`),
  
  // Remove track from a playlist
  removeTrackFromOwnPlaylist: (playlistId: string, trackId: number) => 
    axiosInstance.delete(`/own-playlists/${playlistId}/tracks/${trackId}`),
  
  // Delete a playlist
  deleteOwnPlaylist: (playlistId: string) => 
    axiosInstance.delete(`/own-playlists/${playlistId}`),
};

// Auth API
export const authApi = {
  // Đăng ký người dùng mới
  syncUser: async (userData: User) => {
    try {
      const response = await axiosInstance.post('/users/sync', userData);
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  // Lấy thông tin người dùng bằng Firebase UID
  getUserByFirebaseUid: async (firebaseUid: string) => {
    try {
      const response = await axiosInstance.get('/auth/user', {
        params: { firebaseUid }
      });
      return response.data;
    } catch (error) {
      console.error('Get user error:', error);
      throw error;
    }
  }
}; 

// =========================

export const homeApi = {
  getTop100: async () => {
    try {
      const response = await axiosInstance.get('zingMp3/home/top100');
      return response.data;
    } catch (error) {
      console.error('Error getting top 100:', error);
      throw error;
    }
  },

  getHubDetailChill: async () => {
    try {
      const response = await axiosInstance.get('zingMp3/home/hub-detail/chill');
      return response.data;
    } catch (error) {
      console.error('Error getting hub detail chill:', error);
      throw error;
    }
  },

  getRecommendSongs: async () => {
    try {
      const response = await axiosInstance.get('zingMp3/home/recommend');
      return response.data;
    } catch (error) {
      console.error('Error getting recommend songs:', error);
      throw error;
    }
  },
   getNewRelease: async (type) => {
    try {
      const response = await axiosInstance.get('zingMp3/home/new-release', {
        params: { type },
      });
      return response.data;
    } catch (error) {
      console.error('Error getting new release:', error);
      throw error;
    }
   },
   
   getNewReleaseTop100: async () => {
    try {
      const response = await axiosInstance.get('zingMp3/home/new-release/top100');
      return response.data;
    } catch (error) {
      console.error('Error getting new release top 100:', error);
      throw error;
    }
   },
};

export const artistApi = {
  getArtistInfo: async (alias) => {
    try {
      const response = await axiosInstance.get('zingMp3/artist/info', {
        params: { alias},
      });
      return response.data;
    } catch (error) {
      console.error('Error getting artist info:', error);
      throw error;
    }
  },

  getArtistSongs: async (artistId, page = 1, count = 15) => {
    try {
      const response = await axiosInstance.get('zingMp3/artist/songs', {
        params: {artistId, page, count},
      });
      return response.data;
    } catch (error) {
      console.error('Error getting artist songs:', error);
      throw error;
    }
  },

  getArtistPlaylists: async (artistId, page = 1, count = 15) => {
    try {
      const response = await axiosInstance.get('zingMp3/artist/playlists', {
        params: { artistId, page, count },
      });
      return response.data;
    } catch (error) {
      console.error('Error getting artist playlists:', error);
      throw error;
    }
  },
};

//============================
export const trackApi = {
  //Get track stream URL
  getTrackStreamUrl: (trackId: string) => 
    axiosInstance.get<StreamData>(`/zingMp3/song/streamUrl/${trackId}`),

  //Get track info
  getTrackInfo: (trackId: string) => 
    axiosInstance.get<SongData>(`/zingMp3/song/info/${trackId}`),

  //Get track lyrics
  getTrackLyrics: (trackId: string) => 
    axiosInstance.get<string>(`/zingMp3/song/lyrics/${trackId}`),

  //Sync track to db (save record to db if not exist)
  syncTrackToDb: (trackId: string) =>
    axiosInstance.post(`/zingMp3/sync/${trackId}`),
};

type searchType = 'song' | 'playlist' | 'artist';

// // Search API
export const searchApi = {
  //search all
  searchAll: (query: string) => 
    axiosInstance.get('/zingMp3/search/multi', { params: { query } }),

  //search type
  searchType: (query: string, type: searchType, page: number=0, size: number=20) => 
    axiosInstance.get('/zingMp3/search', { params: { type, query, page, count: size } }),
}

// // Zing Playlist API
export const zingPlaylistApi = {
  //Get playlist info
  getPlaylistInfo: (playlistId: string) => 
    axiosInstance.get(`/zingMp3/playlist/info`, { params: { id: playlistId } }),
};

// // user-mics API
export const userHistoryApi = {
  //Add song to listen history
  addSongToListenHistory: (trackId: string) => 
    axiosInstance.post(`/zingMp3/history/${trackId}`),

  //Get listen history
  getListenHistory: (page: number=0, size: number=20) => 
    axiosInstance.get(`/zingMp3/history`, { params: { page, size } }),

  //Delete song from listen history
  deleteListenHistory: () =>
    axiosInstance.delete(`/zingMp3/history`),

  //Delete song from listen history
  deleteSongFromListenHistory: (trackId: string) => 
    axiosInstance.delete(`/zingMp3/history/tracks/${trackId}`),
};

// // Liked tracks API
export const likedTracksApi = {
  //Add song to liked tracks
  addSongToLikedTracks: (trackId: string) => 
    axiosInstance.post(`/own-playlists/liked-tracks/${trackId}`),

  //Get liked tracks
  getLikedTracks: (page: number=0, size: number=100) => 
    axiosInstance.get<PagedResponse<Track>>(`/own-playlists/liked-tracks`, { params: { page, size } }),

  //Delete song from liked tracks
  deleteSongFromLikedTracks: (trackId: string) => 
    axiosInstance.delete(`/own-playlists/liked-tracks/${trackId}`),

  isTrackInLikedTracks: (trackId: string) => 
    axiosInstance.get<boolean>(`/own-playlists/liked-tracks/${trackId}/is-liked`),
};

//===home===//

//TODO: chart