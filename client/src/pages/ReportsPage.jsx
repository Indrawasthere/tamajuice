import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { formatRupiah } from "../lib/format";
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

const ReportTooltip = ({ active, payload, label }) => {
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
            margin: "0 0 6px",
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
            style={{
              margin: "2px 0",
              fontSize: 13,
              fontWeight: 700,
              color: p.color,
            }}
          >
            <span style={{ color: "#9ca3af", fontWeight: 400 }}>
              {p.name === "revenue" ? "Revenue: " : "Cups: "}
            </span>
            {p.name === "revenue" ? formatRupiah(p.value) : p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function ReportsPage() {
  const [salesData, setSalesData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [period, setPeriod] = useState("week");
  const [loading, setLoading] = useState(true);

  // Compute summary from fetched data
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
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const summaryCards = [
    {
      label: "Total Revenue",
      value: formatRupiah(totalRevenue),
      icon: "",
      color: "#FDB913",
      bg: "#FFF8E1",
    },
    {
      label: "Total Orders",
      value: totalOrders,
      icon: "",
      color: "#7A9B5E",
      bg: "#eef5ec",
    },
    {
      label: "Total Cups Terjual",
      value: totalCups,
      icon: "",
      color: "#60a5fa",
      bg: "#eff6ff",
    },
    {
      label: "Avg Order Value",
      value: formatRupiah(avgOrderValue),
      icon: "",
      color: "#a78bfa",
      bg: "#f5f3ff",
    },
  ];

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0f0f1a",
        }}
      >
        <div
          style={{
            color: "#FDB913",
            fontSize: 28,
            fontWeight: 700,
            fontFamily: "Inter, sans-serif",
          }}
        >
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "#f3f4f6",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <Sidebar currentPath="/reports" />

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
              Realtime Reports
            </h1>
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: "#a78bfa",
                background: "#f5f3ff",
                padding: "3px 10px",
                borderRadius: 20,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Sales Data Analysis
            </span>
          </div>
          {/* Period Filter */}
          <div style={{ display: "flex", gap: 6 }}>
            {["week", "month", "year"].map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                style={{
                  padding: "6px 16px",
                  borderRadius: 8,
                  border: "none",
                  background:
                    period === p
                      ? "linear-gradient(135deg, #FDB913, #7A9B5E)"
                      : "#f3f4f6",
                  color: period === p ? "#fff" : "#6b7280",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  textTransform: "capitalize",
                  boxShadow:
                    period === p ? "0 3px 10px rgba(253,185,19,0.3)" : "none",
                  transition: "all 0.2s",
                }}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div style={{ padding: "24px 28px", maxWidth: 1400 }}>
          {/* Summary Cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 18,
              marginBottom: 24,
            }}
          >
            {summaryCards.map((card, i) => (
              <div
                key={i}
                style={{
                  background: "#fff",
                  borderRadius: 16,
                  padding: "18px 20px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                  border: "1px solid #f0f0f0",
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                }}
              >
                <div
                  style={{
                    width: 46,
                    height: 46,
                    borderRadius: 14,
                    background: card.bg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 22,
                    flexShrink: 0,
                  }}
                >
                  {card.icon}
                </div>
                <div>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: "#9ca3af",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      marginBottom: 3,
                    }}
                  >
                    {card.label}
                  </div>
                  <div
                    style={{
                      fontSize: 22,
                      fontWeight: 800,
                      color: card.color,
                      fontFamily: "Inter, sans-serif",
                      letterSpacing: "-0.3px",
                    }}
                  >
                    {card.value}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Bar Chart: Revenue + Cups per day */}
          <div
            style={{
              background: "#fff",
              borderRadius: 16,
              padding: 24,
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
              border: "1px solid #f0f0f0",
              marginBottom: 24,
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
                Revenue & Orders Harian
              </h3>
              <p style={{ margin: "3px 0 0", fontSize: 12, color: "#9ca3af" }}>
                Perbandingan revenue (Rp) dan jumlah transaksi per hari
              </p>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={salesData} barGap={4}>
                <defs>
                  <linearGradient id="barRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FDB913" />
                    <stop offset="100%" stopColor="#f59e0b" />
                  </linearGradient>
                  <linearGradient id="barOrders" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7A9B5E" />
                    <stop offset="100%" stopColor="#4ade80" />
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
                <Tooltip content={<ReportTooltip />} />
                <Legend
                  iconType="roundedRect"
                  iconSize={12}
                  wrapperStyle={{ fontSize: 12, paddingTop: 12 }}
                />
                <Bar
                  yAxisId="left"
                  dataKey="revenue"
                  name="revenue"
                  fill="url(#barRevenue)"
                  radius={[6, 6, 0, 0]}
                  barSize={28}
                />
                <Bar
                  yAxisId="right"
                  dataKey="orders"
                  name="orders"
                  fill="url(#barOrders)"
                  radius={[6, 6, 0, 0]}
                  barSize={28}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Full Product Report Table */}
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
                  Laporan Penjualan Produk
                </h3>
                <p
                  style={{ margin: "3px 0 0", fontSize: 12, color: "#9ca3af" }}
                >
                  Detail per produk — cups terjual, revenue, dan kontribusi
                </p>
              </div>
            </div>

            {topProducts.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "60px 0",
                  color: "#9ca3af",
                  fontSize: 14,
                }}
              >
                <div style={{ fontSize: 48, marginBottom: 12, opacity: 0.3 }}>
                  📊
                </div>
                Belum ada data penjualan untuk periode ini
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "2px solid #f0f0f0" }}>
                      {[
                        "Rank",
                        "Produk",
                        "Kategori",
                        "Harga / Cup",
                        "Cups Terjual",
                        "Total Revenue",
                        "Kontribusi",
                      ].map((h) => (
                        <th
                          key={h}
                          style={{
                            padding: "10px 14px",
                            textAlign: "left",
                            fontSize: 11,
                            fontWeight: 600,
                            color: "#9ca3af",
                            textTransform: "uppercase",
                            letterSpacing: "0.5px",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {topProducts.map((p, i) => {
                      const contrib =
                        totalRevenue > 0
                          ? ((p.revenue / totalRevenue) * 100).toFixed(1)
                          : 0;
                      const barWidth =
                        totalRevenue > 0
                          ? (p.revenue /
                              Math.max(...topProducts.map((x) => x.revenue))) *
                            100
                          : 0;
                      return (
                        <tr
                          key={i}
                          style={{ borderBottom: "1px solid #f3f4f6" }}
                        >
                          <td style={{ padding: "14px" }}>
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                width: 30,
                                height: 30,
                                borderRadius: 8,
                                background:
                                  i === 0
                                    ? "linear-gradient(135deg, #FDB913, #f59e0b)"
                                    : i === 1
                                      ? "linear-gradient(135deg, #9ca3af, #6b7280)"
                                      : i === 2
                                        ? "linear-gradient(135deg, #d97706, #b45309)"
                                        : "#f3f4f6",
                                color: i < 3 ? "#fff" : "#6b7280",
                                fontSize: 13,
                                fontWeight: 700,
                              }}
                            >
                              {i + 1}
                            </span>
                          </td>
                          <td style={{ padding: "14px" }}>
                            <div
                              style={{
                                fontSize: 13.5,
                                fontWeight: 600,
                                color: "#1a1a2e",
                              }}
                            >
                              {p.name}
                            </div>
                            <div
                              style={{
                                fontSize: 11,
                                color: "#9ca3af",
                                marginTop: 2,
                              }}
                            >
                              {p.totalOrders} pesanan
                            </div>
                          </td>
                          <td style={{ padding: "14px" }}>
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
                              {p.category?.name || "—"}
                            </span>
                          </td>
                          <td
                            style={{
                              padding: "14px",
                              fontSize: 13,
                              fontWeight: 700,
                              color: "#FDB913",
                              fontFamily: "JetBrains Mono, monospace",
                            }}
                          >
                            {formatRupiah(p.price)}
                          </td>
                          <td style={{ padding: "14px" }}>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                              }}
                            >
                              <span
                                style={{
                                  fontSize: 15,
                                  fontWeight: 800,
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
                              padding: "14px",
                              fontSize: 14,
                              fontWeight: 700,
                              color: "#1a1a2e",
                              fontFamily: "JetBrains Mono, monospace",
                            }}
                          >
                            {formatRupiah(p.revenue)}
                          </td>
                          <td style={{ padding: "14px", minWidth: 140 }}>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 10,
                              }}
                            >
                              <div
                                style={{
                                  flex: 1,
                                  height: 7,
                                  borderRadius: 4,
                                  background: "#f3f4f6",
                                  overflow: "hidden",
                                }}
                              >
                                <div
                                  style={{
                                    width: `${barWidth}%`,
                                    height: "100%",
                                    background:
                                      "linear-gradient(90deg, #FDB913, #7A9B5E)",
                                    borderRadius: 4,
                                    transition: "width 0.6s ease",
                                  }}
                                />
                              </div>
                              <span
                                style={{
                                  fontSize: 11,
                                  fontWeight: 700,
                                  color: "#9ca3af",
                                  minWidth: 38,
                                  textAlign: "right",
                                }}
                              >
                                {contrib}%
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  {/* Footer Summary Row */}
                  <tfoot>
                    <tr
                      style={{
                        borderTop: "2px solid #f0f0f0",
                        background: "#fafafa",
                      }}
                    >
                      <td
                        colSpan={3}
                        style={{
                          padding: "14px",
                          fontSize: 13,
                          fontWeight: 700,
                          color: "#1a1a2e",
                        }}
                      >
                        Total
                      </td>
                      <td
                        style={{
                          padding: "14px",
                          fontSize: 12,
                          color: "#9ca3af",
                        }}
                      >
                        —
                      </td>
                      <td style={{ padding: "14px" }}>
                        <span
                          style={{
                            fontSize: 15,
                            fontWeight: 800,
                            color: "#60a5fa",
                            fontFamily: "JetBrains Mono, monospace",
                          }}
                        >
                          {totalCups}{" "}
                          <span
                            style={{
                              fontSize: 11,
                              color: "#9ca3af",
                              fontWeight: 500,
                            }}
                          >
                            cups
                          </span>
                        </span>
                      </td>
                      <td style={{ padding: "14px" }}>
                        <span
                          style={{
                            fontSize: 15,
                            fontWeight: 800,
                            color: "#FDB913",
                            fontFamily: "JetBrains Mono, monospace",
                          }}
                        >
                          {formatRupiah(totalRevenue)}
                        </span>
                      </td>
                      <td
                        style={{
                          padding: "14px",
                          fontSize: 12,
                          color: "#9ca3af",
                          fontWeight: 600,
                        }}
                      >
                        100%
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
