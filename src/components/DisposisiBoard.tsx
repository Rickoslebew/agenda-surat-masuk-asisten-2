import React, { useState } from 'react';
import {
  GitPullRequest,
  CheckCircle2,
  AlertTriangle,
  User,
  Calendar,
  Building,
  Printer,
  Trash2,
  Camera,
  Image as ImageIcon,
} from 'lucide-react';
import { SuratMasuk, DisposisiItem, UserSession } from '../types';
import { exportPerformaDisposisiCSV } from '../services/exportService';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';
import { FotoBuktiViewerModal } from './FotoBuktiViewerModal';

interface DisposisiBoardProps {
  suratList: SuratMasuk[];
  currentUser: UserSession;
  onOpenTindakLanjutModal: (surat: SuratMasuk, disposisi: DisposisiItem) => void;
  onOpenSuratDetail: (surat: SuratMasuk) => void;
  onOpenPrintDisposisi: (surat: SuratMasuk) => void;
  onOpenBuatDisposisi: (surat: SuratMasuk) => void;
  onDeleteDisposisi?: (suratId: string, disposisiId: string) => void;
}

export const DisposisiBoard: React.FC<DisposisiBoardProps> = ({
  suratList,
  currentUser,
  onOpenTindakLanjutModal,
  onOpenSuratDetail,
  onOpenPrintDisposisi,
  onOpenBuatDisposisi,
  onDeleteDisposisi,
}) => {
  const [selectedStatusTab, setSelectedStatusTab] = useState<'all' | 'Sedang Diproses' | 'Selesai' | 'Menunggu'>('all');
  const [filterPejabat, setFilterPejabat] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [dispToDelete, setDispToDelete] = useState<{
    suratId: string;
    disposisiId: string;
    suratJudul: string;
    penerima: string;
    instansi: string;
  } | null>(null);

  const [viewingFoto, setViewingFoto] = useState<{
    url: string;
    namaPenerima?: string;
    instansi?: string;
    judulSurat?: string;
    nomorAgenda?: string;
    tanggal?: string;
    keterangan?: string;
  } | null>(null);

  // Flatten all dispositions with parent surat reference
  const allDisposisi: { surat: SuratMasuk; disp: DisposisiItem }[] = [];
  suratList.forEach(surat => {
    surat.disposisiList.forEach(disp => {
      allDisposisi.push({ surat, disp });
    });
  });

  // Unique recipient list for filtering
  const pejabatOptions = Array.from(
    new Set(allDisposisi.map(item => item.disp.namaPenerimaBerkas || item.disp.tujuanNama || 'Penerima Berkas'))
  );

  // Filtered list
  const filteredItems = allDisposisi.filter(item => {
    const matchStatus = selectedStatusTab === 'all' || item.disp.status === selectedStatusTab;
    const recipient = item.disp.namaPenerimaBerkas || item.disp.tujuanNama;
    const matchPejabat = filterPejabat === 'all' || recipient === filterPejabat;
    return matchStatus && matchPejabat;
  });

  const suratBelumDisposisi = suratList.filter(s => s.disposisiList.length === 0);

  return (
    <div className="space-y-5">
      {/* Top Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <GitPullRequest className="w-5 h-5 text-indigo-600" />
                Papan Pelacakan Disposisi Berkas
              </h2>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700">
                {allDisposisi.length} Disposisi Aktif
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Pantau siapa petugas/pejabat penerima berkas yang melanjutkan dan catatan tindak lanjutnya
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => exportPerformaDisposisiCSV(suratList)}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold border border-slate-200 transition-colors cursor-pointer"
            >
              Ekspor Disposisi (Excel)
            </button>

            {/* View Mode Switcher */}
            <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200">
              <button
                onClick={() => setViewMode('kanban')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                  viewMode === 'kanban'
                    ? 'bg-white text-blue-600 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Papan Kanban
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                  viewMode === 'list'
                    ? 'bg-white text-blue-600 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Tabel Rinci
              </button>
            </div>
          </div>
        </div>

        {/* Filter controls */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setSelectedStatusTab('all')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                selectedStatusTab === 'all'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Semua ({allDisposisi.length})
            </button>
            <button
              onClick={() => setSelectedStatusTab('Sedang Diproses')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                selectedStatusTab === 'Sedang Diproses'
                  ? 'bg-amber-500 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Sedang Diproses ({allDisposisi.filter(d => d.disp.status === 'Sedang Diproses').length})
            </button>
            <button
              onClick={() => setSelectedStatusTab('Selesai')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                selectedStatusTab === 'Selesai'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Selesai ({allDisposisi.filter(d => d.disp.status === 'Selesai').length})
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Filter Petugas Penerima:</span>
            <select
              value={filterPejabat}
              onChange={e => setFilterPejabat(e.target.value)}
              className="py-1 px-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 outline-none"
            >
              <option value="all">Semua Penerima Berkas</option>
              {pejabatOptions.map((pejabat, idx) => (
                <option key={idx} value={pejabat}>
                  {pejabat}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Alert banner if there are incoming letters without disposition */}
      {suratBelumDisposisi.length > 0 && (
        <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-blue-950">
                {suratBelumDisposisi.length} Surat Masuk Belum Didisposisikan
              </div>
              <div className="text-[11px] text-blue-700">
                Tentukan siapa yang akan melanjutkan berkas dan berikan instruksi tindak lanjut.
              </div>
            </div>
          </div>
          {currentUser.role === 'Pimpinan' && (
            <button
              onClick={() => onOpenBuatDisposisi(suratBelumDisposisi[0])}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shrink-0 self-start sm:self-auto cursor-pointer"
            >
              Disposisikan Surat Ini
            </button>
          )}
        </div>
      )}

      {/* Kanban View */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Column 1: Menunggu / Baru */}
          <div className="space-y-3">
            <div className="flex items-center justify-between p-2.5 bg-slate-100 rounded-xl border border-slate-200">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-slate-500" />
                Menunggu / Baru Diteruskan
              </span>
              <span className="text-xs font-bold text-slate-500 bg-white px-2 py-0.5 rounded-md shadow-2xs">
                {filteredItems.filter(i => i.disp.status === 'Menunggu' || i.disp.progresPersen < 20).length}
              </span>
            </div>

            <div className="space-y-3">
              {filteredItems
                .filter(i => i.disp.status === 'Menunggu' || i.disp.progresPersen < 20)
                .map((item, idx) => (
                  <DisposisiCard
                    key={idx}
                    item={item}
                    currentUser={currentUser}
                    onOpenTindakLanjut={onOpenTindakLanjutModal}
                    onOpenDetail={onOpenSuratDetail}
                    onPrint={onOpenPrintDisposisi}
                    onOpenFotoPreview={setViewingFoto}
                    onTriggerDelete={(sId, dId) => {
                      setDispToDelete({
                        suratId: sId,
                        disposisiId: dId,
                        suratJudul: item.surat.perihal,
                        penerima: item.disp.namaPenerimaBerkas || item.disp.tujuanNama || 'Penerima Berkas',
                        instansi: item.disp.instansiTujuan || item.disp.tujuanUnit || 'Instansi Terkait',
                      });
                    }}
                  />
                ))}
            </div>
          </div>

          {/* Column 2: Sedang Diproses */}
          <div className="space-y-3">
            <div className="flex items-center justify-between p-2.5 bg-amber-50 rounded-xl border border-amber-200">
              <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                Sedang Diproses oleh Penerima Berkas
              </span>
              <span className="text-xs font-bold text-amber-700 bg-white px-2 py-0.5 rounded-md shadow-2xs">
                {filteredItems.filter(i => i.disp.status === 'Sedang Diproses' && i.disp.progresPersen >= 20).length}
              </span>
            </div>

            <div className="space-y-3">
              {filteredItems
                .filter(i => i.disp.status === 'Sedang Diproses' && i.disp.progresPersen >= 20)
                .map((item, idx) => (
                  <DisposisiCard
                    key={idx}
                    item={item}
                    currentUser={currentUser}
                    onOpenTindakLanjut={onOpenTindakLanjutModal}
                    onOpenDetail={onOpenSuratDetail}
                    onPrint={onOpenPrintDisposisi}
                    onOpenFotoPreview={setViewingFoto}
                    onTriggerDelete={(sId, dId) => {
                      setDispToDelete({
                        suratId: sId,
                        disposisiId: dId,
                        suratJudul: item.surat.perihal,
                        penerima: item.disp.namaPenerimaBerkas || item.disp.tujuanNama || 'Penerima Berkas',
                        instansi: item.disp.instansiTujuan || item.disp.tujuanUnit || 'Instansi Terkait',
                      });
                    }}
                  />
                ))}
            </div>
          </div>

          {/* Column 3: Selesai */}
          <div className="space-y-3">
            <div className="flex items-center justify-between p-2.5 bg-emerald-50 rounded-xl border border-emerald-200">
              <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Selesai Ditindaklanjuti
              </span>
              <span className="text-xs font-bold text-emerald-700 bg-white px-2 py-0.5 rounded-md shadow-2xs">
                {filteredItems.filter(i => i.disp.status === 'Selesai').length}
              </span>
            </div>

            <div className="space-y-3">
              {filteredItems
                .filter(i => i.disp.status === 'Selesai')
                .map((item, idx) => (
                  <DisposisiCard
                    key={idx}
                    item={item}
                    currentUser={currentUser}
                    onOpenTindakLanjut={onOpenTindakLanjutModal}
                    onOpenDetail={onOpenSuratDetail}
                    onPrint={onOpenPrintDisposisi}
                    onOpenFotoPreview={setViewingFoto}
                    onTriggerDelete={(sId, dId) => {
                      setDispToDelete({
                        suratId: sId,
                        disposisiId: dId,
                        suratJudul: item.surat.perihal,
                        penerima: item.disp.namaPenerimaBerkas || item.disp.tujuanNama || 'Penerima Berkas',
                        instansi: item.disp.instansiTujuan || item.disp.tujuanUnit || 'Instansi Terkait',
                      });
                    }}
                  />
                ))}
            </div>
          </div>
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  <th className="py-3 px-4">Surat & Nomor Agenda</th>
                  <th className="py-3 px-4">Penerima Berkas yang Melanjutkan</th>
                  <th className="py-3 px-4">Petunjuk / Instruksi</th>
                  <th className="py-3 px-4">Progres & Hasil</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-slate-400">
                      Tidak ada disposisi yang sesuai kriteria filter
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-blue-900 font-mono">
                          {item.surat.nomorAgenda}
                        </div>
                        <div className="text-[11px] font-semibold text-slate-800 line-clamp-1">
                          {item.surat.perihal}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {item.surat.nomorSurat} • {item.surat.pengirim}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-indigo-600" />
                          <span>{item.disp.namaPenerimaBerkas || item.disp.tujuanNama || 'Penerima Berkas'}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {item.disp.instansiTujuan || item.disp.tujuanUnit || 'Instansi Terkait'}
                        </div>
                        {item.disp.buktiFoto?.url && (
                          <button
                            type="button"
                            onClick={() => setViewingFoto({
                              url: item.disp.buktiFoto!.url,
                              namaPenerima: item.disp.buktiFoto!.namaPenerima || item.disp.namaPenerimaBerkas,
                              instansi: item.disp.instansiTujuan,
                              judulSurat: item.surat.perihal,
                              nomorAgenda: item.surat.nomorAgenda,
                              tanggal: item.disp.buktiFoto!.tanggal,
                              keterangan: item.disp.buktiFoto!.keterangan,
                            })}
                            className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors cursor-pointer"
                          >
                            <Camera className="w-3 h-3 text-emerald-600" />
                            <span>Bukti Foto Penerima</span>
                          </button>
                        )}
                      </td>

                      <td className="py-3 px-4 max-w-xs">
                        <div className="flex flex-wrap gap-1">
                          {item.disp.instruksi.map((ins, i) => (
                            <span
                              key={i}
                              className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 text-slate-700 font-medium"
                            >
                              {ins}
                            </span>
                          ))}
                        </div>
                        {item.disp.catatanKhusus && (
                          <div className="text-[10px] text-slate-500 italic mt-1 line-clamp-2">
                            "{item.disp.catatanKhusus}"
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              item.disp.status === 'Selesai'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {item.disp.status}
                          </span>
                          <span className="font-bold text-slate-700 text-xs">
                            {item.disp.progresPersen}%
                          </span>
                        </div>
                        {item.disp.laporanHasil && (
                          <div className="text-[10px] text-slate-500 line-clamp-1 italic">
                            Hasil: {item.disp.laporanHasil}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onOpenTindakLanjutModal(item.surat, item.disp)}
                            className="px-2.5 py-1 text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
                          >
                            Update Progres
                          </button>
                          <button
                            onClick={() => onOpenPrintDisposisi(item.surat)}
                            className="p-1 text-slate-400 hover:text-slate-600 rounded hover:bg-slate-100 transition-colors cursor-pointer"
                            title="Cetak Lembar Disposisi"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                          {onDeleteDisposisi && (
                            <button
                              onClick={() => {
                                setDispToDelete({
                                  suratId: item.surat.id,
                                  disposisiId: item.disp.id,
                                  suratJudul: item.surat.perihal,
                                  penerima: item.disp.namaPenerimaBerkas || item.disp.tujuanNama || 'Penerima Berkas',
                                  instansi: item.disp.instansiTujuan || item.disp.tujuanUnit || 'Instansi Terkait',
                                });
                              }}
                              className="p-1 text-rose-400 hover:text-rose-600 rounded hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Hapus Lembar Disposisi Ini"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus Lembar Disposisi */}
      <ConfirmDeleteModal
        isOpen={!!dispToDelete}
        onClose={() => setDispToDelete(null)}
        onConfirm={() => {
          if (dispToDelete && onDeleteDisposisi) {
            onDeleteDisposisi(dispToDelete.suratId, dispToDelete.disposisiId);
            setDispToDelete(null);
          }
        }}
        title="Hapus Lembar Disposisi"
        description="Apakah Anda yakin ingin menghapus lembar disposisi ini? Data akan segera disinkronkan ke buku agenda dan Google Spreadsheet."
        details={
          dispToDelete
            ? [
                { label: 'Perihal Surat', value: dispToDelete.suratJudul },
                { label: 'Penerima Berkas', value: dispToDelete.penerima },
                { label: 'Instansi/Bidang', value: dispToDelete.instansi },
              ]
            : []
        }
        confirmButtonText="Ya, Hapus Lembar Disposisi"
      />

      {/* Modal Pratinjau Foto Bukti Penerima */}
      <FotoBuktiViewerModal
        isOpen={!!viewingFoto}
        onClose={() => setViewingFoto(null)}
        fotoUrl={viewingFoto?.url || ''}
        namaPenerima={viewingFoto?.namaPenerima}
        instansi={viewingFoto?.instansi}
        judulSurat={viewingFoto?.judulSurat}
        nomorAgenda={viewingFoto?.nomorAgenda}
        tanggal={viewingFoto?.tanggal}
        keterangan={viewingFoto?.keterangan}
      />
    </div>
  );
};

interface DisposisiCardProps {
  item: { surat: SuratMasuk; disp: DisposisiItem };
  currentUser: UserSession;
  onOpenTindakLanjut: (surat: SuratMasuk, disp: DisposisiItem) => void;
  onOpenDetail: (surat: SuratMasuk) => void;
  onPrint: (surat: SuratMasuk) => void;
  onOpenFotoPreview: (fotoData: {
    url: string;
    namaPenerima?: string;
    instansi?: string;
    judulSurat?: string;
    nomorAgenda?: string;
    tanggal?: string;
    keterangan?: string;
  }) => void;
  onTriggerDelete?: (suratId: string, disposisiId: string) => void;
}

const DisposisiCard: React.FC<DisposisiCardProps> = ({
  item,
  currentUser,
  onOpenTindakLanjut,
  onOpenDetail,
  onPrint,
  onOpenFotoPreview,
  onTriggerDelete,
}) => {
  const { surat, disp } = item;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all space-y-3">
      {/* Top badges */}
      <div className="flex items-center justify-between text-xs">
        <span className="font-mono font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded">
          {surat.nomorAgenda}
        </span>
        <span
          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
            disp.status === 'Selesai'
              ? 'bg-emerald-100 text-emerald-800'
              : disp.status === 'Sedang Diproses'
              ? 'bg-amber-100 text-amber-800'
              : 'bg-slate-100 text-slate-700'
          }`}
        >
          {disp.status}
        </span>
      </div>

      {/* Target Disposisi: Fokus ke Petugas Penerima Berkas */}
      <div className="p-2.5 rounded-lg bg-indigo-50/70 border border-indigo-100">
        <div className="text-[10px] uppercase font-bold text-indigo-700 tracking-wider flex items-center gap-1">
          <User className="w-3 h-3 text-indigo-600" /> Petugas Penerima Berkas:
        </div>
        <div className="font-bold text-xs text-indigo-950 mt-1">
          {disp.namaPenerimaBerkas || disp.tujuanNama || 'Penerima Berkas'}
        </div>
        <div className="text-[11px] text-slate-600 mt-0.5 flex items-center gap-1">
          <Building className="w-3 h-3 text-slate-400 shrink-0" />
          <span>{disp.instansiTujuan || disp.tujuanUnit || 'Instansi Terkait'}</span>
        </div>
      </div>

      {/* FITUR BUKTI FOTO PENERIMA BERKAS */}
      {disp.buktiFoto?.url && (
        <div className="p-2 rounded-lg bg-emerald-50/80 border border-emerald-200 flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => onOpenFotoPreview({
              url: disp.buktiFoto!.url,
              namaPenerima: disp.buktiFoto!.namaPenerima || disp.namaPenerimaBerkas,
              instansi: disp.instansiTujuan,
              judulSurat: surat.perihal,
              nomorAgenda: surat.nomorAgenda,
              tanggal: disp.buktiFoto!.tanggal,
              keterangan: disp.buktiFoto!.keterangan,
            })}
            className="w-11 h-11 rounded-lg overflow-hidden bg-slate-100 border border-emerald-300 shrink-0 cursor-pointer hover:ring-2 hover:ring-emerald-400 transition-all relative group"
            title="Klik untuk melihat foto penerima berkas"
          >
            <img
              src={disp.buktiFoto.url}
              alt="Foto Penerima"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
            />
          </button>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] uppercase font-bold text-emerald-800 flex items-center gap-1">
              <Camera className="w-3 h-3 text-emerald-600" /> Bukti Foto Penerima:
            </div>
            <div className="text-[11px] font-semibold text-emerald-950 truncate mt-0.5">
              {disp.buktiFoto.namaPenerima || disp.namaPenerimaBerkas}
            </div>
            <button
              type="button"
              onClick={() => onOpenFotoPreview({
                url: disp.buktiFoto!.url,
                namaPenerima: disp.buktiFoto!.namaPenerima || disp.namaPenerimaBerkas,
                instansi: disp.instansiTujuan,
                judulSurat: surat.perihal,
                nomorAgenda: surat.nomorAgenda,
                tanggal: disp.buktiFoto!.tanggal,
                keterangan: disp.buktiFoto!.keterangan,
              })}
              className="text-[10px] font-medium text-emerald-700 hover:text-emerald-900 underline cursor-pointer"
            >
              Lihat Bukti Foto
            </button>
          </div>
        </div>
      )}

      {/* Perihal & Pengirim */}
      <div>
        <h4 className="text-xs font-bold text-slate-900 line-clamp-2 leading-snug">
          {surat.perihal}
        </h4>
        <div className="text-[11px] text-slate-500 mt-1 truncate">
          Dari: <span className="font-medium text-slate-700">{surat.pengirim}</span>
        </div>
      </div>

      {/* Petunjuk / Instruksi */}
      <div className="space-y-1">
        <div className="text-[10px] font-semibold text-slate-500">Instruksi Arahan:</div>
        <div className="flex flex-wrap gap-1">
          {disp.instruksi.map((ins, i) => (
            <span
              key={i}
              className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 text-slate-700 font-medium border border-slate-200"
            >
              {ins}
            </span>
          ))}
        </div>
        {disp.catatanKhusus && (
          <p className="text-[11px] text-slate-600 italic bg-slate-50 p-1.5 rounded border border-slate-100 mt-1 line-clamp-2">
            "{disp.catatanKhusus}"
          </p>
        )}
      </div>

      {/* Progress Bar */}
      <div>
        <div className="flex items-center justify-between text-[11px] mb-1">
          <span className="text-slate-500">Progres Penanganan:</span>
          <span className="font-bold text-slate-800">{disp.progresPersen}%</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
          <div
            className={`h-1.5 rounded-full transition-all duration-300 ${
              disp.status === 'Selesai'
                ? 'bg-emerald-500'
                : disp.status === 'Sedang Diproses'
                ? 'bg-amber-500'
                : 'bg-slate-400'
            }`}
            style={{ width: `${disp.progresPersen}%` }}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
        <button
          onClick={() => onOpenDetail(surat)}
          className="text-[11px] text-slate-500 hover:text-slate-800 cursor-pointer"
        >
          Detail Surat
        </button>

        <div className="flex items-center gap-1.5">
          {onTriggerDelete && (
            <button
              onClick={() => onTriggerDelete(surat.id, disp.id)}
              className="p-1 rounded text-rose-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
              title="Hapus Lembar Disposisi Ini"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={() => onPrint(surat)}
            className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Cetak Lembar Disposisi"
          >
            <Printer className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => onOpenTindakLanjut(surat, disp)}
            className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
          >
            Update Progres
          </button>
        </div>
      </div>
    </div>
  );
};

