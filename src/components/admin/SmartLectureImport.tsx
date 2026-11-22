import React, { useState, useMemo } from 'react';
import { 
  Sparkles, 
  Youtube, 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  FileCheck, 
  Layers, 
  BookOpen, 
  Check, 
  X, 
  ExternalLink, 
  Info, 
  Loader2, 
  Trash2, 
  ListOrdered,
  ShieldCheck,
  ChevronRight,
  Flame,
  ArrowRight,
  Key,
  Copy,
  Terminal,
  Code2,
  RefreshCw,
  Sliders,
  FileCode,
  Send,
  Eye,
  EyeOff,
  FileText
} from 'lucide-react';
import { Course, CourseBook, CourseLectureItem, LectureImportTask, LectureQuizQuestion } from '../../types';
import { useSmartImportTasks } from '../../hooks/useSmartImportTasks';
import { useToast } from '../../hooks/useToast';
import { useAuth } from '../../hooks/useAuth';
import { auth } from '../../lib/firebase';
import { buildApiUrl, getResolvedApiOrigin } from '../../lib/apiClient';

interface Props {
  courses: Course[];
  books: CourseBook[];
  lectures: CourseLectureItem[];
  questions?: LectureQuizQuestion[];
}

export const SmartLectureImport: React.FC<Props> = ({ courses, books, lectures, questions = [] }) => {
  const { userProfile } = useAuth();
  const { showSuccess, showError, showWarning } = useToast();
  const { 
    tasks, 
    loading: tasksLoading, 
    createImportTask, 
    runImportTask, 
    pauseImportTask, 
    deleteImportTask,
    applyPdfToTaskLectures,
    deleteTaskLectures
  } = useSmartImportTasks();

  // اختيارات الدورة والكتاب
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [selectedBookId, setSelectedBookId] = useState<string>('');
  
  // رابط يوتيوب، حجم الدفعة، ورابط كتاب PDF للمحاضرات
  const [playlistUrl, setPlaylistUrl] = useState<string>('');
  const [batchSize, setBatchSize] = useState<'5' | '10' | '20' | '50' | 'all'>('5');
  const [lecturePdfUrl, setLecturePdfUrl] = useState<string>('');

  // تحكم تعديل وإرفاق كتاب PDF للمهمة النشطة
  const [isEditingTaskPdf, setIsEditingTaskPdf] = useState(false);
  const [customTaskPdfUrl, setCustomTaskPdfUrl] = useState<string>('');
  const [isApplyingPdf, setIsApplyingPdf] = useState(false);

  // إدارة وحذف المحاضرات المستوردة وسجل المهام
  const [taskToDelete, setTaskToDelete] = useState<LectureImportTask | null>(null);
  const [deleteMode, setDeleteMode] = useState<'lectures_only' | 'task_and_lectures' | 'task_only'>('lectures_only');
  const [isDeleting, setIsDeleting] = useState(false);

  // تبويب الواجهة: مهام الاستيراد أو إعدادات واجهة برمجة الأسئلة
  const [activeTab, setActiveTab] = useState<'tasks' | 'automation_api'>('tasks');

  // فحص الاتصال بالخادم
  const [verifyStatus, setVerifyStatus] = useState<'idle' | 'testing' | 'success' | 'failed'>('idle');
  const [verifyDetails, setVerifyDetails] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleTestConnection = async () => {
    setVerifyStatus('testing');
    setVerifyDetails('');
    try {
      const headers: Record<string, string> = {};
      const token = await auth.currentUser?.getIdToken();
      if (token) headers['Authorization'] = `Bearer ${token}`;
      
      const res = await fetch(buildApiUrl('/api/import/verify'), { headers });
      const data = await res.json();
      if (res.ok && data.success) {
        setVerifyStatus('success');
        setVerifyDetails(data.message || 'الاتصال مصرح به وصالح للأتمتة.');
        showSuccess('الاتصال مصرح به', 'الخادم جاهز لاستقبال وحفظ أسئلة NotebookLM تلقائياً.');
      } else {
        setVerifyStatus('failed');
        setVerifyDetails(data.error || 'فشل التحقق من الاتصال.');
        showError('فشل التحقق', data.error || 'الخادم لم يقبل رمز الاعتماد.');
      }
    } catch (err: any) {
      setVerifyStatus('failed');
      setVerifyDetails(err.message || 'تعذر الوصول إلى الخادم.');
      showError('خطأ اتصال', err.message);
    }
  };

  const copyToClipboard = (text: string, id: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    showSuccess('تم النسخ', `تم نسخ ${label} إلى الحافظة.`);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // حالة فحص الرابط وجلب المحاضرات الأولية
  const [isInspecting, setIsInspecting] = useState(false);
  const [inspectedItems, setInspectedItems] = useState<Array<{ videoId: string; title: string; videoUrl: string; duration?: string }> | null>(null);
  const [inspectedPlaylistId, setInspectedPlaylistId] = useState<string | null>(null);

  // المهمة الحالية المحددة للعرض أو المتابعة
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // تصفية الكتب بحسب الدورة المختارة
  const filteredBooks = useMemo(() => {
    if (!selectedCourseId) return [];
    return books.filter(b => b.courseId === selectedCourseId);
  }, [books, selectedCourseId]);

  // إيجاد أسماء الدورة والكتاب المحددين
  const selectedCourse = useMemo(() => courses.find(c => c.id === selectedCourseId), [courses, selectedCourseId]);
  const selectedBook = useMemo(() => books.find(b => b.id === selectedBookId), [books, selectedBookId]);

  // ملء رابط PDF تلقائياً عند اختيار كتاب له رابط PDF مسبقاً
  React.useEffect(() => {
    if (selectedBook?.pdfUrl) {
      setLecturePdfUrl(selectedBook.pdfUrl);
    }
  }, [selectedBook]);

  // المحاضرات الحالية المسجلة في الكتاب المختار لفحص التكرار مسبقاً في الواجهة
  const currentBookLectures = useMemo(() => {
    if (!selectedBookId) return [];
    return lectures.filter(l => l.bookId === selectedBookId);
  }, [lectures, selectedBookId]);

  // المهمة النشطة الحالية
  const activeTask = useMemo(() => {
    if (!selectedTaskId) return tasks[0] || null;
    return tasks.find(t => t.id === selectedTaskId) || null;
  }, [tasks, selectedTaskId]);

  // دالة فحص وتحليل قائمة تشغيل يوتيوب
  const handleInspectPlaylist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playlistUrl.trim()) {
      showError('حقل الرابط مطلوب', 'يرجى إدخال رابط قائمة تشغيل أو فيديو من YouTube.');
      return;
    }
    if (!selectedCourseId || !selectedBookId) {
      showError('حدد المتن أولاً', 'يرجى اختيار الدورة العلمية والكتاب المستهدف قبل استيراد المحاضرات.');
      return;
    }

    setIsInspecting(true);
    setInspectedItems(null);
    setInspectedPlaylistId(null);

    try {
      const token = await auth.currentUser?.getIdToken();
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const response = await fetch(buildApiUrl(`/api/admin/youtube-playlist?url=${encodeURIComponent(playlistUrl.trim())}`), {
        headers
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'فشل فحص قائمة التشغيل من YouTube');
      }

      setInspectedItems(data.items);
      setInspectedPlaylistId(data.playlistId || null);
      showSuccess(
        'تم تحليل الرابط بنجاح',
        `تم العثور على ${data.items.length} محاضرة متاحة للاستيراد.`
      );
    } catch (err: any) {
      console.error('Inspection error:', err);
      showError('خطأ في جلب بيانات YouTube', err.message || 'تعذر استخراج المحاضرات من الرابط المدخل.');
    } finally {
      setIsInspecting(false);
    }
  };

  // دالة إنشاء المهمة والبدء الفوري
  const handleCreateAndStart = async () => {
    if (!inspectedItems || inspectedItems.length === 0) {
      showError('لا توجد محاضرات', 'يرجى فحص رابط YouTube أولاً قبل البدء.');
      return;
    }
    if (!selectedCourse || !selectedBook) {
      showError('بيانات غير مكتملة', 'يرجى اختيار الدورة والكتاب.');
      return;
    }

    try {
      setIsProcessing(true);
      const newTask = await createImportTask({
        courseId: selectedCourse.id,
        courseTitle: selectedCourse.title,
        bookId: selectedBook.id,
        bookTitle: selectedBook.title,
        playlistUrl: playlistUrl.trim(),
        playlistId: inspectedPlaylistId || undefined,
        batchSize,
        pdfUrl: lecturePdfUrl.trim() || undefined,
        rawItems: inspectedItems
      });

      setSelectedTaskId(newTask.id);
      showSuccess('تم حفظ المهمة في Firebase', 'بدء معالجة الدفعة الأولى واستيراد المحاضرات...');
      await runImportTask(newTask);
    } catch (err: any) {
      console.error('Creation error:', err);
      showError('فشل بدء المهمة', err.message || 'حدث خطأ أثناء إنشاء مهمة الاستيراد.');
    } finally {
      setIsProcessing(false);
      setInspectedItems(null);
    }
  };

  // دالة استئناف مهمة محفوظة
  const handleResumeTask = async (task: LectureImportTask) => {
    try {
      setIsProcessing(true);
      setSelectedTaskId(task.id);
      showSuccess('استئناف الاستيراد', `جاري استكمال استيراد المحاضرات المتبقية للمهمة...`);
      await runImportTask(task);
    } catch (err: any) {
      showError('فشل الاستئناف', err.message || 'تعذر استئناف المهمة.');
    } finally {
      setIsProcessing(false);
    }
  };

  // دالة إيقاف مؤقت
  const handlePauseTask = async (taskId: string) => {
    try {
      await pauseImportTask(taskId);
      showWarning('تم الإيقاف مؤقتاً', 'تم إيقاف عملية الاستيراد وحفظ الحالة الحالية في Firebase.');
    } catch (err: any) {
      showError('خطأ في الإيقاف', err.message || 'تعذر إيقاف المهمة.');
    } finally {
      setIsProcessing(false);
    }
  };

  // دالة تنفيذ الحذف للمحاضرات أو المهمة بدون تنبيهات منبثقة
  const handleExecuteDelete = async () => {
    if (!taskToDelete) return;
    try {
      setIsDeleting(true);
      if (deleteMode === 'lectures_only') {
        const res = await deleteTaskLectures(taskToDelete.id);
        showSuccess(
          'تم حذف المحاضرات بنجاح', 
          `تم حذف ${res.deletedLecturesCount} محاضرة و ${res.deletedQuestionsCount} سؤال اختبار من قاعدة البيانات. وأعيدت المهمة لوضع الانتظار.`
        );
      } else if (deleteMode === 'task_and_lectures') {
        await deleteImportTask(taskToDelete.id, true);
        if (selectedTaskId === taskToDelete.id) {
          setSelectedTaskId(null);
        }
        showSuccess('تم الحذف الشامل', 'تم حذف سجل المهمة وجميع المحاضرات التابعة لها من قاعدة البيانات.');
      } else {
        await deleteImportTask(taskToDelete.id, false);
        if (selectedTaskId === taskToDelete.id) {
          setSelectedTaskId(null);
        }
        showSuccess('تم حذف السجل', 'تمت إزالة سجل المهمة من Firebase مع الإبقاء على المحاضرات في المتن.');
      }
      setTaskToDelete(null);
    } catch (err: any) {
      showError('فشل الحذف', err.message || 'حدث خطأ أثناء تنفيذ عملية الحذف');
    } finally {
      setIsDeleting(false);
    }
  };

  // حساب نسبة الإنجاز للمهمة النشطة
  const progressPercentage = useMemo(() => {
    if (!activeTask || activeTask.totalCount === 0) return 0;
    const finished = (activeTask.completedCount || 0) + (activeTask.skippedCount || 0);
    return Math.min(100, Math.round((finished / activeTask.totalCount) * 100));
  }, [activeTask]);

  return (
    <div className="space-y-8 animate-fade-in text-right font-sans" dir="rtl">
      {/* بطاقة الترحيب والتعريف بالخدمة الذكية */}
      <div className="bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden border border-emerald-500/30">
        <div className="absolute top-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -z-0"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-black">
              <Sparkles className="w-4 h-4 text-amber-300" />
              ميزة إدارية جديدة خاصة بالمشرفة
            </div>
            <h2 className="text-2xl sm:text-3xl font-black font-sans tracking-tight">
              الاستيراد الذكي للمحاضرات والدروس
            </h2>
            <p className="text-emerald-100 text-sm max-w-2xl leading-relaxed">
              استيراد تلقائي للمحاضرات من قوائم تشغيل YouTube، مع فحص التكرار بالمعرف الرقمي وحفظ حالة المهام في Firebase لدعم الاستئناف والإيقاف التفاعلي.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/10 shrink-0">
            <ShieldCheck className="w-8 h-8 text-emerald-400" />
            <div className="text-right">
              <div className="text-[11px] text-emerald-200">صلاحية التشغيل</div>
              <div className="text-xs font-bold font-mono">مشرفة النظام (Admin)</div>
            </div>
          </div>
        </div>

        {/* تنبيه شفافية تكامل NotebookLM الصريح مع إعلان تفعيل المرحلة الثانية */}
        <div className="mt-6 p-4 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-200 text-xs leading-relaxed flex items-start gap-3">
          <Info className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-bold text-amber-300">
              المرحلة الثانية مفعلة: واجهة استقبال وحفظ أسئلة NotebookLM تلقائياً (Server API Phase 2)
            </div>
            <p className="text-[11px] text-amber-100/90 leading-relaxed">
              تم تشييد واجهة خادم آمنة <span className="font-mono font-bold bg-amber-950/60 px-1.5 py-0.5 rounded text-amber-300">POST /api/import/questions</span> محمية بصلاحيات المشرف، وتتولى فحص وجود المحاضرة وصحة العلاقة الهرمية، والتأكد من مطابقة الخيارات والإجابات، ومنع تكرار الأسئلة، وتحديث حالة اختبار المحاضرة إلى مكتمل فور نجاح الحفظ في Firebase.
            </p>
          </div>
        </div>
      </div>

      {/* تبويبات التبديل بين مهام الاستيراد وواجهة أتمتة الـ API */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab('tasks')}
          className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'tasks'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>مهام استيراد المحاضرات</span>
          {tasks.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-white/20 text-white">
              {tasks.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('automation_api')}
          className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'automation_api'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
          }`}
        >
          <Code2 className="w-4 h-4 text-amber-400" />
          <span>أتمتة NotebookLM ومسار API (المرحلة 2)</span>
          <span className="px-1.5 py-0.5 rounded-md text-[9px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            جاهز للاستقبال
          </span>
        </button>
      </div>

      {activeTab === 'tasks' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ========================================================================= */}
        {/* العمود الأيمن: نموذج إعداد مهمة الاستيراد ================================= */}
        {/* ========================================================================= */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-5">
            <h3 className="text-lg font-bold flex items-center gap-2 text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
              <Layers className="w-5 h-5 text-emerald-600" />
              إعداد استيراد جديد
            </h3>

            <form onSubmit={handleInspectPlaylist} className="space-y-4">
              {/* 1. اختيار الدورة */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  ١. الدورة العلمية المستهدفة
                </label>
                <select
                  value={selectedCourseId}
                  onChange={(e) => {
                    setSelectedCourseId(e.target.value);
                    setSelectedBookId('');
                  }}
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 focus:border-emerald-500 focus:bg-white transition-all"
                  required
                >
                  <option value="">-- اختر الدورة العلمية --</option>
                  {courses.map(course => (
                    <option key={course.id} value={course.id}>
                      {course.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* 2. اختيار الكتاب */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  ٢. الكتاب أو المتن المشروح
                </label>
                <select
                  value={selectedBookId}
                  onChange={(e) => setSelectedBookId(e.target.value)}
                  disabled={!selectedCourseId || filteredBooks.length === 0}
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 focus:border-emerald-500 focus:bg-white transition-all disabled:opacity-50"
                  required
                >
                  <option value="">
                    {!selectedCourseId 
                      ? '-- اختر الدورة أولاً --' 
                      : filteredBooks.length === 0 
                        ? '-- لا توجد كتب مسجلة لهذه الدورة --' 
                        : '-- اختر الكتاب/المتن --'}
                  </option>
                  {filteredBooks.map(book => (
                    <option key={book.id} value={book.id}>
                      {book.title}
                    </option>
                  ))}
                </select>
                {selectedBookId && (
                  <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1 font-mono">
                    <BookOpen className="w-3.5 h-3.5" />
                    يحتوي هذا الكتاب حالياً على {currentBookLectures.length} محاضرة مسجلة
                  </div>
                )}
              </div>

              {/* 3. رابط قائمة تشغيل يوتيوب */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  ٣. رابط قائمة تشغيل YouTube
                </label>
                <div className="relative">
                  <input
                    type="url"
                    value={playlistUrl}
                    onChange={(e) => setPlaylistUrl(e.target.value)}
                    placeholder="https://www.youtube.com/playlist?list=PL..."
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono text-slate-800 dark:text-slate-200 focus:border-emerald-500 focus:bg-white transition-all text-left"
                    dir="ltr"
                    required
                  />
                  <Youtube className="w-4 h-4 text-rose-500 absolute left-3 top-3 pointer-events-none" />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  يمكن إدخال رابط قائمة تشغيل كاملة (playlist?list=...) أو رابط فيديو مفرد من YouTube.
                </p>
              </div>

              {/* 4. رابط كتاب / متن المحاضرات بصيغة PDF */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-blue-600" />
                    <span>٤. كتاب المتن للمحاضرات (رابط PDF)</span>
                  </label>
                  {selectedBook?.pdfUrl && selectedBook.pdfUrl !== lecturePdfUrl && (
                    <button
                      type="button"
                      onClick={() => setLecturePdfUrl(selectedBook.pdfUrl || '')}
                      className="text-[10px] text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 font-bold underline cursor-pointer"
                    >
                      استخدام PDF الكتاب المعتمد
                    </button>
                  )}
                </div>
                <div className="relative">
                  <input
                    type="url"
                    value={lecturePdfUrl}
                    onChange={(e) => setLecturePdfUrl(e.target.value)}
                    placeholder="https://example.com/book.pdf أو رابط تخزين مباشر"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono text-slate-800 dark:text-slate-200 focus:border-emerald-500 focus:bg-white transition-all text-left"
                    dir="ltr"
                  />
                  <FileText className="w-4 h-4 text-blue-500 absolute left-3 top-3 pointer-events-none" />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  سيتم ربط هذا الكتاب تلقائياً بجميع المحاضرات التي يتم استيرادها، ليتسنى للطلبة قراءة المتن ومتابعته.
                </p>
              </div>

              {/* 5. خيار تحديد عدد المحاضرات وحجم الدفعة */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  ٥. حجم الدفعة للمعالجة
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {(['5', '10', '20', '50', 'all'] as const).map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setBatchSize(size)}
                      className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all text-center ${
                        batchSize === size
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-emerald-500'
                      }`}
                    >
                      {size === 'all' ? 'الكل' : `${size} دروس`}
                    </button>
                  ))}
                </div>
              </div>

              {/* زر فحص القائمة */}
              <button
                type="submit"
                disabled={isInspecting || !selectedCourseId || !selectedBookId || !playlistUrl.trim()}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-bold text-xs rounded-2xl transition-all flex items-center justify-center gap-2 shadow-md disabled:opacity-50 cursor-pointer"
              >
                {isInspecting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                    جاري استخراج وتحليل بيانات YouTube...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    تحليل الرابط وتجهيز المحاضرات
                  </>
                )}
              </button>
            </form>

            {/* معاينة الفيديوهات المكتشفة قبل الحفظ */}
            {inspectedItems && inspectedItems.length > 0 && (
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3 animate-fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-800 dark:text-slate-200">
                    المحاضرات المكتشفة ({inspectedItems.length})
                  </span>
                  <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
                    دفعة: {batchSize === 'all' ? 'الكل' : `${batchSize} دروس`}
                  </span>
                </div>

                <div className="max-h-56 overflow-y-auto space-y-1.5 p-2 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/60 dark:border-slate-700">
                  {inspectedItems.map((item, idx) => {
                    const alreadyExists = currentBookLectures.some(l => l.videoUrl && l.videoUrl.includes(item.videoId));
                    return (
                      <div 
                        key={item.videoId}
                        className={`p-2 rounded-xl text-[11px] flex items-center justify-between gap-2 border ${
                          alreadyExists 
                            ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/40 text-amber-800 dark:text-amber-300'
                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span className="font-mono text-[10px] text-slate-400 shrink-0">#{idx + 1}</span>
                          <span className="truncate font-semibold">{item.title}</span>
                          {item.duration && item.duration !== '00:00' && (
                            <span className="text-[10px] text-slate-600 dark:text-slate-300 font-mono bg-slate-100 dark:bg-slate-700/60 px-1.5 py-0.5 rounded shrink-0">
                              ⏱️ {item.duration}
                            </span>
                          )}
                        </div>
                        {alreadyExists ? (
                          <span className="text-[9px] bg-amber-500/20 text-amber-700 dark:text-amber-300 px-1.5 py-0.5 rounded-md shrink-0 font-bold">
                            موجود مسبقاً (سيُتخطى)
                          </span>
                        ) : (
                          <span className="text-[9px] bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 px-1.5 py-0.5 rounded-md shrink-0 font-bold">
                            جديد
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* زر تأكيد الحفظ وبدء الاستيراد */}
                <button
                  type="button"
                  onClick={handleCreateAndStart}
                  disabled={isProcessing}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      جاري الاستيراد والتسجيل في Firebase...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-white" />
                      بدء الاستيراد الفعلي في Firebase
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* قائمة المهام السابقة المحفوظة في Firebase */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-sm space-y-4">
            <h4 className="text-xs font-black text-slate-500 dark:text-slate-400 flex items-center justify-between">
              <span>مهام الاستيراد المحفوظة في Firebase</span>
              <span className="text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                {tasks.length} مهام
              </span>
            </h4>

            {tasksLoading ? (
              <div className="text-center py-4 text-xs text-slate-400">جاري تحميل سجل المهام...</div>
            ) : tasks.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-400 bg-slate-50 dark:bg-slate-800/40 rounded-2xl">
                لا توجد مهام استيراد سابقة. قم بإعداد استيراد جديد بالأعلى.
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {tasks.map(t => {
                  const isSelected = activeTask?.id === t.id;
                  const isComplete = t.status === 'completed';
                  const isRunning = t.status === 'running';
                  const isPaused = t.status === 'paused';

                  return (
                    <div
                      key={t.id}
                      onClick={() => setSelectedTaskId(t.id)}
                      className={`p-3 rounded-2xl border text-right transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {t.bookTitle}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate mt-0.5">
                          {t.courseTitle} • {t.completedCount} مكتمل من {t.totalCount}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {isComplete && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                            مكتملة
                          </span>
                        )}
                        {isRunning && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 animate-pulse">
                            جارية
                          </span>
                        )}
                        {isPaused && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
                            متوقفة
                          </span>
                        )}

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setTaskToDelete(t);
                            setDeleteMode(t.completedCount > 0 ? 'task_and_lectures' : 'task_only');
                          }}
                          className="p-1 text-slate-400 hover:text-rose-500 rounded-lg transition-colors cursor-pointer"
                          title="خيارات حذف المهمة أو المحاضرات"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* العمود الأيسر: لوحة متابعة المهمة والتحكم والتقدم ========================= */}
        {/* ========================================================================= */}
        <div className="lg:col-span-2 space-y-6">
          {!activeTask ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-12 rounded-3xl text-center space-y-4 shadow-sm">
              <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-950/60 rounded-3xl flex items-center justify-center mx-auto text-emerald-600 dark:text-emerald-400">
                <Youtube className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                لا توجد مهمة استيراد نشطة حالياً
              </h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                قم باختيار الدورة والكتاب وإدخال رابط قائمة تشغيل YouTube من اللوحة الجانبية، ثم اضغط على «تحليل الرابط وتجهيز المحاضرات» للبدء.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* بطاقة معلومات وتحكم المهمة النشطة */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-slate-400">معرف المهمة: {activeTask.id}</span>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                        activeTask.status === 'completed'
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400'
                          : activeTask.status === 'running'
                            ? 'bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400'
                            : 'bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400'
                      }`}>
                        {activeTask.status === 'completed' ? 'مكتملة بالكامل' : activeTask.status === 'running' ? 'قيد المعالجة' : 'متوقفة مؤقتاً'}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                      {activeTask.bookTitle} <span className="text-xs font-normal text-slate-400">({activeTask.courseTitle})</span>
                    </h3>
                  </div>

                  {/* أزرار التحكم بالمهمة: بدء، إيقاف، استئناف */}
                  <div className="flex items-center gap-2">
                    {activeTask.status === 'running' ? (
                      <button
                        type="button"
                        onClick={() => handlePauseTask(activeTask.id)}
                        className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                      >
                        <Pause className="w-4 h-4 fill-current" />
                        إيقاف مؤقت
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleResumeTask(activeTask)}
                        disabled={isProcessing || activeTask.remainingCount === 0}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-md shadow-emerald-600/20 disabled:opacity-50 cursor-pointer"
                      >
                        {activeTask.completedCount === 0 && activeTask.skippedCount === 0 ? (
                          <>
                            <Play className="w-4 h-4 fill-white" />
                            بدء الاستيراد
                          </>
                        ) : (
                          <>
                            <RotateCcw className="w-4 h-4" />
                            استئناف الاستيراد
                          </>
                        )}
                      </button>
                    )}

                    {activeTask.completedCount > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setTaskToDelete(activeTask);
                          setDeleteMode('lectures_only');
                        }}
                        className="px-3 py-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/50 text-rose-700 dark:text-rose-300 font-bold text-xs rounded-xl border border-rose-200 dark:border-rose-900/60 flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                        title="حذف جميع المحاضرات التي تم استيرادها بواسطة هذه المهمة"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                        <span>حذف المحاضرات ({activeTask.completedCount})</span>
                      </button>
                    )}

                    <a
                      href={activeTask.playlistUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-rose-600 rounded-xl transition-colors"
                      title="فتح رابط قائمة التشغيل في YouTube"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>

                {/* كروت العدادات ومؤشرات التقدم */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-2xl border border-slate-200/60 dark:border-slate-800 text-center">
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">إجمالي المحاضرات</div>
                    <div className="text-xl font-black font-mono text-slate-900 dark:text-white mt-1">
                      {activeTask.totalCount}
                    </div>
                  </div>

                  <div className="bg-emerald-50/60 dark:bg-emerald-950/40 p-3.5 rounded-2xl border border-emerald-200/60 dark:border-emerald-900/40 text-center">
                    <div className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold">المكتملة</div>
                    <div className="text-xl font-black font-mono text-emerald-600 dark:text-emerald-400 mt-1">
                      {activeTask.completedCount}
                    </div>
                  </div>

                  <div className="bg-blue-50/60 dark:bg-blue-950/40 p-3.5 rounded-2xl border border-blue-200/60 dark:border-blue-900/40 text-center">
                    <div className="text-[10px] text-blue-700 dark:text-blue-400 font-bold">المتبقية</div>
                    <div className="text-xl font-black font-mono text-blue-600 dark:text-blue-400 mt-1">
                      {activeTask.remainingCount}
                    </div>
                  </div>

                  <div className="bg-amber-50/60 dark:bg-amber-950/40 p-3.5 rounded-2xl border border-amber-200/60 dark:border-amber-900/40 text-center">
                    <div className="text-[10px] text-amber-700 dark:text-amber-400 font-bold">المتخطاة (تكرار)</div>
                    <div className="text-xl font-black font-mono text-amber-600 dark:text-amber-400 mt-1">
                      {activeTask.skippedCount}
                    </div>
                  </div>

                  <div className="bg-rose-50/60 dark:bg-rose-950/40 p-3.5 rounded-2xl border border-rose-200/60 dark:border-rose-900/40 text-center">
                    <div className="text-[10px] text-rose-700 dark:text-rose-400 font-bold">الأخطاء</div>
                    <div className="text-xl font-black font-mono text-rose-600 dark:text-rose-400 mt-1">
                      {activeTask.errorCount}
                    </div>
                  </div>
                </div>

                {/* شريط مؤشر التقدم المرئي */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className="text-slate-600 dark:text-slate-400">مؤشر التقدم العام</span>
                    <span className="font-mono text-emerald-600 dark:text-emerald-400">{progressPercentage}%</span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                  <div className="text-[10px] text-slate-400 flex justify-between">
                    <span>حجم الدفعة المحدد: {activeTask.batchSize === 'all' ? 'جميع المحاضرات دفعة واحدة' : `${activeTask.batchSize} محاضرات في كل تشغيل`}</span>
                    <span>آخر تحديث: {new Date(activeTask.updatedAt).toLocaleTimeString('ar-SA')}</span>
                  </div>
                </div>

                {/* كرت كتاب المتن المرفق بالمحاضرات (PDF) */}
                <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="space-y-0.5 min-w-0">
                      <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <span>كتاب المتن المرفق بالمحاضرات (PDF)</span>
                        {activeTask.pdfUrl ? (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold">
                            مربوط بالمحاضرات
                          </span>
                        ) : (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-bold">
                            غير مرفق حالياً
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate font-mono max-w-md" dir="ltr">
                        {activeTask.pdfUrl || 'لم يتم تعيين رابط PDF لهذه المهمة بعد'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {activeTask.pdfUrl && (
                      <a
                        href={activeTask.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold hover:text-blue-600 flex items-center gap-1.5 transition-colors"
                        title="فتح ملف PDF في نافذة جديدة"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>معاينة PDF</span>
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setCustomTaskPdfUrl(activeTask.pdfUrl || '');
                        setIsEditingTaskPdf(prev => !prev);
                      }}
                      className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>{activeTask.pdfUrl ? 'تعديل / تعميم PDF' : 'إرفاق كتاب PDF لجميع المحاضرات'}</span>
                    </button>
                  </div>
                </div>

                {/* نافذة أو شريط إدخال رابط PDF للمهمة النشطة */}
                {isEditingTaskPdf && (
                  <div className="bg-blue-50/70 dark:bg-blue-950/40 p-4 rounded-2xl border border-blue-200 dark:border-blue-900/60 space-y-3 animate-fade-in">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-blue-900 dark:text-blue-200">
                        إرفاق أو تحديث رابط PDF لجميع المحاضرات المضافة في هذه المهمة:
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsEditingTaskPdf(false)}
                        className="text-slate-400 hover:text-slate-600 p-1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="url"
                        value={customTaskPdfUrl}
                        onChange={(e) => setCustomTaskPdfUrl(e.target.value)}
                        placeholder="https://example.com/book.pdf"
                        className="flex-1 px-3 py-2 rounded-xl border border-blue-300 dark:border-blue-700 bg-white dark:bg-slate-800 text-xs font-mono text-slate-800 dark:text-slate-200 text-left focus:outline-none focus:ring-2 focus:ring-blue-500"
                        dir="ltr"
                      />
                      <button
                        type="button"
                        disabled={isApplyingPdf || !customTaskPdfUrl.trim()}
                        onClick={async () => {
                          try {
                            setIsApplyingPdf(true);
                            await applyPdfToTaskLectures(activeTask.id, customTaskPdfUrl.trim());
                            showSuccess('تم تحديث كتاب PDF', 'تم إرفاق وتحديث رابط كتاب PDF لجميع المحاضرات في هذه المهمة بنجاح.');
                            setIsEditingTaskPdf(false);
                          } catch (err: any) {
                            showError('فشل التحديث', err.message);
                          } finally {
                            setIsApplyingPdf(false);
                          }
                        }}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0"
                      >
                        {isApplyingPdf ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>جاري التحديث...</span>
                          </>
                        ) : (
                          <>
                            <Check className="w-4 h-4" />
                            <span>تطبيق على جميع المحاضرات</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* جدول ومسرد محاضرات المهمة وحالة كل درس */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <ListOrdered className="w-4 h-4 text-emerald-600" />
                    مسرد المحاضرات المكتشفة وحالة المعالجة
                  </h4>
                  <span className="text-xs text-slate-400 font-mono">
                    {activeTask.items.length} عنصر
                  </span>
                </div>

                <div className="space-y-2.5 max-h-[480px] overflow-y-auto pr-1">
                  {activeTask.items.map((item, idx) => {
                    const isCompleted = item.status === 'completed';
                    const isSkipped = item.status === 'skipped';
                    const isFailed = item.status === 'failed';
                    const isPending = item.status === 'pending';

                    return (
                      <div
                        key={item.id}
                        className={`p-3.5 rounded-2xl border transition-all text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                          isCompleted
                            ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40'
                            : isSkipped
                              ? 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/40'
                              : isFailed
                                ? 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/40'
                                : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800'
                        }`}
                      >
                        <div className="flex items-start gap-3 min-w-0">
                          <span className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-mono text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                            {idx + 1}
                          </span>

                          <div className="space-y-1 min-w-0">
                            <div className="font-bold text-slate-900 dark:text-slate-100 truncate">
                              {item.title}
                            </div>
                            <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-400 font-mono">
                              <span>معرّف الفيديو: {item.videoId}</span>
                              {item.duration && item.duration !== '00:00' && (
                                <span className="text-slate-600 dark:text-slate-300 font-bold bg-slate-200/60 dark:bg-slate-700/60 px-1.5 py-0.5 rounded">
                                  ⏱️ {item.duration}
                                </span>
                              )}
                              {item.importedLectureId && (
                                <span className="text-emerald-600 dark:text-emerald-400">
                                  • مسجلة بـ ID: {item.importedLectureId}
                                </span>
                              )}
                              {item.skipReason && (
                                <span className="text-amber-600 dark:text-amber-400 font-sans">
                                  • {item.skipReason}
                                </span>
                              )}
                              {item.errorMessage && (
                                <span className="text-rose-600 dark:text-rose-400 font-sans">
                                  • {item.errorMessage}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                          {/* شارة حالة المحاضرة */}
                          {isCompleted && (
                            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              تمت الإضافة للمقرر
                            </span>
                          )}
                          {isSkipped && (
                            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
                              <Info className="w-3.5 h-3.5 text-amber-600" />
                              تم التخطي (موجودة)
                            </span>
                          )}
                          {isFailed && (
                            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300">
                              <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                              تعذر الاستيراد
                            </span>
                          )}
                          {isPending && (
                            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                              <Clock className="w-3.5 h-3.5 text-slate-500" />
                              في قائمة الانتظار
                            </span>
                          )}

                          {/* شارة حالة أسئلة NotebookLM وعدد الأسئلة */}
                          {(() => {
                            const targetLecId = item.importedLectureId || item.existingLectureId;
                            const liveQuestionsCount = targetLecId && questions 
                              ? questions.filter(q => q.lectureId === targetLecId).length 
                              : (item.quizQuestionsCount || 0);
                            const hasQuiz = item.quizStatus === 'generated' || liveQuestionsCount > 0;

                            if (hasQuiz) {
                              return (
                                <span 
                                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300/50"
                                  title={`تم استيراد وحفظ ${liveQuestionsCount} أسئلة في اختبار هذه المحاضرة بنجاح`}
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                  <span>الاختبار مكتمل ({liveQuestionsCount} أسئلة)</span>
                                </span>
                              );
                            }

                            if (isCompleted) {
                              return (
                                <span 
                                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300/50"
                                  title="المحاضرة مسجلة في Firebase وبانتظار إرسال الأسئلة من Playwright عبر POST /api/import/questions"
                                >
                                  <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                  <span>بانتظار أسئلة NotebookLM</span>
                                </span>
                              );
                            }

                            return (
                              <span 
                                className="px-2 py-1 rounded-lg text-[10px] font-bold border border-slate-200 dark:border-slate-700 text-slate-500 bg-white dark:bg-slate-800"
                                title="المحاضرة لم تستورد بعد أو تم تخطيها"
                              >
                                {isSkipped && liveQuestionsCount > 0 ? `الاختبار متوفر (${liveQuestionsCount} أسئلة)` : 'الاختبار: لم يبدأ'}
                              </span>
                            );
                          })()}

                          {/* زر نسخ سريع للمعرفات لبرنامج Playwright */}
                          {(item.importedLectureId || item.existingLectureId) && (
                            <button
                              type="button"
                              onClick={() => {
                                const targetId = item.importedLectureId || item.existingLectureId;
                                const payloadSnippet = JSON.stringify({
                                  courseId: activeTask.courseId,
                                  bookId: activeTask.bookId,
                                  lectureId: targetId,
                                  taskId: activeTask.id
                                }, null, 2);
                                copyToClipboard(payloadSnippet, `lec_${targetId}`, 'بيانات المحاضرة لـ API');
                              }}
                              className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border border-slate-200 dark:border-slate-700 rounded-lg transition-colors text-[10px] flex items-center gap-1 cursor-pointer"
                              title="نسخ معرّفات المحاضرة للـ API"
                            >
                              <Copy className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">معرّف الـ API</span>
                            </button>
                          )}

                          {/* شارة إرفاق كتاب PDF */}
                          {(item.pdfUrl || activeTask.pdfUrl) && (
                            <a
                              href={item.pdfUrl || activeTask.pdfUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-lg transition-colors text-[10px] flex items-center gap-1 cursor-pointer"
                              title="كتاب PDF مرفق بالمحاضرة - انقر للفتح"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">كتاب PDF</span>
                            </a>
                          )}

                          <a
                            href={item.videoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors"
                            title="مشاهدة على YouTube"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      ) : (
        /* ========================================================================= */
        /* ================= تبويب أتمتة NotebookLM ومسار API (المرحلة 2) ============ */
        /* ========================================================================= */
        <div className="space-y-6 animate-fade-in text-right" dir="rtl">
          {/* بطاقة معلومات المسار البرمجي وحالة الأمان */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 rounded-3xl shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 text-xs font-bold border border-emerald-300/40">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>مسار خادم آمن وقابل للنشر (Production Express Endpoint)</span>
                </div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">
                  واجهة استقبال أسئلة NotebookLM الآلية
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
                  تسمح لبرنامج الأتمتة المحلي لديك (مثل Playwright) بإرسال أسئلة المحاضرات بصيغة JSON ليتم فحصها ومنع تكرارها وحفظها تلقائياً في Firebase وتحديث حالة الاختبار.
                </p>
              </div>

              {/* زر فحص الاتصال الحي السريع */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={verifyStatus === 'testing'}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-sm transition-all disabled:opacity-50 cursor-pointer active:scale-95"
                >
                  {verifyStatus === 'testing' ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>جاري الفحص...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>فحص الاتصال بالخادم الآن</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* نتيجة فحص الاتصال الحي إن وجدت */}
            {verifyStatus !== 'idle' && (
              <div className={`p-4 rounded-2xl border text-xs flex items-center gap-3 animate-fade-in ${
                verifyStatus === 'success' 
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 text-emerald-800 dark:text-emerald-300'
                  : 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 text-rose-800 dark:text-rose-300'
              }`}>
                {verifyStatus === 'success' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                )}
                <div>
                  <div className="font-bold">
                    {verifyStatus === 'success' ? 'الاتصال مصرح به وصالح للأتمتة ✅' : 'فشل التحقق من الاتصال ❌'}
                  </div>
                  <div className="text-[11px] opacity-90 mt-0.5">{verifyDetails}</div>
                </div>
              </div>
            )}

            {/* تفاصيل المنفذ والمصادقة */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* مسار المنفذ */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-2">
                <div className="text-xs font-bold text-slate-500 dark:text-slate-400">عنوان مسار الـ API:</div>
                <div className="flex items-center justify-between gap-2 bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400 select-all" dir="ltr">
                    POST /api/import/questions
                  </span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(buildApiUrl('/api/import/questions') === '/api/import/questions' ? `${getResolvedApiOrigin()}/api/import/questions` : buildApiUrl('/api/import/questions'), 'api_url', 'الرابط الكامل للمسار')}
                    className="p-1.5 text-slate-400 hover:text-emerald-600 rounded-lg transition-colors"
                    title="نسخ الرابط الكامل"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-[10px] text-slate-400">
                  الرابط الكامل: <span className="font-mono text-slate-600 dark:text-slate-300" dir="ltr">{getResolvedApiOrigin()}/api/import/questions</span>
                </p>
              </div>

              {/* أمان مفتاح المشرف للأتمتة */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Key className="w-4 h-4 text-emerald-600" />
                    <span>حماية المسارات (Server-Side IMPORT_API_KEY):</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300/40">
                    مخزن على الخادم فقط
                  </span>
                </div>

                <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5">
                  <div className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                    مفتاح الأتمتة يُعيّن كمتغير بيئي <code className="font-mono text-emerald-600 font-bold">IMPORT_API_KEY</code> على خادم المنصة ولا يُعرض في واجهة المتصفح نهائياً.
                  </div>
                  <div className="flex items-center justify-between gap-2 p-2 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800">
                    <span className="font-mono text-[11px] text-slate-700 dark:text-slate-300 select-all" dir="ltr">
                      x-admin-key: YOUR_SECRET_KEY
                    </span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(`curl -i ${getResolvedApiOrigin()}/api/import/verify -H "x-admin-key: YOUR_SECRET_KEY"`, 'curl_test', 'أمر اختبار curl')}
                      className="p-1 text-slate-400 hover:text-emerald-600 rounded transition-colors"
                      title="نسخ أمر اختبار curl"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <p className="text-[10px] text-slate-400">
                  يُرسل المفتاح في ترويسة الطلب من سكربت Playwright أو curl عبر <code className="font-mono text-slate-600 dark:text-slate-300">x-admin-key</code>.
                </p>
              </div>
            </div>
          </div>

          {/* نموذج JSON المعتمد والشرح */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* بطاقة بنية الـ JSON */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-emerald-600" />
                  <span>بنية كائن JSON المطلوب إرساله</span>
                </h4>
                <button
                  type="button"
                  onClick={() => {
                    const sampleJson = JSON.stringify({
                      courseId: activeTask ? activeTask.courseId : "course_123",
                      bookId: activeTask ? activeTask.bookId : "book_456",
                      lectureId: activeTask && activeTask.items.find(i => i.importedLectureId || i.existingLectureId) 
                        ? (activeTask.items.find(i => i.importedLectureId || i.existingLectureId)?.importedLectureId || activeTask.items.find(i => i.importedLectureId || i.existingLectureId)?.existingLectureId)
                        : "lec_789",
                      taskId: activeTask ? activeTask.id : undefined,
                      questions: [
                        {
                          type: "multiple_choice",
                          question: "ما هو الركن الأعظم في الإسلام بعد الشهادتين؟",
                          options: ["إقام الصلاة", "صوم رمضان", "إيتاء الزكاة", "حج البيت"],
                          correctAnswer: "إقام الصلاة",
                          points: 5,
                          order: 1
                        },
                        {
                          type: "true_false",
                          question: "توحيد الربوبية يقتضي إفراد الله بالخلق والرزق والتدبير.",
                          correctAnswer: "true",
                          points: 5,
                          order: 2
                        },
                        {
                          type: "short_answer",
                          question: "ما هو الكتاب الذي يشرحه الشيخ في هذا المجلس العلمي؟",
                          correctAnswer: activeTask ? activeTask.bookTitle : "كتاب التوحيد",
                          points: 5,
                          order: 3
                        }
                      ]
                    }, null, 2);
                    copyToClipboard(sampleJson, 'sample_json', 'نموذج كائن JSON');
                  }}
                  className="px-3 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>نسخ النموذج</span>
                </button>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed">
                يقبل المسار كائناً يحتوي على المعرفات الثلاثة <code className="font-mono text-emerald-600 font-bold">courseId, bookId, lectureId</code> ومصفوفة <code className="font-mono text-emerald-600 font-bold">questions</code> بالأنواع الثلاثة المدعومة في النظام.
              </p>

              <pre className="bg-slate-950 text-slate-200 p-4 rounded-2xl text-[11px] font-mono overflow-x-auto max-h-80 border border-slate-800 leading-relaxed text-left" dir="ltr">
{`{
  "courseId": "${activeTask ? activeTask.courseId : "course_id_here"}",
  "bookId": "${activeTask ? activeTask.bookId : "book_id_here"}",
  "lectureId": "${(activeTask && activeTask.items.find(i => i.importedLectureId || i.existingLectureId)?.importedLectureId) || "lecture_id_here"}",
  "taskId": "${activeTask ? activeTask.id : "task_id_here"}",
  "questions": [
    {
      "type": "multiple_choice",
      "question": "ما هو الركن الأعظم بعد الشهادتين؟",
      "options": ["إقام الصلاة", "صوم رمضان", "إيتاء الزكاة"],
      "correctAnswer": "إقام الصلاة",
      "points": 5,
      "order": 1
    },
    {
      "type": "true_false",
      "question": "توحيد الألوهية هو إفراد الله بجميع أنواع العبادة.",
      "correctAnswer": "true",
      "points": 5,
      "order": 2
    },
    {
      "type": "short_answer",
      "question": "ما هو أول واجب على المكلف؟",
      "correctAnswer": "التوحيد",
      "points": 5,
      "order": 3
    }
  ]
}`}
              </pre>

              <div className="text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
                <div>• <strong className="text-slate-700 dark:text-slate-300">ملاحظة أسئلة صح وخطأ:</strong> الخادم يدعم تلقائياً القيم العربية ("صح" / "خطأ") ويقوم بتطبيعها داخلياً إلى ("true" / "false") لضمان توافقها مع تصحيح الاختبارات في الموقع.</div>
                <div>• <strong className="text-slate-700 dark:text-slate-300">منع التكرار:</strong> إذا أُعيد تشغيل سكربت الأتمتة، فلن تُكرر الأسئلة ذات النص نفسه في المحاضرة.</div>
              </div>
            </div>

            {/* بطاقة كود الأتمتة الجاهز بواسطة Playwright */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-emerald-600" />
                  <span>سكربت الأتمتة المحلي (Playwright / Node.js)</span>
                </h4>
                <button
                  type="button"
                  onClick={() => {
                    const scriptCode = `// send_notebooklm_questions.js
// سكربت إرسال أسئلة NotebookLM إلى الواجهة البرمجية في الخادم المستقل
const API_URL = '${getResolvedApiOrigin()}/api/import/questions';
const ADMIN_KEY = process.env.IMPORT_API_KEY || 'YOUR_SECRET_IMPORT_API_KEY';

async function sendQuestionsToPlatform(quizPayload) {
  try {
    console.log("جاري إرسال الأسئلة إلى منصة طالب العلم...");
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-key': ADMIN_KEY
      },
      body: JSON.stringify(quizPayload)
    });

    const result = await response.json();
    if (!response.ok || !result.success) {
      throw new Error(result.error || 'فشل إرسال الأسئلة');
    }

    console.log("✅ تم الحفظ بنجاح:", result.message);
    console.log("إجمالي الأسئلة في المحاضرة الآن:", result.totalQuestionsInLecture);
    return result;
  } catch (error) {
    console.error("❌ خطأ أثناء إرسال الأسئلة:", error.message);
    throw error;
  }
}

// مثال استدعاء:
// sendQuestionsToPlatform({ courseId, bookId, lectureId, questions: [...] });
`;
                    copyToClipboard(scriptCode, 'playwright_script', 'كود سكربت الأتمتة');
                  }}
                  className="px-3 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>نسخ كود الإرسال</span>
                </button>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed">
                يمكن لبرنامج Playwright بعد استخراج استجابة محادثة NotebookLM إرسالها مباشرة عبر دالة <code className="font-mono text-emerald-600 font-bold">fetch</code> القياسية مع ترويسة <code className="font-mono text-emerald-600 font-bold">x-admin-key</code>.
              </p>

              <pre className="bg-slate-950 text-slate-200 p-4 rounded-2xl text-[11px] font-mono overflow-x-auto max-h-80 border border-slate-800 leading-relaxed text-left" dir="ltr">
{`const API_URL = '${getResolvedApiOrigin()}/api/import/questions';
const ADMIN_KEY = process.env.IMPORT_API_KEY || 'YOUR_SECRET_IMPORT_API_KEY';

async function sendQuestionsToPlatform(quizPayload) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-admin-key': ADMIN_KEY
    },
    body: JSON.stringify(quizPayload)
  });

  const result = await response.json();
  if (!response.ok) throw new Error(result.error);
  console.log("✅ نجاح الحفظ:", result);
  return result;
}`}
              </pre>

              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300">
                💡 <span className="font-bold">حماية تامة:</span> لا يتطلب الكود تحميل أي ملفات سرية لـ Firebase Admin SDK أو مفاتيح خاصة على حاسوبك، فقط مفتاح المشرف المشفر الآمن.
              </div>
            </div>
          </div>

          {/* جدول معرفات المحاضرات بالمهمة النشطة لتسهيل الأتمتة */}
          {activeTask && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <ListOrdered className="w-4 h-4 text-emerald-600" />
                    <span>المحاضرات المتاحة للأتمتة في المهمة الحالية ({activeTask.bookTitle})</span>
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    انسخ معرّف أي محاضرة مستوردة والصقه في سكربت NotebookLM لإرسال أسئلتها مباشرة.
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-xl">
                  {activeTask.items.filter(i => i.importedLectureId || i.existingLectureId).length} محاضرات جاهزة
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold">
                      <th className="py-2.5 px-3 w-12 text-center">#</th>
                      <th className="py-2.5 px-3">عنوان المحاضرة</th>
                      <th className="py-2.5 px-3 font-mono">معرّف المحاضرة (lectureId)</th>
                      <th className="py-2.5 px-3 text-center">حالة الاختبار</th>
                      <th className="py-2.5 px-3 text-center">عدد الأسئلة</th>
                      <th className="py-2.5 px-3 text-left">إجراء</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {activeTask.items.map((it, idx) => {
                      const lecId = it.importedLectureId || it.existingLectureId;
                      const qCount = lecId && questions ? questions.filter(q => q.lectureId === lecId).length : (it.quizQuestionsCount || 0);
                      const hasQuiz = it.quizStatus === 'generated' || qCount > 0;

                      return (
                        <tr key={it.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                          <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-400">{idx + 1}</td>
                          <td className="py-2.5 px-3 font-bold text-slate-800 dark:text-slate-200 max-w-xs truncate">{it.title}</td>
                          <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500">
                            {lecId ? (
                              <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded font-bold text-emerald-600 dark:text-emerald-400 select-all">
                                {lecId}
                              </span>
                            ) : (
                              <span className="text-slate-400 italic">لم تُستورد بعد</span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            {hasQuiz ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                مكتمل
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                                <Clock className="w-3 h-3 text-amber-600" />
                                بانتظار الأسئلة
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-700 dark:text-slate-300">
                            {qCount}
                          </td>
                          <td className="py-2.5 px-3 text-left">
                            {lecId && (
                              <button
                                type="button"
                                onClick={() => {
                                  const snippet = JSON.stringify({
                                    courseId: activeTask.courseId,
                                    bookId: activeTask.bookId,
                                    lectureId: lecId,
                                    taskId: activeTask.id
                                  }, null, 2);
                                  copyToClipboard(snippet, `row_${lecId}`, 'بيانات المحاضرة لـ API');
                                }}
                                className="px-2.5 py-1 text-slate-600 dark:text-slate-300 hover:text-emerald-600 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                              >
                                <Copy className="w-3 h-3" />
                                <span>نسخ المعرفات</span>
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* نافذة تأكيد حذف المحاضرات المستوردة أو المهمة */}
      {taskToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-5 text-right font-sans" dir="rtl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 text-rose-600">
                <Trash2 className="w-5 h-5" />
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  {deleteMode === 'lectures_only' ? 'حذف المحاضرات المستوردة' : 'خيارات حذف المهمة والمحاضرات'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => !isDeleting && setTaskToDelete(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer"
                disabled={isDeleting}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-200/70 dark:border-slate-700/60 space-y-1 text-xs">
              <div className="font-bold text-slate-900 dark:text-white">
                الكتاب: {taskToDelete.bookTitle}
              </div>
              <div className="text-slate-500 dark:text-slate-400">
                الدورة: {taskToDelete.courseTitle} • المحاضرات المستوردة الحالية: {taskToDelete.completedCount}
              </div>
            </div>

            {/* خيارات الحذف */}
            <div className="space-y-2.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                حدد الإجراء المطلوب:
              </label>

              {taskToDelete.completedCount > 0 && (
                <div 
                  onClick={() => setDeleteMode('lectures_only')}
                  className={`p-3 rounded-2xl border flex items-start gap-3 cursor-pointer transition-all ${
                    deleteMode === 'lectures_only'
                      ? 'border-rose-500 bg-rose-50/60 dark:bg-rose-950/40 text-rose-950 dark:text-rose-100'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="deleteMode"
                    checked={deleteMode === 'lectures_only'}
                    onChange={() => setDeleteMode('lectures_only')}
                    className="mt-1 text-rose-600 focus:ring-rose-500"
                  />
                  <div className="space-y-0.5 text-xs">
                    <div className="font-bold">حذف المحاضرات المستوردة فقط ({taskToDelete.completedCount} محاضرة)</div>
                    <div className="text-[11px] opacity-80">
                      سيتم حذف جميع المحاضرات التي أضيفت بواسطة هذه المهمة من المقرر واختباراتها، مع إبقاء سجل المهمة لتتمكن من إعادة الاستيراد إن رغبت.
                    </div>
                  </div>
                </div>
              )}

              {taskToDelete.completedCount > 0 && (
                <div 
                  onClick={() => setDeleteMode('task_and_lectures')}
                  className={`p-3 rounded-2xl border flex items-start gap-3 cursor-pointer transition-all ${
                    deleteMode === 'task_and_lectures'
                      ? 'border-rose-500 bg-rose-50/60 dark:bg-rose-950/40 text-rose-950 dark:text-rose-100'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="deleteMode"
                    checked={deleteMode === 'task_and_lectures'}
                    onChange={() => setDeleteMode('task_and_lectures')}
                    className="mt-1 text-rose-600 focus:ring-rose-500"
                  />
                  <div className="space-y-0.5 text-xs">
                    <div className="font-bold">حذف المهمة مع كافة المحاضرات المستوردة</div>
                    <div className="text-[11px] opacity-80">
                      حذف شامل لبطاقة المهمة وجميع المحاضرات ({taskToDelete.completedCount} محاضرة) وأسئلتها نهائياً من Firestore.
                    </div>
                  </div>
                </div>
              )}

              <div 
                onClick={() => setDeleteMode('task_only')}
                className={`p-3 rounded-2xl border flex items-start gap-3 cursor-pointer transition-all ${
                  deleteMode === 'task_only'
                    ? 'border-slate-700 dark:border-slate-400 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="deleteMode"
                  checked={deleteMode === 'task_only'}
                  onChange={() => setDeleteMode('task_only')}
                  className="mt-1 text-slate-700 focus:ring-slate-500"
                />
                <div className="space-y-0.5 text-xs">
                  <div className="font-bold">حذف سجل المهمة فقط</div>
                  <div className="text-[11px] opacity-80">
                    إزالة بطاقة المهمة من لوحة الاستيراد مع الإبقاء على المحاضرات المسجلة في المقرر كما هي دون مساس.
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setTaskToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition-all cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleExecuteDelete}
                disabled={isDeleting}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-rose-600/20 disabled:opacity-50 cursor-pointer"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>جاري التنفيذ...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>تأكيد الحذف</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
