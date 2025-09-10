'use client';

import { useRouter } from 'next/navigation';
import { useAppContext } from '@/app/context/AppContext';

export default function UnauthorizedPage() {
  const router = useRouter();
  const { currentUser } = useAppContext();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-red-500 to-red-600 p-8 text-center">
          <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-6">
            <i className="fas fa-exclamation-triangle text-white text-3xl"></i>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Akses Ditolak</h1>
          <p className="text-red-100 mt-2">Anda tidak memiliki izin untuk mengakses halaman ini</p>
        </div>
        
        <div className="p-8">
          <div className="text-center">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Halo, {currentUser?.nama || 'Pengguna'}</h2>
            <p className="text-gray-600 mb-6">
              Role Anda saat ini adalah <span className="font-semibold">{currentUser?.role || 'Tidak Diketahui'}</span>. 
              Role ini tidak memiliki akses ke halaman yang Anda minta.
            </p>
            
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-center space-x-2 text-red-800">
                <i className="fas fa-info-circle"></i>
                <p className="text-sm font-medium">Hubungi administrator jika Anda merasa ini adalah kesalahan</p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => router.push('/dashboard')}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-md font-medium"
              >
                <i className="fas fa-arrow-left mr-2"></i>Kembali ke Dashboard
              </button>
              <button
                onClick={() => router.push('/login')}
                className="px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all shadow-md font-medium"
              >
                <i className="fas fa-sign-out-alt mr-2"></i>Ganti Akun
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}