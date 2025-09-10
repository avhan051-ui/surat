-- Create surat_masuk table
CREATE TABLE IF NOT EXISTS surat_masuk (
    id SERIAL PRIMARY KEY,
    nomor VARCHAR(255) NOT NULL,
    tanggal DATE NOT NULL,
    pengirim VARCHAR(255) NOT NULL,
    perihal TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);