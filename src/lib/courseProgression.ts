import { Course, CourseBook, CourseLectureItem, StudentLectureProgress, LectureQuizQuestion } from '../types';

/**
 * فحص ما إذا كانت المحاضرة مكتملة أو مجتازة بنجاح:
 * - إذا كان لها اختبار: يجب أن يكون الاختبار مجتازاً بنسبة 60% فما فوق.
 * - إذا لم يكن لها اختبار: تُعتبر مكتملة إذا تم الضغط على زر الإتمام أو المشاهدة بنسبة 90% فأكثر.
 */
export function isLectureCompleted(
  lectureId: string,
  progresses: StudentLectureProgress[],
  questions: LectureQuizQuestion[]
): boolean {
  const prog = progresses.find(p => p.lectureId === lectureId);
  if (!prog) return false;

  const lecQuestions = questions.filter(q => q.lectureId === lectureId);
  if (lecQuestions.length > 0) {
    return prog.isPassed === true || (prog.bestScore !== undefined && prog.bestScore >= 60) || (prog.lastScore !== undefined && prog.lastScore >= 60);
  }

  return prog.isPassed === true || prog.isLectureFinished === true || (prog.lectureWatchPercentage !== undefined && prog.lectureWatchPercentage >= 90) || (prog.totalLessonProgressPercentage !== undefined && prog.totalLessonProgressPercentage >= 90);
}

/**
 * فحص ما إذا كانت المحاضرة مفتوحة ومتاحة للمشاهدة:
 * - إذا كان الكتاب نفسه مقفلاً، فإن جميع محاضراته مقفلة.
 * - المحاضرة الأولى في الكتاب المفتوح مفتوحة دائماً.
 * - المحاضرات اللاحقة لا تُفتح إلا بعد إكمال جميع المحاضرات السابقة في نفس الكتاب.
 */
export function isLectureUnlocked(
  lec: CourseLectureItem,
  bLecturesList: CourseLectureItem[],
  progresses: StudentLectureProgress[],
  questions: LectureQuizQuestion[],
  isBookUnlockedStatus: boolean = true
): boolean {
  if (!isBookUnlockedStatus) return false;

  const sorted = [...bLecturesList].sort((a, b) => (a.order || 0) - (b.order || 0));
  const index = sorted.findIndex(l => l.id === lec.id);
  if (index <= 0) return true; // المحاضرة الأولى مفتوحة تلقائياً داخل الكتاب المفتوح

  // فحص إتمام جميع المحاضرات السابقة
  for (let i = 0; i < index; i++) {
    const prevLec = sorted[i];
    if (!isLectureCompleted(prevLec.id, progresses, questions)) {
      return false;
    }
  }

  return true;
}

/**
 * فحص ما إذا كان الكتاب قد اكتملت جميع محاضراته واختباراته بنجاح:
 * عند الانتهاء من آخر محاضرة في الكتاب يُعتبر الكتاب مكتملاً.
 */
export function isBookCompleted(
  bookId: string,
  courseLectures: CourseLectureItem[],
  progresses: StudentLectureProgress[],
  questions: LectureQuizQuestion[]
): boolean {
  const bookLecs = courseLectures.filter(l => l.bookId === bookId);
  if (bookLecs.length === 0) return true; // كتاب بدون محاضرات لا يعطل التقدم

  return bookLecs.every(lec => isLectureCompleted(lec.id, progresses, questions));
}

/**
 * ترتيب كتب الدورة تصاعدياً حسب حقل order
 */
export function sortCourseBooks(courseBooks: CourseBook[]): CourseBook[] {
  return [...courseBooks].sort((a, b) => (a.order || 0) - (b.order || 0));
}

/**
 * فحص ما إذا كان الكتاب مفتوحاً ومتاحاً للدراسة داخل الدورة:
 * - الكتاب الأول في الدورة مفتوح دائماً.
 * - الكتاب اللاحق مقفل حتى يتم إكمال الكتاب الذي يسبقه تماماً (بإكمال آخر محاضرة فيه).
 */
export function isBookUnlocked(
  book: CourseBook,
  courseBooks: CourseBook[],
  courseLectures: CourseLectureItem[],
  progresses: StudentLectureProgress[],
  questions: LectureQuizQuestion[]
): boolean {
  const sorted = sortCourseBooks(courseBooks);
  const index = sorted.findIndex(b => b.id === book.id);
  if (index <= 0) return true; // الكتاب الأول مفتوح دائماً

  // يجب أن يكون الكتاب السابق مكتملاً تماماً
  const prevBook = sorted[index - 1];
  return isBookCompleted(prevBook.id, courseLectures, progresses, questions);
}

/**
 * الحصول على الكتاب السابق للكتاب الحالي في ترتيب الدورة
 */
export function getPreviousBook(
  book: CourseBook,
  courseBooks: CourseBook[]
): CourseBook | null {
  const sorted = sortCourseBooks(courseBooks);
  const index = sorted.findIndex(b => b.id === book.id);
  if (index <= 0) return null;
  return sorted[index - 1];
}

/**
 * الحصول على آخر محاضرة مفتوحة وصل إليها الطالب في كتاب معين:
 * - يبحث عن أول محاضرة مفتوحة لم تكتمل بعد (نقطة التحصيل الحالية).
 * - إذا كانت جميع المحاضرات مكتملة، يُعيد آخر محاضرة في الكتاب.
 * - إذا كان الكتاب فارغاً، يُعيد null.
 */
export function getLastOpenLecture(
  bookLectures: CourseLectureItem[],
  progresses: StudentLectureProgress[],
  questions: LectureQuizQuestion[],
  isBookUnlockedStatus: boolean = true
): CourseLectureItem | null {
  if (bookLectures.length === 0) return null;

  const sorted = [...bookLectures].sort((a, b) => (a.order || 0) - (b.order || 0));

  // إذا كان الكتاب مقفلاً، نعيد أول محاضرة للمعاينة إن وُجدت
  if (!isBookUnlockedStatus) {
    return sorted[0];
  }

  // البحث عن أول محاضرة مفتوحة لم تكتمل بعد
  for (let i = 0; i < sorted.length; i++) {
    const lec = sorted[i];
    const unlocked = isLectureUnlocked(lec, sorted, progresses, questions, true);
    if (unlocked) {
      const completed = isLectureCompleted(lec.id, progresses, questions);
      if (!completed) {
        return lec;
      }
    }
  }

  // إذا أتم الطالب جميع المحاضرات، نأخذه إلى آخر محاضرة في الكتاب
  return sorted[sorted.length - 1];
}

/**
 * الحصول على آخر كتاب مفتوح وصل إليه الطالب في دورة معينة:
 * - يبحث عن أول كتاب مفتوح لم يكتمل بعد.
 * - إذا اكتملت جميع الكتب، يُعيد آخر كتاب مفتوح في الدورة.
 */
export function getLastOpenBook(
  courseBooks: CourseBook[],
  courseLectures: CourseLectureItem[],
  progresses: StudentLectureProgress[],
  questions: LectureQuizQuestion[]
): CourseBook | null {
  if (courseBooks.length === 0) return null;

  const sorted = sortCourseBooks(courseBooks);

  for (let i = 0; i < sorted.length; i++) {
    const book = sorted[i];
    const unlocked = isBookUnlocked(book, sorted, courseLectures, progresses, questions);
    if (unlocked) {
      const completed = isBookCompleted(book.id, courseLectures, progresses, questions);
      if (!completed) {
        return book;
      }
    }
  }

  // إذا كانت جميع الكتب مكتملة، نأخذ آخر كتاب مفتوح
  const unlockedBooks = sorted.filter(b => isBookUnlocked(b, sorted, courseLectures, progresses, questions));
  return unlockedBooks.length > 0 ? unlockedBooks[unlockedBooks.length - 1] : sorted[0];
}

/**
 * فحص ما إذا كانت الدورة مكتملة بجميع كتبها ومحاضراتها واختباراتها بنجاح:
 */
export function isCourseCompleted(
  courseId: string,
  courseBooks: CourseBook[],
  courseLectures: CourseLectureItem[],
  progresses: StudentLectureProgress[],
  questions: LectureQuizQuestion[]
): boolean {
  const cBooks = courseBooks.filter(b => b.courseId === courseId);
  const bookIdSet = new Set(cBooks.map(b => b.id));
  const cLectures = courseLectures.filter(l => l.courseId === courseId || (l.bookId && bookIdSet.has(l.bookId)));

  if (cLectures.length === 0) {
    // دورة بدون محاضرات لا تُعتبر مكتملة حتى لا تفتح الدورات اللاحقة خطأً
    return false;
  }

  // يجب أن تكون جميع المحاضرات مكتملة ومجتازة
  return cLectures.every(lec => isLectureCompleted(lec.id, progresses, questions));
}

/**
 * ترتيب الدورات تصاعدياً
 */
export function sortCourses(courses: Course[]): Course[] {
  return [...courses].sort((a, b) => (a.order || 0) - (b.order || 0));
}

/**
 * فحص ما إذا كانت الدورة دورة رئيسية جامعة (دورة كبيرة تضم مستويات بداخلها)
 */
export function isMasterCourse(course: Course): boolean {
  return course.isMasterCourse === true || course.courseType === 'master';
}

/**
 * فحص ما إذا كانت الدورة مستوى أو دورة فرعية تابعة لدورة رئيسية كبيرة
 */
export function isChildCourse(course: Course): boolean {
  return Boolean(course.parentCourseId);
}

/**
 * الحصول على المستويات أو الدورات الفرعية المندرجة تحت دورة رئيسية معينة
 */
export function getChildCourses(
  masterCourseId: string,
  allCourses: Course[]
): Course[] {
  return sortCourses(allCourses.filter(c => c.parentCourseId === masterCourseId));
}

/**
 * الحصول على الدورات المعروضة في المستوى الأعلى للكتالوج:
 * (الدورات الكبيرة الجامعة + الدورات المستقلة + أي دورات عامة غير تابعة لدورة أخرى)
 */
export function getTopLevelCourses(allCourses: Course[]): Course[] {
  return sortCourses(allCourses.filter(c => !c.parentCourseId));
}

/**
 * حساب إجمالي تقدم الطالب في دورة رئيسية جامعة بناءً على مستوياتها المنتهية:
 */
export function getMasterCourseProgress(
  masterCourseId: string,
  allCourses: Course[],
  courseBooks: CourseBook[],
  courseLectures: CourseLectureItem[],
  progresses: StudentLectureProgress[],
  questions: LectureQuizQuestion[]
): { totalLevels: number; completedLevels: number; percentage: number; allPassed: boolean } {
  const levels = getChildCourses(masterCourseId, allCourses);
  if (levels.length === 0) {
    return { totalLevels: 0, completedLevels: 0, percentage: 0, allPassed: false };
  }

  const completed = levels.filter(lvl => isCourseCompleted(lvl.id, courseBooks, courseLectures, progresses, questions));
  const pct = Math.round((completed.length / levels.length) * 100);
  return {
    totalLevels: levels.length,
    completedLevels: completed.length,
    percentage: pct,
    allPassed: completed.length === levels.length
  };
}

/**
 * فحص ما إذا كانت الدورة دورة صغيرة أو مستقلة (لا ترتبط بدورات أخرى ومفتوحة دائماً)
 */
export function isStandaloneCourse(course: Course): boolean {
  return course.isStandalone === true || course.courseType === 'standalone';
}

/**
 * الحصول على الدورة السابقة المشروطة لفتح هذه الدورة:
 * - إذا كانت دورة مستقلة: لا يوجد شرط مسبق (null).
 * - إذا حُددت prerequisiteCourseId صراحة: تُعاد هذه الدورة.
 * - إذا كانت مستوى فرعي داخل دورة كبيرة: تكون الدورة/المستوى السابق في نفس الدورة الكبيرة.
 * - إذا كانت متسلسلة عامة: تكون الدورة السابقة في الترتيب العام.
 */
export function getPrerequisiteCourse(
  course: Course,
  allCourses: Course[]
): Course | null {
  if (isStandaloneCourse(course) || isMasterCourse(course)) {
    return null;
  }

  if (course.prerequisiteCourseId) {
    return allCourses.find(c => c.id === course.prerequisiteCourseId) || null;
  }

  // إذا كانت مستوى فرعي تابعاً لدورة كبيرة
  if (course.parentCourseId) {
    const siblingLevels = getChildCourses(course.parentCourseId, allCourses);
    const index = siblingLevels.findIndex(c => c.id === course.id);
    if (index <= 0) return null; // أول مستوى داخل الدورة الكبيرة مفتوح دائماً
    return siblingLevels[index - 1];
  }

  // إذا كانت متسلسلة عامة في المستوى الأعلى
  const sequentialCourses = sortCourses(
    allCourses.filter(c => !isStandaloneCourse(c) && !c.parentCourseId && !isMasterCourse(c))
  );
  const index = sequentialCourses.findIndex(c => c.id === course.id);
  if (index <= 0) return null;
  return sequentialCourses[index - 1];
}

/**
 * فحص ما إذا كانت الدورة مفتوحة ومتاحة للطلاب:
 * - الدورات الكبيرة الجامعة والدورات الصغيرة المستقلة مفتوحة دائماً للتصفح.
 * - الدورة أو المستوى الأول مفتوح دائماً.
 * - الدورة التي لها دورة سابقة مشروطة لا تُفتح إلا إذا اكتملت الدورة السابقة تماماً.
 */
export function isCourseUnlocked(
  course: Course,
  allCourses: Course[],
  courseBooks: CourseBook[],
  courseLectures: CourseLectureItem[],
  progresses: StudentLectureProgress[],
  questions: LectureQuizQuestion[]
): boolean {
  // الدورات الكبيرة والدورات المستقلة مفتوحة دائماً
  if (isStandaloneCourse(course) || isMasterCourse(course)) {
    return true;
  }

  const prereq = getPrerequisiteCourse(course, allCourses);
  if (!prereq) {
    // لا توجد دورة سابقة مشروطة -> مفتوحة تلقائياً
    return true;
  }

  // التحقق من إكمال الدورة السابقة المشروطة بجميع اختباراتها ودروسها
  return isCourseCompleted(prereq.id, courseBooks, courseLectures, progresses, questions);
}

/**
 * الحصول على الدورة التالية المربوطة بهذه الدورة (للاحتفال وفتحها عند إتمام الدورة الحالية):
 */
export function getNextChainedCourse(
  currentCourseId: string,
  allCourses: Course[]
): Course | null {
  // أولاً: البحث عن دورة اشترطت صراحة هذه الدورة السابقة
  const directDependent = allCourses.find(c => c.prerequisiteCourseId === currentCourseId && !isStandaloneCourse(c));
  if (directDependent) return directDependent;

  const currentCourse = allCourses.find(c => c.id === currentCourseId);
  if (currentCourse?.parentCourseId) {
    // إذا كانت مستوى فرعي داخل دورة كبيرة: البحث عن المستوى التالي في نفس الدورة الكبيرة
    const siblings = getChildCourses(currentCourse.parentCourseId, allCourses);
    const index = siblings.findIndex(c => c.id === currentCourseId);
    if (index >= 0 && index < siblings.length - 1) {
      return siblings[index + 1];
    }
  } else {
    // ثانياً: إذا كانت ضمن المسار المتسلسل التلقائي في المستوى الأعلى
    const sequentialCourses = sortCourses(
      allCourses.filter(c => !isStandaloneCourse(c) && !c.parentCourseId && !isMasterCourse(c))
    );
    const index = sequentialCourses.findIndex(c => c.id === currentCourseId);
    if (index >= 0 && index < sequentialCourses.length - 1) {
      const candidate = sequentialCourses[index + 1];
      if (!candidate.prerequisiteCourseId || candidate.prerequisiteCourseId === currentCourseId) {
        return candidate;
      }
    }
  }

  return null;
}
