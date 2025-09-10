'use client';

import { useState, useEffect } from 'react';
import { useAppContext } from '@/app/context/AppContext';
import { showSuccessToast, showErrorToast, showWarningToast, showConfirmationDialog } from '@/lib/sweetalert-utils';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

export default function DataSuratPage() {
  const { surat, kategoriData, deleteSurat, updateSurat, users } = useAppContext();
  const [dataSurat, setDataSurat] = useState(surat);
  const [filterKategori, setFilterKategori] = useState('');
  const [filterTanggalDari, setFilterTanggalDari] = useState('');
  const [filterTanggalSampai, setFilterTanggalSampai] = useState('');
  const [filterTujuan, setFilterTujuan] = useState('');
  const [editingSurat, setEditingSurat] = useState<any>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editSubKategori, setEditSubKategori] = useState('');
  const [editRincian, setEditRincian] = useState('');
  
  // Extract nomor urut from nomor surat for editing
  const extractNomorUrut = (nomorSurat: string) => {
    const parts = nomorSurat.split('/');
    return parts.length > 1 ? parts[1] : '';
  };
  
  // State to store nomor urut for editing
  const [editNomorUrut, setEditNomorUrut] = useState('');

  // Parse nomor surat to extract category information
  const parseNomorSurat = (nomorSurat: string) => {
    if (!nomorSurat) return { kategori: '', subKategori: '', rincian: '' };
    
    // Extract the category part from nomor surat (before the first slash)
    const categoryPart = nomorSurat.split('/')[0];
    if (!categoryPart) return { kategori: '', subKategori: '', rincian: '' };
    
    // Split by dots to get kategori.utama.sub.rincian
    const parts = categoryPart.split('.');
    if (parts.length >= 4) {
      // For format like 500.6.1.1, kategori is 500.6 (first two parts)
      return {
        kategori: parts[0] + '.' + parts[1],
        subKategori: parts[2],
        rincian: parts[3]
      };
    }
    return { kategori: '', subKategori: '', rincian: '' };
  };

  useEffect(() => {
    setDataSurat(surat);
  }, [surat]);

  // Effect to update sub-kategori and rincian when editingSurat changes
  useEffect(() => {
    if (editingSurat && showEditModal) {
      const { kategori, subKategori, rincian } = parseNomorSurat(editingSurat.nomor);
      // Only update if we have parsed values and they're different from current state
      if (kategori && editingSurat.kategori !== kategori) {
        setEditingSurat(prev => ({ ...prev, kategori }));
      }
      if (editSubKategori !== (subKategori || '')) {
        setEditSubKategori(subKategori || '');
      }
      if (editRincian !== (rincian || '')) {
        setEditRincian(rincian || '');
      }
      // Extract and set nomor urut only if not already set
      if (!editNomorUrut) {
        setEditNomorUrut(extractNomorUrut(editingSurat.nomor));
      }
    }
  }, [editingSurat?.nomor, showEditModal]);

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
    if (dataSurat.length === 0) {
      showWarningToast('Tidak ada data surat untuk di-export');
      return;
    }

    const doc = new jsPDF('landscape');
    
    // Add title
    doc.setFontSize(18);
    doc.text('Laporan Data Surat Keluar', 14, 20);
    
    // Add date
    const today = new Date().toLocaleDateString('id-ID');
    doc.setFontSize(12);
    doc.text(`Tanggal: ${today}`, 14, 30);
    
    // Add table
    autoTable(doc, {
      head: [['No', 'Nomor Surat', 'Tanggal', 'Tujuan', 'Perihal', 'Pembuat']],
      body: dataSurat.map((suratItem, index) => [
        index + 1,
        suratItem.nomor,
        formatDate(suratItem.tanggal),
        suratItem.tujuan,
        suratItem.perihal,
        suratItem.pembuat
      ]),
      startY: 40,
      styles: {
        fontSize: 8
      },
      headStyles: {
        fillColor: [22, 160, 133],
        textColor: 255
      },
      alternateRowStyles: {
        fillColor: [240, 240, 240]
      }
    });
    
    // Save the PDF
    doc.save(`laporan-surat-keluar-${today}.pdf`);
    
    showSuccessToast('Data surat berhasil di-export ke PDF');
  };

  const handleExportExcel = () => {
    if (dataSurat.length === 0) {
      showWarningToast('Tidak ada data surat untuk di-export');
      return;
    }

    // Create worksheet data
    const ws_data = [
      ['No', 'Nomor Surat', 'Tanggal', 'Tujuan', 'Perihal', 'Pembuat']
    ];
    
    dataSurat.forEach((suratItem, index) => {
      ws_data.push([
        index + 1,
        suratItem.nomor,
        formatDate(suratItem.tanggal),
        suratItem.tujuan,
        suratItem.perihal,
        suratItem.pembuat
      ]);
    });
    
    // Create worksheet
    const ws = XLSX.utils.aoa_to_sheet(ws_data);
    
    // Set column widths
    ws['!cols'] = [
      { wch: 5 },   // No
      { wch: 25 },  // Nomor Surat
      { wch: 15 },  // Tanggal
      { wch: 30 },  // Tujuan
      { wch: 40 },  // Perihal
      { wch: 20 }   // Pembuat
    ];
    
    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Data Surat Keluar');
    
    // Generate filename
    const today = new Date().toLocaleDateString('id-ID').replace(/\//g, '-');
    const filename = `data-surat-keluar-${today}.xlsx`;
    
    // Export to Excel
    XLSX.writeFile(wb, filename);
    
    showSuccessToast('Data surat berhasil di-export ke Excel');
  };

  const handleEdit = (suratItem: any) => {
    // Parse category information from nomor surat
    const { kategori, subKategori, rincian } = parseNomorSurat(suratItem.nomor);
    
    // Format tanggal untuk input date (YYYY-MM-DD)
    let formattedDate = '';
    if (suratItem.tanggal) {
      // Jika tanggal sudah dalam format YYYY-MM-DD, gunakan langsung
      if (suratItem.tanggal.match(/^\d{4}-\d{2}-\d{2}$/)) {
        formattedDate = suratItem.tanggal;
      } else {
        // Jika tanggal dalam format lain, konversi ke YYYY-MM-DD
        const dateObj = new Date(suratItem.tanggal);
        if (!isNaN(dateObj.getTime())) {
          formattedDate = dateObj.toISOString().split('T')[0];
        }
      }
    }
    
    // Initialize form with surat data
    setEditingSurat({
      ...suratItem,
      tanggal: formattedDate
    });
    
    // Set the sub-category and rincian states
    setEditSubKategori(subKategori || '');
    setEditRincian(rincian || '');
    
    // Extract and set nomor urut
    setEditNomorUrut(extractNomorUrut(suratItem.nomor));
    
    setShowEditModal(true);
  };

  const handleDelete = (id: number) => {
    showConfirmationDialog({
      title: 'Apakah Anda yakin?',
      text: 'Data surat yang dihapus tidak dapat dikembalikan!',
      confirmButtonText: 'Ya, hapus!',
      cancelButtonText: 'Batal'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          // Delete surat via API
          const response = await fetch(`/api/surat?id=${id}`, {
            method: 'DELETE',
          });

          if (!response.ok) {
            const errorText = await response.text();
            console.error('API Error Response:', errorText);
            throw new Error(`Failed to delete surat: ${response.status} ${response.statusText}`);
          }

          // Delete surat in context
          await deleteSurat(id);
          
          showSuccessToast('Surat berhasil dihapus.');
        } catch (error) {
          console.error('Error deleting surat:', error);
          showErrorToast(`Gagal menghapus surat: ${error.message}`);
        }
      }
    });
  };

  const handleUpdateSurat = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingSurat) return;
    
    try {
      // Generate nomor surat otomatis
      const tahun = editingSurat.tanggal ? new Date(editingSurat.tanggal).getFullYear() : new Date().getFullYear();
      const generatedNomor = `${editingSurat.kategori || 'XXX'}.${editSubKategori || 'X'}.${editRincian || 'X'}/${editNomorUrut || 'XXX'}/${tahun}`;
      
      // Create updated surat object with fullKategori and generated nomor
      const updatedSurat = {
        ...editingSurat,
        nomor: generatedNomor,
        fullKategori: `${editingSurat.kategori}.${editSubKategori}.${editRincian}`
      };

      // Update surat via API
      const response = await fetch('/api/surat', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedSurat),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`Failed to update surat: ${response.status} ${response.statusText}`);
      }

      // Update surat in context
      await updateSurat(editingSurat.id, updatedSurat);
      
      showSuccessToast('Data surat berhasil diperbarui.');
      setShowEditModal(false);
      setEditingSurat(null);
      setEditSubKategori('');
      setEditRincian('');
      setEditNomorUrut('');
    } catch (error) {
      console.error('Error updating surat:', error);
      showErrorToast(`Gagal memperbarui surat: ${error.message}`);
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
                      onClick={() => handleEdit(suratItem)}
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

      {/* Edit Surat Modal */}
      {showEditModal && editingSurat && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-800">Edit Surat Keluar</h3>
                <button 
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <i className="fas fa-times text-xl"></i>
                </button>
              </div>
            </div>

            <div className="p-6">
              <form onSubmit={handleUpdateSurat} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nomor Surat</label>
                    <input 
                      type="text" 
                      value={`${editingSurat.kategori || 'XXX'}.${editSubKategori || 'X'}.${editRincian || 'X'}/${editNomorUrut || 'XXX'}${editingSurat.tanggal ? `/${new Date(editingSurat.tanggal).getFullYear()}` : ''}`}
                      onChange={(e) => {
                        // Extract nomor urut from the input
                        const parts = e.target.value.split('/');
                        if (parts.length > 1) {
                          setEditNomorUrut(parts[1]);
                        }
                      }}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100" 
                      required
                      readOnly
                    />
                    <p className="mt-1 text-xs text-gray-500">Nomor surat otomatis berdasarkan kategori yang dipilih</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nomor Urut</label>
                    <input 
                      type="text" 
                      value={editNomorUrut}
                      onChange={(e) => setEditNomorUrut(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                      required
                      placeholder="001"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal Surat</label>
                  <input 
                    type="date" 
                    value={editingSurat.tanggal}
                    onChange={(e) => setEditingSurat({...editingSurat, tanggal: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tujuan Surat</label>
                  <input 
                    type="text" 
                    value={editingSurat.tujuan}
                    onChange={(e) => setEditingSurat({...editingSurat, tujuan: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Perihal/Keterangan</label>
                  <textarea 
                    value={editingSurat.perihal}
                    onChange={(e) => setEditingSurat({...editingSurat, perihal: e.target.value})}
                    rows={3} 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    required
                  ></textarea>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Kategori Utama</label>
                    <select 
                      value={editingSurat?.kategori || ''}
                      onChange={(e) => {
                        setEditingSurat(prev => ({...prev, kategori: e.target.value}));
                        setEditSubKategori(''); // Reset sub-kategori when main category changes
                        setEditRincian(''); // Reset rincian when main category changes
                      }}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                      required
                    >
                      <option value="">Pilih Kategori</option>
                      {Object.entries(kategoriData).map(([key, value]) => (
                        <option key={key} value={key}>
                          {key} - {value.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Sub Kategori</label>
                    <select 
                      value={editSubKategori}
                      onChange={(e) => {
                        setEditSubKategori(e.target.value);
                        setEditRincian(''); // Reset rincian when sub-category changes
                      }}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                      required
                      disabled={!editingSurat?.kategori}
                    >
                      <option value="">Pilih Sub Kategori</option>
                      {editingSurat?.kategori && kategoriData[editingSurat.kategori]?.sub && 
                        Object.entries(kategoriData[editingSurat.kategori].sub).map(([key, value]: [string, any]) => (
                          <option key={key} value={key}>
                            {key} - {value.name}
                          </option>
                        ))
                      }
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Rincian</label>
                    <select 
                      value={editRincian}
                      onChange={(e) => setEditRincian(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                      required
                      disabled={!editSubKategori}
                    >
                      <option value="">Pilih Rincian</option>
                      {editingSurat?.kategori && editSubKategori && 
                       kategoriData[editingSurat.kategori]?.sub?.[editSubKategori]?.rincian &&
                        Object.entries(kategoriData[editingSurat.kategori].sub[editSubKategori].rincian).map(([key, value]: [string, any]) => (
                          <option key={key} value={key}>
                            {key} - {value}
                          </option>
                        ))
                      }
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Pembuat Surat</label>
                    <select 
                      value={editingSurat.pembuatId}
                      onChange={(e) => {
                        const userId = parseInt(e.target.value);
                        const user = users.find(u => u.id === userId);
                        if (user) {
                          setEditingSurat({
                            ...editingSurat,
                            pembuatId: userId,
                            pembuat: user.nama
                          });
                        }
                      }}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                      required
                    >
                      <option value="">Pilih Pembuat</option>
                      {users.map(user => (
                        <option key={user.id} value={user.id}>
                          {user.nama} - {user.jabatan}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                  <button 
                    type="button" 
                    onClick={() => setShowEditModal(false)}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Batal
                  </button>
                  <button 
                    type="submit" 
                    className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg"
                  >
                    <i className="fas fa-save mr-2"></i>Simpan Perubahan
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}