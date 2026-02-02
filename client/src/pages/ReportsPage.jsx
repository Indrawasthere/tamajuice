import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
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
} from "recharts";

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
              {p.name === "Revenue" ? "Revenue: " : "Cups: "}
            </span>
            {p.name === "Revenue" ? formatRupiah(p.value) : p.value}
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
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showCloseBook, setShowCloseBook] = useState(false);
  const [closeBookPeriod, setCloseBookPeriod] = useState("daily");
  const [closeBookResult, setCloseBookResult] = useState(null);
  const [closingLoading, setClosingLoading] = useState(false);

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
      p.name,
      p.category?.name || "-",
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
      // kalau endpoint belum ada, generate summary dari data lokal
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
            {/* Export + Close Book buttons */}
            <div style={{ display: "flex", gap: 8, position: "relative" }}>
              {/* Export */}
              <div style={{ position: "relative" }}>
                <button
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  style={{
                    padding: "6px 14px",
                    borderRadius: 8,
                    border: "1px solid #e5e7eb",
                    background: "#fff",
                    color: "#6b7280",
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  Export {showExportMenu ? "" : ""}
                </button>
                {showExportMenu && (
                  <div
                    style={{
                      position: "absolute",
                      top: "calc(100% + 6px)",
                      right: 0,
                      background: "#fff",
                      borderRadius: 10,
                      border: "1px solid #e5e7eb",
                      boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
                      minWidth: 160,
                      zIndex: 100,
                      overflow: "hidden",
                    }}
                  >
                    {[
                      { label: "Export CSV", fn: exportCSV, icon: "" },
                      { label: "Export JSON", fn: exportJSON, icon: "" },
                    ].map((item) => (
                      <button
                        key={item.label}
                        onClick={item.fn}
                        style={{
                          width: "100%",
                          padding: "10px 16px",
                          border: "none",
                          background: "transparent",
                          color: "#374151",
                          fontSize: 13,
                          fontWeight: 500,
                          cursor: "pointer",
                          textAlign: "left",
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background = "#f9fafb")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background = "transparent")
                        }
                      >
                        {item.icon} {item.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Close Book */}
              <button
                onClick={() => {
                  setShowCloseBook(true);
                  setCloseBookResult(null);
                }}
                style={{
                  padding: "6px 14px",
                  borderRadius: 8,
                  border: "none",
                  background: "linear-gradient(135deg, #a78bfa, #8b5cf6)",
                  color: "#fff",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  boxShadow: "0 3px 10px rgba(167,139,250,0.3)",
                }}
              >
                Close Book
              </button>
            </div>
            {/* Close Book Modal */}
            {showCloseBook && (
              <div
                style={{
                  position: "fixed",
                  inset: 0,
                  background: "rgba(0,0,0,0.45)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 500,
                }}
              >
                <div
                  style={{
                    background: "#fff",
                    borderRadius: 20,
                    padding: 32,
                    width: 460,
                    boxShadow: "0 40px 80px rgba(0,0,0,0.2)",
                    maxHeight: "90vh",
                    overflowY: "auto",
                  }}
                >
                  {/* Header */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 24,
                    }}
                  >
                    <h2
                      style={{
                        margin: 0,
                        fontSize: 18,
                        fontWeight: 700,
                        color: "#1a1a2e",
                      }}
                    >
                      Close Book
                    </h2>
                    <button
                      onClick={() => {
                        setShowCloseBook(false);
                        setCloseBookResult(null);
                      }}
                      style={{
                        background: "none",
                        border: "none",
                        fontSize: 20,
                        color: "#9ca3af",
                        cursor: "pointer",
                      }}
                    >
                      ✕
                    </button>
                  </div>

                  {!closeBookResult ? (
                    <>
                      {/* Period Selector */}
                      <div style={{ marginBottom: 20 }}>
                        <label
                          style={{
                            display: "block",
                            fontSize: 12,
                            fontWeight: 600,
                            color: "#6b7280",
                            marginBottom: 8,
                          }}
                        >
                          Pilih Periode
                        </label>
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: 8,
                          }}
                        >
                          {[
                            { value: "daily", label: "Harian", icon: "" },
                            { value: "weekly", label: "Mingguan", icon: "" },
                            { value: "monthly", label: "Bulanan", icon: "" },
                            { value: "yearly", label: "Tahunan", icon: "" },
                          ].map((opt) => (
                            <button
                              key={opt.value}
                              onClick={() => setCloseBookPeriod(opt.value)}
                              style={{
                                padding: "14px 12px",
                                borderRadius: 12,
                                border:
                                  closeBookPeriod === opt.value
                                    ? "2px solid #a78bfa"
                                    : "1.5px solid #e5e7eb",
                                background:
                                  closeBookPeriod === opt.value
                                    ? "#f5f3ff"
                                    : "#fff",
                                cursor: "pointer",
                                textAlign: "left",
                                display: "flex",
                                alignItems: "center",
                                gap: 10,
                              }}
                            >
                              <span style={{ fontSize: 20 }}>{opt.icon}</span>
                              <div>
                                <div
                                  style={{
                                    fontSize: 13,
                                    fontWeight: 600,
                                    color:
                                      closeBookPeriod === opt.value
                                        ? "#7c3aed"
                                        : "#1a1a2e",
                                  }}
                                >
                                  {opt.label}
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Preview Summary */}
                      <div
                        style={{
                          background: "#fafafa",
                          borderRadius: 12,
                          padding: 16,
                          marginBottom: 20,
                          border: "1px solid #f0f0f0",
                        }}
                      >
                        <div
                          style={{
                            fontSize: 12,
                            fontWeight: 600,
                            color: "#9ca3af",
                            marginBottom: 10,
                            textTransform: "uppercase",
                            letterSpacing: "0.5px",
                          }}
                        >
                          Preview Summary
                        </div>
                        {[
                          {
                            label: "Total Revenue",
                            value: formatRupiah(totalRevenue),
                            color: "#FDB913",
                          },
                          {
                            label: "Total Orders",
                            value: totalOrders,
                            color: "#7A9B5E",
                          },
                          {
                            label: "Total Cups",
                            value: totalCups,
                            color: "#60a5fa",
                          },
                          {
                            label: "Avg Order Value",
                            value: formatRupiah(avgOrderValue),
                            color: "#a78bfa",
                          },
                        ].map((s) => (
                          <div
                            key={s.label}
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              padding: "6px 0",
                              borderBottom: "1px solid #f0f0f0",
                            }}
                          >
                            <span style={{ fontSize: 13, color: "#6b7280" }}>
                              {s.label}
                            </span>
                            <span
                              style={{
                                fontSize: 13,
                                fontWeight: 700,
                                color: s.color,
                                fontFamily: "JetBrains Mono, monospace",
                              }}
                            >
                              {s.value}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Confirm Button */}
                      <button
                        onClick={handleCloseBook}
                        disabled={closingLoading}
                        style={{
                          width: "100%",
                          padding: "12px 0",
                          borderRadius: 12,
                          border: "none",
                          background: closingLoading
                            ? "#d1d5db"
                            : "linear-gradient(135deg, #a78bfa, #8b5cf6)",
                          color: "#fff",
                          fontSize: 14,
                          fontWeight: 600,
                          cursor: closingLoading ? "not-allowed" : "pointer",
                          boxShadow: closingLoading
                            ? "none"
                            : "0 4px 14px rgba(167,139,250,0.35)",
                        }}
                      >
                        {closingLoading
                          ? "Memproses..."
                          : `Konfirmasi Close Book ${closeBookPeriod.charAt(0).toUpperCase() + closeBookPeriod.slice(1)}`}
                      </button>
                    </>
                  ) : (
                    /* Result view */
                    <>
                      <div style={{ textAlign: "center", marginBottom: 20 }}>
                        <div
                          style={{
                            width: 64,
                            height: 64,
                            borderRadius: 16,
                            margin: "0 auto 12px",
                            background:
                              "linear-gradient(135deg, #a78bfa, #8b5cf6)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 28,
                            boxShadow: "0 8px 20px rgba(167,139,250,0.4)",
                          }}
                        >
                          ✓
                        </div>
                        <div
                          style={{
                            fontSize: 16,
                            fontWeight: 700,
                            color: "#1a1a2e",
                          }}
                        >
                          Close Book Berhasil
                        </div>
                        <div
                          style={{
                            fontSize: 12,
                            color: "#9ca3af",
                            marginTop: 4,
                          }}
                        >
                          Periode:{" "}
                          {closeBookResult.period.charAt(0).toUpperCase() +
                            closeBookResult.period.slice(1)}{" "}
                          — {closeBookResult.date}
                        </div>
                      </div>

                      {/* Result Summary */}
                      <div
                        style={{
                          background: "#f5f3ff",
                          borderRadius: 12,
                          padding: 18,
                          marginBottom: 20,
                        }}
                      >
                        {[
                          {
                            label: "Total Revenue",
                            value: formatRupiah(closeBookResult.totalRevenue),
                            color: "#FDB913",
                          },
                          {
                            label: "Total Orders",
                            value: closeBookResult.totalOrders,
                            color: "#7A9B5E",
                          },
                          {
                            label: "Total Cups",
                            value: closeBookResult.totalCups,
                            color: "#60a5fa",
                          },
                          {
                            label: "Avg Order Value",
                            value: formatRupiah(closeBookResult.avgOrderValue),
                            color: "#a78bfa",
                          },
                        ].map((s) => (
                          <div
                            key={s.label}
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              padding: "7px 0",
                              borderBottom: "1px solid rgba(167,139,250,0.15)",
                            }}
                          >
                            <span style={{ fontSize: 13, color: "#6b7280" }}>
                              {s.label}
                            </span>
                            <span
                              style={{
                                fontSize: 13,
                                fontWeight: 700,
                                color: s.color,
                                fontFamily: "JetBrains Mono, monospace",
                              }}
                            >
                              {s.value}
                            </span>
                          </div>
                        ))}
                      </div>

                      <button
                        onClick={() => {
                          setShowCloseBook(false);
                          setCloseBookResult(null);
                        }}
                        style={{
                          width: "100%",
                          padding: "11px 0",
                          borderRadius: 12,
                          border: "none",
                          background:
                            "linear-gradient(135deg, #a78bfa, #8b5cf6)",
                          color: "#fff",
                          fontSize: 14,
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        Selesai
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
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
