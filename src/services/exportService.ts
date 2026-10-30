import { SuratMasuk, DisposisiItem } from '../types';

/**
 * Exports data to CSV with UTF-8 BOM so it opens flawlessly in Microsoft Excel with Indonesian characters
 */
export const exportToExcelCSV = (suratList: SuratMasuk[], filename = 'Laporan_Buku_Agenda_Surat_Masuk.csv') => {
  const headers = [
    'No',
    'No. Agenda',
    'No. Surat',
    'Tanggal Surat',
    'Tanggal Terima',
    'Asal / Pengirim',
    'Instansi Pengirim',
    'Perihal',
    'Sifat Surat',
    'Kategori',
    'Status Pemrosesan',
    'Arah Disposisi (Tujuan)',
    'Status Disposisi Terakhir',
    'Bukti Serah Terima Fisik',
    'Arsip Google Drive',
    'Dicatat Oleh',
  ];

  const rows = suratList.map((s, index) => {
    const tujuanDisposisi = s.disposisiList
      .map(d => `${d.instansiTujuan || d.tujuanUnit || 'Instansi Terkait'} (Penerima: ${d.namaPenerimaBerkas || d.tujuanNama || 'Penerima Berkas'})`)
      .join('; ') || '-';
    const statusDisposisi = s.disposisiList.map(d => `${d.namaPenerimaBerkas || d.tujuanNama}: ${d.status} (${d.progresPersen}%)`).join('; ') || '-';
    const buktiFisik = s.buktiFisik ? `${s.buktiFisik.statusVerifikasi} - ${s.buktiFisik.namaPenerimaFisik}` : 'Belum Ada';
    const driveStatus = s.buktiFisik?.diarsipkanKeDrive ? 'Tersimpan di Google Drive' : 'Belum Diarsipkan';

    return [
      index + 1,
      `"${s.nomorAgenda.replace(/"/g, '""')}"`,
      `"${s.nomorSurat.replace(/"/g, '""')}"`,
      s.tanggalSurat,
      s.tanggalTerima,
      `"${s.pengirim.replace(/"/g, '""')}"`,
      `"${s.instansiPengirim.replace(/"/g, '""')}"`,
      `"${s.perihal.replace(/"/g, '""')}"`,
      s.sifat,
      s.kategori,
      s.status,
      `"${tujuanDisposisi.replace(/"/g, '""')}"`,
      `"${statusDisposisi.replace(/"/g, '""')}"`,
      `"${buktiFisik.replace(/"/g, '""')}"`,
      driveStatus,
      `"${s.dibuatOleh.replace(/"/g, '""')}"`,
    ];
  });

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Exports disposition performance statistics to Excel CSV
 */
export const exportPerformaDisposisiCSV = (suratList: SuratMasuk[]) => {
  const disposisiAll: { surat: SuratMasuk; disp: DisposisiItem }[] = [];
  suratList.forEach(s => {
    s.disposisiList.forEach(d => {
      disposisiAll.push({ surat: s, disp: d });
    });
  });

  const headers = [
    'No',
    'No. Agenda',
    'No. Surat',
    'Perihal Surat',
    'Instansi yang Dituju',
    'Nama Penerima Berkas',
    'Tanggal Disposisi',
    'Batas Waktu',
    'Petunjuk / Instruksi',
    'Status Pengerjaan',
    'Progres (%)',
    'Catatan / Hasil Tindak Lanjut',
    'Tanggal Selesai',
  ];

  const rows = disposisiAll.map((item, index) => {
    return [
      index + 1,
      `"${item.surat.nomorAgenda.replace(/"/g, '""')}"`,
      `"${item.surat.nomorSurat.replace(/"/g, '""')}"`,
      `"${item.surat.perihal.replace(/"/g, '""')}"`,
      `"${(item.disp.instansiTujuan || item.disp.tujuanUnit || 'Instansi Terkait').replace(/"/g, '""')}"`,
      `"${(item.disp.namaPenerimaBerkas || item.disp.tujuanNama || 'Penerima Berkas').replace(/"/g, '""')}"`,
      item.disp.tanggalDisposisi,
      item.disp.batasWaktu,
      `"${item.disp.instruksi.join(', ').replace(/"/g, '""')}"`,
      item.disp.status,
      item.disp.progresPersen,
      `"${(item.disp.laporanHasil || item.disp.catatanKhusus || '-').replace(/"/g, '""')}"`,
      item.disp.tanggalPenyelesaian || '-',
    ];
  });

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Laporan_Performa_Disposisi_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Triggers browser print to PDF for clean official printable reports
 */
export const printReportPage = () => {
  window.print();
};
