import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useCoursesManager } from '../hooks/useCoursesManager';
import { useLocalOrCloudStorage } from '../hooks/useFirestore';
import { useToast } from '../hooks/useToast';
import { useCertificates } from '../hooks/useCertificates';
import { Certificate, resolveFileUrl } from '../types';
import { buildApiUrl } from '../lib/apiClient';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { DAILY_WISDOMS } from '../data/mockCurriculum';
import { TabType as SidebarTabType } from '../components/common/Sidebar';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { 
  Flame, 
  BookOpen, 
  Clock, 
  Award, 
  ArrowLeft, 
  ArrowRight,
  Bookmark, 
  CheckCircle2,
  TrendingUp,
  Quote,
  User,
  Bell,
  Check,
  X,
  XCircle,
  Play,
  FileText,
  Music,
  Video,
  Info,
  Lock,
  Unlock,
  Printer,
  Edit,
  Download,
  BadgeCheck,
  HelpCircle,
  Menu,
  ChevronDown,
  ChevronUp,
  Mail,
  Calendar,
  Sparkles,
  Eye,
  RotateCcw,
  Layers
} from 'lucide-react';
import { PDFViewer } from '../components/common/PDFViewer';
import { CoverImage } from '../components/common/CoverImage';
import { StudyWorkspace } from '../components/common/StudyWorkspace';
import { StudentProgressCharts } from '../components/common/StudentProgressCharts';
import { StudentLectureProgress, StudentActivity, StudentNotification, Course, CourseBook, CourseLectureItem } from '../types';
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
  isChildCourse,
  getChildCourses,
  getTopLevelCourses,
  getMasterCourseProgress,
  getPrerequisiteCourse,
  getNextChainedCourse
} from '../lib/courseProgression';

interface Props {
  onNavigate: (tab: SidebarTabType) => void;
}

type DashboardTab = 'overview' | 'analytics' | 'courses' | 'lectures' | 'exams' | 'certificates';

export const Dashboard: React.FC<Props> = ({ onNavigate }) => {
  const { currentUser, userProfile, isGuest, updateProfileData, patchLocalProfile } = useAuth();
  const { courses, books, lectures: courseLectures, questions } = useCoursesManager();
  const { showSuccess, showError, showWarning } = useToast();
  const { requests: certRequests, certificates: studentCertificates, requestCertificate } = useCertificates();

  // المجموعات السحابية/المحلية للطالب/ة
  const { items: progresses, saveItem: saveProgress } = useLocalOrCloudStorage<StudentLectureProgress>('lecture_progress', []);
  const { items: activities, saveItem: saveActivity } = useLocalOrCloudStorage<StudentActivity>('student_activities', [
    {
      id: 'act-init',
      type: 'streak_milestone',
      title: 'تأسيس الحساب والمجلس',
      description: 'تم إنشاء ملفك المنهجي والتحاقك بملتقى طلبة العلم بنجاح.',
      timestamp: new Date(Date.now() - 3600 * 1000 * 24 * 3).toISOString()
    }
  ]);
  const { items: notifications, saveItem: saveNotification } = useLocalOrCloudStorage<StudentNotification>('student_notifications', [
    {
      id: 'notif-welcome',
      title: 'أهلاً بك في ملتقى طلبة العلم 🌸',
      body: 'نسأل الله لك التوفيق والسداد في مسيرتك العلمية المباركة والارتقاء في مدارج التحصيل والهمة.',
      type: 'success',
      timestamp: new Date(Date.now() - 3600 * 1000 * 24 * 2).toISOString(),
      isRead: false
    },
    {
      id: 'notif-course-1',
      title: 'انطلاق دورة التأصيل العلمي العقدي 📚',
      body: 'نحيطك علماً بأنه قد تم تفعيل كتاب "الأصول الثلاثة وأدلتها" وبدء استقبال مجالس شرح الدرس الأول.',
      type: 'info',
      timestamp: new Date(Date.now() - 3600 * 1000 * 24).toISOString(),
      isRead: false
    }
  ]);

  // التبويب النشط داخل اللوحة
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');

  // حالات لتعديل الملف الشخصي
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [avatarBroken, setAvatarBroken] = useState(false);
  useEffect(() => {
    setAvatarBroken(false);
  }, [userProfile?.photoURL]);
  const splitDisplayName = (raw?: string) => {
    const parts = (raw || '').trim().split(/\s+/).filter(Boolean);
    return {
      first: parts[0] || '',
      last: parts.slice(1).join(' ')
    };
  };
  const initialNames = splitDisplayName(userProfile?.displayName || userProfile?.name);
  const [profileForm, setProfileForm] = useState({
    firstName: userProfile?.firstName || initialNames.first,
    lastName: userProfile?.lastName || initialNames.last,
    bio: userProfile?.bio || '',
    level: userProfile?.level || 'مبتدئ'
  });

  // حالات التنقل داخل المقررات والمجالس
  const [dashboardMasterCourseId, setDashboardMasterCourseId] = useState<string | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedBook, setSelectedBook] = useState<CourseBook | null>(null);
  const [activeLecture, setActiveLecture] = useState<CourseLectureItem | null>(null);
  const quizSectionRef = useRef<HTMLDivElement>(null);
  const [activePdfView, setActivePdfView] = useState<{ url: string; title: string } | null>(null);

  // حالات الاختبار القصير داخل المحاضرة
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizAttemptId, setQuizAttemptId] = useState<string>('');
  const [activeCertificate, setActiveCertificate] = useState<Certificate | null>(null);

  // حكمة اليوم العشوائية
  const [quoteIndex, setQuoteIndex] = useState(0);
  useEffect(() => {
    const today = new Date().getDate();
    setQuoteIndex(today % DAILY_WISDOMS.length);
  }, []);

  // إعادة ضبط اختيارات الجلسة عند تسجيل الخروج
  useEffect(() => {
    if (!currentUser && !isGuest) {
      setDashboardMasterCourseId(null);
      setSelectedCourse(null);
      setSelectedBook(null);
      setActiveLecture(null);
      setActiveCertificate(null);
      setEditProfileOpen(false);
    }
  }, [currentUser, isGuest]);

  // تحديث حقول النموذج عند تغير الملف الشخصي للطالب/ة
  useEffect(() => {
    setAvatarBroken(false);
    if (userProfile) {
      const parsed = splitDisplayName(userProfile.displayName || userProfile.name);
      setProfileForm({
        firstName: userProfile.firstName || parsed.first,
        lastName: userProfile.lastName || parsed.last,
        bio: userProfile.bio || '',
        level: userProfile.level || 'مبتدئ'
      });
    }
  }, [userProfile]);

  // التهيئة التلقائية لاختيار الدورة وآخر كتاب مفتوح وآخر محاضرة مفتوحة للطالب/ة
  useEffect(() => {
    if (courses.length > 0 && !selectedCourse) {
      const firstCourse = courses[0];
      setSelectedCourse(firstCourse);
      const cBooks = sortCourseBooks(books.filter(b => b.courseId === firstCourse.id));
      const targetBook = getLastOpenBook(cBooks, courseLectures, progresses, questions);
      setSelectedBook(targetBook);
      if (targetBook) {
        const bLecs = courseLectures.filter(l => l.bookId === targetBook.id).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        const targetLec = getLastOpenLecture(bLecs, progresses, questions, true);
        setActiveLecture(targetLec);
      }
    }
  }, [courses, books, courseLectures, progresses, questions, selectedCourse]);

  const handleOpenBook = (url: string) => {
    console.log("[DEBUG] inside handleOpenBook (Dashboard) - Input:", url);
    if (!url) return;
    const cleanUrl = url.trim();
    console.log("[DEBUG] inside handleOpenBook (Dashboard) - Opening direct URL:", cleanUrl);
    window.open(cleanUrl, "_blank", "noopener,noreferrer");
  };

  const handleDownloadFile = (url: string, filename: string) => {
    console.log("[DEBUG] Dashboard - Downloading File URL (Database Original):", url);
    if (!url) return;
    const cleanUrl = url.trim();
    if (cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://')) {
      console.log("[DEBUG] Dashboard - External URL detected, opening in new tab for download:", cleanUrl);
      window.open(cleanUrl, "_blank", "noopener,noreferrer");
      return;
    }
    const resolved = resolveFileUrl(cleanUrl);
    console.log("[DEBUG] Dashboard - Internal/Resolved URL:", resolved);
    const link = document.createElement('a');
    link.href = resolved;
    link.download = filename;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // دالة تشجيع الهمة وزيادة أيام الاستمرار الحقيقية
  const handleCheerStreak = async () => {
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.6 }
    });

    if (currentUser && !currentUser.isAnonymous) {
      try {
        const token = await currentUser.getIdToken();
        const res = await fetch(buildApiUrl('/api/student/streak/check-in'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await res.json();
        if (data.success) {
          if (data.alreadyRecorded) {
            showSuccess("همّتكِ مباركة ومثبتة لليوم! 🌟", `أنتِ مستمرة لليوم ${data.streak} بنجاح. واصلي إنجاز أورادكِ ودروسكِ.`);
          } else {
            showSuccess("عَظَّمَ الله همّتكِ! 🎉", data.message || `تم تثبيت حضوركِ لليوم وزيادة أيام الاستمرار إلى ${data.streak} يوماً.`);
            if (userProfile) {
              patchLocalProfile({
                streak: data.streak,
                lastStreakDate: new Date().toISOString().split('T')[0]
              });
            }
          }
          return;
        }
      } catch (e) {
        console.warn("Streak check-in API error, using local fallback:", e);
      }
    }

    if (userProfile) {
      const todayStr = new Date().toISOString().split('T')[0];
      const isAlreadyRecordedToday = userProfile.lastStreakDate === todayStr;

      if (isAlreadyRecordedToday) {
        showSuccess("همّتكِ مباركة ومثبتة لليوم! 🌟", `أنتِ مستمرة لليوم ${userProfile.streak || 1} بنجاح. واصلي إنجاز أورادكِ ودروسكِ.`);
        return;
      }

      const nextStreak = (userProfile.streak || 0) + 1;
      patchLocalProfile({ streak: nextStreak, lastStreakDate: todayStr });
      showSuccess("عَظَّمَ الله همّتكِ! 🎉", `تم تثبيت حضوركِ المنهجي لليوم وزيادة أيام الاستمرار إلى ${nextStreak} يوماً.`);
    }
  };

  // حفظ بيانات الملف الشخصي المعدلة
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const first = profileForm.firstName.trim();
    const last = profileForm.lastName.trim();
    if (!first || !last) {
      showError("حقول مطلوبة", "يرجى إدخال الاسم الأول والكنية.");
      return;
    }
    if (first.length > 40 || last.length > 40) {
      showError("تجاوز الحد المسموح", "يجب ألا يتجاوز الاسم الأول أو الكنية 40 حرفاً.");
      return;
    }
    const fullName = `${first} ${last}`;
    try {
      await updateProfileData({
        firstName: first,
        lastName: last,
        displayName: fullName,
        name: fullName,
        bio: profileForm.bio,
        level: profileForm.level as any
      });
      setEditProfileOpen(false);
      showSuccess("تم تحديث البيانات", "تم حفظ معلومات ملفك المنهجي بنجاح.");
    } catch (err) {
      showError("فشل التحديث", "حدث خطأ ما أثناء حفظ البيانات.");
    }
  };

  // معالجة قراءة الإشعارات
  const markAllNotificationsAsRead = () => {
    notifications.forEach(n => {
      if (!n.isRead) {
        saveNotification({ ...n, isRead: true });
      }
    });
    showSuccess("مكتمل", "تم تحديد جميع الإشعارات كمقروءة.");
  };

  // التحقق من فتح الكتاب الحالي ضمن كتب الدورة المنهجية
  const checkBookUnlocked = (book: CourseBook) => {
    const cBooks = sortCourseBooks(books.filter(b => b.courseId === book.courseId));
    return isBookUnlocked(book, cBooks, courseLectures, progresses, questions);
  };

  // التحقق من فتح المحاضرة للمشاهدة
  const checkLectureUnlocked = (lec: CourseLectureItem, bLecturesList: CourseLectureItem[]) => {
    const targetBook = books.find(b => b.id === lec.bookId);
    const bookOpen = targetBook ? checkBookUnlocked(targetBook) : true;
    return isLectureUnlocked(lec, bLecturesList, progresses, questions, bookOpen);
  };

  // اختيار الدورة والانتقال تلقائياً لآخر كتاب مفتوح وآخر محاضرة مفتوحة
  const handleSelectCourse = (course: Course, switchTabToLectures = false) => {
    // إذا كانت دورة رئيسية جامعة (دورة كبيرة تضم مستويات)
    if (isMasterCourse(course)) {
      setDashboardMasterCourseId(course.id);
      return;
    }

    const unlocked = isCourseUnlocked(course, courses, books, courseLectures, progresses, questions);
    if (!unlocked) {
      const prereq = getPrerequisiteCourse(course, courses);
      showWarning(
        "هذا المقرر مقفل 🔒",
        prereq 
          ? `يلزم إتمام جميع كتب واختبارات «${prereq.title}» أولاً لفتح هذا المقرر ومجالسه.`
          : "يلزم إتمام المقرر السابق أولاً لفتح هذا المقرر ومجالسه."
      );
      return;
    }

    if (course.parentCourseId) {
      setDashboardMasterCourseId(course.parentCourseId);
    }

    setSelectedCourse(course);
    const cBooks = sortCourseBooks(books.filter(b => b.courseId === course.id));
    const targetBook = getLastOpenBook(cBooks, courseLectures, progresses, questions);
    setSelectedBook(targetBook);
    if (targetBook) {
      const bLecs = courseLectures.filter(l => l.bookId === targetBook.id).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      const targetLec = getLastOpenLecture(bLecs, progresses, questions, true);
      setActiveLecture(targetLec);
    } else {
      setActiveLecture(null);
    }
    if (switchTabToLectures) {
      setActiveTab('lectures');
    }
  };

  // اختيار كتاب معين مع التحقق من أنه مفتوح والبدء من آخر محاضرة مفتوحة فيه
  const handleSelectBook = (book: CourseBook, switchTabToLectures = false) => {
    const cBooks = sortCourseBooks(books.filter(b => b.courseId === book.courseId));
    const unlocked = isBookUnlocked(book, cBooks, courseLectures, progresses, questions);
    if (!unlocked) {
      const prevBook = getPreviousBook(book, cBooks);
      showWarning(
        "هذا المقرر مقفل 🔒",
        `يلزم إتمام دراسة واختبارات كتاب «${prevBook?.title || 'السابق'}» أولاً لفتح هذا المقرر ومجالسه العلمية.`
      );
      return;
    }
    setSelectedBook(book);
    const bLecs = courseLectures.filter(l => l.bookId === book.id).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    const targetLec = getLastOpenLecture(bLecs, progresses, questions, true);
    setActiveLecture(targetLec);
    setQuizAnswers({});
    setQuizSubmitted(false);
    if (switchTabToLectures) {
      setActiveTab('lectures');
    }
  };

  // الضغط على زر إنهاء المحاضرة
  const handleFinishLecture = async (lec: CourseLectureItem) => {
    const existingProgress = progresses.find(p => p.lectureId === lec.id);
    
    const newProgress: StudentLectureProgress = {
      id: lec.id,
      lectureId: lec.id,
      bookId: lec.bookId,
      courseId: lec.courseId,
      attemptsCount: existingProgress?.attemptsCount || 0,
      lastScore: existingProgress?.lastScore || 0,
      bestScore: existingProgress?.bestScore || 0,
      lastAttemptDate: existingProgress?.lastAttemptDate || '',
      isPassed: existingProgress?.isPassed || false,
      isLectureFinished: true
    };

    // إنهاء المحاضرة
    await saveProgress(newProgress);

    // تسجيل نشاط
    const newAct: StudentActivity = {
      id: `act-lec-${Date.now()}`,
      type: 'lecture_complete',
      title: 'إنهاء سماع المجلس العلمي',
      description: `تم إكمال سماع محاضرة: "${lec.title}" بنجاح وتقييد الفرائد والفوائد.`,
      timestamp: new Date().toISOString(),
      details: lec.title
    };
    saveActivity(newAct);

    // تسجيل إشعار
    const newNotif: StudentNotification = {
      id: `notif-lec-${Date.now()}`,
      title: 'تم إنهاء المحاضرة بنجاح 🎉',
      body: `مبارك إكمال الدرس: "${lec.title}". يمكنك الآن الانتقال لحل اختبار قياس التحصيل الفوري لتجاوز العقبة العلمية!`,
      type: 'success',
      timestamp: new Date().toISOString(),
      isRead: false
    };
    saveNotification(newNotif);

    // التحقق من إكمال الكتاب بالكامل (مثلاً لو كان بلا أسئلة أو تم اجتياز سائر الاختبارات قبله)
    checkAndIssueBookCertificate(lec.bookId, newProgress);

    // التحقق من فتح الكتاب التالي في الدورة إن وجد
    const targetBook = books.find(b => b.id === lec.bookId);
    if (targetBook) {
      const cBooks = sortCourseBooks(books.filter(b => b.courseId === targetBook.courseId));
      const bLecs = courseLectures.filter(l => l.bookId === targetBook.id);
      const updatedProgressList = [...progresses.filter(p => p.lectureId !== newProgress.lectureId), newProgress];
      const isBookNowComplete = bLecs.every(l => isLectureCompleted(l.id, updatedProgressList, questions));

      if (isBookNowComplete) {
        const bookIdx = cBooks.findIndex(b => b.id === targetBook.id);
        const nextBook = bookIdx >= 0 && bookIdx < cBooks.length - 1 ? cBooks[bookIdx + 1] : null;
        if (nextBook) {
          showSuccess(
            "مبارك! تم فتح الكتاب التالي في الدورة 🔓📚",
            `أحسنتِ صنعاً! بإتمامكِ كتاب «${targetBook.title}»، تم الآن فتح دراسة الكتاب التالي في الدورة: «${nextBook.title}»!`
          );
        }

        // التحقق مما إذا كان إتمام هذا الكتاب قد أكمل الدورة كاملة وفتح دورة لاحقة
        const isCourseNowComplete = isCourseCompleted(targetBook.courseId, books, courseLectures, updatedProgressList, questions);
        if (isCourseNowComplete) {
          const nextCourse = getNextChainedCourse(targetBook.courseId, courses);
          if (nextCourse) {
            confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
            showSuccess(
              "عرس علمي مبارك! تم فتح الدورة التالية بالكامل 🎓🔓",
              `أحسنتِ صنعاً! بإتمامكِ كامل كتب ومجالس هذه الدورة، تم الآن فتح الدورة التالية لكِ: «${nextCourse.title}»!`
            );
          }
        }
      }
    }

    showSuccess("مبارك إكمال الدرس! 🎯", "تم إنهاء الدرس بنجاح، ولقد كسبت 15 نقطة تحصيل إضافية! والآن تم فتح اختبار التحصيل بالأسفل.");
  };

  // حفظ تقدم الطالب/ة من خلال لوحة الدراسة التفاعلية الجديدة
  const handleWorkspaceSaveProgress = async (updated: StudentLectureProgress) => {
    const existingProgress = progresses.find(p => p.lectureId === updated.id);
    await saveProgress(updated);

    // إذا تم إنهاء المحاضرة حديثاً (تحقيق الشرط: 95% مشاهدة)
    if (updated.isLectureFinished && !existingProgress?.isLectureFinished) {

      // تسجيل نشاط
      const newAct: StudentActivity = {
        id: `act-lec-${Date.now()}`,
        type: 'lecture_complete',
        title: 'إنهاء سماع المجلس العلمي',
        description: `تم إكمال متطلبات درس: "${activeLecture?.title}" بنجاح (سماعاً بنسبة ${updated.lectureWatchPercentage}%) وتقييد الفوائد.`,
        timestamp: new Date().toISOString(),
        details: activeLecture?.title
      };
      saveActivity(newAct);

      // تسجيل إشعار
      const newNotif: StudentNotification = {
        id: `notif-lec-${Date.now()}`,
        title: 'تم إكمال الدرس والتحصيل بنجاح 🎉',
        body: `مبارك إكمال الدرس ومراجعة المتن لـ: "${activeLecture?.title}". يمكنك الآن الانتقال لحل اختبار قياس التحصيل الفوري لتجاوز العقبة العلمية!`,
        type: 'success',
        timestamp: new Date().toISOString(),
        isRead: false
      };
      saveNotification(newNotif);

      // التحقق من إكمال الكتاب لإصدار الشهادة
      checkAndIssueBookCertificate(updated.bookId, updated);

      showSuccess("مبارك إنجاز الدرس! 🎉", "أنجزت الدرس سماعاً وقراءةً بنجاح، ولقد كسبت 15 نقطة تحصيل إضافية! تم الآن فتح اختبار المجلس العلمي.");
    }
  };

  // تمرير الشاشة إلى قسم الاختبار العلمي
  const handleGoToQuiz = () => {
    setTimeout(() => {
      quizSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  // تسليم اختبار المحاضرة وحساب الدرجة
  const handleQuizSubmit = async (lec: CourseLectureItem) => {
    const totalQuestions = questions.filter(q => q.lectureId === lec.id);
    if (Object.keys(quizAnswers).length < totalQuestions.length) {
      if (!confirm("لم تجب/تجيبي على جميع الأسئلة المطروحة. هل ترغب/ين بتسليم الاختبار وتصحيحه على أية حال؟")) return;
    }

    // محاولة تصحيح واعتماد الاختبار عبر الخادم الموثق
    let isPassed = false;
    let percentage = 0;
    let attemptsCount = 1;
    const existingProgress = progresses.find(p => p.lectureId === lec.id);

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
            answers: quizAnswers,
            watchedMinutes: existingProgress?.lastPlaybackPosition ? existingProgress.lastPlaybackPosition / 60 : undefined
          })
        });
        const data = await res.json();
        if (res.ok && data.success) {
          isPassed = data.isPassed;
          percentage = data.percentage;
          attemptsCount = data.attemptsCount || 1;
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

    // إذا لم تتوفر استجابة الخادم (للضيوف أو وضع عدم الاتصال)
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
        showSuccess("تهانينا الحارة واجتياز مبارك! 🎓🎉", `لقد اجتزت المجلس الختامي لكتابك بنسبة ${percentage}%. تم إرسال إشعار فوري للمشرف/ة لمراجعة طلبك وإرسال الشهادة والسند المبارك لك!`);
        const targetBook = books.find(b => b.id === lec.bookId);
        const parentCourse = courses.find(c => c?.id === targetBook?.courseId);
        if (userProfile && targetBook) {
          requestCertificate(
            userProfile,
            targetBook.courseId,
            parentCourse?.title || 'الدورة العلمية',
            targetBook.id,
            targetBook.title,
            true
          ).catch(err => console.warn("Request certificate error:", err));
        }
      } else {
        showSuccess("تهانينا الحارة! 🎉", `اجتزت الاختبار بنسبة نجاح بلغت ${percentage}%. تم فتح المحاضرة التالية!`);
      }

      // التحقق هل أدى اجتياز هذا الاختبار إلى إتمام الكتاب بالكامل وفتح الكتاب التالي في الدورة
      const targetBook = books.find(b => b.id === lec.bookId);
      if (targetBook) {
        const cBooks = sortCourseBooks(books.filter(b => b.courseId === targetBook.courseId));
        const bLecs = courseLectures.filter(l => l.bookId === targetBook.id);
        const updatedProgressList = [...progresses.filter(p => p.lectureId !== newProgress.lectureId), newProgress];
        const isBookNowComplete = bLecs.every(l => isLectureCompleted(l.id, updatedProgressList, questions));

        if (isBookNowComplete) {
          const bookIdx = cBooks.findIndex(b => b.id === targetBook.id);
          const nextBook = bookIdx >= 0 && bookIdx < cBooks.length - 1 ? cBooks[bookIdx + 1] : null;
          if (nextBook) {
            showSuccess(
              "مبارك! تم فتح الكتاب التالي في الدورة 🔓📚",
              `أحسنتِ صنعاً! باجتيازكِ اختبارات كتاب «${targetBook.title}»، تم الآن فتح دراسة الكتاب التالي في الدورة: «${nextBook.title}»!`
            );
          }

          // التحقق هل أدى إتمام هذا الكتاب إلى إتمام الدورة كاملة وفتح الدورة التالية المقيدة بشرط
          const isCourseNowComplete = isCourseCompleted(targetBook.courseId, books, courseLectures, updatedProgressList, questions);
          if (isCourseNowComplete) {
            const nextCourse = getNextChainedCourse(targetBook.courseId, courses);
            if (nextCourse) {
              confetti({ particleCount: 80, spread: 80, origin: { y: 0.5 } });
              showSuccess(
                "عرس علمي مبارك! تم فتح الدورة التالية بالكامل 🎓🔓",
                `أحسنتِ صنعاً وبوركت الهمة! باجتيازكِ كامل اختبارات هذه الدورة، تم الآن فتح الدورة العلمية التالية: «${nextCourse.title}»!`
              );
            }
          }
        }
      }
      
      // التحقق من إكمال الكتاب لإصدار شهادة فورية ومفاجأة سارة!
      checkAndIssueBookCertificate(lec.bookId);
    } else {
      showError("لم يحصل الاجتياز بعد", `أحرزت نسبة ${percentage}%. درجة النجاح المطلوبة هي 60%. تفاءل/ي وأعد/أعيدي المحاولة لفتح الدرس التالي!`);
    }
  };

  // التحقق الفوري هل أكمل الطالب/ة جميع دروس الكتاب لإصدار إشعار وشهادة إنجاز
  const checkAndIssueBookCertificate = (bookId: string, currentUpdatedProgress?: StudentLectureProgress) => {
    const bookLecs = courseLectures.filter(l => l.bookId === bookId);
    if (bookLecs.length === 0) return;

    // يجب أن تكون جميع محاضرات هذا الكتاب منتهية ومجتازة
    const allPassed = bookLecs.every(lec => {
      const q = questions.filter(quest => quest.lectureId === lec.id);
      let prog = progresses.find(p => p.lectureId === lec.id);
      if (currentUpdatedProgress && currentUpdatedProgress.lectureId === lec.id) {
        prog = currentUpdatedProgress;
      }
      if (q.length > 0) {
        return prog?.isLectureFinished && prog?.isPassed;
      }
      return prog?.isLectureFinished;
    });

    if (allPassed) {
      const targetBook = books.find(b => b.id === bookId);
      const parentCourse = courses.find(c => c?.id === targetBook?.courseId);

      // طلب الشهادة وإشعار المشرف/ة تلقائياً في السحاب واللوحة
      if (userProfile && targetBook) {
        const hasFinalSession = bookLecs.some(l => l.isFinalSession);
        requestCertificate(
          userProfile,
          targetBook.courseId,
          parentCourse?.title || 'الدورة العلمية',
          targetBook.id,
          targetBook.title,
          hasFinalSession
        ).catch(err => console.warn("Request certificate error:", err));
      }

      // تسجيل نشاط الشهادة
      const certAct: StudentActivity = {
        id: `act-cert-${Date.now()}`,
        type: 'certificate_earned',
        title: 'إصدار شهادة إتمام منهجية',
        description: `تم إتمام دراسة واختبارات كتاب: "${targetBook?.title || 'المقرر الشرعي'}" بنجاح ومنح شهادة رسمية من ملتقى طلبة العلم!`,
        timestamp: new Date().toISOString()
      };
      saveActivity(certAct);

      // تسجيل إشعار الشهادة
      const certNotif: StudentNotification = {
        id: `notif-cert-${Date.now()}`,
        title: 'مبارك! تم إصدار شهادتك الرسمية 🎓',
        body: `تكللت جهودك بالنجاح التام! تم منحك "شهادة إتمام كتاب ${targetBook?.title || ''}" مكافأة لهمتك الطيبة، ولقد أضفنا 150 نقطة لحسابك.`,
        type: 'badge',
        timestamp: new Date().toISOString(),
        isRead: false
      };
      saveNotification(certNotif);

      // احتفال بالشهادة
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.5 }
      });
      showSuccess("عرس علمي مبارك! 🎓✨", `مبارك إتمام الكتاب! تم إرسال طلب شهادتك وسندك إلى المشرفة للمراجعة والاعتماد.`);
    }
  };

  // جلب كافة المحاضرات التابعة للدورة بشمولية ودقة (عبر معرف الدورة أو كتب الدورة)
  const getCourseLectures = (courseId: string) => {
    const courseBooks = books.filter(b => b.courseId === courseId);
    const bookIdSet = new Set(courseBooks.map(b => b.id));
    return courseLectures.filter(l => l.courseId === courseId || (l.bookId && bookIdSet.has(l.bookId)));
  };

  // معيار التحصيل العلمي الدقيق للدرس:
  // يعتبر الدرس محصلاً ومكتملاً إذا تحقّق أحد الشروط:
  // 1. اجتياز اختباره بنسبة 60% فما فوق (isPassed أو bestScore >= 60)
  // 2. أو إنهاء المحاضرة (isLectureFinished أو مشاهدة >= 90% أو قراءة وإنجاز >= 90%)
  const isLectureAchieved = (lecId: string) => {
    const prog = progresses.find(p => p.lectureId === lecId);
    if (!prog) return false;
    if (prog.isPassed) return true;
    if ((prog.bestScore || 0) >= 60 || (prog.lastScore || 0) >= 60) return true;
    if (prog.isLectureFinished) return true;
    if ((prog.lectureWatchPercentage || 0) >= 90) return true;
    if ((prog.totalLessonProgressPercentage || 0) >= 90) return true;
    return false;
  };

  // إحصاءات التقدم الإجمالية
  const totalLecturesCount = courseLectures.length;
  const completedLecturesCount = courseLectures.filter(lec => isLectureAchieved(lec.id)).length;
  const overallProgressPercentage = totalLecturesCount > 0 
    ? Math.min(100, Math.round((completedLecturesCount / totalLecturesCount) * 100)) 
    : 0;

  // إحصاءات نسبة التحصيل لكل دورة علمية بدقة تامة
  const getCourseProgress = (courseId: string) => {
    const courseLecs = getCourseLectures(courseId);
    if (courseLecs.length === 0) return 0;
    const completed = courseLecs.filter(l => isLectureAchieved(l.id)).length;
    return Math.min(100, Math.round((completed / courseLecs.length) * 100));
  };

  // إحصاءات نسبة التحصيل لكل كتاب
  const getBookProgress = (bookId: string) => {
    const bookLecs = courseLectures.filter(l => l.bookId === bookId);
    if (bookLecs.length === 0) return 0;
    const completed = bookLecs.filter(l => isLectureAchieved(l.id)).length;
    return Math.min(100, Math.round((completed / bookLecs.length) * 100));
  };

  // هل الكتاب مكتمل تماماً ومجتاز؟
  const isBookPassedAndComplete = (bookId: string) => {
    const bookLecs = courseLectures.filter(l => l.bookId === bookId);
    if (bookLecs.length === 0) return false;
    return bookLecs.every(lec => {
      const q = questions.filter(quest => quest.lectureId === lec.id);
      const prog = progresses.find(p => p.lectureId === lec.id);
      if (q.length > 0) {
        return (prog?.isPassed || (prog?.bestScore || 0) >= 60) && (prog?.isLectureFinished || (prog?.lectureWatchPercentage || 0) >= 90);
      }
      return prog?.isLectureFinished || (prog?.lectureWatchPercentage || 0) >= 90;
    });
  };

  // هل الدورة مكتملة ومجتازة تماماً؟
  const isCoursePassedAndComplete = (courseId: string) => {
    const courseLecs = getCourseLectures(courseId);
    if (courseLecs.length === 0) return false;
    return courseLecs.every(lec => {
      const q = questions.filter(quest => quest.lectureId === lec.id);
      const prog = progresses.find(p => p.lectureId === lec.id);
      if (q.length > 0) {
        return (prog?.isPassed || (prog?.bestScore || 0) >= 60) && (prog?.isLectureFinished || (prog?.lectureWatchPercentage || 0) >= 90);
      }
      return prog?.isLectureFinished || (prog?.lectureWatchPercentage || 0) >= 90;
    });
  };

  // تصفية المحاضرات النشطة في مجلس الدروس عند اختيار الكتاب مرتبة حسب الترتيب المنهجي
  const activeBookLectures = selectedBook 
    ? courseLectures.filter(l => l.bookId === selectedBook.id).sort((a, b) => (a.order ?? 0) - (b.order ?? 0)) 
    : [];

  // دالة تحميل الشهادة كـ PDF
  const downloadCertificatePDF = (cert: Certificate) => {
    const input = document.getElementById('certificate-print-area');
    if (!input) return;

    // Show loading state or alert
    showSuccess("جاري تجهيز الشهادة...", "يتم الآن صياغة شهادتك وتحويلها لملف PDF رسمي.");

    html2canvas(input, {
      scale: 2.5, // High resolution
      useCORS: true,
      logging: false,
      backgroundColor: '#fafaf9'
    }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`شهادة_إتمام_${cert.studentName}_${cert.bookName}.pdf`);
      showSuccess("تم التحميل بنجاح! 🎓📥", "تم حفظ الشهادة كملف PDF رسمي في جهازك.");
    }).catch(err => {
      console.error("PDF download failed:", err);
      showError("عذراً، حدث خطأ", "تعذر توليد ملف الـ PDF. يمكنك استخدام خيار الطباعة المباشرة.");
    });
  };

  // دالة حفظ الشهادة كصورة عالية الدقة
  const saveCertificateAsImage = (cert: Certificate) => {
    const input = document.getElementById('certificate-print-area');
    if (!input) return;

    showSuccess("جاري تجهيز الصورة...", "يتم الآن حفظ الشهادة كصورة رقمية عالية الجودة.");

    html2canvas(input, {
      scale: 3,
      useCORS: true,
      logging: false,
      backgroundColor: '#fafaf9'
    }).then((canvas) => {
      const link = document.createElement('a');
      link.download = `شهادة_إتمام_${cert.studentName}_${cert.bookName}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      showSuccess("تم الحفظ بنجاح! 🖼️✨", "تم حفظ الشهادة في معرض الصور الخاص بك.");
    }).catch(err => {
      console.error(err);
      showError("تعذر حفظ الصورة", "يرجى المحاولة مجدداً أو استخدام زر الطباعة.");
    });
  };

  return (
    <div className="space-y-6 pb-20 animate-fade-in relative print:p-0">
      
      {/* رأس الصفحة والهوية البصرية */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5 print:hidden">
        <div>
          <h1 className="text-2xl md:text-3xl font-black font-serif text-slate-900 dark:text-slate-50 flex items-center gap-2">
            <User className="w-8 h-8 text-emerald-600" />
            <span>لوحة الطالب/ة المنهجية</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">تتبع مسيرتك، تصفح مقرراتك وكتبك، أتم/أتمي دروسك، وحمّل/ي شهاداتك الموثقة سحابياً.</p>
        </div>

        {/* أزرار التنقل الفرعية الخاصة باللوحة */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 dark:bg-slate-900 p-1 rounded-2xl border border-slate-200/60 dark:border-slate-800/80">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'overview' 
                ? 'bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 shadow-xs' 
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            الرئيسية
          </button>
          <button 
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'analytics' 
                ? 'bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 shadow-xs' 
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>المؤشرات والرسوم البيانية</span>
          </button>
          <button 
            onClick={() => setActiveTab('courses')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'courses' 
                ? 'bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 shadow-xs' 
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            المقررات والكتب
          </button>
          <button 
            onClick={() => setActiveTab('lectures')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'lectures' 
                ? 'bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 shadow-xs' 
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            مجالس الدروس
          </button>
          <button 
            onClick={() => setActiveTab('exams')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'exams' 
                ? 'bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 shadow-xs' 
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            سجل الاختبارات ({progresses.filter(p => p.attemptsCount > 0).length})
          </button>
          <button 
            onClick={() => setActiveTab('certificates')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all relative ${
              activeTab === 'certificates' 
                ? 'bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 shadow-xs' 
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            الشهادات العلمية
            {books.some(b => isBookPassedAndComplete(b.id)) && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-500 rounded-full animate-ping" />
            )}
          </button>
        </div>
      </div>

      {/* محتوى التبويبات الفعلي */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="space-y-6 print:m-0"
        >
          {/* ======================= التبويب الأول: الرئيسية ======================= */}
          {activeTab === 'overview' && (
            <div className="space-y-6 print:hidden">
              {/* الترحيب وحكمة اليوم */}
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-l from-emerald-800 via-teal-800 to-slate-900 text-white p-6 md:p-10 shadow-xl border border-emerald-500/20">
                <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px]"></div>
                <div className="relative z-10 max-w-4xl">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 backdrop-blur-md border border-emerald-400/30 text-emerald-300 text-xs font-bold mb-4 animate-pulse">
                    <Quote className="w-3.5 h-3.5" /> قيد المذاكرة والمجالسة
                  </div>
                  <h2 className="text-xl md:text-3xl font-black font-serif leading-tight">
                    أهلاً ومرحباً بالطالب/ة الهُمام/ة: <span className="text-emerald-400 underline decoration-emerald-500/50 underline-offset-8">{userProfile?.displayName || userProfile?.name || 'طالب/ة العلم'}</span>
                  </h2>
                  <p className="mt-4 text-emerald-100/90 text-xs md:text-sm leading-relaxed font-serif italic border-r-4 border-emerald-500 pr-4 max-w-3xl">
                    {DAILY_WISDOMS[quoteIndex]}
                  </p>
                </div>
              </div>

              {/* شبكة الإحصاء السريع */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div 
                  onClick={handleCheerStreak}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs hover:border-amber-400 dark:hover:border-amber-600 transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-500">همة الاستمرار</span>
                    <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500 group-hover:scale-110 transition-transform">
                      <Flame className="w-5 h-5 fill-amber-500" />
                    </div>
                  </div>
                  <div className="text-xl md:text-2xl font-black font-mono text-slate-800 dark:text-slate-100">
                    {userProfile?.streak || 0} <span className="text-xs font-sans text-slate-400 font-normal">أيام متصلة</span>
                  </div>
                  <p className="text-[9px] text-emerald-600 font-bold mt-1">انقر/ي لتسجيل حضورك وتشجيع همّتك!</p>
                </div>

                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-500">المحاضرات المنجزة</span>
                    <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="text-xl md:text-2xl font-black font-mono text-slate-800 dark:text-slate-100">
                    {progresses.filter(p => p.isPassed).length} <span className="text-xs font-sans text-slate-400 font-normal">محاضرة</span>
                  </div>
                  <p className="text-[9px] text-slate-400 mt-1">اجتياز شروحات واختبارات الدروس المنهجية</p>
                </div>

                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-500">الشهادات المحرزة</span>
                    <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600">
                      <Award className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="text-xl md:text-2xl font-black font-mono text-slate-800 dark:text-slate-100">
                    {books.filter(b => isBookPassedAndComplete(b.id)).length} <span className="text-xs font-sans text-slate-400 font-normal">شهادات</span>
                  </div>
                  <p className="text-[9px] text-slate-400 mt-1">تم إتمام جميع متطلبات الشروحات والاختبارات</p>
                </div>

                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-500">الكتب المعتمدة</span>
                    <div className="p-2 rounded-xl bg-teal-500/10 text-teal-600">
                      <Sparkles className="w-5 h-5 fill-teal-500/20" />
                    </div>
                  </div>
                  <div className="text-xl md:text-2xl font-black font-mono text-slate-800 dark:text-slate-100">
                    {userProfile?.completedBooksCount || 0} <span className="text-xs font-sans text-slate-400 font-normal">كتب</span>
                  </div>
                  <p className="text-[9px] text-teal-600 font-bold mt-1">مستوى: {userProfile?.level || 'مبتدئ'}</p>
                </div>
              </div>

              {/* قسم بيانات الطالب/ة وقسم نسبة الإنجاز والنشاط والأوراد */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* العمود الأيمن: بيانات الطالب/ة وتعديلها */}
                <div className="space-y-6">
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-2xs relative">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-base font-serif flex items-center gap-2">
                        <User className="w-4.5 h-4.5 text-emerald-600" />
                        <span>بيانات الطالب/ة المنهجية</span>
                      </h3>
                      <button 
                        onClick={() => setEditProfileOpen(!editProfileOpen)}
                        className="text-xs text-emerald-600 hover:text-emerald-700 font-bold flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-lg"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>تعديل</span>
                      </button>
                    </div>

                    {!editProfileOpen ? (
                      <div className="space-y-4">
                        <div className="flex items-center gap-4 border-b border-slate-100 dark:border-slate-800/80 pb-4">
                          {userProfile?.photoURL && !avatarBroken ? (
                            <img
                              src={userProfile.photoURL}
                              alt={userProfile.displayName || userProfile.name || 'صورة الطالب'}
                              referrerPolicy="no-referrer"
                              onError={() => setAvatarBroken(true)}
                              className="w-14 h-14 rounded-full object-cover border-2 border-emerald-500/20 shrink-0"
                            />
                          ) : (
                            <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-slate-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-black text-xl border-2 border-emerald-500/10 shrink-0">
                              {userProfile?.firstName?.charAt(0) || userProfile?.displayName?.charAt(0) || userProfile?.name?.charAt(0) || 'ط'}
                            </div>
                          )}
                          <div className="min-w-0">
                            <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100 truncate">{userProfile?.displayName || userProfile?.name}</h4>
                            <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5 truncate">
                              <Mail className="w-3 h-3 shrink-0" /> <span className="truncate">{userProfile?.email}</span>
                            </p>
                          </div>
                        </div>

                        <div className="space-y-3.5 text-xs">
                          <div className="flex justify-between">
                            <span className="text-slate-500">المستوى الأكاديمي:</span>
                            <span className="font-bold px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-md text-slate-700 dark:text-slate-200">
                              {userProfile?.level || 'مبتدئ'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">تاريخ الالتحاق بالملتقى:</span>
                            <span className="font-mono text-slate-700 dark:text-slate-200">{userProfile?.joinDate || 'لا توجد بيانات بعد'}</span>
                          </div>
                          <div className="space-y-1">
                            <span className="text-slate-500 block">سيرة ذاتية وهمّة طلب العلم:</span>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl italic border-r-2 border-slate-300 dark:border-slate-700">
                              {userProfile?.bio || '«إنما العلم بالتعلم، وإنما الحلم بالتحلم».'}
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <form onSubmit={handleSaveProfile} className="space-y-4 animate-fade-in">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1.5">الاسم الأول:</label>
                            <input 
                              type="text"
                              required
                              maxLength={40}
                              value={profileForm.firstName}
                              onChange={e => setProfileForm({ ...profileForm, firstName: e.target.value })}
                              className="w-full text-xs p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1.5">الكنية (اسم العائلة):</label>
                            <input 
                              type="text"
                              required
                              maxLength={40}
                              value={profileForm.lastName}
                              onChange={e => setProfileForm({ ...profileForm, lastName: e.target.value })}
                              className="w-full text-xs p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-600 mb-1.5">الرتبة المنهجية الحالية:</label>
                          <select
                            value={profileForm.level}
                            onChange={e => setProfileForm({ ...profileForm, level: e.target.value as any })}
                            className="w-full text-xs p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-hidden"
                          >
                            <option value="مبتدئ">مبتدئ (مرحلة التأصيل)</option>
                            <option value="متوسط">متوسط (مرحلة البناء والتحصيل)</option>
                            <option value="متقدم">متقدم (مرحلة التمكن العلمي)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-600 mb-1.5">رسالة وهمة طلب العلم (Bio):</label>
                          <textarea
                            value={profileForm.bio}
                            onChange={e => setProfileForm({ ...profileForm, bio: e.target.value })}
                            rows={3}
                            className="w-full text-xs p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-hidden"
                            placeholder="اكتبي حكمة تلهمكِ أو هدفكِ من المذاكرة..."
                          />
                        </div>

                        <div className="flex gap-2 pt-2">
                          <button 
                            type="submit"
                            className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs"
                          >
                            حفظ التعديلات
                          </button>
                          <button 
                            type="button"
                            onClick={() => setEditProfileOpen(false)}
                            className="flex-1 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-bold"
                          >
                            إلغاء
                          </button>
                        </div>
                      </form>
                    )}
                  </div>

                  {/* مركز الإشعارات الفوري */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-2xs">
                    <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">
                      <div className="flex items-center gap-2">
                        <Bell className="w-4.5 h-4.5 text-emerald-600 animate-swing" />
                        <h3 className="font-bold text-base font-serif">الإشعارات والتنبيهات</h3>
                      </div>
                      {notifications.some(n => !n.isRead) && (
                        <button 
                          onClick={markAllNotificationsAsRead}
                          className="text-[10px] text-emerald-600 font-bold hover:underline"
                        >
                          تحديد كمقروء
                        </button>
                      )}
                    </div>

                    <div className="space-y-3.5 max-h-[280px] overflow-y-auto pr-1">
                      {notifications.length === 0 ? (
                        <div className="text-center py-6 text-xs text-slate-400 italic">لا توجد تنبيهات حالية.</div>
                      ) : (
                        notifications.map(n => (
                          <div 
                            key={n.id}
                            className={`p-3 rounded-2xl border transition-all text-xs relative ${
                              n.isRead 
                                ? 'bg-slate-50/50 dark:bg-slate-800/30 border-slate-100 dark:border-slate-800/80 opacity-75' 
                                : 'bg-emerald-50/20 dark:bg-emerald-950/10 border-emerald-500/20 shadow-3xs'
                            }`}
                          >
                            {!n.isRead && (
                              <span className="absolute top-2 left-2 w-2 h-2 bg-emerald-500 rounded-full" />
                            )}
                            <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                              {n.type === 'success' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                              {n.type === 'badge' && <Award className="w-3.5 h-3.5 text-amber-500 fill-amber-500/10 animate-bounce" />}
                              {n.type === 'alert' && <XCircle className="w-3.5 h-3.5 text-rose-500" />}
                              {n.type === 'info' && <Info className="w-3.5 h-3.5 text-blue-500" />}
                              <span>{n.title}</span>
                            </div>
                            <p className="text-slate-500 dark:text-slate-400 mt-1 leading-relaxed text-[11px]">{n.body}</p>
                            <span className="text-[9px] text-slate-400 block mt-1 text-left font-mono">{new Date(n.timestamp).toLocaleString('ar-SA')}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* العمود الأيسر: نسبة الإنجاز والنشاط وتقدم المقررات */}
                <div className="lg:col-span-2 space-y-6">
                  
                  {/* شريحة نسبة الإنجاز المنهجية */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-2xs">
                    <h3 className="font-bold text-base font-serif mb-4 flex items-center gap-2">
                      <TrendingUp className="w-4.5 h-4.5 text-emerald-600" />
                      <span>مقياس التحصيل ونسبة الإنجاز العام</span>
                    </h3>

                    <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40">
                      <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90">
                          <circle
                            cx="56"
                            cy="56"
                            r="48"
                            className="stroke-slate-200 dark:stroke-slate-800"
                            strokeWidth="8"
                            fill="transparent"
                          />
                          <circle
                            cx="56"
                            cy="56"
                            r="48"
                            className="stroke-emerald-600 transition-all duration-500"
                            strokeWidth="8"
                            fill="transparent"
                            strokeDasharray={301.6}
                            strokeDashoffset={301.6 - (301.6 * overallProgressPercentage) / 100}
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="absolute text-center">
                          <span className="text-2xl font-black font-mono text-slate-800 dark:text-slate-100">{overallProgressPercentage}%</span>
                          <span className="text-[9px] text-slate-400 block mt-0.5 font-bold">إنجاز عام</span>
                        </div>
                      </div>

                      <div className="flex-1 space-y-3 w-full">
                        <div className="text-xs text-slate-600 dark:text-slate-400 flex justify-between font-bold">
                          <span>المجالس والدروس المكتملة:</span>
                          <span className="font-mono text-emerald-600 font-black">{completedLecturesCount} من {totalLecturesCount} شروحات</span>
                        </div>

                        {/* شريط الإنجاز الخطي للمقررات الفرعية */}
                        <div className="space-y-2.5 pt-1.5 border-t border-slate-200/50 dark:border-slate-800/60">
                          {courses.slice(0, 3).map(c => {
                            const p = getCourseProgress(c.id);
                            return (
                              <div key={c.id} className="space-y-1">
                                <div className="flex justify-between text-[11px] text-slate-500 font-bold">
                                  <span>{c.title}</span>
                                  <span className="font-mono">{p}%</span>
                                </div>
                                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                                  <div 
                                    className="h-full bg-emerald-600 rounded-full transition-all"
                                    style={{ width: `${p}%` }}
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* آخر نشاط ومذكرات الطالب/ة المنهجية */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-2xs">
                    <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">
                      <div className="flex items-center gap-2">
                        <Bookmark className="w-4.5 h-4.5 text-emerald-600" />
                        <h3 className="font-bold text-base font-serif">آخر الأنشطة والخطوات العلمية</h3>
                      </div>
                      <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg text-slate-500 font-mono">آخر 10 أنشطة</span>
                    </div>

                    <div className="space-y-4 pr-1 max-h-[300px] overflow-y-auto">
                      {activities.length === 0 ? (
                        <div className="text-center py-6 text-xs text-slate-400 italic">لم يتم رصد أي نشاط منهجي مؤخراً.</div>
                      ) : (
                        activities.slice(0, 10).map((act, idx) => (
                          <div key={act.id || idx} className="flex gap-4 items-start group">
                            <div className="relative flex flex-col items-center shrink-0">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${
                                act.type === 'quiz_pass' 
                                  ? 'bg-emerald-50 border-emerald-500/20 text-emerald-600'
                                  : act.type === 'certificate_earned'
                                  ? 'bg-amber-50 border-amber-500/20 text-amber-500 animate-pulse'
                                  : act.type === 'lecture_complete'
                                  ? 'bg-blue-50 border-blue-500/20 text-blue-600'
                                  : 'bg-slate-50 border-slate-200 text-slate-600'
                              }`}>
                                {act.type === 'quiz_pass' ? <Check className="w-4 h-4" /> :
                                 act.type === 'certificate_earned' ? <Award className="w-4 h-4 fill-amber-500/10" /> :
                                 act.type === 'lecture_complete' ? <Play className="w-3 h-3 fill-blue-500/10" /> :
                                 <HelpCircle className="w-4 h-4" />}
                              </div>
                              {idx < activities.length - 1 && (
                                <div className="w-0.5 h-10 bg-slate-100 dark:bg-slate-800/80 mt-1" />
                              )}
                            </div>
                            <div className="flex-1 bg-slate-50/50 dark:bg-slate-800/20 p-3 rounded-2xl border border-slate-100 dark:border-slate-800/60 group-hover:bg-slate-50 transition-colors">
                              <div className="flex items-center justify-between gap-2">
                                <h4 className="font-extrabold text-xs text-slate-800 dark:text-slate-100">{act.title}</h4>
                                <span className="text-[9px] text-slate-400 font-mono">{new Date(act.timestamp).toLocaleDateString('ar-SA')}</span>
                              </div>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{act.description}</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                </div>
              </div>

              {/* المكون المرئي البياني لتقدم الطالب في إتمام دروسه الأسبوعية والشهرية Recharts */}
              <StudentProgressCharts 
                progresses={progresses} 
                activities={activities} 
                courses={courses} 
                lectures={courseLectures} 
              />
            </div>
          )}

          {/* ======================= تبويب الرسوم البيانية والتحليلات المتقدمة ======================= */}
          {activeTab === 'analytics' && (
            <div className="space-y-6 print:hidden">
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-l from-emerald-900 via-teal-900 to-slate-900 text-white p-6 md:p-8 shadow-xl border border-emerald-500/20">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold mb-2">
                      <TrendingUp className="w-3.5 h-3.5" /> تحليلات الهمة والتحصيل المنهجي
                    </div>
                    <h2 className="text-2xl font-black font-serif">مؤشرات التقدم والرسوم البيانية الأسبوعية والشهرية</h2>
                    <p className="text-xs text-emerald-100/80 mt-1 max-w-2xl">
                      «العلم صيدٌ والكتابة قيده.. وثبات الهمة بالمداومة وحسن المتابعة». راقب/ي معدل إنجازك الأسبوعي والشهري وتجاوز عقبات الاختبارات.
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleCheerStreak}
                      className="px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
                    >
                      <Flame className="w-4 h-4 fill-slate-950" />
                      <span>تثبيت الهمة اليومية</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* المكون البياني الرئيسي */}
              <StudentProgressCharts 
                progresses={progresses} 
                activities={activities} 
                courses={courses} 
                lectures={courseLectures} 
              />

              {/* تفصيل إنجاز المقررات والدروس الأكاديمية */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-2xs">
                <h3 className="font-bold text-base font-serif mb-4 flex items-center gap-2 text-slate-800 dark:text-slate-100">
                  <BookOpen className="w-4.5 h-4.5 text-emerald-600" />
                  <span>تفصيل إنجاز المقررات والدروس الأكاديمية</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {courses.map(course => {
                    const cLecs = getCourseLectures(course.id);
                    const cDone = cLecs.filter(l => isLectureAchieved(l.id)).length;
                    const cPassed = cLecs.filter(l => progresses.some(p => p.lectureId === l.id && (p.isPassed || (p.bestScore || 0) >= 60))).length;
                    const pct = cLecs.length > 0 ? Math.min(100, Math.round((cDone / cLecs.length) * 100)) : 0;
                    return (
                      <div key={course.id} className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-xs text-slate-800 dark:text-slate-100">{course.title}</h4>
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                            {pct}%
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                          <div className="h-full bg-emerald-600 rounded-full transition-all" style={{ width: `${pct}%` }} />
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-slate-500">
                          <span>الدروس المكتملة: {cDone} من {cLecs.length}</span>
                          <span>الاختبارات المجتازة: {cPassed}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ======================= التبويب الثاني: المقررات والكتب ======================= */}
          {activeTab === 'courses' && (
            <div className="space-y-6 print:hidden">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-2xs">
                <h3 className="font-bold text-lg font-serif mb-1 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-emerald-600" />
                  <span>المقررات الدراسية النشطة</span>
                </h3>
                <p className="text-xs text-slate-500 mb-6">اختاري الدورة لعرض الكتب المدرجة تحتها، مع متابعة نسبة إتمام المقررات.</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {(() => {
                  const activeMaster = dashboardMasterCourseId 
                    ? courses.find(c => c.id === dashboardMasterCourseId)
                    : null;
                  const childLevels = activeMaster 
                    ? getChildCourses(activeMaster.id, courses)
                    : [];
                  const topLevelCourses = getTopLevelCourses(courses);

                  // إذا كان الطالب قد اختار دورة كبيرة جامعة (مثل: دورة التأصيل العلمي)
                  if (activeMaster) {
                    const masterProgress = getMasterCourseProgress(
                      activeMaster.id,
                      courses,
                      books,
                      courseLectures,
                      progresses,
                      questions
                    );

                    return (
                      <div className="space-y-6 animate-fade-in text-right">
                        {/* رأس المسار العلمي الكبير */}
                        <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-900 text-white shadow-xl border border-emerald-500/30 space-y-4">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-start gap-4">
                              <div className="relative shrink-0">
                                <CoverImage
                                  src={activeMaster.imageUrl}
                                  alt={activeMaster.title}
                                  type="course"
                                  className="w-16 h-16 rounded-2xl object-cover border border-white/25 shadow-sm"
                                />
                                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-lg bg-emerald-600 flex items-center justify-center border border-white/25">
                                  <Layers className="w-3.5 h-3.5 text-white" />
                                </div>
                              </div>
                              <div>
                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                  <span className="text-[10px] bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 px-2 py-0.5 rounded-md font-bold">
                                    🏛️ دورة رئيسية جامعة
                                  </span>
                                  <span className="text-[10px] text-emerald-200 font-mono">
                                    {childLevels.length} مستويات دراسية
                                  </span>
                                </div>
                                <h3 className="text-xl font-bold font-serif">{activeMaster.title}</h3>
                                <p className="text-xs text-emerald-100/80 mt-1 max-w-2xl leading-relaxed">{activeMaster.description}</p>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => setDashboardMasterCourseId(null)}
                              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all flex items-center gap-1.5 self-start md:self-center cursor-pointer border border-white/15"
                            >
                              <ArrowRight className="w-4 h-4" />
                              <span>الرجوع لكافة المسارات</span>
                            </button>
                          </div>

                          {/* مؤشر إنجاز المسار */}
                          <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                            <div className="flex items-center gap-2">
                              <span className="text-emerald-200 font-bold">نسبة إنجاز المستويات:</span>
                              <span className="font-mono font-black text-amber-300">{masterProgress.percentage}%</span>
                              <span className="text-emerald-200/80 text-[11px]">({masterProgress.completedLevels} من {masterProgress.totalLevels} مستويات)</span>
                            </div>
                            <div className="w-full sm:w-60 bg-black/40 h-2 rounded-full overflow-hidden border border-white/10">
                              <div className="bg-amber-400 h-full rounded-full transition-all duration-700" style={{ width: `${masterProgress.percentage}%` }} />
                            </div>
                          </div>
                        </div>

                        {/* شبكة المستويات */}
                        <div className="space-y-3">
                          <h4 className="font-bold text-sm text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                            <Sparkles className="w-4 h-4 text-amber-500" />
                            <span>المستويات الدراسية في «{activeMaster.title}»</span>
                          </h4>

                          {childLevels.length === 0 ? (
                            <div className="p-8 text-center text-slate-400 text-xs bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                              لا توجد مستويات مضافة بعد في هذه الدورة الكبيرة.
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                              {childLevels.map((course, cIdx) => {
                                const progress = getCourseProgress(course.id);
                                const isComplete = isCoursePassedAndComplete(course.id);
                                const isSelected = selectedCourse?.id === course.id;
                                const isUnlocked = isCourseUnlocked(course, courses, books, courseLectures, progresses, questions);
                                const prereq = getPrerequisiteCourse(course, courses);

                                return (
                                  <div 
                                    key={course.id}
                                    className={`p-5 rounded-2xl border transition-all relative overflow-hidden group ${
                                      !isUnlocked
                                        ? 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 opacity-90'
                                        : isSelected 
                                          ? 'bg-emerald-50/20 dark:bg-emerald-950/10 border-emerald-500/80 dark:border-emerald-600/60 shadow-xs cursor-pointer' 
                                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-emerald-500/40 cursor-pointer'
                                    }`}
                                    onClick={() => {
                                      handleSelectCourse(course, false);
                                    }}
                                  >
                                    <div className="flex items-start gap-4">
                                      <div className="relative shrink-0">
                                        <CoverImage
                                          src={course.imageUrl}
                                          alt={course.title}
                                          type="course"
                                          className={`w-16 h-16 rounded-xl object-cover border border-slate-100 dark:border-slate-800 transition-transform ${isUnlocked ? 'group-hover:scale-105' : 'grayscale-50'}`}
                                        />
                                        {!isUnlocked && (
                                          <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[1px] rounded-xl flex items-center justify-center text-amber-300">
                                            <Lock className="w-6 h-6" />
                                          </div>
                                        )}
                                      </div>
                                      <div className="space-y-1.5 flex-1">
                                        <div className="flex items-center justify-between flex-wrap gap-1">
                                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono font-bold">
                                            المستوى #{cIdx + 1}
                                          </span>

                                          {!isUnlocked && (
                                            <span className="text-[10px] bg-amber-500/15 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-md font-bold flex items-center gap-1 border border-amber-500/30">
                                              <Lock className="w-3 h-3 text-amber-500" /> مقفل
                                            </span>
                                          )}

                                          {isComplete && (
                                            <span className="text-[10px] bg-amber-500 text-slate-950 px-2 py-0.5 rounded-md font-black flex items-center gap-1">
                                              <Award className="w-3 h-3 fill-slate-950" /> مكتمل ومجاز
                                            </span>
                                          )}
                                        </div>
                                        <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100 font-serif leading-snug">{course.title}</h4>
                                        <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">{course.description}</p>
                                        
                                        {!isUnlocked && prereq && (
                                          <p className="text-[10px] text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 px-2 py-1 rounded-md border border-amber-200/40">
                                            🔒 تفتح بعد إتمام: «{prereq.title}»
                                          </p>
                                        )}
                                      </div>
                                    </div>

                                    {/* مؤشر التقدم وزر الانتقال الفوري لآخر مجلس مفتوح */}
                                    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/80 space-y-2">
                                      <div className="flex justify-between text-[11px] text-slate-500 font-bold">
                                        <span>نسبة التحصيل في المستوى:</span>
                                        <span className="font-mono text-emerald-600">{progress}%</span>
                                      </div>
                                      <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                                        <div 
                                          className="h-full bg-emerald-600 rounded-full transition-all"
                                          style={{ width: `${progress}%` }}
                                        />
                                      </div>

                                      {isUnlocked ? (
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleSelectCourse(course, true);
                                          }}
                                          className="w-full mt-2 py-2 px-3 rounded-xl bg-emerald-600/10 hover:bg-emerald-600 text-emerald-700 dark:text-emerald-300 hover:text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 border border-emerald-500/20"
                                        >
                                          <Play className="w-3.5 h-3.5" />
                                          <span>متابعة الدراسة (الانتقال لآخر مجلس مفتوح) 🚀</span>
                                        </button>
                                      ) : (
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleSelectCourse(course, false);
                                          }}
                                          className="w-full mt-2 py-2 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 text-xs font-bold transition-all flex items-center justify-center gap-1.5 border border-amber-500/20"
                                        >
                                          <Lock className="w-3.5 h-3.5" />
                                          <span>مقفل حتى إتمام «{prereq?.title || 'المستوى السابق'}»</span>
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

                  // العرض العام للمسارات والدورات في المستوى الأعلى
                  return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {topLevelCourses.map(course => {
                        const isMaster = isMasterCourse(course);
                        const isStandalone = isStandaloneCourse(course);
                        const childLevels = isMaster ? getChildCourses(course.id, courses) : [];
                        const masterProgress = isMaster 
                          ? getMasterCourseProgress(course.id, courses, books, courseLectures, progresses, questions)
                          : null;

                        const progress = getCourseProgress(course.id);
                        const isComplete = isMaster 
                          ? masterProgress?.allPassed 
                          : isCoursePassedAndComplete(course.id);
                        const isSelected = selectedCourse?.id === course.id;
                        const isUnlocked = isCourseUnlocked(course, courses, books, courseLectures, progresses, questions);
                        const prereq = getPrerequisiteCourse(course, courses);

                        return (
                          <div 
                            key={course.id}
                            className={`p-5 rounded-2xl border transition-all relative overflow-hidden group ${
                              isMaster
                                ? 'bg-gradient-to-br from-emerald-950/10 via-white to-teal-950/5 dark:from-emerald-950/30 dark:via-slate-900 dark:to-teal-950/20 border-emerald-500/40 hover:border-emerald-500 shadow-md cursor-pointer'
                                : !isUnlocked
                                  ? 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 opacity-90'
                                  : isSelected 
                                    ? 'bg-emerald-50/20 dark:bg-emerald-950/10 border-emerald-500/80 dark:border-emerald-600/60 shadow-xs cursor-pointer' 
                                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-emerald-500/40 cursor-pointer'
                            }`}
                            onClick={() => {
                              handleSelectCourse(course, false);
                            }}
                          >
                            <div className="flex items-start gap-4">
                              <div className="relative shrink-0">
                                <CoverImage
                                  src={course.imageUrl}
                                  alt={course.title}
                                  type="course"
                                  className={`w-16 h-16 rounded-xl object-cover border border-slate-100 dark:border-slate-800 transition-transform ${isUnlocked ? 'group-hover:scale-105' : 'grayscale-50'}`}
                                />
                                {!isUnlocked && (
                                  <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[1px] rounded-xl flex items-center justify-center text-amber-300">
                                    <Lock className="w-6 h-6" />
                                  </div>
                                )}
                                {isMaster && (
                                  <div className="absolute -bottom-1 -right-1 bg-emerald-600 text-white p-1 rounded-lg shadow-xs">
                                    <Layers className="w-3.5 h-3.5" />
                                  </div>
                                )}
                              </div>
                              <div className="space-y-1.5 flex-1">
                                <div className="flex items-center justify-between flex-wrap gap-1">
                                  {isMaster ? (
                                    <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded-md font-bold flex items-center gap-1 shadow-xs">
                                      <Layers className="w-3 h-3" /> دورة رئيسية جامعة
                                    </span>
                                  ) : isStandalone ? (
                                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-700 dark:text-purple-300 font-bold border border-purple-200/50 flex items-center gap-1">
                                      <Sparkles className="w-3 h-3 text-purple-500" /> دورة قصيرة مستقلة
                                    </span>
                                  ) : (
                                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold">
                                      مقرر متسلسل
                                    </span>
                                  )}

                                  {!isUnlocked && (
                                    <span className="text-[10px] bg-amber-500/15 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-md font-bold flex items-center gap-1 border border-amber-500/30">
                                      <Lock className="w-3 h-3 text-amber-500" /> مقفلة
                                    </span>
                                  )}

                                  {isComplete && (
                                    <span className="text-[10px] bg-amber-500 text-slate-950 px-2 py-0.5 rounded-md font-black flex items-center gap-1">
                                      <Award className="w-3 h-3 fill-slate-950" /> مكتمل ومجاز
                                    </span>
                                  )}
                                </div>
                                <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100 font-serif leading-snug">{course.title}</h4>
                                <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">{course.description}</p>
                                
                                {isMaster && (
                                  <div className="mt-2 text-[10px] text-emerald-700 dark:text-emerald-400 font-bold">
                                    تضم {childLevels.length} مستويات دراسية متسلسلة
                                  </div>
                                )}

                                {!isUnlocked && prereq && !isMaster && (
                                  <p className="text-[10px] text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 px-2 py-1 rounded-md border border-amber-200/40">
                                    🔒 تفتح بعد إتمام جميع كتب واختبارات دورة: «{prereq.title}»
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* مؤشر التقدم وزر الانتقال الفوري لآخر مجلس مفتوح */}
                            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/80 space-y-2">
                              <div className="flex justify-between text-[11px] text-slate-500 font-bold">
                                <span>{isMaster ? 'نسبة إنجاز المسار:' : 'نسبة التحصيل في الدورة:'}</span>
                                <span className="font-mono text-emerald-600">
                                  {isMaster ? `${masterProgress?.percentage || 0}%` : `${progress}%`}
                                </span>
                              </div>
                              <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                                <div 
                                  className="h-full bg-emerald-600 rounded-full transition-all"
                                  style={{ width: `${isMaster ? (masterProgress?.percentage || 0) : progress}%` }}
                                />
                              </div>

                              {isMaster ? (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setDashboardMasterCourseId(course.id);
                                  }}
                                  className="w-full mt-2 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm"
                                >
                                  <Layers className="w-3.5 h-3.5" />
                                  <span>استعراض مستويات الدورة العلمية 📂</span>
                                </button>
                              ) : isUnlocked ? (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSelectCourse(course, true);
                                  }}
                                  className="w-full mt-2 py-2 px-3 rounded-xl bg-emerald-600/10 hover:bg-emerald-600 text-emerald-700 dark:text-emerald-300 hover:text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 border border-emerald-500/20"
                                >
                                  <Play className="w-3.5 h-3.5" />
                                  <span>متابعة الدراسة (الانتقال لآخر مجلس مفتوح) 🚀</span>
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSelectCourse(course, false);
                                  }}
                                  className="w-full mt-2 py-2 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 text-xs font-bold transition-all flex items-center justify-center gap-1.5 border border-amber-500/20"
                                >
                                  <Lock className="w-3.5 h-3.5" />
                                  <span>مقفلة حتى إتمام «{prereq?.title || 'الدورة السابقة'}»</span>
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
                </div>
              </div>

              {/* قسم عرض كتب الدورة المختارة مع القفل التسلسلي المنهجي */}
              {selectedCourse && (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-2xs animate-fade-in">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800/80">
                    <div>
                      <h3 className="font-bold text-base font-serif text-slate-800 dark:text-slate-200">
                        مقررات الكتب في <span className="text-emerald-600">«{selectedCourse.title}»</span>
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">تُفتح الكتب بالتسلسل؛ يُفتح كل كتاب بعد إتمام واجتياز آخر محاضرة من الكتاب الذي قبله</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {sortCourseBooks(books.filter(b => b.courseId === selectedCourse.id)).map((book, bIdx) => {
                      const cBooks = sortCourseBooks(books.filter(b => b.courseId === selectedCourse.id));
                      const isUnlocked = isBookUnlocked(book, cBooks, courseLectures, progresses, questions);
                      const isComplete = isBookCompleted(book.id, courseLectures, progresses, questions);
                      const prevBook = getPreviousBook(book, cBooks);
                      const progress = getBookProgress(book.id);
                      const isSelected = selectedBook?.id === book.id;

                      return (
                        <div 
                          key={book.id}
                          onClick={() => {
                            handleSelectBook(book, isUnlocked);
                          }}
                          className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                            isSelected 
                              ? 'bg-teal-50/10 dark:bg-slate-800 border-teal-500/80 dark:border-teal-600/60 shadow-xs' 
                              : !isUnlocked
                              ? 'bg-slate-100/50 dark:bg-slate-950/40 border-slate-200/50 dark:border-slate-800/50 opacity-75 hover:border-amber-400'
                              : 'bg-slate-50/60 dark:bg-slate-950/20 border-slate-200/80 dark:border-slate-800/80 hover:border-teal-400'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <CoverImage
                              src={book.imageUrl}
                              alt={book.title}
                              type="book"
                              className="w-12 h-16 rounded-lg object-cover shrink-0 border border-slate-200 dark:border-slate-700 shadow-2xs"
                            />
                            <div className="space-y-1.5 flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-1.5 flex-wrap">
                                <span className="text-[10px] text-slate-400 font-bold font-mono">الكتاب #{bIdx + 1}</span>
                                {isComplete ? (
                                  <span className="text-[10px] bg-amber-500/10 text-amber-600 px-2 py-0.5 rounded-md font-bold flex items-center gap-0.5 border border-amber-500/20">
                                    <Award className="w-3 h-3" /> تم الاجتياز ✓
                                  </span>
                                ) : !isUnlocked ? (
                                  <span className="text-[10px] bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-md font-bold flex items-center gap-1 border border-slate-300/40">
                                    <Lock className="w-3 h-3 text-amber-500" /> مقفل 🔒
                                  </span>
                                ) : (
                                  <span className="text-[10px] bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded-md font-bold flex items-center gap-1 border border-emerald-500/20">
                                    <Unlock className="w-3 h-3 text-emerald-600" /> مفتوح
                                  </span>
                                )}
                              </div>
                              <h4 className="font-bold text-xs text-slate-800 dark:text-slate-100 leading-snug">{book.title}</h4>
                              <p className="text-[10px] text-slate-400 font-mono">تضم {courseLectures.filter(l => l.bookId === book.id).length} محاضرات علمية</p>
                              {!isUnlocked && prevBook && (
                                <p className="text-[10px] text-amber-600 dark:text-amber-400 font-serif leading-tight">
                                  🔒 مقفل حتى إتمام كتاب «{prevBook.title}»
                                </p>
                              )}
                            </div>
                          </div>

                          {/* مؤشر تقدم دراسة الكتاب */}
                          <div className="space-y-1 mt-2">
                            <div className="flex justify-between text-[10px] text-slate-400 font-bold">
                              <span>إنجاز المقررات:</span>
                              <span className="font-mono text-emerald-600">{progress}%</span>
                            </div>
                            <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                              <div 
                                className="h-full bg-teal-600 rounded-full transition-all"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                          </div>

                          {/* زر طباعة الشهادة إذا كان منتهياً أو زر المتابعة */}
                          {isComplete ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveCertificate({ book });
                              }}
                              className="mt-2 py-2 w-full rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 text-xs font-black shadow-xs flex items-center justify-center gap-1.5 transition-all active:scale-95"
                            >
                              <Award className="w-3.5 h-3.5" />
                              <span>تحميل شهادة إتمام المنهجية 🎓</span>
                            </button>
                          ) : isUnlocked ? (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectBook(book, true);
                              }}
                              className="mt-2 py-2 w-full rounded-xl bg-emerald-600/10 hover:bg-emerald-600 text-emerald-700 dark:text-emerald-300 hover:text-white text-[11px] font-bold border border-emerald-500/20 flex items-center justify-center gap-1.5 transition-all"
                            >
                              <Play className="w-3 h-3" />
                              <span>بدء من آخر مجلس مفتوح 🎧</span>
                            </button>
                          ) : (
                            <div className="mt-2 py-2 w-full rounded-xl bg-slate-100 dark:bg-slate-800/60 text-slate-400 text-[11px] font-bold flex items-center justify-center gap-1.5 cursor-not-allowed border border-dashed border-slate-300 dark:border-slate-700">
                              <Lock className="w-3 h-3 text-amber-500" />
                              <span>مقفل حتى إتمام الكتاب السابق</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ======================= التبويب الثالث: مجالس الدروس ======================= */}
          {activeTab === 'lectures' && (
            <div className="space-y-6 print:hidden">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                
                {/* العمود الأيمن: شجرة الدروس والمحاضرات للكتاب المحدد */}
                <div className="lg:col-span-1 space-y-4">
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-3xl shadow-2xs">
                    <h3 className="font-bold text-sm font-serif mb-3 pb-2 border-b border-slate-100 dark:border-slate-800/80">شجرة مجالس الدروس</h3>
                    
                    {/* اختيار الدورة أولاً */}
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-1">المقرر الشرعي الأول:</label>
                        <select
                          className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-hidden"
                          value={selectedCourse?.id || ''}
                          onChange={(e) => {
                            const found = courses.find(c => c.id === e.target.value);
                            if (found) {
                              handleSelectCourse(found, false);
                            } else {
                              setSelectedCourse(null);
                              setSelectedBook(null);
                              setActiveLecture(null);
                            }
                          }}
                        >
                          <option value="">-- اختاري الدورة --</option>
                          {courses.map(c => {
                            const isMaster = isMasterCourse(c);
                            const isUnlocked = isCourseUnlocked(c, courses, books, courseLectures, progresses, questions);
                            const isStandalone = isStandaloneCourse(c);
                            const parentCourse = c.parentCourseId ? courses.find(p => p.id === c.parentCourseId) : null;
                            const prefix = isMaster ? '🏛️ [مسار علمي جامع] ' : parentCourse ? `   ↳ [مستوى] ` : isStandalone ? '🌱 [دورة مستقلة] ' : '';
                            const suffix = parentCourse ? ` (ضمن: ${parentCourse.title})` : '';
                            const lockTag = !isUnlocked ? ' [🔒 مقفلة]' : '';
                            return (
                              <option key={c.id} value={c.id} disabled={!isUnlocked}>
                                {prefix}{c.title}{suffix}{lockTag}
                              </option>
                            );
                          })}
                        </select>
                      </div>

                      {/* اختيار الكتاب ثانياً */}
                      {selectedCourse && (
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 mb-1">الكتاب المقرر:</label>
                          <select
                            className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-hidden"
                            value={selectedBook?.id || ''}
                            onChange={(e) => {
                              const found = books.find(b => b.id === e.target.value);
                              if (found) {
                                handleSelectBook(found, false);
                              } else {
                                setSelectedBook(null);
                                setActiveLecture(null);
                              }
                            }}
                          >
                            <option value="">-- اختاري الكتاب --</option>
                            {sortCourseBooks(books.filter(b => b.courseId === selectedCourse.id)).map(b => {
                              const cBooks = sortCourseBooks(books.filter(bookItem => bookItem.courseId === selectedCourse.id));
                              const unlocked = isBookUnlocked(b, cBooks, courseLectures, progresses, questions);
                              const completed = isBookCompleted(b.id, courseLectures, progresses, questions);
                              return (
                                <option key={b.id} value={b.id} disabled={!unlocked}>
                                  {b.title} {!unlocked ? '🔒 (مقفل)' : completed ? '✓ (مكتمل)' : ''}
                                </option>
                              );
                            })}
                          </select>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* قائمة الدروس المندرجة تحت الكتاب */}
                  {selectedBook && (
                    <div className="space-y-4">
                      {/* بطاقة الكتاب الخاصة مع صورة الغلاف وملف PDF إن وُجد */}
                      {selectedBook && (
                        <div className="p-5 rounded-2xl bg-gradient-to-br from-rose-50/70 to-rose-100/30 dark:from-slate-900/90 dark:to-slate-900/40 border border-rose-100/80 dark:border-slate-800/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                          <div className="flex items-center gap-3.5">
                            <CoverImage
                              src={selectedBook.imageUrl}
                              alt={selectedBook.title}
                              type="book"
                              className="w-14 h-20 rounded-xl object-cover shrink-0 border border-slate-200 dark:border-slate-700 shadow-sm"
                            />
                            <div className="text-right">
                              <h4 className="font-extrabold text-sm md:text-base text-slate-950 dark:text-white leading-snug">
                                {selectedBook.title}
                              </h4>
                              <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-slate-500 font-mono">
                                {selectedBook.pdfUrl ? (
                                  <span className="bg-red-50 dark:bg-rose-950/20 text-red-700 dark:text-rose-400 px-2 py-0.5 rounded-md font-bold text-[10px]">كتاب مقرر PDF</span>
                                ) : (
                                  <span className="bg-slate-200/60 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-md font-bold text-[10px]">كتاب مقرر</span>
                                )}
                                {selectedBook.pdfSize && (
                                  <span className="bg-slate-200/50 dark:bg-slate-800/80 px-2 py-0.5 rounded-md text-[10px] text-slate-600 dark:text-slate-400">📦 {selectedBook.pdfSize}</span>
                                )}
                                {selectedBook.pdfPageCount && (
                                  <span className="bg-slate-200/50 dark:bg-slate-800/80 px-2 py-0.5 rounded-md text-[10px] text-slate-600 dark:text-slate-400">📄 {selectedBook.pdfPageCount} صفحة</span>
                                )}
                              </div>
                            </div>
                          </div>

                          {selectedBook.pdfUrl && (
                            <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
                              <a
                                href={selectedBook.pdfUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-sm transition-all hover:scale-[1.01]"
                              >
                                <BookOpen className="w-4 h-4" />
                                <span>فتح وقراءة الكتاب 📖</span>
                              </a>

                              <button
                                onClick={() => handleDownloadFile(selectedBook.pdfUrl!, `${selectedBook.title || 'book'}.pdf`)}
                                className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-900/20 border border-rose-200/50 dark:border-rose-900/40 text-rose-600 dark:text-rose-400 rounded-xl text-xs font-bold transition-all hover:scale-[1.01]"
                              >
                                <Download className="w-4 h-4" />
                                <span>تحميل الكتاب</span>
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-3xl shadow-2xs">
                        <div className="text-xs font-bold text-slate-500 mb-3 flex justify-between items-center">
                          <span>المحاضرات والشروحات ({activeBookLectures.length})</span>
                        <span className="font-mono text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-emerald-600">
                          {activeBookLectures.filter(l => progresses.find(p => p.lectureId === l.id)?.isLectureFinished).length} منجز
                        </span>
                      </div>

                      <div className="space-y-2 max-h-[400px] overflow-y-auto">
                        {activeBookLectures.length === 0 ? (
                          <div className="text-center py-6 text-xs text-slate-400 italic">لا توجد محاضرات مدرجة حالياً.</div>
                        ) : (
                          activeBookLectures.map((lec, idx) => {
                            const isUnlocked = checkLectureUnlocked(lec, activeBookLectures);
                            const progress = progresses.find(p => p.lectureId === lec.id);
                            const isPassed = progress?.isPassed;
                            const isSelected = activeLecture?.id === lec.id;

                            return (
                              <button
                                key={lec.id}
                                onClick={() => {
                                  if (!isUnlocked) {
                                    showWarning(
                                      "المجلس مقفل 🔒",
                                      "يلزم اجتياز اختبار المحاضرة السابقة بنجاح (بنسبة 60% فما فوق) لفتح هذا المجلس العلمي."
                                    );
                                    return;
                                  }
                                  setActiveLecture(lec);
                                  setQuizAnswers({});
                                  setQuizSubmitted(false);
                                }}
                                className={`w-full text-right p-3 rounded-xl border text-xs font-bold transition-all flex items-start gap-2 ${
                                  isSelected
                                    ? 'bg-emerald-600 text-white border-emerald-500 shadow-xs'
                                    : !isUnlocked
                                    ? 'bg-slate-100/50 dark:bg-slate-950/20 text-slate-400 border-slate-100 dark:border-slate-900 cursor-not-allowed opacity-60'
                                    : (progress?.isLectureFinished && (questions.filter(q => q.lectureId === lec.id).length > 0 ? !!progress.isPassed : true))
                                    ? 'bg-emerald-50/40 dark:bg-emerald-950/5 text-slate-800 dark:text-slate-200 border-emerald-500/20'
                                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-emerald-300'
                                }`}
                              >
                                <div className="mt-0.5 shrink-0">
                                  {!isUnlocked ? (
                                    <Lock className="w-3.5 h-3.5" />
                                  ) : (progress?.isLectureFinished && (questions.filter(q => q.lectureId === lec.id).length > 0 ? !!progress.isPassed : true)) ? (
                                    <CheckCircle2 className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-emerald-600'}`} />
                                  ) : (
                                    <Play className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                                  )}
                                </div>
                                <div className="space-y-0.5 flex-1 min-w-0">
                                  <p className="truncate leading-tight font-serif">{idx + 1}. {lec.title}</p>
                                  <div className="flex items-center gap-1.5 text-[9px] font-normal text-slate-400">
                                    {lec.duration && <span>⏱️ {lec.duration}</span>}
                                    {isPassed && <span className="text-amber-500 font-extrabold">• مجاز ({progress.bestScore}%)</span>}
                                  </div>
                                </div>
                              </button>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </div>
                  )}
                </div>

                {/* العمود الأيسر: شاشة مجلس المحاضرة واختبارها (أهم متطلبات المستخدم!) */}
                <div className="lg:col-span-3">
                  {!activeLecture ? (
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center h-full flex flex-col items-center justify-center space-y-4 shadow-2xs">
                      <div className="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-slate-800/60 text-slate-400 dark:text-slate-500 flex items-center justify-center mb-2">
                        <BookOpen className="w-8 h-8" />
                      </div>
                      <h3 className="font-bold text-lg font-serif">شاشة مجالس التحصيل والمدارسة</h3>
                      <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                        الرجاء تحديد المقرر الشرعي، والكتاب، والمجلس العلمي المطلوب من القائمة الجانبية لبدء استماع الشرح الصوتي وتلخيص الدروس وحل اختبارات التحصيل.
                      </p>
                    </div>
                  ) : (
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-2xs space-y-6 animate-fade-in">
                      
                      {selectedBook && (
                        <StudyWorkspace
                          lecture={activeLecture}
                          book={selectedBook}
                          progress={progresses.find(p => p.lectureId === activeLecture.id)}
                          onSaveProgress={handleWorkspaceSaveProgress}
                          onGoToQuiz={handleGoToQuiz}
                          hasQuiz={questions.filter(q => q.lectureId === activeLecture.id).length > 0}
                          isPassed={progresses.find(p => p.lectureId === activeLecture.id)?.isPassed || false}
                        />
                      )}

                      {/* ظهور اختبار قياس التحصيل مباشرة دون شرط سماع المحاضرة */}
                      {activeLecture && (
                        <div ref={quizSectionRef} className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-800 space-y-6">
                          <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                            <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-600">
                              <Award className="w-5 h-5" />
                            </div>
                            <div>
                              <h3 className="text-base font-black font-serif">اختبار قياس تحصيل المجلس العلمي</h3>
                              <p className="text-[11px] text-slate-500">أجيبي بتركيز وإخلاص على الأسئلة لقياس استيعابك للشروحات (نسبة النجاح المطلوبة 60%).</p>
                            </div>
                          </div>

                          {/* بطاقة عرض درجة الاختبار القديم وزر إعادة الاختبار إن وُجدت محاولة سابقة */}
                          {(() => {
                            const prevProg = progresses.find(p => p.lectureId === activeLecture.id);
                            if (!prevProg || (prevProg.attemptsCount <= 0 && prevProg.lastScore === undefined)) return null;
                            return (
                              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex flex-col sm:flex-row items-center justify-between gap-3 animate-fade-in">
                                <div className="flex items-center gap-3">
                                  <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 shrink-0">
                                    <Award className="w-5 h-5" />
                                  </div>
                                  <div>
                                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200 flex flex-wrap items-center gap-2">
                                      <span>درجة الاختبار القديم:</span>
                                      <span className={`font-mono text-sm font-black ${prevProg.isPassed ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                                        {prevProg.lastScore}%
                                      </span>
                                      {prevProg.isPassed ? (
                                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-extrabold">ناجح ومجتاز ✓</span>
                                      ) : (
                                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-extrabold">لم يتم الاجتياز (المطلوب 60% فما فوق)</span>
                                      )}
                                    </div>
                                    <p className="text-[10px] text-slate-500 mt-0.5">
                                      عدد المحاولات السابقة: {prevProg.attemptsCount} | أعلى درجة: {prevProg.bestScore}%
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1.5 text-xs font-extrabold text-amber-700 dark:text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-xl shrink-0">
                                  <RotateCcw className="w-3.5 h-3.5" />
                                  <span>متاح لكِ إعادة الاختبار في أي وقت لتحسين درجاتكِ</span>
                                </div>
                              </div>
                            );
                          })()}

                          {questions.filter(q => q.lectureId === activeLecture.id).length === 0 ? (
                            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 text-center text-xs text-slate-500 font-serif">
                              ✨ لا يوجد اختبار مخصص لهذه المحاضرة حالياً. تم اعتبار المحاضرة مكتملة ومجتازة تلقائياً لمتابعة الدرس اللاحق!
                            </div>
                          ) : (
                            <div className="space-y-6">
                              {questions.filter(q => q.lectureId === activeLecture.id).map((q, qidx) => {
                                const userAns = quizAnswers[q.id] || '';
                                const isCorrect = q.type === 'short_answer'
                                  ? userAns.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase()
                                  : userAns === q.correctAnswer;

                                return (
                                  <div key={q.id} className="p-5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl space-y-3.5">
                                    <div className="flex justify-between items-start gap-3">
                                      <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100 flex gap-1.5 leading-relaxed">
                                        <span className="text-slate-400 font-mono font-bold">{qidx + 1}.</span>
                                        <span>{q.question}</span>
                                      </h4>
                                      <span className="text-[9px] font-bold text-slate-400 bg-white dark:bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-200/50">
                                        {q.points} نقاط
                                      </span>
                                    </div>

                                    {/* عرض الخيارات للأسئلة متعددة الخيارات */}
                                    {q.type === 'multiple_choice' && q.options && (
                                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                                        {q.options.map(opt => {
                                          const isSelected = userAns === opt;
                                          return (
                                            <button
                                              key={opt}
                                              disabled={quizSubmitted}
                                              onClick={() => setQuizAnswers({ ...quizAnswers, [q.id]: opt })}
                                              className={`p-3 text-xs text-right rounded-xl font-bold border transition-all flex items-center justify-between gap-2 ${
                                                isSelected
                                                  ? 'bg-amber-500/10 border-amber-500 text-amber-700 dark:text-amber-400'
                                                  : 'bg-white dark:bg-slate-900 border-slate-200 hover:border-amber-300 text-slate-700 dark:text-slate-300'
                                              }`}
                                            >
                                              <span>{opt}</span>
                                              {quizSubmitted && opt === q.correctAnswer && <Check className="w-4 h-4 text-emerald-600 shrink-0" />}
                                              {quizSubmitted && isSelected && !isCorrect && <X className="w-4 h-4 text-rose-600 shrink-0" />}
                                            </button>
                                          );
                                        })}
                                      </div>
                                    )}

                                    {/* عرض الخيارات لصح أم خطأ */}
                                    {q.type === 'true_false' && (
                                      <div className="flex gap-3">
                                        {[
                                          { label: 'صحيح', val: 'true' },
                                          { label: 'خطأ', val: 'false' }
                                        ].map(tfItem => {
                                          const isSelected = userAns === tfItem.val;
                                          return (
                                            <button
                                              key={tfItem.val}
                                              disabled={quizSubmitted}
                                              onClick={() => setQuizAnswers({ ...quizAnswers, [q.id]: tfItem.val })}
                                              className={`px-6 py-2.5 text-xs font-bold rounded-xl border transition-all flex items-center gap-1.5 ${
                                                isSelected
                                                  ? 'bg-amber-500/10 border-amber-500 text-amber-700 dark:text-amber-400'
                                                  : 'bg-white dark:bg-slate-900 border-slate-200 hover:border-amber-300 text-slate-700'
                                              }`}
                                            >
                                              <span>{tfItem.label}</span>
                                              {quizSubmitted && tfItem.val === q.correctAnswer && <Check className="w-4 h-4 text-emerald-600 shrink-0" />}
                                              {quizSubmitted && isSelected && !isCorrect && <X className="w-4 h-4 text-rose-600 shrink-0" />}
                                            </button>
                                          );
                                        })}
                                      </div>
                                    )}

                                    {/* حقل الإجابة القصيرة */}
                                    {q.type === 'short_answer' && (
                                      <div className="space-y-1.5">
                                        <input
                                          type="text"
                                          disabled={quizSubmitted}
                                          value={userAns}
                                          onChange={e => setQuizAnswers({ ...quizAnswers, [q.id]: e.target.value })}
                                          placeholder="اكتبي إجابتكِ الفقهية المختصرة هنا..."
                                          className="w-full text-xs p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-hidden"
                                        />
                                        {quizSubmitted && (
                                          <p className="text-[10px] font-bold text-slate-500 flex items-center gap-1 mt-1">
                                            {isCorrect ? (
                                              <span className="text-emerald-600">✓ إجابة صحيحة!</span>
                                            ) : (
                                              <span className="text-rose-600">✗ إجابة غير دقيقة. الإجابة الصحيحة هي: {q.correctAnswer}</span>
                                            )}
                                          </p>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}

                              {/* زر التسليم الفوري وتصحيح الاختبار */}
                              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                                {quizSubmitted ? (
                                  <div className="flex flex-col sm:flex-row items-center gap-3 w-full justify-between">
                                    <div className="text-xs text-slate-500 font-bold">
                                      {progresses.find(p => p.lectureId === activeLecture.id)?.isPassed ? (
                                        <span className="text-emerald-600">✓ مبارك! لقد تم تجاوز هذا الاختبار بنجاح تام!</span>
                                      ) : (
                                        <span className="text-rose-600">لم يتم اجتياز الاختبار بنسبة 60%، نوصيكِ بإعادة المحاولة.</span>
                                      )}
                                    </div>
                                    <button
                                      onClick={() => {
                                        setQuizAnswers({});
                                        setQuizSubmitted(false);
                                      }}
                                      className="px-6 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-600 transition-colors shadow-xs"
                                    >
                                      إعادة محاولة الاختبار 🔁
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => handleQuizSubmit(activeLecture)}
                                    className={`w-full sm:w-auto text-white font-black px-8 py-3 rounded-xl text-xs shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 ${
                                      progresses.some(p => p.lectureId === activeLecture.id && (p.attemptsCount > 0 || p.lastScore !== undefined))
                                        ? 'bg-amber-600 hover:bg-amber-700'
                                        : 'bg-emerald-600 hover:bg-emerald-700'
                                    }`}
                                  >
                                    {progresses.some(p => p.lectureId === activeLecture.id && (p.attemptsCount > 0 || p.lastScore !== undefined)) ? (
                                      <>
                                        <RotateCcw className="w-4 h-4" />
                                        <span>إعادة تسليم وتصحيح الاختبار</span>
                                      </>
                                    ) : (
                                      <>
                                        <Award className="w-4 h-4" />
                                        <span>تسليم وتصحيح الاختبار الفوري</span>
                                      </>
                                    )}
                                  </button>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ======================= التبويب الرابع: سجل الاختبارات ======================= */}
          {activeTab === 'exams' && (
            <div className="space-y-6 print:hidden">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-2xs">
                <h3 className="font-bold text-lg font-serif mb-1 flex items-center gap-2">
                  <Award className="w-5 h-5 text-emerald-600" />
                  <span>سجل اختبارات التحصيل ودرجات الطالب/ة</span>
                </h3>
                <p className="text-xs text-slate-500 mb-6">رصد لجميع المحاولات والدرجات في اختبارات مجالس الدروس العلمية المنهجية.</p>

                {progresses.filter(p => p.attemptsCount > 0).length === 0 ? (
                  <div className="text-center py-12 text-xs text-slate-400 italic">لا توجد اختبارات مسجلة في ملفك حتى الآن. أتم/أتمي دروسك وقدّم/ي الاختبارات ليتم رصدها هنا!</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-right border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold">
                          <th className="pb-3 text-slate-500 font-serif">المجلس العلمي (المحاضرة)</th>
                          <th className="pb-3 text-slate-500">عدد المحاولات</th>
                          <th className="pb-3 text-slate-500">آخر درجة أحرزت</th>
                          <th className="pb-3 text-slate-500">أفضل درجة</th>
                          <th className="pb-3 text-slate-500 text-center">حالة الاجتياز</th>
                          <th className="pb-3 text-slate-500 font-mono">آخر محاولة</th>
                          <th className="pb-3 text-slate-500 text-center">الإجراء</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                        {progresses.filter(p => p.attemptsCount > 0).map(p => {
                          const lec = courseLectures.find(l => l.id === p.lectureId);
                          return (
                            <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                              <td className="py-4 font-bold text-slate-800 dark:text-slate-100 max-w-xs truncate font-serif">{lec?.title || 'محاضرة شرعية'}</td>
                              <td className="py-4 font-mono font-bold text-slate-700 dark:text-slate-200">{p.attemptsCount} محاولات</td>
                              <td className="py-4 font-mono font-bold text-slate-700 dark:text-slate-200">{p.lastScore}%</td>
                              <td className="py-4 font-mono font-black text-emerald-600">{p.bestScore}%</td>
                              <td className="py-4 text-center">
                                {p.isPassed ? (
                                  <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 px-2.5 py-0.5 rounded-md font-bold border border-emerald-100">
                                    <Check className="w-3.5 h-3.5" /> مجتاز بنجاح
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-[10px] bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 px-2.5 py-0.5 rounded-md font-bold border border-rose-100">
                                    <X className="w-3.5 h-3.5" /> لم يجتز بعد
                                  </span>
                                )}
                              </td>
                              <td className="py-4 font-mono text-slate-400">{new Date(p.lastAttemptDate).toLocaleString('ar-SA')}</td>
                              <td className="py-4 text-center">
                                <button
                                  onClick={() => {
                                    // الانتقال الفوري لمجلس الدرس ومتابعة المذاكرة
                                    const lecItem = courseLectures.find(l => l.id === p.lectureId);
                                    const bookItem = books.find(b => b.id === lecItem?.bookId);
                                    const courseItem = courses.find(c => c.id === lecItem?.courseId);
                                    if (lecItem && bookItem && courseItem) {
                                      setSelectedCourse(courseItem);
                                      setSelectedBook(bookItem);
                                      setActiveLecture(lecItem);
                                      setActiveTab('lectures');
                                    }
                                  }}
                                  className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold hover:text-emerald-600"
                                >
                                  فتح قاعة الدرس 📖
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ======================= التبويب الخامس: صندوق الشهادات ======================= */}
          {activeTab === 'certificates' && (
            <div className="space-y-6 print:hidden">
              {/* القسم الأول: الشهادات الرسمية المعتمدة */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-2xs">
                <h3 className="font-bold text-lg font-serif mb-1 flex items-center gap-2 text-slate-900 dark:text-white">
                  <Award className="w-5 h-5 text-amber-500 animate-pulse fill-amber-500/20" />
                  <span>صندوق الشهادات الرسمية المعتمدة</span>
                  <span className="bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs px-2 py-0.5 rounded-full font-bold">
                    {studentCertificates.length} معتمدة
                  </span>
                </h3>
                <p className="text-xs text-slate-500 mb-6">
                  هنا تظهر شهاداتك الشرعية المعتمدة من قبل إدارة الملتقى بعد مراجعة صياغتها واعتمادها من المشرف/ة.
                </p>

                {studentCertificates.length === 0 ? (
                  <div className="p-8 rounded-2xl bg-slate-50 dark:bg-slate-800/40 text-center text-xs text-slate-400 italic border border-dashed border-slate-200 dark:border-slate-800">
                    لم يصدر لك أي شهادة رسمية بعد. تفقد/ي القسم بالأسفل لمشاهدة كتبك المكتملة بانتظار الاعتماد.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {studentCertificates.map(cert => (
                      <div 
                        key={cert.id} 
                        className="p-5 rounded-3xl border border-amber-500/30 bg-gradient-to-br from-amber-500/5 to-transparent text-right space-y-4 shadow-xs relative overflow-hidden"
                      >
                        <div className="absolute -top-3 -left-3 w-16 h-16 bg-amber-500/10 rounded-full blur-xl" />
                        
                        <div className="flex items-center gap-2">
                          <div className="p-2 bg-amber-500/10 text-amber-600 rounded-xl">
                            <Award className="w-5 h-5 fill-amber-500/20" />
                          </div>
                          <div>
                            <span className="text-[10px] text-amber-600 font-bold font-mono">رقم الشهادة: {cert.certificateNumber}</span>
                            <h4 className="font-serif font-black text-sm text-slate-900 dark:text-slate-100 mt-0.5">{cert.bookName}</h4>
                          </div>
                        </div>

                        <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1 bg-slate-100/50 dark:bg-slate-800/50 p-3 rounded-2xl font-sans">
                          <p>الدورة: <strong className="text-slate-700 dark:text-slate-300">{cert.courseName}</strong></p>
                          <p>تاريخ الاعتماد: <strong className="font-mono text-emerald-700 dark:text-emerald-400">{cert.date}</strong></p>
                          <p className="text-[10px]">الجهة المصدرة: <strong className="text-slate-600 dark:text-slate-400">{cert.issuedBy}</strong></p>
                        </div>

                        <div className="space-y-2 pt-2">
                          <button
                            onClick={() => setActiveCertificate(cert)}
                            className="w-full py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white text-xs font-black shadow-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                          >
                            <Award className="w-3.5 h-3.5" />
                            <span>عرض الشهادة التفاعلية 🎓</span>
                          </button>
                          
                          <div className="grid grid-cols-3 gap-2">
                            <button
                              onClick={() => {
                                setActiveCertificate(cert);
                                setTimeout(() => window.print(), 300);
                              }}
                              className="py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px] font-bold flex items-center justify-center gap-1 transition-all"
                              title="طباعة الشهادة"
                            >
                              <Printer className="w-3.5 h-3.5" />
                              <span>طباعة</span>
                            </button>
                            <button
                              onClick={() => downloadCertificatePDF(cert)}
                              className="py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px] font-bold flex items-center justify-center gap-1 transition-all"
                              title="تحميل PDF"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>PDF</span>
                            </button>
                            <button
                              onClick={() => saveCertificateAsImage(cert)}
                              className="py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px] font-bold flex items-center justify-center gap-1 transition-all"
                              title="حفظ كصورة"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>حفظ</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* القسم الثاني: مقررات مكتملة بانتظار المراجعة والاعتماد */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-2xs">
                <h3 className="font-bold text-lg font-serif mb-1 flex items-center gap-2 text-slate-900 dark:text-white">
                  <Clock className="w-5 h-5 text-amber-500 animate-spin" />
                  <span>كتب منجزة قيد المراجعة والاعتماد</span>
                  <span className="bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-xs px-2 py-0.5 rounded-full font-bold">
                    {books.filter(b => isBookPassedAndComplete(b.id) && !studentCertificates.some(c => c.bookName === b.title)).length} قيد المراجعة
                  </span>
                </h3>
                <p className="text-xs text-slate-500 mb-6">
                  تظهر هنا الكتب التي أتممت دراستها واجتزت جميع اختباراتها بنجاح، ولقد تم إرسال طلب اعتمادها تلقائياً للمشرف/ة لمراجعة وتوليد شهادتك المعتمدة.
                </p>

                {books.filter(b => isBookPassedAndComplete(b.id) && !studentCertificates.some(c => c.bookName === b.title)).length === 0 ? (
                  <div className="p-8 rounded-2xl bg-slate-50 dark:bg-slate-800/40 text-center text-xs text-slate-400 italic">
                    لا توجد مقررات مكتملة قيد الانتظار حالياً. بمجرد إكمال دراسة كتاب وحل جميع اختباراته، يظهر طلبه للمشرف/ة تلقائياً وتتلقى/تتلقين إشعاراً عند اعتماده!
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {books.filter(b => isBookPassedAndComplete(b.id) && !studentCertificates.some(c => c.bookName === b.title)).map(book => {
                      const course = courses.find(c => c.id === book.courseId);
                      return (
                        <div key={book.id} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                          <div>
                            <span className="text-[10px] bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-400 px-2 py-0.5 rounded-sm font-bold">
                              قيد المراجعة والاعتماد من المشرف/ة ⏳
                            </span>
                            <h4 className="font-serif font-black text-xs text-slate-900 dark:text-slate-100 mt-2">{book.title}</h4>
                            <p className="text-[10px] text-slate-400 mt-1">الدورة العلمية: {course?.title}</p>
                          </div>
                          
                          <div className="text-xs text-slate-500 dark:text-slate-400 sm:text-left bg-white dark:bg-slate-800 px-3 py-2 rounded-xl border border-slate-100 dark:border-slate-700/60 w-full sm:w-auto">
                            <p className="font-bold text-emerald-600">طلب الاعتماد نشط</p>
                            <p className="text-[10px] text-slate-400">تم إرسال إشعار للمشرف/ة</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* نافذة عرض الشهادة التفاعلية القابلة للطباعة */}
      {activeCertificate && (() => {
        const isDemo = !!(activeCertificate as any).book;
        const studentName = isDemo 
          ? (userProfile?.displayName || userProfile?.name || 'طالب/ة العلم') 
          : activeCertificate.studentName;
        const bookTitle = isDemo 
          ? (activeCertificate as any).book.title 
          : activeCertificate.bookName;
        const courseTitle = isDemo 
          ? (courses.find(c => c.id === (activeCertificate as any).book.courseId)?.title || 'الدورة المنهجية') 
          : activeCertificate.courseName;
        const certNo = isDemo 
          ? `TEMP-${(activeCertificate as any).book.id}` 
          : activeCertificate.certificateNumber;

        return (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4 print:p-0 print:absolute print:inset-0 print:bg-white animate-fade-in">
            <div className="relative bg-white dark:bg-slate-900 text-slate-900 w-full max-w-4xl p-6 md:p-8 rounded-3xl shadow-2xl border border-amber-500/30 print:border-0 print:shadow-none print:m-0 print:p-0">
              
              {/* أزرار تحكم في النافذة (مخفية أثناء الطباعة) */}
              <div className="flex justify-between items-center mb-6 border-b border-slate-100 dark:border-slate-800 pb-3 print:hidden">
                <h3 className="font-serif font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                  <Award className="w-5 h-5 text-amber-500" />
                  <span>معاينة شهادة الإنجاز الشرعية</span>
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => window.print()}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center gap-1 shadow-sm transition-all"
                  >
                    <Printer className="w-4 h-4" />
                    <span>طباعة الشهادة الرسمية</span>
                  </button>
                  <button
                    onClick={() => setActiveCertificate(null)}
                    className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 transition-colors"
                  >
                    إغلاق
                  </button>
                </div>
              </div>

              {/* قالب تصميم الشهادة الفاخر (يتألق أثناء الطباعة) */}
              <div 
                id="certificate-print-area" 
                className="relative p-6 md:p-12 bg-stone-50 border-8 border-amber-600 rounded-2xl text-center shadow-inner overflow-hidden font-serif"
                style={{ minHeight: '520px' }}
              >
                {/* زخارف أركان الشهادة */}
                <div className="absolute top-4 right-4 w-12 h-12 border-t-4 border-r-4 border-amber-600/30 pointer-events-none" />
                <div className="absolute top-4 left-4 w-12 h-12 border-t-4 border-l-4 border-amber-600/30 pointer-events-none" />
                <div className="absolute bottom-4 right-4 w-12 h-12 border-b-4 border-r-4 border-amber-600/30 pointer-events-none" />
                <div className="absolute bottom-4 left-4 w-12 h-12 border-b-4 border-l-4 border-amber-600/30 pointer-events-none" />

                {/* الشعار المائي الداخلي */}
                <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
                  <Award className="w-80 h-80 text-amber-600" />
                </div>

                {/* محتوى الشهادة الفخم */}
                <div className="relative z-10 space-y-6 text-stone-900">
                  <p className="text-sm font-extrabold text-amber-700 tracking-widest uppercase">بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ</p>
                  
                  <h2 className="text-3xl md:text-4xl font-black font-serif text-emerald-800">شهادة إتمام واجتياز منهجية</h2>
                  
                  <p className="text-sm md:text-base leading-relaxed max-w-xl mx-auto italic text-stone-700">
                    «مَن يُرِدِ اللَّهُ بِهِ خَيْرًا يُفَقِّهْهُ فِي الدِّينِ»
                  </p>

                  <div className="space-y-4 py-6">
                    <p className="text-sm md:text-base text-stone-600">
                      يَسُرُّ إدارة ومجلس تحصيل ملتقى <strong className="text-emerald-800 font-black">«طلبة العلم»</strong> أن يشهد بأن الطالب/ة الكريم/ة:
                    </p>
                    
                    <p className="text-2xl md:text-3xl font-black text-amber-600 underline decoration-amber-500/30 underline-offset-8 py-2">
                      {studentName}
                    </p>

                    <p className="text-sm md:text-base text-stone-600 max-w-2xl mx-auto leading-relaxed">
                      قد أتم/ت بنجاح وتفوق، بعون الله وتوفيقه، دراسة واستماع ومجالسة شروحات مقرر كتاب:
                    </p>

                    <p className="text-xl md:text-2xl font-black text-emerald-850 font-serif">
                      « {bookTitle} »
                    </p>

                    <p className="text-sm text-stone-600">
                      ضمن دورة: <strong className="text-stone-800">{courseTitle}</strong>
                    </p>

                    <p className="text-sm text-stone-600 max-w-xl mx-auto">
                      وقام/ت باجتياز جميع اختبارات قياس تحصيل مجالس الدروس بمعدل نجاح متميز، وتم تسجيل واعتماد شهادتها سحابياً.
                    </p>
                  </div>

                  {/* الأختام والتواقيع في الأسفل */}
                  <div className="grid grid-cols-2 gap-8 pt-8 border-t border-amber-600/20 max-w-2xl mx-auto text-xs text-stone-500 font-mono">
                    <div className="space-y-2">
                      <p className="font-bold text-stone-700">توقيع مجلس الملتقى العلمي</p>
                      <p className="italic text-emerald-700 font-serif font-bold">ملتقى طلبة العلم الشرعي</p>
                      <p className="text-[10px] text-stone-400">كُتِب في: {new Date().toLocaleDateString('ar-SA')}</p>
                    </div>
                    <div className="flex flex-col items-center justify-center space-y-1">
                      <div className="w-16 h-16 rounded-full border-4 border-amber-600/30 flex items-center justify-center font-black text-amber-600 text-[10px] uppercase font-serif tracking-tighter">
                        SEAL OF ELM
                      </div>
                      <span className="text-[10px] text-stone-400">الرقم المرجعي: SEC-BOOK-{certNo}</span>
                    </div>
                  </div>

                  <p className="text-[10px] text-stone-400 pt-4">«العلم خير من المال، العلم يحرسك وأنت تحرس المال»</p>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* نافذة عارض الـ PDF التفاعلي الاحترافي */}
      {activePdfView && (
        <div className="fixed inset-0 z-55 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 print:hidden">
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
