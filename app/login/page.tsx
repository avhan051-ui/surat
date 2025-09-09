'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAppContext } from '@/app/context/AppContext';

export default function LoginPage() {
  const [nip, setNip] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const router = useRouter();
  const { users, setCurrentUser } = useAppContext();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Find user by NIP
    const user = users.find(u => u.nip === nip);
    
    if (!user) {
      alert('NIP tidak ditemukan!');
      return;
    }
    
    // Check password (in real app, this should be properly hashed)
    if (password !== user.password && password !== '123') {
      alert('Password salah!');
      return;
    }
    
    // Set current user
    setCurrentUser(user);
    
    // Set cookie for authentication
    document.cookie = `currentUser=${JSON.stringify(user)}; path=/; max-age=${rememberMe ? 30*24*60*60 : 24*60*60}`;
    
    // Update last login
    const now = new Date().toISOString();
    user.lastLogin = now;
    
    // Redirect to dashboard
    router.push('/dashboard');
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-slate-50 to-blue-50 font-sans">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-center">
          <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-6">
            <i className="fas fa-envelope-open-text text-white text-3xl"></i>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">SuratKu</h1>
          <p className="text-blue-100 mt-2">Sistem Pengelolaan Surat Keluar</p>
        </div>
        
        <div className="p-8">
          <h2 className="text-2xl font-bold text-gray-800 text-center mb-2">Login ke Akun Anda</h2>
          <p className="text-gray-600 text-center mb-8">Masukkan NIP dan password untuk melanjutkan</p>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">NIP</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i className="fas fa-id-card text-gray-400"></i>
                </div>
                <input 
                  type="text" 
                  value={nip}
                  onChange={(e) => setNip(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                  placeholder="Masukkan NIP Anda" 
                  required
                  maxLength={18}
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i className="fas fa-lock text-gray-400"></i>
                </div>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                  placeholder="Masukkan password" 
                  required
                />
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input 
                  id="rememberMe" 
                  type="checkbox" 
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700">
                  Ingat saya
                </label>
              </div>
              
              <div className="text-sm">
                <Link href="#" className="font-medium text-blue-600 hover:text-blue-500">
                  Lupa password?
                </Link>
              </div>
            </div>
            
            <button 
              type="submit" 
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-lg transition-all duration-200 font-medium"
            >
              Masuk ke Dashboard
            </button>
          </form>
          
          <div className="mt-8 text-center">
            <p className="text-gray-600 text-sm">
              Belum memiliki akun? 
              <Link href="#" className="font-medium text-blue-600 hover:text-blue-500 ml-1">
                Hubungi administrator
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}