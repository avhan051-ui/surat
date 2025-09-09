import pool from '../lib/db';

async function seedDatabase() {
  const client = await pool.connect();
  
  try {
    // Insert initial users
    const users = [
      {
        id: 1,
        nama: "Ahmad Wijaya",
        email: "ahmad.wijaya@example.com",
        nip: "196801011990031001",
        password: "123",
        pangkat_gol: "Pembina Tk.I / IV.b",
        jabatan: "Kepala Bagian IT",
        role: "Administrator",
        last_login: "2025-01-20 09:30:00",
        created_at: "2025-01-01"
      },
      {
        id: 2,
        nama: "Siti Nurhaliza",
        email: "siti.nurhaliza@example.com",
        nip: "197205151995032002",
        password: "123",
        pangkat_gol: "Penata / III.c",
        jabatan: "Staff Administrasi",
        role: "Operator",
        last_login: "2025-01-20 08:15:00",
        created_at: "2025-01-02"
      },
      {
        id: 3,
        nama: "Dr. Budi Santoso",
        email: "budi.santoso@example.com",
        nip: "198003102005011003",
        password: "123",
        pangkat_gol: "Pembina / IV.a",
        jabatan: "Dokter Ahli Pertama",
        role: "User",
        last_login: "2025-01-19 16:45:00",
        created_at: "2025-01-03"
      }
    ];
    
    for (const user of users) {
      await client.query(
        `INSERT INTO users (id, nama, email, nip, password, pangkat_gol, jabatan, role, last_login, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         ON CONFLICT (id) DO UPDATE SET
         nama = EXCLUDED.nama,
         email = EXCLUDED.email,
         nip = EXCLUDED.nip,
         password = EXCLUDED.password,
         pangkat_gol = EXCLUDED.pangkat_gol,
         jabatan = EXCLUDED.jabatan,
         role = EXCLUDED.role,
         last_login = EXCLUDED.last_login,
         created_at = EXCLUDED.created_at`,
        [
          user.id,
          user.nama,
          user.email,
          user.nip,
          user.password,
          user.pangkat_gol,
          user.jabatan,
          user.role,
          user.last_login,
          user.created_at
        ]
      );
    }
    
    // Insert initial categories
    const categories = [
      {
        id: "500.6",
        name: "Pertanian",
        sub: JSON.stringify({
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
        })
      },
      {
        id: "400.5",
        name: "Pendidikan",
        sub: JSON.stringify({
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
        })
      },
      {
        id: "300.4",
        name: "Kesehatan",
        sub: JSON.stringify({
          "1": {
            name: "Pelayanan Kesehatan",
            rincian: {
              "1": "Puskesmas",
              "2": "Rumah Sakit",
              "3": "Posyandu"
            }
          }
        })
      },
      {
        id: "200.3",
        name: "Infrastruktur",
        sub: JSON.stringify({
          "1": {
            name: "Jalan dan Jembatan",
            rincian: {
              "1": "Pembangunan Jalan",
              "2": "Perbaikan Jalan",
              "3": "Jembatan"
            }
          }
        })
      }
    ];
    
    for (const category of categories) {
      await client.query(
        `INSERT INTO categories (id, name, sub)
         VALUES ($1, $2, $3)
         ON CONFLICT (id) DO UPDATE SET
         name = EXCLUDED.name,
         sub = EXCLUDED.sub`,
        [category.id, category.name, category.sub]
      );
    }
    
    // Insert initial surat
    const surat = [
      {
        id: 1,
        nomor: "500.6.1.1/001/2025",
        tanggal: "2025-01-15",
        tujuan: "Dinas Pertanian Kabupaten",
        perihal: "Laporan Program Bantuan Bibit Padi",
        pembuat: "Ahmad Wijaya",
        pembuat_id: 1,
        kategori: "500.6",
        full_kategori: "500.6.1.1"
      },
      {
        id: 2,
        nomor: "400.5.1.2/001/2025",
        tanggal: "2025-01-16",
        tujuan: "Dinas Pendidikan Provinsi",
        perihal: "Usulan Revisi Kurikulum Lokal",
        pembuat: "Siti Nurhaliza",
        pembuat_id: 2,
        kategori: "400.5",
        full_kategori: "400.5.1.2"
      },
      {
        id: 3,
        nomor: "300.4.1.1/001/2025",
        tanggal: "2025-01-17",
        tujuan: "Puskesmas Kecamatan",
        perihal: "Koordinasi Program Imunisasi",
        pembuat: "Dr. Budi Santoso",
        pembuat_id: 3,
        kategori: "300.4",
        full_kategori: "300.4.1.1"
      },
      {
        id: 4,
        nomor: "500.6.2.1/002/2025",
        tanggal: "2025-01-18",
        tujuan: "Balai Penyuluhan Pertanian",
        perihal: "Program Pelatihan Petani Modern",
        pembuat: "Ahmad Wijaya",
        pembuat_id: 1,
        kategori: "500.6",
        full_kategori: "500.6.2.1"
      },
      {
        id: 5,
        nomor: "400.5.1.1/002/2025",
        tanggal: "2025-01-19",
        tujuan: "Sekolah Dasar Negeri 1",
        perihal: "Bantuan Sarana Pembelajaran",
        pembuat: "Siti Nurhaliza",
        pembuat_id: 2,
        kategori: "400.5",
        full_kategori: "400.5.1.1"
      }
    ];
    
    for (const s of surat) {
      await client.query(
        `INSERT INTO surat (id, nomor, tanggal, tujuan, perihal, pembuat, pembuat_id, kategori, full_kategori)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT (id) DO UPDATE SET
         nomor = EXCLUDED.nomor,
         tanggal = EXCLUDED.tanggal,
         tujuan = EXCLUDED.tujuan,
         perihal = EXCLUDED.perihal,
         pembuat = EXCLUDED.pembuat,
         pembuat_id = EXCLUDED.pembuat_id,
         kategori = EXCLUDED.kategori,
         full_kategori = EXCLUDED.full_kategori`,
        [s.id, s.nomor, s.tanggal, s.tujuan, s.perihal, s.pembuat, s.pembuat_id, s.kategori, s.full_kategori]
      );
    }
    
    console.log('Database seeded successfully');
  } catch (err) {
    console.error('Error seeding database:', err);
  } finally {
    client.release();
  }
}

seedDatabase();