import { SuratMasuk, AppSettings, PejabatUnit, UserSession } from '../types';
import {
  getSuratList,
  saveSuratList,
  getAppSettings,
  saveAppSettings,
  getPejabatList,
  savePejabatList,
  getUsersList,
  saveUsersList,
} from './storage';
import { getAccessToken, clearAccessToken } from './authGoogleDrive';
import { syncAllSuratToGoogleSheets, getStoredSheetInfo } from './googleSheetsService';
import {
  getOrCreateAppFolder,
  moveFileToAppFolder,
  organizeAllAppFilesInFolder,
} from './driveFolderService';

const CLOUD_SYNC_FILENAME = 'eagenda_cloud_database.json';
const STORAGE_KEYS = {
  DRIVE_FILE_ID: 'eagenda_drive_db_file_id_v1',
  LAST_SYNC_TIME: 'eagenda_drive_last_sync_time_v1',
  SYNC_STATUS: 'eagenda_drive_sync_status_v1',
};

export interface CloudSyncDatabase {
  version: string;
  lastUpdated: string;
  updatedBy: string;
  userEmail: string;
  suratList: SuratMasuk[];
  settings: AppSettings;
  pejabatList: PejabatUnit[];
  usersList: UserSession[];
}

export interface CloudSyncState {
  status: 'idle' | 'syncing' | 'synced' | 'error' | 'offline';
  lastSyncTime: string | null;
  fileId: string | null;
  accountEmail: string | null;
  message: string;
}

let syncTimeout: any = null;

export const dispatchSyncEvent = () => {
  window.dispatchEvent(new CustomEvent('eagenda_cloud_sync_updated'));
};

export const getCloudSyncState = (): CloudSyncState => {
  const lastSyncTime = localStorage.getItem(STORAGE_KEYS.LAST_SYNC_TIME);
  const fileId = localStorage.getItem(STORAGE_KEYS.DRIVE_FILE_ID);
  const rawStatus = localStorage.getItem(STORAGE_KEYS.SYNC_STATUS);
  const accountEmail = localStorage.getItem('eagenda_google_user_email');

  return {
    status: (rawStatus as any) || 'idle',
    lastSyncTime: lastSyncTime || null,
    fileId: fileId || null,
    accountEmail: accountEmail || null,
    message: lastSyncTime
      ? `Tersinkron otomatis ke Google Cloud (${lastSyncTime})`
      : 'Siap sinkronisasi ke Google Cloud',
  };
};

const setCloudSyncState = (status: CloudSyncState['status'], message: string, fileId?: string) => {
  const now = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  localStorage.setItem(STORAGE_KEYS.SYNC_STATUS, status);
  if (status === 'synced') {
    localStorage.setItem(STORAGE_KEYS.LAST_SYNC_TIME, now);
  }
  if (fileId) {
    localStorage.setItem(STORAGE_KEYS.DRIVE_FILE_ID, fileId);
  }
  dispatchSyncEvent();
};

/**
 * Searches user's Google Drive for existing eagenda_cloud_database.json
 */
export const findCloudDatabaseFile = async (
  token: string
): Promise<{ id: string; modifiedTime?: string } | null> => {
  const query = encodeURIComponent(`name='${CLOUD_SYNC_FILENAME}' and trashed=false`);
  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,modifiedTime,parents)&spaces=drive`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (response.status === 401) {
    clearAccessToken();
    throw new Error('Sesi otorisasi Google telah berakhir. Silakan hubungkan kembali akun Google Anda.');
  }

  if (!response.ok) {
    throw new Error(`Gagal mencari berkas sinkronisasi di Google Drive (${response.status})`);
  }

  const data = await response.json();
  if (data.files && data.files.length > 0) {
    const file = data.files[0];
    // Ensure file is organized into dedicated app folder
    getOrCreateAppFolder(token)
      .then(folder => {
        if (!file.parents || !file.parents.includes(folder.id)) {
          moveFileToAppFolder(token, file.id, folder.id);
        }
      })
      .catch(console.warn);

    return { id: file.id, modifiedTime: file.modifiedTime };
  }
  return null;
};

/**
 * Pulls latest database from Google Drive into application storage
 * Called automatically when user signs in with Google on any computer
 */
export const pullDataFromGoogleCloud = async (
  token: string
): Promise<{ success: boolean; data?: CloudSyncDatabase; error?: string; isNewFile?: boolean }> => {
  try {
    setCloudSyncState('syncing', 'Menghubungkan & mengunduh data dari Google Drive...');

    // 1. Check if cloud database file exists in user's Google Drive
    const foundFile = await findCloudDatabaseFile(token);

    if (!foundFile) {
      // First time login on this Google account or new drive
      // Create initial cloud database from local default data
      const currentSurat = getSuratList();
      const currentSettings = getAppSettings();
      const currentPejabat = getPejabatList();
      const currentUsers = getUsersList();

      const userEmail = localStorage.getItem('eagenda_google_user_email') || 'rickochico20@gmail.com';
      const initialDb: CloudSyncDatabase = {
        version: '2.4',
        lastUpdated: new Date().toISOString(),
        updatedBy: userEmail,
        userEmail,
        suratList: currentSurat,
        settings: currentSettings,
        pejabatList: currentPejabat,
        usersList: currentUsers,
      };

      const newFileId = await uploadNewCloudDatabase(token, initialDb);
      setCloudSyncState('synced', 'Database awan Google Drive baru berhasil dibuat.', newFileId);
      
      // Also sync to Google Sheets
      syncAllSuratToGoogleSheets(currentSurat).catch(console.warn);

      return { success: true, data: initialDb, isNewFile: true };
    }

    // 2. File exists in Google Drive! Download it!
    const fileId = foundFile.id;
    const downloadRes = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!downloadRes.ok) {
      throw new Error(`Gagal mengunduh isi data dari Google Drive (${downloadRes.status})`);
    }

    const cloudData: CloudSyncDatabase = await downloadRes.json();

    // 3. Hydrate local storage with data from Google Drive
    if (cloudData.suratList && Array.isArray(cloudData.suratList)) {
      saveSuratList(cloudData.suratList);
    }
    if (cloudData.settings) {
      saveAppSettings(cloudData.settings);
    }
    if (cloudData.pejabatList && Array.isArray(cloudData.pejabatList)) {
      savePejabatList(cloudData.pejabatList);
    }
    if (cloudData.usersList && Array.isArray(cloudData.usersList)) {
      saveUsersList(cloudData.usersList);
    }

    setCloudSyncState('synced', 'Data surat & disposisi berhasil disinkronkan dari Google Drive.', fileId);

    // Also background sync to Sheets to make sure sheet is up to date
    if (cloudData.suratList) {
      syncAllSuratToGoogleSheets(cloudData.suratList).catch(console.warn);
    }

    return { success: true, data: cloudData };
  } catch (error: any) {
    if (error.message?.includes('401') || error.message?.includes('UNAUTHENTICATED') || error.message?.includes('invalid_grant')) {
      clearAccessToken();
      setCloudSyncState('offline', 'Sesi Google telah berakhir. Silakan klik "Hubungkan Akun Google".');
      return { success: false, error: 'Sesi Google telah berakhir' };
    }
    console.error('Error in pullDataFromGoogleCloud:', error);
    setCloudSyncState('error', error.message || 'Gagal menyinkronkan data Google Drive');
    return { success: false, error: error.message };
  }
};

/**
 * Uploads a fresh new database JSON to Google Drive
 */
const uploadNewCloudDatabase = async (token: string, dbData: CloudSyncDatabase): Promise<string> => {
  let folderId: string | undefined;
  try {
    const folder = await getOrCreateAppFolder(token);
    folderId = folder.id;
  } catch (err) {
    console.warn('Could not resolve dedicated folder for new DB:', err);
  }

  const metadata: any = {
    name: CLOUD_SYNC_FILENAME,
    mimeType: 'application/json',
    description: 'Database Master E-Agenda & Disposisi Surat Digital (Auto Sync)',
  };
  if (folderId) {
    metadata.parents = [folderId];
  }

  const form = new FormData();
  form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
  form.append('file', new Blob([JSON.stringify(dbData, null, 2)], { type: 'application/json' }));

  const res = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name',
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    }
  );

  if (!res.ok) {
    if (res.status === 401) {
      clearAccessToken();
      throw new Error('Sesi otorisasi Google telah berakhir (401).');
    }
    const errText = await res.text();
    throw new Error('Gagal mengunggah berkas database ke Google Drive: ' + errText);
  }

  const result = await res.json();
  return result.id;
};

/**
 * Pushes latest local changes up to Google Drive & Google Sheets
 */
export const pushDataToGoogleCloud = async (): Promise<{ success: boolean; error?: string }> => {
  try {
    const token = await getAccessToken();
    if (!token) {
      return { success: false, error: 'Belum terhubung ke Akun Google' };
    }

    setCloudSyncState('syncing', 'Menyimpan perubahan ke Google Cloud Drive...');

    let fileId = localStorage.getItem(STORAGE_KEYS.DRIVE_FILE_ID);
    if (!fileId) {
      const found = await findCloudDatabaseFile(token);
      if (found) {
        fileId = found.id;
        localStorage.setItem(STORAGE_KEYS.DRIVE_FILE_ID, fileId);
      }
    }

    const currentSurat = getSuratList();
    const currentSettings = getAppSettings();
    const currentPejabat = getPejabatList();
    const currentUsers = getUsersList();
    const userEmail = localStorage.getItem('eagenda_google_user_email') || 'rickochico20@gmail.com';

    const dbPayload: CloudSyncDatabase = {
      version: '2.4',
      lastUpdated: new Date().toISOString(),
      updatedBy: userEmail,
      userEmail,
      suratList: currentSurat,
      settings: currentSettings,
      pejabatList: currentPejabat,
      usersList: currentUsers,
    };

    if (!fileId) {
      // Create new file
      fileId = await uploadNewCloudDatabase(token, dbPayload);
    } else {
      // Update existing file
      const updateRes = await fetch(
        `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(dbPayload, null, 2),
        }
      );

      if (!updateRes.ok) {
        if (updateRes.status === 401) {
          clearAccessToken();
          throw new Error('Sesi otorisasi Google telah berakhir (401).');
        }
        if (updateRes.status === 404) {
          // File was deleted or moved, create fresh
          fileId = await uploadNewCloudDatabase(token, dbPayload);
        } else {
          const errText = await updateRes.text();
          throw new Error('Gagal memperbarui berkas di Google Drive: ' + errText);
        }
      }
    }

    setCloudSyncState('synced', 'Seluruh data tersimpan aman di Google Drive & Spreadsheet.', fileId);

    // Also sync to Google Sheets
    syncAllSuratToGoogleSheets(currentSurat).catch(err => {
      console.warn('Sheets background sync error:', err);
    });

    return { success: true };
  } catch (error: any) {
    if (error.message?.includes('401') || error.message?.includes('UNAUTHENTICATED') || error.message?.includes('invalid_grant')) {
      clearAccessToken();
      setCloudSyncState('offline', 'Sesi Google telah berakhir. Silakan klik "Hubungkan Akun Google".');
      return { success: false, error: 'Sesi Google telah berakhir' };
    }
    console.error('Error in pushDataToGoogleCloud:', error);
    setCloudSyncState('error', error.message || 'Gagal menyimpan ke Google Cloud');
    return { success: false, error: error.message };
  }
};

/**
 * Triggers a debounced auto-sync whenever any letter or disposition changes
 */
export const triggerDebouncedCloudSync = () => {
  if (syncTimeout) clearTimeout(syncTimeout);
  syncTimeout = setTimeout(() => {
    pushDataToGoogleCloud().catch(err => {
      console.warn('Auto cloud sync background notice:', err);
    });
  }, 1000);
};
