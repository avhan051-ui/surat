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
  const [loading, setLoading] = useState(false);

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

  // Handle deleting a rincian
  const handleDeleteRincian = async (categoryId: string, subCategoryId: string, rincianId: string) => {
    showConfirmationDialog({
      title: 'Hapus Rincian',
      text: 'Apakah Anda yakin ingin menghapus rincian ini?',
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal'
    }).then(async (result) => {
      if (result.isConfirmed) {
        setLoading(true);
        try {
          const updatedKategoriData = { ...kategoriData };
          delete updatedKategoriData[categoryId].sub[subCategoryId].rincian[rincianId];
          
          // Update via API
          const response = await fetch('/api/kategori', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedKategoriData),
          });

          if (!response.ok) {
            throw new Error('Failed to delete rincian');
          }

          updateKategoriData(updatedKategoriData);
          showSuccessToast('Rincian berhasil dihapus!');
        } catch (error) {
          console.error('Error deleting rincian:', error);
          showErrorToast('Gagal menghapus rincian!');
        } finally {
          setLoading(false);
        }
      }
    });
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
              <button
                onClick={() => setShowAddCategoryModal(true)}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2 rounded-lg text-sm transition-all shadow-md"
              >
                <i className="fas fa-plus mr-2"></i>Tambah Kategori
              </button>
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
    </div>
  );
}