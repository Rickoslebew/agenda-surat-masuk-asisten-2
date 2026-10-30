import React from 'react';
import {
  X,
  FileText,
  GitPullRequest,
  Calendar,
  Building,
  User,
  CheckCircle2,
  Clock,
  Printer,
  Camera,
  HardDrive,
  ExternalLink,
  ShieldCheck,
  Share2,
  Edit3,
  Trash2,
} from 'lucide-react';
import { SuratMasuk, UserSession } from '../types';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';
import { FotoBuktiViewerModal } from './FotoBuktiViewerModal';

interface SuratDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  surat: SuratMasuk | null;
  currentUser: UserSession;
  onOpenEdit?: (surat: SuratMasuk) => void;
  onOpenDisposisi: (surat: SuratMasuk) => void;
  onOpenSerahTerima: (surat: SuratMasuk) => void;
  onOpenPrint: (surat: SuratMasuk) => void;
  onOpenTindakLanjut: (surat: SuratMasuk, disp: any) => void;
  onDeleteSurat?: (id: string) => void;
  onDeleteDisposisi?: (suratId: string, disposisiId: string) => void;
}

export const SuratDetailModal: React.FC<SuratDetailModalProps> = ({
  isOpen,
  onClose,
  surat,
  currentUser,
  onOpenEdit,
  onOpenDisposisi,
  onOpenSerahTerima,
  onOpenPrint,
  onOpenTindakLanjut,
  onDeleteSurat,
  onDeleteDisposisi,
}) => {
  const [isConfirmDeleteSurat, setIsConfirmDeleteSurat] = React.useState(false);
  const [dispToDelete, setDispToDelete] = React.useState<any | null>(null);
  const [viewingFoto, setViewingFoto] = React.useState<{
    url: string;
    namaPenerima?: string;
    instansi?: string;
    judulSurat?: string;
    nomorAgenda?: string;
    tanggal?: string;
    keterangan?: string;
  } | null>(null);

  if (!isOpen || !surat) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl my-6 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white text-base">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-blue-300 text-sm">
                  {surat.nomorAgenda}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/30 text-blue-200 border border-blue-400/30">
                  {surat.status}
                </span>
              </div>
              <h3 className="text-sm font-semibold text-slate-200 truncate max-w-md">
                {surat.perihal}
              </h3>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onOpenEdit && (
              <button
                onClick={() => {
                  onClose();
                  onOpenEdit(surat);
                }}
                className="px-2.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold flex items-center gap-1 shadow-xs transition-colors"
                title="Edit / Koreksi Data Surat Masuk"
              >
                <Edit3 className="w-3.5 h-3.5" /> Edit Surat
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[82vh] overflow-y-auto text-xs">
          {/* Section 1: Data Pokok Surat */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3">
            <div className="text-xs font-bold text-slate-900 flex items-center justify-between">
              <span>Informasi Naskah Surat</span>
              <span className="text-[10px] px-2 py-0.5 rounded font-semibold bg-white border border-slate-200 text-slate-700">
                Sifat: {surat.sifat}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-700">
              <div>
                <span className="text-slate-400 text-[11px] block">Nomor Surat Resmi:</span>
                <span className="font-bold text-slate-900">{surat.nomorSurat}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[11px] block">Tanggal Surat & Diterima:</span>
                <span className="font-medium text-slate-800">
                  {surat.tanggalSurat} (Diterima: {surat.tanggalTerima})
                </span>
              </div>
              <div>
                <span className="text-slate-400 text-[11px] block">Pengirim / Asal Surat:</span>
                <span className="font-semibold text-slate-900">{surat.pengirim}</span>
                <div className="text-[11px] text-slate-500">{surat.instansiPengirim}</div>
              </div>
              <div>
                <span className="text-slate-400 text-[11px] block">Kategori / Klasifikasi:</span>
                <span className="font-medium text-slate-800">{surat.kategori}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200">
              <span className="text-slate-400 text-[11px] block">Perihal / Hal:</span>
              <div className="font-bold text-slate-900 text-sm mt-0.5">{surat.perihal}</div>
              {surat.ringkasan && surat.ringkasan !== surat.perihal && (
                <div className="text-slate-600 mt-1 bg-white p-2.5 rounded-lg border border-slate-200">
                  {surat.ringkasan}
                </div>
              )}
            </div>

            {surat.fileLampiranNama && (
              <div className="pt-2 flex items-center justify-between bg-blue-50/70 p-2.5 rounded-lg border border-blue-100">
                <div className="flex items-center gap-2 text-blue-900 font-medium">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span>Berkas Lampiran: {surat.fileLampiranNama}</span>
                </div>
                <span className="text-[10px] text-blue-600 font-semibold">Tersimpan</span>
              </div>
            )}
          </div>

          {/* Section 2: Lembar Disposisi & Arah Disposisi */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <GitPullRequest className="w-4 h-4 text-indigo-600" />
                <h4 className="text-xs font-bold text-slate-900">
                  Lembar Disposisi Surat ({surat.disposisiList.length})
                </h4>
              </div>
              {(currentUser.role === 'Pimpinan' || currentUser.role === 'Admin') && (
                <button
                  onClick={() => onOpenDisposisi(surat)}
                  className="px-2.5 py-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
                >
                  + Tambah Disposisi
                </button>
              )}
            </div>

            {surat.disposisiList.length === 0 ? (
              <div className="p-4 rounded-xl border border-dashed border-slate-300 text-center text-slate-400">
                Belum ada instruksi disposisi untuk surat ini.
              </div>
            ) : (
              <div className="space-y-3">
                {surat.disposisiList.map((d, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/30 space-y-3"
                  >
                    {/* Header Disposisi */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-[10px] uppercase font-bold text-indigo-600 tracking-wider">
                          Instansi / Bidang yang Dituju:
                        </div>
                        <div className="font-bold text-slate-900 text-sm">
                          {d.instansiTujuan || d.tujuanUnit || 'Instansi Terkait'}
                        </div>
                        <div className="text-xs text-indigo-900 font-semibold mt-0.5">
                          Penerima Berkas: {d.namaPenerimaBerkas || d.tujuanNama || 'Penerima Berkas'}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            d.status === 'Selesai'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {d.status} ({d.progresPersen}%)
                        </span>
                      </div>
                    </div>

                    {/* Bukti Foto Penerima Berkas */}
                    {d.buktiFoto?.url && (
                      <div className="p-2.5 rounded-xl bg-emerald-50/80 border border-emerald-200 flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setViewingFoto({
                            url: d.buktiFoto!.url,
                            namaPenerima: d.buktiFoto!.namaPenerima || d.namaPenerimaBerkas,
                            instansi: d.instansiTujuan,
                            judulSurat: surat.perihal,
                            nomorAgenda: surat.nomorAgenda,
                            tanggal: d.buktiFoto!.tanggal,
                            keterangan: d.buktiFoto!.keterangan,
                          })}
                          className="w-12 h-12 rounded-lg overflow-hidden bg-slate-100 border border-emerald-300 shrink-0 cursor-pointer hover:ring-2 hover:ring-emerald-400 transition-all relative group"
                          title="Klik untuk melihat bukti foto penerima berkas"
                        >
                          <img
                            src={d.buktiFoto.url}
                            alt="Foto Penerima"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        </button>
                        <div className="flex-1 min-w-0">
                          <div className="text-[10px] uppercase font-bold text-emerald-800 flex items-center gap-1">
                            <Camera className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Bukti Foto Penerima Berkas Fisik:</span>
                          </div>
                          <div className="text-xs font-bold text-emerald-950 truncate mt-0.5">
                            {d.buktiFoto.namaPenerima || d.namaPenerimaBerkas}
                          </div>
                          <button
                            type="button"
                            onClick={() => setViewingFoto({
                              url: d.buktiFoto!.url,
                              namaPenerima: d.buktiFoto!.namaPenerima || d.namaPenerimaBerkas,
                              instansi: d.instansiTujuan,
                              judulSurat: surat.perihal,
                              nomorAgenda: surat.nomorAgenda,
                              tanggal: d.buktiFoto!.tanggal,
                              keterangan: d.buktiFoto!.keterangan,
                            })}
                            className="text-[11px] font-medium text-emerald-700 hover:text-emerald-900 underline cursor-pointer"
                          >
                            Perbesar Foto Bukti
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Instruksi */}
                    <div className="space-y-1">
                      <div className="text-[10px] font-semibold text-slate-500">
                        Petunjuk / Instruksi Pimpinan:
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {d.instruksi.map((ins, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded bg-white border border-indigo-200 text-indigo-900 font-medium text-[11px]"
                          >
                            ✓ {ins}
                          </span>
                        ))}
                      </div>
                      {d.catatanKhusus && (
                        <p className="text-xs text-slate-700 italic bg-white p-2 rounded-lg border border-slate-200 mt-1">
                          "{d.catatanKhusus}"
                        </p>
                      )}
                    </div>

                    {/* Laporan hasil akhir jika selesai */}
                    {d.laporanHasil && (
                      <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-950">
                        <span className="font-bold text-[10px] uppercase block text-emerald-800">
                          Hasil Akhir Tindak Lanjut:
                        </span>
                        <p className="text-xs mt-0.5">{d.laporanHasil}</p>
                      </div>
                    )}

                    {/* Riwayat Jejak */}
                    {d.riwayatTindakLanjut && d.riwayatTindakLanjut.length > 0 && (
                      <div className="pt-2 border-t border-indigo-100 space-y-1.5">
                        <div className="text-[10px] font-semibold text-slate-500">
                          Riwayat Catatan Progres:
                        </div>
                        <div className="space-y-1">
                          {d.riwayatTindakLanjut.map((r, rIdx) => (
                            <div
                              key={rIdx}
                              className="text-[11px] p-2 bg-white rounded-lg border border-slate-200 flex items-start justify-between gap-2"
                            >
                              <div>
                                <span className="font-semibold text-slate-800">{r.oleh}: </span>
                                <span className="text-slate-600">{r.keterangan}</span>
                              </div>
                              <span className="text-[10px] text-slate-400 shrink-0">{r.waktu}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Action button inside disposition */}
                    <div className="pt-2 border-t border-indigo-100 flex items-center justify-between gap-2">
                      {onDeleteDisposisi && (
                        <button
                          type="button"
                          onClick={() => setDispToDelete(d)}
                          className="px-2.5 py-1 bg-white hover:bg-rose-50 text-rose-600 hover:text-rose-700 border border-slate-200 hover:border-rose-300 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                          title="Hapus lembar disposisi ini jika terjadi kesalahan"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                          Hapus Disposisi
                        </button>
                      )}

                      <button
                        onClick={() => onOpenTindakLanjut(surat, d)}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-2xs ml-auto cursor-pointer"
                      >
                        Perbarui Progres Disposisi
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 3: Bukti Serah Terima Dokumen Fisik */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-emerald-600" />
                <h4 className="text-xs font-bold text-slate-900">
                  Bukti Serah Terima Dokumen Fisik
                </h4>
              </div>
              <button
                onClick={() => onOpenSerahTerima(surat)}
                className="text-xs font-semibold text-blue-600 hover:underline"
              >
                {surat.buktiFisik ? 'Kelola Bukti / Arsip Drive' : '+ Unggah Bukti Fisik'}
              </button>
            </div>

            {surat.buktiFisik ? (
              <div className="flex flex-col sm:flex-row items-start gap-4">
                <img
                  src={surat.buktiFisik.fotoUrl}
                  alt="Bukti fisik"
                  className="w-32 h-32 object-cover rounded-xl border border-slate-200 shadow-xs shrink-0"
                />
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />{' '}
                      {surat.buktiFisik.statusVerifikasi}
                    </span>
                    {surat.buktiFisik.diarsipkanKeDrive ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 flex items-center gap-1">
                        <HardDrive className="w-3 h-3 text-blue-600" /> Tersimpan di Google Drive
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400">Tersimpan secara lokal</span>
                    )}
                  </div>

                  <div className="text-xs text-slate-800">
                    Penerima Fisik:{' '}
                    <span className="font-semibold">{surat.buktiFisik.namaPenerimaFisik}</span>
                  </div>
                  <div className="text-[11px] text-slate-600">
                    Waktu: {surat.buktiFisik.tanggalSerahTerima}
                  </div>
                  {surat.buktiFisik.ekspedisiKurir && (
                    <div className="text-[11px] text-slate-600">
                      Pengantar: {surat.buktiFisik.ekspedisiKurir}{' '}
                      {surat.buktiFisik.nomorResi && `(Resi: ${surat.buktiFisik.nomorResi})`}
                    </div>
                  )}
                  {surat.buktiFisik.catatan && (
                    <p className="text-[11px] text-slate-500 italic">
                      "{surat.buktiFisik.catatan}"
                    </p>
                  )}

                  {surat.buktiFisik.driveWebViewLink && (
                    <a
                      href={surat.buktiFisik.driveWebViewLink}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 underline mt-1"
                    >
                      Buka di Google Drive <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-slate-400 text-center py-3 text-xs">
                Belum ada foto serah terima dokumen fisik yang diunggah.
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <button
              onClick={() => onOpenPrint(surat)}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4 text-slate-600" />
              Cetak Lembar Disposisi Resmi (PDF)
            </button>

            <div className="flex items-center gap-2">
              {onDeleteSurat && (
                <button
                  type="button"
                  onClick={() => setIsConfirmDeleteSurat(true)}
                  className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 hover:text-rose-800 border border-rose-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Hapus surat masuk ini dari buku agenda"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                  Hapus Surat
                </button>
              )}

              <button
                onClick={onClose}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal: Delete Surat */}
      <ConfirmDeleteModal
        isOpen={isConfirmDeleteSurat}
        onClose={() => setIsConfirmDeleteSurat(false)}
        onConfirm={() => {
          setIsConfirmDeleteSurat(false);
          if (onDeleteSurat) {
            onDeleteSurat(surat.id);
            onClose();
          }
        }}
        title="Hapus Surat Masuk"
        description="Apakah Anda yakin ingin menghapus surat masuk ini? Seluruh lembar disposisi dan riwayat terkait akan ikut terhapus permanen."
        details={[
          { label: 'No. Agenda', value: surat.nomorAgenda },
          { label: 'No. Surat', value: surat.nomorSurat },
          { label: 'Pengirim', value: surat.pengirim },
          { label: 'Perihal', value: surat.perihal },
        ]}
        confirmButtonText="Ya, Hapus Surat Ini"
      />

      {/* Confirmation Modal: Delete Disposisi */}
      <ConfirmDeleteModal
        isOpen={!!dispToDelete}
        onClose={() => setDispToDelete(null)}
        onConfirm={() => {
          if (dispToDelete && onDeleteDisposisi) {
            onDeleteDisposisi(surat.id, dispToDelete.id);
            setDispToDelete(null);
          }
        }}
        title="Hapus Lembar Disposisi"
        description="Apakah Anda yakin ingin menghapus lembar disposisi ini?"
        details={
          dispToDelete
            ? [
                { label: 'Perihal Surat', value: surat.perihal },
                {
                  label: 'Penerima Berkas',
                  value: dispToDelete.namaPenerimaBerkas || dispToDelete.tujuanNama || 'Penerima Berkas',
                },
                {
                  label: 'Instansi/Bidang',
                  value: dispToDelete.instansiTujuan || dispToDelete.tujuanUnit || 'Instansi Terkait',
                },
              ]
            : []
        }
        confirmButtonText="Ya, Hapus Disposisi"
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
