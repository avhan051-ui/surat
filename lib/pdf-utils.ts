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
  
  // Document dimensions
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  // Header
  doc.setDrawColor(59, 130, 246); // blue-500
  doc.setLineWidth(0.1);
  doc.line(14, 25, pageWidth - 14, 25);
  
  // Title
  doc.setTextColor(30, 64, 175); // blue-800
  doc.setFontSize(28);
  doc.setFont(undefined, 'bold');
  doc.text('LAPORAN SURAT KELUAR', pageWidth / 2, 18, { align: 'center' });
  
  // Subtitle
  doc.setFontSize(16);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(100, 116, 139); // slate-500
  doc.text('Sistem Pengelolaan Surat Keluar', pageWidth / 2, 24, { align: 'center' });
  
  // Reset text color
  doc.setTextColor(0, 0, 0);
  
  // Report info section with improved styling
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };
  
  // Period info with better styling
  doc.setFillColor(239, 246, 255); // blue-50
  doc.roundedRect(14, 32, pageWidth - 28, 18, 2, 2, 'F');
  
  doc.setDrawColor(59, 130, 246); // blue-500
  doc.setLineWidth(0.2);
  doc.line(14, 32, 14, 50); // Left border line
  
  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(30, 64, 175); // blue-800
  doc.text('Periode Laporan:  ', 18, 42);
  
  doc.setFont(undefined, 'normal');
  doc.setTextColor(51, 65, 85); // slate-700
  doc.text(`${formatDate(tanggalDari)} - ${formatDate(tanggalSampai)}`, 55, 42);
  
  // Category info
  if (selectedKategori) {
    const kategoriName = kategoriData[selectedKategori]?.name || selectedKategori;
    doc.setFont(undefined, 'bold');
    doc.setTextColor(30, 64, 175); // blue-800
    doc.text('Kategori:', 18, 48);
    
    doc.setFont(undefined, 'normal');
    doc.setTextColor(51, 65, 85); // slate-700
    doc.text(`${selectedKategori} - ${kategoriName}`, 38, 48);
  }
  
  // Table
  autoTable(doc, {
    startY: 55,
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
      fontSize: 8,
      cellPadding: 3
    },
    headStyles: {
      fillColor: [59, 130, 246], // blue-500
      textColor: [255, 255, 255], // white
      fontStyle: 'bold'
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252] // slate-50
    },
    columnStyles: {
      0: { cellWidth: 15 }, // No
      1: { cellWidth: 40 }, // Nomor Surat
      2: { cellWidth: 25 }, // Tanggal
      3: { cellWidth: 50 }, // Tujuan
      4: { cellWidth: 60 }, // Perihal
      5: { cellWidth: 40 }  // Pembuat
    }
  });
  
  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    
    // Footer line
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.setLineWidth(0.1);
    doc.line(14, pageHeight - 20, pageWidth - 14, pageHeight - 20);
    
    // Page number
    doc.setFontSize(10);
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text(`Halaman ${i} dari ${pageCount}`, pageWidth - 30, pageHeight - 15);
    
    // Generated date
    const generatedDate = new Date().toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    doc.text(`Dicetak pada: ${generatedDate}`, 14, pageHeight - 15);
  }
  
  // Save the PDF
  doc.save(`laporan-surat-${new Date().toISOString().slice(0, 10)}.pdf`);
};