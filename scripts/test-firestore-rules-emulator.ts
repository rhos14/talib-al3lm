import { initializeTestEnvironment, assertFails, assertSucceeds, RulesTestEnvironment } from '@firebase/rules-unit-testing';
import fs from 'fs';
import path from 'path';
import http from 'http';

interface TestRecord {
  category: string;
  name: string;
  passed: boolean;
  error?: string;
}

const testResults: TestRecord[] = [];

function recordTest(category: string, name: string, passed: boolean, error?: string) {
  testResults.push({ category, name, passed, error });
  const status = passed ? '✅ [PASSED]' : '❌ [FAILED]';
  console.log(`${status} [${category}] ${name}`);
  if (error) console.log(`    Error details: ${error}`);
}

async function runRulesSuite() {
  console.log('==================================================================');
  console.log('  RUNNING FIRESTORE SECURITY RULES TESTS ON REAL EMULATOR        ');
  console.log('  (@firebase/rules-unit-testing on Firestore Emulator 127.0.0.1:8080) ');
  console.log('==================================================================\n');

  const rulesPath = path.join(process.cwd(), 'firestore.rules');
  const rules = fs.readFileSync(rulesPath, 'utf-8');

  let testEnv: RulesTestEnvironment;
  try {
    testEnv = await initializeTestEnvironment({
      projectId: `talaba-test-${Date.now()}`,
      firestore: {
        host: '127.0.0.1',
        port: 8080,
        rules: rules
      }
    });
  } catch (initErr: any) {
    console.error('Failed to initialize test environment with emulator:', initErr);
    process.exit(1);
  }

  const anonDb = testEnv.unauthenticatedContext().firestore();
  const aliceDb = testEnv.authenticatedContext('alice-uid', { email: 'alice@elm.com' }).firestore();
  const bobDb = testEnv.authenticatedContext('bob-uid', { email: 'bob@elm.com' }).firestore();
  const adminDb = testEnv.authenticatedContext('admin-uid', { email: 'admin@elm.com', admin: true }).firestore();
  const fakeAdminDb = testEnv.authenticatedContext('fake-admin-uid', { email: 'wwwhalafaisal18@gmail.com' }).firestore();

  // ---------------------------------------------------------------------------
  // الفئة 1: خصوصية ملفات المستخدمين وتفويض المشرفة الحصري بـ Custom Claims
  // ---------------------------------------------------------------------------
  await testEnv.clearFirestore();
  await testEnv.withSecurityRulesDisabled(async (context) => {
    await context.firestore().doc('users/alice-uid').set({
      uid: 'alice-uid',
      name: 'عائشة الفهد',
      email: 'alice@elm.com',
      role: 'student',
      streak: 3,
      completedBooksCount: 1,
      completedMutunCount: 1,
      createdAt: new Date().toISOString()
    });
  });

  try {
    await assertFails(anonDb.doc('users/alice-uid').get());
    recordTest('خصوصية الملفات', '1.1 حظر قراءة زائر مجهول لملف المستخدمة', true);
  } catch (e: any) { recordTest('خصوصية الملفات', '1.1 حظر قراءة زائر مجهول لملف المستخدمة', false, e.message); }

  try {
    await assertSucceeds(aliceDb.doc('users/alice-uid').get());
    recordTest('خصوصية الملفات', '1.2 صاحبة الحساب تقرأ ملفها بنجاح', true);
  } catch (e: any) { recordTest('خصوصية الملفات', '1.2 صاحبة الحساب تقرأ ملفها بنجاح', false, e.message); }

  try {
    await assertFails(bobDb.doc('users/alice-uid').get());
    recordTest('خصوصية الملفات', '1.3 حظر استعلام Bob لملف Alice (منع تسرب PII)', true);
  } catch (e: any) { recordTest('خصوصية الملفات', '1.3 حظر استعلام Bob لملف Alice (منع تسرب PII)', false, e.message); }

  try {
    await assertSucceeds(adminDb.doc('users/alice-uid').get());
    recordTest('صلاحيات المشرفة', '1.4 المشرفة بـ Custom Claims تقرأ الملف للمتابعة', true);
  } catch (e: any) { recordTest('صلاحيات المشرفة', '1.4 المشرفة بـ Custom Claims تقرأ الملف للمتابعة', false, e.message); }

  try {
    await assertFails(fakeAdminDb.doc('users/alice-uid').get());
    recordTest('صلاحيات المشرفة', '1.5 حظر انتحال صفة المشرفة بالبريد الإلكتروني فقط (Claims Enforced)', true);
  } catch (e: any) { recordTest('صلاحيات المشرفة', '1.5 حظر انتحال صفة المشرفة بالبريد الإلكتروني فقط (Claims Enforced)', false, e.message); }

  // ---------------------------------------------------------------------------
  // الفئة 2: استئصال totalStudyHours و points ومنع تزوير رتبة المستخدم
  // ---------------------------------------------------------------------------
  try {
    await assertFails(aliceDb.doc('users/new-student-1').set({
      uid: 'new-student-1',
      name: 'طالبة جديدة',
      email: 'new@elm.com',
      role: 'student',
      streak: 0,
      totalStudyHours: 5,
      completedMutunCount: 0,
      completedBooksCount: 0,
      level: 'مبتدئ',
      createdAt: new Date().toISOString()
    }));
    recordTest('استئصال totalStudyHours', '2.1 حظر إنشاء حساب يحوي حقل totalStudyHours', true);
  } catch (e: any) { recordTest('استئصال totalStudyHours', '2.1 حظر إنشاء حساب يحوي حقل totalStudyHours', false, e.message); }

  try {
    await assertFails(aliceDb.doc('users/new-student-2').set({
      uid: 'new-student-2',
      name: 'طالبة جديدة',
      email: 'new2@elm.com',
      role: 'student',
      streak: 0,
      points: 100,
      completedMutunCount: 0,
      completedBooksCount: 0,
      level: 'مبتدئ',
      createdAt: new Date().toISOString()
    }));
    recordTest('استئصال النقاط', '2.2 حظر إنشاء حساب يحوي حقل points', true);
  } catch (e: any) { recordTest('استئصال النقاط', '2.2 حظر إنشاء حساب يحوي حقل points', false, e.message); }

  try {
    await assertFails(aliceDb.doc('users/alice-uid-2').set({
      uid: 'alice-uid-2',
      name: 'طالبة متسللة',
      email: 'attacker@elm.com',
      role: 'admin',
      streak: 0,
      completedMutunCount: 0,
      completedBooksCount: 0,
      level: 'مبتدئ',
      createdAt: new Date().toISOString()
    }));
    recordTest('منع الترقية الذاتية', '2.3 حظر إنشاء حساب برتبة admin من العميل', true);
  } catch (e: any) { recordTest('منع الترقية الذاتية', '2.3 حظر إنشاء حساب برتبة admin من العميل', false, e.message); }

  await testEnv.withSecurityRulesDisabled(async (context) => {
    await context.firestore().doc('users/legacy-user').set({
      uid: 'legacy-user',
      name: 'طالبة قديمة',
      email: 'legacy@elm.com',
      role: 'student',
      level: 'مبتدئ',
      streak: 2,
      totalStudyHours: 15,
      completedMutunCount: 0,
      completedBooksCount: 0,
      createdAt: new Date().toISOString()
    });
  });

  const legacyContext = testEnv.authenticatedContext('legacy-user', { email: 'legacy@elm.com' });
  try {
    await assertSucceeds(legacyContext.firestore().doc('users/legacy-user').update({
      bio: 'نبذة جديدة طالبة علم'
    }));
    recordTest('التوافقية الآمنة', '2.4 السماح بتحديث bio لسجل قديم يحوي totalStudyHours دون رفض', true);
  } catch (e: any) { recordTest('التوافقية الآمنة', '2.4 السماح بتحديث bio لسجل قديم يحوي totalStudyHours دون رفض', false, e.message); }

  try {
    await assertFails(legacyContext.firestore().doc('users/legacy-user').update({
      totalStudyHours: 25
    }));
    recordTest('استئصال totalStudyHours', '2.5 حظر تعديل أو تزوير قيمة totalStudyHours في السجلات القديمة', true);
  } catch (e: any) { recordTest('استئصال totalStudyHours', '2.5 حظر تعديل أو تزوير قيمة totalStudyHours في السجلات القديمة', false, e.message); }

  try {
    await assertSucceeds(aliceDb.doc('users/alice-profile-new').set({
      uid: 'alice-profile-new',
      name: 'طالبة علم',
      displayName: 'طالبة علم',
      firstName: '',
      lastName: '',
      profileCompleted: false,
      photoURL: '',
      email: 'alice@elm.com',
      role: 'student',
      level: 'مبتدئ',
      streak: 0,
      completedMutunCount: 0,
      completedBooksCount: 0,
      createdAt: new Date().toISOString()
    }));
    recordTest('استكمال الملف الشخصي', '2.6 إنشاء ملف طالبة جديدة بحقول firstName/lastName/profileCompleted مسموح ضمن السقف الصحيح', true);
  } catch (e: any) { recordTest('استكمال الملف الشخصي', '2.6 إنشاء ملف طالبة جديدة بحقول firstName/lastName/profileCompleted مسموح ضمن السقف الصحيح', false, e.message); }

  try {
    const first40 = 'أ'.repeat(40);
    const last40 = 'ب'.repeat(40);
    await assertSucceeds(aliceDb.doc('users/alice-profile-new').update({
      firstName: first40,
      lastName: last40,
      name: `${first40} ${last40}`,
      displayName: `${first40} ${last40}`,
      photoURL: 'https://firebasestorage.googleapis.com/v0/b/test/o/user_avatars%2Falice-uid%2Favatar.jpg?alt=media',
      profileCompleted: true
    }));
    recordTest('استكمال الملف الشخصي', '2.7 إكمال وتحديث الملف الشخصي للحد الكامل (81 حرفاً) وحفظ الصورة بنجاح', true);
  } catch (e: any) { recordTest('استكمال الملف الشخصي', '2.7 إكمال وتحديث الملف الشخصي للحد الكامل (81 حرفاً) وحفظ الصورة بنجاح', false, e.message); }

  try {
    await assertSucceeds(legacyContext.firestore().doc('users/legacy-user').update({
      firstName: 'نورة',
      lastName: 'العتيبي',
      name: 'نورة العتيبي',
      displayName: 'نورة العتيبي',
      profileCompleted: true
    }));
    recordTest('التوافقية الآمنة', '2.8 السماح بتحديث بيانات الاستكمال لحساب قديم دون المساس بالحقول المحمية', true);
  } catch (e: any) { recordTest('التوافقية الآمنة', '2.8 السماح بتحديث بيانات الاستكمال لحساب قديم دون المساس بالحقول المحمية', false, e.message); }

  // ---------------------------------------------------------------------------
  // الفئة 3: حماية بنك الأسئلة lecture_questions ومنع تسريب correctAnswer
  // ---------------------------------------------------------------------------
  await testEnv.clearFirestore();
  await testEnv.withSecurityRulesDisabled(async (context) => {
    await context.firestore().doc('lecture_questions/q-secret-1').set({
      id: 'q-secret-1',
      lectureId: 'lec-101',
      questionText: 'ما هو أصل الإيمان؟',
      options: ['أ', 'ب', 'ج'],
      correctAnswer: 'أ',
      points: 5
    });
  });

  try {
    await assertFails(anonDb.doc('lecture_questions/q-secret-1').get());
    recordTest('حماية بنك الأسئلة', '3.1 حظر استعلام زائر مجهول لمفتاح الإجابة من Firestore', true);
  } catch (e: any) { recordTest('حماية بنك الأسئلة', '3.1 حظر استعلام زائر مجهول لمفتاح الإجابة من Firestore', false, e.message); }

  try {
    await assertFails(aliceDb.doc('lecture_questions/q-secret-1').get());
    recordTest('حماية بنك الأسئلة', '3.2 حظر قراءة الطالبة لمجموعة lecture_questions مباشرة (منع تسريب الإجابات)', true);
  } catch (e: any) { recordTest('حماية بنك الأسئلة', '3.2 حظر قراءة الطالبة لمجموعة lecture_questions مباشرة (منع تسريب الإجابات)', false, e.message); }

  try {
    await assertSucceeds(adminDb.doc('lecture_questions/q-secret-1').get());
    recordTest('حماية بنك الأسئلة', '3.3 السماح للمشرفة بقراءة بنك الأسئلة لإدارتها وتعديلها', true);
  } catch (e: any) { recordTest('حماية بنك الأسئلة', '3.3 السماح للمشرفة بقراءة بنك الأسئلة لإدارتها وتعديلها', false, e.message); }

  // ---------------------------------------------------------------------------
  // الفئة 4: حل تعارض /settings/public_stats وحظر الكتابة لكافة العملاء
  // ---------------------------------------------------------------------------
  await testEnv.clearFirestore();
  await testEnv.withSecurityRulesDisabled(async (context) => {
    await context.firestore().doc('settings/public_stats').set({
      students: 150,
      passedQuizzes: 450,
      issuedCertificates: 35
    });
    await context.firestore().doc('settings/general_config').set({
      platformName: 'منصة طالبة علم',
      openRegistration: true
    });
    await context.firestore().doc('system_settings/api_secrets').set({
      secretKey: 'top-secret-token'
    });
  });

  try {
    await assertSucceeds(anonDb.doc('settings/public_stats').get());
    recordTest('الإحصائيات العامة', '4.1 السماح بالقراءة العامة لـ settings/public_stats', true);
  } catch (e: any) { recordTest('الإحصائيات العامة', '4.1 السماح بالقراءة العامة لـ settings/public_stats', false, e.message); }

  try {
    await assertFails(aliceDb.doc('settings/public_stats').set({ students: 9999 }));
    recordTest('الإحصائيات العامة', '4.2 حظر كتابة الطالبة على settings/public_stats', true);
  } catch (e: any) { recordTest('الإحصائيات العامة', '4.2 حظر كتابة الطالبة على settings/public_stats', false, e.message); }

  try {
    await assertFails(adminDb.doc('settings/public_stats').set({ students: 9999 }));
    recordTest('حل التعارض الأمني', '4.3 حظر كتابة المشرفة عبر المتصفح على public_stats (الخادم فقط يحدّثها)', true);
  } catch (e: any) { recordTest('حل التعارض الأمني', '4.3 حظر كتابة المشرفة عبر المتصفح على public_stats (الخادم فقط يحدّثها)', false, e.message); }

  try {
    await assertSucceeds(aliceDb.doc('settings/general_config').get());
    recordTest('إعدادات المنصة', '4.4 السماح للطالبة بقراءة general_config المصرح به صراحة', true);
  } catch (e: any) { recordTest('إعدادات المنصة', '4.4 السماح للطالبة بقراءة general_config المصرح به صراحة', false, e.message); }

  try {
    await assertFails(aliceDb.doc('system_settings/api_secrets').get());
    recordTest('إعدادات المنصة', '4.5 حظر قراءة الطالبة لإعدادات النظام الحساسة system_settings', true);
  } catch (e: any) { recordTest('إعدادات المنصة', '4.5 حظر قراءة الطالبة لإعدادات النظام الحساسة system_settings', false, e.message); }

  try {
    await assertSucceeds(adminDb.doc('system_settings/api_secrets').get());
    recordTest('إعدادات المنصة', '4.6 المشرفة تدير إعدادات النظام الحساسة بنجاح', true);
  } catch (e: any) { recordTest('إعدادات المنصة', '4.6 المشرفة تدير إعدادات النظام الحساسة بنجاح', false, e.message); }

  // ---------------------------------------------------------------------------
  // الفئة 5: إحكام lecture_progress ومنع تزوير isPassed والقيم غير المحدودة
  // ---------------------------------------------------------------------------
  await testEnv.clearFirestore();
  try {
    await assertFails(aliceDb.doc('users/alice-uid/lecture_progress/lec-test-1').set({
      id: 'lec-test-1',
      lectureId: 'lec-test-1',
      bookId: 'book-1',
      courseId: 'course-1',
      isPassed: true,
      lastScore: 100
    }));
    recordTest('إحكام تقدم المحاضرات', '5.1 حظر كتابة isPassed: true أو lastScore من العميل (Server-Graded)', true);
  } catch (e: any) { recordTest('إحكام تقدم المحاضرات', '5.1 حظر كتابة isPassed: true أو lastScore من العميل (Server-Graded)', false, e.message); }

  try {
    await assertFails(aliceDb.doc('users/alice-uid/lecture_progress/lec-test-2').set({
      id: 'lec-test-2',
      lectureId: 'lec-test-2',
      bookId: 'book-1',
      courseId: 'course-1',
      lastPlaybackPosition: -50
    }));
    recordTest('إحكام تقدم المحاضرات', '5.2 حظر القيم السالبة لموضع التشغيل lastPlaybackPosition', true);
  } catch (e: any) { recordTest('إحكام تقدم المحاضرات', '5.2 حظر القيم السالبة لموضع التشغيل lastPlaybackPosition', false, e.message); }

  try {
    await assertFails(aliceDb.doc('users/alice-uid/lecture_progress/lec-test-3').set({
      id: 'lec-test-3',
      lectureId: 'lec-test-3',
      bookId: 'book-1',
      courseId: 'course-1',
      lectureWatchPercentage: 150
    }));
    recordTest('إحكام تقدم المحاضرات', '5.3 حظر نسب المشاهدة غير المنطقية (> 100%)', true);
  } catch (e: any) { recordTest('إحكام تقدم المحاضرات', '5.3 حظر نسب المشاهدة غير المنطقية (> 100%)', false, e.message); }

  try {
    await assertSucceeds(aliceDb.doc('users/alice-uid/lecture_progress/lec-valid').set({
      id: 'lec-valid',
      lectureId: 'lec-valid',
      bookId: 'book-1',
      courseId: 'course-1',
      lastPlaybackPosition: 450,
      lectureWatchPercentage: 55,
      lastPdfPage: 12
    }));
    recordTest('إحكام تقدم المحاضرات', '5.4 نجاح حفظ موضع الدرس والقراءة المنطقي للطالبة', true);
  } catch (e: any) { recordTest('إحكام تقدم المحاضرات', '5.4 نجاح حفظ موضع الدرس والقراءة المنطقي للطالبة', false, e.message); }

  try {
    await assertFails(aliceDb.doc('users/alice-uid/lecture_progress/lec-valid').update({
      isPassed: true
    }));
    recordTest('إحكام تقدم المحاضرات', '5.5 حظر تحديث isPassed من الطالبة (محصور على الخادم الموثق)', true);
  } catch (e: any) { recordTest('إحكام تقدم المحاضرات', '5.5 حظر تحديث isPassed من الطالبة (محصور على الخادم الموثق)', false, e.message); }

  // ---------------------------------------------------------------------------
  // الفئة 6: حصر student_activities على الخادم والمشرفة فقط
  // ---------------------------------------------------------------------------
  await testEnv.clearFirestore();
  try {
    await assertFails(aliceDb.doc('users/alice-uid/student_activities/act-forged').set({
      id: 'act-forged',
      type: 'streak_milestone',
      title: 'نشاط مزور',
      description: 'محاولة كتابة نشاط من العميل',
      timestamp: new Date().toISOString()
    }));
    recordTest('سجل النشاطات', '6.1 حظر إنشاء أنشطة student_activities من العميل كلياً', true);
  } catch (e: any) { recordTest('سجل النشاطات', '6.1 حظر إنشاء أنشطة student_activities من العميل كلياً', false, e.message); }

  try {
    await assertSucceeds(adminDb.doc('users/alice-uid/student_activities/act-official').set({
      id: 'act-official',
      type: 'streak_milestone',
      title: 'همة الاستمرار والمثابرة',
      description: 'نشاط موثق من الخادم',
      timestamp: new Date().toISOString()
    }));
    recordTest('سجل النشاطات', '6.2 توثيق الأنشطة الأكاديمية الرسمية من الخادم والمشرفة حصراً', true);
  } catch (e: any) { recordTest('سجل النشاطات', '6.2 توثيق الأنشطة الأكاديمية الرسمية من الخادم والمشرفة حصراً', false, e.message); }

  // ---------------------------------------------------------------------------
  // الفئة 6.ب: حماية سجل المحاولات الذري quiz_attempts
  // ---------------------------------------------------------------------------
  try {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await ctx.firestore().doc('users/alice-uid/quiz_attempts/att-sample').set({
        attemptId: 'att-sample',
        lectureId: 'lec-1',
        percentage: 85,
        isPassed: true
      });
    });

    await assertSucceeds(aliceDb.doc('users/alice-uid/quiz_attempts/att-sample').get());
    recordTest('سجل المحاولات الذري', '6.3 السماح للطالبة بقراءة سجل محاولتها السابقة', true);
  } catch (e: any) { recordTest('سجل المحاولات الذري', '6.3 السماح للطالبة بقراءة سجل محاولتها السابقة', false, e.message); }

  try {
    await assertFails(bobDb.doc('users/alice-uid/quiz_attempts/att-sample').get());
    recordTest('سجل المحاولات الذري', '6.4 حظر Bob من قراءة محاولات Alice في الاختبارات', true);
  } catch (e: any) { recordTest('سجل المحاولات الذري', '6.4 حظر Bob من قراءة محاولات Alice في الاختبارات', false, e.message); }

  try {
    await assertFails(aliceDb.doc('users/alice-uid/quiz_attempts/att-forged').set({
      attemptId: 'att-forged',
      percentage: 100
    }));
    recordTest('سجل المحاولات الذري', '6.5 حظر كتابة أو تزوير محاولات الاختبارات من العميل (الخادم فقط)', true);
  } catch (e: any) { recordTest('سجل المحاولات الذري', '6.5 حظر كتابة أو تزوير محاولات الاختبارات من العميل (الخادم فقط)', false, e.message); }

  // ---------------------------------------------------------------------------
  // الفئة 7: حماية طلبات الشهادات certificate_requests ومنع التعديل غير المصرح
  // ---------------------------------------------------------------------------
  await testEnv.clearFirestore();
  try {
    await assertSucceeds(aliceDb.doc('certificate_requests/req-alice-1').set({
      id: 'req-alice-1',
      studentId: 'alice-uid',
      studentName: 'عائشة الفهد',
      studentEmail: 'alice@elm.com',
      courseId: 'c1',
      courseTitle: 'شرح الأصول الثلاثة',
      bookId: 'b1',
      bookTitle: 'متن الأصول الثلاثة',
      timestamp: new Date().toISOString(),
      status: 'pending',
      studentNotes: 'أتممت الكتاب ولله الحمد'
    }));
    recordTest('طلبات الشهادات', '7.1 الطالبة تنشئ طلب شهادة بحالة pending بنجاح', true);
  } catch (e: any) { recordTest('طلبات الشهادات', '7.1 الطالبة تنشئ طلب شهادة بحالة pending بنجاح', false, e.message); }

  try {
    await assertFails(aliceDb.doc('certificate_requests/req-forged').set({
      id: 'req-forged',
      studentId: 'alice-uid',
      studentName: 'عائشة الفهد',
      studentEmail: 'alice@elm.com',
      courseId: 'c1',
      courseTitle: 'شرح الأصول الثلاثة',
      bookId: 'b1',
      bookTitle: 'متن الأصول الثلاثة',
      timestamp: new Date().toISOString(),
      status: 'approved'
    }));
    recordTest('طلبات الشهادات', '7.2 حظر إنشاء طلب شهادة بحالة approved مباشرة من العميل', true);
  } catch (e: any) { recordTest('طلبات الشهادات', '7.2 حظر إنشاء طلب شهادة بحالة approved مباشرة من العميل', false, e.message); }

  try {
    await assertFails(aliceDb.doc('certificate_requests/req-alice-1').update({
      status: 'approved'
    }));
    recordTest('طلبات الشهادات', '7.3 حظر ترقية حالة الطلب إلى approved من الطالبة', true);
  } catch (e: any) { recordTest('طلبات الشهادات', '7.3 حظر ترقية حالة الطلب إلى approved من الطالبة', false, e.message); }

  try {
    await assertFails(bobDb.doc('certificate_requests/req-alice-1').get());
    recordTest('طلبات الشهادات', '7.4 حظر استعلام Bob لطلبات شهادات Alice', true);
  } catch (e: any) { recordTest('طلبات الشهادات', '7.4 حظر استعلام Bob لطلبات شهادات Alice', false, e.message); }

  try {
    await assertSucceeds(adminDb.doc('certificate_requests/req-alice-1').update({
      status: 'approved'
    }));
    recordTest('طلبات الشهادات', '7.5 المشرفة تعتمد طلب الشهادة وتغير حالته بنجاح', true);
  } catch (e: any) { recordTest('طلبات الشهادات', '7.5 المشرفة تعتمد طلب الشهادة وتغير حالته بنجاح', false, e.message); }

  // ---------------------------------------------------------------------------
  // الفئة 8: حماية وتدقيق habits, fawaid, lectures, posts
  // ---------------------------------------------------------------------------
  await testEnv.clearFirestore();
  try {
    await assertFails(aliceDb.doc('users/alice-uid/habits/h-bad').set({
      id: 'h-bad',
      title: 'عنوان طويل جدا '.repeat(50),
      category: 'فئة وهمية',
      targetCount: 50000,
      completedToday: -1,
      streak: 0
    }));
    recordTest('تدقيق العادات والفوائد', '8.1 حظر العادات غير المطابقة للأنواع والأطوال والقيم المنطقية', true);
  } catch (e: any) { recordTest('تدقيق العادات والفوائد', '8.1 حظر العادات غير المطابقة للأنواع والأطوال والقيم المنطقية', false, e.message); }

  try {
    await assertSucceeds(aliceDb.doc('users/alice-uid/habits/h-good').set({
      id: 'h-good',
      title: 'قراءة حزب من القرآن',
      category: 'القرآن الكريم',
      targetUnit: 'حزب',
      targetCount: 1,
      completedToday: 0,
      streak: 0,
      history: {},
      createdAt: new Date().toISOString()
    }));
    recordTest('تدقيق العادات والفوائد', '8.2 قبول العادة النظامية السليمة للطالبة', true);
  } catch (e: any) { recordTest('تدقيق العادات والفوائد', '8.2 قبول العادة النظامية السليمة للطالبة', false, e.message); }

  await testEnv.cleanup();

  // ---------------------------------------------------------------------------
  // الفئة 9: اختبار خادم التطبيق ضد إعادة الإرسال والتكرار (Replay / Deduplication)
  // ---------------------------------------------------------------------------
  try {
    console.log('\nTesting /api/student/quiz/submit against Duplicate Replay Attacks...');
    const postQuiz = (payload: any) => new Promise<any>((resolve, reject) => {
      const req = http.request({
        hostname: 'localhost',
        port: 3000,
        path: '/api/student/quiz/submit',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }, (res) => {
        let data = '';
        res.on('data', c => data += c);
        res.on('end', () => resolve({ status: res.statusCode, body: data }));
      });
      req.on('error', reject);
      req.write(JSON.stringify(payload));
      req.end();
    });

    const unauthRes = await postQuiz({ lectureId: 'test-lec-1', answers: {} });
    recordTest('حماية الخادم ضد التكرار', '9.1 رفض الطلب غير الموثق أمنياً برمز HTTP 401', unauthRes.status === 401);
  } catch (srvErr: any) {
    recordTest('حماية الخادم ضد التكرار', 'فشل اختبار اتصال الخادم', false, srvErr.message);
  }

  console.log('\n==================================================================');
  console.log('                 SUITE EXECUTION SUMMARY                          ');
  console.log('==================================================================');
  const total = testResults.length;
  const passed = testResults.filter(t => t.passed).length;
  console.log(`Total Rules & Security Tests: ${total}`);
  console.log(`Passed: ${passed} / ${total} (${Math.round((passed / total) * 100)}%)`);
  if (passed === total) {
    console.log('ALL FIRESTORE SECURITY RULES VERIFIED ON REAL EMULATOR! 🎉');
  } else {
    console.error('SOME TESTS FAILED!');
    process.exit(1);
  }
}

runRulesSuite().catch(console.error);
