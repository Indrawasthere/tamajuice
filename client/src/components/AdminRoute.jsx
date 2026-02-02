import { Navigate } from "react-router-dom";
import useAuthStore from "../store/authStore";
import { motion } from "framer-motion";

export default function AdminRoute({ children }) {
  const { isAuthenticated, user, isInitialized } = useAuthStore();

  if (!isInitialized) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-[#FFFBF0]">
        <motion.div
          animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="mb-4"
        >
          <span className="text-5xl"></span>
        </motion.div>
        <p className="text-[#7A9B5E] font-medium tracking-widest animate-pulse">
          Sabar yak
        </p>
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" />;

  if (user?.role !== "ADMIN") return <Navigate to="/" />;

  return children;
}
