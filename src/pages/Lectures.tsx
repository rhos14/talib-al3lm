import React, { useState, useEffect } from 'react';
import { Lecture, CourseLectureItem, StudentLectureProgress, resolveFileUrl, CourseBook, LectureQuizQuestion } from '../types';
import { buildApiUrl } from '../lib/apiClient';
import { INITIAL_LECTURES } from '../data/mockCurriculum';
import { useLocalOrCloudStorage } from '../hooks/useFirestore';
import { useCoursesManager } from '../hooks/useCoursesManager';
import { useToast } from '../hooks/useToast';
import { useAuth } from '../hooks/useAuth';
import { useCertificates } from '../hooks/useCertificates';
import { Modal } from '../components/common/Modal';
import { PDFViewer } from '../components/common/PDFViewer';
import { VideoPlayer } from '../components/common/VideoPlayer';
import { MediaStudyPlayer } from '../components/common/MediaStudyPlayer';
import { CoverImage } from '../components/common/CoverImage';
import { 
  Headphones, 
  CheckCircle2, 
  Circle, 
  Clock, 
  FileText, 
  Search, 
  Play, 
  Save,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Video,
  Music,
  ExternalLink,
  Sparkles,
  Award,
  HelpCircle,
  Check,
  X,
  Info,
  Lock,
  Download,
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  Layers
} from 'lucide-react';
import { 
  isLectureCompleted, 
  isLectureUnlocked, 
  isBookCompleted, 
  isBookUnlocked, 
  sortCourseBooks, 
  getPreviousBook, 
  getLastOpenLecture, 
  getLastOpenBook,
  isCourseCompleted,
  isCourseUnlocked,
  isStandaloneCourse,
  isMasterCourse,
  getChildCourses,
  getTopLevelCourses,
  getMasterCourseProgress,
  getPrerequisiteCourse,
  getNextChainedCourse
} from '../lib/courseProgression';

export const Lectures: React.FC = () => {
  const { items: lectures, saveItem } = useLocalOrCloudStorage<Lecture>('lectures', INITIAL_LECTURES);
  const { items: progresses, saveItem: saveProgress } = useLocalOrCloudStorage<StudentLectureProgress>('lecture_progress', []);
  const { courses, books, lectures: courseLectures, questions } = useCoursesManager();
  const { showSuccess, showError, showWarning } = useToast();
  const { userProfile, currentUser, isGuest } = useAuth();
  const { requestCertificate } = useCertificates();

  const [search, setSearch] = useState('');
  const [activeNoteModal, setActiveNoteModal] = useState<Lecture | null>(null);
  const [noteText, setNoteText] = useState('');
  const [activePdfView, setActivePdfView] = useState<{ url: string; title: string } | null>(null);

  // حالة اختيار دورة وكتاب من النظام الهرمي الجديد مع التخزين المحلي لعدم فقدان الجلسة عند التحديث
  const [activeMasterCourseId, setActiveMasterCourseId] = useState<string | null>(() => localStorage.getItem('lectures_active_master_course_id'));
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(() => localStorage.getItem('lectures_selected_course_id'));
  const [selectedBookId, setSelectedBookId] = useState<string | null>(() => localStorage.getItem('lectures_selected_book_id'));
  const [activeLectureId, setActiveLectureId] = useState<string | null>(() => localStorage.getItem('lectures_active_lecture_id'));
  
  // حالة تشغيل الملف الصوتي المدمج محلياً
  const [activeAudioId, setActiveAudioId] = useState<string | null>(null);

  // إعادة ضبط مشغل الصوت المحلي عند تغيير الدرس النشط
  React.useEffect(() => {
    setActiveAudioId(null);
  }, [activeLectureId]);

  // تنظيف حالة التصفح المحلي للدورات عند تسجيل الخروج
  React.useEffect(() => {
    if (!currentUser && !isGuest) {
      setActiveMasterCourseId(null);
      setSelectedCourseId(null);
      setSelectedBookId(null);
      setActiveLectureId(null);
      setActiveAudioId(null);
    }
  }, [currentUser, isGuest]);

  // تحديث التخزين المحلي عند تغير الاختيارات
  React.useEffect(() => {
    if (!currentUser && !isGuest) {
      localStorage.removeItem('lectures_active_master_course_id');
      return;
    }
    if (activeMasterCourseId) {
      localStorage.setItem('lectures_active_master_course_id', activeMasterCourseId);
    } else {
      localStorage.removeItem('lectures_active_master_course_id');
    }
  }, [activeMasterCourseId, currentUser, isGuest]);

  React.useEffect(() => {
    if (!currentUser && !isGuest) {
      localStorage.removeItem('lectures_selected_course_id');
      return;
    }
    if (selectedCourseId) {
      localStorage.setItem('lectures_selected_course_id', selectedCourseId);
    } else {
      localStorage.removeItem('lectures_selected_course_id');
    }
  }, [selectedCourseId, currentUser, isGuest]);

  React.useEffect(() => {
    if (!currentUser && !isGuest) {
      localStorage.removeItem('lectures_selected_book_id');
      return;
    }
    if (selectedBookId) {
      localStorage.setItem('lectures_selected_book_id', selectedBookId);
    } else {
      localStorage.removeItem('lectures_selected_book_id');
    }
  }, [selectedBookId, currentUser, isGuest]);

  React.useEffect(() => {
    if (!currentUser && !isGuest) {
      localStorage.removeItem('lectures_active_lecture_id');
      return;
    }
    if (activeLectureId) {
      localStorage.setItem('lectures_active_lecture_id', activeLectureId);
    } else {
      localStorage.removeItem('lectures_active_lecture_id');
    }
  }, [activeLectureId, currentUser, isGuest]);

  // تحديث الكتاب والدرس الافتراضي عند اختيار دورة منهجية جديدة أو تحديث الصفحة
  // يأخذ الطالب إلى آخر كتاب مفتوح، وداخل الكتاب إلى آخر محاضرة مفتوحة
  React.useEffect(() => {
    if (selectedCourseId) {
      const cBooks = sortCourseBooks(books.filter(b => b.courseId === selectedCourseId));
      if (cBooks.length === 0) {
        setSelectedBookId(null);
        setActiveLectureId(null);
        return;
      }

      const currentBook = selectedBookId ? cBooks.find(b => b.id === selectedBookId) : null;
      const isCurrentUnlocked = currentBook ? isBookUnlocked(currentBook, cBooks, courseLectures, progresses, questions) : false;

      // إذا لم يكن الكتاب الحالي محدداً أو كان مقفلاً، نوجه الطالب تلقائياً إلى آخر كتاب مفتوح
      if (!currentBook || !isCurrentUnlocked) {
        const targetBook = getLastOpenBook(cBooks, courseLectures, progresses, questions);
        if (targetBook) {
          setSelectedBookId(targetBook.id);
          const bLectures = courseLectures.filter(l => l.bookId === targetBook.id).sort((a, b) => (a.order || 0) - (b.order || 0));
          const targetLec = getLastOpenLecture(bLectures, progresses, questions, true);
          setActiveLectureId(targetLec ? targetLec.id : null);
        } else {
          setSelectedBookId(null);
          setActiveLectureId(null);
        }
      } else {
        // إذا كان الكتاب الحالي مفتوحاً، نتأكد من أن المحاضرة النشطة تنتمي له ومفتوحة
        const bLectures = courseLectures.filter(l => l.bookId === currentBook.id).sort((a, b) => (a.order || 0) - (b.order || 0));
        const currentLec = activeLectureId ? bLectures.find(l => l.id === activeLectureId) : null;
        const isLecUnlocked = currentLec ? isLectureUnlocked(currentLec, bLectures, progresses, questions, true) : false;
        if (!currentLec || !isLecUnlocked) {
          const targetLec = getLastOpenLecture(bLectures, progresses, questions, true);
          setActiveLectureId(targetLec ? targetLec.id : null);
        }
      }
    } else {
      setSelectedBookId(null);
      setActiveLectureId(null);
    }
  }, [selectedCourseId, books, courseLectures, progresses, questions]);

  // دخول الدورة المنهجية ونقل الطالب لآخر كتاب مفتوح وآخر محاضرة مفتوحة
  const handleEnterCourse = (courseId: string) => {
    const courseObj = courses.find(c => c.id === courseId);
    if (!courseObj) return;

    // إذا كانت دورة رئيسية جامعة (دورة كبيرة تضم مستويات)
    if (isMasterCourse(courseObj)) {
      setActiveMasterCourseId(courseObj.id);
      return;
    }

    const unlocked = isCourseUnlocked(courseObj, courses, books, courseLectures, progresses, questions);
    if (!unlocked) {
      const prereq = getPrerequisiteCourse(courseObj, courses);
      showWarning(
        "هذا المقرر مقفل 🔒",
        prereq
          ? `يلزم إتمام جميع كتب واختبارات «${prereq.title}» أولاً لفتح هذا المقرر ومجالسه.`
          : "يلزم إتمام المقرر السابق أولاً لفتح هذا المقرر ومجالسه."
      );
      return;
    }

    if (courseObj.parentCourseId) {
      setActiveMasterCourseId(courseObj.parentCourseId);
    }
    setSelectedCourseId(courseId);
    const cBooks = sortCourseBooks(books.filter(b => b.courseId === courseId));
    const targetBook = getLastOpenBook(cBooks, courseLectures, progresses, questions);
    if (targetBook) {
      setSelectedBookId(targetBook.id);
      const bLectures = courseLectures.filter(l => l.bookId === targetBook.id).sort((a, b) => (a.order || 0) - (b.order || 0));
      const targetLec = getLastOpenLecture(bLectures, progresses, questions, true);
      setActiveLectureId(targetLec ? targetLec.id : null);
    } else {
      setSelectedBookId(null);
      setActiveLectureId(null);
    }
  };

  // اختيار كتاب معين والبدء من آخر محاضرة مفتوحة وصل إليها الطالب في هذا الكتاب
  const handleSelectBook = (b: CourseBook) => {
    const cBooks = sortCourseBooks(books.filter(book => book.courseId === b.courseId));
    const unlocked = isBookUnlocked(b, cBooks, courseLectures, progresses, questions);
    if (!unlocked) {
      const prevBook = getPreviousBook(b, cBooks);
      showWarning(
        "هذا الكتاب مقفل 🔒",
        prevBook
          ? `يرجى إتمام جميع مجالس واختبارات كتاب «${prevBook.title}» أولاً لفتح هذا الكتاب.`
          : "يرجى إتمام الكتاب السابق أولاً لفتح هذا الكتاب."
      );
      return;
    }
    setSelectedBookId(b.id);
    const bLectures = courseLectures.filter(l => l.bookId === b.id).sort((a, b) => (a.order || 0) - (b.order || 0));
    const targetLec = getLastOpenLecture(bLectures, progresses, questions, true);
    setActiveLectureId(targetLec ? targetLec.id : null);
  };

  // حالة عرض ملاحظات الدرس المعتمدة من المشرف
  const [viewLectureNotes, setViewLectureNotes] = useState<{ title: string; notes: string } | null>(null);

  // حالة تشغيل الفيديو في مشغل مدمج ومخصص داخل التطبيق لتفادي التحويل المباشر ليوتيوب
  const [activeVideo, setActiveVideo] = useState<{ url: string; title: string } | null>(null);

  // حالة أداء الاختبار الفوري بعد المحاضرة
  const [activeQuizLecture, setActiveQuizLecture] = useState<CourseLectureItem | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizAttemptId, setQuizAttemptId] = useState<string>('');

  React.useEffect(() => {
    if (!currentUser && !isGuest) {
      setActiveVideo(null);
      setActiveQuizLecture(null);
    }
  }, [currentUser, isGuest]);

  const filtered = lectures.filter(l => l.title.includes(search) || l.sheikh.includes(search));
  const visibleCourses = courses.filter(c => c.isVisible);

  const handleOpenLink = (url: string, type: string) => {
    console.log(`[DEBUG] inside handleOpenLink (Lectures) - Input (${type}):`, url);
    if (!url) return;
    const cleanUrl = url.trim();
    if (cleanUrl.includes('/uploads/')) {
      const resolved = resolveFileUrl(cleanUrl);
      console.log(`[DEBUG] Lectures - Local uploads URL detected, opening resolved Firebase Storage URL:`, resolved);
      window.open(resolved, '_blank', 'noopener,noreferrer');
      return;
    }
    if (cleanUrl.includes('drive.google.com') || cleanUrl.includes('docs.google.com')) {
      const resolved = resolveFileUrl(cleanUrl);
      console.log(`[DEBUG] Lectures - Google Drive URL detected, opening resolved preview:`, resolved);
      window.open(resolved, '_blank', 'noopener,noreferrer');
      return;
    }
    if (cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://')) {
      console.log(`[DEBUG] Lectures - Right before window.open (External/Direct):`, cleanUrl);
      window.open(cleanUrl, '_blank', 'noopener,noreferrer');
      return;
    }
    const resolved = resolveFileUrl(cleanUrl);
    console.log(`[DEBUG] Lectures - Right before window.open (Resolved):`, resolved);
    window.open(resolved, '_blank', 'noopener,noreferrer');
  };

  const toggleWatch = async (lec: Lecture) => {
    const updated = { ...lec, isWatched: !lec.isWatched };
    await saveItem(updated);
    if (updated.isWatched) {
      showSuccess("تقبّل الله سعيك", `تم تسجيل سماع "${lec.title}"`);
    }
  };

  const handleOpenNotes = (lec: Lecture) => {
    setActiveNoteModal(lec);
    setNoteText(lec.userNotes || '');
  };

  const saveNotes = async () => {
    if (!activeNoteModal) return;
    const updated = { ...activeNoteModal, userNotes: noteText };
    await saveItem(updated);
    showSuccess("تم التقييد", "حُفظت تلخيصاتك وفوائد الدرس بنجاح");
    setActiveNoteModal(null);
  };

  // تسجيل إتمام وسماع المحاضرة التي ليس لها اختبار قصير
  const handleFinishLectureWithoutQuiz = async (lec: CourseLectureItem) => {
    const existingProgress = progresses.find(p => p.lectureId === lec.id);
    const newProgress: StudentLectureProgress = {
      id: lec.id,
      lectureId: lec.id,
      bookId: lec.bookId,
      courseId: lec.courseId,
      attemptsCount: existingProgress?.attemptsCount || 0,
      lastScore: existingProgress?.lastScore || 100,
      bestScore: existingProgress?.bestScore || 100,
      lastAttemptDate: new Date().toISOString(),
      isPassed: true,
      isLectureFinished: true,
      lectureWatchPercentage: 100,
      totalLessonProgressPercentage: 100
    };
    await saveProgress(newProgress);
    showSuccess("تم إتمام وسماع المجلس العلمي بنجاح ✓", "تقبل الله سعيك. تم فتح المجلس التالي!");

    // فحص ما إذا كانت هذه آخر محاضرة في الكتاب المفتوح لفتح الكتاب التالي
    const currentBookLectures = courseLectures.filter(l => l.bookId === lec.bookId).sort((a, b) => (a.order || 0) - (b.order || 0));
    const isLastLecInBook = currentBookLectures.length > 0 && currentBookLectures[currentBookLectures.length - 1].id === lec.id;
    if (isLastLecInBook) {
      const sortedBooks = sortCourseBooks(books.filter(b => b.courseId === lec.courseId));
      const currentBookIdx = sortedBooks.findIndex(b => b.id === lec.bookId);
      if (currentBookIdx >= 0 && currentBookIdx < sortedBooks.length - 1) {
        const nextBook = sortedBooks[currentBookIdx + 1];
        showSuccess(
          "مبارك! تم إتمام هذا الكتاب واجتيازه 📚✨",
          `أحسنتِ! تم فتح الكتاب التالي في الدورة: «${nextBook.title}». يمكنكِ الآن الانتقال إليه ومتابعة التحصيل.`
        );
      }

      // فحص ما إذا كانت الدورة قد اكتملت بالكامل لفتح الدورة التالية المربوطة بها
      const updatedProgList = [...progresses.filter(p => p.lectureId !== newProgress.lectureId), newProgress];
      const isCurrentCourseFinished = isCourseCompleted(lec.courseId, books, courseLectures, updatedProgList, questions);
      if (isCurrentCourseFinished) {
        const nextCourse = getNextChainedCourse(lec.courseId, courses);
        if (nextCourse) {
          showSuccess(
            "عرس علمي مبارك! تم فتح الدورة التالية بالكامل 🎓🔓",
            `مبارك إتمامكِ كامل متطلبات الدورة! تم الآن فتح الدورة التالية لكِ في المسار: «${nextCourse.title}»!`
          );
        }
      }
    }
  };

  // معالجة تسليم اختبار قياس التحصيل وحساب الدرجة
  const handleQuizSubmit = async (lec: CourseLectureItem) => {
    const totalQuestions = activeQuestions.length > 0 ? activeQuestions : questions.filter(q => q.lectureId === lec.id);
    if (Object.keys(quizAnswers).length < totalQuestions.length) {
      if (!confirm("لم تجيبي على جميع الأسئلة. هل ترغبين بتسليم الاختبار وحساب الدرجة على أية حال؟")) return;
    }

    // محاولة تصحيح واعتماد الاختبار عبر الخادم الموثق
    let isPassed = false;
    let percentage = 0;

    if (currentUser && !currentUser.isAnonymous) {
      const clientAttemptId = quizAttemptId || `att_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      if (!quizAttemptId) setQuizAttemptId(clientAttemptId);

      try {
        const token = await currentUser.getIdToken();
        const res = await fetch(buildApiUrl('/api/student/quiz/submit'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            lectureId: lec.id,
            attemptId: clientAttemptId,
            answers: quizAnswers
          })
        });
        const data = await res.json();
        if (res.ok && data.success) {
          isPassed = data.isPassed;
          percentage = data.percentage;
          setQuizAttemptId('');
        } else {
          showError("تعذر حفظ النتيجة في قاعدة البيانات", data.error || "حدث تعذر مؤقت في حفظ النتيجة. يرجى إعادة المحاولة لاعتماد نتيجتكِ رسمياً.");
          return;
        }
      } catch (err) {
        showError("تعذر الاتصال بالخادم لحفظ الاختبار", "حدث خطأ في الاتصال بالشبكة. يرجى الضغط على زر التسليم لإعادة المحاولة بنفس المعرف.");
        return;
      }
    }

    if (percentage === 0 && !isPassed) {
      let earnedPoints = 0;
      let totalPoints = 0;
      totalQuestions.forEach(q => {
        totalPoints += q.points;
        const ans = quizAnswers[q.id] || '';
        if (q.type === 'short_answer') {
          if (ans.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase()) earnedPoints += q.points;
        } else {
          if (ans === q.correctAnswer) earnedPoints += q.points;
        }
      });
      percentage = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 100;
      isPassed = percentage >= 60;
    }

    const existingProgress = progresses.find(p => p.lectureId === lec.id);
    const newProgress: StudentLectureProgress = {
      id: lec.id,
      lectureId: lec.id,
      bookId: lec.bookId,
      courseId: lec.courseId,
      attemptsCount: (existingProgress?.attemptsCount || 0) + 1,
      lastScore: percentage,
      bestScore: Math.max(existingProgress?.bestScore || 0, percentage),
      lastAttemptDate: new Date().toISOString(),
      isPassed: (existingProgress?.isPassed || false) || isPassed,
      isLectureFinished: true
    };

    await saveProgress(newProgress);
    setQuizSubmitted(true);

    if (isPassed) {
      if (lec.isFinalSession) {
        showSuccess("تهانينا الحارة واجتياز مبارك! 🎓🎉", `لقد اجتزتِ المجلس الختامي لكتابكِ بنسبة ${percentage}%. تم إرسال إشعار فوري للمشرفة لتقوم بمراجعة طلبكِ وإرسال الشهادة والسند المبارك لكِ!`);
        
        // إرسال طلب شهادة تلقائي للمشرف فوراً
        const targetBook = books.find(b => b.id === lec.bookId);
        const parentCourse = courses.find(c => c?.id === targetBook?.courseId);
        if (userProfile && targetBook) {
          requestCertificate(
            userProfile,
            targetBook.courseId,
            parentCourse?.title || 'الدورة العلمية',
            targetBook.id,
            targetBook.title,
            true // isFinalSession
          ).catch(err => console.warn("Request certificate error:", err));
        }
      } else {
        showSuccess("تهانينا! تم اجتياز الاختبار بنجاح 🎉", `الدرجة: ${percentage}% (درجة النجاح 60%). تم فتح الدرس التالي!`);
      }

      // فحص ما إذا كانت هذه آخر محاضرة في الكتاب المفتوح لفتح الكتاب التالي
      const currentBookLectures = courseLectures.filter(l => l.bookId === lec.bookId).sort((a, b) => (a.order || 0) - (b.order || 0));
      const isLastLecInBook = currentBookLectures.length > 0 && currentBookLectures[currentBookLectures.length - 1].id === lec.id;
      if (isLastLecInBook) {
        const sortedBooks = sortCourseBooks(books.filter(b => b.courseId === lec.courseId));
        const currentBookIdx = sortedBooks.findIndex(b => b.id === lec.bookId);
        if (currentBookIdx >= 0 && currentBookIdx < sortedBooks.length - 1) {
          const nextBook = sortedBooks[currentBookIdx + 1];
          showSuccess(
            "مبارك! تم إتمام هذا الكتاب واجتيازه 📚✨",
            `أحسنتِ! تم فتح الكتاب التالي في الدورة: «${nextBook.title}». يمكنكِ الآن الانتقال إليه ومتابعة التحصيل.`
          );
        }

        // فحص ما إذا كانت الدورة قد اكتملت بالكامل لفتح الدورة التالية المربوطة بها
        const updatedProgList = [...progresses.filter(p => p.lectureId !== newProgress.lectureId), newProgress];
        const isCurrentCourseFinished = isCourseCompleted(lec.courseId, books, courseLectures, updatedProgList, questions);
        if (isCurrentCourseFinished) {
          const nextCourse = getNextChainedCourse(lec.courseId, courses);
          if (nextCourse) {
            showSuccess(
              "عرس علمي مبارك! تم فتح الدورة التالية بالكامل 🎓🔓",
              `مبارك إتمامكِ كامل متطلبات الدورة! تم الآن فتح الدورة التالية لكِ في المسار: «${nextCourse.title}»!`
            );
          }
        }
      }
    } else {
      showError("لم يتم اجتياز الاختبار", `الدرجة: ${percentage}% (درجة النجاح 60%). نوصيكِ بمراجعة الدرس وإعادة المحاولة لتحقيق النجاح.`);
    }
  };

  // جلب الأسئلة المنقاة للاختبار من الخادم دون كشف الإجابات الصحيحة
  const [sanitizedQuizQuestions, setSanitizedQuizQuestions] = useState<LectureQuizQuestion[]>([]);
  const [quizQuestionsLoading, setQuizQuestionsLoading] = useState(false);

  useEffect(() => {
    if (!activeQuizLecture) {
      setSanitizedQuizQuestions([]);
      return;
    }

    let isMounted = true;
    const loadQuizQuestions = async () => {
      setQuizQuestionsLoading(true);
      try {
        const token = currentUser && !currentUser.isAnonymous ? await currentUser.getIdToken() : '';
        const res = await fetch(buildApiUrl(`/api/student/quiz/questions/${activeQuizLecture.id}`), {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        const data = await res.json();
        if (isMounted && data.success && Array.isArray(data.questions)) {
          setSanitizedQuizQuestions(data.questions);
        } else if (isMounted) {
          setSanitizedQuizQuestions(questions.filter(q => q.lectureId === activeQuizLecture.id));
        }
      } catch (err) {
        if (isMounted) {
          setSanitizedQuizQuestions(questions.filter(q => q.lectureId === activeQuizLecture.id));
        }
      } finally {
        if (isMounted) setQuizQuestionsLoading(false);
      }
    };

    loadQuizQuestions();
    return () => { isMounted = false; };
  }, [activeQuizLecture, currentUser, questions]);

  // حساب أسئلة اختبار المحاضرة النشطة (من الخادم بأمان ودون مفاتيح إجابات)
  const activeQuestions = sanitizedQuizQuestions.length > 0 
    ? sanitizedQuizQuestions 
    : (activeQuizLecture ? questions.filter(q => q.lectureId === activeQuizLecture.id) : []);

  // حساب متغيرات وهيكلية الدورة النشطة ومستواها التحصيلي بدقة
  const currentCourse = selectedCourseId ? courses.find(c => c.id === selectedCourseId) : null;
  const courseBooks = selectedCourseId ? sortCourseBooks(books.filter(b => b.courseId === selectedCourseId)) : [];
  const courseBookIds = new Set(courseBooks.map(b => b.id));
  const courseLecturesList = selectedCourseId 
    ? courseLectures.filter(l => l.courseId === selectedCourseId || (l.bookId && courseBookIds.has(l.bookId))) 
    : [];
  const passedLecturesCount = selectedCourseId ? courseLecturesList.filter(l => isLectureCompleted(l.id, progresses, questions)).length : 0;
  const progressPercentage = courseLecturesList.length > 0 ? Math.min(100, Math.round((passedLecturesCount / courseLecturesList.length) * 100)) : 0;
  
  // الكتاب النشط هو المختار أو آخر كتاب مفتوح في الدورة
  const activeBook = (selectedBookId ? courseBooks.find(b => b.id === selectedBookId) : null) || getLastOpenBook(courseBooks, courseLectures, progresses, questions);
  const activeBookId = activeBook?.id || null;
  const bookLectures = activeBookId ? courseLectures.filter(l => l.bookId === activeBookId).sort((a, b) => (a.order || 0) - (b.order || 0)) : [];
  const isCurrentBookUnlocked = activeBook ? isBookUnlocked(activeBook, courseBooks, courseLectures, progresses, questions) : true;
  
  // المحاضرة النشطة: تبدأ تلقائياً من آخر محاضرة مفتوحة وصل إليها الطالب في هذا الكتاب
  const activeLec = (activeLectureId ? bookLectures.find(l => l.id === activeLectureId) : null) || getLastOpenLecture(bookLectures, progresses, questions, isCurrentBookUnlocked);

  return (
    <div className="space-y-8 pb-16 animate-fade-in text-right" dir="rtl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h2 className="text-2xl font-black font-serif text-slate-800 dark:text-slate-100 flex items-center gap-2.5">
            <Headphones className="w-7 h-7 text-emerald-600 inline" />
            مجالس السماع والدورات المعتمدة
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            الدورات العلمية، الشروحات المنهجية، والمقاطع المرئية والصوتية المحدثة من إدارة المنصة
          </p>
        </div>
      </div>

      {/* --- قسم الدورات العلمية المضافة من قبل المشرفة --- */}
      {visibleCourses.length > 0 && (
        selectedCourseId && currentCourse ? (
          <div className="space-y-6 animate-fade-in text-right">
            {/* 1. لوحة تفاصيل الدورة والتقدم (Course Banner Card) */}
            <div className="p-6 rounded-3xl bg-gradient-to-l from-emerald-950 via-emerald-900 to-teal-900 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
              <div className="absolute inset-0 bg-radial-gradient from-white/5 to-transparent pointer-events-none" />
              <div className="flex items-start gap-4 z-10 flex-1 w-full">
                <CoverImage
                  src={currentCourse.imageUrl}
                  alt={currentCourse.title}
                  type="course"
                  className="w-16 h-16 md:w-20 md:h-20 rounded-2xl object-cover shrink-0 border border-white/25 shadow-md"
                />
                <div className="space-y-2 flex-1 min-w-0">
                  <span className="text-[10px] bg-white/10 text-emerald-300 px-3 py-1 rounded-full font-bold tracking-wider inline-block">
                    بوابة طالب العلم الشرعي الأكاديمية
                  </span>
                  <h3 className="text-xl md:text-2xl font-black font-serif leading-tight">
                    {currentCourse.title}
                  </h3>
                  <p className="text-xs text-emerald-100/80 max-w-2xl leading-relaxed">
                    {currentCourse.description}
                  </p>
                </div>
              </div>

              {/* إحصاءات الدورة والتقدم الدراسي */}
              <div className="flex flex-wrap items-center gap-6 z-10 text-emerald-100">
                <div className="space-y-1.5 min-w-[140px]">
                  <div className="flex items-center justify-between gap-2 text-xs font-extrabold">
                    <span>تقدمكِ بالدورة:</span>
                    <span className="font-mono text-emerald-300 font-black text-sm">{progressPercentage}%</span>
                  </div>
                  <div className="w-full bg-emerald-950/60 h-2.5 rounded-full overflow-hidden border border-emerald-800/40">
                    <div 
                      className="bg-emerald-400 h-full rounded-full transition-all duration-700 shadow-sm" 
                      style={{ width: `${progressPercentage}%` }} 
                    />
                  </div>
                </div>
                
                <div className="h-8 w-px bg-emerald-800/50 hidden lg:block" />

                <div className="text-right">
                  <span className="text-[10px] text-emerald-300 block font-bold">الكتب المنهجية</span>
                  <strong className="text-lg font-serif font-black">{courseBooks.length}</strong>
                </div>

                <div className="h-8 w-px bg-emerald-800/50 hidden lg:block" />

                <div className="text-right">
                  <span className="text-[10px] text-emerald-300 block font-bold">ساعات ومجالس السماع</span>
                  <strong className="text-lg font-serif font-black">{courseLecturesList.length}</strong>
                </div>

                <div className="h-8 w-px bg-emerald-800/50 hidden lg:block" />

                <button
                  onClick={() => {
                    setSelectedCourseId(null);
                    setSelectedBookId(null);
                    setActiveLectureId(null);
                  }}
                  className="px-4.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-black transition-all flex items-center gap-1.5 self-stretch md:self-auto justify-center hover:scale-[1.01] active:scale-95 cursor-pointer"
                >
                  <span>{currentCourse.parentCourseId ? 'الرجوع لمستويات المسار' : 'الرجوع للمناهج'}</span>
                  <ArrowLeft className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* 2. تبديل المقررات الدراسية (الكتب) داخل الدورة مع قفل الكتب المتتالية */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-2">
                {courseBooks.map(b => {
                  const unlocked = isBookUnlocked(b, courseBooks, courseLectures, progresses, questions);
                  const isCompleted = isBookCompleted(b.id, courseLectures, progresses, questions);
                  const isSelected = activeBookId === b.id;

                  return (
                    <button
                      key={b.id}
                      onClick={() => handleSelectBook(b)}
                      className={`px-3 py-2 rounded-2xl text-xs font-black transition-all flex items-center gap-2.5 shadow-2xs cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-600 text-white shadow-md'
                          : unlocked
                            ? 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                            : 'bg-slate-100/70 dark:bg-slate-900/40 border border-dashed border-slate-300 dark:border-slate-800 text-slate-400 opacity-60 hover:opacity-85'
                      }`}
                      title={unlocked ? b.title : 'كتاب مقفل - يلزم إتمام الكتاب السابق أولاً'}
                    >
                      <CoverImage
                        src={b.imageUrl}
                        alt={b.title}
                        type="book"
                        className="w-7 h-9 rounded-md object-cover shrink-0 border border-white/25"
                      />
                      {!unlocked ? (
                        <Lock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      ) : isCompleted ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      ) : (
                        <BookOpen className="w-3.5 h-3.5 shrink-0" />
                      )}
                      <span>{b.title}</span>
                      {!unlocked && (
                        <span className="text-[10px] bg-amber-500/20 text-amber-700 dark:text-amber-400 px-1.5 py-0.5 rounded-md font-bold">
                          مقفل
                        </span>
                      )}
                      {isCompleted && !isSelected && (
                        <span className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded-md font-bold">
                          مكتمل ✓
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => {
                  setSelectedCourseId(null);
                  setSelectedBookId(null);
                  setActiveLectureId(null);
                }}
                className="text-xs font-extrabold text-emerald-600 hover:text-emerald-500 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <span>{currentCourse.parentCourseId ? 'الرجوع لقائمة المستويات 📑' : 'العودة لكتالوج الكتب 📚'}</span>
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* 3. التقسيم الثنائي (لوحة تدرج المسارات + لوحة التشغيل والمذاكرة) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* العمود الأيمن (4/12): تدرج المسارات والمجلس المفتوح */}
              <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-xs space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <Award className="w-5 h-5 text-amber-500" />
                  <h4 className="font-extrabold text-sm text-slate-800 dark:text-slate-100">تدرج المسارات والمجلس المفتوح</h4>
                </div>

                <div className="space-y-2">
                  {bookLectures.map((lecItem, idx) => {
                    const isActive = activeLec?.id === lecItem.id;
                    const qCount = questions.filter(q => q.lectureId === lecItem.id).length;
                    const progress = progresses.find(p => p.lectureId === lecItem.id);
                    const isUnlocked = isLectureUnlocked(lecItem, bookLectures, progresses, questions, isCurrentBookUnlocked);
                    const isCompleted = isLectureCompleted(lecItem.id, progresses, questions);

                    return (
                      <button
                        key={lecItem.id}
                        disabled={!isUnlocked}
                        onClick={() => {
                          if (!isUnlocked) {
                            showWarning("المجلس مقفل 🔒", "يرجى إتمام واجتياز المجلس السابق أولاً لفتح هذا الدرس.");
                            return;
                          }
                          setActiveLectureId(lecItem.id);
                        }}
                        className={`w-full text-right p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 text-xs cursor-pointer ${
                          isActive
                            ? 'bg-emerald-500/10 border-emerald-500 text-emerald-950 dark:text-emerald-100 font-extrabold'
                            : isUnlocked
                              ? 'bg-slate-50 hover:bg-slate-100/80 dark:bg-slate-950/40 border-slate-200/60 dark:border-slate-800/80 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                              : 'bg-slate-100/50 dark:bg-slate-950/10 border-slate-200/30 dark:border-slate-900/30 text-slate-400 opacity-60 cursor-not-allowed'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="font-mono text-[10px] bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 w-5 h-5 rounded-md flex items-center justify-center font-bold">
                            {idx + 1}
                          </span>
                          <span className="truncate max-w-[180px] text-right font-serif">{lecItem.title}</span>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {isCompleted ? (
                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-md border border-emerald-100/50 flex items-center gap-0.5">
                              <Check className="w-3 h-3" /> تم الاجتياز
                            </span>
                          ) : !isUnlocked ? (
                            <span className="text-[10px] text-slate-400 flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                              <Lock className="w-3 h-3 text-amber-500" />
                              <span>مقفل</span>
                            </span>
                          ) : qCount > 0 ? (
                            <span className="text-[10px] text-amber-600 bg-amber-50 dark:bg-amber-950/30 px-2.5 py-0.5 rounded-md border border-amber-100/50 font-bold">
                              اختبار متاح
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-md font-bold">
                              استماع فقط
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}

                  {bookLectures.length === 0 && (
                    <div className="text-center py-8 text-xs text-slate-400 italic">
                      لا توجد محاضرات مدرجة في هذا المتن بعد.
                    </div>
                  )}
                </div>
              </div>

              {/* العمود الأيسر (8/12): لوحة تشغيل الدرس وتفاصيل المحاضرة */}
              <div className="lg:col-span-8 space-y-4">
                {activeLec ? (
                  <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-5">
                    
                    {/* ترويسة الدرس النشط مع صورة غلاف الكتاب وشارة الاجتياز */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                      <div className="flex items-start gap-3.5 text-right min-w-0">
                        {activeBook && (
                          <CoverImage
                            src={activeBook.imageUrl}
                            alt={activeBook.title}
                            type="book"
                            className="w-11 h-14 rounded-xl object-cover shrink-0 border border-slate-200 dark:border-slate-700 shadow-2xs"
                          />
                        )}
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="bg-amber-500/10 text-amber-700 dark:text-amber-400 text-[10px] font-black px-2.5 py-0.5 rounded-md border border-amber-200/30">
                              مقرر: {activeBook?.title}
                            </span>
                            <span className="text-xs text-slate-400 font-medium">| اللقاء التأصيلي المنهجي رقم {bookLectures.findIndex(l => l.id === activeLec.id) + 1} من السلسلة</span>
                          </div>
                          <h3 className="text-lg md:text-xl font-black text-slate-900 dark:text-white font-serif leading-tight">
                            {activeLec.title}
                          </h3>
                        </div>
                      </div>

                      {/* شارة اجتياز اللقاء */}
                      {progresses.find(p => p.lectureId === activeLec.id)?.isPassed ? (
                        <div className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-4 py-2 rounded-2xl font-black text-xs inline-flex items-center gap-1.5 self-start sm:self-center">
                          <Check className="w-4 h-4 shrink-0" />
                          <span>تم اجتياز لقائها بنجاح ✓</span>
                        </div>
                      ) : (
                        <div className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 px-4 py-2 rounded-2xl font-black text-xs inline-flex items-center gap-1.5 self-start sm:self-center">
                          <Clock className="w-4 h-4 shrink-0 animate-pulse" />
                          <span>بانتظار السماع والاجتياز</span>
                        </div>
                      )}
                    </div>

                    {/* تفاصيل الوصف الشرحي */}
                    {activeLec.description && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed pr-3 border-r-3 border-emerald-500/30 font-medium">
                        {activeLec.description}
                      </p>
                    )}

                    {/* مشغل الفيديو المدمج الذكي */}
                    {activeLec.videoUrl ? (
                      <div className="rounded-3xl overflow-hidden border border-slate-200/80 dark:border-slate-800 shadow-xs bg-slate-950">
                        <VideoPlayer url={activeLec.videoUrl} title={activeLec.title} />
                      </div>
                    ) : activeLec.audioUrl ? (
                      <div className="p-8 text-center bg-purple-500/5 dark:bg-purple-950/20 rounded-3xl border border-dashed border-purple-500/30 text-slate-600 dark:text-slate-300 space-y-3">
                        <Headphones className="w-10 h-10 mx-auto text-purple-500 animate-pulse" />
                        <p className="text-xs font-bold font-serif">هذا المجلس متاح كتسجيل صوتي فقط 🎧</p>
                        <p className="text-[11px] text-slate-400">يرجى الضغط على زر "فتح وسماع الملف الصوتي" بالأسفل لفتحه في متصفح خارجي.</p>
                      </div>
                    ) : (
                      <div className="p-8 text-center bg-slate-50 dark:bg-slate-950/20 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 text-slate-400 space-y-2">
                        <Video className="w-10 h-10 mx-auto text-slate-300" />
                        <p className="text-xs font-bold font-serif">لا يوجد محتوى مرئي أو صوتي مدرج لهذا الدرس</p>
                      </div>
                    )}

                    {/* أزرار مساعدة وتحميلات إضافية */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                      <div className="flex flex-wrap items-center gap-2">
                        {activeLec.videoUrl && (
                          <a
                            href={resolveFileUrl(activeLec.videoUrl)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200/40 text-red-600 dark:bg-rose-950/30 dark:hover:bg-rose-900/40 dark:border-rose-900/50 dark:text-rose-400 text-xs font-black flex items-center gap-1.5 transition-colors"
                          >
                            <span>مشاهدة الدرس مباشرة على YouTube</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}

                        {activeLec.audioUrl && (
                          <a
                            href={resolveFileUrl(activeLec.audioUrl)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200/40 text-purple-600 dark:bg-purple-950/30 dark:hover:bg-purple-900/40 dark:border-purple-900/50 dark:text-purple-400 text-xs font-black flex items-center gap-1.5 transition-colors"
                          >
                            <Music className="w-3.5 h-3.5" />
                            <span>فتح وسماع الملف الصوتي 🎧</span>
                          </a>
                        )}

                        {activeLec.pdfUrl && (
                          <a
                            href={activeLec.pdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200/40 text-amber-700 dark:bg-amber-950/30 dark:hover:bg-amber-900/40 dark:border-amber-900/50 dark:text-amber-400 text-xs font-black flex items-center gap-1.5 transition-colors"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>ملخص المتن PDF 📄</span>
                          </a>
                        )}
                      </div>
                    </div>

                    {/* مذكرات وتلخيص الدرس من المشرف */}
                    {activeLec.notes && (
                      <div className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 text-xs space-y-2">
                        <div className="flex items-center gap-1.5 font-extrabold text-slate-700 dark:text-slate-300">
                          <Info className="w-4 h-4 text-emerald-600" />
                          <span>مذكرة وتلخيص المجلس العلمي:</span>
                        </div>
                        <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed font-serif pr-3 border-r-2 border-emerald-500/40 bg-transparent py-1 whitespace-pre-line">
                          {activeLec.notes}
                        </p>
                      </div>
                    )}

                    {/* شروط الانتقال والزر الذهبي للاختبار */}
                    <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-slate-950/50 border border-amber-200/40 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="text-right">
                        <h5 className="text-xs font-black text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                          <Info className="w-4 h-4 text-amber-500" />
                          <span>ملاحظة الحفظ والامتحان للتدريس:</span>
                        </h5>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                          يتطلب تأهيل المنهج وانتقالك للمجلس التالي حصولك على درجة 60% فأكثر بالاختبار البسيط.
                        </p>
                      </div>

                      {questions.filter(q => q.lectureId === activeLec.id).length > 0 ? (() => {
                        const prevProgress = progresses.find(p => p.lectureId === activeLec.id);
                        const hasAttempted = prevProgress && (prevProgress.attemptsCount > 0 || prevProgress.lastScore !== undefined);

                        return (
                          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto shrink-0">
                            {hasAttempted && (
                              <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-900/50 shadow-2xs">
                                <Award className={`w-4 h-4 ${prevProgress.isPassed ? 'text-emerald-500' : 'text-amber-500'}`} />
                                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">درجة الاختبار القديم:</span>
                                <span className={`font-mono text-sm font-black ${prevProgress.isPassed ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                                  {prevProgress.lastScore}%
                                </span>
                                {prevProgress.isPassed ? (
                                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-extrabold">ناجح ✓</span>
                                ) : (
                                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-extrabold">لم يجتز</span>
                                )}
                              </div>
                            )}

                            <button
                              onClick={() => {
                                setActiveQuizLecture(activeLec);
                                setQuizAnswers({});
                                setQuizSubmitted(false);
                              }}
                              className={`w-full sm:w-auto font-extrabold px-6 py-3 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md hover:scale-[1.01] active:scale-95 transition-all cursor-pointer shrink-0 ${
                                hasAttempted
                                  ? 'bg-amber-500 hover:bg-amber-600 text-slate-950'
                                  : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white'
                              }`}
                            >
                              {hasAttempted ? (
                                <>
                                  <RotateCcw className="w-4 h-4" />
                                  <span>إعادة الاختبار</span>
                                </>
                              ) : (
                                <>
                                  <span>بدء الاختبار القصير للدرس</span>
                                  <ArrowLeft className="w-4 h-4" />
                                </>
                              )}
                            </button>
                          </div>
                        );
                      })() : (() => {
                        const isFinished = isLectureCompleted(activeLec.id, progresses, questions);

                        return (
                          <div className="flex items-center gap-3 w-full sm:w-auto shrink-0">
                            {isFinished ? (
                              <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-black">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                <span>تم إتمام وسماع هذا المجلس بنجاح ✓</span>
                              </div>
                            ) : (
                              <button
                                onClick={() => handleFinishLectureWithoutQuiz(activeLec)}
                                className="w-full sm:w-auto font-extrabold px-6 py-3 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white cursor-pointer"
                              >
                                <Check className="w-4 h-4" />
                                <span>تأكيد سماع وإتمام هذا المجلس العلمي</span>
                              </button>
                            )}
                          </div>
                        );
                      })()}
                    </div>

                  </div>
                ) : (
                  <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl text-slate-400 font-serif">
                    يرجى اختيار أحد المجالس العلمية من القائمة للبدء بالدراسة والتحصيل.
                  </div>
                )}
              </div>

            </div>
          </div>
        ) : (() => {
          const activeMasterCourse = activeMasterCourseId 
            ? visibleCourses.find(c => c.id === activeMasterCourseId)
            : null;
          const childLevels = activeMasterCourse 
            ? getChildCourses(activeMasterCourse.id, visibleCourses)
            : [];
          const topLevelCourses = getTopLevelCourses(visibleCourses);

          // إذا كان الطالب قد ضغط على دورة كبيرة جامعة (مثل: دورة التأصيل العلمي)
          if (activeMasterCourse) {
            const masterProgress = getMasterCourseProgress(
              activeMasterCourse.id,
              visibleCourses,
              books,
              courseLectures,
              progresses,
              questions
            );

            return (
              <div className="space-y-6 animate-fade-in text-right">
                {/* رأس المسار العلمي الكبير المختار */}
                <div className="bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-900 text-white p-6 rounded-3xl shadow-xl border border-emerald-500/30 space-y-4 relative overflow-hidden">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="relative shrink-0">
                        <CoverImage
                          src={activeMasterCourse.imageUrl}
                          alt={activeMasterCourse.title}
                          type="course"
                          className="w-16 h-16 rounded-2xl object-cover border border-white/25 shadow-md"
                        />
                        <div className="absolute -bottom-1 -right-1 bg-emerald-600 text-white p-1 rounded-lg border border-white/25">
                          <Layers className="w-3.5 h-3.5" />
                        </div>
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-1.5">
                          <span className="text-[10px] bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 px-2.5 py-0.5 rounded-md font-bold flex items-center gap-1">
                            <Layers className="w-3 h-3 text-emerald-300" />
                            دورة رئيسية جامعة (مسار تأصيلي كبير)
                          </span>
                          <span className="text-[10px] text-emerald-300 font-mono font-bold">
                            {childLevels.length} مستويات دراسية
                          </span>
                        </div>
                        <h2 className="text-xl md:text-2xl font-bold font-serif">{activeMasterCourse.title}</h2>
                        <p className="text-xs text-emerald-100/80 mt-1 max-w-2xl leading-relaxed">{activeMasterCourse.description}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => setActiveMasterCourseId(null)}
                      className="px-4.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all flex items-center gap-2 self-start md:self-center cursor-pointer border border-white/15"
                    >
                      <ArrowRight className="w-4 h-4" />
                      <span>الرجوع لكافة المسارات والدورات</span>
                    </button>
                  </div>

                  {/* شريط الإنجاز الإجمالي في المسار */}
                  <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-emerald-200 font-bold">نسبة إنجاز المستويات في هذا المسار:</span>
                      <span className="font-mono font-black text-amber-300 text-sm">{masterProgress.percentage}%</span>
                      <span className="text-emerald-200/80 text-[11px]">({masterProgress.completedLevels} من {masterProgress.totalLevels} مستويات مكتملة)</span>
                    </div>
                    <div className="w-full sm:w-64 bg-black/40 h-2.5 rounded-full overflow-hidden border border-white/10">
                      <div className="bg-amber-400 h-full rounded-full transition-all duration-700" style={{ width: `${masterProgress.percentage}%` }} />
                    </div>
                  </div>
                </div>

                {/* شبكة المستويات والدورات الفرعية المندرجة بداخلها */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-extrabold text-emerald-800 dark:text-emerald-300">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <span>المستويات العلمية المندرجة في «{activeMasterCourse.title}»</span>
                    </div>
                    <span className="text-xs text-slate-400">تفتح المستويات بالتسلسل بعد إتمام المستوى السابق</span>
                  </div>

                  {childLevels.length === 0 ? (
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-10 rounded-3xl text-center text-slate-400 text-xs">
                      لم يتم إدراج مستويات في هذه الدورة الكبيرة بعد.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {childLevels.map((course, cIdx) => {
                        const cBooks = sortCourseBooks(books.filter(b => b.courseId === course.id));
                        const targetOpenBook = getLastOpenBook(cBooks, courseLectures, progresses, questions);
                        const isUnlocked = isCourseUnlocked(course, visibleCourses, books, courseLectures, progresses, questions);
                        const isComplete = isCourseCompleted(course.id, books, courseLectures, progresses, questions);
                        const prereq = getPrerequisiteCourse(course, visibleCourses);

                        return (
                          <div 
                            key={course.id} 
                            className={`border rounded-3xl p-5 shadow-xs transition-all ${
                              !isUnlocked 
                                ? 'bg-slate-100/60 dark:bg-slate-900/40 border-slate-200/60 dark:border-slate-800/60 opacity-80' 
                                : 'bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800/80 border-slate-200 dark:border-slate-800 hover:border-emerald-500/40'
                            }`}
                          >
                            <div className="flex items-start gap-4">
                              <div className="relative shrink-0">
                                <CoverImage
                                  src={course.imageUrl}
                                  alt={course.title}
                                  type="course"
                                  className="w-16 h-16 rounded-2xl object-cover shadow-xs border border-slate-200 dark:border-slate-700"
                                />
                                {!isUnlocked && (
                                  <div className="absolute inset-0 bg-slate-950/60 rounded-2xl flex items-center justify-center">
                                    <Lock className="w-6 h-6 text-amber-400" />
                                  </div>
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                                  <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-md font-mono font-bold">
                                    المستوى #{cIdx + 1}
                                  </span>

                                  {!isUnlocked ? (
                                    <span className="text-[10px] bg-amber-500/15 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-md font-bold flex items-center gap-1 border border-amber-500/30">
                                      <Lock className="w-3 h-3 text-amber-500" /> مقفل - يتطلب إتمام «{prereq?.title || 'السابق'}»
                                    </span>
                                  ) : isComplete ? (
                                    <span className="text-[10px] bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded-md font-bold flex items-center gap-0.5">
                                      <CheckCircle2 className="w-3 h-3" /> تم الاجتياز والتأصيل ✓
                                    </span>
                                  ) : (
                                    <span className="text-[10px] bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded-md font-bold">
                                      مستوى مفتوح للدراسة
                                    </span>
                                  )}
                                </div>

                                <h3 className="font-bold text-base text-slate-900 dark:text-white leading-snug">{course.title}</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">{course.description}</p>
                                
                                {targetOpenBook && isUnlocked && (
                                  <div className="mt-2 text-[11px] text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1">
                                    <BookOpen className="w-3.5 h-3.5" />
                                    <span>المقرر النشط حالياً: «{targetOpenBook.title}»</span>
                                  </div>
                                )}

                                {!isUnlocked && prereq && (
                                  <p className="mt-2 text-[10px] text-amber-700 dark:text-amber-400 font-serif font-bold leading-relaxed">
                                    🔒 يلزم إتمام جميع مقررات واختبارات «{prereq.title}» لفتح هذا المستوى.
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
                              <span className="text-xs font-bold text-slate-400">
                                📚 {cBooks.length} كتب ومقررات
                              </span>
                              {isUnlocked ? (
                                <button
                                  onClick={() => handleEnterCourse(course.id)}
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                                >
                                  <span>دخول هذا المستوى</span>
                                  <ArrowLeft className="w-4 h-4" />
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleEnterCourse(course.id)}
                                  className="bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border border-dashed border-slate-300 dark:border-slate-700 hover:border-amber-400"
                                >
                                  <Lock className="w-3.5 h-3.5 text-amber-500" />
                                  <span>مقفل حتى إتمام المستوى السابق</span>
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          }

          // العرض في المستوى الأعلى (المسارات الجامعة والدورات المستقلة)
          return (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-extrabold text-emerald-800 dark:text-emerald-300">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>المسارات العلمية والدورات المنهجية المتاحة</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {topLevelCourses.map(course => {
                  const isMaster = isMasterCourse(course);
                  const isStandalone = isStandaloneCourse(course);
                  const childLevels = isMaster ? getChildCourses(course.id, visibleCourses) : [];
                  const masterProgress = isMaster 
                    ? getMasterCourseProgress(course.id, visibleCourses, books, courseLectures, progresses, questions)
                    : null;

                  const cBooks = sortCourseBooks(books.filter(b => b.courseId === course.id));
                  const targetOpenBook = getLastOpenBook(cBooks, courseLectures, progresses, questions);
                  const isUnlocked = isCourseUnlocked(course, visibleCourses, books, courseLectures, progresses, questions);
                  const isComplete = isMaster 
                    ? masterProgress?.allPassed 
                    : isCourseCompleted(course.id, books, courseLectures, progresses, questions);
                  const prereq = getPrerequisiteCourse(course, visibleCourses);

                  return (
                    <div 
                      key={course.id} 
                      className={`border rounded-3xl p-5 shadow-xs transition-all ${
                        isMaster 
                          ? 'bg-gradient-to-br from-emerald-950/10 via-white to-teal-950/5 dark:from-emerald-950/30 dark:via-slate-900 dark:to-teal-950/20 border-emerald-500/40 hover:border-emerald-500 shadow-md'
                          : !isUnlocked 
                            ? 'bg-slate-100/60 dark:bg-slate-900/40 border-slate-200/60 dark:border-slate-800/60 opacity-80' 
                            : 'bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800/80 border-slate-200 dark:border-slate-800 hover:border-emerald-500/40'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className="relative shrink-0">
                          <CoverImage
                            src={course.imageUrl}
                            alt={course.title}
                            type="course"
                            className="w-16 h-16 rounded-2xl object-cover shadow-xs border border-slate-200 dark:border-slate-700"
                          />
                          {!isUnlocked && (
                            <div className="absolute inset-0 bg-slate-950/60 rounded-2xl flex items-center justify-center">
                              <Lock className="w-6 h-6 text-amber-400" />
                            </div>
                          )}
                          {isMaster && (
                            <div className="absolute -bottom-1 -right-1 bg-emerald-600 text-white p-1 rounded-lg shadow-xs">
                              <Layers className="w-3.5 h-3.5" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                            {isMaster ? (
                              <span className="text-[10px] bg-emerald-600 text-white px-2.5 py-0.5 rounded-md font-bold flex items-center gap-1 shadow-xs">
                                <Layers className="w-3 h-3" /> دورة رئيسية جامعة (مسار كبير)
                              </span>
                            ) : isStandalone ? (
                              <span className="text-[10px] bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-md font-bold flex items-center gap-1 border border-purple-200/40">
                                <Sparkles className="w-3 h-3 text-amber-500" /> دورة قصيرة مستقلة (حرة)
                              </span>
                            ) : !isUnlocked ? (
                              <span className="text-[10px] bg-amber-500/15 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-md font-bold flex items-center gap-1 border border-amber-500/30">
                                <Lock className="w-3 h-3 text-amber-500" /> مقفلة - تتطلب إتمام «{prereq?.title || 'السابقة'}»
                              </span>
                            ) : isComplete ? (
                              <span className="text-[10px] bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded-md font-bold flex items-center gap-0.5">
                                <CheckCircle2 className="w-3 h-3" /> تم الاجتياز ✓
                              </span>
                            ) : (
                              <span className="text-[10px] bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded-md font-bold">
                                مقرر منهجي مفتوح
                              </span>
                            )}
                          </div>

                          <h3 className="font-bold text-base text-slate-900 dark:text-white leading-snug">{course.title}</h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">{course.description}</p>
                          
                          {isMaster && (
                            <div className="mt-2.5 p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-800 dark:text-emerald-300 font-bold flex items-center justify-between">
                              <span>تضم {childLevels.length} مستويات علمية مرتبة</span>
                              {masterProgress && (
                                <span className="font-mono text-emerald-700 dark:text-emerald-300 font-black">
                                  {masterProgress.completedLevels}/{masterProgress.totalLevels} مستويات مكتملة
                                </span>
                              )}
                            </div>
                          )}

                          {targetOpenBook && isUnlocked && !isMaster && (
                            <div className="mt-2 text-[11px] text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1">
                              <BookOpen className="w-3.5 h-3.5" />
                              <span>المقرر النشط حالياً: «{targetOpenBook.title}»</span>
                            </div>
                          )}

                          {!isUnlocked && prereq && !isMaster && (
                            <p className="mt-2 text-[10px] text-amber-700 dark:text-amber-400 font-serif font-bold leading-relaxed">
                              🔒 يلزم إتمام جميع مقررات واختبارات دورة «{prereq.title}» لفتح هذه الدورة.
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-400">
                          {isMaster ? `📑 ${childLevels.length} مستويات دراسية` : `📚 ${cBooks.length} كتب ومقررات`}
                        </span>
                        {isMaster ? (
                          <button
                            onClick={() => setActiveMasterCourseId(course.id)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                          >
                            <span>استعراض مستويات الدورة 📂</span>
                            <ArrowLeft className="w-4 h-4" />
                          </button>
                        ) : isUnlocked ? (
                          <button
                            onClick={() => handleEnterCourse(course.id)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                          >
                            <span>دخول آخر مجلس مفتوح</span>
                            <ArrowLeft className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleEnterCourse(course.id)}
                            className="bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border border-dashed border-slate-300 dark:border-slate-700 hover:border-amber-400"
                          >
                            <Lock className="w-3.5 h-3.5 text-amber-500" />
                            <span>مقفل حتى إتمام الدورة السابقة</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()
      )}

      {/* --- قسم السلاسل العلمية العامة السابقة --- */}
      <div className="pt-6 border-t border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">مقاطع الدروس العامة والمتفرقة</h3>
          <div className="bg-white dark:bg-slate-900 p-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs relative w-72">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute right-4 top-3.5" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="بحث في الدروس العامة..."
              className="w-full pr-8 pl-3 py-1 rounded-lg bg-transparent text-xs focus:outline-hidden"
            />
          </div>
        </div>

        <div className="space-y-3">
          {filtered.map(lec => (
            <div
              key={lec.id}
              className={`p-5 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 ${
                lec.isWatched 
                  ? 'border-emerald-500/30 bg-emerald-50/10 dark:bg-emerald-950/10 opacity-85' 
                  : 'border-slate-200 dark:border-slate-800 hover:border-emerald-500/40 shadow-xs'
              }`}
            >
              <div className="flex items-start gap-4">
                <button
                  onClick={() => toggleWatch(lec)}
                  className="mt-1 shrink-0 text-emerald-600 hover:scale-110 transition-transform"
                  title={lec.isWatched ? "درس مسموع" : "تحديد كمسموع"}
                >
                  {lec.isWatched ? <CheckCircle2 className="w-6 h-6 fill-emerald-100 dark:fill-emerald-950" /> : <Circle className="w-6 h-6 text-slate-300" />}
                </button>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {lec.category}
                    </span>
                    {lec.seriesTitle && (
                      <span className="text-[10px] text-emerald-600 font-extrabold">• {lec.seriesTitle}</span>
                    )}
                  </div>
                  <h4 className="font-bold text-base font-serif text-slate-900 dark:text-slate-100 leading-snug">
                    {lec.title}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">{lec.sheikh}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800">
                <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> {lec.durationMinutes} د
                </span>
                
                <button
                  onClick={() => handleOpenNotes(lec)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors ${
                    lec.userNotes
                      ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                      : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>{lec.userNotes ? 'عرض التلخيص' : 'تقييد الفوائد'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {activeNoteModal && (
        <Modal isOpen={!!activeNoteModal} onClose={() => setActiveNoteModal(null)} title="تقييد فوائد المجلس">
          <div className="space-y-4">
            <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl">
              <h4 className="font-bold text-sm font-serif">{activeNoteModal.title}</h4>
              <p className="text-xs text-slate-500 mt-0.5">{activeNoteModal.sheikh}</p>
            </div>

            <div>
              <label className="block text-xs font-bold mb-2">تلخيصك المنهجي للدرس (يُحفظ سحابياً)</label>
              <textarea
                value={noteText}
                onChange={e => setNoteText(e.target.value)}
                placeholder="اكتب هنا أهم المسائل والفرائد المذكورة في الشرح..."
                rows={6}
                className="w-full p-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm leading-relaxed focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>

            <button
              onClick={saveNotes}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm shadow-md flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" /> حفظ التلخيص في دفترك
            </button>
          </div>
        </Modal>
      )}

      {/* --- نافذة عرض ملاحظات وتلخيص الدرس المعتمد --- */}
      {viewLectureNotes && (
        <Modal isOpen={true} onClose={() => setViewLectureNotes(null)} title={`فوائد وملخص: ${viewLectureNotes.title}`}>
          <div className="space-y-4 text-right">
            <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 text-sm text-slate-800 dark:text-slate-200 leading-loose whitespace-pre-wrap font-sans">
              {viewLectureNotes.notes}
            </div>
            <div className="flex justify-end">
              <button onClick={() => setViewLectureNotes(null)} className="bg-emerald-600 text-white px-6 py-2 rounded-xl text-sm font-bold">
                إغلاق
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* --- نافذة مشغل الفيديو الذكي والمدمج --- */}
      {activeVideo && (
        <Modal isOpen={!!activeVideo} onClose={() => setActiveVideo(null)} title={`شرح المجلس العلمى: ${activeVideo.title}`}>
          <div className="p-1 text-right">
            <VideoPlayer url={activeVideo.url} title={activeVideo.title} />
            <div className="flex justify-end mt-4">
              <button 
                onClick={() => setActiveVideo(null)} 
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-2 rounded-xl text-sm transition-colors cursor-pointer"
              >
                إغلاق المشغل
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* --- نافذة أداء اختبار قياس التحصيل الفوري بعد الدرس --- */}
      {activeQuizLecture && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 max-w-3xl w-full shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto text-right">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <span className="text-xs bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 px-3 py-1 rounded-full font-bold">
                  اختبار قياس تحصيل
                </span>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                  درس: "{activeQuizLecture.title}"
                </h3>
              </div>
              <button onClick={() => setActiveQuizLecture(null)} className="p-2 text-slate-400 hover:text-slate-600 rounded-xl bg-slate-100 dark:bg-slate-800">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* محتوى الأسئلة */}
            <div className="space-y-5">
              {activeQuestions.map((q, qIdx) => {
                const userAns = quizAnswers[q.id] || '';
                const isCorrect = q.type === 'short_answer'
                  ? userAns.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase()
                  : userAns === q.correctAnswer;

                return (
                  <div key={q.id} className="p-5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2.5 font-bold text-sm text-slate-900 dark:text-white">
                        <span className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center justify-center font-mono shrink-0 text-xs">
                          {qIdx + 1}
                        </span>
                        <span>{q.question}</span>
                      </div>
                      <span className="text-xs font-bold text-slate-400 shrink-0 bg-white dark:bg-slate-900 px-2.5 py-0.5 rounded-lg border border-slate-200 dark:border-slate-800">
                        {q.points} درجات
                      </span>
                    </div>

                    {/* خيارات حل السؤال */}
                    <div className="pt-2">
                      {q.type === 'multiple_choice' && q.options && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {q.options.map((opt, oIdx) => {
                            let btnStyle = "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-emerald-400";
                            if (quizSubmitted) {
                              if (opt === q.correctAnswer) {
                                btnStyle = "bg-emerald-100 dark:bg-emerald-950 border-emerald-500 text-emerald-900 dark:text-emerald-200 font-bold";
                              } else if (userAns === opt && !isCorrect) {
                                btnStyle = "bg-red-100 dark:bg-red-950 border-red-500 text-red-900 dark:text-red-200";
                              } else {
                                btnStyle = "opacity-50 border-slate-200 dark:border-slate-800";
                              }
                            } else if (userAns === opt) {
                              btnStyle = "border-emerald-600 bg-emerald-50 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-200 font-bold ring-2 ring-emerald-500/20";
                            }

                            return (
                              <button
                                key={oIdx}
                                disabled={quizSubmitted}
                                onClick={() => setQuizAnswers({ ...quizAnswers, [q.id]: opt })}
                                className={`p-3 rounded-xl border text-xs text-right transition-all flex items-center justify-between ${btnStyle}`}
                              >
                                <span>{opt}</span>
                                {quizSubmitted && opt === q.correctAnswer && <Check className="w-4 h-4 text-emerald-600 shrink-0" />}
                                {quizSubmitted && userAns === opt && !isCorrect && <X className="w-4 h-4 text-red-600 shrink-0" />}
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {q.type === 'true_false' && (
                        <div className="flex gap-3">
                          {[
                            { label: 'صحيحة (صح)', val: 'true' },
                            { label: 'خاطئة (خطأ)', val: 'false' }
                          ].map(tfItem => {
                            let btnStyle = "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300";
                            if (quizSubmitted) {
                              if (tfItem.val === q.correctAnswer) {
                                btnStyle = "bg-emerald-100 dark:bg-emerald-950 border-emerald-500 text-emerald-900 dark:text-emerald-200 font-bold";
                              } else if (userAns === tfItem.val && !isCorrect) {
                                btnStyle = "bg-red-100 dark:bg-red-950 border-red-500 text-red-900 dark:text-red-200";
                              } else {
                                btnStyle = "opacity-50 border-slate-200 dark:border-slate-800";
                              }
                            } else if (userAns === tfItem.val) {
                              btnStyle = "border-emerald-600 bg-emerald-50 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-200 font-bold ring-2 ring-emerald-500/20";
                            }

                            return (
                              <button
                                key={tfItem.val}
                                disabled={quizSubmitted}
                                onClick={() => setQuizAnswers({ ...quizAnswers, [q.id]: tfItem.val })}
                                className={`flex-1 p-3 rounded-xl border text-xs font-bold text-center transition-all flex items-center justify-center gap-2 ${btnStyle}`}
                              >
                                <span>{tfItem.label}</span>
                                {quizSubmitted && tfItem.val === q.correctAnswer && <Check className="w-4 h-4 text-emerald-600 shrink-0" />}
                                {quizSubmitted && userAns === tfItem.val && !isCorrect && <X className="w-4 h-4 text-red-600 shrink-0" />}
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {q.type === 'short_answer' && (
                        <div className="space-y-2">
                          <input
                            type="text"
                            disabled={quizSubmitted}
                            value={userAns}
                            onChange={e => setQuizAnswers({ ...quizAnswers, [q.id]: e.target.value })}
                            placeholder="اكتبي إجابتك هنا بوضوح..."
                            className={`w-full p-3 rounded-xl border text-xs bg-white dark:bg-slate-900 ${
                              quizSubmitted 
                                ? isCorrect 
                                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950 text-emerald-900 font-bold' 
                                  : 'border-red-500 bg-red-50 dark:bg-red-950 text-red-900'
                                : 'border-slate-300 dark:border-slate-700'
                            }`}
                          />
                          {quizSubmitted && !isCorrect && (
                            <p className="text-xs text-emerald-600 font-bold">
                              ✓ الإجابة النموذجية المعتمدة هي: "{q.correctAnswer}"
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* شريط النتيجة والتسليم */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              {quizSubmitted ? (
                (() => {
                  let earnedPoints = 0;
                  let totalPoints = 0;
                  activeQuestions.forEach(q => {
                    totalPoints += q.points;
                    const ans = quizAnswers[q.id] || '';
                    if (q.type === 'short_answer') {
                      if (ans.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase()) earnedPoints += q.points;
                    } else {
                      if (ans === q.correctAnswer) earnedPoints += q.points;
                    }
                  });
                  const percentage = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 100;

                  return (
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <div className={`p-3 rounded-2xl font-extrabold text-sm flex items-center gap-2 ${percentage >= 60 ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200' : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200'}`}>
                        <Award className="w-6 h-6" />
                        <span>الدرجة المستحقة: {earnedPoints} من {totalPoints} ({percentage}%)</span>
                      </div>
                      <span className="text-xs font-bold text-slate-500">
                        {percentage >= 90 ? 'ما شاء الله! تحصيل ممتاز وفتح مبين 🎉' : percentage >= 60 ? 'أحسنتِ، أداء مبارك وطيّب الفائدة 👍' : 'جيد جداً، نوصيك بمراجعة الملاحظات والمتن مرة أخرى 📖'}
                      </span>
                    </div>
                  );
                })()
              ) : (
                <div className="text-xs text-slate-400">تأكدي من الإجابة على جميع الأسئلة قبل اعتماد الاختبار</div>
              )}

              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                {quizSubmitted ? (
                  <button
                    onClick={() => {
                      setQuizAnswers({});
                      setQuizSubmitted(false);
                    }}
                    className="px-5 py-2.5 rounded-2xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300"
                  >
                    إعادة المحاولة
                  </button>
                ) : (
                  <button
                    onClick={() => activeQuizLecture && handleQuizSubmit(activeQuizLecture)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-2xl font-bold text-sm shadow-lg w-full sm:w-auto active:scale-95 transition-all"
                  >
                    تسجيل وحساب الدرجة
                  </button>
                )}
                <button
                  onClick={() => setActiveQuizLecture(null)}
                  className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-2xl font-bold text-sm"
                >
                  إغلاق النافذة
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* نافذة عارض الـ PDF التفاعلي الاحترافي */}
      {activePdfView && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-5xl h-[90vh] animate-fade-in">
            <PDFViewer 
              url={activePdfView.url} 
              title={activePdfView.title} 
              onClose={() => setActivePdfView(null)} 
            />
          </div>
        </div>
      )}
    </div>
  );
};
