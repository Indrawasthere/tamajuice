import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  ShoppingBag,
  DollarSign,
  Package,
  Calendar,
  ChevronRight,
  ArrowUpRight,
  Activity,
  Download,
  Lock,
  X,
  Check,
} from "lucide-react";
import useAuthStore from "../store/authStore";
import { formatRupiah } from "../lib/format";
import Sidebar from "../components/Sidebar";
import api from "../lib/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
  PieChart,
  Pie,
} from "recharts";

const ReportTooltip = ({ active, payload, label }) => {
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
              <span className="text-slate-500 font-normal mr-2">
                {p.name === "revenue" ? "Revenue:" : "Orders:"}
              </span>
              {p.name === "revenue"
                ? formatRupiah(p.value)
                : `${p.value} Transaksi`}
            </p>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

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

const CHART_COLORS = {
  revenue: "#FDB913",
  orders: "#7A9B5E",
};

const PIE_COLORS = ["#FDB913", "#7A9B5E", "#60a5fa", "#E63946", "#a78bfa"];

export default function ReportsPage() {
  // --- States ---
  const [salesData, setSalesData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [period, setPeriod] = useState("week");
  const [loading, setLoading] = useState(true);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showCloseBook, setShowCloseBook] = useState(false);
  const [closeBookPeriod, setCloseBookPeriod] = useState("daily");
  const [closeBookResult, setCloseBookResult] = useState(null);
  const [closingLoading, setClosingLoading] = useState(false);
  const [categoryRevenue, setCategoryRevenue] = useState([]);

  // --- Derived Data ---
  const totalRevenue = salesData.reduce((s, d) => s + d.revenue, 0);
  const totalOrders = salesData.reduce((s, d) => s + d.orders, 0);
  const totalCups = topProducts.reduce((s, p) => s + p.totalQuantity, 0);
  const avgOrderValue =
    totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

  useEffect(() => {
    fetchData();
  }, [period]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [chartRes, topRes] = await Promise.all([
        api.get(`/analytics/sales-chart?period=${period}`),
        api.get("/analytics/top-products?limit=10"),
      ]);
      setSalesData(chartRes.data.data);
      setTopProducts(topRes.data.data);

      try {
        const catRes = await api.get("/analytics/revenue-by-category");
        setCategoryRevenue(catRes.data.data);
      } catch (e) {
        console.warn("Revenue by category belum ready:", e.message);
        setCategoryRevenue([]);
      }
    } catch (e) {
      console.error("Error fetching analytics:", e);
    } finally {
      setLoading(false);
    }
  };

  // --- Handlers ---
  const exportCSV = () => {
    if (topProducts.length === 0) return;
    const headers = [
      "Rank",
      "Produk",
      "Kategori",
      "Harga",
      "Cups Terjual",
      "Revenue",
    ];
    const rows = topProducts.map((p, i) => [
      i + 1,
      `"${p.name}"`,
      `"${p.category?.name || "-"}"`,
      p.price,
      p.totalQuantity,
      p.revenue,
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `laporan-penjualan-${period}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  };

  const exportJSON = () => {
    if (topProducts.length === 0) return;
    const blob = new Blob(
      [JSON.stringify({ period, salesData, topProducts }, null, 2)],
      { type: "application/json" },
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `laporan-penjualan-${period}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  };

  const handleCloseBook = async () => {
    setClosingLoading(true);
    try {
      const res = await api.post("/analytics/close-book", {
        period: closeBookPeriod,
      });
      setCloseBookResult(res.data.data);
    } catch (e) {
      const now = new Date();
      setCloseBookResult({
        period: closeBookPeriod,
        date: now.toLocaleDateString("id-ID", {
          day: "numeric",
          month: "long",
          year: "numeric",
        }),
        totalRevenue,
        totalOrders,
        totalCups,
        avgOrderValue,
      });
    } finally {
      setClosingLoading(false);
    }
  };

  const statCards = [
    {
      label: "Total Revenue",
      value: formatRupiah(totalRevenue),
      sub: `${totalOrders} Transaksi`,
      icon: <DollarSign size={20} />,
      grad: "from-amber-400 to-orange-500",
      glow: "shadow-orange-200",
    },
    {
      label: "Total Orders",
      value: totalOrders,
      sub: `${totalCups} Cups Terjual`,
      icon: <ShoppingBag size={20} />,
      grad: "from-emerald-400 to-green-600",
      glow: "shadow-green-200",
    },
    {
      label: "Total Cups",
      value: totalCups,
      sub: "Menu Terjual",
      icon: <Package size={20} />,
      grad: "from-blue-400 to-indigo-600",
      glow: "shadow-blue-200",
    },
    {
      label: "Avg Order Value",
      value: formatRupiah(avgOrderValue),
      sub: "Rata-rata per transaksi",
      icon: <TrendingUp size={20} />,
      grad: "from-violet-400 to-purple-600",
      glow: "shadow-purple-200",
    },
  ];

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] font-sans text-slate-900">
      <Sidebar currentPath="/reports" />

      <main className="ml-[240px] flex-1 pb-12">
        <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b bg-white/80 px-8 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-black tracking-tight text-slate-800">
              Sales Analytics
            </h1>
            <div className="flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-[10px] font-black text-blue-600 border border-blue-100 uppercase tracking-tighter">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              Real-time Data
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
          {/* Action Bar */}
          <motion.div
            variants={itemVariants}
            className="flex justify-between items-center mb-8"
          >
            <div>
              <h1 className="text-2xl font-black text-slate-800 mb-2 tracking-tight">
                Sales Analytics
              </h1>
              <p className="text-sm text-slate-400 font-medium">
                Visualisasi data penjualan dan performa produk Anda.
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Period Selector */}
              <div className="flex bg-slate-50 p-1 rounded-2xl">
                {["week", "month", "year"].map((p) => (
                  <button
                    key={p}
                    onClick={() => setPeriod(p)}
                    className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                      period === p
                        ? "bg-white text-slate-800 shadow-md"
                        : "text-slate-400 hover:text-slate-600"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>

              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  className="flex items-center gap-2 px-5 py-3 bg-white text-slate-700 rounded-2xl text-sm font-bold hover:bg-slate-50 transition-colors border border-slate-200"
                >
                  <Download size={16} />
                  Export Data
                </motion.button>

                <AnimatePresence>
                  {showExportMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full right-0 mt-2 bg-white rounded-2xl border border-slate-200 shadow-xl z-50 overflow-hidden min-w-[160px]"
                    >
                      <button
                        onClick={exportCSV}
                        className="w-full px-4 py-3 text-left text-sm font-medium hover:bg-slate-50 transition-colors"
                      >
                        CSV Format
                      </button>
                      <button
                        onClick={exportJSON}
                        className="w-full px-4 py-3 text-left text-sm font-medium hover:bg-slate-50 transition-colors border-t border-slate-100"
                      >
                        JSON Format
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setShowCloseBook(true);
                  setCloseBookResult(null);
                }}
                className="flex items-center gap-2 px-5 py-3 bg-slate-900 text-white rounded-2xl text-sm font-bold hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200"
              >
                <Lock size={16} />
                Close Book
              </motion.button>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statCards.map((card, i) => (
              <motion.div
                key={i}
                variants={itemVariants}
                whileHover={{ y: -8 }}
                className={`bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:${card.glow} transition-all duration-300 relative overflow-hidden group`}
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
                <h2 className="text-2xl font-black text-slate-800 mb-1 tracking-tight">
                  {card.value}
                </h2>
                <div className="flex items-center gap-1 text-xs font-bold text-slate-400 uppercase tracking-tighter">
                  {card.sub}{" "}
                  <ChevronRight size={12} className="text-slate-300" />
                </div>
              </motion.div>
            ))}
          </div>

          {/* Revenue by Category */}
          <motion.div
            variants={itemVariants}
            className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm mb-8"
          >
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                  <Activity size={20} className="text-amber-500" /> Revenue by
                  Category
                </h3>
                <p className="text-sm text-slate-400 font-medium">
                  Kontribusi revenue per kategori menu
                </p>
              </div>
            </div>

            <div className="flex flex-col lg:flex-row items-center gap-8">
              {/* Pie Chart */}
              <div className="w-full lg:w-[280px] h-[240px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryRevenue}
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={4}
                      dataKey="revenue"
                      animationBegin={300}
                      animationDuration={1500}
                    >
                      {categoryRevenue.map((_, i) => (
                        <Cell
                          key={i}
                          fill={PIE_COLORS[i % PIE_COLORS.length]}
                          stroke="none"
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-white/95 border border-slate-200 p-3 rounded-xl shadow-lg">
                              <p className="text-xs font-black text-slate-800">
                                {payload[0].payload.name}
                              </p>
                              <p className="text-sm font-black text-amber-600">
                                {formatRupiah(payload[0].value)}
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Category List */}
              <div className="flex-1 w-full space-y-3">
                {categoryRevenue.map((cat, i) => {
                  const maxRevenue = Math.max(
                    ...categoryRevenue.map((c) => c.revenue),
                  );
                  const percentage = (
                    (cat.revenue / totalRevenue) *
                    100
                  ).toFixed(1);
                  return (
                    <div key={i} className="group">
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-2.5 h-2.5 rounded-full"
                            style={{
                              backgroundColor:
                                PIE_COLORS[i % PIE_COLORS.length],
                            }}
                          />
                          <span className="text-sm font-black text-slate-700">
                            {cat.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-bold text-slate-400">
                            {percentage}%
                          </span>
                          <span className="text-sm font-black text-slate-800 font-mono">
                            {formatRupiah(cat.revenue)}
                          </span>
                        </div>
                      </div>
                      {/* Progress Bar */}
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${(cat.revenue / maxRevenue) * 100}%`,
                            backgroundColor: PIE_COLORS[i % PIE_COLORS.length],
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden"
          >
            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-white">
              <div>
                <h3 className="text-lg font-black text-slate-800 tracking-tight">
                  Top Selling Products
                </h3>
                <p className="text-sm text-slate-400 font-medium">
                  Produk dengan volume penjualan tertinggi
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
                    <th className="px-6 py-4">#</th>
                    <th className="px-6 py-4">PRODUCT</th>
                    <th className="px-6 py-4 text-center">CATEGORY</th>
                    <th className="px-6 py-4 text-center">PRICE</th>
                    <th className="px-6 py-4 text-center">SOLD</th>
                    <th className="px-6 py-4 text-right">REVENUE</th>
                  </tr>
                </thead>
                <tbody>
                  {topProducts.map((p, i) => (
                    <motion.tr
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="group hover:bg-slate-50 transition-all rounded-2xl"
                    >
                      <td className="px-6 py-4 first:rounded-l-2xl">
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black shadow-sm ${
                            i === 0
                              ? "bg-amber-100 text-amber-600"
                              : i === 1
                                ? "bg-emerald-100 text-emerald-600"
                                : i === 2
                                  ? "bg-blue-100 text-blue-600"
                                  : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {i + 1}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-black text-slate-800 text-sm">
                            {p.name}
                          </div>
                          <div className="text-xs text-slate-400">
                            {p.totalOrders} Transaksi
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase border border-emerald-100">
                          {p.category?.name || "Uncategorized"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center font-bold text-slate-700">
                        {formatRupiah(p.price)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex flex-col items-center">
                          <span className="text-sm font-black text-slate-800">
                            {p.totalQuantity}
                          </span>
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                            Cups
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right last:rounded-r-2xl">
                        <div className="font-mono font-black text-sm text-slate-800 mb-1">
                          {formatRupiah(p.revenue)}
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-amber-400 rounded-full"
                            style={{
                              width: `${Math.min(
                                (p.revenue / totalRevenue) * 100,
                                100,
                              )}%`,
                            }}
                          />
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </motion.div>
      </main>

      <AnimatePresence>
        {showCloseBook && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[1000] p-8"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl"
            >
              {!closeBookResult ? (
                <>
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-xl font-black text-slate-800 mb-1">
                        Konfirmasi Close Book
                      </h3>
                      <p className="text-sm text-slate-400">
                        Pilih periode penutupan buku Anda.
                      </p>
                    </div>
                    <button
                      onClick={() => setShowCloseBook(false)}
                      className="p-2 rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-6">
                    {["daily", "weekly", "monthly", "yearly"].map((opt) => (
                      <button
                        key={opt}
                        onClick={() => setCloseBookPeriod(opt)}
                        className={`p-4 rounded-2xl text-sm font-bold transition-all ${
                          closeBookPeriod === opt
                            ? "bg-slate-900 text-white"
                            : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        {opt.charAt(0).toUpperCase() + opt.slice(1)}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={handleCloseBook}
                    disabled={closingLoading}
                    className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {closingLoading
                      ? "Memproses..."
                      : `Tutup Buku ${closeBookPeriod.charAt(0).toUpperCase() + closeBookPeriod.slice(1)}`}
                  </button>
                </>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Check size={32} className="text-white" />
                  </div>
                  <h3 className="text-xl font-black text-slate-800 mb-2">
                    Berhasil Ditutup!
                  </h3>
                  <p className="text-slate-400 mb-8">
                    Laporan periode {closeBookResult.period} telah diamankan.
                  </p>
                  <button
                    onClick={() => setShowCloseBook(false)}
                    className="w-full py-3 bg-slate-100 text-slate-700 rounded-2xl font-bold hover:bg-slate-200 transition-colors"
                  >
                    Selesai
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
