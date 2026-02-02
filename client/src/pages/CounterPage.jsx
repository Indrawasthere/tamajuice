import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCartStore } from "../store/cartStore";
import useAuthStore from "../store/authStore";
import { formatRupiah } from "../lib/format";
import api from "../lib/api";

export default function CounterPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [amountPaid, setAmountPaid] = useState(0);
  const [orderSuccess, setOrderSuccess] = useState(null);
  const [noteIndex, setNoteIndex] = useState(null);
  const [noteText, setNoteText] = useState("");
  const [currentTime, setCurrentTime] = useState("");
  const [amountDisplay, setAmountDisplay] = useState("");

  const { items, addItem, updateQuantity, removeItem, clearCart, getTotal } =
    useCartStore();
  const { user } = useAuthStore();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [pRes, cRes] = await Promise.all([
        api.get("/products?isAvailable=true"),
        api.get("/categories"),
      ]);
      setProducts(pRes.data.data);
      setCategories(cRes.data.data);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const filtered =
    selectedCategory === "all"
      ? products
      : products.filter((p) => p.categoryId === selectedCategory);

  const total = getTotal();
  const paid = amountPaid;
  const change = paid - total;

  const handleCheckout = async () => {
    if (!items.length) return;
    if (paid < total) return;
    setProcessing(true);
    try {
      const res = await api.post("/orders", {
        items: items.map((i) => ({
          productId: i.product.id,
          quantity: i.quantity,
          notes: i.notes,
        })),
        paymentMethod,
        amountPaid: paid,
      });
      try {
        await api.post(`/orders/${res.data.data.id}/print`);
      } catch (e) {}
      setOrderSuccess({ orderNumber: res.data.data.orderNumber, change });

      clearCart();
      setAmountPaid(0);
      setAmountDisplay("");
      setPaymentMethod("CASH");

      setTimeout(() => setOrderSuccess(null), 4000);
    } catch (err) {
      alert("Gagal: " + (err.response?.data?.message || "Unknown error"));
    } finally {
      setProcessing(false);
    }
  };

  const saveNote = () => {
    if (noteIndex !== null) {
      const newItems = [...items];
      newItems[noteIndex].notes = noteText;
      useCartStore.setState({ items: newItems });
      setNoteIndex(null);
      setNoteText("");
    }
  };

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        timeZone: "Asia/Jakarta",
      });
      setCurrentTime(timeStr);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatCurrencyInput = (value) => {
    const numeric = value.replace(/\D/g, "");

    const num = parseInt(numeric || "0");
    setAmountPaid(num);

    if (num === 0) {
      setAmountDisplay("");
    } else {
      setAmountDisplay(num.toLocaleString("id-ID"));
    }
  };

  const handleQuickAmount = (amount) => {
    setAmountPaid(amount);
    setAmountDisplay(amount.toLocaleString("id-ID"));
  };

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "#f3f4f6",
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* Main */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
        }}
      >
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
              Counter - Super Juice
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
              Live
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ color: "#6b7280", fontSize: 13 }}>
                {new Date().toLocaleDateString("id-ID", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })}
              </span>
              <span style={{ color: "#FDB913", fontSize: 13, fontWeight: 600 }}>
                {currentTime} WIB
              </span>
            </div>

            <button
              onClick={() => useAuthStore.getState().logout()}
              style={{
                padding: "6px 14px",
                borderRadius: 8,
                border: "1px solid #e5e7eb",
                background: "#fff",
                color: "#ef4444",
                fontSize: 12,
                fontWeight: 500,
                cursor: "pointer",
                transition: "all 0.2s",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#fef2f2";
                e.currentTarget.style.borderColor = "#fecaca";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#fff";
                e.currentTarget.style.borderColor = "#e5e7eb";
              }}
            >
              Logout
            </button>
          </div>
        </div>

        <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
          {/* Products */}
          <div style={{ flex: 1, padding: 24, overflowY: "auto" }}>
            {/* Category Pills */}
            <div
              style={{
                display: "flex",
                gap: 8,
                marginBottom: 20,
                flexWrap: "wrap",
              }}
            >
              {[{ id: "all", name: "Semua", icon: "" }, ...categories].map(
                (cat) => {
                  const isActive = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      style={{
                        padding: "12px 24px",
                        borderRadius: 24,
                        border: isActive ? "none" : "1.5px solid #e5e7eb",
                        background: isActive
                          ? "linear-gradient(135deg, #FDB913, #7A9B5E)"
                          : "#fff",
                        color: isActive ? "#fff" : "#6b7280",
                        fontSize: 13,
                        fontWeight: isActive ? 700 : 600,
                        cursor: "pointer",
                        transition: "all 0.2s",
                        boxShadow: isActive
                          ? "0 4px 12px rgba(253,185,19,0.3)"
                          : "0 1px 3px rgba(0,0,0,0.06)",
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <span>{cat.icon || ""}</span> {cat.name}
                    </button>
                  );
                },
              )}
            </div>

            {/* Product Grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                gap: 20,
              }}
            >
              {filtered.map((product) => (
                <button
                  key={product.id}
                  onClick={() => addItem(product, 1)}
                  style={{
                    background: "#fff",
                    borderRadius: 16,
                    border: "1.5px solid #f0f0f0",
                    padding: "24px 20px 20px",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                    position: "relative",
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    minHeight: 180,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-3px)";
                    e.currentTarget.style.boxShadow =
                      "0 8px 24px rgba(253,185,19,0.2)";
                    e.currentTarget.style.borderColor = "#FDB913";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow =
                      "0 2px 8px rgba(0,0,0,0.06)";
                    e.currentTarget.style.borderColor = "#f0f0f0";
                  }}
                >
                  {/* Color accent top */}
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      height: 4,
                      background: "linear-gradient(90deg, #FDB913, #7A9B5E)",
                    }}
                  />

                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 14,
                      background: "linear-gradient(135deg, #FFF8E1, #E8F5E9)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 24,
                      marginBottom: 12,
                    }}
                  >
                    {product.category?.icon || ""}
                  </div>
                  <div
                    style={{
                      fontSize: 16,
                      fontWeight: 700,
                      color: "#1a1a2e",
                      marginBottom: 8,
                      lineHeight: 1.3,
                      flex: 1,
                    }}
                  >
                    {product.name}
                  </div>
                  {product.description && (
                    <div
                      style={{
                        fontSize: 11,
                        color: "#9ca3af",
                        marginBottom: 8,
                        lineHeight: 1.3,
                      }}
                    >
                      {product.description}
                    </div>
                  )}
                  <div
                    style={{
                      fontSize: 20,
                      fontWeight: 800,
                      color: "#FDB913",
                      fontFamily: "JetBrains Mono, monospace",
                      marginTop: "auto",
                      paddingTop: 8,
                      borderTop: "2px dashed #f0f0f0",
                    }}
                  >
                    {formatRupiah(product.price)}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Cart Panel */}
          <div
            style={{
              width: 400,
              background: "#fff",
              borderLeft: "1px solid #e5e7eb",
              display: "flex",
              flexDirection: "column",
              position: "sticky",
              top: 64,
              height: "calc(100vh - 64px)",
              boxShadow: "-4px 0 20px rgba(0,0,0,0.05)",
            }}
          >
            {/* Cart Header */}
            <div
              style={{
                padding: "18px 20px 14px",
                borderRadius: 10,
                borderBottom: "1px solid #f0f0f0",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <h2
                  style={{
                    margin: 0,
                    fontSize: 16,
                    fontWeight: 700,
                    color: "#1a1a2e",
                    fontFamily: "Inter, sans-serif",
                  }}
                >
                  Pesanan
                </h2>
                {items.length > 0 && (
                  <span
                    style={{
                      background: "#FDB913",
                      color: "#fff",
                      fontSize: 11,
                      fontWeight: 700,
                      padding: "2px 8px",
                      borderRadius: 14,
                      fontFamily: "JetBrains Mono, monospace",
                    }}
                  >
                    {items.reduce((s, i) => s + i.quantity, 0)}
                  </span>
                )}
              </div>
              {items.length > 0 && (
                <button
                  onClick={() => {
                    clearCart();
                    setAmountPaid(0);
                    setAmountDisplay("");
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#ef4444",
                    fontSize: 12,
                    cursor: "pointer",
                    fontWeight: 500,
                    padding: "4px 8px",
                    borderRadius: 6,
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "#fef2f2")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  Hapus Semua
                </button>
              )}
            </div>

            {/* Cart Items */}
            <div style={{ flex: 1, overflowY: "auto", padding: "10px 16px" }}>
              {items.length === 0 ? (
                <div
                  style={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 12,
                    color: "#9ca3af",
                    paddingTop: 40,
                  }}
                >
                  <div style={{ fontSize: 48, opacity: 0.4 }}>🛒</div>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>
                    Keranjang kosong
                  </div>
                  <div style={{ fontSize: 12 }}>Pilih produk untuk mulai</div>
                </div>
              ) : (
                items.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: "10px 0",
                      borderBottom:
                        idx < items.length - 1 ? "1px solid #f3f4f6" : "none",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 10,
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: 16,
                            fontWeight: 700,
                            color: "#1a1a2e",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {item.product.name}
                        </div>
                        <div
                          style={{
                            fontSize: 12,
                            color: "#9ca3af",
                            marginTop: 2,
                          }}
                        >
                          {formatRupiah(item.product.price)} × {item.quantity} ={" "}
                          <span style={{ color: "#FDB913", fontWeight: 600 }}>
                            {formatRupiah(item.product.price * item.quantity)}
                          </span>
                        </div>
                        {item.notes && (
                          <div
                            style={{
                              fontSize: 11,
                              color: "#7A9B5E",
                              marginTop: 3,
                              background: "#eef5ec",
                              padding: "2px 8px",
                              borderRadius: 6,
                              display: "inline-block",
                            }}
                          >
                            {item.notes}
                          </div>
                        )}
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        <button
                          onClick={() => updateQuantity(idx, item.quantity - 1)}
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: 8,
                            border: "1.5px solid #e5e7eb",
                            background: "#fff",
                            color: "#6b7280",
                            fontSize: 16,
                            fontWeight: 600,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            transition: "all 0.15s",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = "#E63946";
                            e.currentTarget.style.color = "#E63946";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = "#e5e7eb";
                            e.currentTarget.style.color = "#6b7280";
                          }}
                        >
                          −
                        </button>
                        <span
                          style={{
                            width: 24,
                            textAlign: "center",
                            fontSize: 14,
                            fontWeight: 700,
                            color: "#1a1a2e",
                            fontFamily: "JetBrains Mono, monospace",
                          }}
                        >
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(idx, item.quantity + 1)}
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: 8,
                            border: "1.5px solid #e5e7eb",
                            background: "#fff",
                            color: "#6b7280",
                            fontSize: 16,
                            fontWeight: 600,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            transition: "all 0.15s",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = "#7A9B5E";
                            e.currentTarget.style.color = "#7A9B5E";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = "#e5e7eb";
                            e.currentTarget.style.color = "#6b7280";
                          }}
                        >
                          +
                        </button>
                      </div>
                    </div>
                    {/* Note button */}
                    <button
                      onClick={() => {
                        setNoteIndex(idx);
                        setNoteText(item.notes || "");
                      }}
                      style={{
                        background: "none",
                        border: "none",
                        padding: "3px 0 0",
                        color: "#9ca3af",
                        fontSize: 11,
                        cursor: "pointer",
                        fontWeight: 500,
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.color = "#7A9B5E")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.color = "#9ca3af")
                      }
                    >
                      + Tambah catatan
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Note Modal Inline */}
            {noteIndex !== null && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "rgba(0,0,0,0.4)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 200,
                }}
              >
                <div
                  style={{
                    background: "#fff",
                    borderRadius: 16,
                    padding: 24,
                    width: 280,
                    boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
                  }}
                >
                  <h3
                    style={{
                      margin: "0 0 4px",
                      fontSize: 15,
                      fontWeight: 700,
                      color: "#1a1a2e",
                      fontFamily: "Inter, sans-serif",
                    }}
                  >
                    Catatan
                  </h3>
                  <p
                    style={{
                      margin: "0 0 12px",
                      fontSize: 12,
                      color: "#9ca3af",
                    }}
                  >
                    {items[noteIndex]?.product?.name}
                  </p>
                  <textarea
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    placeholder="Misal: tanpa gula, es batu extra..."
                    style={{
                      width: "100%",
                      height: 80,
                      borderRadius: 10,
                      border: "1.5px solid #e5e7eb",
                      padding: "10px 12px",
                      fontSize: 13,
                      resize: "none",
                      outline: "none",
                      fontFamily: "Inter, sans-serif",
                      boxSizing: "border-box",
                    }}
                  />
                  <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
                    <button
                      onClick={saveNote}
                      style={{
                        flex: 1,
                        padding: "8px 0",
                        borderRadius: 10,
                        border: "none",
                        background: "linear-gradient(135deg, #FDB913, #7A9B5E)",
                        color: "#fff",
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      Simpan
                    </button>
                    <button
                      onClick={() => setNoteIndex(null)}
                      style={{
                        flex: 1,
                        padding: "8px 0",
                        borderRadius: 10,
                        border: "1.5px solid #e5e7eb",
                        background: "#fff",
                        color: "#6b7280",
                        fontSize: 13,
                        fontWeight: 500,
                        cursor: "pointer",
                      }}
                    >
                      Batal
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Payment & Total */}
            {items.length > 0 && (
              <div style={{ borderTop: "1px solid #f0f0f0", padding: "16px" }}>
                {/* Total */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 14,
                    padding: "10px 12px",
                    borderRadius: 10,
                    background: "linear-gradient(135deg, #FFF8E1, #E8F5E9)",
                  }}
                >
                  <span
                    style={{ fontSize: 14, fontWeight: 600, color: "#1a1a2e" }}
                  >
                    Total
                  </span>
                  <span
                    style={{
                      fontSize: 20,
                      fontWeight: 800,
                      color: "#FDB913",
                      fontFamily: "JetBrains Mono, monospace",
                    }}
                  >
                    {formatRupiah(total)}
                  </span>
                </div>

                {/* Payment Method */}
                <div style={{ marginBottom: 12 }}>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: "#9ca3af",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      marginBottom: 6,
                    }}
                  >
                    Metode Pembayaran
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    {["CASH", "QRIS"].map((method) => (
                      <button
                        key={method}
                        onClick={() => setPaymentMethod(method)}
                        style={{
                          flex: 1,
                          padding: "9px 0",
                          borderRadius: 10,
                          border:
                            paymentMethod === method
                              ? "none"
                              : "1.5px solid #e5e7eb",
                          background:
                            paymentMethod === method
                              ? "linear-gradient(135deg, #FDB913, #7A9B5E)"
                              : "#fff",
                          color: paymentMethod === method ? "#fff" : "#6b7280",
                          fontSize: 13,
                          fontWeight: paymentMethod === method ? 600 : 500,
                          cursor: "pointer",
                          transition: "all 0.2s",
                          boxShadow:
                            paymentMethod === method
                              ? "0 3px 10px rgba(253,185,19,0.3)"
                              : "none",
                        }}
                      >
                        {method === "CASH" ? "" : ""} {method}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Amount Input */}
                <div style={{ marginBottom: 10 }}>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: "#9ca3af",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      marginBottom: 6,
                    }}
                  >
                    Jumlah Bayar
                  </div>
                  <div style={{ position: "relative" }}>
                    <span
                      style={{
                        position: "absolute",
                        left: 14,
                        top: "50%",
                        transform: "translateY(-50%)",
                        fontSize: 16,
                        fontWeight: 600,
                        color: "#FDB913",
                        fontFamily: "Inter, sans-serif",
                      }}
                    >
                      Rp
                    </span>
                    <input
                      type="text"
                      value={amountDisplay}
                      onChange={(e) => formatCurrencyInput(e.target.value)}
                      placeholder="0"
                      style={{
                        width: "100%",
                        padding: "12px 12px 12px 40px",
                        borderRadius: 12,
                        border: "2px solid #e5e7eb",
                        fontSize: 20,
                        fontWeight: 700,
                        fontFamily: "JetBrains Mono, monospace",
                        outline: "none",
                        boxSizing: "border-box",
                        color: "#1a1a2e",
                        background: "#f9fafb",
                        textAlign: "right",
                        letterSpacing: "0.5px",
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = "#FDB913";
                        e.currentTarget.style.background = "#fff";
                        e.currentTarget.style.boxShadow =
                          "0 0 0 3px rgba(253, 185, 19, 0.1)";
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = "#e5e7eb";
                        e.currentTarget.style.background = "#f9fafb";
                        e.currentTarget.style.boxShadow = "none";
                      }}
                    />
                  </div>
                  <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                    {[10000, 20000, 50000, 100000].map((amt) => (
                      <button
                        key={amt}
                        onClick={() => handleQuickAmount(amt)}
                        style={{
                          flex: 1,
                          padding: "5px 2px",
                          borderRadius: 8,
                          border: "1px solid #e5e7eb",
                          background: "#f9fafb",
                          color: "#6b7280",
                          fontSize: 10.5,
                          fontWeight: 600,
                          cursor: "pointer",
                          transition: "all 0.15s",
                          fontFamily: "JetBrains Mono, monospace",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "#FFF8E1";
                          e.currentTarget.style.borderColor = "#FDB913";
                          e.currentTarget.style.color = "#FDB913";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "#f9fafb";
                          e.currentTarget.style.borderColor = "#e5e7eb";
                          e.currentTarget.style.color = "#6b7280";
                        }}
                      >
                        {formatRupiah(amt).replace("Rp", "")}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Change */}
                {paid >= total && paid > 0 && (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "8px 12px",
                      borderRadius: 10,
                      background: change === 0 ? "#eef5ec" : "#fef3c7",
                      marginBottom: 12,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: change === 0 ? "#7A9B5E" : "#92400e",
                      }}
                    >
                      {change === 0 ? "✓ Pas" : "Kembalian"}
                    </span>
                    <span
                      style={{
                        fontSize: 15,
                        fontWeight: 700,
                        color: change === 0 ? "#7A9B5E" : "#92400e",
                        fontFamily: "JetBrains Mono, monospace",
                      }}
                    >
                      {formatRupiah(change)}
                    </span>
                  </div>
                )}

                {/* Checkout */}
                <button
                  onClick={handleCheckout}
                  disabled={processing || paid < total || amountPaid === 0}
                  style={{
                    width: "100%",
                    padding: "13px 0",
                    borderRadius: 12,
                    border: "none",
                    background:
                      processing || paid < total || !amountPaid
                        ? "#d1d5db"
                        : "linear-gradient(135deg, #FDB913, #7A9B5E)",
                    color: "#fff",
                    fontSize: 15,
                    fontWeight: 700,
                    cursor:
                      processing || paid < total || !amountPaid
                        ? "not-allowed"
                        : "pointer",
                    transition: "all 0.2s",
                    letterSpacing: "0.3px",
                    boxShadow:
                      processing || paid < total || !amountPaid
                        ? "none"
                        : "0 4px 16px rgba(253,185,19,0.35)",
                    fontFamily: "Inter, sans-serif",
                  }}
                >
                  {processing ? "Memproses..." : "CHECKOUT & CETAK"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Success Toast */}
      {orderSuccess && (
        <div className="success-toast">
          <div className="icon">✓</div>

          <div className="content">
            <div className="title">Order Berhasil</div>
            <div className="text">
              No: <strong>{orderSuccess.orderNumber}</strong>
            </div>
            <div className="text">
              Kembalian:{" "}
              <strong className="money">
                {formatRupiah(orderSuccess.change)}
              </strong>
            </div>
            <div className="text">Struk dicetak otomatis</div>
          </div>

          <div className="progress" />
        </div>
      )}

      <style>{`
      .success-toast {
        position: fixed;
        top: 24px;
        right: 24px;
        z-index: 999;
        width: 320px;
        background: rgba(255,255,255,0.9);
        backdrop-filter: blur(12px);
        border-radius: 18px;
        padding: 18px 20px;
        display: flex;
        gap: 14px;
        align-items: flex-start;
        border: 1px solid #d1fae5;
        box-shadow:
          0 20px 40px rgba(0,0,0,0.15),
          inset 0 0 0 1px rgba(255,255,255,0.4);
        animation: toastIn 0.4s cubic-bezier(.22,1,.36,1);
      }

      .success-toast:hover {
        transform: translateY(-2px);
      }

      .icon {
        width: 44px;
        height: 44px;
        border-radius: 14px;
        background: linear-gradient(135deg, #22c55e, #4ade80);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 22px;
        box-shadow: 0 8px 20px rgba(34,197,94,0.4);
        flex-shrink: 0;
      }

      .content {
        flex: 1;
      }

      .title {
        font-size: 14px;
        font-weight: 700;
        color: #1f2937;
      }

      .text {
        font-size: 12px;
        color: #6b7280;
        margin-top: 2px;
      }

      .money {
        color: #16a34a;
      }

      .progress {
        position: absolute;
        bottom: 0;
        left: 0;
        height: 3px;
        width: 100%;
        background: linear-gradient(90deg, #22c55e, #86efac);
        border-radius: 0 0 18px 18px;
        animation: progress 3s linear forwards;
      }

      @keyframes toastIn {
        from {
          transform: translateX(120%) scale(0.95);
          opacity: 0;
        }
        to {
          transform: translateX(0) scale(1);
          opacity: 1;
        }
      }

      @keyframes progress {
        from { width: 100%; }
        to { width: 0%; }
      }
      `}</style>
    </div>
  );
}
