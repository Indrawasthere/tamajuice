import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  CheckCircle2,
  XCircle,
  Filter,
  PackageSearch,
  ChevronRight,
} from "lucide-react";
import useAuthStore from "../store/authStore";
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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const cardVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 },
  exit: { scale: 0.9, opacity: 0 },
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
        showToast("Produk berhasil diperbarui");
      } else {
        await api.post("/products", payload);
        showToast("Produk baru ditambahkan");
      }
      setShowModal(false);
      fetchAll();
    } catch (e) {
      showToast(e.response?.data?.message || "Terjadi kesalahan", "error");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Hapus produk ini secara permanen?")) return;
    try {
      await api.delete(`/products/${id}`);
      showToast("Produk telah dihapus");
      fetchAll();
    } catch (e) {
      showToast("Gagal menghapus produk", "error");
    }
  };

  const toggleAvail = async (p) => {
    try {
      await api.put(`/products/${p.id}`, { isAvailable: !p.isAvailable });
      fetchAll();
    } catch (e) {
      showToast("Gagal mengubah status stok", "error");
    }
  };

  const filtered = products.filter((p) => {
    const matchCat = filterCat === "all" || p.categoryId === filterCat;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] font-sans text-slate-900">
      <Sidebar currentPath="/products" />

      <main className="ml-[240px] flex-1 pb-12">
        {/* Header Section */}
        <header className="sticky top-0 z-50 flex h-20 items-center justify-between border-b bg-white/80 px-8 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-xl font-black tracking-tight text-slate-800">
                Manajemen Produk
              </h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-1">
                {products.length} Items
              </p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={openCreate}
            className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-slate-200 hover:bg-slate-800 transition-all"
          >
            <Plus size={16} strokeWidth={3} /> Tambah Produk Baru
          </motion.button>
        </header>

        <div className="p-8 max-w-[1600px] mx-auto">
          {/* Filter & Search Bar */}
          <section className="flex flex-col md:flex-row gap-4 mb-10 items-center justify-between">
            <div className="relative w-full md:w-96 group">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-amber-500 transition-colors"
                size={18}
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari menu..."
                className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-100 rounded-[1.25rem] text-sm font-bold outline-none shadow-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
              />
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2 w-full md:w-auto scrollbar-hide">
              <button
                onClick={() => setFilterCat("all")}
                className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${
                  filterCat === "all"
                    ? "bg-amber-500 text-white shadow-lg shadow-amber-200"
                    : "bg-white text-slate-400 hover:bg-slate-50 border border-slate-100"
                }`}
              >
                All Menu
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setFilterCat(c.id)}
                  className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${
                    filterCat === c.id
                      ? "bg-amber-500 text-white shadow-lg shadow-amber-200"
                      : "bg-white text-slate-400 hover:bg-slate-50 border border-slate-100"
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </section>

          {/* Product Grid */}
          <AnimatePresence mode="popLayout">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {filtered.map((p) => (
                <motion.div
                  key={p.id}
                  variants={cardVariants}
                  layout
                  className={`group bg-white rounded-[2.5rem] border border-slate-100 p-6 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 relative overflow-hidden ${!p.isAvailable && "grayscale-[0.8] opacity-70"}`}
                >
                  {/* Category Badge */}
                  <div className="flex justify-between items-start mb-6">
                    <span className="px-3 py-1.5 rounded-full bg-slate-50 text-slate-400 text-[9px] font-black uppercase tracking-tighter border border-slate-100 group-hover:bg-amber-50 group-hover:text-amber-600 group-hover:border-amber-100 transition-colors">
                      {p.category?.name || "No Category"}
                    </span>
                    <button
                      onClick={() => toggleAvail(p)}
                      className={`p-2 rounded-xl transition-all ${p.isAvailable ? "text-emerald-500 bg-emerald-50" : "text-slate-300 bg-slate-100"}`}
                    >
                      {p.isAvailable ? (
                        <CheckCircle2 size={18} />
                      ) : (
                        <XCircle size={18} />
                      )}
                    </button>
                  </div>

                  {/* Info */}
                  <h3 className="text-lg font-black text-slate-800 mb-1 leading-tight">
                    {p.name}
                  </h3>
                  <p className="text-xs text-slate-400 font-medium mb-6 line-clamp-2 h-8">
                    {p.description || "Deskripsi tidak tersedia"}
                  </p>

                  <div className="flex items-end justify-between pt-4 border-t border-slate-50">
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.1em] mb-1">
                        Harga per cup
                      </p>
                      <span className="text-xl font-black text-slate-900 tracking-tighter">
                        {formatRupiah(p.price)}
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => openEdit(p)}
                        className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-blue-50 hover:text-blue-500 transition-all"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-red-50 hover:text-red-500 transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>

          {/* Empty State */}
          {filtered.length === 0 && !loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-slate-100"
            >
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                <PackageSearch size={40} className="text-slate-200" />
              </div>
              <h3 className="text-lg font-black text-slate-800">
                Menu not found
              </h3>
              <p className="text-sm text-slate-400 font-medium">
                Try adjusting your filters or search keywords
              </p>
            </motion.div>
          )}
        </div>
      </main>

      {/* Modern Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[3rem] shadow-2xl overflow-hidden p-10"
            >
              <div className="mb-8">
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                  {editId ? "Edit Produk" : "Tambah Produk"}
                </h2>
                <p className="text-sm text-slate-400 font-medium">
                  Isi detail produk
                </p>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                    Nama Produk
                  </label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-amber-500/20 outline-none"
                    placeholder="e.g. Jus Buah Naga"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                      Harga (IDR)
                    </label>
                    <input
                      type="number"
                      value={form.price}
                      onChange={(e) =>
                        setForm({ ...form, price: e.target.value })
                      }
                      className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-amber-500/20 outline-none"
                      placeholder="15000"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                      Kategori
                    </label>
                    <select
                      value={form.categoryId}
                      onChange={(e) =>
                        setForm({ ...form, categoryId: e.target.value })
                      }
                      className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-amber-500/20 outline-none appearance-none"
                    >
                      <option value="">Select...</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                    Deskripsi
                  </label>
                  <textarea
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                    className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-amber-500/20 outline-none h-24 resize-none"
                    placeholder="Deskripsi produk..."
                  />
                </div>

                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl">
                  <input
                    type="checkbox"
                    id="avail"
                    checked={form.isAvailable}
                    onChange={(e) =>
                      setForm({ ...form, isAvailable: e.target.checked })
                    }
                    className="w-5 h-5 rounded-lg accent-emerald-500"
                  />
                  <label
                    htmlFor="avail"
                    className="text-sm font-bold text-slate-600 cursor-pointer"
                  >
                    In Stock & Ready to Order
                  </label>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    onClick={handleSubmit}
                    className="flex-1 bg-slate-900 text-white py-4 rounded-2xl text-sm font-black uppercase tracking-widest shadow-xl shadow-slate-200 hover:bg-slate-800 transition-all"
                  >
                    {editId ? "Simpan Perubahan" : "Buat Produk"}
                  </button>
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-8 bg-slate-100 text-slate-500 py-4 rounded-2xl text-sm font-bold hover:bg-slate-200 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[200] px-6 py-3 rounded-2xl shadow-2xl border flex items-center gap-3 ${
              toast.type === "error"
                ? "bg-red-50 border-red-100 text-red-600"
                : "bg-white border-slate-100 text-slate-800"
            }`}
          >
            <div
              className={`w-2 h-2 rounded-full ${toast.type === "error" ? "bg-red-500" : "bg-emerald-500"}`}
            />
            <span className="text-xs font-black uppercase tracking-wider">
              {toast.msg}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
