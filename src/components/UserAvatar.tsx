import React, { useState } from 'react';
import { Role } from '../types';

interface UserAvatarProps {
  nama: string;
  avatarUrl?: string;
  role?: Role;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const getInitials = (name: string): string => {
  if (!name || !name.trim()) return 'U';
  const clean = name.replace(/^(Dr\.|Drs\.|Ir\.|H\.|Hj\.|Prof\.|dr\.)\s*/gi, '').trim();
  const words = clean.split(/\s+/).filter(Boolean);
  if (words.length === 0) return 'U';
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
};

const roleGradients: Record<Role, string> = {
  Admin: 'from-blue-600 to-indigo-700 text-white',
  Pimpinan: 'from-purple-600 to-indigo-900 text-white',
  'Penerima Disposisi': 'from-emerald-600 to-teal-800 text-white',
  Auditor: 'from-amber-500 to-orange-700 text-white',
};

const sizeClasses = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base font-bold',
  xl: 'w-16 h-16 text-xl font-bold',
};

export const UserAvatar: React.FC<UserAvatarProps> = ({
  nama,
  avatarUrl,
  role = 'Admin',
  size = 'md',
  className = '',
}) => {
  const [imageError, setImageError] = useState(false);
  const initials = getInitials(nama);
  const sizeClass = sizeClasses[size] || sizeClasses.md;
  const gradient = roleGradients[role] || 'from-slate-600 to-slate-800 text-white';

  if (avatarUrl && !imageError && avatarUrl.trim() !== '') {
    return (
      <img
        src={avatarUrl}
        alt={nama}
        onError={() => setImageError(true)}
        className={`${sizeClass} rounded-full object-cover border border-slate-200/80 shadow-2xs shrink-0 ${className}`}
      />
    );
  }

  return (
    <div
      className={`${sizeClass} rounded-full bg-gradient-to-tr ${gradient} flex items-center justify-center font-bold tracking-tight shadow-2xs shrink-0 select-none border border-white/20 ${className}`}
      title={nama}
    >
      <span>{initials}</span>
    </div>
  );
};
