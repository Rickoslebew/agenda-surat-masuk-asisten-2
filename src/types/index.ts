export type SifatSurat = 'Biasa' | 'Penting' | 'Segera' | 'Sangat Segera' | 'Rahasia';

export type StatusSurat = 'Baru Masuk' | 'Sedang Diproses' | 'Didisposisikan' | 'Selesai Diproses';

export type StatusDisposisi = 'Menunggu' | 'Sedang Diproses' | 'Selesai' | 'Terlambat';

export type Role = 'Admin' | 'Pimpinan' | 'Penerima Disposisi' | 'Auditor';

export interface PejabatUnit {
  id: string;
  nama: string;
  jabatan: string;
  unitKerja: string;
  email: string;
  avatar?: string;
}

export interface BuktiSerahTerima {
  id: string;
  fotoUrl: string; // Base64 data URL or external URL
  namaPenerimaFisik: string;
  tanggalSerahTerima: string;
  ekspedisiKurir?: string;
  nomorResi?: string;
  catatan?: string;
  statusVerifikasi: 'Terverifikasi' | 'Menunggu Verifikasi';
  diarsipkanKeDrive: boolean;
  driveFileId?: string;
  driveWebViewLink?: string;
  waktuArsipDrive?: string;
}

export interface BuktiFotoDisposisi {
  url: string; // Base64 data URL or external URL
  namaPenerima?: string; // Nama petugas penerima berkas
  tanggal: string; // Tanggal & waktu ambil / unggah
  keterangan?: string;
  driveFileId?: string;
  driveWebViewLink?: string;
}

export interface DisposisiItem {
  id: string;
  suratId: string;
  tanggalDisposisi: string;
  instansiTujuan: string; // Nama instansi yang dituju
  namaPenerimaBerkas: string; // Nama penerima berkas tersebut
  dariPimpinan?: {
    nama: string;
    jabatan: string;
  };
  tujuanNama?: string; // For backward compatibility
  tujuanJabatan?: string;
  tujuanUnit?: string;
  tujuanPejabatId?: string;
  instruksi: string[]; // e.g. ["Tindak lanjuti segera", "Pelajari & siapkan bahan"]
  catatanKhusus: string;
  batasWaktu?: string; // YYYY-MM-DD (opsional)
  status: StatusDisposisi;
  progresPersen: number;
  laporanHasil?: string;
  tanggalPenyelesaian?: string;
  buktiFoto?: BuktiFotoDisposisi;
  riwayatTindakLanjut: {
    waktu: string;
    oleh: string;
    keterangan: string;
    status: StatusDisposisi;
    buktiFotoUrl?: string;
  }[];
}

export interface SuratMasuk {
  id: string;
  nomorAgenda: string; // misal: AGD/2026/X/001
  nomorSurat: string;  // misal: 045.2/BKD/X/2026
  tanggalSurat: string; // YYYY-MM-DD
  tanggalTerima: string; // YYYY-MM-DD
  pengirim: string;
  instansiPengirim: string;
  perihal: string;
  ringkasan: string;
  sifat: SifatSurat;
  kategori: string; // Undangan, Permohonan, Nota Dinas, Laporan, Surat Edaran, Kerjasama
  status: StatusSurat;
  fileLampiranNama?: string;
  fileLampiranUrl?: string;
  buktiFisik?: BuktiSerahTerima;
  disposisiList: DisposisiItem[];
  dibuatOleh: string;
  waktuDibuat: string;
  waktuDiperbarui: string;
}

export interface Notifikasi {
  id: string;
  judul: string;
  pesan: string;
  tipe: 'info' | 'warning' | 'success' | 'urgent';
  suratId?: string;
  disposisiId?: string;
  waktu: string;
  dibaca: boolean;
  targetRole?: Role[];
  targetPejabatId?: string;
}

export interface UserSession {
  id: string;
  nama: string;
  email: string;
  role: Role;
  jabatan: string;
  unitKerja: string;
  pejabatUnitId?: string;
  avatar: string;
  nomorTelepon?: string;
  catatanPribadi?: string;
  username?: string;
  password?: string;
}


export interface AppSettings {
  namaSistem: string; // Misal: "E-Agenda & Disposisi" atau "Dinas Lingkungan Hidup Kab. Sleman"
  subjudulSistem: string; // Misal: "Sistem Tata Naskah & Disposisi Digital"
  logoSingkatan: string; // Misal: "eA" atau "DLH" atau "BPN"
  logoUrl?: string; // Optional custom logo image URL/base64
  namaInstansi: string; // Kop surat: BADAN PENGELOLA TATA NASKAH & ARSIP ELEKTRONIK
  subIndukInstansi?: string; // Kop surat baris atas: PEMERINTAH DAERAH / REPUBLIK INDONESIA
  alamatKantor: string; // Alamat kantor kop surat
  teleponKantor: string; // Telepon kantor
  emailKantor: string; // Email resmi kantor
  websiteKantor?: string; // Website resmi kantor
  warnaAksen?: 'blue' | 'indigo' | 'emerald' | 'violet' | 'slate';
}

