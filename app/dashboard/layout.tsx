'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAppContext } from '@/app/context/AppContext';
import { showConfirmationDialog } from '@/lib/sweetalert-utils';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isClient, setIsClient] = useState(false);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, setCurrentUser, surat } = useAppContext();

  // Set isClient to true on mount (client-side only)
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Close sidebar when route changes (for mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  // Close notifications when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Initialize notifications from database or create sample notifications (client-side only)
  useEffect(() => {
    if (!isClient) return;

    const fetchNotificationsFromDB = async () => {
      try {
        // In a real implementation, you would fetch notifications from the database
        // For now, we'll use sample notifications
        const sampleNotifications = [
          {
            id: 1,
            title: 'Surat Baru Dibuat',
            message: 'Surat dengan nomor 500.6.1.1/005/2025 telah berhasil dibuat',
            time: '5 menit yang lalu',
            read: false,
            type: 'success'
          },
          {
            id: 2,
            title: 'Laporan Bulanan',
            message: 'Laporan bulanan Januari 2025 siap untuk diunduh',
            time: '1 jam yang lalu',
            read: false,
            type: 'info'
          },
          {
            id: 3,
            title: 'Pengingat',
            message: 'Ada 3 surat yang perlu ditindaklanjuti',
            time: '2 jam yang lalu',
            read: true,
            type: 'warning'
          }
        ];
        
        setNotifications(sampleNotifications);
      } catch (error) {
        console.error('Error fetching notifications:', error);
        // Fallback to sample notifications
        const sampleNotifications = [
          {
            id: 1,
            title: 'Surat Baru Dibuat',
            message: 'Surat dengan nomor 500.6.1.1/005/2025 telah berhasil dibuat',
            time: '5 menit yang lalu',
            read: false,
            type: 'success'
          },
          {
            id: 2,
            title: 'Laporan Bulanan',
            message: 'Laporan bulanan Januari 2025 siap untuk diunduh',
            time: '1 jam yang lalu',
            read: false,
            type: 'info'
          },
          {
            id: 3,
            title: 'Pengingat',
            message: 'Ada 3 surat yang perlu ditindaklanjuti',
            time: '2 jam yang lalu',
            read: true,
            type: 'warning'
          }
        ];
        
        setNotifications(sampleNotifications);
      }
    };

    fetchNotificationsFromDB();
  }, [isClient]);

  // In a real implementation, you would save notifications to database
  // For now, we'll just use state without persisting to localStorage

  const handleLogout = () => {
    showConfirmationDialog({
      title: 'Konfirmasi Logout',
      text: 'Apakah Anda yakin ingin keluar dari aplikasi?',
      confirmButtonText: 'Ya, Keluar',
      cancelButtonText: 'Batal',
      icon: 'warning'
    }).then((result) => {
      if (result.isConfirmed) {
        // Clear current user
        setCurrentUser(null);
        // In a real app, you would clear the session/cookies
        router.push('/login');
      }
    });
  };

  const markAsRead = async (id: number) => {
    try {
      // In a real implementation, you would update the notification in the database
      const updatedNotifications = notifications.map(notification => 
        notification.id === id ? { ...notification, read: true } : notification
      );
      setNotifications(updatedNotifications);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      // In a real implementation, you would update all notifications in the database
      const updatedNotifications = notifications.map(notification => ({ ...notification, read: true }));
      setNotifications(updatedNotifications);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  // Define menu items with role permissions (this would ideally come from context or API)
  const menuItems = [
    {
      id: 'dashboard',
      href: '/dashboard',
      label: 'Dashboard',
      icon: 'fa-tachometer-alt',
      color: 'blue',
      roles: ['Administrator', 'Operator', 'User'],
      prefetch: ['surat', 'users', 'kategori']
    },
    {
      id: 'input',
      href: '/dashboard/input',
      label: 'Input Surat Baru',
      icon: 'fa-plus-circle',
      color: 'green',
      roles: ['Administrator', 'Operator'],
      prefetch: ['kategori', 'users']
    },
    {
      id: 'data',
      href: '/dashboard/data',
      label: 'Data Surat Keluar',
      icon: 'fa-table',
      color: 'purple',
      roles: ['Administrator', 'Operator', 'User'],
      prefetch: ['surat', 'kategori']
    },
    {
      id: 'master-data',
      href: '/dashboard/master-data',
      label: 'Master Data',
      icon: 'fa-database',
      color: 'indigo',
      roles: ['Administrator'],
      prefetch: ['kategori']
    },
    {
      id: 'laporan',
      href: '/dashboard/laporan',
      label: 'Laporan',
      icon: 'fa-chart-bar',
      color: 'orange',
      roles: ['Administrator', 'Operator', 'User'],
      prefetch: ['surat', 'kategori']
    },
    {
      id: 'user',
      href: '/dashboard/user',
      label: 'Kelola User',
      icon: 'fa-users',
      color: 'teal',
      roles: ['Administrator'],
      prefetch: ['users']
    },
    {
      id: 'pengaturan',
      href: '/dashboard/pengaturan',
      label: 'Pengaturan',
      icon: 'fa-cog',
      color: 'gray',
      roles: ['Administrator'],
      prefetch: []
    },
    {
      id: 'role',
      href: '/role',
      label: 'Role',
      icon: 'fa-user-shield',
      color: 'blue',
      roles: ['Administrator'],
      prefetch: []
    },
  ];

  // Filter menu items based on user role
  const filteredMenuItems = menuItems.filter(item => 
    item.roles.includes(currentUser?.role || '')
  );

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
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white/95 backdrop-blur-sm shadow-2xl border-r border-slate-200/50 transform transition-all duration-300 ease-in-out md:translate-x-0 md:inset-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
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

        <div className="flex flex-col h-[calc(100vh-6rem)] overflow-y-auto">
          <nav className="mt-8 px-4 flex-grow">
            <div className="space-y-2">
              {filteredMenuItems.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    prefetch={true} // Enable Next.js automatic prefetching
                    onMouseEnter={() => {
                      // Prefetch data when hovering over menu items
                      if (item.prefetch && item.prefetch.length > 0) {
                        item.prefetch.forEach(async (dataType) => {
                          try {
                            switch (dataType) {
                              case 'surat':
                                await fetch('/api/surat');
                                break;
                              case 'users':
                                await fetch('/api/users');
                                break;
                              case 'kategori':
                                await fetch('/api/kategori');
                                break;
                            }
                          } catch (err) {
                            console.log(`Prefetch ${dataType} failed:`, err);
                          }
                        });
                      }
                    }}
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

          <div className="p-4 mt-auto">
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
                  {filteredMenuItems.find(item => isActive(item.href))?.label || 'Dashboard'}
                </h1>
                <p className="text-sm lg:text-base text-slate-600 mt-2 font-medium">
                  {pathname === '/dashboard' 
                    ? 'Selamat datang di sistem pengelolaan surat keluar' 
                    : 'Kelola surat keluar dengan mudah dan efisien'}
                </p>
              </div>
              <div className="flex items-center space-x-6">
                {/* Notification Bell - only render on client */}
                {isClient && (
                  <div className="relative" ref={notificationsRef}>
                    <button 
                      onClick={() => setNotificationsOpen(!notificationsOpen)}
                      className="bg-slate-100 hover:bg-slate-200 p-3 rounded-xl transition-all duration-200 shadow-sm relative"
                    >
                      <i className="fas fa-bell text-slate-600"></i>
                      {unreadCount > 0 && (
                        <span className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-semibold shadow-lg">
                          {unreadCount}
                        </span>
                      )}
                    </button>
                    
                    {/* Notifications Dropdown */}
                    {notificationsOpen && (
                      <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-slate-200/50 z-50">
                        <div className="p-4 border-b border-slate-200/50">
                          <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold text-slate-800">Notifikasi</h3>
                            {unreadCount > 0 && (
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  markAllAsRead();
                                }}
                                className="text-sm text-blue-600 hover:text-blue-800"
                              >
                                Tandai semua dibaca
                              </button>
                            )}
                          </div>
                        </div>
                        
                        <div className="max-h-96 overflow-y-auto">
                          {notifications.length > 0 ? (
                            notifications.map((notification) => (
                              <div 
                                key={notification.id}
                                className={`p-4 border-b border-slate-200/50 hover:bg-slate-50 cursor-pointer ${
                                  !notification.read ? 'bg-blue-50' : ''
                                }`}
                                onClick={() => markAsRead(notification.id)}
                              >
                                <div className="flex items-start space-x-3">
                                  <div className={`w-3 h-3 rounded-full mt-2 ${
                                    notification.type === 'success' ? 'bg-green-500' :
                                    notification.type === 'warning' ? 'bg-yellow-500' :
                                    'bg-blue-500'
                                  }`}></div>
                                  <div className="flex-1">
                                    <h4 className="font-medium text-slate-800">{notification.title}</h4>
                                    <p className="text-sm text-slate-600 mt-1">{notification.message}</p>
                                    <p className="text-xs text-slate-400 mt-2">{notification.time}</p>
                                  </div>
                                  {!notification.read && (
                                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                                  )}
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="p-8 text-center">
                              <div className="bg-slate-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                                <i className="fas fa-bell-slash text-slate-400 text-2xl"></i>
                              </div>
                              <p className="text-slate-600">Tidak ada notifikasi</p>
                            </div>
                          )}
                        </div>
                        
                        <div className="p-3 text-center border-t border-slate-200/50">
                          <button className="text-sm text-blue-600 hover:text-blue-800">
                            Lihat semua notifikasi
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-semibold text-slate-800">{currentUser?.nama || 'User'}</p>
                  <p className="text-xs text-slate-500 font-medium">{currentUser?.role || 'Pengguna'}</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6 bg-gradient-to-br from-slate-50 to-blue-50">
          {children}
        </main>
      </div>
    </div>
  );
}