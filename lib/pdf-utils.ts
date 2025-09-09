import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Surat } from '@/app/context/AppContext';

export interface LaporanStats {
  totalSurat: number;
  rataRata: number;
  kategoriTop: string;
  bulanTop: string;
}

export const generateLaporanPDF = (
  data: Surat[],
  stats: LaporanStats,
  kategoriData: any,
  tanggalDari: string,
  tanggalSampai: string,
  selectedKategori: string
) => {
  const doc = new jsPDF('landscape');
  
  // Add title
  doc.setFontSize(16);
  doc.text('Laporan Surat Keluar', 14, 20);
  
  // Add date range
  doc.setFontSize(12);
  doc.text(`Periode: ${tanggalDari} - ${tanggalSampai}`, 14, 30);
  
  // Add category if selected
  if (selectedKategori) {
    const kategoriName = kategoriData[selectedKategori]?.name || selectedKategori;
    doc.text(`Kategori: ${selectedKategori} - ${kategoriName}`, 14, 40);
  }
  
  // Add statistics
  doc.setFontSize(10);
  doc.text(`Total Surat: ${stats.totalSurat}`, 14, 50);
  doc.text(`Rata-rata per Bulan: ${stats.rataRata}`, 14, 55);
  doc.text(`Kategori Terbanyak: ${stats.kategoriTop}`, 14, 60);
  doc.text(`Bulan Tertinggi: ${stats.bulanTop}`, 14, 65);
  
  // Add table
  autoTable(doc, {
    startY: 70,
    head: [['No', 'Nomor Surat', 'Tanggal', 'Tujuan', 'Perihal', 'Pembuat']],
    body: data.map((item, index) => [
      index + 1,
      item.nomor,
      new Date(item.tanggal).toLocaleDateString('id-ID'),
      item.tujuan,
      item.perihal,
      item.pembuat
    ]),
    theme: 'grid',
    styles: {
      fontSize: 8
    },
    headStyles: {
      fillColor: [59, 130, 246], // blue-500
      textColor: [255, 255, 255] // white
    },
    alternateRowStyles: {
      fillColor: [249, 250, 251] // gray-50
    }
  });
  
  // Save the PDF
  doc.save(`laporan-surat-${new Date().toISOString().slice(0, 10)}.pdf`);
};