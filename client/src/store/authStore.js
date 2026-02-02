import { create } from "zustand";
import api from "../lib/api";

const useAuthStore = create((set, get) => ({
  user: null,
  token: localStorage.getItem("token"),
  isAuthenticated: !!localStorage.getItem("token"),
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
        loading: false,
      });

      return true;
    } catch (err) {
      set({ loading: false });
      throw err;
    }
  },

  logout: () => {
    console.log("🟡 Logging out...");
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    set({
      user: null,
      token: null,
      isAuthenticated: false,
    });
  },

  checkAuth: async () => {
    const token = localStorage.getItem("token");
    console.log("🟡 checkAuth - token exists:", !!token);

    if (!token) {
      set({
        user: null,
        token: null,
        isAuthenticated: false,
      });
      return false;
    }

    try {
      const res = await api.get("/auth/me");

      set({
        user: res.data.data,
        token,
        isAuthenticated: true,
      });

      return true;
    } catch (err) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      set({
        user: null,
        token: null,
        isAuthenticated: false,
      });

      return false;
    }
  },
}));

export default useAuthStore;
