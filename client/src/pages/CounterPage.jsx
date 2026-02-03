import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  CreditCard,
  Wallet,
  X,
  Check,
  Clock,
  LogOut,
  FileText,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCartStore } from "../store/cartStore";
import useAuthStore from "../store/authStore";
import { formatRupiah } from "../lib/format";
import api from "../lib/api";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.03, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { y: 10, opacity: 0 },
  visible: { y: 0, opacity: 1 },
};

const ProductCard = ({ product, onAdd }) => {
  const handleClick = useCallback(() => {
    onAdd(product);
  }, [product, onAdd]);

  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ y: -8, scale: 1.02 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleClick}
      className="group relative cursor-pointer"
    >
      <div className="h-full bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 hover:border-amber-200 hover:shadow-xl hover:shadow-amber-500/10 transition-all duration-300 overflow-hidden">
        {/* Dekorasi Gradient Top */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-400 via-orange-400 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />

        <div className="flex flex-col h-full justify-between">
          <div className="mb-4">
            <div className="flex justify-between items-start mb-3">
              <span className="text-[10px] font-black text-amber-600 bg-amber-50 px-3 py-1 rounded-full uppercase tracking-widest">
                {product.category?.name || "Menu"}
              </span>
            </div>

            <h3 className="text-xl font-black text-slate-800 mb-2 leading-tight group-hover:text-amber-600 transition-colors">
              {product.name}
            </h3>

            {product.description && (
              <p className="text-sm text-slate-400 font-medium line-clamp-2 leading-relaxed">
                {product.description}
              </p>
            )}
          </div>

          <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                Harga
              </span>
              <div className="text-xl font-black text-slate-900 tracking-tight font-mono">
                {formatRupiah(product.price)}
              </div>
            </div>

            <div className="w-10 h-10 bg-slate-900 text-white rounded-2xl flex items-center justify-center group-hover:bg-amber-500 group-hover:rotate-90 transition-all duration-300">
              <Plus size={20} />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const CartItem = ({ item, index, onUpdate, onRemove, onAddNote }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-4 mb-3 group hover:bg-slate-50 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="text-sm font-black text-slate-800 truncate">
              {item.product.name}
            </h4>
            <span className="text-xs font-bold bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full">
              ×{item.quantity}
            </span>
          </div>

          <div className="text-xs text-slate-500 font-medium mb-2">
            {formatRupiah(item.product.price)} × {item.quantity} ={" "}
            <span className="font-black text-amber-500">
              {formatRupiah(item.product.price * item.quantity)}
            </span>
          </div>

          {item.notes && (
            <div className="text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg inline-block max-w-full truncate">
              {item.notes}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 ml-3">
          <button
            onClick={() => onUpdate(index, item.quantity - 1)}
            className="w-7 h-7 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-colors"
          >
            <Minus size={14} />
          </button>
          <span className="text-sm font-black text-slate-800 w-6 text-center">
            {item.quantity}
          </span>
          <button
            onClick={() => onUpdate(index, item.quantity + 1)}
            className="w-7 h-7 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-emerald-50 hover:text-emerald-500 transition-colors"
          >
            <Plus size={14} />
          </button>
        </div>
      </div>

      <button
        onClick={() => onAddNote(index)}
        className="text-xs text-slate-400 hover:text-slate-600 font-medium mt-2 flex items-center gap-1"
      >
        <FileText size={10} />
        {item.notes ? "Edit catatan" : "+ Tambah catatan"}
      </button>
    </div>
  );
};

export default function CounterPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [amountPaid, setAmountPaid] = useState(0);
  const [orderSuccess, setOrderSuccess] = useState(null);
  const [noteIndex, setNoteIndex] = useState(null);
  const [noteText, setNoteText] = useState("");
  const [currentTime, setCurrentTime] = useState("");
  const [amountDisplay, setAmountDisplay] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const { items, addItem, updateQuantity, removeItem, clearCart, getTotal } =
    useCartStore();
  const { user, logout } = useAuthStore();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
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
  }, []);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const filteredProducts = useMemo(() => {
    let filtered =
      selectedCategory === "all"
        ? products
        : products.filter((p) => p.categoryId === selectedCategory);

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.description?.toLowerCase().includes(query) ||
          p.category?.name.toLowerCase().includes(query),
      );
    }

    return filtered;
  }, [products, selectedCategory, searchQuery]);

  const total = getTotal();
  const change = amountPaid - total;

  const formatCurrencyInput = useCallback((value) => {
    const numeric = value.replace(/\D/g, "");
    const num = parseInt(numeric || "0");
    setAmountPaid(num);
    setAmountDisplay(num === 0 ? "" : num.toLocaleString("id-ID"));
  }, []);

  const handleQuickAmount = useCallback((amount) => {
    setAmountPaid(amount);
    setAmountDisplay(amount.toLocaleString("id-ID"));
  }, []);

  const handleCheckout = useCallback(async () => {
    if (!items.length || amountPaid < total) return;

    setProcessing(true);
    try {
      const res = await api.post("/orders", {
        items: items.map((i) => ({
          productId: i.product.id,
          quantity: i.quantity,
          notes: i.notes,
        })),
        paymentMethod,
        amountPaid: amountPaid,
      });

      try {
        await api.post(`/orders/${res.data.data.id}/print`);
      } catch (e) {
        console.warn("Print error:", e);
      }

      setOrderSuccess({
        orderNumber: res.data.data.orderNumber,
        change,
        total,
      });

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
  }, [items, amountPaid, total, paymentMethod, change, clearCart]);

  const saveNote = useCallback(() => {
    if (noteIndex !== null) {
      const newItems = [...items];
      newItems[noteIndex].notes = noteText;
      useCartStore.setState({ items: newItems });
      setNoteIndex(null);
      setNoteText("");
    }
  }, [noteIndex, noteText, items]);

  const handleAddItem = useCallback(
    (product) => {
      addItem(product, 1);
    },
    [addItem],
  );

  const categoryButtons = useMemo(
    () => [{ id: "all", name: "Semua Menu" }, ...categories],
    [categories],
  );

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] font-sans text-slate-900">
      <main className="flex-1 flex flex-col">
        <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b bg-white/90 px-8 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-xl font-black tracking-tight text-slate-800">
                Counter - Super Juice
              </h1>
              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                Live POS System
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl">
              <Clock size={14} className="text-slate-400" />
              <span className="text-sm font-medium text-slate-700">
                {currentTime}
              </span>
              <span className="text-xs text-slate-400">WIB</span>
            </div>

            <button
              onClick={() => logout()}
              className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl text-xs font-bold hover:bg-red-100 transition-colors"
            >
              <LogOut size={14} />
              Logout
            </button>
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden">
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-6">
                <div className="relative w-full md:w-80 group">
                  <Search
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-amber-500"
                    size={18}
                  />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari produk atau kategori..."
                    className="w-full pl-12 pr-4 py-3 bg-white border border-slate-100 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                  />
                </div>

                <div className="text-xs font-bold text-slate-400">
                  {filteredProducts.length} produk tersedia
                </div>
              </div>

              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {categoryButtons.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all flex-shrink-0 ${
                      selectedCategory === cat.id
                        ? "bg-amber-500 text-white shadow-lg shadow-amber-200"
                        : "bg-white text-slate-400 hover:bg-slate-50 border border-slate-100"
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 p-6 overflow-y-auto">
              {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {[...Array(10)].map((_, i) => (
                    <div
                      key={i}
                      className="bg-white rounded-2xl p-5 border border-slate-100 animate-pulse"
                    >
                      <div className="h-4 bg-slate-200 rounded mb-3"></div>
                      <div className="h-3 bg-slate-100 rounded mb-4"></div>
                      <div className="h-6 bg-slate-200 rounded"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6" // Diubah gap & jumlah kolom
                >
                  {filteredProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onAdd={handleAddItem}
                    />
                  ))}
                </motion.div>
              )}
            </div>
          </div>

          <div className="w-[400px] border-l border-slate-100 bg-white flex flex-col shadow-xl">
            <div className="p-6 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ShoppingCart className="text-amber-500" size={20} />
                  <h2 className="text-lg font-black text-slate-800">
                    Pesanan Aktif
                  </h2>
                  {items.length > 0 && (
                    <span className="bg-amber-500 text-white text-xs font-black px-2 py-0.5 rounded-full">
                      {items.reduce((sum, item) => sum + item.quantity, 0)}
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
                    className="flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-600 rounded-xl text-xs font-bold hover:bg-red-100 transition-colors"
                  >
                    <Trash2 size={12} />
                    Hapus Semua
                  </button>
                )}
              </div>
            </div>

            <div className="flex-1 p-6 overflow-y-auto">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                  <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
                    <ShoppingCart className="text-slate-300" size={28} />
                  </div>
                  <h3 className="text-sm font-black text-slate-800 mb-1">
                    Keranjang Kosong
                  </h3>
                  <p className="text-xs text-slate-400 font-medium">
                    Pilih produk untuk mulai
                  </p>
                </div>
              ) : (
                items.map((item, index) => (
                  <CartItem
                    key={`${item.product.id}-${index}`}
                    item={item}
                    index={index}
                    onUpdate={updateQuantity}
                    onRemove={removeItem}
                    onAddNote={(idx) => {
                      setNoteIndex(idx);
                      setNoteText(items[idx].notes || "");
                    }}
                  />
                ))
              )}
            </div>

            {items.length > 0 && (
              <div className="p-6 border-t border-slate-100 bg-slate-50/50">
                <div className="bg-gradient-to-r from-amber-50 to-emerald-50 rounded-2xl p-4 mb-6 border border-amber-100">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-black text-slate-800">
                      TOTAL
                    </span>
                    <span className="text-2xl font-black text-amber-600 font-mono">
                      {formatRupiah(total)}
                    </span>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">
                    METODE PEMBAYARAN
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      {
                        id: "CASH",
                        label: "Tunai",
                        icon: <Wallet size={16} />,
                      },
                      {
                        id: "QRIS",
                        label: "QRIS",
                        icon: <CreditCard size={16} />,
                      },
                    ].map((method) => (
                      <button
                        key={method.id}
                        onClick={() => setPaymentMethod(method.id)}
                        className={`flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${
                          paymentMethod === method.id
                            ? "bg-slate-900 text-white shadow-lg"
                            : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        {method.icon}
                        {method.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-6">
                  <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">
                    JUMLAH BAYAR
                  </div>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-amber-500">
                      Rp
                    </span>
                    <input
                      type="text"
                      value={amountDisplay}
                      onChange={(e) => formatCurrencyInput(e.target.value)}
                      placeholder="0"
                      className="w-full pl-12 pr-4 py-4 bg-white border-2 border-slate-200 rounded-2xl text-xl font-black font-mono outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all text-right"
                    />
                  </div>

                  <div className="grid grid-cols-4 gap-2 mt-3">
                    {[15000, 20000, 50000, 100000].map((amount) => (
                      <button
                        key={amount}
                        onClick={() => handleQuickAmount(amount)}
                        className="py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-amber-50 hover:border-amber-300 hover:text-amber-600 transition-all"
                      >
                        {formatRupiah(amount).replace("Rp", "")}
                      </button>
                    ))}
                  </div>
                </div>

                {amountPaid > 0 && (
                  <div
                    className={`rounded-2xl p-4 mb-6 ${change === 0 ? "bg-emerald-50 border border-emerald-100" : "bg-amber-50 border border-amber-100"}`}
                  >
                    <div className="flex justify-between items-center">
                      <span
                        className={`text-sm font-bold ${change === 0 ? "text-emerald-600" : "text-amber-600"}`}
                      >
                        {change === 0 ? "✓ Pas" : "KEMBALIAN"}
                      </span>
                      <span
                        className={`text-lg font-black font-mono ${change === 0 ? "text-emerald-600" : "text-amber-600"}`}
                      >
                        {formatRupiah(Math.max(0, change))}
                      </span>
                    </div>
                  </div>
                )}

                <button
                  onClick={handleCheckout}
                  disabled={
                    processing || amountPaid < total || amountPaid === 0
                  }
                  className={`w-full py-4 rounded-2xl text-sm font-black uppercase tracking-widest transition-all ${
                    processing || amountPaid < total || amountPaid === 0
                      ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                      : "bg-gradient-to-r from-amber-500 to-emerald-500 text-white shadow-lg shadow-amber-200 hover:shadow-xl hover:shadow-amber-300"
                  }`}
                >
                  {processing ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      MEMPROSES...
                    </span>
                  ) : (
                    "CHECKOUT & CETAK STRUK"
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      <AnimatePresence>
        {noteIndex !== null && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setNoteIndex(null)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden p-8"
            >
              <div className="mb-6">
                <h3 className="text-xl font-black text-slate-800 mb-1">
                  Catatan Pesanan
                </h3>
                <p className="text-sm text-slate-400 font-medium">
                  {items[noteIndex]?.product?.name}
                </p>
              </div>

              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Misal: tanpa gula, es batu extra, kurang manis..."
                className="w-full h-32 px-5 py-4 bg-slate-50 rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-amber-500/20 resize-none mb-6"
                autoFocus
              />

              <div className="flex gap-3">
                <button
                  onClick={saveNote}
                  className="flex-1 bg-slate-900 text-white py-3.5 rounded-2xl text-sm font-bold hover:bg-slate-800 transition-colors"
                >
                  Simpan Catatan
                </button>
                <button
                  onClick={() => setNoteIndex(null)}
                  className="px-6 bg-slate-100 text-slate-500 py-3.5 rounded-2xl text-sm font-bold hover:bg-slate-200 transition-colors"
                >
                  Batal
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {orderSuccess && (
          <motion.div
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 100, opacity: 0 }}
            className="fixed top-6 right-6 z-[200] w-80 bg-white/95 backdrop-blur-md rounded-[2rem] p-6 shadow-2xl border border-emerald-100"
          >
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-green-500 rounded-2xl flex items-center justify-center">
                <Check size={24} className="text-white" />
              </div>
              <div className="flex-1">
                <h4 className="text-base font-black text-slate-800 mb-1">
                  Order Berhasil!
                </h4>
                <p className="text-xs text-slate-400">
                  No:{" "}
                  <strong className="text-slate-800">
                    {orderSuccess.orderNumber}
                  </strong>
                </p>
                <p className="text-xs text-slate-400">
                  Total:{" "}
                  <strong className="text-emerald-600">
                    {formatRupiah(orderSuccess.total)}
                  </strong>
                </p>
                {orderSuccess.change > 0 && (
                  <p className="text-xs text-slate-400">
                    Kembalian:{" "}
                    <strong className="text-amber-600">
                      {formatRupiah(orderSuccess.change)}
                    </strong>
                  </p>
                )}
              </div>
            </div>
            <div className="h-1 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: 4, ease: "linear" }}
                className="h-full bg-emerald-300"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
