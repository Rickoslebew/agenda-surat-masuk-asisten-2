import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut,
  User,
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App safely
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/drive.file');
provider.addScope('https://www.googleapis.com/auth/spreadsheets');

let isSigningIn = false;
let cachedAccessToken: string | null =
  typeof window !== 'undefined' ? localStorage.getItem('eagenda_google_access_token') : null;

// Initialize auth state listener
export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      const storedToken = cachedAccessToken || localStorage.getItem('eagenda_google_access_token');
      if (storedToken) {
        cachedAccessToken = storedToken;
        if (onAuthSuccess) onAuthSuccess(user, storedToken);
      } else if (!isSigningIn) {
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Gagal mendapatkan token otorisasi dari akun Google');
    }

    cachedAccessToken = credential.accessToken;
    localStorage.setItem('eagenda_google_access_token', cachedAccessToken);
    if (result.user.email) {
      localStorage.setItem('eagenda_google_user_email', result.user.email);
    }
    if (result.user.displayName) {
      localStorage.setItem('eagenda_google_user_name', result.user.displayName);
    }
    if (result.user.photoURL) {
      localStorage.setItem('eagenda_google_user_avatar', result.user.photoURL);
    }

    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Sign in error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  if (cachedAccessToken) return cachedAccessToken;
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('eagenda_google_access_token');
    if (stored) {
      cachedAccessToken = stored;
      return stored;
    }
  }
  return null;
};

export const logoutGoogle = async () => {
  try {
    await signOut(auth);
  } catch (err) {
    console.warn('Sign out warning:', err);
  }
  cachedAccessToken = null;
  localStorage.removeItem('eagenda_google_access_token');
  localStorage.removeItem('eagenda_google_user_email');
  localStorage.removeItem('eagenda_google_user_name');
  localStorage.removeItem('eagenda_google_user_avatar');
};

/**
 * Uploads a base64 or blob photo to Google Drive
 */
export const uploadFileToGoogleDrive = async (
  fileName: string,
  base64Data: string,
  mimeType: string = 'image/jpeg',
  description: string = 'Bukti serah terima fisik dokumen e-Agenda'
): Promise<{ id: string; name: string; webViewLink: string }> => {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Anda belum terhubung ke Google Drive. Silakan hubungkan akun Google terlebih dahulu.');
  }

  // Convert base64 data to blob if needed
  let byteCharacters: string;
  if (base64Data.includes(',')) {
    byteCharacters = atob(base64Data.split(',')[1]);
  } else {
    byteCharacters = atob(base64Data);
  }

  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], { type: mimeType });

  // Ensure dedicated application folder exists
  let folderId: string | undefined;
  try {
    const { getOrCreateAppFolder } = await import('./driveFolderService');
    const folder = await getOrCreateAppFolder(token);
    folderId = folder.id;
  } catch (err) {
    console.warn('Could not resolve dedicated app folder, uploading to root fallback:', err);
  }

  // Metadata for Drive file placed in dedicated folder
  const metadata: any = {
    name: fileName,
    mimeType: mimeType,
    description: description,
  };
  if (folderId) {
    metadata.parents = [folderId];
  }

  const form = new FormData();
  form.append(
    'metadata',
    new Blob([JSON.stringify(metadata)], { type: 'application/json' })
  );
  form.append('file', blob);

  const response = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: form,
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error?.message || `Gagal mengunggah file ke Google Drive (Status: ${response.status})`
    );
  }

  const result = await response.json();
  return {
    id: result.id,
    name: result.name,
    webViewLink: result.webViewLink || `https://drive.google.com/file/d/${result.id}/view`,
  };
};
