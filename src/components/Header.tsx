import React, { useState, useEffect } from 'react';
import {
  Bell,
  HardDrive,
  CheckCircle2,
  AlertCircle,
  Menu,
  Shield,
  ChevronDown,
  Sparkles,
  Volume2,
  LogOut,
  Users,
  Cloud,
  RefreshCw,
} from 'lucide-react';
import { UserSession, Notifikasi, AppSettings } from '../types';
import { UserAvatar } from './UserAvatar';
import {
  getUsersList,
  getCurrentUser,
  setCurrentUser,
  getNotifikasiList,
  markNotifikasiRead,
  markAllNotifikasiRead,
  getAppSettings,
  logoutUser,
} from '../services/storage';
import {
  googleSignIn,
  logoutGoogle,
  initAuth,
  getAccessToken,
} from '../services/authGoogleDrive';
import {
  pushDataToGoogleCloud,
  pullDataFromGoogleCloud,
  getCloudSyncState,
  CloudSyncState,
} from '../services/cloudSyncService';
import { requestNotificationPermission, playNotificationSound } from '../services/notificationService';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';

interface HeaderProps {
  onToggleSidebar: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onSelectSuratFromNotif?: (suratId: string) => void;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  searchQuery,
  onSearchChange,
  onSelectSuratFromNotif,
  onLogout,
}) => {
  const [currentUser, setUser] = useState<UserSession>(getCurrentUser());
  const [userList, setUserList] = useState<UserSession[]>(getUsersList());
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showNotifPopover, setShowNotifPopover] = useState(false);
  const [notifikasiList, setNotifikasiList] = useState<Notifikasi[]>(getNotifikasiList());
  const [isDriveConnected, setIsDriveConnected] = useState<boolean>(false);
  const [googleUserEmail, setGoogleUserEmail] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [cloudSyncState, setSyncState] = useState<CloudSyncState>(getCloudSyncState());
  const [isManualSyncing, setIsManualSyncing] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(
    'Notification' in window && Notification.permission === 'granted'
  );

  const [showDisconnectConfirm, setShowDisconnectConfirm] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [settings, setSettings] = useState<AppSettings>(getAppSettings());

  useEffect(() => {
    const handleDataUpdate = () => {
      setUser(getCurrentUser());
      setUserList(getUsersList());
      setNotifikasiList(getNotifikasiList());
      setSettings(getAppSettings());
      setSyncState(getCloudSyncState());
    };

    window.addEventListener('eagenda_data_updated', handleDataUpdate);
    window.addEventListener('eagenda_settings_updated', handleDataUpdate);
    window.addEventListener('eagenda_cloud_sync_updated', handleDataUpdate);
    return () => {
      window.removeEventListener('eagenda_data_updated', handleDataUpdate);
      window.removeEventListener('eagenda_settings_updated', handleDataUpdate);
      window.removeEventListener('eagenda_cloud_sync_updated', handleDataUpdate);
    };
  }, []);

  useEffect(() => {
    // Listen to Firebase Auth state for Google Drive & Spreadsheet
    const unsubscribe = initAuth(
      (user, token) => {
        setIsDriveConnected(!!token);
        setGoogleUserEmail(user.email);
        setSyncState(getCloudSyncState());
      },
      () => {
        setIsDriveConnected(false);
        setGoogleUserEmail(null);
      }
    );

    getAccessToken().then(token => {
      if (token) setIsDriveConnected(true);
    });

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  const handleRoleSelect = (selected: UserSession) => {
    setCurrentUser(selected);
    setUser(selected);
    setShowRoleDropdown(false);
  };

  const handleManualCloudSync = async () => {
    try {
      setIsManualSyncing(true);
      await pushDataToGoogleCloud();
      setSyncState(getCloudSyncState());
    } catch (err) {
      console.warn('Manual cloud sync error:', err);
    } finally {
      setIsManualSyncing(false);
    }
  };

  const handleGoogleDriveConnect = async () => {
    if (isDriveConnected) {
      setShowDisconnectConfirm(true);
      return;
    }

    try {
      setIsAuthenticating(true);
      setAuthError(null);
      const res = await googleSignIn();
      if (res) {
        setIsDriveConnected(true);
        setGoogleUserEmail(res.user.email);
        await pullDataFromGoogleCloud(res.accessToken);
        setSyncState(getCloudSyncState());
      }
    } catch (err: any) {
      setAuthError(err.message || 'Gagal menghubungkan Akun Google');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleConfirmDisconnect = async () => {
    await logoutGoogle();
    setIsDriveConnected(false);
    setGoogleUserEmail(null);
    setShowDisconnectConfirm(false);
    if (onLogout) {
      onLogout();
    }
  };

  const handleEnablePush = async () => {
    const granted = await requestNotificationPermission();
    setPushEnabled(granted);
    if (granted) {
      playNotificationSound();
    }
  };

  const unreadCount = notifikasiList.filter(n => !n.dibaca).length;

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Left section: Mobile toggle & App Title */}
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              aria-label="Toggle Menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5">
              {settings.logoUrl ? (
                <div className="w-9 h-9 rounded-xl overflow-hidden border border-slate-200 bg-white flex items-center justify-center p-0.5 shadow-xs shrink-0">
                  <img
                    src={settings.logoUrl}
                    alt={settings.namaSistem}
                    className="w-full h-full object-contain"
                  />
                </div>
              ) : (
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-sm shadow-blue-500/20 shrink-0 ${
                    settings.warnaAksen === 'emerald'
                      ? 'bg-gradient-to-tr from-emerald-700 via-teal-600 to-emerald-500'
                      : settings.warnaAksen === 'indigo'
                      ? 'bg-gradient-to-tr from-indigo-700 via-purple-600 to-indigo-500'
                      : settings.warnaAksen === 'violet'
                      ? 'bg-gradient-to-tr from-violet-700 via-fuchsia-600 to-purple-500'
                      : settings.warnaAksen === 'slate'
                      ? 'bg-gradient-to-tr from-slate-800 via-slate-700 to-slate-600'
                      : 'bg-gradient-to-tr from-blue-700 via-indigo-600 to-sky-500'
                  }`}
                >
                  <span className="font-bold text-sm tracking-tighter uppercase">
                    {settings.logoSingkatan || 'eA'}
                  </span>
                </div>
              )}
              <div className="hidden sm:block min-w-0 max-w-xs md:max-w-sm lg:max-w-md">
                <div className="flex items-center gap-2">
                  <h1 className="text-sm sm:text-base font-bold text-slate-900 leading-tight truncate">
                    {settings.namaSistem || 'E-Agenda & Disposisi'}
                  </h1>
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                    Live
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium truncate">
                  {settings.subjudulSistem || 'Sistem Tata Naskah & Disposisi Digital'}
                </p>
              </div>
            </div>
          </div>

          {/* Middle: Quick Search Input */}
          <div className="flex-1 max-w-md hidden md:block">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={e => onSearchChange(e.target.value)}
                placeholder="Pencarian cepat nomor agenda, surat, pengirim, atau perihal..."
                className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 focus:border-blue-500 rounded-lg outline-none transition-all text-slate-800 placeholder-slate-400"
              />
              <svg
                className="w-4 h-4 text-slate-400 absolute left-3 top-2.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-2.5 top-2 text-xs text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Right section: Google Drive & Cloud status, Quick Sync, Notifications, Role Switcher */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Google Drive & Cloud Sync Group */}
            {isDriveConnected ? (
              <div className="flex items-center bg-emerald-50/80 border border-emerald-200/90 rounded-lg p-0.5 shadow-xs">
                {/* Sync Now button */}
                <button
                  onClick={handleManualCloudSync}
                  disabled={isManualSyncing || cloudSyncState.status === 'syncing'}
                  className="p-1.5 rounded-md text-emerald-700 hover:text-emerald-900 hover:bg-emerald-100/70 transition-colors cursor-pointer"
                  title="Sinkronkan data sekarang ke Google Drive & Sheets"
                  aria-label="Sinkronkan Sekarang"
                >
                  <RefreshCw
                    className={`w-3.5 h-3.5 ${
                      isManualSyncing || cloudSyncState.status === 'syncing' ? 'animate-spin text-emerald-700' : ''
                    }`}
                  />
                </button>

                {/* Account info & status button */}
                <button
                  onClick={handleGoogleDriveConnect}
                  disabled={isAuthenticating}
                  className="flex items-center gap-1.5 px-2 py-1 text-xs font-medium text-emerald-900 hover:bg-emerald-100/60 rounded-md transition-colors cursor-pointer"
                  title={`Akun Google: ${googleUserEmail || 'Terhubung'}. Terakhir sinkron: ${cloudSyncState.lastSyncTime || 'Baru saja'}. Klik untuk pengaturan koneksi.`}
                >
                  <Cloud className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="hidden xl:inline max-w-[130px] truncate text-[11px] font-semibold">
                    {googleUserEmail ? googleUserEmail.split('@')[0] : 'Cloud Aktif'}
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleGoogleDriveConnect}
                disabled={isAuthenticating}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 hover:border-slate-400 shadow-xs transition-colors cursor-pointer"
                title="Hubungkan Akun Google untuk sinkronisasi otomatis Google Drive & Spreadsheet antar-komputer"
              >
                <Cloud className="w-3.5 h-3.5 text-blue-600" />
                <span className="hidden sm:inline">Sinkron Google</span>
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              </button>
            )}

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifPopover(!showNotifPopover)}
                className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                aria-label="Pusat Notifikasi"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white ring-2 ring-white">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Notif Popover */}
              {showNotifPopover && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200 p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-xs text-slate-900">Notifikasi Dokumen</span>
                      {unreadCount > 0 && (
                        <span className="px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-rose-100 text-rose-700">
                          {unreadCount} Baru
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {!pushEnabled && (
                        <button
                          onClick={handleEnablePush}
                          className="text-[11px] font-medium text-blue-600 hover:underline flex items-center gap-0.5"
                          title="Aktifkan push notification peramban"
                        >
                          <Volume2 className="w-3 h-3" />
                          Aktifkan Push
                        </button>
                      )}
                      <button
                        onClick={markAllNotifikasiRead}
                        className="text-[11px] text-slate-500 hover:text-blue-600"
                      >
                        Tandai Semua Dibaca
                      </button>
                    </div>
                  </div>

                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 mt-1">
                    {notifikasiList.length === 0 ? (
                      <div className="py-6 text-center text-xs text-slate-400">
                        Tidak ada notifikasi saat ini
                      </div>
                    ) : (
                      notifikasiList.map(n => (
                        <div
                          key={n.id}
                          onClick={() => {
                            markNotifikasiRead(n.id);
                            if (n.suratId && onSelectSuratFromNotif) {
                              onSelectSuratFromNotif(n.suratId);
                              setShowNotifPopover(false);
                            }
                          }}
                          className={`p-2.5 rounded-lg text-left cursor-pointer transition-colors ${
                            n.dibaca ? 'hover:bg-slate-50' : 'bg-blue-50/60 hover:bg-blue-50'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-1">
                            <span className={`text-xs font-semibold ${n.dibaca ? 'text-slate-800' : 'text-blue-900'}`}>
                              {n.judul}
                            </span>
                            <span className="text-[10px] text-slate-400 shrink-0">{n.waktu.slice(11)}</span>
                          </div>
                          <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-2">{n.pesan}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Role & User Switcher */}
            <div className="relative">
              <button
                onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                className="flex items-center gap-2 pl-2 pr-1.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
                title="Beralih peran hak akses"
              >
                <UserAvatar
                  nama={currentUser.nama}
                  avatarUrl={currentUser.avatar}
                  role={currentUser.role}
                  size="xs"
                  className="w-7 h-7"
                />
                <div className="text-left hidden sm:block">
                  <div className="text-xs font-semibold text-slate-800 leading-tight">
                    {currentUser.nama.split(' ')[0]}
                  </div>
                  <div className="text-[10px] font-medium text-slate-500">
                    {currentUser.role}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* Quick Logout Button */}
              <button
                onClick={() => setShowLogoutConfirm(true)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 transition-colors cursor-pointer hidden sm:flex items-center justify-center"
                title="Keluar dari Akun (Logout)"
                aria-label="Logout"
              >
                <LogOut className="w-4 h-4 text-rose-500" />
              </button>

              {/* Role Dropdown */}
              {showRoleDropdown && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-2 py-1.5 mb-1.5 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                      <Shield className="w-3.5 h-3.5 text-blue-600" />
                      Manajemen Hak Akses (RBAC)
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      Pilih akun pengguna aktif:
                    </p>
                  </div>

                  {userList.length === 0 ? (
                    <div className="p-3 text-center text-xs text-slate-500">
                      <p className="mb-2">Belum ada akun pengguna terdaftar.</p>
                      <span className="text-[11px] text-blue-600 font-semibold">
                        Buka tab Hak Akses untuk menambah akun pribadi
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-1 max-h-64 overflow-y-auto">
                      {userList.map(u => (
                        <button
                          key={u.id}
                          onClick={() => handleRoleSelect(u)}
                          className={`w-full flex items-center gap-2.5 p-2 rounded-lg text-left text-xs transition-colors ${
                            currentUser.id === u.id
                              ? 'bg-blue-50 text-blue-900 font-semibold'
                              : 'hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <UserAvatar
                            nama={u.nama}
                            avatarUrl={u.avatar}
                            role={u.role}
                            size="xs"
                            className="w-7 h-7"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="text-xs truncate">{u.nama}</div>
                            <div className="text-[10px] text-slate-500 flex items-center gap-1">
                              <span className="px-1 py-0.2 bg-slate-200/80 rounded font-medium text-slate-700">
                                {u.role}
                              </span>
                              <span className="truncate">{u.unitKerja}</span>
                            </div>
                          </div>
                          {currentUser.id === u.id && (
                            <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                          )}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Dropdown Logout Action */}
                  <div className="pt-2 mt-2 border-t border-slate-100">
                    <button
                      onClick={() => {
                        setShowRoleDropdown(false);
                        setShowLogoutConfirm(true);
                      }}
                      className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Keluar dari Sistem (Logout)</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="pb-3 md:hidden">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={e => onSearchChange(e.target.value)}
              placeholder="Cari nomor agenda, surat, pengirim..."
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400"
            />
            <svg
              className="w-4 h-4 text-slate-400 absolute left-3 top-2.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Disconnect Google Account Modal */}
      <ConfirmDeleteModal
        isOpen={showDisconnectConfirm}
        onClose={() => setShowDisconnectConfirm(false)}
        onConfirm={handleConfirmDisconnect}
        title="Putuskan Koneksi Akun Google?"
        description="Sinkronisasi otomatis ke Google Spreadsheet dan unggah berkas ke Google Drive akan dinonaktifkan sementara sampai Anda menghubungkannya kembali."
        details={
          googleUserEmail
            ? [{ label: 'Akun Terhubung', value: googleUserEmail }]
            : []
        }
        confirmButtonText="Ya, Putuskan Koneksi"
      />

      {/* Logout Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={async () => {
          await logoutGoogle();
          logoutUser();
          setShowLogoutConfirm(false);
          if (onLogout) {
            onLogout();
          }
        }}
        title="Keluar dari Sistem (Logout)?"
        description="Sesi pengguna Anda saat ini akan diakhiri dan aplikasi akan dialihkan kembali ke Halaman Menu Login."
        details={[
          { label: 'Pengguna', value: currentUser.nama },
          { label: 'Peran', value: currentUser.role },
          { label: 'Unit Kerja', value: currentUser.unitKerja },
        ]}
        confirmButtonText="Ya, Keluar dari Sistem"
      />
    </header>
  );
};
