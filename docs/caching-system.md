# Sistem Caching Aplikasi SuratKu

## Gambaran Umum

Aplikasi SuratKu menggunakan sistem caching in-memory untuk meningkatkan kinerja dengan mengurangi jumlah permintaan ke database. Sistem caching ini menggunakan implementasi `EnhancedCache` yang menyimpan data dalam memori dengan mekanisme TTL (Time To Live).

## Komponen Utama

### 1. EnhancedCache (`/lib/cache-utils.ts`)

Implementasi cache in-memory yang ditingkatkan dengan fitur:
- Penyimpanan data dengan TTL
- Pembersihan otomatis entri yang kedaluwarsa
- Statistik penggunaan cache
- Penanganan error yang robust

### 2. Cache Management Utilities (`/lib/cache-management-utils.ts`)

Fungsi utilitas untuk mengelola cache secara terpusat:
- `invalidateAllCaches()` - Menghapus semua cache
- `invalidateCacheByType(type)` - Menghapus cache berdasarkan tipe data
- `getCacheStats()` - Mendapatkan statistik penggunaan cache
- `cleanExpiredCache()` - Membersihkan entri cache yang kedaluwarsa

## Endpoint yang Di-cache

### 1. `/api/kategori` (GET)
- **Key Cache**: `kategoriData`
- **TTL**: 300 detik (5 menit)
- **Invalidasi**: Saat data kategori diperbarui (PUT)

### 2. `/api/surat` (GET)
- **Key Cache**: `suratData`
- **TTL**: 300 detik (5 menit)
- **Invalidasi**: Saat surat dibuat, diperbarui, atau dihapus

### 3. `/api/users` (GET)
- **Key Cache**: `usersData`
- **TTL**: 300 detik (5 menit)
- **Invalidasi**: Saat pengguna dibuat, diperbarui, atau dihapus

### 4. `/api/categories` (GET)
- **Key Cache**: `categoriesData`
- **TTL**: 300 detik (5 menit)
- **Invalidasi**: Tidak diimplementasikan (data bersifat statis)

## Cara Kerja

1. **Pengecekan Cache**: Saat menerima permintaan GET, sistem pertama-tama memeriksa apakah data tersedia dalam cache dan belum kedaluwarsa.

2. **Hit Cache**: Jika data ditemukan dalam cache, sistem langsung mengembalikan data tersebut tanpa mengakses database.

3. **Miss Cache**: Jika data tidak ditemukan dalam cache atau sudah kedaluwarsa, sistem mengambil data dari database, menyimpannya dalam cache, lalu mengembalikannya.

4. **Invalidasi Cache**: Saat data dimodifikasi (POST, PUT, DELETE), sistem menghapus entri cache yang terkait untuk memastikan data tetap konsisten.

## Konfigurasi TTL

TTL default untuk semua cache adalah 300 detik (5 menit). Nilai ini dapat disesuaikan berdasarkan kebutuhan bisnis dan frekuensi perubahan data.

## Monitoring dan Debugging

Sistem menyediakan fungsi `getCacheStats()` untuk memantau penggunaan cache:
- Jumlah entri dalam cache
- Sisa waktu hidup (TTL) untuk setiap entri

## Pengembangan Lebih Lanjut

Untuk pengembangan di masa depan, pertimbangkan:
1. Migrasi ke Redis untuk caching yang lebih robust dan scalable
2. Implementasi cache dengan tag untuk invalidasi yang lebih granular
3. Penambahan mekanisme cache warming
4. Implementasi cache untuk endpoint yang lebih kompleks