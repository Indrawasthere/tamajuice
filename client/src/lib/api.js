import axios from "axios";

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    "https://tamajuice-production-d60b.up.railway.app/api",
  withCredentials: false,
});

api.interceptors.request.use(
  (config) => {
    console.log(`➡️ ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error("Request error:", error);
    return Promise.reject(error);
  },
);

api.interceptors.response.use(
  (response) => {
    console.log(`✅ ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error(
      `❌ ${error.response?.status || "Network"} ${error.config?.url}`,
    );
    console.error("Error details:", error.response?.data);

    // JANGAN auto logout dulu
    return Promise.reject(error);
  },
);

export default api;
