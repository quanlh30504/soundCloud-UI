import axios from "axios";
import { auth } from "./firebase";
import { storageService } from "../services/storage";


const axiosInstance = axios.create({
  baseURL: "http://localhost:8080/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use(
  async (config) => {
    try {
      let token = await storageService.getAuthToken();
      
      if (!token && auth.currentUser) {
        token = await auth.currentUser.getIdToken();
        if (token) {
          await storageService.setAuthToken(token);
        }
      }

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      return config;
    } catch (error) {
      console.error("Error getting auth token:", error);
      return config;
    }
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response) {
      // Xử lý các lỗi HTTP
      switch (error.response.status) {
        case 401:
          // Token hết hạn hoặc không hợp lệ
          try {
            // Xóa token cũ khỏi storage
            await storageService.removeAuthToken();
            
            // Thử refresh token từ Firebase
            const user = auth.currentUser;
            if (user) {
              const newToken = await user.getIdToken(true);
              // Lưu token mới vào storage
              await storageService.setAuthToken(newToken);
              
              // Cập nhật token trong header
              error.config.headers.Authorization = `Bearer ${newToken}`;
              // Thử lại request
              return axiosInstance(error.config);
            } else {
              // Nếu không có user, xóa thông tin user và token
              await storageService.removeUserData();
              await storageService.removeAuthToken();
              // Có thể thêm logic chuyển về màn hình login ở đây
            }
          } catch (refreshError) {
            console.error("Error refreshing token:", refreshError);
            // Xóa dữ liệu xác thực khi không thể refresh
            await storageService.removeUserData();
            await storageService.removeAuthToken();
          }
          break;
        case 403:
          // Không có quyền truy cập
          console.error("Access denied:", error.response.data);
          break;
        case 404:
          // Không tìm thấy resource
          console.error("Resource not found:", error.response.data);
          break;
        case 500:
          // Lỗi server
          console.error("Server error:", error.response.data);
          break;
        default:
          // Xử lý các lỗi khác
          console.error("API error:", error.response.data);
          break;
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
