import { getAccessToken } from './authGoogleDrive';

export const APP_DRIVE_FOLDER_NAME = 'E-Agenda & Disposisi Surat Digital';

const STORAGE_KEYS = {
  FOLDER_ID: 'eagenda_google_drive_folder_id_v1',
  FOLDER_URL: 'eagenda_google_drive_folder_url_v1',
};

export interface AppDriveFolderInfo {
  id: string;
  name: string;
  webViewLink: string;
}

export const getStoredAppFolderInfo = (): { folderId: string | null; folderUrl: string | null } => {
  return {
    folderId: localStorage.getItem(STORAGE_KEYS.FOLDER_ID),
    folderUrl: localStorage.getItem(STORAGE_KEYS.FOLDER_URL),
  };
};

/**
 * Searches for or creates a single dedicated folder in Google Drive for all application data:
 * "E-Agenda & Disposisi Surat Digital"
 */
export const getOrCreateAppFolder = async (token?: string): Promise<AppDriveFolderInfo> => {
  const activeToken = token || (await getAccessToken());
  if (!activeToken) {
    throw new Error('Belum terhubung ke Akun Google Drive.');
  }

  // 1. Check cached folder ID
  const cachedId = localStorage.getItem(STORAGE_KEYS.FOLDER_ID);
  if (cachedId) {
    try {
      const verifyRes = await fetch(
        `https://www.googleapis.com/drive/v3/files/${cachedId}?fields=id,name,trashed,webViewLink`,
        {
          headers: { Authorization: `Bearer ${activeToken}` },
        }
      );
      if (verifyRes.ok) {
        const folderData = await verifyRes.json();
        if (!folderData.trashed) {
          const webViewLink =
            folderData.webViewLink || `https://drive.google.com/drive/folders/${cachedId}`;
          localStorage.setItem(STORAGE_KEYS.FOLDER_URL, webViewLink);
          return {
            id: cachedId,
            name: folderData.name || APP_DRIVE_FOLDER_NAME,
            webViewLink,
          };
        }
      }
    } catch {
      // Continue to search or create
    }
  }

  // 2. Search Drive for existing folder with our application name
  const query = encodeURIComponent(
    `name='${APP_DRIVE_FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false`
  );
  const searchRes = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,webViewLink)&spaces=drive`,
    {
      headers: { Authorization: `Bearer ${activeToken}` },
    }
  );

  if (searchRes.ok) {
    const searchData = await searchRes.json();
    if (searchData.files && searchData.files.length > 0) {
      const found = searchData.files[0];
      const webViewLink = found.webViewLink || `https://drive.google.com/drive/folders/${found.id}`;
      localStorage.setItem(STORAGE_KEYS.FOLDER_ID, found.id);
      localStorage.setItem(STORAGE_KEYS.FOLDER_URL, webViewLink);
      window.dispatchEvent(new Event('eagenda_data_updated'));
      return {
        id: found.id,
        name: found.name,
        webViewLink,
      };
    }
  }

  // 3. Folder does not exist yet. Create a dedicated folder!
  const createRes = await fetch(
    'https://www.googleapis.com/drive/v3/files?fields=id,name,webViewLink',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${activeToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: APP_DRIVE_FOLDER_NAME,
        mimeType: 'application/vnd.google-apps.folder',
        description:
          'Folder khusus penyimpanan seluruh data cadangan, database cloud, Google Sheets, dan foto arsip fisik aplikasi E-Agenda & Disposisi Surat Digital.',
      }),
    }
  );

  if (!createRes.ok) {
    const errText = await createRes.text();
    throw new Error('Gagal membuat folder khusus di Google Drive: ' + errText);
  }

  const createdData = await createRes.json();
  const folderId = createdData.id;
  const webViewLink =
    createdData.webViewLink || `https://drive.google.com/drive/folders/${folderId}`;

  localStorage.setItem(STORAGE_KEYS.FOLDER_ID, folderId);
  localStorage.setItem(STORAGE_KEYS.FOLDER_URL, webViewLink);
  window.dispatchEvent(new Event('eagenda_data_updated'));

  return {
    id: folderId,
    name: APP_DRIVE_FOLDER_NAME,
    webViewLink,
  };
};

/**
 * Moves an existing file into the dedicated folder
 */
export const moveFileToAppFolder = async (
  token: string,
  fileId: string,
  targetFolderId?: string
): Promise<boolean> => {
  try {
    const folderId = targetFolderId || (await getOrCreateAppFolder(token)).id;
    const res = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}?addParents=${folderId}&fields=id,parents`,
      {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return res.ok;
  } catch (err) {
    console.warn(`Gagal memindahkan file ${fileId} ke folder ${targetFolderId}:`, err);
    return false;
  }
};

/**
 * Automatically gathers and moves all application files scattered in root Google Drive
 * into the single dedicated application folder.
 */
export const organizeAllAppFilesInFolder = async (
  token: string
): Promise<{ organizedCount: number; folderUrl: string }> => {
  const folder = await getOrCreateAppFolder(token);
  let organizedCount = 0;

  try {
    // 1. Move cloud database file if it exists
    const cloudDbQuery = encodeURIComponent(`name='eagenda_cloud_database.json' and trashed=false`);
    const dbRes = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=${cloudDbQuery}&fields=files(id,parents)`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (dbRes.ok) {
      const dbData = await dbRes.json();
      for (const f of dbData.files || []) {
        if (!f.parents || !f.parents.includes(folder.id)) {
          const moved = await moveFileToAppFolder(token, f.id, folder.id);
          if (moved) organizedCount++;
        }
      }
    }

    // 2. Move backup spreadsheets if any
    const sheetId = localStorage.getItem('eagenda_google_sheet_id_v1');
    if (sheetId) {
      const moved = await moveFileToAppFolder(token, sheetId, folder.id);
      if (moved) organizedCount++;
    }

    // 3. Search and move photos (BuktiSerahTerima_*)
    const photosQuery = encodeURIComponent(`name contains 'BuktiSerahTerima' and trashed=false`);
    const photosRes = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=${photosQuery}&fields=files(id,parents)`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (photosRes.ok) {
      const photosData = await photosRes.json();
      for (const f of photosData.files || []) {
        if (!f.parents || !f.parents.includes(folder.id)) {
          const moved = await moveFileToAppFolder(token, f.id, folder.id);
          if (moved) organizedCount++;
        }
      }
    }
  } catch (err) {
    console.warn('Notice while organizing Drive files:', err);
  }

  return { organizedCount, folderUrl: folder.webViewLink };
};
