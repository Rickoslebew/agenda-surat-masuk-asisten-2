import React, { useState } from 'react';
import {
  Search,
  Filter,
  Plus,
  FileText,
  Printer,
  Camera,
  GitPullRequest,
  CheckCircle2,
  Clock,
  AlertCircle,
  Eye,
  Trash2,
  Calendar,
  Building,
  User,
  ArrowUpDown,
  Download,
  Share2,
  Edit3,
} from 'lucide-react';
import { SuratMasuk, StatusSurat, SifatSurat, UserSession } from '../types';
import { exportToExcelCSV } from '../services/exportService';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';

interface AgendaSuratListProps {
  suratList: SuratMasuk[];
  currentUser: UserSession;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenNewModal: () => void;
  onOpenEditModal: (surat: SuratMasuk) => void;
  onOpenDetailModal: (surat: SuratMasuk) => void;
  onOpenDisposisiModal: (surat: SuratMasuk) => void;
  onOpenSerahTerimaModal: (surat: SuratMasuk) => void;
  onOpenPrintModal: (surat: SuratMasuk) => void;
  onDeleteSurat: (id: string) => void;
}

export const AgendaSuratList: React.FC<AgendaSuratListProps> = ({
  suratList,
  currentUser,
  searchQuery,
  onSearchChange,
  onOpenNewModal,
  onOpenEditModal,
  onOpenDetailModal,
  onOpenDisposisiModal,
  onOpenSerahTerimaModal,
  onOpenPrintModal,
  onDeleteSurat,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterSifat, setFilterSifat] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'terbaru' | 'agenda' | 'urgensi'>('terbaru');
  const [suratToDelete, setSuratToDelete] = useState<SuratMasuk | null>(null);

  // Filter & Search logic
  const filteredSurat = suratList.filter(s => {
    // Search query
    const q = searchQuery.toLowerCase().trim();
    const matchSearch =
      !q ||
      s.nomorAgenda.toLowerCase().includes(q) ||
      s.nomorSurat.toLowerCase().includes(q) ||
      s.pengirim.toLowerCase().includes(q) ||
      s.perihal.toLowerCase().includes(q) ||
      s.disposisiList.some(d =>
        (d.namaPenerimaBerkas && d.namaPenerimaBerkas.toLowerCase().includes(q)) ||
        (d.instansiTujuan && d.instansiTujuan.toLowerCase().includes(q)) ||
        (d.tujuanNama && d.tujuanNama.toLowerCase().includes(q))
      );

    // Status filter
    const matchStatus = filterStatus === 'all' || s.status === filterStatus;

    // Sifat filter
    const matchSifat = filterSifat === 'all' || s.sifat === filterSifat;

    return matchSearch && matchStatus && matchSifat;
  });

  // Sorting
  const sortedSurat = [...filteredSurat].sort((a, b) => {
    if (sortBy === 'terbaru') {
      return new Date(b.tanggalTerima).getTime() - new Date(a.tanggalTerima).getTime();
    }
    if (sortBy === 'agenda') {
      return b.nomorAgenda.localeCompare(a.nomorAgenda);
    }
    if (sortBy === 'urgensi') {
      const urgencyScore: Record<SifatSurat, number> = {
        'Sangat Segera': 5,
        Segera: 4,
        Penting: 3,
        Rahasia: 2,
        Biasa: 1,
      };
      return urgencyScore[b.sifat] - urgencyScore[a.sifat];
    }
    return 0;
  });

  const getStatusBadge = (status: StatusSurat) => {
    switch (status) {
      case 'Baru Masuk':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-100 text-blue-800 border border-blue-200">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
            Baru Masuk
          </span>
        );
      case 'Didisposisikan':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-100 text-indigo-800 border border-indigo-200">
            <GitPullRequest className="w-3 h-3 text-indigo-600" />
            Didisposisikan
          </span>
        );
      case 'Sedang Diproses':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            <Clock className="w-3 h-3 text-amber-600" />
            Sedang Diproses
          </span>
        );
      case 'Selesai Diproses':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Selesai Diproses
          </span>
        );
    }
  };

  const getSifatBadge = (sifat: SifatSurat) => {
    switch (sifat) {
      case 'Sangat Segera':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'Segera':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Penting':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Rahasia':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Header Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900">
                Buku Agenda Surat Masuk
              </h2>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">
                {suratList.length} Total Arsip
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Kelola pencatatan surat masuk, status pemrosesan, dan arah lembar disposisi digital
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => exportToExcelCSV(sortedSurat)}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold border border-slate-200 flex items-center gap-1.5 transition-colors"
              title="Unduh format spreadsheet Excel/CSV"
            >
              <Download className="w-3.5 h-3.5 text-slate-600" />
              Ekspor Excel
            </button>

            {(currentUser.role === 'Admin' || currentUser.role === 'Pimpinan') && (
              <button
                onClick={onOpenNewModal}
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Catat Surat Masuk
              </button>
            )}
          </div>
        </div>

        {/* Filter & Controls Toolbar */}
        <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {/* Search box inside panel */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => onSearchChange(e.target.value)}
              placeholder="Cari no agenda, pengirim..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:bg-white focus:border-blue-500 outline-none"
            />
          </div>

          {/* Filter Status */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-medium text-slate-500 shrink-0">Status:</span>
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="w-full py-1.5 px-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:bg-white outline-none"
            >
              <option value="all">Semua Status</option>
              <option value="Baru Masuk">Baru Masuk</option>
              <option value="Didisposisikan">Didisposisikan</option>
              <option value="Sedang Diproses">Sedang Diproses</option>
              <option value="Selesai Diproses">Selesai Diproses</option>
            </select>
          </div>

          {/* Filter Sifat */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-medium text-slate-500 shrink-0">Sifat:</span>
            <select
              value={filterSifat}
              onChange={e => setFilterSifat(e.target.value)}
              className="w-full py-1.5 px-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:bg-white outline-none"
            >
              <option value="all">Semua Sifat</option>
              <option value="Biasa">Biasa</option>
              <option value="Penting">Penting</option>
              <option value="Segera">Segera</option>
              <option value="Sangat Segera">Sangat Segera</option>
              <option value="Rahasia">Rahasia</option>
            </select>
          </div>

          {/* Sorting */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-medium text-slate-500 shrink-0">Urutkan:</span>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="w-full py-1.5 px-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:bg-white outline-none"
            >
              <option value="terbaru">Tanggal Diterima</option>
              <option value="agenda">Nomor Agenda</option>
              <option value="urgensi">Tingkat Urgensi</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table / Card View */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <th className="py-3 px-4">No. Agenda & Surat</th>
                <th className="py-3 px-4">Pengirim & Asal</th>
                <th className="py-3 px-4">Perihal & Ringkasan</th>
                <th className="py-3 px-4">Status & Sifat</th>
                <th className="py-3 px-4">Instansi & Penerima Disposisi</th>
                <th className="py-3 px-4">Bukti Fisik</th>
                <th className="py-3 px-4 text-right">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedSurat.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="max-w-xs mx-auto space-y-1">
                      <FileText className="w-8 h-8 text-slate-300 mx-auto" />
                      <div className="font-semibold text-slate-600">Tidak ada data surat</div>
                      <p className="text-[11px] text-slate-400">
                        {searchQuery ? 'Coba ubah kata kunci pencarian Anda' : 'Belum ada surat masuk yang tercatat'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                sortedSurat.map(surat => {
                  const hasDisposisi = surat.disposisiList.length > 0;
                  const hasBuktiFisik = !!surat.buktiFisik;

                  return (
                    <tr
                      key={surat.id}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      {/* No Agenda & Tanggal */}
                      <td className="py-3 px-4 align-top">
                        <div className="font-bold text-blue-900 font-mono">
                          {surat.nomorAgenda}
                        </div>
                        <div className="text-[11px] font-medium text-slate-700 mt-0.5">
                          {surat.nomorSurat}
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-1">
                          <Calendar className="w-3 h-3" />
                          <span>Terima: {surat.tanggalTerima}</span>
                        </div>
                      </td>

                      {/* Pengirim */}
                      <td className="py-3 px-4 align-top">
                        <div className="font-semibold text-slate-900">
                          {surat.pengirim}
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <Building className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate max-w-[180px]">
                            {surat.instansiPengirim}
                          </span>
                        </div>
                        <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[10px] bg-slate-100 text-slate-600 font-medium">
                          {surat.kategori}
                        </span>
                      </td>

                      {/* Perihal */}
                      <td className="py-3 px-4 align-top max-w-xs">
                        <div className="font-semibold text-slate-800 line-clamp-2">
                          {surat.perihal}
                        </div>
                        <div className="text-[11px] text-slate-500 line-clamp-1 mt-1">
                          {surat.ringkasan}
                        </div>
                        {surat.fileLampiranNama && (
                          <div className="text-[10px] text-blue-600 mt-1 flex items-center gap-1">
                            <FileText className="w-3 h-3" />
                            <span className="truncate">{surat.fileLampiranNama}</span>
                          </div>
                        )}
                      </td>

                      {/* Status & Sifat */}
                      <td className="py-3 px-4 align-top whitespace-nowrap">
                        <div className="space-y-1.5">
                          <div>{getStatusBadge(surat.status)}</div>
                          <div>
                            <span
                              className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold border ${getSifatBadge(
                                surat.sifat
                              )}`}
                            >
                              {surat.sifat}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Instansi & Penerima Disposisi */}
                      <td className="py-3 px-4 align-top max-w-[200px]">
                        {hasDisposisi ? (
                          <div className="space-y-1.5">
                            {surat.disposisiList.map((d, i) => (
                              <div
                                key={i}
                                className="p-1.5 rounded-lg bg-indigo-50/70 border border-indigo-100 text-[11px]"
                              >
                                <div className="font-bold text-indigo-950 flex items-center gap-1">
                                  <Building className="w-3 h-3 text-indigo-600 shrink-0" />
                                  <span className="truncate">{d.instansiTujuan || d.tujuanUnit || 'Instansi Terkait'}</span>
                                </div>
                                <div className="text-[10px] text-indigo-900 font-medium truncate flex items-center gap-1 mt-0.5">
                                  <User className="w-2.5 h-2.5 text-indigo-500 shrink-0" />
                                  <span>{d.namaPenerimaBerkas || d.tujuanNama || 'Penerima Berkas'}</span>
                                </div>
                                <div className="flex items-center justify-between text-[10px] mt-1 text-slate-500">
                                  <span>Tenggat: {d.batasWaktu}</span>
                                  <span className="font-semibold text-indigo-800">
                                    {d.progresPersen}%
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-[11px] text-slate-400 italic">
                            Belum ada disposisi
                          </div>
                        )}
                      </td>

                      {/* Bukti Serah Terima Fisik */}
                      <td className="py-3 px-4 align-top whitespace-nowrap">
                        {hasBuktiFisik ? (
                          <div className="space-y-1">
                            <button
                              onClick={() => onOpenSerahTerimaModal(surat)}
                              className="group/img relative block"
                            >
                              <img
                                src={surat.buktiFisik?.fotoUrl}
                                alt="Bukti serah terima fisik"
                                className="w-12 h-12 object-cover rounded-lg border border-slate-200 shadow-2xs group-hover/img:opacity-80 transition-opacity"
                              />
                              <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-lg opacity-0 group-hover/img:opacity-100 transition-opacity text-white text-[9px] font-bold">
                                Buka
                              </div>
                            </button>
                            <div className="text-[10px] font-medium text-emerald-700">
                              {surat.buktiFisik?.diarsipkanKeDrive
                                ? '✓ Drive Sync'
                                : 'Tersimpan Lokal'}
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => onOpenSerahTerimaModal(surat)}
                            className="px-2 py-1 rounded border border-dashed border-slate-300 hover:border-blue-400 text-[11px] text-slate-500 hover:text-blue-600 flex items-center gap-1 transition-colors"
                          >
                            <Camera className="w-3 h-3" />
                            + Unggah Foto
                          </button>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 align-top text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          {/* Detail button */}
                          <button
                            onClick={() => onOpenDetailModal(surat)}
                            className="p-1.5 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-slate-100 transition-colors"
                            title="Lihat Detail & Perjalanan Surat"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit / Koreksi Surat button */}
                          <button
                            onClick={() => onOpenEditModal(surat)}
                            className="p-1.5 rounded-lg text-amber-600 hover:text-amber-800 hover:bg-amber-50 transition-colors"
                            title="Edit & Koreksi Data Surat Masuk"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {/* Buat Disposisi */}
                          {(currentUser.role === 'Pimpinan' || currentUser.role === 'Admin') && (
                            <button
                              onClick={() => onOpenDisposisiModal(surat)}
                              className="p-1.5 rounded-lg text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 transition-colors"
                              title="Buat Lembar Disposisi"
                            >
                              <GitPullRequest className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Cetak Lembar Disposisi / Agenda */}
                          <button
                            onClick={() => onOpenPrintModal(surat)}
                            className="p-1.5 rounded-lg text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                            title="Cetak Lembar Disposisi Resmi (PDF)"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete Surat Masuk */}
                          <button
                            onClick={() => setSuratToDelete(surat)}
                            className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Hapus Surat Masuk dari Agenda"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            Menampilkan <span className="font-semibold text-slate-700">{sortedSurat.length}</span> dari{' '}
            <span className="font-semibold text-slate-700">{suratList.length}</span> surat masuk
          </div>
          <div className="text-[11px] text-slate-400">
            Keterangan: Dokumen berstatus 'Didisposisikan' telah diteruskan pimpinan ke pejabat pelaksana
          </div>
        </div>
      </div>

      {/* Modal Konfirmasi Hapus Surat */}
      <ConfirmDeleteModal
        isOpen={!!suratToDelete}
        onClose={() => setSuratToDelete(null)}
        onConfirm={() => {
          if (suratToDelete) {
            onDeleteSurat(suratToDelete.id);
            setSuratToDelete(null);
          }
        }}
        title="Hapus Surat Masuk dari Agenda"
        description="Apakah Anda yakin ingin menghapus surat masuk ini? Seluruh data disposisi dan riwayat berkas terkait juga akan dihapus permanen dan disinkronkan ke Google Spreadsheet."
        details={
          suratToDelete
            ? [
                { label: 'No. Agenda', value: suratToDelete.nomorAgenda },
                { label: 'No. Surat', value: suratToDelete.nomorSurat },
                { label: 'Pengirim', value: suratToDelete.pengirim },
                { label: 'Perihal', value: suratToDelete.perihal },
              ]
            : []
        }
        confirmButtonText="Ya, Hapus Surat Ini"
      />
    </div>
  );
};
