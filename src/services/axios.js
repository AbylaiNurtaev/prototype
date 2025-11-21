import axios from "axios";

// Базовый URL API
const API_BASE_URL = "https://api.btc.coder.services/api";

// Создаём экземпляр axios с базовой конфигурацией
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000, // 30 секунд
});

// Interceptor для обработки ответов (только для ошибок)
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Специальная обработка для 401 (Blocked)
      if (error.response.status === 401) {
        error.isBlocked = true;
        error.message = "API Error: 401 - User is blocked";
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
