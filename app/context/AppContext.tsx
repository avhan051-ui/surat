'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import pool from '@/lib/db';

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

interface Surat {
  id: number;
  nomor: string;
  tanggal: string;
  tujuan: string;
  perihal: string;
  pembuat: string;
  pembuatId: number;
  kategori: string;
  fullKategori: string;
}

interface SuratMasuk {
  id: number;
  nomor: string;
  tanggal: string;
  pengirim: string;
  perihal: string;
  createdAt: string;
}

interface Kategori {
  name: string;
  sub: {
    [key: string]: {
      name: string;
      rincian: {
        [key: string]: string;
      };
    };
  };
}

interface AppContextType {
  users: User[];
  surat: Surat[];
  suratMasuk: SuratMasuk[];
  kategoriData: { [key: string]: Kategori };
  currentUser: User | null;
  addUser: (user: User) => void;
  updateUser: (id: number, user: User) => void;
  deleteUser: (id: number) => void;
  addSurat: (surat: Surat) => Promise<void>;
  updateSurat: (id: number, surat: Surat) => Promise<void>;
  deleteSurat: (id: number) => Promise<void>;
  addSuratMasuk: (suratMasuk: Omit<SuratMasuk, 'id' | 'createdAt'>) => Promise<void>;
  updateSuratMasuk: (id: number, suratMasuk: Omit<SuratMasuk, 'id' | 'createdAt'>) => Promise<void>;
  deleteSuratMasuk: (id: number) => Promise<void>;
  setCurrentUser: (user: User | null) => void;
  logout: () => void;
  updateKategoriData: (newKategoriData: { [key: string]: Kategori }) => void;
}

// Create the AppContext
const AppContext = createContext<AppContextType | undefined>(undefined);

// Initial data
const initialUsers: User[] = [
  {
    id: 1,
    nama: "Ahmad Wijaya",
    email: "ahmad.wijaya@example.com",
    nip: "196801011990031001",
    password: "123",
    pangkatGol: "Pembina Tk.I / IV.b",
    jabatan: "Kepala Bagian IT",
    role: "Administrator",
    lastLogin: "2025-01-20 09:30:00",
    createdAt: "2025-01-01"
  },
  {
    id: 2,
    nama: "Siti Nurhaliza",
    email: "siti.nurhaliza@example.com",
    nip: "197205151995032002",
    password: "123",
    pangkatGol: "Penata / III.c",
    jabatan: "Staff Administrasi",
    role: "Operator",
    lastLogin: "2025-01-20 08:15:00",
    createdAt: "2025-01-02"
  },
  {
    id: 3,
    nama: "Dr. Budi Santoso",
    email: "budi.santoso@example.com",
    nip: "198003102005011003",
    password: "123",
    pangkatGol: "Pembina / IV.a",
    jabatan: "Dokter Ahli Pertama",
    role: "User",
    lastLogin: "2025-01-19 16:45:00",
    createdAt: "2025-01-03"
  }
];

const initialSurat: Surat[] = [
  {
    id: 1,
    nomor: "500.6.1.1/001/2025",
    tanggal: "2025-01-15",
    tujuan: "Dinas Pertanian Kabupaten",
    perihal: "Laporan Program Bantuan Bibit Padi",
    pembuat: "Ahmad Wijaya",
    pembuatId: 1,
    kategori: "500.6",
    fullKategori: "500.6.1.1"
  },
  {
    id: 2,
    nomor: "400.5.1.2/001/2025",
    tanggal: "2025-01-16",
    tujuan: "Dinas Pendidikan Provinsi",
    perihal: "Usulan Revisi Kurikulum Lokal",
    pembuat: "Siti Nurhaliza",
    pembuatId: 2,
    kategori: "400.5",
    fullKategori: "400.5.1.2"
  },
  {
    id: 3,
    nomor: "300.4.1.1/001/2025",
    tanggal: "2025-01-17",
    tujuan: "Puskesmas Kecamatan",
    perihal: "Koordinasi Program Imunisasi",
    pembuat: "Dr. Budi Santoso",
    pembuatId: 3,
    kategori: "300.4",
    fullKategori: "300.4.1.1"
  },
  {
    id: 4,
    nomor: "500.6.2.1/002/2025",
    tanggal: "2025-01-18",
    tujuan: "Balai Penyuluhan Pertanian",
    perihal: "Program Pelatihan Petani Modern",
    pembuat: "Ahmad Wijaya",
    pembuatId: 1,
    kategori: "500.6",
    fullKategori: "500.6.2.1"
  },
  {
    id: 5,
    nomor: "400.5.1.1/002/2025",
    tanggal: "2025-01-19",
    tujuan: "Sekolah Dasar Negeri 1",
    perihal: "Bantuan Sarana Pembelajaran",
    pembuat: "Siti Nurhaliza",
    pembuatId: 2,
    kategori: "400.5",
    fullKategori: "400.5.1.1"
  }
];

const initialSuratMasuk: SuratMasuk[] = [
  {
    id: 1,
    nomor: "001/SM/2025",
    tanggal: "2025-01-10",
    pengirim: "Dinas Pendidikan Provinsi",
    perihal: "Undangan Rapat Koordinasi",
    createdAt: "2025-01-10"
  },
  {
    id: 2,
    nomor: "002/SM/2025",
    tanggal: "2025-01-12",
    pengirim: "Balai Penyuluhan Pertanian",
    perihal: "Permohonan Bantuan",
    createdAt: "2025-01-12"
  }
];

  const initialKategoriData = {
    "500.6": {
      name: "Pertanian",
      sub: {
        "1": {
          name: "Kebijakan di Bidang Pertanian",
          rincian: {
            "1": "Kebijakan Umum Pertanian",
            "2": "Regulasi Pertanian",
            "3": "Program Pertanian"
          }
        },
        "2": {
          name: "Pengembangan Pertanian",
          rincian: {
            "1": "Inovasi Teknologi",
            "2": "Pelatihan Petani",
            "3": "Bantuan Alat"
          }
        }
      }
    },
    "400.5": {
      name: "Pendidikan",
      sub: {
        "1": {
          name: "Kebijakan Pendidikan",
          rincian: {
            "1": "Kurikulum",
            "2": "Standar Pendidikan",
            "3": "Evaluasi"
          }
        },
        "2": {
          name: "Sarana Prasarana",
          rincian: {
            "1": "Pembangunan Sekolah",
            "2": "Peralatan",
            "3": "Maintenance"
          }
        }
      }
    },
    "300.4": {
      name: "Kesehatan",
      sub: {
        "1": {
          name: "Pelayanan Kesehatan",
          rincian: {
            "1": "Puskesmas",
            "2": "Rumah Sakit",
            "3": "Posyandu"
          }
        }
      }
    },
    "200.3": {
      name: "Infrastruktur",
      sub: {
        "1": {
          name: "Jalan dan Jembatan",
          rincian: {
            "1": "Pembangunan Jalan",
            "2": "Perbaikan Jalan",
            "3": "Jembatan"
          }
        }
      }
    }
  };

const kategoriData = initialKategoriData;

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [surat, setSurat] = useState<Surat[]>(initialSurat);
  const [suratMasuk, setSuratMasuk] = useState<SuratMasuk[]>(initialSuratMasuk);
  const [kategoriData, setKategoriData] = useState<{ [key: string]: Kategori }>(initialKategoriData);
  const [currentUserState, setCurrentUserState] = useState<User | null>(null);

  // Load data from PostgreSQL on initial render
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch surat data from the API
        const suratResponse = await fetch('/api/surat');
        if (suratResponse.ok) {
          const suratData = await suratResponse.json();
          setSurat(suratData);
        } else {
          console.error('Failed to fetch surat data:', suratResponse.statusText);
        }
        
        // Fetch surat masuk data from the API
        const suratMasukResponse = await fetch('/api/surat-masuk');
        if (suratMasukResponse.ok) {
          const suratMasukData = await suratMasukResponse.json();
          setSuratMasuk(suratMasukData);
        } else {
          console.error('Failed to fetch surat masuk data:', suratMasukResponse.statusText);
        }
        
        // Fetch users data from the API
        const usersResponse = await fetch('/api/users');
        if (usersResponse.ok) {
          const usersData = await usersResponse.json();
          setUsers(usersData);
        } else {
          console.error('Failed to fetch users data:', usersResponse.statusText);
        }
        
        // Fetch kategori data from the API
        const kategoriResponse = await fetch('/api/kategori');
        if (kategoriResponse.ok) {
          const kategoriData = await kategoriResponse.json();
          setKategoriData(kategoriData);
        } else {
          console.error('Failed to fetch kategori data:', kategoriResponse.statusText);
        }
      } catch (error) {
        console.error('Error fetching data from PostgreSQL:', error);
      }
    };

    fetchData();
    
    // Check for current user in cookie
    if (typeof window !== 'undefined') {
      const cookieValue = document.cookie
        .split('; ')
        .find(row => row.startsWith('currentUser='));
      
      if (cookieValue) {
        try {
          const user = JSON.parse(decodeURIComponent(cookieValue.split('=')[1]));
          setCurrentUserState(user);
        } catch (e) {
          console.error('Error parsing user from cookie:', e);
          // Clear invalid cookie
          document.cookie = 'currentUser=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        }
      }
    }
  }, []);

  const addUser = (user: User) => {
    setUsers(prev => [...prev, user]);
    // In a real implementation, you would also save to PostgreSQL
  };

  const updateUser = (id: number, updatedUser: User) => {
    setUsers(prev => prev.map(user => user.id === id ? updatedUser : user));
    // In a real implementation, you would also update in PostgreSQL
  };

  const deleteUser = (id: number) => {
    setUsers(prev => prev.filter(user => user.id !== id));
    // In a real implementation, you would also delete from PostgreSQL
  };

  const addSurat = async (newSurat: Surat) => {
    try {
      // Remove the id from newSurat to let the backend auto-generate it
      const { id, ...suratData } = newSurat;
      
      const response = await fetch('/api/surat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(suratData),
      });
      
      if (response.ok) {
        const createdSurat = await response.json();
        setSurat(prev => {
          const updatedSurat = [...prev, createdSurat];
          // Update all nomor urut after adding new surat
          return updateAllNomorUrut(updatedSurat);
        });
      } else {
        console.error('Failed to create surat:', response.statusText);
      }
    } catch (error) {
      console.error('Error creating surat:', error);
    }
  };

  // Fungsi untuk memperbarui nomor urut semua surat berdasarkan kategori utama
  const updateAllNomorUrut = (suratList: Surat[]) => {
    // Kelompokkan surat berdasarkan kategori utama
    const kategoriGroups: { [key: string]: Surat[] } = {};
    suratList.forEach(suratItem => {
      if (!kategoriGroups[suratItem.kategori]) {
        kategoriGroups[suratItem.kategori] = [];
      }
      kategoriGroups[suratItem.kategori].push(suratItem);
    });

    // Update nomor urut untuk setiap kategori
    Object.keys(kategoriGroups).forEach(kategori => {
      // Urutkan berdasarkan tanggal untuk konsistensi
      kategoriGroups[kategori].sort((a, b) => new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime());

      // Update nomor urut
      kategoriGroups[kategori].forEach((suratItem, index) => {
        const tahun = new Date(suratItem.tanggal).getFullYear();
        const nomorBaru = String(index + 1).padStart(3, '0');
        suratItem.nomor = `${suratItem.fullKategori}/${nomorBaru}/${tahun}`;
      });
    });

    // Flatten the groups back into a single array
    const updatedSurat: Surat[] = [];
    Object.values(kategoriGroups).forEach(group => {
      updatedSurat.push(...group);
    });

    return updatedSurat;
  };

  const updateSurat = async (id: number, updatedSurat: Surat) => {
    try {
      const response = await fetch('/api/surat', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, ...updatedSurat }),
      });
      
      if (response.ok) {
        const updatedSuratFromApi = await response.json();
        setSurat(prev => {
          const updatedList = prev.map(s => s.id === id ? updatedSuratFromApi : s);
          // Update all nomor urut after updating a surat
          return updateAllNomorUrut(updatedList);
        });
      } else {
        console.error('Failed to update surat:', response.statusText);
      }
    } catch (error) {
      console.error('Error updating surat:', error);
    }
  };

  const deleteSurat = async (id: number) => {
    try {
      const response = await fetch(`/api/surat?id=${id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setSurat(prev => {
          const filteredSurat = prev.filter(s => s.id !== id);
          // Update all nomor urut after deleting a surat
          return updateAllNomorUrut(filteredSurat);
        });
      } else {
        console.error('Failed to delete surat:', response.statusText);
      }
    } catch (error) {
      console.error('Error deleting surat:', error);
    }
  };

  const addSuratMasuk = async (newSuratMasuk: Omit<SuratMasuk, 'id' | 'createdAt'>) => {
    try {
      const response = await fetch('/api/surat-masuk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newSuratMasuk),
      });
      
      if (response.ok) {
        const createdSuratMasuk = await response.json();
        setSuratMasuk(prev => [...prev, createdSuratMasuk]);
      } else {
        console.error('Failed to create surat masuk:', response.statusText);
      }
    } catch (error) {
      console.error('Error creating surat masuk:', error);
    }
  };

  const updateSuratMasuk = async (id: number, updatedSuratMasuk: Omit<SuratMasuk, 'id' | 'createdAt'>) => {
    try {
      const response = await fetch('/api/surat-masuk', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, ...updatedSuratMasuk }),
      });
      
      if (response.ok) {
        const updatedSuratMasukFromApi = await response.json();
        setSuratMasuk(prev => prev.map(s => s.id === id ? updatedSuratMasukFromApi : s));
      } else {
        console.error('Failed to update surat masuk:', response.statusText);
      }
    } catch (error) {
      console.error('Error updating surat masuk:', error);
    }
  };

  const deleteSuratMasuk = async (id: number) => {
    try {
      const response = await fetch(`/api/surat-masuk?id=${id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setSuratMasuk(prev => prev.filter(s => s.id !== id));
      } else {
        console.error('Failed to delete surat masuk:', response.statusText);
      }
    } catch (error) {
      console.error('Error deleting surat masuk:', error);
    }
  };

  const setCurrentUser = (user: User | null) => {
    setCurrentUserState(user);
    
    if (typeof window !== 'undefined') {
      if (user) {
        // Set cookie for authentication with proper encoding
        const cookieValue = encodeURIComponent(JSON.stringify(user));
        document.cookie = `currentUser=${cookieValue}; path=/; max-age=24*60*60; SameSite=Lax`;
      } else {
        // Remove cookie
        document.cookie = 'currentUser=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      }
    }
  };

  const logout = () => {
    setCurrentUserState(null);
    // Remove cookie
    if (typeof window !== 'undefined') {
      document.cookie = 'currentUser=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      // Redirect to login page
      window.location.href = '/login';
    }
  };

  const updateKategoriData = (newKategoriData: { [key: string]: Kategori }) => {
    setKategoriData(newKategoriData);
  };

  return (
    <AppContext.Provider value={{
      users,
      surat,
      suratMasuk,
      kategoriData,
      currentUser: currentUserState,
      addUser,
      updateUser,
      deleteUser,
      addSurat,
      updateSurat,
      deleteSurat,
      addSuratMasuk,
      updateSuratMasuk,
      deleteSuratMasuk,
      setCurrentUser,
      updateKategoriData
    }}>
      {children}
    </AppContext.Provider>
  );
}

// Custom hook to use the context
export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}

// Export the provider and custom hook
export { AppProvider, useAppContext };