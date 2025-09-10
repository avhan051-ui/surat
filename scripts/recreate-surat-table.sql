-- Drop and recreate surat table
DROP TABLE IF EXISTS surat CASCADE;

-- Create surat table
CREATE TABLE surat (
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

-- Recreate any necessary indexes or constraints here if needed