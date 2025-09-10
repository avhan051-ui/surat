'use client';

import { useState, useEffect } from 'react';
import { useAppContext } from '@/app/context/AppContext';
import { showSuccessToast, showErrorToast, showWarningToast, showConfirmationDialog } from '@/lib/sweetalert-utils';

export default function MasterDataPage() {
  const { kategoriData, updateKategoriData } = useAppContext();
  
  // States for categories
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState<any>(null);
  
  // Form states
  const [newCategory, setNewCategory] = useState({ id: '', name: '' });
  const [newSubCategory, setNewSubCategory] = useState({ id: '', name: '' });
  const [newRincian, setNewRincian] = useState({ id: '', name: '' });
  
  // UI states
  const [activeTab, setActiveTab] = useState('kategori');
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [showAddSubCategoryModal, setShowAddSubCategoryModal] = useState(false);
  const [showAddRincianModal, setShowAddRincianModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Import states
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importPreview, setImportPreview] = useState<any[]>([]);
  const [importStep, setImportStep] = useState<'upload' | 'preview' | 'processing'>('upload');
  const [importStats, setImportStats] = useState<{ success: number; error: number }>({ success: 0, error: 0 });

  // Initialize categories from context
  useEffect(() => {
    const categoriesArray = Object.entries(kategoriData).map(([id, data]) => ({
      id,
      ...data
    }));
    setCategories(categoriesArray);
  }, [kategoriData]);

  // Handle adding a new category
  const handleAddCategory = async () => {
    if (!newCategory.id || !newCategory.name) {
      showWarningToast('ID dan Nama Kategori harus diisi!');
      return;
    }

    // Check if category ID already exists
    if (kategoriData[newCategory.id]) {
      showWarningToast('ID Kategori sudah ada!');
      return;
    }

    setLoading(true);
    try {
      // Create new category object
      const updatedKategoriData = {
        ...kategoriData,
        [newCategory.id]: {
          name: newCategory.name,
          sub: {}
        }
      };
      
      // Update via API
      const response = await fetch('/api/kategori', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedKategoriData),
      });

      if (!response.ok) {
        throw new Error('Failed to add category');
      }

      updateKategoriData(updatedKategoriData);
      showSuccessToast('Kategori berhasil ditambahkan!');
      
      // Reset form and close modal
      setNewCategory({ id: '', name: '' });
      setShowAddCategoryModal(false);
    } catch (error) {
      console.error('Error adding category:', error);
      showErrorToast('Gagal menambahkan kategori!');
    } finally {
      setLoading(false);
    }
  };

  // Handle adding a new sub-category
  const handleAddSubCategory = async () => {
    if (!selectedCategory) {
      showWarningToast('Pilih kategori terlebih dahulu!');
      return;
    }

    if (!newSubCategory.id || !newSubCategory.name) {
      showWarningToast('ID dan Nama Sub-Kategori harus diisi!');
      return;
    }

    // Check if sub-category ID already exists
    if (selectedCategory.sub[newSubCategory.id]) {
      showWarningToast('ID Sub-Kategori sudah ada!');
      return;
    }

    setLoading(true);
    try {
      // Update context
      const updatedKategoriData = { ...kategoriData };
      updatedKategoriData[selectedCategory.id].sub = {
        ...updatedKategoriData[selectedCategory.id].sub,
        [newSubCategory.id]: {
          name: newSubCategory.name,
          rincian: {}
        }
      };
      
      // Update via API
      const response = await fetch('/api/kategori', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedKategoriData),
      });

      if (!response.ok) {
        throw new Error('Failed to add sub-category');
      }

      updateKategoriData(updatedKategoriData);
      showSuccessToast('Sub-Kategori berhasil ditambahkan!');
      
      // Reset form and close modal
      setNewSubCategory({ id: '', name: '' });
      setShowAddSubCategoryModal(false);
    } catch (error) {
      console.error('Error adding sub-category:', error);
      showErrorToast('Gagal menambahkan sub-kategori!');
    } finally {
      setLoading(false);
    }
  };

  // Handle adding a new rincian
  const handleAddRincian = async () => {
    if (!selectedCategory || !selectedSubCategory) {
      showWarningToast('Pilih kategori dan sub-kategori terlebih dahulu!');
      return;
    }

    if (!newRincian.id || !newRincian.name) {
      showWarningToast('ID dan Nama Rincian harus diisi!');
      return;
    }

    // Check if rincian ID already exists
    if (selectedSubCategory.rincian[newRincian.id]) {
      showWarningToast('ID Rincian sudah ada!');
      return;
    }

    setLoading(true);
    try {
      // Update context
      const updatedKategoriData = { ...kategoriData };
      updatedKategoriData[selectedCategory.id].sub[selectedSubCategory.id].rincian = {
        ...updatedKategoriData[selectedCategory.id].sub[selectedSubCategory.id].rincian,
        [newRincian.id]: newRincian.name
      };
      
      // Update via API
      const response = await fetch('/api/kategori', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedKategoriData),
      });

      if (!response.ok) {
        throw new Error('Failed to add rincian');
      }

      updateKategoriData(updatedKategoriData);
      showSuccessToast('Rincian berhasil ditambahkan!');
      
      // Reset form and close modal
      setNewRincian({ id: '', name: '' });
      setShowAddRincianModal(false);
    } catch (error) {
      console.error('Error adding rincian:', error);
      showErrorToast('Gagal menambahkan rincian!');
    } finally {
      setLoading(false);
    }
  };

  // Handle deleting a category
  const handleDeleteCategory = async (categoryId: string) => {
    showConfirmationDialog({
      title: 'Hapus Kategori',
      text: 'Apakah Anda yakin ingin menghapus kategori ini? Semua sub-kategori dan rincian di bawahnya juga akan dihapus.',
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal'
    }).then(async (result) => {
      if (result.isConfirmed) {
        setLoading(true);
        try {
          const updatedKategoriData = { ...kategoriData };
          delete updatedKategoriData[categoryId];
          
          // Update via API
          const response = await fetch('/api/kategori', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedKategoriData),
          });

          if (!response.ok) {
            throw new Error('Failed to delete category');
          }

          updateKategoriData(updatedKategoriData);
          showSuccessToast('Kategori berhasil dihapus!');
          
          // Clear selection if deleted category was selected
          if (selectedCategory && selectedCategory.id === categoryId) {
            setSelectedCategory(null);
            setSelectedSubCategory(null);
          }
        } catch (error) {
          console.error('Error deleting category:', error);
          showErrorToast('Gagal menghapus kategori!');
        } finally {
          setLoading(false);
        }
      }
    });
  };

  // Handle deleting a sub-category
  const handleDeleteSubCategory = async (categoryId: string, subCategoryId: string) => {
    showConfirmationDialog({
      title: 'Hapus Sub-Kategori',
      text: 'Apakah Anda yakin ingin menghapus sub-kategori ini? Semua rincian di bawahnya juga akan dihapus.',
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal'
    }).then(async (result) => {
      if (result.isConfirmed) {
        setLoading(true);
        try {
          const updatedKategoriData = { ...kategoriData };
          delete updatedKategoriData[categoryId].sub[subCategoryId];
          
          // Update via API
          const response = await fetch('/api/kategori', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedKategoriData),
          });

          if (!response.ok) {
            throw new Error('Failed to delete sub-category');
          }

          updateKategoriData(updatedKategoriData);
          showSuccessToast('Sub-Kategori berhasil dihapus!');
          
          // Clear selection if deleted sub-category was selected
          if (selectedSubCategory && selectedSubCategory.id === subCategoryId) {
            setSelectedSubCategory(null);
          }
        } catch (error) {
          console.error('Error deleting sub-category:', error);
          showErrorToast('Gagal menghapus sub-kategori!');
        } finally {
          setLoading(false);
        }
      }
    });
  };




  // Preview import data
  const previewImportData = async (file: File) => {
    try {
      setLoading(true);
      const fileType = file.name.split('.').pop()?.toLowerCase();
      
      if (fileType === 'csv') {
        // Handle CSV file
        const text = await file.text();
        const lines = text.split('\n');
        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        const data = [];
        
        for (let i = 1; i < lines.length; i++) {
          if (lines[i].trim()) {
            const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
            const row: any = {};
            headers.forEach((header, index) => {
              row[header] = values[index] || '';
            });
            data.push(row);
          }
        }
        
        setImportPreview(data);
        setImportStep('preview');
      } else if (fileType === 'xlsx' || fileType === 'xls') {
        // For Excel files, we would need to parse them
        // This is a simplified version - in a real app you would use a library like xlsx
        showWarningToast('Untuk saat ini hanya mendukung file CSV. Silakan konversi file Excel ke CSV terlebih dahulu.');
        setImportFile(null);
      } else {
        showWarningToast('Format file tidak didukung. Gunakan file CSV.');
        setImportFile(null);
      }
    } catch (error) {
      console.error('Error previewing import data:', error);
      showErrorToast('Gagal memproses file import!');
      setImportFile(null);
    } finally {
      setLoading(false);
    }
  };

  // Process import data
  const processImportData = async () => {
    if (importPreview.length === 0) {
      showWarningToast('Tidak ada data untuk diimport!');
      return;
    }
    
    setLoading(true);
    setImportStep('processing');
    
    try {
      // Process the import data
      const updatedKategoriData = { ...kategoriData };
      let successCount = 0;
      let errorCount = 0;
      
      // For simplicity, we'll assume the CSV has columns: kategori_id, kategori_nama, subkategori_id, subkategori_nama, rincian_id, rincian_nama
      for (const row of importPreview) {
        try {
          const kategoriId = row.kategori_id;
          const kategoriNama = row.kategori_nama;
          const subkategoriId = row.subkategori_id;
          const subkategoriNama = row.subkategori_nama;
          const rincianId = row.rincian_id;
          const rincianNama = row.rincian_nama;
          
          // Validate required fields
          if (!kategoriId || !kategoriNama) {
            errorCount++;
            continue;
          }
          
          // Create or update kategori
          if (!updatedKategoriData[kategoriId]) {
            updatedKategoriData[kategoriId] = {
              name: kategoriNama,
              sub: {}
            };
          } else if (updatedKategoriData[kategoriId].name !== kategoriNama) {
            updatedKategoriData[kategoriId].name = kategoriNama;
          }
          
          // Create or update sub-kategori if provided
          if (subkategoriId && subkategoriNama) {
            if (!updatedKategoriData[kategoriId].sub[subkategoriId]) {
              updatedKategoriData[kategoriId].sub[subkategoriId] = {
                name: subkategoriNama,
                rincian: {}
              };
            } else if (updatedKategoriData[kategoriId].sub[subkategoriId].name !== subkategoriNama) {
              updatedKategoriData[kategoriId].sub[subkategoriId].name = subkategoriNama;
            }
            
            // Create or update rincian if provided
            if (rincianId && rincianNama) {
              if (!updatedKategoriData[kategoriId].sub[subkategoriId].rincian[rincianId]) {
                updatedKategoriData[kategoriId].sub[subkategoriId].rincian[rincianId] = rincianNama;
              } else if (updatedKategoriData[kategoriId].sub[subkategoriId].rincian[rincianId] !== rincianNama) {
                updatedKategoriData[kategoriId].sub[subkategoriId].rincian[rincianId] = rincianNama;
              }
            }
          }
          
          successCount++;
        } catch (rowError) {
          console.error('Error processing row:', rowError);
          errorCount++;
        }
      }
      
      // Update via API
      const response = await fetch('/api/kategori', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedKategoriData),
      });

      if (!response.ok) {
        throw new Error('Failed to import data');
      }

      updateKategoriData(updatedKategoriData);
      setImportStats({ success: successCount, error: errorCount });
      showSuccessToast(`Import selesai! ${successCount} data berhasil diimport, ${errorCount} data gagal.`);
    } catch (error) {
      console.error('Error importing data:', error);
      showErrorToast('Gagal mengimport data!');
    } finally {
      setLoading(false);
    }
  };

  // Reset import process
  const resetImport = () => {
    setImportFile(null);
    setImportPreview([]);
    setImportStep('upload');
    setImportStats({ success: 0, error: 0 });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Master Data Kategori</h2>
            <p className="text-gray-600 mt-1">Kelola kategori, sub-kategori, dan rincian klasifikasi surat</p>
          </div>
          <div className="bg-blue-50 p-3 rounded-full">
            <i className="fas fa-database text-blue-600 text-2xl"></i>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('kategori')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'kategori'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Kategori Utama
            </button>
            <button
              onClick={() => selectedCategory && setActiveTab('subkategori')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'subkategori'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              disabled={!selectedCategory}
            >
              Sub-Kategori
            </button>
            <button
              onClick={() => selectedSubCategory && setActiveTab('rincian')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'rincian'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              disabled={!selectedSubCategory}
            >
              Rincian
            </button>
          </nav>
        </div>

        {/* Loading indicator */}
        {loading && (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}

        {/* Kategori Tab */}
        {!loading && activeTab === 'kategori' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-gray-800">Daftar Kategori Utama</h3>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowImportModal(true)}
                  className="bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 text-white px-4 py-2 rounded-lg text-sm transition-all shadow-md"
                >
                  <i className="fas fa-file-import mr-2"></i>Import Data
                </button>
                <button
                  onClick={() => setShowAddCategoryModal(true)}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2 rounded-lg text-sm transition-all shadow-md"
                >
                  <i className="fas fa-plus mr-2"></i>Tambah Kategori
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className={`border rounded-xl p-6 transition-all cursor-pointer ${
                    selectedCategory?.id === category.id
                      ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                      : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                  }`}
                  onClick={() => {
                    setSelectedCategory(category);
                    setSelectedSubCategory(null);
                    setActiveTab('subkategori');
                  }}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-gray-800">{category.id}</h4>
                      <p className="text-gray-600 mt-1">{category.name}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        {Object.keys(category.sub || {}).length} sub-kategori
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCategory(category.id);
                        }}
                        className="text-red-600 hover:text-red-800"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sub-Kategori Tab */}
        {!loading && activeTab === 'subkategori' && selectedCategory && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-bold text-gray-800">
                  Sub-Kategori: {selectedCategory.id} - {selectedCategory.name}
                </h3>
                <p className="text-gray-600 text-sm mt-1">
                  {Object.keys(selectedCategory.sub || {}).length} sub-kategori
                </p>
              </div>
              <button
                onClick={() => setShowAddSubCategoryModal(true)}
                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-4 py-2 rounded-lg text-sm transition-all shadow-md"
              >
                <i className="fas fa-plus mr-2"></i>Tambah Sub-Kategori
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(selectedCategory.sub || {}).map(([subId, subData]: [string, any]) => (
                <div
                  key={subId}
                  className={`border rounded-xl p-6 transition-all cursor-pointer ${
                    selectedSubCategory?.id === subId
                      ? 'border-green-500 bg-green-50 ring-2 ring-green-200'
                      : 'border-gray-200 hover:border-green-300 hover:bg-gray-50'
                  }`}
                  onClick={() => {
                    setSelectedSubCategory({ id: subId, ...subData });
                    setActiveTab('rincian');
                  }}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-gray-800">{subId}</h4>
                      <p className="text-gray-600 mt-1">{subData.name}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        {Object.keys(subData.rincian || {}).length} rincian
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteSubCategory(selectedCategory.id, subId);
                        }}
                        className="text-red-600 hover:text-red-800"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Rincian Tab */}
        {!loading && activeTab === 'rincian' && selectedCategory && selectedSubCategory && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-bold text-gray-800">
                  Rincian: {selectedSubCategory.id} - {selectedSubCategory.name}
                </h3>
                <p className="text-gray-600 text-sm mt-1">
                  {Object.keys(selectedSubCategory.rincian || {}).length} rincian
                </p>
              </div>
              <button
                onClick={() => setShowAddRincianModal(true)}
                className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-4 py-2 rounded-lg text-sm transition-all shadow-md"
              >
                <i className="fas fa-plus mr-2"></i>Tambah Rincian
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(selectedSubCategory.rincian || {}).map(([rincianId, rincianName]) => (
                <div
                  key={rincianId}
                  className="border border-gray-200 rounded-xl p-6 hover:border-purple-300 hover:bg-gray-50 transition-all"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-gray-800">{rincianId}</h4>
                      <p className="text-gray-600 mt-1">{rincianName as string}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteRincian(selectedCategory.id, selectedSubCategory.id, rincianId)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Add Category Modal */}
      {showAddCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-800">Tambah Kategori Baru</h3>
                <button
                  onClick={() => setShowAddCategoryModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ID Kategori</label>
                <input
                  type="text"
                  value={newCategory.id}
                  onChange={(e) => setNewCategory({ ...newCategory, id: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Contoh: 500.6"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nama Kategori</label>
                <input
                  type="text"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Contoh: Pertanian"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowAddCategoryModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                disabled={loading}
              >
                Batal
              </button>
              <button
                onClick={handleAddCategory}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50"
                disabled={loading}
              >
                {loading ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Sub-Category Modal */}
      {showAddSubCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-800">Tambah Sub-Kategori Baru</h3>
                <button
                  onClick={() => setShowAddSubCategoryModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ID Sub-Kategori</label>
                <input
                  type="text"
                  value={newSubCategory.id}
                  onChange={(e) => setNewSubCategory({ ...newSubCategory, id: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Contoh: 1"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nama Sub-Kategori</label>
                <input
                  type="text"
                  value={newSubCategory.name}
                  onChange={(e) => setNewSubCategory({ ...newSubCategory, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Contoh: Kebijakan di Bidang Pertanian"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowAddSubCategoryModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                disabled={loading}
              >
                Batal
              </button>
              <button
                onClick={handleAddSubCategory}
                className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 disabled:opacity-50"
                disabled={loading}
              >
                {loading ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Rincian Modal */}
      {showAddRincianModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-800">Tambah Rincian Baru</h3>
                <button
                  onClick={() => setShowAddRincianModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ID Rincian</label>
                <input
                  type="text"
                  value={newRincian.id}
                  onChange={(e) => setNewRincian({ ...newRincian, id: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Contoh: 1"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nama Rincian</label>
                <input
                  type="text"
                  value={newRincian.name}
                  onChange={(e) => setNewRincian({ ...newRincian, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Contoh: Kebijakan Umum Pertanian"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowAddRincianModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                disabled={loading}
              >
                Batal
              </button>
              <button
                onClick={handleAddRincian}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 disabled:opacity-50"
                disabled={loading}
              >
                {loading ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import Data Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-800">Import Data Kategori</h3>
                <button
                  onClick={() => {
                    setShowImportModal(false);
                    resetImport();
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
            </div>

            <div className="p-6">
              {importStep === 'upload' && (
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                      <i className="fas fa-file-import text-yellow-600 text-2xl"></i>
                    </div>
                    <h4 className="text-lg font-bold text-gray-800">Import Data Kategori</h4>
                    <p className="text-gray-600 mt-2">
                      Upload file CSV untuk mengimport kategori, sub-kategori, dan rincian
                    </p>
                  </div>

                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-yellow-400 transition-colors">
                    <div className="space-y-4">
                      <div className="mx-auto w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                        <i className="fas fa-cloud-upload-alt text-yellow-600 text-xl"></i>
                      </div>
                      <div>
                        <h5 className="text-md font-semibold text-gray-800">Upload File CSV</h5>
                        <p className="text-gray-600 text-sm mt-1">
                          Pilih file CSV yang berisi data kategori untuk diimport
                        </p>
                      </div>
                      <div>
                                                  <input 
                            type="file" 
                            id="importFileInput" 
                            accept=".csv" 
                            className="hidden" 
                            onChange={handleFileSelect}
                          />
                        <button
                          onClick={() => document.getElementById('importFileInput')?.click()}
                          className="bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 text-white px-6 py-3 rounded-lg transition-all shadow-md hover:shadow-lg font-medium"
                        >
                          <i className="fas fa-upload mr-2"></i>Pilih File
                        </button>
                      </div>
                      {importFile && (
                        <p className="text-sm text-gray-600">
                          File dipilih: <span className="font-medium">{importFile.name}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <div className="bg-blue-100 p-2 rounded-lg">
                        <i className="fas fa-info-circle text-blue-600"></i>
                      </div>
                      <div>
                        <h5 className="font-semibold text-blue-800">Format File CSV</h5>
                        <p className="text-blue-700 text-sm mt-1">
                          File CSV harus memiliki kolom: kategori_id, kategori_nama, subkategori_id, subkategori_nama, rincian_id, rincian_nama
                        </p>
                        <p className="text-blue-600 text-xs mt-1">
                          * Kolom subkategori dan rincian bersifat opsional
                        </p>
                        <button 
                          onClick={() => {
                            // Create and download sample CSV
                            const csvContent = "kategori_id,kategori_nama,subkategori_id,subkategori_nama,rincian_id,rincian_nama\n500.6,Pertanian,1,Kebijakan di Bidang Pertanian,1,Kebijakan Umum Pertanian\n500.6,Pertanian,1,Kebijakan di Bidang Pertanian,2,Regulasi Pertanian\n400.5,Pendidikan,1,Kebijakan Pendidikan,1,Kurikulum\n300.4,Kesehatan,1,Pelayanan Kesehatan,1,Puskesmas";
                            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                            const url = URL.createObjectURL(blob);
                            const link = document.createElement('a');
                            link.setAttribute('href', url);
                            link.setAttribute('download', 'template_import_kategori.csv');
                            link.style.visibility = 'hidden';
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                          }}
                          className="mt-3 text-blue-600 hover:text-blue-800 text-sm font-medium underline"
                        >
                          <i className="fas fa-download mr-1"></i>Download Template CSV
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {importStep === 'preview' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="text-lg font-bold text-gray-800">Preview Data Import</h4>
                      <p className="text-gray-600 text-sm mt-1">
                        Tinjau data yang akan diimport ({importPreview.length} baris)
                      </p>
                    </div>
                    <div className="bg-yellow-50 p-2 rounded-full">
                      <i className="fas fa-eye text-yellow-600"></i>
                    </div>
                  </div>

                  <div className="overflow-x-auto border border-gray-200 rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kategori ID</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kategori Nama</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sub-Kategori ID</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sub-Kategori Nama</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rincian ID</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rincian Nama</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {importPreview.slice(0, 10).map((row, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{row.kategori_id}</td>
                            <td className="px-4 py-3 text-sm text-gray-900 max-w-xs truncate">{row.kategori_nama}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{row.subkategori_id || '-'}</td>
                            <td className="px-4 py-3 text-sm text-gray-900 max-w-xs truncate">{row.subkategori_nama || '-'}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{row.rincian_id || '-'}</td>
                            <td className="px-4 py-3 text-sm text-gray-900 max-w-xs truncate">{row.rincian_nama || '-'}</td>
                          </tr>
                        ))}
                        {importPreview.length > 10 && (
                          <tr>
                            <td colSpan={6} className="px-4 py-3 text-center text-sm text-gray-500">
                              Menampilkan 10 dari {importPreview.length} baris data...
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => {
                        setImportStep('upload');
                        setImportFile(null);
                        setImportPreview([]);
                      }}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                      <i className="fas fa-arrow-left mr-2"></i>Kembali
                    </button>
                    <button
                      onClick={processImportData}
                      className="px-6 py-2 bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 text-white rounded-lg hover:from-yellow-700 hover:to-yellow-800 transition-all shadow-md font-medium"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <i className="fas fa-spinner fa-spin mr-2"></i>Memproses...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-file-import mr-2"></i>Import Data
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {importStep === 'processing' && (
                <div className="space-y-6 text-center py-8">
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
                  </div>
                  <h4 className="text-lg font-bold text-gray-800">Memproses Import Data</h4>
                  <p className="text-gray-600">
                    Mohon tunggu, sedang mengimport {importPreview.length} baris data...
                  </p>
                </div>
              )}
            </div>

            {importStep !== 'processing' && (
              <div className="p-6 border-t border-gray-200 flex justify-end">
                <button
                  onClick={() => {
                    setShowImportModal(false);
                    resetImport();
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Tutup
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}