import { useState, useEffect } from "react";
import { useAuthStore } from "../store/authStore";
import { formatRupiah } from "../lib/format";
import Sidebar from "../components/Sidebar";
import api from "../lib/api";

const EMPTY_FORM = {
  name: "",
  description: "",
  price: "",
  categoryId: "",
  isAvailable: true,
};

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [filterCat, setFilterCat] = useState("all");
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [pRes, cRes] = await Promise.all([
        api.get("/products"),
        api.get("/categories"),
      ]);
      setProducts(pRes.data.data);
      setCategories(cRes.data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  };

  const openCreate = () => {
    setEditId(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const openEdit = (p) => {
    setEditId(p.id);
    setForm({
      name: p.name,
      description: p.description || "",
      price: String(p.price),
      categoryId: p.categoryId,
      isAvailable: p.isAvailable,
    });
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!form.name || !form.price || !form.categoryId) return;
    try {
      const payload = { ...form, price: parseInt(form.price) };
      if (editId) {
        await api.put(`/products/${editId}`, payload);
        showToast("Produk diupdate");
      } else {
        await api.post("/products", payload);
        showToast("Produk ditambahkan");
      }
      setShowModal(false);
      fetchAll();
    } catch (e) {
      showToast(e.response?.data?.message || "Error", "error");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Hapus produk ini?")) return;
    try {
      await api.delete(`/products/${id}`);
      showToast("Produk dihapus");
      fetchAll();
    } catch (e) {
      showToast("Gagal hapus", "error");
    }
  };

  const toggleAvail = async (p) => {
    try {
      await api.put(`/products/${p.id}`, { isAvailable: !p.isAvailable });
      fetchAll();
    } catch (e) {
      showToast("Gagal toggle", "error");
    }
  };

  const filtered = products.filter((p) => {
    const matchCat = filterCat === "all" || p.categoryId === filterCat;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "#f3f4f6",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <Sidebar currentPath="/products" />

      <div style={{ marginLeft: 240, flex: 1 }}>
        {/* Topbar */}
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
                margin: 0,
              }}
            >
              Kelola Produk
            </h1>
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: "#f97316",
                background: "#fff7ed",
                padding: "3px 10px",
                borderRadius: 20,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              {products.length} produk
            </span>
          </div>
          <button
            onClick={openCreate}
            style={{
              padding: "8px 18px",
              borderRadius: 10,
              border: "none",
              background: "linear-gradient(135deg, #FDB913, #7A9B5E)",
              color: "#fff",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              boxShadow: "0 3px 10px rgba(253,185,19,0.3)",
            }}
          >
            + Tambah Produk
          </button>
        </div>

        <div style={{ padding: "24px 28px", maxWidth: 1400 }}>
          {/* Filter bar */}
          <div
            style={{
              display: "flex",
              gap: 12,
              marginBottom: 20,
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari produk..."
              style={{
                padding: "9px 16px",
                borderRadius: 10,
                border: "1.5px solid #e5e7eb",
                fontSize: 13,
                outline: "none",
                width: 220,
                background: "#fff",
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "#FDB913")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "#e5e7eb")}
            />
            <div style={{ display: "flex", gap: 6 }}>
              {[{ id: "all", name: "Semua" }, ...categories].map((c) => (
                <button
                  key={c.id}
                  onClick={() => setFilterCat(c.id)}
                  style={{
                    padding: "7px 14px",
                    borderRadius: 8,
                    border: filterCat === c.id ? "none" : "1px solid #e5e7eb",
                    background:
                      filterCat === c.id
                        ? "linear-gradient(135deg, #FDB913, #7A9B5E)"
                        : "#fff",
                    color: filterCat === c.id ? "#fff" : "#6b7280",
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          {/* Product Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
              gap: 18,
            }}
          >
            {filtered.map((p) => (
              <div
                key={p.id}
                style={{
                  background: "#fff",
                  borderRadius: 16,
                  border: "1px solid #f0f0f0",
                  overflow: "hidden",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                  opacity: p.isAvailable ? 1 : 0.55,
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow =
                    "0 8px 24px rgba(0,0,0,0.1)";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow =
                    "0 2px 8px rgba(0,0,0,0.06)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                {/* Top gradient bar */}
                <div
                  style={{
                    height: 5,
                    background: p.isAvailable
                      ? "linear-gradient(90deg, #FDB913, #7A9B5E)"
                      : "#d1d5db",
                  }}
                />
                <div style={{ padding: "18px 20px" }}>
                  {/* Name + toggle */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: 8,
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: 15,
                          fontWeight: 700,
                          color: "#1a1a2e",
                        }}
                      >
                        {p.name}
                      </div>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          color: "#7A9B5E",
                          background: "#eef5ec",
                          padding: "2px 8px",
                          borderRadius: 10,
                          marginTop: 4,
                          display: "inline-block",
                        }}
                      >
                        {p.category?.name || "—"}
                      </span>
                    </div>
                    {/* Toggle */}
                    <div
                      onClick={() => toggleAvail(p)}
                      style={{
                        width: 44,
                        height: 24,
                        borderRadius: 12,
                        background: p.isAvailable ? "#7A9B5E" : "#d1d5db",
                        cursor: "pointer",
                        position: "relative",
                        transition: "background 0.2s",
                      }}
                    >
                      <div
                        style={{
                          position: "absolute",
                          top: 2,
                          left: p.isAvailable ? 22 : 2,
                          width: 20,
                          height: 20,
                          borderRadius: "50%",
                          background: "#fff",
                          boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                          transition: "left 0.2s",
                        }}
                      />
                    </div>
                  </div>

                  {p.description && (
                    <div
                      style={{
                        fontSize: 12,
                        color: "#9ca3af",
                        marginBottom: 10,
                        lineHeight: 1.4,
                      }}
                    >
                      {p.description}
                    </div>
                  )}

                  {/* Price + actions */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginTop: 12,
                      paddingTop: 12,
                      borderTop: "1px solid #f3f4f6",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 20,
                        fontWeight: 800,
                        color: "#FDB913",
                        fontFamily: "JetBrains Mono, monospace",
                      }}
                    >
                      {formatRupiah(p.price)}
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button
                        onClick={() => openEdit(p)}
                        style={{
                          padding: "5px 12px",
                          borderRadius: 8,
                          border: "1px solid #e5e7eb",
                          background: "#fff",
                          color: "#6b7280",
                          fontSize: 11,
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = "#60a5fa";
                          e.currentTarget.style.color = "#60a5fa";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = "#e5e7eb";
                          e.currentTarget.style.color = "#6b7280";
                        }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        style={{
                          padding: "5px 12px",
                          borderRadius: 8,
                          border: "1px solid #e5e7eb",
                          background: "#fff",
                          color: "#6b7280",
                          fontSize: 11,
                          fontWeight: 600,
                          cursor: "pointer",
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
                        Hapus
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty state */}
          {filtered.length === 0 && !loading && (
            <div
              style={{
                textAlign: "center",
                padding: "60px 0",
                color: "#9ca3af",
              }}
            >
              <div style={{ fontSize: 48, marginBottom: 12, opacity: 0.3 }}>
                🍹
              </div>
              <div style={{ fontSize: 15, fontWeight: 600 }}>
                Tidak ada produk ditemukan
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal - Create/Edit */}
      {showModal && (
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
              width: 440,
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 40px 80px rgba(0,0,0,0.2)",
            }}
          >
            {/* Modal header */}
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
                {editId ? "Edit Produk" : "Tambah Produk"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
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

            {/* Form fields */}
            {[
              {
                key: "name",
                label: "Nama Produk",
                placeholder: "Misal: Jus Jeruk",
              },
              {
                key: "description",
                label: "Deskripsi (opsional)",
                placeholder: "Deskripsi singkat...",
              },
              { key: "price", label: "Harga (Rp)", placeholder: "12000" },
            ].map((field) => (
              <div key={field.key} style={{ marginBottom: 16 }}>
                <label
                  style={{
                    display: "block",
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#6b7280",
                    marginBottom: 6,
                  }}
                >
                  {field.label}
                </label>
                <input
                  value={form[field.key]}
                  onChange={(e) =>
                    setForm({ ...form, [field.key]: e.target.value })
                  }
                  placeholder={field.placeholder}
                  type={field.key === "price" ? "number" : "text"}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: 10,
                    border: "1.5px solid #e5e7eb",
                    fontSize: 13,
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                  onFocus={(e) =>
                    (e.currentTarget.style.borderColor = "#FDB913")
                  }
                  onBlur={(e) =>
                    (e.currentTarget.style.borderColor = "#e5e7eb")
                  }
                />
              </div>
            ))}

            {/* Category dropdown */}
            <div style={{ marginBottom: 16 }}>
              <label
                style={{
                  display: "block",
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#6b7280",
                  marginBottom: 6,
                }}
              >
                Kategori
              </label>
              <select
                value={form.categoryId}
                onChange={(e) =>
                  setForm({ ...form, categoryId: e.target.value })
                }
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: 10,
                  border: "1.5px solid #e5e7eb",
                  fontSize: 13,
                  outline: "none",
                  background: "#fff",
                  cursor: "pointer",
                }}
              >
                <option value="">Pilih kategori...</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Availability toggle */}
            <div style={{ marginBottom: 24 }}>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  cursor: "pointer",
                }}
              >
                <div
                  onClick={() =>
                    setForm({ ...form, isAvailable: !form.isAvailable })
                  }
                  style={{
                    width: 44,
                    height: 24,
                    borderRadius: 12,
                    background: form.isAvailable ? "#7A9B5E" : "#d1d5db",
                    position: "relative",
                    transition: "background 0.2s",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: 2,
                      left: form.isAvailable ? 22 : 2,
                      width: 20,
                      height: 20,
                      borderRadius: "50%",
                      background: "#fff",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                      transition: "left 0.2s",
                    }}
                  />
                </div>
                <span
                  style={{ fontSize: 13, color: "#6b7280", fontWeight: 500 }}
                >
                  Tersedia di counter
                </span>
              </label>
            </div>

            {/* Submit buttons */}
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={handleSubmit}
                style={{
                  flex: 1,
                  padding: "11px 0",
                  borderRadius: 12,
                  border: "none",
                  background: "linear-gradient(135deg, #FDB913, #7A9B5E)",
                  color: "#fff",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                  boxShadow: "0 4px 14px rgba(253,185,19,0.3)",
                }}
              >
                {editId ? "Update" : "Tambahkan"}
              </button>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  flex: 1,
                  padding: "11px 0",
                  borderRadius: 12,
                  border: "1.5px solid #e5e7eb",
                  background: "#fff",
                  color: "#6b7280",
                  fontSize: 14,
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

      {/* Toast */}
      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: 32,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 999,
            background: toast.type === "error" ? "#fef2f2" : "#eef5ec",
            border: `1px solid ${toast.type === "error" ? "#fecaca" : "#bbf7d0"}`,
            borderRadius: 12,
            padding: "10px 20px",
            fontSize: 13,
            fontWeight: 600,
            color: toast.type === "error" ? "#dc2626" : "#16a34a",
            boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
          }}
        >
          {toast.msg}
        </div>
      )}
    </div>
  );
}
