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
  kategoriData: { [key: string]: Kategori };
  currentUser: User | null;
  addUser: (user: User) => void;
  updateUser: (id: number, user: User) => void;
  deleteUser: (id: number) => void;
  addSurat: (surat: Surat) => void;
  updateSurat: (id: number, surat: Surat) => void;
  deleteSurat: (id: number) => void;
  setCurrentUser: (user: User | null) => void;
  logout: () => void;
}

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

const kategoriData = {
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

// Create context
const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider component
export function AppProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [surat, setSurat] = useState<Surat[]>(initialSurat);
  const [currentUser, setCurrentUserState] = useState<User | null>(null);

  // Load data from PostgreSQL on initial render
  useEffect(() => {
    const fetchData = async () => {
      try {
        // In a real implementation, you would fetch from PostgreSQL here
        // For now, we'll use the initial data
        console.log('Fetching data from PostgreSQL...');
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

  const addSurat = (newSurat: Surat) => {
    setSurat(prev => [...prev, newSurat]);
    // In a real implementation, you would also save to PostgreSQL
  };

  const updateSurat = (id: number, updatedSurat: Surat) => {
    setSurat(prev => prev.map(s => s.id === id ? updatedSurat : s));
    // In a real implementation, you would also update in PostgreSQL
  };

  const deleteSurat = (id: number) => {
    setSurat(prev => prev.filter(s => s.id !== id));
    // In a real implementation, you would also delete from PostgreSQL
  };

  const setCurrentUser = (user: User | null) => {
    setCurrentUserState(user);
    if (user) {
      // Set cookie for authentication
      document.cookie = `currentUser=${JSON.stringify(user)}; path=/; max-age=24*60*60`;
    } else {
      // Remove cookie
      document.cookie = 'currentUser=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    }
  };

  const logout = () => {
    setCurrentUser(null);
    // Redirect to login page
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  };

  return (
    <AppContext.Provider value={{
      users,
      surat,
      kategoriData,
      currentUser,
      addUser,
      updateUser,
      deleteUser,
      addSurat,
      updateSurat,
      deleteSurat,
      setCurrentUser,
      logout
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