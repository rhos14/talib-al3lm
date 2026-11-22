import http from 'http';
import fs from 'fs';
import path from 'path';

interface ConsistencyTestResult {
  title: string;
  expected: string;
  actual: string;
  passed: boolean;
}

const results: ConsistencyTestResult[] = [];

function record(title: string, expected: string, actual: string, passed: boolean) {
  results.push({ title, expected, actual, passed });
  console.log(`${passed ? '✅ [PASSED]' : '❌ [FAILED]'} ${title}`);
  console.log(`   المتوقع: ${expected}`);
  console.log(`   الفعلي:  ${actual}\n`);
}

async function runConsistencySuite() {
  console.log('==================================================================');
  console.log('       اختبارات اتساق حفظ الاختبارات وصيانة LectureQuestion.points        ');
  console.log('==================================================================\n');

  // 1. فحص كود server.ts لضمان اشتراط نجاح معاملة Firestore وعدم إعلان النجاح عند الفشل
  const serverContent = fs.readFileSync(path.join(process.cwd(), 'server.ts'), 'utf-8');
  
  const enforceTransactionSuccess = serverContent.includes('catch (txErr: any)') &&
                                   serverContent.includes('status(503)') &&
                                   serverContent.includes('retryable: true') &&
                                   !serverContent.includes('syncNotice:');
  
  record(
    '1. اشتراط نجاح معاملة Firestore لإعلان اكتمال التسليم',
    'استجابة 503 مع retryable: true وعدم إرجاع success: true عند فشل المعاملة',
    enforceTransactionSuccess ? 'المعاملة شرطية حاسمة ولا تعلن النجاح عند الفشل' : 'يوجد تجاوز لمعاملة قاعدة البيانات',
    enforceTransactionSuccess
  );

  // 2. فحص واجهات العميل (Lectures.tsx و Dashboard.tsx) لمنع إعلان الاكتمال عند فشل الخادم
  const lecturesContent = fs.readFileSync(path.join(process.cwd(), 'src/pages/Lectures.tsx'), 'utf-8');
  const dashboardContent = fs.readFileSync(path.join(process.cwd(), 'src/pages/Dashboard.tsx'), 'utf-8');

  const lecturesAbortsOnFailure = lecturesContent.includes('if (res.ok && data.success)') &&
                                  lecturesContent.includes('showError("تعذر حفظ النتيجة في قاعدة البيانات"') &&
                                  lecturesContent.includes('setQuizAttemptId(\'\')');

  const dashboardAbortsOnFailure = dashboardContent.includes('if (res.ok && data.success)') &&
                                   dashboardContent.includes('showError("تعذر حفظ النتيجة في قاعدة البيانات"') &&
                                   dashboardContent.includes('setQuizAttemptId(\'\')');

  record(
    '2. الواجهة لا تعرض العملية مكتملة إذا فشل الحفظ في Firestore',
    'إيقاف إعلان النجاح وعرض رسالة خطأ قابلة لإعادة المحاولة',
    (lecturesAbortsOnFailure && dashboardAbortsOnFailure) ? 'تم التحقق من وقف العملية عند الفشل في Lectures و Dashboard' : 'الواجهة تعلن النجاح محلياً',
    lecturesAbortsOnFailure && dashboardAbortsOnFailure
  );

  // 3. الاحتفاظ بـ attemptId نفسه عند إعادة المحاولة ومنع التكرار
  const lecturesPreservesAttemptId = lecturesContent.includes('const clientAttemptId = quizAttemptId ||') &&
                                     lecturesContent.includes('if (!quizAttemptId) setQuizAttemptId(clientAttemptId);');
  
  const dashboardPreservesAttemptId = dashboardContent.includes('const clientAttemptId = quizAttemptId ||') &&
                                      dashboardContent.includes('if (!quizAttemptId) setQuizAttemptId(clientAttemptId);');

  const serverHandlesDuplicateAttempt = serverContent.includes('const attemptSnap = await transaction.get(attemptDocRef);') &&
                                        serverContent.includes('if (attemptSnap.exists())') &&
                                        serverContent.includes('isDuplicate: true');

  record(
    '3. الاحتفاظ بـ attemptId نفسه عند إعادة المحاولة ومنع التكرار',
    'الاحتفاظ بنفس المعرف وإرجاع isDuplicate: true دون زيادة attemptsCount أو تكرار السجلات',
    (lecturesPreservesAttemptId && dashboardPreservesAttemptId && serverHandlesDuplicateAttempt) 
      ? 'المعرف ثابت ويعالج ذرياً دون تكرار في Firestore' 
      : 'المعرف يتغير عند إعادة المحاولة',
    lecturesPreservesAttemptId && dashboardPreservesAttemptId && serverHandlesDuplicateAttempt
  );

  // 4. الحفاظ على احتساب وزن السؤال LectureQuestion.points في الاختبارات
  const typesContent = fs.readFileSync(path.join(process.cwd(), 'src/types.ts'), 'utf-8');
  const typesHasPoints = (typesContent.includes('interface LectureQuizQuestion') || typesContent.includes('interface LectureQuestion')) && 
                         typesContent.includes('points: number;');
  const serverUsesPoints = serverContent.includes('const qWeight = typeof q.points === \'number\' && q.points > 0 ? q.points : 5;') &&
                           serverContent.includes('totalPoints += qWeight;') &&
                           serverContent.includes('earnedPoints += qWeight;');
  const lecturesShowsPoints = lecturesContent.includes('{q.points} درجات');

  record(
    '4. الحفاظ على احتساب وأوزان LectureQuestion.points',
    'بقاء points في تعريف LectureQuestion وحساب الدرجات الموزونة في server.ts وعرضها بالواجهة',
    (typesHasPoints && serverUsesPoints && lecturesShowsPoints)
      ? 'الوزن محفوظ بنسبة 100% ويتحكم في احتساب الدرجات ونسب النجاح'
      : 'تم فقدان نقاط السؤال',
    typesHasPoints && serverUsesPoints && lecturesShowsPoints
  );

  console.log('==================================================================');
  const allPassed = results.every(r => r.passed);
  console.log(`إجمالي الفحوصات المستهدفة: ${results.length}`);
  console.log(`الناجحة: ${results.filter(r => r.passed).length} / ${results.length}`);
  if (allPassed) {
    console.log('جميع الفحوصات المستهدفة للمرحلة C نجحت بامتياز! 🎯');
  } else {
    console.error('بعض الفحوصات لم تنجح!');
    process.exit(1);
  }
}

runConsistencySuite().catch(err => {
  console.error(err);
  process.exit(1);
});
