'use client';

import { useState, useEffect } from 'react';
import { useAppContext } from '@/app/context/AppContext';
import RouteGuard from '@/app/components/RouteGuard';

export default function PengaturanPage() {
  const { currentUser, setCurrentUser } = useAppContext();
  const [organisasiName, setOrganisasiName] = useState('Dinas Administrasi');
  const [adminEmail, setAdminEmail] = useState('admin@suratku.example.com');
  const [timezone, setTimezone] = useState('WIB');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState('id');

  useEffect(() => {
    // Load saved settings from localStorage if available
    const savedSettings = localStorage.getItem('suratKuSettings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      
      if (settings.organisasiName) setOrganisasiName(settings.organisasiName);
      if (settings.adminEmail) setAdminEmail(settings.adminEmail);
      if (settings.timezone) setTimezone(settings.timezone);
      if (settings.emailNotifications !== undefined) setEmailNotifications(settings.emailNotifications);
      if (settings.darkMode !== undefined) setDarkMode(settings.darkMode);
      if (settings.language) setLanguage(settings.language);
    }
  }, []);

  const handleSaveSettings = () => {
    const settings = {
      organisasiName,
      adminEmail,
      timezone,
      emailNotifications,
      darkMode,
      language
    };
    
    // Save to localStorage
    localStorage.setItem('suratKuSettings', JSON.stringify(settings));
    
    alert('Pengaturan berhasil disimpan!');
  };

  const handleChangePassword = () => {
    alert('Fitur ubah password akan dikembangkan di versi berikutnya');
  };

  return (
    <RouteGuard requiredRole="Administrator">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Pengaturan Sistem</h2>
              <p className="text-gray-600 mt-1">Konfigurasi sistem dan pengaturan aplikasi</p>
            </div>
            <div className="bg-gray-100 p-3 rounded-full">
              <i className="fas fa-cog text-gray-600 text-2xl"></i>
            </div>
          </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* System Configuration */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
              <i className="fas fa-sliders-h mr-3 text-blue-600"></i>
              Konfigurasi Sistem
            </h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nama Organisasi</label>
                <input 
                  type="text" 
                  value={organisasiName}
                  onChange={(e) => setOrganisasiName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Alamat Email Admin</label>
                <input 
                  type="email" 
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Zona Waktu</label>
                <select 
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="WIB">Waktu Indonesia Barat (WIB)</option>
                  <option value="WITA">Waktu Indonesia Tengah (WITA)</option>
                  <option value="WIT">Waktu Indonesia Timur (WIT)</option>
                </select>
              </div>
            </div>
          </div>

          {/* User Preferences */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
              <i className="fas fa-user-cog mr-3 text-green-600"></i>
              Preferensi Pengguna
            </h3>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">Notifikasi Email</p>
                  <p className="text-xs text-gray-500 mt-1">Terima notifikasi melalui email</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={emailNotifications}
                    onChange={(e) => setEmailNotifications(e.target.checked)}
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">Tampilan Gelap</p>
                  <p className="text-xs text-gray-500 mt-1">Gunakan tema gelap untuk antarmuka</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={darkMode}
                    onChange={(e) => setDarkMode(e.target.checked)}
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bahasa</label>
                <select 
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="id">Bahasa Indonesia</option>
                  <option value="en">English</option>
                </select>
              </div>
            </div>
          </div>

          {/* Security Settings */}
          <div className="bg-gray-50 rounded-xl p-6 lg:col-span-2">
            <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
              <i className="fas fa-shield-alt mr-3 text-red-600"></i>
              Keamanan
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <p className="text-sm font-medium text-gray-700">Ubah Password</p>
                <p className="text-xs text-gray-500 mt-1">Perbarui password Anda secara berkala untuk keamanan</p>
              </div>
              <div className="flex justify-end">
                <button 
                  onClick={handleChangePassword}
                  className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2 rounded-lg text-sm transition-all shadow-md"
                >
                  <i className="fas fa-key mr-2"></i>Ubah Password
                </button>
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">Autentikasi Dua Faktor</p>
                  <p className="text-xs text-gray-500 mt-1">Tambahkan lapisan keamanan ekstra</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-8 flex justify-end">
          <button 
            onClick={handleSaveSettings}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg font-medium"
          >
            <i className="fas fa-save mr-2"></i>Simpan Pengaturan
          </button>
        </div>
      </div>
          </div>
      </RouteGuard>     
);
}