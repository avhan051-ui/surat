-- Add a new column with a temporary name
ALTER TABLE surat ADD COLUMN new_id SERIAL;

-- Copy data from old id column to new_id column (if you want to preserve existing IDs)
-- UPDATE surat SET new_id = id;

-- Remove the old primary key constraint
ALTER TABLE surat DROP CONSTRAINT surat_pkey;

-- Remove the old id column
ALTER TABLE surat DROP COLUMN id;

-- Rename new_id to id
ALTER TABLE surat RENAME COLUMN new_id TO id;

-- Add the primary key constraint
ALTER TABLE surat ADD PRIMARY KEY (id);

-- Set the sequence to the correct value
SELECT setval(pg_get_serial_sequence('surat', 'id'), coalesce(max(id), 0) + 1, false) FROM surat;