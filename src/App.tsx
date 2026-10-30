import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar, NavTab } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { AgendaSuratList } from './components/AgendaSuratList';
import { DisposisiBoard } from './components/DisposisiBoard';
import { VerifikasiFisikDriveTab } from './components/VerifikasiFisikDriveTab';
import { LaporanEksporTab } from './components/LaporanEksporTab';
import { UserManagementTab } from './components/UserManagementTab';
import { PengaturanTampilanTab } from './components/PengaturanTampilanTab';
import { SuratModal } from './components/SuratModal';
import { DisposisiModal } from './components/DisposisiModal';
import { TindakLanjutModal } from './components/TindakLanjutModal';
import { SerahTerimaModal } from './components/SerahTerimaModal';
import { SuratDetailModal } from './components/SuratDetailModal';
import { LembarDisposisiPrint } from './components/LembarDisposisiPrint';
import { LoginScreen } from './components/LoginScreen';
import { SuratMasuk, DisposisiItem, BuktiSerahTerima, UserSession, PejabatUnit, BuktiFotoDisposisi } from './types';
import {
  getSuratList,
  getCurrentUser,
  addSuratMasuk,
  updateSuratMasuk,
  deleteSuratMasuk,
  deleteDisposisi,
  buatDisposisiPimpinan,
  updateTindakLanjutDisposisi,
  isUserLoggedIn,
  logoutUser,
} from './services/storage';
import { syncAllSuratToGoogleSheets } from './services/googleSheetsService';
import { getAccessToken } from './services/authGoogleDrive';
import { triggerDebouncedCloudSync, pullDataFromGoogleCloud } from './services/cloudSyncService';
import {
  LayoutDashboard,
  Inbox,
  GitPullRequest,
  Camera,
  FileSpreadsheet,
  Users,
  Settings,
} from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(isUserLoggedIn());
  const [currentUser, setCurrentUser] = useState<UserSession>(getCurrentUser());
  const [suratList, setSuratList] = useState<SuratMasuk[]>(getSuratList());
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

  // Modals state
  const [isNewSuratOpen, setIsNewSuratOpen] = useState<boolean>(false);
  const [suratToEdit, setSuratToEdit] = useState<SuratMasuk | null>(null);
  const [selectedSurat, setSelectedSurat] = useState<SuratMasuk | null>(null);
  const [selectedDisposisi, setSelectedDisposisi] = useState<DisposisiItem | null>(null);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
  const [isDisposisiModalOpen, setIsDisposisiModalOpen] = useState<boolean>(false);
  const [isTindakLanjutModalOpen, setIsTindakLanjutModalOpen] = useState<boolean>(false);
  const [isSerahTerimaModalOpen, setIsSerahTerimaModalOpen] = useState<boolean>(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState<boolean>(false);

  // Listen to storage sync events
  useEffect(() => {
    const handleSync = () => {
      setSuratList(getSuratList());
      setCurrentUser(getCurrentUser());
      setIsAuthenticated(isUserLoggedIn());
    };
    window.addEventListener('eagenda_data_updated', handleSync);
    return () => window.removeEventListener('eagenda_data_updated', handleSync);
  }, []);

  // Automatic pull from Google Drive cloud storage on startup if logged in with Google
  useEffect(() => {
    getAccessToken().then(async token => {
      if (token) {
        try {
          const res = await pullDataFromGoogleCloud(token);
          if (res.success) {
            setSuratList(getSuratList());
            setCurrentUser(getCurrentUser());
          }
          // Organize all application files into single dedicated folder in Google Drive
          import('./services/driveFolderService')
            .then(({ organizeAllAppFilesInFolder }) => {
              organizeAllAppFilesInFolder(token).catch(console.warn);
            })
            .catch(console.warn);
        } catch (err) {
          console.warn('Auto cloud sync on mount notice:', err);
        }
      }
    });
  }, []);

  // Handlers for modal openings
  const handleOpenDetail = (surat: SuratMasuk) => {
    setSelectedSurat(surat);
    setIsDetailModalOpen(true);
  };

  const handleOpenNew = () => {
    setSuratToEdit(null);
    setIsNewSuratOpen(true);
  };

  const handleOpenEdit = (surat: SuratMasuk) => {
    setSuratToEdit(surat);
    setIsNewSuratOpen(true);
  };

  const handleOpenDisposisi = (surat: SuratMasuk) => {
    setSelectedSurat(surat);
    setIsDisposisiModalOpen(true);
  };

  const handleOpenTindakLanjut = (surat: SuratMasuk, disp: DisposisiItem) => {
    setSelectedSurat(surat);
    setSelectedDisposisi(disp);
    setIsTindakLanjutModalOpen(true);
  };

  const handleOpenSerahTerima = (surat: SuratMasuk) => {
    setSelectedSurat(surat);
    setIsSerahTerimaModalOpen(true);
  };

  const handleOpenPrint = (surat: SuratMasuk) => {
    setSelectedSurat(surat);
    setIsPrintModalOpen(true);
  };

  // Trigger background sync to Google Sheets and Google Drive if user is connected
  const triggerAutoSync = (updatedList: SuratMasuk[]) => {
    // 1. Google Sheets sync
    getAccessToken().then(token => {
      if (token) {
        syncAllSuratToGoogleSheets(updatedList).catch(err => {
          console.warn('Auto sync Google Sheets background error:', err);
        });
      }
    });
    // 2. Google Drive full JSON database cloud sync
    triggerDebouncedCloudSync();
  };

  // CRUD actions
  const handleSaveNewSurat = (data: any) => {
    addSuratMasuk(data);
    const refreshed = getSuratList();
    setSuratList(refreshed);
    triggerAutoSync(refreshed);
  };

  const handleUpdateSurat = (id: string, updates: Partial<SuratMasuk>) => {
    updateSuratMasuk(id, updates);
    const refreshed = getSuratList();
    setSuratList(refreshed);
    if (selectedSurat?.id === id) {
      const refreshedItem = refreshed.find(s => s.id === id);
      if (refreshedItem) setSelectedSurat(refreshedItem);
    }
    triggerAutoSync(refreshed);
  };

  const handleDeleteSurat = (id: string) => {
    deleteSuratMasuk(id);
    const refreshed = getSuratList();
    setSuratList(refreshed);
    if (selectedSurat?.id === id) {
      setSelectedSurat(null);
      setIsDetailModalOpen(false);
    }
    triggerAutoSync(refreshed);
  };

  const handleDeleteDisposisi = (suratId: string, disposisiId: string) => {
    deleteDisposisi(suratId, disposisiId);
    const refreshed = getSuratList();
    setSuratList(refreshed);
    if (selectedSurat?.id === suratId) {
      const found = refreshed.find(s => s.id === suratId);
      setSelectedSurat(found || null);
    }
    triggerAutoSync(refreshed);
  };

  const handleSubmitDisposisi = (
    suratId: string,
    instansiTujuan: string,
    namaPenerimaBerkas: string,
    instruksi: string[],
    catatanKhusus: string,
    batasWaktu?: string,
    tujuanJabatan?: string
  ) => {
    buatDisposisiPimpinan(
      suratId,
      instansiTujuan,
      namaPenerimaBerkas,
      instruksi,
      catatanKhusus,
      batasWaktu,
      tujuanJabatan
    );
    const refreshed = getSuratList();
    setSuratList(refreshed);
    if (selectedSurat?.id === suratId) {
      const refreshedItem = refreshed.find(s => s.id === suratId);
      if (refreshedItem) setSelectedSurat(refreshedItem);
    }
    triggerAutoSync(refreshed);
  };

  const handleSubmitTindakLanjut = (
    suratId: string,
    disposisiId: string,
    status: 'Menunggu' | 'Sedang Diproses' | 'Selesai',
    progresPersen: number,
    keteranganProgres: string,
    namaPelaksana: string,
    laporanHasil?: string,
    buktiFoto?: BuktiFotoDisposisi
  ) => {
    updateTindakLanjutDisposisi(
      suratId,
      disposisiId,
      status,
      progresPersen,
      keteranganProgres,
      namaPelaksana,
      laporanHasil,
      buktiFoto
    );
    const refreshed = getSuratList();
    setSuratList(refreshed);
    if (selectedSurat?.id === suratId) {
      const refreshedItem = refreshed.find(s => s.id === suratId);
      if (refreshedItem) setSelectedSurat(refreshedItem);
    }
    triggerAutoSync(refreshed);
  };

  const handleSaveBukti = (suratId: string, bukti: BuktiSerahTerima) => {
    updateSuratMasuk(suratId, { buktiFisik: bukti });
    const refreshed = getSuratList();
    setSuratList(refreshed);
    if (selectedSurat?.id === suratId) {
      const refreshedItem = refreshed.find(s => s.id === suratId);
      if (refreshedItem) setSelectedSurat(refreshedItem);
    }
    triggerAutoSync(refreshed);
  };

  const handleSelectSuratFromNotif = (suratId: string) => {
    const s = suratList.find(item => item.id === suratId);
    if (s) {
      handleOpenDetail(s);
    }
  };

  // Badge calculations
  const countBaru = suratList.filter(s => s.status === 'Baru Masuk').length;
  const countDisposisiAktif = suratList.flatMap(s => s.disposisiList).filter(d => d.status !== 'Selesai').length;

  // If user is not authenticated, render the dedicated LoginScreen
  if (!isAuthenticated) {
    return (
      <LoginScreen
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          setIsAuthenticated(true);
          setSuratList(getSuratList());
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-800 flex flex-col font-sans antialiased">
      {/* Global Application Header */}
      <Header
        onToggleSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSelectSuratFromNotif={handleSelectSuratFromNotif}
        onLogout={() => {
          logoutUser();
          setIsAuthenticated(false);
        }}
      />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Sidebar Navigation */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={tab => {
            setCurrentTab(tab);
            setIsMobileSidebarOpen(false);
          }}
          isOpenMobile={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
          currentUser={currentUser}
          countBaru={countBaru}
          countDisposisiAktif={countDisposisiAktif}
        />

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 pb-20 lg:pb-8">
          {currentTab === 'dashboard' && (
            <Dashboard
              suratList={suratList}
              currentUser={currentUser}
              onNavigate={setCurrentTab}
              onOpenSuratDetail={handleOpenDetail}
              onOpenDisposisiModal={handleOpenDisposisi}
              onOpenNewSuratModal={handleOpenNew}
            />
          )}

          {currentTab === 'agenda' && (
            <AgendaSuratList
              suratList={suratList}
              currentUser={currentUser}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onOpenNewModal={handleOpenNew}
              onOpenEditModal={handleOpenEdit}
              onOpenDetailModal={handleOpenDetail}
              onOpenDisposisiModal={handleOpenDisposisi}
              onOpenSerahTerimaModal={handleOpenSerahTerima}
              onOpenPrintModal={handleOpenPrint}
              onDeleteSurat={handleDeleteSurat}
            />
          )}

          {currentTab === 'disposisi' && (
            <DisposisiBoard
              suratList={suratList}
              currentUser={currentUser}
              onOpenTindakLanjutModal={handleOpenTindakLanjut}
              onOpenSuratDetail={handleOpenDetail}
              onOpenPrintDisposisi={handleOpenPrint}
              onOpenBuatDisposisi={handleOpenDisposisi}
              onDeleteDisposisi={handleDeleteDisposisi}
            />
          )}

          {currentTab === 'verifikasi_fisik' && (
            <VerifikasiFisikDriveTab
              suratList={suratList}
              currentUser={currentUser}
              onOpenSerahTerimaModal={handleOpenSerahTerima}
              onOpenDetailModal={handleOpenDetail}
            />
          )}

          {currentTab === 'laporan' && (
            <LaporanEksporTab
              suratList={suratList}
              onOpenPrintModal={handleOpenPrint}
            />
          )}

          {currentTab === 'rbac' && (
            <UserManagementTab
              currentUser={currentUser}
              onUserChanged={setCurrentUser}
            />
          )}

          {currentTab === 'pengaturan' && (
            <PengaturanTampilanTab />
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar for rapid thumb reach */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-slate-200 px-2 py-1.5 flex items-center justify-around shadow-lg">
        <button
          onClick={() => setCurrentTab('dashboard')}
          className={`flex flex-col items-center gap-0.5 p-1 text-[10px] font-semibold ${
            currentTab === 'dashboard' ? 'text-blue-600' : 'text-slate-500'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Dasbor</span>
        </button>

        <button
          onClick={() => setCurrentTab('agenda')}
          className={`flex flex-col items-center gap-0.5 p-1 text-[10px] font-semibold relative ${
            currentTab === 'agenda' ? 'text-blue-600' : 'text-slate-500'
          }`}
        >
          <Inbox className="w-4 h-4" />
          <span>Agenda</span>
          {countBaru > 0 && (
            <span className="absolute top-0 right-2 w-2 h-2 rounded-full bg-blue-600" />
          )}
        </button>

        <button
          onClick={() => setCurrentTab('disposisi')}
          className={`flex flex-col items-center gap-0.5 p-1 text-[10px] font-semibold relative ${
            currentTab === 'disposisi' ? 'text-blue-600' : 'text-slate-500'
          }`}
        >
          <GitPullRequest className="w-4 h-4" />
          <span>Disposisi</span>
          {countDisposisiAktif > 0 && (
            <span className="absolute top-0 right-2 w-2 h-2 rounded-full bg-amber-500" />
          )}
        </button>

        <button
          onClick={() => setCurrentTab('verifikasi_fisik')}
          className={`flex flex-col items-center gap-0.5 p-1 text-[10px] font-semibold ${
            currentTab === 'verifikasi_fisik' ? 'text-blue-600' : 'text-slate-500'
          }`}
        >
          <Camera className="w-4 h-4" />
          <span>Fisik & Drive</span>
        </button>

        <button
          onClick={() => setCurrentTab('laporan')}
          className={`flex flex-col items-center gap-0.5 p-1 text-[10px] font-semibold ${
            currentTab === 'laporan' ? 'text-blue-600' : 'text-slate-500'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Ekspor</span>
        </button>

        <button
          onClick={() => setCurrentTab('rbac')}
          className={`flex flex-col items-center gap-0.5 p-1 text-[10px] font-semibold ${
            currentTab === 'rbac' ? 'text-blue-600' : 'text-slate-500'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Akses</span>
        </button>

        <button
          onClick={() => setCurrentTab('pengaturan')}
          className={`flex flex-col items-center gap-0.5 p-1 text-[10px] font-semibold ${
            currentTab === 'pengaturan' ? 'text-blue-600' : 'text-slate-500'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Seting</span>
        </button>
      </nav>

      {/* Modals Container */}
      <SuratModal
        isOpen={isNewSuratOpen}
        onClose={() => {
          setIsNewSuratOpen(false);
          setSuratToEdit(null);
        }}
        onSave={handleSaveNewSurat}
        onUpdate={handleUpdateSurat}
        suratToEdit={suratToEdit}
        currentUser={currentUser}
        totalSuratCount={suratList.length}
      />

      <DisposisiModal
        isOpen={isDisposisiModalOpen}
        onClose={() => setIsDisposisiModalOpen(false)}
        surat={selectedSurat}
        currentUser={currentUser}
        onSubmitDisposisi={handleSubmitDisposisi}
      />

      <TindakLanjutModal
        isOpen={isTindakLanjutModalOpen}
        onClose={() => setIsTindakLanjutModalOpen(false)}
        surat={selectedSurat}
        disposisi={selectedDisposisi}
        currentUser={currentUser}
        onSubmitTindakLanjut={handleSubmitTindakLanjut}
      />

      <SerahTerimaModal
        isOpen={isSerahTerimaModalOpen}
        onClose={() => setIsSerahTerimaModalOpen(false)}
        surat={selectedSurat}
        currentUser={currentUser}
        onSaveBukti={handleSaveBukti}
      />

      <SuratDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        surat={selectedSurat}
        currentUser={currentUser}
        onOpenEdit={handleOpenEdit}
        onOpenDisposisi={handleOpenDisposisi}
        onOpenSerahTerima={handleOpenSerahTerima}
        onOpenPrint={handleOpenPrint}
        onOpenTindakLanjut={handleOpenTindakLanjut}
        onDeleteSurat={handleDeleteSurat}
        onDeleteDisposisi={handleDeleteDisposisi}
      />

      <LembarDisposisiPrint
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        surat={selectedSurat}
      />
    </div>
  );
}
