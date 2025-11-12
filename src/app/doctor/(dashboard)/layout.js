'use client';
import { useState, useEffect } from "react";
import Navbar from "@/components/dashboard/Navbar";
import Sidebar from "@/components/dashboard/Sidebar";
import { motion } from "framer-motion";

export default function AdminLayout({ children }) {
  const [theme, setTheme] = useState("light");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 
                      (window.matchMedia('(prefers-color-scheme: dark)').matches ? "dark" : "light");
    setTheme(savedTheme);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 overflow-hidden">
      {/* Sidebar */}
      <Sidebar 
        role="doctor" 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
        theme={theme}
        onThemeToggle={toggleTheme}
      />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar 
          role="doctor" 
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          theme={theme}
          onThemeToggle={toggleTheme}
        />
        
        {/* Scrollable Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}