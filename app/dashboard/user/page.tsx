'use client';

import { useState } from 'react';
import { useAppContext } from '@/app/context/AppContext';
import RouteGuard from '@/app/components/RouteGuard';

export default function UserManagementPage() {
  const { users, addUser, updateUser, deleteUser } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    nama: '',
    nip: '',
    pangkatGol: '',
    jabatan: '',
    email: '',
    role: ''
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRoleBadge = (role: string) => {
    const badges: any = {
      'Administrator': 'bg-purple-100 text-purple-800',
      'Operator': 'bg-blue-100 text-blue-800',
      'User': 'bg-gray-100 text-gray-800'
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badges[role] || 'bg-gray-100 text-gray-800'}`}>
        {role}
      </span>
    );
  };

  const handleSearch = () => {
    // In a real app, you would filter the users in the context
    // For now, we'll just show an alert
    alert('Filter functionality would be implemented here');
  };

  const handleAddUser = () => {
    setEditingUser(null);
    setFormData({
      nama: '',
      nip: '',
      pangkatGol: '',
      jabatan: '',
      email: '',
      role: ''
    });
    setShowModal(true);
  };

  const handleEditUser = (user: any) => {
    setEditingUser(user);
    setFormData({
      nama: user.nama,
      nip: user.nip,
      pangkatGol: user.pangkatGol,
      jabatan: user.jabatan,
      email: user.email || '',
      role: user.role
    });
    setShowModal(true);
  };

  const handleDeleteUser = (id: number) => {
    if (confirm('Apakah Anda yakin ingin menghapus pengguna ini?')) {
      deleteUser(id);
      alert('Pengguna berhasil dihapus!');
    }
  };

  const handleSaveUser = () => {
    // Validate NIP format (18 digits)
    if (!/^\d{18}$/.test(formData.nip)) {
      alert('NIP harus berupa 18 digit angka!');
      return;
    }

    // Check NIP uniqueness
    const existingUserByNip = users.find(u => u.nip === formData.nip && u.id !== editingUser?.id);
    if (existingUserByNip) {
      alert('NIP sudah digunakan oleh pengguna lain!');
      return;
    }

    // Check email uniqueness if email is provided
    if (formData.email) {
      const existingUserByEmail = users.find(u => u.email === formData.email && u.id !== editingUser?.id);
      if (existingUserByEmail) {
        alert('Email sudah digunakan oleh pengguna lain!');
        return;
      }
    }

    if (editingUser) {
      // Update existing user
      updateUser(editingUser.id, {
        ...editingUser,
        ...formData
      });
      alert('Data pengguna berhasil diperbarui!');
    } else {
      // Add new user
      const newUser = {
        id: Date.now(),
        ...formData,
        password: '123', // Default password
        lastLogin: '-',
        createdAt: new Date().toISOString().split('T')[0]
      };
      addUser(newUser);
      alert('Pengguna baru berhasil ditambahkan dengan password default: 123');
    }

    setShowModal(false);
  };

  const handleExportExcel = () => {
    alert('Export Excel functionality would be implemented here');
  };

  const handleImportExcel = () => {
    alert('Import Excel functionality would be implemented here');
  };

  return (
    <RouteGuard requiredRole="Administrator">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* User Actions Card */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-800">Kelola Pengguna</h3>
              <p className="text-gray-600 text-sm mt-1">Tambah, edit, atau import data pengguna</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <button 
                onClick={handleAddUser}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2 rounded-lg text-sm transition-all shadow-md"
              >
                <i className="fas fa-plus mr-2"></i>Tambah User
              </button>
              <button 
                onClick={handleImportExcel}
                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-4 py-2 rounded-lg text-sm transition-all shadow-md"
              >
                <i className="fas fa-file-excel mr-2"></i>Import Excel
              </button>
              <button 
                onClick={handleExportExcel}
                className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-4 py-2 rounded-lg text-sm transition-all shadow-md"
              >
                <i className="fas fa-download mr-2"></i>Export Data
              </button>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cari Nama/NIP</label>
              <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" 
                placeholder="Ketik untuk mencari..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
              <select 
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Semua Role</option>
                <option value="Administrator">Administrator</option>
                <option value="Operator">Operator</option>
                <option value="User">User</option>
              </select>
            </div>
            <div className="flex items-end">
              <button 
                onClick={handleSearch}
                className="w-full bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white px-4 py-2 rounded-lg text-sm transition-all"
              >
                <i className="fas fa-search mr-1"></i>Cari
              </button>
            </div>
          </div>
        </div>

        {/* Users Table Card */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-gray-800">Daftar Pengguna</h3>
                <p className="text-gray-600 text-sm mt-1">Total: <span>{users.length}</span> pengguna</p>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 lg:px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No</th>
                  <th className="px-4 lg:px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama</th>
                  <th className="px-4 lg:px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NIP</th>
                  <th className="px-4 lg:px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pangkat/Gol</th>
                  <th className="px-4 lg:px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jabatan</th>
                  <th className="px-4 lg:px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-4 lg:px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Terakhir Login</th>
                  <th className="px-4 lg:px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user, index) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">{index + 1}</td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.nama}</td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">{user.nip}</td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.pangkatGol}</td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.jabatan}</td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">{getRoleBadge(user.role)}</td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.lastLogin === '-' ? '-' : formatDate(user.lastLogin)}
                    </td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button 
                        onClick={() => handleEditUser(user)}
                        className="text-blue-600 hover:text-blue-800 mr-3 transition-colors"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button 
                        onClick={() => handleDeleteUser(user.id)}
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

        {/* Modal untuk Tambah/Edit User */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold text-gray-800">
                    {editingUser ? 'Edit Pengguna' : 'Tambah Pengguna Baru'}
                  </h3>
                  <button 
                    onClick={() => setShowModal(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <i className="fas fa-times text-xl"></i>
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nama Lengkap *</label>
                    <input 
                      type="text" 
                      value={formData.nama}
                      onChange={(e) => setFormData({...formData, nama: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">NIP *</label>
                    <input 
                      type="text" 
                      value={formData.nip}
                      onChange={(e) => setFormData({...formData, nip: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                      placeholder="18 digit NIP" 
                      maxLength={18}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Pangkat/Golongan *</label>
                    <input 
                      type="text" 
                      value={formData.pangkatGol}
                      onChange={(e) => setFormData({...formData, pangkatGol: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                      placeholder="Contoh: Penata / III.c" 
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Jabatan *</label>
                    <input 
                      type="text" 
                      value={formData.jabatan}
                      onChange={(e) => setFormData({...formData, jabatan: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                      placeholder="Contoh: Staff Administrasi" 
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input 
                      type="email" 
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                      placeholder="Optional"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Role *</label>
                    <select 
                      value={formData.role}
                      onChange={(e) => setFormData({...formData, role: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                      required
                    >
                      <option value="">Pilih Role</option>
                      <option value="Administrator">Administrator</option>
                      <option value="Operator">Operator</option>
                      <option value="User">User</option>
                    </select>
                  </div>
                </div>

                {!editingUser && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <i className="fas fa-info-circle text-blue-600"></i>
                      <p className="text-sm text-blue-800">Password default untuk user baru adalah <strong>123</strong></p>
                    </div>
                  </div>
                )}

                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                  <button 
                    type="button" 
                    onClick={() => setShowModal(false)}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Batal
                  </button>
                  <button 
                    type="button" 
                    onClick={handleSaveUser}
                    className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg"
                  >
                    <i className="fas fa-save mr-2"></i>Simpan
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </RouteGuard>
  );
}