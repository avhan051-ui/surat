'use client';

import { useState, useEffect } from 'react';
import { useAppContext } from '@/app/context/AppContext';
import { showSuccessToast, showErrorToast, showWarningToast, showConfirmationDialog } from '@/lib/sweetalert-utils';
import RouteGuard from '@/app/components/RouteGuard';
import TableSkeleton from '@/app/components/TableSkeleton';

export default function SuratMasukPage() {
  const { suratMasuk, addSuratMasuk, updateSuratMasuk, deleteSuratMasuk, currentUser } = useAppContext();
  const [dataSuratMasuk, setDataSuratMasuk] = useState(suratMasuk);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  
  // Form states
  const [showModal, setShowModal] = useState(false);
  const [editingSuratMasuk, setEditingSuratMasuk] = useState<any>(null);
  const [formData, setFormData] = useState({
    nomor: '',
    tanggal: '',
    pengirim: '',
    perihal: '',
    file: null as File | null,
    fileName: ''
  });
  const [uploadedFile, setUploadedFile] = useState<{ 
    filePath: string; 
    fileName: string; 
    fileType: string; 
    fileSize: number 
  } | null>(null);

  useEffect(() => {
    if (initialLoad) {
      const timer = setTimeout(() => {
        setDataSuratMasuk(suratMasuk);
        setLoading(false);
        setInitialLoad(false);
      }, 50);
  
      return () => clearTimeout(timer);
    } else {
      setDataSuratMasuk(suratMasuk);
      setLoading(false);
    }
  }, [suratMasuk, initialLoad]);

  const handleAddSuratMasuk = () => {
    setEditingSuratMasuk(null);
    setFormData({
      nomor: '',
      tanggal: '',
      pengirim: '',
      perihal: '',
      file: null,
      fileName: ''
    });
    setUploadedFile(null);
    setShowModal(true);
  };

  const handleEditSuratMasuk = (suratMasukItem: any) => {
    setEditingSuratMasuk(suratMasukItem);
    setFormData({
      nomor: suratMasukItem.nomor,
      tanggal: suratMasukItem.tanggal,
      pengirim: suratMasukItem.pengirim,
      perihal: suratMasukItem.perihal,
      file: null,
      fileName: suratMasukItem.fileName || ''
    });
    
    // Set uploaded file info if it exists
    if (suratMasukItem.filePath) {
      setUploadedFile({
        filePath: suratMasukItem.filePath,
        fileName: suratMasukItem.fileName,
        fileType: suratMasukItem.fileType,
        fileSize: suratMasukItem.fileSize
      });
    } else {
      setUploadedFile(null);
    }
    
    setShowModal(true);
  };

  const handleDeleteSuratMasuk = (id: number) => {
    showConfirmationDialog({
      title: 'Apakah Anda yakin?',
      text: 'Data surat masuk yang dihapus tidak dapat dikembalikan!',
      confirmButtonText: 'Ya, hapus!',
      cancelButtonText: 'Batal'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await deleteSuratMasuk(id);
          showSuccessToast('Surat masuk berhasil dihapus.');
        } catch (error) {
          console.error('Error deleting surat masuk:', error);
          showErrorToast('Gagal menghapus surat masuk.');
        }
      }
    });
  };

  const handleFileUpload = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await fetch('/api/upload-surat-masuk', {
        method: 'POST',
        body: formData,
      });
      
      if (response.ok) {
        const result = await response.json();
        return result;
      } else {
        throw new Error('Failed to upload file');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      showErrorToast('Gagal mengunggah file.');
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nomor || !formData.tanggal || !formData.pengirim || !formData.perihal) {
      showWarningToast('Harap lengkapi semua field!');
      return;
    }
    
    try {
      // Handle file upload if a file is selected
      let fileData = {
        filePath: null,
        fileName: null,
        fileType: null,
        fileSize: null
      };
      
      if (formData.file) {
        const uploadResult = await handleFileUpload(formData.file);
        if (uploadResult && uploadResult.success) {
          fileData = {
            filePath: uploadResult.filePath,
            fileName: uploadResult.fileName,
            fileType: uploadResult.fileType,
            fileSize: uploadResult.fileSize
          };
        } else {
          // If file upload fails, we might want to stop the submission
          return;
        }
      } else if (uploadedFile) {
        // If editing and no new file is selected, keep the existing file data
        fileData = {
          filePath: uploadedFile.filePath,
          fileName: uploadedFile.fileName,
          fileType: uploadedFile.fileType,
          fileSize: uploadedFile.fileSize
        };
      }
      
      const suratData = {
        nomor: formData.nomor,
        tanggal: formData.tanggal,
        pengirim: formData.pengirim,
        perihal: formData.perihal,
        ...fileData
      };
      
      if (editingSuratMasuk) {
        // Update existing surat masuk
        await updateSuratMasuk(editingSuratMasuk.id, suratData);
        showSuccessToast('Data surat masuk berhasil diperbarui.');
      } else {
        // Add new surat masuk
        await addSuratMasuk(suratData);
        showSuccessToast('Surat masuk berhasil ditambahkan.');
      }
      
      setShowModal(false);
      setEditingSuratMasuk(null);
      setFormData({
        nomor: '',
        tanggal: '',
        pengirim: '',
        perihal: '',
        file: null,
        fileName: ''
      });
      setUploadedFile(null);
    } catch (error) {
      console.error('Error saving surat masuk:', error);
      showErrorToast('Gagal menyimpan surat masuk.');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <RouteGuard>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Data Surat Masuk</h2>
              <p className="text-gray-600 mt-1">Kelola surat masuk yang diterima</p>
            </div>
            <div className="bg-blue-50 p-3 rounded-full">
              <i className="fas fa-envelope-open-text text-blue-600 text-2xl"></i>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="text-gray-700">
              <p className="text-sm">Total Surat Masuk: <span className="font-semibold">{dataSuratMasuk.length}</span></p>
            </div>
            <button 
              onClick={handleAddSuratMasuk}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2 rounded-lg text-sm transition-all shadow-md"
            >
              <i className="fas fa-plus mr-2"></i>Tambah Surat Masuk
            </button>
          </div>
        </div>

        {/* Data Table Card */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-bold text-gray-800">Daftar Surat Masuk</h3>
          </div>

          {loading ? (
            <TableSkeleton />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 lg:px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No</th>
                    <th className="px-4 lg:px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nomor Surat</th>
                    <th className="px-4 lg:px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                    <th className="px-4 lg:px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pengirim</th>
                    <th className="px-4 lg:px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Perihal</th>
                    <th className="px-4 lg:px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lampiran</th>
                    <th className="px-4 lg:px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {dataSuratMasuk.map((suratMasukItem, index) => (
                    <tr key={suratMasukItem.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">{index + 1}</td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm font-mono text-blue-600 font-medium">{suratMasukItem.nomor}</td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(suratMasukItem.tanggal)}</td>
                      <td className="px-4 lg:px-6 py-4 text-sm text-gray-900 max-w-xs lg:max-w-sm truncate">{suratMasukItem.pengirim}</td>
                      <td className="px-4 lg:px-6 py-4 text-sm text-gray-900 max-w-xs lg:max-w-md truncate">{suratMasukItem.perihal}</td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm">
                        {suratMasukItem.filePath ? (
                          <button 
                            onClick={() => window.open(suratMasukItem.filePath, '_blank')}
                            className="text-blue-600 hover:text-blue-800 mr-3 transition-colors"
                            title="Lihat/Lampiran"
                          >
                            <i className="fas fa-file-download"></i>
                          </button>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button 
                          onClick={() => handleEditSuratMasuk(suratMasukItem)}
                          className="text-blue-600 hover:text-blue-800 mr-3 transition-colors"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button 
                          onClick={() => handleDeleteSuratMasuk(suratMasukItem.id)}
                          className="text-red-600 hover:text-red-800 transition-colors"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {dataSuratMasuk.length === 0 && (
                <div className="text-center py-12">
                  <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <i className="fas fa-inbox text-gray-400 text-2xl"></i>
                  </div>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">Tidak ada data surat masuk</h4>
                  <p className="text-gray-500">Silakan tambah surat masuk baru</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Add/Edit Surat Masuk Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold text-gray-800">
                    {editingSuratMasuk ? 'Edit Surat Masuk' : 'Tambah Surat Masuk'}
                  </h3>
                  <button 
                    onClick={() => setShowModal(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <i className="fas fa-times text-xl"></i>
                  </button>
                </div>
              </div>

              <div className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nomor Surat *</label>
                    <input 
                      type="text" 
                      value={formData.nomor}
                      onChange={(e) => setFormData({...formData, nomor: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal Surat *</label>
                    <input 
                      type="date" 
                      value={formData.tanggal}
                      onChange={(e) => setFormData({...formData, tanggal: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Pengirim *</label>
                    <input 
                      type="text" 
                      value={formData.pengirim}
                      onChange={(e) => setFormData({...formData, pengirim: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Perihal *</label>
                    <textarea 
                      value={formData.perihal}
                      onChange={(e) => setFormData({...formData, perihal: e.target.value})}
                      rows={3} 
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                      required
                    ></textarea>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Lampiran Surat</label>
                    <div className="flex items-center space-x-4">
                      <input 
                        type="file" 
                        id="file-upload"
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          setFormData({
                            ...formData,
                            file: file,
                            fileName: file ? file.name : ''
                          });
                        }}
                        className="hidden"
                        accept=".pdf,.jpg,.jpeg,.png"
                      />
                      <label 
                        htmlFor="file-upload"
                        className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg transition-colors"
                      >
                        <i className="fas fa-upload mr-2"></i>Pilih File
                      </label>
                      <span className="text-sm text-gray-600 truncate">
                        {formData.fileName || 'Tidak ada file dipilih'}
                      </span>
                    </div>
                    {uploadedFile && !formData.file && (
                      <div className="mt-2 flex items-center justify-between bg-blue-50 p-2 rounded">
                        <div className="flex items-center">
                          <i className="fas fa-file mr-2 text-blue-500"></i>
                          <span className="text-sm text-gray-700">{uploadedFile.fileName}</span>
                        </div>
                        <button 
                          type="button"
                          onClick={() => setUploadedFile(null)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      </div>
                    )}
                    {formData.file && (
                      <div className="mt-2 flex items-center justify-between bg-green-50 p-2 rounded">
                        <div className="flex items-center">
                          <i className="fas fa-file mr-2 text-green-500"></i>
                          <span className="text-sm text-gray-700">{formData.file.name}</span>
                        </div>
                        <button 
                          type="button"
                          onClick={() => setFormData({...formData, file: null, fileName: ''})}
                          className="text-red-500 hover:text-red-700"
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                    <button 
                      type="button" 
                      onClick={() => setShowModal(false)}
                      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Batal
                    </button>
                    <button 
                      type="submit" 
                      className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg"
                    >
                      <i className="fas fa-save mr-2"></i>{editingSuratMasuk ? 'Simpan Perubahan' : 'Simpan'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </RouteGuard>
  );
}