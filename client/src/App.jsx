import { Routes, Route, Navigate } from "react-router-dom";
import useAuthStore from "./store/authStore";
import AdminRoute from "./components/AdminRoute";

// Pages
import LoginPage from "./pages/LoginPage";
import CounterPage from "./pages/CounterPage";
import DashboardPage from "./pages/DashboardPage";
import ProductsPage from "./pages/ProductsPage";
import OrdersPage from "./pages/OrdersPage";
import ReportsPage from "./pages/ReportsPage";

function PrivateRoute({ children }) {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (user?.role === "ADMIN" && window.location.pathname === "/")
    return <Navigate to="/dashboard" />;
  return children;
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/"
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
    </Routes>
  );
}

export default App;
