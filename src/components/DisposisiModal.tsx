import React, { useState } from 'react';
import {
  X,
  GitPullRequest,
  Building,
  User,
  Calendar,
  CheckSquare,
  AlertCircle,
  Clock,
  Sparkles,
} from 'lucide-react';
import { SuratMasuk, UserSession } from '../types';
import { getPejabatList, getUsersList } from '../services/storage';
import { UserAvatar } from './UserAvatar';

interface DisposisiModalProps {
  isOpen: boolean;
  onClose: () => void;
  surat: SuratMasuk | null;
  currentUser: UserSession;
  onSubmitDisposisi: (
    suratId: string,
    instansiTujuan: string,
    namaPenerimaBerkas: string,
    instruksi: string[],
    catatanKhusus: string,
    batasWaktu?: string,
    tujuanJabatan?: string
  ) => void;
}

export const DisposisiModal: React.FC<DisposisiModalProps> = ({
  isOpen,
  onClose,
  surat,
  currentUser,
  onSubmitDisposisi,
}) => {
  if (!isOpen || !surat) return null;

  const usersList = getUsersList();
  const candidateRecipients = usersList.length > 0 
    ? usersList.filter(u => u.id !== currentUser.id)
    : [];

  const firstCandidate = candidateRecipients[0] || usersList[0];

  // Quick preset options for convenience
  const instansiPresets = [
    'Bidang Umum & Sistem Informasi',
    'Sub Bagian Keuangan & Perencanaan',
    'Bagian Hukum & Kerjasama',
    'Sekretariat Utama',
    'Inspektorat Pengawas',
    'Bagian Tata Usaha & Kearsipan',
  ];

  const [instansiTujuan, setInstansiTujuan] = useState<string>(
    firstCandidate?.unitKerja || instansiPresets[0]
  );
  const [namaPenerimaBerkas, setNamaPenerimaBerkas] = useState<string>(
    firstCandidate?.nama || ''
  );
  const [tujuanJabatan, setTujuanJabatan] = useState<string>(
    firstCandidate?.jabatan || 'Kepala Bidang'
  );
  const [formError, setFormError] = useState<string | null>(null);

  // Standard Indonesian disposition instructions
  const standardInstructions = [
    'Tindak lanjuti segera',
    'Pelajari & siapkan bahan telaah',
    'Hadiri mewakili dinas / pimpinan',
    'Siapkan draf surat balasan / tanggapan',
    'Koordinasikan dengan instansi terkait',
    'Selesaikan sesuai ketentuan SOP',
    'Arsipkan & pantau perkembangan',
  ];

  const [selectedInstructions, setSelectedInstructions] = useState<string[]>([
    'Tindak lanjuti segera',
  ]);
  const [catatanKhusus, setCatatanKhusus] = useState<string>('');

  const toggleInstruction = (instruksi: string) => {
    if (selectedInstructions.includes(instruksi)) {
      setSelectedInstructions(selectedInstructions.filter(i => i !== instruksi));
    } else {
      setSelectedInstructions([...selectedInstructions, instruksi]);
    }
  };

  const handleSelectOfficial = (official: { nama: string; jabatan: string; unitKerja: string }) => {
    setInstansiTujuan(official.unitKerja);
    setNamaPenerimaBerkas(official.nama);
    setTujuanJabatan(official.jabatan);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!instansiTujuan.trim()) {
      setFormError('Nama instansi / bidang tujuan wajib diisi!');
      return;
    }

    if (!namaPenerimaBerkas.trim()) {
      setFormError('Nama penerima berkas tersebut wajib diisi!');
      return;
    }

    if (selectedInstructions.length === 0) {
      setFormError('Pilih minimal satu petunjuk tindak lanjut!');
      return;
    }

    onSubmitDisposisi(
      surat.id,
      instansiTujuan.trim(),
      namaPenerimaBerkas.trim(),
      selectedInstructions,
      catatanKhusus,
      undefined,
      tujuanJabatan || undefined
    );

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl my-6 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-indigo-900 via-blue-900 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center font-bold text-white text-sm">
              <GitPullRequest className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold">
                Lembar Arahan Disposisi Surat
              </h3>
              <p className="text-xs text-indigo-200">
                Tentukan instansi tujuan, nama penerima berkas yang akan melanjutkan, dan petunjuk arahan
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[82vh] overflow-y-auto text-xs">
          {formError && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{formError}</span>
            </div>
          )}

          {/* Summary Box Surat */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-blue-900 text-xs">
                {surat.nomorAgenda}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-800">
                Sifat: {surat.sifat}
              </span>
            </div>
            <div className="text-xs font-bold text-slate-900 leading-snug">
              {surat.perihal}
            </div>
            <div className="text-[11px] text-slate-600">
              Asal: <span className="font-medium text-slate-800">{surat.pengirim}</span> ({surat.nomorSurat})
            </div>
          </div>

          {/* Section 1: Instansi yang Dituju */}
          <div>
            <label className="block font-bold text-slate-900 text-xs mb-1">
              Nama Instansi / Bidang yang Dituju: <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Building className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                required
                value={instansiTujuan}
                onChange={e => setInstansiTujuan(e.target.value)}
                placeholder="Contoh: Bidang Umum & Sistem Informasi / Dinas Pendidikan"
                className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 font-semibold focus:border-indigo-500 outline-none"
              />
            </div>

            {/* Quick preset chips */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              <span className="text-[10px] text-slate-400 self-center">Pilihan Cepat:</span>
              {instansiPresets.map((inst, i) => (
                <button
                  type="button"
                  key={i}
                  onClick={() => setInstansiTujuan(inst)}
                  className={`px-2 py-0.5 rounded-md text-[10px] font-medium border transition-colors cursor-pointer ${
                    instansiTujuan === inst
                      ? 'bg-indigo-100 text-indigo-900 border-indigo-300 font-bold'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {inst}
                </button>
              ))}
            </div>
          </div>

          {/* Section 2: Nama Penerima Berkas */}
          <div>
            <label className="block font-bold text-slate-900 text-xs mb-1">
              Nama Penerima Berkas (Yang Melanjutkan Berkas): <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                required
                value={namaPenerimaBerkas}
                onChange={e => setNamaPenerimaBerkas(e.target.value)}
                placeholder="Contoh: Ahmad Fauzan, S.T., M.Kom / Siti Nurhaliza, S.E."
                className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 font-semibold focus:border-indigo-500 outline-none"
              />
            </div>

            {/* Quick official suggestion list */}
            {usersList.length > 0 && (
              <div className="mt-2 space-y-1">
                <span className="text-[10px] text-slate-500 font-semibold block">
                  Pilih Cepat dari Daftar Akun Pengguna / Staf:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {usersList.map(u => (
                    <button
                      type="button"
                      key={u.id}
                      onClick={() => handleSelectOfficial(u)}
                      className={`p-1.5 rounded-lg border text-left flex items-center gap-2 transition-all cursor-pointer ${
                        namaPenerimaBerkas === u.nama
                          ? 'bg-indigo-50 border-indigo-400 text-indigo-950 font-semibold ring-1 ring-indigo-400'
                          : 'bg-slate-50/70 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <UserAvatar
                        nama={u.nama}
                        avatarUrl={u.avatar}
                        role={u.role}
                        size="xs"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-[11px] truncate font-semibold">{u.nama}</div>
                        <div className="text-[9px] text-slate-500 truncate">
                          {u.jabatan} • {u.unitKerja}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Section 3: Checklist Petunjuk Arahan */}
          <div>
            <label className="block font-bold text-slate-900 text-xs mb-1.5">
              Petunjuk / Instruksi Arahan Pimpinan: <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
              {standardInstructions.map((ins, idx) => {
                const checked = selectedInstructions.includes(ins);
                return (
                  <label
                    key={idx}
                    className={`flex items-center gap-2 p-1.5 rounded-lg cursor-pointer transition-colors ${
                      checked ? 'bg-indigo-100/70 text-indigo-950 font-semibold' : 'hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleInstruction(ins)}
                      className="w-3.5 h-3.5 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                    />
                    <span className="text-xs">{ins}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Section 4: Catatan Khusus */}
          <div>
            <label className="block font-bold text-slate-900 text-xs mb-1">
              Catatan Tambahan / Arahan Khusus:
            </label>
            <textarea
              rows={2}
              value={catatanKhusus}
              onChange={e => setCatatanKhusus(e.target.value)}
              placeholder="Tuliskan arahan spesifik, rekomendasi tindakan, atau materi yang perlu disiapkan..."
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:border-indigo-500 outline-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <GitPullRequest className="w-3.5 h-3.5" />
              Terbitkan Disposisi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
