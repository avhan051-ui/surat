-- Add columns for file attachment to surat_masuk table
ALTER TABLE surat_masuk 
ADD COLUMN file_path VARCHAR(255),
ADD COLUMN file_name VARCHAR(255),
ADD COLUMN file_type VARCHAR(50),
ADD COLUMN file_size INTEGER;