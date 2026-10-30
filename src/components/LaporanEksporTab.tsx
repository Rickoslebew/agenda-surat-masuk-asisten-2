import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  Printer,
  Download,
  Calendar,
  Filter,
  CheckCircle2,
  FileText,
  BarChart,
  HardDrive,
} from 'lucide-react';
import { SuratMasuk } from '../types';
import { exportToExcelCSV, exportPerformaDisposisiCSV } from '../services/exportService';
import {
  getStoredSheetInfo,
  syncAllSuratToGoogleSheets,
  SheetBackupStatus,
} from '../services/googleSheetsService';

interface LaporanEksporTabProps {
  suratList: SuratMasuk[];
  onOpenPrintModal: (surat: SuratMasuk) => void;
}

export const LaporanEksporTab: React.FC<LaporanEksporTabProps> = ({
  suratList,
  onOpenPrintModal,
}) => {
  const [filterBulan, setFilterBulan] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sheetInfo, setSheetInfo] = useState<SheetBackupStatus>(getStoredSheetInfo());
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncMessage, setSyncMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const handleUpdate = () => {
      setSheetInfo(getStoredSheetInfo());
    };
    window.addEventListener('eagenda_data_updated', handleUpdate);
    return () => window.removeEventListener('eagenda_data_updated', handleUpdate);
  }, []);

  const handleManualSync = async () => {
    setIsSyncing(true);
    setSyncMessage(null);
    try {
      const res = await syncAllSuratToGoogleSheets(suratList);
      if (res.success) {
        setSyncMessage({
          type: 'success',
          text: `Berhasil mencadangkan ${res.count} surat ke Google Spreadsheet.`,
        });
        setSheetInfo(getStoredSheetInfo());
      } else {
        setSyncMessage({
          type: 'error',
          text: res.error || 'Gagal menyinkronkan data ke Google Spreadsheet.',
        });
      }
    } catch (e: any) {
      setSyncMessage({
        type: 'error',
        text: e.message || 'Terjadi kesalahan saat menyinkronkan data.',
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const filteredSurat = suratList.filter(s => {
    const matchStatus = filterStatus === 'all' || s.status === filterStatus;
    const matchBulan =
      filterBulan === 'all' || s.tanggalTerima.startsWith(filterBulan);
    return matchStatus && matchBulan;
  });

  const handlePrintBukuAgenda = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                Pusat Ekspor Laporan & Cetak Resmi (PDF & Excel)
              </h2>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700">
                Laporan Akuntabilitas
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Dukungan ekspor data ke format Microsoft Excel / CSV dan pencetakan naskah dinas resmi siap simpan ke PDF
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => exportToExcelCSV(filteredSurat)}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-4 h-4" />
              Unduh Excel Buku Agenda
            </button>
            <button
              onClick={() => exportPerformaDisposisiCSV(filteredSurat)}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Unduh Excel Kinerja Disposisi
            </button>
          </div>
        </div>

        {/* Filter controls */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-600">Filter Periode Bulan:</span>
            <select
              value={filterBulan}
              onChange={e => setFilterBulan(e.target.value)}
              className="py-1.5 px-2 bg-slate-50 border border-slate-200 rounded-lg outline-none"
            >
              <option value="all">Semua Periode</option>
              <option value="2026-10">Oktober 2026</option>
              <option value="2026-09">September 2026</option>
              <option value="2026-08">Agustus 2026</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-600">Filter Status:</span>
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="py-1.5 px-2 bg-slate-50 border border-slate-200 rounded-lg outline-none"
            >
              <option value="all">Semua Status</option>
              <option value="Baru Masuk">Baru Masuk</option>
              <option value="Sedang Diproses">Sedang Diproses</option>
              <option value="Didisposisikan">Didisposisikan</option>
              <option value="Selesai Diproses">Selesai Diproses</option>
            </select>
          </div>

          <div className="ml-auto text-slate-500">
            Terpilih: <span className="font-bold text-slate-800">{filteredSurat.length}</span> naskah dinas
          </div>
        </div>
      </div>

      {/* Google Spreadsheet Live Sync & Backup Card */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 rounded-xl p-5 text-white shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-white">
                Backup Otomatis Google Spreadsheet (Live Cloud Sync)
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/20">
                Tersinkronisasi
              </span>
            </div>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Setiap penambahan, pembaruan, maupun <span className="text-emerald-300 font-bold">penghapusan</span> surat masuk dan lembar disposisi akan otomatis disinkronkan ke Google Spreadsheet Anda. Jika surat dihapus di aplikasi, baris di spreadsheet pun otomatis terhapus bersih.
            </p>
            {sheetInfo.lastSyncTime && (
              <div className="text-[11px] text-emerald-300 pt-1 flex items-center gap-2">
                <span>Waktu Sinkronisasi Terakhir: <strong>{sheetInfo.lastSyncTime}</strong></span>
                <span>•</span>
                <span>{sheetInfo.rowCount} naskah surat terdata</span>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {sheetInfo.sheetUrl && (
              <a
                href={sheetInfo.sheetUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors border border-white/20"
              >
                <FileText className="w-3.5 h-3.5 text-emerald-300" />
                Buka Google Spreadsheet
              </a>
            )}
            <button
              onClick={handleManualSync}
              disabled={isSyncing}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <CheckCircle2 className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? 'Sedang Menyinkronkan...' : 'Sinkronkan Sekarang'}
            </button>
          </div>
        </div>

        {syncMessage && (
          <div className={`mt-3 p-2.5 rounded-lg text-xs font-medium border ${
            syncMessage.type === 'success'
              ? 'bg-emerald-500/20 border-emerald-400/40 text-emerald-200'
              : 'bg-rose-500/20 border-rose-400/40 text-rose-200'
          }`}>
            {syncMessage.text}
          </div>
        )}
      </div>

      {/* Ekspor Options Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Buku Agenda Excel */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div className="space-y-2">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">
              Rekapitulasi Buku Agenda Surat Masuk
            </h3>
            <p className="text-xs text-slate-500">
              Mengekspor daftar lengkap seluruh surat masuk, nomor agenda, pengirim, sifat, kategori, tanggal penerimaan, dan status validasi fisik ke spreadsheet Excel (.csv UTF-8).
            </p>
          </div>

          <button
            onClick={() => exportToExcelCSV(filteredSurat)}
            className="mt-4 w-full py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors border border-emerald-200 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" /> Ekspor Buku Agenda (.csv)
          </button>
        </div>

        {/* Card 2: Laporan Evaluasi Disposisi */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div className="space-y-2">
            <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
              <BarChart className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">
              Laporan Evaluasi Disposisi & Penerima Berkas
            </h3>
            <p className="text-xs text-slate-500">
              Mengekspor seluruh lembar disposisi pimpinan, pejabat/petugas penerima yang melanjutkan, instruksi, dan progres hasil tindak lanjut ke format Excel.
            </p>
          </div>

          <button
            onClick={() => exportPerformaDisposisiCSV(filteredSurat)}
            className="mt-4 w-full py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors border border-indigo-200 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" /> Ekspor Data Disposisi (.csv)
          </button>
        </div>

        {/* Card 3: Cetak Rekapitulasi PDF */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div className="space-y-2">
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <Printer className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">
              Cetak Dokumen & PDF Naskah Dinas
            </h3>
            <p className="text-xs text-slate-500">
              Cetak langsung ke printer atau simpan sebagai dokumen PDF resmi format tata naskah dinas dengan kop instansi dan validasi barcode.
            </p>
          </div>

          <button
            onClick={handlePrintBukuAgenda}
            className="mt-4 w-full py-2 bg-blue-50 hover:bg-blue-100 text-blue-800 font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors border border-blue-200 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" /> Cetak Halaman / PDF
          </button>
        </div>
      </div>

      {/* Table Preview of Exportable Data */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">
            Pratinjau Data Laporan ({filteredSurat.length} Baris)
          </h3>
          <span className="text-xs text-slate-500">
            Data siap diunduh ke Excel atau dicetak
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <th className="py-2.5 px-3">No. Agenda</th>
                <th className="py-2.5 px-3">No. Surat & Tanggal</th>
                <th className="py-2.5 px-3">Pengirim</th>
                <th className="py-2.5 px-3">Perihal</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Arah Disposisi</th>
                <th className="py-2.5 px-3 text-right">Cetak PDF</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSurat.map(s => (
                <tr key={s.id} className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 font-mono font-bold text-blue-900">
                    {s.nomorAgenda}
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="font-semibold text-slate-800">{s.nomorSurat}</div>
                    <div className="text-[10px] text-slate-400">Terima: {s.tanggalTerima}</div>
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="font-medium text-slate-800">{s.pengirim}</div>
                  </td>
                  <td className="py-2.5 px-3 max-w-xs truncate">
                    {s.perihal}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                      {s.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    {s.disposisiList.length > 0 ? (
                      <span className="text-indigo-800 font-medium">
                        {s.disposisiList.map(d => `${d.instansiTujuan || d.tujuanUnit || 'Instansi Terkait'} (${d.namaPenerimaBerkas || d.tujuanNama || 'Penerima'})`).join('; ')}
                      </span>
                    ) : (
                      <span className="text-slate-400 italic">-</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <button
                      onClick={() => onOpenPrintModal(s)}
                      className="px-2 py-1 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded font-semibold text-xs transition-colors"
                      title="Cetak Lembar Disposisi"
                    >
                      Cetak Lembar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
