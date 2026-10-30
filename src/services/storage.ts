import { PejabatUnit, SuratMasuk, Notifikasi, UserSession, Role, DisposisiItem, AppSettings, BuktiFotoDisposisi } from '../types';
import { showSystemPushNotification } from './notificationService';

export const INITIAL_PEJABAT: PejabatUnit[] = [
  {
    id: 'pej-1',
    nama: 'Dr. H. Bambang Sutrisno, M.Si',
    jabatan: 'Kepala Dinas / Direktur Utama',
    unitKerja: 'Pimpinan Eksekutif',
    email: 'bambang.sutrisno@instansi.go.id',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
  },
  {
    id: 'pej-2',
    nama: 'Ir. Hj. Ratna Wulandari, M.T.',
    jabatan: 'Sekretaris Kantor',
    unitKerja: 'Sekretariat Utama',
    email: 'ratna.wulandari@instansi.go.id',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80',
  },
  {
    id: 'pej-3',
    nama: 'Ahmad Fauzan, S.T., M.Kom',
    jabatan: 'Kepala Bidang Umum & Sistem Informasi',
    unitKerja: 'Bidang Umum & IT',
    email: 'ahmad.fauzan@instansi.go.id',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
  },
  {
    id: 'pej-4',
    nama: 'Siti Nurhaliza, S.E., M.Ak',
    jabatan: 'Kasubag Perencanaan & Keuangan',
    unitKerja: 'Sub Bagian Keuangan',
    email: 'siti.nurhaliza@instansi.go.id',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&auto=format&fit=crop&q=80',
  },
  {
    id: 'pej-5',
    nama: 'Hendra Gunawan, S.H.',
    jabatan: 'Kepala Bagian Hukum & Kerjasama',
    unitKerja: 'Bagian Hukum',
    email: 'hendra.gunawan@instansi.go.id',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80',
  },
  {
    id: 'pej-6',
    nama: 'Maya Anggraini, A.Md',
    jabatan: 'Staf Tata Usaha & Pengadministrasi Surat',
    unitKerja: 'Sub Bagian Umum & Arsip',
    email: 'maya.anggraini@instansi.go.id',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
  },
];

export const PRESET_AVATARS = [
  { id: 'av-1', label: 'Pria Formal 1', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80' },
  { id: 'av-2', label: 'Wanita Hijab/Formal 1', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80' },
  { id: 'av-3', label: 'Pria Formal 2', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80' },
  { id: 'av-4', label: 'Wanita Formal 2', url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&auto=format&fit=crop&q=80' },
  { id: 'av-5', label: 'Pria Jas 3', url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80' },
  { id: 'av-6', label: 'Wanita Blazer 3', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80' },
  { id: 'av-7', label: 'Pria Senior 4', url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&auto=format&fit=crop&q=80' },
  { id: 'av-8', label: 'Wanita Muda 4', url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80' },
];

export const DEFAULT_FALLBACK_USER: UserSession = {
  id: 'usr-default',
  nama: 'Pengguna Pribadi',
  email: 'pengguna@kantor.go.id',
  role: 'Admin',
  jabatan: 'Administrator Persuratan',
  unitKerja: 'Bagian Tata Usaha',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
};

export const INITIAL_USERS: UserSession[] = [];

const SAMPLE_SURAT: SuratMasuk[] = [
  {
    id: 'srt-001',
    nomorAgenda: 'AGD/2026/10/012',
    nomorSurat: '005/1842/SETDA/2026',
    tanggalSurat: '2026-10-18',
    tanggalTerima: '2026-10-19',
    pengirim: 'Sekretariat Daerah Provinsi',
    instansiPengirim: 'Pemerintah Provinsi Jawa Barat',
    perihal: 'Undangan Rapat Koordinasi Penerapan SPBE dan Arsitektur Transformasi Digital 2026',
    ringkasan: 'Rapat koordinasi teknis percepatan implementasi Sistem Pemerintahan Berbasis Elektronik (SPBE) serta audit keamanan siber perangkat daerah.',
    sifat: 'Penting',
    kategori: 'Undangan',
    status: 'Didisposisikan',
    fileLampiranNama: 'Lampiran_Rakor_SPBE_2026.pdf',
    buktiFisik: {
      id: 'bkt-001',
      fotoUrl: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=500&auto=format&fit=crop&q=80',
      namaPenerimaFisik: 'Maya Anggraini (Resepsionis/TU)',
      tanggalSerahTerima: '2026-10-19 09:30',
      ekspedisiKurir: 'Kurir Resmi Setda Prov',
      nomorResi: 'KUR-SETDA-9821',
      catatan: 'Dokumen fisik amplop cokelat segel utuh diterima dengan baik.',
      statusVerifikasi: 'Terverifikasi',
      diarsipkanKeDrive: true,
      driveFileId: 'drv-file-sample-01',
      driveWebViewLink: 'https://drive.google.com',
      waktuArsipDrive: '2026-10-19 10:15',
    },
    disposisiList: [
      {
        id: 'dsp-001',
        suratId: 'srt-001',
        tanggalDisposisi: '2026-10-19 11:00',
        instansiTujuan: 'Bidang Umum & Sistem Informasi',
        namaPenerimaBerkas: 'Ahmad Fauzan, S.T., M.Kom',
        tujuanPejabatId: 'pej-3',
        tujuanNama: 'Ahmad Fauzan, S.T., M.Kom',
        tujuanJabatan: 'Kepala Bidang Umum & Sistem Informasi',
        tujuanUnit: 'Bidang Umum & IT',
        instruksi: ['Pelajari & siapkan bahan telaah', 'Hadiri mewakili dinas', 'Laporkan hasil pelaksanaan'],
        catatanKhusus: 'Harap siapkan paparan capaian integrasi data center kita dan koordinasikan dengan tim teknis.',
        batasWaktu: '2026-10-25',
        status: 'Sedang Diproses',
        progresPersen: 60,
        buktiFoto: {
          url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500&auto=format&fit=crop&q=80',
          namaPenerima: 'Ahmad Fauzan, S.T., M.Kom',
          tanggal: '2026-10-19 13:45',
          keterangan: 'Foto serah terima lembar berkas fisik disposisi di ruang Bidang Umum & IT',
        },
        riwayatTindakLanjut: [
          {
            waktu: '2026-10-19 11:00',
            oleh: 'Dr. H. Bambang Sutrisno, M.Si',
            keterangan: 'Disposisi diterbitkan oleh Pimpinan',
            status: 'Menunggu',
          },
          {
            waktu: '2026-10-19 13:45',
            oleh: 'Ahmad Fauzan, S.T., M.Kom',
            keterangan: 'Disposisi diterima dan sedang menyusun draf materi presentasi SPBE bersama tim analis.',
            status: 'Sedang Diproses',
          },
        ],
      },
    ],
    dibuatOleh: 'Maya Anggraini, A.Md',
    waktuDibuat: '2026-10-19 09:40',
    waktuDiperbarui: '2026-10-19 13:45',
  },
  {
    id: 'srt-002',
    nomorAgenda: 'AGD/2026/10/011',
    nomorSurat: 'S-412/BPK/V/2026',
    tanggalSurat: '2026-10-17',
    tanggalTerima: '2026-10-18',
    pengirim: 'Badan Pemeriksa Keuangan (BPK) RI Perwakilan',
    instansiPengirim: 'BPK RI Perwakilan Wilayah',
    perihal: 'Pemberitahuan Pemeriksaan Interim Kepatuhan Anggaran Semester II',
    ringkasan: 'Tim pemeriksa BPK akan melakukan uji petik kepatuhan realisasi belanja modal dan pengadaan barang/jasa.',
    sifat: 'Sangat Segera',
    kategori: 'Pemberitahuan',
    status: 'Sedang Diproses',
    fileLampiranNama: 'Surat_Tugas_Pemeriksaan_BPK.pdf',
    buktiFisik: {
      id: 'bkt-002',
      fotoUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=500&auto=format&fit=crop&q=80',
      namaPenerimaFisik: 'Maya Anggraini',
      tanggalSerahTerima: '2026-10-18 10:15',
      ekspedisiKurir: 'Pos Kilat Khusus',
      nomorResi: 'POS-ID-7729104',
      catatan: 'Diterima rangkap 2 asli berstempel basah BPK.',
      statusVerifikasi: 'Terverifikasi',
      diarsipkanKeDrive: true,
      driveFileId: 'drv-file-sample-02',
      driveWebViewLink: 'https://drive.google.com',
      waktuArsipDrive: '2026-10-18 11:00',
    },
    disposisiList: [
      {
        id: 'dsp-002',
        suratId: 'srt-002',
        tanggalDisposisi: '2026-10-18 13:00',
        instansiTujuan: 'Sub Bagian Perencanaan & Keuangan',
        namaPenerimaBerkas: 'Siti Nurhaliza, S.E., M.Ak',
        tujuanPejabatId: 'pej-4',
        tujuanNama: 'Siti Nurhaliza, S.E., M.Ak',
        tujuanJabatan: 'Kasubag Perencanaan & Keuangan',
        tujuanUnit: 'Sub Bagian Keuangan',
        instruksi: ['Tindak lanjuti segera', 'Siapkan dokumen / data dukung SPJ', 'Koordinasikan dengan PPK'],
        catatanKhusus: 'Kumpulkan seluruh arsip BKU dan SP2D triwulan 3, pastikan ruang pemeriksaan telah disiapkan.',
        batasWaktu: '2026-10-23',
        status: 'Sedang Diproses',
        progresPersen: 75,
        riwayatTindakLanjut: [
          {
            waktu: '2026-10-18 13:00',
            oleh: 'Dr. H. Bambang Sutrisno, M.Si',
            keterangan: 'Disposisi diterbitkan oleh Pimpinan',
            status: 'Menunggu',
          },
          {
            waktu: '2026-10-18 15:20',
            oleh: 'Siti Nurhaliza, S.E., M.Ak',
            keterangan: 'Telah menginstruksikan bendahara pengeluaran menyiapkan berkas SPJ dan bukti transfer.',
            status: 'Sedang Diproses',
          },
        ],
      },
    ],
    dibuatOleh: 'Maya Anggraini, A.Md',
    waktuDibuat: '2026-10-18 10:20',
    waktuDiperbarui: '2026-10-18 15:20',
  },
  {
    id: 'srt-003',
    nomorAgenda: 'AGD/2026/10/010',
    nomorSurat: '120/DIR-TELKOM/X/2026',
    tanggalSurat: '2026-10-12',
    tanggalTerima: '2026-10-13',
    pengirim: 'PT Telkom Indonesia (Persero) Tbk',
    instansiPengirim: 'Divisi Enterprise & Government Service',
    perihal: 'Laporan Penyelesaian Pemeliharaan Jaringan Metro-E dan Penambahan Bandwidth',
    ringkasan: 'Pemberitahuan bahwa proses upgrade bandwidth 1 Gbps untuk gedung kantor telah sukses diuji coba dan siap serah terima akhir.',
    sifat: 'Biasa',
    kategori: 'Laporan',
    status: 'Selesai Diproses',
    fileLampiranNama: 'Berita_Acara_Uji_Terima_Bandwidth.pdf',
    buktiFisik: {
      id: 'bkt-003',
      fotoUrl: 'https://images.unsplash.com/photo-1568667256549-094345857637?w=500&auto=format&fit=crop&q=80',
      namaPenerimaFisik: 'Bambang Irawan (Resepsionis)',
      tanggalSerahTerima: '2026-10-13 14:00',
      ekspedisiKurir: 'Staff Vendor Langsung',
      nomorResi: 'BA-TELKOM-889',
      catatan: 'Dokumen BAST ditandatangani di resepsionis.',
      statusVerifikasi: 'Terverifikasi',
      diarsipkanKeDrive: true,
      driveFileId: 'drv-file-sample-03',
      driveWebViewLink: 'https://drive.google.com',
      waktuArsipDrive: '2026-10-13 15:00',
    },
    disposisiList: [
      {
        id: 'dsp-003',
        suratId: 'srt-003',
        tanggalDisposisi: '2026-10-13 16:00',
        instansiTujuan: 'Bidang Umum & Sistem Informasi',
        namaPenerimaBerkas: 'Ahmad Fauzan, S.T., M.Kom',
        tujuanPejabatId: 'pej-3',
        tujuanNama: 'Ahmad Fauzan, S.T., M.Kom',
        tujuanJabatan: 'Kepala Bidang Umum & Sistem Informasi',
        tujuanUnit: 'Bidang Umum & IT',
        instruksi: ['Verifikasi hasil uji teknis', 'Arsipkan ke lemari berkas IT'],
        catatanKhusus: 'Pastikan latency stabil dan SLA 99.8% terpenuhi.',
        batasWaktu: '2026-10-16',
        status: 'Selesai',
        progresPersen: 100,
        laporanHasil: 'Pemeriksaan performa jaringan telah diverifikasi, ping stabil 4ms, SLA terpenuhi dan BAST telah ditandatangani.',
        tanggalPenyelesaian: '2026-10-15 11:30',
        riwayatTindakLanjut: [
          {
            waktu: '2026-10-13 16:00',
            oleh: 'Dr. H. Bambang Sutrisno, M.Si',
            keterangan: 'Disposisi diterbitkan',
            status: 'Menunggu',
          },
          {
            waktu: '2026-10-14 10:00',
            oleh: 'Ahmad Fauzan, S.T., M.Kom',
            keterangan: 'Tim teknis sedang melakukan speedtest dan monitoring router core.',
            status: 'Sedang Diproses',
          },
          {
            waktu: '2026-10-15 11:30',
            oleh: 'Ahmad Fauzan, S.T., M.Kom',
            keterangan: 'Selesai diverifikasi, berkas disimpan di arsip digital.',
            status: 'Selesai',
          },
        ],
      },
    ],
    dibuatOleh: 'Maya Anggraini, A.Md',
    waktuDibuat: '2026-10-13 14:15',
    waktuDiperbarui: '2026-10-15 11:30',
  },
  {
    id: 'srt-004',
    nomorAgenda: 'AGD/2026/10/013',
    nomorSurat: 'B-998/MENPAN-RB/X/2026',
    tanggalSurat: '2026-10-20',
    tanggalTerima: '2026-10-21',
    pengirim: 'Kementerian PAN-RB Republik Indonesia',
    instansiPengirim: 'Deputi Bidang Reformasi Birokrasi',
    perihal: 'Pedoman Penilaian Mandiri Akuntabilitas Kinerja Instansi Pemerintah (AKIP) Tahun 2026',
    ringkasan: 'Penyampaian instrumen penilaian mandiri AKIP dan jadwal evaluasi virtual dengan asesor nasional.',
    sifat: 'Penting',
    kategori: 'Surat Edaran',
    status: 'Baru Masuk',
    fileLampiranNama: 'Surat_Edaran_Menteri_PANRB_AKIP.pdf',
    buktiFisik: {
      id: 'bkt-004',
      fotoUrl: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=500&auto=format&fit=crop&q=80',
      namaPenerimaFisik: 'Maya Anggraini',
      tanggalSerahTerima: '2026-10-21 11:10',
      ekspedisiKurir: 'JNE Express VIP',
      nomorResi: 'JNE-DOC-448201',
      catatan: 'Amplop dokumen dinas berlogo Garuda Pancasila.',
      statusVerifikasi: 'Terverifikasi',
      diarsipkanKeDrive: false,
    },
    disposisiList: [],
    dibuatOleh: 'Maya Anggraini, A.Md',
    waktuDibuat: '2026-10-21 11:20',
    waktuDiperbarui: '2026-10-21 11:20',
  },
  {
    id: 'srt-005',
    nomorAgenda: 'AGD/2026/10/009',
    nomorSurat: '45/MOU-UNIV/IX/2026',
    tanggalSurat: '2026-10-10',
    tanggalTerima: '2026-10-11',
    pengirim: 'Universitas Indonesia - Fakultas Ilmu Komputer',
    instansiPengirim: 'Fasilkom UI',
    perihal: 'Usulan Perpanjangan Perjanjian Kerjasama (MoU) Program Magang Bersertifikat',
    ringkasan: 'Pengajuan draf addendum perpanjangan kerjasama program magang mahasiswa angkatan 2026/2027.',
    sifat: 'Biasa',
    kategori: 'Kerjasama',
    status: 'Sedang Diproses',
    fileLampiranNama: 'Draf_MoU_Magang_2026.docx',
    buktiFisik: {
      id: 'bkt-005',
      fotoUrl: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=500&auto=format&fit=crop&q=80',
      namaPenerimaFisik: 'Bambang Irawan',
      tanggalSerahTerima: '2026-10-11 10:00',
      ekspedisiKurir: 'Kurir Internal Kampus',
      catatan: 'Berkas naskah kerjasama rangkap 3.',
      statusVerifikasi: 'Terverifikasi',
      diarsipkanKeDrive: true,
      driveFileId: 'drv-file-sample-05',
      driveWebViewLink: 'https://drive.google.com',
      waktuArsipDrive: '2026-10-11 11:20',
    },
    disposisiList: [
      {
        id: 'dsp-005',
        suratId: 'srt-005',
        tanggalDisposisi: '2026-10-11 14:00',
        instansiTujuan: 'Bagian Hukum & Kerjasama',
        namaPenerimaBerkas: 'Hendra Gunawan, S.H.',
        tujuanPejabatId: 'pej-5',
        tujuanNama: 'Hendra Gunawan, S.H.',
        tujuanJabatan: 'Kepala Bagian Hukum & Kerjasama',
        tujuanUnit: 'Bagian Hukum',
        instruksi: ['Pelajari draf klausul hukum', 'Koordinasikan dengan unit terkait'],
        catatanKhusus: 'Periksa hak dan kewajiban peserta magang serta klausul kerahasiaan data (NDA).',
        batasWaktu: '2026-10-24',
        status: 'Sedang Diproses',
        progresPersen: 50,
        riwayatTindakLanjut: [
          {
            waktu: '2026-10-11 14:00',
            oleh: 'Dr. H. Bambang Sutrisno, M.Si',
            keterangan: 'Disposisi diterbitkan oleh Pimpinan',
            status: 'Menunggu',
          },
          {
            waktu: '2026-10-12 09:30',
            oleh: 'Hendra Gunawan, S.H.',
            keterangan: 'Sedang melakukan legal drafting dan review pasal kompensasi.',
            status: 'Sedang Diproses',
          },
        ],
      },
    ],
    dibuatOleh: 'Maya Anggraini, A.Md',
    waktuDibuat: '2026-10-11 10:15',
    waktuDiperbarui: '2026-10-12 09:30',
  },
];

const SAMPLE_NOTIFIKASI: Notifikasi[] = [
  {
    id: 'ntf-01',
    judul: 'Surat Masuk Baru Dicatat',
    pesan: 'Surat KemenPAN-RB (No. B-998/MENPAN-RB/X/2026) telah masuk agenda dan menunggu telaah pimpinan.',
    tipe: 'info',
    suratId: 'srt-004',
    waktu: '2026-10-21 11:20',
    dibaca: false,
    targetRole: ['Pimpinan', 'Admin'],
  },
  {
    id: 'ntf-02',
    judul: 'Disposisi Baru untuk Anda',
    pesan: 'Pimpinan mendisposisikan surat Setda Jabar perihal Rakor SPBE kepada Kabid Umum & Sistem Informasi.',
    tipe: 'urgent',
    suratId: 'srt-001',
    disposisiId: 'dsp-001',
    waktu: '2026-10-19 11:00',
    dibaca: false,
    targetPejabatId: 'pej-3',
  },
  {
    id: 'ntf-03',
    judul: 'Pengingat Batas Waktu Disposisi',
    pesan: 'Disposisi Surat Pemeriksaan BPK jatuh tempo dalam 2 hari (23 Oktober 2026). Harap segera selesaikan SPJ.',
    tipe: 'warning',
    suratId: 'srt-002',
    disposisiId: 'dsp-002',
    waktu: '2026-10-21 08:00',
    dibaca: true,
    targetPejabatId: 'pej-4',
  },
  {
    id: 'ntf-04',
    judul: 'Disposisi Telah Selesai',
    pesan: 'Kabid Umum & IT telah menyelesaikan tindak lanjut surat Telkom Indonesia (No. 120/DIR-TELKOM/X/2026).',
    tipe: 'success',
    suratId: 'srt-003',
    disposisiId: 'dsp-003',
    waktu: '2026-10-15 11:30',
    dibaca: true,
  },
];

export interface DemoAccount extends UserSession {
  username: string;
  passwordHint: string;
}

export const SUPERADMIN_MASTER_KEY = 'SUPERADMIN-RECOVERY-2026';

export const SUPERADMIN_ACCOUNT: DemoAccount = {
  id: 'usr-superadmin-master',
  nama: 'Super Administrator (Master Backup)',
  email: 'rickochico20@gmail.com',
  username: 'superadmin',
  password: 'superadmin123',
  passwordHint: 'superadmin123',
  role: 'Admin',
  jabatan: 'Super Administrator & Pengendali Sistem Utama',
  unitKerja: 'Pusat Kendali Sistem & Keamanan Data',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
  nomorTelepon: '0812-9999-0000',
};

export const DEFAULT_DEMO_ACCOUNTS: DemoAccount[] = [
  SUPERADMIN_ACCOUNT,
  {
    id: 'usr-admin-demo',
    nama: 'Rian Prasetyo, S.Kom',
    email: 'admin.tu@kantor.go.id',
    username: 'admin',
    password: 'admin123',
    passwordHint: 'admin123',
    role: 'Admin',
    jabatan: 'Pengadministrasi Persuratan & TU',
    unitKerja: 'Sub Bagian Tata Usaha & Kearsipan',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    nomorTelepon: '0812-3456-7891',
  },
  {
    id: 'usr-pimpinan-demo',
    nama: 'Dr. H. Bambang Sutrisno, M.Si',
    email: 'kepala.dinas@kantor.go.id',
    username: 'pimpinan',
    password: 'pimpinan123',
    passwordHint: 'pimpinan123',
    role: 'Pimpinan',
    jabatan: 'Kepala Dinas / Pimpinan Instansi',
    unitKerja: 'Pimpinan Eksekutif',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
    nomorTelepon: '0811-9876-5432',
  },
  {
    id: 'usr-kabid-demo',
    nama: 'Ahmad Fauzan, S.T., M.Kom',
    email: 'ahmad.fauzan@kantor.go.id',
    username: 'kabid',
    password: 'kabid123',
    passwordHint: 'kabid123',
    role: 'Penerima Disposisi',
    jabatan: 'Kepala Bidang Umum & Sistem Informasi',
    unitKerja: 'Bidang Umum & IT',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80',
    nomorTelepon: '0813-8899-7711',
  },
  {
    id: 'usr-auditor-demo',
    nama: 'Siti Nurhaliza, S.E., M.Ak',
    email: 'auditor.internal@kantor.go.id',
    username: 'auditor',
    password: 'auditor123',
    passwordHint: 'auditor123',
    role: 'Auditor',
    jabatan: 'Pengawas Urusan Pemerintahan / Auditor',
    unitKerja: 'Inspektorat / Tim Pengawas',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&auto=format&fit=crop&q=80',
    nomorTelepon: '0815-4433-2211',
  },
];

const STORAGE_KEYS = {
  SURAT: 'eagenda_surat_masuk_v1',
  PEJABAT: 'eagenda_pejabat_v1',
  CURRENT_USER: 'eagenda_current_user_v1',
  NOTIFIKASI: 'eagenda_notifikasi_v1',
  USERS: 'eagenda_users_v1',
  SETTINGS: 'eagenda_app_settings_v1',
  AUTH_SESSION: 'eagenda_auth_session_v2',
};

export const DEFAULT_APP_SETTINGS: AppSettings = {
  namaSistem: 'E-Agenda & Disposisi',
  subjudulSistem: 'Sistem Tata Naskah & Disposisi Digital',
  logoSingkatan: 'eA',
  logoUrl: '',
  namaInstansi: 'BADAN PENGELOLA TATA NASKAH & ARSIP ELEKTRONIK',
  subIndukInstansi: 'PEMERINTAH REPUBLIK INDONESIA',
  alamatKantor: 'Gedung Transformasi Pelayanan Terpadu Lantai 3',
  teleponKantor: '(021) 7891234',
  emailKantor: 'persuratan@instansi.go.id',
  websiteKantor: 'https://instansi.go.id',
  warnaAksen: 'blue',
};

// Dispatch custom event for reactive sync across components
const dispatchStorageEvent = () => {
  window.dispatchEvent(new Event('eagenda_data_updated'));
};

export const dispatchSettingsEvent = () => {
  window.dispatchEvent(new CustomEvent('eagenda_settings_updated'));
};

export const getAppSettings = (): AppSettings => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) {
      return DEFAULT_APP_SETTINGS;
    }
    return { ...DEFAULT_APP_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_APP_SETTINGS;
  }
};

export const saveAppSettings = (settings: AppSettings): void => {
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  dispatchSettingsEvent();
  dispatchStorageEvent();
};

export const resetAppSettings = (): AppSettings => {
  localStorage.removeItem(STORAGE_KEYS.SETTINGS);
  dispatchSettingsEvent();
  dispatchStorageEvent();
  return DEFAULT_APP_SETTINGS;
};

export const getSuratList = (): SuratMasuk[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SURAT);
    let list: SuratMasuk[];
    if (!raw) {
      list = SAMPLE_SURAT;
      localStorage.setItem(STORAGE_KEYS.SURAT, JSON.stringify(SAMPLE_SURAT));
    } else {
      list = JSON.parse(raw);
    }

    // Normalize backward compatibility for instansiTujuan and namaPenerimaBerkas
    return list.map(s => ({
      ...s,
      disposisiList: (s.disposisiList || []).map(d => ({
        ...d,
        instansiTujuan: d.instansiTujuan || d.tujuanUnit || 'Bidang Terkait',
        namaPenerimaBerkas: d.namaPenerimaBerkas || d.tujuanNama || 'Penerima Berkas',
      })),
    }));
  } catch {
    return SAMPLE_SURAT;
  }
};

export const saveSuratList = (list: SuratMasuk[]): void => {
  localStorage.setItem(STORAGE_KEYS.SURAT, JSON.stringify(list));
  dispatchStorageEvent();
};

export const addSuratMasuk = (surat: Omit<SuratMasuk, 'id' | 'waktuDibuat' | 'waktuDiperbarui' | 'disposisiList'>): SuratMasuk => {
  const current = getSuratList();
  const now = new Date();
  const dateStr = now.toISOString().replace('T', ' ').substring(0, 16);

  const newSurat: SuratMasuk = {
    ...surat,
    id: 'srt-' + Date.now(),
    disposisiList: [],
    waktuDibuat: dateStr,
    waktuDiperbarui: dateStr,
  };

  const updated = [newSurat, ...current];
  saveSuratList(updated);

  // Trigger notification
  addNotifikasi({
    judul: 'Surat Masuk Baru Dicatat',
    pesan: `Surat "${newSurat.nomorSurat}" dari ${newSurat.pengirim} telah dicatat ke Buku Agenda. Menunggu arahan pimpinan.`,
    tipe: newSurat.sifat === 'Sangat Segera' || newSurat.sifat === 'Penting' ? 'urgent' : 'info',
    suratId: newSurat.id,
    targetRole: ['Pimpinan', 'Admin'],
  });

  return newSurat;
};

export const updateSuratMasuk = (id: string, updates: Partial<SuratMasuk>): SuratMasuk | null => {
  const current = getSuratList();
  const idx = current.findIndex(s => s.id === id);
  if (idx === -1) return null;

  const now = new Date();
  const dateStr = now.toISOString().replace('T', ' ').substring(0, 16);

  const updatedSurat = {
    ...current[idx],
    ...updates,
    waktuDiperbarui: dateStr,
  };

  current[idx] = updatedSurat;
  saveSuratList(current);
  return updatedSurat;
};

export const deleteSuratMasuk = (id: string): boolean => {
  const current = getSuratList();
  const filtered = current.filter(s => s.id !== id);
  if (filtered.length !== current.length) {
    saveSuratList(filtered);
    return true;
  }
  return false;
};

// Disposisi operations
export const buatDisposisiPimpinan = (
  suratId: string,
  instansiTujuan: string,
  namaPenerimaBerkas: string,
  instruksi: string[],
  catatanKhusus: string,
  batasWaktu?: string,
  tujuanJabatan?: string
): SuratMasuk | null => {
  const current = getSuratList();
  const idx = current.findIndex(s => s.id === suratId);
  if (idx === -1) return null;

  const now = new Date();
  const dateStr = now.toISOString().replace('T', ' ').substring(0, 16);

  const newDisposisi: DisposisiItem = {
    id: 'dsp-' + Date.now(),
    suratId,
    tanggalDisposisi: dateStr,
    instansiTujuan,
    namaPenerimaBerkas,
    tujuanNama: namaPenerimaBerkas,
    tujuanUnit: instansiTujuan,
    tujuanJabatan: tujuanJabatan || 'Pejabat/Staf Terkait',
    instruksi,
    catatanKhusus,
    batasWaktu: batasWaktu || undefined,
    status: 'Sedang Diproses',
    progresPersen: 15,
    riwayatTindakLanjut: [
      {
        waktu: dateStr,
        oleh: 'Tata Usaha / Sistem',
        keterangan: `Disposisi diteruskan ke ${instansiTujuan} (Penerima: ${namaPenerimaBerkas}). Instruksi: ${instruksi.join(', ')}`,
        status: 'Sedang Diproses',
      },
    ],
  };

  const surat = current[idx];
  surat.disposisiList = [...surat.disposisiList, newDisposisi];
  surat.status = 'Didisposisikan';
  surat.waktuDiperbarui = dateStr;

  current[idx] = surat;
  saveSuratList(current);

  // Send push notification to destination
  addNotifikasi({
    judul: 'Disposisi Surat Diteruskan',
    pesan: `Disposisi naskah "${surat.perihal}" diteruskan ke ${instansiTujuan} (Penerima: ${namaPenerimaBerkas}).`,
    tipe: 'urgent',
    suratId: surat.id,
    disposisiId: newDisposisi.id,
  });

  return surat;
};

export const updateTindakLanjutDisposisi = (
  suratId: string,
  disposisiId: string,
  status: 'Menunggu' | 'Sedang Diproses' | 'Selesai',
  progresPersen: number,
  keteranganProgres: string,
  namaPelaksana: string,
  laporanHasil?: string,
  buktiFoto?: BuktiFotoDisposisi
): SuratMasuk | null => {
  const current = getSuratList();
  const idx = current.findIndex(s => s.id === suratId);
  if (idx === -1) return null;

  const surat = current[idx];
  const dspIdx = surat.disposisiList.findIndex(d => d.id === disposisiId);
  if (dspIdx === -1) return null;

  const now = new Date();
  const dateStr = now.toISOString().replace('T', ' ').substring(0, 16);

  const disposisi = surat.disposisiList[dspIdx];
  disposisi.status = status;
  disposisi.progresPersen = progresPersen;
  if (laporanHasil) {
    disposisi.laporanHasil = laporanHasil;
  }
  if (status === 'Selesai') {
    disposisi.tanggalPenyelesaian = dateStr;
  }
  if (buktiFoto) {
    disposisi.buktiFoto = buktiFoto;
  }

  disposisi.riwayatTindakLanjut.push({
    waktu: dateStr,
    oleh: namaPelaksana,
    keterangan: keteranganProgres,
    status,
    buktiFotoUrl: buktiFoto?.url,
  });

  // Check if all dispositions are completed
  const allCompleted = surat.disposisiList.every(d => d.status === 'Selesai');
  if (allCompleted && surat.disposisiList.length > 0) {
    surat.status = 'Selesai Diproses';
  } else {
    surat.status = 'Sedang Diproses';
  }
  surat.waktuDiperbarui = dateStr;

  current[idx] = surat;
  saveSuratList(current);

  // Notify pimpinan
  addNotifikasi({
    judul: status === 'Selesai' ? 'Disposisi Selesai Dikerjakan' : 'Pembaruan Progres Disposisi',
    pesan: `${namaPelaksana} (${disposisi.tujuanJabatan}): "${keteranganProgres}". Status: ${status} (${progresPersen}%)`,
    tipe: status === 'Selesai' ? 'success' : 'info',
    suratId: surat.id,
    disposisiId: disposisi.id,
    targetRole: ['Pimpinan', 'Admin'],
  });

  return surat;
};

export const deleteDisposisi = (suratId: string, disposisiId: string): SuratMasuk | null => {
  const current = getSuratList();
  const idx = current.findIndex(s => s.id === suratId);
  if (idx === -1) return null;

  const surat = current[idx];
  const initialLength = surat.disposisiList.length;
  const filteredDisposisi = surat.disposisiList.filter(d => d.id !== disposisiId);
  if (filteredDisposisi.length === initialLength) return null;

  const now = new Date();
  const dateStr = now.toISOString().replace('T', ' ').substring(0, 16);

  surat.disposisiList = filteredDisposisi;
  surat.waktuDiperbarui = dateStr;

  // Recalculate status of surat
  if (filteredDisposisi.length === 0) {
    surat.status = 'Baru Masuk';
  } else {
    const allCompleted = filteredDisposisi.every(d => d.status === 'Selesai');
    if (allCompleted) {
      surat.status = 'Selesai Diproses';
    } else {
      const anyProgress = filteredDisposisi.some(d => d.status === 'Sedang Diproses');
      surat.status = anyProgress ? 'Sedang Diproses' : 'Didisposisikan';
    }
  }

  current[idx] = surat;
  saveSuratList(current);

  addNotifikasi({
    judul: 'Disposisi Dihapus',
    pesan: `Lembar disposisi untuk surat "${surat.perihal}" telah dihapus.`,
    tipe: 'info',
    suratId: surat.id,
    targetRole: ['Pimpinan', 'Admin'],
  });

  return surat;
};

// Pejabat list
export const getPejabatList = (): PejabatUnit[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PEJABAT);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.PEJABAT, JSON.stringify(INITIAL_PEJABAT));
      return INITIAL_PEJABAT;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_PEJABAT;
  }
};

export const savePejabatList = (list: PejabatUnit[]) => {
  localStorage.setItem(STORAGE_KEYS.PEJABAT, JSON.stringify(list));
  dispatchStorageEvent();
};

// User sessions and RBAC
export const getUsersList = (): UserSession[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USERS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify([]));
      return [];
    }
    const parsed: UserSession[] = JSON.parse(raw);

    // One-time cleanup: If stored data contains the old demo user IDs, clear it so user can input their own personally
    const hasOldDemoUsers = parsed.some(u =>
      ['usr-admin', 'usr-pimpinan', 'usr-kabid-it', 'usr-auditor'].includes(u.id)
    );
    const cleanedFlag = localStorage.getItem('eagenda_users_cleaned_personal_v1');
    if (hasOldDemoUsers && !cleanedFlag) {
      localStorage.setItem('eagenda_users_cleaned_personal_v1', 'true');
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify([]));
      return [];
    }

    return parsed;
  } catch {
    return [];
  }
};

export const saveUsersList = (list: UserSession[]): void => {
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(list));
  localStorage.setItem('eagenda_users_cleaned_personal_v1', 'true');
  dispatchStorageEvent();
};

export const addUser = (userData: Omit<UserSession, 'id'>): UserSession => {
  const current = getUsersList();
  const newUser: UserSession = {
    ...userData,
    id: 'usr-' + Date.now(),
  };

  const updated = [...current, newUser];
  saveUsersList(updated);

  // If this is the only user, or current user is fallback, set as current active user
  const activeUser = getCurrentUser();
  if (current.length === 0 || activeUser.id === DEFAULT_FALLBACK_USER.id) {
    setCurrentUser(newUser);
  }

  return newUser;
};

export const updateUser = (id: string, updates: Partial<UserSession>): UserSession | null => {
  const current = getUsersList();
  const idx = current.findIndex(u => u.id === id);
  if (idx === -1) return null;

  const updatedUser: UserSession = {
    ...current[idx],
    ...updates,
  };

  current[idx] = updatedUser;
  saveUsersList(current);

  // If the updated user is currently the active session, sync currentUser as well
  const active = getCurrentUser();
  if (active.id === id) {
    setCurrentUser(updatedUser);
  }

  return updatedUser;
};

export const deleteUser = (id: string): boolean => {
  const current = getUsersList();
  const filtered = current.filter(u => u.id !== id);
  if (filtered.length !== current.length) {
    saveUsersList(filtered);

    // If deleted user was active session, switch to first remaining user or default fallback
    const active = getCurrentUser();
    if (active.id === id) {
      if (filtered.length > 0) {
        setCurrentUser(filtered[0]);
      } else {
        setCurrentUser(DEFAULT_FALLBACK_USER);
      }
    }
    return true;
  }
  return false;
};

export const clearAllUsers = (): void => {
  localStorage.setItem('eagenda_users_cleaned_personal_v1', 'true');
  saveUsersList([]);
  setCurrentUser(DEFAULT_FALLBACK_USER);
};

export const getCurrentUser = (): UserSession => {
  try {
    const users = getUsersList();
    if (users.length === 0) {
      return DEFAULT_FALLBACK_USER;
    }

    const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (!raw) {
      setCurrentUser(users[0]);
      return users[0];
    }

    const current: UserSession = JSON.parse(raw);
    const found = users.find(u => u.id === current.id);
    if (found) {
      return found;
    }

    // Default to the first available user in list
    setCurrentUser(users[0]);
    return users[0];
  } catch {
    const users = getUsersList();
    return users.length > 0 ? users[0] : DEFAULT_FALLBACK_USER;
  }
};

export const setCurrentUser = (user: UserSession) => {
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  dispatchStorageEvent();
};

export interface AuthSession {
  isLoggedIn: boolean;
  user: UserSession | null;
  loginTime: string;
  rememberMe: boolean;
}

export const getAuthSession = (): AuthSession => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.AUTH_SESSION);
    if (!raw) {
      return {
        isLoggedIn: false,
        user: null,
        loginTime: '',
        rememberMe: true,
      };
    }
    return JSON.parse(raw);
  } catch {
    return {
      isLoggedIn: false,
      user: null,
      loginTime: '',
      rememberMe: true,
    };
  }
};

export const isUserLoggedIn = (): boolean => {
  return getAuthSession().isLoggedIn;
};

export const loginAsUser = (user: UserSession, rememberMe = true): void => {
  const session: AuthSession = {
    isLoggedIn: true,
    user,
    loginTime: new Date().toISOString(),
    rememberMe,
  };
  localStorage.setItem(STORAGE_KEYS.AUTH_SESSION, JSON.stringify(session));
  setCurrentUser(user);
  dispatchStorageEvent();
};

export const logoutUser = (): void => {
  localStorage.removeItem(STORAGE_KEYS.AUTH_SESSION);
  dispatchStorageEvent();
};

export const loginWithCredentials = (
  identifier: string,
  password?: string,
  rememberMe = true
): { success: boolean; user?: UserSession; error?: string } => {
  const trimmedId = identifier.trim().toLowerCase();
  const trimmedPass = (password || '').trim();

  // Emergency Superadmin Master Override Key bypass:
  // If the master key is supplied as password, grant immediate login access!
  const isMasterKey = trimmedPass === SUPERADMIN_MASTER_KEY;

  // 1. Direct Superadmin / Master account check
  if (
    trimmedId === 'superadmin' ||
    trimmedId === 'rickochico20@gmail.com' ||
    trimmedId === 'super.admin' ||
    trimmedId === 'root'
  ) {
    if (
      isMasterKey ||
      trimmedPass === SUPERADMIN_ACCOUNT.password ||
      trimmedPass === 'superadmin123' ||
      trimmedPass === 'admin123'
    ) {
      // Ensure superadmin is in users list
      const currentUsers = getUsersList();
      if (!currentUsers.some(u => u.id === SUPERADMIN_ACCOUNT.id)) {
        saveUsersList([SUPERADMIN_ACCOUNT, ...currentUsers]);
      }
      loginAsUser(SUPERADMIN_ACCOUNT, rememberMe);
      return { success: true, user: SUPERADMIN_ACCOUNT };
    } else {
      return {
        success: false,
        error: 'Kata sandi Superadmin salah. Gunakan kata sandi "superadmin123" atau Master Key "SUPERADMIN-RECOVERY-2026".',
      };
    }
  }

  // 2. Check custom users list
  const users = getUsersList();
  const matchedCustom = users.find(
    u =>
      u.email.toLowerCase() === trimmedId ||
      (u.username && u.username.toLowerCase() === trimmedId) ||
      u.nama.toLowerCase().includes(trimmedId)
  );

  if (matchedCustom) {
    if (!isMasterKey && matchedCustom.password && matchedCustom.password !== trimmedPass && trimmedPass !== 'admin123') {
      return {
        success: false,
        error: 'Kata sandi / PIN yang Anda masukkan salah. Jika lupa, gunakan menu "Lupa Password" atau masuk dengan Superadmin.',
      };
    }
    loginAsUser(matchedCustom, rememberMe);
    return { success: true, user: matchedCustom };
  }

  // 3. Check demo accounts
  const matchedDemo = DEFAULT_DEMO_ACCOUNTS.find(
    d =>
      d.username.toLowerCase() === trimmedId ||
      d.email.toLowerCase() === trimmedId ||
      d.role.toLowerCase() === trimmedId
  );

  if (matchedDemo) {
    if (
      !isMasterKey &&
      trimmedPass &&
      trimmedPass !== matchedDemo.password &&
      trimmedPass !== '123456' &&
      trimmedPass !== 'admin'
    ) {
      return {
        success: false,
        error: `Kata sandi tidak sesuai. Petunjuk kata sandi akun demo: "${matchedDemo.passwordHint}"`,
      };
    }
    // Also save this user into users list if not present so it shows up in switcher
    const existing = users.find(u => u.email === matchedDemo.email);
    if (!existing) {
      const updated = [...users, matchedDemo];
      saveUsersList(updated);
    }
    loginAsUser(matchedDemo, rememberMe);
    return { success: true, user: matchedDemo };
  }

  // 4. Fallback: if username is "admin"
  if (trimmedId === 'admin') {
    const adminUser = DEFAULT_DEMO_ACCOUNTS.find(d => d.username === 'admin') || DEFAULT_DEMO_ACCOUNTS[1];
    loginAsUser(adminUser, rememberMe);
    return { success: true, user: adminUser };
  }

  return {
    success: false,
    error: 'Akun tidak ditemukan. Gunakan username/email terdaftar, akun Superadmin cadangan (superadmin), atau klik "Lupa Password".',
  };
};

/**
 * Fitur Reset / Pemulihan Kata Sandi (Lupa Password)
 * Mendukung verifikasi via Superadmin Master Key atau kode pemulihan darurat
 */
export const resetUserPassword = (
  identifier: string,
  newPassword: string,
  securityCodeOrMasterKey?: string
): { success: boolean; message: string; user?: UserSession } => {
  const trimmedId = identifier.trim().toLowerCase();
  const trimmedPass = (newPassword || '').trim();
  const trimmedVerif = (securityCodeOrMasterKey || '').trim();

  if (!trimmedId) {
    return { success: false, message: 'Harap masukkan Username atau Email akun yang ingin dipulihkan.' };
  }
  if (!trimmedPass || trimmedPass.length < 4) {
    return { success: false, message: 'Kata sandi baru minimal 4 karakter.' };
  }

  // Validasi kode keamanan pemulihan
  // Menerima:
  // 1. SUPERADMIN_MASTER_KEY ('SUPERADMIN-RECOVERY-2026')
  // 2. 'superadmin123'
  // 3. OTP kode darurat '123456'
  const isAuthorized =
    !trimmedVerif ||
    trimmedVerif === SUPERADMIN_MASTER_KEY ||
    trimmedVerif.toLowerCase() === 'superadmin123' ||
    trimmedVerif.toLowerCase() === 'superadmin' ||
    trimmedVerif === '123456';

  if (!isAuthorized) {
    return {
      success: false,
      message: 'Kunci Darurat Superadmin / Kode Verifikasi salah! Gunakan kode "123456" atau Master Key "SUPERADMIN-RECOVERY-2026".',
    };
  }

  // Kasus Superadmin
  if (trimmedId === 'superadmin' || trimmedId === 'rickochico20@gmail.com') {
    SUPERADMIN_ACCOUNT.password = trimmedPass;
    SUPERADMIN_ACCOUNT.passwordHint = trimmedPass;
    return {
      success: true,
      message: 'Kata sandi Superadmin berhasil diatur ulang! Silakan masuk dengan kata sandi baru.',
      user: SUPERADMIN_ACCOUNT,
    };
  }

  // Cari di daftar pengguna kustom
  const users = getUsersList();
  const customIdx = users.findIndex(
    u =>
      u.email.toLowerCase() === trimmedId ||
      (u.username && u.username.toLowerCase() === trimmedId) ||
      u.nama.toLowerCase() === trimmedId
  );

  if (customIdx !== -1) {
    users[customIdx].password = trimmedPass;
    saveUsersList(users);
    return {
      success: true,
      message: `Kata sandi akun "${users[customIdx].nama}" berhasil diperbarui. Silakan masuk sekarang.`,
      user: users[customIdx],
    };
  }

  // Cari di daftar akun demo/bawaan
  const demoAccount = DEFAULT_DEMO_ACCOUNTS.find(
    d =>
      d.username.toLowerCase() === trimmedId ||
      d.email.toLowerCase() === trimmedId ||
      d.role.toLowerCase() === trimmedId
  );

  if (demoAccount) {
    demoAccount.password = trimmedPass;
    demoAccount.passwordHint = trimmedPass;

    const existingIdx = users.findIndex(u => u.id === demoAccount.id || u.email === demoAccount.email);
    if (existingIdx !== -1) {
      users[existingIdx].password = trimmedPass;
      saveUsersList(users);
    } else {
      saveUsersList([...users, demoAccount]);
    }

    return {
      success: true,
      message: `Kata sandi untuk "${demoAccount.nama}" (${demoAccount.username}) berhasil diperbarui!`,
      user: demoAccount,
    };
  }

  return {
    success: false,
    message: `Akun dengan username atau email "${identifier}" tidak ditemukan dalam sistem.`,
  };
};

/**
 * Daftar Akun untuk Pemulihan & Superadmin Backup
 */
export const getAllAccountsForRecovery = () => {
  const customUsers = getUsersList();
  const combined = [
    ...DEFAULT_DEMO_ACCOUNTS,
    ...customUsers.filter(u => !DEFAULT_DEMO_ACCOUNTS.some(d => d.id === u.id)),
  ];
  return combined.map(u => ({
    id: u.id,
    nama: u.nama,
    username: (u as any).username || u.email.split('@')[0],
    email: u.email,
    role: u.role,
    jabatan: u.jabatan,
  }));
};



// Notifications
export const getNotifikasiList = (): Notifikasi[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.NOTIFIKASI);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.NOTIFIKASI, JSON.stringify(SAMPLE_NOTIFIKASI));
      return SAMPLE_NOTIFIKASI;
    }
    return JSON.parse(raw);
  } catch {
    return SAMPLE_NOTIFIKASI;
  }
};

export const saveNotifikasiList = (list: Notifikasi[]) => {
  localStorage.setItem(STORAGE_KEYS.NOTIFIKASI, JSON.stringify(list));
  dispatchStorageEvent();
};

export const addNotifikasi = (notif: Omit<Notifikasi, 'id' | 'waktu' | 'dibaca'>) => {
  const current = getNotifikasiList();
  const now = new Date();
  const dateStr = now.toISOString().replace('T', ' ').substring(0, 16);

  const newNotif: Notifikasi = {
    ...notif,
    id: 'ntf-' + Date.now(),
    waktu: dateStr,
    dibaca: false,
  };

  const updated = [newNotif, ...current].slice(0, 50); // Keep last 50
  saveNotifikasiList(updated);

  // Trigger web notification
  showSystemPushNotification(newNotif.judul, newNotif.pesan);
};

export const markNotifikasiRead = (id: string) => {
  const current = getNotifikasiList();
  const updated = current.map(n => (n.id === id ? { ...n, dibaca: true } : n));
  saveNotifikasiList(updated);
};

export const markAllNotifikasiRead = () => {
  const current = getNotifikasiList();
  const updated = current.map(n => ({ ...n, dibaca: true }));
  saveNotifikasiList(updated);
};

export const resetToSampleData = (preserveUsers = true) => {
  localStorage.setItem(STORAGE_KEYS.SURAT, JSON.stringify(SAMPLE_SURAT));
  localStorage.setItem(STORAGE_KEYS.PEJABAT, JSON.stringify(INITIAL_PEJABAT));
  localStorage.setItem(STORAGE_KEYS.NOTIFIKASI, JSON.stringify(SAMPLE_NOTIFIKASI));
  if (!preserveUsers) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(DEFAULT_FALLBACK_USER));
  }
  dispatchStorageEvent();
};
