import * as XLSX from 'xlsx';
import { Surat } from '@/app/context/AppContext';

export const generateLaporanExcel = (
  data: Surat[],
  stats: any,
  tanggalDari: string,
  tanggalSampai: string,
  selectedKategori: string
) => {
  // Create a new workbook
  const wb = XLSX.utils.book_new();
  
  // Add statistics sheet
  const statsData = [
    ['Laporan Surat Keluar'],
    [`Periode: ${tanggalDari} - ${tanggalSampai}`],
    [selectedKategori ? `Kategori: ${selectedKategori}` : ''],
    [],
    ['Statistik'],
    ['Total Surat', stats.totalSurat],
    ['Rata-rata per Bulan', stats.rataRata],
    ['Kategori Terbanyak', stats.kategoriTop],
    ['Bulan Tertinggi', stats.bulanTop],
    [],
    ['Detail Surat']
  ];
  
  // Add detail data
  const detailData = data.map((item, index) => ({
    'No': index + 1,
    'Nomor Surat': item.nomor,
    'Tanggal': new Date(item.tanggal).toLocaleDateString('id-ID'),
    'Tujuan': item.tujuan,
    'Perihal': item.perihal,
    'Pembuat': item.pembuat
  }));
  
  // Create worksheet for statistics and details
  const ws = XLSX.utils.aoa_to_sheet(statsData);
  
  // Add detail data to worksheet
  const detailSheet = XLSX.utils.json_to_sheet(detailData);
  
  // Combine stats and detail data
  XLSX.utils.sheet_add_json(ws, detailData, { origin: statsData.length });
  
  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Laporan');
  
  // Save the workbook
  XLSX.writeFile(wb, `laporan-surat-${new Date().toISOString().slice(0, 10)}.xlsx`);
};