import React, { useState, useRef } from 'react';
import {
  X,
  CheckCircle2,
  Clock,
  Send,
  MessageSquare,
  FileCheck,
  Calendar,
  User,
  Camera,
  Upload,
  Trash2,
  Building,
  Image as ImageIcon,
  AlertCircle,
  Eye,
} from 'lucide-react';
import { SuratMasuk, DisposisiItem, UserSession, BuktiFotoDisposisi } from '../types';
import { compressMobileImage } from '../utils/imageCompressor';

interface TindakLanjutModalProps {
  isOpen: boolean;
  onClose: () => void;
  surat: SuratMasuk | null;
  disposisi: DisposisiItem | null;
  currentUser: UserSession;
  onSubmitTindakLanjut: (
    suratId: string,
    disposisiId: string,
    status: 'Menunggu' | 'Sedang Diproses' | 'Selesai',
    progresPersen: number,
    keteranganProgres: string,
    namaPelaksana: string,
    laporanHasil?: string,
    buktiFoto?: BuktiFotoDisposisi
  ) => void;
}

export const TindakLanjutModal: React.FC<TindakLanjutModalProps> = ({
  isOpen,
  onClose,
  surat,
  disposisi,
  currentUser,
  onSubmitTindakLanjut,
}) => {
  if (!isOpen || !surat || !disposisi) return null;

  const [status, setStatus] = useState<'Menunggu' | 'Sedang Diproses' | 'Selesai'>(
    disposisi.status === 'Terlambat' ? 'Sedang Diproses' : disposisi.status
  );
  const [progresPersen, setProgresPersen] = useState<number>(disposisi.progresPersen || 25);
  const [keteranganProgres, setKeteranganProgres] = useState<string>('');
  const [laporanHasil, setLaporanHasil] = useState<string>(disposisi.laporanHasil || '');
  
  // Bukti foto penerima berkas
  const [fotoPenerimaUrl, setFotoPenerimaUrl] = useState<string>(
    disposisi.buktiFoto?.url || ''
  );
  const [namaPenerimaFisik, setNamaPenerimaFisik] = useState<string>(
    disposisi.buktiFoto?.namaPenerima || disposisi.namaPenerimaBerkas || currentUser.nama
  );
  const [catatanFoto, setCatatanFoto] = useState<string>(
    disposisi.buktiFoto?.keterangan || ''
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Resize and compress image to base64 using mobile-optimized helper
  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsCompressing(true);
      setErrorMessage(null);
      const res = await compressMobileImage(file, 1024, 1024, 0.82);
      setFotoPenerimaUrl(res.dataUrl);
    } catch (err: any) {
      console.warn('Canvas compression error:', err);
      setErrorMessage(err.message || 'Gagal memproses gambar foto penerima.');
    } finally {
      setIsCompressing(false);
      // Reset input value so iPhone allows re-taking photo if changed
      if (e.target) {
        e.target.value = '';
      }
    }
  };

  const handleRemovePhoto = () => {
    setFotoPenerimaUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!keteranganProgres.trim()) {
      setErrorMessage('Harap tuliskan catatan progres tindak lanjut Anda!');
      return;
    }

    const finalStatus = progresPersen >= 100 ? 'Selesai' : status;
    const finalProgres = finalStatus === 'Selesai' ? 100 : progresPersen;

    const now = new Date();
    const dateStr = now.toISOString().replace('T', ' ').substring(0, 16);

    let buktiFotoObj: BuktiFotoDisposisi | undefined = undefined;
    if (fotoPenerimaUrl) {
      buktiFotoObj = {
        url: fotoPenerimaUrl,
        namaPenerima: namaPenerimaFisik || disposisi.namaPenerimaBerkas,
        tanggal: dateStr,
        keterangan: catatanFoto || `Foto bukti penerimaan berkas oleh ${namaPenerimaFisik || disposisi.namaPenerimaBerkas}`,
      };
    }

    onSubmitTindakLanjut(
      surat.id,
      disposisi.id,
      finalStatus,
      finalProgres,
      keteranganProgres,
      currentUser.nama,
      laporanHasil || undefined,
      buktiFotoObj
    );

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl my-6 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center font-bold text-white text-sm">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold">
                Pembaruan Progres Disposisi
              </h3>
              <p className="text-xs text-slate-300">
                Laporan pelaksanaan tindak lanjut dan bukti serah terima penerima berkas
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[82vh] overflow-y-auto text-xs">
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-center gap-2 animate-in fade-in text-xs font-semibold">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Info Card */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
            <div className="text-[10px] uppercase font-bold text-slate-500">
              Dokumen yang Ditindaklanjuti
            </div>
            <div className="font-bold text-slate-900 text-xs">
              {surat.nomorAgenda} - {surat.perihal}
            </div>
            <div className="text-[11px] text-slate-600 flex items-center gap-1.5 flex-wrap">
              <Building className="w-3.5 h-3.5 text-slate-400" />
              <span>Instansi/Bidang: <strong className="text-slate-800">{disposisi.instansiTujuan || disposisi.tujuanUnit}</strong></span>
              <span className="text-slate-300">•</span>
              <User className="w-3.5 h-3.5 text-indigo-500" />
              <span>Penerima: <strong className="text-indigo-900">{disposisi.namaPenerimaBerkas || disposisi.tujuanNama}</strong></span>
            </div>
          </div>

          {/* Status Selection */}
          <div>
            <label className="block font-bold text-slate-800 text-xs mb-1.5">
              Status Pengerjaan Saat Ini:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['Menunggu', 'Sedang Diproses', 'Selesai'] as const).map(st => (
                <button
                  type="button"
                  key={st}
                  onClick={() => {
                    setStatus(st);
                    if (st === 'Selesai') setProgresPersen(100);
                  }}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold text-center transition-all cursor-pointer ${
                    status === st
                      ? st === 'Selesai'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-amber-500 text-white border-amber-500 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Progress Slider */}
          <div>
            <div className="flex items-center justify-between font-bold text-slate-800 text-xs mb-1">
              <span>Persentase Kemajuan (Progres):</span>
              <span className="text-blue-600 font-mono text-sm">{progresPersen}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={progresPersen}
              onChange={e => {
                const val = Number(e.target.value);
                setProgresPersen(val);
                if (val >= 100) setStatus('Selesai');
                else if (val > 0) setStatus('Sedang Diproses');
              }}
              className="w-full accent-blue-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-0.5 font-mono">
              <span>0% Baru Diterima</span>
              <span>50% Dalam Proses</span>
              <span>100% Selesai Lengkap</span>
            </div>
          </div>

          {/* Catatan Kemajuan */}
          <div>
            <label className="block font-bold text-slate-800 text-xs mb-1">
              Catatan Kemajuan / Langkah Tindak Lanjut: <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              required
              value={keteranganProgres}
              onChange={e => setKeteranganProgres(e.target.value)}
              placeholder="Contoh: Berkas fisik telah diterima di meja kerja, telah dikoordinasikan dengan tim terkait..."
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:border-blue-500 outline-none text-xs"
            />
          </div>

          {/* FITUR BARU: Bukti Foto Penerima Berkas */}
          <div className="p-3.5 bg-blue-50/60 rounded-xl border border-blue-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-bold text-blue-950 text-xs">
                <Camera className="w-4 h-4 text-blue-600" />
                <span>Bukti Foto Penerima / Serah Terima Berkas:</span>
              </div>
              <span className="text-[10px] text-blue-700 bg-blue-100/80 px-2 py-0.5 rounded-full font-semibold">
                Untuk Penelusuran Berkas
              </span>
            </div>

            <p className="text-[11px] text-slate-600 leading-relaxed">
              Unggah foto fisik penerima saat menerima berkas atau foto lembar tanda terima agar saat menelusuri berkas siapa penerimanya dapat langsung terlihat.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block font-semibold text-slate-700 text-[11px] mb-1">
                  Nama Petugas Penerima:
                </label>
                <input
                  type="text"
                  value={namaPenerimaFisik}
                  onChange={e => setNamaPenerimaFisik(e.target.value)}
                  placeholder="Nama lengkap penerima berkas..."
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:border-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 text-[11px] mb-1">
                  Keterangan Foto (Opsional):
                </label>
                <input
                  type="text"
                  value={catatanFoto}
                  onChange={e => setCatatanFoto(e.target.value)}
                  placeholder="Misal: Diterima langsung di lantai 2"
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:border-blue-500 outline-none"
                />
              </div>
            </div>

            {/* Photo Preview or Upload Button */}
            {fotoPenerimaUrl ? (
              <div className="relative rounded-xl overflow-hidden border border-blue-300 bg-white shadow-xs p-2.5 flex items-center gap-3">
                <div className="w-20 h-20 rounded-lg overflow-hidden bg-slate-100 shrink-0 border border-slate-200 relative group">
                  <img
                    src={fotoPenerimaUrl}
                    alt="Bukti Penerima"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-xs">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Foto Siap Disimpan</span>
                  </div>
                  <div className="text-[11px] font-semibold text-slate-800 truncate mt-0.5">
                    Penerima: {namaPenerimaFisik || 'Petugas Berkas'}
                  </div>
                  <div className="text-[10px] text-slate-500 truncate">
                    {catatanFoto || 'Foto bukti serah terima berkas'}
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-medium rounded-md transition-colors cursor-pointer"
                    >
                      Ganti Foto
                    </button>
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="px-2 py-1 text-rose-600 hover:bg-rose-50 text-[11px] font-medium rounded-md transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" /> Hapus
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  capture="environment"
                  onChange={handlePhotoSelect}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isCompressing}
                  className="w-full border-2 border-dashed border-blue-300 hover:border-blue-500 bg-white/80 hover:bg-white p-3.5 rounded-xl text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 text-slate-600 hover:text-blue-700"
                >
                  <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                    {isCompressing ? (
                      <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Camera className="w-5 h-5" />
                    )}
                  </div>
                  <span className="font-bold text-xs">
                    {isCompressing ? 'Sedang Memproses Foto...' : 'Klik untuk Ambil Foto / Unggah Bukti Penerima'}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Mendukung kamera langsung di ponsel atau berkas JPG/PNG dari komputer
                  </span>
                </button>
              </div>
            )}
          </div>

          {/* Final report if Selesai */}
          {(status === 'Selesai' || progresPersen === 100) && (
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 space-y-1.5 animate-in fade-in duration-200">
              <label className="block font-bold text-emerald-950 text-xs flex items-center gap-1.5">
                <FileCheck className="w-3.5 h-3.5 text-emerald-700" />
                Ringkasan Laporan Hasil Akhir Disposisi:
              </label>
              <textarea
                rows={2}
                value={laporanHasil}
                onChange={e => setLaporanHasil(e.target.value)}
                placeholder="Tuliskan kesimpulan, nomor surat balasan, atau hasil akhir penugasan..."
                className="w-full px-3 py-1.5 bg-white border border-emerald-200 rounded-lg text-slate-800 focus:border-emerald-500 outline-none text-xs"
              />
            </div>
          )}

          {/* Timeline History */}
          {disposisi.riwayatTindakLanjut && disposisi.riwayatTindakLanjut.length > 0 && (
            <div>
              <div className="font-bold text-slate-800 text-xs mb-2">
                Riwayat Jejak Pelaksanaan Sebelumnya:
              </div>
              <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                {disposisi.riwayatTindakLanjut.map((r, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px] space-y-1"
                  >
                    <div className="flex items-center justify-between text-slate-500 text-[10px]">
                      <span className="font-semibold text-slate-700">{r.oleh}</span>
                      <span>{r.waktu}</span>
                    </div>
                    <p className="text-slate-800">{r.keterangan}</p>
                    {r.buktiFotoUrl && (
                      <div className="pt-1 flex items-center gap-1.5 text-blue-700 font-semibold text-[10px]">
                        <ImageIcon className="w-3 h-3" />
                        <span>Foto bukti tersimpan</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              Simpan & Kirim Pembaruan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
