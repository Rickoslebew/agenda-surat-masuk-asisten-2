import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Inbox,
  GitPullRequest,
  Camera,
  FileSpreadsheet,
  Users,
  X,
  FileCheck2,
  Sparkles,
  Settings,
  LogOut,
} from 'lucide-react';
import { UserSession, AppSettings } from '../types';
import { UserAvatar } from './UserAvatar';
import { getAppSettings, logoutUser } from '../services/storage';

export type NavTab = 'dashboard' | 'agenda' | 'disposisi' | 'verifikasi_fisik' | 'laporan' | 'rbac' | 'pengaturan';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  currentUser: UserSession;
  countBaru: number;
  countDisposisiAktif: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isOpenMobile,
  onCloseMobile,
  currentUser,
  countBaru,
  countDisposisiAktif,
}) => {
  const [appSettings, setAppSettings] = useState<AppSettings>(getAppSettings());

  useEffect(() => {
    const handleUpdate = () => {
      setAppSettings(getAppSettings());
    };
    window.addEventListener('eagenda_settings_updated', handleUpdate);
    return () => window.removeEventListener('eagenda_settings_updated', handleUpdate);
  }, []);

  const menuItems = [
    {
      id: 'dashboard' as NavTab,
      label: 'Dasbor Analitik',
      icon: LayoutDashboard,
      desc: 'Statistik & performa real-time',
    },
    {
      id: 'agenda' as NavTab,
      label: 'Buku Agenda Masuk',
      icon: Inbox,
      desc: 'Pencatatan surat & status',
      badge: countBaru > 0 ? `${countBaru} Baru` : undefined,
      badgeColor: 'bg-blue-600 text-white',
    },
    {
      id: 'disposisi' as NavTab,
      label: 'Lembar Disposisi',
      icon: GitPullRequest,
      desc: 'Arah disposisi & tindak lanjut',
      badge: countDisposisiAktif > 0 ? `${countDisposisiAktif}` : undefined,
      badgeColor: 'bg-amber-500 text-white',
    },
    {
      id: 'verifikasi_fisik' as NavTab,
      label: 'Serah Terima Fisik & Drive',
      icon: Camera,
      desc: 'Foto bukti & arsip awan',
    },
    {
      id: 'laporan' as NavTab,
      label: 'Ekspor PDF & Excel',
      icon: FileSpreadsheet,
      desc: 'Cetak disposisi & rekap data',
    },
    {
      id: 'rbac' as NavTab,
      label: 'Hak Akses & Pengguna',
      icon: Users,
      desc: 'Wewenang & keamanan data',
    },
    {
      id: 'pengaturan' as NavTab,
      label: 'Pengaturan Tampilan',
      icon: Settings,
      desc: 'Nama sistem & identitas kantor',
    },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed lg:sticky top-0 lg:top-16 left-0 z-40 lg:z-10 h-screen lg:h-[calc(100vh-4rem)] w-64 bg-slate-900 text-slate-200 border-r border-slate-800 flex flex-col justify-between transition-transform duration-200 ease-in-out shrink-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-4 flex-1 overflow-y-auto">
          {/* Header in mobile */}
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800 lg:hidden">
            <div className="flex items-center gap-2 min-w-0">
              {appSettings.logoUrl ? (
                <div className="w-8 h-8 rounded-lg overflow-hidden bg-white p-0.5 shrink-0">
                  <img
                    src={appSettings.logoUrl}
                    alt="Logo"
                    className="w-full h-full object-contain"
                  />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white text-xs shrink-0 uppercase">
                  {appSettings.logoSingkatan || 'eA'}
                </div>
              )}
              <span className="font-bold text-white text-xs truncate">
                {appSettings.namaSistem || 'Menu Utama'}
              </span>
            </div>
            <button
              onClick={onCloseMobile}
              className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User mini badge */}
          <div className="p-3 mb-4 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5 min-w-0">
              <UserAvatar
                nama={currentUser.nama}
                avatarUrl={currentUser.avatar}
                role={currentUser.role}
                size="sm"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-bold text-white truncate">
                    {currentUser.role}
                  </span>
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <div className="text-xs text-slate-200 font-semibold truncate mt-0.5">
                  {currentUser.nama}
                </div>
                <div className="text-[10px] text-slate-400 truncate">
                  {currentUser.unitKerja}
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                logoutUser();
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-700/60 transition-colors cursor-pointer shrink-0"
              title="Keluar dari Akun (Logout)"
              aria-label="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1">
            {menuItems.map(item => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectTab(item.id);
                    onCloseMobile();
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-semibold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? 'text-white' : 'text-slate-400'
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs leading-none flex items-center justify-between">
                      <span className="truncate">{item.label}</span>
                      {item.badge && (
                        <span
                          className={`ml-2 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${item.badgeColor}`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <div
                      className={`text-[10px] mt-1 truncate ${
                        isActive ? 'text-blue-100' : 'text-slate-400'
                      }`}
                    >
                      {item.desc}
                    </div>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer info in sidebar */}
        <div className="p-3.5 border-t border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2 text-slate-400 text-[11px]">
            <FileCheck2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <div className="min-w-0">
              <div className="font-semibold text-slate-300">TNDE Digital v2.4</div>
              <div className="text-[10px] text-slate-400">Standar Persuratan Digital</div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
