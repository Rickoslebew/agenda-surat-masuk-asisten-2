import { SuratMasuk } from '../types';
import { getAccessToken } from './authGoogleDrive';

const STORAGE_KEYS = {
  SHEET_ID: 'eagenda_google_sheet_id_v1',
  SHEET_URL: 'eagenda_google_sheet_url_v1',
  LAST_SYNC: 'eagenda_google_sheet_last_sync_v1',
  ROW_COUNT: 'eagenda_google_sheet_row_count_v1',
};

export interface SheetBackupStatus {
  sheetId: string | null;
  sheetUrl: string | null;
  lastSyncTime: string | null;
  rowCount: number;
}

export const getStoredSheetInfo = (): SheetBackupStatus => {
  return {
    sheetId: localStorage.getItem(STORAGE_KEYS.SHEET_ID),
    sheetUrl: localStorage.getItem(STORAGE_KEYS.SHEET_URL),
    lastSyncTime: localStorage.getItem(STORAGE_KEYS.LAST_SYNC),
    rowCount: parseInt(localStorage.getItem(STORAGE_KEYS.ROW_COUNT) || '0', 10),
  };
};

export const setStoredSheetInfo = (id: string, url: string, rowCount: number) => {
  const now = new Date().toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  localStorage.setItem(STORAGE_KEYS.SHEET_ID, id);
  localStorage.setItem(STORAGE_KEYS.SHEET_URL, url);
  localStorage.setItem(STORAGE_KEYS.LAST_SYNC, now);
  localStorage.setItem(STORAGE_KEYS.ROW_COUNT, rowCount.toString());
  window.dispatchEvent(new Event('eagenda_data_updated'));
};

export const clearStoredSheetInfo = () => {
  localStorage.removeItem(STORAGE_KEYS.SHEET_ID);
  localStorage.removeItem(STORAGE_KEYS.SHEET_URL);
  localStorage.removeItem(STORAGE_KEYS.LAST_SYNC);
  localStorage.removeItem(STORAGE_KEYS.ROW_COUNT);
  window.dispatchEvent(new Event('eagenda_data_updated'));
};

/**
 * Ensures a Google Spreadsheet exists for backup.
 * If one was already created and saved, validates it. Otherwise creates a new spreadsheet.
 */
export const getOrCreateBackupSpreadsheet = async (accessToken: string): Promise<{ id: string; url: string }> => {
  const existingId = localStorage.getItem(STORAGE_KEYS.SHEET_ID);

  if (existingId) {
    try {
      const verifyRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${existingId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (verifyRes.ok) {
        const data = await verifyRes.json();
        const url = `https://docs.google.com/spreadsheets/d/${existingId}/edit`;
        return { id: existingId, url };
      }
    } catch {
      // Continue to create new if verification fails
    }
  }

  // Create new Spreadsheet
  const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: {
        title: 'E-Agenda & Disposisi Surat Masuk - Backup Cadangan',
      },
      sheets: [
        {
          properties: {
            title: 'Agenda Surat Masuk',
            gridProperties: {
              frozenRowCount: 1,
            },
          },
        },
      ],
    }),
  });

  if (!createRes.ok) {
    const errText = await createRes.text();
    throw new Error('Gagal membuat Google Spreadsheet baru: ' + errText);
  }

  const createdData = await createRes.json();
  const id = createdData.spreadsheetId;
  const url = createdData.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${id}/edit`;

  return { id, url };
};

/**
 * Synchronizes the entire active letter agenda & dispositions to Google Sheets.
 * If a letter is deleted, re-writing the active list guarantees that the deleted letter
 * is completely removed from the Google Sheet as requested!
 */
export const syncAllSuratToGoogleSheets = async (
  suratList: SuratMasuk[]
): Promise<{ success: boolean; url?: string; count?: number; error?: string }> => {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) {
      return {
        success: false,
        error: 'Google Drive / Spreadsheet belum terhubung. Silakan hubungkan akun Google Anda di bagian atas.',
      };
    }

    const { id: sheetId, url: sheetUrl } = await getOrCreateBackupSpreadsheet(accessToken);

    // Headers format
    const headers = [
      'No. Agenda',
      'No. Surat Resmi',
      'Tanggal Surat',
      'Tanggal Terima',
      'Pengirim',
      'Instansi Pengirim',
      'Perihal / Hal',
      'Ringkasan Isi Surat',
      'Sifat Surat',
      'Kategori',
      'Status Surat',
      'Instansi Tujuan Disposisi',
      'Petugas Penerima Berkas',
      'Instruksi Petunjuk Pimpinan',
      'Catatan Khusus Disposisi',
      'Progres Tindak Lanjut',
      'Bukti Fisik',
      'Waktu Catat Terakhir',
    ];

    // Build rows from current active suratList
    const rows: string[][] = [headers];

    suratList.forEach(s => {
      if (s.disposisiList.length === 0) {
        rows.push([
          s.nomorAgenda,
          s.nomorSurat,
          s.tanggalSurat,
          s.tanggalTerima,
          s.pengirim,
          s.instansiPengirim || '-',
          s.perihal,
          s.ringkasan || '-',
          s.sifat,
          s.kategori,
          s.status,
          '(Belum didisposisikan)',
          '(Belum ada penerima berkas)',
          '-',
          '-',
          '-',
          s.buktiFisik ? `Ada (${s.buktiFisik.statusVerifikasi})` : 'Belum Ada',
          s.waktuDiperbarui || s.waktuDibuat || '-',
        ]);
      } else {
        s.disposisiList.forEach((disp, dIdx) => {
          rows.push([
            dIdx === 0 ? s.nomorAgenda : `${s.nomorAgenda} (Disp #${dIdx + 1})`,
            s.nomorSurat,
            s.tanggalSurat,
            s.tanggalTerima,
            s.pengirim,
            s.instansiPengirim || '-',
            s.perihal,
            s.ringkasan || '-',
            s.sifat,
            s.kategori,
            s.status,
            disp.instansiTujuan || disp.tujuanUnit || 'Instansi Terkait',
            disp.namaPenerimaBerkas || disp.tujuanNama || 'Penerima Berkas',
            disp.instruksi?.join('; ') || '-',
            disp.catatanKhusus || '-',
            disp.buktiFoto
              ? `Ada Foto Penerima (${disp.buktiFoto.namaPenerima || disp.namaPenerimaBerkas})`
              : s.buktiFisik
              ? `Ada Bukti Fisik TU (${s.buktiFisik.statusVerifikasi})`
              : 'Belum Ada',
            s.waktuDiperbarui || s.waktuDibuat || '-',
          ]);
        });
      }
    });

    // 1. Clear existing values to prevent leftover rows from deleted items
    await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Agenda%20Surat%20Masuk!A1:R1000:clear`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    // 2. Put new fresh data
    const updateRes = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Agenda%20Surat%20Masuk!A1?valueInputOption=USER_ENTERED`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          range: `Agenda Surat Masuk!A1:R${rows.length}`,
          majorDimension: 'ROWS',
          values: rows,
        }),
      }
    );

    if (!updateRes.ok) {
      const errText = await updateRes.text();
      throw new Error('Gagal menulis data ke Google Spreadsheet: ' + errText);
    }

    // Save info
    setStoredSheetInfo(sheetId, sheetUrl, suratList.length);

    return {
      success: true,
      url: sheetUrl,
      count: suratList.length,
    };
  } catch (error: any) {
    console.error('Error syncing with Google Sheets:', error);
    return {
      success: false,
      error: error.message || 'Terjadi kesalahan saat menyinkronkan ke Google Spreadsheet',
    };
  }
};
