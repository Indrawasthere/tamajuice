import { useState, useEffect } from "react";
import { useCartStore } from "../store/cartStore";
import { useAuthStore } from "../store/authStore";
import { formatRupiah } from "../lib/format";
import api from "../lib/api";

export default function CounterPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [amountPaid, setAmountPaid] = useState("");

  const { items, addItem, updateQuantity, removeItem, clearCart, getTotal } =
    useCartStore();
  const { user, logout } = useAuthStore();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        api.get("/products?isAvailable=true"),
        api.get("/categories"),
      ]);
      setProducts(productsRes.data.data);
      setCategories(categoriesRes.data.data);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      alert("Gagal memuat data");
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts =
    selectedCategory === "all"
      ? products
      : products.filter((p) => p.categoryId === selectedCategory);

  const handleCheckout = async () => {
    if (items.length === 0) {
      alert("Keranjang masih kosong!");
      return;
    }

    const total = getTotal();
    const paid = parseInt(amountPaid) || 0;

    if (paid < total) {
      alert("Jumlah bayar kurang!");
      return;
    }

    setProcessing(true);
    try {
      const orderData = {
        items: items.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
          notes: item.notes,
        })),
        paymentMethod,
        amountPaid: paid,
        notes: "",
      };

      const response = await api.post("/orders", orderData);

      // Print receipt
      try {
        await api.post(`/orders/${response.data.data.id}/print`);
      } catch (printError) {
        console.error("Print failed:", printError);
      }

      alert(`Order berhasil! Kembalian: ${formatRupiah(paid - total)}`);
      clearCart();
      setAmountPaid("");
    } catch (error) {
      console.error("Checkout failed:", error);
      alert(
        "Gagal membuat order: " +
          (error.response?.data?.message || "Unknown error"),
      );
    } finally {
      setProcessing(false);
    }
  };

  const quickAmounts = [20000, 50000, 100000];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-yellow via-primary-green to-primary-yellow">
        <div className="text-2xl font-heading text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-green-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-yellow to-primary-green text-white p-4 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-heading font-bold">Jus Buah Tama</h1>
            <p className="text-sm opacity-90">Fresh juice everyday</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm">Kasir: {user?.name}</span>
            <button
              onClick={logout}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm transition"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Products Section */}
          <div className="lg:col-span-2">
            {/* Category Filter */}
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
              <button
                onClick={() => setSelectedCategory("all")}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition ${
                  selectedCategory === "all"
                    ? "bg-primary-yellow text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
              >
                Semua
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition ${
                    selectedCategory === cat.id
                      ? "bg-primary-yellow text-white"
                      : "bg-white text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {cat.icon} {cat.name}
                </button>
              ))}
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {filteredProducts.map((product) => (
                <button
                  key={product.id}
                  onClick={() => addItem(product, 1)}
                  className="bg-white rounded-xl p-4 shadow-md hover:shadow-xl transition transform hover:scale-105 text-left"
                >
                  <div className="text-2xl mb-2">{product.category.icon}</div>
                  <h3 className="font-semibold text-gray-800 mb-1">
                    {product.name}
                  </h3>
                  <p className="text-primary-yellow font-bold font-mono">
                    {formatRupiah(product.price)}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Cart Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-4 sticky top-4">
              <h2 className="text-xl font-heading font-bold mb-4">Pesanan</h2>

              {items.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <p>Belum ada pesanan</p>
                </div>
              ) : (
                <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                  {items.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-2 border-b pb-2"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-sm">
                          {item.product.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatRupiah(item.product.price)}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() =>
                            updateQuantity(index, item.quantity - 1)
                          }
                          className="w-6 h-6 rounded bg-gray-200 hover:bg-gray-300 text-sm"
                        >
                          -
                        </button>
                        <span className="w-8 text-center font-mono">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(index, item.quantity + 1)
                          }
                          className="w-6 h-6 rounded bg-gray-200 hover:bg-gray-300 text-sm"
                        >
                          +
                        </button>
                        <button
                          onClick={() => removeItem(index)}
                          className="ml-1 text-red-500 hover:text-red-700 text-xs"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {items.length > 0 && (
                <>
                  <div className="border-t pt-4 mb-4">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-lg font-bold">TOTAL</span>
                      <span className="text-2xl font-bold font-mono text-primary-yellow">
                        {formatRupiah(getTotal())}
                      </span>
                    </div>

                    {/* Payment Method */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-2">
                        Metode Pembayaran
                      </label>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setPaymentMethod("CASH")}
                          className={`flex-1 py-2 rounded-lg font-medium transition ${
                            paymentMethod === "CASH"
                              ? "bg-primary-yellow text-white"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          Cash
                        </button>
                        <button
                          onClick={() => setPaymentMethod("QRIS")}
                          className={`flex-1 py-2 rounded-lg font-medium transition ${
                            paymentMethod === "QRIS"
                              ? "bg-primary-yellow text-white"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          QRIS
                        </button>
                      </div>
                    </div>

                    {/* Amount Paid */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-2">
                        Jumlah Bayar
                      </label>
                      <input
                        type="number"
                        value={amountPaid}
                        onChange={(e) => setAmountPaid(e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg font-mono text-lg"
                        placeholder="0"
                      />
                      <div className="flex gap-2 mt-2">
                        {quickAmounts.map((amount) => (
                          <button
                            key={amount}
                            onClick={() => setAmountPaid(amount.toString())}
                            className="flex-1 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm"
                          >
                            {formatRupiah(amount)}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Change */}
                    {amountPaid && parseInt(amountPaid) >= getTotal() && (
                      <div className="mb-4 p-3 bg-green-50 rounded-lg">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Kembalian</span>
                          <span className="text-lg font-bold text-green-600">
                            {formatRupiah(parseInt(amountPaid) - getTotal())}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Checkout Button */}
                    <button
                      onClick={handleCheckout}
                      disabled={
                        processing ||
                        !amountPaid ||
                        parseInt(amountPaid) < getTotal()
                      }
                      className="w-full bg-gradient-to-r from-primary-yellow to-primary-green text-white py-3 rounded-lg font-bold text-lg hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {processing ? "Memproses..." : "CHECKOUT & CETAK"}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
