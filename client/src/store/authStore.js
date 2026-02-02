import { create } from "zustand";
import api from "../lib/api";
const useAuthStore = create((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isInitialized: false,
  loading: false,

  login: async (username, password) => {
    set({ loading: true });

    try {
      const res = await api.post("/auth/login", { username, password });

      const { token, user } = res.data.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      set({
        user,
        token,
        isAuthenticated: true,
        isInitialized: true,
        loading: false,
      });

      return { success: true };
    } catch (err) {
      set({ loading: false });
      return {
        success: false,
        message:
          err.response?.data?.message || "Koneksi ke server bermasalah, Bre!",
      };
    }
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    set({ user: null, token: null, isAuthenticated: false });
  },

  checkAuth: () => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");

    if (token && user) {
      try {
        set({
          token,
          user: JSON.parse(user),
          isAuthenticated: true,
          isInitialized: true,
        });
      } catch (e) {
        localStorage.clear();
        set({ isInitialized: true });
      }
    } else {
      set({ isInitialized: true });
    }
  },
}));

export default useAuthStore;
