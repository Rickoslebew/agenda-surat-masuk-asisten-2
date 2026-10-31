import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  FileText,
  Camera,
  Upload,
  AlertCircle,
  Check,
  Edit3,
  Smartphone,
  RefreshCw,
  Trash2,
  Eye,
  Image as ImageIcon,
  Loader2,
} from 'lucide-react';
import { SuratMasuk, SifatSurat, StatusSurat, UserSession } from '../types';
import { compressMobileImage, getBase64SizeKb } from '../utils/imageCompressor';

interface SuratModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<SuratMasuk, 'id' | 'waktuDibuat' | 'waktuDiperbarui' | 'disposisiList'>) => void;
  onUpdate?: (id: string, updates: Partial<SuratMasuk>) => void;
  suratToEdit?: SuratMasuk | null;
  currentUser: UserSession;
  totalSuratCount: number;
}

export const SuratModal: React.FC<SuratModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onUpdate,
  suratToEdit,
  currentUser,
  totalSuratCount,
}) => {
  const currentYear = new Date().getFullYear();
  const currentMonth = String(new Date().getMonth() + 1).padStart(2, '0');
  const defaultAgendaNo = `AGD/${currentYear}/${currentMonth}/${String(totalSuratCount + 1).padStart(3, '0')}`;
  const today = new Date().toISOString().slice(0, 10);

  const [nomorAgenda, setNomorAgenda] = useState(defaultAgendaNo);
  const [nomorSurat, setNomorSurat] = useState('');
  const [tanggalSurat, setTanggalSurat] = useState(today);
  const [tanggalTerima, setTanggalTerima] = useState(today);
  const [pengirim, setPengirim] = useState('');
  const [instansiPengirim, setInstansiPengirim] = useState('');
  const [perihal, setPerihal] = useState('');
  const [ringkasan, setRingkasan] = useState('');
  const [sifat, setSifat] = useState<SifatSurat>('Biasa');
  const [kategori, setKategori] = useState('Undangan');
  const [status, setStatus] = useState<StatusSurat>('Baru Masuk');
  const [fileLampiranNama, setFileLampiranNama] = useState('');
  const [fotoBuktiUrl, setFotoBuktiUrl] = useState('');
  const [fotoBuktiSizeKb, setFotoBuktiSizeKb] = useState<number>(0);
  const [isCompressingFoto, setIsCompressingFoto] = useState<boolean>(false);
  const [fotoBuktiError, setFotoBuktiError] = useState<string | null>(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState<boolean>(false);
  const [namaPenerimaFisik, setNamaPenerimaFisik] = useState(currentUser.nama);
  const [ekspedisiKurir, setEkspedisiKurir] = useState('');
  const [nomorResi, setNomorResi] = useState('');

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  // Update states when suratToEdit or isOpen changes
  useEffect(() => {
    if (suratToEdit) {
      setNomorAgenda(suratToEdit.nomorAgenda);
      setNomorSurat(suratToEdit.nomorSurat);
      setTanggalSurat(suratToEdit.tanggalSurat);
      setTanggalTerima(suratToEdit.tanggalTerima);
      setPengirim(suratToEdit.pengirim);
      setInstansiPengirim(suratToEdit.instansiPengirim || '');
      setPerihal(suratToEdit.perihal);
      setRingkasan(suratToEdit.ringkasan || '');
      setSifat(suratToEdit.sifat);
      setKategori(suratToEdit.kategori);
      setStatus(suratToEdit.status);
      setFileLampiranNama(suratToEdit.fileLampiranNama || '');
      setFotoBuktiError(null);
      if (suratToEdit.buktiFisik) {
        setFotoBuktiUrl(suratToEdit.buktiFisik.fotoUrl || '');
        setFotoBuktiSizeKb(getBase64SizeKb(suratToEdit.buktiFisik.fotoUrl || ''));
        setNamaPenerimaFisik(suratToEdit.buktiFisik.namaPenerimaFisik || currentUser.nama);
        setEkspedisiKurir(suratToEdit.buktiFisik.ekspedisiKurir || '');
        setNomorResi(suratToEdit.buktiFisik.nomorResi || '');
      } else {
        setFotoBuktiUrl('');
        setFotoBuktiSizeKb(0);
        setNamaPenerimaFisik(currentUser.nama);
        setEkspedisiKurir('');
        setNomorResi('');
      }
    } else {
      setNomorAgenda(defaultAgendaNo);
      setNomorSurat('');
      setTanggalSurat(today);
      setTanggalTerima(today);
      setPengirim('');
      setInstansiPengirim('');
      setPerihal('');
      setRingkasan('');
      setSifat('Biasa');
      setKategori('Undangan');
      setStatus('Baru Masuk');
      setFileLampiranNama('');
      setFotoBuktiUrl('');
      setFotoBuktiSizeKb(0);
      setFotoBuktiError(null);
      setNamaPenerimaFisik(currentUser.nama);
      setEkspedisiKurir('');
      setNomorResi('');
    }
  }, [suratToEdit, isOpen]);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileLampiranNama(file.name);
    }
  };

  const handleFotoBuktiSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsCompressingFoto(true);
      setFotoBuktiError(null);
      const result = await compressMobileImage(file, 1200, 1200, 0.82);
      setFotoBuktiUrl(result.dataUrl);
      setFotoBuktiSizeKb(result.sizeKb);
    } catch (err: any) {
      console.error('Error handling mobile photo upload in SuratModal:', err);
      setFotoBuktiError(err.message || 'Gagal memproses foto dari handphone.');
    } finally {
      setIsCompressingFoto(false);
      // Essential for iPhone Safari: clear input value so repeated camera shots re-trigger onChange
      if (e.target) {
        e.target.value = '';
      }
    }
  };

  const handleRemoveFotoBukti = () => {
    setFotoBuktiUrl('');
    setFotoBuktiSizeKb(0);
    setFotoBuktiError(null);
    if (cameraInputRef.current) cameraInputRef.current.value = '';
    if (galleryInputRef.current) galleryInputRef.current.value = '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nomorSurat.trim() || !pengirim.trim() || !perihal.trim()) {
      alert('Mohon lengkapi Nomor Surat, Pengirim, dan Perihal!');
      return;
    }

    if (suratToEdit && onUpdate) {
      // Edit mode: update existing letter
      const updates: Partial<SuratMasuk> = {
        nomorAgenda,
        nomorSurat,
        tanggalSurat,
        tanggalTerima,
        pengirim,
        instansiPengirim: instansiPengirim || pengirim,
        perihal,
        ringkasan: ringkasan || perihal,
        sifat,
        kategori,
        status,
        fileLampiranNama: fileLampiranNama || undefined,
      };

      if (fotoBuktiUrl) {
        updates.buktiFisik = {
          id: suratToEdit.buktiFisik?.id || 'bkt-' + Date.now(),
          fotoUrl: fotoBuktiUrl,
          namaPenerimaFisik: namaPenerimaFisik || currentUser.nama,
          tanggalSerahTerima: `${tanggalTerima} ${new Date().toTimeString().slice(0, 5)}`,
          ekspedisiKurir: ekspedisiKurir || 'Kurir Langsung',
          nomorResi: nomorResi || undefined,
          statusVerifikasi: suratToEdit.buktiFisik?.statusVerifikasi || 'Terverifikasi',
          diarsipkanKeDrive: suratToEdit.buktiFisik?.diarsipkanKeDrive || false,
          driveFileId: suratToEdit.buktiFisik?.driveFileId,
          driveWebViewLink: suratToEdit.buktiFisik?.driveWebViewLink,
        };
      }

      onUpdate(suratToEdit.id, updates);
    } else {
      // Create mode
      const payload: Omit<SuratMasuk, 'id' | 'waktuDibuat' | 'waktuDiperbarui' | 'disposisiList'> = {
        nomorAgenda,
        nomorSurat,
        tanggalSurat,
        tanggalTerima,
        pengirim,
        instansiPengirim: instansiPengirim || pengirim,
        perihal,
        ringkasan: ringkasan || perihal,
        sifat,
        kategori,
        status,
        fileLampiranNama: fileLampiranNama || undefined,
        buktiFisik: fotoBuktiUrl
          ? {
              id: 'bkt-' + Date.now(),
              fotoUrl: fotoBuktiUrl,
              namaPenerimaFisik: namaPenerimaFisik || currentUser.nama,
              tanggalSerahTerima: `${tanggalTerima} ${new Date().toTimeString().slice(0, 5)}`,
              ekspedisiKurir: ekspedisiKurir || 'Kurir Langsung',
              nomorResi: nomorResi || undefined,
              statusVerifikasi: 'Terverifikasi',
              diarsipkanKeDrive: false,
            }
          : undefined,
        dibuatOleh: currentUser.nama,
      };

      onSave(payload);
    }

    onClose();
  };

  const isEditMode = !!suratToEdit;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl my-6 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white text-sm ${
              isEditMode ? 'bg-amber-600' : 'bg-blue-600'
            }`}>
              {isEditMode ? <Edit3 className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold">
                {isEditMode ? 'Edit & Koreksi Surat Masuk' : 'Pencatatan Surat Masuk Baru'}
              </h3>
              <p className="text-xs text-slate-300">
                {isEditMode
                  ? 'Perbaiki kesalahan ketik, perihal, pengirim, atau data agenda dokumen'
                  : 'Input data agenda surat masuk digital dan validasi tanda terima fisik'}
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

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto text-xs">
          {/* Row 1: Nomor Agenda & Nomor Surat */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Nomor Agenda Digital <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={nomorAgenda}
                onChange={e => setNomorAgenda(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-mono font-bold focus:bg-white focus:border-blue-500 outline-none"
              />
              <span className="text-[10px] text-slate-400">Nomor urut registrasi agenda surat</span>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Nomor Surat Resmi <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={nomorSurat}
                onChange={e => setNomorSurat(e.target.value)}
                placeholder="Contoh: 005/1842/SETDA/2026"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:border-blue-500 outline-none"
              />
            </div>
          </div>

          {/* Row 2: Tanggal Surat & Tanggal Terima */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Tanggal Tertera di Surat <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={tanggalSurat}
                onChange={e => setTanggalSurat(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:border-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Tanggal Diterima di Kantor <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={tanggalTerima}
                onChange={e => setTanggalTerima(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:border-blue-500 outline-none"
              />
            </div>
          </div>

          {/* Row 3: Pengirim & Instansi */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Asal Surat / Pengirim <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={pengirim}
                onChange={e => setPengirim(e.target.value)}
                placeholder="Contoh: Sekretariat Daerah Provinsi"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:border-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Instansi / Lembaga Pengirim
              </label>
              <input
                type="text"
                value={instansiPengirim}
                onChange={e => setInstansiPengirim(e.target.value)}
                placeholder="Contoh: Pemerintah Provinsi Jawa Barat"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:border-blue-500 outline-none"
              />
            </div>
          </div>

          {/* Row 4: Sifat Surat, Kategori, & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Sifat Surat <span className="text-rose-500">*</span>
              </label>
              <select
                value={sifat}
                onChange={e => setSifat(e.target.value as SifatSurat)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:border-blue-500 outline-none"
              >
                <option value="Biasa">Biasa</option>
                <option value="Penting">Penting</option>
                <option value="Segera">Segera</option>
                <option value="Sangat Segera">Sangat Segera</option>
                <option value="Rahasia">Rahasia</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Kategori / Klasifikasi
              </label>
              <select
                value={kategori}
                onChange={e => setKategori(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:border-blue-500 outline-none"
              >
                <option value="Undangan">Undangan</option>
                <option value="Permohonan">Permohonan</option>
                <option value="Nota Dinas">Nota Dinas</option>
                <option value="Laporan">Laporan</option>
                <option value="Surat Edaran">Surat Edaran</option>
                <option value="Pemberitahuan">Pemberitahuan</option>
                <option value="Kerjasama">Kerjasama / MoU</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Status Pemrosesan
              </label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as StatusSurat)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:border-blue-500 outline-none"
              >
                <option value="Baru Masuk">Baru Masuk</option>
                <option value="Didisposisikan">Didisposisikan</option>
                <option value="Sedang Diproses">Sedang Diproses</option>
                <option value="Selesai Diproses">Selesai Diproses</option>
              </select>
            </div>
          </div>

          {/* Row 5: Perihal */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Perihal / Hal Surat <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={perihal}
              onChange={e => setPerihal(e.target.value)}
              placeholder="Contoh: Undangan Rapat Koordinasi Penerapan SPBE 2026"
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:border-blue-500 outline-none font-medium"
            />
          </div>

          {/* Row 6: Ringkasan Isi */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Ringkasan / Poin Utama Isi Surat
            </label>
            <textarea
              rows={2}
              value={ringkasan}
              onChange={e => setRingkasan(e.target.value)}
              placeholder="Tuliskan intisari maksud atau agenda yang disampaikan dalam surat..."
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:border-blue-500 outline-none"
            />
          </div>

          {/* Row 7: Lampiran Dokumen Scan */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <div className="font-semibold text-slate-800 flex items-center gap-2">
              <Upload className="w-4 h-4 text-blue-600" />
              File Lampiran Digital (PDF / Word)
            </div>
            <div className="flex items-center gap-3">
              <label className="cursor-pointer px-3 py-1.5 bg-white border border-slate-200 hover:border-blue-400 rounded-lg font-medium text-slate-700 text-xs shadow-2xs">
                Pilih Berkas Lampiran
                <input
                  type="file"
                  onChange={handleFileUpload}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.xls,.xlsx"
                />
              </label>
              <span className="text-slate-500 text-xs truncate">
                {fileLampiranNama || 'Belum ada berkas dipilih'}
              </span>
            </div>
          </div>

          {/* Row 8: Bukti Serah Terima Fisik */}
          <div className="p-3.5 bg-emerald-50/60 rounded-xl border border-emerald-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="font-semibold text-emerald-950 flex items-center gap-2">
                <Camera className="w-4 h-4 text-emerald-700" />
                Bukti Foto Serah Terima Fisik (Validasi Dokumen)
              </div>
              <span className="text-[10px] text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded font-medium">
                Bisa sinkron ke Google Drive
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Petugas Penerima Fisik
                </label>
                <input
                  type="text"
                  value={namaPenerimaFisik}
                  onChange={e => setNamaPenerimaFisik(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Kurir / Pengantar / Ekspedisi
                </label>
                <input
                  type="text"
                  value={ekspedisiKurir}
                  onChange={e => setEkspedisiKurir(e.target.value)}
                  placeholder="Contoh: JNE / Pos / Kurir Dinas"
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Nomor Resi / Tanda Terima
                </label>
                <input
                  type="text"
                  value={nomorResi}
                  onChange={e => setNomorResi(e.target.value)}
                  placeholder="Contoh: RESI-9842"
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                />
              </div>
            </div>

            {/* Hidden file inputs for Mobile & Desktop */}
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleFotoBuktiSelect}
            />
            <input
              ref={galleryInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFotoBuktiSelect}
            />

            {/* Loading Indicator */}
            {isCompressingFoto && (
              <div className="p-3 bg-white rounded-lg border border-emerald-300 flex items-center gap-2.5 text-xs text-emerald-900 font-medium shadow-2xs">
                <Loader2 className="w-4 h-4 text-emerald-600 animate-spin shrink-0" />
                <span>Sedang memproses & mengoptimalkan foto kamera handphone...</span>
              </div>
            )}

            {/* Error Message */}
            {fotoBuktiError && (
              <div className="p-2.5 bg-rose-50 rounded-lg border border-rose-200 flex items-start gap-2 text-xs text-rose-800">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold">Foto belum berhasil dimuat:</div>
                  <div className="text-[11px] text-rose-700 mt-0.5">{fotoBuktiError}</div>
                </div>
              </div>
            )}

            {/* Upload Buttons & Preview */}
            {!fotoBuktiUrl ? (
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  disabled={isCompressingFoto}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg font-bold text-xs shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Smartphone className="w-4 h-4" />
                  Foto Kamera HP (Langsung)
                </button>

                <button
                  type="button"
                  onClick={() => galleryInputRef.current?.click()}
                  disabled={isCompressingFoto}
                  className="px-3.5 py-2 bg-white hover:bg-slate-50 disabled:opacity-50 border border-slate-300 text-slate-700 rounded-lg font-semibold text-xs shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ImageIcon className="w-4 h-4 text-slate-500" />
                  Pilih dari Galeri Foto
                </button>
              </div>
            ) : (
              <div className="p-3 bg-white rounded-xl border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                <div className="flex items-center gap-3">
                  <div
                    onClick={() => setIsPreviewModalOpen(true)}
                    className="relative w-14 h-14 rounded-lg overflow-hidden border border-emerald-300 cursor-pointer group shrink-0"
                    title="Klik untuk memperbesar foto"
                  >
                    <img
                      src={fotoBuktiUrl}
                      alt="Bukti fisik surat"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <Eye className="w-4 h-4 text-white drop-shadow" />
                    </div>
                  </div>

                  <div>
                    <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      Foto Bukti Fisik Tersemat
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Ukuran: <strong className="text-emerald-700">{fotoBuktiSizeKb} KB</strong> (Kompresi Optimal Handphone)
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsPreviewModalOpen(true)}
                    className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Lihat
                  </button>
                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer border border-emerald-200"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Foto Ulang
                  </button>
                  <button
                    type="button"
                    onClick={handleRemoveFotoBukti}
                    className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer border border-rose-200"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Hapus
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className={`px-5 py-2 text-white rounded-xl text-xs font-semibold shadow-md transition-all flex items-center gap-1.5 ${
                isEditMode
                  ? 'bg-amber-600 hover:bg-amber-700'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isEditMode ? (
                <>
                  <Check className="w-4 h-4" /> Simpan Perubahan Surat
                </>
              ) : (
                'Simpan ke Buku Agenda'
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Lightbox Preview Modal */}
      {isPreviewModalOpen && fotoBuktiUrl && (
        <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="px-4 py-3 bg-slate-900 text-white flex items-center justify-between">
              <span className="text-xs font-bold flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-emerald-400" />
                Pratinjau Foto Bukti Fisik Surat
              </span>
              <button
                type="button"
                onClick={() => setIsPreviewModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-3 bg-slate-950 flex items-center justify-center max-h-[70vh]">
              <img
                src={fotoBuktiUrl}
                alt="Pratinjau Bukti Fisik"
                className="max-h-[65vh] w-auto max-w-full object-contain rounded"
              />
            </div>
            <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
              <span className="text-slate-600">
                Penerima: <strong>{namaPenerimaFisik || currentUser.nama}</strong>
              </span>
              <button
                type="button"
                onClick={() => setIsPreviewModalOpen(false)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-lg text-xs cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
