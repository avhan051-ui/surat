-- Create tables for the application

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  nama VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  nip VARCHAR(18) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  pangkat_gol VARCHAR(255) NOT NULL,
  jabatan VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL,
  last_login TIMESTAMP,
  created_at DATE DEFAULT CURRENT_DATE
);

-- Create surat table
CREATE TABLE IF NOT EXISTS surat (
  id SERIAL PRIMARY KEY,
  nomor VARCHAR(100) NOT NULL,
  tanggal DATE NOT NULL,
  tujuan VARCHAR(255) NOT NULL,
  perihal TEXT NOT NULL,
  pembuat VARCHAR(255) NOT NULL,
  pembuat_id INTEGER NOT NULL,
  kategori VARCHAR(50) NOT NULL,
  full_kategori VARCHAR(50) NOT NULL
);

-- Create surat_masuk table
CREATE TABLE IF NOT EXISTS surat_masuk (
  id SERIAL PRIMARY KEY,
  nomor VARCHAR(100) NOT NULL,
  tanggal DATE NOT NULL,
  pengirim VARCHAR(255) NOT NULL,
  perihal TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  file_path VARCHAR(500),
  file_name VARCHAR(255),
  file_type VARCHAR(100),
  file_size INTEGER
);

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  sub JSONB NOT NULL
);

-- Insert initial categories data
INSERT INTO categories (id, name, sub) VALUES 
('500.6', 'Pertanian', '{"1": {"name": "Kebijakan di Bidang Pertanian", "rincian": {"1": "Kebijakan Umum Pertanian", "2": "Regulasi Pertanian", "3": "Program Pertanian"}}, "2": {"name": "Pengembangan Pertanian", "rincian": {"1": "Inovasi Teknologi", "2": "Pelatihan Petani", "3": "Bantuan Alat"}}}'),
('400.5', 'Pendidikan', '{"1": {"name": "Kebijakan Pendidikan", "rincian": {"1": "Kurikulum", "2": "Standar Pendidikan", "3": "Evaluasi"}}, "2": {"name": "Sarana Prasarana", "rincian": {"1": "Pembangunan Sekolah", "2": "Peralatan", "3": "Maintenance"}}}'),
('300.4', 'Kesehatan', '{"1": {"name": "Pelayanan Kesehatan", "rincian": {"1": "Puskesmas", "2": "Rumah Sakit", "3": "Posyandu"}}}'),
('200.3', 'Infrastruktur', '{"1": {"name": "Jalan dan Jembatan", "rincian": {"1": "Pembangunan Jalan", "2": "Perbaikan Jalan", "3": "Jembatan"}}}')
ON CONFLICT (id) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_nip ON users(nip);
CREATE INDEX IF NOT EXISTS idx_surat_tanggal ON surat(tanggal);
CREATE INDEX IF NOT EXISTS idx_surat_kategori ON surat(kategori);
CREATE INDEX IF NOT EXISTS idx_surat_masuk_tanggal ON surat_masuk(tanggal);