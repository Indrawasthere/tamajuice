import { Navigate } from "react-router-dom";
import useAuthStore from "../store/authStore";

export default function PrivateRoute({ children }) {
  const { isAuthenticated, isInitialized, user } = useAuthStore();

  if (!isInitialized) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#FFFBF0]">
        <p className="text-[#7A9B5E] font-bold animate-pulse">
          Loading data...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (user?.role === "ADMIN" && window.location.pathname === "/") {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
