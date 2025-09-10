'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useAppContext } from '@/app/context/AppContext';
import { generateLaporanPDF } from '@/lib/pdf-utils';
import { generateLaporanExcel } from '@/lib/excel-utils';
import { createTrendChart, createKategoriChart, createHarianChart } from '@/lib/chart-utils';
import { Chart } from 'chart.js/auto';
import LoadingSpinner from '@/app/components/LoadingSpinner';
import TableSkeleton from '@/app/components/TableSkeleton';

export default function LaporanPage() {
  const { surat, kategoriData } = useAppContext();
  const [periode, setPeriode] = useState('bulan-ini');
  const [tanggalDari, setTanggalDari] = useState('');
  const [tanggalSampai, setTanggalSampai] = useState('');
  const [kategori, setKategori] = useState('');
  const [showCustomDate, setShowCustomDate] = useState(false);
  const [laporanData, setLaporanData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [chartLoading, setChartLoading] = useState(false);
  
  // Refs for chart containers
  const trendChartRef = useRef<HTMLCanvasElement>(null);
  const kategoriChartRef = useRef<HTMLCanvasElement>(null);
  const harianChartRef = useRef<HTMLCanvasElement>(null);
  
  // Refs for chart instances
  const trendChartInstance = useRef<Chart | null>(null);
  const kategoriChartInstance = useRef<Chart | null>(null);
  const harianChartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    // Set default period to current month
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    setTanggalDari(firstDay.toISOString().split('T')[0]);
    setTanggalSampai(lastDay.toISOString().split('T')[0]);
    
    // Cleanup function to destroy charts when component unmounts
    return () => {
      if (trendChartInstance.current) {
        trendChartInstance.current.destroy();
      }
      if (kategoriChartInstance.current) {
        kategoriChartInstance.current.destroy();
      }
      if (harianChartInstance.current) {
        harianChartInstance.current.destroy();
      }
    };
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
    // Pastikan data tidak kosong
    if (!data || data.length === 0) {
      return [];
    }
    
    const creatorCount: any = {};
    data.forEach(suratItem => {
      const creator = suratItem.pembuat || 'Tidak Diketahui';
      creatorCount[creator] = (creatorCount[creator] || 0) + 1;
    });
    
    return Object.entries(creatorCount)
      .sort((a: any, b: any) => b[1] - a[1])
      .slice(0, 5)
      .map(([creator, count]) => ({ creator, count }));
  };

  // Fungsi untuk menghasilkan data statistik
  const generateStats = (data: any[]) => {
    // Pastikan data tidak kosong
    if (!data || data.length === 0) {
      return {
        totalSurat: 0,
        rataRata: 0,
        kategoriTop: '-',
        bulanTop: '-'
      };
    }
    
    // Total surat
    const totalSurat = data.length;
    
    // Rata-rata per bulan
    const months = data.reduce((acc: any, suratItem) => {
      try {
        const date = new Date(suratItem.tanggal);
        // Periksa apakah tanggal valid
        if (isNaN(date.getTime())) {
          return acc;
        }
        const month = date.toLocaleDateString('id-ID', { 
          month: 'long', 
          year: 'numeric' 
        });
        acc[month] = (acc[month] || 0) + 1;
      } catch (error) {
        console.error('Error processing date for stats:', suratItem.tanggal, error);
      }
      return acc;
    }, {});
    
    const rataRata = Object.keys(months).length > 0 
      ? Math.round(totalSurat / Object.keys(months).length) 
      : 0;
    
    // Kategori terbanyak
    const kategoriCount = data.reduce((acc: any, suratItem) => {
      const kategoriName = kategoriData[suratItem.kategori]?.name || suratItem.kategori || 'Tidak Diketahui';
      acc[kategoriName] = (acc[kategoriName] || 0) + 1;
      return acc;
    }, {});
    
    const kategoriTop = Object.keys(kategoriCount).length > 0 
      ? Object.entries(kategoriCount).sort((a: any, b: any) => b[1] - a[1])[0][0] 
      : '-';
    
    // Bulan tertinggi
    const bulanTop = Object.keys(months).length > 0 
      ? Object.entries(months).sort((a: any, b: any) => b[1] - a[1])[0][0] 
      : '-';
    
    return {
      totalSurat,
      rataRata,
      kategoriTop,
      bulanTop
    };
  };

  // Fungsi untuk menghasilkan data trend bulanan
  const generateTrendData = (data: any[]) => {
    const monthlyData: any = {};
    
    // Pastikan data tidak kosong
    if (!data || data.length === 0) {
      return { labels: [], values: [] };
    }
    
    data.forEach(suratItem => {
      try {
        const date = new Date(suratItem.tanggal);
        // Periksa apakah tanggal valid
        if (isNaN(date.getTime())) {
          return;
        }
        const month = date.toLocaleDateString('id-ID', { month: 'short', year: '2-digit' });
        monthlyData[month] = (monthlyData[month] || 0) + 1;
      } catch (error) {
        console.error('Error processing date:', suratItem.tanggal, error);
      }
    });
    
    const labels = Object.keys(monthlyData).sort();
    const values = labels.map(label => monthlyData[label]);
    
    return { labels, values };
  };

  // Fungsi untuk menghasilkan data kategori
  const generateKategoriData = (data: any[]) => {
    const kategoriCount: any = {};
    
    // Pastikan data tidak kosong
    if (!data || data.length === 0) {
      return { labels: [], values: [] };
    }
    
    data.forEach(suratItem => {
      const kategoriName = kategoriData[suratItem.kategori]?.name || suratItem.kategori || 'Tidak Diketahui';
      kategoriCount[kategoriName] = (kategoriCount[kategoriName] || 0) + 1;
    });
    
    const labels = Object.keys(kategoriCount);
    const values = Object.values(kategoriCount);
    
    return { labels, values };
  };

  // Fungsi untuk menghasilkan data harian
  const generateHarianData = (data: any[]) => {
    const dailyData: any = {};
    
    // Pastikan data tidak kosong
    if (!data || data.length === 0) {
      return { labels: [], values: [] };
    }
    
    data.forEach(suratItem => {
      try {
        const date = new Date(suratItem.tanggal);
        // Periksa apakah tanggal valid
        if (isNaN(date.getTime())) {
          return;
        }
        const day = date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
        dailyData[day] = (dailyData[day] || 0) + 1;
      } catch (error) {
        console.error('Error processing date:', suratItem.tanggal, error);
      }
    });
    
    // Urutkan berdasarkan tanggal
    const sortedEntries = Object.entries(dailyData).sort((a, b) => {
      const [dayA] = a;
      const [dayB] = b;
      return dayA.localeCompare(dayB);
    });
    
    const labels = sortedEntries.map(([day]) => day);
    const values = sortedEntries.map(([, count]) => count);
    
    return { labels, values };
  };

  // Fungsi untuk menggambar chart
  const drawCharts = (data: any[]) => {
    try {
      // Hapus chart yang ada sebelumnya
      if (trendChartInstance.current) {
        trendChartInstance.current.destroy();
        trendChartInstance.current = null;
      }
      if (kategoriChartInstance.current) {
        kategoriChartInstance.current.destroy();
        kategoriChartInstance.current = null;
      }
      if (harianChartInstance.current) {
        harianChartInstance.current.destroy();
        harianChartInstance.current = null;
      }
      
      // Buat trend chart
      if (trendChartRef.current) {
        const { labels, values } = generateTrendData(data);
        if (labels.length > 0 && values.length > 0) {
          trendChartInstance.current = createTrendChart(trendChartRef.current, labels, values);
        }
      }
      
      // Buat kategori chart
      if (kategoriChartRef.current) {
        const { labels, values } = generateKategoriData(data);
        if (labels.length > 0 && values.length > 0) {
          kategoriChartInstance.current = createKategoriChart(kategoriChartRef.current, labels, values);
        }
      }
      
      // Buat harian chart
      if (harianChartRef.current) {
        const { labels, values } = generateHarianData(data);
        if (labels.length > 0 && values.length > 0) {
          harianChartInstance.current = createHarianChart(harianChartRef.current, labels, values);
        }
      }
    } catch (error) {
      console.error('Error drawing charts:', error);
    }
  };

  const generateLaporan = () => {
    if (!tanggalDari || !tanggalSampai) {
      alert('Pilih periode tanggal terlebih dahulu!');
      return;
    }
    
    // Set loading state
    setLoading(true);
    setChartLoading(true);
    
    // Filter data berdasarkan periode dan kategori
    const filteredData = surat.filter(suratItem => {
      const suratDate = new Date(suratItem.tanggal);
      const startDate = new Date(tanggalDari);
      const endDate = new Date(tanggalSampai);
      
      // Periksa apakah tanggal valid
      if (isNaN(suratDate.getTime()) || isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return false;
      }
      
      let match = suratDate >= startDate && suratDate <= endDate;
      
      if (kategori && suratItem.kategori !== kategori) {
        match = false;
      }
      
      return match;
    });
    
    setLaporanData(filteredData);
    
    // Gambar chart
    setTimeout(() => {
      drawCharts(filteredData);
      setLoading(false);
      setChartLoading(false);
    }, 300);
  };

  const handleExportPDF = () => {
    if (laporanData.length === 0) {
      alert('Tidak ada data untuk di-export. Silakan pilih periode dan klik tombol "Generate" terlebih dahulu!');
      return;
    }
    
    const stats = generateStats(laporanData);
    
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
    
    const stats = generateStats(laporanData);
    
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
    
    // Create a print window with formatted content
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Laporan Surat Keluar</title>
          <style>
            body { 
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              margin: 20px;
              color: #333;
              background-color: #fff;
            }
            .header {
              text-align: center;
              border-bottom: 3px solid #3b82f6;
              padding-bottom: 15px;
              margin-bottom: 25px;
            }
            .title {
              font-size: 28px;
              font-weight: 700;
              color: #1e40af;
              margin: 0;
            }
            .subtitle {
              font-size: 16px;
              color: #64748b;
              margin-top: 5px;
            }
            .report-info {
              background-color: #eff6ff;
              border-left: 4px solid #3b82f6;
              padding: 15px;
              margin-bottom: 25px;
              border-radius: 0 8px 8px 0;
              box-shadow: 0 1px 3px rgba(0,0,0,0.05);
            }
            .info-label {
              font-weight: 600;
              color: #1e40af;
              margin-right: 10px;
              display: inline-block;
              min-width: 140px;
            }
            .info-value {
              font-weight: 500;
              color: #334155;
            }
            .info-row {
              margin-bottom: 8px;
            }
            .info-row:last-child {
              margin-bottom: 0;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
              box-shadow: 0 1px 3px rgba(0,0,0,0.1);
              border-radius: 8px;
              overflow: hidden;
            }
            th {
              background: linear-gradient(135deg, #3b82f6, #1d4ed8);
              color: white;
              font-weight: 600;
              text-align: left;
              padding: 12px 15px;
            }
            td {
              border: 1px solid #e2e8f0;
              padding: 10px 15px;
            }
            tr:nth-child(even) {
              background-color: #f8fafc;
            }
            tr:hover {
              background-color: #f1f5f9;
            }
            .footer {
              margin-top: 30px;
              text-align: center;
              font-size: 12px;
              color: #94a3b8;
              padding-top: 15px;
              border-top: 1px solid #e2e8f0;
            }
            @media print {
              body {
                margin: 0;
                padding: 20px;
              }
              .header {
                border-bottom: 2px solid #3b82f6;
                padding-bottom: 10px;
              }
              .title {
                font-size: 24px;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">LAPORAN SURAT KELUAR</div>
            <div class="subtitle">Sistem Pengelolaan Surat Keluar</div>
          </div>
          
          <div class="report-info">
            <div class="info-row">
              <span class="info-label">Periode Laporan:</span>
              <span class="info-value">${formatDate(tanggalDari)} - ${formatDate(tanggalSampai)}</span>
            </div>
            ${kategori ? `
            <div class="info-row">
              <span class="info-label">Kategori:</span>
              <span class="info-value">${kategori} - ${kategoriData[kategori]?.name || ''}</span>
            </div>
            ` : ''}
          </div>
          
          <table>
            <thead>
              <tr>
                <th>No</th>
                <th>Nomor Surat</th>
                <th>Tanggal</th>
                <th>Tujuan</th>
                <th>Perihal</th>
                <th>Pembuat</th>
              </tr>
            </thead>
            <tbody>
              ${laporanData.map((item, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td>${item.nomor}</td>
                  <td>${formatDate(item.tanggal)}</td>
                  <td>${item.tujuan}</td>
                  <td>${item.perihal}</td>
                  <td>${item.pembuat}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="footer">
            Dicetak pada: ${new Date().toLocaleDateString('id-ID', {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>
        </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  // Get top creators for display
  const topCreators = getTopCreators(laporanData);

  // Effect untuk menggambar chart ketika laporanData berubah
  useEffect(() => {
    if (laporanData.length > 0) {
      // Gambar chart dengan delay kecil untuk memastikan DOM siap
      const timer = setTimeout(() => {
        drawCharts(laporanData);
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [laporanData]);

  return (
    <Suspense fallback={<LoadingSpinner message="Memuat laporan..." />}>
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
                className={`w-full bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white px-4 py-2 rounded-lg text-sm transition-all ${loading ? 'opacity-75 cursor-not-allowed' : ''}`}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-1"></i>Generating...
                  </>
                ) : (
                  <>
                    <i className="fas fa-chart-bar mr-1"></i>Generate
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Statistik Overview */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-200 rounded-xl shadow-lg p-6 h-24 animate-pulse"></div>
            ))}
          </div>
        ) : laporanData.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium mb-2">Total Surat</p>
                  <p className="text-3xl font-bold">{generateStats(laporanData).totalSurat}</p>
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
                  <p className="text-3xl font-bold">{generateStats(laporanData).rataRata}</p>
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
                  <p className="text-lg font-bold">{generateStats(laporanData).kategoriTop}</p>
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
                  <p className="text-lg font-bold">{generateStats(laporanData).bulanTop}</p>
                </div>
                <div className="bg-white/20 rounded-xl p-3">
                  <i className="fas fa-calendar-check text-2xl"></i>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Charts Section */}
        {chartLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-lg p-6 h-80 animate-pulse"></div>
            <div className="bg-white rounded-xl shadow-lg p-6 h-80 animate-pulse"></div>
          </div>
        ) : laporanData.length > 0 && (
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
        )}

        {/* Tabel Detail dan Pembuat Surat */}
        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-lg p-6 h-64 animate-pulse"></div>
            <div className="bg-white rounded-xl shadow-lg p-6 h-64 animate-pulse"></div>
          </div>
        ) : laporanData.length > 0 && (
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
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                        {index + 1}
                      </div>
                      <span className="font-medium text-gray-800">{creator.creator}</span>
                    </div>
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                      {creator.count} surat
                    </span>
                  </div>
                ))}
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
        )}

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

        {/* Tabel Detail */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-800">Detail Surat ({laporanData.length} data)</h3>
          </div>
          
          {loading ? (
            <TableSkeleton />
          ) : laporanData.length > 0 ? (
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
      </div>
    </Suspense>
  );
}