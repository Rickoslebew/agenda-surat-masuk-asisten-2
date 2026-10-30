import React, { useState, useEffect } from 'react';
import {
  Shield,
  Lock,
  User,
  KeyRound,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Building2,
  FileText,
  Users,
  UserPlus,
  HelpCircle,
  ChevronRight,
  RotateCcw,
  Key,
  Crown,
  Check,
  RefreshCw,
  Cloud,
  HardDrive,
  FileSpreadsheet,
  Laptop,
  Smartphone,
  ChevronDown,
} from 'lucide-react';
import { UserSession, AppSettings, Role } from '../types';
import {
  getAppSettings,
  getUsersList,
  saveUsersList,
  loginWithCredentials,
  loginAsUser,
  addUser,
  DEFAULT_DEMO_ACCOUNTS,
  SUPERADMIN_ACCOUNT,
  SUPERADMIN_MASTER_KEY,
  resetUserPassword,
  getAllAccountsForRecovery,
} from '../services/storage';
import { googleSignIn, getAccessToken } from '../services/authGoogleDrive';
import { pullDataFromGoogleCloud, getCloudSyncState } from '../services/cloudSyncService';
import { UserAvatar } from './UserAvatar';

interface LoginScreenProps {
  onLoginSuccess: (user: UserSession) => void;
}

const GoogleIcon = () => (
  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
    />
    <path
      fill="#34A853"
      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
    />
    <path
      fill="#FBBC05"
      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.17 0 9.97 0 12s.45 3.83 1.25 5.42l4.03-3.15z"
    />
    <path
      fill="#EA4335"
      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
    />
  </svg>
);

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [settings, setSettings] = useState<AppSettings>(getAppSettings());
  const [activeTab, setActiveTab] = useState<'google' | 'credentials' | 'quick' | 'forgot'>('google');
  
  // Google sign in state
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [syncStatusText, setSyncStatusText] = useState<string | null>(null);

  // Form state for alternative / offline login
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Quick list of registered custom users
  const [customUsers, setCustomUsers] = useState<UserSession[]>([]);

  // Forgot Password state
  const [forgotIdentifier, setForgotIdentifier] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [masterRecoveryKey, setMasterRecoveryKey] = useState('');
  const [forgotError, setForgotError] = useState<string | null>(null);
  const [forgotSuccess, setForgotSuccess] = useState<string | null>(null);

  // Superadmin Emergency Modal
  const [showSuperadminModal, setShowSuperadminModal] = useState(false);

  // Toggle for fallback options
  const [showAlternativeLogin, setShowAlternativeLogin] = useState(false);

  // Quick Register Modal state
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [regNama, setRegNama] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regRole, setRegRole] = useState<Role>('Admin');
  const [regJabatan, setRegJabatan] = useState('');
  const [regUnitKerja, setRegUnitKerja] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regError, setRegError] = useState('');

  useEffect(() => {
    setSettings(getAppSettings());
    setCustomUsers(getUsersList());

    const handleUpdate = () => {
      setSettings(getAppSettings());
      setCustomUsers(getUsersList());
    };

    window.addEventListener('eagenda_settings_updated', handleUpdate);
    window.addEventListener('eagenda_data_updated', handleUpdate);
    return () => {
      window.removeEventListener('eagenda_settings_updated', handleUpdate);
      window.removeEventListener('eagenda_data_updated', handleUpdate);
    };
  }, []);

  /**
   * PRIMARY LOGIN FLOW:
   * Sign In with Google & Automatically Pull All Data from Google Cloud Drive
   */
  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    setSyncStatusText('Membuka jendela otorisasi Akun Google Anda...');

    try {
      const authResult = await googleSignIn();
      if (!authResult) {
        throw new Error('Otorisasi Google dibatalkan atau tidak menerima token.');
      }

      const { user, accessToken } = authResult;
      setSyncStatusText('Menghubungkan ke Google Drive & memeriksa berkas sinkronisasi...');

      // Pull latest database from user's Google Drive
      const pullResult = await pullDataFromGoogleCloud(accessToken);

      // Create active user session from Google profile
      const googleUserSession: UserSession = {
        id: 'usr-google-' + user.uid,
        nama: user.displayName || 'Pengguna Akun Google',
        email: user.email || 'rickochico20@gmail.com',
        role: 'Admin',
        jabatan: 'Administrator Persuratan & Disposisi',
        unitKerja: 'Bagian Umum & Tata Usaha',
        avatar:
          user.photoURL ||
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
        username: user.email ? user.email.split('@')[0] : 'admin',
      };

      // Add to registered users list if not already present
      const currentUsers = getUsersList();
      const existingUserIdx = currentUsers.findIndex(u => u.email === googleUserSession.email);
      if (existingUserIdx === -1) {
        saveUsersList([googleUserSession, ...currentUsers]);
      } else {
        currentUsers[existingUserIdx] = { ...currentUsers[existingUserIdx], ...googleUserSession };
        saveUsersList(currentUsers);
      }

      loginAsUser(googleUserSession, true);

      if (pullResult.isNewFile) {
        setSuccessMessage(
          `Akun Google (${user.email}) berhasil terhubung! Database awan baru telah disiapkan di Google Drive & Spreadsheet Anda.`
        );
      } else {
        setSuccessMessage(
          `Sinkronisasi Sukses: Seluruh berkas surat dan lembar disposisi dari Akun Google (${user.email}) berhasil dimuat.`
        );
      }

      setTimeout(() => {
        setIsGoogleLoading(false);
        onLoginSuccess(googleUserSession);
      }, 700);
    } catch (err: any) {
      console.error('Google Sign-In Error:', err);
      setIsGoogleLoading(false);
      setSyncStatusText(null);
      setErrorMessage(
        err.message ||
          'Gagal masuk menggunakan Akun Google. Pastikan koneksi internet stabil dan pop-up diizinkan.'
      );
    }
  };

  const handleCredentialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!usernameOrEmail.trim()) {
      setErrorMessage('Harap masukkan Username atau Alamat Email Anda.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const result = loginWithCredentials(usernameOrEmail, password, rememberMe);
      setIsLoading(false);
      if (result.success && result.user) {
        onLoginSuccess(result.user);
      } else {
        setErrorMessage(result.error || 'Autentikasi gagal. Periksa kembali kredensial Anda.');
      }
    }, 350);
  };

  const handleQuickLogin = (user: UserSession) => {
    setIsLoading(true);
    setTimeout(() => {
      loginAsUser(user, true);
      setIsLoading(false);
      onLoginSuccess(user);
    }, 200);
  };

  const handleLoginSuperadminDirect = () => {
    setIsLoading(true);
    setTimeout(() => {
      loginAsUser(SUPERADMIN_ACCOUNT, true);
      setIsLoading(false);
      setShowSuperadminModal(false);
      onLoginSuccess(SUPERADMIN_ACCOUNT);
    }, 250);
  };

  const handleResetPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(null);
    setForgotSuccess(null);

    if (!forgotIdentifier.trim()) {
      setForgotError('Harap masukkan Username atau Email akun yang ingin diatur ulang.');
      return;
    }
    if (!newPassword.trim() || newPassword.length < 4) {
      setForgotError('Kata sandi baru minimal 4 karakter.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setForgotError('Konfirmasi kata sandi tidak cocok.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const result = resetUserPassword(forgotIdentifier, newPassword, masterRecoveryKey);
      setIsLoading(false);
      if (result.success) {
        setForgotSuccess(result.message);
        setUsernameOrEmail(forgotIdentifier);
        setPassword(newPassword);
        setTimeout(() => {
          setActiveTab('credentials');
          setSuccessMessage('Kata sandi berhasil diubah! Silakan masuk.');
        }, 1200);
      } else {
        setForgotError(result.message);
      }
    }, 350);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');

    if (!regNama.trim()) {
      setRegError('Nama lengkap wajib diisi.');
      return;
    }
    if (!regEmail.trim()) {
      setRegError('Email dinas wajib diisi.');
      return;
    }

    const newUser = addUser({
      nama: regNama.trim(),
      email: regEmail.trim(),
      role: regRole,
      jabatan: regJabatan.trim() || 'Staf Persuratan',
      unitKerja: regUnitKerja.trim() || 'Bagian Tata Usaha',
      avatar: '',
      password: regPassword.trim() || '123456',
    });

    setShowRegisterModal(false);
    loginAsUser(newUser, true);
    onLoginSuccess(newUser);
  };

  const accentGradient =
    settings.warnaAksen === 'emerald'
      ? 'from-emerald-700 via-teal-700 to-slate-900'
      : settings.warnaAksen === 'indigo'
      ? 'from-indigo-700 via-purple-700 to-slate-900'
      : settings.warnaAksen === 'violet'
      ? 'from-violet-700 via-fuchsia-700 to-slate-900'
      : settings.warnaAksen === 'slate'
      ? 'from-slate-800 via-slate-700 to-slate-900'
      : 'from-blue-700 via-indigo-800 to-slate-900';

  const allAccountsForSelect = getAllAccountsForRecovery();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-blue-50/40 flex flex-col justify-between font-sans antialiased text-slate-800">
      {/* Top Header Bar with Office Identity & Cloud Sync Status */}
      <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur-md px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-3">
          {settings.logoUrl ? (
            <div className="w-9 h-9 rounded-xl overflow-hidden border border-slate-200 bg-white flex items-center justify-center p-0.5 shadow-2xs shrink-0">
              <img
                src={settings.logoUrl}
                alt={settings.namaSistem}
                className="w-full h-full object-contain"
              />
            </div>
          ) : (
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-sm font-bold text-sm uppercase shrink-0 bg-gradient-to-tr ${accentGradient}`}
            >
              {settings.logoSingkatan || 'eA'}
            </div>
          )}
          <div className="min-w-0">
            <h1 className="text-sm font-bold text-slate-900 leading-tight truncate">
              {settings.namaSistem || 'E-Agenda & Disposisi'}
            </h1>
            <p className="text-[11px] text-slate-500 truncate">
              {settings.subIndukInstansi || 'Sistem Tata Naskah & Disposisi Elektronik'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-semibold text-[11px]">
            <Cloud className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
            <span>Google Cloud Auto-Sync Aktif</span>
          </div>

          <button
            onClick={() => setShowSuperadminModal(true)}
            className="px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
            title="Kunci darurat & info pemulihan Superadmin"
          >
            <Crown className="w-3.5 h-3.5 text-amber-600" />
            <span className="hidden sm:inline">Backup Master</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex items-center justify-center p-3 sm:p-6 lg:p-8">
        <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch my-auto">
          {/* Left Column / Cloud Sync Benefits & User Identity (5 cols) */}
          <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white rounded-3xl p-6 sm:p-7 shadow-xl flex flex-col justify-between border border-slate-800 relative overflow-hidden">
            {/* Ambient background decoration */}
            <div className="absolute -top-16 -right-16 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white border border-white/15 text-xs font-semibold backdrop-blur-xs mb-4">
                <Cloud className="w-3.5 h-3.5 text-blue-300" />
                <span>Sinkronisasi Multi-Perangkat</span>
              </div>

              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white mb-2 leading-snug">
                Buka Berkas di Komputer Mana Saja
              </h2>

              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed mb-5">
                Cukup login dengan <strong>Akun Google</strong> Anda. Seluruh buku agenda surat masuk, lembar disposisi pimpinan, dan foto serah terima otomatis terbuka secara instan di perangkat mana pun.
              </p>

              {/* Cloud Sync Value Props */}
              <div className="space-y-3 pt-3 border-t border-white/10 text-xs">
                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-xl bg-blue-500/20 text-blue-300 flex items-center justify-center shrink-0 mt-0.5">
                    <Laptop className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-100">Akses Tanpa Batas Perangkat</div>
                    <div className="text-[11px] text-slate-400">
                      Login di laptop pribadi, PC dinas, atau komputer resepsionis — data Anda selalu identik dan mutakhir.
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0 mt-0.5">
                    <HardDrive className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-100">Database Tersimpan di Google Drive</div>
                    <div className="text-[11px] text-slate-400">
                      File master otomatis diarsipkan ke Google Drive akun Anda tanpa risiko hilang.
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-xl bg-green-500/20 text-green-300 flex items-center justify-center shrink-0 mt-0.5">
                    <FileSpreadsheet className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-100">Rekap Otomatis Google Spreadsheet</div>
                    <div className="text-[11px] text-slate-400">
                      Tersambung ke lembar Spreadsheet untuk cetak laporan dan audit persuratan.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom info badge */}
            <div className="mt-6 pt-3 border-t border-white/10 text-[11px] text-slate-400 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-blue-400" />
                <span>Login Aman Google OAuth 2.0</span>
              </span>
              <span className="text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Awan Siap
              </span>
            </div>
          </div>

          {/* Right Column / Primary Google Sign-In Card (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200/80 flex flex-col justify-between">
            <div>
              {/* Header Title */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-base sm:text-lg font-bold text-slate-900">
                    Masuk ke Sistem E-Agenda
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                    Google Sync
                  </span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Gunakan Akun Google Anda untuk masuk dan menyinkronkan seluruh data berkas surat secara otomatis.
                </p>
              </div>

              {/* Success Notification Banner */}
              {successMessage && (
                <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2.5 animate-in fade-in duration-150">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="flex-1 font-medium">{successMessage}</div>
                </div>
              )}

              {/* Error Banner */}
              {errorMessage && (
                <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5 animate-in fade-in duration-150">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <span className="font-semibold block">Gagal Masuk</span>
                    <span className="text-[11px] leading-relaxed">{errorMessage}</span>
                  </div>
                </div>
              )}

              {/* PRIMARY ACTION: GOOGLE SIGN-IN BUTTON (HERO) */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-blue-50/80 via-indigo-50/40 to-slate-50 border-2 border-blue-200/80 shadow-xs mb-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <GoogleIcon />
                    <span className="font-bold text-xs text-slate-800">
                      Rekomendasi Utama (Tersinkronisasi Otomatis)
                    </span>
                  </div>
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                    Multi-Device
                  </span>
                </div>

                <p className="text-[11px] text-slate-600 mb-4 leading-relaxed">
                  Masuk dengan email Google Anda (<code className="text-blue-700 font-semibold font-mono">rickochico20@gmail.com</code> atau akun instansi Anda). Semua surat yang sudah dibuat akan langsung dimuat di perangkat ini.
                </p>

                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={isGoogleLoading}
                  className="w-full py-3.5 px-4 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs sm:text-sm border-2 border-slate-300 hover:border-blue-500 shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-3 cursor-pointer group disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isGoogleLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                      <span className="text-blue-700 font-semibold">{syncStatusText || 'Menghubungkan Akun Google...'}</span>
                    </>
                  ) : (
                    <>
                      <GoogleIcon />
                      <span className="group-hover:text-blue-600 transition-colors">
                        Masuk dengan Akun Google
                      </span>
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all ml-auto sm:ml-0" />
                    </>
                  )}
                </button>

                {isGoogleLoading && (
                  <div className="mt-3 p-2.5 rounded-lg bg-blue-100/60 border border-blue-200 text-[11px] text-blue-900 flex items-center gap-2 animate-pulse">
                    <Cloud className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Sinkronisasi database Google Drive sedang berjalan...</span>
                  </div>
                )}
              </div>

              {/* COLLAPSIBLE ALTERNATIVE LOGIN (FALLBACK / OFFLINE) */}
              <div className="pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAlternativeLogin(!showAlternativeLogin)}
                  className="w-full flex items-center justify-between text-xs text-slate-500 hover:text-slate-800 font-semibold py-2 transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-slate-400" />
                    Opsi Masuk Alternatif (Offline / Demo / Sandi)
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                      showAlternativeLogin ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {showAlternativeLogin && (
                  <div className="mt-3 pt-3 border-t border-slate-100 space-y-3 animate-in fade-in duration-150">
                    {/* Tab Selector */}
                    <div className="flex p-1 bg-slate-100 rounded-xl">
                      <button
                        type="button"
                        onClick={() => setActiveTab('credentials')}
                        className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                          activeTab === 'credentials'
                            ? 'bg-white text-slate-900 shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Kata Sandi
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTab('quick')}
                        className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                          activeTab === 'quick'
                            ? 'bg-white text-slate-900 shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Pilih Peran Demo
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTab('forgot')}
                        className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                          activeTab === 'forgot'
                            ? 'bg-white text-rose-700 shadow-xs'
                            : 'text-slate-600 hover:text-rose-600'
                        }`}
                      >
                        Lupa Sandi
                      </button>
                    </div>

                    {/* FORM KREDENSIAL */}
                    {activeTab === 'credentials' && (
                      <form onSubmit={handleCredentialSubmit} className="space-y-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Username atau Email:
                          </label>
                          <input
                            type="text"
                            value={usernameOrEmail}
                            onChange={e => setUsernameOrEmail(e.target.value)}
                            placeholder="admin / superadmin / pimpinan..."
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-blue-500"
                          />
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="block text-xs font-bold text-slate-700">
                              Kata Sandi:
                            </label>
                            <button
                              type="button"
                              onClick={() => {
                                setUsernameOrEmail('superadmin');
                                setPassword('superadmin123');
                              }}
                              className="text-[10px] text-amber-700 hover:underline font-semibold"
                            >
                              Isi Superadmin
                            </button>
                          </div>
                          <div className="relative">
                            <input
                              type={showPassword ? 'text' : 'password'}
                              value={password}
                              onChange={e => setPassword(e.target.value)}
                              placeholder="Masukkan kata sandi"
                              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-blue-500 pr-9"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600"
                            >
                              {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>

                        <button
                          type="submit"
                          disabled={isLoading}
                          className="w-full py-2.5 px-3 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold transition-all cursor-pointer shadow-xs"
                        >
                          {isLoading ? 'Memverifikasi...' : 'Masuk dengan Kata Sandi'}
                        </button>
                      </form>
                    )}

                    {/* TAB PILIH PERAN DEMO */}
                    {activeTab === 'quick' && (
                      <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                        {DEFAULT_DEMO_ACCOUNTS.map(acc => (
                          <div
                            key={acc.id}
                            onClick={() => handleQuickLogin(acc)}
                            className="p-2.5 rounded-xl border border-slate-200 hover:border-blue-400 bg-white hover:bg-blue-50/40 transition-all cursor-pointer flex items-center justify-between group shadow-2xs"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <UserAvatar nama={acc.nama} avatarUrl={acc.avatar} role={acc.role} size="sm" />
                              <div className="min-w-0">
                                <div className="font-bold text-xs text-slate-900 truncate">{acc.nama}</div>
                                <div className="text-[10px] text-slate-500 truncate">{acc.role} &bull; {acc.jabatan}</div>
                              </div>
                            </div>
                            <span className="px-2 py-1 rounded bg-slate-100 group-hover:bg-blue-600 group-hover:text-white text-slate-700 text-[10px] font-semibold transition-colors">
                              Pilih
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* TAB LUPA PASSWORD */}
                    {activeTab === 'forgot' && (
                      <form onSubmit={handleResetPasswordSubmit} className="space-y-2.5 text-xs">
                        {forgotError && (
                          <div className="p-2 rounded bg-rose-50 text-rose-700 text-[11px] border border-rose-200">
                            {forgotError}
                          </div>
                        )}
                        {forgotSuccess && (
                          <div className="p-2 rounded bg-emerald-50 text-emerald-700 text-[11px] border border-emerald-200">
                            {forgotSuccess}
                          </div>
                        )}
                        <div>
                          <label className="block font-bold text-slate-700 mb-0.5">Username / Email:</label>
                          <input
                            type="text"
                            value={forgotIdentifier}
                            onChange={e => setForgotIdentifier(e.target.value)}
                            placeholder="admin / superadmin..."
                            className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block font-bold text-slate-700 mb-0.5">Sandi Baru:</label>
                            <input
                              type="password"
                              value={newPassword}
                              onChange={e => setNewPassword(e.target.value)}
                              placeholder="Minimal 4 huruf"
                              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs"
                            />
                          </div>
                          <div>
                            <label className="block font-bold text-slate-700 mb-0.5">Konfirmasi:</label>
                            <input
                              type="password"
                              value={confirmNewPassword}
                              onChange={e => setConfirmNewPassword(e.target.value)}
                              placeholder="Ulangi sandi"
                              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs"
                            />
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-0.5">
                            <label className="block font-bold text-slate-700">Kode Darurat / Master Key:</label>
                            <button
                              type="button"
                              onClick={() => setMasterRecoveryKey(SUPERADMIN_MASTER_KEY)}
                              className="text-[10px] text-amber-700 hover:underline"
                            >
                              Pakai Master Key
                            </button>
                          </div>
                          <input
                            type="text"
                            value={masterRecoveryKey}
                            onChange={e => setMasterRecoveryKey(e.target.value)}
                            placeholder="123456 atau Master Key"
                            className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs font-mono"
                          />
                        </div>
                        <button
                          type="submit"
                          disabled={isLoading}
                          className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded text-xs transition-colors"
                        >
                          Reset Sandi & Masuk
                        </button>
                      </form>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Support & Superadmin Link */}
            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <button
                type="button"
                onClick={() => setShowSuperadminModal(true)}
                className="text-xs text-amber-700 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Crown className="w-3.5 h-3.5 text-amber-600" />
                Info Akun Cadangan Superadmin
              </button>

              <button
                type="button"
                onClick={() => setShowRegisterModal(true)}
                className="text-xs text-blue-600 hover:underline font-semibold"
              >
                + Buat Akun Pribadi
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-4 sm:px-8 py-3 text-center text-xs text-slate-500 border-t border-slate-200/80 bg-white/60">
        <p className="truncate max-w-2xl mx-auto">
          {settings.namaInstansi || 'Kementerian / Lembaga Pemerintah'} &bull; Tersinkronisasi Akun Google Cloud
        </p>
      </footer>

      {/* SUPERADMIN BACKUP & RECOVERY MODAL */}
      {showSuperadminModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-gradient-to-r from-amber-600 via-amber-700 to-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center font-bold text-white text-base">
                  <Crown className="w-5 h-5 text-amber-200" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold">Kunci Darurat Superadmin (Master Backup)</h3>
                  <p className="text-xs text-amber-100">Kredensial permanen untuk akses darurat jika lupa password</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowSuperadminModal(false)}
                className="text-white/70 hover:text-white text-lg p-1"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 leading-relaxed">
                <p className="font-bold text-xs mb-1 flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-amber-600" />
                  Jaminan Tidak Terkunci (Never Locked Out)
                </p>
                <p className="text-[11px] text-amber-800">
                  Akun Superadmin ini adalah backup permanen dengan pemilik email <strong>rickochico20@gmail.com</strong>. Anda dapat selalu masuk langsung dengan Google atau menggunakan kredensial master berikut:
                </p>
              </div>

              {/* Credential Details Card */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-2.5">
                <div className="flex items-center justify-between py-1 border-b border-slate-200/80">
                  <span className="text-slate-500 font-medium">Username:</span>
                  <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 select-all">
                    superadmin
                  </span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-200/80">
                  <span className="text-slate-500 font-medium">Email Pemilik:</span>
                  <span className="font-bold text-slate-800 select-all">rickochico20@gmail.com</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-200/80">
                  <span className="text-slate-500 font-medium">Password Master:</span>
                  <span className="font-mono font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded border border-amber-300 select-all">
                    superadmin123
                  </span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-500 font-medium">Master Recovery Key:</span>
                  <span className="font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-300 select-all">
                    {SUPERADMIN_MASTER_KEY}
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleLoginSuperadminDirect}
                  className="w-full py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md shadow-amber-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Crown className="w-4 h-4" />
                  <span>Masuk Sekarang Sebagai Superadmin</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Register User Modal */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white text-sm">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold">Daftar Akun Pengguna Baru</h3>
                  <p className="text-xs text-blue-200">Buat akun untuk instansi Anda</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowRegisterModal(false)}
                className="text-slate-400 hover:text-white text-lg p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRegisterSubmit} className="p-6 space-y-3 text-xs">
              {regError && (
                <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                  {regError}
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Nama Lengkap & Gelar: <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={regNama}
                  onChange={e => setRegNama(e.target.value)}
                  placeholder="Misal: Budi Santoso, S.AP"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-blue-500 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Email Dinas: <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={e => setRegEmail(e.target.value)}
                  placeholder="budi.santoso@kantor.go.id"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-blue-500 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Peran Hak Akses (Role): <span className="text-rose-500">*</span>
                </label>
                <select
                  value={regRole}
                  onChange={e => setRegRole(e.target.value as Role)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-blue-500 text-xs bg-white font-medium"
                >
                  <option value="Admin">Admin (Tata Usaha & Pencatat Surat)</option>
                  <option value="Pimpinan">Pimpinan (Kepala Dinas / Otoritas Disposisi)</option>
                  <option value="Penerima Disposisi">Penerima Disposisi (Kabid / Pelaksana)</option>
                  <option value="Auditor">Auditor (Pengawas / Akses Baca)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Jabatan:</label>
                  <input
                    type="text"
                    value={regJabatan}
                    onChange={e => setRegJabatan(e.target.value)}
                    placeholder="Staf TU / Kasubag"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-blue-500 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Unit Kerja:</label>
                  <input
                    type="text"
                    value={regUnitKerja}
                    onChange={e => setRegUnitKerja(e.target.value)}
                    placeholder="Bagian Umum"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-blue-500 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Kata Sandi / PIN Baru:
                </label>
                <input
                  type="password"
                  value={regPassword}
                  onChange={e => setRegPassword(e.target.value)}
                  placeholder="Minimal 4 karakter (default: 123456)"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-blue-500 text-xs"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowRegisterModal(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-100 rounded-xl text-slate-700 font-semibold text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-md shadow-blue-500/20"
                >
                  Buat Akun & Masuk
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
