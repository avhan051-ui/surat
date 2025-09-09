'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAppContext } from '@/app/context/AppContext';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, setCurrentUser } = useAppContext();

  // Close sidebar when route changes (for mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    if (confirm('Apakah Anda yakin ingin keluar?')) {
      // Clear current user
      setCurrentUser(null);
      // In a real app, you would clear the session/cookies
      router.push('/login');
    }
  };

  const menuItems = [
    {
      id: 'dashboard',
      href: '/dashboard',
      label: 'Dashboard',
      icon: 'fa-tachometer-alt',
      color: 'blue',
    },
    {
      id: 'input',
      href: '/dashboard/input',
      label: 'Input Surat Baru',
      icon: 'fa-plus-circle',
      color: 'green',
    },
    {
      id: 'data',
      href: '/dashboard/data',
      label: 'Data Surat Keluar',
      icon: 'fa-table',
      color: 'purple',
    },
    {
      id: 'laporan',
      href: '/dashboard/laporan',
      label: 'Laporan',
      icon: 'fa-chart-bar',
      color: 'orange',
    },
    {
      id: 'user',
      href: '/dashboard/user',
      label: 'Kelola User',
      icon: 'fa-users',
      color: 'teal',
    },
    {
      id: 'pengaturan',
      href: '/dashboard/pengaturan',
      label: 'Pengaturan',
      icon: 'fa-cog',
      color: 'gray',
    },
  ];

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname?.startsWith(path);
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div 
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white/95 backdrop-blur-sm shadow-2xl border-r border-slate-200/50 transform transition-all duration-300 ease-in-out md:translate-x-0 md:inset-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-center h-24 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-transparent"></div>
          <div className="flex items-center space-x-4 relative z-10">
            <div className="w-12 h-12 bg-white/90 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg">
              <i className="fas fa-envelope-open-text text-blue-600 text-xl"></i>
            </div>
            <div className="text-white">
              <h1 className="text-xl font-bold tracking-tight">SuratKu</h1>
              <p className="text-sm text-blue-100 font-medium">Admin Dashboard</p>
            </div>
          </div>
        </div>

        <nav className="mt-8 px-4">
          <div className="space-y-2">
            {menuItems.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`flex items-center px-4 py-3.5 rounded-xl transition-all duration-200 border ${
                    active
                      ? `bg-gradient-to-r from-${item.color}-50 to-${item.color}-50 text-${item.color}-700 border-${item.color}-100`
                      : 'text-slate-700 border-transparent hover:bg-gradient-to-r hover:from-slate-50 hover:to-slate-50'
                  }`}
                >
                  <div 
                    className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 transition-colors ${
                      active 
                        ? `bg-${item.color}-200 text-${item.color}-600` 
                        : `bg-${item.color}-100 text-${item.color}-600`
                    }`}
                  >
                    <i className={`fas ${item.icon}`}></i>
                  </div>
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="absolute bottom-0 w-full p-4">
          <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl p-5 border border-slate-200/50 shadow-lg backdrop-blur-sm">
            <div className="flex items-center space-x-4 mb-4">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                  <i className="fas fa-user text-white text-lg"></i>
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">{currentUser?.nama || 'User'}</p>
                <p className="text-xs text-slate-500 font-medium">{currentUser?.role || 'Pengguna'}</p>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white text-sm py-2.5 px-4 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg font-medium"
            >
              <i className="fas fa-sign-out-alt mr-2"></i>Keluar
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="md:ml-72 flex flex-col flex-1">
        {/* Mobile menu button */}
        <div className="md:hidden fixed top-6 left-6 z-50">
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="bg-white/90 backdrop-blur-sm p-3 rounded-xl shadow-lg border border-slate-200/50 hover:bg-white transition-all duration-200"
          >
            <i className="fas fa-bars text-slate-700"></i>
          </button>
        </div>

        {/* Top Header */}
        <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-slate-200/50 relative z-40">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4 lg:py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-slate-800 tracking-tight">
                  {menuItems.find(item => isActive(item.href))?.label || 'Dashboard'}
                </h1>
                <p className="text-sm lg:text-base text-slate-600 mt-2 font-medium">
                  {pathname === '/dashboard' 
                    ? 'Selamat datang di sistem pengelolaan surat keluar' 
                    : 'Kelola surat keluar dengan mudah dan efisien'}
                </p>
              </div>
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <button className="bg-slate-100 hover:bg-slate-200 p-3 rounded-xl transition-all duration-200 shadow-sm">
                    <i className="fas fa-bell text-slate-600"></i>
                  </button>
                  <span className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-semibold shadow-lg">
                    3
                  </span>
                </div>
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-semibold text-slate-800">{currentUser?.nama || 'User'}</p>
                  <p className="text-xs text-slate-500 font-medium">{currentUser?.role || 'Pengguna'}</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}