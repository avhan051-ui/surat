'use client';

import { useState, useEffect, useRef } from 'react';
import { useAppContext } from '@/app/context/AppContext';
import { generateLaporanPDF } from '@/lib/pdf-utils';
import { generateLaporanExcel } from '@/lib/excel-utils';

export default function LaporanPage() {
  const { surat, kategoriData } = useAppContext();
  const [periode, setPeriode] = useState('bulan-ini');
  const [tanggalDari, setTanggalDari] = useState('');
  const [tanggalSampai, setTanggalSampai] = useState('');
  const [kategori, setKategori] = useState('');
  const [showCustomDate, setShowCustomDate] = useState(false);
  const [laporanData, setLaporanData] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalSurat: 0,
    rataRata: 0,
    kategoriTop: '',
    bulanTop: ''
  });
  
  // Refs for chart containers
  const trendChartRef = useRef<HTMLCanvasElement>(null);
  const kategoriChartRef = useRef<HTMLCanvasElement>(null);
  const harianChartRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Set default period to current month
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    setTanggalDari(firstDay.toISOString().split('T')[0]);
    setTanggalSampai(lastDay.toISOString().split('T')[0]);
    
    // Don't generate initial report to avoid the alert
  }, []);

  useEffect(() => {
    if (periode === 'custom') {
      setShowCustomDate(true);
    } else {
      setShowCustomDate(false);
      
      const today = new Date();
      let startDate, endDate;
      
      switch(periode) {
        case 'bulan-ini':
          startDate = new Date(today.getFullYear(), today.getMonth(), 1);
          endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
          break;
        case '3-bulan':
          startDate = new Date(today.getFullYear(), today.getMonth() - 2, 1);
          endDate = today;
          break;
        case '6-bulan':
          startDate = new Date(today.getFullYear(), today.getMonth() - 5, 1);
          endDate = today;
          break;
        case 'tahun-ini':
          startDate = new Date(today.getFullYear(), 0, 1);
          endDate = today;
          break;
        default:
          startDate = new Date(today.getFullYear(), today.getMonth(), 1);
          endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      }
      
      setTanggalDari(startDate.toISOString().split('T')[0]);
      setTanggalSampai(endDate.toISOString().split('T')[0]);
    }
  }, [periode]);

  // Initialize charts when laporanData changes
  useEffect(() => {
    if (laporanData.length > 0) {
      initializeCharts();
    }
  }, [laporanData]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Get top creators
  const getTopCreators = (data: any[]) => {
    const creatorCount: any = {};
    data.forEach(suratItem => {
      creatorCount[suratItem.pembuat] = (creatorCount[suratItem.pembuat] || 0) + 1;
    });
    
    return Object.entries(creatorCount)
      .sort((a: any, b: any) => b[1] - a[1])
      .slice(0, 5)
      .map(([creator, count]) => ({ creator, count }));
  };

  // Initialize charts
  const initializeCharts = () => {
    // Trend chart (monthly)
    if (trendChartRef.current) {
      const ctx = trendChartRef.current.getContext('2d');
      if (ctx) {
        // Destroy existing chart if it exists
        if ((trendChartRef.current as any).chart) {
          (trendChartRef.current as any).chart.destroy();
        }
        
        // Prepare data
        const monthlyData: any = {};
        laporanData.forEach(suratItem => {
          const month = new Date(suratItem.tanggal).toLocaleDateString('id-ID', { 
            month: 'short', 
            year: 'numeric' 
          });
          monthlyData[month] = (monthlyData[month] || 0) + 1;
        });
        
        const months = Object.keys(monthlyData);
        const counts = Object.values(monthlyData);
        
        // Create chart
        (trendChartRef.current as any).chart = new (window as any).Chart(ctx, {
          type: 'line',
          data: {
            labels: months,
            datasets: [{
              label: 'Jumlah Surat',
              data: counts,
              borderColor: '#3b82f6',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              borderWidth: 2,
              fill: true,
              tension: 0.3
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: false
              }
            },
            scales: {
              y: {
                beginAtZero: true,
                grid: {
                  color: 'rgba(0, 0, 0, 0.05)'
                }
              },
              x: {
                grid: {
                  display: false
                }
              }
            }
          }
        });
      }
    }
    
    // Category chart
    if (kategoriChartRef.current) {
      const ctx = kategoriChartRef.current.getContext('2d');
      if (ctx) {
        // Destroy existing chart if it exists
        if ((kategoriChartRef.current as any).chart) {
          (kategoriChartRef.current as any).chart.destroy();
        }
        
        // Prepare data
        const kategoriCount: any = {};
        laporanData.forEach(suratItem => {
          const kategoriName = kategoriData[suratItem.kategori]?.name || suratItem.kategori;
          kategoriCount[kategoriName] = (kategoriCount[kategoriName] || 0) + 1;
        });
        
        const labels = Object.keys(kategoriCount);
        const counts = Object.values(kategoriCount);
        const colors = [
          '#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', 
          '#ef4444', '#06b6d4', '#8b5cf6', '#f97316'
        ];
        
        // Create chart
        (kategoriChartRef.current as any).chart = new (window as any).Chart(ctx, {
          type: 'doughnut',
          data: {
            labels: labels,
            datasets: [{
              data: counts,
              backgroundColor: colors.slice(0, labels.length),
              borderWidth: 0
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'bottom',
                labels: {
                  padding: 20,
                  usePointStyle: true
                }
              }
            }
          }
        });
      }
    }
    
    // Daily activity chart
    if (harianChartRef.current) {
      const ctx = harianChartRef.current.getContext('2d');
      if (ctx) {
        // Destroy existing chart if it exists
        if ((harianChartRef.current as any).chart) {
          (harianChartRef.current as any).chart.destroy();
        }
        
        // Prepare data for last 7 days
        const dailyData: any = {};
        const today = new Date();
        
        // Initialize last 7 days
        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setDate(today.getDate() - i);
          const dateStr = date.toLocaleDateString('id-ID', { 
            weekday: 'short' 
          });
          dailyData[dateStr] = 0;
        }
        
        // Count surat per day
        laporanData.forEach(suratItem => {
          const suratDate = new Date(suratItem.tanggal);
          if (suratDate >= new Date(today.setDate(today.getDate() - 6)) && 
              suratDate <= new Date()) {
            const day = suratDate.toLocaleDateString('id-ID', { 
              weekday: 'short' 
            });
            dailyData[day] = (dailyData[day] || 0) + 1;
          }
        });
        
        const days = Object.keys(dailyData);
        const counts = Object.values(dailyData);
        
        // Create chart
        (harianChartRef.current as any).chart = new (window as any).Chart(ctx, {
          type: 'bar',
          data: {
            labels: days,
            datasets: [{
              label: 'Jumlah Surat',
              data: counts,
              backgroundColor: '#f59e0b',
              borderRadius: 4,
              borderSkipped: false,
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: false
              }
            },
            scales: {
              y: {
                beginAtZero: true,
                grid: {
                  color: 'rgba(0, 0, 0, 0.05)'
                }
              },
              x: {
                grid: {
                  display: false
                }
              }
            }
          }
        });
      }
    }
  };

  const generateLaporan = () => {
    if (!tanggalDari || !tanggalSampai) {
      alert('Pilih periode tanggal terlebih dahulu!');
      return;
    }
    
    // Filter data berdasarkan periode dan kategori
    const filteredData = surat.filter(suratItem => {
      const suratDate = new Date(suratItem.tanggal);
      const startDate = new Date(tanggalDari);
      const endDate = new Date(tanggalSampai);
      
      let match = suratDate >= startDate && suratDate <= endDate;
      
      if (kategori && suratItem.kategori !== kategori) {
        match = false;
      }
      
      return match;
    });
    
    setLaporanData(filteredData);
    
    // Update statistik overview
    updateLaporanStats(filteredData);
  };

  const updateLaporanStats = (data: any[]) => {
    const totalSurat = data.length;
    
    // Calculate average per month
    let avgPerMonth = 0;
    if (totalSurat > 0) {
      const startDate = new Date(tanggalDari);
      const endDate = new Date(tanggalSampai);
      const monthsDiff = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30)));
      avgPerMonth = Math.round(totalSurat / monthsDiff);
    }
    
    // Find top category
    const kategoriCount: any = {};
    data.forEach(suratItem => {
      kategoriCount[suratItem.kategori] = (kategoriCount[suratItem.kategori] || 0) + 1;
    });
    
    const topKategori = Object.entries(kategoriCount).sort((a: any, b: any) => b[1] - a[1])[0];
    const kategoriName = topKategori ? (kategoriData[topKategori[0] as keyof typeof kategoriData]?.name || topKategori[0]) : '-';
    
    // Find top month
    const monthCount: any = {};
    data.forEach(suratItem => {
      const month = new Date(suratItem.tanggal).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
      monthCount[month] = (monthCount[month] || 0) + 1;
    });
    
    const topMonth = Object.entries(monthCount).sort((a: any, b: any) => b[1] - a[1])[0];
    
    setStats({
      totalSurat,
      rataRata: avgPerMonth,
      kategoriTop: topKategori ? `${topKategori[0]} (${topKategori[1]})` : '-',
      bulanTop: topMonth ? `${topMonth[0]} (${topMonth[1]})` : '-'
    });
  };

  const handleExportPDF = () => {
    if (laporanData.length === 0) {
      alert('Tidak ada data untuk di-export. Silakan pilih periode dan klik tombol "Generate" terlebih dahulu!');
      return;
    }
    
    generateLaporanPDF(
      laporanData, 
      stats, 
      kategoriData, 
      tanggalDari, 
      tanggalSampai, 
      kategori
    );
  };

  const handleExportExcel = () => {
    if (laporanData.length === 0) {
      alert('Tidak ada data untuk di-export. Silakan pilih periode dan klik tombol "Generate" terlebih dahulu!');
      return;
    }
    
    generateLaporanExcel(
      laporanData, 
      stats, 
      tanggalDari, 
      tanggalSampai, 
      kategori
    );
  };

  const handlePrint = () => {
    if (laporanData.length === 0) {
      alert('Tidak ada data untuk di-print. Silakan pilih periode dan klik tombol "Generate" terlebih dahulu!');
      return;
    }
    alert('Print functionality would be implemented here');
  };

  // Get top creators for display
  const topCreators = getTopCreators(laporanData);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Filter Laporan Card */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-gray-800">Filter Laporan</h3>
            <p className="text-gray-600 text-sm mt-1">Pilih periode dan kategori untuk laporan</p>
          </div>
          <div className="bg-orange-50 p-3 rounded-full">
            <i className="fas fa-chart-line text-orange-600"></i>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Periode</label>
            <select 
              value={periode}
              onChange={(e) => setPeriode(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="bulan-ini">Bulan Ini</option>
              <option value="3-bulan">3 Bulan Terakhir</option>
              <option value="6-bulan">6 Bulan Terakhir</option>
              <option value="tahun-ini">Tahun Ini</option>
              <option value="custom">Custom</option>
            </select>
          </div>
          {showCustomDate && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Dari Tanggal</label>
                <input 
                  type="date" 
                  value={tanggalDari}
                  onChange={(e) => setTanggalDari(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sampai Tanggal</label>
                <input 
                  type="date" 
                  value={tanggalSampai}
                  onChange={(e) => setTanggalSampai(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Kategori</label>
            <select 
              value={kategori}
              onChange={(e) => setKategori(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="">Semua Kategori</option>
              {Object.entries(kategoriData).map(([key, value]) => (
                <option key={key} value={key}>
                  {key} - {value.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button 
              onClick={generateLaporan}
              className="w-full bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white px-4 py-2 rounded-lg text-sm transition-all"
            >
              <i className="fas fa-chart-bar mr-1"></i>Generate
            </button>
          </div>
        </div>
      </div>

      {/* Statistik Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium mb-2">Total Surat</p>
              <p className="text-3xl font-bold">{stats.totalSurat}</p>
            </div>
            <div className="bg-white/20 rounded-xl p-3">
              <i className="fas fa-envelope text-2xl"></i>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium mb-2">Rata-rata/Bulan</p>
              <p className="text-3xl font-bold">{stats.rataRata}</p>
            </div>
            <div className="bg-white/20 rounded-xl p-3">
              <i className="fas fa-chart-line text-2xl"></i>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium mb-2">Kategori Terbanyak</p>
              <p className="text-lg font-bold">{stats.kategoriTop}</p>
            </div>
            <div className="bg-white/20 rounded-xl p-3">
              <i className="fas fa-trophy text-2xl"></i>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium mb-2">Bulan Tertinggi</p>
              <p className="text-lg font-bold">{stats.bulanTop}</p>
            </div>
            <div className="bg-white/20 rounded-xl p-3">
              <i className="fas fa-calendar-check text-2xl"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Grafik Trend Bulanan */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-800">Trend Surat Bulanan</h3>
            <div className="bg-blue-100 p-2 rounded-lg">
              <i className="fas fa-chart-line text-blue-600"></i>
            </div>
          </div>
          <div className="h-80">
            <canvas ref={trendChartRef}></canvas>
          </div>
        </div>

        {/* Grafik Kategori */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-800">Distribusi Kategori</h3>
            <div className="bg-purple-100 p-2 rounded-lg">
              <i className="fas fa-chart-pie text-purple-600"></i>
            </div>
          </div>
          <div className="h-80">
            <canvas ref={kategoriChartRef}></canvas>
          </div>
        </div>
      </div>

      {/* Tabel Detail dan Pembuat Surat */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Pembuat Surat */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-800">Top Pembuat Surat</h3>
            <div className="bg-green-100 p-2 rounded-lg">
              <i className="fas fa-users text-green-600"></i>
            </div>
          </div>
          <div className="space-y-4">
            {topCreators.map((creator: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-bold">
                    {index + 1}
                  </div>
                  <span className="font-medium text-gray-800">{creator.creator}</span>
                </div>
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                  {creator.count} surat
                </span>
              </div>
            ))}
            {topCreators.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <i className="fas fa-users text-2xl mb-2"></i>
                <p>Tidak ada data pembuat surat</p>
              </div>
            )}
          </div>
        </div>

        {/* Tren Harian */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-800">Aktivitas Harian</h3>
            <div className="bg-orange-100 p-2 rounded-lg">
              <i className="fas fa-calendar-day text-orange-600"></i>
            </div>
          </div>
          <div className="h-64">
            <canvas ref={harianChartRef}></canvas>
          </div>
        </div>
      </div>

      {/* Tabel Detail */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-800">Detail Surat ({laporanData.length} data)</h3>
        </div>
        
        {laporanData.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 lg:px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No</th>
                  <th className="px-4 lg:px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nomor Surat</th>
                  <th className="px-4 lg:px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                  <th className="px-4 lg:px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tujuan</th>
                  <th className="px-4 lg:px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Perihal</th>
                  <th className="px-4 lg:px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pembuat</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {laporanData.map((suratItem, index) => (
                  <tr key={suratItem.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">{index + 1}</td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm font-mono text-blue-600 font-medium">{suratItem.nomor}</td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(suratItem.tanggal)}</td>
                    <td className="px-4 lg:px-6 py-4 text-sm text-gray-900 max-w-xs truncate">{suratItem.tujuan}</td>
                    <td className="px-4 lg:px-6 py-4 text-sm text-gray-900 max-w-xs lg:max-w-md truncate">{suratItem.perihal}</td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">{suratItem.pembuat}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-table text-gray-400 text-2xl"></i>
            </div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">Tidak ada data</h4>
            <p className="text-gray-500">Silakan pilih periode dan klik tombol "Generate" untuk menampilkan laporan</p>
          </div>
        )}
      </div>

      {/* Export Laporan */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="text-lg font-bold text-gray-800">Export Laporan</h3>
            <p className="text-gray-600 text-sm mt-1">Download laporan dalam berbagai format</p>
          </div>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
            <button 
              onClick={handleExportPDF}
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2 rounded-lg text-sm transition-all shadow-md"
            >
              <i className="fas fa-file-pdf mr-2"></i>Export PDF
            </button>
            <button 
              onClick={handleExportExcel}
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-4 py-2 rounded-lg text-sm transition-all shadow-md"
            >
              <i className="fas fa-file-excel mr-2"></i>Export Excel
            </button>
            <button 
              onClick={handlePrint}
              className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white px-4 py-2 rounded-lg text-sm transition-all shadow-md"
            >
              <i className="fas fa-print mr-2"></i>Print
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}