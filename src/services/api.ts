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