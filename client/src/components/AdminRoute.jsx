import { Navigate } from "react-router-dom";
import useAuthStore from "../store/authStore";

export default function AdminRoute({ children }) {
  const { isAuthenticated, user, isInitialized } = useAuthStore();

  if (!isInitialized) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#FFFBF0]">
        <p className="text-[#7A9B5E] font-bold animate-pulse">Sabar yak</p>
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" />;

  if (user?.role !== "ADMIN") return <Navigate to="/" />;

  return children;
}
