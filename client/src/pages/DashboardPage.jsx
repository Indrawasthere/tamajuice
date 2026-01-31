import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { formatRupiah } from "../lib/format";
import api from "../lib/api";
import {
  LineChart,
  Line,
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

const NAV_ITEMS = [
  { icon: "", label: "Counter", path: "/", activeColor: "#FDB913" },
  {
    icon: "",
    label: "Dashboard",
    path: "/dashboard",
    activeColor: "#7A9B5E",
  },
  { icon: "", label: "Orders", path: "/orders", activeColor: "#60a5fa" },
  { icon: "", label: "Products", path: "/products", activeColor: "#f97316" },
  { icon: "", label: "Reports", path: "/reports", activeColor: "#a78bfa" },
];

function Sidebar({ currentPath }) {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  return (
    <div
      style={{
        width: 240,
        minHeight: "100vh",
        background:
          "linear-gradient(180deg, #1a1a2e 0%, #16162a 50%, #0f0f1a 100%)",
        display: "flex",
        flexDirection: "column",
        position: "fixed",
        left: 0,
        top: 0,
        bottom: 0,
        zIndex: 100,
        boxShadow: "2px 0 20px rgba(0,0,0,0.3)",
      }}
    >
      <div
        style={{
          padding: "28px 20px 24px",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 12,
              background: "linear-gradient(135deg, #FDB913, #7A9B5E)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 22,
              boxShadow: "0 4px 14px rgba(253,185,19,0.35)",
            }}
          ></div>
          <div>
            <div
              style={{
                color: "#fff",
                fontSize: 15,
                fontWeight: 700,
                letterSpacing: "-0.3px",
                fontFamily: "Inter, sans-serif",
              }}
            >
              Jus Buah Tama
            </div>
            <div
              style={{
                color: "rgba(255,255,255,0.4)",
                fontSize: 11,
                fontWeight: 500,
              }}
            >
              POS System
            </div>
          </div>
        </div>
      </div>
      <nav
        style={{
          flex: 1,
          padding: "16px 12px",
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        {NAV_ITEMS.map((item) => {
          const isActive = currentPath === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "11px 14px",
                borderRadius: 10,
                border: "none",
                background: isActive
                  ? "linear-gradient(135deg, rgba(253,185,19,0.15), rgba(122,155,94,0.1))"
                  : "transparent",
                cursor: "pointer",
                transition: "all 0.2s",
                position: "relative",
                overflow: "hidden",
              }}
              onMouseEnter={(e) => {
                if (!isActive)
                  e.currentTarget.style.background = "rgba(255,255,255,0.06)";
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.background = "transparent";
              }}
            >
              {isActive && (
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    top: "20%",
                    bottom: "20%",
                    width: 3,
                    borderRadius: "0 3px 3px 0",
                    background: item.activeColor,
                    boxShadow: `0 0 8px ${item.activeColor}55`,
                  }}
                />
              )}
              <span style={{ fontSize: 18, width: 22, textAlign: "center" }}>
                {item.icon}
              </span>
              <span
                style={{
                  color: isActive ? "#fff" : "rgba(255,255,255,0.5)",
                  fontSize: 13.5,
                  fontWeight: isActive ? 600 : 400,
                  transition: "color 0.2s",
                  fontFamily: "Inter, sans-serif",
                }}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
      <div
        style={{
          padding: "14px 12px 18px",
          borderTop: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 10,
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: "linear-gradient(135deg, #FDB913, #E63946)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 15,
              fontWeight: 700,
              color: "#fff",
              fontFamily: "Inter, sans-serif",
            }}
          >
            {user?.name?.[0]?.toUpperCase() || "A"}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                color: "#fff",
                fontSize: 13,
                fontWeight: 600,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {user?.name}
            </div>
            <div
              style={{
                color: "rgba(255,255,255,0.35)",
                fontSize: 11,
                textTransform: "capitalize",
              }}
            >
              {user?.role?.toLowerCase()}
            </div>
          </div>
        </div>
        <button
          onClick={logout}
          style={{
            width: "100%",
            padding: "8px 12px",
            borderRadius: 8,
            border: "1px solid rgba(255,255,255,0.1)",
            background: "rgba(255,255,255,0.04)",
            color: "rgba(255,255,255,0.5)",
            fontSize: 12,
            cursor: "pointer",
            transition: "all 0.2s",
            fontFamily: "Inter, sans-serif",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(239,68,68,0.15)";
            e.currentTarget.style.color = "#ef4444";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.04)";
            e.currentTarget.style.color = "rgba(255,255,255,0.5)";
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
}

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
          sub: `${stats.today.orders} transaksi`,
          icon: "",
          gradient: "linear-gradient(135deg, #FDB913, #f59e0b)",
          glow: "rgba(253,185,19,0.3)",
        },
        {
          label: "Revenue Bulan Ini",
          value: formatRupiah(stats.thisMonth.revenue),
          sub: `${stats.thisMonth.orders} transaksi`,
          icon: "",
          gradient: "linear-gradient(135deg, #7A9B5E, #4ade80)",
          glow: "rgba(122,155,94,0.3)",
        },
        {
          label: "Total Revenue",
          value: formatRupiah(stats.allTime.revenue),
          sub: `${stats.allTime.orders} total orders`,
          icon: "",
          gradient: "linear-gradient(135deg, #60a5fa, #3b82f6)",
          glow: "rgba(96,165,250,0.3)",
        },
        {
          label: "Total Produk",
          value: stats.allTime.products,
          sub: "menu items aktif",
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
                <LineChart data={salesData}>
                  <defs>
                    <linearGradient
                      id="colorRevenue"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor="#FDB913" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#FDB913" stopOpacity={0} />
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
                    tick={{ fontSize: 11, fill: "#9ca3af" }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    name="revenue"
                    stroke="#FDB913"
                    strokeWidth={3}
                    dot={{
                      r: 4,
                      fill: "#FDB913",
                      strokeWidth: 2,
                      stroke: "#fff",
                    }}
                  />
                </LineChart>
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
