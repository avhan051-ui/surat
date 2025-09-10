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
  
  // Format date function
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };
  
  // Add summary sheet
  const summaryData = [
    ['LAPORAN SURAT KELUAR'],
    [''],
    ['Periode Laporan:', `${formatDate(tanggalDari)} - ${formatDate(tanggalSampai)}`],
    [selectedKategori ? 'Kategori:' : '', selectedKategori ? selectedKategori : ''],
  ];
  
  const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
  
  // Style the summary sheet
  summaryWs['A1'] = { 
    t: 's', 
    v: 'LAPORAN SURAT KELUAR',
    s: { 
      font: { sz: 16, bold: true, color: { rgb: "FFFFFF" } },
      fill: { fgColor: { rgb: "3B82F6" } },
      alignment: { horizontal: "center" }
    } 
  };
  
  // Add styling for headers
  summaryWs['A3'] = { 
    t: 's', 
    v: 'Periode Laporan:',
    s: { font: { bold: true } } 
  };
  
  // Set column widths for summary sheet
  summaryWs['!cols'] = [
    { wch: 25 }, // Column A
    { wch: 30 }  // Column B
  ];
  
  XLSX.utils.book_append_sheet(wb, summaryWs, 'Ringkasan');
  
  // Add detail data sheet
  const detailData = data.map((item, index) => ({
    'No': index + 1,
    'Nomor Surat': item.nomor,
    'Tanggal': formatDate(item.tanggal),
    'Tujuan': item.tujuan,
    'Perihal': item.perihal,
    'Pembuat': item.pembuat
  }));
  
  const detailWs = XLSX.utils.json_to_sheet(detailData);
  
  // Add headers to detail sheet
  const detailHeader = ['No', 'Nomor Surat', 'Tanggal', 'Tujuan', 'Perihal', 'Pembuat'];
  detailHeader.forEach((header, index) => {
    const cell = String.fromCharCode(65 + index) + '1';
    if (detailWs[cell]) {
      detailWs[cell].s = { 
        font: { bold: true, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "3B82F6" } },
        alignment: { horizontal: "center" }
      };
    }
  });
  
  // Set column widths for detail sheet
  detailWs['!cols'] = [
    { wch: 5 },   // No
    { wch: 25 },  // Nomor Surat
    { wch: 15 },  // Tanggal
    { wch: 30 },  // Tujuan
    { wch: 40 },  // Perihal
    { wch: 20 }   // Pembuat
  ];
  
  XLSX.utils.book_append_sheet(wb, detailWs, 'Detail Surat');
  
  // Add metadata
  if (!wb.Props) {
    wb.Props = {};
  }
  wb.Props.Title = 'Laporan Surat Keluar';
  wb.Props.Author = 'Sistem SuratKu';
  wb.Props.CreatedDate = new Date();
  
  // Save the workbook
  XLSX.writeFile(wb, `laporan-surat-${new Date().toISOString().slice(0, 10)}.xlsx`);
};