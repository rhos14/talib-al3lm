import { initializeTestEnvironment, assertFails, assertSucceeds, RulesTestEnvironment } from '@firebase/rules-unit-testing';
import { getBytes, ref, uploadBytes } from 'firebase/storage';
import fs from 'fs';
import path from 'path';

interface SpecificTestResult {
  category: string;
  id: string;
  description: string;
  passed: boolean;
  error?: string;
}

const testResults: SpecificTestResult[] = [];

function record(category: string, id: string, description: string, passed: boolean, error?: string) {
  testResults.push({ category, id, description, passed, error });
  const status = passed ? '✅ [PASSED]' : '❌ [FAILED]';
  console.log(`${status} [${category}] ${id}: ${description}`);
  if (error) {
    console.log(`    ↳ Details: ${error}`);
  }
}

async function runSpecificPhaseDTests() {
  console.log('================================================================================');
  console.log('  FOCUSED VERIFICATION: SVG REMOVAL & VIDEO UPLOAD RULES (PHASE D)             ');
  console.log('================================================================================\n');

  const rulesPath = path.join(process.cwd(), 'storage.rules');
  const rules = fs.readFileSync(rulesPath, 'utf-8');

  let testEnv: RulesTestEnvironment;
  try {
    testEnv = await initializeTestEnvironment({
      projectId: 'talaba-storage-specific-test',
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

  const aliceStorage = testEnv.authenticatedContext('alice-uid', { email: 'alice@elm.com' }).storage();
  const adminStorage = testEnv.authenticatedContext('admin-uid', { email: 'admin@elm.com', admin: true }).storage();

  const dummyPngBytes = Buffer.from('GIF89a\x01\x00\x01\x00\x80\x00\x00\xff\xff\xff\x00\x00\x00!\xf9\x04\x01\x00\x00\x00\x00,\x00\x00\x00\x00\x01\x00\x01\x00\x00\x02\x02D\x01\x00;');
  const dummyJpegBytes = Buffer.from('\xFF\xD8\xFF\xE0\x00\x10JFIF\x00\x01\x01\x01\x00H\x00H\x00\x00\xFF\xDB');
  const dummyWebpBytes = Buffer.from('RIFF....WEBPVP8 ');
  const dummyGifBytes = Buffer.from('GIF89a...');
  const dummySvgBytes = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"><circle cx="10" cy="10" r="5"/></svg>');
  
  const dummyMp4Bytes = Buffer.from('ftypisom....mp4 video bytes');
  const dummyWebmBytes = Buffer.from('\x1A\x45\xDF\xA3....webm video bytes');
  const dummyDisallowedVideoBytes = Buffer.from('fake video or exe');

  // ===========================================================================
  // 1. اختبارات إزالة SVG واستمرار عمل الصور الشخصية المسموحة
  // ===========================================================================
  console.log('--- 1. اختبارات فحص إزالة SVG وأنواع الصور الشخصية (user_avatars) ---');

  // 1.1 رفض رفع ملف SVG كصورة شخصية (image/svg+xml)
  try {
    await assertFails(uploadBytes(ref(aliceStorage, 'user_avatars/alice-uid/avatar.svg'), dummySvgBytes, { contentType: 'image/svg+xml' }));
    record('إزالة SVG', 'D-SVG.1', 'رفض رفع ملف بصيغة SVG كصورة شخصية (image/svg+xml)', true);
  } catch (e: any) {
    record('إزالة SVG', 'D-SVG.1', 'رفض رفع ملف بصيغة SVG كصورة شخصية (image/svg+xml)', false, e.message);
  }

  // 1.2 قبول رفع صيغة PNG
  try {
    await assertSucceeds(uploadBytes(ref(aliceStorage, 'user_avatars/alice-uid/avatar.png'), dummyPngBytes, { contentType: 'image/png' }));
    record('الصور المسموحة', 'D-IMG.1', 'قبول رفع صورة شخصية صالحة بصيغة PNG', true);
  } catch (e: any) {
    record('الصور المسموحة', 'D-IMG.1', 'قبول رفع صورة شخصية صالحة بصيغة PNG', false, e.message);
  }

  // 1.3 قبول رفع صيغة JPEG
  try {
    await assertSucceeds(uploadBytes(ref(aliceStorage, 'user_avatars/alice-uid/avatar.jpg'), dummyJpegBytes, { contentType: 'image/jpeg' }));
    record('الصور المسموحة', 'D-IMG.2', 'قبول رفع صورة شخصية صالحة بصيغة JPEG', true);
  } catch (e: any) {
    record('الصور المسموحة', 'D-IMG.2', 'قبول رفع صورة شخصية صالحة بصيغة JPEG', false, e.message);
  }

  // 1.4 قبول رفع صيغة WebP
  try {
    await assertSucceeds(uploadBytes(ref(aliceStorage, 'user_avatars/alice-uid/avatar.webp'), dummyWebpBytes, { contentType: 'image/webp' }));
    record('الصور المسموحة', 'D-IMG.3', 'قبول رفع صورة شخصية صالحة بصيغة WebP', true);
  } catch (e: any) {
    record('الصور المسموحة', 'D-IMG.3', 'قبول رفع صورة شخصية صالحة بصيغة WebP', false, e.message);
  }

  // 1.5 قبول رفع صيغة GIF
  try {
    await assertSucceeds(uploadBytes(ref(aliceStorage, 'user_avatars/alice-uid/avatar.gif'), dummyGifBytes, { contentType: 'image/gif' }));
    record('الصور المسموحة', 'D-IMG.4', 'قبول رفع صورة شخصية صالحة بصيغة GIF', true);
  } catch (e: any) {
    record('الصور المسموحة', 'D-IMG.4', 'قبول رفع صورة شخصية صالحة بصيغة GIF', false, e.message);
  }

  // 1.6 استمرار قراءة الصور المسموحة بنجاح
  try {
    await assertSucceeds(getBytes(ref(aliceStorage, 'user_avatars/alice-uid/avatar.png')));
    record('قراءة الصور', 'D-IMG.5', 'استمرار قراءة الطالبة لصورتها الشخصية المسموحة بنجاح', true);
  } catch (e: any) {
    record('قراءة الصور', 'D-IMG.5', 'استمرار قراءة الطالبة لصورتها الشخصية المسموحة بنجاح', false, e.message);
  }

  // ===========================================================================
  // 2. اختبارات مسار المحاضرات المرئية (course_videos)
  // ===========================================================================
  console.log('\n--- 2. اختبارات رفع الفيديو وصلاحيات المشرفة (course_videos) ---');

  // 2.1 نجاح رفع ملف فيديو صالح (MP4) بواسطة المشرفة ذات Custom Claims
  try {
    await assertSucceeds(uploadBytes(ref(adminStorage, 'course_videos/lecture-01.mp4'), dummyMp4Bytes, { contentType: 'video/mp4' }));
    record('رفع الفيديو', 'D-VID.1', 'نجاح رفع ملف فيديو صالح (video/mp4) بواسطة المشرفة ذات Custom Claims', true);
  } catch (e: any) {
    record('رفع الفيديو', 'D-VID.1', 'نجاح رفع ملف فيديو صالح (video/mp4) بواسطة المشرفة ذات Custom Claims', false, e.message);
  }

  // 2.2 نجاح رفع ملف فيديو صالح (WebM) بواسطة المشرفة ذات Custom Claims
  try {
    await assertSucceeds(uploadBytes(ref(adminStorage, 'course_videos/lecture-02.webm'), dummyWebmBytes, { contentType: 'video/webm' }));
    record('رفع الفيديو', 'D-VID.2', 'نجاح رفع ملف فيديو صالح (video/webm) بواسطة المشرفة ذات Custom Claims', true);
  } catch (e: any) {
    record('رفع الفيديو', 'D-VID.2', 'نجاح رفع ملف فيديو صالح (video/webm) بواسطة المشرفة ذات Custom Claims', false, e.message);
  }

  // 2.3 رفض رفع الفيديو بواسطة طالبة عادية (غير المشرفة)
  try {
    await assertFails(uploadBytes(ref(aliceStorage, 'course_videos/lecture-01.mp4'), dummyMp4Bytes, { contentType: 'video/mp4' }));
    record('صلاحيات الفيديو', 'D-VID.3', 'رفض رفع الفيديو بواسطة طالبة عادية غير مصرح لها', true);
  } catch (e: any) {
    record('صلاحيات الفيديو', 'D-VID.3', 'رفض رفع الفيديو بواسطة طالبة عادية غير مصرح لها', false, e.message);
  }

  // 2.4 رفض نوع MIME غير مسموح به في مسار course_videos (مثل ملف تنفيذي أو نصي أو صورة)
  try {
    await assertFails(uploadBytes(ref(adminStorage, 'course_videos/lecture-malicious.sh'), dummyDisallowedVideoBytes, { contentType: 'text/x-shellscript' }));
    record('نوع MIME للفيديو', 'D-VID.4', 'رفض نوع MIME غير مسموح به في مسار course_videos (text/x-shellscript)', true);
  } catch (e: any) {
    record('نوع MIME للفيديو', 'D-VID.4', 'رفض نوع MIME غير مسموح به في مسار course_videos (text/x-shellscript)', false, e.message);
  }

  try {
    await assertFails(uploadBytes(ref(adminStorage, 'course_videos/fake.exe'), dummyDisallowedVideoBytes, { contentType: 'application/octet-stream' }));
    record('نوع MIME للفيديو', 'D-VID.5', 'رفض نوع MIME غير مسموح به في مسار course_videos (application/octet-stream)', true);
  } catch (e: any) {
    record('نوع MIME للفيديو', 'D-VID.5', 'رفض نوع MIME غير مسموح به في مسار course_videos (application/octet-stream)', false, e.message);
  }

  await testEnv.cleanup();

  console.log('\n================================================================================');
  console.log('                          SUMMARY OF FOCUSED TESTS                              ');
  console.log('================================================================================');
  const total = testResults.length;
  const passed = testResults.filter(t => t.passed).length;
  console.log(`Total Focused Tests: ${total}`);
  console.log(`Passed: ${passed} / ${total} (${Math.round((passed / total) * 100)}%)`);

  if (passed === total) {
    console.log('ALL FOCUSED SECURITY CHECKS PASSED SUCCESSFULLY! 🎉');
  } else {
    console.error('SOME FOCUSED TESTS FAILED!');
    process.exit(1);
  }
}

runSpecificPhaseDTests().catch(err => {
  console.error('Fatal error running focused tests:', err);
  process.exit(1);
});
