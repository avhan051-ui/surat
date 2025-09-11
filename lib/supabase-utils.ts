import { supabase } from '@/lib/supabase-client';
import { User, Surat, SuratMasuk, Kategori } from '@/app/context/AppContext';

// User operations
export async function getUsers(): Promise<User[]> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('id');

    if (error) {
      console.error('Error fetching users:', error);
      throw error;
    }

    return data.map(row => ({
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
  } catch (error) {
    console.error('Database error fetching users:', error);
    throw error;
  }
}

export async function getUserByNip(nip: string): Promise<User | null> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('nip', nip)
      .single();

    if (error) {
      console.error('Error fetching user by NIP:', error);
      return null;
    }

    if (!data) return null;

    return {
      id: data.id,
      nama: data.nama,
      email: data.email,
      nip: data.nip,
      password: data.password,
      pangkatGol: data.pangkat_gol,
      jabatan: data.jabatan,
      role: data.role,
      lastLogin: data.last_login,
      createdAt: data.created_at
    };
  } catch (error) {
    console.error('Database error fetching user by NIP:', error);
    throw error;
  }
}

export async function createUser(user: User): Promise<User> {
  try {
    const { data, error } = await supabase
      .from('users')
      .insert({
        nama: user.nama,
        email: user.email || null,
        nip: user.nip,
        password: user.password,
        pangkat_gol: user.pangkatGol,
        jabatan: user.jabatan,
        role: user.role,
        last_login: user.lastLogin || null,
        created_at: user.createdAt || new Date().toISOString().split('T')[0]
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating user:', error);
      throw error;
    }

    return {
      id: data.id,
      nama: data.nama,
      email: data.email,
      nip: data.nip,
      password: data.password,
      pangkatGol: data.pangkat_gol,
      jabatan: data.jabatan,
      role: data.role,
      lastLogin: data.last_login,
      createdAt: data.created_at
    };
  } catch (error) {
    console.error('Database error creating user:', error);
    throw error;
  }
}

export async function updateUser(id: number, user: User): Promise<User> {
  try {
    const { data, error } = await supabase
      .from('users')
      .update({
        nama: user.nama,
        email: user.email,
        nip: user.nip,
        password: user.password,
        pangkat_gol: user.pangkatGol,
        jabatan: user.jabatan,
        role: user.role,
        last_login: user.lastLogin,
        created_at: user.createdAt
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating user:', error);
      throw error;
    }

    return {
      id: data.id,
      nama: data.nama,
      email: data.email,
      nip: data.nip,
      password: data.password,
      pangkatGol: data.pangkat_gol,
      jabatan: data.jabatan,
      role: data.role,
      lastLogin: data.last_login,
      createdAt: data.created_at
    };
  } catch (error) {
    console.error('Database error updating user:', error);
    throw error;
  }
}

export async function deleteUser(id: number): Promise<void> {
  try {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  } catch (error) {
    console.error('Database error deleting user:', error);
    throw error;
  }
}

// Surat operations
export async function getSurat(): Promise<Surat[]> {
  try {
    const { data, error } = await supabase
      .from('surat')
      .select('*')
      .order('id');

    if (error) {
      console.error('Error fetching surat:', error);
      throw error;
    }

    return data.map(row => ({
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
  } catch (error) {
    console.error('Database error fetching surat:', error);
    throw error;
  }
}

export async function createSurat(surat: Surat): Promise<Surat> {
  try {
    const { data, error } = await supabase
      .from('surat')
      .insert({
        nomor: surat.nomor,
        tanggal: surat.tanggal,
        tujuan: surat.tujuan,
        perihal: surat.perihal,
        pembuat: surat.pembuat,
        pembuat_id: surat.pembuatId,
        kategori: surat.kategori,
        full_kategori: surat.fullKategori
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating surat:', error);
      throw error;
    }

    return {
      id: data.id,
      nomor: data.nomor,
      tanggal: data.tanggal,
      tujuan: data.tujuan,
      perihal: data.perihal,
      pembuat: data.pembuat,
      pembuatId: data.pembuat_id,
      kategori: data.kategori,
      fullKategori: data.full_kategori
    };
  } catch (error) {
    console.error('Database error creating surat:', error);
    throw error;
  }
}

export async function updateSuratById(id: number, surat: Surat): Promise<Surat> {
  try {
    const { data, error } = await supabase
      .from('surat')
      .update({
        nomor: surat.nomor,
        tanggal: surat.tanggal,
        tujuan: surat.tujuan,
        perihal: surat.perihal,
        pembuat: surat.pembuat,
        pembuat_id: surat.pembuatId,
        kategori: surat.kategori,
        full_kategori: surat.fullKategori
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating surat:', error);
      throw error;
    }

    return {
      id: data.id,
      nomor: data.nomor,
      tanggal: data.tanggal,
      tujuan: data.tujuan,
      perihal: data.perihal,
      pembuat: data.pembuat,
      pembuatId: data.pembuat_id,
      kategori: data.kategori,
      fullKategori: data.full_kategori
    };
  } catch (error) {
    console.error('Database error updating surat:', error);
    throw error;
  }
}

export async function deleteSuratById(id: number): Promise<void> {
  try {
    const { error } = await supabase
      .from('surat')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting surat:', error);
      throw error;
    }
  } catch (error) {
    console.error('Database error deleting surat:', error);
    throw error;
  }
}

// Category operations
export async function getCategories(): Promise<{[key: string]: Kategori}> {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*');

    if (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }

    const categories: {[key: string]: Kategori} = {};
    data.forEach(row => {
      categories[row.id] = {
        name: row.name,
        sub: row.sub
      };
    });

    return categories;
  } catch (error) {
    console.error('Database error fetching categories:', error);
    throw error;
  }
}

// Get kategori data (alias for getCategories)
export async function getKategoriData(): Promise<{[key: string]: Kategori}> {
  return await getCategories();
}

// Update kategori data
export async function updateKategoriData(kategoriData: {[key: string]: Kategori}): Promise<void> {
  try {
    // Delete existing categories
    const { error: deleteError } = await supabase
      .from('categories')
      .delete();

    if (deleteError) {
      console.error('Error deleting categories:', deleteError);
      throw deleteError;
    }

    // Insert new categories
    const categoriesToInsert = Object.entries(kategoriData).map(([id, kategori]) => ({
      id,
      name: kategori.name,
      sub: kategori.sub
    }));

    const { error: insertError } = await supabase
      .from('categories')
      .insert(categoriesToInsert);

    if (insertError) {
      console.error('Error inserting categories:', insertError);
      throw insertError;
    }
  } catch (error) {
    console.error('Database error updating kategori data:', error);
    throw error;
  }
}

// Surat Masuk operations
export async function getSuratMasuk(): Promise<SuratMasuk[]> {
  try {
    const { data, error } = await supabase
      .from('surat_masuk')
      .select('*')
      .order('id');

    if (error) {
      console.error('Error fetching surat masuk:', error);
      throw error;
    }

    return data.map(row => ({
      id: row.id,
      nomor: row.nomor,
      tanggal: row.tanggal,
      pengirim: row.pengirim,
      perihal: row.perihal,
      createdAt: row.created_at,
      filePath: row.file_path,
      fileName: row.file_name,
      fileType: row.file_type,
      fileSize: row.file_size
    }));
  } catch (error) {
    console.error('Database error fetching surat masuk:', error);
    throw error;
  }
}

export async function createSuratMasuk(suratMasuk: Omit<SuratMasuk, 'id' | 'createdAt'>): Promise<SuratMasuk> {
  try {
    const { data, error } = await supabase
      .from('surat_masuk')
      .insert({
        nomor: suratMasuk.nomor,
        tanggal: suratMasuk.tanggal,
        pengirim: suratMasuk.pengirim,
        perihal: suratMasuk.perihal,
        file_path: suratMasuk.filePath || null,
        file_name: suratMasuk.fileName || null,
        file_type: suratMasuk.fileType || null,
        file_size: suratMasuk.fileSize || null
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating surat masuk:', error);
      throw error;
    }

    return {
      id: data.id,
      nomor: data.nomor,
      tanggal: data.tanggal,
      pengirim: data.pengirim,
      perihal: data.perihal,
      createdAt: data.created_at,
      filePath: data.file_path,
      fileName: data.file_name,
      fileType: data.file_type,
      fileSize: data.file_size
    };
  } catch (error) {
    console.error('Database error creating surat masuk:', error);
    throw error;
  }
}

export async function updateSuratMasukById(id: number, suratMasuk: Omit<SuratMasuk, 'id' | 'createdAt'>): Promise<SuratMasuk> {
  try {
    const { data, error } = await supabase
      .from('surat_masuk')
      .update({
        nomor: suratMasuk.nomor,
        tanggal: suratMasuk.tanggal,
        pengirim: suratMasuk.pengirim,
        perihal: suratMasuk.perihal,
        file_path: suratMasuk.filePath || null,
        file_name: suratMasuk.fileName || null,
        file_type: suratMasuk.fileType || null,
        file_size: suratMasuk.fileSize || null
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating surat masuk:', error);
      throw error;
    }

    return {
      id: data.id,
      nomor: data.nomor,
      tanggal: data.tanggal,
      pengirim: data.pengirim,
      perihal: data.perihal,
      createdAt: data.created_at,
      filePath: data.file_path,
      fileName: data.file_name,
      fileType: data.file_type,
      fileSize: data.file_size
    };
  } catch (error) {
    console.error('Database error updating surat masuk:', error);
    throw error;
  }
}

export async function deleteSuratMasukById(id: number): Promise<void> {
  try {
    const { error } = await supabase
      .from('surat_masuk')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting surat masuk:', error);
      throw error;
    }
  } catch (error) {
    console.error('Database error deleting surat masuk:', error);
    throw error;
  }
}