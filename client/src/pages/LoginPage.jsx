import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await login(username, password);

    setLoading(false);

    if (result.success) {
      const { user } = useAuthStore.getState();
      if (user?.role === "ADMIN") {
        navigate("/dashboard");
      } else {
        navigate("/");
      }
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-yellow via-primary-green to-primary-yellow p-4 overflow-hidden">
      {/* Floating decorations */}
      <img
        src="/sjrb.png"
        className="absolute top-10 left-10 w-24 opacity-10 rotate-12 animate-pulse"
        alt=""
      />
      <img
        src="/sjrb.png"
        className="absolute bottom-16 right-12 w-32 opacity-10 -rotate-12 animate-pulse"
        alt=""
      />

      <div className="w-full max-w-md">
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/40">
          {/* Logo/Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <img
                src="/sjrb.png"
                alt="Super Juice Logo"
                className="w-24 h-auto drop-shadow-md transition-transform duration-300 hover:scale-105"
              />
            </div>

            <h1 className="text-3xl font-heading font-bold bg-gradient-to-r from-primary-yellow to-primary-green bg-clip-text text-transparent mb-2">
              Super Juice
            </h1>
            <p className="text-gray-600">POS System</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white/70 focus:ring-2 focus:ring-primary-yellow focus:border-transparent outline-none transition shadow-sm focus:shadow-md"
                placeholder="Masukkan username"
                required
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white/70 focus:ring-2 focus:ring-primary-yellow focus:border-transparent outline-none transition shadow-sm focus:shadow-md"
                placeholder="Masukkan password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-primary-yellow to-primary-green text-white py-3 rounded-lg font-bold text-lg hover:shadow-xl transition active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <span className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                "Login"
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-white text-sm">
          <p>&copy; 2026 Super Juice. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
