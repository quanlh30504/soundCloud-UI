import axiosInstance from '../config/axios';
import { User } from '../types/user';

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

// Track API
export const trackApi = {
  // Lấy danh sách track
  getTracks: (params?: any) => axiosInstance.get('/tracks', { params }),
  
  // Lấy thông tin chi tiết track
  getTrackById: (id: string) => axiosInstance.get(`/tracks/${id}`),
  
  // Tạo track mới
  createTrack: (data: any) => axiosInstance.post('/tracks', data),
  
  // Cập nhật track
  updateTrack: (id: string, data: any) => axiosInstance.put(`/tracks/${id}`, data),
  
  // Xóa track
  deleteTrack: (id: string) => axiosInstance.delete(`/tracks/${id}`),
  
  // Like/Unlike track
  toggleLike: (id: string) => axiosInstance.post(`/tracks/${id}/toggle-like`),
};

// Playlist API
export const playlistApi = {
  // Lấy danh sách playlist
  getPlaylists: (params?: any) => axiosInstance.get('/playlists', { params }),
  
  // Lấy thông tin chi tiết playlist
  getPlaylistById: (id: string) => axiosInstance.get(`/playlists/${id}`),
  
  // Tạo playlist mới
  createPlaylist: (data: any) => axiosInstance.post('/playlists', data),
  
  // Cập nhật playlist
  updatePlaylist: (id: string, data: any) => axiosInstance.put(`/playlists/${id}`, data),
  
  // Xóa playlist
  deletePlaylist: (id: string) => axiosInstance.delete(`/playlists/${id}`),
  
  // Thêm track vào playlist
  addTrackToPlaylist: (playlistId: string, trackId: string) => 
    axiosInstance.post(`/playlists/${playlistId}/tracks/${trackId}`),
  
  // Xóa track khỏi playlist
  removeTrackFromPlaylist: (playlistId: string, trackId: string) => 
    axiosInstance.delete(`/playlists/${playlistId}/tracks/${trackId}`),
};

// Search API
export const searchApi = {
  // Tìm kiếm
  search: (query: string, params?: any) => 
    axiosInstance.get('/search', { params: { q: query, ...params } }),
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



export const searchAll = async (query: string) => {
  try {
    const response = await axiosInstance.get('/zingMp3/search/multi', {
      params: { query}
    });
    return response.data;
  } catch (error) {
    console.error('Error searching all:', error);
    throw error;
  }
}

export const searchSongs = async (query, page = 1, count = 18) => {
  try {
    const response = await axiosInstance.get('/zingMp3/search', {
      params: { type: 'song', query, page, count }
    });
    return response.data;
  } catch (error) {
    console.error('Error searching songs:', error);
    throw error;
  }
}

export const searchPlaylists = async (query, page = 1, count = 18) => {
  try {
    const response = await axiosInstance.get('/zingMp3/search', {
      params: { type: 'playlist', query, page, count }
    });
    return response.data;
  } catch (error) {
    console.error('Error searching playlists:', error);
    throw error;
  }
}

export const searchArtists = async (query, page = 1, count = 18) => {
  try {
    const response = await axiosInstance.get('/zingMp3/search', {
      params: { type: 'artist', query, page, count }
    });
    return response.data;
  } catch (error) {
    console.error('Error searching artists:', error);
    throw error;
  }
}

export const getStreamingUrl = async (zingId: string) => {
  try {
    const response = await axiosInstance.get(`/zingMp3/song/streamUrl/${zingId}`);
    console.log('Streaming URL response:', response.data);
    return response.data['128'];
  } catch (error) {
    console.error('Error getting streaming URL:', error);
    throw error;
  }
}

export const getTrackInfo = async (trackId: string) => {
  try {
    const response = await axiosInstance.get(`/zingMp3/song/info/${trackId}`);
    return response.data;
  } catch (error) {
    console.error('Error getting track info:', error);
    throw error;
  }
};

export const getTrackLyrics = async (trackId: string) => {
  try {
    const response = await axiosInstance.get(`zingMp3/song/lyrics/${trackId}`);
    console.log('Track lyrics response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error getting track lyrics:', error);
    throw error;
  }
}
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