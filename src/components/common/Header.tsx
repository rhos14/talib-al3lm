import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { isProfileComplete } from '../../context/AuthContext';
import { useTheme } from '../../hooks/useTheme';
import { useToast } from '../../hooks/useToast';
import { Sun, Moon, LogIn, UserPlus, LogOut, Shield, Sparkles, BookOpen, Menu } from 'lucide-react';

interface Props {
  onOpenLogin: () => void;
  onOpenRegister: () => void;
  onToggleMobileSidebar: () => void;
  onNavigate?: (tab: any) => void;
}

export const Header: React.FC<Props> = ({ onOpenLogin, onOpenRegister, onToggleMobileSidebar, onNavigate }) => {
  const { currentUser, userProfile, signOut, isGuest } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { showSuccess, showError } = useToast();

  const [avatarError, setAvatarError] = useState(false);

  useEffect(() => {
    setAvatarError(false);
  }, [userProfile?.photoURL]);

  const handleLogoutClick = async () => {
    try {
      await signOut();
      onNavigate?.('landing');
      showSuccess('تم تسجيل الخروج', 'تم إنهاء جلستك بأمان.');
    } catch {
      showError('خطأ في الخروج', 'تعذر تسجيل الخروج حالياً، يرجى المحاولة مرة أخرى.');
    }
  };

  const canOpenProfile = Boolean(currentUser && !isGuest && isProfileComplete(userProfile));
  const canOpenSidebar = Boolean((currentUser && !isGuest && isProfileComplete(userProfile)) || isGuest);

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-4 lg:px-8 py-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
      <div className="flex items-center gap-3">
        {canOpenSidebar && (
          <button
            onClick={onToggleMobileSidebar}
            className="lg:hidden p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-emerald-600 cursor-pointer"
            aria-label="القائمة الجانبية"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <div
          onClick={() => onNavigate?.(canOpenProfile ? 'lectures' : 'landing')}
          className="flex items-center gap-2.5 cursor-pointer hover:opacity-90 transition-opacity"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white shadow-md shadow-emerald-600/20">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold font-serif tracking-tight bg-gradient-to-l from-emerald-700 via-teal-600 to-emerald-500 dark:from-emerald-400 dark:to-teal-300 bg-clip-text text-transparent">
              طلبة العلم
            </h1>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium hidden sm:block">
              المنصة المنهجية لإدارة التحصيل الشرعي
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all duration-200 cursor-pointer"
          aria-label="تبديل مظهر الموقع"
          title={isDark ? 'تفعيل الوضع النهاري' : 'تفعيل الوضع الليلي'}
        >
          {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
        </button>

        {currentUser && !isGuest ? (
          <div className="flex items-center gap-2 pl-2">
            <div
              onClick={() => {
                if (canOpenProfile) onNavigate?.('profile');
              }}
              className={`flex items-center gap-2 p-1.5 rounded-2xl transition-colors ${
                canOpenProfile ? 'cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60' : ''
              }`}
              title={canOpenProfile ? 'عرض وتعديل الملف الشخصي' : 'يرجى استكمال الملف الشخصي'}
            >
              <div className="hidden md:flex flex-col text-left">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {userProfile?.displayName || userProfile?.name || 'طالب/ة علم'}
                </span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                  <Sparkles className="w-3 h-3 inline" /> {userProfile?.level || 'مبتدئ'}
                </span>
              </div>
              {userProfile?.photoURL && !avatarError ? (
                <img
                  src={userProfile.photoURL}
                  alt={userProfile.displayName || 'صورة المستخدم'}
                  className="w-9 h-9 rounded-full ring-2 ring-emerald-500/30 object-cover"
                  referrerPolicy="no-referrer"
                  onError={() => setAvatarError(true)}
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-sm ring-2 ring-emerald-500/30">
                  {(userProfile?.firstName || userProfile?.displayName || 'ط').charAt(0)}
                </div>
              )}
            </div>
            <button
              onClick={handleLogoutClick}
              className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
              title="تسجيل الخروج"
              aria-label="تسجيل الخروج"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 sm:gap-2">
            {isGuest && (
              <>
                <span className="hidden xl:inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 text-xs font-medium border border-amber-200 dark:border-amber-800">
                  <Shield className="w-3.5 h-3.5" /> وضع زائر
                </span>
                <button
                  onClick={handleLogoutClick}
                  className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
                  title="الخروج من وضع الزائر"
                  aria-label="الخروج من وضع الزائر"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            )}
            <button
              onClick={onOpenLogin}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <LogIn className="w-4 h-4 text-emerald-600" />
              <span className="hidden sm:inline">دخول</span>
            </button>
            <button
              onClick={onOpenRegister}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/20 hover:from-emerald-500 hover:to-teal-500 transition-all duration-200 active:scale-95 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>حساب جديد</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
