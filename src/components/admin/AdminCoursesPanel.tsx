import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, Edit2, Trash2, Eye, EyeOff, ChevronDown, ChevronUp, 
  BookOpen, Video, FileText, Music, MoveUp, MoveDown, Check, X, ShieldAlert, FolderPlus,
  HelpCircle, Upload, CheckSquare, ListOrdered, Award, Sparkles, Calendar, UserCheck, FileCheck2, Search,
  Users, BarChart3, Clock, ArrowUpRight, CheckCircle2, Activity, TrendingUp, Flame, GraduationCap, User, ExternalLink, FileCode,
  Lock, Unlock, Link2, Layers, RotateCcw
} from 'lucide-react';
import { collection, query, onSnapshot, orderBy, getDocs, collectionGroup } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL, UploadTask } from 'firebase/storage';
import { db, storage } from '../../lib/firebase';
import { Course, CourseBook, CourseLectureItem, LectureQuizQuestion, QuizQuestionType, CertificateRequest, StudentLectureProgress, UserProfile, resolveFileUrl } from '../../types';
import { useCoursesManager } from '../../hooks/useCoursesManager';
import { useCertificates } from '../../hooks/useCertificates';
import { useToast } from '../../hooks/useToast';
import { useAuth } from '../../hooks/useAuth';
import { CoverImage } from '../common/CoverImage';
import {
  formatFirebaseStorageError,
  isValidRemoteImageUrl,
} from '../../lib/storageMedia';
import {
  IMAGEKIT_COVER_MAX_BYTES,
  IMAGEKIT_URL_ENDPOINT,
  ImageUploadCanceledError,
  ImageUploadController,
  cleanupReplacedImageKitCover,
  deleteImageKitFile,
  logImageDiagnostic,
  startImageKitUpload,
  validateImageFileWithSignature,
} from '../../lib/imagekitMedia';
import { SmartLectureImport } from './SmartLectureImport';
import { ImportQuizJsonModal } from './ImportQuizJsonModal';
import { 
  isStandaloneCourse, 
  isMasterCourse, 
  isChildCourse, 
  getChildCourses, 
  getTopLevelCourses 
} from '../../lib/courseProgression';

export const AdminCoursesPanel: React.FC = () => {
  const { userProfile, isAdmin } = useAuth();
  const { 
    courses, books, lectures, questions, loading,
    saveCourse, deleteCourse, updateCoursesOrder, toggleCourseVisibility,
    saveBook, deleteBook, updateBooksOrder,
    saveLecture, deleteLecture, updateLecturesOrder,
    saveQuestion, saveQuestionsBatch, deleteQuestion
  } = useCoursesManager();

  const {
    requests: certRequests,
    certificates: sentCertificates,
    issueCertificate,
    deleteCertificate,
    deleteRequest
  } = useCertificates();

  const { showSuccess, showError } = useToast();

  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => Promise<void> | void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });
  const [confirmLoading, setConfirmLoading] = useState(false);

  const handleDeleteCourse = (courseId: string, courseTitle: string) => {
    setConfirmState({
      isOpen: true,
      title: "تأكيد حذف الدورة",
      message: `هل أنت متأكد/ة من حذف دورة "${courseTitle}" وجميع الكتب والمحاضرات والأسئلة التابعة لها؟ لا يمكن التراجع عن هذه العملية وسيتم مسح جميع الملفات المرفوعة بالكامل.`,
      onConfirm: async () => {
        try {
          await deleteCourse(courseId);
          showSuccess("تم حذف الدورة بنجاح", `تمت إزالة الدورة "${courseTitle}" وجميع مشتملاتها تماماً من قاعدة البيانات والسحاب.`);
        } catch (err) {
          console.error("Failed to delete course:", err);
          showError("خطأ في حذف الدورة", err instanceof Error ? err.message : "حدث خطأ غير متوقع أثناء محاولة حذف الدورة. يرجى مراجعة الصلاحيات والمحاولة لاحقاً.");
        }
      }
    });
  };

  const handleDeleteBook = (bookId: string, bookTitle: string) => {
    setConfirmState({
      isOpen: true,
      title: "تأكيد حذف الكتاب",
      message: `هل أنت متأكد/ة من حذف كتاب "${bookTitle}" وجميع المحاضرات والأسئلة التابعة له؟`,
      onConfirm: async () => {
        try {
          await deleteBook(bookId);
          showSuccess("تم حذف الكتاب بنجاح", `تمت إزالة كتاب "${bookTitle}" ومحاضراته وملفاته تماماً.`);
        } catch (err) {
          console.error("Failed to delete book:", err);
          showError("خطأ في حذف الكتاب", err instanceof Error ? err.message : "تعذر حذف الكتاب. يرجى التحقق من اتصالك بالشبكة.");
        }
      }
    });
  };

  const handleDeleteLecture = (lectureId: string, lectureTitle: string) => {
    setConfirmState({
      isOpen: true,
      title: "تأكيد حذف المحاضرة",
      message: `هل أنت متأكد/ة من حذف محاضرة "${lectureTitle}" وجميع أسئلتها وملفاتها المرفوعة؟`,
      onConfirm: async () => {
        try {
          await deleteLecture(lectureId);
          showSuccess("تم حذف المحاضرة بنجاح", `تمت إزالة محاضرة "${lectureTitle}" والملفات الصوتية/المرئية التابعة لها تماماً.`);
        } catch (err) {
          console.error("Failed to delete lecture:", err);
          showError("خطأ في حذف المحاضرة", err instanceof Error ? err.message : "حدث خطأ أثناء محاولة إزالة المحاضرة وملفاتها المرفوعة.");
        }
      }
    });
  };

  const handleDeleteQuestion = (qId: string) => {
    setConfirmState({
      isOpen: true,
      title: "تأكيد حذف السؤال",
      message: "هل أنت متأكد/ة من حذف هذا السؤال من الاختبار؟",
      onConfirm: async () => {
        try {
          await deleteQuestion(qId);
          showSuccess("تم حذف السؤال", "تمت إزالة سؤال القياس بنجاح.");
        } catch (err) {
          console.error("Failed to delete question:", err);
          showError("فشل حذف السؤال", err instanceof Error ? err.message : "حدث خطأ أثناء حذف سؤال الاختبار.");
        }
      }
    });
  };

  const [activeAdminTab, setActiveAdminTab] = useState<'stats' | 'courses' | 'certificates' | 'smart_import'>('stats');
  const [issuingRequest, setIssuingRequest] = useState<CertificateRequest | null>(null);

  // --- حالات إضافية للوحة الإحصائيات والبحث الموحد ---
  const [students, setStudents] = useState<UserProfile[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(true);
  const [latestProgresses, setLatestProgresses] = useState<StudentLectureProgress[]>([]);
  const [progressesLoading, setProgressesLoading] = useState(true);
  
  // حالات البحث السريع
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCategory, setSearchCategory] = useState<'all' | 'students' | 'courses' | 'books' | 'lectures'>('all');
  const [selectedStudentDetail, setSelectedStudentDetail] = useState<UserProfile | null>(null);

  // جلب الطالبات من قاعدة البيانات
  useEffect(() => {
    const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const uList = snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as UserProfile));
        // تصفية الطالبات فقط
        setStudents(uList.filter(u => u.role === 'student'));
      } else {
        setStudents([]);
      }
      setStudentsLoading(false);
    }, (err) => {
      console.warn("خطأ في جلب الطالبات:", err);
      // مصفوفة تجريبية للطالبات في حال تعذر الاتصال
      setStudents([
        { uid: 'student-demo-1', name: 'عائشة الفهد', email: 'aisha@elm.com', role: 'student', createdAt: new Date().toISOString(), level: 'مبتدئ', streak: 5, completedBooksCount: 0, joinDate: '1447-01-10 هـ' },
        { uid: 'student-demo-2', name: 'فاطمة الحربي', email: 'fatima@elm.com', role: 'student', createdAt: new Date().toISOString(), level: 'متوسط', streak: 8, completedBooksCount: 1, joinDate: '1447-01-05 هـ' },
        { uid: 'student-demo-3', name: 'سارة المطيري', email: 'sara@elm.com', role: 'student', createdAt: new Date().toISOString(), level: 'متقدم', streak: 14, completedBooksCount: 2, joinDate: '1447-01-01 هـ' }
      ]);
      setStudentsLoading(false);
    });

    return () => unsub();
  }, []);

  // تحميل مكتبة PDF.js من أجل حساب عدد صفحات الكتب المرفوعة تلقائياً
  useEffect(() => {
    if (!(window as any).pdfjsLib) {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
      script.async = true;
      script.onload = () => {
        const pdfjsLib = (window as any).pdfjsLib;
        if (pdfjsLib) {
          pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        }
      };
      document.body.appendChild(script);
    }
  }, []);

  // جلب تقدّم الطلاب (سجل المحاولات/الاختبارات) عبر الاستعلام الشامل لمجموعات التقدم
  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const snap = await getDocs(collectionGroup(db, 'lecture_progress'));
        if (!snap.empty) {
          const pList = snap.docs.map(doc => {
            const pathSegments = doc.ref.path.split('/');
            const studentId = pathSegments[1];
            return {
              id: doc.id,
              studentId,
              ...doc.data()
            } as StudentLectureProgress & { studentId: string };
          });
          pList.sort((a, b) => new Date(b.lastAttemptDate).getTime() - new Date(a.lastAttemptDate).getTime());
          setLatestProgresses(pList);
        } else {
          setLatestProgresses([]);
        }
      } catch (err) {
        console.warn("تعذر جلب التقدم عبر collectionGroup:", err);
        // fallback لبيانات تجريبية للمحاولات الأخيرة
        setLatestProgresses([
          { id: 'progress-demo-1', lectureId: 'lec-1', bookId: 'book-1', courseId: 'course-1', studentId: 'student-demo-3', attemptsCount: 1, lastScore: 100, bestScore: 100, lastAttemptDate: new Date(Date.now() - 10 * 60000).toISOString(), isPassed: true, isLectureFinished: true },
          { id: 'progress-demo-2', lectureId: 'lec-2', bookId: 'book-1', courseId: 'course-1', studentId: 'student-demo-2', attemptsCount: 2, lastScore: 80, bestScore: 80, lastAttemptDate: new Date(Date.now() - 40 * 60000).toISOString(), isPassed: true, isLectureFinished: true },
          { id: 'progress-demo-3', lectureId: 'lec-1', bookId: 'book-1', courseId: 'course-1', studentId: 'student-demo-1', attemptsCount: 3, lastScore: 50, bestScore: 50, lastAttemptDate: new Date(Date.now() - 180 * 60000).toISOString(), isPassed: false, isLectureFinished: true }
        ]);
      } finally {
        setProgressesLoading(false);
      }
    };

    if (students.length > 0) {
      fetchProgress();
    }
  }, [students]);

  // حالة سجل اختبارات وقياسات الطالب/ة المحدد ومتابعتها
  const [studentSpecificTests, setStudentSpecificTests] = useState<StudentLectureProgress[]>([]);
  const [loadingStudentTests, setLoadingStudentTests] = useState(false);

  // دالة فتح ومتابعة بروفايل الطالب/ة
  const openStudentProfile = (studentId: string, fallbackStudent?: UserProfile) => {
    const found = students.find(s => s.uid === studentId) || fallbackStudent;
    if (found) {
      setSelectedStudentDetail(found);
    } else {
      setSelectedStudentDetail({
        uid: studentId,
        name: fallbackStudent?.name || 'طالب/ة علم',
        displayName: fallbackStudent?.displayName || fallbackStudent?.name || 'طالب/ة علم',
        email: fallbackStudent?.email || '',
        role: 'student',
        createdAt: new Date().toISOString(),
        level: 'مبتدئ',
        streak: fallbackStudent?.streak ?? 0,
        completedBooksCount: fallbackStudent?.completedBooksCount ?? 0
      });
    }
  };

  // جلب واحتساب اختبارات الطالب/ة المحددة وترتيبها زمنياً من الأحدث إلى الأقدم بالتسلسل
  useEffect(() => {
    if (!selectedStudentDetail) {
      setStudentSpecificTests([]);
      return;
    }

    const loadStudentTests = async () => {
      setLoadingStudentTests(true);
      try {
        const studentId = selectedStudentDetail.uid;

        // 1. استخراج المحاولات من latestProgresses الخاصة بهذا الطالب/ة
        const fromLatest = latestProgresses.filter(p => (p as any).studentId === studentId);

        // 2. جلب مباشر من مسار المستخدم في فايرستور للتأكد من شمول جميع الاختبارات
        let fromSubcollection: StudentLectureProgress[] = [];
        try {
          const subSnap = await getDocs(collection(db, 'users', studentId, 'lecture_progress'));
          if (!subSnap.empty) {
            fromSubcollection = subSnap.docs.map(d => ({
              id: d.id,
              lectureId: d.id,
              ...d.data()
            } as StudentLectureProgress));
          }
        } catch (subErr) {
          console.warn("Subcollection progress read error:", subErr);
        }

        // 3. دمج البيانات وإلغاء التكرار مع الاحتفاظ بآخر محاولة
        const map = new Map<string, StudentLectureProgress>();
        [...fromLatest, ...fromSubcollection].forEach(item => {
          const key = item.lectureId || item.id;
          if (!map.has(key)) {
            map.set(key, item);
          } else {
            const existing = map.get(key)!;
            const existingTime = new Date(existing.lastAttemptDate || 0).getTime();
            const newTime = new Date(item.lastAttemptDate || 0).getTime();
            if (newTime >= existingTime) {
              map.set(key, { ...existing, ...item });
            }
          }
        });

        // 4. تصفية السجلات التي تحتوي على محاولات أو درجات فعلية
        let result = Array.from(map.values()).filter(p => 
          (p.attemptsCount && p.attemptsCount > 0) || 
          p.lastScore !== undefined || 
          p.isPassed !== undefined
        );

        // 5. الترتيب الزمني الدقيق: من آخر اختبار (الأحدث) إلى الأقدم بالتسلسل
        result.sort((a, b) => new Date(b.lastAttemptDate || 0).getTime() - new Date(a.lastAttemptDate || 0).getTime());

        // في حال الحساب التجريبي أو عدم وجود محاولات بعد
        if (result.length === 0 && studentId.startsWith('student-demo')) {
          result = [
            {
              id: 'demo-test-1',
              lectureId: lectures[0]?.id || 'lec-1',
              bookId: books[0]?.id || 'book-1',
              courseId: courses[0]?.id || 'course-1',
              attemptsCount: 1,
              lastScore: 100,
              bestScore: 100,
              lastAttemptDate: new Date(Date.now() - 25 * 60000).toISOString(),
              isPassed: true,
              isLectureFinished: true,
            },
            {
              id: 'demo-test-2',
              lectureId: lectures[1]?.id || 'lec-2',
              bookId: books[0]?.id || 'book-1',
              courseId: courses[0]?.id || 'course-1',
              attemptsCount: 2,
              lastScore: 85,
              bestScore: 85,
              lastAttemptDate: new Date(Date.now() - 140 * 60000).toISOString(),
              isPassed: true,
              isLectureFinished: true,
            },
            {
              id: 'demo-test-3',
              lectureId: lectures[2]?.id || 'lec-3',
              bookId: books[0]?.id || 'book-1',
              courseId: courses[0]?.id || 'course-1',
              attemptsCount: 1,
              lastScore: 70,
              bestScore: 70,
              lastAttemptDate: new Date(Date.now() - 1500 * 60000).toISOString(),
              isPassed: true,
              isLectureFinished: true,
            }
          ];
        }

        setStudentSpecificTests(result);
      } catch (err) {
        console.error("Error loading student tests:", err);
      } finally {
        setLoadingStudentTests(false);
      }
    };

    loadStudentTests();
  }, [selectedStudentDetail, latestProgresses, lectures, books, courses]);

  // حساب الإحصائيات والعدادات
  const totalStudents = students.length;
  const totalCourses = courses.length;
  const totalBooks = books.length;
  const totalLectures = lectures.length;
  const totalExams = questions.length; // عدد أسئلة القياس
  const totalCertificates = sentCertificates.length;

  // فلترة نتائج البحث الموحد
  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.displayName && s.displayName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredCourses = courses.filter(c => 
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredBooks = books.filter(b => 
    b.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredLectures = lectures.filter(l => 
    l.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (l.description && l.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // حقول نموذج إصدار الشهادة
  const [certStudentName, setCertStudentName] = useState('');
  const [certCourseName, setCertCourseName] = useState('');
  const [certBookName, setCertBookName] = useState('');
  const [certDate, setCertDate] = useState('');
  const [certNumber, setCertNumber] = useState('');
  const [certFileUrl, setCertFileUrl] = useState('');

  // الحالات النشطة للتنقل الهرمي
  const [expandedCourseId, setExpandedCourseId] = useState<string | null>(null);
  const [expandedSubCourseId, setExpandedSubCourseId] = useState<string | null>(null);
  const [expandedBookId, setExpandedBookId] = useState<string | null>(null);

  // مودالات الإضافة والتعديل
  const [editingCourse, setEditingCourse] = useState<Partial<Course> | null>(null);
  const [initialCourseCover, setInitialCourseCover] = useState<{ url: string; fileId?: string }>({ url: '' });
  const [tempCourseCovers, setTempCourseCovers] = useState<Array<{ url: string; fileId: string }>>([]);
  const [savingCourse, setSavingCourse] = useState(false);

  const [editingBook, setEditingBook] = useState<{ courseId: string; book: Partial<CourseBook> } | null>(null);
  const [initialBookCover, setInitialBookCover] = useState<{ url: string; fileId?: string }>({ url: '' });
  const [tempBookCovers, setTempBookCovers] = useState<Array<{ url: string; fileId: string }>>([]);
  const [savingBook, setSavingBook] = useState(false);

  const [editingLecture, setEditingLecture] = useState<{ bookId: string; courseId: string; lecture: Partial<CourseLectureItem> } | null>(null);

  // إدارة أسئلة اختبار المحاضرة
  const [activeQuizLecture, setActiveQuizLecture] = useState<CourseLectureItem | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<Partial<LectureQuizQuestion> | null>(null);
  const [isImportJsonModalOpen, setIsImportJsonModalOpen] = useState(false);

  const [uploadingField, setUploadingField] = useState<'videoUrl' | 'audioUrl' | 'imageUrl' | 'bookImageUrl' | 'certFileUrl' | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<Record<string, { name: string; size: string }>>({});
  const [uploadingFileName, setUploadingFileName] = useState<string | null>(null);
  const [pendingCourseCover, setPendingCourseCover] = useState<{ file: File; previewUrl: string } | null>(null);
  const [pendingBookCover, setPendingBookCover] = useState<{ file: File; previewUrl: string } | null>(null);

  const coverUploadControllerRef = useRef<ImageUploadController | null>(null);
  const coverUploadInFlightRef = useRef<boolean>(false);
  const mediaUploadTaskRef = useRef<UploadTask | null>(null);
  const mediaUploadCanceledRef = useRef<boolean>(false);

  const clearPendingCourseCover = () => {
    setPendingCourseCover((prev) => {
      if (prev?.previewUrl) URL.revokeObjectURL(prev.previewUrl);
      return null;
    });
  };

  const clearPendingBookCover = () => {
    setPendingBookCover((prev) => {
      if (prev?.previewUrl) URL.revokeObjectURL(prev.previewUrl);
      return null;
    });
  };

  useEffect(() => {
    return () => {
      coverUploadControllerRef.current?.cancel();
      mediaUploadTaskRef.current?.cancel();
    };
  }, []);

  const openCourseEditor = (courseData: Partial<Course>) => {
    setUploadError(null);
    clearPendingCourseCover();
    setInitialCourseCover({
      url: courseData.imageUrl || '',
      fileId: courseData.imageFileId || undefined,
    });
    setTempCourseCovers([]);
    setEditingCourse(courseData);
  };

  const closeCourseEditor = async () => {
    coverUploadControllerRef.current?.cancel();
    clearPendingCourseCover();
    const otherCourses = courses.filter(c => c.id !== editingCourse?.id);
    for (const tempCover of tempCourseCovers) {
      if (tempCover.fileId && tempCover.fileId !== initialCourseCover.fileId) {
        await cleanupReplacedImageKitCover({
          purpose: 'course_cover',
          oldFileId: tempCover.fileId,
          oldUrl: tempCover.url,
          newFileId: initialCourseCover.fileId,
          newUrl: initialCourseCover.url || null,
          otherItems: otherCourses,
        });
      }
    }
    setTempCourseCovers([]);
    setInitialCourseCover({ url: '' });
    setUploadError(null);
    setEditingCourse(null);
  };

  const openBookEditor = (courseId: string, bookData: Partial<CourseBook>) => {
    setUploadError(null);
    clearPendingBookCover();
    setInitialBookCover({
      url: bookData.imageUrl || '',
      fileId: bookData.imageFileId || undefined,
    });
    setTempBookCovers([]);
    setEditingBook({ courseId, book: bookData });
  };

  const closeBookEditor = async () => {
    coverUploadControllerRef.current?.cancel();
    clearPendingBookCover();
    const otherBooks = books.filter(b => b.id !== editingBook?.book?.id);
    for (const tempCover of tempBookCovers) {
      if (tempCover.fileId && tempCover.fileId !== initialBookCover.fileId) {
        await cleanupReplacedImageKitCover({
          purpose: 'book_cover',
          oldFileId: tempCover.fileId,
          oldUrl: tempCover.url,
          newFileId: initialBookCover.fileId,
          newUrl: initialBookCover.url || null,
          otherItems: otherBooks,
        });
      }
    }
    setTempBookCovers([]);
    setInitialBookCover({ url: '' });
    setUploadError(null);
    setEditingBook(null);
  };

  // مسح الملفات المرفقة عند تبديل أو إغلاق النوافذ المنبثقة لمنع تسرب أسماء الملفات القديمة
  useEffect(() => {
    setSelectedFiles({});
    setUploadingFileName(null);
    clearPendingCourseCover();
    clearPendingBookCover();
  }, [editingCourse?.id, editingBook?.book?.id, editingLecture?.lecture?.id]);

  const handleCancelActiveUpload = () => {
    if (coverUploadControllerRef.current) {
      coverUploadControllerRef.current.cancel();
    }
    if (mediaUploadTaskRef.current) {
      mediaUploadCanceledRef.current = true;
      mediaUploadTaskRef.current.cancel();
    }
  };

  // اختيار صورة غلاف (معاينة محلية وفحص التوقيع الثنائي قبل الضغط على «حفظ الصورة»)
  const handleCoverFileSelected = async (
    e: React.ChangeEvent<HTMLInputElement>,
    field: 'imageUrl' | 'bookImageUrl'
  ) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || uploadingField || coverUploadInFlightRef.current) return;

    const check = await validateImageFileWithSignature(file, IMAGEKIT_COVER_MAX_BYTES);
    if (!check.valid) {
      const msg = check.error || 'ملف الصورة غير صالح.';
      setUploadError(msg);
      showError('صورة غير صالحة', msg);
      return;
    }

    if (coverUploadInFlightRef.current) return;

    setUploadError(null);
    const previewUrl = URL.createObjectURL(file);
    if (field === 'imageUrl') {
      clearPendingCourseCover();
      setPendingCourseCover({ file, previewUrl });
    } else {
      clearPendingBookCover();
      setPendingBookCover({ file, previewUrl });
    }
  };

  // بدء الرفع الفعلي لصورة الغلاف المختارة إلى ImageKit عبر الخادم بعد الضغط على «حفظ الصورة»
  const handleSaveCoverImage = async (field: 'imageUrl' | 'bookImageUrl') => {
    const pending = field === 'imageUrl' ? pendingCourseCover : pendingBookCover;
    if (!pending || uploadingField || coverUploadInFlightRef.current) return;

    const { file } = pending;
    const purpose = field === 'imageUrl' ? 'course_cover' : 'book_cover';

    coverUploadInFlightRef.current = true;
    setUploadingField(field);
    setUploadingFileName(file.name);
    setUploadProgress(0);
    setUploadError(null);

    let newlyUploaded: { url: string; fileId: string } | null = null;

    try {
      const controller = startImageKitUpload(purpose, file, IMAGEKIT_COVER_MAX_BYTES, {
        onProgress: setUploadProgress,
      });
      coverUploadControllerRef.current = controller;

      const uploaded = await controller.promise;
      newlyUploaded = { url: uploaded.url, fileId: uploaded.fileId };

      const sizeInMB = file.size / (1024 * 1024);
      const formattedSize =
        sizeInMB < 1 ? `${(file.size / 1024).toFixed(0)} كيلوبايت` : `${sizeInMB.toFixed(2)} ميجابايت`;

      if (field === 'imageUrl' && editingCourse) {
        const existingCourse = editingCourse.id
          ? courses.find((c) => c.id === editingCourse.id)
          : undefined;

        if (existingCourse) {
          const updatedCourse: Course = {
            ...existingCourse,
            title: (editingCourse.title || existingCourse.title).trim(),
            description: editingCourse.description ?? existingCourse.description ?? '',
            imageUrl: uploaded.url,
            imageFileId: uploaded.fileId,
            isVisible: editingCourse.isVisible ?? existingCourse.isVisible ?? true,
          };
          try {
            await saveCourse(updatedCourse);
          } catch (fsErr: any) {
            logImageDiagnostic({
              stage: 'firestore_update',
              purpose: 'course_cover',
              errorCode: fsErr?.code || 'firestore/update-failed',
              errorMessage: fsErr?.message || String(fsErr),
            });
            throw new Error(
              fsErr?.message || 'تم رفع الغلاف ولكن تعذر حفظ الرابط في وثيقة الدورة.'
            );
          }
          const otherCourses = courses.filter((c) => c.id !== existingCourse.id);
          await cleanupReplacedImageKitCover({
            purpose: 'course_cover',
            oldFileId: initialCourseCover.fileId || existingCourse.imageFileId,
            oldUrl: initialCourseCover.url || existingCourse.imageUrl,
            newFileId: uploaded.fileId,
            newUrl: uploaded.url,
            otherItems: otherCourses,
          });
          setInitialCourseCover({ url: uploaded.url, fileId: uploaded.fileId });
        } else {
          setTempCourseCovers((prev) => [...prev, { url: uploaded.url, fileId: uploaded.fileId }]);
        }

        setEditingCourse((prev) =>
          prev ? { ...prev, imageUrl: uploaded.url, imageFileId: uploaded.fileId } : null
        );
        clearPendingCourseCover();
      } else if (field === 'bookImageUrl' && editingBook) {
        const existingBook = editingBook.book.id
          ? books.find((b) => b.id === editingBook.book.id)
          : undefined;

        if (existingBook) {
          const updatedBook: CourseBook = {
            ...existingBook,
            title: (editingBook.book.title || existingBook.title).trim(),
            imageUrl: uploaded.url,
            imageFileId: uploaded.fileId,
            pdfUrl: editingBook.book.pdfUrl ?? existingBook.pdfUrl,
          };
          try {
            await saveBook(updatedBook);
          } catch (fsErr: any) {
            logImageDiagnostic({
              stage: 'firestore_update',
              purpose: 'book_cover',
              errorCode: fsErr?.code || 'firestore/update-failed',
              errorMessage: fsErr?.message || String(fsErr),
            });
            throw new Error(
              fsErr?.message || 'تم رفع غلاف الكتاب ولكن تعذر حفظ الرابط في قاعدة البيانات.'
            );
          }
          const otherBooks = books.filter((b) => b.id !== existingBook.id);
          await cleanupReplacedImageKitCover({
            purpose: 'book_cover',
            oldFileId: initialBookCover.fileId || existingBook.imageFileId,
            oldUrl: initialBookCover.url || existingBook.imageUrl,
            newFileId: uploaded.fileId,
            newUrl: uploaded.url,
            otherItems: otherBooks,
          });
          setInitialBookCover({ url: uploaded.url, fileId: uploaded.fileId });
        } else {
          setTempBookCovers((prev) => [...prev, { url: uploaded.url, fileId: uploaded.fileId }]);
        }

        setEditingBook((prev) =>
          prev
            ? { ...prev, book: { ...prev.book, imageUrl: uploaded.url, imageFileId: uploaded.fileId } }
            : null
        );
        clearPendingBookCover();
      }

      setSelectedFiles((prev) => ({
        ...prev,
        [field]: { name: file.name, size: formattedSize },
      }));

      showSuccess(
        'تم حفظ صورة الغلاف',
        `تم رفع وحفظ صورة الغلاف "${file.name}" بنجاح.`
      );
    } catch (err: any) {
      if (err instanceof ImageUploadCanceledError || err?.code === 'imagekit/canceled') {
        setUploadError(null);
        showError('تم إلغاء الرفع', 'تم إيقاف رفع صورة الغلاف والاحتفاظ بالصورة السابقة.');
        return;
      }

      if (newlyUploaded?.fileId) {
        await deleteImageKitFile(newlyUploaded.fileId, purpose);
      }

      const msg = err?.message || 'تعذر رفع أو حفظ صورة الغلاف.';
      setUploadError(msg);
      showError('فشل رفع الصورة', msg);
    } finally {
      coverUploadInFlightRef.current = false;
      coverUploadControllerRef.current = null;
      setUploadingField(null);
      setUploadingFileName(null);
      setUploadProgress(0);
    }
  };

  // --- رفع ملف آمن ومباشر إلى Firebase Storage بالكامل من جهة العميل ---
  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    field: 'videoUrl' | 'audioUrl' | 'imageUrl' | 'bookImageUrl' | 'certFileUrl'
  ) => {
    if (field === 'imageUrl' || field === 'bookImageUrl') {
      handleCoverFileSelected(e, field);
      return;
    }

    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      const offlineMsg = 'لا يوجد اتصال بالإنترنت حالياً. يرجى التحقق من الشبكة والمحاولة مرة أخرى.';
      setUploadError(offlineMsg);
      showError('لا يوجد اتصال', offlineMsg);
      return;
    }

    // المجلد المستهدف حسب نوع الملف المرفوع
    let folder = 'course_videos';
    if (field === 'audioUrl') folder = 'course_audios';
    if (field === 'certFileUrl') folder = 'certificates';

    setUploadingField(field);
    setUploadingFileName(file.name);
    setUploadProgress(0);
    setUploadError(null);
    mediaUploadCanceledRef.current = false;

    try {
      const fileExtension = file.name.split('.').pop();
      const uniqueFileName = `${Date.now()}_${Math.random().toString(36).substring(2, 11)}.${fileExtension}`;
      const targetPath = (field === 'certFileUrl' && issuingRequest?.studentId)
        ? `certificates/${issuingRequest.studentId}/${uniqueFileName}`
        : `${folder}/${uniqueFileName}`;

      const fileRef = ref(storage, targetPath);
      const metadata: any = {
        contentType: file.type || 'application/octet-stream'
      };
      if (field === 'certFileUrl' && issuingRequest?.studentId) {
        metadata.customMetadata = {
          studentId: issuingRequest.studentId
        };
      }

      const uploadTask = uploadBytesResumable(fileRef, file, metadata);
      mediaUploadTaskRef.current = uploadTask;

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          if (snapshot.totalBytes > 0) {
            const currentProgress = Math.round(
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100
            );
            setUploadProgress(currentProgress);
          }
        },
        (err) => {
          mediaUploadTaskRef.current = null;
          setUploadingField(null);
          setUploadingFileName(null);
          setUploadProgress(0);
          if (mediaUploadCanceledRef.current || err?.code === 'storage/canceled') {
            setUploadError(null);
            return;
          }
          console.error('حدث خطأ أثناء رفع الملف إلى Firebase Storage:', err);
          const friendlyMessage = formatFirebaseStorageError(err);
          setUploadError(friendlyMessage);
          showError('فشل الرفع', friendlyMessage);
        },
        async () => {
          mediaUploadTaskRef.current = null;
          try {
            const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
            setUploadProgress(100);

            const sizeInMB = file.size / (1024 * 1024);
            const formattedSize = sizeInMB < 1 ? `${(file.size / 1024).toFixed(0)} كيلوبايت` : `${sizeInMB.toFixed(2)} ميجابايت`;

            setSelectedFiles(prev => ({
              ...prev,
              [field]: { name: file.name, size: formattedSize }
            }));

            if (field === 'certFileUrl') {
              setCertFileUrl(downloadUrl);
            } else if (editingLecture) {
              setEditingLecture(prev => prev ? {
                ...prev,
                lecture: { ...prev.lecture, [field]: downloadUrl }
              } : null);
            }

            showSuccess('تم الرفع بنجاح', `تم رفع وحفظ ملف ${file.name} بنجاح إلى مخزن Firebase السحابي!`);
          } catch {
            const errMsg = 'تم الرفع بنجاح ولكن فشل الحصول على رابط التحميل المباشر';
            setUploadError(errMsg);
            showError('فشل الرفع', errMsg);
          } finally {
            setUploadingField(null);
            setUploadingFileName(null);
          }
        }
      );
    } catch (err: any) {
      mediaUploadTaskRef.current = null;
      console.error('خطأ في بدء عملية الرفع السحابي:', err);
      const friendlyMessage = formatFirebaseStorageError(err);
      setUploadError(friendlyMessage);
      showError('فشل الرفع', friendlyMessage);
      setUploadingField(null);
      setUploadingFileName(null);
    }
  };

  // --- دوال ترتيب الدورات ---
  const moveCourse = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= courses.length) return;
    const reordered = [...courses];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);
    updateCoursesOrder(reordered);
  };

  // --- ترتيب الدورات في المستوى الأعلى ---
  const moveTopLevelCourse = (index: number, direction: 'up' | 'down') => {
    const topList = getTopLevelCourses(courses);
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= topList.length) return;
    const reordered = [...topList];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);

    const updated = courses.map(c => {
      if (!c.parentCourseId) {
        const foundIdx = reordered.findIndex(tl => tl.id === c.id);
        if (foundIdx !== -1) {
          return { ...c, order: foundIdx };
        }
      }
      return c;
    });
    updateCoursesOrder(updated);
  };

  // --- ترتيب المستويات الفرعية داخل دورة كبيرة ---
  const moveChildCourse = (parentId: string, index: number, direction: 'up' | 'down') => {
    const childList = getChildCourses(parentId, courses);
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= childList.length) return;
    const reordered = [...childList];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);

    const updated = courses.map(c => {
      if (c.parentCourseId === parentId) {
        const foundIdx = reordered.findIndex(ch => ch.id === c.id);
        if (foundIdx !== -1) {
          return { ...c, order: foundIdx };
        }
      }
      return c;
    });
    updateCoursesOrder(updated);
  };

  // --- دوال ترتيب الكتب ---
  const moveBook = (courseId: string, index: number, direction: 'up' | 'down') => {
    const courseBooks = books.filter(b => b.courseId === courseId);
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= courseBooks.length) return;
    const reordered = [...courseBooks];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);
    updateBooksOrder(courseId, reordered);
  };

  // --- دوال ترتيب المحاضرات ---
  const moveLecture = (bookId: string, index: number, direction: 'up' | 'down') => {
    const bookLectures = lectures.filter(l => l.bookId === bookId);
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= bookLectures.length) return;
    const reordered = [...bookLectures];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);
    updateLecturesOrder(bookId, reordered);
  };

  if (!isAdmin) {
    return (
      <div className="p-8 text-center max-w-md mx-auto my-12 bg-white dark:bg-slate-900 rounded-3xl border border-rose-200 dark:border-rose-900 shadow-lg">
        <div className="w-16 h-16 bg-rose-100 dark:bg-rose-950/80 rounded-2xl flex items-center justify-center mx-auto mb-4 text-rose-600">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">منطقة مخصصة للمشرفة العامة فقط</h3>
        <p className="text-xs text-slate-500">لا تملك الصلاحيات الإدارية الكافية للوصول إلى لوحة إدارة المقررات والشهادات.</p>
      </div>
    );
  }

  if (loading) {
    return <div className="p-8 text-center text-slate-500 font-mono">جاري تحميل لوحة إدارة الدورات...</div>;
  }

  const lectureQuestionsList = activeQuizLecture ? questions.filter(q => q.lectureId === activeQuizLecture.id) : [];

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16 text-right" dir="rtl">
      {/* الترويسة العليا */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white p-6 rounded-3xl shadow-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold font-sans flex items-center gap-2">
            <ShieldAlert className="w-7 h-7 text-amber-400" />
            لوحة إدارة التأصيل والدورات العلمية
          </h2>
          <p className="text-emerald-100 text-sm mt-1">
            إدارة الدورات، الكتب، المحاضرات، واختبارات قياس التحصيل الفورية لكل درس وإصدار الشهادات
          </p>
        </div>

        {activeAdminTab === 'courses' && (
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => openCourseEditor({ 
                title: '', 
                description: '', 
                imageUrl: '', 
                order: courses.length, 
                isVisible: true,
                courseType: 'master',
                isMasterCourse: true,
                parentCourseId: null,
                isStandalone: false
              })}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all shadow-md active:scale-95 border border-emerald-400/40"
            >
              <Layers className="w-4 h-4 text-emerald-200" />
              <span>+ إضافة دورة كبيرة جامعة 🏛️</span>
            </button>

            <button
              onClick={() => {
                const masterList = courses.filter(c => isMasterCourse(c));
                openCourseEditor({ 
                  title: '', 
                  description: '', 
                  imageUrl: '', 
                  order: courses.length, 
                  isVisible: true,
                  courseType: 'sequential',
                  isMasterCourse: false,
                  parentCourseId: masterList[0]?.id || null,
                  prerequisiteCourseId: null,
                  isStandalone: false
                });
              }}
              className="bg-amber-400 hover:bg-amber-500 text-slate-900 px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all shadow-md active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>+ إضافة مستوى / دورة فرعية 📑</span>
            </button>

            <button
              onClick={() => openCourseEditor({ 
                title: '', 
                description: '', 
                imageUrl: '', 
                order: courses.length, 
                isVisible: true,
                courseType: 'standalone',
                isMasterCourse: false,
                parentCourseId: null,
                prerequisiteCourseId: null,
                isStandalone: true
              })}
              className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all shadow-md active:scale-95 border border-purple-400/30"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>+ إضافة دورة صغيرة مستقلة 🌱</span>
            </button>
          </div>
        )}
      </div>

      {/* شريط تبويبات المشرفة */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto whitespace-nowrap scrollbar-none">
        <button
          onClick={() => setActiveAdminTab('stats')}
          className={`flex items-center gap-2 px-6 py-3 border-b-2 text-sm font-extrabold transition-all ${
            activeAdminTab === 'stats'
              ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          لوحة الإحصائيات والبحث السريع
        </button>
        <button
          onClick={() => setActiveAdminTab('courses')}
          className={`flex items-center gap-2 px-6 py-3 border-b-2 text-sm font-extrabold transition-all ${
            activeAdminTab === 'courses'
              ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          إدارة المناهج والدروس
        </button>
        <button
          onClick={() => setActiveAdminTab('certificates')}
          className={`flex items-center gap-2 px-6 py-3 border-b-2 text-sm font-extrabold transition-all relative ${
            activeAdminTab === 'certificates'
              ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Award className="w-4 h-4" />
          إصدار الشهادات واعتماد الهمم
          {certRequests.filter(r => r.status === 'pending').length > 0 && (
            <span className="mr-2 bg-amber-500 text-slate-950 text-[10px] font-black px-1.5 py-0.5 rounded-full animate-bounce">
              {certRequests.filter(r => r.status === 'pending').length} جديد
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveAdminTab('smart_import')}
          className={`flex items-center gap-2 px-6 py-3 border-b-2 text-sm font-extrabold transition-all relative ${
            activeAdminTab === 'smart_import'
              ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>الاستيراد الذكي للمحاضرات</span>
          <span className="mr-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-black px-2 py-0.5 rounded-full">
            جديد
          </span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* ======================= قسم الإحصائيات والبحث السريع ======================= */}
      {/* ========================================================================= */}
      {activeAdminTab === 'stats' && (
        <div className="space-y-8 animate-fade-in text-right" dir="rtl">
          
          {/* كروت الأرقام والإحصائيات الرئيسية */}
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
            {/* عدد الطلاب والطالبات */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl flex flex-col justify-between hover:shadow-md transition-all relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-600"></div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">إجمالي الطلاب والطالبات</span>
                <div className="p-2 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded-2xl">
                  <Users className="w-5 h-5" />
                </div>
              </div>
              <div>
                <span className="text-3xl font-black text-slate-900 dark:text-white font-mono">{totalStudents}</span>
                <span className="text-[10px] text-slate-400 block mt-1">طالب/ة مسجل/ة في المنصة</span>
              </div>
            </div>

            {/* عدد الدورات */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl flex flex-col justify-between hover:shadow-md transition-all relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-600"></div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">الدورات العلمية</span>
                <div className="p-2 bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-2xl">
                  <BookOpen className="w-5 h-5" />
                </div>
              </div>
              <div>
                <span className="text-3xl font-black text-slate-900 dark:text-white font-mono">{totalCourses}</span>
                <span className="text-[10px] text-slate-400 block mt-1">برنامج تأصيلي متاح</span>
              </div>
            </div>

            {/* عدد الكتب */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl flex flex-col justify-between hover:shadow-md transition-all relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-500"></div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">الكتب والمتون</span>
                <div className="p-2 bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 rounded-2xl">
                  <FolderPlus className="w-5 h-5" />
                </div>
              </div>
              <div>
                <span className="text-3xl font-black text-slate-900 dark:text-white font-mono">{totalBooks}</span>
                <span className="text-[10px] text-slate-400 block mt-1">كتاب مشروح للتدريس</span>
              </div>
            </div>

            {/* عدد المحاضرات */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl flex flex-col justify-between hover:shadow-md transition-all relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-purple-600"></div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">الدروس المرئية</span>
                <div className="p-2 bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 rounded-2xl">
                  <Video className="w-5 h-5" />
                </div>
              </div>
              <div>
                <span className="text-3xl font-black text-slate-900 dark:text-white font-mono">{totalLectures}</span>
                <span className="text-[10px] text-slate-400 block mt-1">شرح ومحاضرة دراسية</span>
              </div>
            </div>

            {/* عدد الاختبارات */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl flex flex-col justify-between hover:shadow-md transition-all relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-600"></div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">أسئلة القياس</span>
                <div className="p-2 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-2xl">
                  <HelpCircle className="w-5 h-5" />
                </div>
              </div>
              <div>
                <span className="text-3xl font-black text-slate-900 dark:text-white font-mono">{totalExams}</span>
                <span className="text-[10px] text-slate-400 block mt-1">سؤال قياس وتقييم</span>
              </div>
            </div>

            {/* عدد الشهادات */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl flex flex-col justify-between hover:shadow-md transition-all relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-teal-600"></div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">الشهادات الصادرة</span>
                <div className="p-2 bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400 rounded-2xl">
                  <Award className="w-5 h-5" />
                </div>
              </div>
              <div>
                <span className="text-3xl font-black text-slate-900 dark:text-white font-mono">{totalCertificates}</span>
                <span className="text-[10px] text-slate-400 block mt-1">شهادة علمية معتمدة</span>
              </div>
            </div>
          </div>

          {/* محرك البحث السريع الموحد */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="font-bold text-lg font-sans flex items-center gap-2 text-slate-900 dark:text-white">
                  <Search className="w-5 h-5 text-emerald-600" />
                  <span>محرك البحث السريع والموحد</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1">ابحث/ي فوراً عن أي طالب/ة علم، أو دورة تأصيلية، أو متن كتاب، أو محاضرة مسجلة في المنصة.</p>
              </div>

              {/* حقل البحث */}
              <div className="relative flex-1 max-w-md w-full">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="اكتب/ي اسم الطالب/ة، الدورة، الكتاب، أو الدرس..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-bold shadow-2xs focus:border-emerald-500 focus:bg-white transition-all text-right"
                  dir="rtl"
                />
                <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
              </div>
            </div>

            {/* تصنيفات البحث */}
            <div className="flex gap-2 border-b border-slate-100 dark:border-slate-800 pb-4 overflow-x-auto whitespace-nowrap scrollbar-none">
              <button
                type="button"
                onClick={() => setSearchCategory('all')}
                className={`px-4 py-1.5 rounded-full text-xs font-extrabold transition-all ${
                  searchCategory === 'all'
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                    : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'
                }`}
              >
                الكل ({filteredStudents.length + filteredCourses.length + filteredBooks.length + filteredLectures.length})
              </button>
              <button
                type="button"
                onClick={() => setSearchCategory('students')}
                className={`px-4 py-1.5 rounded-full text-xs font-extrabold transition-all ${
                  searchCategory === 'students'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'
                }`}
              >
                الطلاب والطالبات ({filteredStudents.length})
              </button>
              <button
                type="button"
                onClick={() => setSearchCategory('courses')}
                className={`px-4 py-1.5 rounded-full text-xs font-extrabold transition-all ${
                  searchCategory === 'courses'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'
                }`}
              >
                الدورات ({filteredCourses.length})
              </button>
              <button
                type="button"
                onClick={() => setSearchCategory('books')}
                className={`px-4 py-1.5 rounded-full text-xs font-extrabold transition-all ${
                  searchCategory === 'books'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'
                }`}
              >
                الكتب ومتون التأصيل ({filteredBooks.length})
              </button>
              <button
                type="button"
                onClick={() => setSearchCategory('lectures')}
                className={`px-4 py-1.5 rounded-full text-xs font-extrabold transition-all ${
                  searchCategory === 'lectures'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'
                }`}
              >
                المحاضرات والدروس ({filteredLectures.length})
              </button>
            </div>

            {/* نتائج البحث */}
            <div className="pt-6">
              {searchQuery.trim() === '' ? (
                <div className="text-center py-6 text-xs text-slate-400">
                  اكتب/ي في خانة البحث بالأعلى لعرض النتائج المتطابقة فوراً.
                </div>
              ) : (
                <div className="space-y-6">
                  {/* نتائج البحث: الطلاب والطالبات */}
                  {(searchCategory === 'all' || searchCategory === 'students') && (
                    <div className="space-y-3">
                      {searchCategory === 'all' && (
                        <h4 className="text-xs font-black text-slate-400 flex items-center gap-1 border-r-2 border-blue-500 pr-2">🎓 الطلاب والطالبات المتطابقون</h4>
                      )}
                      {filteredStudents.length === 0 ? (
                        searchCategory === 'students' && <div className="text-xs text-slate-400 text-center py-4">لم يتم العثور على طلاب أو طالبات متطابقين مع نص البحث.</div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {filteredStudents.map(student => (
                            <div 
                              key={student.uid} 
                              onClick={() => openStudentProfile(student.uid, student)}
                              className="p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col justify-between gap-4 hover:border-blue-400 transition-all cursor-pointer group"
                            >
                              <div className="flex items-start gap-3">
                                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 rounded-full flex items-center justify-center font-extrabold text-sm shrink-0 group-hover:scale-105 transition-transform">
                                  {student.name.substring(0, 2)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h5 className="text-sm font-black text-slate-900 dark:text-white leading-tight truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{student.name}</h5>
                                  <p className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">{student.email}</p>
                                  <div className="flex flex-wrap gap-1.5 mt-2">
                                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300">{student.level || 'مبتدئ'}</span>
                                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400">📚 {student.completedBooksCount || 0} كتب</span>
                                    {student.streak !== undefined && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300">🔥 {student.streak} أيام</span>}
                                  </div>
                                </div>
                              </div>
                              <div className="flex justify-end gap-2 border-t border-slate-200/50 dark:border-slate-800/50 pt-3" onClick={(e) => e.stopPropagation()}>
                                <button
                                  type="button"
                                  onClick={() => openStudentProfile(student.uid, student)}
                                  className="text-[10px] font-extrabold bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-xl transition-all flex items-center gap-1"
                                >
                                  <Eye className="w-3 h-3" />
                                  <span>متابعة البروفايل والاختبارات</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setCertStudentName(student.name);
                                    setActiveAdminTab('certificates');
                                  }}
                                  className="text-[10px] font-extrabold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-xl transition-all"
                                >
                                  إصدار شهادة
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* نتائج البحث: الدورات */}
                  {(searchCategory === 'all' || searchCategory === 'courses') && (
                    <div className="space-y-3">
                      {searchCategory === 'all' && (
                        <h4 className="text-xs font-black text-slate-400 flex items-center gap-1 border-r-2 border-emerald-500 pr-2 mt-4">📚 الدورات العلمية المتطابقة</h4>
                      )}
                      {filteredCourses.length === 0 ? (
                        searchCategory === 'courses' && <div className="text-xs text-slate-400 text-center py-4">لم يتم العثور على دورات متطابقة مع نص البحث.</div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {filteredCourses.map(course => (
                            <div key={course.id} className="p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-2xl flex gap-3 hover:border-emerald-400 transition-all">
                              <CoverImage
                                src={course.imageUrl}
                                alt={course.title}
                                type="course"
                                className="w-16 h-16 rounded-xl object-cover shrink-0 border border-slate-200 dark:border-slate-700"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <h5 className="text-sm font-black text-slate-900 dark:text-white leading-tight truncate">{course.title}</h5>
                                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${course.isVisible ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}>
                                    {course.isVisible ? 'نشطة' : 'مخفية'}
                                  </span>
                                </div>
                                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">{course.description}</p>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setExpandedCourseId(course.id);
                                    setActiveAdminTab('courses');
                                  }}
                                  className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-0.5 mt-2"
                                >
                                  إدارة مناهج ومحاضرات الدورة <ArrowUpRight className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* نتائج البحث: الكتب */}
                  {(searchCategory === 'all' || searchCategory === 'books') && (
                    <div className="space-y-3">
                      {searchCategory === 'all' && (
                        <h4 className="text-xs font-black text-slate-400 flex items-center gap-1 border-r-2 border-amber-500 pr-2 mt-4">📖 الكتب والمتون المتطابقة</h4>
                      )}
                      {filteredBooks.length === 0 ? (
                        searchCategory === 'books' && <div className="text-xs text-slate-400 text-center py-4">لم يتم العثور على كتب متطابقة مع نص البحث.</div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {filteredBooks.map(book => {
                            const parentCourse = courses.find(c => c.id === book.courseId);
                            const bookLecturesCount = lectures.filter(l => l.bookId === book.id).length;
                            return (
                              <div key={book.id} className="p-3.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-2xl hover:border-amber-400 transition-all">
                                <div className="flex items-start gap-3">
                                  <CoverImage
                                    src={book.imageUrl}
                                    alt={book.title}
                                    type="book"
                                    className="w-10 h-14 rounded-lg object-cover shrink-0 border border-slate-200 dark:border-slate-700"
                                  />
                                  <div className="min-w-0 flex-1">
                                    <h5 className="text-xs font-black text-slate-900 dark:text-white leading-tight">{book.title}</h5>
                                    {parentCourse && (
                                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 truncate">الدورة: <span className="font-bold">{parentCourse.title}</span></p>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center justify-between border-t border-slate-200/40 dark:border-slate-700/40 pt-2.5 mt-2.5">
                                  <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400">{bookLecturesCount} محاضرة مشروحة</span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setExpandedCourseId(book.courseId);
                                      setExpandedBookId(book.id);
                                      setActiveAdminTab('courses');
                                    }}
                                    className="text-[9px] font-extrabold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-0.5"
                                  >
                                    عرض الكتاب في المنهج <ArrowUpRight className="w-2.5 h-2.5" />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* نتائج البحث: المحاضرات */}
                  {(searchCategory === 'all' || searchCategory === 'lectures') && (
                    <div className="space-y-3">
                      {searchCategory === 'all' && (
                        <h4 className="text-xs font-black text-slate-400 flex items-center gap-1 border-r-2 border-purple-500 pr-2 mt-4">🎙️ المحاضرات والدروس المتطابقة</h4>
                      )}
                      {filteredLectures.length === 0 ? (
                        searchCategory === 'lectures' && <div className="text-xs text-slate-400 text-center py-4">لم يتم العثور على محاضرات متطابقة.</div>
                      ) : (
                        <div className="space-y-3">
                          {filteredLectures.map(lecture => {
                            const parentBook = books.find(b => b.id === lecture.bookId);
                            const parentCourse = courses.find(c => c.id === lecture.courseId);
                            const lectureQuestions = questions.filter(q => q.lectureId === lecture.id);
                            return (
                              <div key={lecture.id} className="p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-purple-400 transition-all">
                                <div className="space-y-1">
                                  <h5 className="text-sm font-black text-slate-900 dark:text-white leading-tight">{lecture.title}</h5>
                                  <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400">
                                    {parentCourse && <span>الدورة: <span className="font-bold">{parentCourse.title}</span></span>}
                                    {parentBook && <span>| المتن والكتاب: <span className="font-bold">{parentBook.title}</span></span>}
                                    {lecture.duration && <span>| مدة المحاضرة: <span className="font-mono font-bold">({lecture.duration})</span></span>}
                                  </div>
                                  <div className="flex flex-wrap gap-1.5 pt-1">
                                    {lecture.videoUrl && <span className="text-[9px] bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 px-1.5 py-0.5 rounded font-extrabold flex items-center gap-0.5"><Video className="w-2.5 h-2.5" /> فيديو</span>}
                                    {lecture.audioUrl && <span className="text-[9px] bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300 px-1.5 py-0.5 rounded font-extrabold flex items-center gap-0.5"><Music className="w-2.5 h-2.5" /> صوت</span>}
                                    {lecture.pdfUrl && <span className="text-[9px] bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400 px-1.5 py-0.5 rounded font-extrabold flex items-center gap-0.5"><FileText className="w-2.5 h-2.5" /> PDF</span>}
                                    <span className="text-[9px] bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 px-1.5 py-0.5 rounded font-extrabold">أسئلة القياس: {lectureQuestions.length}</span>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setExpandedCourseId(lecture.courseId);
                                    setExpandedBookId(lecture.bookId);
                                    setActiveAdminTab('courses');
                                  }}
                                  className="text-[10px] font-extrabold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-0.5 self-end sm:self-center"
                                >
                                  عرض الدرس في المنهج والأسئلة <ArrowUpRight className="w-3 h-3" />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* صف التحليلات الزمنية والدورات النشطة */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* الدروات الأكثر نشاطاً */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-xs space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                  <span>أكثر الدورات نشاطاً واعتماداً للهمم</span>
                </h4>
                <span className="text-[10px] font-bold text-slate-400">مرتبة حسب التقدم والشهادات</span>
              </div>

              {courses.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400">لا توجد دورات مسجلة لعرض تحليلات النشاط.</div>
              ) : (
                <div className="space-y-4">
                  {[...courses]
                    .map(course => {
                      const courseBooks = books.filter(b => b.courseId === course.id);
                      const courseCertCount = sentCertificates.filter(c => c.courseName === course.title).length;
                      const courseReqCount = certRequests.filter(r => r.courseId === course.id).length;
                      const coursePassedCount = latestProgresses.filter(p => p.courseId === course.id && p.isPassed).length;
                      // معامل النشاط: شهادات * 10 + طلبات معلقة * 5 + اختبارات مجتازة * 2 + كتب * 1
                      const score = courseCertCount * 10 + courseReqCount * 5 + coursePassedCount * 2 + courseBooks.length;
                      return { course, bookCount: courseBooks.length, certCount: courseCertCount, reqCount: courseReqCount, score };
                    })
                    .sort((a, b) => b.score - a.score)
                    .map((item, idx) => {
                      // نسبة النشاط النسبية للرسم البياني للتفاعل
                      const maxScore = Math.max(...courses.map((_, i) => 20 - i), 1);
                      const fillPercent = Math.min(Math.round((item.score / (maxScore || 1)) * 100), 100);
                      return (
                        <div key={item.course.id} className="p-3 bg-slate-50 dark:bg-slate-850/20 border border-slate-100 dark:border-slate-800/80 rounded-2xl space-y-2">
                          <div className="flex justify-between items-start gap-3">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span className="text-xs font-black text-slate-400 font-mono shrink-0">#{idx + 1}</span>
                              <div className="min-w-0">
                                <h5 className="text-xs font-black text-slate-900 dark:text-white truncate">{item.course.title}</h5>
                                <p className="text-[9px] text-slate-400 font-bold">يضم {item.bookCount} متناً ومقرراً علمياً</p>
                              </div>
                            </div>
                            <div className="text-left shrink-0">
                              <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 font-mono">{item.certCount + item.reqCount}</span>
                              <span className="text-[8px] text-slate-400 block">شهادات منجزة/مطلوبة</span>
                            </div>
                          </div>
                          
                          {/* شريط النشاط المرئي */}
                          <div className="space-y-1">
                            <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                              <div 
                                className="bg-gradient-to-r from-emerald-500 to-teal-600 h-full rounded-full transition-all duration-1000"
                                style={{ width: `${Math.max(fillPercent, 8)}%` }}
                              ></div>
                            </div>
                            <div className="flex justify-between text-[8px] text-slate-400 font-bold">
                              <span>نشاط التفاعل: {item.score} درجة</span>
                              <span>{fillPercent}% نسبة النشاط</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>

            {/* آخر التسجيلات من الطلاب والطالبات */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-xs space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <Activity className="w-5 h-5 text-emerald-600" />
                  <span>آخر التسجيلات وانضمام الهمم</span>
                </h4>
                <span className="text-[10px] bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 px-2 py-0.5 rounded-full font-bold">طلبة علم جدد</span>
              </div>

              {studentsLoading ? (
                <div className="text-center py-8 text-xs text-slate-400">جاري تحميل قائمة الطلاب والطالبات المسجلين...</div>
              ) : students.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400">لا يوجد طلاب أو طالبات مسجلين في المنصة حالياً.</div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800 space-y-3">
                  {students.slice(0, 5).map(student => (
                    <div 
                      key={student.uid} 
                      onClick={() => openStudentProfile(student.uid, student)}
                      className="flex items-center justify-between pt-3 first:pt-0 gap-3 cursor-pointer group hover:bg-slate-50/60 dark:hover:bg-slate-800/30 p-2 rounded-xl transition-all"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 bg-slate-100 dark:bg-slate-850 text-slate-700 dark:text-slate-300 rounded-full flex items-center justify-center font-extrabold text-xs shrink-0 group-hover:scale-105 transition-transform">
                          {student.name.substring(0, 2)}
                        </div>
                        <div className="min-w-0">
                          <h5 className="text-xs font-black text-slate-900 dark:text-white truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{student.name}</h5>
                          <p className="text-[9px] text-slate-400 font-mono truncate">{student.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                        <span className="text-[9px] font-bold px-1.5 py-0.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 rounded border border-emerald-200/50">
                          📚 {student.completedBooksCount || 0} كتب
                        </span>
                        <span className="text-[9px] font-bold px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded">
                          {student.level || 'مبتدئ'}
                        </span>
                        <button
                          type="button"
                          onClick={() => openStudentProfile(student.uid, student)}
                          className="p-1 text-slate-400 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                          title="متابعة بروفايل واختبارات الطالب/ة"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* آخر اختبارات وقياسات الفهم المكتملة بالتسلسل الزمني */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800 gap-2">
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>آخر الاختبارات وقياسات الفهم المكتملة (مرتبة زمنياً من الأحدث إلى الأقدم)</span>
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5 font-sans">
                  اضغط/ي على اسم أي طالب/ة لمتابعة بروفايله ورصيد نقاطه وسجل جميع اختباراته بالتفصيل
                </p>
              </div>
              <span className="text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 px-2.5 py-1 rounded-full border border-emerald-100 dark:border-emerald-900 shrink-0 self-start sm:self-auto">
                {latestProgresses.length} محاولة مرصودة
              </span>
            </div>

            {progressesLoading ? (
              <div className="text-center py-8 text-xs text-slate-400">جاري تحميل سجل المحاولات...</div>
            ) : latestProgresses.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">لا توجد محاولات اختبار مسجلة حتى الآن. ستظهر هنا بمجرد حل الطلاب والطالبات لاختبارات المحاضرات.</div>
            ) : (
              <div className="overflow-x-auto whitespace-nowrap md:whitespace-normal">
                <table className="w-full text-right text-xs min-w-[700px] md:min-w-0" dir="rtl">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 font-black">
                      <th className="pb-3 pt-1 font-sans text-center w-12"># التسلسل</th>
                      <th className="pb-3 pt-1 font-sans">اسم الطالب/ة (اضغط للمتابعة)</th>
                      <th className="pb-3 pt-1 font-sans">المحاضرة / المجلس</th>
                      <th className="pb-3 pt-1 font-sans">الكتاب / المتن</th>
                      <th className="pb-3 pt-1 font-sans text-center">الدرجة والنسبة</th>
                      <th className="pb-3 pt-1 font-sans text-center">النتيجة</th>
                      <th className="pb-3 pt-1 font-sans text-left">التاريخ والوقت (متى)</th>
                      <th className="pb-3 pt-1 font-sans text-center">المتابعة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
                    {[...latestProgresses]
                      .sort((a, b) => new Date(b.lastAttemptDate || 0).getTime() - new Date(a.lastAttemptDate || 0).getTime())
                      .slice(0, 15)
                      .map((prog, pIdx) => {
                        const matchedStudent = students.find(s => s.uid === prog.studentId);
                        const matchedLecture = lectures.find(l => l.id === prog.lectureId);
                        const matchedBook = books.find(b => b.id === prog.bookId);

                        return (
                          <tr key={`${prog.studentId}-${prog.id || pIdx}`} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/20 transition-colors">
                            <td className="py-3 text-center font-mono font-bold text-slate-400">
                              #{pIdx + 1}
                            </td>
                            <td className="py-3">
                              <button
                                type="button"
                                onClick={() => openStudentProfile(prog.studentId, matchedStudent)}
                                className="font-bold text-slate-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center gap-1.5 text-right group cursor-pointer"
                                title="عرض بروفايل ونقاط واختبارات الطالب/ة"
                              >
                                <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center text-[10px] font-black shrink-0 group-hover:scale-110 transition-transform">
                                  {(matchedStudent?.name || 'ط').substring(0, 2)}
                                </div>
                                <div>
                                  <span className="underline decoration-dotted group-hover:decoration-solid">
                                    {matchedStudent ? matchedStudent.name : 'طالب/ة علم'}
                                  </span>
                                  {matchedStudent?.completedBooksCount !== undefined && (
                                    <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-mono block">
                                      📚 {matchedStudent.completedBooksCount} كتب
                                    </span>
                                  )}
                                </div>
                              </button>
                            </td>
                            <td className="py-3 font-medium text-slate-700 dark:text-slate-300">
                              {matchedLecture ? matchedLecture.title : 'محاضرة تأصيلية'}
                            </td>
                            <td className="py-3 text-slate-500">
                              {matchedBook ? matchedBook.title : 'كتاب المتن'}
                            </td>
                            <td className="py-3 text-center font-mono font-black text-slate-800 dark:text-slate-200">
                              <span className="text-sm">{prog.lastScore}%</span>
                            </td>
                            <td className="py-3 text-center">
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-black inline-flex items-center gap-1 ${
                                prog.isPassed 
                                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-100' 
                                  : 'bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-400 border border-red-100'
                              }`}>
                                {prog.isPassed ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                                {prog.isPassed ? 'اجتياز بنجاح' : 'لم يجتز/تجتز'}
                              </span>
                            </td>
                            <td className="py-3 text-left font-mono text-[10px] text-slate-400">
                              {prog.lastAttemptDate ? new Date(prog.lastAttemptDate).toLocaleString('ar-SA', { dateStyle: 'short', timeStyle: 'short' }) : 'مؤخراً'}
                            </td>
                            <td className="py-3 text-center">
                              <button
                                type="button"
                                onClick={() => openStudentProfile(prog.studentId, matchedStudent)}
                                className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900 text-emerald-700 dark:text-emerald-300 rounded-lg text-[10px] font-bold inline-flex items-center gap-1 transition-all"
                                title="متابعة الطالب/ة وعرض البروفايل والنقاط والاختبارات"
                              >
                                <User className="w-3 h-3" />
                                <span>متابعة البروفايل</span>
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

          {/* ======================= مودال متابعة بروفايل الطالب/ة ورصيد النقاط وسجل الاختبارات بالتسلسل ======================= */}
          {selectedStudentDetail && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 animate-fade-in" dir="rtl">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden text-right">
                
                {/* رأس المودال */}
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 text-white flex justify-between items-center shrink-0">
                  <div className="flex items-center gap-3.5">
                    <div className="w-14 h-14 bg-white/10 rounded-full flex items-center justify-center font-extrabold text-xl text-white shrink-0 border-2 border-emerald-400/30 shadow-inner">
                      {selectedStudentDetail.name.substring(0, 2)}
                    </div>
                    <div>
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 text-[10px] font-bold mb-1">
                        <UserCheck className="w-3 h-3" />
                        <span>بروفايل متابعة الطالب/ة الأكاديمي</span>
                      </div>
                      <h4 className="font-bold text-lg leading-tight">{selectedStudentDetail.name}</h4>
                      <p className="text-xs text-emerald-100/80 font-mono mt-0.5">{selectedStudentDetail.email}</p>
                    </div>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setSelectedStudentDetail(null)}
                    className="p-2 hover:bg-white/10 rounded-full text-white/80 hover:text-white transition-all"
                    title="إغلاق الملف"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* محتوى المودال */}
                <div className="p-6 space-y-6 overflow-y-auto">
                  
                  {/* بطاقة الإنجاز الأكاديمي والكتب المعتمدة */}
                  <div className="p-5 rounded-2xl bg-gradient-to-l from-emerald-500/10 via-teal-500/5 to-transparent border-2 border-emerald-400/40 dark:border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                        <BookOpen className="w-6 h-6 text-emerald-600" />
                      </div>
                      <div>
                        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">إجمالي الكتب والمتون المعتمدة</span>
                        <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                          <span>{selectedStudentDetail.completedBooksCount || 0}</span>
                          <span className="text-xs font-sans text-slate-600 dark:text-slate-300 font-bold">كتب منهية ومعتمدة</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 bg-white/80 dark:bg-slate-850/80 p-3 rounded-xl border border-slate-200/60 dark:border-slate-800">
                      <span className="font-bold text-slate-700 dark:text-slate-200 block mb-0.5">سجل الإنجاز العلمي:</span>
                      <span>الإنجاز محسوب وموثق من واقع اجتياز الاختبارات المنهجية واعتماد المشرفة.</span>
                    </div>
                  </div>

                  {/* إحصائيات الأكاديمية للطالب/ة */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-2xl border border-slate-200/50 dark:border-slate-800 text-center">
                      <span className="text-[10px] text-slate-400 block font-bold mb-1">المستوى الأكاديمي</span>
                      <span className="text-sm font-black text-blue-600 dark:text-blue-400">{selectedStudentDetail.level || 'مبتدئ'}</span>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-2xl border border-slate-200/50 dark:border-slate-800 text-center">
                      <span className="text-[10px] text-slate-400 block font-bold mb-1">الورد والاستمرار</span>
                      <span className="text-sm font-black text-red-600 dark:text-red-400">🔥 {selectedStudentDetail.streak || 0} أيام متصلة</span>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-2xl border border-slate-200/50 dark:border-slate-800 text-center">
                      <span className="text-[10px] text-slate-400 block font-bold mb-1">المتون المنجزة</span>
                      <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">📜 {selectedStudentDetail.completedMutunCount || 0} متون</span>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-2xl border border-slate-200/50 dark:border-slate-800 text-center">
                      <span className="text-[10px] text-slate-400 block font-bold mb-1">المتون والكتب المنهية</span>
                      <span className="text-sm font-black text-teal-600 dark:text-teal-400">📚 {selectedStudentDetail.completedBooksCount || 0} كتب</span>
                    </div>
                  </div>

                  {/* بيانات الاتصال والتفاصيل */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200/50 dark:border-slate-800 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 font-bold">تاريخ الانضمام للمنصة:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">
                        {selectedStudentDetail.joinDate || (selectedStudentDetail.createdAt ? new Date(selectedStudentDetail.createdAt).toLocaleDateString('ar-SA') : 'غير متوفر')}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 font-bold">البريد الإلكتروني:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200 font-mono truncate max-w-[180px]">{selectedStudentDetail.email}</span>
                    </div>
                    {selectedStudentDetail.bio && (
                      <div className="sm:col-span-2 border-t border-slate-200/40 dark:border-slate-700/40 pt-2 mt-1">
                        <span className="text-slate-400 font-bold block mb-1">النبذة الشخصية:</span>
                        <p className="text-slate-700 dark:text-slate-300 font-medium italic">{selectedStudentDetail.bio}</p>
                      </div>
                    )}
                  </div>

                  {/* ================= قسم سجل الاختبارات وقياسات الفهم المكتملة بالتسلسل الزمني ================= */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-800">
                      <h5 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                        <Award className="w-4 h-4 text-emerald-600" />
                        <span>سجل الاختبارات وقياسات الفهم المكتملة (من الأحدث إلى الأقدم بالتسلسل)</span>
                      </h5>
                      <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-2.5 py-0.5 rounded-full">
                        {studentSpecificTests.length} اختبار منجز
                      </span>
                    </div>

                    {loadingStudentTests ? (
                      <div className="text-center py-6 text-xs text-slate-400">جاري فحص وتجميع سجل اختبارات الطالب/ة...</div>
                    ) : studentSpecificTests.length === 0 ? (
                      <div className="text-center py-8 bg-slate-50 dark:bg-slate-800/30 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-xs text-slate-400">
                        لا توجد اختبارات مسجلة لهذا الطالب/ة حتى الآن.
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-right text-xs border-collapse" dir="rtl">
                          <thead>
                            <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 font-black">
                              <th className="py-2.5 px-3 text-center w-12"># التسلسل</th>
                              <th className="py-2.5 px-3">المجلس العلمي / المحاضرة</th>
                              <th className="py-2.5 px-3">الكتاب والمقرر</th>
                              <th className="py-2.5 px-3 text-center">الدرجة والنسبة</th>
                              <th className="py-2.5 px-3 text-center">حالة الاجتياز</th>
                              <th className="py-2.5 px-3 text-left">التاريخ والوقت (متى)</th>
                              <th className="py-2.5 px-3 text-center">المحاولات</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                            {studentSpecificTests.map((test, tIdx) => {
                              const lec = lectures.find(l => l.id === test.lectureId);
                              const book = books.find(b => b.id === (test.bookId || lec?.bookId));
                              const score = test.lastScore ?? test.bestScore ?? 0;
                              const isPassed = test.isPassed || score >= 60;

                              return (
                                <tr key={test.id || tIdx} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                  <td className="py-3 px-3 text-center font-mono font-black text-slate-400">
                                    <span className="inline-block px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px]">
                                      #{tIdx + 1}
                                    </span>
                                  </td>
                                  <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">
                                    {lec ? lec.title : 'محاضرة تأصيلية'}
                                    {lec?.isFinalSession && (
                                      <span className="mr-1.5 text-[9px] bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 px-1.5 py-0.5 rounded font-black">
                                        المجلس الختامي 🎓
                                      </span>
                                    )}
                                  </td>
                                  <td className="py-3 px-3 text-slate-500 font-medium">
                                    {book ? book.title : 'كتاب المقرر'}
                                  </td>
                                  <td className="py-3 px-3 text-center font-mono font-black">
                                    <span className={`text-sm ${score >= 60 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                                      {score}%
                                    </span>
                                    {test.bestScore !== undefined && test.bestScore !== score && (
                                      <span className="block text-[9px] text-slate-400 font-normal">
                                        الأعلى: {test.bestScore}%
                                      </span>
                                    )}
                                  </td>
                                  <td className="py-3 px-3 text-center">
                                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black inline-flex items-center gap-1 ${
                                      isPassed 
                                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-100' 
                                        : 'bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-400 border border-red-100'
                                    }`}>
                                      {isPassed ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                                      {isPassed ? 'اجتياز بنجاح' : 'لم يجتز/تجتز'}
                                    </span>
                                  </td>
                                  <td className="py-3 px-3 text-left font-mono text-[10px] text-slate-400">
                                    {test.lastAttemptDate ? new Date(test.lastAttemptDate).toLocaleString('ar-SA', { dateStyle: 'medium', timeStyle: 'short' }) : 'مؤخراً'}
                                  </td>
                                  <td className="py-3 px-3 text-center font-mono text-slate-500 text-[10px]">
                                    {test.attemptsCount || 1} محاولات
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {/* سجل الشهادات الصادرة للطالب/ة */}
                  <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <h5 className="font-bold text-xs text-slate-500 flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-amber-500" />
                      <span>الشهادات الممنوحة المعتمدة للطالب/ة:</span>
                    </h5>
                    {sentCertificates.filter(c => c.studentId === selectedStudentDetail.uid).length === 0 ? (
                      <div className="text-center py-4 bg-slate-50 dark:bg-slate-800/20 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-[10px] text-slate-400">
                        لم يتم منح شهادات علمية لهذا الطالب/ة بعد.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {sentCertificates
                          .filter(c => c.studentId === selectedStudentDetail.uid)
                          .map(cert => (
                            <div key={cert.id} className="p-3 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900 rounded-xl flex items-center justify-between gap-3 text-xs">
                              <div>
                                <h6 className="font-bold text-slate-900 dark:text-emerald-300 leading-tight">{cert.bookName}</h6>
                                <p className="text-[9px] text-slate-400 font-mono mt-0.5">الرقم المرجعي: {cert.certificateNumber}</p>
                              </div>
                              <span className="text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-2 py-0.5 rounded font-black font-mono shrink-0">
                                {cert.date}
                              </span>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* قدم المودال مع إجراءات سريعة */}
                <div className="p-6 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-900/60 flex justify-between gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setCertStudentName(selectedStudentDetail.name);
                      setSelectedStudentDetail(null);
                      setActiveAdminTab('certificates');
                    }}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-md"
                  >
                    <Award className="w-4 h-4" />
                    <span>إصدار شهادة مباشرة للطالب/ة</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedStudentDetail(null)}
                    className="px-5 py-2.5 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    إغلاق الملف
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* قائمة الدورات وإدارتها الهرمية */}
      {activeAdminTab === 'courses' && (() => {
        const topLevelCourses = getTopLevelCourses(courses);
        const orphanChildCourses = courses.filter(c => isChildCourse(c) && !courses.some(p => p.id === c.parentCourseId));

        if (courses.length === 0) {
          return (
            <div className="bg-white dark:bg-slate-900 border-2 border-dashed border-slate-300 dark:border-slate-800 rounded-3xl p-12 text-center text-slate-500">
              لا توجد دورات مسجلة حالياً. قم بإضافة أول دورة علمية لتظهر للطلاب والطالبات.
            </div>
          );
        }

        // دالة مساعدة لعرض كتب ومحاضرات أي دورة أو مستوى
        const renderCourseBooks = (targetCourse: Course) => {
          const courseBooks = books.filter(b => b.courseId === targetCourse.id);
          return (
            <div className="border-t border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 p-5 rounded-b-3xl space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h4 className="font-bold text-sm text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-emerald-600" />
                  <span>الكتب والمقررات الدراسية داخل «{targetCourse.title}» ({courseBooks.length})</span>
                </h4>
                <button
                  type="button"
                  onClick={() => openBookEditor(targetCourse.id, { title: '', imageUrl: '', order: courseBooks.length })}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all self-start sm:self-auto"
                >
                  <FolderPlus className="w-3.5 h-3.5" />
                  <span>إضافة كتاب جديد</span>
                </button>
              </div>

              {courseBooks.length === 0 ? (
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 text-center text-xs text-slate-400 border border-slate-200 dark:border-slate-700">
                  لم يتم إدراج كتب لهذه الدورة بعد. اضغط على «إضافة كتاب جديد» للبدء.
                </div>
              ) : (
                <div className="grid gap-3.5">
                  {courseBooks.map((book, bIdx) => {
                    const isBookExpanded = expandedBookId === book.id;
                    const bookLectures = lectures.filter(l => l.bookId === book.id);

                    return (
                      <div key={book.id} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-2xl shadow-xs overflow-hidden">
                        {/* شريط الكتاب */}
                        <div className="p-3.5 flex items-center justify-between gap-3 bg-slate-50/80 dark:bg-slate-800/80">
                          <div className="flex items-center gap-3 cursor-pointer flex-1 min-w-0" onClick={() => setExpandedBookId(isBookExpanded ? null : book.id)}>
                            <span className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 font-bold text-xs flex items-center justify-center font-mono shrink-0">
                              {bIdx + 1}
                            </span>
                            <CoverImage
                              src={book.imageUrl}
                              alt={book.title}
                              type="book"
                              className="w-9 h-12 rounded-lg object-cover shrink-0 border border-slate-200 dark:border-slate-700"
                            />
                            <div className="min-w-0 flex-1">
                              <h5 className="font-bold text-sm text-slate-900 dark:text-white truncate">{book.title}</h5>
                              <span className="text-xs text-slate-400">({bookLectures.length} محاضرة)</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => moveBook(targetCourse.id, bIdx, 'up')}
                              disabled={bIdx === 0}
                              className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg disabled:opacity-30 text-slate-500"
                              title="تحريك لأعلى"
                            >
                              <MoveUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => moveBook(targetCourse.id, bIdx, 'down')}
                              disabled={bIdx === courseBooks.length - 1}
                              className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg disabled:opacity-30 text-slate-500"
                              title="تحريك لأسفل"
                            >
                              <MoveDown className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => openBookEditor(targetCourse.id, book)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg ml-1"
                              title="تعديل الكتاب"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteBook(book.id, book.title)}
                              className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg"
                              title="حذف الكتاب"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setExpandedBookId(isBookExpanded ? null : book.id)}
                              className="p-1.5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg"
                              title={isBookExpanded ? 'طي المحاضرات' : 'عرض المحاضرات'}
                            >
                              {isBookExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        {/* قائمة المحاضرات داخل الكتاب */}
                        {isBookExpanded && (
                          <div className="p-4 border-t border-slate-100 dark:border-slate-700/60 space-y-3">
                            <div className="flex justify-between items-center pb-2">
                              <span className="text-xs font-bold text-slate-500">الدروس والمحاضرات في هذا المتن:</span>
                              <button
                                type="button"
                                onClick={() => setEditingLecture({ bookId: book.id, courseId: targetCourse.id, lecture: { title: '', description: '', notes: '', videoUrl: '', audioUrl: '', pdfUrl: '', duration: '30:00', order: bookLectures.length } })}
                                className="bg-slate-900 hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 text-white px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs"
                              >
                                <Plus className="w-3.5 h-3.5" />
                                <span>إضافة درس / محاضرة</span>
                              </button>
                            </div>

                            {bookLectures.length === 0 ? (
                              <div className="text-center py-4 text-xs text-slate-400 bg-slate-50 dark:bg-slate-900/40 rounded-xl">
                                لا توجد محاضرات مسجلة في هذا الكتاب.
                              </div>
                            ) : (
                              <div className="space-y-2">
                                {bookLectures.map((lec, lIdx) => {
                                  const qCount = questions.filter(q => q.lectureId === lec.id).length;

                                  return (
                                    <div key={lec.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 rounded-2xl hover:border-emerald-300 transition-colors gap-3">
                                      <div className="flex items-start gap-3">
                                        <span className="font-mono text-xs text-slate-400 mt-0.5">{lIdx + 1}.</span>
                                        <div>
                                          <div className="flex items-center gap-2">
                                            <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{lec.title}</span>
                                            {lec.duration && <span className="text-[10px] text-slate-400 font-mono">({lec.duration})</span>}
                                          </div>
                                          {lec.description && <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">{lec.description}</p>}
                                          <div className="flex items-center gap-2 mt-1.5">
                                            {lec.videoUrl && <span className="text-[10px] bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-md flex items-center gap-1 font-bold"><Video className="w-3 h-3" /> فيديو</span>}
                                            {lec.audioUrl && <span className="text-[10px] bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-md flex items-center gap-1 font-bold"><Music className="w-3 h-3" /> صوت</span>}
                                            {lec.pdfUrl && <span className="text-[10px] bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-md flex items-center gap-1 font-bold"><FileText className="w-3 h-3" /> PDF</span>}
                                          </div>
                                        </div>
                                      </div>

                                      <div className="flex items-center justify-end gap-1 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200 dark:border-slate-800">
                                        <button
                                          type="button"
                                          onClick={() => setActiveQuizLecture(lec)}
                                          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs ${
                                            qCount > 0 
                                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700'
                                              : 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 hover:bg-amber-200'
                                          }`}
                                        >
                                          <HelpCircle className="w-3.5 h-3.5" />
                                          <span>اختبار القياس ({qCount})</span>
                                        </button>

                                        <button type="button" onClick={() => moveLecture(book.id, lIdx, 'up')} disabled={lIdx === 0} className="p-1.5 text-slate-400 hover:text-slate-600 disabled:opacity-20"><MoveUp className="w-3.5 h-3.5" /></button>
                                        <button type="button" onClick={() => moveLecture(book.id, lIdx, 'down')} disabled={lIdx === bookLectures.length - 1} className="p-1.5 text-slate-400 hover:text-slate-600 disabled:opacity-20"><MoveDown className="w-3.5 h-3.5" /></button>
                                        <button type="button" onClick={() => setEditingLecture({ bookId: book.id, courseId: targetCourse.id, lecture: lec })} className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-xl"><Edit2 className="w-3.5 h-3.5" /></button>
                                        <button type="button" onClick={() => handleDeleteLecture(lec.id, lec.title)} className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl"><Trash2 className="w-3.5 h-3.5" /></button>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        };

        return (
          <div className="space-y-5">
            {topLevelCourses.map((course, cIdx) => {
              const isMaster = isMasterCourse(course);
              const isStandalone = isStandaloneCourse(course);
              const isExpanded = expandedCourseId === course.id;
              const childCourses = isMaster ? getChildCourses(course.id, courses) : [];
              const directBooks = books.filter(b => b.courseId === course.id);

              return (
                <div 
                  key={course.id}
                  className={`bg-white dark:bg-slate-900 border rounded-3xl transition-all shadow-sm ${
                    !course.isVisible 
                      ? 'border-amber-300/60 dark:border-amber-700/40 opacity-80' 
                      : isMaster
                        ? 'border-indigo-200 dark:border-indigo-900/60 ring-1 ring-indigo-500/10'
                        : 'border-slate-200 dark:border-slate-800'
                  }`}
                >
                  {/* شريط الدورة الأساسي */}
                  <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4 cursor-pointer flex-1" onClick={() => setExpandedCourseId(isExpanded ? null : course.id)}>
                      <div className="relative shrink-0">
                        <CoverImage
                          src={course.imageUrl}
                          alt={course.title}
                          type="course"
                          className="w-16 h-16 rounded-2xl object-cover bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                        />
                        {isMaster && (
                          <div className="absolute -bottom-1 -right-1 bg-indigo-600 text-white p-1 rounded-lg shadow-xs">
                            <Layers className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-lg">
                            ترتيب #{cIdx + 1}
                          </span>

                          {isMaster ? (
                            <span className="text-xs bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 px-2.5 py-0.5 rounded-lg font-bold flex items-center gap-1.5 border border-indigo-200/50">
                              <Layers className="w-3.5 h-3.5 text-indigo-600" />
                              <span>دورة رئيسية جامعة (مسار تأصيلي)</span>
                              <span className="bg-indigo-200/80 dark:bg-indigo-900/60 text-indigo-800 dark:text-indigo-200 px-1.5 py-0.2 rounded-md font-mono text-[11px]">
                                {childCourses.length} {childCourses.length === 1 ? 'مستوى فرعي' : 'مستويات'}
                              </span>
                            </span>
                          ) : isStandalone ? (
                            <span className="text-xs bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 px-2.5 py-0.5 rounded-lg font-bold flex items-center gap-1 border border-purple-200/50">
                              <Sparkles className="w-3 h-3 text-amber-500" />
                              <span>دورة قصيرة مستقلة (حرة)</span>
                            </span>
                          ) : course.prerequisiteCourseId ? (
                            <span className="text-xs bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 px-2.5 py-0.5 rounded-lg font-bold flex items-center gap-1 border border-blue-200/50">
                              <Link2 className="w-3 h-3 text-blue-500" />
                              <span>تفتح بعد: «{courses.find(c => c.id === course.prerequisiteCourseId)?.title || 'الدورة المشروطة'}»</span>
                            </span>
                          ) : (
                            <span className="text-xs bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 px-2.5 py-0.5 rounded-lg font-bold flex items-center gap-1">
                              <Unlock className="w-3 h-3 text-emerald-500" />
                              <span>دورة عامة مفتوحة</span>
                            </span>
                          )}

                          {!course.isVisible && (
                            <span className="text-xs bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-lg font-bold">
                              مخفية عن الطلاب والطالبات
                            </span>
                          )}
                        </div>

                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1">{course.title}</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">{course.description}</p>
                      </div>
                    </div>

                    {/* أدوات تحكم الدورة في المستوى الأعلى */}
                    <div className="flex items-center justify-end gap-1.5 border-t md:border-t-0 pt-3 md:pt-0 border-slate-100 dark:border-slate-800">
                      <button
                        type="button"
                        onClick={() => moveTopLevelCourse(cIdx, 'up')}
                        disabled={cIdx === 0}
                        title="تحريك للأعلى"
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl disabled:opacity-30 text-slate-600 dark:text-slate-400"
                      >
                        <MoveUp className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveTopLevelCourse(cIdx, 'down')}
                        disabled={cIdx === topLevelCourses.length - 1}
                        title="تحريك للأسفل"
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl disabled:opacity-30 text-slate-600 dark:text-slate-400"
                      >
                        <MoveDown className="w-4 h-4" />
                      </button>
                      <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-1" />
                      <button
                        type="button"
                        onClick={() => toggleCourseVisibility(course)}
                        title={course.isVisible ? 'إخفاء الدورة' : 'إظهار الدورة'}
                        className={`p-2 rounded-xl transition-colors ${
                          course.isVisible ? 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40' : 'text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40'
                        }`}
                      >
                        {course.isVisible ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => openCourseEditor(course)}
                        title="تعديل بيانات الدورة"
                        className="p-2 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-blue-600 rounded-xl"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteCourse(course.id, course.title)}
                        title="حذف الدورة"
                        className="p-2 hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600 rounded-xl"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setExpandedCourseId(isExpanded ? null : course.id)}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl bg-slate-50 dark:bg-slate-800/60 ml-1"
                        title={isExpanded ? 'طي المحتوى' : 'عرض المحتوى'}
                      >
                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {/* المحتوى الداخلي عند التوسيع */}
                  {isExpanded && (
                    isMaster ? (
                      /* إدارة المستويات والدورات الفرعية داخل الدورة الرئيسية الجامعة */
                      <div className="border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 p-6 rounded-b-3xl space-y-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-indigo-50/70 dark:bg-indigo-950/40 p-4 rounded-2xl border border-indigo-100 dark:border-indigo-900/60">
                          <div>
                            <h4 className="font-bold text-sm text-indigo-950 dark:text-indigo-200 flex items-center gap-2">
                              <Layers className="w-4 h-4 text-indigo-600" />
                              <span>المستويات والدورات الفرعية المندرجة تحت «{course.title}» ({childCourses.length})</span>
                            </h4>
                            <p className="text-xs text-indigo-700/80 dark:text-indigo-300/80 mt-0.5">
                              يدرس الطالب المستويات بالتتابع؛ يُفتح المستوى التالي تلقائياً عند إتمام واجتياز المستوى الذي قبله.
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              const lastChild = childCourses.length > 0 ? childCourses[childCourses.length - 1] : null;
                              openCourseEditor({
                                title: '',
                                description: '',
                                courseType: 'sequential',
                                isMasterCourse: false,
                                parentCourseId: course.id,
                                prerequisiteCourseId: lastChild ? lastChild.id : null,
                                order: childCourses.length,
                                imageUrl: course.imageUrl || '',
                                isVisible: true
                              });
                            }}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all shrink-0 self-start sm:self-auto"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>+ إضافة مستوى جديد في هذه الدورة 📑</span>
                          </button>
                        </div>

                        {childCourses.length === 0 ? (
                          <div className="bg-white dark:bg-slate-800/80 rounded-2xl p-8 text-center text-xs text-slate-400 border border-dashed border-indigo-200 dark:border-indigo-900/60 space-y-2">
                            <p className="font-bold text-slate-600 dark:text-slate-300">لم تتم إضافة أي مستويات فرعية داخل هذه الدورة الكبيرة بعد.</p>
                            <p>اضغط على «إضافة مستوى جديد في هذه الدورة» لإضافة المستويات (مثلاً: المستوى التمهيدي، المستوى الأول، المستوى الثاني...).</p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {childCourses.map((subCourse, subIdx) => {
                              const isSubExpanded = expandedSubCourseId === subCourse.id;
                              const subPrereq = subCourse.prerequisiteCourseId 
                                ? childCourses.find(c => c.id === subCourse.prerequisiteCourseId) || courses.find(c => c.id === subCourse.prerequisiteCourseId)
                                : (subIdx > 0 ? childCourses[subIdx - 1] : null);
                              const subBooks = books.filter(b => b.courseId === subCourse.id);

                              return (
                                <div 
                                  key={subCourse.id}
                                  className="bg-white dark:bg-slate-800/90 border border-indigo-100 dark:border-indigo-900/60 rounded-2xl shadow-2xs overflow-hidden"
                                >
                                  {/* شريط المستوى الفرعي */}
                                  <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/80 dark:bg-slate-800/80">
                                    <div 
                                      className="flex items-center gap-3 cursor-pointer flex-1"
                                      onClick={() => setExpandedSubCourseId(isSubExpanded ? null : subCourse.id)}
                                    >
                                      <span className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-bold text-xs flex items-center justify-center font-mono shrink-0">
                                        م {subIdx + 1}
                                      </span>
                                      <div>
                                        <div className="flex flex-wrap items-center gap-1.5">
                                          <h5 className="font-bold text-sm text-slate-900 dark:text-white">{subCourse.title}</h5>
                                          <span className="text-xs text-slate-400">({subBooks.length} كتب)</span>
                                          {subIdx === 0 && !subCourse.prerequisiteCourseId ? (
                                            <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-md font-bold flex items-center gap-0.5">
                                              <Unlock className="w-3 h-3" /> المستوى الأول (مفتوح مباشرة)
                                            </span>
                                          ) : (
                                            <span className="text-[10px] bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-md font-bold flex items-center gap-0.5">
                                              <Lock className="w-3 h-3 text-amber-600" /> يفتح بعد: «{subPrereq?.title || 'المستوى السابق'}»
                                            </span>
                                          )}
                                          {!subCourse.isVisible && (
                                            <span className="text-[10px] bg-amber-100 dark:bg-amber-950 text-amber-700 px-1.5 py-0.5 rounded-md font-bold">
                                              مخفي
                                            </span>
                                          )}
                                        </div>
                                        {subCourse.description && (
                                          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">{subCourse.description}</p>
                                        )}
                                      </div>
                                    </div>

                                    {/* أزرار تحكم المستوى */}
                                    <div className="flex items-center gap-1 self-end sm:self-auto">
                                      <button
                                        type="button"
                                        onClick={() => moveChildCourse(course.id, subIdx, 'up')}
                                        disabled={subIdx === 0}
                                        className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg disabled:opacity-30 text-slate-500"
                                        title="تحريك المستوى لأعلى"
                                      >
                                        <MoveUp className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => moveChildCourse(course.id, subIdx, 'down')}
                                        disabled={subIdx === childCourses.length - 1}
                                        className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg disabled:opacity-30 text-slate-500"
                                        title="تحريك المستوى لأسفل"
                                      >
                                        <MoveDown className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => toggleCourseVisibility(subCourse)}
                                        className={`p-1.5 rounded-lg ${subCourse.isVisible ? 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40' : 'text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40'}`}
                                        title={subCourse.isVisible ? 'إخفاء المستوى' : 'إظهار المستوى'}
                                      >
                                        {subCourse.isVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => openCourseEditor(subCourse)}
                                        className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg"
                                        title="تعديل هذا المستوى"
                                      >
                                        <Edit2 className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteCourse(subCourse.id, subCourse.title)}
                                        className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg"
                                        title="حذف هذا المستوى"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setExpandedSubCourseId(isSubExpanded ? null : subCourse.id)}
                                        className="p-1.5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg"
                                        title={isSubExpanded ? 'طي المقررات' : 'عرض المقررات'}
                                      >
                                        {isSubExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                      </button>
                                    </div>
                                  </div>

                                  {/* كتب ومحاضرات هذا المستوى */}
                                  {isSubExpanded && renderCourseBooks(subCourse)}
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* في حال وجود كتب مباشرة مرتبطة بالدورة الكبيرة نفسها */}
                        {directBooks.length > 0 && (
                          <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                            <h4 className="text-xs font-bold text-slate-500 mb-3">كتب مرفقة مباشرة بالدورة الرئيسية:</h4>
                            {renderCourseBooks(course)}
                          </div>
                        )}
                      </div>
                    ) : (
                      /* عرض الكتب والمحاضرات للدورات المستقلة أو العادية */
                      renderCourseBooks(course)
                    )
                  )}
                </div>
              );
            })}

            {/* قسم الدورات الفرعية غير المربوطة إن وجدت كاحتياط أمان */}
            {orphanChildCourses.length > 0 && (
              <div className="bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-3xl p-6 space-y-4">
                <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold text-sm">
                  <ShieldAlert className="w-4 h-4" />
                  <span>مستويات فرعية بحاجة لربط بمسار رئيسي ({orphanChildCourses.length})</span>
                </div>
                <div className="space-y-3">
                  {orphanChildCourses.map(orphan => (
                    <div key={orphan.id} className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-amber-200 dark:border-amber-800 flex items-center justify-between gap-3">
                      <div>
                        <h5 className="font-bold text-sm text-slate-900 dark:text-white">{orphan.title}</h5>
                        <p className="text-xs text-slate-400">دورة فرعية غير مرتبطة بمسار قائم. يمكنك تعديلها وتحديد الدورة الرئيسية التابعة لها.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => openCourseEditor(orphan)}
                        className="bg-amber-600 hover:bg-amber-700 text-white px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>تعديل وربط</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {/* ========================================================================= */}
      {/* =================== قسم إدارة شهادات الطلاب والطالبات =================== */}
      {/* ========================================================================= */}
      {activeAdminTab === 'certificates' && (
        <div className="space-y-6">
          {/* طلبات الشهادات الواردة */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-xs">
            <h3 className="font-bold text-lg font-sans mb-1 flex items-center gap-2 text-slate-900 dark:text-white">
              <UserCheck className="w-5 h-5 text-emerald-600" />
              <span>طلبات واعتمادات الشهادات الواردة</span>
              <span className="bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-400 text-xs px-2 py-0.5 rounded-full font-bold">
                {certRequests.filter(r => r.status === 'pending').length} معلقة
              </span>
            </h3>
            <p className="text-xs text-slate-500 mb-6">تظهر هنا أسماء الطلاب والطالبات الذين أتموا دراسة جميع محاضرات الكتاب واجتازوا اختباراتها بنجاح، أو الذين اجتازوا اختبار المجلس الختامي للكتاب.</p>

            {certRequests.filter(r => r.status === 'pending').length === 0 ? (
              <div className="p-8 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400">
                لا توجد طلبات شهادات معلقة حالياً. عندما ينهي طالب/ة متطلبات كتاب بالكامل أو يجتاز المجلس الختامي، سيظهر طلبه/ا هنا تلقائياً لتقوم/ي باعتماده.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {certRequests.filter(r => r.status === 'pending').map(req => (
                  <div key={req.id} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex flex-col justify-between gap-3 shadow-2xs">
                    <div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 px-2.5 py-0.5 rounded-md font-bold">
                            طلب معلق
                          </span>
                          {req.isFinalSession && (
                            <span className="text-xs bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 px-2.5 py-0.5 rounded-md font-bold animate-pulse flex items-center gap-1">
                              🎓 المجلس الختامي
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {new Date(req.timestamp).toLocaleDateString('ar-SA')}
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-slate-950 dark:text-white mt-2">الطالب/ة: {req.studentName}</h4>
                      <p className="text-xs text-slate-500">{req.studentEmail}</p>
                      
                      <div className="mt-2 text-xs bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700/60">
                        <p>الدورة: <strong className="text-slate-800 dark:text-slate-200">{req.courseTitle}</strong></p>
                        <p className="mt-1">الكتاب / المتن: <strong className="text-emerald-700 dark:text-emerald-400">{req.bookTitle}</strong></p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <button
                        onClick={() => {
                          setIssuingRequest(req);
                          setCertStudentName(req.studentName);
                          setCertCourseName(req.courseTitle);
                          setCertBookName(req.bookTitle);
                          setCertDate(new Date().toLocaleDateString('ar-SA') + ' هـ');
                          setCertNumber(`CERT-SH-${Math.floor(1000 + Math.random() * 9000)}-${new Date().getFullYear()}`);
                        }}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 rounded-xl flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
                      >
                        <FileCheck2 className="w-3.5 h-3.5" />
                        <span>اعتماد وإصدار الشهادة</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setConfirmState({
                            isOpen: true,
                            title: "تأكيد حذف طلب الشهادة",
                            message: "هل أنت متأكد/ة من حذف هذا الطلب؟",
                            onConfirm: async () => {
                              try {
                                await deleteRequest(req.id);
                                showSuccess("تم حذف الطلب", "تمت إزالة طلب إصدار الشهادة بنجاح.");
                              } catch (err) {
                                console.error("Failed to delete request:", err);
                                showError("فشل حذف الطلب", err instanceof Error ? err.message : "حدث خطأ أثناء محاولة حذف الطلب.");
                              }
                            }
                          });
                        }}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition-colors border border-red-200 dark:border-red-900/40"
                        title="حذف الطلب"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* قائمة الشهادات الصادرة سابقاً */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-xs">
            <h3 className="font-bold text-lg font-sans mb-1 flex items-center gap-2 text-slate-900 dark:text-white">
              <Award className="w-5 h-5 text-amber-500" />
              <span>الشهادات المعتمدة المصدرة للطلاب والطالبات</span>
              <span className="bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-400 text-xs px-2 py-0.5 rounded-full font-bold">
                {sentCertificates.length} معتمدة
              </span>
            </h3>
            <p className="text-xs text-slate-500 mb-6 font-sans">تظهر هنا جميع الشهادات الشرعية التي تم إرسالها للطلاب والطالبات بمحاضر الإنجاز.</p>

            {sentCertificates.length === 0 ? (
              <div className="p-8 rounded-2xl bg-slate-50 dark:bg-slate-800/40 text-center text-xs text-slate-400 italic">
                لم يتم إصدار أي شهادات رسمية بعد. قم/قومي باعتماد الطلبات الواردة لتظهر هنا.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-right border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold">
                      <th className="py-3 px-4">رقم الشهادة</th>
                      <th className="py-3 px-4">اسم الطالب/ة</th>
                      <th className="py-3 px-4">الدورة</th>
                      <th className="py-3 px-4">الكتاب المنجز</th>
                      <th className="py-3 px-4">تاريخ الاعتماد</th>
                      <th className="py-3 px-4 text-left">أدوات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sentCertificates.map(cert => (
                      <tr key={cert.id} className="border-b border-slate-100 dark:border-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-800/20">
                        <td className="py-3 px-4 font-mono font-bold text-amber-600 dark:text-amber-400">{cert.certificateNumber}</td>
                        <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{cert.studentName}</td>
                        <td className="py-3 px-4 text-slate-500">{cert.courseName}</td>
                        <td className="py-3 px-4 font-semibold text-emerald-700 dark:text-emerald-400">{cert.bookName}</td>
                        <td className="py-3 px-4 text-slate-400">{cert.date}</td>
                        <td className="py-3 px-4 text-left">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setConfirmState({
                                isOpen: true,
                                title: "سحب وإلغاء الشهادة",
                                message: `هل أنت متأكد/ة من رغبتك في سحب وإلغاء الشهادة رقم ${cert.certificateNumber} الصادرة للطالب/ة ${cert.studentName}؟`,
                                onConfirm: async () => {
                                  try {
                                    await deleteCertificate(cert.id);
                                    showSuccess("تم إلغاء الشهادة", "تم سحب وإلغاء الشهادة بنجاح من النظام.");
                                  } catch (err) {
                                    console.error("Failed to delete certificate:", err);
                                    showError("فشل إلغاء الشهادة", err instanceof Error ? err.message : "حدث خطأ أثناء محاولة إلغاء الشهادة.");
                                  }
                                }
                              });
                            }}
                            className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg"
                            title="سحب وإلغاء الشهادة"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* =================== قسم الاستيراد الذكي للمحاضرات (جديد) ================= */}
      {/* ========================================================================= */}
      {activeAdminTab === 'smart_import' && (
        <SmartLectureImport 
          courses={courses}
          books={books}
          lectures={lectures}
          questions={questions}
        />
      )}

      {/* --- نافذة اعتماد وإصدار شهادة نجاح جديدة --- */}
      {issuingRequest && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 text-right">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              صياغة وإصدار الشهادة الرسمية للطالب/ة
            </h3>
            <p className="text-xs text-slate-400">
              يرجى مراجعة الصياغة الشرعية المعتمدة قبل ترحيل الشهادة وإرسالها لصندوق الطالب/ة.
            </p>

            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold mb-1 text-slate-700 dark:text-slate-300">اسم الطالب/ة (ثلاثي كما يظهر بالشهادة)</label>
                <input 
                  type="text" 
                  value={certStudentName} 
                  onChange={e => setCertStudentName(e.target.value)}
                  placeholder="اسم الطالب/ة"
                  className="w-full px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1 text-slate-700 dark:text-slate-300">اسم الدورة العلمية</label>
                <input 
                  type="text" 
                  value={certCourseName} 
                  onChange={e => setCertCourseName(e.target.value)}
                  placeholder="اسم الدورة"
                  className="w-full px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1 text-slate-700 dark:text-slate-300">اسم الكتاب / المقرر المنجز</label>
                <input 
                  type="text" 
                  value={certBookName} 
                  onChange={e => setCertBookName(e.target.value)}
                  placeholder="اسم الكتاب"
                  className="w-full px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-bold text-emerald-700 dark:text-emerald-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold mb-1 text-slate-700 dark:text-slate-300">تاريخ إصدار الشهادة</label>
                  <input 
                    type="text" 
                    value={certDate} 
                    onChange={e => setCertDate(e.target.value)}
                    placeholder="تاريخ اليوم"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1 text-slate-700 dark:text-slate-300">رقم الشهادة التسلسلي</label>
                  <input 
                    type="text" 
                    value={certNumber} 
                    onChange={e => setCertNumber(e.target.value)}
                    placeholder="رقم الشهادة"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono font-bold text-amber-600"
                  />
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
                <label className="block text-xs font-extrabold text-slate-800 dark:text-slate-200">ملف الشهادة الموقعة (اختياري - رفع PDF أو صورة)</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={certFileUrl} 
                    onChange={e => setCertFileUrl(e.target.value)}
                    placeholder="رابط ملف الشهادة المرفوع..."
                    className="flex-1 px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono text-left"
                    dir="ltr"
                  />
                  <label className="bg-emerald-600 hover:bg-emerald-700 text-white p-2.5 rounded-xl text-xs font-bold cursor-pointer flex items-center justify-center shrink-0">
                    <Upload className="w-4 h-4" />
                    <input type="file" accept="image/*,application/pdf" onChange={e => handleFileUpload(e, 'certFileUrl')} className="hidden" />
                  </label>
                </div>

                {selectedFiles['certFileUrl'] && (
                  <div className="p-3 bg-emerald-50/50 dark:bg-emerald-950/10 border border-dashed border-emerald-500 rounded-xl flex items-center justify-between gap-2 mt-2">
                    <div className="flex items-center gap-1.5 text-right">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight">
                        📄 تم إرفاق: {selectedFiles['certFileUrl'].name} ✅
                      </span>
                    </div>
                    <span className="text-[10px] text-emerald-600 font-mono font-bold shrink-0">
                      الحجم: {selectedFiles['certFileUrl'].size}
                    </span>
                  </div>
                )}

                {uploadingField === 'certFileUrl' && (
                  <div className="space-y-1.5 pt-1.5 text-right" dir="rtl">
                    <div className="flex items-center justify-between text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                      <span>جاري رفع: {uploadingFileName || 'الشهادة'}...</span>
                      <div className="flex items-center gap-2">
                        <span>{uploadProgress}%</span>
                        <button
                          type="button"
                          onClick={handleCancelActiveUpload}
                          className="px-2 py-0.5 rounded-lg bg-rose-50 dark:bg-rose-950/50 text-rose-600 border border-rose-200 dark:border-rose-800 font-black cursor-pointer"
                        >
                          إلغاء الرفع
                        </button>
                      </div>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-emerald-600 h-full transition-all duration-150" style={{ width: `${uploadProgress}%` }}></div>
                    </div>
                  </div>
                )}
                {uploadError && (
                  <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-xl text-red-600 dark:text-red-400 text-xs font-semibold leading-relaxed text-right mt-2">
                    ⚠️ {uploadError}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button 
                onClick={() => setIssuingRequest(null)}
                className="px-4 py-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-bold"
              >
                إلغاء
              </button>
              <button 
                onClick={async () => {
                  if (!certStudentName.trim()) {
                    showError("حقل مطلوب", "يرجى إدخال اسم الطالب/ة");
                    return;
                  }
                  if (!certNumber.trim()) {
                    showError("حقل مطلوب", "يرجى إدخال رقم الشهادة");
                    return;
                  }

                  await issueCertificate(
                    issuingRequest.id,
                    issuingRequest.studentId,
                    certStudentName,
                    certCourseName,
                    certBookName,
                    certDate,
                    certNumber,
                    'المشرفة العامة',
                    certFileUrl || undefined
                  );
                  setIssuingRequest(null);
                  showSuccess("تم إصدار الشهادة", "تم إصدار الشهادة بنجاح وإرسالها إلى صندوق الطالب/ة! 🎉");
                }}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-xl text-sm font-bold shadow-md flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                إصدار وإرسال للطالب/ة 🎓
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- نافذة إضافة / تعديل دورة --- */}
      {editingCourse && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {editingCourse.id ? 'تعديل بيانات الدورة' : 'إضافة دورة جديدة'}
            </h3>
            
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold mb-1 text-slate-700 dark:text-slate-300">عنوان الدورة</label>
                <input 
                  type="text" 
                  value={editingCourse.title || ''} 
                  onChange={e => setEditingCourse({ ...editingCourse, title: e.target.value })}
                  placeholder="مثال: دورة التأصيل الفقهي"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1 text-slate-700 dark:text-slate-300">وصف الدورة</label>
                <textarea 
                  value={editingCourse.description || ''} 
                  onChange={e => setEditingCourse({ ...editingCourse, description: e.target.value })}
                  rows={3}
                  placeholder="نبذة مختصرة عن الدورة ومحتواها..."
                  className="w-full px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              {/* اختيار نوع الدورة: رئيسية جامعة أو مستوى فرعي أو صغيرة مستقلة */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2.5">
                <label className="block text-xs font-extrabold text-slate-800 dark:text-slate-200">
                  طبيعة الدورة ونظام المسار:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingCourse({ 
                      ...editingCourse, 
                      courseType: 'master', 
                      isMasterCourse: true,
                      isStandalone: false,
                      parentCourseId: null,
                      prerequisiteCourseId: null
                    })}
                    className={`p-3 rounded-xl border text-xs font-bold text-right transition-all flex flex-col gap-1 ${
                      editingCourse.courseType === 'master' || editingCourse.isMasterCourse
                        ? 'bg-emerald-600/15 border-emerald-500 text-emerald-950 dark:text-emerald-200 shadow-xs ring-1 ring-emerald-500/30'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                    }`}
                  >
                    <span className="flex items-center gap-1.5 font-black text-emerald-700 dark:text-emerald-400">
                      <Layers className="w-4 h-4" />
                      <span>دورة رئيسية جامعة 🏛️</span>
                    </span>
                    <span className="text-[10px] text-slate-500 font-normal leading-relaxed">
                      مثل "دورة التأصيل العلمي" - تجمع مستويات بداخلها
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const masterList = courses.filter(c => isMasterCourse(c) && c.id !== editingCourse.id);
                      setEditingCourse({ 
                        ...editingCourse, 
                        courseType: 'sequential', 
                        isMasterCourse: false,
                        isStandalone: false,
                        parentCourseId: editingCourse.parentCourseId || (masterList[0]?.id || null),
                        prerequisiteCourseId: editingCourse.prerequisiteCourseId || null
                      });
                    }}
                    className={`p-3 rounded-xl border text-xs font-bold text-right transition-all flex flex-col gap-1 ${
                      (editingCourse.courseType === 'sequential' || !editingCourse.courseType) && !editingCourse.isMasterCourse && !editingCourse.isStandalone
                        ? 'bg-amber-500/15 border-amber-500 text-amber-950 dark:text-amber-200 shadow-xs ring-1 ring-amber-500/30'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                    }`}
                  >
                    <span className="flex items-center gap-1.5 font-black text-amber-700 dark:text-amber-400">
                      <Link2 className="w-4 h-4" />
                      <span>مستوى / دورة فرعية 📑</span>
                    </span>
                    <span className="text-[10px] text-slate-500 font-normal leading-relaxed">
                      مثل المستوى التمهيدي، الأول... تتبع دورة كبيرة
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditingCourse({ 
                      ...editingCourse, 
                      courseType: 'standalone', 
                      isMasterCourse: false,
                      isStandalone: true, 
                      parentCourseId: null,
                      prerequisiteCourseId: null 
                    })}
                    className={`p-3 rounded-xl border text-xs font-bold text-right transition-all flex flex-col gap-1 ${
                      editingCourse.courseType === 'standalone' || editingCourse.isStandalone
                        ? 'bg-purple-500/15 border-purple-500 text-purple-950 dark:text-purple-200 shadow-xs ring-1 ring-purple-500/30'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                    }`}
                  >
                    <span className="flex items-center gap-1.5 font-black text-purple-700 dark:text-purple-400">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <span>دورة صغيرة مستقلة 🌱</span>
                    </span>
                    <span className="text-[10px] text-slate-500 font-normal leading-relaxed">
                      حرة ومفتوحة فوراً لا ترتبط بمسارات
                    </span>
                  </button>
                </div>

                {/* تفاصيل المستوى / الدورة الفرعية */}
                {(editingCourse.courseType === 'sequential' || !editingCourse.courseType) && !editingCourse.isMasterCourse && !editingCourse.isStandalone && (
                  <div className="pt-3 border-t border-slate-200 dark:border-slate-700 space-y-3">
                    <div>
                      <label className="block text-[11px] font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                        الدورة الرئيسية الجامعة التابعة لها (الدورة الكبيرة): *
                      </label>
                      <select
                        value={editingCourse.parentCourseId || ''}
                        onChange={e => setEditingCourse({ 
                          ...editingCourse, 
                          parentCourseId: e.target.value ? e.target.value : null 
                        })}
                        className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-hidden"
                      >
                        <option value="">-- اختاري الدورة الكبيرة التابعة لها --</option>
                        {courses.filter(c => isMasterCourse(c) && c.id !== editingCourse.id).map(c => (
                          <option key={c.id} value={c.id}>
                            🏛️ {c.title}
                          </option>
                        ))}
                      </select>
                      <p className="text-[10px] text-slate-400 mt-1">
                        ستظهر هذه الدورة بداخل بطاقة الدورة الكبيرة عند ضغط الطالب عليها (مثل: المستوى الأول داخل دورة التأصيل العلمي).
                      </p>
                    </div>

                    <div>
                      <label className="block text-[11px] font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                        المستوى السابق المشروط (يفتح هذا المستوى بعد إتمامه بالكامل):
                      </label>
                      <select
                        value={editingCourse.prerequisiteCourseId || ''}
                        onChange={e => setEditingCourse({ 
                          ...editingCourse, 
                          prerequisiteCourseId: e.target.value ? e.target.value : null 
                        })}
                        className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-hidden"
                      >
                        <option value="">-- المستوى الأول في المسار (يفتح تلقائياً) --</option>
                        {courses
                          .filter(c => c.id !== editingCourse.id && (editingCourse.parentCourseId ? c.parentCourseId === editingCourse.parentCourseId : true))
                          .map(c => (
                            <option key={c.id} value={c.id}>
                              يفتح بعد إتمام: {c.title}
                            </option>
                          ))}
                      </select>
                      <p className="text-[10px] text-amber-700 dark:text-amber-400 font-serif leading-relaxed mt-1">
                        💡 يظل هذا المستوى مقفلاً حتى يُتم الطالب جميع كتب واختبارات المستوى السابق بنسبة 60% فما فوق.
                      </p>
                    </div>
                  </div>
                )}

                {/* تفاصيل الدورة الرئيسية الجامعة */}
                {(editingCourse.courseType === 'master' || editingCourse.isMasterCourse) && (
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                    <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-serif leading-relaxed">
                      🏛️ هذه الدورة ستظهر وحدها كبطاقة كبيرة جامعة (مثل: «دورة التأصيل العلمي»)، وعند ضغط الطالب عليها ستخرج الدورات والمستويات المندرجة بداخلها.
                    </p>
                  </div>
                )}

                {/* تفاصيل الدورة المستقلة */}
                {(editingCourse.courseType === 'standalone' || editingCourse.isStandalone) && (
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                    <p className="text-[10px] text-purple-700 dark:text-purple-300 font-serif leading-relaxed">
                      🌱 هذه الدورة مخصصة كدورة صغيرة ومستقلة، وستكون متاحة ومفتوحة لجميع الطلاب فوراً دون اشتراط أي متطلبات سابقة.
                    </p>
                  </div>
                )}
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <label className="block text-xs font-extrabold text-slate-800 dark:text-slate-200">
                    صورة غلاف الدورة (JPG, JPEG, PNG, WebP - بحد أقصى 10MB)
                  </label>
                  {editingCourse.imageUrl && (
                    <button
                      type="button"
                      onClick={() => setEditingCourse({ ...editingCourse, imageUrl: '', imageFileId: undefined })}
                      className="text-[11px] font-bold text-rose-600 hover:underline flex items-center gap-1"
                    >
                      <X className="w-3 h-3" />
                      <span>إزالة الغلاف</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <CoverImage
                    src={pendingCourseCover?.previewUrl || editingCourse.imageUrl}
                    alt={editingCourse.title || 'معاينة غلاف الدورة'}
                    type="course"
                    className="w-20 h-20 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 shrink-0 shadow-xs"
                  />
                  <div className="flex-1 space-y-2 min-w-0">
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={editingCourse.imageUrl || ''} 
                        onChange={e => {
                          const nextVal = e.target.value;
                          const matchedCover =
                            tempCourseCovers.find((t) => t.url === nextVal.trim()) ||
                            (initialCourseCover.url === nextVal.trim() ? initialCourseCover : undefined);
                          setEditingCourse({ ...editingCourse, imageUrl: nextVal, imageFileId: matchedCover?.fileId });
                        }}
                        placeholder="https://..."
                        className="flex-1 min-w-0 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono text-left"
                        dir="ltr"
                      />
                      <label className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-xl text-xs font-bold cursor-pointer flex items-center justify-center gap-1.5 shrink-0">
                        <Upload className="w-4 h-4" />
                        <span>اختيار صورة</span>
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          onChange={e => handleCoverFileSelected(e, 'imageUrl')}
                          className="hidden"
                        />
                      </label>
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">
                      يُحفظ الغلاف الافتراضي تلقائياً إذا تركت الحقل فارغاً.
                    </p>
                  </div>
                </div>

                {pendingCourseCover && uploadingField !== 'imageUrl' && (
                  <div className="p-3 bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="text-right min-w-0">
                      <p className="text-xs font-extrabold text-emerald-900 dark:text-emerald-200 truncate">
                        معاينة الغلاف المختار: {pendingCourseCover.file.name}
                      </p>
                      <p className="text-[10px] text-emerald-700 dark:text-emerald-400">
                        اضغطي «حفظ الصورة» لرفع الغلاف إلى ImageKit.
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleSaveCoverImage('imageUrl')}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black inline-flex items-center gap-1 shadow-xs cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>حفظ الصورة</span>
                      </button>
                      <button
                        type="button"
                        onClick={clearPendingCourseCover}
                        className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>إلغاء</span>
                      </button>
                    </div>
                  </div>
                )}

                {selectedFiles['imageUrl'] && !pendingCourseCover && (
                  <div className="p-3 bg-emerald-50/50 dark:bg-emerald-950/10 border border-dashed border-emerald-500 rounded-xl flex items-center justify-between gap-2 mt-2">
                    <div className="flex items-center gap-1.5 text-right">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight">
                        📄 تم رفع وحفظ: {selectedFiles['imageUrl'].name} ✅
                      </span>
                    </div>
                    <span className="text-[10px] text-emerald-600 font-mono font-bold shrink-0">
                      الحجم: {selectedFiles['imageUrl'].size}
                    </span>
                  </div>
                )}

                {uploadingField === 'imageUrl' && (
                  <div className="space-y-1.5 pt-1.5 text-right" dir="rtl">
                    <div className="flex items-center justify-between text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                      <span>جاري رفع: {uploadingFileName || 'صورة الغلاف'}...</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono">{uploadProgress}%</span>
                        <button
                          type="button"
                          onClick={handleCancelActiveUpload}
                          className="px-2 py-0.5 rounded-lg bg-rose-50 dark:bg-rose-950/50 text-rose-600 border border-rose-200 dark:border-rose-800 font-black cursor-pointer"
                        >
                          إلغاء الرفع
                        </button>
                      </div>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-emerald-600 h-full transition-all duration-150" style={{ width: `${uploadProgress}%` }}></div>
                    </div>
                  </div>
                )}
                {uploadError && (
                  <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-xl text-red-600 dark:text-red-400 text-xs font-semibold leading-relaxed text-right mt-2 space-y-2">
                    <div>⚠️ {uploadError}</div>
                    {pendingCourseCover && uploadingField !== 'imageUrl' && (
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => handleSaveCoverImage('imageUrl')}
                          className="px-3 py-1 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-black inline-flex items-center gap-1 cursor-pointer"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>إعادة المحاولة</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-sm font-bold text-slate-700 dark:text-slate-300">
                  <input 
                    type="checkbox" 
                    checked={editingCourse.isVisible ?? true}
                    onChange={e => setEditingCourse({ ...editingCourse, isVisible: e.target.checked })}
                    className="w-4 h-4 rounded-md text-emerald-600 focus:ring-emerald-500"
                  />
                  إظهار الدورة للطلاب والطالبات مباشرة
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button 
                type="button"
                onClick={closeCourseEditor}
                disabled={savingCourse}
                className="px-4 py-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-bold"
              >
                إلغاء
              </button>
              <button 
                type="button"
                onClick={async () => {
                  if (uploadingField) {
                    showError("جاري الرفع", "يرجى الانتظار حتى اكتمال رفع الملف قبل الحفظ");
                    return;
                  }
                  if (pendingCourseCover) {
                    showError("صورة بانتظار الحفظ", "يرجى الضغط على زر «حفظ الصورة» لرفع غلاف الدورة المختار أو إلغاء الاختيار قبل حفظ الدورة.");
                    return;
                  }
                  if (!editingCourse.title?.trim()) {
                    showError("حقل مطلوب", "يرجى إدخال عنوان الدورة");
                    return;
                  }

                  const rawCover = (editingCourse.imageUrl || '').trim();
                  const imageUrlResolved = rawCover ? resolveFileUrl(rawCover).trim() : '';
                  if (imageUrlResolved) {
                    if (!isValidRemoteImageUrl(imageUrlResolved)) {
                      showError("خطأ في الرابط", "يجب أن يبدأ رابط صورة الدورة بـ http:// أو https:// ولا يُسمح بالروابط المحلية أو المؤقتة.");
                      return;
                    }
                    if (imageUrlResolved.includes('europe-west2.run.app') || imageUrlResolved.includes('localhost') || imageUrlResolved.includes('127.0.0.1')) {
                      showError("رابط غير صالح", "رابط صورة الدورة يشير إلى الموقع نفسه، وهذا غير مسموح.");
                      return;
                    }
                    const lowerUrl = imageUrlResolved.toLowerCase();
                    if (lowerUrl.includes('.svg') || lowerUrl.includes('image/svg+xml')) {
                      showError("تنسيق غير مسموح", "ملفات SVG غير مسموح باستخدامها كصور غلاف. الصيغ المسموحة: JPG، JPEG، PNG، WebP.");
                      return;
                    }
                    const exts = ['.png', '.jpg', '.jpeg', '.gif', '.webp'];
                    const isImage =
                      exts.some(ext => lowerUrl.includes(ext)) ||
                      lowerUrl.startsWith(`${IMAGEKIT_URL_ENDPOINT.toLowerCase()}/`) ||
                      lowerUrl.includes('firebasestorage.googleapis.com') ||
                      lowerUrl.startsWith('https://images.unsplash.com/');
                    if (!isImage) {
                      showError("تنسيق غير صالح", "صورة الدورة يجب أن تكون بتنسيق صالح (JPG, JPEG, PNG, WebP).");
                      return;
                    }
                  }

                  const id = editingCourse.id || `course-${Date.now()}`;
                  const isMaster = editingCourse.isMasterCourse ?? (editingCourse.courseType === 'master');
                  const isStandalone = editingCourse.isStandalone ?? (editingCourse.courseType === 'standalone');
                  const resolvedImageFileId = imageUrlResolved ? (editingCourse.imageFileId || undefined) : undefined;

                  setSavingCourse(true);
                  try {
                    await saveCourse({
                      id,
                      title: editingCourse.title.trim(),
                      description: editingCourse.description || '',
                      imageUrl: imageUrlResolved,
                      imageFileId: resolvedImageFileId,
                      order: editingCourse.order ?? courses.length,
                      isVisible: editingCourse.isVisible ?? true,
                      createdAt: editingCourse.createdAt || new Date().toISOString(),
                      courseType: isMaster ? 'master' : isStandalone ? 'standalone' : 'sequential',
                      isMasterCourse: isMaster,
                      parentCourseId: isMaster || isStandalone ? null : (editingCourse.parentCourseId || null),
                      isStandalone: isStandalone,
                      prerequisiteCourseId: isStandalone || isMaster ? null : (editingCourse.prerequisiteCourseId || null)
                    });

                    // حذف صورة الغلاف السابقة والملفات المؤقتة غير المستخدمة على ImageKit بعد نجاح الحفظ في Firestore
                    const otherCourses = courses.filter(c => c.id !== id);
                    await cleanupReplacedImageKitCover({
                      purpose: 'course_cover',
                      oldFileId: initialCourseCover.fileId,
                      oldUrl: initialCourseCover.url,
                      newFileId: resolvedImageFileId,
                      newUrl: imageUrlResolved || null,
                      otherItems: otherCourses,
                    });
                    for (const tempCover of tempCourseCovers) {
                      if (tempCover.fileId && tempCover.fileId !== resolvedImageFileId) {
                        await cleanupReplacedImageKitCover({
                          purpose: 'course_cover',
                          oldFileId: tempCover.fileId,
                          oldUrl: tempCover.url,
                          newFileId: resolvedImageFileId,
                          newUrl: imageUrlResolved || null,
                          otherItems: otherCourses,
                        });
                      }
                    }

                    setTempCourseCovers([]);
                    setInitialCourseCover({ url: '' });
                    setEditingCourse(null);
                    showSuccess("تم حفظ الدورة", "تم حفظ بيانات الدورة وصورة الغلاف بنجاح.");
                  } catch (err: any) {
                    showError("تعذر حفظ الدورة", err?.message || "حدث خطأ أثناء حفظ بيانات الدورة.");
                  } finally {
                    setSavingCourse(false);
                  }
                }}
                disabled={uploadingField !== null || savingCourse}
                className={`px-6 py-2 rounded-xl text-sm font-bold shadow-md text-white transition-colors ${
                  uploadingField || savingCourse
                    ? 'bg-slate-400 cursor-not-allowed' 
                    : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                {uploadingField === 'imageUrl' ? 'جاري الرفع...' : savingCourse ? 'جاري الحفظ...' : 'حفظ الدورة'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- نافذة إضافة / تعديل كتاب --- */}
      {editingBook && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {editingBook.book.id ? 'تعديل اسم الكتاب ومشتملاته' : 'إضافة كتاب جديد للدورة'}
            </h3>
            
            <div>
              <label className="block text-xs font-bold mb-1 text-slate-700 dark:text-slate-300">عنوان الكتاب / المتن</label>
              <input 
                type="text" 
                value={editingBook.book.title || ''} 
                onChange={e => setEditingBook({ ...editingBook, book: { ...editingBook.book, title: e.target.value } })}
                placeholder="مثال: كتاب التوحيد، متن الورقات..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>

            {/* صورة غلاف الكتاب */}
            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3 text-right">
              <div className="flex items-center justify-between gap-2">
                <label className="block text-xs font-extrabold text-slate-800 dark:text-slate-200">
                  صورة غلاف الكتاب (JPG, JPEG, PNG, WebP - بحد أقصى 10MB)
                </label>
                {editingBook.book.imageUrl && (
                  <button
                    type="button"
                    onClick={() => setEditingBook({ ...editingBook, book: { ...editingBook.book, imageUrl: '', imageFileId: undefined } })}
                    className="text-[11px] font-bold text-rose-600 hover:underline flex items-center gap-1"
                  >
                    <X className="w-3 h-3" />
                    <span>إزالة الغلاف</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-3">
                <CoverImage
                  src={pendingBookCover?.previewUrl || editingBook.book.imageUrl}
                  alt={editingBook.book.title || 'معاينة غلاف الكتاب'}
                  type="book"
                  className="w-16 h-22 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0 shadow-xs"
                />
                <div className="flex-1 space-y-2 min-w-0">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={editingBook.book.imageUrl || ''}
                      onChange={e => {
                        const nextVal = e.target.value;
                        const matchedCover =
                          tempBookCovers.find((t) => t.url === nextVal.trim()) ||
                          (initialBookCover.url === nextVal.trim() ? initialBookCover : undefined);
                        setEditingBook({
                          ...editingBook,
                          book: { ...editingBook.book, imageUrl: nextVal, imageFileId: matchedCover?.fileId },
                        });
                      }}
                      placeholder="https://..."
                      className="flex-1 min-w-0 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono text-left"
                      dir="ltr"
                    />
                    <label className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-xl text-xs font-bold cursor-pointer flex items-center justify-center gap-1.5 shrink-0">
                      <Upload className="w-4 h-4" />
                      <span>اختيار غلاف</span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={e => handleCoverFileSelected(e, 'bookImageUrl')}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    سيظهر غلاف الكتاب تلقائياً في قائمة الكتب وبطاقة المتن المقرر.
                  </p>
                </div>
              </div>

              {pendingBookCover && uploadingField !== 'bookImageUrl' && (
                <div className="p-3 bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="text-right min-w-0">
                    <p className="text-xs font-extrabold text-emerald-900 dark:text-emerald-200 truncate">
                      معاينة الغلاف المختار: {pendingBookCover.file.name}
                    </p>
                    <p className="text-[10px] text-emerald-700 dark:text-emerald-400">
                      اضغطي «حفظ الصورة» لرفع الغلاف إلى ImageKit.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleSaveCoverImage('bookImageUrl')}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black inline-flex items-center gap-1 shadow-xs cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>حفظ الصورة</span>
                    </button>
                    <button
                      type="button"
                      onClick={clearPendingBookCover}
                      className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>إلغاء</span>
                    </button>
                  </div>
                </div>
              )}

              {selectedFiles['bookImageUrl'] && !pendingBookCover && (
                <div className="p-2.5 bg-emerald-50/50 dark:bg-emerald-950/10 border border-dashed border-emerald-500 rounded-xl flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-right">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight truncate">
                      📄 تم رفع وحفظ: {selectedFiles['bookImageUrl'].name} ✅
                    </span>
                  </div>
                  <span className="text-[10px] text-emerald-600 font-mono font-bold shrink-0">
                    {selectedFiles['bookImageUrl'].size}
                  </span>
                </div>
              )}

              {uploadingField === 'bookImageUrl' && (
                <div className="space-y-1.5 pt-1 text-right" dir="rtl">
                  <div className="flex items-center justify-between text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                    <span>جاري رفع: {uploadingFileName || 'غلاف الكتاب'}...</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono">{uploadProgress}%</span>
                      <button
                        type="button"
                        onClick={handleCancelActiveUpload}
                        className="px-2 py-0.5 rounded-lg bg-rose-50 dark:bg-rose-950/50 text-rose-600 border border-rose-200 dark:border-rose-800 font-black cursor-pointer"
                      >
                        إلغاء الرفع
                      </button>
                    </div>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-600 h-full transition-all duration-150" style={{ width: `${uploadProgress}%` }}></div>
                  </div>
                </div>
              )}

              {uploadError && (
                <div className="p-2.5 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-xl text-red-600 dark:text-red-400 text-xs font-semibold leading-relaxed text-right space-y-2">
                  <div>⚠️ {uploadError}</div>
                  {pendingBookCover && uploadingField !== 'bookImageUrl' && (
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleSaveCoverImage('bookImageUrl')}
                        className="px-3 py-1 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-black inline-flex items-center gap-1 cursor-pointer"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>إعادة المحاولة</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* حقل ملف الـ PDF الخاص بالكتاب (رابط مباشر) */}
            <div className="space-y-2 border-t border-slate-100 dark:border-slate-800 pt-3 text-right">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                رابط الكتاب (PDF)
              </label>
              <div className="space-y-1 text-right">
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  يرجى إدخال رابط ملف الـ PDF الخاص بالكتاب هنا مباشرة (مثل روابط Google Drive أو أي رابط مباشر آخر).
                </p>
                <input 
                  type="text" 
                  value={editingBook.book.pdfUrl || ''} 
                  onChange={e => {
                    setEditingBook({
                      ...editingBook,
                      book: {
                        ...editingBook.book,
                        pdfUrl: e.target.value
                      }
                    });
                  }}
                  placeholder="ضع رابط الكتاب هنا مباشرة (مثال: https://...)"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono text-left focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  dir="ltr"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button 
                type="button"
                onClick={closeBookEditor}
                disabled={savingBook}
                className="px-4 py-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-bold"
              >
                إلغاء
              </button>
              <button 
                type="button"
                onClick={async () => {
                  if (uploadingField) {
                    showError("جاري الرفع", "يرجى الانتظار حتى اكتمال رفع الملف قبل الحفظ");
                    return;
                  }
                  if (pendingBookCover) {
                    showError("صورة بانتظار الحفظ", "يرجى الضغط على زر «حفظ الصورة» لرفع غلاف الكتاب المختار أو إلغاء الاختيار قبل حفظ الكتاب.");
                    return;
                  }
                  if (!editingBook.book.title?.trim()) {
                    showError("حقل مطلوب", "يرجى إدخال اسم الكتاب");
                    return;
                  }

                  const rawBookCover = (editingBook.book.imageUrl || '').trim();
                  const resolvedBookImageUrl = rawBookCover ? resolveFileUrl(rawBookCover).trim() : '';
                  if (resolvedBookImageUrl) {
                    if (!isValidRemoteImageUrl(resolvedBookImageUrl)) {
                      showError("خطأ في الرابط", "يجب أن يبدأ رابط غلاف الكتاب بـ http:// أو https:// ولا يُسمح بالروابط المحلية أو المؤقتة.");
                      return;
                    }
                    if (resolvedBookImageUrl.includes('europe-west2.run.app') || resolvedBookImageUrl.includes('localhost') || resolvedBookImageUrl.includes('127.0.0.1')) {
                      showError("رابط غير صالح", "رابط غلاف الكتاب يشير إلى الموقع نفسه، وهذا غير مسموح.");
                      return;
                    }
                    const lowerUrl = resolvedBookImageUrl.toLowerCase();
                    if (lowerUrl.includes('.svg') || lowerUrl.includes('image/svg+xml')) {
                      showError("تنسيق غير مسموح", "ملفات SVG غير مسموح باستخدامها كأغلفة كتب. الصيغ المسموحة: JPG، JPEG، PNG، WebP.");
                      return;
                    }
                    const exts = ['.png', '.jpg', '.jpeg', '.gif', '.webp'];
                    const isImage =
                      exts.some(ext => lowerUrl.includes(ext)) ||
                      lowerUrl.startsWith(`${IMAGEKIT_URL_ENDPOINT.toLowerCase()}/`) ||
                      lowerUrl.includes('firebasestorage.googleapis.com') ||
                      lowerUrl.startsWith('https://images.unsplash.com/');
                    if (!isImage) {
                      showError("تنسيق غير صالح", "صورة غلاف الكتاب يجب أن تكون بتنسيق صالح (JPG, JPEG, PNG, WebP).");
                      return;
                    }
                  }

                  const cleanPdfUrl = editingBook.book.pdfUrl?.trim() || undefined;
                  const id = editingBook.book.id || `book-${Date.now()}`;
                  const resolvedBookFileId = resolvedBookImageUrl ? (editingBook.book.imageFileId || undefined) : undefined;

                  setSavingBook(true);
                  try {
                    await saveBook({
                      id,
                      courseId: editingBook.courseId,
                      title: editingBook.book.title.trim(),
                      imageUrl: resolvedBookImageUrl || undefined,
                      imageFileId: resolvedBookFileId,
                      order: editingBook.book.order ?? 0,
                      createdAt: editingBook.book.createdAt || new Date().toISOString(),
                      pdfUrl: cleanPdfUrl,
                      pdfSize: editingBook.book.pdfSize || undefined,
                      pdfPageCount: editingBook.book.pdfPageCount || undefined
                    });

                    // حذف غلاف الكتاب القديم والملفات المؤقتة غير المستخدمة على ImageKit بعد نجاح الحفظ في Firestore
                    const otherBooks = books.filter(b => b.id !== id);
                    await cleanupReplacedImageKitCover({
                      purpose: 'book_cover',
                      oldFileId: initialBookCover.fileId,
                      oldUrl: initialBookCover.url,
                      newFileId: resolvedBookFileId,
                      newUrl: resolvedBookImageUrl || null,
                      otherItems: otherBooks,
                    });
                    for (const tempCover of tempBookCovers) {
                      if (tempCover.fileId && tempCover.fileId !== resolvedBookFileId) {
                        await cleanupReplacedImageKitCover({
                          purpose: 'book_cover',
                          oldFileId: tempCover.fileId,
                          oldUrl: tempCover.url,
                          newFileId: resolvedBookFileId,
                          newUrl: resolvedBookImageUrl || null,
                          otherItems: otherBooks,
                        });
                      }
                    }

                    setTempBookCovers([]);
                    setInitialBookCover({ url: '' });
                    setEditingBook(null);
                    showSuccess("تم حفظ الكتاب", "تم حفظ بيانات الكتاب وصورة الغلاف بنجاح.");
                  } catch (err: any) {
                    showError("تعذر حفظ الكتاب", err?.message || "حدث خطأ أثناء حفظ بيانات الكتاب.");
                  } finally {
                    setSavingBook(false);
                  }
                }}
                disabled={uploadingField !== null || savingBook}
                className={`px-6 py-2 rounded-xl text-sm font-bold shadow-md text-white transition-colors ${
                  uploadingField || savingBook
                    ? 'bg-slate-400 cursor-not-allowed' 
                    : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                {uploadingField === 'bookImageUrl' ? 'جاري الرفع...' : savingBook ? 'جاري الحفظ...' : 'حفظ الكتاب'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- نافذة إضافة / تعديل محاضرة كاملة المزايا --- */}
      {editingLecture && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-2xl w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto text-right">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Video className="w-5 h-5 text-emerald-600" />
              {editingLecture.lecture.id ? 'تعديل المحاضرة الشاملة' : 'إضافة محاضرة جديدة للكتاب'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold mb-1 text-slate-700 dark:text-slate-300">عنوان المحاضرة / الدرس *</label>
                <input 
                  type="text" 
                  value={editingLecture.lecture.title || ''} 
                  onChange={e => setEditingLecture({ ...editingLecture, lecture: { ...editingLecture.lecture, title: e.target.value } })}
                  placeholder="مثال: المجلس الأول - المقدمة وأصول الدين"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1 text-slate-700 dark:text-slate-300">وصف المحاضرة (نبذة مختصرة للطالب/ة)</label>
                <textarea 
                  value={editingLecture.lecture.description || ''} 
                  onChange={e => setEditingLecture({ ...editingLecture, lecture: { ...editingLecture.lecture, description: e.target.value } })}
                  rows={2}
                  placeholder="ماذا سيتعلم الطالب/ة في هذا الدرس..."
                  className="w-full px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              {/* عرض شريط نسبة التقدم للرفع بشكل تفاعلي */}
              {uploadingField && (
                <div className="bg-emerald-50 dark:bg-emerald-950/40 p-4 rounded-2xl border border-emerald-200 dark:border-emerald-800 text-xs flex flex-col gap-2 text-right" dir="rtl">
                  <div className="flex justify-between items-center gap-2">
                    <span className="font-extrabold text-emerald-800 dark:text-emerald-300">
                      جاري رفع {uploadingField === 'videoUrl' ? 'الفيديو' : uploadingField === 'audioUrl' ? 'الملف الصوتي' : 'صورة الغلاف'}: {uploadingFileName || 'الملف'}...
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold font-mono text-emerald-700 dark:text-emerald-400">{uploadProgress}%</span>
                      <button
                        type="button"
                        onClick={handleCancelActiveUpload}
                        className="px-2 py-0.5 rounded-lg bg-rose-50 dark:bg-rose-950/50 text-rose-600 border border-rose-200 dark:border-rose-800 text-[10px] font-black cursor-pointer"
                      >
                        إلغاء الرفع
                      </button>
                    </div>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-600 h-full transition-all duration-150" style={{ width: `${uploadProgress}%` }}></div>
                  </div>
                </div>
              )}

              {uploadError && (
                <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-xl text-red-600 dark:text-red-400 text-xs font-semibold leading-relaxed text-right">
                  ⚠️ {uploadError}
                </div>
              )}

              <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
                <label className="block text-xs font-extrabold text-slate-800 dark:text-slate-200">فيديو المحاضرة (رابط YouTube أو رفع ملف MP4 مباشرة)</label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input 
                    type="text" 
                    value={editingLecture.lecture.videoUrl || ''} 
                    onChange={e => setEditingLecture({ ...editingLecture, lecture: { ...editingLecture.lecture, videoUrl: e.target.value } })}
                    placeholder="رابط يوتيوب: https://www.youtube.com/watch?v=..."
                    className="flex-1 px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono text-left"
                    dir="ltr"
                  />
                  <label className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-bold cursor-pointer flex items-center justify-center gap-1.5 shrink-0 shadow-xs">
                    <Upload className="w-3.5 h-3.5" />
                    <span>رفع فيديو</span>
                    <input type="file" accept="video/*" onChange={e => handleFileUpload(e, 'videoUrl')} className="hidden" />
                  </label>
                </div>

                {selectedFiles['videoUrl'] && (
                  <div className="p-3 bg-emerald-50/50 dark:bg-emerald-950/10 border border-dashed border-emerald-500 rounded-xl flex items-center justify-between gap-2 mt-2">
                    <div className="flex items-center gap-1.5 text-right">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight">
                        📄 تم إرفاق: {selectedFiles['videoUrl'].name} ✅
                      </span>
                    </div>
                    <span className="text-[10px] text-emerald-600 font-mono font-bold shrink-0">
                      الحجم: {selectedFiles['videoUrl'].size}
                    </span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
                  <label className="block text-xs font-extrabold text-slate-800 dark:text-slate-200">رابط الملف الصوتي (MP3 أو SoundCloud)</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={editingLecture.lecture.audioUrl || ''} 
                      onChange={e => setEditingLecture({ ...editingLecture, lecture: { ...editingLecture.lecture, audioUrl: e.target.value } })}
                      placeholder="https://..."
                      className="flex-1 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono text-left"
                      dir="ltr"
                    />
                    <label className="bg-purple-600 hover:bg-purple-700 text-white p-2 rounded-xl text-xs font-bold cursor-pointer flex items-center justify-center shrink-0">
                      <Upload className="w-4 h-4" />
                      <input type="file" accept="audio/*" onChange={e => handleFileUpload(e, 'audioUrl')} className="hidden" />
                    </label>
                  </div>

                  {selectedFiles['audioUrl'] && (
                    <div className="p-2.5 bg-emerald-50/50 dark:bg-emerald-950/10 border border-dashed border-emerald-500 rounded-xl flex items-center justify-between gap-2 mt-2">
                      <div className="flex items-center gap-1 text-right">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 leading-tight">
                          📄 تم إرفاق: {selectedFiles['audioUrl'].name} ✅
                        </span>
                      </div>
                      <span className="text-[9px] text-emerald-600 font-mono font-bold shrink-0">
                        {selectedFiles['audioUrl'].size}
                      </span>
                    </div>
                  )}
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2 text-right">
                  <label className="block text-xs font-extrabold text-slate-800 dark:text-slate-200">ملف تفريغ أو متن الدرس (رابط PDF)</label>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    يرجى إدخال رابط ملف الـ PDF هنا مباشرة (مثل روابط Google Drive أو أي رابط مباشر آخر).
                  </p>
                  <input 
                    type="text" 
                    value={editingLecture.lecture.pdfUrl || ''} 
                    onChange={e => {
                      setEditingLecture({ 
                        ...editingLecture, 
                        lecture: { ...editingLecture.lecture, pdfUrl: e.target.value } 
                      });
                    }}
                    placeholder="ضع رابط ملف الـ PDF هنا مباشرة..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono text-left focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    dir="ltr"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1 text-slate-700 dark:text-slate-300">ملاحظات وتلخيص الدرس المعتمد</label>
                <textarea 
                  value={editingLecture.lecture.notes || ''} 
                  onChange={e => setEditingLecture({ ...editingLecture, lecture: { ...editingLecture.lecture, notes: e.target.value } })}
                  rows={4}
                  placeholder="الفوائد العلمية والتشجيرات الفقهية الملحقة بالمحاضرة لتظهر للطلاب والطالبات..."
                  className="w-full px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center gap-2 bg-purple-50 dark:bg-purple-950/20 p-3.5 rounded-2xl border border-purple-200/50 dark:border-purple-900/50">
                <input 
                  type="checkbox"
                  id="isFinalSession"
                  checked={editingLecture.lecture.isFinalSession || false} 
                  onChange={e => setEditingLecture({ ...editingLecture, lecture: { ...editingLecture.lecture, isFinalSession: e.target.checked } })}
                  className="w-4.5 h-4.5 text-purple-600 border-slate-300 rounded focus:ring-purple-500 cursor-pointer"
                />
                <label htmlFor="isFinalSession" className="text-xs font-extrabold text-purple-800 dark:text-purple-300 cursor-pointer select-none">
                  تحديد كمجلس ختامي للكتاب 🎓 (عند تفعيله، لن تتمكن/ي من إضافة محاضرات جديدة لهذا الكتاب، ويطلب الطالب/ة الشهادة فور اجتياز هذا المجلس)
                </label>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1 text-slate-700 dark:text-slate-300">مدة المحاضرة التقريبية</label>
                <input 
                  type="text" 
                  value={editingLecture.lecture.duration || ''} 
                  onChange={e => setEditingLecture({ ...editingLecture, lecture: { ...editingLecture.lecture, duration: e.target.value } })}
                  placeholder="مثال: 45:00"
                  className="w-full px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-mono text-left max-w-40"
                  dir="ltr"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button 
                onClick={() => setEditingLecture(null)}
                className="px-4 py-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-bold"
              >
                إلغاء
              </button>
              <button 
                onClick={() => {
                  if (uploadingField) {
                    showError("جاري الرفع", "يرجى الانتظار حتى اكتمال رفع الملف قبل الحفظ");
                    return;
                  }
                  if (!editingLecture.lecture.title?.trim()) {
                    showError("حقل مطلوب", "يرجى إدخال عنوان المحاضرة");
                    return;
                  }
                  
                  // حفظ الرابط المدخل كما هو دون تعديل أو تحويل
                  if (editingLecture.lecture.pdfUrl && editingLecture.lecture.pdfUrl.trim()) {
                    editingLecture.lecture.pdfUrl = editingLecture.lecture.pdfUrl.trim();
                  }

                  // التحقق الصارم من الملف الصوتي للمحاضرة إن وجد
                  const audioUrlResolved = resolveFileUrl(editingLecture.lecture.audioUrl);
                  if (audioUrlResolved) {
                    const url = audioUrlResolved.trim();
                    if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('/')) {
                      showError("خطأ في الرابط", "يجب أن يبدأ رابط الملف الصوتي بـ http:// أو https:// أو /.");
                      return;
                    }
                    if (url.includes('europe-west2.run.app') || url.includes('localhost') || url.includes('127.0.0.1')) {
                      showError("رابط غير صالح", "رابط الملف الصوتي يشير إلى الموقع نفسه، وهذا غير مسموح.");
                      return;
                    }
                    const exts = ['.mp3', '.wav', '.m4a', '.aac', '.ogg'];
                    const isAudio = exts.some(ext => url.toLowerCase().includes(ext)) || url.includes('firebasestorage.googleapis.com');
                    if (!isAudio) {
                      showError("تنسيق غير صالح", "الملف الصوتي يجب أن يكون بتنسيق صوتي صالح (mp3, wav, m4a, aac, ogg).");
                      return;
                    }
                  }

                  // التحقق الصارم من الفيديو إن وجد
                  const videoUrlResolved = resolveFileUrl(editingLecture.lecture.videoUrl);
                  if (videoUrlResolved) {
                    const url = videoUrlResolved.trim();
                    if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('/')) {
                      showError("خطأ في الرابط", "يجب أن يبدأ رابط الفيديو بـ http:// أو https:// أو /.");
                      return;
                    }
                    if (url.includes('europe-west2.run.app') || url.includes('localhost') || url.includes('127.0.0.1')) {
                      showError("رابط غير صالح", "رابط الفيديو يشير إلى الموقع نفسه، وهذا غير مسموح.");
                      return;
                    }
                  }

                  const id = editingLecture.lecture.id || `lec-${Date.now()}`;
                  
                  // منع تحديد أكثر من مجلس ختامي واحد لنفس الكتاب
                  const hasExistingClosingSession = lectures.some(
                    l => l.bookId === editingLecture.bookId && l.isFinalSession && l.id !== id
                  );
                  if (editingLecture.lecture.isFinalSession && hasExistingClosingSession) {
                    showError("غير مسموح", "يوجد بالفعل مجلس ختامي آخر مضاف لهذا الكتاب.");
                    return;
                  }

                  console.log("[DEBUG] AdminCoursesPanel (Lecture) - Before Saving pdfUrl:", editingLecture.lecture.pdfUrl);
                  saveLecture({
                    id,
                    bookId: editingLecture.bookId,
                    courseId: editingLecture.courseId,
                    title: editingLecture.lecture.title,
                    description: editingLecture.lecture.description || '',
                    notes: editingLecture.lecture.notes || '',
                    videoUrl: videoUrlResolved || undefined,
                    audioUrl: audioUrlResolved || undefined,
                    pdfUrl: editingLecture.lecture.pdfUrl || undefined,
                    duration: editingLecture.lecture.duration || '30:00',
                    order: editingLecture.lecture.order ?? 0,
                    createdAt: editingLecture.lecture.createdAt || new Date().toISOString(),
                    isFinalSession: !!editingLecture.lecture.isFinalSession
                  });
                  setEditingLecture(null);
                }}
                disabled={uploadingField !== null}
                className={`px-6 py-2 rounded-xl text-sm font-bold shadow-md text-white transition-colors ${
                  uploadingField 
                    ? 'bg-slate-400 cursor-not-allowed' 
                    : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                {uploadingField ? 'جاري الرفع...' : 'حفظ المحاضرة'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- نافذة إدارة أسئلة الاختبار بعد المحاضرة --- */}
      {activeQuizLecture && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-4xl w-full shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto text-right">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Award className="w-6 h-6 text-amber-500" />
                  أسئلة اختبار درس: "{activeQuizLecture.title}"
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  يمكنك إنشاء عدد غير محدود من الأسئلة (اختيار متعدد، صح وخطأ، إجابة قصيرة مع الدرجة)
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setIsImportJsonModalOpen(true)}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-1.5 shadow-md transition-all cursor-pointer active:scale-95"
                >
                  <FileCode className="w-4 h-4" />
                  <span>استيراد الأسئلة من JSON</span>
                </button>
                <button
                  onClick={() => setEditingQuestion({
                    lectureId: activeQuizLecture.id,
                    bookId: activeQuizLecture.bookId,
                    courseId: activeQuizLecture.courseId,
                    type: 'multiple_choice',
                    question: '',
                    options: ['', '', ''],
                    correctAnswer: '',
                    points: 5,
                    order: lectureQuestionsList.length
                  })}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-1.5 shadow-md cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>إضافة سؤال جديد</span>
                </button>
                <button 
                  onClick={() => {
                    setActiveQuizLecture(null);
                    setIsImportJsonModalOpen(false);
                  }} 
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-xl bg-slate-100 dark:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* عرض قائمة الأسئلة الحالية */}
            <div className="space-y-3">
              {lectureQuestionsList.length === 0 ? (
                <div className="bg-slate-50 dark:bg-slate-800/50 p-12 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700 text-center text-slate-400 text-sm">
                  لم تقومي بإنشاء اختبار بعد لهذا الدرس. اضغطي على "إضافة سؤال جديد" في الأعلى.
                </div>
              ) : (
                lectureQuestionsList.map((qItem, qIdx) => (
                  <div key={qItem.id} className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <span className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-bold text-xs flex items-center justify-center shrink-0 font-mono">
                        {qIdx + 1}
                      </span>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] px-2 py-0.5 rounded-md font-bold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                            {qItem.type === 'multiple_choice' ? 'اختيار متعدد' : qItem.type === 'true_false' ? 'صح وخطأ' : 'إجابة قصيرة'}
                          </span>
                          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-md">
                            {qItem.points} درجات
                          </span>
                        </div>
                        <h5 className="font-bold text-sm text-slate-900 dark:text-white">{qItem.question}</h5>
                        
                        {qItem.type === 'multiple_choice' && qItem.options && (
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {qItem.options.map((opt, oIdx) => (
                              <span key={oIdx} className={`text-xs px-2.5 py-1 rounded-lg border ${opt === qItem.correctAnswer ? 'bg-emerald-100 dark:bg-emerald-950 border-emerald-400 text-emerald-800 dark:text-emerald-200 font-bold' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500'}`}>
                                {opt} {opt === qItem.correctAnswer && '✓'}
                              </span>
                            ))}
                          </div>
                        )}

                        {qItem.type === 'true_false' && (
                          <p className="text-xs text-emerald-600 font-bold mt-1">
                            الإجابة الصحيحة: {qItem.correctAnswer === 'true' ? 'صحيحة (صح)' : 'خاطئة (خطأ)'}
                          </p>
                        )}

                        {qItem.type === 'short_answer' && (
                          <p className="text-xs text-emerald-600 font-bold mt-1">
                            الإجابة النموذجية القابلة للقبول: "{qItem.correctAnswer}"
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-1.5 shrink-0">
                      <button onClick={() => setEditingQuestion(qItem)} className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-xl" title="تعديل السؤال">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDeleteQuestion(qItem.id)} className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl" title="حذف السؤال">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
              <button onClick={() => setActiveQuizLecture(null)} className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-2xl font-bold text-sm">
                تم وحفظ الاختبار
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- نافذة استيراد أسئلة الاختبار من JSON (NotebookLM) --- */}
      {isImportJsonModalOpen && activeQuizLecture && (
        <ImportQuizJsonModal
          isOpen={isImportJsonModalOpen}
          onClose={() => setIsImportJsonModalOpen(false)}
          lecture={activeQuizLecture}
          existingQuestions={lectureQuestionsList}
          onSaveBatch={saveQuestionsBatch}
          showSuccess={showSuccess}
          showError={showError}
        />
      )}

      {/* --- نافذة إنشاء أو تعديل سؤال اختبار --- */}
      {editingQuestion && (
        <div className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 text-right">
            <h4 className="text-lg font-bold text-slate-900 dark:text-white">
              {editingQuestion.id ? 'تعديل السؤال' : 'إضافة سؤال جديد للاختبار'}
            </h4>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold mb-1 text-slate-700 dark:text-slate-300">نوع السؤال</label>
                <select
                  value={editingQuestion.type || 'multiple_choice'}
                  onChange={e => {
                    const type = e.target.value as QuizQuestionType;
                    setEditingQuestion({
                      ...editingQuestion,
                      type,
                      correctAnswer: type === 'true_false' ? 'true' : '',
                      options: type === 'multiple_choice' ? (editingQuestion.options?.length ? editingQuestion.options : ['', '', '']) : undefined
                    });
                  }}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-bold"
                >
                  <option value="multiple_choice">اختيار من متعدد</option>
                  <option value="true_false">صح أو خطأ</option>
                  <option value="short_answer">إجابة قصيرة مباشرة</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1 text-slate-700 dark:text-slate-300">نص السؤال *</label>
                <textarea
                  value={editingQuestion.question || ''}
                  onChange={e => setEditingQuestion({ ...editingQuestion, question: e.target.value })}
                  rows={2}
                  placeholder="اكتب صيغة السؤال هنا..."
                  className="w-full px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1 text-slate-700 dark:text-slate-300">الدرجة المخصصة للسؤال</label>
                <input
                  type="number"
                  min={1}
                  value={editingQuestion.points || 5}
                  onChange={e => setEditingQuestion({ ...editingQuestion, points: Number(e.target.value) })}
                  className="w-full px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm max-w-32 text-center font-bold"
                />
              </div>

              {/* خيارات الاختيار من متعدد */}
              {editingQuestion.type === 'multiple_choice' && (
                <div className="space-y-3 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <label className="block text-xs font-extrabold text-slate-800 dark:text-slate-200">الخيارات المتاحة وحدد الخيار الصحيح:</label>
                  {(editingQuestion.options || ['', '', '']).map((opt, oIdx) => (
                    <div key={oIdx} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="correct_choice"
                        checked={editingQuestion.correctAnswer === opt && opt !== ''}
                        onChange={() => setEditingQuestion({ ...editingQuestion, correctAnswer: opt })}
                        className="w-4 h-4 text-emerald-600"
                        title="تحديد كإجابة صحيحة"
                      />
                      <input
                        type="text"
                        value={opt}
                        onChange={e => {
                          const newOpts = [...(editingQuestion.options || ['', '', ''])];
                          newOpts[oIdx] = e.target.value;
                          // إذا كان الخيار المعدل هو نفسه الإجابة الصحيحة، نقوم بتحديثها أيضاً
                          const newCorrect = editingQuestion.correctAnswer === opt ? e.target.value : editingQuestion.correctAnswer;
                          setEditingQuestion({ ...editingQuestion, options: newOpts, correctAnswer: newCorrect });
                        }}
                        placeholder={`الخيار ${oIdx + 1}`}
                        className="flex-1 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                      />
                      {(editingQuestion.options?.length || 0) > 2 && (
                        <button
                          type="button"
                          onClick={() => {
                            const newOpts = (editingQuestion.options || []).filter((_, i) => i !== oIdx);
                            setEditingQuestion({ ...editingQuestion, options: newOpts });
                          }}
                          className="p-1.5 text-slate-400 hover:text-red-500"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => setEditingQuestion({ ...editingQuestion, options: [...(editingQuestion.options || []), ''] })}
                    className="text-xs text-emerald-600 font-bold flex items-center gap-1 hover:underline pt-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> إضافة خيار آخر
                  </button>
                </div>
              )}

              {/* خيارات صح أو خطأ */}
              {editingQuestion.type === 'true_false' && (
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
                  <label className="block text-xs font-extrabold text-slate-800 dark:text-slate-200">الإجابة الصحيحة للعبارة:</label>
                  <div className="flex items-center gap-6 pt-1">
                    <label className="flex items-center gap-2 cursor-pointer text-sm font-bold text-emerald-700 dark:text-emerald-400">
                      <input
                        type="radio"
                        name="tf_choice"
                        checked={editingQuestion.correctAnswer === 'true'}
                        onChange={() => setEditingQuestion({ ...editingQuestion, correctAnswer: 'true' })}
                        className="w-4 h-4 text-emerald-600"
                      />
                      عبارة صحيحة (صح)
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer text-sm font-bold text-red-600 dark:text-red-400">
                      <input
                        type="radio"
                        name="tf_choice"
                        checked={editingQuestion.correctAnswer === 'false'}
                        onChange={() => setEditingQuestion({ ...editingQuestion, correctAnswer: 'false' })}
                        className="w-4 h-4 text-red-600"
                      />
                      عبارة خاطئة (خطأ)
                    </label>
                  </div>
                </div>
              )}

              {/* الإجابة القصيرة */}
              {editingQuestion.type === 'short_answer' && (
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <label className="block text-xs font-bold mb-1 text-slate-700 dark:text-slate-300">الكلمة أو العبارة النموذجية الصحيحة *</label>
                  <input
                    type="text"
                    value={editingQuestion.correctAnswer || ''}
                    onChange={e => setEditingQuestion({ ...editingQuestion, correctAnswer: e.target.value })}
                    placeholder="مثال: التوحيد، الوضوء..."
                    className="w-full px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-bold"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">سيتم اختبار إجابة الطالب/ة بالتطابق التقريبي غير المتأثر بالمسافات أو حالة الأحرف.</p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button onClick={() => setEditingQuestion(null)} className="px-4 py-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-bold">
                إلغاء
              </button>
              <button
                onClick={() => {
                  if (!editingQuestion.question?.trim()) {
                    showError("حقل مطلوب", "يرجى إدخال نص السؤال");
                    return;
                  }
                  if (!editingQuestion.correctAnswer?.trim()) {
                    showError("حقل مطلوب", "يرجى تحديد أو كتابة الإجابة الصحيحة");
                    return;
                  }

                  const qId = editingQuestion.id || `question-${Date.now()}`;
                  saveQuestion({
                    id: qId,
                    lectureId: editingQuestion.lectureId!,
                    bookId: editingQuestion.bookId!,
                    courseId: editingQuestion.courseId!,
                    type: editingQuestion.type || 'multiple_choice',
                    question: editingQuestion.question,
                    options: editingQuestion.type === 'multiple_choice' ? editingQuestion.options?.filter(o => o.trim() !== '') : undefined,
                    correctAnswer: editingQuestion.correctAnswer,
                    points: editingQuestion.points || 5,
                    order: editingQuestion.order ?? 0,
                    createdAt: editingQuestion.createdAt || new Date().toISOString()
                  });
                  setEditingQuestion(null);
                }}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-xl text-sm font-bold shadow-md"
              >
                حفظ السؤال
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- نافذة تأكيد الإجراءات البديلة لـ confirm (للتغلب على قيود الـ Iframe) --- */}
      {confirmState.isOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto mb-2">
              <ShieldAlert className="w-6 h-6 animate-pulse" />
            </div>
            
            <h3 className="text-base font-bold text-slate-900 dark:text-white font-sans">
              {confirmState.title}
            </h3>
            
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-sans">
              {confirmState.message}
            </p>

            <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-800 justify-center">
              <button
                disabled={confirmLoading}
                onClick={() => setConfirmState(prev => ({ ...prev, isOpen: false }))}
                className="px-4 py-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold disabled:opacity-50 transition-all"
              >
                إلغاء
              </button>
              <button
                disabled={confirmLoading}
                onClick={async () => {
                  setConfirmLoading(true);
                  try {
                    await confirmState.onConfirm();
                  } catch (err) {
                    console.error("Error during confirmation action:", err);
                  } finally {
                    setConfirmLoading(false);
                    setConfirmState(prev => ({ ...prev, isOpen: false }));
                  }
                }}
                className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-xl text-xs font-bold shadow-md active:scale-95 disabled:opacity-50 flex items-center gap-1.5 transition-all"
              >
                {confirmLoading ? (
                  <>
                    <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>جاري التنفيذ...</span>
                  </>
                ) : (
                  <span>تأكيد الحذف</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
