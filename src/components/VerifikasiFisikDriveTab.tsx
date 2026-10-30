import React, { useState, useEffect } from 'react';
import {
  Camera,
  HardDrive,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Search,
  Calendar,
  Building,
  UploadCloud,
  FileCheck2,
} from 'lucide-react';
import { SuratMasuk, UserSession } from '../types';
import {
  uploadFileToGoogleDrive,
  getAccessToken,
  googleSignIn,
} from '../services/authGoogleDrive';
import { updateSuratMasuk } from '../services/storage';

interface VerifikasiFisikDriveTabProps {
  suratList: SuratMasuk[];
  currentUser: UserSession;
  onOpenSerahTerimaModal: (surat: SuratMasuk) => void;
  onOpenDetailModal: (surat: SuratMasuk) => void;
}

export const VerifikasiFisikDriveTab: React.FC<VerifikasiFisikDriveTabProps> = ({
  suratList,
  currentUser,
  onOpenSerahTerimaModal,
  onOpenDetailModal,
}) => {
  const [search, setSearch] = useState('');
  const [isSyncingAll, setIsSyncingAll] = useState(false);
  const [syncStatusMsg, setSyncStatusMsg] = useState<string | null>(null);

  const suratWithBukti = suratList.filter(s => !!s.buktiFisik);
  const totalWithBukti = suratWithBukti.length;
  const totalSyncedDrive = suratWithBukti.filter(s => s.buktiFisik?.diarsipkanKeDrive).length;
  const totalUnsynced = totalWithBukti - totalSyncedDrive;

  const filteredSurat = suratList.filter(s => {
    const q = search.toLowerCase();
    return (
      !q ||
      s.nomorAgenda.toLowerCase().includes(q) ||
      s.nomorSurat.toLowerCase().includes(q) ||
      s.perihal.toLowerCase().includes(q) ||
      s.pengirim.toLowerCase().includes(q)
    );
  });

  const handleSyncAllToDrive = async () => {
    const unsyncedItems = suratWithBukti.filter(s => !s.buktiFisik?.diarsipkanKeDrive);
    if (unsyncedItems.length === 0) {
      alert('Semua foto serah terima dokumen fisik sudah tersinkronisasi ke Google Drive!');
      return;
    }

    try {
      setIsSyncingAll(true);
      setSyncStatusMsg('Memeriksa otentikasi Google Drive...');

      let token = await getAccessToken();
      if (!token) {
        const authRes = await googleSignIn();
        if (!authRes) throw new Error('Otentikasi Google Drive dibatalkan.');
        token = authRes.accessToken;
      }

      let successCount = 0;
      for (const item of unsyncedItems) {
        if (!item.buktiFisik?.fotoUrl) continue;

        setSyncStatusMsg(`Mengunggah bukti untuk ${item.nomorAgenda}...`);
        const cleanAgendaNo = item.nomorAgenda.replace(/[\/\\]/g, '_');
        const fileName = `BuktiSerahTerima_${cleanAgendaNo}_${Date.now()}.jpg`;

        const result = await uploadFileToGoogleDrive(
          fileName,
          item.buktiFisik.fotoUrl,
          'image/jpeg',
          `Bukti Serah Terima Fisik Surat: ${item.nomorAgenda} - ${item.perihal}`
        );

        updateSuratMasuk(item.id, {
          buktiFisik: {
            ...item.buktiFisik,
            diarsipkanKeDrive: true,
            driveFileId: result.id,
            driveWebViewLink: result.webViewLink,
            waktuArsipDrive: new Date().toISOString(),
          },
        });
        successCount++;
      }

      setSyncStatusMsg(`✓ Sukses menyinkronkan ${successCount} berkas foto ke Google Drive!`);
    } catch (err: any) {
      console.error(err);
      setSyncStatusMsg('Sinkronisasi terhenti: ' + (err.message || 'Error'));
      alert('Gagal sinkronisasi: ' + err.message);
    } finally {
      setIsSyncingAll(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Banner Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Camera className="w-5 h-5 text-emerald-600" />
                Bukti Serah Terima Fisik & Arsip Cloud Google Drive
              </h2>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700">
                Validasi Fisik Resmi
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Verifikasi keabsahan dokumen naskah dinas dengan foto serah terima fisik dan sinkronisasi otomatis ke Google Drive
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleSyncAllToDrive}
              disabled={isSyncingAll}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all ${
                isSyncingAll
                  ? 'bg-slate-200 text-slate-500'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
            >
              {isSyncingAll ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Sinkronisasi Berjalan...
                </>
              ) : (
                <>
                  <UploadCloud className="w-4 h-4" />
                  Sinkronkan Semua ke Google Drive
                </>
              )}
            </button>
          </div>
        </div>

        {syncStatusMsg && (
          <div className="mt-3 p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-medium text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{syncStatusMsg}</span>
          </div>
        )}

        {/* Mini stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-100">
          <div className="p-3 bg-slate-50 rounded-lg">
            <div className="text-[11px] text-slate-500">Total Surat Tercatat</div>
            <div className="text-xl font-bold text-slate-900 mt-0.5">{suratList.length}</div>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg">
            <div className="text-[11px] text-slate-500">Memiliki Bukti Foto Fisik</div>
            <div className="text-xl font-bold text-emerald-700 mt-0.5">{totalWithBukti}</div>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg">
            <div className="text-[11px] text-slate-500">Tersinkron Google Drive</div>
            <div className="text-xl font-bold text-blue-700 mt-0.5">{totalSyncedDrive}</div>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg">
            <div className="text-[11px] text-slate-500">Perlu Sinkronisasi</div>
            <div className="text-xl font-bold text-amber-600 mt-0.5">{totalUnsynced}</div>
          </div>
        </div>
      </div>

      {/* Search toolbar */}
      <div className="flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Cari nomor agenda, pengirim, atau perihal..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 outline-none"
          />
        </div>
      </div>

      {/* Grid of Letters with Physical Proof status */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSurat.map(surat => {
          const bukti = surat.buktiFisik;
          return (
            <div
              key={surat.id}
              className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs hover:border-emerald-300 hover:shadow-md transition-all flex flex-col justify-between"
            >
              {/* Photo Header */}
              {bukti ? (
                <div className="relative aspect-video bg-slate-900 flex items-center justify-center overflow-hidden">
                  <img
                    src={bukti.fotoUrl}
                    alt="Bukti fisik"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2 bg-emerald-600/90 text-white px-2 py-0.5 rounded text-[10px] font-bold shadow flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> {bukti.statusVerifikasi}
                  </div>
                  {bukti.diarsipkanKeDrive && (
                    <div className="absolute top-2 right-2 bg-blue-600/90 text-white px-2 py-0.5 rounded text-[10px] font-bold shadow flex items-center gap-1">
                      <HardDrive className="w-3 h-3" /> Drive Sync
                    </div>
                  )}
                </div>
              ) : (
                <div className="aspect-video bg-slate-50 border-b border-slate-100 flex flex-col items-center justify-center text-slate-400 p-4 text-center">
                  <Camera className="w-8 h-8 text-slate-300 mb-1" />
                  <span className="text-xs font-semibold text-slate-600">
                    Belum Ada Foto Bukti Fisik
                  </span>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Unggah tanda terima fisik atau foto dokumen bermaterai
                  </p>
                </div>
              )}

              {/* Body Info */}
              <div className="p-4 flex-1 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono font-bold text-blue-900">
                    {surat.nomorAgenda}
                  </span>
                  <span className="text-[10px] text-slate-400">{surat.tanggalTerima}</span>
                </div>

                <h4 className="text-xs font-bold text-slate-900 line-clamp-2">
                  {surat.perihal}
                </h4>

                <div className="text-[11px] text-slate-500 truncate">
                  Dari: <span className="font-medium text-slate-700">{surat.pengirim}</span>
                </div>

                {bukti ? (
                  <div className="pt-2 border-t border-slate-100 text-[11px] space-y-1 text-slate-600">
                    <div>
                      Penerima Fisik: <span className="font-semibold text-slate-800">{bukti.namaPenerimaFisik}</span>
                    </div>
                    {bukti.ekspedisiKurir && (
                      <div>
                        Kurir/Ekspedisi: {bukti.ekspedisiKurir}
                        {bukti.nomorResi && ` (${bukti.nomorResi})`}
                      </div>
                    )}
                    {bukti.driveWebViewLink && (
                      <a
                        href={bukti.driveWebViewLink}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-800 underline pt-0.5"
                      >
                        Buka di Google Drive <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                ) : (
                  <div className="pt-2 border-t border-slate-100 text-[11px] text-amber-600 font-medium">
                    ⚠️ Membutuhkan unggah bukti serah terima fisik
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => onOpenDetailModal(surat)}
                  className="text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  Detail Surat
                </button>
                <button
                  onClick={() => onOpenSerahTerimaModal(surat)}
                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-2xs flex items-center gap-1"
                >
                  <Camera className="w-3.5 h-3.5" />
                  {bukti ? 'Ubah Bukti / Drive' : 'Unggah Foto'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
