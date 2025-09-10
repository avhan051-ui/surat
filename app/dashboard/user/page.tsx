'use client';

import { useState, useRef, useEffect } from 'react';
import RouteGuard from '@/app/components/RouteGuard';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';

// Define types
interface User {
  id: number;
  nama: string;
  email: string;
  nip: string;
  password: string;
  pangkatGol: string;
  jabatan: string;
  role: string;
  lastLogin: string;
  createdAt: string;
}

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    nama: '',
    nip: '',
    pangkatGol: '',
    jabatan: '',
    email: '',
    role: ''
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch users from API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/users');
        if (response.ok) {
          const userData = await response.json();
          setUsers(userData);
        } else {
          console.error('Failed to fetch users:', response.statusText);
          Swal.fire({
            title: 'Error!',
            text: 'Gagal memuat data pengguna',
            icon: 'error',
            confirmButtonText: 'OK'
          });
        }
      } catch (error) {
        console.error('Error fetching users:', error);
        Swal.fire({
          title: 'Error!',
          text: 'Terjadi kesalahan saat memuat data pengguna',
          icon: 'error',
          confirmButtonText: 'OK'
        });
      }
    };

    fetchUsers();
  }, []);

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

  const handleEditUser = (user: User) => {
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
    Swal.fire({
      title: 'Konfirmasi',
      text: 'Apakah Anda yakin ingin menghapus pengguna ini?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await fetch(`/api/users?id=${id}`, {
            method: 'DELETE'
          });
          
          if (response.ok) {
            // Update local state
            setUsers(prevUsers => prevUsers.filter(user => user.id !== id));
            Swal.fire({
              title: 'Berhasil!',
              text: 'Pengguna berhasil dihapus!',
              icon: 'success',
              confirmButtonText: 'OK'
            });
          } else {
            const errorData = await response.json();
            Swal.fire({
              title: 'Error!',
              text: errorData.error || 'Gagal menghapus pengguna',
              icon: 'error',
              confirmButtonText: 'OK'
            });
          }
        } catch (error) {
          console.error('Error deleting user:', error);
          Swal.fire({
            title: 'Error!',
            text: 'Terjadi kesalahan saat menghapus pengguna',
            icon: 'error',
            confirmButtonText: 'OK'
          });
        }
      }
    });
  };

  const handleSaveUser = async () => {
    // Validate NIP format (18 digits)
    if (!/^\d{18}$/.test(formData.nip)) {
      Swal.fire({
        title: 'Validasi Gagal',
        text: 'NIP harus berupa 18 digit angka!',
        icon: 'error',
        confirmButtonText: 'OK'
      });
      return;
    }

    try {
      if (editingUser) {
        // Update existing user
        const response = await fetch('/api/users', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            id: editingUser.id,
            ...formData,
            password: editingUser.password, // Keep existing password
            lastLogin: editingUser.lastLogin, // Keep existing lastLogin
            createdAt: editingUser.createdAt // Keep existing createdAt
          })
        });

        if (response.ok) {
          const updatedUser = await response.json();
          // Update local state
          setUsers(prevUsers => 
            prevUsers.map(user => user.id === editingUser.id ? updatedUser : user)
          );
          Swal.fire({
            title: 'Berhasil!',
            text: 'Data pengguna berhasil diperbarui!',
            icon: 'success',
            confirmButtonText: 'OK'
          });
        } else {
          const errorData = await response.json();
          Swal.fire({
            title: 'Error!',
            text: errorData.error || 'Gagal memperbarui pengguna',
            icon: 'error',
            confirmButtonText: 'OK'
          });
          return;
        }
      } else {
        // Add new user
        const newUser = {
          ...formData,
          password: '123', // Default password
          lastLogin: null, // Gunakan null daripada '-'
          createdAt: new Date().toISOString().split('T')[0]
        };

        const response = await fetch('/api/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(newUser)
        });

        if (response.ok) {
          const createdUser = await response.json();
          // Update local state
          setUsers(prevUsers => [...prevUsers, createdUser]);
          Swal.fire({
            title: 'Berhasil!',
            text: 'Pengguna baru berhasil ditambahkan dengan password default: 123',
            icon: 'success',
            confirmButtonText: 'OK'
          });
        } else {
          const errorData = await response.json();
          Swal.fire({
            title: 'Error!',
            text: errorData.error || 'Gagal menambahkan pengguna',
            icon: 'error',
            confirmButtonText: 'OK'
          });
          return;
        }
      }

      setShowModal(false);
    } catch (error) {
      console.error('Error saving user:', error);
      Swal.fire({
        title: 'Error!',
        text: 'Terjadi kesalahan saat menyimpan data pengguna',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    }
  };

  const handleImportExcel = () => {
    // Membuat input file tersembunyi
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.xlsx, .xls';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = async (event) => {
          try {
            const data = new Uint8Array(event.target?.result as ArrayBuffer);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            
            // Pastikan file memiliki data
            if (jsonData.length <= 1) {
              Swal.fire({
                title: 'Error!',
                text: 'File Excel kosong atau tidak memiliki data.',
                icon: 'error',
                confirmButtonText: 'OK'
              });
              return;
            }
            
            // Proses header dan data
            const headers = jsonData[0] as string[];
            const requiredHeaders = ['nama', 'nip', 'pangkatGol', 'jabatan', 'email', 'role'];
            
            // Cek apakah semua header yang diperlukan ada
            const missingHeaders = requiredHeaders.filter(header => 
              !headers.includes(header)
            );
            
            if (missingHeaders.length > 0) {
              Swal.fire({
                title: 'Error!',
                text: `File Excel tidak memiliki kolom yang diperlukan: ${missingHeaders.join(', ')}`,
                icon: 'error',
                confirmButtonText: 'OK'
              });
              return;
            }
            
            // Proses data pengguna
            let successCount = 0;
            let errorCount = 0;
            const errors: string[] = [];
            
            for (let i = 1; i < jsonData.length; i++) {
              const row = jsonData[i] as any[];
              const userData: any = {};
              
              // Mapping data dari row ke objek user
              headers.forEach((header, index) => {
                userData[header] = row[index] || '';
              });
              
              // Validasi NIP (18 digit)
              // if (!/^\d{18}$/.test(userData.nip)) {
              if (!userData.nip) {
                // errors.push(`Baris ${i + 1}: NIP harus 18 digit angka`);
                errors.push(`Baris ${i + 1}: NIP harus di isi`);
                errorCount++;
                continue;
              }
              
              // Cek duplikasi NIP (dari data yang sudah ada)
              const existingUserByNip = users.find(u => u.nip === userData.nip);
              if (existingUserByNip) {
                errors.push(`Baris ${i + 1}: NIP ${userData.nip} sudah digunakan`);
                errorCount++;
                continue;
              }
              
              // Validasi email (jika diisi)
              if (userData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
                errors.push(`Baris ${i + 1}: Format email tidak valid`);
                errorCount++;
                continue;
              }
              
              // Cek duplikasi email jika ada (dari data yang sudah ada)
              if (userData.email) {
                const existingUserByEmail = users.find(u => u.email === userData.email);
                if (existingUserByEmail) {
                  errors.push(`Baris ${i + 1}: Email ${userData.email} sudah digunakan`);
                  errorCount++;
                  continue;
                }
              }
              
              // Validasi role
              const validRoles = ['Administrator', 'Operator', 'User'];
              if (!validRoles.includes(userData.role)) {
                errors.push(`Baris ${i + 1}: Role tidak valid. Harus salah satu dari: ${validRoles.join(', ')}`);
                errorCount++;
                continue;
              }
              
              // Tambahkan user baru ke database
              try {
                const newUser = {
                  nama: userData.nama,
                  nip: userData.nip,
                  pangkatGol: userData.pangkatGol,
                  jabatan: userData.jabatan,
                  email: userData.email || '', // Pastikan email tidak undefined
                  role: userData.role,
                  password: '123', // Default password
                  lastLogin: null, // Gunakan null daripada '-'
                  createdAt: new Date().toISOString().split('T')[0] // Default value
                };

                const response = await fetch('/api/users', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify(newUser)
                });

                if (response.ok) {
                  const createdUser = await response.json();
                  // Update local state
                  setUsers(prevUsers => [...prevUsers, createdUser]);
                  successCount++;
                } else {
                  const errorData = await response.json();
                  // Tampilkan pesan error yang lebih spesifik
                  const errorMessage = errorData.error || 'Gagal menambahkan pengguna';
                  errors.push(`Baris ${i + 1}: ${errorMessage}`);
                  errorCount++;
                }
              } catch (error) {
                errors.push(`Baris ${i + 1}: Terjadi kesalahan saat menambahkan pengguna: ${(error as Error).message}`);
                errorCount++;
              }
            }
            
            // Tampilkan hasil
            let resultMessage = `Import selesai: ${successCount} berhasil, ${errorCount} gagal.`;
            if (errors.length > 0) {
              resultMessage += '\n\nError:\n' + errors.slice(0, 5).join('\n'); // Tampilkan maksimal 5 error
              if (errors.length > 5) {
                resultMessage += `\n...dan ${errors.length - 5} error lainnya`;
              }
            }
            
            Swal.fire({
              title: successCount > 0 ? 'Import Berhasil!' : 'Import Selesai',
              text: resultMessage,
              icon: successCount > 0 ? 'success' : 'warning',
              confirmButtonText: 'OK'
            });
          } catch (error) {
            Swal.fire({
              title: 'Error!',
              text: 'Terjadi kesalahan saat membaca file Excel: ' + (error as Error).message,
              icon: 'error',
              confirmButtonText: 'OK'
            });
          }
        };
        reader.readAsArrayBuffer(file);
      }
    };
    input.click();
  };

  const handleSearch = () => {
    // In a real app, you would filter the users in the context
    // For now, we'll just show a SweetAlert
    Swal.fire({
      title: 'Fitur Filter',
      text: 'Filter functionality would be implemented here',
      icon: 'info',
      confirmButtonText: 'OK'
    });
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