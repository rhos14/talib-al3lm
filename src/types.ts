export const BASE_URL = typeof window !== 'undefined' ? window.location.origin : "";

export function resolveFileUrl(url: string | undefined | null): string {
  if (!url) return '';
  const clean = url.trim();
  if (!clean) return '';

  const lower = clean.toLowerCase();
  // حماية ضد حقن السكربتات المباشرة عبر البروتوكولات غير الآمنة
  if (lower.startsWith('javascript:') || lower.startsWith('vbscript:') || lower.startsWith('data:text/html')) {
    return '';
  }
  
  // If it's a Drive or Docs URL, make sure it has the protocol and return it
  if (clean.includes('drive.google.com') || clean.includes('docs.google.com')) {
    let finalUrl = clean;
    // If the browser or a relative route prepended localhost/127.0.0.1 by mistake, strip it
    if (finalUrl.includes('localhost:') || finalUrl.includes('127.0.0.1:')) {
      const idxDrive = finalUrl.indexOf('drive.google.com');
      const idxDocs = finalUrl.indexOf('docs.google.com');
      if (idxDrive !== -1) {
        finalUrl = finalUrl.substring(idxDrive);
      } else if (idxDocs !== -1) {
        finalUrl = finalUrl.substring(idxDocs);
      }
    }
    if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
      finalUrl = `https://${finalUrl}`;
    }

    // Automatically convert Google Drive view links to direct preview links for seamless viewing
    let fileId = '';
    const fileDMatch = finalUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (fileDMatch && fileDMatch[1]) {
      fileId = fileDMatch[1];
    } else {
      const idMatch = finalUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/);
      if (idMatch && idMatch[1]) {
        fileId = idMatch[1];
      }
    }

    if (fileId) {
      finalUrl = `https://drive.google.com/file/d/${fileId}/preview`;
    }

    return finalUrl;
  }

  // If the link contains /uploads/, automatically translate it to direct Firebase Storage URL
  if (clean.includes('/uploads/')) {
    const idx = clean.indexOf('/uploads/');
    const relativePath = clean.substring(idx + 9);
    const encodedPath = encodeURIComponent(relativePath);
    return `https://firebasestorage.googleapis.com/v0/b/tlb-ilm-r.firebasestorage.app/o/${encodedPath}?alt=media`;
  }

  // Return standard absolute URLs (such as Firebase Storage) as is immediately
  if (clean.startsWith('http://') || clean.startsWith('https://')) {
    return clean;
  }

  return clean;
}

/**
 * دالة مشتركة لاستخراج معرف فيديو يوتيوب من مختلف صيغ الروابط
 */
export function getYoutubeId(url?: string | null): string | null {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: 'admin' | 'student';
  createdAt: string;
  displayName?: string;
  firstName?: string;
  lastName?: string;
  profileCompleted?: boolean;
  level?: 'مبتدئ' | 'متوسط' | 'متقدم';
  streak?: number;
  lastStreakDate?: string;
  completedMutunCount?: number;
  completedBooksCount?: number;
  photoURL?: string;
  photoFileId?: string;
  bio?: string;
  joinDate?: string;
}

export interface Matn {
  id: string;
  title: string;
  author: string;
  category: 'العقيدة' | 'الفقه' | 'الحديث' | 'النحو' | 'أصول الفقه' | 'التفسير' | 'الرقائق' | 'مصطلح الحديث';
  level: 'مبتدئ' | 'متوسط' | 'متقدم';
  description: string;
  audioUrl?: string;
  pdfUrl?: string;
  text?: string;
  totalChapters: number;
  completedChapters?: number;
  isCompleted?: boolean;
}

export interface Lecture {
  id: string;
  title: string;
  sheikh: string;
  category: string;
  seriesTitle?: string;
  durationMinutes: number;
  videoUrl?: string;
  audioUrl?: string;
  dateAdded: string;
  isWatched?: boolean;
  userNotes?: string;
}

export interface Faidah {
  id: string;
  title: string;
  content: string;
  category: string;
  sourceBook: string;
  sheikh?: string;
  pageNumber?: string;
  createdAt: string;
  tags: string[];
  isFavorite?: boolean;
}

export interface StudyHabit {
  id: string;
  title: string;
  category: 'القرآن الكريم' | 'حفظ المتون' | 'مراجعة' | 'قراءة حرة' | 'سماع دروس';
  targetUnit: string; // مثلاً: صفحة، باب، دقيقة
  targetCount: number;
  completedToday: number;
  streak: number;
  history: { [date: string]: boolean };
}

export interface CommunityPost {
  id: string;
  authorId: string;
  authorName: string;
  authorPhoto?: string;
  authorLevel?: string;
  title: string;
  body: string;
  category: 'مسألة فقهية' | 'فوائد حديثية' | 'نصيحة لطالب العلم' | 'استفسار منهجي' | 'نقاش عام';
  createdAt: string;
  likes: number;
  likedBy?: string[];
  commentsCount: number;
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorPhoto?: string;
  content: string;
  createdAt: string;
}

export interface ToastMessage {
  id: string;
  title: string;
  message?: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  imageFileId?: string;
  order: number;
  isVisible: boolean;
  createdAt: string;
  courseType?: 'master' | 'sequential' | 'standalone'; // 'master' = دورة رئيسية جامعة (دورة كبيرة) | 'sequential' = دورة منهجية أو مستوى | 'standalone' = دورة صغيرة ومستقلة
  isMasterCourse?: boolean; // علامة تمييز الدورة كدورة رئيسية جامعة تضم مستويات أو دورات فرعية
  parentCourseId?: string | null; // معرف الدورة الكبيرة التابعة لها إن كانت مستوى أو دورة فرعية
  prerequisiteCourseId?: string | null; // معرف الدورة السابقة المشروطة لفتح هذه الدورة
  isStandalone?: boolean; // علامة تمييز الدورة كدورة صغيرة ومستقلة لا ترتبط بدورات أخرى
}

export interface CourseBook {
  id: string;
  courseId: string;
  title: string;
  imageUrl?: string;
  imageFileId?: string;
  order: number;
  createdAt: string;
  pdfUrl?: string;
  pdfPageCount?: number;
  pdfSize?: string;
}

export interface CourseLectureItem {
  id: string;
  bookId: string;
  courseId: string;
  title: string;
  description?: string;
  videoUrl?: string;
  audioUrl?: string;
  pdfUrl?: string;
  notes?: string;
  duration?: string;
  order: number;
  createdAt: string;
  isFinalSession?: boolean;
}

export type QuizQuestionType = 'multiple_choice' | 'true_false' | 'short_answer';

export interface LectureQuizQuestion {
  id: string;
  lectureId: string;
  bookId: string;
  courseId: string;
  type: QuizQuestionType;
  question: string;
  options?: string[];
  correctAnswer: string;
  points: number;
  order: number;
  createdAt: string;
}

export type LectureQuestion = LectureQuizQuestion;

export interface StudentLectureProgress {
  id: string; // يشير إلى lectureId
  lectureId: string;
  bookId: string;
  courseId: string;
  attemptsCount: number;
  lastScore: number; // النسبة المئوية 0-100
  bestScore: number; // النسبة المئوية 0-100
  lastAttemptDate: string;
  isPassed: boolean; // >= 60%
  isLectureFinished?: boolean; // هل تم الضغط على زر إنهاء المحاضرة
  
  // حقول تتبع التقدم الجديدة للقسم التفاعلي
  lastPdfPage?: number;
  lastPlaybackPosition?: number; // وقت التوقف بالثواني
  lectureWatchPercentage?: number; // نسبة المشاهدة 0-100
  bookReadPercentage?: number; // نسبة القراءة 0-100
  totalLessonProgressPercentage?: number; // نسبة الإنجاز الإجمالية 0-100
  bookmarks?: number[]; // قائمة الصفحات المحفوظة كعلامات مرجعية
}

export interface StudentActivity {
  id: string;
  type: 'lecture_complete' | 'quiz_pass' | 'quiz_fail' | 'certificate_earned' | 'streak_milestone';
  title: string;
  description: string;
  timestamp: string;
  details?: string;
}

export interface StudentNotification {
  id: string;
  title: string;
  body: string;
  type: 'info' | 'success' | 'alert' | 'badge';
  timestamp: string;
  isRead: boolean;
}

export interface Certificate {
  id: string;
  studentId: string;
  studentName: string;
  courseName: string;
  bookName: string;
  date: string;
  certificateNumber: string;
  issuedBy: string;
  createdAt: string;
  fileUrl?: string;
}

export interface CertificateRequest {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  courseId: string;
  courseTitle: string;
  bookId: string;
  bookTitle: string;
  timestamp: string;
  status: 'pending' | 'issued';
  isFinalSession?: boolean;
}

export type ImportTaskStatus = 'idle' | 'running' | 'paused' | 'completed' | 'failed';
export type ImportItemStatus = 'pending' | 'in_progress' | 'completed' | 'skipped' | 'failed';
export type ImportQuizStatus = 'not_started' | 'pending_notebooklm' | 'generated' | 'failed';

export interface LectureImportItem {
  id: string;
  videoId: string;
  title: string;
  videoUrl: string;
  duration?: string;
  order: number;
  status: ImportItemStatus;
  quizStatus: ImportQuizStatus;
  quizQuestionsCount?: number;
  existingLectureId?: string;
  importedLectureId?: string;
  pdfUrl?: string;
  errorMessage?: string;
  skipReason?: string;
}

export interface LectureImportTask {
  id: string;
  courseId: string;
  courseTitle: string;
  bookId: string;
  bookTitle: string;
  playlistUrl: string;
  playlistId?: string;
  pdfUrl?: string;
  batchSize: '5' | '10' | '20' | '50' | 'all';
  status: ImportTaskStatus;
  totalCount: number;
  completedCount: number;
  remainingCount: number;
  skippedCount: number;
  errorCount: number;
  items: LectureImportItem[];
  notebookLmReady: boolean;
  notebookLmNote: string;
  createdAt: string;
  updatedAt: string;
  adminUid: string;
  adminEmail?: string;
}
