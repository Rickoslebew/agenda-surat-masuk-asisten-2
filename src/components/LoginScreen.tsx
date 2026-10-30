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
} from 'lucide-react';
import { UserSession, AppSettings, Role } from '../types';
import {
  getAppSettings,
  getUsersList,
  loginWithCredentials,
  loginAsUser,
  addUser,
  DEFAULT_DEMO_ACCOUNTS,
  SUPERADMIN_ACCOUNT,
  SUPERADMIN_MASTER_KEY,
  resetUserPassword,
  getAllAccountsForRecovery,
} from '../services/storage';
import { UserAvatar } from './UserAvatar';

interface LoginScreenProps {
  onLoginSuccess: (user: UserSession) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [settings, setSettings] = useState<AppSettings>(getAppSettings());
  const [activeTab, setActiveTab] = useState<'credentials' | 'quick' | 'forgot'>('credentials');
  
  // Form state
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
        // Pre-fill login credentials so user can log in immediately
        setUsernameOrEmail(forgotIdentifier);
        setPassword(newPassword);
        // Switch back to credentials tab after 1.5 seconds
        setTimeout(() => {
          setActiveTab('credentials');
          setSuccessMessage('Kata sandi berhasil diubah! Kredensial telah diisi otomatis, silakan klik Masuk.');
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

  // Color accents based on settings
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

  const accentButtonBg =
    settings.warnaAksen === 'emerald'
      ? 'bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500'
      : settings.warnaAksen === 'indigo'
      ? 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500'
      : settings.warnaAksen === 'violet'
      ? 'bg-violet-600 hover:bg-violet-700 focus:ring-violet-500'
      : settings.warnaAksen === 'slate'
      ? 'bg-slate-700 hover:bg-slate-800 focus:ring-slate-500'
      : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500';

  const allAccountsForSelect = getAllAccountsForRecovery();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-blue-50/40 flex flex-col justify-between font-sans antialiased text-slate-800">
      {/* Top Header Bar with Office Identity & Superadmin Quick Badge */}
      <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur-md px-4 sm:px-8 py-3 flex items-center justify-between shadow-2xs">
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
          {/* Superadmin Master Badge */}
          <button
            onClick={() => setShowSuperadminModal(true)}
            className="px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
            title="Akses darurat & akun backup Superadmin jika lupa password"
          >
            <Crown className="w-3.5 h-3.5 text-amber-600" />
            <span className="hidden sm:inline">Backup Superadmin</span>
            <span className="sm:hidden">Superadmin</span>
          </button>

          <button
            onClick={() => setShowRegisterModal(true)}
            className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden sm:inline">Daftar Akun</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex items-center justify-center p-3 sm:p-6 lg:p-8">
        <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch my-auto">
          {/* Left Column / Brand & Overview & Emergency Superadmin Key (5 cols) */}
          <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white rounded-3xl p-6 sm:p-7 shadow-xl flex flex-col justify-between border border-slate-800 relative overflow-hidden">
            {/* Ambient background decoration */}
            <div className="absolute -top-16 -right-16 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white border border-white/15 text-xs font-semibold backdrop-blur-xs mb-4">
                <Shield className="w-3.5 h-3.5 text-blue-300" />
                <span>Portal Resmi & Backup Master</span>
              </div>

              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white mb-2 leading-snug">
                Portal Masuk {settings.namaSistem || 'E-Agenda'}
              </h2>

              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed mb-5">
                Pencatatan naskah dinas, lembar disposisi pimpinan, dan bukti foto serah terima berkas fisik terpadu.
              </p>

              {/* Superadmin Quick Rescue Box */}
              <div className="p-3.5 rounded-2xl bg-amber-500/15 border border-amber-400/30 backdrop-blur-md mb-5">
                <div className="flex items-center gap-2 text-amber-300 font-bold text-xs mb-1.5">
                  <Crown className="w-4 h-4 text-amber-400" />
                  <span>Akun Superadmin (Backup Darurat)</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed mb-2.5">
                  Jika Anda lupa kata sandi akun apa pun, gunakan akun Superadmin cadangan ini untuk masuk atau mengatur ulang kata sandi:
                </p>
                <div className="bg-slate-950/60 rounded-xl p-2.5 font-mono text-[11px] text-amber-200 space-y-1 border border-white/10">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Username:</span>
                    <strong className="text-white select-all">superadmin</strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Password:</span>
                    <strong className="text-amber-300 select-all">superadmin123</strong>
                  </div>
                  <div className="flex justify-between items-center text-[10px] pt-0.5 border-t border-white/10">
                    <span className="text-slate-400">Master Key:</span>
                    <span className="text-emerald-300 truncate font-semibold">{SUPERADMIN_MASTER_KEY}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleLoginSuperadminDirect}
                  className="mt-2.5 w-full py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-md shadow-amber-500/20"
                >
                  <Crown className="w-3.5 h-3.5 text-slate-950" />
                  <span>Masuk Langsung Sebagai Superadmin</span>
                </button>
              </div>

              {/* Office identity summary */}
              <div className="pt-3 border-t border-white/10 text-xs flex items-center gap-2.5 text-slate-300">
                <Building2 className="w-4 h-4 text-blue-400 shrink-0" />
                <div className="min-w-0">
                  <div className="font-semibold text-slate-100 truncate">{settings.namaInstansi || 'Kantor Instansi'}</div>
                  <div className="text-[11px] text-slate-400 truncate">{settings.alamatKantor || 'Layanan Persuratan'}</div>
                </div>
              </div>
            </div>

            {/* Bottom info badge */}
            <div className="mt-5 pt-3 border-t border-white/10 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Versi Sistem 2.4</span>
              <span className="text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Sistem Siap
              </span>
            </div>
          </div>

          {/* Right Column / Login Card (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200/80 flex flex-col justify-between">
            <div>
              {/* Tab Selector: Kredensial, Masuk Cepat, Lupa Password */}
              <div className="flex p-1 bg-slate-100 rounded-xl mb-5">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('credentials');
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  className={`flex-1 py-2 px-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    activeTab === 'credentials'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Lock className="w-3.5 h-3.5 text-blue-600" />
                  <span>Masuk</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('quick');
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  className={`flex-1 py-2 px-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    activeTab === 'quick'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Users className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Pilih Peran</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('forgot');
                    setErrorMessage(null);
                    setSuccessMessage(null);
                    setForgotError(null);
                    setForgotSuccess(null);
                  }}
                  className={`flex-1 py-2 px-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    activeTab === 'forgot'
                      ? 'bg-white text-rose-700 shadow-xs'
                      : 'text-slate-600 hover:text-rose-600'
                  }`}
                >
                  <RotateCcw className="w-3.5 h-3.5 text-rose-600" />
                  <span>Lupa Password</span>
                </button>
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

              {/* TAB 1: FORM LOGIN KREDENSIAL */}
              {activeTab === 'credentials' && (
                <form onSubmit={handleCredentialSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Username atau Alamat Email:
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        value={usernameOrEmail}
                        onChange={e => setUsernameOrEmail(e.target.value)}
                        placeholder="Contoh: superadmin / admin / pimpinan / email Anda..."
                        required
                        className="w-full pl-10 pr-3 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 focus:border-blue-500 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 outline-none transition-all shadow-2xs"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold text-slate-700">
                        Kata Sandi:
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab('forgot');
                          setForgotIdentifier(usernameOrEmail);
                        }}
                        className="text-[11px] text-rose-600 hover:text-rose-700 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <RotateCcw className="w-3 h-3" />
                        Lupa Password?
                      </button>
                    </div>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="Masukkan kata sandi akun Anda"
                        className="w-full pl-10 pr-10 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 focus:border-blue-500 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 outline-none transition-all shadow-2xs"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                        aria-label="Toggle password visibility"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={e => setRememberMe(e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                      />
                      <span className="text-xs text-slate-600 font-medium">
                        Ingat sesi saya
                      </span>
                    </label>

                    <button
                      type="button"
                      onClick={() => {
                        setUsernameOrEmail('superadmin');
                        setPassword('superadmin123');
                      }}
                      className="text-xs text-amber-700 hover:text-amber-800 font-semibold flex items-center gap-1"
                      title="Isi otomatis akun Superadmin cadangan"
                    >
                      <Crown className="w-3 h-3 text-amber-600" />
                      Isi Superadmin
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full py-3 px-4 rounded-xl text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer ${accentButtonBg} ${
                      isLoading ? 'opacity-70 cursor-not-allowed' : ''
                    }`}
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Memverifikasi Akun...</span>
                      </>
                    ) : (
                      <>
                        <span>Masuk ke Sistem</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* TAB 2: MASUK CEPAT MULTI-PERAN */}
              {activeTab === 'quick' && (
                <div className="space-y-2.5">
                  <div className="p-2.5 rounded-xl bg-blue-50/70 border border-blue-200 text-blue-900 text-xs flex items-center justify-between">
                    <div>
                      <p className="font-semibold">Pilih akun peran untuk langsung masuk:</p>
                      <p className="text-[11px] text-blue-700">1-Klik tanpa perlu mengetik kata sandi.</p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-200/80 text-blue-900">
                      {DEFAULT_DEMO_ACCOUNTS.length} Akun
                    </span>
                  </div>

                  <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                    {/* Superadmin first */}
                    <div
                      onClick={() => handleQuickLogin(SUPERADMIN_ACCOUNT)}
                      className="p-3 rounded-xl border-2 border-amber-400 bg-amber-50/60 hover:bg-amber-100/60 transition-all cursor-pointer flex items-center justify-between group shadow-xs"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="relative">
                          <UserAvatar
                            nama={SUPERADMIN_ACCOUNT.nama}
                            avatarUrl={SUPERADMIN_ACCOUNT.avatar}
                            role={SUPERADMIN_ACCOUNT.role}
                            size="md"
                          />
                          <Crown className="w-4 h-4 text-amber-500 absolute -top-1 -right-1 drop-shadow-xs" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-amber-900 truncate">
                              {SUPERADMIN_ACCOUNT.nama}
                            </span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-200 text-amber-900 border border-amber-300">
                              Master Backup
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 truncate mt-0.5">{SUPERADMIN_ACCOUNT.jabatan}</p>
                          <div className="text-[10px] text-slate-500 flex items-center gap-2 mt-0.5">
                            <span>User: <strong className="text-slate-800">superadmin</strong></span>
                            <span>•</span>
                            <span>Sandi: <strong className="text-slate-800">superadmin123</strong></span>
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0 pl-2">
                        <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-500 text-slate-950 text-xs font-bold transition-all shadow-2xs group-hover:scale-105">
                          Masuk
                          <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>

                    {/* Other Default Accounts */}
                    {DEFAULT_DEMO_ACCOUNTS.filter(a => a.id !== SUPERADMIN_ACCOUNT.id).map(acc => (
                      <div
                        key={acc.id}
                        onClick={() => handleQuickLogin(acc)}
                        className="p-3 rounded-xl border border-slate-200 hover:border-blue-400 bg-white hover:bg-blue-50/40 transition-all cursor-pointer flex items-center justify-between group shadow-2xs"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <UserAvatar
                            nama={acc.nama}
                            avatarUrl={acc.avatar}
                            role={acc.role}
                            size="md"
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-blue-700 truncate">
                                {acc.nama}
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  acc.role === 'Admin'
                                    ? 'bg-blue-100 text-blue-800'
                                    : acc.role === 'Pimpinan'
                                    ? 'bg-purple-100 text-purple-800'
                                    : acc.role === 'Penerima Disposisi'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-amber-100 text-amber-800'
                                }`}
                              >
                                {acc.role}
                              </span>
                            </div>
                            <p className="text-xs text-slate-600 truncate mt-0.5">{acc.jabatan}</p>
                            <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                              <span>User: <strong className="text-slate-600">{acc.username}</strong></span>
                              <span>•</span>
                              <span>Sandi: <strong className="text-slate-600">{acc.passwordHint}</strong></span>
                            </div>
                          </div>
                        </div>

                        <div className="shrink-0 pl-2">
                          <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 group-hover:bg-blue-600 group-hover:text-white text-slate-700 text-xs font-semibold transition-colors">
                            Masuk
                            <ChevronRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </div>
                    ))}

                    {/* Custom registered users if any exist */}
                    {customUsers.filter(u => !DEFAULT_DEMO_ACCOUNTS.some(d => d.id === u.id)).length > 0 && (
                      <div className="pt-2">
                        <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 px-1">
                          Akun Terdaftar Lainnya:
                        </div>
                        {customUsers
                          .filter(u => !DEFAULT_DEMO_ACCOUNTS.some(d => d.id === u.id))
                          .map(u => (
                            <div
                              key={u.id}
                              onClick={() => handleQuickLogin(u)}
                              className="p-3 mb-2 rounded-xl border border-slate-200 hover:border-emerald-400 bg-white hover:bg-emerald-50/40 transition-all cursor-pointer flex items-center justify-between group shadow-2xs"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <UserAvatar
                                  nama={u.nama}
                                  avatarUrl={u.avatar}
                                  role={u.role}
                                  size="md"
                                />
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-emerald-700 truncate">
                                      {u.nama}
                                    </span>
                                    <span className="px-2 py-0.2 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                                      {u.role}
                                    </span>
                                  </div>
                                  <p className="text-xs text-slate-600 truncate mt-0.5">{u.jabatan} • {u.unitKerja}</p>
                                </div>
                              </div>

                              <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 group-hover:bg-emerald-600 group-hover:text-white text-slate-700 text-xs font-semibold transition-colors shrink-0">
                                Pilih
                                <ChevronRight className="w-3.5 h-3.5" />
                              </span>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: FITUR LUPA PASSWORD */}
              {activeTab === 'forgot' && (
                <form onSubmit={handleResetPasswordSubmit} className="space-y-3.5">
                  <div className="p-3 rounded-xl bg-rose-50/70 border border-rose-200 text-rose-900 text-xs">
                    <div className="flex items-center gap-1.5 font-bold mb-1">
                      <RotateCcw className="w-4 h-4 text-rose-600" />
                      <span>Pemulihan & Atur Ulang Kata Sandi</span>
                    </div>
                    <p className="text-[11px] text-rose-700 leading-relaxed">
                      Masukkan Username atau Email akun Anda. Gunakan kode verifikasi pemulihan atau Master Key Superadmin untuk membuat kata sandi baru.
                    </p>
                  </div>

                  {forgotError && (
                    <div className="p-2.5 rounded-lg bg-rose-100/80 border border-rose-300 text-rose-800 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>{forgotError}</span>
                    </div>
                  )}

                  {forgotSuccess && (
                    <div className="p-2.5 rounded-lg bg-emerald-100/80 border border-emerald-300 text-emerald-800 text-xs flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{forgotSuccess}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Pilih Akun atau Masukkan Username / Email:
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        value={forgotIdentifier}
                        onChange={e => setForgotIdentifier(e.target.value)}
                        placeholder="Contoh: admin / pimpinan / superadmin..."
                        required
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-blue-500"
                      />
                    </div>

                    {/* Quick account tags */}
                    <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                      <span className="text-[10px] text-slate-400">Pilih cepat:</span>
                      {allAccountsForSelect.slice(0, 4).map(acc => (
                        <button
                          key={acc.id}
                          type="button"
                          onClick={() => setForgotIdentifier(acc.username || acc.email)}
                          className="px-2 py-0.5 rounded text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors"
                        >
                          {acc.username}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Kata Sandi Baru:
                      </label>
                      <div className="relative">
                        <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          value={newPassword}
                          onChange={e => setNewPassword(e.target.value)}
                          placeholder="Minimal 4 karakter"
                          required
                          className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-blue-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600"
                        >
                          {showNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Konfirmasi Sandi Baru:
                      </label>
                      <div className="relative">
                        <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          value={confirmNewPassword}
                          onChange={e => setConfirmNewPassword(e.target.value)}
                          placeholder="Ulangi sandi baru"
                          required
                          className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-slate-700">
                        Kode Verifikasi / Master Key Superadmin:
                      </label>
                      <button
                        type="button"
                        onClick={() => setMasterRecoveryKey(SUPERADMIN_MASTER_KEY)}
                        className="text-[10px] text-amber-700 hover:underline font-semibold flex items-center gap-1"
                      >
                        <Key className="w-3 h-3 text-amber-600" />
                        Pakai Master Key
                      </button>
                    </div>
                    <div className="relative">
                      <Key className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        value={masterRecoveryKey}
                        onChange={e => setMasterRecoveryKey(e.target.value)}
                        placeholder="Contoh: 123456 atau SUPERADMIN-RECOVERY-2026"
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-blue-500 font-mono"
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">
                      Default kode verifikasi: <strong className="text-slate-600">123456</strong> atau Master Key Superadmin.
                    </p>
                  </div>

                  <div className="pt-2 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveTab('credentials')}
                      className="px-4 py-2.5 border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-700 font-semibold text-xs"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs shadow-md shadow-rose-600/20 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                      <span>Simpan Kata Sandi Baru & Masuk</span>
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Bottom Help & Switch */}
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <button
                type="button"
                onClick={() => setShowSuperadminModal(true)}
                className="text-xs text-amber-700 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Crown className="w-3.5 h-3.5 text-amber-600" />
                Informasi Backup Superadmin
              </button>

              <button
                type="button"
                onClick={() => setShowRegisterModal(true)}
                className="text-xs text-blue-600 hover:underline font-semibold"
              >
                + Tambah Akun Baru
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-4 sm:px-8 py-3 text-center text-xs text-slate-500 border-t border-slate-200/80 bg-white/60">
        <p className="truncate max-w-2xl mx-auto">
          {settings.namaInstansi || 'Kementerian / Lembaga Pemerintah'} &bull; Sistem Tata Naskah & Disposisi Elektronik
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
                  <p className="text-xs text-amber-100">Kredensial permanen untuk akses pemulihan kapan pun</p>
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
                  Akun Superadmin ini disiapkan khusus sebagai <strong>backup master</strong>. Jika Anda lupa kata sandi akun apa pun atau tidak sengaja mengubah data pengguna, Anda dapat selalu masuk menggunakan akun ini atau memakai Master Key untuk mereset seluruh akun.
                </p>
              </div>

              {/* Credential Details Card */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-2.5">
                <div className="flex items-center justify-between py-1 border-b border-slate-200/80">
                  <span className="text-slate-500 font-medium">Nama Akun:</span>
                  <span className="font-bold text-slate-800">{SUPERADMIN_ACCOUNT.nama}</span>
                </div>
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
                <button
                  type="button"
                  onClick={() => {
                    setShowSuperadminModal(false);
                    setActiveTab('forgot');
                  }}
                  className="w-full sm:w-auto py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
                >
                  Buka Menu Reset
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

            <form onSubmit={handleRegisterSubmit} className="p-6 space-y-3.5 text-xs">
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
