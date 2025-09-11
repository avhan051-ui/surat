'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useAppContext } from '@/app/context/AppContext';
import { Chart } from 'chart.js/auto';
import LoadingSpinner from '@/app/components/LoadingSpinner';
import TableSkeleton from '@/app/components/TableSkeleton';

export default function LaporanPage() {
  const { surat, suratMasuk, kategoriData } = useAppContext();
  const [suratType, setSuratType] = useState('keluar'); // 'keluar', 'masuk', or 'both'
  const [periode, setPeriode] = useState('bulan-ini');
  const [tanggalDari, setTanggalDari] = useState('');
  const [tanggalSampai, setTanggalSampai] = useState('');
  const [kategori, setKategori] = useState('');
  const [showCustomDate, setShowCustomDate] = useState(false);
  const [laporanData, setLaporanData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [chartLoading, setChartLoading] = useState(false);
  
  // Refs for chart instances
  const trendChartRef = useRef<Chart | null>(null);
  const kategoriChartRef = useRef<Chart | null>(null);
  const harianChartRef = useRef<Chart | null>(null);
  
  // Refs for canvas elements
  const trendCanvasRef = useRef<HTMLCanvasElement>(null);
  const kategoriCanvasRef = useRef<HTMLCanvasElement>(null);
  const harianCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Set default period to current month
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    setTanggalDari(firstDay.toISOString().split('T')[0]);
    setTanggalSampai(lastDay.toISOString().split('T')[0]);
    
    // Cleanup function to destroy charts when component unmounts
    return () => {
      if (trendChartRef.current) {
        trendChartRef.current.destroy();
      }
      if (kategoriChartRef.current) {
        kategoriChartRef.current.destroy();
      }
      if (harianChartRef.current) {
        harianChartRef.current.destroy();
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
      // Untuk surat masuk, kita bisa menggunakan pengirim sebagai "creator"
      const creator = suratItem.pembuat || suratItem.pengirim || 'Tidak Diketahui';
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
        totalSuratKeluar: 0,
        totalSuratMasuk: 0,
        rataRata: 0,
        kategoriTop: '-',
        bulanTop: '-'
      };
    }
    
    // Total surat
    const totalSurat = data.length;
    const totalSuratKeluar = data.filter(item => item.type === 'keluar' || !item.type).length;
    const totalSuratMasuk = data.filter(item => item.type === 'masuk').length;
    
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
    
    // Kategori terbanyak (hanya untuk surat keluar)
    const kategoriCount = data.reduce((acc: any, suratItem) => {
      // Hanya hitung kategori untuk surat keluar
      if (suratItem.type === 'keluar' || !suratItem.type) {
        const kategoriName = kategoriData[suratItem.kategori]?.name || suratItem.kategori || 'Tidak Diketahui';
        acc[kategoriName] = (acc[kategoriName] || 0) + 1;
      }
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
      totalSuratKeluar,
      totalSuratMasuk,
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
        // Format bulan sebagai "MM-YY" untuk sorting yang lebih mudah
        const monthKey = date.toLocaleDateString('id-ID', { month: '2-digit', year: '2-digit' });
        monthlyData[monthKey] = (monthlyData[monthKey] || 0) + 1;
      } catch (error) {
        console.error('Error processing date:', suratItem.tanggal, error);
      }
    });
    
    // Urutkan labels berdasarkan tanggal
    const sortedLabels = Object.keys(monthlyData).sort((a, b) => {
      // Konversi label bulan ke objek Date untuk sorting
      const [monthA, yearA] = a.split('-');
      const [monthB, yearB] = b.split('-');
      const dateA = new Date(parseInt(`20${yearA}`), parseInt(monthA) - 1);
      const dateB = new Date(parseInt(`20${yearB}`), parseInt(monthB) - 1);
      return dateA.getTime() - dateB.getTime();
    });
    
    const labels = sortedLabels;
    const values = sortedLabels.map(label => Number(monthlyData[label])) as number[];
    
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
    const values = Object.values(kategoriCount).map(val => Number(val)) as number[];
    
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
        // Format hari sebagai "DD/MM" untuk label
        const dayKey = date.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit' });
        dailyData[dayKey] = (dailyData[dayKey] || 0) + 1;
      } catch (error) {
        console.error('Error processing date:', suratItem.tanggal, error);
      }
    });
    
    // Urutkan berdasarkan tanggal
    const sortedEntries = Object.entries(dailyData).sort((a, b) => {
      const [dayA] = a;
      const [dayB] = b;
      // Konversi label hari ke objek Date untuk sorting
      const [dayNumA, monthA] = dayA.split('/');
      const [dayNumB, monthB] = dayB.split('/');
      const dateA = new Date(new Date().getFullYear(), parseInt(monthA) - 1, parseInt(dayNumA));
      const dateB = new Date(new Date().getFullYear(), parseInt(monthB) - 1, parseInt(dayNumB));
      return dateA.getTime() - dateB.getTime();
    });
    
    const labels = sortedEntries.map(([day]) => day);
    const values = sortedEntries.map(([, count]) => Number(count)) as number[];
    
    return { labels, values };
  };

  // Fungsi untuk membuat atau memperbarui chart
  const createOrUpdateChart = (canvasRef: HTMLCanvasElement | null, chartRef: React.MutableRefObject<Chart | null>, type: string, data: any, options: any) => {
    if (!canvasRef) return;
    
    const ctx = canvasRef.getContext('2d');
    if (!ctx) return;
    
    // Hancurkan chart yang ada jika ada
    if (chartRef.current) {
      chartRef.current.destroy();
    }
    
    // Buat chart baru
    chartRef.current = new Chart(ctx, {
      type,
      data,
      options
    });
  };

  // Fungsi untuk membuat trend chart
  const createTrendChart = (labels: string[], values: number[]) => {
    createOrUpdateChart(
      trendCanvasRef.current,
      trendChartRef,
      'line',
      {
        labels: labels,
        datasets: [{
          label: 'Jumlah Surat',
          data: values,
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderWidth: 3,
          pointBackgroundColor: '#3b82f6',
          pointRadius: 5,
          pointHoverRadius: 7,
          fill: true,
          tension: 0.3
        }]
      },
      {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleFont: {
              size: 14,
              weight: 'bold'
            },
            bodyFont: {
              size: 13
            },
            padding: 12,
            displayColors: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            },
            ticks: {
              stepSize: 1,
              precision: 0
            }
          },
          x: {
            grid: {
              display: false
            }
          }
        }
      }
    );
  };

  // Fungsi untuk membuat kategori chart
  const createKategoriChart = (labels: string[], values: number[]) => {
    // Generate colors dynamically
    const backgroundColors = [
      '#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', 
      '#ef4444', '#06b6d4', '#8b5cf6', '#ec4899'
    ];
    
    // Extend colors if we have more categories than colors
    const extendedColors = [...backgroundColors];
    while (extendedColors.length < labels.length) {
      extendedColors.push(...backgroundColors);
    }

    createOrUpdateChart(
      kategoriCanvasRef.current,
      kategoriChartRef,
      'doughnut',
      {
        labels: labels,
        datasets: [{
          data: values,
          backgroundColor: extendedColors.slice(0, labels.length),
          borderWidth: 0,
          hoverOffset: 15
        }]
      },
      {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 20,
              usePointStyle: true,
              pointStyle: 'circle'
            }
          },
          tooltip: {
            callbacks: {
              label: function(context: any) {
                const total = context.dataset.data.reduce((acc: number, val: number) => acc + val, 0);
                const percentage = Math.round((context.raw / total) * 100);
                return `${context.label}: ${context.raw} (${percentage}%)`;
              }
            },
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleFont: {
              size: 14,
              weight: 'bold'
            },
            bodyFont: {
              size: 13
            },
            padding: 12
          }
        },
        cutout: '65%'
      }
    );
  };

  // Fungsi untuk membuat harian chart
  const createHarianChart = (labels: string[], values: number[]) => {
    createOrUpdateChart(
      harianCanvasRef.current,
      harianChartRef,
      'bar',
      {
        labels: labels,
        datasets: [{
          label: 'Jumlah Surat',
          data: values,
          backgroundColor: '#10b981',
          borderColor: '#059669',
          borderWidth: 1,
          borderRadius: 4,
          barPercentage: 0.6
        }]
      },
      {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleFont: {
              size: 14,
              weight: 'bold'
            },
            bodyFont: {
              size: 13
            },
            padding: 12,
            displayColors: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            },
            ticks: {
              stepSize: 1,
              precision: 0
            }
          },
          x: {
            grid: {
              display: false
            }
          }
        }
      }
    );
  };

  // Fungsi untuk menggambar chart
  const drawCharts = (data: any[]) => {
    try {
      // Buat trend chart
      const { labels: trendLabels, values: trendValues } = generateTrendData(data);
      console.log('Trend data:', { trendLabels, trendValues }); // Untuk debugging
      if (trendLabels.length > 0 && trendValues.length > 0) {
        // Tambahkan sedikit delay untuk memastikan canvas siap
        setTimeout(() => {
          createTrendChart(trendLabels, trendValues);
        }, 100);
      }
      
      // Buat kategori chart
      const { labels: kategoriLabels, values: kategoriValues } = generateKategoriData(data);
      console.log('Kategori data:', { kategoriLabels, kategoriValues }); // Untuk debugging
      if (kategoriLabels.length > 0 && kategoriValues.length > 0) {
        // Tambahkan sedikit delay untuk memastikan canvas siap
        setTimeout(() => {
          createKategoriChart(kategoriLabels, kategoriValues);
        }, 100);
      }
      
      // Buat harian chart
      const { labels: harianLabels, values: harianValues } = generateHarianData(data);
      console.log('Harian data:', { harianLabels, harianValues }); // Untuk debugging
      if (harianLabels.length > 0 && harianValues.length > 0) {
        // Tambahkan sedikit delay untuk memastikan canvas siap
        setTimeout(() => {
          createHarianChart(harianLabels, harianValues);
        }, 100);
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
    
    let filteredData = [];
    
    // Filter data based on surat type
    if (suratType === 'keluar' || suratType === 'both') {
      // Filter surat keluar data based on period and category
      const keluarData = surat.filter(suratItem => {
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
        
        // Add type identifier for combined data
        if (match) {
          suratItem.type = 'keluar';
        }
        
        return match;
      });
      
      filteredData = [...filteredData, ...keluarData];
    }
    
    if (suratType === 'masuk' || suratType === 'both') {
      // Filter surat masuk data based on period
      const masukData = suratMasuk.filter(suratItem => {
        const suratDate = new Date(suratItem.tanggal);
        const startDate = new Date(tanggalDari);
        const endDate = new Date(tanggalSampai);
        
        // Periksa apakah tanggal valid
        if (isNaN(suratDate.getTime()) || isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
          return false;
        }
        
        let match = suratDate >= startDate && suratDate <= endDate;
        
        // Add type identifier for combined data
        if (match) {
          suratItem.type = 'masuk';
        }
        
        return match;
      });
      
      filteredData = [...filteredData, ...masukData];
    }
    
    setLaporanData(filteredData);
    
    // Gambar chart
    setTimeout(() => {
      drawCharts(filteredData);
      setLoading(false);
      setChartLoading(false);
    }, 300);
  };

  // Removed export functionality as requested

  // Get top creators for display
  const topCreators = getTopCreators(laporanData);

  // Effect untuk menggambar chart ketika laporanData berubah
  useEffect(() => {
    if (laporanData.length > 0) {
      // Gambar chart dengan delay kecil untuk memastikan DOM siap
      const timer = setTimeout(() => {
        drawCharts(laporanData);
      }, 200);
      
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

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Jenis Surat</label>
              <select 
                value={suratType}
                onChange={(e) => setSuratType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="keluar">Surat Keluar</option>
                <option value="masuk">Surat Masuk</option>
                <option value="both">Keduanya</option>
              </select>
            </div>
            
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
                  <p className="text-green-100 text-sm font-medium mb-2">
                    {suratType === 'keluar' ? 'Surat Keluar' : 
                     suratType === 'masuk' ? 'Surat Masuk' : 'Rata-rata/Bulan'}
                  </p>
                  <p className="text-3xl font-bold">
                    {suratType === 'keluar' ? generateStats(laporanData).totalSuratKeluar :
                     suratType === 'masuk' ? generateStats(laporanData).totalSuratMasuk :
                     generateStats(laporanData).rataRata}
                  </p>
                </div>
                <div className="bg-white/20 rounded-xl p-3">
                  <i className={`fas ${suratType === 'keluar' ? 'fa-paper-plane' : 
                                      suratType === 'masuk' ? 'fa-envelope-open-text' : 
                                      'fa-chart-line'} text-2xl`}></i>
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
                <canvas ref={trendCanvasRef}></canvas>
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
                <canvas ref={kategoriCanvasRef}></canvas>
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
            {/* Top Pembuat/Pengirim Surat */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-800">
                  {suratType === 'masuk' ? 'Top Pengirim Surat' : 'Top Pembuat Surat'}
                </h3>
                <div className="bg-green-100 p-2 rounded-lg">
                  <i className={`fas ${suratType === 'masuk' ? 'fa-user-friends' : 'fa-users'} text-green-600`}></i>
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
                {topCreators.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    Tidak ada data pembuat/pengirim
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
                <canvas ref={harianCanvasRef}></canvas>
              </div>
            </div>
          </div>
        )}

        {/* Info Laporan */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-800">Informasi Laporan</h3>
              <p className="text-gray-600 text-sm mt-1">
                {suratType === 'keluar' 
                  ? 'Laporan Surat Keluar' 
                  : suratType === 'masuk' 
                    ? 'Laporan Surat Masuk' 
                    : 'Gabungan Laporan Surat Keluar & Masuk'}
              </p>
            </div>
            <div className="bg-gray-100 p-3 rounded-full">
              <i className={`fas ${suratType === 'keluar' ? 'fa-paper-plane' : suratType === 'masuk' ? 'fa-envelope-open-text' : 'fa-exchange-alt'} text-gray-600`}></i>
            </div>
          </div>
        </div>

        {/* Tabel Detail */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-800">
              Detail Surat ({suratType === 'keluar' ? 'Keluar' : suratType === 'masuk' ? 'Masuk' : 'Keluar & Masuk'}) ({laporanData.length} data)
            </h3>
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
                    <th className="px-4 lg:px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {suratType === 'masuk' ? 'Pengirim' : 'Tujuan'}
                    </th>
                    <th className="px-4 lg:px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Perihal</th>
                    <th className="px-4 lg:px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pembuat</th>
                    {suratType === 'both' && (
                      <th className="px-4 lg:px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jenis</th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {laporanData.map((suratItem, index) => (
                    <tr key={`${suratItem.type || 'keluar'}-${suratItem.id}-${index}`} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">{index + 1}</td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm font-mono text-blue-600 font-medium">{suratItem.nomor}</td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(suratItem.tanggal)}</td>
                      <td className="px-4 lg:px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                        {suratItem.type === 'masuk' || (suratType === 'masuk' && !suratItem.type) 
                          ? suratItem.pengirim 
                          : suratItem.tujuan}
                      </td>
                      <td className="px-4 lg:px-6 py-4 text-sm text-gray-900 max-w-xs lg:max-w-md truncate">{suratItem.perihal}</td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">{suratItem.pembuat}</td>
                      {suratType === 'both' && (
                        <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            suratItem.type === 'masuk' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {suratItem.type === 'masuk' ? 'Masuk' : 'Keluar'}
                          </span>
                        </td>
                      )}
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