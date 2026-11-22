import { initializeTestEnvironment, assertFails, assertSucceeds, RulesTestEnvironment } from '@firebase/rules-unit-testing';
import { getBytes, getDownloadURL, ref, uploadBytes, deleteObject } from 'firebase/storage';
import fs from 'fs';
import path from 'path';

interface TestResult {
  category: string;
  id: string;
  description: string;
  passed: boolean;
  error?: string;
}

const results: TestResult[] = [];

function record(category: string, id: string, description: string, passed: boolean, error?: string) {
  results.push({ category, id, description, passed, error });
  const status = passed ? '✅ [PASSED]' : '❌ [FAILED]';
  console.log(`${status} [${category}] ${id}: ${description}`);
  if (error) {
    console.log(`    ↳ Details: ${error}`);
  }
}

async function runStorageRulesTests() {
  console.log('================================================================================');
  console.log('  PHASE D: FIREBASE STORAGE SECURITY RULES SUITE ON REAL EMULATOR               ');
  console.log('  Testing custom claims, owner isolation, mime types, sizes, and default-deny   ');
  console.log('================================================================================\n');

  const rulesPath = path.join(process.cwd(), 'storage.rules');
  const rules = fs.readFileSync(rulesPath, 'utf-8');

  let testEnv: RulesTestEnvironment;
  try {
    testEnv = await initializeTestEnvironment({
      projectId: 'talaba-storage-test',
      storage: {
        host: '127.0.0.1',
        port: 9199,
        rules: rules
      }
    });
  } catch (err: any) {
    console.error('Failed to initialize test environment with Storage emulator:', err);
    process.exit(1);
  }

  // إنشاء سياقات المستخدمين المختلفة
  const anonStorage = testEnv.unauthenticatedContext().storage();
  const aliceStorage = testEnv.authenticatedContext('alice-uid', { email: 'alice@elm.com' }).storage();
  const bobStorage = testEnv.authenticatedContext('bob-uid', { email: 'bob@elm.com' }).storage();
  const adminStorage = testEnv.authenticatedContext('admin-uid', { email: 'admin@elm.com', admin: true }).storage();
  const fakeAdminStorage = testEnv.authenticatedContext('fake-admin-uid', { email: 'wwwhalafaisal18@gmail.com' }).storage();

  const dummyImageBytes = Buffer.from('GIF89a\x01\x00\x01\x00\x80\x00\x00\xff\xff\xff\x00\x00\x00!\xf9\x04\x01\x00\x00\x00\x00,\x00\x00\x00\x00\x01\x00\x01\x00\x00\x02\x02D\x01\x00;');
  const dummyPdfBytes = Buffer.from('%PDF-1.4 ... %%EOF');
  const dummyAudioBytes = Buffer.from('ID3...mp3 audio data');
  const dummyScriptBytes = Buffer.from('<script>alert("hacked")</script>');
  const oversized6MBBytes = Buffer.alloc(6 * 1024 * 1024); // 6MB (تتجاوز 5MB لصور الأفاتار)

  // ---------------------------------------------------------------------------
  // الفئة 1: صور الطالبات الرمزية (user_avatars) وعزل الملكية
  // ---------------------------------------------------------------------------
  console.log('--- اختبارات صور الطالبات (User Avatars) ---');
  
  // 1.1 الزائر غير الموثق ممنوع من القراءة أو الكتابة
  try {
    await assertFails(getBytes(ref(anonStorage, 'user_avatars/alice-uid/avatar.png')));
    record('صور المستخدمات', 'D-1.1', 'حظر قراءة الزائر غير الموثق لصور الطالبات', true);
  } catch (e: any) { record('صور المستخدمات', 'D-1.1', 'حظر قراءة الزائر غير الموثق لصور الطالبات', false, e.message); }

  try {
    await assertFails(uploadBytes(ref(anonStorage, 'user_avatars/alice-uid/avatar.png'), dummyImageBytes, { contentType: 'image/png' }));
    record('صور المستخدمات', 'D-1.2', 'حظر رفع صورة شخصية من قبل زائر مجهول', true);
  } catch (e: any) { record('صور المستخدمات', 'D-1.2', 'حظر رفع صورة شخصية من قبل زائر مجهول', false, e.message); }

  // 1.2 الطالبة ترفع صورتها الشخصية السليمة بنجاح
  try {
    await assertSucceeds(uploadBytes(ref(aliceStorage, 'user_avatars/alice-uid/avatar.png'), dummyImageBytes, { contentType: 'image/png' }));
    record('صور المستخدمات', 'D-1.3', 'الطالبة ترفع صورتها الرمزية السليمة بحجم مناسب بنجاح', true);
  } catch (e: any) { record('صور المستخدمات', 'D-1.3', 'الطالبة ترفع صورتها الرمزية السليمة بحجم مناسب بنجاح', false, e.message); }

  // 1.2.ب الطالبة الموثقة تقرأ صورتها
  try {
    await assertSucceeds(getBytes(ref(aliceStorage, 'user_avatars/alice-uid/avatar.png')));
    record('صور المستخدمات', 'D-1.3b', 'الطالبة الموثقة تقرأ الصورة الشخصية بنجاح', true);
  } catch (e: any) { record('صور المستخدمات', 'D-1.3b', 'الطالبة الموثقة تقرأ الصورة الشخصية بنجاح', false, e.message); }

  // 1.3 حظر رفع ملف ضار أو تنفيذي (MIME type enforcement)
  try {
    await assertFails(uploadBytes(ref(aliceStorage, 'user_avatars/alice-uid/malicious.sh'), dummyScriptBytes, { contentType: 'text/x-shellscript' }));
    record('صور المستخدمات', 'D-1.4', 'حظر رفع ملفات برمجية أو نصوص تنفيذية كصورة شخصية', true);
  } catch (e: any) { record('صور المستخدمات', 'D-1.4', 'حظر رفع ملفات برمجية أو نصوص تنفيذية كصورة شخصية', false, e.message); }

  // 1.4 حظر رفع صورة تتجاوز الحد الأقصى المسموح (5MB)
  try {
    await assertFails(uploadBytes(ref(aliceStorage, 'user_avatars/alice-uid/large.jpg'), oversized6MBBytes, { contentType: 'image/jpeg' }));
    record('صور المستخدمات', 'D-1.5', 'حظر رفع صورة شخصية تتجاوز سقف 5MB', true);
  } catch (e: any) { record('صور المستخدمات', 'D-1.5', 'حظر رفع صورة شخصية تتجاوز سقف 5MB', false, e.message); }

  // 1.5 منع الطالبة Bob من الكتابة أو الحذف في مجلد الطالبة Alice
  try {
    await assertFails(uploadBytes(ref(bobStorage, 'user_avatars/alice-uid/avatar.png'), dummyImageBytes, { contentType: 'image/png' }));
    record('عزل الملكية', 'D-1.6', 'حظر تعديل أو استبدال Bob لصورة Alice (عزل تام للمجلدات)', true);
  } catch (e: any) { record('عزل الملكية', 'D-1.6', 'حظر تعديل أو استبدال Bob لصورة Alice (عزل تام للمجلدات)', false, e.message); }

  try {
    await assertFails(deleteObject(ref(bobStorage, 'user_avatars/alice-uid/avatar.png')));
    record('عزل الملكية', 'D-1.7', 'حظر حذف Bob لصورة Alice الشخصية', true);
  } catch (e: any) { record('عزل الملكية', 'D-1.7', 'حظر حذف Bob لصورة Alice الشخصية', false, e.message); }

  // ---------------------------------------------------------------------------
  // الفئة 2: الشهادات الرسمية (certificates) ومنع التزوير والتسريب
  // ---------------------------------------------------------------------------
  console.log('\n--- اختبارات الشهادات الأكاديمية (Certificates) ---');

  // 2.1 حظر قراءة الزائر المجهول للشهادات
  try {
    await assertFails(getBytes(ref(anonStorage, 'certificates/alice-uid/cert-101.pdf')));
    record('الشهادات الأكاديمية', 'D-2.1', 'حظر قراءة زائر مجهول لملفات الشهادات الأكاديمية', true);
  } catch (e: any) { record('الشهادات الأكاديمية', 'D-2.1', 'حظر قراءة زائر مجهول لملفات الشهادات الأكاديمية', false, e.message); }

  // 2.2 حظر إنشاء أو تزوير الشهادات من قبل الطالبات
  try {
    await assertFails(uploadBytes(ref(aliceStorage, 'certificates/alice-uid/cert-forged.pdf'), dummyPdfBytes, { contentType: 'application/pdf' }));
    record('الشهادات الأكاديمية', 'D-2.2', 'حظر الطالبة من إصدار أو رفع شهادة لنفسها من العميل', true);
  } catch (e: any) { record('الشهادات الأكاديمية', 'D-2.2', 'حظر الطالبة من إصدار أو رفع شهادة لنفسها من العميل', false, e.message); }

  try {
    await assertFails(uploadBytes(ref(aliceStorage, 'certificates/cert-global.pdf'), dummyPdfBytes, { contentType: 'application/pdf' }));
    record('الشهادات الأكاديمية', 'D-2.3', 'حظر الطالبة من رفع شهادات في المسار العام', true);
  } catch (e: any) { record('الشهادات الأكاديمية', 'D-2.3', 'حظر الطالبة من رفع شهادات في المسار العام', false, e.message); }

  // 2.3 المشرفة تصدر شهادة رسمية لطالبة في مسارها بنجاح
  try {
    await assertSucceeds(uploadBytes(ref(adminStorage, 'certificates/alice-uid/cert-official.pdf'), dummyPdfBytes, { contentType: 'application/pdf' }));
    record('الشهادات الأكاديمية', 'D-2.4', 'المشرفة بـ Custom Claims تصدر وترفع شهادة رسمية بنجاح', true);
  } catch (e: any) { record('الشهادات الأكاديمية', 'D-2.4', 'المشرفة بـ Custom Claims تصدر وترفع شهادة رسمية بنجاح', false, e.message); }

  // 2.4 حظر منتحل صفة المشرفة بالبريد الإلكتروني فقط
  try {
    await assertFails(uploadBytes(ref(fakeAdminStorage, 'certificates/alice-uid/cert-fake.pdf'), dummyPdfBytes, { contentType: 'application/pdf' }));
    record('الشهادات الأكاديمية', 'D-2.5', 'حظر منتحل صفة المشرفة بالبريد الإلكتروني دون وجود Custom Claims', true);
  } catch (e: any) { record('الشهادات الأكاديمية', 'D-2.5', 'حظر منتحل صفة المشرفة بالبريد الإلكتروني دون وجود Custom Claims', false, e.message); }

  // 2.5 الطالبة Alice تقرأ شهادتها الصادرة بنجاح
  try {
    await assertSucceeds(getBytes(ref(aliceStorage, 'certificates/alice-uid/cert-official.pdf')));
    record('الشهادات الأكاديمية', 'D-2.6', 'صاحبة الشهادة Alice تقرأ شهادتها المعتمدة بنجاح', true);
  } catch (e: any) { record('الشهادات الأكاديمية', 'D-2.6', 'صاحبة الشهادة Alice تقرأ شهادتها المعتمدة بنجاح', false, e.message); }

  // 2.6 حظر الطالب Bob من قراءة شهادة Alice (منع تسريب الشهادات)
  try {
    await assertFails(getBytes(ref(bobStorage, 'certificates/alice-uid/cert-official.pdf')));
    record('الشهادات الأكاديمية', 'D-2.7', 'حظر Bob من قراءة شهادة Alice الأكاديمية (خصوصية تامة)', true);
  } catch (e: any) { record('الشهادات الأكاديمية', 'D-2.7', 'حظر Bob من قراءة شهادة Alice الأكاديمية (خصوصية تامة)', false, e.message); }

  // 2.7 المشرفة تحذف أو تدير الشهادة بنجاح
  try {
    await assertSucceeds(deleteObject(ref(adminStorage, 'certificates/alice-uid/cert-official.pdf')));
    record('الشهادات الأكاديمية', 'D-2.8', 'المشرفة الرسمية تحذف أو تعيد إصدار الشهادة بنجاح', true);
  } catch (e: any) { record('الشهادات الأكاديمية', 'D-2.8', 'المشرفة الرسمية تحذف أو تعيد إصدار الشهادة بنجاح', false, e.message); }

  // ---------------------------------------------------------------------------
  // الفئة 3: الوسائط التعليمية (غلاف الدورات، كتب PDF، الشروحات الصوتية)
  // ---------------------------------------------------------------------------
  console.log('\n--- اختبارات الوسائط التعليمية (Course Media) ---');

  // 3.1 المشرفة ترفع غلاف دورة بنجاح، والجميع يقرأه
  try {
    await assertSucceeds(uploadBytes(ref(adminStorage, 'course_covers/aqeedah-cover.jpg'), dummyImageBytes, { contentType: 'image/jpeg' }));
    record('المواد التعليمية', 'D-3.1', 'المشرفة ترفع غلاف الدورة بصيغة صورة سليمة', true);
  } catch (e: any) { record('المواد التعليمية', 'D-3.1', 'المشرفة ترفع غلاف الدورة بصيغة صورة سليمة', false, e.message); }

  try {
    await assertSucceeds(getBytes(ref(anonStorage, 'course_covers/aqeedah-cover.jpg')));
    record('المواد التعليمية', 'D-3.2', 'السماح بالقراءة العامة لغلاف الدورات للزوار والطلبة', true);
  } catch (e: any) { record('المواد التعليمية', 'D-3.2', 'السماح بالقراءة العامة لغلاف الدورات للزوار والطلبة', false, e.message); }

  // 3.2 حظر الطالبات من الكتابة على أغلفة الدورات أو حذفها
  try {
    await assertFails(uploadBytes(ref(aliceStorage, 'course_covers/aqeedah-cover.jpg'), dummyImageBytes, { contentType: 'image/jpeg' }));
    record('المواد التعليمية', 'D-3.3', 'حظر الطلاب من رفع أو استبدال أغلفة الدورات', true);
  } catch (e: any) { record('المواد التعليمية', 'D-3.3', 'حظر الطلاب من رفع أو استبدال أغلفة الدورات', false, e.message); }

  // 3.3 المشرفة ترفع كتاب PDF علمي، وتدقيق الامتداد application/pdf
  try {
    await assertSucceeds(uploadBytes(ref(adminStorage, 'course_pdfs/matn-usool.pdf'), dummyPdfBytes, { contentType: 'application/pdf' }));
    record('المواد التعليمية', 'D-3.4', 'المشرفة ترفع متناً علمياً بصيغة application/pdf', true);
  } catch (e: any) { record('المواد التعليمية', 'D-3.4', 'المشرفة ترفع متناً علمياً بصيغة application/pdf', false, e.message); }

  try {
    await assertFails(uploadBytes(ref(adminStorage, 'course_pdfs/fake-book.exe'), dummyScriptBytes, { contentType: 'application/x-msdownload' }));
    record('المواد التعليمية', 'D-3.5', 'حظر رفع ملفات غير PDF في مجلد الكتب course_pdfs', true);
  } catch (e: any) { record('المواد التعليمية', 'D-3.5', 'حظر رفع ملفات غير PDF في مجلد الكتب course_pdfs', false, e.message); }

  try {
    await assertSucceeds(getBytes(ref(aliceStorage, 'course_pdfs/matn-usool.pdf')));
    record('المواد التعليمية', 'D-3.6', 'الطالبة تقرأ وتحمل المتن العلمي للدراسة بنجاح', true);
  } catch (e: any) { record('المواد التعليمية', 'D-3.6', 'الطالبة تقرأ وتحمل المتن العلمي للدراسة بنجاح', false, e.message); }

  // 3.4 المشرفة ترفع تسجيلاً صوتياً
  try {
    await assertSucceeds(uploadBytes(ref(adminStorage, 'course_audios/lesson-01.mp3'), dummyAudioBytes, { contentType: 'audio/mpeg' }));
    record('المواد التعليمية', 'D-3.7', 'المشرفة ترفع تسجيلاً صوتياً للدرس بصيغة audio/mpeg', true);
  } catch (e: any) { record('المواد التعليمية', 'D-3.7', 'المشرفة ترفع تسجيلاً صوتياً للدرس بصيغة audio/mpeg', false, e.message); }

  try {
    await assertFails(deleteObject(ref(aliceStorage, 'course_audios/lesson-01.mp3')));
    record('المواد التعليمية', 'D-3.8', 'حظر الطالبة من حذف تسجيلات الدروس الصوتية', true);
  } catch (e: any) { record('المواد التعليمية', 'D-3.8', 'حظر الطالبة من حذف تسجيلات الدروس الصوتية', false, e.message); }

  // 3.5 أغلفة الكتب (book_covers) ومنع SVG
  try {
    await assertSucceeds(uploadBytes(ref(adminStorage, 'book_covers/usool-cover.jpg'), dummyImageBytes, { contentType: 'image/jpeg' }));
    record('المواد التعليمية', 'D-3.9', 'المشرفة ترفع غلاف الكتاب إلى book_covers بصيغة صورة سليمة', true);
  } catch (e: any) { record('المواد التعليمية', 'D-3.9', 'المشرفة ترفع غلاف الكتاب إلى book_covers بصيغة صورة سليمة', false, e.message); }

  try {
    await assertSucceeds(getBytes(ref(anonStorage, 'book_covers/usool-cover.jpg')));
    record('المواد التعليمية', 'D-3.10', 'السماح بالقراءة العامة لغلاف الكتاب للزوار والطلبة', true);
  } catch (e: any) { record('المواد التعليمية', 'D-3.10', 'السماح بالقراءة العامة لغلاف الكتاب للزوار والطلبة', false, e.message); }

  try {
    await assertFails(uploadBytes(ref(aliceStorage, 'book_covers/usool-cover.jpg'), dummyImageBytes, { contentType: 'image/jpeg' }));
    record('المواد التعليمية', 'D-3.11', 'حظر الطالبات من رفع أو تعديل أغلفة الكتب', true);
  } catch (e: any) { record('المواد التعليمية', 'D-3.11', 'حظر الطالبات من رفع أو تعديل أغلفة الكتب', false, e.message); }

  try {
    await assertFails(uploadBytes(ref(adminStorage, 'book_covers/malicious.svg'), Buffer.from('<svg></svg>'), { contentType: 'image/svg+xml' }));
    record('المواد التعليمية', 'D-3.12', 'حظر رفع ملفات SVG لأغلفة الكتب', true);
  } catch (e: any) { record('المواد التعليمية', 'D-3.12', 'حظر رفع ملفات SVG لأغلفة الكتب', false, e.message); }

  // ---------------------------------------------------------------------------
  // الفئة 4: الإغلاق الافتراضي التام (Default Deny) للمسارات غير المعرفة
  // ---------------------------------------------------------------------------
  console.log('\n--- اختبارات الإغلاق الافتراضي (Default Deny) ---');

  try {
    await assertFails(getBytes(ref(anonStorage, 'random_folder/secret.txt')));
    record('الإغلاق الافتراضي', 'D-4.1', 'حظر قراءة أي مسار مجهول أو غير معرف (Default Deny)', true);
  } catch (e: any) { record('الإغلاق الافتراضي', 'D-4.1', 'حظر قراءة أي مسار مجهول أو غير معرف (Default Deny)', false, e.message); }

  try {
    await assertFails(getBytes(ref(aliceStorage, 'backups/system_dump.sql')));
    record('الإغلاق الافتراضي', 'D-4.2', 'حظر قراءة ملفات النسخ الاحتياطية أو الحساسة', true);
  } catch (e: any) { record('الإغلاق الافتراضي', 'D-4.2', 'حظر قراءة ملفات النسخ الاحتياطية أو الحساسة', false, e.message); }

  try {
    await assertFails(uploadBytes(ref(aliceStorage, 'system_logs/log.txt'), Buffer.from('log entry'), { contentType: 'text/plain' }));
    record('الإغلاق الافتراضي', 'D-4.3', 'حظر الكتابة على مسارات النظام غير المصرح بها', true);
  } catch (e: any) { record('الإغلاق الافتراضي', 'D-4.3', 'حظر الكتابة على مسارات النظام غير المصرح بها', false, e.message); }

  await testEnv.cleanup();

  console.log('\n================================================================================');
  console.log('                          TEST SUITE RESULTS                                    ');
  console.log('================================================================================');
  const total = results.length;
  const passed = results.filter(r => r.passed).length;
  console.log(`Total Storage Tests: ${total}`);
  console.log(`Passed: ${passed} / ${total} (${Math.round((passed / total) * 100)}%)`);

  if (passed === total) {
    console.log('ALL STORAGE RULES SECURED & VERIFIED ON REAL EMULATOR! 🎉');
  } else {
    console.error('SOME STORAGE TESTS FAILED!');
    process.exit(1);
  }
}

runStorageRulesTests().catch(err => {
  console.error('Fatal error running storage tests:', err);
  process.exit(1);
});
