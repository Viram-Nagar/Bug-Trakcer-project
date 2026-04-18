import { useState, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bug,
  LayoutDashboard,
  FolderKanban,
  LogOut,
  Menu,
  X,
  Kanban,
} from "lucide-react";
import { logout, selectUser } from "../../features/auth/authSlice";
import toast from "react-hot-toast";

const NAV_ITEMS = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/projects", icon: FolderKanban, label: "Projects" },
];

function NavContent({ collapsed, user, onLogout }) {
  return (
    <div className="flex flex-col h-full">
      <div
        className={`flex items-center gap-3 p-5 border-b
                       border-gray-100 flex-shrink-0
                       ${collapsed ? "justify-center px-3" : ""}`}
      >
        <div
          className="w-9 h-9 bg-blue-600 rounded-xl flex items-center
                        justify-center shadow-md flex-shrink-0"
        >
          <Bug className="w-4 h-4 text-white" />
        </div>
        {!collapsed && (
          <div>
            <h1 className="font-bold text-gray-900 text-base leading-none">
              BugTracker
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">Issue Manager</p>
          </div>
        )}
      </div>

      <nav className={`flex-1 p-3 space-y-1 ${collapsed ? "px-2" : ""}`}>
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            title={collapsed ? label : undefined}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl text-sm font-medium
               transition-all duration-150
               ${collapsed ? "justify-center p-3" : "px-4 py-2.5"}
               ${
                 isActive
                   ? "bg-blue-600 text-white shadow-sm"
                   : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
               }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  className={`w-4 h-4 flex-shrink-0
                                 ${isActive ? "text-white" : ""}`}
                />
                {!collapsed && <span>{label}</span>}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div
        className={`border-t border-gray-100 p-3
                       ${collapsed ? "px-2" : ""}`}
      >
        {!collapsed && (
          <div
            className="flex items-center gap-3 px-3 py-2 mb-1
                          rounded-xl bg-gray-50"
          >
            <div
              className="w-8 h-8 rounded-full bg-gradient-to-br
                            from-blue-400 to-indigo-500 flex items-center
                            justify-center text-white text-sm font-bold
                            flex-shrink-0"
            >
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {user?.name}
              </p>
              <p className="text-xs text-gray-400 truncate">{user?.email}</p>
            </div>
          </div>
        )}

        <button
          onClick={onLogout}
          title={collapsed ? "Logout" : undefined}
          className={`flex items-center gap-3 w-full rounded-xl text-sm
                     font-medium text-gray-600 hover:bg-red-50
                     hover:text-red-600 transition-all duration-150
                     ${collapsed ? "justify-center p-3" : "px-4 py-2.5"}`}
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {!collapsed && "Logout"}
        </button>
      </div>
    </div>
  );
}

function Sidebar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const user = useSelector(selectUser);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    toast.success("Logged out");
    navigate("/login");
  };

  return (
    <>
      <button
        onClick={() => setMobileOpen(true)}
        aria-label="Open menu"
        className="lg:hidden fixed top-4 left-4 z-40 w-10 h-10 bg-white
                   rounded-xl shadow-md border border-gray-100 flex
                   items-center justify-center text-gray-600
                   hover:bg-gray-50 transition-colors"
      >
        <Menu className="w-5 h-5" />
      </button>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/40
                         backdrop-blur-sm z-40"
            />

            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 w-72
                         bg-white z-50 shadow-2xl"
            >
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-lg
                           bg-gray-100 flex items-center justify-center
                           text-gray-500 hover:bg-gray-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <NavContent
                collapsed={false}
                user={user}
                onLogout={handleLogout}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <aside
        className="hidden md:flex lg:hidden flex-col w-16 bg-white
                        border-r border-gray-100 min-h-screen shadow-sm
                        flex-shrink-0"
      >
        <NavContent collapsed={true} user={user} onLogout={handleLogout} />
      </aside>

      <aside
        className="hidden lg:flex flex-col w-64 bg-white border-r
                        border-gray-100 min-h-screen shadow-sm
                        flex-shrink-0"
      >
        <NavContent collapsed={false} user={user} onLogout={handleLogout} />
      </aside>
    </>
  );
}

export default Sidebar;
