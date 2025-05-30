import AsyncStorage from '@react-native-async-storage/async-storage';

// Các key được sử dụng trong AsyncStorage
const STORAGE_KEYS = {
  AUTH_TOKEN: '@auth_token',
  USER_DATA: '@user_data',
  THEME: '@app_theme',
  PLAYBACK_SETTINGS: '@playback_settings',
  RECENT_SEARCHES: '@recent_searches',
  OFFLINE_TRACKS: '@offline_tracks',
  SLEEP_TIMER: '@sleep_timer',
} as const;

// Hàm helper để lấy offline tracks
const getOfflineTracksHelper = async () => {
  try {
    const tracks = await AsyncStorage.getItem(STORAGE_KEYS.OFFLINE_TRACKS);
    return tracks ? JSON.parse(tracks) : {};
  } catch (error) {
    console.error('Error getting offline tracks:', error);
    throw error;
  }
};

// Service để quản lý AsyncStorage
export const storageService = {
  // Lưu trữ token xác thực
  setAuthToken: async (token: string) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
    } catch (error) {
      console.error('Error saving auth token:', error);
      throw error;
    }
  },

  // Lấy token xác thực
  getAuthToken: async () => {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    } catch (error) {
      console.error('Error getting auth token:', error);
      throw error;
    }
  },

  // Xóa token xác thực
  removeAuthToken: async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    } catch (error) {
      console.error('Error removing auth token:', error);
      throw error;
    }
  },

  // Lưu trữ thông tin người dùng
  setUserData: async (userData: any) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
    } catch (error) {
      console.error('Error saving user data:', error);
      throw error;
    }
  },

  // Lấy thông tin người dùng
  getUserData: async () => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting user data:', error);
      throw error;
    }
  },

  // Xóa thông tin người dùng
  removeUserData: async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA);
    } catch (error) {
      console.error('Error removing user data:', error);
      throw error;
    }
  },

  // Lưu theme
  setTheme: async (theme: 'light' | 'dark') => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.THEME, theme);
    } catch (error) {
      console.error('Error saving theme:', error);
      throw error;
    }
  },

  // Lấy theme
  getTheme: async () => {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.THEME);
    } catch (error) {
      console.error('Error getting theme:', error);
      throw error;
    }
  },

  // Lưu cài đặt phát nhạc
  setPlaybackSettings: async (settings: any) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.PLAYBACK_SETTINGS, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving playback settings:', error);
      throw error;
    }
  },

  // Lấy cài đặt phát nhạc
  getPlaybackSettings: async () => {
    try {
      const settings = await AsyncStorage.getItem(STORAGE_KEYS.PLAYBACK_SETTINGS);
      return settings ? JSON.parse(settings) : null;
    } catch (error) {
      console.error('Error getting playback settings:', error);
      throw error;
    }
  },

  // Lưu tìm kiếm gần đây
  setRecentSearches: async (searches: string[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.RECENT_SEARCHES, JSON.stringify(searches));
    } catch (error) {
      console.error('Error saving recent searches:', error);
      throw error;
    }
  },

  // Lấy tìm kiếm gần đây
  getRecentSearches: async () => {
    try {
      const searches = await AsyncStorage.getItem(STORAGE_KEYS.RECENT_SEARCHES);
      return searches ? JSON.parse(searches) : [];
    } catch (error) {
      console.error('Error getting recent searches:', error);
      throw error;
    }
  },

  // Lưu track để nghe offline
  setOfflineTrack: async (trackId: string, trackData: any) => {
    try {
      const offlineTracks = await getOfflineTracksHelper();
      offlineTracks[trackId] = trackData;
      await AsyncStorage.setItem(STORAGE_KEYS.OFFLINE_TRACKS, JSON.stringify(offlineTracks));
    } catch (error) {
      console.error('Error saving offline track:', error);
      throw error;
    }
  },

  // Lấy danh sách track offline
  getOfflineTracks: getOfflineTracksHelper,

  // Xóa track offline
  removeOfflineTrack: async (trackId: string) => {
    try {
      const offlineTracks = await getOfflineTracksHelper();
      delete offlineTracks[trackId];
      await AsyncStorage.setItem(STORAGE_KEYS.OFFLINE_TRACKS, JSON.stringify(offlineTracks));
    } catch (error) {
      console.error('Error removing offline track:', error);
      throw error;
    }
  },
  // Xóa tất cả dữ liệu
  clearAll: async () => {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Error clearing storage:', error);
      throw error;
    }
  },

  // Lưu sleep timer
  setSleepTimer: async (timerData: any) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.SLEEP_TIMER, JSON.stringify(timerData));
    } catch (error) {
      console.error('Error saving sleep timer:', error);
      throw error;
    }
  },

  // Lấy sleep timer
  getSleepTimer: async () => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.SLEEP_TIMER);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting sleep timer:', error);
      throw error;
    }
  },

  // Xóa sleep timer
  clearSleepTimer: async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.SLEEP_TIMER);
    } catch (error) {
      console.error('Error clearing sleep timer:', error);
      throw error;
    }
  },
};