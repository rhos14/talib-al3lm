import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Tv, 
  ArrowLeftRight, 
  Bookmark, 
  CheckCircle2, 
  HelpCircle,
  Clock,
  BookMarked,
  Info,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Download,
  RotateCcw,
  Award
} from 'lucide-react';
import { CourseLectureItem, CourseBook, StudentLectureProgress, resolveFileUrl } from '../../types';
import { MediaStudyPlayer } from './MediaStudyPlayer';
import { PDFViewer } from './PDFViewer';
import { useToast } from '../../hooks/useToast';

interface StudyWorkspaceProps {
  lecture: CourseLectureItem;
  book: CourseBook;
  progress: StudentLectureProgress | undefined;
  onSaveProgress: (updated: StudentLectureProgress) => Promise<void>;
  onGoToQuiz: () => void;
  hasQuiz: boolean;
  isPassed: boolean;
}

export const StudyWorkspace: React.FC<StudyWorkspaceProps> = ({
  lecture,
  book,
  progress,
  onSaveProgress,
  onGoToQuiz,
  hasQuiz,
  isPassed
}) => {
  const { showError } = useToast();
  // Layout direction toggle: true = PDF on Right / Media on Left, false = Media on Right / PDF on Left
  const [layoutPdfRight, setLayoutPdfRight] = useState<boolean>(true);
  
  // Local state mirrored from progress prop to keep editing fluid
  const [lastPdfPage, setLastPdfPage] = useState<number>(progress?.lastPdfPage || 1);
  const [lastPlayback, setLastPlayback] = useState<number>(progress?.lastPlaybackPosition || 0);
  const [watchPercent, setWatchPercent] = useState<number>(progress?.lectureWatchPercentage || 0);
  const [readPercent, setReadPercent] = useState<number>(progress?.bookReadPercentage || 0);
  const [bookmarks, setBookmarks] = useState<number[]>(progress?.bookmarks || []);
  
  // Jump to page instruction state for PDFViewer
  const [jumpPage, setJumpPage] = useState<number>(1);

  // Synchronize when the active lecture changes
  useEffect(() => {
    setLastPdfPage(progress?.lastPdfPage || 1);
    setLastPlayback(progress?.lastPlaybackPosition || 0);
    setWatchPercent(progress?.lectureWatchPercentage || 0);
    setReadPercent(progress?.bookReadPercentage || 0);
    setBookmarks(progress?.bookmarks || []);
    setJumpPage(progress?.lastPdfPage || 1);
  }, [lecture.id, progress]);

  // Handle bookmark toggle
  const handleBookmarkToggle = async (page: number) => {
    let nextBookmarks = [...bookmarks];
    if (nextBookmarks.includes(page)) {
      nextBookmarks = nextBookmarks.filter(p => p !== page);
    } else {
      nextBookmarks.push(page);
      nextBookmarks.sort((a, b) => a - b);
    }
    setBookmarks(nextBookmarks);

    const updatedProgress: StudentLectureProgress = {
      id: lecture.id,
      lectureId: lecture.id,
      bookId: lecture.bookId,
      courseId: lecture.courseId,
      attemptsCount: progress?.attemptsCount || 0,
      lastScore: progress?.lastScore || 0,
      bestScore: progress?.bestScore || 0,
      lastAttemptDate: progress?.lastAttemptDate || '',
      isPassed: progress?.isPassed || false,
      isLectureFinished: progress?.isLectureFinished || false,
      lastPdfPage,
      lastPlaybackPosition: lastPlayback,
      lectureWatchPercentage: watchPercent,
      bookReadPercentage: readPercent,
      totalLessonProgressPercentage: Math.round((watchPercent + readPercent) / 2),
      bookmarks: nextBookmarks
    };

    await onSaveProgress(updatedProgress);
  };

  // Handle PDF page change
  const handlePageChange = async (page: number, total: number) => {
    if (total === 0) return;
    
    // Calculate page read percentage
    const nextReadPercent = Math.min(100, Math.round((page / total) * 100));
    setLastPdfPage(page);
    
    // Only update state and trigger save if values changed significantly or to a higher record
    if (page !== lastPdfPage || nextReadPercent !== readPercent) {
      setReadPercent(nextReadPercent);

      // Check if watch element is completed to mark as finished
      const isWatchCompleted = watchPercent >= 95;
      const shouldFinish = isWatchCompleted;

      const updatedProgress: StudentLectureProgress = {
        id: lecture.id,
        lectureId: lecture.id,
        bookId: lecture.bookId,
        courseId: lecture.courseId,
        attemptsCount: progress?.attemptsCount || 0,
        lastScore: progress?.lastScore || 0,
        bestScore: progress?.bestScore || 0,
        lastAttemptDate: progress?.lastAttemptDate || '',
        isPassed: progress?.isPassed || false,
        isLectureFinished: progress?.isLectureFinished || shouldFinish,
        lastPdfPage: page,
        lastPlaybackPosition: lastPlayback,
        lectureWatchPercentage: watchPercent,
        bookReadPercentage: nextReadPercent,
        totalLessonProgressPercentage: watchPercent,
        bookmarks
      };

      await onSaveProgress(updatedProgress);
    }
  };

  // Handle Media playback update
  const handleMediaTimeUpdate = async (currentTime: number, duration: number, percentage: number) => {
    const nextWatchPercent = Math.min(100, Math.round(percentage));
    const cleanTime = Math.round(currentTime);

    // Save playback position periodically (avoid saving every millisecond, save if changed by 5+ seconds, or reached 95%+)
    const isSignificantChange = Math.abs(cleanTime - lastPlayback) >= 5 || nextWatchPercent >= 95;
    
    if (isSignificantChange || nextWatchPercent > watchPercent) {
      setLastPlayback(cleanTime);
      setWatchPercent(Math.max(watchPercent, nextWatchPercent));

      const isWatchCompleted = Math.max(watchPercent, nextWatchPercent) >= 95;
      const shouldFinish = isWatchCompleted;

      const updatedProgress: StudentLectureProgress = {
        id: lecture.id,
        lectureId: lecture.id,
        bookId: lecture.bookId,
        courseId: lecture.courseId,
        attemptsCount: progress?.attemptsCount || 0,
        lastScore: progress?.lastScore || 0,
        bestScore: progress?.bestScore || 0,
        lastAttemptDate: progress?.lastAttemptDate || '',
        isPassed: progress?.isPassed || false,
        isLectureFinished: progress?.isLectureFinished || shouldFinish,
        lastPdfPage,
        lastPlaybackPosition: cleanTime,
        lectureWatchPercentage: Math.max(watchPercent, nextWatchPercent),
        bookReadPercentage: readPercent,
        totalLessonProgressPercentage: Math.max(watchPercent, nextWatchPercent),
        bookmarks
      };

      await onSaveProgress(updatedProgress);
    }
  };

  // Handle direct finish trigger when media finished
  const handleMediaFinished = async () => {
    setWatchPercent(100);
    const isWatchCompleted = true;
    const shouldFinish = isWatchCompleted;

    const updatedProgress: StudentLectureProgress = {
      id: lecture.id,
      lectureId: lecture.id,
      bookId: lecture.bookId,
      courseId: lecture.courseId,
      attemptsCount: progress?.attemptsCount || 0,
      lastScore: progress?.lastScore || 0,
      bestScore: progress?.bestScore || 0,
      lastAttemptDate: progress?.lastAttemptDate || '',
      isPassed: progress?.isPassed || false,
      isLectureFinished: progress?.isLectureFinished || shouldFinish,
      lastPdfPage,
      lastPlaybackPosition: lastPlayback,
      lectureWatchPercentage: 100,
      bookReadPercentage: readPercent,
      totalLessonProgressPercentage: 100,
      bookmarks
    };

    await onSaveProgress(updatedProgress);
  };

  const handleMarkAsComplete = async () => {
    setWatchPercent(100);
    const updatedProgress: StudentLectureProgress = {
      id: lecture.id,
      lectureId: lecture.id,
      bookId: lecture.bookId,
      courseId: lecture.courseId,
      attemptsCount: progress?.attemptsCount || 0,
      lastScore: progress?.lastScore || 0,
      bestScore: progress?.bestScore || 0,
      lastAttemptDate: progress?.lastAttemptDate || '',
      isPassed: progress?.isPassed || false,
      isLectureFinished: true,
      lastPdfPage: 1,
      lastPlaybackPosition: 0,
      lectureWatchPercentage: 100,
      bookReadPercentage: 100,
      totalLessonProgressPercentage: 100,
      bookmarks: []
    };
    await onSaveProgress(updatedProgress);
  };

  const handleOpenBook = (url: string) => {
    console.log("[DEBUG] inside handleOpenBook (StudyWorkspace) - Input:", url);
    if (!url) return;
    const cleanUrl = url.trim();
    console.log("[DEBUG] inside handleOpenBook (StudyWorkspace) - Opening direct URL:", cleanUrl);
    window.open(cleanUrl, "_blank", "noopener,noreferrer");
  };

  const handleOpenAudio = async () => {
    if (lecture.audioUrl) {
      console.log("[DEBUG] StudyWorkspace - Opening Audio URL (Database Original):", lecture.audioUrl);
      const cleanUrl = lecture.audioUrl.trim();
      if (cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://')) {
        console.log("[DEBUG] StudyWorkspace - External Audio URL detected, opening directly:", cleanUrl);
        window.open(cleanUrl, '_blank', 'noopener,noreferrer');
      } else {
        const resolved = resolveFileUrl(cleanUrl);
        console.log("[DEBUG] StudyWorkspace - Internal/Resolved Audio URL:", resolved);
        window.open(resolved, '_blank', 'noopener,noreferrer');
      }
      await handleMarkAsComplete();
    }
  };

  const handleDownloadFile = (url: string, filename: string) => {
    console.log("[DEBUG] StudyWorkspace - Downloading File URL (Database Original):", url);
    if (!url) return;
    const cleanUrl = url.trim();
    if (cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://')) {
      console.log("[DEBUG] StudyWorkspace - External URL detected, opening in new tab for download:", cleanUrl);
      window.open(cleanUrl, "_blank", "noopener,noreferrer");
      return;
    }
    const resolved = resolveFileUrl(cleanUrl);
    console.log("[DEBUG] StudyWorkspace - Internal/Resolved URL:", resolved);
    const link = document.createElement('a');
    link.href = resolved;
    link.download = filename;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Total lesson progress calculation
  const totalLessonPercentage = watchPercent;
  const isLessonComplete = watchPercent >= 95;

  return (
    <div className="space-y-6 animate-fade-in print:hidden">
      
      {/* Top Professional Learning Progress Board */}
      <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-md bg-emerald-600/10 text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                <span>مجلس دراسي تفاعلي متكامل</span>
              </span>
              <span className="text-xs text-slate-400 font-serif font-semibold">| كتاب: {book.title}</span>
            </div>
            <h3 className="text-base md:text-lg font-black text-slate-900 dark:text-white font-serif leading-tight">
              {lecture.title}
            </h3>
          </div>
        </div>

        {/* Progress Card */}
        <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/60">
          {lecture.videoUrl ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Watch Progress */}
              <div className="space-y-1.5 bg-white dark:bg-slate-950 p-3.5 rounded-2xl border border-slate-200/50 dark:border-slate-800/80">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <Tv className="w-4 h-4 text-emerald-600" /> مشاهدة المحاضرة
                  </span>
                  <span className="font-mono text-emerald-600">{watchPercent}%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-emerald-600 h-full rounded-full transition-all duration-300"
                    style={{ width: `${watchPercent}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-400 leading-normal font-sans">تكتمل تلقائياً عند سماع الشرح كاملاً (95% فأكثر)</p>
              </div>

              {/* Lesson Completion Status */}
              <div className="space-y-1.5 bg-white dark:bg-slate-950 p-3.5 rounded-2xl border border-slate-200/50 dark:border-slate-800/80 flex flex-col justify-between">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-500 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-teal-600" /> حالة إنجاز المجلس
                    </span>
                    <span className="font-mono text-teal-600">{isLessonComplete ? 'مكتمل' : 'قيد المدارسة'}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-1">
                  {hasQuiz ? (
                    <span className="text-[10px] bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-bold px-2 py-0.5 rounded-md border border-emerald-100 dark:border-emerald-900/30">
                      الاختبار العلمي مفتوح ومتاح للحل الآن
                    </span>
                  ) : (
                    <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold px-2 py-0.5 rounded-md border border-slate-200">
                      لا يوجد اختبار لهذا الدرس
                    </span>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-950 p-4 rounded-2xl border border-slate-200/50 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-right space-y-1">
                <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200">الدراسة عبر الروابط الخارجية:</h5>
                <p className="text-[11px] text-slate-400">هذا المجلس متاح للمدارسة والاستماع عبر الروابط الخارجية مباشرة في المتصفح.</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {isLessonComplete ? (
                  <span className="text-xs bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-black px-3 py-1.5 rounded-xl border border-emerald-100 dark:border-emerald-900/30 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>تم تأكيد السماع بنجاح ✓</span>
                  </span>
                ) : (
                  <button
                    onClick={handleMarkAsComplete}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-black shadow-sm transition-all hover:scale-[1.01]"
                  >
                    تأكيد سماع اللقاء العلمي ✓
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Requirements status bar or Quiz CTA */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800/60 flex flex-col md:flex-row items-center justify-between gap-4 shadow-3xs">
          <div className="flex items-center gap-3 text-right">
            <div className={`p-2.5 rounded-xl border shrink-0 ${
              hasQuiz 
                ? 'bg-emerald-500/10 border-emerald-200 text-emerald-600 dark:text-emerald-400' 
                : 'bg-slate-100 border-slate-200 text-slate-500 dark:bg-slate-900 dark:border-slate-800'
            }`}>
              <Info className="w-5 h-5 animate-pulse" />
            </div>
            <div className="space-y-0.5">
              <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100 font-serif">حالة اختبار قياس التحصيل العلمي:</h4>
              <p className="text-[10px] text-slate-500 leading-relaxed font-sans">
                {hasQuiz 
                  ? 'الاختبار متاح ومفتوح لكِ الآن مباشرة دون أي شروط مسبقة. يمكنكِ حلّه والتحصيل في أي وقت.'
                  : 'لا يوجد اختبار مخصص لهذا الدرس حالياً.'}
              </p>
            </div>
          </div>

          {/* CTA: quiz trigger */}
          {hasQuiz && (() => {
            const hasAttempted = progress && (progress.attemptsCount > 0 || progress.lastScore !== undefined);
            return (
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                {hasAttempted && (
                  <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold">
                    <Award className={`w-4 h-4 ${isPassed ? 'text-emerald-500' : 'text-amber-500'}`} />
                    <span className="text-slate-600 dark:text-slate-300">درجة الاختبار القديم:</span>
                    <span className={`font-mono text-sm font-black ${isPassed ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                      {progress.lastScore}%
                    </span>
                    {isPassed ? (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-extrabold">ناجح ✓</span>
                    ) : (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-extrabold">لم يجتز</span>
                    )}
                  </div>
                )}

                <button
                  onClick={onGoToQuiz}
                  className={`w-full md:w-auto px-6 py-3 rounded-xl font-extrabold text-xs transition-all flex items-center justify-center gap-2 shadow-sm ${
                    hasAttempted
                      ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 hover:scale-[1.01] active:scale-95 cursor-pointer'
                      : isPassed 
                        ? 'bg-slate-100 dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' 
                        : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white hover:scale-[1.01] active:scale-95'
                  }`}
                >
                  {hasAttempted ? (
                    <>
                      <RotateCcw className="w-4 h-4" />
                      <span>إعادة الاختبار</span>
                    </>
                  ) : (
                    <>
                      <HelpCircle className="w-4 h-4" />
                      <span>{isPassed ? 'تم اجتياز الاختبار بنجاح بنسبة 60% ✓' : 'بدء الاختبار القصير للدرس 🎯'}</span>
                    </>
                  )}
                </button>
              </div>
            );
          })()}

          {!hasQuiz && (
            <div className="text-xs text-emerald-600 bg-emerald-500/5 border border-emerald-500/10 px-4 py-2.5 rounded-xl font-bold font-serif">
              ✨ تم إكمال متطلبات الدرس بنجاح ومتاح فتح المحاضرة التالية!
            </div>
          )}
        </div>
      </div>

      {/* Main Single-Column Study Assets */}
      <div className="space-y-6">
        {/* Play video locally if videoUrl is present */}
        {lecture.videoUrl && (
          <div className="rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xs bg-slate-950 p-1">
            <MediaStudyPlayer 
              videoUrl={lecture.videoUrl}
              title={lecture.title}
              initialTime={lastPlayback}
              onTimeUpdate={handleMediaTimeUpdate}
              onFinished={handleMediaFinished}
            />
          </div>
        )}

        {/* Study Links Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Book Card */}
          {book.pdfUrl && (
            <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-4 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 rounded-2xl w-fit">
                  <BookOpen className="w-6 h-6" />
                </div>
                <h4 className="font-black text-sm text-slate-900 dark:text-white font-serif">الكتاب المقرّر للمدارسة 📖</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  يمكنك فتح وقراءة متن الكتاب المقرّر الخاص بهذا اللقاء العلمي مباشرة في متصفح خارجي للمتابعة والمذاكرة.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                {book.pdfUrl ? (
                  <a
                    href={book.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold text-center block transition-all hover:scale-[1.01]"
                  >
                    فتح وقراءة الكتاب 📖
                  </a>
                ) : (
                  <button
                    onClick={() => showError("رابط غير متاح", "عذراً، رابط ملف الكتاب غير متاح حالياً.")}
                    className="flex-1 py-2.5 bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 rounded-xl text-xs font-bold text-center block cursor-not-allowed"
                  >
                    فتح وقراءة الكتاب 📖
                  </button>
                )}
                <button
                  onClick={() => handleDownloadFile(book.pdfUrl!, `${book.title || 'book'}.pdf`)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white rounded-xl text-xs font-bold text-center transition-all hover:scale-[1.01] flex items-center justify-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>تحميل الكتاب</span>
                </button>
              </div>
            </div>
          )}

          {/* Audio Link Card */}
          {lecture.audioUrl && (
            <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-4 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="p-3 bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 rounded-2xl w-fit">
                  <Clock className="w-6 h-6" />
                </div>
                <h4 className="font-black text-sm text-slate-900 dark:text-white font-serif">التسجيل الصوتي للمجلس 🎧</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  افتح التسجيل الصوتي للمجلس العلمي للاستماع للمحاضرة عبر مشغل المتصفح الخارجي أو تحميله مباشرة.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={handleOpenAudio}
                  className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold text-center transition-all hover:scale-[1.01]"
                >
                  فتح وسماع اللقاء 🎧
                </button>
                <button
                  onClick={() => handleDownloadFile(lecture.audioUrl!, `${lecture.title || 'lecture'}.mp3`)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white rounded-xl text-xs font-bold text-center transition-all hover:scale-[1.01] flex items-center justify-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>تحميل الصوت</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Quick summary notes or guidelines card */}
        {lecture.notes && (
          <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20 space-y-2.5 text-right">
            <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200 text-sm font-serif">
              <Info className="w-5 h-5 text-emerald-600" />
              <span>مذكرة وتلخيص المجلس العلمي 📝</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-serif pr-3 border-r-2 border-emerald-500/40 bg-transparent py-1 whitespace-pre-line">
              {lecture.notes}
            </p>
          </div>
        )}
      </div>

    </div>
  );
};
