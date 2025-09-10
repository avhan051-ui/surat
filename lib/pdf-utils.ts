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
  // Logo placeholder (in a real app, you might add an actual logo)
  doc.setFillColor(59, 130, 246); // blue-500
  doc.rect(0, 0, pageWidth, 25, 'F');
  
  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont(undefined, 'bold');
  doc.text('LAPORAN SURAT KELUAR', pageWidth / 2, 15, { align: 'center' });
  
  // Subtitle
  doc.setFontSize(12);
  doc.setFont(undefined, 'normal');
  doc.text('Sistem Pengelolaan Surat Keluar', pageWidth / 2, 22, { align: 'center' });
  
  // Reset text color
  doc.setTextColor(0, 0, 0);
  
  // Report info section
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };
  
  // Period info
  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  doc.text('Periode Laporan:', 14, 35);
  
  doc.setFont(undefined, 'normal');
  doc.text(`${formatDate(tanggalDari)} - ${formatDate(tanggalSampai)}`, 45, 35);
  
  // Category info
  if (selectedKategori) {
    const kategoriName = kategoriData[selectedKategori]?.name || selectedKategori;
    doc.setFont(undefined, 'bold');
    doc.text('Kategori:', 14, 42);
    
    doc.setFont(undefined, 'normal');
    doc.text(`${selectedKategori} - ${kategoriName}`, 35, 42);
  }
  
  // Table
  autoTable(doc, {
    startY: 50,
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
      fillColor: [249, 250, 251] // gray-50
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
    doc.setDrawColor(200, 200, 200);
    doc.line(14, pageHeight - 20, pageWidth - 14, pageHeight - 20);
    
    // Page number
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
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