'use client';

import { useState, useEffect } from 'react';
import { useAppContext } from '@/app/context/AppContext';

export default function DataSuratPage() {
  const { surat, kategoriData, deleteSurat } = useAppContext();
  const [dataSurat, setDataSurat] = useState(surat);
  const [filterKategori, setFilterKategori] = useState('');
  const [filterTanggalDari, setFilterTanggalDari] = useState('');
  const [filterTanggalSampai, setFilterTanggalSampai] = useState('');
  const [filterTujuan, setFilterTujuan] = useState('');

  useEffect(() => {
    setDataSurat(surat);
  }, [surat]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const handleFilter = () => {
    let filteredData = [...surat];
    
    if (filterKategori) {
      filteredData = filteredData.filter(suratItem => suratItem.kategori === filterKategori);
    }
    
    if (filterTanggalDari) {
      filteredData = filteredData.filter(suratItem => suratItem.tanggal >= filterTanggalDari);
    }
    
    if (filterTanggalSampai) {
      filteredData = filteredData.filter(suratItem => suratItem.tanggal <= filterTanggalSampai);
    }
    
    if (filterTujuan) {
      filteredData = filteredData.filter(suratItem => 
        suratItem.tujuan.toLowerCase().includes(filterTujuan.toLowerCase())
      );
    }
    
    setDataSurat(filteredData);
  };

  const handleExportPDF = () => {
    alert('Export PDF functionality would be implemented here');
  };

  const handleExportExcel = () => {
    alert('Export Excel functionality would be implemented here');
  };

  const handleEdit = (id: number) => {
    alert(`Edit surat with ID: ${id}`);
  };

  const handleDelete = (id: number) => {
    if (confirm('Apakah Anda yakin ingin menghapus surat ini?')) {
      deleteSurat(id);
      alert('Surat berhasil dihapus!');
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Filter Card */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-gray-800">Filter & Pencarian</h3>
            <p className="text-gray-600 text-sm mt-1">Gunakan filter untuk mencari data surat</p>
          </div>
          <div className="bg-green-50 p-3 rounded-full">
            <i className="fas fa-filter text-green-600"></i>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 lg:gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Kategori</label>
            <select 
              value={filterKategori}
              onChange={(e) => setFilterKategori(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Semua Kategori</option>
              {Object.entries(kategoriData).map(([key, value]) => (
                <option key={key} value={key}>
                  {key} - {value.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal Dari</label>
            <input 
              type="date" 
              value={filterTanggalDari}
              onChange={(e) => setFilterTanggalDari(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal Sampai</label>
            <input 
              type="date" 
              value={filterTanggalSampai}
              onChange={(e) => setFilterTanggalSampai(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tujuan</label>
            <input 
              type="text" 
              value={filterTujuan}
              onChange={(e) => setFilterTujuan(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" 
              placeholder="Cari tujuan..."
            />
          </div>
          <div className="flex items-end">
            <button 
              onClick={handleFilter}
              className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-4 py-2 rounded-lg text-sm transition-all"
            >
              <i className="fas fa-search mr-1"></i>Cari
            </button>
          </div>
        </div>
      </div>

      {/* Data Table Card */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="text-lg font-bold text-gray-800">Data Surat Keluar</h3>
              <p className="text-gray-600 text-sm mt-1">Daftar semua surat keluar yang telah dibuat</p>
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
            </div>
          </div>
        </div>

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
                <th className="px-4 lg:px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {dataSurat.map((suratItem, index) => (
                <tr key={suratItem.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">{index + 1}</td>
                  <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm font-mono text-blue-600 font-medium">{suratItem.nomor}</td>
                  <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(suratItem.tanggal)}</td>
                  <td className="px-4 lg:px-6 py-4 text-sm text-gray-900 max-w-xs lg:max-w-sm truncate">{suratItem.tujuan}</td>
                  <td className="px-4 lg:px-6 py-4 text-sm text-gray-900 max-w-xs lg:max-w-md truncate">{suratItem.perihal}</td>
                  <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">{suratItem.pembuat}</td>
                  <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button 
                      onClick={() => handleEdit(suratItem.id)}
                      className="text-blue-600 hover:text-blue-800 mr-3 transition-colors"
                    >
                      <i className="fas fa-edit"></i>
                    </button>
                    <button 
                      onClick={() => handleDelete(suratItem.id)}
                      className="text-red-600 hover:text-red-800 transition-colors"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}