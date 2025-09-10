'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/app/context/AppContext';
import { showSuccessToast, showErrorToast, showWarningToast, showConfirmationDialog } from '@/lib/sweetalert-utils';
import RouteGuard from '@/app/components/RouteGuard';

export default function ProfilPage() {
  const { currentUser, setCurrentUser, updateUser } = useAppContext();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nama: '',
    nip: '',
    pangkatGol: '',
    jabatan: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  // Initialize form data with current user data
  useEffect(() => {
    if (currentUser) {
      setFormData({
        nama: currentUser.nama || '',
        nip: currentUser.nip || '',
        pangkatGol: currentUser.pangkatGol || '',
        jabatan: currentUser.jabatan || '',
        email: currentUser.email || '',
        password: '',
        confirmPassword: ''
      });
    }
  }, [currentUser]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.nama || !formData.nip || !formData.pangkatGol || !formData.jabatan) {
      showWarningToast('Harap lengkapi semua field yang wajib diisi!');
      return;
    }
    
    // Validate NIP format (18 digits)
    if (!/^\d{18}$/.test(formData.nip)) {
      showWarningToast('NIP harus berupa 18 digit angka!');
      return;
    }
    
    // Validate email format if provided
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      showWarningToast('Format email tidak valid!');
      return;
    }
    
    // Validate password confirmation if password is being changed
    if (formData.password && formData.password !== formData.confirmPassword) {
      showErrorToast('Password konfirmasi tidak cocok!');
      return;
    }
    
    // Confirm before updating
    showConfirmationDialog({
      title: 'Konfirmasi Update Profil',
      text: 'Apakah Anda yakin ingin memperbarui data profil Anda?',
      confirmButtonText: 'Ya, Update',
      cancelButtonText: 'Batal'
    }).then(async (result) => {
      if (result.isConfirmed) {
        setLoading(true);
        
        try {
          // Prepare data for update
          const updatedUserData = {
            ...currentUser,
            nama: formData.nama,
            nip: formData.nip,
            pangkatGol: formData.pangkatGol,
            jabatan: formData.jabatan,
            email: formData.email || '',
            // Only include password if it's being changed
            ...(formData.password && { password: formData.password })
          };
          
          // Remove confirmPassword from the data
          delete (updatedUserData as any).confirmPassword;
          
          // Update user via API
          const response = await fetch('/api/users', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedUserData),
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Gagal memperbarui data pengguna');
          }
          
          const updatedUser = await response.json();
          
          // Update context
          updateUser(updatedUser.id, updatedUser);
          
          // If password was changed, update current user in context and cookie
          if (formData.password) {
            setCurrentUser(updatedUser);
            
            // Update cookie
            if (typeof window !== 'undefined') {
              const cookieValue = encodeURIComponent(JSON.stringify(updatedUser));
              document.cookie = `currentUser=${cookieValue}; path=/; max-age=24*60*60; SameSite=Lax`;
            }
          }
          
          showSuccessToast('Data profil berhasil diperbarui!');
        } catch (error) {
          console.error('Error updating profile:', error);
          showErrorToast(`Gagal memperbarui profil: ${(error as Error).message}`);
        } finally {
          setLoading(false);
        }
      }
    });
  };

  const handleCancel = () => {
    router.push('/dashboard');
  };

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <RouteGuard>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Profil Pengguna</h2>
              <p className="text-gray-600 mt-1">Kelola informasi pribadi dan akun Anda</p>
            </div>
            <div className="bg-blue-50 p-3 rounded-full">
              <i className="fas fa-user-circle text-blue-600 text-2xl"></i>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Informasi Pribadi */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
                <i className="fas fa-user mr-3 text-blue-600"></i>
                Informasi Pribadi
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nama Lengkap <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="nama"
                    value={formData.nama}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    placeholder="Masukkan nama lengkap Anda"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    NIP <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="nip"
                    value={formData.nip}
                    onChange={handleChange}
                    maxLength={18}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                    required
                    placeholder="18 digit NIP"
                  />
                  <p className="mt-1 text-xs text-gray-500">Harus 18 digit angka</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pangkat/Golongan <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="pangkatGol"
                    value={formData.pangkatGol}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    placeholder="Contoh: Penata / III.c"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Jabatan <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="jabatan"
                    value={formData.jabatan}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    placeholder="Contoh: Staff Administrasi"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Masukkan alamat email Anda"
                  />
                  <p className="mt-1 text-xs text-gray-500">Opsional, untuk notifikasi</p>
                </div>
              </div>
            </div>

            {/* Keamanan Akun */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
                <i className="fas fa-shield-alt mr-3 text-green-600"></i>
                Keamanan Akun
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password Baru
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Biarkan kosong jika tidak ingin mengganti"
                    minLength={3}
                  />
                  <p className="mt-1 text-xs text-gray-500">Minimal 3 karakter</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Konfirmasi Password
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ulangi password baru"
                  />
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start space-x-3">
                  <i className="fas fa-info-circle text-blue-600 mt-0.5"></i>
                  <div>
                    <p className="text-sm font-medium text-blue-800">Informasi Keamanan</p>
                    <p className="text-sm text-blue-700 mt-1">
                      Untuk menjaga keamanan akun Anda, pastikan untuk menggunakan password yang kuat dan berbeda dari password lainnya.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tombol Aksi */}
            <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={loading}
              >
                <i className="fas fa-arrow-left mr-2"></i>Batal
              </button>
              <button
                type="submit"
                className={`px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg ${loading ? 'opacity-75 cursor-not-allowed' : ''}`}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i>Memperbarui...
                  </>
                ) : (
                  <>
                    <i className="fas fa-save mr-2"></i>Simpan Perubahan
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Informasi Akun */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
            <i className="fas fa-info-circle mr-3 text-purple-600"></i>
            Informasi Akun
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-5 border border-purple-200">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <i className="fas fa-user-tag text-white"></i>
                </div>
                <div>
                  <p className="text-sm text-purple-800 font-medium">Role</p>
                  <p className="text-lg font-bold text-purple-900">{currentUser.role}</p>
                </div>
              </div>
              <p className="text-xs text-purple-700">
                Hak akses berdasarkan role Anda dalam sistem
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-xl p-5 border border-green-200">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-teal-600 rounded-lg flex items-center justify-center">
                  <i className="fas fa-clock text-white"></i>
                </div>
                <div>
                  <p className="text-sm text-green-800 font-medium">Terakhir Login</p>
                  <p className="text-lg font-bold text-green-900">
                    {currentUser.lastLogin && currentUser.lastLogin !== '-' 
                      ? new Date(currentUser.lastLogin).toLocaleDateString('id-ID', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })
                      : '-'}
                  </p>
                </div>
              </div>
              <p className="text-xs text-green-700">
                Waktu terakhir Anda mengakses sistem
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-5 border border-amber-200">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
                  <i className="fas fa-calendar-plus text-white"></i>
                </div>
                <div>
                  <p className="text-sm text-amber-800 font-medium">Tanggal Dibuat</p>
                  <p className="text-lg font-bold text-amber-900">
                    {currentUser.createdAt 
                      ? new Date(currentUser.createdAt).toLocaleDateString('id-ID', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric'
                        })
                      : '-'}
                  </p>
                </div>
              </div>
              <p className="text-xs text-amber-700">
                Tanggal akun Anda pertama kali dibuat
              </p>
            </div>
          </div>
        </div>
      </div>
    </RouteGuard>
  );
}