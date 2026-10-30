import React, { useState } from 'react';
import {
  Shield,
  Users,
  UserPlus,
  CheckCircle2,
  Lock,
  Eye,
  Edit3,
  Trash2,
  RefreshCw,
  Sparkles,
  KeyRound,
  Mail,
  Briefcase,
  Building2,
  Phone,
  Image as ImageIcon,
  Check,
  X,
  AlertTriangle,
  Info,
  Search,
  Crown,
  Key,
} from 'lucide-react';
import { UserSession, Role } from '../types';
import {
  getUsersList,
  getCurrentUser,
  setCurrentUser,
  addUser,
  updateUser,
  deleteUser,
  clearAllUsers,
  PRESET_AVATARS,
  resetToSampleData,
  SUPERADMIN_ACCOUNT,
  SUPERADMIN_MASTER_KEY,
} from '../services/storage';
import { UserAvatar, getInitials } from './UserAvatar';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';

interface UserManagementTabProps {
  currentUser: UserSession;
  onUserChanged: (u: UserSession) => void;
}

export const UserManagementTab: React.FC<UserManagementTabProps> = ({
  currentUser,
  onUserChanged,
}) => {
  const [users, setUsers] = useState<UserSession[]>(getUsersList());
  const [searchFilter, setSearchFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | Role>('all');

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [userToEdit, setUserToEdit] = useState<UserSession | null>(null);
  const [userToDelete, setUserToDelete] = useState<UserSession | null>(null);
  const [isConfirmClearAll, setIsConfirmClearAll] = useState(false);

  // Form states (shared for add/edit)
  const [nama, setNama] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('123456');
  const [role, setRole] = useState<Role>('Admin');
  const [jabatan, setJabatan] = useState('');
  const [unitKerja, setUnitKerja] = useState('');
  const [nomorTelepon, setNomorTelepon] = useState('');
  const [avatarType, setAvatarType] = useState<'preset' | 'initials' | 'custom'>('preset');
  const [selectedPresetAvatar, setSelectedPresetAvatar] = useState(PRESET_AVATARS[0].url);
  const [customAvatarUrl, setCustomAvatarUrl] = useState('');
  const [formError, setFormError] = useState('');

  const refreshList = () => {
    const list = getUsersList();
    setUsers(list);
    const curr = getCurrentUser();
    onUserChanged(curr);
  };

  const handleOpenAddModal = (presetRole?: Role) => {
    setUserToEdit(null);
    setNama('');
    setEmail('');
    setPassword('123456');
    setRole(presetRole || 'Admin');
    setJabatan(
      presetRole === 'Pimpinan'
        ? 'Kepala Dinas / Pimpinan'
        : presetRole === 'Admin'
        ? 'Pengadministrasi Persuratan & Arsip'
        : presetRole === 'Auditor'
        ? 'Pengawas Internal'
        : 'Kepala Seksi / Staf Pelaksana'
    );
    setUnitKerja(
      presetRole === 'Pimpinan'
        ? 'Pimpinan Eksekutif'
        : presetRole === 'Auditor'
        ? 'Inspektorat'
        : 'Sub Bagian Umum & Tata Usaha'
    );
    setNomorTelepon('');
    setAvatarType('preset');
    setSelectedPresetAvatar(PRESET_AVATARS[0].url);
    setCustomAvatarUrl('');
    setFormError('');
    setShowAddModal(true);
  };

  const handleOpenEditModal = (user: UserSession) => {
    setUserToEdit(user);
    setNama(user.nama);
    setEmail(user.email);
    setPassword(user.password || '123456');
    setRole(user.role);
    setJabatan(user.jabatan);
    setUnitKerja(user.unitKerja);
    setNomorTelepon(user.nomorTelepon || '');

    const foundPreset = PRESET_AVATARS.find(p => p.url === user.avatar);
    if (!user.avatar || user.avatar.trim() === '') {
      setAvatarType('initials');
      setSelectedPresetAvatar(PRESET_AVATARS[0].url);
      setCustomAvatarUrl('');
    } else if (foundPreset) {
      setAvatarType('preset');
      setSelectedPresetAvatar(user.avatar);
      setCustomAvatarUrl('');
    } else {
      setAvatarType('custom');
      setSelectedPresetAvatar(PRESET_AVATARS[0].url);
      setCustomAvatarUrl(user.avatar);
    }

    setFormError('');
    setShowAddModal(true);
  };

  const handleSwitchUser = (user: UserSession) => {
    setCurrentUser(user);
    onUserChanged(user);
  };

  const handleDeleteSingleUser = (user: UserSession) => {
    setUserToDelete(user);
  };

  const handleClearAllUsers = () => {
    setIsConfirmClearAll(true);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama.trim()) {
      setFormError('Nama lengkap dan gelar wajib diisi!');
      return;
    }
    if (!email.trim()) {
      setFormError('Alamat email wajib diisi!');
      return;
    }

    let finalAvatar = '';
    if (avatarType === 'preset') {
      finalAvatar = selectedPresetAvatar;
    } else if (avatarType === 'custom') {
      finalAvatar = customAvatarUrl.trim();
    } else {
      finalAvatar = ''; // Initials mode
    }

    if (userToEdit) {
      // Edit existing user
      updateUser(userToEdit.id, {
        nama: nama.trim(),
        email: email.trim(),
        password: password.trim() || '123456',
        role,
        jabatan: jabatan.trim() || 'Staf',
        unitKerja: unitKerja.trim() || 'Unit Kerja Terkait',
        nomorTelepon: nomorTelepon.trim() || undefined,
        avatar: finalAvatar,
      });
    } else {
      // Add new user
      addUser({
        nama: nama.trim(),
        email: email.trim(),
        password: password.trim() || '123456',
        role,
        jabatan: jabatan.trim() || (role === 'Pimpinan' ? 'Kepala Kantor' : 'Staf'),
        unitKerja: unitKerja.trim() || 'Bagian Umum',
        nomorTelepon: nomorTelepon.trim() || undefined,
        avatar: finalAvatar,
      });
    }

    refreshList();
    setShowAddModal(false);
  };

  // Filtered users
  const filteredUsers = users.filter(u => {
    const matchesSearch =
      u.nama.toLowerCase().includes(searchFilter.toLowerCase()) ||
      u.email.toLowerCase().includes(searchFilter.toLowerCase()) ||
      u.jabatan.toLowerCase().includes(searchFilter.toLowerCase()) ||
      u.unitKerja.toLowerCase().includes(searchFilter.toLowerCase());

    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const countRole = (r: Role) => users.filter(u => u.role === r).length;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-600 shrink-0" />
                Manajemen Akun Pengguna & Hak Akses (RBAC)
              </h2>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Akun Pribadi
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Atur daftar akun pengguna organisasi Anda sendiri. Edit detail profil, jabatan, wewenang peran, atau hapus kapan saja.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => handleOpenAddModal()}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              Tambah Akun Pengguna
            </button>

            {users.length > 0 && (
              <button
                onClick={handleClearAllUsers}
                className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 hover:text-rose-800 rounded-lg text-xs font-semibold border border-rose-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Hapus semua akun pengguna dan kosongkan daftar"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Hapus Semua Akun
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Superadmin Emergency Backup Card */}
      <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-300 rounded-xl p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 shadow-xs">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                  Akun Superadmin & Master Recovery Key (Cadangan Darurat)
                </h4>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-200 text-amber-900 border border-amber-300">
                  Aktif Permanen
                </span>
              </div>
              <p className="text-[11px] text-slate-600 mt-0.5">
                Jalur darurat jika Anda lupa kata sandi. Username: <strong className="text-slate-900">superadmin</strong> (atau <strong className="text-slate-900">rickochico20@gmail.com</strong>) &bull; Sandi: <strong className="text-amber-800">superadmin123</strong> &bull; Master Key: <code className="bg-white px-1.5 py-0.5 rounded border border-slate-300 text-emerald-700 font-semibold text-[10px]">{SUPERADMIN_MASTER_KEY}</code>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Role Summary Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={() => setRoleFilter(roleFilter === 'Admin' ? 'all' : 'Admin')}
          className={`p-3 rounded-xl border text-left transition-all ${
            roleFilter === 'Admin'
              ? 'bg-blue-50/80 border-blue-400 ring-2 ring-blue-500/20'
              : 'bg-white border-slate-200 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold text-blue-900 mb-1">
            <span>Admin TU</span>
            <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full font-mono text-[11px]">
              {countRole('Admin')}
            </span>
          </div>
          <p className="text-[10px] text-slate-500 line-clamp-1">Input agenda & arsip</p>
        </button>

        <button
          onClick={() => setRoleFilter(roleFilter === 'Pimpinan' ? 'all' : 'Pimpinan')}
          className={`p-3 rounded-xl border text-left transition-all ${
            roleFilter === 'Pimpinan'
              ? 'bg-purple-50/80 border-purple-400 ring-2 ring-purple-500/20'
              : 'bg-white border-slate-200 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold text-purple-900 mb-1">
            <span>Pimpinan</span>
            <span className="px-2 py-0.5 bg-purple-100 text-purple-800 rounded-full font-mono text-[11px]">
              {countRole('Pimpinan')}
            </span>
          </div>
          <p className="text-[10px] text-slate-500 line-clamp-1">Otoritas lembar disposisi</p>
        </button>

        <button
          onClick={() => setRoleFilter(roleFilter === 'Penerima Disposisi' ? 'all' : 'Penerima Disposisi')}
          className={`p-3 rounded-xl border text-left transition-all ${
            roleFilter === 'Penerima Disposisi'
              ? 'bg-emerald-50/80 border-emerald-400 ring-2 ring-emerald-500/20'
              : 'bg-white border-slate-200 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold text-emerald-900 mb-1">
            <span>Penerima Disposisi</span>
            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full font-mono text-[11px]">
              {countRole('Penerima Disposisi')}
            </span>
          </div>
          <p className="text-[10px] text-slate-500 line-clamp-1">Kabid / pelaksana arahan</p>
        </button>

        <button
          onClick={() => setRoleFilter(roleFilter === 'Auditor' ? 'all' : 'Auditor')}
          className={`p-3 rounded-xl border text-left transition-all ${
            roleFilter === 'Auditor'
              ? 'bg-amber-50/80 border-amber-400 ring-2 ring-amber-500/20'
              : 'bg-white border-slate-200 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold text-amber-900 mb-1">
            <span>Auditor</span>
            <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full font-mono text-[11px]">
              {countRole('Auditor')}
            </span>
          </div>
          <p className="text-[10px] text-slate-500 line-clamp-1">Pengawas / read-only</p>
        </button>
      </div>

      {/* User Accounts List */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 mb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-slate-700" />
            <h3 className="text-sm font-bold text-slate-900">
              Daftar Akun Pengguna ({users.length})
            </h3>
            {roleFilter !== 'all' && (
              <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md text-[11px] font-medium flex items-center gap-1">
                Filter: {roleFilter}
                <button onClick={() => setRoleFilter('all')} className="hover:text-rose-600 font-bold">×</button>
              </span>
            )}
          </div>

          {/* Search box within user list */}
          {users.length > 0 && (
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={searchFilter}
                onChange={e => setSearchFilter(e.target.value)}
                placeholder="Cari nama, jabatan, email..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-lg outline-none focus:border-blue-500 transition-all"
              />
              {searchFilter && (
                <button
                  onClick={() => setSearchFilter('')}
                  className="absolute right-2.5 top-1.5 text-xs text-slate-400 hover:text-slate-600"
                >
                  ×
                </button>
              )}
            </div>
          )}
        </div>

        {/* Empty state if 0 accounts */}
        {users.length === 0 ? (
          <div className="text-center py-12 px-4 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/60">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mb-3.5 shadow-xs">
              <Users className="w-7 h-7" />
            </div>
            <h4 className="text-base font-bold text-slate-900">
              Daftar Akun Pengguna Masih Kosong
            </h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-6 leading-relaxed">
              Seluruh akun percontohan telah dihapus sesuai permintaan. Anda dapat memasukkan daftar akun pengguna pribadi atau staf kantor Anda sendiri secara mandiri.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 max-w-md mx-auto">
              <button
                onClick={() => handleOpenAddModal('Admin')}
                className="w-full sm:w-auto px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                Tambah Akun Pertama (Admin TU)
              </button>
              <button
                onClick={() => handleOpenAddModal('Pimpinan')}
                className="w-full sm:w-auto px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold shadow-2xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                Tambah Akun Pimpinan
              </button>
            </div>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-10 text-xs text-slate-500">
            Tidak ditemukan akun pengguna yang cocok dengan kata kunci &quot;{searchFilter}&quot;.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredUsers.map(u => {
              const isCurrent = currentUser.id === u.id;
              return (
                <div
                  key={u.id}
                  className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                    isCurrent
                      ? 'border-blue-500 bg-blue-50/60 shadow-xs ring-1 ring-blue-500'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <UserAvatar
                      nama={u.nama}
                      avatarUrl={u.avatar}
                      role={u.role}
                      size="lg"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-slate-900 text-sm truncate">
                          {u.nama}
                        </span>
                        {isCurrent && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-600 text-white shadow-2xs">
                            Sedang Digunakan
                          </span>
                        )}
                      </div>

                      <div className="text-xs font-medium text-slate-700 mt-0.5 truncate">
                        {u.jabatan}
                      </div>

                      <div className="flex items-center gap-2 mt-1.5 flex-wrap text-[11px] text-slate-500">
                        <span
                          className={`px-2 py-0.5 rounded font-semibold text-[10px] ${
                            u.role === 'Admin'
                              ? 'bg-blue-100 text-blue-800'
                              : u.role === 'Pimpinan'
                              ? 'bg-purple-100 text-purple-800'
                              : u.role === 'Penerima Disposisi'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {u.role}
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="truncate flex items-center gap-1">
                          <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                          {u.unitKerja}
                        </span>
                      </div>

                      <div className="mt-2 pt-2 border-t border-slate-100 flex flex-col gap-1 text-[11px] text-slate-600">
                        <div className="flex items-center gap-1.5 truncate">
                          <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate">{u.email}</span>
                        </div>
                        {u.nomorTelepon && (
                          <div className="flex items-center gap-1.5 truncate text-slate-500">
                            <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>{u.nomorTelepon}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenEditModal(u)}
                        className="px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-900 rounded-lg text-xs font-semibold border border-slate-200 flex items-center gap-1 transition-colors cursor-pointer"
                        title="Edit data akun pengguna ini"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-blue-600" />
                        Edit
                      </button>

                      <button
                        onClick={() => handleDeleteSingleUser(u)}
                        className="px-2.5 py-1.5 bg-slate-50 hover:bg-rose-50 text-slate-600 hover:text-rose-700 rounded-lg text-xs font-semibold border border-slate-200 hover:border-rose-200 flex items-center gap-1 transition-colors cursor-pointer"
                        title="Hapus akun pengguna ini"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                        Hapus
                      </button>
                    </div>

                    {!isCurrent && (
                      <button
                        onClick={() => handleSwitchUser(u)}
                        className="px-3 py-1.5 bg-white hover:bg-blue-50 text-blue-600 hover:text-blue-700 rounded-lg text-xs font-bold border border-blue-200 shadow-2xs transition-colors cursor-pointer"
                      >
                        Masuk Sebagai Ini
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* RBAC Permission Matrix Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
          <KeyRound className="w-4 h-4 text-indigo-600" />
          Matriks Hak Akses & Kewenangan Berdasarkan Peran
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Tentukan peran setiap pengguna sesuai fungsi kerja agar integritas surat dan disposisi terjaga.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-y border-slate-200 text-slate-700 font-semibold">
                <th className="py-2.5 px-3">Fungsi / Wewenang Fitur</th>
                <th className="py-2.5 px-3 text-center">Admin (Tata Usaha)</th>
                <th className="py-2.5 px-3 text-center">Pimpinan (Kepala Kantor)</th>
                <th className="py-2.5 px-3 text-center">Penerima Disposisi</th>
                <th className="py-2.5 px-3 text-center">Auditor (Pengawas)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="py-2.5 px-3 font-medium text-slate-800">
                  Input & Edit Agenda Surat Masuk
                </td>
                <td className="py-2.5 px-3 text-center text-emerald-600 font-bold">✓ Penuh</td>
                <td className="py-2.5 px-3 text-center text-emerald-600 font-bold">✓ Bisa</td>
                <td className="py-2.5 px-3 text-center text-slate-300">✕ Tidak</td>
                <td className="py-2.5 px-3 text-center text-slate-300">✕ Tidak</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-medium text-slate-800">
                  Terbitkan Lembar Disposisi & Tentukan Arah Tujuan
                </td>
                <td className="py-2.5 px-3 text-center text-slate-500">Bantu Input</td>
                <td className="py-2.5 px-3 text-center text-indigo-700 font-bold">✓ Otoritas Utama</td>
                <td className="py-2.5 px-3 text-center text-slate-300">✕ Tidak</td>
                <td className="py-2.5 px-3 text-center text-slate-300">✕ Tidak</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-medium text-slate-800">
                  Pembaruan Progres Tindak Lanjut & Laporan Hasil
                </td>
                <td className="py-2.5 px-3 text-center text-slate-400">Monitoring</td>
                <td className="py-2.5 px-3 text-center text-slate-400">Verifikasi</td>
                <td className="py-2.5 px-3 text-center text-emerald-600 font-bold">✓ Penuh</td>
                <td className="py-2.5 px-3 text-center text-slate-300">✕ Read-only</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-medium text-slate-800">
                  Unggah Foto Serah Terima Fisik & Sinkron Google Drive
                </td>
                <td className="py-2.5 px-3 text-center text-emerald-600 font-bold">✓ Penuh</td>
                <td className="py-2.5 px-3 text-center text-emerald-600 font-bold">✓ Penuh</td>
                <td className="py-2.5 px-3 text-center text-slate-500">Lihat / Bukti</td>
                <td className="py-2.5 px-3 text-center text-slate-400">Lihat</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-medium text-slate-800">
                  Ekspor Laporan PDF & Spreadsheet Excel
                </td>
                <td className="py-2.5 px-3 text-center text-emerald-600 font-bold">✓ Penuh</td>
                <td className="py-2.5 px-3 text-center text-emerald-600 font-bold">✓ Penuh</td>
                <td className="py-2.5 px-3 text-center text-emerald-600 font-bold">✓ Penuh</td>
                <td className="py-2.5 px-3 text-center text-emerald-600 font-bold">✓ Penuh</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg my-6 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white text-sm">
                  {userToEdit ? <Edit3 className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold">
                    {userToEdit ? 'Edit Akun Pengguna' : 'Tambah Akun Pengguna Pribadi'}
                  </h3>
                  <p className="text-xs text-blue-200">
                    {userToEdit
                      ? `Perbarui profil dan wewenang ${userToEdit.nama}`
                      : 'Masukkan data staf / pimpinan organisasi Anda'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveUser} className="p-6 space-y-4 max-h-[82vh] overflow-y-auto text-xs">
              {formError && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Live Preview Header */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3">
                <UserAvatar
                  nama={nama || 'Nama Pengguna'}
                  avatarUrl={
                    avatarType === 'preset'
                      ? selectedPresetAvatar
                      : avatarType === 'custom'
                      ? customAvatarUrl
                      : undefined
                  }
                  role={role}
                  size="lg"
                />
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-slate-900 text-xs truncate">
                    {nama || 'Nama Lengkap & Gelar'}
                  </div>
                  <div className="text-[11px] text-slate-600 truncate">
                    {jabatan || 'Jabatan Dinas'}
                  </div>
                  <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                    <span className="font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200">
                      {role}
                    </span>
                    <span>•</span>
                    <span className="truncate">{unitKerja || 'Unit Kerja / Bagian'}</span>
                  </div>
                </div>
              </div>

              {/* Nama Lengkap */}
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Nama Lengkap & Gelar: <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={nama}
                  onChange={e => setNama(e.target.value)}
                  placeholder="Contoh: Riko Chico, S.STP, M.AP"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-blue-500 text-xs"
                />
              </div>

              {/* Alamat Email */}
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Alamat Email: <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="nama.pegawai@instansi.go.id"
                    className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-blue-500 text-xs"
                  />
                </div>
              </div>

              {/* Peran Hak Akses */}
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Peran Hak Akses (Role): <span className="text-rose-500">*</span>
                </label>
                <select
                  value={role}
                  onChange={e => setRole(e.target.value as Role)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-blue-500 text-xs bg-white font-medium text-slate-800"
                >
                  <option value="Admin">Admin (Tata Usaha & Pencatat Surat)</option>
                  <option value="Pimpinan">Pimpinan (Kepala Kantor / Pembuat Disposisi)</option>
                  <option value="Penerima Disposisi">Penerima Disposisi (Kabid / Pelaksana Tindak Lanjut)</option>
                  <option value="Auditor">Auditor (Pengawas / Akses Baca Saja)</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Nama Jabatan */}
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Nama Jabatan: <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Briefcase className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      value={jabatan}
                      onChange={e => setJabatan(e.target.value)}
                      placeholder="Contoh: Kepala Sub Bagian TU"
                      className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-blue-500 text-xs"
                    />
                  </div>
                </div>

                {/* Unit Kerja */}
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Unit Kerja / Bagian: <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Building2 className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      value={unitKerja}
                      onChange={e => setUnitKerja(e.target.value)}
                      placeholder="Contoh: Bagian Umum"
                      className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-blue-500 text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Nomor Telepon / WA */}
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Nomor Telepon / WhatsApp (Opsional):
                </label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={nomorTelepon}
                    onChange={e => setNomorTelepon(e.target.value)}
                    placeholder="Contoh: 0812-3456-7890"
                    className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-blue-500 text-xs"
                  />
                </div>
              </div>

              {/* Kata Sandi Akun */}
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Kata Sandi Akun: <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Key className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Minimal 4 karakter (default: 123456)"
                    className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-blue-500 text-xs font-mono"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Kata sandi ini digunakan untuk masuk pada portal Login.
                </p>
              </div>

              {/* Pilihan Foto Profil / Avatar */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="block font-bold text-slate-800">
                  Foto Profil / Avatar:
                </label>

                {/* Avatar Type Selector */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setAvatarType('preset')}
                    className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold border transition-colors ${
                      avatarType === 'preset'
                        ? 'bg-blue-50 text-blue-800 border-blue-400'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Koleksi Foto Formal
                  </button>
                  <button
                    type="button"
                    onClick={() => setAvatarType('initials')}
                    className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold border transition-colors ${
                      avatarType === 'initials'
                        ? 'bg-blue-50 text-blue-800 border-blue-400'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Inisial Huruf
                  </button>
                  <button
                    type="button"
                    onClick={() => setAvatarType('custom')}
                    className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold border transition-colors ${
                      avatarType === 'custom'
                        ? 'bg-blue-50 text-blue-800 border-blue-400'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    URL Gambar
                  </button>
                </div>

                {/* Sub-inputs based on avatar type */}
                {avatarType === 'preset' && (
                  <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                    {PRESET_AVATARS.map(av => {
                      const isSelected = selectedPresetAvatar === av.url;
                      return (
                        <button
                          key={av.id}
                          type="button"
                          onClick={() => setSelectedPresetAvatar(av.url)}
                          className={`relative p-0.5 rounded-full transition-transform cursor-pointer ${
                            isSelected
                              ? 'ring-2 ring-blue-600 ring-offset-2 scale-105'
                              : 'opacity-80 hover:opacity-100'
                          }`}
                          title={av.label}
                        >
                          <img
                            src={av.url}
                            alt={av.label}
                            className="w-9 h-9 rounded-full object-cover"
                          />
                          {isSelected && (
                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-600 text-white rounded-full flex items-center justify-center text-[9px] shadow-xs">
                              ✓
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}

                {avatarType === 'custom' && (
                  <div>
                    <input
                      type="url"
                      value={customAvatarUrl}
                      onChange={e => setCustomAvatarUrl(e.target.value)}
                      placeholder="https://domain.com/foto-profil.jpg"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-blue-500 text-xs"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      Masukkan tautan URL gambar foto pegawai Anda.
                    </p>
                  </div>
                )}

                {avatarType === 'initials' && (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-3">
                    <UserAvatar nama={nama || 'Pengguna'} role={role} size="md" />
                    <p className="text-[11px] text-slate-500">
                      Avatar akan dibuat otomatis dari inisial nama lengkap ({getInitials(nama || 'Pengguna')}) dengan gradien warna peran {role}.
                    </p>
                  </div>
                )}
              </div>

              {/* Form Actions */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-100 rounded-xl text-slate-700 font-semibold transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md shadow-blue-500/20 transition-all cursor-pointer"
                >
                  {userToEdit ? 'Simpan Perubahan Akun' : 'Tambahkan Akun Pengguna'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal: Delete Single User */}
      <ConfirmDeleteModal
        isOpen={!!userToDelete}
        onClose={() => setUserToDelete(null)}
        onConfirm={() => {
          if (userToDelete) {
            deleteUser(userToDelete.id);
            refreshList();
            setUserToDelete(null);
          }
        }}
        title="Hapus Akun Pengguna"
        description="Apakah Anda yakin ingin menghapus akun pengguna ini dari daftar sistem?"
        details={
          userToDelete
            ? [
                { label: 'Nama', value: userToDelete.nama },
                { label: 'Peran', value: userToDelete.role },
                { label: 'Jabatan', value: userToDelete.jabatan },
                { label: 'Unit Kerja', value: userToDelete.unitKerja },
              ]
            : []
        }
        confirmButtonText="Ya, Hapus Akun"
      />

      {/* Confirmation Modal: Clear All Users */}
      <ConfirmDeleteModal
        isOpen={isConfirmClearAll}
        onClose={() => setIsConfirmClearAll(false)}
        onConfirm={() => {
          clearAllUsers();
          refreshList();
          setIsConfirmClearAll(false);
        }}
        title="Hapus Semua Akun Pengguna"
        description="PERINGATAN: Apakah Anda yakin ingin MENGHAPUS SEMUA akun pengguna? Seluruh akun bawaan akan dikosongkan sehingga Anda dapat memasukkan sendiri daftar akun pengguna organisasi Anda secara mandiri."
        confirmButtonText="Ya, Kosongkan Semua Akun"
      />
    </div>
  );
};
