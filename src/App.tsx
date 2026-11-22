import React, { useState, useEffect, Suspense, lazy } from 'react';
import { AuthProvider, isProfileComplete } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { Header } from './components/common/Header';
import { Sidebar, TabType } from './components/common/Sidebar';
import { ToastContainer } from './components/common/ToastContainer';
import { LoadingSpinner } from './components/common/LoadingSpinner';
import { LoginModal } from './components/auth/LoginModal';
import { RegisterModal } from './components/auth/RegisterModal';
import { useAuth } from './hooks/useAuth';
import { ShieldAlert, RefreshCw, LogOut } from 'lucide-react';

// التحميل البطيء للصفحات (Lazy Loading & Code Splitting)
const LandingPage = lazy(() => import('./pages/LandingPage').then(m => ({ default: m.LandingPage })));
const Dashboard = lazy(() => import('./pages/Dashboard').then(m => ({ default: m.Dashboard })));
const Lectures = lazy(() => import('./pages/Lectures').then(m => ({ default: m.Lectures })));
const Fawaid = lazy(() => import('./pages/Fawaid').then(m => ({ default: m.Fawaid })));
const HabitTracker = lazy(() => import('./pages/HabitTracker').then(m => ({ default: m.HabitTracker })));
const Community = lazy(() => import('./pages/Community').then(m => ({ default: m.Community })));
const AiAssistant = lazy(() => import('./pages/AiAssistant').then(m => ({ default: m.AiAssistant })));
const Profile = lazy(() => import('./pages/Profile').then(m => ({ default: m.Profile })));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword').then(m => ({ default: m.ForgotPassword })));
const NotFound = lazy(() => import('./pages/NotFound').then(m => ({ default: m.NotFound })));
const AdminCoursesPanel = lazy(() => import('./components/admin/AdminCoursesPanel').then(m => ({ default: m.AdminCoursesPanel })));
const CompleteProfile = lazy(() => import('./pages/CompleteProfile').then(m => ({ default: m.CompleteProfile })));

const PUBLIC_TABS: TabType[] = ['landing', 'forgot_password', 'not_found'];
const GUEST_ALLOWED_TABS: TabType[] = ['landing', 'lectures', 'forgot_password', 'not_found'];

const MainApp: React.FC = () => {
  const {
    currentUser,
    userProfile,
    loading,
    isGuest,
    isAdmin,
    profileLoadError,
    reloadUserProfile,
    signInAsGuest,
    signOut
  } = useAuth();

  // استعادة المسار فقط عند وجود جلسة سابقة موثقة، وإلا البدء بالصفحة الرئيسية
  const [activeTab, setActiveTab] = useState<TabType>(() => {
    const lastUid = localStorage.getItem('last_user_uid');
    if (lastUid) {
      const saved = localStorage.getItem(`activeTab_${lastUid}`);
      if (saved && saved !== 'landing') {
        return saved as TabType;
      }
    }
    return 'landing';
  });

  const [mobileOpen, setMobileOpen] = useState(false);
  const [lastUser, setLastUser] = useState<{ uid: string; role: string } | null>(null);
  const [loginOpen, setLoginOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);

  const profileCompleted = Boolean(currentUser && !isGuest && isProfileComplete(userProfile));

  // حفظ التبويب النشط للحساب الموثق مكتمل الملف فقط
  useEffect(() => {
    if (currentUser && !isGuest && profileCompleted) {
      if (!PUBLIC_TABS.includes(activeTab)) {
        localStorage.setItem(`activeTab_${currentUser.uid}`, activeTab);
      }
      localStorage.setItem('last_user_uid', currentUser.uid);
    }
  }, [activeTab, currentUser, isGuest, profileCompleted]);

  // إدارة التوجيه الآمن وحالة المصادقة وإصلاح الخروج
  useEffect(() => {
    if (loading) return;

    if (!currentUser && !isGuest) {
      // مستخدم غير مسجل (أو بعد تسجيل الخروج)
      if (lastUser !== null) {
        setLastUser(null);
      }
      localStorage.removeItem('last_user_uid');
      setMobileOpen(false);
      if (!PUBLIC_TABS.includes(activeTab)) {
        setActiveTab('landing');
      }
      return;
    }

    if (isGuest) {
      // وضع الزائر المعتمد
      setLoginOpen(false);
      setRegisterOpen(false);
      if (!GUEST_ALLOWED_TABS.includes(activeTab)) {
        setActiveTab('lectures');
      }
      return;
    }

    // مستخدم مسجل فعلياً
    setLoginOpen(false);
    setRegisterOpen(false);

    if (currentUser && userProfile && userProfile.uid === currentUser.uid) {
      if (!isProfileComplete(userProfile)) {
        // التوجيه مضمون لصفحة استكمال الملف الشخصي عبر بوابة العرض أدناه
        setMobileOpen(false);
        return;
      }

      const currentRole = userProfile.role;
      const key = `${currentUser.uid}_${currentRole}`;
      const lastKey = lastUser ? `${lastUser.uid}_${lastUser.role}` : null;

      if (key !== lastKey) {
        setLastUser({ uid: currentUser.uid, role: currentRole });

        const savedTab = localStorage.getItem(`activeTab_${currentUser.uid}`) as TabType | null;
        if (savedTab && !PUBLIC_TABS.includes(savedTab)) {
          if (savedTab === 'admin_courses' && currentRole !== 'admin') {
            setActiveTab('lectures');
          } else {
            setActiveTab(savedTab);
          }
        } else {
          setActiveTab(currentRole === 'admin' ? 'admin_courses' : 'lectures');
        }
      } else if (activeTab === 'landing') {
        setActiveTab(currentRole === 'admin' ? 'admin_courses' : 'lectures');
      }
    }
  }, [currentUser, userProfile, loading, isGuest, lastUser, activeTab]);

  const handleSafeNavigate = (tab: TabType) => {
    setMobileOpen(false);
    if (!currentUser && !isGuest && !PUBLIC_TABS.includes(tab)) {
      setLoginOpen(true);
      return;
    }
    if (isGuest && !GUEST_ALLOWED_TABS.includes(tab)) {
      setLoginOpen(true);
      return;
    }
    if (currentUser && !isGuest && !profileCompleted && !PUBLIC_TABS.includes(tab)) {
      return;
    }
    setActiveTab(tab);
  };

  const renderActiveTab = () => {
    // 1. حالة المصادقة الفعلية لمكتمل الملف أم بحاجة للاستكمال
    if (currentUser && !isGuest) {
      if (profileLoadError) {
        return (
          <div className="p-8 text-center max-w-md mx-auto my-12 bg-white dark:bg-slate-900 rounded-3xl border border-amber-200 dark:border-amber-900 shadow-lg space-y-4">
            <div className="w-16 h-16 bg-amber-100 dark:bg-amber-950/60 rounded-2xl flex items-center justify-center mx-auto text-amber-600">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">تعذر تحميل بيانات الحساب</h3>
            <p className="text-xs text-slate-500 leading-relaxed">{profileLoadError}</p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={reloadUserProfile}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl inline-flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" /> إعادة المحاولة
              </button>
              <button
                onClick={() => signOut()}
                className="px-4 py-2.5 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-bold rounded-xl inline-flex items-center gap-1.5 border border-rose-200 dark:border-rose-800 cursor-pointer"
              >
                <LogOut className="w-4 h-4" /> تسجيل الخروج
              </button>
            </div>
          </div>
        );
      }

      if (!userProfile || !isProfileComplete(userProfile)) {
        return <CompleteProfile />;
      }
    }

    // 2. مسارات الزائر أو غير المسجل
    if (!currentUser && !isGuest && !PUBLIC_TABS.includes(activeTab)) {
      return (
        <LandingPage
          onStartLearning={async () => {
            await signInAsGuest();
            setActiveTab('lectures');
          }}
          onOpenLogin={() => setLoginOpen(true)}
          onOpenRegister={() => setRegisterOpen(true)}
        />
      );
    }

    switch (activeTab) {
      case 'landing':
        return (
          <LandingPage
            onStartLearning={async () => {
              await signInAsGuest();
              setActiveTab('lectures');
            }}
            onOpenLogin={() => setLoginOpen(true)}
            onOpenRegister={() => setRegisterOpen(true)}
          />
        );
      case 'dashboard':
        return <Dashboard onNavigate={handleSafeNavigate} />;
      case 'lectures':
        return <Lectures />;
      case 'fawaid':
        return <Fawaid />;
      case 'habits':
        return <HabitTracker />;
      case 'community':
        return <Community />;
      case 'ai_assistant':
        return <AiAssistant />;
      case 'profile':
        return <Profile />;
      case 'admin_courses':
        return isAdmin ? (
          <AdminCoursesPanel />
        ) : (
          <div className="p-8 text-center max-w-md mx-auto my-12 bg-white dark:bg-slate-900 rounded-3xl border border-rose-200 dark:border-rose-900 shadow-lg">
            <div className="w-16 h-16 bg-rose-100 dark:bg-rose-950/80 rounded-2xl flex items-center justify-center mx-auto mb-4 text-rose-600">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">منطقة مخصصة للمشرفة العامة فقط</h3>
            <p className="text-xs text-slate-500 mb-6">لا تملك الصلاحيات الإدارية الكافية للوصول إلى لوحة إدارة المقررات والشهادات.</p>
            <button onClick={() => setActiveTab('landing')} className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all cursor-pointer">
              العودة للرئيسية
            </button>
          </div>
        );
      case 'forgot_password':
        return (
          <ForgotPassword
            onBackToLogin={() => setLoginOpen(true)}
            onNavigateHome={() => setActiveTab('landing')}
          />
        );
      case 'not_found':
        return <NotFound onNavigateHome={() => setActiveTab('landing')} />;
      default:
        return <NotFound onNavigateHome={() => setActiveTab('landing')} />;
    }
  };

  const showSidebar =
    !PUBLIC_TABS.includes(activeTab) &&
    ((currentUser && !isGuest && profileCompleted && !profileLoadError) || isGuest);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans selection:bg-emerald-600 selection:text-white transition-colors duration-200">
      <Header
        onOpenLogin={() => setLoginOpen(true)}
        onOpenRegister={() => setRegisterOpen(true)}
        onToggleMobileSidebar={() => setMobileOpen(prev => !prev)}
        onNavigate={handleSafeNavigate}
      />

      <div className="flex flex-1 max-w-[1600px] w-full mx-auto">
        {showSidebar && (
          <Sidebar
            activeTab={activeTab}
            setActiveTab={handleSafeNavigate}
            mobileOpen={mobileOpen}
            setMobileOpen={setMobileOpen}
          />
        )}

        <main className={`flex-1 ${activeTab === 'landing' && !currentUser ? 'p-0 sm:p-4' : 'p-4 sm:p-6 lg:p-8'} overflow-x-hidden min-h-[calc(100vh-65px)]`}>
          {loading ? (
            <LoadingSpinner fullScreen={false} message="جاري التحقق من الجلسة العلمية..." />
          ) : (
            <Suspense fallback={<LoadingSpinner fullScreen={false} message="جاري استحضار المجلس العلمي..." />}>
              {renderActiveTab()}
            </Suspense>
          )}
        </main>
      </div>

      <ToastContainer />

      <LoginModal
        isOpen={loginOpen}
        onClose={() => setLoginOpen(false)}
        onSwitchToRegister={() => { setLoginOpen(false); setRegisterOpen(true); }}
        onForgotPassword={() => setActiveTab('forgot_password')}
      />

      <RegisterModal
        isOpen={registerOpen}
        onClose={() => setRegisterOpen(false)}
        onSwitchToLogin={() => { setRegisterOpen(false); setLoginOpen(true); }}
      />
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <MainApp />
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
