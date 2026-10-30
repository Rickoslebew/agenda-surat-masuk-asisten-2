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
  Sparkles,
} from 'lucide-react';
import { SuratMasuk, BuktiSerahTerima, UserSession } from '../types';
import {
  uploadFileToGoogleDrive,
  getAccessToken,
  googleSignIn,
} from '../services/authGoogleDrive';

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

  // Webcam camera capture support
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  const startCamera = async () => {
    try {
      setIsCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      alert('Tidak dapat mengakses kamera perangkat. Silakan pilih opsi unggah file foto.');
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setFotoUrl(dataUrl);
    }
    stopCamera();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleArchiveToDrive = async () => {
    if (!fotoUrl) {
      alert('Silakan ambil atau unggah foto bukti serah terima fisik terlebih dahulu!');
      return;
    }

    try {
      setIsUploadingToDrive(true);
      setDriveMessage('Menghubungkan ke Google Drive...');

      let token = await getAccessToken();
      if (!token) {
        // Try interactive sign in
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
      alert('Gagal arsip ke Google Drive: ' + (err.message || 'Periksa koneksi Google Drive'));
    } finally {
      setIsUploadingToDrive(false);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fotoUrl) {
      alert('Foto bukti serah terima fisik wajib diunggah untuk validasi!');
      return;
    }

    const bukti: BuktiSerahTerima = {
      id: initialBukti?.id || 'bkt-' + Date.now(),
      fotoUrl,
      namaPenerimaFisik,
      tanggalSerahTerima,
      ekspedisiKurir,
      nomorResi: nomorResi || undefined,
      catatan,
      statusVerifikasi: 'Terverifikasi',
      diarsipkanKeDrive,
      driveFileId,
      driveWebViewLink,
      waktuArsipDrive: diarsipkanKeDrive ? new Date().toISOString() : undefined,
    };

    stopCamera();
    onSaveBukti(surat.id, bukti);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl my-6 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center font-bold text-white text-sm">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold">
                Bukti Validasi Serah Terima Dokumen Fisik
              </h3>
              <p className="text-xs text-slate-300">
                Unggah bukti foto penyerahan fisik & sinkronisasi otomatis ke Google Drive
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSave} className="p-6 space-y-4 max-h-[82vh] overflow-y-auto text-xs">
          {/* Surat Reference */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div className="font-mono font-bold text-blue-900 text-xs">
              {surat.nomorAgenda} - {surat.nomorSurat}
            </div>
            <div className="text-xs font-semibold text-slate-800 mt-0.5">
              {surat.perihal}
            </div>
            <div className="text-[11px] text-slate-500">
              Pengirim: {surat.pengirim} ({surat.instansiPengirim})
            </div>
          </div>

          {/* Photo Capture / Upload Area */}
          <div>
            <label className="block font-bold text-slate-800 text-xs mb-2">
              Foto Fisik Tanda Terima / Resi / Dokumen Basah: <span className="text-rose-500">*</span>
            </label>

            {/* Webcam Live Capture View */}
            {isCameraActive ? (
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
                    onClick={capturePhoto}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full font-bold shadow-lg flex items-center gap-1.5"
                  >
                    <Camera className="w-4 h-4" /> Ambil Foto Sekarang
                  </button>
                  <button
                    type="button"
                    onClick={stopCamera}
                    className="px-3 py-2 bg-slate-800/80 hover:bg-slate-900 text-white rounded-full font-semibold"
                  >
                    Batal
                  </button>
                </div>
              </div>
            ) : fotoUrl ? (
              <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-50 aspect-video max-h-56 flex items-center justify-center group">
                <img
                  src={fotoUrl}
                  alt="Bukti fisik"
                  className="w-full h-full object-contain"
                />
                {/* Stamp overlay */}
                <div className="absolute top-3 right-3 bg-emerald-600/90 text-white px-2.5 py-1 rounded-lg text-[10px] font-bold shadow-md flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> VALIDASI FISIK
                </div>

                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={startCamera}
                    className="px-3 py-1.5 bg-white text-slate-900 rounded-lg font-semibold text-xs shadow-md"
                  >
                    Ambil Ulang (Kamera)
                  </button>
                  <label className="cursor-pointer px-3 py-1.5 bg-blue-600 text-white rounded-lg font-semibold text-xs shadow-md">
                    Ganti Foto
                    <input
                      type="file"
                      onChange={handleFileUpload}
                      className="hidden"
                      accept="image/*"
                    />
                  </label>
                </div>
              </div>
            ) : (
              <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-blue-400 transition-colors bg-slate-50/50">
                <Camera className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                <div className="font-semibold text-slate-700 text-xs">
                  Ambil Foto Langsung atau Unggah Berkas
                </div>
                <p className="text-[11px] text-slate-400 max-w-sm mx-auto mt-1">
                  Foto dokumen fisik, resi ekspedisi, tanda tangan basah, atau amplop bermaterai sebagai bukti serah terima resmi
                </p>
                <div className="flex items-center justify-center gap-2 mt-3">
                  <button
                    type="button"
                    onClick={startCamera}
                    className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold text-xs shadow-xs flex items-center gap-1.5"
                  >
                    <Camera className="w-3.5 h-3.5" /> Buka Kamera
                  </button>
                  <label className="cursor-pointer px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-xs shadow-xs flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5" /> Pilih File Gambar
                    <input
                      type="file"
                      onChange={handleFileUpload}
                      className="hidden"
                      accept="image/*"
                    />
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Google Drive Automatic Archiving Panel */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-slate-900 text-xs">
                <HardDrive className="w-4 h-4 text-blue-600" />
                Arsip Otomatis ke Google Drive
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
              Sinkronkan foto bukti serah terima secara aman ke Google Drive cloud storage terenkripsi, agar riwayat arsip terpusat dan tidak hilang.
            </p>

            <div className="pt-1 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleArchiveToDrive}
                disabled={isUploadingToDrive || !fotoUrl}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all ${
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
                onChange={e => setNamaPenerimaFisik(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
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
                onChange={e => setTanggalSerahTerima(e.target.value)}
                placeholder="YYYY-MM-DD HH:mm"
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono"
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
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
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
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
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
              className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                stopCamera();
                onClose();
              }}
              className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4" />
              Simpan & Validasi Bukti Fisik
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
