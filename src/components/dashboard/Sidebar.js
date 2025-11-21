"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  Upload,
  X,
  Settings,
  LogOut,
  User,
  ChevronRight,
  Moon,
  Sun,
  BarChart3,
  FileText,
} from "lucide-react";
import { jwtDecode } from "jwt-decode";

export default function Sidebar({
  role = "admin",
  isOpen = false,
  onClose,
  theme,
  onThemeToggle,
}) {
  const isAdmin = role === "admin";
  const pathname = usePathname();
  const [userInfo, setUserInfo] = useState({ name: "", email: "" });
  useEffect(() => {
    const tokenCookie = document.cookie
      .split("; ")
      .find((row) => row.startsWith("token="));

    if (tokenCookie) {
      const token = tokenCookie.split("=")[1];
      try {
        const decoded = jwtDecode(token);
        setUserInfo({
          name: decoded.name || "User",
          email: decoded.email || "no-email@fornix.com",
        });
      } catch (error) {
        console.error("Failed to decode JWT:", error);
      }
    }
  }, []);

  const menuItems = isAdmin
    ? [
        { name: "Dashboard", icon: LayoutDashboard, href: "/admin/dashboard" },
        { name: "Doctors", icon: Users, href: "/admin/doctors" },
        { name: "Courses", icon: BarChart3, href: "/admin/courses" },
        { name: "Subjects", icon: BarChart3, href: "/admin/questions" },
        { name: "Bulk Upload", icon: Upload, href: "/admin/bulk-upload" },
      ]
    : [
        { name: "Dashboard", icon: LayoutDashboard, href: "/doctor/dashboard" },
        { name: "My Subjects", icon: BookOpen, href: "/doctor/questions" },
      ];

  const handleLogout = () => {
    localStorage.clear();
    document.cookie = "token=; Max-Age=0; path=/";
    window.location.href = role === "doctor" ? "/doctor/login" : "/admin/login";
  };

  const sidebarContent = (
    <motion.aside
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      exit={{ x: -300 }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className="w-64 bg-white dark:bg-gray-900 shadow-xl h-full flex flex-col z-50 fixed lg:static overflow-hidden border-r border-gray-200 dark:border-gray-800"
    >
      {/* Header */}
      <div className="p-6 py-3 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <div className="w-4 h-4 bg-white rounded-sm"></div>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                Fornix
              </h2>
              <p className="text-gray-500 dark:text-gray-400 text-xs">
                {isAdmin ? "Admin" : "Doctor"}
              </p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="lg:hidden p-1 rounded-lg bg-gray-100 dark:bg-gray-800 transition-all duration-200"
          >
            <X className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </motion.button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <div className="space-y-1">
          {menuItems.map((item, index) => {
            const isActive = pathname === item.href;
            return (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  href={item.href}
                  onClick={() => window.innerWidth < 1024 && onClose()}
                  className={`group flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 font-medium text-sm ${
                    isActive
                      ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  <item.icon
                    size={18}
                    className={
                      isActive
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300"
                    }
                  />
                  <span className="flex-1">{item.name}</span>
                  {isActive && (
                    <div className="w-1 h-1 bg-blue-600 dark:bg-blue-400 rounded-full"></div>
                  )}
                </Link>
              </motion.div>
            );
          })}
        </div>
      </nav>

      {/* Footer Section */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-800 space-y-3">
        {/* Theme Toggle */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onThemeToggle}
          className="w-full flex items-center gap-3 px-3 py-2.5 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all duration-200 group"
        >
          {theme === "dark" ? (
            <Sun size={16} className="text-gray-600 dark:text-gray-400" />
          ) : (
            <Moon size={16} className="text-gray-600 dark:text-gray-400" />
          )}
          <span className="text-sm text-gray-700 dark:text-gray-300 font-medium flex-1 text-left">
            {theme === "dark" ? "Light Mode" : "Dark Mode"}
          </span>
        </motion.button>

        {/* User Info */}
        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {userInfo.name || "Loading..."}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[120px]">
              {userInfo.email || "••••••••"}
            </p>
          </div>
        </div>

        {/* Logout Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all duration-200 group border border-red-200 dark:border-red-800"
        >
          <LogOut size={16} className="" />
          <span className="text-sm font-medium flex-1 text-left">Logout</span>
        </motion.button>
      </div>
    </motion.aside>
  );

  return (
    <>
      <div className="hidden lg:block">{sidebarContent}</div>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            />
            {sidebarContent}
          </>
        )}
      </AnimatePresence>
    </>
  );
}
