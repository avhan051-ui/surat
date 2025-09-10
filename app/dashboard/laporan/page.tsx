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
    const creatorCount: any = {};
    data.forEach(suratItem => {
      creatorCount[suratItem.pembuat] = (creatorCount[suratItem.pembuat] || 0) + 1;
    });
    
    return Object.entries(creatorCount)
      .sort((a: any, b: any) => b[1] - a[1])
      .slice(0, 5)
      .map(([creator, count]) => ({ creator, count }));
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
  };

  const handleExportPDF = () => {
    if (laporanData.length === 0) {
      alert('Tidak ada data untuk di-export. Silakan pilih periode dan klik tombol "Generate" terlebih dahulu!');
      return;
    }
    
    // Placeholder stats object
    const stats = {
      totalSurat: laporanData.length,
      rataRata: 0,
      kategoriTop: '',
      bulanTop: ''
    };
    
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
    
    // Placeholder stats object
    const stats = {
      totalSurat: laporanData.length,
      rataRata: 0,
      kategoriTop: '',
      bulanTop: ''
    };
    
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