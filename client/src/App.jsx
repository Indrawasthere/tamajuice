import { Routes, Route, Navigate } from "react-router-dom";
import useAuthStore from "./store/authStore";
import AdminRoute from "./components/AdminRoute";
import PrivateRoute from "./components/PrivateRoute";
import { useEffect } from "react";

// Pages
import LoginPage from "./pages/LoginPage";
import CounterPage from "./pages/CounterPage";
import DashboardPage from "./pages/DashboardPage";
import ProductsPage from "./pages/ProductsPage";
import OrdersPage from "./pages/OrdersPage";
import ReportsPage from "./pages/ReportsPage";

function App() {
  const checkAuth = useAuthStore((state) => state.checkAuth);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/counter"
        element={
          <PrivateRoute>
            <CounterPage />
          </PrivateRoute>
        }
      />

      <Route
        path="/dashboard"
        element={
          <AdminRoute>
            <DashboardPage />
          </AdminRoute>
        }
      />

      <Route
        path="/products"
        element={
          <AdminRoute>
            <ProductsPage />
          </AdminRoute>
        }
      />

      <Route
        path="/orders"
        element={
          <AdminRoute>
            <OrdersPage />
          </AdminRoute>
        }
      />

      <Route
        path="/reports"
        element={
          <AdminRoute>
            <ReportsPage />
          </AdminRoute>
        }
      />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Navigate to="/counter" replace />
          </PrivateRoute>
        }
      />
    </Routes>
  );
}

export default App;
