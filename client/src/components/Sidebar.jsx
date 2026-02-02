import { useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore";
import {
  LayoutDashboard,
  Package,
  BarChart3,
  LogOut,
  Droplet,
  Users,
  Settings,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  Shield,
  Bell,
} from "lucide-react";

const NAV_ITEMS = [
  {
    icon: LayoutDashboard,
    label: "Dashboard",
    path: "/dashboard",
    activeColor: "#7A9B5E",
  },
  {
    icon: Package,
    label: "Products",
    path: "/products",
    activeColor: "#f97316",
  },
  {
    icon: BarChart3,
    label: "Reports",
    path: "/reports",
    activeColor: "#a78bfa",
  },
];

export default function Sidebar({ currentPath }) {
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
      {/* Logo Section */}
      <div
        style={{
          padding: "28px 20px 24px",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
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
          >
            <img
              src="/sjrb.png"
              alt="Super Juice Logo"
              width={50}
              height={50}
            />
          </div>

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
              Super Juice
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

      {/* Navigation Items */}
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
              <item.icon
                size={18}
                color={isActive ? "#fff" : "rgba(255,255,255,0.5)"}
                style={{ width: 22, flexShrink: 0, transition: "color 0.2s" }}
              />
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

      {/* User Section & Logout */}
      <div
        style={{
          padding: "16px 12px",
          borderTop: "1px solid rgba(255,255,255,0.08)",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          marginTop: "auto",
        }}
      >
        {/* User Info */}
        <div
          style={{
            marginBottom: 12,
            display: "flex",
            alignItems: "center",
            gap: 8,
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

        {/* Logout Button */}
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
