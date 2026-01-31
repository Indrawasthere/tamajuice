import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

export default function OrdersPage() {
  const navigate = useNavigate();
  const { logout } = useAuthStore();

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-green-50">
      <div className="bg-gradient-to-r from-primary-yellow to-primary-green text-white p-4 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-3xl font-heading font-bold">Riwayat Orders</h1>
          <div className="flex gap-4">
            <button
              onClick={() => navigate("/dashboard")}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm"
            >
              Dashboard
            </button>
            <button
              onClick={logout}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-6">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="text-6xl mb-4"></div>
          <h2 className="text-2xl font-bold mb-2">Coming Soon</h2>
          <p className="text-gray-600">
            Bentar yak masih development ini buat admin ngeliat history ordernya
          </p>
        </div>
      </div>
    </div>
  );
}
