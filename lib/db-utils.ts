import pool from '../lib/db';
import { User, Surat, Kategori } from '../app/context/AppContext';

// User operations
export async function getUsers(): Promise<User[]> {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT * FROM users ORDER BY id');
    return result.rows.map(row => ({
      id: row.id,
      nama: row.nama,
      email: row.email,
      nip: row.nip,
      password: row.password,
      pangkatGol: row.pangkat_gol,
      jabatan: row.jabatan,
      role: row.role,
      lastLogin: row.last_login,
      createdAt: row.created_at
    }));
  } finally {
    client.release();
  }
}

export async function getUserByNip(nip: string): Promise<User | null> {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT * FROM users WHERE nip = $1', [nip]);
    if (result.rows.length === 0) return null;
    
    const row = result.rows[0];
    return {
      id: row.id,
      nama: row.nama,
      email: row.email,
      nip: row.nip,
      password: row.password,
      pangkatGol: row.pangkat_gol,
      jabatan: row.jabatan,
      role: row.role,
      lastLogin: row.last_login,
      createdAt: row.created_at
    };
  } finally {
    client.release();
  }
}

export async function createUser(user: User): Promise<User> {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `INSERT INTO users (id, nama, email, nip, password, pangkat_gol, jabatan, role, last_login, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        user.id,
        user.nama,
        user.email,
        user.nip,
        user.password,
        user.pangkatGol,
        user.jabatan,
        user.role,
        user.lastLogin,
        user.createdAt
      ]
    );
    
    const row = result.rows[0];
    return {
      id: row.id,
      nama: row.nama,
      email: row.email,
      nip: row.nip,
      password: row.password,
      pangkatGol: row.pangkat_gol,
      jabatan: row.jabatan,
      role: row.role,
      lastLogin: row.last_login,
      createdAt: row.created_at
    };
  } finally {
    client.release();
  }
}

export async function updateUser(id: number, user: User): Promise<User> {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `UPDATE users 
       SET nama = $1, email = $2, nip = $3, password = $4, pangkat_gol = $5, jabatan = $6, role = $7, last_login = $8, created_at = $9
       WHERE id = $10
       RETURNING *`,
      [
        user.nama,
        user.email,
        user.nip,
        user.password,
        user.pangkatGol,
        user.jabatan,
        user.role,
        user.lastLogin,
        user.createdAt,
        id
      ]
    );
    
    const row = result.rows[0];
    return {
      id: row.id,
      nama: row.nama,
      email: row.email,
      nip: row.nip,
      password: row.password,
      pangkatGol: row.pangkat_gol,
      jabatan: row.jabatan,
      role: row.role,
      lastLogin: row.last_login,
      createdAt: row.created_at
    };
  } finally {
    client.release();
  }
}

export async function deleteUser(id: number): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query('DELETE FROM users WHERE id = $1', [id]);
  } finally {
    client.release();
  }
}

// Surat operations
export async function getSurat(): Promise<Surat[]> {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT * FROM surat ORDER BY id');
    return result.rows.map(row => ({
      id: row.id,
      nomor: row.nomor,
      tanggal: row.tanggal,
      tujuan: row.tujuan,
      perihal: row.perihal,
      pembuat: row.pembuat,
      pembuatId: row.pembuat_id,
      kategori: row.kategori,
      fullKategori: row.full_kategori
    }));
  } finally {
    client.release();
  }
}

export async function createSurat(surat: Surat): Promise<Surat> {
  const client = await pool.connect();
  try {
    console.log('Creating surat with data:', surat);
    
    // Exclude the ID from the INSERT statement to let the database auto-generate it
    const result = await client.query(
      `INSERT INTO surat (nomor, tanggal, tujuan, perihal, pembuat, pembuat_id, kategori, full_kategori)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        surat.nomor,
        surat.tanggal,
        surat.tujuan,
        surat.perihal,
        surat.pembuat,
        surat.pembuatId,
        surat.kategori,
        surat.fullKategori
      ]
    );
    
    const row = result.rows[0];
    console.log('Created surat row:', row);
    
    return {
      id: row.id,
      nomor: row.nomor,
      tanggal: row.tanggal,
      tujuan: row.tujuan,
      perihal: row.perihal,
      pembuat: row.pembuat,
      pembuatId: row.pembuat_id,
      kategori: row.kategori,
      fullKategori: row.full_kategori
    };
  } catch (error) {
    console.error('Database error creating surat:', error);
    throw error;
  } finally {
    client.release();
  }
}

export async function updateSuratById(id: number, surat: Surat): Promise<Surat> {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `UPDATE surat 
       SET nomor = $1, tanggal = $2, tujuan = $3, perihal = $4, pembuat = $5, pembuat_id = $6, kategori = $7, full_kategori = $8
       WHERE id = $9
       RETURNING *`,
      [
        surat.nomor,
        surat.tanggal,
        surat.tujuan,
        surat.perihal,
        surat.pembuat,
        surat.pembuatId,
        surat.kategori,
        surat.fullKategori,
        id
      ]
    );
    
    const row = result.rows[0];
    return {
      id: row.id,
      nomor: row.nomor,
      tanggal: row.tanggal,
      tujuan: row.tujuan,
      perihal: row.perihal,
      pembuat: row.pembuat,
      pembuatId: row.pembuat_id,
      kategori: row.kategori,
      fullKategori: row.full_kategori
    };
  } finally {
    client.release();
  }
}

export async function deleteSuratById(id: number): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query('DELETE FROM surat WHERE id = $1', [id]);
  } finally {
    client.release();
  }
}

// Category operations
export async function getCategories(): Promise<{[key: string]: Kategori}> {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT * FROM categories');
    const categories: {[key: string]: Kategori} = {};
    
    result.rows.forEach(row => {
      categories[row.id] = {
        name: row.name,
        sub: row.sub
      };
    });
    
    return categories;
  } finally {
    client.release();
  }
}