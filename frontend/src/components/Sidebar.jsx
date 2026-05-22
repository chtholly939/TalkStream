import { createElement, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Home, MessageSquare, Users, Phone, Settings, LogOut,
  ChevronLeft, ChevronRight, UsersRound,
} from "lucide-react";
import useAuthUser from "../hooks/useAuthUser";
import useLogout from "../hooks/useLogout";
import ThemeSelector from "./ThemeSelector";

const NAV_ITEMS = [
  { icon: Home,          label: "Home",    path: "/home"    },
  { icon: MessageSquare, label: "Chats",   path: "/chats"   },
  { icon: UsersRound,    label: "Groups",  path: "/groups"  },
  { icon: Users,         label: "Friends", path: "/friends" },
  { icon: Phone,         label: "Calls",   path: "/calls"   },
];

export default function Sidebar({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { authUser } = useAuthUser();
  const { logoutMutation } = useLogout();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (path) =>
    path === "/home"
      ? location.pathname === "/home"
      : location.pathname.startsWith(path);

  const handleLogout = () => {
    setMobileOpen(false);
    logoutMutation(undefined, {
      onSuccess: () => navigate("/", { replace: true }),
    });
  };

  const SidebarContent = () => (
    <div
      className="flex h-full flex-col"
      style={{ background: "oklch(var(--b2))", borderRight: "1px solid var(--border)" }}
    >
      {/* Logo */}
      <Link
        to="/home"
        onClick={() => setMobileOpen(false)}
        className={`flex items-center gap-3 px-4 py-5 transition-opacity hover:opacity-80 ${
          collapsed ? "justify-center" : ""
        }`}
        title={collapsed ? "TalkStream" : ""}
      >
        <img
          src="/TSlogo.png"
          alt="TalkStream logo"
          className="h-9 w-9 flex-shrink-0 rounded-xl object-contain"
        />
        {!collapsed && (
          <span className="font-display font-bold text-lg" style={{ color: "var(--text-primary)" }}>
            TalkStream
          </span>
        )}
      </Link>

      <div className="divider mb-3" />

      {/* Nav */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {NAV_ITEMS.map(({ icon, label, path }) => (
          <Link
            key={path}
            to={path}
            onClick={() => setMobileOpen(false)}
            className={`sidebar-item ${isActive(path) ? "active" : ""} ${
              collapsed ? "justify-center" : ""
            }`}
            title={collapsed ? label : ""}
          >
            {createElement(icon, { size: 18 })}
            {!collapsed && <span className="text-sm font-medium">{label}</span>}
          </Link>
        ))}
      </nav>

      {/* Bottom section */}
      <div className="px-3 pb-4 space-y-2">
        <div className="divider mb-3" />

        {/* Profile */}
        <Link
          to="/profile"
          onClick={() => setMobileOpen(false)}
          className={`sidebar-item ${isActive("/profile") ? "active" : ""} ${
            collapsed ? "justify-center" : ""
          }`}
          title={collapsed ? "Profile" : ""}
        >
          <div className="relative flex-shrink-0">
            <div
              className="h-7 w-7 rounded-full overflow-hidden"
              style={{ background: "oklch(var(--b3))" }}
            >
              {authUser?.profilePic ? (
                <img src={authUser.profilePic} alt="" className="h-full w-full object-cover" />
              ) : (
                <span
                  className="flex h-full w-full items-center justify-center text-xs font-bold"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {authUser?.fullName?.[0]?.toUpperCase()}
                </span>
              )}
            </div>
            <span className="online-dot" style={{ height: "8px", width: "8px" }} />
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="truncate text-xs font-semibold" style={{ color: "var(--text-primary)" }}>
                {authUser?.fullName}
              </p>
              <p className="truncate text-xs" style={{ color: "var(--text-muted)" }}>Online</p>
            </div>
          )}
        </Link>

        {/* Theme */}
        <ThemeSelector collapsed={collapsed} />

        {/* Logout */}
        <button
          onClick={handleLogout}
          className={`sidebar-item w-full text-left ${collapsed ? "justify-center" : ""}`}
          title={collapsed ? "Logout" : ""}
          style={{ color: "oklch(var(--er))" }}
        >
          <LogOut size={16} />
          {!collapsed && <span className="text-sm">Logout</span>}
        </button>
      </div>

      {/* Collapse toggle — desktop only */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="hidden lg:flex items-center justify-center py-3 transition-opacity hover:opacity-60"
        style={{ borderTop: "1px solid var(--border)", color: "var(--text-muted)" }}
      >
        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden mesh-bg">
      {/* Desktop sidebar */}
      <div
        className={`hidden lg:block flex-shrink-0 transition-all duration-300 ${
          collapsed ? "w-16" : "w-60"
        }`}
      >
        <SidebarContent />
      </div>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full w-60 z-10">
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile top bar */}
        <div
          className="flex items-center gap-3 px-4 py-3 lg:hidden"
          style={{ background: "oklch(var(--b2))", borderBottom: "1px solid var(--border)" }}
        >
          <button onClick={() => setMobileOpen(true)} className="btn-icon h-9 w-9">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
              <rect y="2" width="18" height="2" rx="1" />
              <rect y="8" width="18" height="2" rx="1" />
              <rect y="14" width="18" height="2" rx="1" />
            </svg>
          </button>
          <Link
            to="/home"
            className="flex items-center gap-2 transition-opacity hover:opacity-80"
          >
            <img
              src="/TSlogo.png"
              alt="TalkStream logo"
              className="h-7 w-7 flex-shrink-0 rounded-lg object-contain"
            />
            <span
              className="font-display font-bold text-sm"
              style={{ color: "var(--text-primary)" }}
            >
              TalkStream
            </span>
          </Link>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-auto">{children}</main>

        {/* Mobile bottom nav */}
        <div
          className="flex lg:hidden"
          style={{ background: "oklch(var(--b2))", borderTop: "1px solid var(--border)" }}
        >
          {NAV_ITEMS.map(({ icon, label, path }) => (
            <Link
              key={path}
              to={path}
              className="flex flex-1 flex-col items-center gap-1 py-2.5 text-xs transition-colors"
              style={{ color: isActive(path) ? "oklch(var(--p))" : "var(--text-muted)" }}
            >
              {createElement(icon, { size: 19 })}
              <span>{label}</span>
            </Link>
          ))}
          <Link
            to="/profile"
            className="flex flex-1 flex-col items-center gap-1 py-2.5 text-xs transition-colors"
            style={{ color: isActive("/profile") ? "oklch(var(--p))" : "var(--text-muted)" }}
          >
            <Settings size={19} />
            <span>Profile</span>
          </Link>
        </div>
      </div>
    </div>
  );
}