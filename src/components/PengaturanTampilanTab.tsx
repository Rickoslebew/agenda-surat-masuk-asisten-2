import React, { useState, useEffect, useRef } from 'react';
import {
  Settings,
  Building,
  CheckCircle2,
  RotateCcw,
  Sparkles,
  Camera,
  Image as ImageIcon,
  Save,
  Palette,
  FileText,
  Eye,
  Info,
  ShieldCheck,
  Upload,
  Trash2,
} from 'lucide-react';
import { AppSettings } from '../types';
import {
  getAppSettings,
  saveAppSettings,
  resetAppSettings,
  DEFAULT_APP_SETTINGS,
} from '../services/storage';

export const PengaturanTampilanTab: React.FC = () => {
  const [settings, setSettings] = useState<AppSettings>(getAppSettings());
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [logoPreview, setLogoPreview] = useState<string>(settings.logoUrl || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleUpdate = () => {
      setSettings(getAppSettings());
    };
    window.addEventListener('eagenda_settings_updated', handleUpdate);
    return () => window.removeEventListener('eagenda_settings_updated', handleUpdate);
  }, []);

  const handleInputChange = (field: keyof AppSettings, value: string) => {
    setSettings(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 256;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_SIZE) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width *= MAX_SIZE / height;
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/png');
          setLogoPreview(dataUrl);
          setSettings(prev => ({ ...prev, logoUrl: dataUrl }));
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setLogoPreview('');
    setSettings(prev => ({ ...prev, logoUrl: '' }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveAppSettings(settings);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
    }, 3500);
  };

  const handleReset = () => {
    const defaultVal = resetAppSettings();
    setSettings(defaultVal);
    setLogoPreview('');
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  // Quick Preset Handlers
  const applyPreset = (presetName: string) => {
    let presetData: Partial<AppSettings> = {};

    switch (presetName) {
      case 'dlh':
        presetData = {
          namaSistem: 'Dinas Lingkungan Hidup Kab. Sleman',
          subjudulSistem: 'Sistem Persuratan & Disposisi Naskah Dinas',
          logoSingkatan: 'DLH',
          subIndukInstansi: 'PEMERINTAH KABUPATEN SLEMAN',
          namaInstansi: 'DINAS LINGKUNGAN HIDUP',
          alamatKantor: 'Jl. Parasamya No. 1, Beran, Tridadi, Sleman, D.I. Yogyakarta 55511',
          teleponKantor: '(0274) 868512',
          emailKantor: 'dlh@slemankab.go.id',
          websiteKantor: 'https://dlh.slemankab.go.id',
          warnaAksen: 'emerald',
        };
        break;
      case 'bpn':
        presetData = {
          namaSistem: 'Kantor Pertanahan Kab. Bogor (BPN)',
          subjudulSistem: 'Layanan Surat & Alur Disposisi Berkas Pertanahan',
          logoSingkatan: 'BPN',
          subIndukInstansi: 'KEMENTERIAN AGRARIA DAN TATA RUANG / BADAN PERTANAHAN NASIONAL',
          namaInstansi: 'KANTOR PERTANAHAN KABUPATEN BOGOR',
          alamatKantor: 'Jl. Tegar Beriman, Cibinong, Kab. Bogor, Jawa Barat 16914',
          teleponKantor: '(021) 87901234',
          emailKantor: 'kab-bogor@atrbpn.go.id',
          websiteKantor: 'https://kab-bogor.atrbpn.go.id',
          warnaAksen: 'indigo',
        };
        break;
      case 'kecamatan':
        presetData = {
          namaSistem: 'Kantor Kecamatan Cibinong',
          subjudulSistem: 'Buku Agenda & Disposisi Pelayanan Administrasi Wilayah',
          logoSingkatan: 'KEC',
          subIndukInstansi: 'PEMERINTAH KABUPATEN BOGOR',
          namaInstansi: 'KECAMATAN CIBINONG',
          alamatKantor: 'Jl. HR. Lukman No. 23, Cirimekar, Cibinong, Bogor 16917',
          teleponKantor: '(021) 8752001',
          emailKantor: 'kecamatan.cibinong@bogorkab.go.id',
          websiteKantor: 'https://cibinong.bogorkab.go.id',
          warnaAksen: 'blue',
        };
        break;
      case 'setda':
        presetData = {
          namaSistem: 'Sekretariat Daerah (Setda)',
          subjudulSistem: 'Tata Usaha Pimpinan & Disposisi Pejabat Eksekutif',
          logoSingkatan: 'SETDA',
          subIndukInstansi: 'PEMERINTAH DAERAH PROVINSI',
          namaInstansi: 'SEKRETARIAT DAERAH',
          alamatKantor: 'Kompleks Gedung Pusat Pemerintahan Terpadu Blok A',
          teleponKantor: '(021) 500123',
          emailKantor: 'setda@pemda.go.id',
          websiteKantor: 'https://pemda.go.id',
          warnaAksen: 'violet',
        };
        break;
    }

    const updated = { ...settings, ...presetData };
    setSettings(updated);
    saveAppSettings(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Top Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
              <Settings className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">
              Pengaturan Tampilan & Identitas Kantor
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Kustomisasi nama aplikasi di pojok kiri atas, logo kantor, singkatan, serta kop resmi pada lembar cetak disposisi.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleReset}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Default
          </button>
        </div>
      </div>

      {/* Success Notification Alert */}
      {savedSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl flex items-center gap-3 animate-in fade-in zoom-in-95 duration-200 shadow-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div className="text-xs">
            <span className="font-bold">Pengaturan Berhasil Diterapkan!</span>
            <p className="text-emerald-700 mt-0.5">
              Nama sistem di pojok kiri atas dan identitas kop lembar disposisi telah diperbarui secara langsung.
            </p>
          </div>
        </div>
      )}

      {/* Quick Template Presets */}
      <div className="bg-gradient-to-r from-indigo-900 via-blue-900 to-slate-900 rounded-xl p-4 text-white shadow-md">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span className="text-xs font-bold tracking-wide">
              Contoh Template Instansi Siap Pakai (1-Klik Terapkan):
            </span>
          </div>
          <span className="text-[10px] text-slate-300">
            Dapat Anda edit ulang sesuai kebutuhan kantor Anda
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <button
            type="button"
            onClick={() => applyPreset('dlh')}
            className="p-2.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/15 text-left transition-all hover:scale-[1.02] cursor-pointer"
          >
            <div className="text-xs font-bold text-emerald-300">Dinas Lingkungan Hidup</div>
            <div className="text-[10px] text-slate-300 mt-0.5">Logo DLH • Hijau Asri</div>
          </button>
          <button
            type="button"
            onClick={() => applyPreset('bpn')}
            className="p-2.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/15 text-left transition-all hover:scale-[1.02] cursor-pointer"
          >
            <div className="text-xs font-bold text-sky-300">Kantor Pertanahan (BPN)</div>
            <div className="text-[10px] text-slate-300 mt-0.5">Logo BPN • Biru Pertanahan</div>
          </button>
          <button
            type="button"
            onClick={() => applyPreset('kecamatan')}
            className="p-2.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/15 text-left transition-all hover:scale-[1.02] cursor-pointer"
          >
            <div className="text-xs font-bold text-amber-300">Kantor Kecamatan</div>
            <div className="text-[10px] text-slate-300 mt-0.5">Wilayah & Administrasi Warga</div>
          </button>
          <button
            type="button"
            onClick={() => applyPreset('setda')}
            className="p-2.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/15 text-left transition-all hover:scale-[1.02] cursor-pointer"
          >
            <div className="text-xs font-bold text-purple-300">Sekretariat Daerah (Setda)</div>
            <div className="text-[10px] text-slate-300 mt-0.5">Tata Usaha Pimpinan Eksekutif</div>
          </button>
        </div>
      </div>

      {/* Live Visual Preview Section */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-blue-600" />
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Simulasi Pratinjau Tampilan Pojok Kiri Atas (Live Preview)
          </h3>
        </div>
        <p className="text-[11px] text-slate-500">
          Inilah tampilan persis bagaimana bagian pojok kiri atas aplikasi Anda akan terlihat oleh seluruh pengguna:
        </p>

        {/* Mockup Header Header Bar */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Logo Badge */}
            {settings.logoUrl ? (
              <div className="w-10 h-10 rounded-xl overflow-hidden border border-slate-300 bg-white flex items-center justify-center p-0.5 shadow-sm">
                <img
                  src={settings.logoUrl}
                  alt="Logo Kantor"
                  className="w-full h-full object-contain"
                />
              </div>
            ) : (
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm font-bold text-base tracking-tighter ${
                  settings.warnaAksen === 'emerald'
                    ? 'bg-gradient-to-tr from-emerald-700 via-teal-600 to-emerald-500'
                    : settings.warnaAksen === 'indigo'
                    ? 'bg-gradient-to-tr from-indigo-700 via-purple-600 to-indigo-500'
                    : settings.warnaAksen === 'violet'
                    ? 'bg-gradient-to-tr from-violet-700 via-fuchsia-600 to-purple-500'
                    : settings.warnaAksen === 'slate'
                    ? 'bg-gradient-to-tr from-slate-800 via-slate-700 to-slate-600'
                    : 'bg-gradient-to-tr from-blue-700 via-indigo-600 to-sky-500'
                }`}
              >
                <span>{settings.logoSingkatan || 'eA'}</span>
              </div>
            )}

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-slate-900 leading-tight">
                  {settings.namaSistem || 'E-Agenda & Disposisi'}
                </h1>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Live
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                {settings.subjudulSistem || 'Sistem Tata Naskah & Disposisi Digital'}
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-slate-400 text-xs font-mono">
            <span className="px-2 py-1 bg-white rounded border border-slate-200">
              Pratinjau Navigasi
            </span>
          </div>
        </div>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Card 1: Pengaturan Pojok Kiri Atas */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
              <Building className="w-4 h-4 text-blue-600" />
              <span>1. Kustomisasi Judul & Logo Pojok Kiri Atas</span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Ubah teks "E-Agenda & Disposisi" menjadi nama dinas/kantor resmi Anda.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-800 mb-1">
                Nama Sistem / Nama Kantor (Pojok Kiri Atas): <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={settings.namaSistem}
                onChange={e => handleInputChange('namaSistem', e.target.value)}
                placeholder="Contoh: Dinas Lingkungan Hidup Kab. Sleman"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:border-blue-500 outline-none text-xs font-semibold"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Menggantikan teks default "E-Agenda & Disposisi".
              </span>
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">
                Sub-Judul / Tagline Sistem:
              </label>
              <input
                type="text"
                value={settings.subjudulSistem}
                onChange={e => handleInputChange('subjudulSistem', e.target.value)}
                placeholder="Contoh: Sistem Tata Naskah & Disposisi Digital"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:border-blue-500 outline-none text-xs"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Teks deskripsi kecil di bawah nama kantor.
              </span>
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">
                Singkatan Logo / Inisial Lencana (1 - 5 Huruf):
              </label>
              <input
                type="text"
                maxLength={5}
                value={settings.logoSingkatan}
                onChange={e => handleInputChange('logoSingkatan', e.target.value.toUpperCase())}
                placeholder="Contoh: DLH, BPN, KEC"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:border-blue-500 outline-none font-mono font-bold uppercase text-xs"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Muncul di dalam kotak lencana warna sebelah kiri teks.
              </span>
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">
                Pilihan Skema Warna Aksen:
              </label>
              <div className="grid grid-cols-5 gap-2 pt-0.5">
                {[
                  { id: 'blue', label: 'Biru', bg: 'bg-blue-600' },
                  { id: 'emerald', label: 'Hijau', bg: 'bg-emerald-600' },
                  { id: 'indigo', label: 'Indigo', bg: 'bg-indigo-600' },
                  { id: 'violet', label: 'Ungu', bg: 'bg-violet-600' },
                  { id: 'slate', label: 'Slate', bg: 'bg-slate-700' },
                ].map(c => (
                  <button
                    type="button"
                    key={c.id}
                    onClick={() => handleInputChange('warnaAksen', c.id as any)}
                    className={`py-1.5 px-2 rounded-lg border text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      settings.warnaAksen === c.id
                        ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span className={`w-2.5 h-2.5 rounded-full ${c.bg}`} />
                    <span>{c.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Logo Image Upload */}
            <div className="md:col-span-2 pt-2 border-t border-slate-100">
              <label className="block font-bold text-slate-800 mb-1.5">
                Foto Logo Instansi / Gambar Lambang Resmi (Opsional):
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
                {logoPreview ? (
                  <div className="flex items-center gap-3 p-2 bg-slate-50 rounded-xl border border-slate-200">
                    <img
                      src={logoPreview}
                      alt="Logo Pratinjau"
                      className="w-12 h-12 object-contain bg-white rounded-lg p-1 border border-slate-200"
                    />
                    <div>
                      <div className="text-xs font-bold text-slate-800">Logo Gambar Terpilih</div>
                      <div className="text-[10px] text-slate-500">Logo ini menggantikan inisial huruf</div>
                      <div className="mt-1 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="text-[11px] font-semibold text-blue-600 hover:underline cursor-pointer"
                        >
                          Ganti
                        </button>
                        <button
                          type="button"
                          onClick={handleRemoveLogo}
                          className="text-[11px] font-semibold text-rose-600 hover:underline cursor-pointer"
                        >
                          Hapus
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl border border-dashed border-slate-300 text-xs font-semibold flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <Upload className="w-4 h-4 text-slate-500" />
                    <span>Unggah Berkas Logo Resmi (PNG / JPG)</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Identitas Instansi & Kop Cetak Lembar Disposisi */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
              <FileText className="w-4 h-4 text-emerald-600" />
              <span>2. Identitas Instansi & Kop Cetak Lembar Disposisi Resmi</span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Data ini otomatis tercetak pada bagian kepala surat (Kop Surat) saat Anda mengekspor atau mencetak Lembar Disposisi PDF.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-800 mb-1">
                Pemerintah Daerah / Induk Lembaga (Kop Baris Atas):
              </label>
              <input
                type="text"
                value={settings.subIndukInstansi}
                onChange={e => handleInputChange('subIndukInstansi', e.target.value)}
                placeholder="Contoh: PEMERINTAH KABUPATEN SLEMAN"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:border-blue-500 outline-none text-xs uppercase"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">
                Nama Dinas / Badan / Kantor Resmi (Kop Judul Utama): <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={settings.namaInstansi}
                onChange={e => handleInputChange('namaInstansi', e.target.value)}
                placeholder="Contoh: DINAS LINGKUNGAN HIDUP"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:border-blue-500 outline-none text-xs font-bold uppercase"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block font-bold text-slate-800 mb-1">
                Alamat Kantor Lengkap:
              </label>
              <input
                type="text"
                value={settings.alamatKantor}
                onChange={e => handleInputChange('alamatKantor', e.target.value)}
                placeholder="Contoh: Jl. Parasamya No. 1, Beran, Tridadi, Sleman, D.I. Yogyakarta 55511"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:border-blue-500 outline-none text-xs"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">
                Nomor Telepon Kantor Resmi:
              </label>
              <input
                type="text"
                value={settings.teleponKantor}
                onChange={e => handleInputChange('teleponKantor', e.target.value)}
                placeholder="Contoh: (0274) 868512"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:border-blue-500 outline-none text-xs"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">
                Email Resmi Kantor:
              </label>
              <input
                type="text"
                value={settings.emailKantor}
                onChange={e => handleInputChange('emailKantor', e.target.value)}
                placeholder="Contoh: persuratan@dlh.slemankab.go.id"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:border-blue-500 outline-none text-xs"
              />
            </div>
          </div>

          {/* Mini Kop Printout Simulation */}
          <div className="mt-3 p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-center font-serif">
            <span className="text-[10px] uppercase font-sans font-bold text-slate-400 block tracking-widest">
              Simulasi Kop Surat Lembar Disposisi
            </span>
            <div className="text-[11px] font-sans font-bold tracking-widest uppercase text-slate-600">
              {settings.subIndukInstansi || 'PEMERINTAH REPUBLIK INDONESIA'}
            </div>
            <div className="text-sm font-sans font-bold uppercase tracking-wider text-slate-900">
              {settings.namaInstansi || 'BADAN PENGELOLA TATA NASKAH'}
            </div>
            <div className="text-[10px] font-sans text-slate-500">
              {settings.alamatKantor} • Telp: {settings.teleponKantor} • Email: {settings.emailKantor}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={handleReset}
            className="px-5 py-2.5 border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            Batal / Reset
          </button>
          <button
            type="submit"
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-2 transition-all cursor-pointer hover:shadow-lg"
          >
            <Save className="w-4 h-4" />
            <span>Simpan Perubahan Tampilan</span>
          </button>
        </div>
      </form>
    </div>
  );
};
