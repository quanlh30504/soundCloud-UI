import axios from 'axios';
import { auth } from './firebase';

// Tạo instance của axios với cấu hình mặc định
const axiosInstance = axios.create({
  baseURL: 'http://localhost:8080/api', // Thay đổi URL này thành URL của backend của bạn
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Thêm interceptor để tự động thêm token vào header
axiosInstance.interceptors.request.use(
  async (config) => {
    try {
      const user = auth.currentUser;
      if (user) {
        const token = await user.getIdToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
      return config;
    } catch (error) {
      console.error('Error getting auth token:', error);
      return config;
    }
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Thêm interceptor để xử lý lỗi
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response) {
      // Xử lý các lỗi HTTP
      switch (error.response.status) {
        case 401:
          // Token hết hạn hoặc không hợp lệ
          try {
            // Thử refresh token
            const user = auth.currentUser;
            if (user) {
              await user.getIdToken(true); // Force refresh token
              // Thử lại request
              return axiosInstance(error.config);
            }
          } catch (refreshError) {
            console.error('Error refreshing token:', refreshError);
          }
          break;
        case 403:
          // Không có quyền truy cập
          console.error('Access denied:', error.response.data);
          break;
        case 404:
          // Không tìm thấy resource
          console.error('Resource not found:', error.response.data);
          break;
        case 500:
          // Lỗi server
          console.error('Server error:', error.response.data);
          break;
        default:
          // Xử lý các lỗi khác
          console.error('API error:', error.response.data);
          break;
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance; 