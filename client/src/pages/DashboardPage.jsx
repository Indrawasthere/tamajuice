import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { formatRupiah } from '../lib/format';
import api from '../lib/api';
import { useNavigate } from 'react-router-dom';

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/analytics/dashboard');
      setStats(response.data.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-green-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-yellow to-primary-green text-white p-4 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-heading font-bold">📊 Dashboard Admin</h1>
            <p className="text-sm opacity-90">Jus Buah Tama</p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm transition"
            >
              Counter
            </button>
            <span className="text-sm">Admin: {user?.name}</span>
            <button
              onClick={logout}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm transition"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-gray-500 text-sm mb-2">Hari Ini</h3>
            <p className="text-3xl font-bold text-primary-yellow mb-1">
              {formatRupiah(stats?.today?.revenue || 0)}
            </p>
            <p className="text-sm text-gray-600">{stats?.today?.orders || 0} transaksi</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-gray-500 text-sm mb-2">Bulan Ini</h3>
            <p className="text-3xl font-bold text-primary-green mb-1">
              {formatRupiah(stats?.thisMonth?.revenue || 0)}
            </p>
            <p className="text-sm text-gray-600">{stats?.thisMonth?.orders || 0} transaksi</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-gray-500 text-sm mb-2">Total</h3>
            <p className="text-3xl font-bold text-gray-800 mb-1">
              {formatRupiah(stats?.allTime?.revenue || 0)}
            </p>
            <p className="text-sm text-gray-600">{stats?.allTime?.orders || 0} transaksi</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-heading font-bold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={() => navigate('/orders')}
              className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg hover:shadow-md transition text-left"
            >
              <div className="text-2xl mb-2">📋</div>
              <p className="font-semibold text-sm">Lihat Orders</p>
            </button>
            <button
              onClick={() => navigate('/products')}
              className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg hover:shadow-md transition text-left"
            >
              <div className="text-2xl mb-2">🍊</div>
              <p className="font-semibold text-sm">Kelola Produk</p>
            </button>
            <button
              onClick={() => navigate('/')}
              className="p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg hover:shadow-md transition text-left"
            >
              <div className="text-2xl mb-2">💰</div>
              <p className="font-semibold text-sm">Counter/POS</p>
            </button>
            <button className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg hover:shadow-md transition text-left">
              <div className="text-2xl mb-2">⚙️</div>
              <p className="font-semibold text-sm">Settings</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
