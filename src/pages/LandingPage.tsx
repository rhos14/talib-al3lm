import React, { useState, useEffect } from 'react';
import { BookOpen, Sparkles, Award, ShieldCheck, Users, CheckCircle2, ArrowLeft, Play, ChevronDown, Layers, Clock, HeartHandshake } from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { buildApiUrl } from '../lib/apiClient';

interface Props {
  onStartLearning: () => void;
  onOpenLogin: () => void;
  onOpenRegister: () => void;
}

export const LandingPage: React.FC<Props> = ({ onStartLearning, onOpenLogin, onOpenRegister }) => {
  const [stats, setStats] = useState({
    students: '0',
    lectures: '0',
    courses: '0',
    books: '0'
  });

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch(buildApiUrl('/api/public/stats'));
        const data = await res.json();
        if (data.success && data.stats) {
          setStats(data.stats);
          return;
        }
      } catch (e) {
        // fallback
      }
      setStats({ students: '١٥٠', lectures: '٤٥', courses: '١٢', books: '٢٤' });
    }
    
    fetchStats();
  }, []);

  return (
    <div className="space-y-20 pb-20 animate-fade-in overflow-hidden">
      {/* قسم البطل Hero Section */}
      <section className="relative pt-8 pb-16 sm:py-20 px-4 text-center max-w-6xl mx-auto rounded-3xl bg-gradient-to-b from-white via-slate-50 to-emerald-50/40 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 border border-emerald-500/10 shadow-xl overflow-hidden">
        {/* زخرفة إسلامية ذهبية في الخلفية */}
        <div className="absolute top-0 right-1/4 w-72 h-72 bg-amber-400/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100/80 dark:bg-amber-950/80 border border-amber-300/60 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs font-black shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 animate-spin" />
            <span>منصة التعليم الشرعي الأصيل المُبسّط</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black font-serif tracking-tight text-slate-800 dark:text-slate-100 leading-tight">
            ارتقِ بهمّتك في <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-amber-600">مجالس العلم</span> والمتون الشرعية
          </h1>

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto font-sans">
            منصة تفاعلية حديثة تجمع لك شروح كبار العلماء، تقييد الفوائد، تتبع الورد اليومي، ومساعداً ذكياً مستنيراً بالقرآن والسنة؛ لتأخذ بيدك في طريق العلم خطوة بخطوة.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onOpenRegister}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm shadow-xl shadow-emerald-600/20 hover:scale-102 active:scale-98 transition-all flex items-center justify-center gap-2 group"
            >
              <span>البدء في إنشاء حساب طالب</span>
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            </button>

            <button
              onClick={onStartLearning}
              className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 font-bold text-sm border border-slate-200 dark:border-slate-700 shadow-md transition-all flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span>استكشاف المقررات مباشرة</span>
            </button>
          </div>

          <div className="pt-8 flex items-center justify-center gap-8 text-xs font-bold text-slate-400 dark:text-slate-500">
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> مجاني بالكامل</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> شهادات إنجاز معتمدة</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> متوافق مع الهاتف</span>
          </div>
        </div>
      </section>

      {/* ميزات المنصة بالكمبيوتر والهواتف */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12 space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black font-serif text-slate-800 dark:text-slate-100">
            لماذا يختار طالب العلم هذه المجالس؟
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">مزيج فريد بين أصالة التراث الشرعي وتقنيات التعليم المعاصرة</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-lg hover:border-emerald-500/40 transition-all space-y-4 relative group">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
              <BookOpen className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-black font-serif text-slate-800 dark:text-slate-100">متون متدرجة ومحققة</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              تدرج علمي مدروس يبدأ بمتون المستوى الأول (الأصول الثلاثة، الأربعين النووية، الآجرومية) مع صوتيات ومرئيات عالية الوضوح.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-amber-500/30 dark:border-amber-500/20 shadow-lg hover:border-amber-500 transition-all space-y-4 relative group bg-gradient-to-b from-amber-50/20 to-transparent">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-950/80 text-amber-600 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
              <Sparkles className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-black font-serif text-slate-800 dark:text-slate-100">المستشار الشرعي الذكي</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              مساعد مدعوم بأحدث تقنيات الذكاء الاصطناعي، يجيب عن أسئلتك العلمية ويساعدك في تلخيص الدروس مع توثيق الأدلة والنقولات.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-lg hover:border-teal-500/40 transition-all space-y-4 relative group">
            <div className="w-14 h-14 rounded-2xl bg-teal-100 dark:bg-teal-950/80 text-teal-600 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
              <Award className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-black font-serif text-slate-800 dark:text-slate-100">تتبع العادات ومجتمع الطلبة</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              شجّع نفسك وحافظ على وردك اليومي من القرآن والحفظ، وتواصل مع طلاب العلم في مجالس المدارسة والمناقشة.
            </p>
          </div>
        </div>
      </section>

      {/* قسم الإحصائيات الفخمة بالأخضر والذهبي */}
      <section className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white py-16 px-4 rounded-3xl max-w-6xl mx-auto shadow-2xl border border-amber-500/20">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
          <div>
            <span className="block text-3xl sm:text-4xl font-black font-serif text-amber-400 mb-1">{stats.students}</span>
            <span className="text-xs font-bold opacity-80">طالب/ة علم مسجل/ة</span>
          </div>
          <div>
            <span className="block text-3xl sm:text-4xl font-black font-serif text-emerald-400 mb-1">{stats.courses}</span>
            <span className="text-xs font-bold opacity-80">دورات تأصيلية مفعلة</span>
          </div>
          <div>
            <span className="block text-3xl sm:text-4xl font-black font-serif text-amber-400 mb-1">{stats.books}</span>
            <span className="text-xs font-bold opacity-80">كتب ومتون علمية</span>
          </div>
          <div>
            <span className="block text-3xl sm:text-4xl font-black font-serif text-emerald-400 mb-1">{stats.lectures}</span>
            <span className="text-xs font-bold opacity-80">مجالس دروس مشروحة</span>
          </div>
        </div>
      </section>

      {/* دعوة أخيرة للتسجيل */}
      <section className="text-center max-w-3xl mx-auto px-4 space-y-6">
        <div className="w-16 h-16 bg-amber-500 text-white rounded-full flex items-center justify-center mx-auto shadow-lg shadow-amber-500/30">
          <HeartHandshake className="w-8 h-8" />
        </div>
        <h2 className="text-2xl sm:text-4xl font-black font-serif text-slate-800 dark:text-slate-100">
          هل أنت مستعد لتجديد النية وبدء الرحلة؟
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
          انضم اليوم إلى رفاق المجالس، واحتسب كل دقيقة تقضيها في مدارسة قال الله وقال رسوله.
        </p>
        <div className="pt-2 flex justify-center gap-4">
          <button
            onClick={onOpenLogin}
            className="px-8 py-3.5 rounded-xl bg-slate-800 dark:bg-slate-100 hover:opacity-90 text-white dark:text-slate-900 font-black text-sm shadow-md transition-all"
          >
            تسجيل الدخول لحسابي
          </button>
          <button
            onClick={onOpenRegister}
            className="px-8 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm shadow-lg shadow-emerald-600/20 transition-all"
          >
            إنشاء حساب جديد
          </button>
        </div>
      </section>
    </div>
  );
};
