-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    nama VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    nip VARCHAR(18) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    pangkat_gol VARCHAR(255),
    jabatan VARCHAR(255),
    role VARCHAR(50),
    last_login TIMESTAMP,
    created_at DATE
);

-- Create surat table
CREATE TABLE IF NOT EXISTS surat (
    id SERIAL PRIMARY KEY,
    nomor VARCHAR(255) NOT NULL,
    tanggal DATE NOT NULL,
    tujuan VARCHAR(255) NOT NULL,
    perihal TEXT,
    pembuat VARCHAR(255) NOT NULL,
    pembuat_id INTEGER,
    kategori VARCHAR(50),
    full_kategori VARCHAR(50)
);

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    sub JSONB
);

-- Insert initial users data
INSERT INTO users (id, nama, email, nip, password, pangkat_gol, jabatan, role, last_login, created_at) VALUES
(1, 'Ahmad Wijaya', 'ahmad.wijaya@example.com', '196801011990031001', '123', 'Pembina Tk.I / IV.b', 'Kepala Bagian IT', 'Administrator', '2025-01-20 09:30:00', '2025-01-01'),
(2, 'Siti Nurhaliza', 'siti.nurhaliza@example.com', '197205151995032002', '123', 'Penata / III.c', 'Staff Administrasi', 'Operator', '2025-01-20 08:15:00', '2025-01-02'),
(3, 'Dr. Budi Santoso', 'budi.santoso@example.com', '198003102005011003', '123', 'Pembina / IV.a', 'Dokter Ahli Pertama', 'User', '2025-01-19 16:45:00', '2025-01-03')
ON CONFLICT (nip) DO NOTHING;

-- Insert initial surat data
INSERT INTO surat (id, nomor, tanggal, tujuan, perihal, pembuat, pembuat_id, kategori, full_kategori) VALUES
(1, '500.6.1.1/001/2025', '2025-01-15', 'Dinas Pertanian Kabupaten', 'Laporan Program Bantuan Bibit Padi', 'Ahmad Wijaya', 1, '500.6', '500.6.1.1'),
(2, '400.5.1.2/001/2025', '2025-01-16', 'Dinas Pendidikan Provinsi', 'Usulan Revisi Kurikulum Lokal', 'Siti Nurhaliza', 2, '400.5', '400.5.1.2'),
(3, '300.4.1.1/001/2025', '2025-01-17', 'Puskesmas Kecamatan', 'Koordinasi Program Imunisasi', 'Dr. Budi Santoso', 3, '300.4', '300.4.1.1'),
(4, '500.6.2.1/002/2025', '2025-01-18', 'Balai Penyuluhan Pertanian', 'Program Pelatihan Petani Modern', 'Ahmad Wijaya', 1, '500.6', '500.6.2.1'),
(5, '400.5.1.1/002/2025', '2025-01-19', 'Sekolah Dasar Negeri 1', 'Bantuan Sarana Pembelajaran', 'Siti Nurhaliza', 2, '400.5', '400.5.1.1')
ON CONFLICT (id) DO NOTHING;

-- Insert initial categories data
INSERT INTO categories (id, name, sub) VALUES
('500.6', 'Pertanian', '{"1": {"name": "Kebijakan di Bidang Pertanian", "rincian": {"1": "Kebijakan Umum Pertanian", "2": "Regulasi Pertanian", "3": "Program Pertanian"}}, "2": {"name": "Pengembangan Pertanian", "rincian": {"1": "Inovasi Teknologi", "2": "Pelatihan Petani", "3": "Bantuan Alat"}}}'),
('400.5', 'Pendidikan', '{"1": {"name": "Kebijakan Pendidikan", "rincian": {"1": "Kurikulum", "2": "Standar Pendidikan", "3": "Evaluasi"}}, "2": {"name": "Sarana Prasarana", "rincian": {"1": "Pembangunan Sekolah", "2": "Peralatan", "3": "Maintenance"}}}'),
('300.4', 'Kesehatan', '{"1": {"name": "Pelayanan Kesehatan", "rincian": {"1": "Puskesmas", "2": "Rumah Sakit", "3": "Posyandu"}}}'),
('200.3', 'Infrastruktur', '{"1": {"name": "Jalan dan Jembatan", "rincian": {"1": "Pembangunan Jalan", "2": "Perbaikan Jalan", "3": "Jembatan"}}}')
ON CONFLICT (id) DO NOTHING;