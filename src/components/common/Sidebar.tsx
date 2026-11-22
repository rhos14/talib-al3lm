import React, { useMemo } from 'react';
import { 
  LayoutDashboard, 
  BookOpenCheck, 
  Headphones, 
  BookmarkCheck, 
  CalendarCheck2, 
  Users2, 
  Sparkles,
  Flame,
  Clock,
  Award,
  ShieldAlert,
  TrendingUp,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useLocalOrCloudStorage } from '../../hooks/useFirestore';
import { StudyHabit, StudentLectureProgress, StudentActivity } from '../../types';
import { INITIAL_HABITS } from '../../data/mockCurriculum';

export type TabType = 'landing' | 'dashboard' | 'lectures' | 'fawaid' | 'habits' | 'community' | 'ai_assistant' | 'profile' | 'forgot_password' | 'not_found' | 'admin_courses';

interface Props {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<Props> = ({ activeTab, setActiveTab, mobileOpen, setMobileOpen }) => {
  const { userProfile, isAdmin } = useAuth();

  // جلب الأوراد والتقدم لحساب همة اليوم الحقيقية
  const { items: habits } = useLocalOrCloudStorage<StudyHabit>('habits', INITIAL_HABITS);
  const { items: progresses } = useLocalOrCloudStorage<StudentLectureProgress>('lecture_progress', []);
  const { items: activities } = useLocalOrCloudStorage<StudentActivity>('student_activities', []);

  const todayStr = new Date().toISOString().split('T')[0];

  // حساب إحصاءات همة اليوم الفعلية
  const totalHabits = habits.length;
  const todayCompletedHabits = habits.filter(h => !!h.history?.[todayStr]).length;
  const todayCompletedLectures = progresses.filter(p => 
    p.lastAttemptDate?.startsWith(todayStr) || (p.isLectureFinished && p.lastAttemptDate?.startsWith(todayStr))
  ).length;
  const todayActivitiesCount = activities.filter(a => a.timestamp?.startsWith(todayStr)).length;

  // نسبة همة اليوم الحقيقية المحسوبة بدقة
  const { realHemmaPct, hemmaStatus } = useMemo(() => {
    let pct = 0;
    if (totalHabits > 0) {
      const habitsRatio = todayCompletedHabits / totalHabits;
      pct = Math.round(habitsRatio * 75);
      if (todayCompletedLectures > 0 || todayActivitiesCount > 0) {
        pct += 25;
      } else if (todayCompletedHabits === totalHabits) {
        pct = 100;
      }
    } else {
      if (todayCompletedLectures > 0 || todayActivitiesCount > 0) {
        pct = 100;
      } else if (userProfile?.lastStreakDate === todayStr) {
        pct = 60;
      }
    }

    pct = Math.min(100, Math.max(0, pct));

    let status = 'بانتظار إنجازك اليوم';
    if (pct === 100) status = 'همة وقّادة وتامة 🔥';
    else if (pct >= 70) status = 'همة عالية ومتقدمة ✨';
    else if (pct >= 40) status = 'همة طيبة ومستمرة ⚡';
    else if (pct > 0) status = 'انطلاقة مباركة 🌱';

    return { realHemmaPct: pct, hemmaStatus: status };
  }, [totalHabits, todayCompletedHabits, todayCompletedLectures, todayActivitiesCount, userProfile?.lastStreakDate, todayStr]);

  const navItems = [
    { id: 'dashboard', label: 'لوحة التحصيل', icon: LayoutDashboard, desc: 'ملخص الإنجاز اليومي' },
    { id: 'lectures', label: 'مجالس الدروس', icon: Headphones, desc: 'السلاسل العلمية والشروحات' },
    { id: 'fawaid', label: 'دفتر الفوائد', icon: BookmarkCheck, desc: 'تقييد الشوارد العلمية' },
    { id: 'habits', label: 'أورادي اليومية', icon: CalendarCheck2, desc: 'متابعة عادات الطلب' },
    { id: 'community', label: 'ملتقى الطلبة', icon: Users2, desc: 'المدارسة والمباحثة الفقهية' },
    { id: 'ai_assistant', label: 'المُراجع الذكي', icon: Sparkles, badge: 'AI', desc: 'اختبار المتون عبر Gemini' },
    ...(isAdmin ? [{ id: 'admin_courses', label: 'إدارة الدورات', icon: ShieldAlert, badge: 'مشرفة', desc: 'إدارة المناهج والكتب والدروس' }] : [])
  ];

  const handleNavClick = (id: TabType) => {
    setActiveTab(id);
    setMobileOpen(false);
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800">
      {/* بطاقة إحصائية حقيقية لهمة الطالب اليومية */}
      <div className="p-4 m-3 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent border border-emerald-500/20 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">همة الطالب اليومية</span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-extrabold font-mono">
              {realHemmaPct}%
            </span>
          </div>
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-extrabold" title="أيام الاستمرار المتصلة">
            <Flame className="w-3.5 h-3.5 fill-amber-500" /> {userProfile?.streak || 0} د
          </span>
        </div>

        {/* شريط مؤشر الهمة اليومية الحقيقي */}
        <div className="space-y-1">
          <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-700" 
              style={{ width: `${realHemmaPct}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-500">
            <span>{hemmaStatus}</span>
            <span>
              {totalHabits > 0 ? `${todayCompletedHabits} من ${totalHabits} أوراد` : (todayCompletedLectures > 0 ? 'دروس منجزة' : 'اليوم')}
            </span>
          </div>
        </div>

        {/* إحصاءات الكتب والمتون */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-800">
          <div className="flex items-center gap-1.5">
            <BookOpenCheck className="w-3.5 h-3.5 text-emerald-600" />
            <div>
              <div className="text-[10px] text-slate-400">الكتب المعتمدة</div>
              <div className="text-xs font-bold font-mono">{userProfile?.completedBooksCount || 0} كتب</div>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-teal-600" />
            <div>
              <div className="text-[10px] text-slate-400">المتون المنجزة</div>
              <div className="text-xs font-bold font-mono">{userProfile?.completedMutunCount || 0} متون</div>
            </div>
          </div>
        </div>
      </div>

      {/* أزرار التصفح الرئيسية */}
      <nav className="flex-1 px-3 space-y-1.5 overflow-y-auto">
        <div className="px-3 py-1 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
          أبواب التحصيل
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id as TabType)}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-right transition-all duration-200 group ${
                isActive
                  ? 'bg-emerald-600 text-white font-bold shadow-lg shadow-emerald-600/25'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-emerald-600 dark:hover:text-emerald-400'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                <div>
                  <div className="text-sm">{item.label}</div>
                  <div className={`text-[10px] font-normal ${isActive ? 'text-emerald-100' : 'text-slate-400 dark:text-slate-500'}`}>
                    {item.desc}
                  </div>
                </div>
              </div>
              {item.badge && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black tracking-widest ${
                  isActive ? 'bg-white text-emerald-700' : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );

  return (
    <>
      {/* القائمة الجانبية للشاشات الكبيرة */}
      <aside className="hidden lg:block w-72 shrink-0 h-[calc(100vh-65px)] sticky top-[65px]">
        {sidebarContent}
      </aside>

      {/* القائمة المنزلقة للموبايل */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden flex animate-fade-in">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setMobileOpen(false)} />
          <div className="relative w-72 max-w-[85vw] h-full z-50 animate-slide-left">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
