# Perbaikan Penghapusan Surat & Disposisi, Penyederhanaan Menu Disposisi, dan Sinkronisasi Backup Google Spreadsheet

Implementasi perbaikan menyeluruh pada alur penghapusan surat masuk dan lembar disposisi menggunakan dialog konfirmasi in-app yang andal, penyederhanaan antarmuka disposisi dengan menghilangkan batas waktu/jatuh tempo agar fokus pada penerima berkas, serta penambahan fitur pencadangan (backup) otomatis dan manual yang tersinkronisasi langsung dengan Google Spreadsheet via Google OAuth.

## User Review & Critical Decisions

> [!IMPORTANT]
> **Keputusan Kunci yang Dikonfirmasi dari Sesi Klarifikasi:**
> - **Integrasi Google Spreadsheet**: Menggunakan otentikasi resmi Google OAuth (menambahkan scope `https://www.googleapis.com/auth/spreadsheets` ke otentikasi Google yang sudah ada) sehingga pengguna dapat menghubungkan akun Google langsung tanpa perlu menyusun script eksternal.
> - **Penyederhanaan Menu Disposisi**: Memusatkan lembar disposisi pada informasi esensial: **Instansi Tujuan**, **Nama Petugas/Penerima yang Melanjutkan Berkas**, **Instruksi Petunjuk**, dan **Catatan Arahan**. Menghilangkan kolom, input, dan hitung mundur "Batas Waktu Penyelesaian (Jatuh Tempo)" karena pengguna hanya memerlukan disposisi untuk mengetahui delegasi berkas.
> - **Mekanisme Sinkronisasi**: Sinkronisasi backup ke Google Spreadsheet berjalan otomatis saat surat ditambah atau dihapus, serta dilengkapi tombol manual *"Sinkronkan ke Spreadsheet Sekarang"* pada antarmuka.
> - **Solusi Masalah Fitur Hapus**: Mengganti pemanggilan `window.confirm()` bawaan browser (yang terblokir/tersupresi oleh sandbox iframe) dengan komponen modal konfirmasi interaktif in-app (`ConfirmDeleteModal`) yang 100% responsif dan teruji.

---

## 1. Overview & Core Concept

Aplikasi E-Agenda & Disposisi Surat Digital adalah sistem pengelolaan tata naskah dinas untuk pencatatan surat masuk, alur penyerahan lembar disposisi, dan bukti serah terima fisik. 

Pembaruan ini menyelesaikan 3 kebutuhan utama:
1. **Perbaikan Fitur Penghapusan**: Memastikan penghapusan surat masuk dan lembar disposisi berfungsi optimal di semua lingkungan peramban/iframe tanpa macet atau gagal eksekusi.
2. **Penyederhanaan Alur Disposisi**: Menghilangkan seluruh elemen tenggat waktu (*deadline / countdown days / overdue alert*) agar lembar disposisi ringkas, bersih, dan langsung memperlihatkan siapa petugas penerima berkas selanjutnya.
3. **Pencadangan Real-Time Google Spreadsheet**: Mengamankan data agenda surat dan disposisi ke Google Sheets milik pengguna. Setiap surat yang dicatat otomatis ditambahkan barisnya ke spreadsheet; ketika surat dihapus dari aplikasi, baris terkait di spreadsheet otomatis dihapus atau disinkronkan ulang secara rapi.

---

## 2. User Experience & Visual Design

### A. Alur Penghapusan Aman & Teruji (Tanpa `window.confirm`)
- **Aksi Hapus di Agenda Surat Masuk**: 
  - Pengguna mengklik ikon tempat sampah pada baris tabel surat atau tombol *"Hapus Surat"* di modal rincian.
  - Aplikasi memunculkan modal in-app `ConfirmDeleteModal` dengan aksen merah lembut, menampilkan rincian surat (Nomor Agenda, Nomor Surat, Pengirim, Perihal) dan peringatan bahwa tindakan bersifat permanen.
  - Mengklik tombol *"Ya, Hapus Sekarang"* mengeksekusi penghapusan di penyimpanan lokal, memicu sinkronisasi penghapusan ke Google Spreadsheet, dan menampilkan notifikasi sukses.
- **Aksi Hapus Lembar Disposisi**:
  - Disediakan tombol *"Hapus Disposisi"* pada setiap kartu disposisi dan baris tabel disposisi.
  - Modal konfirmasi menampilkan tujuan dan nama penerima berkas yang akan dihapus.
  - Setelah dihapus, status surat masuk otomatis dihitung ulang (kembali ke *Baru Masuk* jika seluruh disposisi dibatalkan).

### B. Penyederhanaan Antarmuka Disposisi
- **Formulir Terbit Disposisi (`DisposisiModal`)**:
  - Menghilangkan bidang input tanggal jatuh tempo / batas waktu.
  - Fokus visual langsung pada dua kotak utama: *Nama Instansi / Bidang yang Dituju* dan *Nama Petugas yang Melanjutkan Berkas* (dilengkapi pilihan cepat dari daftar pengguna/staf terdaftar), diikuti pilihan checklist instruksi pimpinan.
- **Papan Pelacakan Disposisi (`DisposisiBoard`)**:
  - Menghilangkan kartu peringatan "Terlambat / Sisa X Hari".
  - Kartu disposisi didesain lebih kompak, menampilkan nama petugas yang memegang berkas dengan lencana status proses yang tenang.
- **Lembar Cetak Disposisi (`LembarDisposisiPrint`)**:
  - Menghapus label batas waktu dan memfokuskan lembar naskah pada nama penerima serta petunjuk tindak lanjut resmi.

### C. Antarmuka Backup Google Spreadsheet
- **Status Koneksi di Header & Tab Backup**:
  - Lencana status koneksi Google Workspace yang mengindikasikan apakah Spreadsheet Backup aktif (`Tersambung` / `Belum Tersambung`).
  - Panel pengaturan integrasi Spreadsheet di tab *Ekspor & Cadangan*:
    - Tombol *"Hubungkan Google Spreadsheet"* (OAuth login).
    - Informasi URL spreadsheet yang sedang digunakan (bisa otomatis membuat spreadsheet baru bernama *"E-Agenda & Disposisi Backup"* atau menghubungkan ID Spreadsheet yang sudah ada).
    - Tombol *"Sinkronkan Sekarang"* dengan indikator animasi saat sinkronisasi berlangsung.
    - Riwayat waktu sinkronisasi terakhir (misal: *"Tersinkronisasi 2 menit yang lalu - 14 baris data"*).

---

## 3. Key Product Decisions & Trade-Offs

| Keputusan | Pendekatan Terpilih | Alasan & Keuntungan |
| :--- | :--- | :--- |
| **Penyebab Gagal Hapus** | Mengganti `window.confirm` dengan modal React in-app | Lingkungan iframe preview AI Studio memblokir pemanggilan modal dialog bawaan peramban (`window.confirm`/`window.alert`). Modal in-app menjamin aksi hapus selalu terpanggil 100%. |
| **Penyederhanaan Disposisi** | Menghapus field `batasWaktu` dari form, tampilan, dan filter | Pengguna secara spesifik menyatakan tidak memerlukan jatuh tempo dan hanya membutuhkan informasi siapa petugas yang melanjutkan berkas. |
| **Metode Google Sheets** | Google Sheets API v4 via Client-side Bearer Token | Menggunakan Google Auth yang sudah ada di aplikasi (Firebase Google Auth) dengan penambahan scope `spreadsheets`, tanpa memerlukan server backend terpisah atau redirect OAuth yang rentan CORS. |
| **Strategi Sinkronisasi Sheet** | Full-Sync Re-write & Append Pintar | Menjaga integritas data saat penghapusan: ketika surat dihapus dari aplikasi, spreadsheet disinkronkan ulang dari daftar agenda aktif sehingga baris surat yang terhapus tidak tertinggal. |

---

## 4. Technical Architecture & Data Strategy

### Diagram Alur Data & Komponen

```
┌────────────────────────────────────────────────────────────────────────┐
│                        User Interface (React)                          │
├─────────────────┬──────────────────┬─────────────────┬─────────────────┤
│ AgendaSuratList │  DisposisiBoard  │ SuratDetailView │ GoogleSheetTab  │
│  (Hapus Surat)  │ (Hapus Disposisi)│  (Rincian & TU) │ (Manual Sync)   │
└────────┬────────┴────────┬─────────┴────────┬────────┴────────┬────────┘
         │                 │                  │                 │
         ▼                 ▼                  ▼                 │
┌─────────────────────────────────────────────────────────────┐ │
│         ConfirmDeleteModal (In-App Dialog, Zero-Alert)      │ │
└──────────────────────────────┬──────────────────────────────┘ │
                               │                                │
                               ▼                                │
┌─────────────────────────────────────────────────────────────┐ │
│               Storage Service (storage.ts)                  │ │
│   - deleteSuratMasuk(id)                                    │ │
│   - deleteDisposisi(suratId, dispId)                        │ │
│   - syncWithGoogleSheets() [Auto Trigger on Mutation]       │ │
└──────────────────────────────┬──────────────────────────────┘ │
                               │                                │
                               ▼                                ▼
┌────────────────────────────────────────────────────────────────────────┐
│               Google Sheets Service (googleSheetsService.ts)          │
│   - Auth: GoogleAuthProvider with scope 'spreadsheets'                 │
│   - Create: Otomatis buat file "E-Agenda Surat Masuk Backup" di Drive  │
│   - Sync: Tulis Header Kolom & Seluruh Baris Surat + Disposisi         │
│   - Delete Sync: Memperbarui lembar kerja spreadsheet secara otomatis  │
└────────────────────────────────────────────────────────────────────────┘
```

### Format Kolom Spreadsheet Cadangan
Sheet *"Agenda Surat Masuk"* akan memuat kolom rapi:
1. `No. Agenda`
2. `No. Surat`
3. `Tanggal Surat`
4. `Tanggal Terima`
5. `Pengirim`
6. `Instansi Pengirim`
7. `Perihal`
8. `Sifat Surat`
9. `Status Surat`
10. `Instansi Tujuan Disposisi`
11. `Petugas Penerima Berkas`
12. `Instruksi Disposisi`
13. `Catatan Arahan`
14. `Status Disposisi`
15. `Waktu Pencatatan Terakhir`

---

## Rencana Tahapan Eksekusi Setelah Disetujui
1. **OAuth Scopes Setup**: Memanggil alat otentikasi Google Workspace untuk menambahkan scope Google Sheets (`https://www.googleapis.com/auth/spreadsheets`).
2. **Implementasi Komponen Konfirmasi Hapus**: Memasang `ConfirmDeleteModal` pada `AgendaSuratList`, `DisposisiBoard`, dan `SuratDetailModal`, menghapus semua dependensi `window.confirm`.
3. **Penyederhanaan Menu Disposisi**: Membersihkan semua referensi `batasWaktu`, hitung mundur hari, dan kolom jatuh tempo di `DisposisiModal`, `DisposisiBoard`, `SuratDetailModal`, dan `LembarDisposisiPrint`.
4. **Modul Sinkronisasi Google Sheets**: Membangun `src/services/googleSheetsService.ts` untuk pembuatan lembar kerja otomatis, pembaruan baris data saat tambah/edit agenda, dan sinkronisasi otomatis saat ada penghapusan.
5. **Panel Kontrol & Uji Coba**: Menambahkan widget kontrol sinkronisasi dan memverifikasi kompilasi kode bersih tanpa galat.
