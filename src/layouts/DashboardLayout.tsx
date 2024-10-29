import React, { useEffect } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { NotificationBell } from '../components/NotificationBell';
import { useThemeStore } from '../store/themeStore';
import { useAuthStore } from '../store/authStore';

export const DashboardLayout = () => {
  const { isDarkMode } = useThemeStore();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <Sidebar />
      <main className="flex-1 flex flex-col">
        <header className="bg-white dark:bg-gray-800 shadow-sm h-16 flex items-center justify-between px-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">لوحة التحكم</h1>
          <NotificationBell />
        </header>
        <div className="flex-1 p-8 overflow-auto">
          <div className="container mx-auto">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};