-- Reset the sequence for surat table id column
SELECT setval(pg_get_serial_sequence('surat', 'id'), coalesce(max(id), 0) + 1, false) FROM surat;