'use client';

import { useState, useEffect } from 'react';
import { useAppContext } from '@/app/context/AppContext';
import Swal from 'sweetalert2';

export default function InputSuratPage() {
  const { kategoriData, users, addSurat, surat } = useAppContext();
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

  useEffect(() => {
    // Set today's date as default
    const today = new Date().toISOString().split('T')[0];
    setTanggalSurat(today);
  }, []);

  // Fungsi untuk mendapatkan nomor urut berikutnya untuk kategori utama tertentu
  const getNextNomorUrut = (kategoriUtama: string) => {
    // Hitung berapa banyak surat dengan kategori utama yang sama
    const existingSurat = surat.filter(suratItem => suratItem.kategori === kategoriUtama);
    return existingSurat.length + 1;
  };

  const handleKategoriUtamaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
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

  const handleSubKategoriChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
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

  const handleRincianChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
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

  const handlePembuatSuratChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const userId = e.target.value;
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
      Swal.fire({
        title: 'Validasi Gagal',
        text: 'Pilih pembuat surat terlebih dahulu!',
        icon: 'warning',
        confirmButtonText: 'OK'
      });
      return;
    }

    const selectedUser = users.find(user => user.id == parseInt(pembuatSurat));
    if (!selectedUser) {
      Swal.fire({
        title: 'Validasi Gagal',
        text: 'Pembuat surat tidak valid!',
        icon: 'error',
        confirmButtonText: 'OK'
      });
      return;
    }

    // Create new surat object with automatic number
    // Use a proper integer ID instead of Date.now() which is too large for PostgreSQL integer
    const maxId = surat.length > 0 ? Math.max(...surat.map(s => s.id)) : 0;
    const newSurat = {
      id: maxId + 1, // Use incremental ID based on existing data
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
      
      Swal.fire({
        title: 'Berhasil!',
        text: 'Surat berhasil disimpan!',
        icon: 'success',
        confirmButtonText: 'OK'
      });
    } catch (error) {
      console.error('Error saving surat:', error);
      Swal.fire({
        title: 'Error!',
        text: `Gagal menyimpan surat: ${error.message}`,
        icon: 'error',
        confirmButtonText: 'OK'
      });
    }
    
    // Reset form
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
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Input Surat Keluar Baru</h2>
            <p className="text-gray-600 mt-1">Lengkapi form di bawah untuk membuat surat keluar baru</p>
          </div>
          <div className="bg-blue-50 p-3 rounded-full">
            <i className="fas fa-plus-circle text-blue-600 text-2xl"></i>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Kategori Section */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Kategori Surat</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Kategori Utama</label>
                <select 
                  value={kategoriUtama}
                  onChange={handleKategoriUtamaChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                  required
                >
                  <option value="">Pilih Kategori</option>
                  {Object.entries(kategoriData).map(([key, value]) => (
                    <option key={key} value={key}>
                      {key} - {value.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sub Kategori</label>
                <select 
                  value={subKategori}
                  onChange={handleSubKategoriChange}
                  disabled={subKategoriDisabled}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                  required={!subKategoriDisabled}
                >
                  <option value="">Pilih Sub Kategori</option>
                  {subKategoriOptions.map(option => (
                    <option key={option.key} value={option.key}>
                      {option.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rincian</label>
                <select 
                  value={rincian}
                  onChange={handleRincianChange}
                  disabled={rincianDisabled}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                  required={!rincianDisabled}
                >
                  <option value="">Pilih Rincian</option>
                  {rincianOptions.map(option => (
                    <option key={option.key} value={option.key}>
                      {option.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Nomor Surat Preview */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
            <label className="block text-sm font-medium text-gray-700 mb-3">Nomor Surat (Otomatis)</label>
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <i className="fas fa-hashtag text-white"></i>
              </div>
              <div className="text-xl lg:text-2xl font-mono text-blue-600 font-bold break-all">
                {nomorSurat}
              </div>
            </div>
          </div>

          {/* Detail Surat Section */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Detail Surat</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tujuan Surat</label>
                <input 
                  type="text" 
                  value={tujuanSurat}
                  onChange={(e) => setTujuanSurat(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                  required 
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6 mt-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Pembuat Surat</label>
                <select 
                  value={pembuatSurat}
                  onChange={handlePembuatSuratChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                  required
                >
                  <option value="">Pilih Pembuat Surat</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id.toString()}>
                      {user.nama} - {user.jabatan}
                    </option>
                  ))}
                </select>
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                placeholder="Masukkan perihal atau keterangan surat" 
                required
              ></textarea>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4">
            <button 
              type="button" 
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              onClick={() => {
                // Reset form
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
              }}
            >
              <i className="fas fa-times mr-2"></i>Batal
            </button>
            <button 
              type="submit" 
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg"
            >
              <i className="fas fa-save mr-2"></i>Simpan Surat
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}