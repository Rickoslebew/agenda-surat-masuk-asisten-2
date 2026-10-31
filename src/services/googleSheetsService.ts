import { SuratMasuk } from '../types';
import { getAccessToken, clearAccessToken } from './authGoogleDrive';

export const BACKUP_SPREADSHEET_TITLE = 'E-Agenda & Disposisi Surat Masuk - Backup Cadangan';

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

// In-flight promise lock to prevent concurrent spreadsheet creations
let activeResolvingSpreadsheetPromise: Promise<{ id: string; url: string }> | null = null;

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
 * Searches user's Google Drive for any existing spreadsheets with the master backup title.
 * Used to ensure we NEVER create duplicate files and always reuse the existing 1 master file.
 */
export const findExistingBackupSpreadsheetsInDrive = async (
  accessToken: string
): Promise<Array<{ id: string; name: string; url: string; createdTime?: string; parents?: string[] }>> => {
  try {
    const query = encodeURIComponent(
      `name='${BACKUP_SPREADSHEET_TITLE}' and mimeType='application/vnd.google-apps.spreadsheet' and trashed=false`
    );
    const res = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,webViewLink,createdTime,parents)&orderBy=createdTime desc&spaces=drive`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return (data.files || []).map((f: any) => ({
      id: f.id,
      name: f.name,
      url: f.webViewLink || `https://docs.google.com/spreadsheets/d/${f.id}/edit`,
      createdTime: f.createdTime,
      parents: f.parents,
    }));
  } catch (err) {
    console.warn('Error searching existing spreadsheets in Drive:', err);
    return [];
  }
};

/**
 * Ensures exactly ONE master Google Spreadsheet exists for backup.
 * 
 * Flow:
 * 1. Checks cached Sheet ID in localStorage. If valid, reuses it.
 * 2. If not found in localStorage, queries user's Google Drive for an existing spreadsheet named:
 *    "E-Agenda & Disposisi Surat Masuk - Backup Cadangan".
 *    If found in Google Drive, REUSES THAT EXACT FILE and caches it.
 * 3. Only if NO spreadsheet exists at all in Google Drive, creates a new one once.
 * 4. Concurrent calls are locked to a single promise so multiple syncs NEVER create duplicates.
 */
export const getOrCreateBackupSpreadsheet = async (
  accessToken: string
): Promise<{ id: string; url: string }> => {
  // If already resolving or verifying, share the active promise to avoid duplicate creation
  if (activeResolvingSpreadsheetPromise) {
    return activeResolvingSpreadsheetPromise;
  }

  activeResolvingSpreadsheetPromise = (async () => {
    try {
      // 1. Verify cached Sheet ID in localStorage
      const existingId = localStorage.getItem(STORAGE_KEYS.SHEET_ID);
      if (existingId) {
        try {
          const verifyRes = await fetch(
            `https://sheets.googleapis.com/v4/spreadsheets/${existingId}?fields=spreadsheetId,spreadsheetUrl,properties/title`,
            {
              headers: { Authorization: `Bearer ${accessToken}` },
            }
          );
          if (verifyRes.ok) {
            const data = await verifyRes.json();
            const url =
              data.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${existingId}/edit`;

            localStorage.setItem(STORAGE_KEYS.SHEET_ID, existingId);
            localStorage.setItem(STORAGE_KEYS.SHEET_URL, url);

            // Move to dedicated app folder asynchronously if not there
            import('./driveFolderService')
              .then(({ getOrCreateAppFolder, moveFileToAppFolder }) => {
                getOrCreateAppFolder(accessToken)
                  .then(folder => moveFileToAppFolder(accessToken, existingId, folder.id))
                  .catch(console.warn);
              })
              .catch(console.warn);

            return { id: existingId, url };
          } else if (verifyRes.status === 401) {
            clearAccessToken();
            throw new Error(
              'Sesi otorisasi Google telah berakhir (401). Silakan hubungkan kembali akun Google.'
            );
          }
        } catch (e: any) {
          if (e.message?.includes('401') || e.message?.includes('UNAUTHENTICATED')) {
            throw e;
          }
          console.warn('Verification of cached spreadsheet failed, searching Drive for master file...', e);
        }
      }

      // 2. CRITICAL: Search user's Google Drive before creating any new file!
      // This prevents spamming new spreadsheets when opening the app on a new device, after logout, or in incognito.
      const existingInDrive = await findExistingBackupSpreadsheetsInDrive(accessToken);
      if (existingInDrive.length > 0) {
        // Reuse the primary existing file!
        const primary = existingInDrive[0];
        localStorage.setItem(STORAGE_KEYS.SHEET_ID, primary.id);
        localStorage.setItem(STORAGE_KEYS.SHEET_URL, primary.url);
        window.dispatchEvent(new Event('eagenda_data_updated'));

        // Ensure file is in dedicated folder
        try {
          const { getOrCreateAppFolder, moveFileToAppFolder } = await import('./driveFolderService');
          const folder = await getOrCreateAppFolder(accessToken);
          if (!primary.parents || !primary.parents.includes(folder.id)) {
            await moveFileToAppFolder(accessToken, primary.id, folder.id);
          }
        } catch (err) {
          console.warn('Could not move existing spreadsheet to folder:', err);
        }

        return { id: primary.id, url: primary.url };
      }

      // 3. ONLY if NO spreadsheet exists anywhere in the user's Google Drive, create one master file!
      const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          properties: {
            title: BACKUP_SPREADSHEET_TITLE,
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
        if (createRes.status === 401) {
          clearAccessToken();
          throw new Error(
            'Sesi otorisasi Google telah berakhir (401). Silakan hubungkan kembali akun Google.'
          );
        }
        const errText = await createRes.text();
        throw new Error('Gagal membuat Google Spreadsheet baru: ' + errText);
      }

      const createdData = await createRes.json();
      const id = createdData.spreadsheetId;
      const url = createdData.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${id}/edit`;

      localStorage.setItem(STORAGE_KEYS.SHEET_ID, id);
      localStorage.setItem(STORAGE_KEYS.SHEET_URL, url);
      window.dispatchEvent(new Event('eagenda_data_updated'));

      // Move into dedicated folder
      try {
        const { getOrCreateAppFolder, moveFileToAppFolder } = await import('./driveFolderService');
        const folder = await getOrCreateAppFolder(accessToken);
        await moveFileToAppFolder(accessToken, id, folder.id);
      } catch (err) {
        console.warn('Could not move new spreadsheet to dedicated folder:', err);
      }

      return { id, url };
    } finally {
      activeResolvingSpreadsheetPromise = null;
    }
  })();

  return activeResolvingSpreadsheetPromise;
};

/**
 * Automatically cleans up duplicate spreadsheet files in Google Drive from past backups,
 * keeping only 1 master active spreadsheet file.
 */
export const cleanupDuplicateSpreadsheetsInDrive = async (): Promise<{
  success: boolean;
  keptId: string | null;
  removedCount: number;
  message: string;
}> => {
  const token = await getAccessToken();
  if (!token) {
    return {
      success: false,
      keptId: null,
      removedCount: 0,
      message: 'Belum terhubung ke Akun Google Drive.',
    };
  }

  const existingFiles = await findExistingBackupSpreadsheetsInDrive(token);
  if (existingFiles.length <= 1) {
    return {
      success: true,
      keptId: existingFiles[0]?.id || null,
      removedCount: 0,
      message: 'Tidak ada file duplikat. Google Drive sudah bersih (hanya ada 1 file master spreadsheet).',
    };
  }

  // Identify master file to keep (prioritize currently cached ID, else latest file)
  const currentActiveId = localStorage.getItem(STORAGE_KEYS.SHEET_ID);
  const primaryIndex = existingFiles.findIndex(f => f.id === currentActiveId);
  const masterFile = primaryIndex >= 0 ? existingFiles[primaryIndex] : existingFiles[0];

  let removedCount = 0;
  for (const file of existingFiles) {
    if (file.id !== masterFile.id) {
      try {
        const trashRes = await fetch(`https://www.googleapis.com/drive/v3/files/${file.id}`, {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ trashed: true }),
        });
        if (trashRes.ok) {
          removedCount++;
        }
      } catch (e) {
        console.warn(`Gagal memindahkan file duplikat ${file.id} ke tempat sampah:`, e);
      }
    }
  }

  localStorage.setItem(STORAGE_KEYS.SHEET_ID, masterFile.id);
  localStorage.setItem(STORAGE_KEYS.SHEET_URL, masterFile.url);
  window.dispatchEvent(new Event('eagenda_data_updated'));

  return {
    success: true,
    keptId: masterFile.id,
    removedCount,
    message: `Berhasil membersihkan ${removedCount} file spreadsheet duplikat dari Google Drive. Kini hanya tersisa 1 file master aktif.`,
  };
};

/**
 * Manually connect a specific Google Spreadsheet ID or URL.
 */
export const connectCustomSpreadsheet = async (
  sheetIdOrUrl: string
): Promise<{ success: boolean; url?: string; error?: string }> => {
  const token = await getAccessToken();
  if (!token) {
    return { success: false, error: 'Belum terhubung ke Akun Google' };
  }

  let extractedId = sheetIdOrUrl.trim();
  const match = extractedId.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (match) {
    extractedId = match[1];
  }

  try {
    const res = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${extractedId}?fields=spreadsheetId,spreadsheetUrl,properties/title`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    if (!res.ok) {
      return { success: false, error: 'Spreadsheet tidak ditemukan atau Anda tidak memiliki akses izin ke file tersebut.' };
    }
    const data = await res.json();
    const url = data.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${extractedId}/edit`;
    localStorage.setItem(STORAGE_KEYS.SHEET_ID, extractedId);
    localStorage.setItem(STORAGE_KEYS.SHEET_URL, url);
    window.dispatchEvent(new Event('eagenda_data_updated'));

    return { success: true, url };
  } catch (err: any) {
    return { success: false, error: err.message || 'Gagal menghubungkan spreadsheet' };
  }
};

/**
 * Synchronizes the entire active letter agenda & dispositions into the single master Google Sheet.
 * Always overwrites and updates the SAME 1 file. Never creates duplicates.
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

    // Resolves the single master spreadsheet (either from cache or Drive lookup)
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

    // Helper to calculate column letter from 1-indexed column count
    const getColumnLetter = (colIndex: number): string => {
      let temp = colIndex;
      let letter = '';
      while (temp > 0) {
        const mod = (temp - 1) % 26;
        letter = String.fromCharCode(65 + mod) + letter;
        temp = Math.floor((temp - mod) / 26);
      }
      return letter;
    };

    const totalCols = headers.length;
    const endColLetter = getColumnLetter(totalCols);
    const totalRows = Math.max(rows.length, 1);
    const targetRange = `Agenda Surat Masuk!A1:${endColLetter}${totalRows}`;

    // 1. Clear existing values in sheet to remove stale data or deleted items
    await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent('Agenda Surat Masuk!A1:Z5000')}:clear`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    // 2. Put new fresh data into the EXACT same master spreadsheet
    const updateRes = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(targetRange)}?valueInputOption=USER_ENTERED`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          range: targetRange,
          majorDimension: 'ROWS',
          values: rows,
        }),
      }
    );

    if (!updateRes.ok) {
      if (updateRes.status === 401) {
        clearAccessToken();
        throw new Error('Sesi otorisasi Google telah berakhir (401).');
      }
      const errText = await updateRes.text();
      throw new Error('Gagal memperbarui data di Google Spreadsheet: ' + errText);
    }

    // Save sync status
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
