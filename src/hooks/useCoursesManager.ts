import { useState, useEffect } from 'react';
import { collection, doc, setDoc, deleteDoc, onSnapshot, writeBatch } from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';
import { db, storage, auth } from '../lib/firebase';
import { Course, CourseBook, CourseLectureItem, LectureQuizQuestion } from '../types';
import { deleteOldCoverIfUnusedStorage } from '../lib/storageMedia';
import { cleanupReplacedImageKitCover } from '../lib/imagekitMedia';

// بيانات أولية تجريبية للمعاينة الفورية قبل الاتصال المباشر بقاعدة البيانات
const DEMO_COURSES: Course[] = [
  {
    id: "course_1",
    title: "الدورة الأولى: التأصيل العلمي والشرعي",
    description: "شروحات المتون العلمية المعتمدة للمستوى الأول من طالب العلم الشرعي: الأصول الثلاثة، الأربعين النووية، وغيرها.",
    imageUrl: "https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?auto=format&fit=crop&q=80&w=300",
    order: 0,
    isVisible: true,
    createdAt: new Date().toISOString()
  }
];

const DEMO_BOOKS: CourseBook[] = [
  {
    id: "book_1",
    courseId: "course_1",
    title: "الأصول الثلاثة وأدلتها",
    order: 0,
    createdAt: new Date().toISOString(),
    pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    pdfPageCount: 16,
    pdfSize: "1.2 MB"
  }
];

const DEMO_LECTURES: CourseLectureItem[] = [
  {
    id: "lec_1_1",
    bookId: "book_1",
    courseId: "course_1",
    title: "المجلس الأول: مقدمة المتن والمسائل الأربع",
    description: "شرح المسائل الأربع التي تضمنتها مقدمة الإمام محمد بن عبد الوهاب رحمه الله: العلم، العمل به، الدعوة إليه، والصبر على الأذى فيه.",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    notes: "تشتمل مقدمة متن الأصول الثلاثة على أربع مسائل رئيسية يجب على كل مسلم ومسلمة تعلمها والعمل بها:\n\n١. العلم: وهو معرفة الله عز وجل، ومعرفة نبيه صلى الله عليه وسلم، ومعرفة دين الإسلام بالأدلة.\n٢. العمل به: ثمرة العلم العمل، فلا علم بلا عمل.\n٣. الدعوة إليه: تعليم الناس وإرشادهم لما تعلمه المسلم.\n٤. الصبر على الأذى فيه: تحمل ما يواجه الداعي وطالب العلم من مشاق في سبيل الله.",
    duration: "25 دقيقة",
    order: 0,
    createdAt: new Date().toISOString()
  },
  {
    id: "lec_1_2",
    bookId: "book_1",
    courseId: "course_1",
    title: "المجلس الثاني: الأصول الثلاثة (معرفة الله عز وجل)",
    description: "بيان الأصل الأول من الأصول الثلاثة وهو معرفة العبد ربه بالدلائل والآيات الكونية والقرآنية.",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    notes: "الأصل الأول: معرفة العبد ربه.\nإذا قيل لك: من ربك؟ فقل: ربي الله الذي رباني وربى جميع العالمين بنعمه، وهو معبودي ليس لي معبود سواه.\nوالدليل قوله تعالى: {الحمد لله رب العالمين}.",
    duration: "30 دقيقة",
    order: 1,
    createdAt: new Date().toISOString()
  }
];

const DEMO_QUESTIONS: LectureQuizQuestion[] = [
  {
    id: "q_1",
    lectureId: "lec_1_1",
    bookId: "book_1",
    courseId: "course_1",
    type: "multiple_choice",
    question: "ما هي المسألة الأولى من المسائل الأربع المذكورة في مقدمة المتن؟",
    options: ["العمل بالعلم", "العلم ومعرفة الله ورسوله ودين الإسلام", "الدعوة إلى الله", "الصبر على الأذى في الدعوة"],
    correctAnswer: "العلم ومعرفة الله ورسوله ودين الإسلام",
    points: 10,
    order: 0,
    createdAt: new Date().toISOString()
  },
  {
    id: "q_2",
    lectureId: "lec_1_1",
    bookId: "book_1",
    courseId: "course_1",
    type: "true_false",
    question: "هل ثمرة العلم النافع هي العمل به والدعوة إليه والصبر على الأذى في سبيل ذلك؟",
    options: ["صح", "خطأ"],
    correctAnswer: "صح",
    points: 10,
    order: 1,
    createdAt: new Date().toISOString()
  },
  {
    id: "q_3",
    lectureId: "lec_1_2",
    bookId: "book_1",
    courseId: "course_1",
    type: "multiple_choice",
    question: "ما هو الدليل على أن الله تعالى هو رب جميع العالمين؟",
    options: ["قوله تعالى: {الحمد لله رب العالمين}", "قوله تعالى: {قل أعوذ برب الفلق}", "قوله تعالى: {قل هو الله أحد}", "قوله تعالى: {إنا أعطيناك الكوثر}"],
    correctAnswer: "قوله تعالى: {الحمد لله رب العالمين}",
    points: 10,
    order: 0,
    createdAt: new Date().toISOString()
  }
];

// دالة لحذف ملفات الـ Firebase Storage عن طريق رابط الـ URL الخاص بها
const deleteStorageFileByUrl = async (url?: string) => {
  if (!url) return;
  if (url.includes('firebasestorage.googleapis.com')) {
    try {
      const decodedUrl = decodeURIComponent(url);
      const parts = decodedUrl.split('/o/');
      if (parts.length > 1) {
        const filePathWithParams = parts[1];
        const filePath = filePathWithParams.split('?')[0];
        const fileRef = ref(storage, filePath);
        await deleteObject(fileRef);
        console.log(`Successfully deleted storage file: ${filePath}`);
      }
    } catch (err) {
      console.warn("Failed to delete storage file:", err);
    }
  }
};

const cleanData = <T extends Record<string, any>>(obj: T): T => {
  const clean: Record<string, any> = {};
  Object.keys(obj).forEach(key => {
    if (obj[key] !== undefined) {
      clean[key] = obj[key];
    }
  });
  return clean as T;
};

// تعريف أنواع العمليات ومعلومات الأخطاء طبقاً لإرشادات Firebase Integration Skill
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export function useCoursesManager() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [books, setBooks] = useState<CourseBook[]>([]);
  const [lectures, setLectures] = useState<CourseLectureItem[]>([]);
  const [questions, setQuestions] = useState<LectureQuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubs: (() => void)[] = [];

    try {
      // جلب الدورات وتصنيفها في الذاكرة لتجنب مشاكل الفهارس (Indexes)
      const qCourses = collection(db, 'courses');
      const unsub1 = onSnapshot(qCourses, snap => {
        if (!snap.empty) {
          const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as Course));
          list.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
          setCourses(list);
        } else {
          setCourses(DEMO_COURSES);
        }
        setLoading(false);
      }, err => {
        console.warn("استخدام الوضع التجريبي للدورات أو حدث خطأ:", err);
        setCourses(DEMO_COURSES);
        setLoading(false);
        handleFirestoreError(err, OperationType.LIST, 'courses');
      });

      // جلب الكتب وتصنيفها في الذاكرة لتجنب أي استثناءات في الاستعلامات المباشرة
      const qBooks = collection(db, 'course_books');
      const unsub2 = onSnapshot(qBooks, snap => {
        if (!snap.empty) {
          const list = snap.docs.map(d => {
            const data = d.data();
            console.log(`[DEBUG] useCoursesManager - After reading Book ${d.id} from DB pdfUrl:`, data.pdfUrl);
            return { id: d.id, ...data } as CourseBook;
          });
          list.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
          setBooks(list);
        } else {
          setBooks(DEMO_BOOKS);
        }
      }, err => {
        console.error("خطأ في جلب الكتب:", err);
        setBooks(DEMO_BOOKS);
        handleFirestoreError(err, OperationType.LIST, 'course_books');
      });

      // جلب المحاضرات وتصنيفها في الذاكرة
      const qLectures = collection(db, 'course_lectures');
      const unsub3 = onSnapshot(qLectures, snap => {
        if (!snap.empty) {
          const list = snap.docs.map(d => {
            const data = d.data();
            console.log(`[DEBUG] useCoursesManager - After reading Lecture ${d.id} from DB pdfUrl:`, data.pdfUrl);
            return { id: d.id, ...data } as CourseLectureItem;
          });
          list.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
          setLectures(list);
        } else {
          setLectures(DEMO_LECTURES);
        }
      }, err => {
        console.error("خطأ في جلب المحاضرات:", err);
        setLectures(DEMO_LECTURES);
        handleFirestoreError(err, OperationType.LIST, 'course_lectures');
      });

      // جلب الأسئلة وتصنيفها في الذاكرة (للمشرفة المصرح لها فقط)
      const qQuestions = collection(db, 'lecture_questions');
      const unsub4 = onSnapshot(qQuestions, snap => {
        if (!snap.empty) {
          const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as LectureQuizQuestion));
          list.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
          setQuestions(list);
        } else {
          setQuestions(DEMO_QUESTIONS);
        }
      }, err => {
        // حماية أمنية: الطلاب لا يملكون صلاحية قراءة مجموعة الأسئلة من Firestore
        // لمنع تسرب الإجابات الصحيحة، فيتم جلبها عبر الخادم المنقّى فقط
        if ((err as any)?.code === 'permission-denied') {
          setQuestions([]);
        } else {
          console.error("خطأ في جلب أسئلة الاختبارات:", err);
          handleFirestoreError(err, OperationType.LIST, 'lecture_questions');
        }
      });

      unsubs = [unsub1, unsub2, unsub3, unsub4];
    } catch (e) {
      console.warn("خطأ في ربط مستمعي Firestore للدورات:", e);
      setLoading(false);
    }

    return () => unsubs.forEach(fn => fn());
  }, []);

  // --- إدارة الدورات ---
  const saveCourse = async (course: Course) => {
    const prevCourses = [...courses];
    setCourses(prev => {
      const exists = prev.some(c => c.id === course.id);
      return exists ? prev.map(c => c.id === course.id ? course : c) : [...prev, course];
    });

    try {
      await setDoc(doc(db, 'courses', course.id), cleanData(course));
    } catch (err) {
      setCourses(prevCourses);
      handleFirestoreError(err, OperationType.WRITE, `courses/${course.id}`);
    }
  };

  const deleteCourse = async (courseId: string) => {
    console.log(`[deleteCourse] Starting deletion of course ${courseId}`);

    const prevCourses = [...courses];
    const prevBooks = [...books];
    const prevLectures = [...lectures];
    const prevQuestions = [...questions];

    const courseBooks = books.filter(b => b.courseId === courseId);
    const courseLectures = lectures.filter(l => l.courseId === courseId);
    const courseQuestions = questions.filter(q => q.courseId === courseId);

    setCourses(prev => prev.filter(c => c.id !== courseId));
    setBooks(prev => prev.filter(b => b.courseId !== courseId));
    setLectures(prev => prev.filter(l => l.courseId !== courseId));
    setQuestions(prev => prev.filter(q => q.courseId !== courseId));

    try {
      const batch = writeBatch(db);
      courseQuestions.forEach(q => batch.delete(doc(db, 'lecture_questions', q.id)));
      courseLectures.forEach(l => batch.delete(doc(db, 'course_lectures', l.id)));
      courseBooks.forEach(b => batch.delete(doc(db, 'course_books', b.id)));
      batch.delete(doc(db, 'courses', courseId));
      await batch.commit();

      // حذف الملفات السحابية غير المشتركة بعد تأكيد الحذف من قاعدة البيانات
      const courseObj = prevCourses.find(c => c.id === courseId);
      const remainingCourses = prevCourses.filter(c => c.id !== courseId);
      const remainingCourseCovers = remainingCourses.map(c => c.imageUrl);
      if (courseObj?.imageFileId) {
        await cleanupReplacedImageKitCover({
          purpose: 'course_cover',
          oldFileId: courseObj.imageFileId,
          oldUrl: courseObj.imageUrl,
          otherItems: remainingCourses,
        });
      } else if (courseObj?.imageUrl) {
        await deleteOldCoverIfUnusedStorage('course_covers', courseObj.imageUrl, null, remainingCourseCovers);
      }
      const remainingBooks = prevBooks.filter(b => b.courseId !== courseId);
      const remainingBookCovers = remainingBooks.map(b => b.imageUrl);
      for (const b of courseBooks) {
        if (b.imageFileId) {
          await cleanupReplacedImageKitCover({
            purpose: 'book_cover',
            oldFileId: b.imageFileId,
            oldUrl: b.imageUrl,
            otherItems: remainingBooks,
          });
        } else if (b.imageUrl) {
          await deleteOldCoverIfUnusedStorage('book_covers', b.imageUrl, null, remainingBookCovers);
        }
        if (b.pdfUrl) {
          await deleteStorageFileByUrl(b.pdfUrl);
        }
      }
      for (const lec of courseLectures) {
        if (lec.videoUrl) await deleteStorageFileByUrl(lec.videoUrl);
        if (lec.audioUrl) await deleteStorageFileByUrl(lec.audioUrl);
        if (lec.pdfUrl) await deleteStorageFileByUrl(lec.pdfUrl);
      }
    } catch (err) {
      console.error("[deleteCourse] Error occurred during deletion. Rolling back UI state.", err);
      setCourses(prevCourses);
      setBooks(prevBooks);
      setLectures(prevLectures);
      setQuestions(prevQuestions);
      handleFirestoreError(err, OperationType.DELETE, `courses/${courseId}`);
    }
  };

  const updateCoursesOrder = async (reorderedCourses: Course[]) => {
    const updated = reorderedCourses.map((c, index) => ({ ...c, order: index }));
    setCourses(updated);

    try {
      const batch = writeBatch(db);
      updated.forEach(c => {
        batch.update(doc(db, 'courses', c.id), { order: c.order });
      });
      await batch.commit();
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'courses/reorder');
    }
  };

  const toggleCourseVisibility = async (course: Course) => {
    const updated = { ...course, isVisible: !course.isVisible };
    await saveCourse(updated);
  };

  // --- إدارة الكتب ---
  const saveBook = async (book: CourseBook) => {
    const normalizedBook = { ...book, order: book.order ?? 0 };
    const prevBooks = [...books];
    setBooks(prev => {
      const exists = prev.some(b => b.id === normalizedBook.id);
      return exists ? prev.map(b => b.id === normalizedBook.id ? normalizedBook : b) : [...prev, normalizedBook];
    });

    try {
      await setDoc(doc(db, 'course_books', normalizedBook.id), cleanData(normalizedBook));
    } catch (err) {
      setBooks(prevBooks);
      handleFirestoreError(err, OperationType.WRITE, `course_books/${normalizedBook.id}`);
    }
  };

  const deleteBook = async (bookId: string) => {
    console.log(`[deleteBook] Starting deletion of book ${bookId}`);
    
    const prevBooks = [...books];
    const prevLectures = [...lectures];
    const prevQuestions = [...questions];

    const bookLectures = lectures.filter(l => l.bookId === bookId);
    const bookQuestions = questions.filter(q => q.bookId === bookId);

    setBooks(prev => prev.filter(b => b.id !== bookId));
    setLectures(prev => prev.filter(l => l.bookId !== bookId));
    setQuestions(prev => prev.filter(q => q.bookId !== bookId));

    try {
      const batch = writeBatch(db);
      bookQuestions.forEach(q => batch.delete(doc(db, 'lecture_questions', q.id)));
      bookLectures.forEach(l => batch.delete(doc(db, 'course_lectures', l.id)));
      batch.delete(doc(db, 'course_books', bookId));
      await batch.commit();

      const bookObj = prevBooks.find(b => b.id === bookId);
      const remainingBooksList = prevBooks.filter(b => b.id !== bookId);
      const remainingBookCovers = remainingBooksList.map(b => b.imageUrl);
      if (bookObj?.imageFileId) {
        await cleanupReplacedImageKitCover({
          purpose: 'book_cover',
          oldFileId: bookObj.imageFileId,
          oldUrl: bookObj.imageUrl,
          otherItems: remainingBooksList,
        });
      } else if (bookObj?.imageUrl) {
        await deleteOldCoverIfUnusedStorage('book_covers', bookObj.imageUrl, null, remainingBookCovers);
      }
      if (bookObj?.pdfUrl) {
        await deleteStorageFileByUrl(bookObj.pdfUrl);
      }
      for (const lec of bookLectures) {
        if (lec.videoUrl) await deleteStorageFileByUrl(lec.videoUrl);
        if (lec.audioUrl) await deleteStorageFileByUrl(lec.audioUrl);
        if (lec.pdfUrl) await deleteStorageFileByUrl(lec.pdfUrl);
      }
    } catch (err) {
      console.error("[deleteBook] Error occurred during deletion. Rolling back UI state.", err);
      setBooks(prevBooks);
      setLectures(prevLectures);
      setQuestions(prevQuestions);
      handleFirestoreError(err, OperationType.DELETE, `course_books/${bookId}`);
    }
  };

  const updateBooksOrder = async (courseId: string, reorderedBooks: CourseBook[]) => {
    const otherBooks = books.filter(b => b.courseId !== courseId);
    const updatedTarget = reorderedBooks.map((b, idx) => ({ ...b, order: idx }));
    setBooks([...otherBooks, ...updatedTarget]);

    try {
      const batch = writeBatch(db);
      updatedTarget.forEach(b => {
        batch.update(doc(db, 'course_books', b.id), { order: b.order });
      });
      await batch.commit();
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'course_books/reorder');
    }
  };

  // --- إدارة المحاضرات ---
  const saveLecture = async (lecture: CourseLectureItem) => {
    if (lecture.order === undefined) {
      lecture.order = 0;
    }
    setLectures(prev => {
      const exists = prev.some(l => l.id === lecture.id);
      return exists ? prev.map(l => l.id === lecture.id ? lecture : l) : [...prev, lecture];
    });

    try {
      await setDoc(doc(db, 'course_lectures', lecture.id), cleanData(lecture));
      console.log("[DEBUG] useCoursesManager (Lecture) - After Saving pdfUrl:", lecture.pdfUrl);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `course_lectures/${lecture.id}`);
    }
  };

  const deleteLecture = async (lectureId: string) => {
    console.log(`[deleteLecture] Starting deletion of lecture ${lectureId}`);
    
    const prevLectures = [...lectures];
    const prevQuestions = [...questions];

    const lectureQuestions = questions.filter(q => q.lectureId === lectureId);

    console.log(`[deleteLecture] Dependent items to clean up: ${lectureQuestions.length} questions.`);

    setLectures(prev => prev.filter(l => l.id !== lectureId));
    setQuestions(prev => prev.filter(q => q.lectureId !== lectureId));

    try {
      // 1. Delete associated lecture files from storage
      const lec = lectures.find(l => l.id === lectureId);
      if (lec) {
        console.log(`[deleteLecture] Deleting storage files for lecture ${lectureId}`);
        if (lec.videoUrl) await deleteStorageFileByUrl(lec.videoUrl);
        if (lec.audioUrl) await deleteStorageFileByUrl(lec.audioUrl);
        if (lec.pdfUrl) await deleteStorageFileByUrl(lec.pdfUrl);
      }

      // 2. Delete lecture and its questions from database
      console.log(`[deleteLecture] Committing Firestore batch deletion...`);
      const batch = writeBatch(db);
      lectureQuestions.forEach(q => {
        batch.delete(doc(db, 'lecture_questions', q.id));
      });
      batch.delete(doc(db, 'course_lectures', lectureId));

      await batch.commit();
      console.log(`[deleteLecture] Successfully deleted lecture ${lectureId} and its items from Firestore!`);
    } catch (err) {
      console.error("[deleteLecture] Error occurred during deletion. Rolling back UI state.", err);
      setLectures(prevLectures);
      setQuestions(prevQuestions);
      handleFirestoreError(err, OperationType.DELETE, `course_lectures/${lectureId}`);
    }
  };

  const updateLecturesOrder = async (bookId: string, reorderedLectures: CourseLectureItem[]) => {
    const otherLectures = lectures.filter(l => l.bookId !== bookId);
    const updatedTarget = reorderedLectures.map((l, idx) => ({ ...l, order: idx }));
    setLectures([...otherLectures, ...updatedTarget]);

    try {
      const batch = writeBatch(db);
      updatedTarget.forEach(l => {
        batch.update(doc(db, 'course_lectures', l.id), { order: l.order });
      });
      await batch.commit();
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'course_lectures/reorder');
    }
  };

  // --- إدارة أسئلة الاختبارات ---
  const saveQuestion = async (question: LectureQuizQuestion) => {
    if (question.order === undefined) {
      question.order = 0;
    }
    setQuestions(prev => {
      const exists = prev.some(q => q.id === question.id);
      return exists ? prev.map(q => q.id === question.id ? question : q) : [...prev, question];
    });

    try {
      await setDoc(doc(db, 'lecture_questions', question.id), cleanData(question));
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `lecture_questions/${question.id}`);
    }
  };

  const saveQuestionsBatch = async (newQuestions: LectureQuizQuestion[]) => {
    if (newQuestions.length === 0) return;

    setQuestions(prev => {
      const updated = [...prev];
      newQuestions.forEach(nq => {
        const idx = updated.findIndex(q => q.id === nq.id);
        if (idx >= 0) {
          updated[idx] = nq;
        } else {
          updated.push(nq);
        }
      });
      return updated;
    });

    try {
      const batch = writeBatch(db);
      newQuestions.forEach(q => {
        batch.set(doc(db, 'lecture_questions', q.id), cleanData(q));
      });
      await batch.commit();
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'lecture_questions/batch');
      throw err;
    }
  };

  const deleteQuestion = async (questionId: string) => {
    console.log(`[deleteQuestion] Starting deletion of question ${questionId}`);
    
    const prevQuestions = [...questions];

    setQuestions(prev => prev.filter(q => q.id !== questionId));

    try {
      console.log(`[deleteQuestion] Deleting question from Firestore: ${questionId}`);
      await deleteDoc(doc(db, 'lecture_questions', questionId));
      console.log(`[deleteQuestion] Successfully deleted question ${questionId} from Firestore!`);
    } catch (err) {
      console.error("[deleteQuestion] Error occurred during deletion. Rolling back UI state.", err);
      setQuestions(prevQuestions);
      handleFirestoreError(err, OperationType.DELETE, `lecture_questions/${questionId}`);
    }
  };

  return {
    courses: courses.sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    books: books.sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    lectures: lectures.sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    questions: questions.sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    loading,
    saveCourse,
    deleteCourse,
    updateCoursesOrder,
    toggleCourseVisibility,
    saveBook,
    deleteBook,
    updateBooksOrder,
    saveLecture,
    deleteLecture,
    updateLecturesOrder,
    saveQuestion,
    saveQuestionsBatch,
    deleteQuestion
  };
}
