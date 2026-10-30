import React from 'react';
import { X, Printer, Download, Check, ShieldCheck } from 'lucide-react';
import { SuratMasuk } from '../types';
import { getPejabatList, getAppSettings } from '../services/storage';

interface LembarDisposisiPrintProps {
  isOpen: boolean;
  onClose: () => void;
  surat: SuratMasuk | null;
}

export const LembarDisposisiPrint: React.FC<LembarDisposisiPrintProps> = ({
  isOpen,
  onClose,
  surat,
}) => {
  if (!isOpen || !surat) return null;

  const appSettings = getAppSettings();
  const pejabatList = getPejabatList().filter(p => p.id !== 'pej-1'); // List of potential recipient units

  const handlePrint = () => {
    window.print();
  };

  const activeDisposisi = surat.disposisiList[0];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl my-6 overflow-hidden print:shadow-none print:border-none print:w-full print:max-w-none print:m-0 animate-in fade-in duration-150">
        {/* Screen Controls Header (Hidden in Print) */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="text-sm font-bold">
                Pratinjau Lembar Disposisi Resmi (Siap Cetak PDF)
              </h3>
              <p className="text-xs text-slate-300">
                Format baku tata naskah dinas persuratan e-Office
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-md flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-4 h-4" /> Cetak / Simpan PDF
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Paper Area (Standard A4 layout) */}
        <div className="p-8 sm:p-12 text-slate-900 font-serif leading-relaxed max-h-[85vh] overflow-y-auto print:max-h-none print:overflow-visible print:p-6">
          {/* Kop Surat Resmi */}
          <div className="border-b-4 border-double border-slate-900 pb-4 text-center space-y-1">
            <div className="text-xs font-sans tracking-widest uppercase font-bold text-slate-600">
              {appSettings.subIndukInstansi || 'PEMERINTAH REPUBLIK INDONESIA'}
            </div>
            <h1 className="text-lg sm:text-xl font-bold uppercase tracking-wider font-sans text-slate-900">
              {appSettings.namaInstansi || 'BADAN PENGELOLA TATA NASKAH & ARSIP ELEKTRONIK'}
            </h1>
            <p className="text-xs font-sans text-slate-600">
              {appSettings.alamatKantor || 'Gedung Transformasi Pelayanan Terpadu Lantai 3'}
              {appSettings.teleponKantor && ` • Telp: ${appSettings.teleponKantor}`}
              {appSettings.emailKantor && ` • Email: ${appSettings.emailKantor}`}
            </p>
          </div>

          {/* Judul Lembar Disposisi */}
          <div className="py-4 text-center">
            <h2 className="text-base sm:text-lg font-bold font-sans uppercase tracking-widest underline decoration-2 underline-offset-4">
              LEMBAR DISPOSISI
            </h2>
            <div className="text-xs font-sans font-semibold text-slate-600 mt-1">
              Nomor Agenda: <span className="font-mono text-slate-900 font-bold">{surat.nomorAgenda}</span>
            </div>
          </div>

          {/* Grid Metadata Surat */}
          <div className="border border-slate-900 text-xs font-sans">
            {/* Baris 1: Surat Masuk Dari & Nomor Surat */}
            <div className="grid grid-cols-2 border-b border-slate-900">
              <div className="p-2.5 border-r border-slate-900">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">
                  Surat Dari / Pengirim:
                </span>
                <span className="font-bold text-slate-900">{surat.pengirim}</span>
                <div className="text-[11px] text-slate-600">{surat.instansiPengirim}</div>
              </div>
              <div className="p-2.5">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">
                  Tanggal Surat & No. Surat:
                </span>
                <div className="font-bold text-slate-900">{surat.nomorSurat}</div>
                <div className="text-[11px] text-slate-600">Tanggal: {surat.tanggalSurat}</div>
              </div>
            </div>

            {/* Baris 2: Tanggal Terima & Sifat Surat */}
            <div className="grid grid-cols-2 border-b border-slate-900">
              <div className="p-2.5 border-r border-slate-900">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">
                  Diterima Tanggal:
                </span>
                <span className="font-bold text-slate-900">{surat.tanggalTerima}</span>
              </div>
              <div className="p-2.5 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">
                    Sifat Surat:
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    {(['Biasa', 'Penting', 'Segera', 'Sangat Segera', 'Rahasia'] as const).map(s => (
                      <span
                        key={s}
                        className={`text-[10px] px-1.5 py-0.5 rounded border ${
                          surat.sifat === s
                            ? 'bg-slate-900 text-white font-bold border-slate-900'
                            : 'text-slate-400 border-slate-200 line-through'
                        }`}
                      >
                        {surat.sifat === s ? `[✓] ${s}` : `[ ] ${s}`}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Baris 3: Perihal */}
            <div className="p-2.5 border-b border-slate-900">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">
                Hal / Perihal:
              </span>
              <div className="font-bold text-slate-900 text-sm mt-0.5">{surat.perihal}</div>
              {surat.ringkasan && (
                <div className="text-[11px] text-slate-700 italic mt-1 font-serif">
                  Ringkasan: {surat.ringkasan}
                </div>
              )}
            </div>

            {/* Baris 4: Dua Kolom - Instansi & Penerima Disposisi serta Petunjuk / Instruksi */}
            <div className="grid grid-cols-1 sm:grid-cols-2 border-b border-slate-900 min-h-[200px]">
              {/* Kolom Kiri: Instansi Tujuan & Nama Penerima Berkas */}
              <div className="p-3 border-r border-slate-900 space-y-3">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-900 border-b pb-1">
                  Arah Penyerahan Dokumen:
                </div>

                <div className="p-2 bg-slate-50 rounded border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">
                    Instansi / Bidang yang Dituju:
                  </span>
                  <div className="font-bold text-slate-900 text-sm mt-0.5">
                    {activeDisposisi?.instansiTujuan || activeDisposisi?.tujuanUnit || 'Instansi Terkait'}
                  </div>
                </div>

                <div className="p-2 bg-slate-50 rounded border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">
                    Nama Penerima Berkas Tersebut:
                  </span>
                  <div className="font-bold text-slate-900 text-sm mt-0.5">
                    {activeDisposisi?.namaPenerimaBerkas || activeDisposisi?.tujuanNama || 'Penerima Berkas'}
                  </div>
                </div>
              </div>

              {/* Kolom Kanan: Petunjuk / Instruksi Tindak Lanjut */}
              <div className="p-3 space-y-2">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-900 border-b pb-1">
                  Petunjuk / Instruksi:
                </div>
                <div className="space-y-1.5">
                  {[
                    'Tindak lanjuti segera',
                    'Pelajari & siapkan bahan telaah',
                    'Hadiri mewakili dinas / pimpinan',
                    'Siapkan draf surat balasan / tanggapan',
                    'Koordinasikan dengan instansi terkait',
                    'Selesaikan sesuai ketentuan SOP',
                    'Arsipkan & pantau perkembangan',
                  ].map((instruksi, idx) => {
                    const isChecked = activeDisposisi?.instruksi?.includes(instruksi);
                    return (
                      <div
                        key={idx}
                        className={`flex items-center gap-2 text-xs p-0.5 ${
                          isChecked ? 'font-bold text-slate-900' : 'text-slate-600'
                        }`}
                      >
                        <span className="font-mono text-sm leading-none">
                          {isChecked ? '[✓]' : '[  ]'}
                        </span>
                        <span>{instruksi}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Baris 5: Catatan Tambahan & Validasi */}
            <div className="grid grid-cols-3">
              <div className="col-span-2 p-3 border-r border-slate-900 min-h-[100px]">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">
                  Catatan Tambahan Disposisi:
                </span>
                <p className="text-xs text-slate-800 italic mt-1 font-serif">
                  {activeDisposisi?.catatanKhusus
                    ? `"${activeDisposisi.catatanKhusus}"`
                    : '(Tidak ada catatan khusus tambahan)'}
                </p>
              </div>

              <div className="p-3 text-center flex flex-col justify-between">
                <div>
                  <div className="text-[10px] text-slate-500">Status Validasi:</div>
                  <div className="text-xs font-bold text-slate-900 uppercase">
                    Tata Naskah Elektronik
                  </div>
                </div>

                <div className="py-2 flex flex-col items-center justify-center">
                  <div className="w-14 h-14 border border-dashed border-slate-400 rounded flex items-center justify-center text-[9px] text-slate-400 font-sans">
                    QR Validasi
                  </div>
                  <span className="text-[9px] text-emerald-700 font-sans font-bold mt-1">
                    ✓ Otentikasi Digital
                  </span>
                </div>

                <div className="text-[11px] font-medium text-slate-600 font-sans">
                  Sistem Disposisi TNDE
                </div>
              </div>
            </div>
          </div>

          {/* Bukti serah terima fisik footer stamp */}
          {surat.buktiFisik && (
            <div className="mt-4 pt-3 border-t border-slate-200 text-[10px] font-sans text-slate-500 flex items-center justify-between">
              <div>
                Validasi Fisik: Diterima oleh {surat.buktiFisik.namaPenerimaFisik} pada{' '}
                {surat.buktiFisik.tanggalSerahTerima}
                {surat.buktiFisik.nomorResi && ` (Resi: ${surat.buktiFisik.nomorResi})`}
              </div>
              <div>
                {surat.buktiFisik.diarsipkanKeDrive
                  ? 'Arsip Digital Tersinkron ke Google Drive'
                  : 'Arsip Dokumen Internal'}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
