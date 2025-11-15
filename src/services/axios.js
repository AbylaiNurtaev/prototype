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

// Interceptor для логирования запросов
axiosInstance.interceptors.request.use(
  (config) => {
    console.log("🌐 API Request:", {
      method: config.method?.toUpperCase(),
      url: config.baseURL + config.url,
      params: config.params,
      data: config.data,
    });
    return config;
  },
  (error) => {
    console.error("❌ Request Error:", error);
    return Promise.reject(error);
  }
);

// Interceptor для обработки ответов
axiosInstance.interceptors.response.use(
  (response) => {
    console.log("✅ API Response:", {
      status: response.status,
      data: response.data,
      url: response.config.url,
    });
    return response;
  },
  (error) => {
    if (error.response) {
      console.error("❌ API Error:", {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        url: error.config?.url,
      });

      // Специальная обработка для 401 (Blocked)
      if (error.response.status === 401) {
        error.isBlocked = true;
        error.message = "API Error: 401 - User is blocked";
      }
    } else if (error.request) {
      console.error("❌ Network Error:", error.message);
    } else {
      console.error("❌ Request Setup Error:", error.message);
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
