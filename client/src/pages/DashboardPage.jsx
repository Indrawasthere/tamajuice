import { useState, useEffect } from "react";
import { useAuthStore } from "../store/authStore";
import { formatRupiah } from "../lib/format";
import Sidebar from "../components/Sidebar";
import api from "../lib/api";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

// Recharts custom tooltip
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          background: "#fff",
          borderRadius: 12,
          padding: "10px 14px",
          boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
          border: "1px solid #f0f0f0",
        }}
      >
        <p
          style={{
            margin: "0 0 4px",
            fontSize: 12,
            color: "#9ca3af",
            fontWeight: 500,
          }}
        >
          {label}
        </p>
        {payload.map((p, i) => (
          <p
            key={i}
            style={{ margin: 0, fontSize: 13, fontWeight: 700, color: p.color }}
          >
            {p.name === "revenue" ? formatRupiah(p.value) : `${p.value} order`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const PIE_COLORS = ["#FDB913", "#7A9B5E", "#60a5fa", "#E63946", "#a78bfa"];

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [salesData, setSalesData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [paymentStats, setPaymentStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartPeriod, setChartPeriod] = useState("week");

  useEffect(() => {
    fetchAll();
  }, [chartPeriod]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [sRes, chartRes, topRes, payRes] = await Promise.all([
        api.get("/analytics/dashboard"),
        api.get(`/analytics/sales-chart?period=${chartPeriod}`),
        api.get("/analytics/top-products?limit=5"),
        api.get("/analytics/payment-methods"),
      ]);
      setStats(sRes.data.data);
      setSalesData(chartRes.data.data);
      setTopProducts(topRes.data.data);
      setPaymentStats(payRes.data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const statCards = stats
    ? [
        {
          label: "Revenue Hari Ini",
          value: formatRupiah(stats.today.revenue),
          sub: `${stats.today.orders} Transaksi`,
          icon: "",
          gradient: "linear-gradient(135deg, #FDB913, #f59e0b)",
          glow: "rgba(253,185,19,0.3)",
        },
        {
          label: "Revenue Bulan Ini",
          value: formatRupiah(stats.thisMonth.revenue),
          sub: `${stats.thisMonth.orders} Transaksi`,
          icon: "",
          gradient: "linear-gradient(135deg, #7A9B5E, #4ade80)",
          glow: "rgba(122,155,94,0.3)",
        },
        {
          label: "Total Revenue",
          value: formatRupiah(stats.allTime.revenue),
          sub: `${stats.allTime.orders} Total Penjualan`,
          icon: "",
          gradient: "linear-gradient(135deg, #60a5fa, #3b82f6)",
          glow: "rgba(96,165,250,0.3)",
        },
        {
          label: "Total Produk",
          value: stats.allTime.products,
          sub: "Menu Aktif",
          icon: "",
          gradient: "linear-gradient(135deg, #a78bfa, #8b5cf6)",
          glow: "rgba(167,139,250,0.3)",
        },
      ]
    : [];

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "#f3f4f6",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <Sidebar currentPath="/dashboard" />

      <div style={{ marginLeft: 240, flex: 1 }}>
        {/* Top Bar */}
        <div
          style={{
            height: 64,
            background: "#fff",
            borderBottom: "1px solid #e5e7eb",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 28px",
            position: "sticky",
            top: 0,
            zIndex: 50,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <h1
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: "#1a1a2e",
                fontFamily: "Inter, sans-serif",
                margin: 0,
              }}
            >
              Dashboard
            </h1>
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: "#7A9B5E",
                background: "#eef5ec",
                padding: "3px 10px",
                borderRadius: 20,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              {new Date().toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
          </div>
        </div>

        <div style={{ padding: "24px 28px", maxWidth: 1400 }}>
          {/* Stat Cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 18,
              marginBottom: 24,
            }}
          >
            {statCards.map((card, i) => (
              <div
                key={i}
                style={{
                  background: "#fff",
                  borderRadius: 16,
                  padding: "20px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                  border: "1px solid #f0f0f0",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: -20,
                    right: -20,
                    width: 100,
                    height: 100,
                    borderRadius: "50%",
                    background: card.gradient,
                    opacity: 0.08,
                  }}
                />
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: 14,
                  }}
                >
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: "#9ca3af",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    {card.label}
                  </div>
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 10,
                      background: card.gradient,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 18,
                      boxShadow: `0 4px 12px ${card.glow}`,
                    }}
                  >
                    {card.icon}
                  </div>
                </div>
                <div
                  style={{
                    fontSize: 24,
                    fontWeight: 800,
                    color: "#1a1a2e",
                    fontFamily: "Inter, sans-serif",
                    letterSpacing: "-0.5px",
                  }}
                >
                  {card.value}
                </div>
                <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 4 }}>
                  {card.sub}
                </div>
              </div>
            ))}
          </div>

          {/* Charts Row */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.6fr 1fr",
              gap: 18,
              marginBottom: 24,
            }}
          >
            {/* Line Chart - Revenue */}
            <div
              style={{
                background: "#fff",
                borderRadius: 16,
                padding: 24,
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                border: "1px solid #f0f0f0",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 20,
                }}
              >
                <div>
                  <h3
                    style={{
                      margin: 0,
                      fontSize: 15,
                      fontWeight: 700,
                      color: "#1a1a2e",
                      fontFamily: "Inter, sans-serif",
                    }}
                  >
                    Penjualan
                  </h3>
                  <p
                    style={{
                      margin: "3px 0 0",
                      fontSize: 12,
                      color: "#9ca3af",
                    }}
                  >
                    Revenue & transaksi harian
                  </p>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  {["week", "month", "year"].map((p) => (
                    <button
                      key={p}
                      onClick={() => setChartPeriod(p)}
                      style={{
                        padding: "5px 12px",
                        borderRadius: 8,
                        border: "none",
                        background:
                          chartPeriod === p
                            ? "linear-gradient(135deg, #FDB913, #7A9B5E)"
                            : "#f3f4f6",
                        color: chartPeriod === p ? "#fff" : "#6b7280",
                        fontSize: 11,
                        fontWeight: 600,
                        cursor: "pointer",
                        textTransform: "capitalize",
                      }}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={salesData}>
                  <defs>
                    <linearGradient
                      id="colorRevenue"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor="#FDB913"
                        stopOpacity={0.25}
                      />
                      <stop offset="100%" stopColor="#FDB913" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient
                      id="colorOrders"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor="#7A9B5E" stopOpacity={0.2} />
                      <stop offset="100%" stopColor="#7A9B5E" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: "#9ca3af" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    yAxisId="left"
                    tick={{ fontSize: 11, fill: "#9ca3af" }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tick={{ fontSize: 11, fill: "#9ca3af" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="revenue"
                    name="revenue"
                    stroke="#FDB913"
                    strokeWidth={3}
                    fill="url(#colorRevenue)"
                    dot={{
                      r: 4,
                      fill: "#FDB913",
                      strokeWidth: 2,
                      stroke: "#fff",
                    }}
                  />
                  <Area
                    yAxisId="right"
                    type="monotone"
                    dataKey="orders"
                    name="orders"
                    stroke="#7A9B5E"
                    strokeWidth={2}
                    fill="url(#colorOrders)"
                    dot={{
                      r: 3,
                      fill: "#7A9B5E",
                      strokeWidth: 2,
                      stroke: "#fff",
                    }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Pie Chart - Payment methods */}
            <div
              style={{
                background: "#fff",
                borderRadius: 16,
                padding: 24,
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                border: "1px solid #f0f0f0",
              }}
            >
              <div style={{ marginBottom: 20 }}>
                <h3
                  style={{
                    margin: 0,
                    fontSize: 15,
                    fontWeight: 700,
                    color: "#1a1a2e",
                    fontFamily: "Inter, sans-serif",
                  }}
                >
                  Metode Pembayaran
                </h3>
                <p
                  style={{ margin: "3px 0 0", fontSize: 12, color: "#9ca3af" }}
                >
                  Distribusi payment
                </p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <ResponsiveContainer width="55%" height={160}>
                  <PieChart>
                    <Pie
                      data={paymentStats}
                      dataKey="revenue"
                      nameKey="method"
                      cx="50%"
                      cy="50%"
                      outerRadius={60}
                      innerRadius={32}
                      paddingAngle={3}
                    >
                      {paymentStats.map((_, i) => (
                        <Cell
                          key={i}
                          fill={PIE_COLORS[i % PIE_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => formatRupiah(v)} />
                  </PieChart>
                </ResponsiveContainer>
                <div
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                  }}
                >
                  {paymentStats.map((s, i) => (
                    <div
                      key={i}
                      style={{ display: "flex", alignItems: "center", gap: 10 }}
                    >
                      <div
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: "50%",
                          background: PIE_COLORS[i % PIE_COLORS.length],
                          flexShrink: 0,
                        }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: 12,
                            fontWeight: 600,
                            color: "#1a1a2e",
                          }}
                        >
                          {s.method}
                        </div>
                        <div style={{ fontSize: 11, color: "#9ca3af" }}>
                          {s.orders} transaksi
                        </div>
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          fontWeight: 700,
                          color: "#1a1a2e",
                          fontFamily: "JetBrains Mono, monospace",
                        }}
                      >
                        {formatRupiah(s.revenue)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Top Products Table */}
          <div
            style={{
              background: "#fff",
              borderRadius: 16,
              padding: 24,
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
              border: "1px solid #f0f0f0",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 20,
              }}
            >
              <div>
                <h3
                  style={{
                    margin: 0,
                    fontSize: 15,
                    fontWeight: 700,
                    color: "#1a1a2e",
                    fontFamily: "Inter, sans-serif",
                  }}
                >
                  Top Products
                </h3>
                <p
                  style={{ margin: "3px 0 0", fontSize: 12, color: "#9ca3af" }}
                >
                  Based on sales volume
                </p>
              </div>
            </div>

            {topProducts.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "40px 0",
                  color: "#9ca3af",
                  fontSize: 14,
                }}
              >
                Belum ada data penjualan
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "2px solid #f0f0f0" }}>
                      {[
                        "#",
                        "Produk",
                        "Kategori",
                        "Harga",
                        "Terjual",
                        "Revenue",
                      ].map((h) => (
                        <th
                          key={h}
                          style={{
                            padding: "10px 12px",
                            textAlign: h === "#" ? "center" : "left",
                            fontSize: 11,
                            fontWeight: 600,
                            color: "#9ca3af",
                            textTransform: "uppercase",
                            letterSpacing: "0.5px",
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {topProducts.map((p, i) => (
                      <tr key={i} style={{ borderBottom: "1px solid #f3f4f6" }}>
                        <td style={{ textAlign: "center", padding: "12px" }}>
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              width: 28,
                              height: 28,
                              borderRadius: 8,
                              background:
                                i < 3
                                  ? "linear-gradient(135deg, #FDB913, #7A9B5E)"
                                  : "#f3f4f6",
                              color: i < 3 ? "#fff" : "#6b7280",
                              fontSize: 13,
                              fontWeight: 700,
                            }}
                          >
                            {i + 1}
                          </span>
                        </td>
                        <td style={{ padding: "12px" }}>
                          <div
                            style={{
                              fontSize: 13.5,
                              fontWeight: 600,
                              color: "#1a1a2e",
                            }}
                          >
                            {p.name}
                          </div>
                        </td>
                        <td style={{ padding: "12px" }}>
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 600,
                              color: "#7A9B5E",
                              background: "#eef5ec",
                              padding: "3px 10px",
                              borderRadius: 12,
                            }}
                          >
                            {p.category?.name || "-"}
                          </span>
                        </td>
                        <td
                          style={{
                            padding: "12px",
                            fontSize: 13,
                            fontWeight: 600,
                            color: "#FDB913",
                            fontFamily: "JetBrains Mono, monospace",
                          }}
                        >
                          {formatRupiah(p.price)}
                        </td>
                        <td style={{ padding: "12px" }}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                            }}
                          >
                            <span
                              style={{
                                fontSize: 13,
                                fontWeight: 700,
                                color: "#1a1a2e",
                                fontFamily: "JetBrains Mono, monospace",
                              }}
                            >
                              {p.totalQuantity}
                            </span>
                            <span style={{ fontSize: 11, color: "#9ca3af" }}>
                              cups
                            </span>
                          </div>
                        </td>
                        <td
                          style={{
                            padding: "12px",
                            fontSize: 13,
                            fontWeight: 700,
                            color: "#1a1a2e",
                            fontFamily: "JetBrains Mono, monospace",
                          }}
                        >
                          {formatRupiah(p.revenue)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
