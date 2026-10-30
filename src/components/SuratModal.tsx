import React, { useState, useEffect } from 'react';
import {
  X,
  FileText,
  Camera,
  Upload,
  AlertCircle,
  Check,
  Edit3,
  Smartphone,
  FolderOpen,
  Trash2,
  RefreshCw,
} from 'lucide-react';
import { SuratMasuk, SifatSurat, StatusSurat, UserSession } from '../types';

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
  const [namaPenerimaFisik, setNamaPenerimaFisik] = useState(currentUser.nama);
  const [ekspedisiKurir, setEkspedisiKurir] = useState('');
  const [nomorResi, setNomorResi] = useState('');

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
      if (suratToEdit.buktiFisik) {
        setFotoBuktiUrl(suratToEdit.buktiFisik.fotoUrl || '');
        setNamaPenerimaFisik(suratToEdit.buktiFisik.namaPenerimaFisik || currentUser.nama);
        setEkspedisiKurir(suratToEdit.buktiFisik.ekspedisiKurir || '');
        setNomorResi(suratToEdit.buktiFisik.nomorResi || '');
      } else {
        setFotoBuktiUrl('');
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
      setNamaPenerimaFisik(currentUser.nama);
      setEkspedisiKurir('');
      setNomorResi('');
    }
  }, [suratToEdit, isOpen]);

  const [isCompressingFoto, setIsCompressingFoto] = useState(false);
  const [fotoErrorMessage, setFotoErrorMessage] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileLampiranNama(file.name);
    }
  };

  const processAndCompressFoto = (file: File) => {
    const isImageMime = file.type.startsWith('image/');
    const isImageExt = /\.(jpe?g|png|webp|heic|heif|gif|bmp)$/i.test(file.name);
    if (!isImageMime && !isImageExt && file.type !== '') {
      setFotoErrorMessage('Format berkas harus berupa gambar (JPG, PNG, atau WEBP).');
      return;
    }

    setIsCompressingFoto(true);
    setFotoErrorMessage(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 1024;
          const MAX_HEIGHT = 1024;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height = Math.round((height * MAX_WIDTH) / width);
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width = Math.round((width * MAX_HEIGHT) / height);
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const compressed = canvas.toDataURL('image/jpeg', 0.82);
            setFotoBuktiUrl(compressed);
          } else {
            setFotoBuktiUrl(event.target?.result as string);
          }
        } catch {
          setFotoBuktiUrl(event.target?.result as string);
        } finally {
          setIsCompressingFoto(false);
        }
      };
      img.onerror = () => {
        setFotoBuktiUrl(event.target?.result as string);
        setIsCompressingFoto(false);
      };
      img.src = event.target?.result as string;
    };
    reader.onerror = () => {
      setFotoErrorMessage('Gagal membaca berkas gambar.');
      setIsCompressingFoto(false);
    };
    reader.readAsDataURL(file);
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

            {fotoErrorMessage && (
              <div className="text-[11px] text-rose-600 font-semibold p-2 bg-rose-50 rounded-lg border border-rose-200">
                {fotoErrorMessage}
              </div>
            )}

            {fotoBuktiUrl ? (
              <div className="flex items-center gap-3 bg-white p-2.5 rounded-xl border border-emerald-300 shadow-xs">
                <img
                  src={fotoBuktiUrl}
                  alt="Preview bukti"
                  className="w-14 h-14 object-cover rounded-lg border border-emerald-200 shadow-xs shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-emerald-800 text-xs font-bold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> Foto Bukti Fisik Siap Disimpan
                  </div>
                  <div className="text-[11px] text-slate-500 truncate mt-0.5">
                    Penerima: {namaPenerimaFisik || currentUser.nama}
                  </div>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <label className="relative overflow-hidden cursor-pointer px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold rounded-md transition-colors flex items-center gap-1">
                      <Camera className="w-3 h-3 text-emerald-600" />
                      Ganti Foto
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) processAndCompressFoto(f);
                          e.target.value = '';
                        }}
                        className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => setFotoBuktiUrl('')}
                      className="px-2.5 py-1 text-rose-600 hover:bg-rose-50 text-[11px] font-semibold rounded-md transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" /> Hapus
                    </button>
                  </div>
                </div>
              </div>
            ) : isCompressingFoto ? (
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-center flex items-center justify-center gap-2 text-xs text-emerald-800 font-semibold">
                <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
                Memproses dan mengompresi foto berkas...
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
                {/* Button 1: Kamera HP Direct Native Overlay */}
                <label className="relative overflow-hidden cursor-pointer px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl font-bold text-xs shadow-xs flex items-center justify-center gap-2 transition-all">
                  <Smartphone className="w-4 h-4 shrink-0" />
                  <span>Foto Kamera HP Langsung</span>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) processAndCompressFoto(f);
                      e.target.value = '';
                    }}
                    className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
                  />
                </label>

                {/* Button 2: Galeri / File HP Direct Native Overlay */}
                <label className="relative overflow-hidden cursor-pointer px-3.5 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl font-bold text-xs shadow-xs flex items-center justify-center gap-2 transition-all">
                  <FolderOpen className="w-4 h-4 shrink-0" />
                  <span>Pilih dari Galeri / Berkas</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) processAndCompressFoto(f);
                      e.target.value = '';
                    }}
                    className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
                  />
                </label>
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
    </div>
  );
};
