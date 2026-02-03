import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  ShoppingBag,
  DollarSign,
  Calendar,
  ChevronRight,
  Activity,
  AlertTriangle,
  ArrowUpRight,
  ArrowUp,
  ArrowDown,
  Minus,
} from "lucide-react";
import useAuthStore from "../store/authStore";
import { formatRupiah } from "../lib/format";
import Sidebar from "../components/Sidebar";
import api from "../lib/api";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/90 backdrop-blur-md border border-slate-200 p-4 rounded-2xl shadow-xl">
        <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-2">
          {label}
        </p>
        {payload.map((p, i) => (
          <div key={i} className="flex items-center gap-2 mb-1">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: p.color }}
            />
            <p className="text-sm font-bold text-slate-800">
              {p.name === "revenue"
                ? formatRupiah(p.value)
                : `${p.value} Orders`}
            </p>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const PIE_COLORS = ["#FDB913", "#7A9B5E", "#60a5fa", "#E63946", "#a78bfa"];

const containerVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const itemVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [todayVsYesterday, setTodayVsYesterday] = useState([]);
  const [topProductsToday, setTopProductsToday] = useState([]);
  const [paymentToday, setPaymentToday] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [sRes, chartRes, topRes, payRes, prodRes] = await Promise.all([
        api.get("/analytics/dashboard"),
        api.get("/analytics/sales-chart?period=day"),
        api.get("/analytics/top-products?limit=5&period=today"),
        api.get("/analytics/payment-methods?period=today"),
        api.get("/products"),
      ]);

      setStats(sRes.data.data);
      setTodayVsYesterday(chartRes.data.data);
      setTopProductsToday(topRes.data.data);
      setPaymentToday(payRes.data.data);

      const unavailable = prodRes.data.data.filter((p) => !p.isAvailable);
      setLowStockProducts(unavailable);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const todayRevenue = stats?.today?.revenue || 0;
  const yesterdayRevenue = stats?.yesterday?.revenue || 0;
  const revenueChange =
    yesterdayRevenue > 0
      ? (((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100).toFixed(
          1,
        )
      : 0;

  const todayOrders = stats?.today?.orders || 0;
  const yesterdayOrders = stats?.yesterday?.orders || 0;
  const ordersChange =
    yesterdayOrders > 0
      ? (((todayOrders - yesterdayOrders) / yesterdayOrders) * 100).toFixed(1)
      : 0;

  const statCards = stats
    ? [
        {
          label: "Revenue Hari Ini",
          value: formatRupiah(stats.today.revenue),
          sub: `${stats.today.orders} Transaksi`,
          change: revenueChange,
          icon: <DollarSign size={20} />,
          grad: "from-amber-400 to-orange-500",
          glow: "shadow-orange-200",
        },
        {
          label: "Revenue Bulan Ini",
          value: formatRupiah(stats.thisMonth.revenue),
          sub: `${stats.thisMonth.orders} Transaksi`,
          change: null,
          icon: <TrendingUp size={20} />,
          grad: "from-emerald-400 to-green-600",
          glow: "shadow-green-200",
        },
      ]
    : [];

  const ChangeIndicator = ({ change }) => {
    if (change === null || change === undefined) return null;

    const isPositive = change > 0;
    const isZero = change == 0;

    return (
      <div
        className={`flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full ${
          isZero
            ? "bg-slate-100 text-slate-500"
            : isPositive
              ? "bg-emerald-50 text-emerald-600"
              : "bg-red-50 text-red-500"
        }`}
      >
        {isZero ? (
          <Minus size={10} />
        ) : isPositive ? (
          <ArrowUp size={10} />
        ) : (
          <ArrowDown size={10} />
        )}
        {Math.abs(change)}%
      </div>
    );
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] font-sans text-slate-900">
      <Sidebar currentPath="/dashboard" />

      <main className="ml-[240px] flex-1 pb-12">
        <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b bg-white/80 px-8 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-black tracking-tight text-slate-800">
              Operational Dashboard
            </h1>
            <div className="flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-black text-emerald-600 border border-emerald-100 uppercase tracking-tighter">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Live System
            </div>
          </div>
          <div className="flex items-center gap-2 text-slate-400 text-sm font-medium bg-slate-50 px-4 py-2 rounded-xl">
            <Calendar size={16} />
            {new Date().toLocaleDateString("id-ID", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </div>
        </header>

        <motion.div
          variants={containerVariants}
          initial="initial"
          animate="animate"
          className="p-8 max-w-[1600px] mx-auto"
        >
          <div className="grid grid-cols-1 md:grid-cols-[repeat(auto-fit,minmax(400px,1fr))] gap-6 mb-8">
            {statCards.map((card, i) => (
              <motion.div
                key={i}
                variants={itemVariants}
                whileHover={{ y: -8 }}
                className={`bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-300 relative overflow-hidden group`}
              >
                <div
                  className={`absolute -right-4 -top-4 w-24 h-24 bg-gradient-to-br ${card.grad} opacity-[0.03] rounded-full group-hover:scale-150 transition-transform duration-700`}
                />

                <div className="flex justify-between items-start mb-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 leading-none">
                    {card.label}
                  </p>
                  <div
                    className={`p-3 rounded-2xl bg-gradient-to-br ${card.grad} text-white shadow-lg shadow-current/20`}
                  >
                    {card.icon}
                  </div>
                </div>
                <h2 className="text-2xl font-black text-slate-800 mb-2 tracking-tight">
                  {card.value}
                </h2>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter">
                    {card.sub}
                  </span>
                  <ChangeIndicator change={card.change} />
                </div>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <motion.div
              variants={itemVariants}
              className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm"
            >
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                    <Activity size={20} className="text-amber-500" /> Hari Ini
                    vs Kemarin
                  </h3>
                  <p className="text-sm text-slate-400 font-medium">
                    Perbandingan revenue per jam
                  </p>
                </div>
              </div>

              <div className="h-[300px] w-full">
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="w-8 h-8 border-4 border-slate-200 border-t-amber-500 rounded-full animate-spin" />
                  </div>
                ) : todayVsYesterday.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full gap-2">
                    <p className="text-slate-400 text-sm font-medium">
                      Belum ada data hari ini
                    </p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={todayVsYesterday}>
                      <defs>
                        <linearGradient
                          id="todayGrad"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#FDB913"
                            stopOpacity={0.3}
                          />
                          <stop
                            offset="95%"
                            stopColor="#FDB913"
                            stopOpacity={0}
                          />
                        </linearGradient>
                        <linearGradient
                          id="yesterdayGrad"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#94a3b8"
                            stopOpacity={0.2}
                          />
                          <stop
                            offset="95%"
                            stopColor="#94a3b8"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="#f1f5f9"
                      />
                      <XAxis
                        dataKey="hour"
                        axisLine={false}
                        tickLine={false}
                        tick={{
                          fontSize: 10,
                          fontWeight: 700,
                          fill: "#94a3b8",
                        }}
                        dy={10}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{
                          fontSize: 10,
                          fontWeight: 700,
                          fill: "#94a3b8",
                        }}
                        tickFormatter={(v) => `${v / 1000}k`}
                      />
                      <Tooltip
                        content={<CustomTooltip />}
                        cursor={{ stroke: "#cbd5e1", strokeWidth: 2 }}
                      />
                      <Area
                        type="monotone"
                        dataKey="yesterday"
                        name="Kemarin"
                        stroke="#cbd5e1"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        fill="url(#yesterdayGrad)"
                        animationDuration={1500}
                      />
                      <Area
                        type="monotone"
                        dataKey="today"
                        name="Hari Ini"
                        stroke="#FDB913"
                        strokeWidth={3}
                        fill="url(#todayGrad)"
                        animationDuration={1500}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* Legend Manual */}
              <div className="flex items-center justify-center gap-6 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-0.5 bg-amber-400 rounded" />
                  <span className="text-xs font-bold text-slate-500">
                    Hari Ini
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-0.5 border-t-2 border-dashed border-slate-300" />
                  <span className="text-xs font-bold text-slate-400">
                    Kemarin
                  </span>
                </div>
              </div>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col"
            >
              <h3 className="text-lg font-black text-slate-800 mb-1">
                Payment Hari Ini
              </h3>
              <p className="text-sm text-slate-400 font-medium mb-6">
                Metode pembayaran terpopuler hari ini
              </p>

              <div className="flex-1 flex flex-col justify-center">
                <div className="h-[200px] w-full mb-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={paymentToday}
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={8}
                        dataKey="revenue"
                        animationBegin={500}
                        animationDuration={1500}
                      >
                        {paymentToday.map((_, i) => (
                          <Cell
                            key={i}
                            fill={PIE_COLORS[i % PIE_COLORS.length]}
                            stroke="none"
                          />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="space-y-3">
                  {paymentToday.map((s, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 group hover:bg-white hover:shadow-md transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{
                            backgroundColor: PIE_COLORS[i % PIE_COLORS.length],
                          }}
                        />
                        <span className="text-xs font-black text-slate-700 uppercase">
                          {s.method}
                        </span>
                      </div>
                      <span className="text-xs font-mono font-bold text-slate-500">
                        {formatRupiah(s.revenue)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          <motion.div
            variants={itemVariants}
            className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden"
          >
            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-white">
              <div>
                <h3 className="text-lg font-black text-slate-800 tracking-tight">
                  Best Seller Hari Ini
                </h3>
                <p className="text-sm text-slate-400 font-medium">
                  Produk terlaris hari ini
                </p>
              </div>
              <button className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-2xl text-xs font-bold hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200">
                Laporan Lengkap <ArrowUpRight size={14} />
              </button>
            </div>

            <div className="overflow-x-auto p-4">
              <table className="w-full border-separate border-spacing-y-2">
                <thead>
                  <tr className="text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                    <th className="px-6 py-4"># RANK</th>
                    <th className="px-6 py-4">PRODUCT NAME</th>
                    <th className="px-6 py-4 text-center">CATEGORY</th>
                    <th className="px-6 py-4 text-center">SOLD</th>
                    <th className="px-6 py-4 text-right">REVENUE</th>
                  </tr>
                </thead>
                <tbody>
                  {topProductsToday.map((p, i) => (
                    <motion.tr
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="group hover:bg-slate-50 transition-all rounded-2xl"
                    >
                      <td className="px-6 py-4 first:rounded-l-2xl last:rounded-r-2xl">
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black shadow-sm ${
                            i === 0
                              ? "bg-amber-100 text-amber-600"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {i + 1}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-black text-slate-800 text-sm">
                        {p.name}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase border border-emerald-100">
                          {p.category?.name || "Uncategorized"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex flex-col items-center">
                          <span className="text-sm font-black text-slate-800">
                            {p.totalQuantity}
                          </span>
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                            Cups Sold
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right font-mono font-black text-sm text-slate-800 last:rounded-r-2xl">
                        {formatRupiah(p.revenue)}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
          {/* Low Stock Alert */}
          <motion.div
            variants={itemVariants}
            className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden mb-6"
          >
            <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-50 rounded-2xl flex items-center justify-center">
                  <AlertTriangle size={20} className="text-red-500" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-800">
                    ⚠️ Low Stock Alert
                  </h3>
                  <p className="text-xs text-slate-400 font-medium">
                    Produk yang saat ini tidak tersedia
                  </p>
                </div>
              </div>
              <span className="text-xs font-black px-3 py-1 rounded-full bg-red-50 text-red-500 border border-red-100">
                {lowStockProducts.length} Produk
              </span>
            </div>

            <div className="p-4">
              {lowStockProducts.length === 0 ? (
                <div className="flex items-center justify-center py-6 gap-2">
                  <div className="w-8 h-8 bg-emerald-50 rounded-xl flex items-center justify-center">
                    <span className="text-emerald-500 text-sm">✓</span>
                  </div>
                  <p className="text-sm text-emerald-600 font-bold">
                    Semua produk tersedia
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {lowStockProducts.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center gap-3 p-4 bg-red-50/50 border border-red-100 rounded-2xl group hover:bg-red-50 transition-all"
                    >
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-red-100">
                        <span className="text-base">🚫</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-black text-slate-800 truncate">
                          {p.name}
                        </p>
                        <p className="text-xs text-red-400 font-bold">
                          {p.category?.name || "Uncategorized"}
                        </p>
                      </div>
                      <span className="text-[9px] font-black px-2 py-1 rounded-lg bg-red-100 text-red-500 uppercase tracking-wider">
                        Out
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}
