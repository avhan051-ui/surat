'use client';

import { useState, useEffect, useRef } from 'react';
import { showSuccessToast, showErrorToast, showWarningToast } from '@/lib/sweetalert-utils';

// SearchableDropdown Component
const SearchableDropdown = ({ options, value, onChange, placeholder, disabled = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Filter options based on search term
  const filteredOptions = options.filter(option =>
    option.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    option.key.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get selected option for display
  const selectedOption = options.find(option => option.key === value);
  const displayText = selectedOption ? selectedOption.name : placeholder;

  return (
    <div className="relative" ref={dropdownRef}>
      <div 
        className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white cursor-pointer flex justify-between items-center ${disabled ? 'bg-gray-100 opacity-50 cursor-not-allowed' : ''}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <span className={value ? 'text-gray-900' : 'text-gray-500'}>
          {displayText}
        </span>
        <svg 
          className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {isOpen && !disabled && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          <div className="p-2">
            <input
              type="text"
              placeholder="Cari..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <ul className="py-1">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <li
                  key={option.key}
                  className={`px-4 py-2 cursor-pointer hover:bg-blue-50 ${
                    value === option.key ? 'bg-blue-100 text-blue-800' : 'text-gray-700'
                  }`}
                  onClick={() => {
                    onChange(option.key);
                    setIsOpen(false);
                    setSearchTerm('');
                  }}
                >
                  <div className="font-medium">{option.name}</div>
                  <div className="text-sm text-gray-500">{option.key}</div>
                </li>
              ))
            ) : (
              <li className="px-4 py-2 text-gray-500">Tidak ada hasil ditemukan</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default function InputSuratForm({ kategoriData, users, addSurat, onCancel, onSuccess }) {
  const [kategoriUtama, setKategoriUtama] = useState('');
  const [subKategori, setSubKategori] = useState('');
  const [rincian, setRincian] = useState('');
  const [nomorSurat, setNomorSurat] = useState('[Pilih kategori untuk generate nomor]');
  const [tujuanSurat, setTujuanSurat] = useState('');
  const [tanggalSurat, setTanggalSurat] = useState('');
  const [pembuatSurat, setPembuatSurat] = useState('');
  const [statusPembuat, setStatusPembuat] = useState('');
  const [perihal, setPerihal] = useState('');
  const [subKategoriOptions, setSubKategoriOptions] = useState<{key: string, name: string}[]>([]);
  const [rincianOptions, setRincianOptions] = useState<{key: string, name: string}[]>([]);
  const [subKategoriDisabled, setSubKategoriDisabled] = useState(true);
  const [rincianDisabled, setRincianDisabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const [suratList, setSuratList] = useState([]);

  useEffect(() => {
    // Set today's date as default
    const today = new Date().toISOString().split('T')[0];
    setTanggalSurat(today);
    
    // Fetch current surat list
    const fetchSurat = async () => {
      try {
        const response = await fetch('/api/surat');
        if (response.ok) {
          const data = await response.json();
          setSuratList(data);
        }
      } catch (error) {
        console.error('Error fetching surat:', error);
      }
    };
    
    fetchSurat();
  }, []);

  // Fungsi untuk mendapatkan nomor urut berikutnya untuk kategori utama tertentu
  const getNextNomorUrut = (kategoriUtama: string) => {
    // Hitung berapa banyak surat dengan kategori utama yang sama
    const existingSurat = suratList.filter(suratItem => suratItem.kategori === kategoriUtama);
    return existingSurat.length + 1;
  };

  const handleKategoriUtamaChange = (value: string) => {
    setKategoriUtama(value);
    setSubKategori('');
    setRincian('');
    setNomorSurat('[Pilih kategori untuk generate nomor]');
    
    if (value && kategoriData[value as keyof typeof kategoriData]) {
      setSubKategoriDisabled(false);
      const subs = kategoriData[value as keyof typeof kategoriData].sub;
      const options = Object.entries(subs).map(([key, value]) => ({
        key,
        name: `${key} - ${value.name}`
      }));
      setSubKategoriOptions(options);
    } else {
      setSubKategoriDisabled(true);
      setRincianDisabled(true);
    }
  };

  const handleSubKategoriChange = (value: string) => {
    setSubKategori(value);
    setRincian('');
    setNomorSurat('[Pilih kategori untuk generate nomor]');
    
    if (kategoriUtama && value && 
        kategoriData[kategoriUtama as keyof typeof kategoriData]?.sub[value as keyof typeof kategoriData[typeof kategoriUtama]['sub']]) {
      setRincianDisabled(false);
      const rincianData = kategoriData[kategoriUtama as keyof typeof kategoriData].sub[value as keyof typeof kategoriData[typeof kategoriUtama]['sub']].rincian;
      const options = Object.entries(rincianData).map(([key, value]) => ({
        key,
        name: `${key} - ${value}`
      }));
      setRincianOptions(options);
    } else {
      setRincianDisabled(true);
    }
  };

  const handleRincianChange = (value: string) => {
    setRincian(value);
    updateNomorSurat(kategoriUtama, subKategori, value);
  };

  const updateNomorSurat = (kategori: string, sub: string, rinc: string) => {
    const tahun = new Date().getFullYear();
    
    if (kategori && sub && rinc) {
      const fullKategori = `${kategori}.${sub}.${rinc}`;
      const nomorUrut = getNextNomorUrut(kategori); // Menggunakan kategori utama untuk penomoran
      const nomorFormatted = String(nomorUrut).padStart(3, '0');
      const nomorLengkap = `${fullKategori}/${nomorFormatted}/${tahun}`;
      setNomorSurat(nomorLengkap);
    } else {
      setNomorSurat('[Pilih kategori untuk generate nomor]');
    }
  };

  const handlePembuatSuratChange = (userId: string) => {
    setPembuatSurat(userId);
    
    if (userId) {
      const user = users.find(u => u.id === parseInt(userId));
      if (user) {
        setStatusPembuat(`${user.pangkatGol} - ${user.jabatan}`);
      }
    } else {
      setStatusPembuat('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate pembuat surat
    if (!pembuatSurat) {
      showWarningToast('Pilih pembuat surat terlebih dahulu!');
      return;
    }

    const selectedUser = users.find(user => user.id == parseInt(pembuatSurat));
    if (!selectedUser) {
      showErrorToast('Pembuat surat tidak valid!');
      return;
    }

    // Check if nomor surat already exists
    const isDuplicate = suratList.some(suratItem => suratItem.nomor === nomorSurat);
    if (isDuplicate) {
      showWarningToast('Nomor surat sudah ada. Silakan pilih kategori lain atau tunggu sebentar.');
      return;
    }

    // Show loading state
    setLoading(true);

    // Create new surat object with automatic number
    // Remove ID from the object so database can auto-generate it
    const newSurat = {
      nomor: nomorSurat, // Use the automatically generated number
      tanggal: tanggalSurat,
      tujuan: tujuanSurat,
      perihal: perihal,
      pembuat: selectedUser.nama,
      pembuatId: selectedUser.id,
      kategori: kategoriUtama,
      fullKategori: `${kategoriUtama}.${subKategori}.${rincian}`
    };

    try {
      // Send surat to API
      const response = await fetch('/api/surat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newSurat),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`Failed to save surat: ${response.status} ${response.statusText}`);
      }

      const savedSurat = await response.json();

      // Add surat to context for immediate UI update
      await addSurat(savedSurat);
      
      showSuccessToast('Surat berhasil disimpan!');
      
      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error saving surat:', error);
      let errorMessage = 'Gagal menyimpan surat. ';
      
      // Check if it's a duplicate key error
      if (error.message && error.message.includes('duplicate key value violates unique constraint')) {
        errorMessage += 'Nomor surat sudah ada. Silakan coba lagi atau hubungi administrator.';
      } else {
        errorMessage += error.message;
      }
      
      showErrorToast(errorMessage);
    } finally {
      // Reset loading state
      setLoading(false);
      
      // Reset form only if not calling onSuccess (which handles hiding)
      if (!onSuccess) {
        setKategoriUtama('');
        setSubKategori('');
        setRincian('');
        setNomorSurat('[Pilih kategori untuk generate nomor]');
        setTujuanSurat('');
        setPerihal('');
        setPembuatSurat('');
        setStatusPembuat('');
        setSubKategoriDisabled(true);
        setRincianDisabled(true);
        setSubKategoriOptions([]);
        setRincianOptions([]);
        
        // Set today's date again
        const today = new Date().toISOString().split('T')[0];
        setTanggalSurat(today);
      }
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-800">Input Surat Keluar Baru</h3>
          <p className="text-gray-600 mt-1">Lengkapi form di bawah untuk membuat surat keluar baru</p>
        </div>
        <div className="bg-green-50 p-3 rounded-full">
          <i className="fas fa-plus-circle text-green-600 text-xl"></i>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Kategori Section */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">Kategori Surat</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Kategori Utama</label>
              <SearchableDropdown
                options={Object.entries(kategoriData).map(([key, value]) => ({
                  key,
                  name: `${key} - ${value.name}`
                }))}
                value={kategoriUtama}
                onChange={handleKategoriUtamaChange}
                placeholder="Pilih Kategori"
                disabled={false}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sub Kategori</label>
              <SearchableDropdown
                options={subKategoriOptions}
                value={subKategori}
                onChange={handleSubKategoriChange}
                placeholder="Pilih Sub Kategori"
                disabled={subKategoriDisabled}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Rincian</label>
              <SearchableDropdown
                options={rincianOptions}
                value={rincian}
                onChange={handleRincianChange}
                placeholder="Pilih Rincian"
                disabled={rincianDisabled}
              />
            </div>
          </div>
        </div>

        {/* Nomor Surat Preview */}
        <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-lg p-6 border border-green-200">
          <label className="block text-sm font-medium text-gray-700 mb-3">Nomor Surat (Otomatis)</label>
          <div className="flex items-center space-x-3">
            <div className="bg-green-600 p-2 rounded-lg">
              <i className="fas fa-hashtag text-white"></i>
            </div>
            <div className="text-xl lg:text-2xl font-mono text-green-600 font-bold break-all">
              {nomorSurat}
            </div>
          </div>
        </div>

        {/* Detail Surat Section */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">Detail Surat</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tujuan Surat</label>
              <input 
                type="text" 
                value={tujuanSurat}
                onChange={(e) => setTujuanSurat(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" 
                placeholder="Nama instansi/penerima" 
                required 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal Surat</label>
              <input 
                type="date" 
                value={tanggalSurat}
                onChange={(e) => setTanggalSurat(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" 
                required 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6 mt-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Pembuat Surat</label>
              <SearchableDropdown
                options={users.map(user => ({
                  key: user.id.toString(),
                  name: `${user.nama} - ${user.jabatan}`
                }))}
                value={pembuatSurat}
                onChange={handlePembuatSuratChange}
                placeholder="Pilih Pembuat Surat"
                disabled={false}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status Pembuat</label>
              <input 
                type="text" 
                value={statusPembuat}
                readOnly
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50" 
                placeholder="Status akan muncul otomatis" 
              />
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Perihal/Keterangan</label>
            <textarea 
              value={perihal}
              onChange={(e) => setPerihal(e.target.value)}
              rows={4} 
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" 
              placeholder="Masukkan perihal atau keterangan surat" 
              required
            ></textarea>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4">
          {onCancel && (
            <button 
              type="button" 
              onClick={onCancel}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <i className="fas fa-times mr-2"></i>Batal
            </button>
          )}
          <button 
            type="submit" 
            className={`px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all shadow-lg ${loading ? 'opacity-75 cursor-not-allowed' : ''}`}
            disabled={loading}
          >
            {loading ? (
              <>
                <i className="fas fa-spinner fa-spin mr-2"></i>Menyimpan...
              </>
            ) : (
              <>
                <i className="fas fa-save mr-2"></i>Simpan Surat
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}