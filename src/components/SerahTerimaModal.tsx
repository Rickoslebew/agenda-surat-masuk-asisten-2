import React, { useState, useRef } from 'react';
import {
  X,
  Camera,
  Upload,
  HardDrive,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Trash2,
  Smartphone,
  FolderOpen,
} from 'lucide-react';
import { SuratMasuk, BuktiSerahTerima, UserSession } from '../types';
import {
  uploadFileToGoogleDrive,
  getAccessToken,
  googleSignIn,
} from '../services/authGoogleDrive';
import { compressMobileImage } from '../utils/imageCompressor';

interface SerahTerimaModalProps {
  isOpen: boolean;
  onClose: () => void;
  surat: SuratMasuk | null;
  currentUser: UserSession;
  onSaveBukti: (suratId: string, bukti: BuktiSerahTerima) => void;
}

export const SerahTerimaModal: React.FC<SerahTerimaModalProps> = ({
  isOpen,
  onClose,
  surat,
  currentUser,
  onSaveBukti,
}) => {
  if (!isOpen || !surat) return null;

  const initialBukti = surat.buktiFisik;
  const now = new Date();
  const defaultDate = `${now.toISOString().slice(0, 10)} ${now.toTimeString().slice(0, 5)}`;

  const [fotoUrl, setFotoUrl] = useState<string>(initialBukti?.fotoUrl || '');
  const [namaPenerimaFisik, setNamaPenerimaFisik] = useState<string>(
    initialBukti?.namaPenerimaFisik || currentUser.nama
  );
  const [tanggalSerahTerima, setTanggalSerahTerima] = useState<string>(
    initialBukti?.tanggalSerahTerima || defaultDate
  );
  const [ekspedisiKurir, setEkspedisiKurir] = useState<string>(
    initialBukti?.ekspedisiKurir || 'Kurir Resmi / Antar Langsung'
  );
  const [nomorResi, setNomorResi] = useState<string>(initialBukti?.nomorResi || '');
  const [catatan, setCatatan] = useState<string>(
    initialBukti?.catatan || 'Dokumen fisik amplop diterima dalam kondisi utuh dan baik.'
  );

  // Status & error states
  const [isCompressing, setIsCompressing] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Hidden file inputs for mobile & desktop
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  // Google Drive state
  const [diarsipkanKeDrive, setDiarsipkanKeDrive] = useState<boolean>(
    initialBukti?.diarsipkanKeDrive || false
  );
  const [driveFileId, setDriveFileId] = useState<string | undefined>(initialBukti?.driveFileId);
  const [driveWebViewLink, setDriveWebViewLink] = useState<string | undefined>(
    initialBukti?.driveWebViewLink
  );
  const [isUploadingToDrive, setIsUploadingToDrive] = useState<boolean>(false);
  const [driveMessage, setDriveMessage] = useState<string | null>(null);

  // Optional desktop webcam live capture support
  const [isWebcamActive, setIsWebcamActive] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  const startWebcam = async () => {
    try {
      setFormError(null);
      setIsWebcamActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err: any) {
      console.warn('Webcam stream notice:', err);
      setIsWebcamActive(false);
      setFormError('Tidak dapat membuka streaming kamera langsung. Silakan gunakan tombol "Foto Kamera HP" di bawah.');
    }
  };

  const stopWebcam = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    setIsWebcamActive(false);
  };

  const captureWebcamPhoto = () => {
    if (!videoRef.current) return;
    try {
      const canvas = document.createElement('canvas');
      const MAX_DIM = 1024;
      let w = videoRef.current.videoWidth || 640;
      let h = videoRef.current.videoHeight || 480;

      if (w > h && w > MAX_DIM) {
        h = Math.round((h * MAX_DIM) / w);
        w = MAX_DIM;
      } else if (h > MAX_DIM) {
        w = Math.round((w * MAX_DIM) / h);
        h = MAX_DIM;
      }

      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, w, h);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
        setFotoUrl(dataUrl);
        setFormError(null);
      }
    } catch (err) {
      console.warn('Error capturing webcam photo:', err);
    }
    stopWebcam();
  };

  // Safe client-side image compression: converts heavy smartphone photos (4MB-15MB) into high-quality ~90KB-160KB JPEG
  const processAndCompressFile = async (file: File) => {
    try {
      setIsCompressing(true);
      setFormError(null);
      const res = await compressMobileImage(file, 1200, 1200, 0.82);
      setFotoUrl(res.dataUrl);
    } catch (err: any) {
      console.warn('Canvas compression error:', err);
      setFormError(err.message || 'Gagal memproses gambar foto berkas.');
    } finally {
      setIsCompressing(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processAndCompressFile(file);
    }
    // Reset file input so user can pick the same file again if desired
    e.target.value = '';
  };

  const handleArchiveToDrive = async () => {
    if (!fotoUrl) {
      setFormError('Silakan ambil atau unggah foto bukti serah terima fisik terlebih dahulu!');
      return;
    }

    try {
      setIsUploadingToDrive(true);
      setDriveMessage('Menghubungkan ke Google Drive...');
      setFormError(null);

      let token = await getAccessToken();
      if (!token) {
        const authResult = await googleSignIn();
        if (!authResult) {
          throw new Error('Otentikasi Google Drive dibatalkan.');
        }
        token = authResult.accessToken;
      }

      setDriveMessage('Mengunggah berkas foto ke Google Drive...');
      const cleanAgendaNo = surat.nomorAgenda.replace(/[\/\\]/g, '_');
      const fileName = `BuktiSerahTerima_${cleanAgendaNo}_${Date.now()}.jpg`;

      const result = await uploadFileToGoogleDrive(
        fileName,
        fotoUrl,
        'image/jpeg',
        `Bukti Serah Terima Fisik Surat Masuk: ${surat.nomorAgenda} - ${surat.perihal}`
      );

      setDiarsipkanKeDrive(true);
      setDriveFileId(result.id);
      setDriveWebViewLink(result.webViewLink);
      setDriveMessage('✓ Berhasil diarsipkan ke Google Drive!');
    } catch (err: any) {
      console.error(err);
      setDriveMessage('Gagal arsip Drive: ' + (err.message || 'Error'));
      setFormError('Gagal arsip ke Google Drive: ' + (err.message || 'Periksa koneksi Google Drive'));
    } finally {
      setIsUploadingToDrive(false);
    }
  };

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    setFormError(null);

    if (!fotoUrl) {
      setFormError('Foto bukti serah terima fisik wajib diambil atau diunggah terlebih dahulu!');
      return;
    }

    if (!namaPenerimaFisik.trim()) {
      setFormError('Nama petugas penerima fisik wajib diisi!');
      return;
    }

    if (!tanggalSerahTerima.trim()) {
      setTanggalSerahTerima(defaultDate);
    }

    try {
      setIsSaving(true);

      const bukti: BuktiSerahTerima = {
        id: initialBukti?.id || 'bkt-' + Date.now(),
        fotoUrl,
        namaPenerimaFisik: namaPenerimaFisik.trim(),
        tanggalSerahTerima: tanggalSerahTerima.trim() || defaultDate,
        ekspedisiKurir: ekspedisiKurir.trim() || 'Kurir Resmi / Antar Langsung',
        nomorResi: nomorResi.trim() || undefined,
        catatan: catatan.trim() || undefined,
        statusVerifikasi: 'Terverifikasi',
        diarsipkanKeDrive,
        driveFileId,
        driveWebViewLink,
        waktuArsipDrive: diarsipkanKeDrive ? new Date().toISOString() : undefined,
      };

      stopWebcam();
      onSaveBukti(surat.id, bukti);
      onClose();
    } catch (err: any) {
      console.error('Error saving physical proof:', err);
      setFormError('Gagal menyimpan bukti fisik: ' + (err.message || 'Periksa ruang penyimpanan browser.'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      {/* Hidden Mobile Native Inputs */}
      <input
        type="file"
        ref={cameraInputRef}
        accept="image/*"
        capture="environment"
        onChange={handleFileInputChange}
        className="hidden"
      />
      <input
        type="file"
        ref={galleryInputRef}
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden"
      />

      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl my-4 overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center font-bold text-white text-sm">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold">
                Bukti Validasi Serah Terima Dokumen Fisik
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-300">
                Unggah bukti foto penyerahan fisik & sinkronisasi otomatis ke Google Drive
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              stopWebcam();
              onClose();
            }}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSave} className="p-4 sm:p-6 space-y-4 overflow-y-auto text-xs flex-1">
          {/* Error Banner */}
          {formError && (
            <div className="p-3 bg-rose-50 border border-rose-300 text-rose-800 rounded-xl flex items-start gap-2.5 text-xs font-semibold animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1">{formError}</div>
              <button
                type="button"
                onClick={() => setFormError(null)}
                className="text-rose-500 hover:text-rose-700 text-xs font-bold"
              >
                ✕
              </button>
            </div>
          )}

          {/* Surat Reference Card */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div className="font-mono font-bold text-blue-900 text-xs">
              {surat.nomorAgenda} - {surat.nomorSurat}
            </div>
            <div className="text-xs font-semibold text-slate-800 mt-0.5">
              {surat.perihal}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Pengirim: {surat.pengirim} {surat.instansiPengirim ? `(${surat.instansiPengirim})` : ''}
            </div>
          </div>

          {/* Photo Capture / Upload Area */}
          <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <label className="block font-bold text-slate-800 text-xs">
                Foto Fisik Tanda Terima / Resi / Dokumen: <span className="text-rose-500">*</span>
              </label>
              {fotoUrl && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Foto Siap
                </span>
              )}
            </div>

            {/* Webcam Live Capture View (Desktop) */}
            {isWebcamActive ? (
              <div className="relative rounded-xl overflow-hidden bg-black aspect-video flex items-center justify-center border border-slate-300">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-3 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={captureWebcamPhoto}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full font-bold shadow-lg flex items-center gap-1.5 cursor-pointer"
                  >
                    <Camera className="w-4 h-4" /> Ambil Foto Sekarang
                  </button>
                  <button
                    type="button"
                    onClick={stopWebcam}
                    className="px-3 py-2 bg-slate-800/80 hover:bg-slate-900 text-white rounded-full font-semibold cursor-pointer"
                  >
                    Batal
                  </button>
                </div>
              </div>
            ) : isCompressing ? (
              /* Compression Progress Indicator */
              <div className="border-2 border-blue-300 rounded-xl p-8 text-center bg-blue-50/60 flex flex-col items-center justify-center gap-2">
                <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <div className="font-bold text-blue-900 text-xs">Mengompresi & Memproses Foto...</div>
                <p className="text-[11px] text-blue-700 max-w-xs">
                  Foto sedang disesuaikan agar hemat penyimpanan dan lancar disimpan di perangkat Anda.
                </p>
              </div>
            ) : fotoUrl ? (
              /* Photo Preview with Actions */
              <div className="space-y-2.5">
                <div className="relative rounded-xl overflow-hidden border border-emerald-300 bg-slate-900 aspect-video max-h-60 flex items-center justify-center shadow-xs">
                  <img
                    src={fotoUrl}
                    alt="Bukti fisik berkas"
                    className="w-full h-full object-contain"
                  />
                  {/* Badge */}
                  <div className="absolute top-2.5 right-2.5 bg-emerald-600/95 text-white px-2.5 py-1 rounded-lg text-[10px] font-bold shadow-md flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> BUKTI FISIK VALID
                  </div>
                </div>

                {/* Quick actions on phone & computer */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    className="flex-1 sm:flex-none px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 rounded-lg font-semibold text-xs shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Smartphone className="w-3.5 h-3.5 text-blue-600" />
                    Ambil Ulang Kamera
                  </button>
                  <button
                    type="button"
                    onClick={() => galleryInputRef.current?.click()}
                    className="flex-1 sm:flex-none px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 rounded-lg font-semibold text-xs shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <FolderOpen className="w-3.5 h-3.5 text-indigo-600" />
                    Ganti dari Galeri
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFotoUrl('');
                      setDiarsipkanKeDrive(false);
                      setDriveFileId(undefined);
                      setDriveWebViewLink(undefined);
                      setDriveMessage(null);
                    }}
                    className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg font-semibold text-xs transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Hapus Foto
                  </button>
                </div>
              </div>
            ) : (
              /* No Photo Yet: Big touch-friendly buttons for Handphone & Desktop */
              <div className="border-2 border-dashed border-slate-300 rounded-xl p-5 text-center bg-white">
                <Camera className="w-9 h-9 text-slate-400 mx-auto mb-2" />
                <div className="font-bold text-slate-800 text-xs">
                  Ambil Foto Langsung atau Pilih dari Perangkat
                </div>
                <p className="text-[11px] text-slate-500 max-w-sm mx-auto mt-1 mb-3.5">
                  Foto fisik tanda terima dokumen, resi ekspedisi, atau stempel basah penerimaan
                </p>

                {/* Primary Action Buttons */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2">
                  {/* Button 1: Kamera HP (Direct Native Camera) */}
                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Smartphone className="w-4 h-4" />
                    Buka Kamera HP (Foto Langsung)
                  </button>

                  {/* Button 2: Galeri / File */}
                  <button
                    type="button"
                    onClick={() => galleryInputRef.current?.click()}
                    className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <FolderOpen className="w-4 h-4" />
                    Pilih dari Galeri / Berkas
                  </button>

                  {/* Button 3: Webcam PC (optional fallback) */}
                  <button
                    type="button"
                    onClick={startWebcam}
                    className="hidden sm:flex px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-xs border border-slate-200 items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Camera className="w-3.5 h-3.5 text-slate-500" />
                    Webcam Laptop
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Google Drive Automatic Archiving Panel */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-slate-900 text-xs">
                <HardDrive className="w-4 h-4 text-blue-600" />
                Arsip Cloud ke Google Drive
              </div>
              {diarsipkanKeDrive ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Tersinkronisasi
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-100 text-amber-800">
                  Belum Diarsipkan
                </span>
              )}
            </div>

            <p className="text-[11px] text-slate-600">
              Sinkronkan foto bukti serah terima secara aman ke Google Drive cloud storage terenkripsi, agar riwayat arsip terpusat dan dapat dibuka di semua perangkat.
            </p>

            <div className="pt-1 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleArchiveToDrive}
                disabled={isUploadingToDrive || !fotoUrl}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                  isUploadingToDrive
                    ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                    : diarsipkanKeDrive
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {isUploadingToDrive ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Menyimpan ke Drive...
                  </>
                ) : diarsipkanKeDrive ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Sinkron Ulang ke Google Drive
                  </>
                ) : (
                  <>
                    <HardDrive className="w-3.5 h-3.5" />
                    Arsipkan Sekarang ke Google Drive
                  </>
                )}
              </button>

              {driveWebViewLink && (
                <a
                  href={driveWebViewLink}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-semibold text-blue-700 hover:text-blue-900 flex items-center gap-1 underline"
                >
                  Buka di Google Drive <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>

            {driveMessage && (
              <div className="text-[10px] text-blue-800 font-medium">{driveMessage}</div>
            )}
          </div>

          {/* Form details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 text-xs mb-1">
                Petugas Penerima Fisik <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={namaPenerimaFisik}
                onChange={e => {
                  setNamaPenerimaFisik(e.target.value);
                  if (formError) setFormError(null);
                }}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 text-xs mb-1">
                Waktu Serah Terima <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={tanggalSerahTerima}
                onChange={e => {
                  setTanggalSerahTerima(e.target.value);
                  if (formError) setFormError(null);
                }}
                placeholder="YYYY-MM-DD HH:mm"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 text-xs mb-1">
                Jasa Kurir / Pengantar Surat
              </label>
              <input
                type="text"
                value={ekspedisiKurir}
                onChange={e => setEkspedisiKurir(e.target.value)}
                placeholder="Contoh: Kurir Khusus Setda / JNE / Kantor Pos"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 text-xs mb-1">
                Nomor Resi / Tanda Terima Ekspedisi
              </label>
              <input
                type="text"
                value={nomorResi}
                onChange={e => setNomorResi(e.target.value)}
                placeholder="Contoh: RESI-POS-98124"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 text-xs mb-1">
              Catatan Kondisi Fisik Berkas / Keterangan Tambahan
            </label>
            <textarea
              rows={2}
              value={catatan}
              onChange={e => setCatatan(e.target.value)}
              placeholder="Contoh: Amplop tertutup rapat dengan stempel basah pengirim, diterima 2 rangkap asli..."
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs outline-none focus:border-blue-500"
            />
          </div>
        </form>

        {/* Footer Actions (Sticky at bottom for mobile) */}
        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={() => {
              stopWebcam();
              onClose();
            }}
            disabled={isSaving}
            className="px-4 py-2.5 border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={() => handleSave()}
            disabled={isSaving || isCompressing}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold shadow-md flex items-center gap-2 transition-all cursor-pointer ${
              isSaving || isCompressing
                ? 'bg-emerald-400 text-white cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white active:scale-95'
            }`}
          >
            {isSaving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Menyimpan Bukti Fisik...
              </>
            ) : isCompressing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Memproses Gambar...
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                Simpan & Validasi Bukti Fisik
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
