import React from 'react';
import {
  Inbox,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Building,
  UserCheck,
  Send,
  Calendar,
  BarChart3,
  Flame,
  FileText,
} from 'lucide-react';
import { SuratMasuk, UserSession } from '../types';

interface DashboardProps {
  suratList: SuratMasuk[];
  currentUser: UserSession;
  onNavigate: (tab: any) => void;
  onOpenSuratDetail: (surat: SuratMasuk) => void;
  onOpenDisposisiModal: (surat: SuratMasuk) => void;
  onOpenNewSuratModal: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  suratList,
  currentUser,
  onNavigate,
  onOpenSuratDetail,
  onOpenDisposisiModal,
  onOpenNewSuratModal,
}) => {
  // Statistics calculations
  const totalSurat = suratList.length;
  const suratBaru = suratList.filter(s => s.status === 'Baru Masuk').length;
  const suratProses = suratList.filter(s => s.status === 'Sedang Diproses' || s.status === 'Didisposisikan').length;
  const suratSelesai = suratList.filter(s => s.status === 'Selesai Diproses').length;

  // Flatten dispositions
  const allDisposisi = suratList.flatMap(s =>
    s.disposisiList.map(d => ({ ...d, suratInduk: s }))
  );

  const totalDisposisi = allDisposisi.length;
  const disposisiSelesai = allDisposisi.filter(d => d.status === 'Selesai').length;
  const disposisiProses = allDisposisi.filter(d => d.status === 'Sedang Diproses').length;
  const disposisiMenunggu = allDisposisi.filter(d => d.status === 'Menunggu').length;

  // Urgency distribution
  const sifatCounts = {
    Biasa: suratList.filter(s => s.sifat === 'Biasa').length,
    Penting: suratList.filter(s => s.sifat === 'Penting').length,
    Segera: suratList.filter(s => s.sifat === 'Segera').length,
    'Sangat Segera': suratList.filter(s => s.sifat === 'Sangat Segera').length,
    Rahasia: suratList.filter(s => s.sifat === 'Rahasia').length,
  };

  // Workload per recipient unit
  const bebanPerPejabat: Record<string, { nama: string; jabatan: string; total: number; selesai: number; proses: number }> = {};
  allDisposisi.forEach(d => {
    const key = d.instansiTujuan || d.tujuanUnit || d.tujuanPejabatId || 'Lainnya';
    const displayName = d.instansiTujuan || d.tujuanUnit || d.tujuanNama || 'Unit Kerja Terkait';
    const displayPenerima = d.namaPenerimaBerkas || d.tujuanNama || 'Penerima Berkas';
    if (!bebanPerPejabat[key]) {
      bebanPerPejabat[key] = {
        nama: displayName,
        jabatan: `Penerima: ${displayPenerima}`,
        total: 0,
        selesai: 0,
        proses: 0,
      };
    }
    bebanPerPejabat[key].total += 1;
    if (d.status === 'Selesai') bebanPerPejabat[key].selesai += 1;
    else bebanPerPejabat[key].proses += 1;
  });

  const completionRate = totalSurat > 0 ? Math.round((suratSelesai / totalSurat) * 100) : 0;
  const dispRate = totalDisposisi > 0 ? Math.round((disposisiSelesai / totalDisposisi) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-2xl p-5 sm:p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-white/5 transform skew-x-12 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-medium mb-2">
              <TrendingUp className="w-3.5 h-3.5" />
              Sistem Persuratan & Disposisi Aktif
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
              Selamat Datang, {currentUser.nama}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
              Anda masuk sebagai <span className="font-semibold text-white">{currentUser.role}</span> ({currentUser.jabatan}). Pantau status surat masuk dan perjalanan lembar disposisi secara real-time.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {currentUser.role === 'Admin' && (
              <button
                onClick={onOpenNewSuratModal}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-xs font-semibold shadow-md transition-all flex items-center gap-1.5"
              >
                <Inbox className="w-4 h-4" />
                Input Surat Masuk
              </button>
            )}
            <button
              onClick={() => onNavigate('disposisi')}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold backdrop-blur-xs border border-white/20 transition-all flex items-center gap-1.5"
            >
              <Send className="w-4 h-4" />
              Lihat Disposisi
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Total Surat Masuk */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-blue-300 transition-all">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold text-slate-600">Total Surat Masuk</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Inbox className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">{totalSurat}</div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-1">
            <span className="text-blue-600 font-semibold">{suratBaru} Baru</span>
            <span>•</span>
            <span>Tercatat di Agenda</span>
          </div>
        </div>

        {/* Sedang Diproses */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-amber-300 transition-all">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold text-slate-600">Sedang Diproses</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">{suratProses}</div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-1">
            <span className="text-amber-600 font-semibold">{disposisiProses} Disposisi</span>
            <span>aktif ditindaklanjuti</span>
          </div>
        </div>

        {/* Selesai Diproses */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold text-slate-600">Selesai Diproses</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">{suratSelesai}</div>
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 font-medium mt-1">
            <span>{completionRate}% Surat tuntas</span>
          </div>
        </div>

        {/* Performa Disposisi */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-purple-300 transition-all">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold text-slate-600">Penyelesaian Disposisi</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">
            {disposisiSelesai} / {totalDisposisi}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-purple-700 font-medium mt-1">
            <span>{dispRate}% target tercapai</span>
          </div>
        </div>
      </div>

      {/* Middle row: Analytics charts & breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Beban Disposisi per Pejabat/Unit Kerja */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-blue-600" />
                Beban Penugasan Disposisi per Pejabat / Unit Kerja
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Memantau distribusi arahan disposisi pimpinan dan progres tindak lanjut
              </p>
            </div>
            <span className="text-xs font-semibold text-blue-600 px-2 py-1 rounded bg-blue-50">
              Real-Time
            </span>
          </div>

          <div className="space-y-3.5">
            {Object.values(bebanPerPejabat).length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                Belum ada penugasan disposisi yang diterbitkan.
              </div>
            ) : (
              Object.values(bebanPerPejabat).map((pejabat, idx) => {
                const percent = Math.round((pejabat.selesai / (pejabat.total || 1)) * 100);
                return (
                  <div key={idx} className="p-3 rounded-lg border border-slate-100 bg-slate-50/50">
                    <div className="flex items-start justify-between text-xs mb-1.5 gap-2">
                      <div>
                        <div className="font-semibold text-slate-800">{pejabat.nama}</div>
                        <div className="text-[11px] text-slate-500">{pejabat.jabatan}</div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-bold text-slate-900">{pejabat.total} Disposisi</span>
                        <div className="text-[10px] text-slate-500">
                          {pejabat.selesai} Selesai • {pejabat.proses} Proses
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden flex">
                      <div
                        className="bg-emerald-500 h-2 transition-all duration-500"
                        style={{ width: `${percent}%` }}
                        title={`${percent}% Selesai`}
                      />
                      <div
                        className="bg-amber-400 h-2 transition-all duration-500"
                        style={{ width: `${100 - percent}%` }}
                        title={`${100 - percent}% Dalam Pengerjaan`}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Distribusi Sifat Surat & Kategori */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-1">
              <Flame className="w-4 h-4 text-rose-500" />
              Tingkat Urgensi Surat Masuk
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Klasifikasi surat berdasarkan tingkat kepentingan
            </p>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-rose-50 border border-rose-100">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <span className="font-semibold text-rose-900">Sangat Segera</span>
                </div>
                <span className="font-bold text-rose-700">{sifatCounts['Sangat Segera']} Surat</span>
              </div>

              <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-amber-50 border border-amber-100">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span className="font-semibold text-amber-900">Segera</span>
                </div>
                <span className="font-bold text-amber-700">{sifatCounts['Segera']} Surat</span>
              </div>

              <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-blue-50 border border-blue-100">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  <span className="font-semibold text-blue-900">Penting</span>
                </div>
                <span className="font-bold text-blue-700">{sifatCounts['Penting']} Surat</span>
              </div>

              <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                  <span className="font-semibold text-slate-700">Biasa</span>
                </div>
                <span className="font-bold text-slate-600">{sifatCounts['Biasa']} Surat</span>
              </div>

              <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-purple-50 border border-purple-100">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                  <span className="font-semibold text-purple-900">Rahasia</span>
                </div>
                <span className="font-bold text-purple-700">{sifatCounts['Rahasia']} Surat</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-center">
            <span className="text-[11px] text-slate-400">
              Prioritas penanganan mengikuti batas waktu disposisi pimpinan
            </span>
          </div>
        </div>
      </div>

      {/* Bottom section: Disposisi Status Real-Time Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Pelacakan Status Disposisi Terkini
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Daftar penugasan dan arah disposisi dari pimpinan yang sedang berjalan
            </p>
          </div>
          <button
            onClick={() => onNavigate('disposisi')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 self-start sm:self-auto"
          >
            Buka Papan Disposisi Lengkap
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <th className="py-3 px-4">Surat & Nomor Agenda</th>
                <th className="py-3 px-4">Arah Disposisi (Tujuan)</th>
                <th className="py-3 px-4">Instruksi Pimpinan</th>
                <th className="py-3 px-4">Batas Waktu</th>
                <th className="py-3 px-4">Status & Progres</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {allDisposisi.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                    Belum ada disposisi aktif
                  </td>
                </tr>
              ) : (
                allDisposisi.slice(0, 5).map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">
                        {item.suratInduk.nomorAgenda}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate max-w-xs">
                        {item.suratInduk.perihal}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Asal: {item.suratInduk.pengirim}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-800">
                        {item.instansiTujuan || item.tujuanUnit || 'Instansi Terkait'}
                      </div>
                      <div className="text-[11px] text-indigo-900 font-medium">
                        Penerima: {item.namaPenerimaBerkas || item.tujuanNama || 'Penerima Berkas'}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {item.instruksi.slice(0, 2).map((ins, i) => (
                          <span
                            key={i}
                            className="inline-block px-1.5 py-0.5 rounded text-[10px] bg-blue-50 text-blue-700 border border-blue-200"
                          >
                            {ins}
                          </span>
                        ))}
                      </div>
                      {item.catatanKhusus && (
                        <div className="text-[10px] text-slate-500 italic mt-1 line-clamp-1">
                          "{item.catatanKhusus}"
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-slate-700">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{item.batasWaktu}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            item.status === 'Selesai'
                              ? 'bg-emerald-100 text-emerald-800'
                              : item.status === 'Sedang Diproses'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {item.status}
                        </span>
                        <span className="text-[11px] font-bold text-slate-700">
                          {item.progresPersen}%
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => onOpenSuratDetail(item.suratInduk)}
                        className="px-2.5 py-1 text-xs font-semibold text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        Detail Surat
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
