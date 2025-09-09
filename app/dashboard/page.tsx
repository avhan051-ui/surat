'use client';

import { useEffect, useState } from 'react';
import { useAppContext } from '@/app/context/AppContext';

export default function DashboardPage() {
  const { surat, kategoriData, currentUser, logout } = useAppContext();
  const [totalSurat, setTotalSurat] = useState(0);
  const [suratBulanIni, setSuratBulanIni] = useState(0);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [categoryStats, setCategoryStats] = useState<any[]>([]);

  useEffect(() => {
    // Initialize dashboard data
    setTotalSurat(surat.length);
    
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const suratBulanIniCount = surat.filter(suratItem => {
      const suratDate = new Date(suratItem.tanggal);
      return suratDate.getMonth() === currentMonth && suratDate.getFullYear() === currentYear;
    }).length;
    
    setSuratBulanIni(suratBulanIniCount);
    
    // Recent activity (last 5)
    const recentSurat = surat.slice(-5).reverse();
    setRecentActivity(recentSurat);
    
    // Category statistics
    const stats: any = {};
    surat.forEach(suratItem => {
      const kategori = suratItem.kategori;
      stats[kategori] = (stats[kategori] || 0) + 1;
    });
    
    const categoryStatsData = Object.entries(stats).map(([kategori, count]) => ({
      kategori,
      name: kategoriData[kategori as keyof typeof kategoriData]?.name || kategori,
      count,
      percentage: Math.round((Number(count) / surat.length) * 100)
    }));
    
    setCategoryStats(categoryStatsData);
  }, [surat, kategoriData]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header with User Info and Logout */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-600 mt-1">Selamat datang kembali, {currentUser?.nama || 'User'}</p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center space-x-4">
          <div className="flex items-center space-x-3 bg-white rounded-xl px-4 py-2 shadow-sm border border-gray-200">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold">
              {currentUser?.nama?.charAt(0) || 'U'}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800">{currentUser?.nama || 'User'}</p>
              <p className="text-xs text-gray-500">{currentUser?.jabatan || 'Pengguna'}</p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2 rounded-xl font-medium flex items-center transition-all duration-200 shadow-md hover:shadow-lg"
          >
            <i className="fas fa-sign-out-alt mr-2"></i>Logout
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="group bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 rounded-2xl shadow-xl p-6 text-white hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-blue-400/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium mb-2">Total Surat</p>
              <p className="text-3xl font-bold tracking-tight">{totalSurat}</p>
              <p className="text-blue-200 text-xs mt-1">+12% dari bulan lalu</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 group-hover:bg-white/30 transition-all duration-300">
              <i className="fas fa-envelope text-2xl"></i>
            </div>
          </div>
        </div>

        <div className="group bg-gradient-to-br from-emerald-500 via-green-600 to-teal-700 rounded-2xl shadow-xl p-6 text-white hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-emerald-400/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100 text-sm font-medium mb-2">Bulan Ini</p>
              <p className="text-3xl font-bold tracking-tight">{suratBulanIni}</p>
              <p className="text-emerald-200 text-xs mt-1">
                {new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
              </p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 group-hover:bg-white/30 transition-all duration-300">
              <i className="fas fa-calendar-alt text-2xl"></i>
            </div>
          </div>
        </div>

        <div className="group bg-gradient-to-br from-amber-500 via-orange-600 to-red-600 rounded-2xl shadow-xl p-6 text-white hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-amber-400/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-amber-100 text-sm font-medium mb-2">Kategori Aktif</p>
              <p className="text-3xl font-bold tracking-tight">4</p>
              <p className="text-amber-200 text-xs mt-1">Semua kategori</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 group-hover:bg-white/30 transition-all duration-300">
              <i className="fas fa-tags text-2xl"></i>
            </div>
          </div>
        </div>

        <div className="group bg-gradient-to-br from-violet-500 via-purple-600 to-indigo-700 rounded-2xl shadow-xl p-6 text-white hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-violet-400/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-violet-100 text-sm font-medium mb-2">Pengguna Aktif</p>
              <p className="text-3xl font-bold tracking-tight">12</p>
              <p className="text-violet-200 text-xs mt-1">Online sekarang</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 group-hover:bg-white/30 transition-all duration-300">
              <i className="fas fa-users text-2xl"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity and Category Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-slate-200/50">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-slate-800">Aktivitas Terbaru</h3>
            <div className="bg-blue-100 p-2 rounded-xl">
              <i className="fas fa-clock text-blue-600"></i>
            </div>
          </div>
          <div className="space-y-4">
            {recentActivity.map((suratItem) => (
              <div 
                key={suratItem.id} 
                className="flex items-center space-x-4 p-4 bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl border border-slate-200/50 hover:shadow-md transition-all duration-200"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <i className="fas fa-envelope text-white"></i>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-800">{suratItem.nomor}</p>
                  <p className="text-xs text-slate-600 mt-1">{suratItem.tujuan}</p>
                </div>
                <div className="text-xs text-slate-500 font-medium">
                  {formatDate(suratItem.tanggal)}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-slate-200/50">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-slate-800">Statistik Kategori</h3>
            <div className="bg-purple-100 p-2 rounded-xl">
              <i className="fas fa-chart-pie text-purple-600"></i>
            </div>
          </div>
          <div className="space-y-4">
            {categoryStats.map((stat, index) => {
              const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500'];
              const colorIndex = index % colors.length;
              
              return (
                <div 
                  key={stat.kategori} 
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-purple-50 rounded-xl border border-slate-200/50"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-4 h-4 ${colors[colorIndex]} rounded-full shadow-sm`}></div>
                    <span className="text-sm font-medium text-slate-700">{stat.name}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-bold text-slate-800">{stat.count}</span>
                    <span className="text-xs text-slate-500 bg-slate-200 px-2 py-1 rounded-full">
                      {stat.percentage}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}