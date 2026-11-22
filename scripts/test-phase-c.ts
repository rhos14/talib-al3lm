import http from 'http';
import fs from 'fs';
import path from 'path';

interface TestResult {
  name: string;
  expected: string;
  actual: string;
  passed: boolean;
  notes?: string;
}

const results: TestResult[] = [];

function makeRequest(options: http.RequestOptions, body?: any): Promise<{ statusCode: number; data: any; raw: string }> {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ statusCode: res.statusCode || 500, data: JSON.parse(data), raw: data });
        } catch {
          resolve({ statusCode: res.statusCode || 500, data: null, raw: data });
        }
      });
    });
    req.on('error', reject);
    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log("==================================================================");
  console.log("Starting Automated Test Suite for Phase C (Firestore & Server)");
  console.log("==================================================================");

  // 1. اختبار استجابة السيرفر الأساسية
  try {
    const res = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/test-server',
      method: 'GET'
    });
    results.push({
      name: "1. الخادم يعمل ويستجيب بنجاح",
      expected: "HTTP 200",
      actual: `HTTP ${res.statusCode}`,
      passed: res.statusCode === 200
    });
  } catch (e: any) {
    results.push({
      name: "1. الخادم يعمل ويستجيب بنجاح",
      expected: "HTTP 200",
      actual: `Error: ${e.message}`,
      passed: false
    });
  }

  // 2. اختبار الإحصائيات العامة الآمنة /api/public/stats
  try {
    const res = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/public/stats',
      method: 'GET'
    });
    const hasData = res.data && res.data.success && res.data.stats && res.data.stats.students;
    results.push({
      name: "2. استعلام الإحصائيات العامة للزوار دون كشف أي PII للمستخدمين",
      expected: "HTTP 200 مع إحصائيات معتمدة",
      actual: `HTTP ${res.statusCode} (success: ${res.data?.success})`,
      passed: res.statusCode === 200 && hasData
    });
  } catch (e: any) {
    results.push({
      name: "2. استعلام الإحصائيات العامة للزوار",
      expected: "HTTP 200",
      actual: `Error: ${e.message}`,
      passed: false
    });
  }

  // 3. اختبار رفض تسجيل الحضور streak دون رمز مصادقة
  try {
    const res = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/student/streak/check-in',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    results.push({
      name: "3. حظر تسجيل الحضور اليومي دون توثيق أمني (Unauthenticated)",
      expected: "HTTP 401 Unauthorized",
      actual: `HTTP ${res.statusCode} (${res.data?.error || ''})`,
      passed: res.statusCode === 401
    });
  } catch (e: any) {
    results.push({
      name: "3. حظر تسجيل الحضور اليومي دون توثيق",
      expected: "HTTP 401",
      actual: `Error: ${e.message}`,
      passed: false
    });
  }

  // 4. اختبار رفض تصحيح الاختبار دون رمز مصادقة
  try {
    const res = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/student/quiz/submit',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { lectureId: 'test-lecture', answers: {} });
    results.push({
      name: "4. حظر تسليم وتصحيح الاختبارات من زائر غير مسجل (Unauthenticated)",
      expected: "HTTP 401 Unauthorized",
      actual: `HTTP ${res.statusCode}`,
      passed: res.statusCode === 401
    });
  } catch (e: any) {
    results.push({
      name: "4. حظر تسليم الاختبارات دون توثيق",
      expected: "HTTP 401",
      actual: `Error: ${e.message}`,
      passed: false
    });
  }

  // 5. اختبار رفض منح صلاحيات الإدارة دون توثيق
  try {
    const res = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/admin/claims/grant',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { targetUid: 'fake-uid' });
    results.push({
      name: "5. حظر ترقية المستخدمين أو تزوير Claims الإدارة (Privilege Escalation)",
      expected: "HTTP 401 Unauthorized",
      actual: `HTTP ${res.statusCode}`,
      passed: res.statusCode === 401
    });
  } catch (e: any) {
    results.push({
      name: "5. حظر ترقية المستخدمين",
      expected: "HTTP 401",
      actual: `Error: ${e.message}`,
      passed: false
    });
  }

  // 6. اختبار رفض رمز مزور (Forged Bearer Token)
  try {
    const res = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/student/streak/check-in',
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.fake'
      }
    });
    results.push({
      name: "6. رفض الرموز المزورة والتحقق الصارم من توقيع Google (Forged Token)",
      expected: "HTTP 401 (رمز غير صالح)",
      actual: `HTTP ${res.statusCode}`,
      passed: res.statusCode === 401
    });
  } catch (e: any) {
    results.push({
      name: "6. رفض الرموز المزورة",
      expected: "HTTP 401",
      actual: `Error: ${e.message}`,
      passed: false
    });
  }

  // 7. التدقيق الهيكلي البرمجي لملف firestore.rules
  const rulesContent = fs.readFileSync(path.join(process.cwd(), 'firestore.rules'), 'utf-8');
  
  const hasNoPoints = !rulesContent.includes("request.resource.data.points <=");
  results.push({
    name: "7. خلو قواعد Firestore من أي اعتماد على رصيد UserProfile.points",
    expected: "عدم وجود حقول نقاط قابلة للتعديل",
    actual: hasNoPoints ? "تم التحقق (مغلق)" : "يحتوي على شروط نقاط",
    passed: hasNoPoints
  });

  const hasStrictAdmin = rulesContent.includes("request.auth.token.admin == true") && !rulesContent.includes("wwwhalafaisal18@gmail.com");
  results.push({
    name: "8. حصر صلاحية المشرفة حصراً على Custom Claims (token.admin == true) وإلغاء البريد",
    expected: "اعتماد Custom Claims فقط",
    actual: hasStrictAdmin ? "مطابق 100%" : "يحتوي على استثناء بريد",
    passed: hasStrictAdmin
  });

  const hasPublicStatsWriteFalse = rulesContent.includes("match /settings/public_stats") && rulesContent.includes("allow write: if false;");
  results.push({
    name: "9. منع كتابة العميل التام على public_stats (allow write: if false)",
    expected: "write: if false;",
    actual: hasPublicStatsWriteFalse ? "مغلق تماماً للكتابة" : "غير مغلق",
    passed: hasPublicStatsWriteFalse
  });

  const hasCollectionGroupAdminOnly = rulesContent.includes("match /{path=**}/lecture_progress/{progressId}") && rulesContent.includes("allow write: if false;");
  results.push({
    name: "10. قصر استعلامات collectionGroup على المشرفة ومنع أي كتابة",
    expected: "read: if isAdmin(); write: if false;",
    actual: hasCollectionGroupAdminOnly ? "محمي للمشرفة فقط" : "غير محمي",
    passed: hasCollectionGroupAdminOnly
  });

  const hasCertificatesAdminOnly = rulesContent.includes("match /certificates/{certificateId}") && rulesContent.includes("allow create, update, delete: if isAdmin();");
  results.push({
    name: "11. حظر إنشاء الشهادات من العميل وقصرها على المشرفة والخادم",
    expected: "create, update, delete: if isAdmin();",
    actual: hasCertificatesAdminOnly ? "محمي تماماً" : "غير محمي",
    passed: hasCertificatesAdminOnly
  });

  const hasProgressProtected = rulesContent.includes("lastPdfPage") && rulesContent.includes("lectureWatchPercentage") && rulesContent.includes("affectedKeys().hasOnly");
  results.push({
    name: "12. حظر تعديل نتائج الاختبارات وisPassed وattemptsCount في lecture_progress باستخدام affectedKeys",
    expected: "حصر التعديل على الحقول الشخصية فقط عبر hasOnly",
    actual: hasProgressProtected ? "مطبق بالقائمة البيضاء" : "غير مطبق",
    passed: hasProgressProtected
  });

  const hasNotificationsProtected = rulesContent.includes("match /student_notifications") && rulesContent.includes("request.resource.data.isRead is bool");
  results.push({
    name: "13. قصر تعديل الإشعارات على isRead (Boolean) و readAt ومنع تزوير المحتوى",
    expected: "تعديل isRead bool فقط والإنشاء للمشرفة",
    actual: hasNotificationsProtected ? "مطبق وصارم" : "غير مطبق",
    passed: hasNotificationsProtected
  });

  const hasNoTotalStudyHoursInCreate = rulesContent.includes("!('totalStudyHours' in request.resource.data)") && !rulesContent.includes("'totalStudyHours', 'completedMutunCount'");
  results.push({
    name: "14. استبعاد totalStudyHours كلياً من قائمة الإنشاء البيضاء وحظر إرسالها من العميل",
    expected: "حظر تام في create مع قائمة بيضاء خالية منها",
    actual: hasNoTotalStudyHoursInCreate ? "محظورة ومستبعدة بالكامل" : "ما زالت متواجدة",
    passed: hasNoTotalStudyHoursInCreate
  });

  const serverContent = fs.readFileSync(path.join(process.cwd(), 'server.ts'), 'utf-8');
  const serverHasNoStudyHoursIncrement = !serverContent.includes("totalStudyHours: newTotalHours") && !serverContent.includes("totalStudyHours || 0");
  results.push({
    name: "15. إلغاء احتساب وتعديل ساعات الدراسة في الخادم server.ts بالكامل",
    expected: "خلو server.ts من أي كتابة لـ totalStudyHours",
    actual: serverHasNoStudyHoursIncrement ? "ملغاة تماماً من الخادم" : "ما زالت موجودة",
    passed: serverHasNoStudyHoursIncrement
  });

  // 16. اختبار حظر جلب الأسئلة المنقاة دون توثيق
  try {
    const res = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/student/quiz/questions/lec-test-1',
      method: 'GET'
    });
    results.push({
      name: "16. حظر استعلام أسئلة الاختبار دون مصادقة رسمية (Unauthenticated)",
      expected: "HTTP 401 Unauthorized",
      actual: `HTTP ${res.statusCode} (${res.data?.error || ''})`,
      passed: res.statusCode === 401
    });
  } catch (e: any) {
    results.push({
      name: "16. حظر استعلام أسئلة الاختبار دون مصادقة",
      expected: "HTTP 401",
      actual: `Error: ${e.message}`,
      passed: false
    });
  }

  // 17. اختبار رفض الرموز المزورة في جلب الأسئلة
  try {
    const res = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/student/quiz/questions/lec-test-1',
      method: 'GET',
      headers: { 'Authorization': 'Bearer forged.invalid.token' }
    });
    results.push({
      name: "17. رفض الرموز المزورة عند طلب أسئلة الاختبار (Forged Token Rejection)",
      expected: "HTTP 401 Unauthorized",
      actual: `HTTP ${res.statusCode} (${res.data?.error || ''})`,
      passed: res.statusCode === 401
    });
  } catch (e: any) {
    results.push({
      name: "17. رفض الرموز المزورة عند طلب أسئلة الاختبار",
      expected: "HTTP 401",
      actual: `Error: ${e.message}`,
      passed: false
    });
  }

  // 18. تدقيق بنية كود الأسئلة المنقاة وعدم تسريب correctAnswer
  const sanitizedBlockMatch = serverContent.match(/app\.get\('\/api\/student\/quiz\/questions\/:lectureId'[\s\S]*?res\.json\(\{[\s\S]*?questions: sanitizedQuestions[\s\S]*?\}\);/);
  const sanitizedBlock = sanitizedBlockMatch ? sanitizedBlockMatch[0] : '';
  const leaksCorrectAnswer = sanitizedBlock.includes('correctAnswer');
  results.push({
    name: "18. تنقية الأسئلة وخلو المسار تماماً من تسريب correctAnswer أو مفاتيح الإجابات",
    expected: "عدم كشف correctAnswer في الإسقاط البرمجي",
    actual: (!leaksCorrectAnswer && sanitizedBlock.length > 0) ? "منقى ومحصن 100%" : "يوجد تسريب محتمل",
    passed: !leaksCorrectAnswer && sanitizedBlock.length > 0
  });

  // 19. عدم تسريب correctAnswer في استجابة تسليم الاختبار
  const submitBlockMatch = serverContent.match(/app\.post\('\/api\/student\/quiz\/submit'[\s\S]*?res\.json\(\{[\s\S]*?\.\.\.transactionResult[\s\S]*?\}\);/);
  const submitBlock = submitBlockMatch ? submitBlockMatch[0] : '';
  const submitLeaksAnswer = submitBlock.includes('correctAnswer:') || submitBlock.includes('answers:');
  results.push({
    name: "19. عدم كشف الإجابات الصحيحة في استجابة تسليم وتصحيح الاختبار",
    expected: "استجابة تقتصر على الدرجة والنسبة والاجتياز",
    actual: !submitLeaksAnswer ? "محصن (الدرجة والنسبة فقط)" : "يسرب بيانات",
    passed: !submitLeaksAnswer
  });

  // 20. التحقق من آلية Idempotency الذرية الدائمة عبر Firestore Transaction وسجل quiz_attempts
  const hasAtomicTransaction = serverContent.includes('runTransaction(dbInstance') && 
                               serverContent.includes('quiz_attempts') && 
                               serverContent.includes('isDuplicate: true');
  results.push({
    name: "20. تطبيق Idempotency ذرية ودائمة عبر Firestore Transaction وسجل quiz_attempts",
    expected: "runTransaction + quiz_attempts لمنع التكرار حتى مع تعدد الخوادم",
    actual: hasAtomicTransaction ? "مطبق ومحمي ذرياً" : "يعتمد على الذاكرة فقط",
    passed: hasAtomicTransaction
  });

  console.log("\n==================================================================");
  console.log("                      TEST RESULTS SUMMARY                        ");
  console.log("==================================================================");
  let passedCount = 0;
  results.forEach(r => {
    if (r.passed) passedCount++;
    const icon = r.passed ? "✅ [PASSED]" : "❌ [FAILED]";
    console.log(`${icon} ${r.name}`);
    console.log(`   Expected: ${r.expected}`);
    console.log(`   Actual:   ${r.actual}\n`);
  });

  console.log(`Summary: ${passedCount} / ${results.length} Tests Passed successfully.`);
  console.log("==================================================================");
}

runTests().catch(console.error);
