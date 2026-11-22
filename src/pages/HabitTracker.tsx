import React, { useState, useMemo } from 'react';
import { StudyHabit } from '../types';
import { INITIAL_HABITS } from '../data/mockCurriculum';
import { useLocalOrCloudStorage } from '../hooks/useFirestore';
import { useToast } from '../hooks/useToast';
import { Modal } from '../components/common/Modal';
import { 
  CalendarCheck2, 
  Plus, 
  Flame, 
  Check, 
  Target, 
  Trash2,
  Trophy,
  Sparkles,
  Award,
  CheckCircle2,
  BookOpen,
  TrendingUp,
  BarChart3,
  Calendar,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';
import confetti from 'canvas-confetti';

export const HabitTracker: React.FC = () => {
  const { items: habits, saveItem, removeItem } = useLocalOrCloudStorage<StudyHabit>('habits', INITIAL_HABITS);
  const { showSuccess } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<StudyHabit['category']>('القرآن الكريم');
  const [targetUnit, setTargetUnit] = useState('صفحة');
  const [targetCount, setTargetCount] = useState(10);

  const todayStr = new Date().toISOString().split('T')[0];

  const [chartView, setChartView] = useState<'weekly' | 'monthly'>('weekly');
  const [showChart, setShowChart] = useState(true);

  const totalHabits = habits.length;
  const completedHabitsCount = habits.filter(h => !!h.history[todayStr]).length;
  const isAllCompleted = totalHabits > 0 && completedHabitsCount === totalHabits;
  const completionPercentage = totalHabits > 0 ? Math.round((completedHabitsCount / totalHabits) * 100) : 0;

  // حساب تقدم الأوراد والدروس للأيام السبعة الماضية (أسبوعي)
  const ARABIC_DAYS = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  const weeklyHabitData = useMemo(() => {
    const today = new Date();
    const result = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateKey = d.toISOString().split('T')[0];
      const dayName = ARABIC_DAYS[d.getDay()];

      const doneCount = habits.filter(h => !!h.history[dateKey]).length;
      const pct = habits.length > 0 ? Math.round((doneCount / habits.length) * 100) : 0;

      result.push({
        day: dayName,
        shortDate: `${d.getDate()}/${d.getMonth() + 1}`,
        المنجز: doneCount,
        الهدف: habits.length,
        النسبة: pct
      });
    }
    return result;
  }, [habits]);

  // حساب تقدم الأوراد للأسابيع الأربعة (شهري)
  const monthlyHabitData = useMemo(() => {
    const today = new Date();
    const result = [];
    for (let w = 3; w >= 0; w--) {
      let totalDone = 0;
      let totalPossible = 0;
      for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
        const d = new Date(today);
        d.setDate(today.getDate() - (w * 7 + dayOffset));
        const dateKey = d.toISOString().split('T')[0];
        const done = habits.filter(h => !!h.history[dateKey]).length;
        totalDone += done;
        totalPossible += habits.length;
      }
      const pct = totalPossible > 0 ? Math.round((totalDone / totalPossible) * 100) : 0;
      result.push({
        week: `الأسبوع ${4 - w}`,
        المنجز: totalDone,
        النسبة: pct
      });
    }
    return result;
  }, [habits]);

  const handleToggleToday = async (habit: StudyHabit) => {
    const isDoneToday = !!habit.history[todayStr];
    const willBeDone = !isDoneToday;
    const newHistory = { ...habit.history };
    
    if (isDoneToday) {
      delete newHistory[todayStr];
    } else {
      newHistory[todayStr] = true;
    }

    const updated: StudyHabit = {
      ...habit,
      completedToday: willBeDone ? habit.targetCount : 0,
      streak: willBeDone ? habit.streak + 1 : Math.max(0, habit.streak - 1),
      history: newHistory
    };

    // Check if this action completes the full daily schedule
    const otherHabitsDoneCount = habits.filter(h => h.id !== habit.id && !!h.history[todayStr]).length;
    const willAllBeCompleted = willBeDone && (otherHabitsDoneCount + 1 === habits.length);

    if (willBeDone) {
      if (willAllBeCompleted) {
        // High celebratory confetti & celebratory toast for completing the entire daily schedule
        confetti({ 
          particleCount: 130, 
          spread: 80, 
          origin: { y: 0.6 } 
        });
        showSuccess(
          "مبارك الإنجاز الكامل! 🏆", 
          "ما شاء الله! لقد أتممت جدول دروسك وأورادك اليومية بالكامل، بارك الله في همتك ونفع بك!"
        );
      } else {
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 } });
        showSuccess("تقبّل الله وردك", `أنجزت ورد "${habit.title}" لليوم (${otherHabitsDoneCount + 1}/${habits.length})`);
      }
    }

    await saveItem(updated);
  };

  const handleCreateHabit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    const newHabit: StudyHabit = {
      id: `hab_${Math.random().toString(36).substring(2, 9)}`,
      title,
      category,
      targetUnit,
      targetCount: Number(targetCount),
      completedToday: 0,
      streak: 0,
      history: {}
    };

    await saveItem(newHabit);
    showSuccess("تم التأسيس", "أُضيف الورد إلى جدول محاسبتك اليومية");
    setIsModalOpen(false);
    setTitle(''); setTargetCount(10);
  };

  return (
    <div className="space-y-6 pb-16 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h2 className="text-2xl font-black font-serif text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <CalendarCheck2 className="w-7 h-7 text-emerald-600 inline" />
            أورادي وعاداتي العلمية اليومية
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            «أحب الأعمال إلى الله أدومها وإن قل». محاسبة النفس اليومية في تلاوة القرآن وحفظ المتون والمراجعة
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/20 flex items-center gap-1.5 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة ورد جديد</span>
        </button>
      </div>

      {/* Daily Progress Tracker & Congratulatory Badge Card */}
      {totalHabits > 0 && (
        <div className="space-y-3">
          {/* Completion Congratulatory Badge & Message when 100% completed */}
          {isAllCompleted ? (
            <div className="relative overflow-hidden rounded-3xl p-6 bg-gradient-to-r from-amber-500/15 via-emerald-500/15 to-teal-500/15 border-2 border-emerald-500/30 dark:border-emerald-500/40 shadow-lg shadow-emerald-600/5 animate-fade-in">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4 text-center sm:text-right">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-white flex items-center justify-center shadow-lg shadow-amber-500/30 shrink-0">
                    <Trophy className="w-7 h-7 text-amber-50 animate-bounce" />
                  </div>
                  <div>
                    <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black bg-amber-500 text-white shadow-xs">
                        <Sparkles className="w-3.5 h-3.5" />
                        شارة الإنجاز اليومي الكامل
                      </span>
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        100% تم الإنجاز
                      </span>
                    </div>
                    <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 font-serif">
                      مبارك! لقد أتممت جدول دروسك وأورادك اليومية بالكامل 🌟
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                      هنيئاً لك هذا الإنجاز والثبات على طلب العلم، بارك الله في همتك ونفع بك ووفقك لكل خير.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => confetti({ particleCount: 110, spread: 75, origin: { y: 0.6 } })}
                  className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-black text-xs shadow-md shadow-amber-500/25 flex items-center gap-1.5 transition-all shrink-0 cursor-pointer"
                >
                  <Award className="w-4 h-4" />
                  <span>احتفل بالإنجاز 🎊</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-sm">
                  {completionPercentage}%
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                    مستوى إنجاز جدول دروس وأوراد اليوم
                  </h4>
                  <p className="text-xs text-slate-500">
                    تم إنجاز {completedHabitsCount} من أصل {totalHabits} من المهام اليومية المقررة
                  </p>
                </div>
              </div>
              <div className="w-full sm:w-48 bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                <div 
                  className="bg-emerald-600 h-2.5 rounded-full transition-all duration-500" 
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* بطاقة الرسم البياني لتقدم إتمام الأوراد والدروس الأسبوعية والشهرية Recharts */}
      {totalHabits > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center justify-between sm:justify-start gap-2">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <span>مؤشر بياني لتقدم إتمام الأوراد والدروس</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold font-sans">
                    Recharts
                  </span>
                </h3>
                <p className="text-[11px] text-slate-400">
                  {chartView === 'weekly' 
                    ? 'نسبة الالتزام بالأوراد اليومية خلال الأيام الـ 7 الأخيرة' 
                    : 'معدل الالتزام بالأوراد والدروس على مدار أسابيع الشهر'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200/60 dark:border-slate-700/60 text-xs">
                <button
                  onClick={() => setChartView('weekly')}
                  className={`px-3 py-1 rounded-lg font-bold transition-all ${
                    chartView === 'weekly'
                      ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-300 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  أسبوعي
                </button>
                <button
                  onClick={() => setChartView('monthly')}
                  className={`px-3 py-1 rounded-lg font-bold transition-all ${
                    chartView === 'monthly'
                      ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-300 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  شهري
                </button>
              </div>

              <button
                onClick={() => setShowChart(!showChart)}
                className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-700 transition-colors"
                title={showChart ? 'إخفاء الرسم' : 'إظهار الرسم'}
              >
                {showChart ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {showChart && (
            <div className="w-full h-52 sm:h-56 bg-slate-50/50 dark:bg-slate-800/30 rounded-2xl p-2 border border-slate-100 dark:border-slate-800">
              <ResponsiveContainer width="100%" height="100%">
                {chartView === 'weekly' ? (
                  <BarChart
                    data={weeklyHabitData}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis 
                      dataKey="day" 
                      tick={{ fontSize: 10, fill: '#64748b' }}
                      tickLine={false}
                    />
                    <YAxis 
                      domain={[0, totalHabits || 5]}
                      allowDecimals={false}
                      tick={{ fontSize: 10, fill: '#64748b' }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip 
                      formatter={(val: any) => [`${val} أوراد منجزة`, 'المنجز']}
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        color: '#fff',
                        borderRadius: '12px',
                        fontSize: '11px',
                        border: '1px solid #334155'
                      }}
                    />
                    <Bar 
                      dataKey="المنجز" 
                      fill="#10b981" 
                      radius={[6, 6, 0, 0]} 
                    />
                  </BarChart>
                ) : (
                  <BarChart
                    data={monthlyHabitData}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis 
                      dataKey="week" 
                      tick={{ fontSize: 10, fill: '#64748b' }}
                      tickLine={false}
                    />
                    <YAxis 
                      allowDecimals={false}
                      tick={{ fontSize: 10, fill: '#64748b' }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip 
                      formatter={(val: any) => [`${val} إنجاز`, 'إجمالي الأوراد']}
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        color: '#fff',
                        borderRadius: '12px',
                        fontSize: '11px',
                        border: '1px solid #334155'
                      }}
                    />
                    <Bar 
                      dataKey="المنجز" 
                      fill="#0d9488" 
                      radius={[6, 6, 0, 0]} 
                    />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {habits.length === 0 ? (
        <div className="text-center py-16 px-4 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl bg-slate-50/50 dark:bg-slate-900/50">
          <BookOpen className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700 dark:text-slate-200 mb-1">
            لا توجد أوراد مسجلة بعد
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
            ابدأ بتأسيس جدول دروسك وأورادك اليومية لمتابعة الإنجاز والهمة
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs inline-flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة ورد جديد الآن</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {habits.map(habit => {
            const isDoneToday = !!habit.history[todayStr];
            return (
              <div
                key={habit.id}
                className={`p-6 rounded-3xl border transition-all duration-300 flex flex-col justify-between bg-white dark:bg-slate-900 ${
                  isDoneToday
                    ? 'border-emerald-500/50 bg-emerald-50/20 dark:bg-emerald-950/20 shadow-md shadow-emerald-500/5'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 shadow-xs'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-black px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {habit.category}
                    </span>
                    <div className="flex items-center gap-1">
                      <span className="flex items-center gap-1 text-xs font-black px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-mono">
                        <Flame className="w-3.5 h-3.5 fill-amber-500" /> {habit.streak} أيام
                      </span>
                      <button
                        onClick={() => removeItem(habit.id)}
                        className="p-1 text-slate-300 hover:text-rose-500 transition-colors mr-1 cursor-pointer"
                        title="حذف الورد"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-base font-bold font-serif text-slate-900 dark:text-slate-100 mb-1">
                    {habit.title}
                  </h3>
                  <p className="text-xs text-slate-500 flex items-center gap-1 font-mono">
                    <Target className="w-3.5 h-3.5 text-emerald-600" /> الهدف: {habit.targetCount} {habit.targetUnit} يومياً
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                  <span className={`text-xs font-bold ${isDoneToday ? 'text-emerald-600' : 'text-slate-400'}`}>
                    {isDoneToday ? 'أنجزت وردك بفضل الله' : 'في انتظار إنجاز اليوم'}
                  </span>
                  <button
                    onClick={() => handleToggleToday(habit)}
                    className={`px-4 py-2.5 rounded-xl font-black text-xs flex items-center gap-2 transition-all active:scale-95 cursor-pointer ${
                      isDoneToday
                        ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                        : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <Check className={`w-4 h-4 ${isDoneToday ? 'stroke-[3]' : ''}`} />
                    <span>{isDoneToday ? 'تم الورد' : 'تحديد كمنجز'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="تأسيس ورد علمي ثابت">
        <form onSubmit={handleCreateHabit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold mb-1.5">اسم الورد المنهجي</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="مثال: مراجعة 5 صفحات من تفسير السعدي"
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold mb-1.5">تصنيف الورد</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as any)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold"
              >
                {['القرآن الكريم', 'حفظ المتون', 'مراجعة', 'قراءة حرة', 'سماع دروس'].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold mb-1.5">وحدة القياس</label>
              <input
                type="text"
                value={targetUnit}
                onChange={e => setTargetUnit(e.target.value)}
                placeholder="مثال: صفحة أو باب أو حديث"
                required
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold mb-1.5">الكمية المستهدفة في اليوم</label>
            <input
              type="number"
              value={targetCount}
              onChange={e => setTargetCount(Number(e.target.value))}
              min={1}
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-mono"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm shadow-md mt-4 cursor-pointer"
          >
            اعتماد الورد في المحاسبة اليومية
          </button>
        </form>
      </Modal>
    </div>
  );
};

