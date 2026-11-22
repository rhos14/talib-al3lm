import { useState, useEffect, useRef } from 'react';
import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  updateDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  getDocs,
  where
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { 
  LectureImportTask, 
  LectureImportItem, 
  CourseLectureItem, 
  getYoutubeId 
} from '../types';
import { OperationType, handleFirestoreError } from './useCoursesManager';
import { buildApiUrl } from '../lib/apiClient';

export function useSmartImportTasks() {
  const [tasks, setTasks] = useState<LectureImportTask[]>([]);
  const [loading, setLoading] = useState(true);
  const activeRunningTaskIdRef = useRef<string | null>(null);
  const pauseRequestedRef = useRef<Record<string, boolean>>({});

  // استماع مباشر لمهام الاستيراد في Firestore عند تسجيل الدخول
  useEffect(() => {
    let unsubscribe = () => {};
    const authUnsub = auth.onAuthStateChanged((user) => {
      unsubscribe();
      unsubscribe = () => {};
      if (!user) {
        setTasks([]);
        setLoading(false);
        return;
      }
      try {
        const q = query(collection(db, 'lecture_import_tasks'), orderBy('createdAt', 'desc'));
        unsubscribe = onSnapshot(q, (snapshot) => {
          if (!snapshot.empty) {
            const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as LectureImportTask));
            setTasks(list);
          } else {
            setTasks([]);
          }
          setLoading(false);
        }, (err) => {
          console.warn("تنبيه مهام الاستيراد:", err?.message || err);
          setTasks([]);
          setLoading(false);
        });
      } catch (e) {
        console.warn("خطأ في بدء استماع مهام الاستيراد:", e);
        setLoading(false);
      }
    });

    return () => {
      authUnsub();
      unsubscribe();
    };
  }, []);

  /**
   * إنشاء مهمة استيراد جديدة وحفظها في Firestore
   */
  const createImportTask = async (params: {
    courseId: string;
    courseTitle: string;
    bookId: string;
    bookTitle: string;
    playlistUrl: string;
    playlistId?: string;
    pdfUrl?: string;
    batchSize: '5' | '10' | '20' | '50' | 'all';
    rawItems: Array<{ videoId: string; title: string; videoUrl: string; duration?: string }>;
  }): Promise<LectureImportTask> => {
    const adminUser = auth.currentUser;
    const taskId = `task_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    // جلب محاضرات الكتاب الحالي للتحقق من عدم تكرار أي فيديو مسبقاً
    let existingLecturesInBook: CourseLectureItem[] = [];
    try {
      const lecsSnap = await getDocs(
        query(collection(db, 'course_lectures'), where('bookId', '==', params.bookId))
      );
      if (!lecsSnap.empty) {
        existingLecturesInBook = lecsSnap.docs.map(d => ({ id: d.id, ...d.data() } as CourseLectureItem));
      }
    } catch (fetchErr) {
      console.warn("تعذر التحقق المسبق من المحاضرات في الكتاب:", fetchErr);
    }

    const existingVideoIds = new Map<string, string>();
    existingLecturesInBook.forEach(lec => {
      const vid = getYoutubeId(lec.videoUrl);
      if (vid) {
        existingVideoIds.set(vid, lec.id);
      }
    });

    const targetPdfUrl = params.pdfUrl?.trim() || undefined;

    // تجهيز عناصر المهمة مع كشف التكرار
    let skippedCount = 0;
    const items: LectureImportItem[] = params.rawItems.map((raw, index) => {
      const isDuplicate = existingVideoIds.has(raw.videoId);
      if (isDuplicate) {
        skippedCount++;
        return {
          id: `item_${raw.videoId}_${index}`,
          videoId: raw.videoId,
          title: raw.title,
          videoUrl: raw.videoUrl,
          duration: raw.duration || '00:00',
          order: index + 1,
          status: 'skipped',
          quizStatus: 'not_started',
          pdfUrl: targetPdfUrl,
          existingLectureId: existingVideoIds.get(raw.videoId),
          skipReason: 'المحاضرة مضافة مسبقاً لهذا الكتاب العلمي (تم منع التكرار)'
        };
      }

      return {
        id: `item_${raw.videoId}_${index}`,
        videoId: raw.videoId,
        title: raw.title,
        videoUrl: raw.videoUrl,
        duration: raw.duration || '00:00',
        order: index + 1,
        status: 'pending',
        quizStatus: 'pending_notebooklm',
        pdfUrl: targetPdfUrl,
        quizQuestionsCount: 0
      };
    });

    const totalCount = items.length;
    const remainingCount = totalCount - skippedCount;

    const newTask: LectureImportTask = {
      id: taskId,
      courseId: params.courseId,
      courseTitle: params.courseTitle,
      bookId: params.bookId,
      bookTitle: params.bookTitle,
      playlistUrl: params.playlistUrl,
      playlistId: params.playlistId,
      pdfUrl: targetPdfUrl,
      batchSize: params.batchSize,
      status: 'idle',
      totalCount,
      completedCount: 0,
      remainingCount,
      skippedCount,
      errorCount: 0,
      items,
      notebookLmReady: false,
      notebookLmNote: 'سير العمل المعتمد: إضافة رابط يوتيوب كمصدر في NotebookLM ثم إرسال طلب لإنشاء الأسئلة وحفظها. لم يتم الاتصال الفعلي بعد، ولن يتم إنشاء أسئلة وهمية تجنباً للخلل العلمي.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      adminUid: adminUser?.uid || 'admin_user',
      adminEmail: adminUser?.email || ''
    };

    try {
      await setDoc(doc(db, 'lecture_import_tasks', taskId), newTask);
      return newTask;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `lecture_import_tasks/${taskId}`);
      throw err;
    }
  };

  /**
   * إيقاف المهمة مؤقتاً
   */
  const pauseImportTask = async (taskId: string) => {
    pauseRequestedRef.current[taskId] = true;
    try {
      await updateDoc(doc(db, 'lecture_import_tasks', taskId), {
        status: 'paused',
        updatedAt: new Date().toISOString()
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `lecture_import_tasks/${taskId}`);
    }
  };

  /**
   * تشغيل أو استئناف مهمة الاستيراد
   */
  const runImportTask = async (task: LectureImportTask) => {
    const taskId = task.id;
    pauseRequestedRef.current[taskId] = false;
    activeRunningTaskIdRef.current = taskId;

    try {
      await updateDoc(doc(db, 'lecture_import_tasks', taskId), {
        status: 'running',
        updatedAt: new Date().toISOString()
      });

      // جلب أحدث محاضرات الكتاب لتحديد الترتيب ومراجعة التكرار لحظياً
      const lecsSnap = await getDocs(
        query(collection(db, 'course_lectures'), where('bookId', '==', task.bookId))
      );
      const existingLectures = lecsSnap.docs.map(d => ({ id: d.id, ...d.data() } as CourseLectureItem));
      
      const existingVideoIds = new Set<string>();
      let maxOrder = 0;
      existingLectures.forEach(l => {
        const vid = getYoutubeId(l.videoUrl);
        if (vid) existingVideoIds.add(vid);
        if ((l.order ?? 0) > maxOrder) maxOrder = l.order ?? 0;
      });

      // تحديد العناصر المطلوب معالجتها في هذه الدفعة
      const pendingIndices: number[] = [];
      task.items.forEach((item, idx) => {
        if (item.status === 'pending' || item.status === 'failed') {
          pendingIndices.push(idx);
        }
      });

      let limitCount = pendingIndices.length;
      if (task.batchSize === '5') limitCount = Math.min(5, pendingIndices.length);
      else if (task.batchSize === '10') limitCount = Math.min(10, pendingIndices.length);
      else if (task.batchSize === '20') limitCount = Math.min(20, pendingIndices.length);
      else if (task.batchSize === '50') limitCount = Math.min(50, pendingIndices.length);

      const toProcessIndices = pendingIndices.slice(0, limitCount);
      const updatedItems = [...task.items];
      let completedCount = task.completedCount;
      let skippedCount = task.skippedCount;
      let errorCount = task.errorCount;

      for (let i = 0; i < toProcessIndices.length; i++) {
        // فحص إذا طلب المشرف إيقاف المهمة
        if (pauseRequestedRef.current[taskId]) {
          console.log(`[IMPORT TASK] Task ${taskId} paused by admin request.`);
          await updateDoc(doc(db, 'lecture_import_tasks', taskId), {
            status: 'paused',
            items: updatedItems,
            completedCount,
            skippedCount,
            errorCount,
            remainingCount: task.totalCount - completedCount - skippedCount,
            updatedAt: new Date().toISOString()
          });
          return;
        }

        const itemIndex = toProcessIndices[i];
        const item = updatedItems[itemIndex];

        // التحقق من صحة البيانات وعدم وجود بيانات وهمية
        if (!item.videoId || item.videoId.length !== 11 || !item.title || !item.videoUrl) {
          updatedItems[itemIndex] = {
            ...item,
            status: 'failed',
            errorMessage: 'فشل التحقق من بيانات المحاضرة: معرّف الفيديو أو العنوان غير صالح'
          };
          errorCount++;
          continue;
        }

        // فحص التكرار لمنع إضافة المحاضرة نفسها مرتين لنفس الكتاب
        if (existingVideoIds.has(item.videoId)) {
          updatedItems[itemIndex] = {
            ...item,
            status: 'skipped',
            skipReason: 'المحاضرة مضافة مسبقاً في هذا الكتاب العلمي'
          };
          skippedCount++;
          continue;
        }

        // إضافة المحاضرة الحقيقية إلى جدول المحاضرات في Firebase مع ربط كتاب PDF
        try {
          maxOrder += 1;
          const newLectureId = `lec_${item.videoId}_${Date.now()}`;
          const targetPdf = task.pdfUrl || item.pdfUrl || undefined;

          // محاولة جلب مدة الفيديو الدقيقة إن لم تكن متوفرة
          let finalDuration = item.duration;
          if (!finalDuration || finalDuration === '00:00') {
            try {
              const token = await auth.currentUser?.getIdToken();
              const headers: Record<string, string> = {};
              if (token) {
                headers['Authorization'] = `Bearer ${token}`;
              }
              const durRes = await fetch(buildApiUrl(`/api/admin/video-duration?videoId=${item.videoId}`), {
                headers
              });
              const durData = await durRes.json();
              if (durData.success && durData.duration && durData.duration !== '00:00') {
                finalDuration = durData.duration;
              }
            } catch (durErr) {
              console.warn(`Could not resolve duration for ${item.videoId}:`, durErr);
            }
          }

          const newLecture: CourseLectureItem = {
            id: newLectureId,
            bookId: task.bookId,
            courseId: task.courseId,
            title: item.title,
            description: '', // تم إيقاف إضافة وصف تلقائي للمحاضرة بناءً على طلب المشرف
            videoUrl: item.videoUrl,
            pdfUrl: targetPdf,
            duration: finalDuration || item.duration || '00:00',
            order: maxOrder,
            createdAt: new Date().toISOString()
          };

          // حفظ المحاضرة في Firestore
          await setDoc(doc(db, 'course_lectures', newLectureId), newLecture);
          existingVideoIds.add(item.videoId);

          // تحديث حالة العنصر: تم الاستيراد بنجاح، وتوثيق وضع NotebookLM والوقت
          updatedItems[itemIndex] = {
            ...item,
            duration: finalDuration || item.duration || '00:00',
            status: 'completed',
            importedLectureId: newLectureId,
            pdfUrl: targetPdf,
            quizStatus: 'pending_notebooklm',
            quizQuestionsCount: 0
          };
          completedCount++;

          // حفظ التقدم تدريجياً في المهمة
          await updateDoc(doc(db, 'lecture_import_tasks', taskId), {
            items: updatedItems,
            completedCount,
            skippedCount,
            errorCount,
            remainingCount: task.totalCount - completedCount - skippedCount,
            updatedAt: new Date().toISOString()
          });

        } catch (itemErr: any) {
          console.error(`[IMPORT TASK] Failed to save lecture ${item.videoId}:`, itemErr);
          updatedItems[itemIndex] = {
            ...item,
            status: 'failed',
            errorMessage: itemErr.message || 'حدث خطأ أثناء حفظ المحاضرة في Firebase'
          };
          errorCount++;
        }
      }

      // حساب الحالة النهائية
      const remainingCount = task.totalCount - completedCount - skippedCount;
      const finalStatus = remainingCount === 0 ? 'completed' : 'paused';

      await updateDoc(doc(db, 'lecture_import_tasks', taskId), {
        status: finalStatus,
        items: updatedItems,
        completedCount,
        skippedCount,
        errorCount,
        remainingCount,
        updatedAt: new Date().toISOString()
      });

    } catch (err: any) {
      console.error(`[IMPORT TASK] Critical error in task ${taskId}:`, err);
      try {
        await updateDoc(doc(db, 'lecture_import_tasks', taskId), {
          status: 'failed',
          updatedAt: new Date().toISOString()
        });
      } catch (subErr) {
        // ignore
      }
      handleFirestoreError(err, OperationType.WRITE, `lecture_import_tasks/${taskId}`);
    } finally {
      activeRunningTaskIdRef.current = null;
    }
  };

  /**
   * تطبيق أو تحديث رابط كتاب PDF لجميع محاضرات المهمة دفعة واحدة
   */
  const applyPdfToTaskLectures = async (taskId: string, pdfUrl: string) => {
    const cleanUrl = pdfUrl.trim();
    if (!cleanUrl) return;

    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    try {
      // 1. تحديث المحاضرات في course_lectures
      const lectureIds = task.items
        .map(i => i.importedLectureId || i.existingLectureId)
        .filter((id): id is string => !!id);

      for (const lecId of lectureIds) {
        try {
          await updateDoc(doc(db, 'course_lectures', lecId), {
            pdfUrl: cleanUrl
          });
        } catch (lErr) {
          console.warn(`Could not update lecture ${lecId} with pdfUrl:`, lErr);
        }
      }

      // 2. تحديث سجل المهمة
      const updatedItems = task.items.map(item => ({
        ...item,
        pdfUrl: cleanUrl
      }));

      await updateDoc(doc(db, 'lecture_import_tasks', taskId), {
        pdfUrl: cleanUrl,
        items: updatedItems,
        updatedAt: new Date().toISOString()
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `lecture_import_tasks/${taskId}/apply-pdf`);
      throw err;
    }
  };

  /**
   * حذف جميع المحاضرات التي تم وضعها/استيرادها من خلال مهمة الاستيراد
   * مع حذف أي أسئلة اختبارات تابعة لها، وإعادة تعيين حالة المهمة للانتظار
   */
  const deleteTaskLectures = async (taskId: string): Promise<{ deletedLecturesCount: number; deletedQuestionsCount: number }> => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) throw new Error('مهمة الاستيراد غير موجودة');

    try {
      let deletedLecturesCount = 0;
      let deletedQuestionsCount = 0;

      // جمع معرفات المحاضرات التي تم استيرادها بواسطة هذه المهمة
      const lectureIds = task.items
        .map(i => i.importedLectureId)
        .filter((id): id is string => !!id);

      for (const lecId of lectureIds) {
        try {
          // 1. حذف المحاضرة من كوليكشن course_lectures
          await deleteDoc(doc(db, 'course_lectures', lecId));
          deletedLecturesCount++;

          // 2. حذف أي أسئلة اختبارات تابعة لهذه المحاضرة في lecture_questions
          const qSnap = await getDocs(query(collection(db, 'lecture_questions'), where('lectureId', '==', lecId)));
          for (const qDoc of qSnap.docs) {
            await deleteDoc(doc(db, 'lecture_questions', qDoc.id));
            deletedQuestionsCount++;
          }
        } catch (itemDelErr) {
          console.warn(`[DELETE TASK LECTURES] Could not delete lecture ${lecId}:`, itemDelErr);
        }
      }

      // 3. إعادة تعيين عناصر المهمة إلى قيد الانتظار pending
      const resetItems = task.items.map(item => {
        if (item.importedLectureId) {
          return {
            ...item,
            status: 'pending' as const,
            importedLectureId: undefined,
            quizStatus: 'not_created' as const,
            quizQuestionsCount: 0,
            errorMessage: undefined
          };
        }
        return item;
      });

      const totalCount = task.totalCount;
      const skippedCount = task.skippedCount || 0;

      await updateDoc(doc(db, 'lecture_import_tasks', taskId), {
        status: 'pending',
        items: resetItems,
        completedCount: 0,
        remainingCount: totalCount - skippedCount,
        errorCount: 0,
        updatedAt: new Date().toISOString()
      });

      return { deletedLecturesCount, deletedQuestionsCount };
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `lecture_import_tasks/${taskId}/delete-lectures`);
      throw err;
    }
  };

  /**
   * حذف مهمة استيراد مع خيار حذف المحاضرات التي تم إنشاؤها عبرها أيضاً
   */
  const deleteImportTask = async (taskId: string, deleteLectures = false) => {
    try {
      if (deleteLectures) {
        await deleteTaskLectures(taskId);
      }
      await deleteDoc(doc(db, 'lecture_import_tasks', taskId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `lecture_import_tasks/${taskId}`);
      throw err;
    }
  };

  return {
    tasks,
    loading,
    createImportTask,
    runImportTask,
    pauseImportTask,
    applyPdfToTaskLectures,
    deleteTaskLectures,
    deleteImportTask
  };
}
