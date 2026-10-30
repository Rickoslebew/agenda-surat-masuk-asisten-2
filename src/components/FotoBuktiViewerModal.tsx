import React from 'react';
import { X, Download, User, Calendar, Building, FileText, CheckCircle2 } from 'lucide-react';

interface FotoBuktiViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  fotoUrl: string;
  namaPenerima?: string;
  instansi?: string;
  judulSurat?: string;
  nomorAgenda?: string;
  tanggal?: string;
  keterangan?: string;
}

export const FotoBuktiViewerModal: React.FC<FotoBuktiViewerModalProps> = ({
  isOpen,
  onClose,
  fotoUrl,
  namaPenerima,
  instansi,
  judulSurat,
  nomorAgenda,
  tanggal,
  keterangan,
}) => {
  if (!isOpen || !fotoUrl) return null;

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = fotoUrl;
    a.download = `Bukti_Penerima_${(nomorAgenda || 'berkas').replace(/\//g, '_')}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold">Bukti Foto Penerima Berkas</h3>
              <p className="text-[11px] text-slate-300">
                Penelusuran fisik penerima lembar disposisi
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="Unduh Berkas Foto"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-4">
          {/* Image Display */}
          <div className="bg-slate-950 rounded-xl overflow-hidden flex items-center justify-center max-h-[60vh] border border-slate-800">
            <img
              src={fotoUrl}
              alt={namaPenerima ? `Foto Penerima ${namaPenerima}` : 'Bukti Foto'}
              className="w-full h-full object-contain max-h-[58vh]"
            />
          </div>

          {/* Details Card */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Petugas Penerima Berkas:
                </span>
                <span className="font-bold text-slate-900 text-sm flex items-center gap-1.5 mt-0.5">
                  <User className="w-3.5 h-3.5 text-blue-600" />
                  {namaPenerima || 'Penerima Berkas'}
                </span>
                {instansi && (
                  <span className="text-[11px] text-slate-500 block mt-0.5">
                    {instansi}
                  </span>
                )}
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Waktu Penerimaan / Unggah:
                </span>
                <span className="font-medium text-slate-800 flex items-center gap-1.5 mt-0.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  {tanggal || '-'}
                </span>
              </div>
            </div>

            {(judulSurat || nomorAgenda) && (
              <div className="pt-2 border-t border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Dokumen Surat Terkait:
                </span>
                <div className="font-bold text-blue-900 font-mono text-[11px]">
                  {nomorAgenda}
                </div>
                <div className="text-slate-700 font-medium text-xs mt-0.5 line-clamp-2">
                  {judulSurat}
                </div>
              </div>
            )}

            {keterangan && (
              <div className="pt-2 border-t border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Catatan Tambahan:
                </span>
                <p className="text-slate-600 italic mt-0.5">{keterangan}</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-emerald-700 font-semibold text-xs">
            <CheckCircle2 className="w-4 h-4" />
            <span>Bukti fisik terautentikasi dalam riwayat sistem</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
