import 'dotenv/config';
import express from 'express';
import path from 'path';
import fs from 'fs';
import https from 'https';
import http from 'http';
import { createServer as createViteServer } from 'vite';
import crypto from 'crypto';
import { initializeApp } from 'firebase/app';
import { initializeApp as initAdminApp, getApps as getAdminApps } from 'firebase-admin/app';
import { getAuth as getAdminAuth } from 'firebase-admin/auth';
import { 
  initializeFirestore, 
  getFirestore, 
  collection, 
  getDocs, 
  doc, 
  updateDoc, 
  getDoc, 
  setDoc, 
  query, 
  where,
  runTransaction
} from 'firebase/firestore';

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// حماية خادم Express من الانهيار عند حدوث أخطاء غير معالجة
process.on('uncaughtException', (err) => {
  console.error('[SERVER UNCAUGHT EXCEPTION]:', err);
});
process.on('unhandledRejection', (reason) => {
  console.error('[SERVER UNHANDLED REJECTION]:', reason);
});

app.use(express.json({ limit: '10mb' }));

// =========================================================================
// سياسة CORS الصارمة لمسارات /api/* (تُنفَّذ قبل المصادقة ومحددات الطلبات)
// =========================================================================
const DEFAULT_GITHUB_PAGES_ORIGIN = 'https://rhos14.github.io';

function parseAllowedCorsOrigins(): Set<string> {
  const allowed = new Set<string>();
  const configuredOrigin =
    process.env.CORS_ALLOWED_ORIGIN ||
    process.env.CORS_ALLOWED_ORIGINS ||
    process.env.FRONTEND_ORIGIN ||
    '';

  const rawSources = [
    configuredOrigin.trim() ? configuredOrigin : DEFAULT_GITHUB_PAGES_ORIGIN,
    process.env.APP_URL || '',
  ];

  for (const source of rawSources) {
    for (const part of source.split(',')) {
      const candidate = part.trim().replace(/\/+$/, '');
      if (!candidate || candidate === '*') continue;
      try {
        const parsed = new URL(candidate);
        if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
          allowed.add(parsed.origin);
        }
      } catch {
        // تجاهل القيم غير الصالحة
      }
    }
  }

  if (process.env.NODE_ENV !== 'production') {
    allowed.add('http://localhost:3000');
    allowed.add('http://127.0.0.1:3000');
  }

  return allowed;
}

function isSameServerOrigin(originHeader: string, req: express.Request): boolean {
  const hostHeader = typeof req.headers.host === 'string' ? req.headers.host.trim().toLowerCase() : '';
  if (!hostHeader) return false;
  try {
    const parsedOrigin = new URL(originHeader);
    return parsedOrigin.host.toLowerCase() === hostHeader;
  } catch {
    return false;
  }
}

function apiCorsMiddleware(req: express.Request, res: express.Response, next: express.NextFunction) {
  const originHeader = typeof req.headers.origin === 'string' ? req.headers.origin.trim() : '';

  // السماح بطلبات الخادم-إلى-الخادم أو الأتمتة التي لا تحمل Origin بمتابعة التحقق من الهوية والصلاحيات
  if (!originHeader) {
    if (req.method === 'OPTIONS') {
      return res.sendStatus(204);
    }
    return next();
  }

  res.setHeader('Vary', 'Origin');

  let normalizedOrigin = '';
  try {
    const parsed = new URL(originHeader);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      normalizedOrigin = parsed.origin;
    }
  } catch {
    normalizedOrigin = '';
  }

  const allowedOrigins = parseAllowedCorsOrigins();
  const isAllowed =
    Boolean(normalizedOrigin) &&
    (allowedOrigins.has(normalizedOrigin) || isSameServerOrigin(normalizedOrigin, req));

  if (!isAllowed) {
    return res.status(403).json({
      success: false,
      code: 'cors/origin-forbidden',
      error: 'غير مصرح بالوصول من هذا النطاق وفق سياسة CORS.'
    });
  }

  res.setHeader('Access-Control-Allow-Origin', normalizedOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Authorization, Content-Type, X-File-Name, X-Image-Purpose, x-admin-key, x-import-api-key, Range'
  );
  res.setHeader('Access-Control-Expose-Headers', 'Content-Length, Content-Range, Retry-After');
  res.setHeader('Access-Control-Max-Age', '600');

  // معالجة طلبات Preflight OPTIONS قبل المصادقة ومحددات الطلبات
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  return next();
}

app.use('/api', apiCorsMiddleware);

// قراءة بيانات التكوين الحية لـ Firebase من الملف المحلي
let firebaseConfig: Record<string, any> = {};
try {
  const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
  if (fs.existsSync(configPath)) {
    firebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    console.log("Successfully loaded live Firebase configuration.");
  }
} catch (err) {
  console.warn("Notice: firebase-applet-config.json not loaded:", err);
}

// تهيئة تطبيق Firebase
const firebaseApp = initializeApp(firebaseConfig);

// تهيئة Firebase Admin SDK لإدارة هوية المشرفة والـ Custom Claims عبر ADC / GOOGLE_APPLICATION_CREDENTIALS
let adminAuth: any = null;
const configuredGacPath = (process.env.GOOGLE_APPLICATION_CREDENTIALS || '').trim();
const hasConfiguredServiceAccountFile = Boolean(configuredGacPath && fs.existsSync(configuredGacPath));
if (configuredGacPath && !hasConfiguredServiceAccountFile) {
  console.warn('[Firebase Admin] GOOGLE_APPLICATION_CREDENTIALS is set, but the target credentials file does not exist at runtime.');
}
try {
  const adminApp = getAdminApps().length === 0
    ? initAdminApp({ projectId: firebaseConfig.projectId || "tlb-ilm-r" })
    : getAdminApps()[0];
  adminAuth = getAdminAuth(adminApp);
  console.log(
    `Firebase Admin Auth SDK initialized successfully (credentialsMode=${hasConfiguredServiceAccountFile ? 'service_account_file' : 'ambient_adc_or_fallback'}).`
  );
} catch (adminInitErr) {
  console.warn("Notice: Firebase Admin SDK initialization fallback:", adminInitErr);
}

// مرجع قاعدة بيانات Firestore كـ Singleton
let firestoreDbInstance: any = null;
function getDb() {
  if (firestoreDbInstance) return firestoreDbInstance;
  const dbId = firebaseConfig.firestoreDatabaseId || "ai-studio-92b4f1ee-5e4d-4b70-8e6c-2a8e8cc32d56";
  try {
    firestoreDbInstance = initializeFirestore(firebaseApp, {
      experimentalForceLongPolling: true
    }, dbId);
  } catch (e) {
    firestoreDbInstance = getFirestore(firebaseApp, dbId);
  }
  return firestoreDbInstance;
}

const ADMIN_EMAIL = 'wwwhalafaisal18@gmail.com';

// =========================================================================
// نظام حماية معدل الطلبات (Rate Limiting) في الذاكرة لمنع هجمات الحرمان من الخدمة والتخمين
// =========================================================================
interface RateLimitOptions {
  windowMs: number;
  maxRequests: number;
  message?: string;
}

function createRateLimiter(options: RateLimitOptions) {
  const ipHits = new Map<string, { count: number; resetTime: number }>();

  // تنظيف دوري للسجلات منتهية الصلاحية كل دقيقتين
  setInterval(() => {
    const now = Date.now();
    for (const [ip, entry] of ipHits.entries()) {
      if (now > entry.resetTime) {
        ipHits.delete(ip);
      }
    }
  }, 2 * 60 * 1000).unref();

  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const rawIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() || req.socket.remoteAddress || 'unknown-client';
    const now = Date.now();

    const record = ipHits.get(rawIp);
    if (!record || now > record.resetTime) {
      ipHits.set(rawIp, { count: 1, resetTime: now + options.windowMs });
      return next();
    }

    if (record.count >= options.maxRequests) {
      const retryAfter = Math.ceil((record.resetTime - now) / 1000);
      res.setHeader('Retry-After', retryAfter);
      return res.status(429).json({
        success: false,
        error: options.message || 'تم تجاوز الحد المسموح به من الطلبات مؤقتاً لحماية النظام. يرجى الانتظار والمحاولة لاحقاً.',
        retryAfterSeconds: retryAfter
      });
    }

    record.count += 1;
    next();
  };
}

const mediaProxyRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 60,
  message: 'تم تجاوز الحد المسموح به لطلبات وسائط الميديا (60 طلباً في الدقيقة). يرجى الانتظار قليلاً.'
});

const adminRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 30,
  message: 'تم تجاوز الحد المسموح به للعمليات الإدارية (30 طلباً في الدقيقة).'
});

const repairDbRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 5,
  message: 'تم تجاوز الحد المسموح به لطلبات صيانة وتطهير قاعدة البيانات (5 طلبات في الدقيقة).'
});

const importRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 30,
  message: 'تم تجاوز الحد المسموح به لطلبات الاستيراد (30 طلباً في الدقيقة).'
});

// قراءة مفتاح المشرف للأتمتة الخارجية من متغيرات البيئة (مع عدم الاعتماد على ملفات مؤقتة في الإنتاج)
let warnedMissingEnvImportKey = false;
async function getOrInitAdminApiKey(): Promise<string | null> {
  const envKey = process.env.IMPORT_API_KEY || process.env.ADMIN_SECRET_KEY;
  if (envKey && envKey.trim()) {
    return envKey.trim();
  }

  if (process.env.NODE_ENV === 'production') {
    if (!warnedMissingEnvImportKey) {
      warnedMissingEnvImportKey = true;
      console.warn('[IMPORT API KEY] IMPORT_API_KEY is not configured in environment; ephemeral file fallback is disabled in production.');
    }
    return null;
  }

  try {
    const keyPath = path.join(process.cwd(), '.import-api-key');
    if (fs.existsSync(keyPath)) {
      const saved = fs.readFileSync(keyPath, 'utf-8').trim();
      if (saved) return saved;
    }
    // توليد مفتاح عشوائي محلي لبيئة التطوير فقط
    const newKey = `nlm_${crypto.randomBytes(24).toString('hex')}`;
    fs.writeFileSync(keyPath, newKey, { encoding: 'utf-8', mode: 0o600 });
    return newKey;
  } catch (err) {
    console.error("Could not read/write local .import-api-key:", err);
    return null;
  }
}

interface TokenVerificationResult {
  valid: boolean;
  uid?: string;
  email?: string;
  emailVerified?: boolean;
  isAdmin?: boolean;
  isAnonymous?: boolean;
  claims?: any;
  reason?: string;
}

// دالة التحقق الآمن والمباشر من صحة ومطالبات Firebase ID Token باستخدام Firebase Admin SDK وGoogle API
async function verifyFirebaseToken(token: string): Promise<TokenVerificationResult> {
  if (!token || typeof token !== 'string' || token.trim().length === 0) {
    return { valid: false, reason: 'رمز المصادقة مفقود أو غير صالح تركيبياً' };
  }

  const cleanToken = token.trim();

  // 1. محاولة التحقق باستخدام verifyIdToken من Firebase Admin SDK أولاً
  if (adminAuth) {
    try {
      const decoded = await adminAuth.verifyIdToken(cleanToken);
      const email = (decoded.email || '').toLowerCase();
      const emailVerified = !!decoded.email_verified;
      const isAdminClaim = decoded.admin === true || decoded.role === 'admin';
      const isAnonymous = decoded.firebase?.sign_in_provider === 'anonymous';

      return {
        valid: true,
        uid: decoded.uid,
        email,
        emailVerified,
        isAdmin: isAdminClaim,
        isAnonymous,
        claims: decoded
      };
    } catch (adminErr: any) {
      if (adminErr.code === 'auth/id-token-expired') {
        return { valid: false, reason: 'رمز المصادقة منتهي الصلاحية، يرجى إعادة تسجيل الدخول.' };
      }
      if (adminErr.code === 'auth/argument-error') {
        return { valid: false, reason: 'رمز المصادقة غير صالح تركيبياً.' };
      }
      // في حال عدم توفر تفويض بيئة الخدمة، ننتقل للتحقق عبر Google Identity Toolkit الرسمي لضمان استمرارية الخدمة
    }
  }

  // 2. التحقق المباشر من Google Identity Toolkit REST API
  if (firebaseConfig.apiKey) {
    try {
      const verifyUrl = `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${firebaseConfig.apiKey}`;
      const lookupRes = await new Promise<{ ok: boolean; status: number; data: any }>((resolve) => {
        const postData = JSON.stringify({ idToken: cleanToken });
        const request = https.request(verifyUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData)
          }
        }, (res) => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => {
            try {
              resolve({ ok: res.statusCode === 200, status: res.statusCode || 500, data: JSON.parse(data) });
            } catch {
              resolve({ ok: false, status: res.statusCode || 500, data: null });
            }
          });
        });
        request.on('error', () => resolve({ ok: false, status: 500, data: null }));
        request.write(postData);
        request.end();
      });

      if (lookupRes.ok && lookupRes.data?.users?.[0]) {
        const userObj = lookupRes.data.users[0];
        const email = (userObj.email || '').toLowerCase();
        const emailVerified = !!userObj.emailVerified;
        let isAdminClaim = false;
        let parsedClaims: any = {};

        if (userObj.customAttributes) {
          try {
            parsedClaims = JSON.parse(userObj.customAttributes);
            if (parsedClaims.admin === true || parsedClaims.role === 'admin') {
              isAdminClaim = true;
            }
          } catch {
            // ignore JSON parse error
          }
        }

        const isAnonymous =
          !email &&
          (!Array.isArray(userObj.providerUserInfo) || userObj.providerUserInfo.length === 0);

        return {
          valid: true,
          uid: userObj.localId,
          email,
          emailVerified,
          isAdmin: isAdminClaim,
          isAnonymous,
          claims: parsedClaims
        };
      } else {
        const errMsg = lookupRes.data?.error?.message || 'رمز المصادقة غير صالح أو مرفوض من Google Identity Toolkit';
        return { valid: false, reason: errMsg };
      }
    } catch (err: any) {
      return { valid: false, reason: `فشل الاتصال بخدمة التحقق من الرموز: ${err.message}` };
    }
  }

  return { valid: false, reason: 'تعذر التحقق من هوية الرمز لعدم توفر مفتاح الاعتماد' };
}

// سجل المعرفات الإدارية المعتمدة على الخادم بصلاحيات ملف مقيدة (0600)
const ADMINS_FILE = path.join(process.cwd(), '.admin-registry.json');
function getAdminRegistry(): string[] {
  try {
    if (fs.existsSync(ADMINS_FILE)) {
      const data = JSON.parse(fs.readFileSync(ADMINS_FILE, 'utf-8'));
      if (Array.isArray(data)) return data;
    }
  } catch {}
  return [];
}
function saveAdminRegistry(uids: string[]) {
  try {
    fs.writeFileSync(ADMINS_FILE, JSON.stringify(Array.from(new Set(uids))), { encoding: 'utf-8', mode: 0o600 });
  } catch (e) {
    console.warn("Could not save .admin-registry.json:", e);
  }
}

// دالة فحص تصريح المشرف الآمن للواجهات البرمجية
async function verifyAdminRequest(req: express.Request): Promise<{ authorized: boolean; reason?: string; userEmail?: string; uid?: string }> {
  const adminApiKey = await getOrInitAdminApiKey();
  
  // 1. التحقق عبر ترويسة المفتاح المباشر x-admin-key أو x-import-api-key للأتمتة الخارجية
  const headerKey = (req.headers['x-admin-key'] as string) || (req.headers['x-import-api-key'] as string);
  if (headerKey && adminApiKey && headerKey === adminApiKey) {
    return { authorized: true, userEmail: ADMIN_EMAIL };
  }

  // 2. التحقق عبر ترويسة Authorization
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    if (adminApiKey && token === adminApiKey) {
      return { authorized: true, userEmail: ADMIN_EMAIL };
    }

    // التحقق الصارم من Firebase ID Token
    const tokenResult = await verifyFirebaseToken(token);
    if (!tokenResult.valid) {
      return { authorized: false, reason: tokenResult.reason || 'رمز المصادقة غير صالح أو منتهي الصلاحية.' };
    }

    const email = (tokenResult.email || '').toLowerCase();
    const isRootEmail = email === ADMIN_EMAIL.toLowerCase();

    // الشرط 1: التحقق عبر Custom Claims المعتمدة (admin: true)
    if (tokenResult.isAdmin) {
      // اشتراط التحقق من توثيق البريد الإلكتروني (email_verified)
      if (!tokenResult.emailVerified) {
        return {
          authorized: false,
          reason: 'صلاحية المشرفة تتطلب حساباً ببريد إلكتروني موثق ومفعل (email_verified: true).'
        };
      }
      return { authorized: true, userEmail: email, uid: tokenResult.uid };
    }

    // الشرط 2: التحقق من سجل المشرفين المعتمدين على الخادم
    const adminRegistry = getAdminRegistry();
    if (tokenResult.uid && adminRegistry.includes(tokenResult.uid)) {
      if (!tokenResult.emailVerified) {
        return {
          authorized: false,
          reason: 'صلاحية المشرفة تتطلب حساباً ببريد إلكتروني موثق ومفعل (email_verified: true).'
        };
      }
      return { authorized: true, userEmail: email, uid: tokenResult.uid };
    }

    // الشرط 3 (انتقال آمن لحساب المشرفة المعتمد أثناء التحول إلى Custom Claims)
    if (isRootEmail && tokenResult.emailVerified) {
      // محاولة ترقية المطالبات برمجياً في الخلفية إن أمكن
      if (adminAuth && tokenResult.uid) {
        adminAuth.setCustomUserClaims(tokenResult.uid, { admin: true }).catch(() => {});
      }
      return { authorized: true, userEmail: email, uid: tokenResult.uid };
    }

    // أي حساب آخر أو بريد غير موثق يُرفض قطعياً
    // تم إلغاء الاعتماد تماماً على قراءة حقل role من وثائق Firestore لمنع التزوير
    return { 
      authorized: false, 
      reason: 'غير مصرح: حسابك لا يملك صلاحية المشرفة (Custom Claims: admin=true).' 
    };
  }

  return { 
    authorized: false, 
    reason: 'غير مصرح: يرجى تسجيل دخول المشرفة أو توفير مفتاح ترخيص إداري صالح.' 
  };
}

// دالة مساعدة لتعيين Custom Claims بأمان دون حجب مع مهلة زمنية قصيرة
async function safeSetCustomUserClaims(uid: string, claims: Record<string, any>): Promise<boolean> {
  if (!adminAuth) return false;
  try {
    const claimsPromise = adminAuth.setCustomUserClaims(uid, claims);
    const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Claims timeout')), 2500));
    await Promise.race([claimsPromise, timeoutPromise]);
    return true;
  } catch (err: any) {
    console.warn("Notice: safeSetCustomUserClaims note:", err.message);
    return false;
  }
}

// =========================================================================
// واجهات إدارة صلاحيات المشرفة وCustom Claims من جهة الخادم حصراً
// =========================================================================

// منفذ لمزامنة وتعيين Custom Claims لحساب المشرفة المعتمد والموثق
app.post('/api/admin/claims/sync-self', adminRateLimiter, async (req, res) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'رمز المصادقة مطلوب (Bearer Token).' });
  }

  const token = authHeader.substring(7).trim();
  const tokenResult = await verifyFirebaseToken(token);
  if (!tokenResult.valid) {
    return res.status(401).json({ success: false, error: tokenResult.reason || 'الرمز غير صالح.' });
  }

  const email = (tokenResult.email || '').toLowerCase();
  const isRootEmail = email === ADMIN_EMAIL.toLowerCase();
  if (!isRootEmail || !tokenResult.emailVerified) {
    return res.status(403).json({
      success: false,
      error: 'غير مصرح: المزامنة الذاتية متاحة فقط للحساب الإداري المعتمد والموثق بريده الإلكتروني.'
    });
  }

  try {
    if (tokenResult.uid) {
      const claimsUpdated = await safeSetCustomUserClaims(tokenResult.uid, { admin: true });
      if (!claimsUpdated) {
        return res.status(503).json({
          success: false,
          error: 'تعذر حفظ Custom Claims في Firebase Auth لعدم توفر تفويض Firebase Admin (GOOGLE_APPLICATION_CREDENTIALS).'
        });
      }
      const currentAdmins = getAdminRegistry();
      if (!currentAdmins.includes(tokenResult.uid)) {
        currentAdmins.push(tokenResult.uid);
        saveAdminRegistry(currentAdmins);
      }
    }

    res.json({
      success: true,
      message: 'تم تعيين Custom Claims (admin: true) بنجاح. يرجى تجديد الرمز في الواجهة.',
      uid: tokenResult.uid,
      admin: true
    });
  } catch (err: any) {
    console.error("Error setting custom claims:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// منفذ فحص حالة صلاحيات المشرفة والـ Custom Claims للحساب الحالي
app.get('/api/admin/claims/status', adminRateLimiter, async (req, res) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'رمز المصادقة مطلوب (Bearer Token).' });
  }

  const token = authHeader.substring(7).trim();
  const tokenResult = await verifyFirebaseToken(token);
  if (!tokenResult.valid) {
    return res.status(401).json({ success: false, error: tokenResult.reason || 'الرمز غير صالح.' });
  }

  const adminRegistry = getAdminRegistry();
  const isRegisteredAdmin = !!tokenResult.uid && adminRegistry.includes(tokenResult.uid);

  res.json({
    success: true,
    uid: tokenResult.uid,
    email: tokenResult.email,
    emailVerified: tokenResult.emailVerified,
    isAdminClaim: tokenResult.isAdmin,
    isRegisteredAdmin,
    isRootAdmin: (tokenResult.email || '').toLowerCase() === ADMIN_EMAIL.toLowerCase(),
    claims: tokenResult.claims
  });
});

// منفذ لمنح صلاحيات المشرفة لحساب محدد حصرياً من جهة الخادم
app.post('/api/admin/claims/grant', adminRateLimiter, async (req, res) => {
  const authCheck = await verifyAdminRequest(req);
  if (!authCheck.authorized) {
    return res.status(401).json({ success: false, error: authCheck.reason || 'صلاحية المشرفة مطلوبة لتنفيذ هذا الإجراء.' });
  }

  const { targetUid } = req.body;
  if (!targetUid || typeof targetUid !== 'string') {
    return res.status(400).json({ success: false, error: 'يرجى تقديم معرّف المستخدم المستهدف (targetUid).' });
  }

  try {
    const cleanUid = targetUid.trim();
    const claimsUpdated = await safeSetCustomUserClaims(cleanUid, { admin: true });
    if (!claimsUpdated) {
      return res.status(503).json({
        success: false,
        error: 'تعذر تثبيت صلاحية المشرفة في Firebase Auth لعدم توفر تفويض Firebase Admin (GOOGLE_APPLICATION_CREDENTIALS)؛ لن يتم الاعتماد على السجل المحلي المؤقت.'
      });
    }

    const currentAdmins = getAdminRegistry();
    if (!currentAdmins.includes(cleanUid)) {
      currentAdmins.push(cleanUid);
      saveAdminRegistry(currentAdmins);
    }

    res.json({
      success: true,
      message: `تم منح صلاحية المشرفة (Custom Claim: admin=true) للمستخدم ${cleanUid} بنجاح.`,
      targetUid: cleanUid
    });
  } catch (err: any) {
    console.error("Error granting admin claim:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// منفذ لإلغاء صلاحيات المشرفة عن حساب محدد حصرياً من جهة الخادم
app.post('/api/admin/claims/revoke', adminRateLimiter, async (req, res) => {
  const authCheck = await verifyAdminRequest(req);
  if (!authCheck.authorized) {
    return res.status(401).json({ success: false, error: authCheck.reason || 'صلاحية المشرفة مطلوبة لتنفيذ هذا الإجراء.' });
  }

  const { targetUid } = req.body;
  if (!targetUid || typeof targetUid !== 'string') {
    return res.status(400).json({ success: false, error: 'يرجى تقديم معرّف المستخدم المستهدف (targetUid).' });
  }

  const cleanUid = targetUid.trim();
  try {
    const claimsUpdated = await safeSetCustomUserClaims(cleanUid, { admin: false });
    if (!claimsUpdated) {
      return res.status(503).json({
        success: false,
        error: 'تعذر إلغاء صلاحية المشرفة من Firebase Auth لعدم توفر تفويض Firebase Admin (GOOGLE_APPLICATION_CREDENTIALS).'
      });
    }
    const currentAdmins = getAdminRegistry().filter(id => id !== cleanUid);
    saveAdminRegistry(currentAdmins);

    res.json({
      success: true,
      message: `تم إلغاء صلاحية المشرفة للمستخدم ${cleanUid} بنجاح.`
    });
  } catch (err: any) {
    console.error("Error revoking admin claim:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// =========================================================================
// واجهات الطلاب الآمنة والمحمية من الخادم (Streak, Quiz Grading, Public Stats)
// =========================================================================

// 1. منفذ جلب إحصائيات المنصة العامة دون كشف أي بيانات شخصية للمستخدمين
app.get('/api/public/stats', async (req, res) => {
  try {
    const dbInstance = getDb();
    const coursesSnap = await getDocs(collection(dbInstance, 'courses'));
    const booksSnap = await getDocs(collection(dbInstance, 'course_books'));
    const lecturesSnap = await getDocs(collection(dbInstance, 'course_lectures'));
    
    // عدد الطالبات من وثيقة الإحصائيات أو تقدير أولي آمن دون فحص مستندات المستخدمين
    let studentCount = 150;
    try {
      const statsDoc = await getDoc(doc(dbInstance, 'settings', 'public_stats'));
      if (statsDoc.exists() && statsDoc.data().totalStudents) {
        studentCount = statsDoc.data().totalStudents;
      }
    } catch {
      // fallback
    }

    res.json({
      success: true,
      stats: {
        students: studentCount.toLocaleString('ar-SA'),
        courses: coursesSnap.size.toLocaleString('ar-SA'),
        books: booksSnap.size.toLocaleString('ar-SA'),
        lectures: lecturesSnap.size.toLocaleString('ar-SA')
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'تعذر جلب الإحصائيات العامة.' });
  }
});

// 2. منفذ تسجيل وتثبيت الحضور اليومي (Streak Check-in) المحمي من التزوير
app.post('/api/student/streak/check-in', async (req, res) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'رمز المصادقة مطلوب (Bearer Token).' });
  }

  const token = authHeader.substring(7).trim();
  const tokenResult = await verifyFirebaseToken(token);
  if (!tokenResult.valid || !tokenResult.uid) {
    return res.status(401).json({ success: false, error: tokenResult.reason || 'الرمز غير صالح أو منتهي الصلاحية.' });
  }

  const uid = tokenResult.uid;
  try {
    const dbInstance = getDb();
    const userRef = doc(dbInstance, 'users', uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return res.status(404).json({ success: false, error: 'ملف المستخدم غير موجود.' });
    }

    const userData = userSnap.data();
    // الحصول على تاريخ اليوم الموثوق من الخادم بحسب توقيت مكة المكرمة
    const todayStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Riyadh' }).format(new Date());

    if (userData.lastStreakDate === todayStr) {
      return res.json({
        success: true,
        alreadyRecorded: true,
        streak: userData.streak || 1,
        message: 'همّتكِ مباركة ومثبتة لليوم بالفعل.'
      });
    }

    const currentStreak = userData.streak || 0;
    const nextStreak = currentStreak + 1;

    // تحديث الأيام المتصلة وتاريخ اليوم عبر الخادم
    await updateDoc(userRef, {
      streak: nextStreak,
      lastStreakDate: todayStr
    });

    // تسجيل نشاط الحضور الموثوق
    try {
      const actRef = doc(dbInstance, 'users', uid, 'student_activities', `act-streak-${Date.now()}`);
      await setDoc(actRef, {
        id: actRef.id,
        type: 'streak_milestone',
        title: 'همة الاستمرار والمثابرة',
        description: `أثبتت حضورها المنهجي ليرتفع مؤشر همتها إلى ${nextStreak} يوماً متتالياً!`,
        timestamp: new Date().toISOString()
      });
    } catch {
      // نشاط الحضور اختياري
    }

    res.json({
      success: true,
      alreadyRecorded: false,
      streak: nextStreak,
      message: `تم تثبيت حضوركِ لليوم بنجاح، وارتفعت همتكِ إلى ${nextStreak} يوماً متتالياً.`
    });
  } catch (err: any) {
    console.error("Streak check-in error:", err);
    res.status(500).json({ success: false, error: 'تعذر تثبيت الحضور اليومي.' });
  }
});

// 3. منفذ جلب أسئلة الاختبار دون كشف مفاتيح الإجابات (Sanitized Quiz Questions)
app.get('/api/student/quiz/questions/:lectureId', async (req, res) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'رمز المصادقة مطلوب.' });
  }

  const token = authHeader.substring(7).trim();
  const tokenResult = await verifyFirebaseToken(token);
  if (!tokenResult.valid) {
    return res.status(401).json({ success: false, error: 'غير مصرح.' });
  }

  const { lectureId } = req.params;
  if (!lectureId) {
    return res.status(400).json({ success: false, error: 'معرف المحاضرة مطلوب.' });
  }

  try {
    const dbInstance = getDb();
    const qCol = collection(dbInstance, 'lecture_questions');
    const qSnap = await getDocs(query(qCol, where('lectureId', '==', lectureId)));

    // تصفية الإجابات الصحيحة وإرسال نص السؤال والخيارات والدرجات فقط
    const sanitizedQuestions = qSnap.docs.map(d => {
      const data = d.data();
      return {
        id: d.id,
        lectureId: data.lectureId,
        question: data.question,
        options: data.options || [],
        type: data.type || 'multiple_choice',
        points: data.points || 5,
        order: data.order || 0
      };
    }).sort((a, b) => a.order - b.order);

    res.json({ success: true, questions: sanitizedQuestions });
  } catch (err: any) {
    console.error("Error fetching sanitized questions:", err);
    res.status(500).json({ success: false, error: 'تعذر جلب أسئلة الاختبار.' });
  }
});

const ongoingQuizSubmissions = new Set<string>();

// 4. منفذ تصحيح واعتماد نتائج الاختبارات رسمياً من الخادم مع آلية Idempotency ذرية ودائمة في Firestore
app.post('/api/student/quiz/submit', async (req, res) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'رمز المصادقة مطلوب (Bearer Token).' });
  }

  const token = authHeader.substring(7).trim();
  const tokenResult = await verifyFirebaseToken(token);
  if (!tokenResult.valid || !tokenResult.uid) {
    return res.status(401).json({ success: false, error: tokenResult.reason || 'الرمز غير صالح أو منتهي الصلاحية.' });
  }

  const uid = tokenResult.uid;
  const { lectureId, answers, watchedMinutes, attemptId } = req.body;

  if (!lectureId || typeof lectureId !== 'string') {
    return res.status(400).json({ success: false, error: 'معرف المحاضرة مطلوب (lectureId).' });
  }

  const submittedAnswers = (answers && typeof answers === 'object') ? answers : {};
  const rawAttemptId = typeof attemptId === 'string' ? attemptId.trim() : '';
  
  // معرّف المحاولة: إما مرسل من العميل كـ Idempotency Key فريد، أو مشتق حتمياً من محتوى المحاولة
  const attemptKey = rawAttemptId.length > 0
    ? rawAttemptId.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 100)
    : `hash_${crypto.createHash('sha256').update(`${uid}:${lectureId}:${JSON.stringify(submittedAnswers)}`).digest('hex').substring(0, 24)}`;

  // 1. قفل تزامن سريع في الذاكرة لمنع الضغط المزدوج اللحظي على نفس النسخة (Performance Fast-Path)
  const lockKey = `${uid}:${lectureId}`;
  if (ongoingQuizSubmissions.has(lockKey)) {
    return res.status(429).json({ success: false, error: 'جاري معالجة تسليم سابق لهذا الاختبار، يرجى الانتظار.' });
  }
  ongoingQuizSubmissions.add(lockKey);

  try {
    const dbInstance = getDb();

    // 2. التحقق من وجود المحاضرة
    const lecRef = doc(dbInstance, 'course_lectures', lectureId);
    const lecSnap = await getDoc(lecRef);
    if (!lecSnap.exists()) {
      return res.status(404).json({ success: false, error: 'المحاضرة المطلوبة غير موجودة.' });
    }
    const lectureData = lecSnap.data();

    // 3. جلب الأسئلة الأصلية وحساب النتيجة من جانب الخادم
    const qCol = collection(dbInstance, 'lecture_questions');
    const qSnap = await getDocs(query(qCol, where('lectureId', '==', lectureId)));
    
    let earnedPoints = 0;
    let totalPoints = 0;
    const questions = qSnap.docs.map(d => ({ id: d.id, ...d.data() }));

    if (questions.length > 0) {
      questions.forEach((q: any) => {
        const qWeight = typeof q.points === 'number' && q.points > 0 ? q.points : 5;
        totalPoints += qWeight;
        const studentAns = (submittedAnswers[q.id] || '').trim().toLowerCase();
        const correctAns = (q.correctAnswer || '').trim().toLowerCase();

        if (studentAns && studentAns === correctAns) {
          earnedPoints += qWeight;
        }
      });
    }

    const percentage = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 100;
    const isPassed = percentage >= 60;

    // 4. تنفيذ العملية الذرية الدائمة (Atomic Firestore Transaction & Persistent Idempotency)
    // تضمن عدم تكرار احتساب المحاولة أو كتابة النتيجة أو توليد نشاط عند تعدد نسخ الخادم أو إعادة تشغيله
    const attemptDocRef = doc(dbInstance, 'users', uid, 'quiz_attempts', attemptKey);
    const progressRef = doc(dbInstance, 'users', uid, 'lecture_progress', lectureId);
    const actRef = doc(dbInstance, 'users', uid, 'student_activities', `act_quiz_${attemptKey}`);
    const notifRef = doc(dbInstance, 'users', uid, 'student_notifications', `notif_quiz_${attemptKey}`);

    let transactionResult: any = null;
    try {
      transactionResult = await runTransaction(dbInstance, async (transaction) => {
        // أ) فحص وجود سجل المحاولة مسبقاً في Firestore
        const attemptSnap = await transaction.get(attemptDocRef);
        if (attemptSnap.exists()) {
          const past = attemptSnap.data();
          return {
            isDuplicate: true,
            isPassed: past.isPassed,
            percentage: past.percentage,
            score: past.score,
            totalScore: past.totalScore,
            attemptsCount: past.attemptsCount,
            message: 'تم استلام وتوثيق هذه المحاولة مسبقاً بنجاح (Idempotent Replay Protected).'
          };
        }

        // ب) قراءة التقدم الحالي وحساب عدد المحاولات ذرّياً
        const progressSnap = await transaction.get(progressRef);
        const existingProgress = progressSnap.exists() ? progressSnap.data() : null;

        const attemptsCount = (existingProgress?.attemptsCount || 0) + 1;
        const bestScore = Math.max(existingProgress?.bestScore || 0, percentage);
        const wasAlreadyPassed = existingProgress?.isPassed === true;
        const finalIsPassed = wasAlreadyPassed || isPassed;

        const updatedProgress = {
          id: lectureId,
          lectureId,
          bookId: lectureData.bookId || '',
          courseId: lectureData.courseId || '',
          attemptsCount,
          lastScore: percentage,
          bestScore,
          lastAttemptDate: new Date().toISOString(),
          lastAttemptId: attemptKey,
          isPassed: finalIsPassed,
          isLectureFinished: true,
          lastPlaybackPosition: typeof watchedMinutes === 'number' ? Math.round(watchedMinutes * 60) : (existingProgress?.lastPlaybackPosition || 0)
        };

        const attemptRecord = {
          attemptId: attemptKey,
          uid,
          lectureId,
          percentage,
          score: earnedPoints,
          totalScore: totalPoints,
          isPassed,
          attemptsCount,
          createdAt: new Date().toISOString()
        };

        const activityData = {
          id: `act_quiz_${attemptKey}`,
          type: isPassed ? 'quiz_pass' : 'quiz_fail',
          title: isPassed ? 'اجتياز اختبار قياس تحصيل' : 'محاولة لم تجتز في الاختبار',
          description: isPassed 
            ? `تم اجتياز اختبار المحاضرة "${lectureData.title}" بنجاح وتحقيق معدل ${percentage}% في المحاولة رقم ${attemptsCount}.` 
            : `تم إجراء اختبار المحاضرة "${lectureData.title}" وتحقيق معدل ${percentage}% (درجة النجاح 60%).`,
          timestamp: new Date().toISOString(),
          details: `${percentage}%`
        };

        const notifData = {
          id: `notif_quiz_${attemptKey}`,
          title: isPassed ? 'نجاح واجتياز باهر 🏆' : 'لم يتم اجتياز الاختبار',
          body: isPassed 
            ? `أحسنتِ صنعاً! لقد اجتزتِ اختبار الدرس: "${lectureData.title}" بنسبة ${percentage}%. تم فتح الشروح والدروس اللاحقة لكِ.` 
            : `لقد حققتِ نسبة ${percentage}% في درس "${lectureData.title}". راجعي الدرس بدقة لتحقيق النجاح (60% فما فوق).`,
          type: isPassed ? 'success' : 'alert',
          timestamp: new Date().toISOString(),
          isRead: false
        };

        // ج) الكتابة الذرية الموحدة لجميع الوثائق
        transaction.set(attemptDocRef, attemptRecord);
        transaction.set(progressRef, updatedProgress, { merge: true });
        transaction.set(actRef, activityData);
        transaction.set(notifRef, notifData);

        return {
          isDuplicate: false,
          isPassed,
          percentage,
          score: earnedPoints,
          totalScore: totalPoints,
          attemptsCount,
          message: isPassed ? 'تم اجتياز الاختبار بنجاح واعتماد النتيجة رسمياً!' : 'لم يتم تحقيق نسبة النجاح المطلوبة (60%).'
        };
      });

      // إرجاع استجابة النجاح المكتملة فقط بعد نجاح معاملة Firestore التام
      res.json({
        success: true,
        ...transactionResult
      });
    } catch (txErr: any) {
      console.error("Firestore transaction failure during quiz submit:", txErr);
      return res.status(503).json({
        success: false,
        retryable: true,
        attemptId: attemptKey,
        error: 'تعذر توثيق وحفظ نتيجة الاختبار في قاعدة البيانات حالياً بسبب ضغط مؤقت. يرجى إعادة المحاولة لاعتماد النتيجة رسمياً.',
        retryAfterSeconds: 2
      });
    }
  } catch (err: any) {
    console.error("Quiz submission error:", err);
    res.status(500).json({ success: false, retryable: true, error: 'تعذر تصحيح الاختبار عبر الخادم.' });
  } finally {
    ongoingQuizSubmissions.delete(lockKey);
  }
});

// مجلد المرفقات التراثي (مع الحماية ضد أنظمة الملفات المقيدة أو المؤقتة)
const uploadsDir = path.join(process.cwd(), 'uploads');
try {
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  app.use('/uploads', express.static(uploadsDir));
} catch (uploadsErr) {
  console.warn('Notice: Could not initialize optional local uploads directory:', uploadsErr);
}

// اختبار بسيط للتأكد من وصول الطلبات إلى السيرفر وتخطي الـ SPA fallback
app.get('/api/test-server', (req, res) => {
  res.json({ status: "ok", message: "Express server is fully active!" });
});

// فحص أمني لمنع هجمات تزوير الطلبات من جانب الخادم (SSRF)
function isSafeUrl(targetUrl: string): boolean {
  try {
    const parsed = new URL(targetUrl);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return false;
    }
    const hostname = parsed.hostname.toLowerCase();

    // حظر العناوين المحلية وخوادم السحابة التعريفية
    if (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === '::1' ||
      hostname === '169.254.169.254' ||
      hostname === 'metadata.google.internal' ||
      hostname.endsWith('.internal') ||
      hostname.endsWith('.local') ||
      hostname.endsWith('.localhost')
    ) {
      return false;
    }

    // حظر نطاقات الـ IP الخاصة (Private IP Ranges: 10/8, 172.16/12, 192.168/16, 127/8, 0/8)
    const ipv4Regex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
    const match = hostname.match(ipv4Regex);
    if (match) {
      const octet1 = parseInt(match[1], 10);
      const octet2 = parseInt(match[2], 10);
      if (octet1 === 10) return false;
      if (octet1 === 127) return false;
      if (octet1 === 0) return false;
      if (octet1 === 169 && octet2 === 254) return false;
      if (octet1 === 172 && octet2 >= 16 && octet2 <= 31) return false;
      if (octet1 === 192 && octet2 === 168) return false;
    }

    return true;
  } catch {
    return false;
  }
}

// دالة مساعدة لجلب ملفات الميديا والكتب من خوادم خارجية مع دعم التوجيه التلقائي والحفاظ على ترويسة الـ Range لضمان التوافق الكامل مع هواتف آيفون وسفاري
function streamRemoteUrl(targetUrl: string, reqHeaders: Record<string, any>, res: any, redirectCount = 0) {
  if (redirectCount > 8) {
    console.error(`[MEDIA PROXY] Too many redirects for URL: ${targetUrl}`);
    return res.status(500).send('تم تجاوز الحد الأقصى لإعادة التوجيه (Too many redirects)');
  }

  if (!isSafeUrl(targetUrl)) {
    return res.status(400).send('الرابط المطلوب غير مصرح به لأسباب أمنية');
  }

  try {
    const parsedUrl = new URL(targetUrl);
    const isHttps = parsedUrl.protocol === 'https:';
    const requestClient = isHttps ? https : http;

    const headers: Record<string, string> = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': '*/*'
    };

    // نقل ترويسة الـ Range الهامة جداً لتشغيل الصوت والفيديو على سفاري وآيفون دون انقطاع
    if (reqHeaders['range']) {
      headers['Range'] = reqHeaders['range'];
    }

    const proxyReq = requestClient.get(targetUrl, { headers }, (proxyRes) => {
      const statusCode = proxyRes.statusCode || 200;

      // تتبع إعادة التوجيه التلقائي (مثل روابط Firebase Storage التي توجه إلى Google APIs) مع الحفاظ على ترويسة الـ Range
      if ((statusCode === 301 || statusCode === 302 || statusCode === 303 || statusCode === 307 || statusCode === 308) && proxyRes.headers.location) {
        let redirectUrl = proxyRes.headers.location;
        if (!redirectUrl.startsWith('http')) {
          redirectUrl = new URL(redirectUrl, targetUrl).href;
        }
        if (!isSafeUrl(redirectUrl)) {
          return res.status(400).send('إعادة التوجيه إلى عنوان غير مصرح به أمنياً');
        }
        console.log(`[MEDIA PROXY] Following redirect (${statusCode}) to: ${redirectUrl}`);
        return streamRemoteUrl(redirectUrl, reqHeaders, res, redirectCount + 1);
      }

      // تمرير الترويسات الهامة لدعم الـ Range Requests وطلب الأجزاء (وتُدار ترويسات CORS عبر الوسيط الموحد لـ /api)
      res.setHeader('Content-Type', proxyRes.headers['content-type'] || 'application/octet-stream');
      res.setHeader('Accept-Ranges', 'bytes');

      if (proxyRes.headers['content-length']) {
        res.setHeader('Content-Length', proxyRes.headers['content-length']);
      }
      if (proxyRes.headers['content-range']) {
        res.setHeader('Content-Range', proxyRes.headers['content-range']);
      }

      res.status(statusCode);
      proxyRes.pipe(res);
    });

    proxyReq.on('error', (err) => {
      console.error('[MEDIA PROXY] Native client request error:', err);
      res.status(500).send(`حدث خطأ أثناء جلب ملف الميديا: ${err.message}`);
    });

  } catch (err: any) {
    console.error('[MEDIA PROXY] Native client parsing error:', err);
    res.status(500).send(`حدث خطأ داخلي في السيرفر أثناء معالجة رابط ملف الميديا: ${err.message}`);
  }
}

// بروكسي وسيط فائق الأمان لجلب وعرض ملفات الميديا (صوت، فيديو، PDF) وتخطي قيود الـ CORS مع دعم الـ Range Requests وحماية SSRF وتقييد معدل الطلبات
app.get('/api/proxy-media', mediaProxyRateLimiter, (req, res) => {
  const mediaUrl = req.query.url as string;
  if (!mediaUrl) {
    return res.status(400).send('يرجى تحديد رابط الملف المطلوب (url)');
  }
  if (!isSafeUrl(mediaUrl)) {
    return res.status(400).send('الرابط المطلوب غير مصرح به لأسباب أمنية');
  }

  console.log(`[MEDIA PROXY] Streaming remote media securely: ${mediaUrl}`);
  streamRemoteUrl(mediaUrl, req.headers, res);
});

// دوال مساعدة لحساب واستخراج مدد فيديوهات YouTube بدقة
function parseIsoDuration(iso: string): string {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return '00:00';
  const hours = parseInt(match[1] || '0', 10);
  const minutes = parseInt(match[2] || '0', 10);
  const seconds = parseInt(match[3] || '0', 10);
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function formatSecondsToDuration(sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

function extractDurationFromNode(node: any): string {
  if (!node || typeof node !== 'object') return '00:00';
  if (node.lengthText?.simpleText) return String(node.lengthText.simpleText).trim();
  if (node.lengthText?.runs?.[0]?.text) return String(node.lengthText.runs[0].text).trim();
  if (node.lengthSeconds) {
    const sec = parseInt(node.lengthSeconds, 10);
    if (!isNaN(sec) && sec > 0) return formatSecondsToDuration(sec);
  }
  let found = '';
  const search = (o: any, depth = 0) => {
    if (!o || depth > 8 || found) return;
    if (typeof o === 'string') {
      const s = o.trim();
      // استخراج الوقت بصيغة mm:ss أو hh:mm:ss
      if (/^\d{1,2}:\d{2}(?::\d{2})?$/.test(s)) {
        found = s;
        return;
      }
    } else if (typeof o === 'object') {
      for (const k of Object.keys(o)) {
        if (found) return;
        search(o[k], depth + 1);
      }
    }
  };
  search(node);
  return found || '00:00';
}

async function fetchSingleVideoDuration(videoId: string): Promise<string> {
  return new Promise((resolve) => {
    const req = https.get(`https://www.youtube.com/watch?v=${videoId}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Cookie': 'SOCS=CAESEwgDEgk2OTg5MjAyNTEaAmFyIAEaBgiAsPrWBg; PREF=hl=ar&gl=SA;'
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => {
        data += chunk;
        const durMatch = data.match(/itemprop=\"duration\"\s+content=\"([^\"]+)\"/i);
        if (durMatch && durMatch[1]) {
          req.destroy();
          resolve(parseIsoDuration(durMatch[1]));
        }
      });
      res.on('end', () => {
        const durMatch = data.match(/itemprop=\"duration\"\s+content=\"([^\"]+)\"/i);
        if (durMatch && durMatch[1]) {
          return resolve(parseIsoDuration(durMatch[1]));
        }
        const lenSec = data.match(/\"lengthSeconds\":\"(\d+)\"/);
        if (lenSec && lenSec[1]) {
          const sec = parseInt(lenSec[1], 10);
          return resolve(formatSecondsToDuration(sec));
        }
        resolve('00:00');
      });
    });
    req.on('error', () => resolve('00:00'));
  });
}

// مسار خادم لجلب مدة محاضرة أو فيديو YouTube عند الطلب (محمي بصلاحية المشرفة ومعدل الطلب)
app.get('/api/admin/video-duration', adminRateLimiter, async (req, res) => {
  const authCheck = await verifyAdminRequest(req);
  if (!authCheck.authorized) {
    return res.status(401).json({ success: false, error: authCheck.reason || 'غير مصرح: صلاحية المشرفة مطلوبة للوصول لهذا المسار.' });
  }

  const videoId = req.query.videoId as string;
  if (!videoId || videoId.length !== 11) {
    return res.status(400).json({ success: false, error: 'يرجى تقديم معرّف فيديو YouTube صالح' });
  }
  try {
    const duration = await fetchSingleVideoDuration(videoId);
    res.json({ success: true, videoId, duration });
  } catch (err: any) {
    res.json({ success: false, videoId, duration: '00:00', error: err.message });
  }
});

// مسار خادم آمن لتحليل واستخراج محاضرات قائمة تشغيل يوتيوب (محمي بصلاحية المشرفة ومعدل الطلب)
app.get('/api/admin/youtube-playlist', adminRateLimiter, async (req, res) => {
  const authCheck = await verifyAdminRequest(req);
  if (!authCheck.authorized) {
    return res.status(401).json({ success: false, error: authCheck.reason || 'غير مصرح: صلاحية المشرفة مطلوبة للوصول لهذا المسار.' });
  }
  const playlistUrl = req.query.url as string;
  if (!playlistUrl) {
    return res.status(400).json({ success: false, error: 'يرجى تقديم رابط قائمة التشغيل أو الفيديو (url)' });
  }

  try {
    let playlistId = '';
    // استخراج معرف قائمة التشغيل إن وجد
    const listMatch = playlistUrl.match(/[?&]list=([a-zA-Z0-9_-]+)/);
    if (listMatch && listMatch[1]) {
      playlistId = listMatch[1];
    }

    if (playlistId) {
      console.log(`[YOUTUBE PLAYLIST] Fetching full playlist for ID: ${playlistId}`);
      let items: Array<{ videoId: string; title: string; videoUrl: string; duration?: string }> = [];

      // 1. محاولة جلب صفحة قائمة التشغيل كاملة من يوتيوب مع تجاوز جدار الموافقة واستخراج بيانات ytInitialData
      try {
        const pageHtml = await new Promise<string>((resolve, reject) => {
          https.get(`https://www.youtube.com/playlist?list=${playlistId}`, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
              'Accept-Language': 'ar,en;q=0.9',
              'Cookie': 'SOCS=CAESEwgDEgk2OTg5MjAyNTEaAmFyIAEaBgiAsPrWBg; PREF=hl=ar&gl=SA;'
            }
          }, (response) => {
            if (response.statusCode && response.statusCode >= 400) {
              return reject(new Error(`YouTube returned status ${response.statusCode}`));
            }
            let data = '';
            response.on('data', chunk => data += chunk);
            response.on('end', () => resolve(data));
          }).on('error', reject);
        });

        const initDataIdx = pageHtml.indexOf('ytInitialData = ');
        if (initDataIdx !== -1) {
          const rest = pageHtml.slice(initDataIdx + 'ytInitialData = '.length);
          const endIdx = rest.indexOf(';</script>');
          if (endIdx !== -1) {
            const parsed = JSON.parse(rest.slice(0, endIdx));
            const seen = new Set<string>();

            const traverse = (node: any) => {
              if (!node || typeof node !== 'object') return;

              // واجهة يوتيوب الحديثة (lockupViewModel)
              if (node.lockupViewModel && node.lockupViewModel.contentId) {
                const vid = String(node.lockupViewModel.contentId).trim();
                if (vid.length === 11 && !seen.has(vid)) {
                  seen.add(vid);
                  const title = node.lockupViewModel.metadata?.lockupMetadataViewModel?.title?.content 
                    || node.lockupViewModel.rendererContext?.accessibilityContext?.label 
                    || `محاضرة (${vid})`;
                  const duration = extractDurationFromNode(node.lockupViewModel);
                  items.push({
                    videoId: vid,
                    title: String(title).replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").trim(),
                    videoUrl: `https://www.youtube.com/watch?v=${vid}`,
                    duration
                  });
                }
              }

              // واجهة يوتيوب الكلاسيكية (playlistVideoRenderer)
              if (node.playlistVideoRenderer && node.playlistVideoRenderer.videoId) {
                const vid = String(node.playlistVideoRenderer.videoId).trim();
                if (vid.length === 11 && !seen.has(vid)) {
                  seen.add(vid);
                  const title = node.playlistVideoRenderer.title?.runs?.[0]?.text 
                    || node.playlistVideoRenderer.title?.simpleText 
                    || `محاضرة (${vid})`;
                  const duration = extractDurationFromNode(node.playlistVideoRenderer);
                  items.push({
                    videoId: vid,
                    title: String(title).replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").trim(),
                    videoUrl: `https://www.youtube.com/watch?v=${vid}`,
                    duration
                  });
                }
              }

              if (Array.isArray(node)) {
                for (const elem of node) traverse(elem);
              } else {
                for (const k of Object.keys(node)) traverse(node[k]);
              }
            };

            traverse(parsed);
            console.log(`[YOUTUBE PLAYLIST] Successfully extracted ${items.length} lectures via HTML parser!`);
          }
        }
      } catch (htmlErr: any) {
        console.warn(`[YOUTUBE PLAYLIST] HTML parser notice: ${htmlErr.message}. Falling back to RSS feed.`);
      }

      // 2. إذا لم نتمكن من استخراج عناصر كافية من صفحة HTML، نستخدم تغذية RSS كخيار بديل موثوق
      if (items.length === 0) {
        console.log(`[YOUTUBE PLAYLIST] Using fallback RSS feed for playlist ID: ${playlistId}`);
        const feedUrl = `https://www.youtube.com/feeds/videos.xml?playlist_id=${playlistId}`;
        const xmlData = await new Promise<string>((resolve, reject) => {
          https.get(feedUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
          }, (response) => {
            if (response.statusCode && response.statusCode >= 400) {
              return reject(new Error(`YouTube RSS returned status ${response.statusCode}`));
            }
            let data = '';
            response.on('data', chunk => data += chunk);
            response.on('end', () => resolve(data));
          }).on('error', reject);
        });

        const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
        let entryMatch;

        while ((entryMatch = entryRegex.exec(xmlData)) !== null) {
          const entryContent = entryMatch[1];
          const idMatch = entryContent.match(/<yt:videoId>(.*?)<\/yt:videoId>/);
          const titleMatch = entryContent.match(/<title>(.*?)<\/title>/);

          if (idMatch && idMatch[1] && titleMatch && titleMatch[1]) {
            const videoId = idMatch[1].trim();
            let title = titleMatch[1].trim();
            title = title
              .replace(/&amp;/g, '&')
              .replace(/&lt;/g, '<')
              .replace(/&gt;/g, '>')
              .replace(/&quot;/g, '"')
              .replace(/&#39;/g, "'");

            items.push({
              videoId,
              title,
              videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
              duration: '00:00'
            });
          }
        }
      }

      if (items.length > 0) {
        return res.json({
          success: true,
          playlistId,
          type: 'playlist',
          count: items.length,
          items
        });
      }
    }

    // فحص ما إذا كان الرابط هو فيديو يوتيوب فردي
    const videoIdMatch = playlistUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([a-zA-Z0-9_-]{11})/);
    if (videoIdMatch && videoIdMatch[1]) {
      const videoId = videoIdMatch[1];
      let title = `محاضرة مرئية (${videoId})`;
      let duration = '00:00';
      try {
        const [oembedTitle, realDuration] = await Promise.all([
          new Promise<string>((resolve) => {
            https.get(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`, {
              headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
            }, (response) => {
              let data = '';
              response.on('data', chunk => data += chunk);
              response.on('end', () => {
                try {
                  const p = JSON.parse(data);
                  resolve(p.title || `محاضرة مرئية (${videoId})`);
                } catch {
                  resolve(`محاضرة مرئية (${videoId})`);
                }
              });
            }).on('error', () => resolve(`محاضرة مرئية (${videoId})`));
          }),
          fetchSingleVideoDuration(videoId)
        ]);

        title = oembedTitle;
        duration = realDuration;
      } catch (videoErr) {
        console.warn("Notice: video metadata fetch notice:", videoErr);
      }

      return res.json({
        success: true,
        type: 'single_video',
        count: 1,
        items: [{
          videoId,
          title: title.trim(),
          videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
          duration
        }]
      });
    }

    return res.status(400).json({
      success: false,
      error: 'لم نتمكن من العثور على قائمة تشغيل أو فيديو صالح من الرابط المدخل. يرجى التأكد من رابط YouTube.'
    });
  } catch (err: any) {
    console.error('[YOUTUBE PLAYLIST PARSER ERROR]', err);
    return res.status(500).json({
      success: false,
      error: `تعذر جلب تفاصيل قائمة التشغيل من يوتيوب: ${err.message}`
    });
  }
});

// دالة مساعدة لتصحيح وتأمين الروابط دون فرض نطاق GitHub Pages الثابت للتأكد من عمل المرفقات ديناميكياً
function fixUrl(url: any): string | null {
  if (typeof url !== 'string' || !url) return null;
  const clean = url.trim();
  if (!clean) return null;
  
  // إذا كان رابط الـ Firebase Storage، نتركه كما هو
  if (clean.includes('firebasestorage.googleapis.com')) {
    return clean;
  }
  
  // إذا كان الرابط يبدأ بـ http/https كامل
  if (clean.startsWith('http://') || clean.startsWith('https://')) {
    // إذا كان يحتوي على موقع GitHub Pages القديم، نقوم بتحويله لمسار نسبي محلي ليعمل على النطاق الحالي
    if (clean.includes('rhos14.github.io/talib-al3lm')) {
      const idx = clean.indexOf('/uploads/');
      if (idx !== -1) {
        return clean.substring(idx);
      }
    }
    return clean;
  }
  
  // إذا كان الرابط مساراً نسبياً يبدأ بـ /uploads/
  if (clean.startsWith('/uploads/')) {
    return clean;
  }
  // إذا كان يبدأ بـ uploads/ دون شرطة مائلة
  if (clean.startsWith('uploads/')) {
    return `/${clean}`;
  }
  // إذا كان يبدأ بـ ../uploads/
  if (clean.startsWith('../uploads/')) {
    return `/uploads/${clean.substring(11)}`;
  }
  // إذا كان يحتوي على مجلد الرفع في مساره
  if (clean.includes('/uploads/')) {
    const idx = clean.indexOf('/uploads/');
    return clean.substring(idx);
  }
  
  return clean;
}

// دالة الفحص الذاتي وتصحيح قاعدة البيانات لإزالة أي روابط تالفة أو تشير لموقع الويب الحالي
async function repairDatabase() {
  console.log("[DB REPAIR] بدء فحص وتطهير قاعدة البيانات وتحويل الروابط لروابط مطلقة...");
  try {
    const db = getDb();
    
    // 1. تصحيح كوليكشن الكتب (course_books)
    const booksCol = collection(db, 'course_books');
    const booksSnap = await getDocs(booksCol);
    console.log(`[DB REPAIR] تم العثور على ${booksSnap.size} كتاب في Firestore.`);
    
    for (const d of booksSnap.docs) {
      const data = d.data();
      let changed = false;
      const updateData: Record<string, any> = {};
      
      if (data.pdfUrl) {
        const fixed = fixUrl(data.pdfUrl);
        if (fixed !== data.pdfUrl) {
          console.log(`[DB REPAIR] تصحيح رابط كتاب ${d.id} من "${data.pdfUrl}" إلى "${fixed}"`);
          updateData.pdfUrl = fixed;
          if (!fixed) {
            updateData.pdfSize = null;
            updateData.pdfPageCount = null;
          }
          changed = true;
        }
      }
      
      if (changed) {
        await updateDoc(doc(db, 'course_books', d.id), updateData);
        console.log(`[DB REPAIR] تم تحديث بيانات الكتاب ${d.id} بنجاح.`);
      }
    }
    
    // 2. تصحيح كوليكشن المحاضرات (course_lectures)
    const lecsCol = collection(db, 'course_lectures');
    const lecsSnap = await getDocs(lecsCol);
    console.log(`[DB REPAIR] تم العثور على ${lecsSnap.size} محاضرة في Firestore.`);
    
    for (const d of lecsSnap.docs) {
      const data = d.data();
      let changed = false;
      const updateData: Record<string, any> = {};
      
      // pdfUrl
      if (data.pdfUrl) {
        const fixed = fixUrl(data.pdfUrl);
        if (fixed !== data.pdfUrl) {
          console.log(`[DB REPAIR] تصحيح رابط PDF محاضرة ${d.id} من "${data.pdfUrl}" إلى "${fixed}"`);
          updateData.pdfUrl = fixed;
          changed = true;
        }
      }
      
      // audioUrl
      if (data.audioUrl) {
        const fixed = fixUrl(data.audioUrl);
        if (fixed !== data.audioUrl) {
          console.log(`[DB REPAIR] تصحيح رابط صوت محاضرة ${d.id} من "${data.audioUrl}" إلى "${fixed}"`);
          updateData.audioUrl = fixed;
          changed = true;
        }
      }
 
      // videoUrl
      if (data.videoUrl) {
        const fixed = fixUrl(data.videoUrl);
        if (fixed !== data.videoUrl) {
          console.log(`[DB REPAIR] تصحيح رابط فيديو محاضرة ${d.id} من "${data.videoUrl}" إلى "${fixed}"`);
          updateData.videoUrl = fixed;
          changed = true;
        }
      }
      
      if (changed) {
        await updateDoc(doc(db, 'course_lectures', d.id), updateData);
        console.log(`[DB REPAIR] تم تحديث بيانات المحاضرة ${d.id} بنجاح.`);
      }
    }
    
    console.log("[DB REPAIR] تم الانتهاء من فحص وتطهير قاعدة البيانات بالكامل وبنجاح!");
  } catch (err) {
    console.error("[DB REPAIR] خطأ فادح أثناء فحص قاعدة البيانات:", err);
  }
}

// منفذ محمي لتطهير وصيانة قاعدة البيانات (محمي بصلاحية المشرفة حصراً وتقييد معدل الطلبات)
app.all('/api/repair-db', repairDbRateLimiter, async (req, res) => {
  const authCheck = await verifyAdminRequest(req);
  if (!authCheck.authorized) {
    return res.status(401).json({
      success: false,
      error: authCheck.reason || 'غير مصرح: عملية تطهير وصيانة قاعدة البيانات تتطلب صلاحية المشرفة حصراً.'
    });
  }

  console.log(`[API REPAIR-DB] طلب مصرح لتطهير قاعدة البيانات من: ${authCheck.userEmail}`);
  try {
    await repairDatabase();
    res.json({ 
      success: true, 
      message: "تم فحص وتطهير قاعدة البيانات بنجاح بواسطة المشرفة المصرح لها." 
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// =========================================================================
// واجهات الاستيراد الذكي لأسئلة NotebookLM وحفظها تلقائياً (المرحلة الثانية)
// =========================================================================

// منفذ للتحقق من هوية المشرف ومفتاح الربط للأتمتة الخارجية (محمي بمعدل الطلب)
app.get('/api/import/verify', importRateLimiter, async (req, res) => {
  const authCheck = await verifyAdminRequest(req);
  if (!authCheck.authorized) {
    return res.status(401).json({
      success: false,
      error: authCheck.reason || 'المفتاح غير صالح أو غير مصرح به.'
    });
  }
  res.json({
    success: true,
    message: 'الاتصال مصرح به وصالح للأتمتة المحلية بواسطة Playwright أو NotebookLM.',
    authorizedUser: authCheck.userEmail || ADMIN_EMAIL
  });
});


// المسار الخادم الآمن لاستقبال أسئلة المحاضرات من NotebookLM وحفظها تلقائياً (محمي بمعدل الطلب)
app.post('/api/import/questions', importRateLimiter, async (req, res) => {
  // 1. التحقق من الهوية والصلاحية
  const authCheck = await verifyAdminRequest(req);
  if (!authCheck.authorized) {
    return res.status(401).json({
      success: false,
      error: authCheck.reason || 'طلب غير مصرح به. صلاحية المشرف مطلوبة.'
    });
  }

  const { courseId, bookId, lectureId, taskId, questions } = req.body;

  // 2. التحقق من صحة المعرفات الأساسية
  if (!courseId || typeof courseId !== 'string' || !bookId || typeof bookId !== 'string' || !lectureId || typeof lectureId !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'بيانات غير مكتملة: يجب تقديم معرّف الدورة (courseId) ومعرّف الكتاب (bookId) ومعرّف المحاضرة (lectureId) كنصوص صالحة.'
    });
  }

  // 3. التحقق من صحة مصفوفة الأسئلة
  if (!Array.isArray(questions) || questions.length === 0) {
    return res.status(400).json({
      success: false,
      error: 'حقل الأسئلة (questions) يجب أن يكون مصفوفة غير فارغة تحتوي على أسئلة الاختبار.'
    });
  }

  const db = getDb();

  // 4. التحقق الصارم من وجود المحاضرة والكتاب والدورة وصحة العلاقة الهرمية بينها
  try {
    const cleanLectureId = lectureId.trim();
    const cleanBookId = bookId.trim();
    const cleanCourseId = courseId.trim();

    const lectureRef = doc(db, 'course_lectures', cleanLectureId);
    const lectureSnap = await getDoc(lectureRef);
    if (!lectureSnap.exists()) {
      return res.status(404).json({
        success: false,
        error: `المحاضرة المحددة (${cleanLectureId}) غير موجودة في قاعدة بيانات الموقع.`
      });
    }
    const lectureData = lectureSnap.data();

    // التحقق من تبعية المحاضرة للكتاب والدورة
    if (lectureData.bookId !== cleanBookId || lectureData.courseId !== cleanCourseId) {
      return res.status(400).json({
        success: false,
        error: `عدم تطابق هرمي: المحاضرة مسجلة في قاعدة البيانات بالكتاب (${lectureData.bookId}) والدورة (${lectureData.courseId}) بينما الطلب يحتوي على الكتاب (${cleanBookId}) والدورة (${cleanCourseId}).`
      });
    }

    const bookRef = doc(db, 'course_books', cleanBookId);
    const bookSnap = await getDoc(bookRef);
    if (!bookSnap.exists()) {
      return res.status(404).json({
        success: false,
        error: `الكتاب المحدد (${cleanBookId}) غير موجود في قاعدة بيانات الموقع.`
      });
    }
    const bookData = bookSnap.data();
    if (bookData.courseId !== cleanCourseId) {
      return res.status(400).json({
        success: false,
        error: `عدم تطابق هرمي: الكتاب (${cleanBookId}) غير تابع للدورة (${cleanCourseId}).`
      });
    }

    const courseRef = doc(db, 'courses', cleanCourseId);
    const courseSnap = await getDoc(courseRef);
    if (!courseSnap.exists()) {
      return res.status(404).json({
        success: false,
        error: `الدورة المحددة (${cleanCourseId}) غير موجودة في قاعدة بيانات الموقع.`
      });
    }

    // 5. التحقق الصارم من بنية ونوع كل سؤال
    const validatedQuestions: Array<{
      type: 'multiple_choice' | 'true_false' | 'short_answer';
      question: string;
      options?: string[];
      correctAnswer: string;
      points: number;
      order: number;
    }> = [];

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const qIndex = i + 1;

      if (!q || typeof q !== 'object') {
        return res.status(400).json({
          success: false,
          error: `السؤال رقم ${qIndex} غير صالح (يجب أن يكون كائناً JSON).`
        });
      }

      if (!q.question || typeof q.question !== 'string' || q.question.trim().length < 3) {
        return res.status(400).json({
          success: false,
          error: `السؤال رقم ${qIndex}: نص السؤال (question) مطلوب ويجب ألا يقل عن 3 أحرف.`
        });
      }

      const qType = q.type;
      if (qType !== 'multiple_choice' && qType !== 'true_false' && qType !== 'short_answer') {
        return res.status(400).json({
          success: false,
          error: `السؤال رقم ${qIndex}: نوع السؤال (${qType}) غير مدعوم. الأنواع المقبولة هي: multiple_choice, true_false, short_answer.`
        });
      }

      let parsedCorrectAnswer = (q.correctAnswer !== undefined && q.correctAnswer !== null) ? String(q.correctAnswer).trim() : '';
      let parsedOptions: string[] | undefined = undefined;

      if (qType === 'multiple_choice') {
        if (!Array.isArray(q.options) || q.options.length < 2) {
          return res.status(400).json({
            success: false,
            error: `السؤال رقم ${qIndex} (اختيار من متعدد): يتطلب مصفوفة خيارات (options) تحتوي على خيارين على الأقل.`
          });
        }
        parsedOptions = q.options.map((opt: any) => String(opt || '').trim()).filter((opt: string) => opt.length > 0);
        if (parsedOptions.length < 2) {
          return res.status(400).json({
            success: false,
            error: `السؤال رقم ${qIndex} (اختيار من متعدد): يحتوي على خيارات فارغة. يجب توفير خيارين صالحين على الأقل.`
          });
        }
        // التحقق من وجود الإجابة الصحيحة ضمن الخيارات
        const answerExistsInOptions = parsedOptions.some(opt => opt.toLowerCase() === parsedCorrectAnswer.toLowerCase());
        if (!parsedCorrectAnswer || !answerExistsInOptions) {
          return res.status(400).json({
            success: false,
            error: `السؤال رقم ${qIndex} (اختيار من متعدد): الإجابة الصحيحة ("${parsedCorrectAnswer}") غير مطابقة لأي من الخيارات المتاحة (${parsedOptions.join(', ')}).`
          });
        }
      } else if (qType === 'true_false') {
        // تطبيع إجابة صح وخطأ لتتوافق تماماً مع نظام الاختبارات (Lectures.tsx) الذي يتوقع "true" أو "false"
        const lowerAns = parsedCorrectAnswer.toLowerCase();
        if (['true', 'صح', 'صواب', 'نعم', '1'].includes(lowerAns)) {
          parsedCorrectAnswer = 'true';
        } else if (['false', 'خطأ', 'خاطئ', 'لا', '0'].includes(lowerAns)) {
          parsedCorrectAnswer = 'false';
        } else {
          return res.status(400).json({
            success: false,
            error: `السؤال رقم ${qIndex} (صح أو خطأ): الإجابة الصحيحة يجب أن تكون "true" أو "false" (أو صح/خطأ). القيمة الحالية: "${parsedCorrectAnswer}".`
          });
        }
      } else if (qType === 'short_answer') {
        if (!parsedCorrectAnswer) {
          return res.status(400).json({
            success: false,
            error: `السؤال رقم ${qIndex} (إجابة قصيرة): حقل الإجابة الصحيحة (correctAnswer) مطلوب.`
          });
        }
      }

      const points = typeof q.points === 'number' && q.points > 0 ? q.points : 5;
      const order = typeof q.order === 'number' && q.order >= 0 ? q.order : qIndex;

      validatedQuestions.push({
        type: qType,
        question: q.question.trim(),
        options: parsedOptions,
        correctAnswer: parsedCorrectAnswer,
        points,
        order
      });
    }

    // 6. التحقق من الأسئلة الموجودة مسبقاً لمنع التكرار (Deduplication)
    const existingQuestionsSnap = await getDocs(
      query(collection(db, 'lecture_questions'), where('lectureId', '==', cleanLectureId))
    );

    const existingQuestions = existingQuestionsSnap.docs.map(d => ({ id: d.id, ...d.data() } as any));
    const normalize = (text: string) => text.trim().replace(/\s+/g, ' ').replace(/[؟?]/g, '').toLowerCase();
    const existingTexts = new Set(existingQuestions.map(eq => normalize(eq.question || '')));

    let maxOrder = existingQuestions.reduce((max, eq) => Math.max(max, eq.order || 0), 0);

    const questionsToInsert: any[] = [];
    let duplicateCount = 0;

    for (const vq of validatedQuestions) {
      const norm = normalize(vq.question);
      if (existingTexts.has(norm)) {
        duplicateCount++;
        continue;
      }
      existingTexts.add(norm);
      maxOrder += 1;

      const questionId = `q_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      const newQuestionRecord = {
        id: questionId,
        lectureId: cleanLectureId,
        bookId: cleanBookId,
        courseId: cleanCourseId,
        type: vq.type,
        question: vq.question,
        options: vq.options,
        correctAnswer: vq.correctAnswer,
        points: vq.points,
        order: vq.order || maxOrder,
        createdAt: new Date().toISOString()
      };
      questionsToInsert.push(newQuestionRecord);
    }

    // 7. الحفظ الفعلي في Firebase Firestore (مجموعة lecture_questions)
    for (const newQ of questionsToInsert) {
      await setDoc(doc(db, 'lecture_questions', newQ.id), newQ);
    }

    const totalQuestionsNowInLecture = existingQuestions.length + questionsToInsert.length;

    // 8. تحديث حالة اختبار المحاضرة في مهمة الاستيراد (lecture_import_tasks)
    let updatedTasksCount = 0;
    try {
      const tasksSnap = await getDocs(collection(db, 'lecture_import_tasks'));
      for (const tDoc of tasksSnap.docs) {
        const taskData = tDoc.data();
        let taskModified = false;
        const items = taskData.items || [];

        const updatedItems = items.map((item: any) => {
          const isTarget = item.importedLectureId === cleanLectureId || 
                           item.existingLectureId === cleanLectureId || 
                           (taskId && tDoc.id === taskId.trim());

          if (isTarget) {
            taskModified = true;
            return {
              ...item,
              quizStatus: 'generated',
              quizQuestionsCount: totalQuestionsNowInLecture
            };
          }
          return item;
        });

        if (taskModified) {
          const allCompletedQuizzes = updatedItems
            .filter((it: any) => it.status === 'completed')
            .every((it: any) => it.quizStatus === 'generated');

          await updateDoc(doc(db, 'lecture_import_tasks', tDoc.id), {
            items: updatedItems,
            notebookLmReady: allCompletedQuizzes,
            updatedAt: new Date().toISOString()
          });
          updatedTasksCount++;
        }
      }
    } catch (taskUpdateErr) {
      console.warn("Notice: could not update import task quiz status:", taskUpdateErr);
    }

    return res.json({
      success: true,
      message: questionsToInsert.length > 0 
        ? `تم حفظ ${questionsToInsert.length} سؤال بنجاح في اختبار المحاضرة.` 
        : 'تم فحص الأسئلة: جميع الأسئلة مرسلة وموجودة مسبقاً (تم منع التكرار).',
      lectureId: cleanLectureId,
      totalReceived: validatedQuestions.length,
      savedCount: questionsToInsert.length,
      skippedDuplicates: duplicateCount,
      totalQuestionsInLecture: totalQuestionsNowInLecture,
      quizStatus: 'generated',
      savedQuestions: questionsToInsert.map(q => ({
        id: q.id,
        type: q.type,
        question: q.question,
        points: q.points,
        order: q.order
      }))
    });

  } catch (dbErr: any) {
    console.error("[IMPORT QUESTIONS ERROR]", dbErr);
    return res.status(500).json({
      success: false,
      error: `حدث خطأ أثناء معالجة وحفظ أسئلة الاختبار: ${dbErr.message}`
    });
  }
});

// =========================================================================
// واجهات ImageKit الآمنة من الخادم حصراً (رفع الصور والتحقق من الملكية والحذف)
// =========================================================================
const IMAGEKIT_URL_ENDPOINT = (
  process.env.IMAGEKIT_URL_ENDPOINT || 'https://ik.imagekit.io/fvxlchn3o'
).replace(/\/+$/, '');
const IMAGEKIT_UPLOAD_API_URL = 'https://upload.imagekit.io/api/v1/files/upload';
const IMAGEKIT_FILES_API_URL = 'https://api.imagekit.io/v1/files';
const IMAGEKIT_AVATAR_MAX_BYTES = 5 * 1024 * 1024; // 5MB
const IMAGEKIT_COVER_MAX_BYTES = 10 * 1024 * 1024; // 10MB
const IMAGEKIT_ROOT_FOLDER = '/talaba-elm';

const imageMediaRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 25,
  message: 'تم تجاوز الحد المسموح به لطلبات رفع أو حذف الصور مؤقتاً. يرجى الانتظار قليلاً.'
});

type ImageUploadPurpose = 'avatar' | 'course_cover' | 'book_cover';

interface DetectedImageFormat {
  format: 'jpeg' | 'png' | 'webp';
  mime: 'image/jpeg' | 'image/png' | 'image/webp';
  ext: 'jpg' | 'png' | 'webp';
}

function getImageKitPrivateKey(): string | null {
  const raw = (process.env.IMAGEKIT_PRIVATE_KEY || '').trim();
  if (!raw || raw === 'MY_IMAGEKIT_PRIVATE_KEY_SERVER_ONLY') {
    return null;
  }
  return raw;
}

function buildImageKitBasicAuthHeader(privateKey: string): string {
  return `Basic ${Buffer.from(`${privateKey}:`).toString('base64')}`;
}

function detectImageFormatFromBuffer(buf: Buffer): DetectedImageFormat | null {
  if (!Buffer.isBuffer(buf) || buf.length < 12) return null;

  const headText = buf
    .subarray(0, Math.min(buf.length, 256))
    .toString('utf8')
    .trimStart()
    .toLowerCase();
  if (
    headText.startsWith('<svg') ||
    headText.startsWith('<!doctype') ||
    headText.startsWith('<html') ||
    headText.startsWith('<?xml') ||
    headText.startsWith('<script')
  ) {
    return null;
  }

  // JPEG magic bytes: FF D8 FF
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) {
    return { format: 'jpeg', mime: 'image/jpeg', ext: 'jpg' };
  }

  // PNG magic bytes: 89 50 4E 47 0D 0A 1A 0A
  if (
    buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
  ) {
    return { format: 'png', mime: 'image/png', ext: 'png' };
  }

  // WebP magic bytes: RIFF....WEBP
  if (
    buf.subarray(0, 4).toString('ascii') === 'RIFF' &&
    buf.subarray(8, 12).toString('ascii') === 'WEBP'
  ) {
    return { format: 'webp', mime: 'image/webp', ext: 'webp' };
  }

  return null;
}

function isSafeUidSegment(uid?: string): uid is string {
  return Boolean(uid && /^[a-zA-Z0-9_-]{3,128}$/.test(uid));
}

function parseImagePurpose(raw: unknown): ImageUploadPurpose | null {
  const val = String(raw || '').trim();
  if (val === 'avatar' || val === 'course_cover' || val === 'book_cover') {
    return val;
  }
  return null;
}

function resolveAuthoritativeImagePolicy(
  purpose: ImageUploadPurpose,
  uid: string
): { folder: string; maxBytes: number; isAdminOnly: boolean } {
  if (purpose === 'avatar') {
    return {
      folder: `${IMAGEKIT_ROOT_FOLDER}/user_avatars/${uid}`,
      maxBytes: IMAGEKIT_AVATAR_MAX_BYTES,
      isAdminOnly: false,
    };
  }
  if (purpose === 'course_cover') {
    return {
      folder: `${IMAGEKIT_ROOT_FOLDER}/course_covers`,
      maxBytes: IMAGEKIT_COVER_MAX_BYTES,
      isAdminOnly: true,
    };
  }
  return {
    folder: `${IMAGEKIT_ROOT_FOLDER}/book_covers`,
    maxBytes: IMAGEKIT_COVER_MAX_BYTES,
    isAdminOnly: true,
  };
}

// نقطة رفع الصور الآمنة عبر الخادم إلى ImageKit مع فرض الصلاحيات والمسارات وفحص البصمة الحقيقية للملف
app.post(
  '/api/images/upload',
  imageMediaRateLimiter,
  express.raw({ type: '*/*', limit: '11mb' }),
  async (req, res) => {
    const purpose = parseImagePurpose(req.query.purpose || req.headers['x-image-purpose']);
    if (!purpose) {
      return res.status(400).json({
        success: false,
        code: 'imagekit/invalid-purpose',
        error: 'غرض رفع الصورة غير صالح. القيم المسموحة: avatar، course_cover، book_cover.'
      });
    }

    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        code: 'auth/unauthenticated',
        error: 'يجب تسجيل الدخول أولاً قبل رفع الصور.'
      });
    }

    const token = authHeader.substring(7).trim();
    const tokenResult = await verifyFirebaseToken(token);
    if (!tokenResult.valid || !tokenResult.uid) {
      return res.status(401).json({
        success: false,
        code: 'auth/invalid-token',
        error: tokenResult.reason || 'جلسة الدخول غير صالحة أو منتهية الصلاحية.'
      });
    }

    if (tokenResult.isAnonymous) {
      return res.status(403).json({
        success: false,
        code: 'auth/anonymous-forbidden',
        error: 'حساب الزائر لا يملك صلاحية رفع الصور.'
      });
    }

    // رفض أي محاولة من العميل لفرض UID آخر أو تجاوز المجلد المفروض خادمياً
    const requestedTargetUid = String(
      req.query.targetUid || req.query.uid || req.headers['x-target-uid'] || ''
    ).trim();
    if (requestedTargetUid && requestedTargetUid !== tokenResult.uid) {
      return res.status(403).json({
        success: false,
        code: 'auth/cross-user-forbidden',
        error: 'غير مصرح: لا يمكنك استهداف مجلد مستخدم آخر.'
      });
    }

    const requestedFolder = String(
      req.query.folder || req.headers['x-upload-folder'] || ''
    ).trim();
    if (requestedFolder) {
      return res.status(403).json({
        success: false,
        code: 'auth/folder-override-forbidden',
        error: 'غير مصرح للعميل بتحديد أو تغيير مجلد التخزين.'
      });
    }

    if (!isSafeUidSegment(tokenResult.uid)) {
      return res.status(400).json({
        success: false,
        code: 'auth/invalid-uid',
        error: 'معرّف المستخدم غير صالح.'
      });
    }

    const policy = resolveAuthoritativeImagePolicy(purpose, tokenResult.uid);

    if (policy.isAdminOnly) {
      const adminCheck = await verifyAdminRequest(req);
      if (!adminCheck.authorized) {
        return res.status(403).json({
          success: false,
          code: 'auth/admin-required',
          error: adminCheck.reason || 'غير مصرح: رفع أغلفة الدورات والكتب محصور بالمشرفة المخولة فقط.'
        });
      }
    }

    const fileBuffer = Buffer.isBuffer(req.body) ? req.body : Buffer.alloc(0);
    if (fileBuffer.length === 0) {
      return res.status(400).json({
        success: false,
        code: 'validation/empty-file',
        error: 'ملف الصورة فارغ أو لم تصل بيانات الملف.'
      });
    }

    if (fileBuffer.length > policy.maxBytes) {
      const maxMb = Math.round(policy.maxBytes / (1024 * 1024));
      return res.status(413).json({
        success: false,
        code: 'validation/file-too-large',
        error: `حجم الصورة يتجاوز الحد الأقصى المسموح (${maxMb} ميجابايت).`
      });
    }

    // التحقق الفعلي من التوقيع الثنائي (Magic Bytes) للصورة وليس الامتداد أو Content-Type فقط
    const detected = detectImageFormatFromBuffer(fileBuffer);
    if (!detected) {
      return res.status(415).json({
        success: false,
        code: 'validation/invalid-image-signature',
        error: 'محتوى الملف الفعلي ليس صورة صالحة. الصيغ المدعومة فقط: JPG، JPEG، PNG، WebP.'
      });
    }

    const privateKey = getImageKitPrivateKey();
    if (!privateKey) {
      return res.status(503).json({
        success: false,
        code: 'imagekit/not-configured',
        error: 'خدمة رفع الصور (ImageKit) غير مهيأة على الخادم بعد: متغير البيئة السري IMAGEKIT_PRIVATE_KEY مفقود.'
      });
    }

    const abortController = new AbortController();
    const timeoutId = setTimeout(() => abortController.abort(), 30000);
    const onClientClose = () => {
      if (!res.writableEnded) {
        abortController.abort();
      }
    };
    res.on('close', onClientClose);

    try {
      const safeFileName = `${purpose}_${Date.now()}_${crypto.randomBytes(6).toString('hex')}.${detected.ext}`;
      const formData = new FormData();
      formData.append('file', new Blob([fileBuffer], { type: detected.mime }), safeFileName);
      formData.append('fileName', safeFileName);
      formData.append('folder', policy.folder);
      formData.append('useUniqueFileName', 'false');

      const ikRes = await fetch(IMAGEKIT_UPLOAD_API_URL, {
        method: 'POST',
        headers: {
          Authorization: buildImageKitBasicAuthHeader(privateKey),
        },
        body: formData,
        signal: abortController.signal,
      });

      const rawText = await ikRes.text();
      let ikJson: any = null;
      try {
        ikJson = JSON.parse(rawText);
      } catch {
        ikJson = null;
      }

      if (!ikRes.ok || !ikJson?.url || !ikJson?.fileId) {
        const providerMsg = ikJson?.message || `فشل خادم الصور بالاستجابة (${ikRes.status}).`;
        return res.status(ikRes.status >= 400 && ikRes.status < 500 ? ikRes.status : 502).json({
          success: false,
          code: 'imagekit/upload-failed',
          error: providerMsg,
        });
      }

      const returnedUrl = String(ikJson.url).trim();
      const returnedFileId = String(ikJson.fileId).trim();
      const returnedPath = String(ikJson.filePath || '').trim();

      if (!returnedUrl.startsWith(IMAGEKIT_URL_ENDPOINT)) {
        return res.status(502).json({
          success: false,
          code: 'imagekit/unexpected-endpoint',
          error: 'الرابط العائد من خدمة الصور لا يطابق نطاق المنصة المعتمد.'
        });
      }

      return res.json({
        success: true,
        url: returnedUrl,
        fileId: returnedFileId,
        filePath: returnedPath,
        size: typeof ikJson.size === 'number' ? ikJson.size : fileBuffer.length,
        format: detected.format,
      });
    } catch (uploadErr: any) {
      if (abortController.signal.aborted) {
        return res.status(499).json({
          success: false,
          code: 'imagekit/canceled',
          error: 'تم إلغاء عملية رفع الصورة أو انتهت مهلة الاتصال بالخادم.'
        });
      }
      console.error('[IMAGEKIT UPLOAD ERROR]:', uploadErr?.message || 'Upload error');
      return res.status(502).json({
        success: false,
        code: 'imagekit/network-error',
        error: 'تعذر الاتصال بخدمة ImageKit لإتمام رفع الصورة.'
      });
    } finally {
      clearTimeout(timeoutId);
      res.off('close', onClientClose);
    }
  }
);

// نقطة حذف الصورة القديمة بأمان بعد تحقق الخادم من ملكية fileId أو صلاحية المشرفة
app.post('/api/images/delete', imageMediaRateLimiter, async (req, res) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      code: 'auth/unauthenticated',
      error: 'يجب تسجيل الدخول أولاً.'
    });
  }

  const token = authHeader.substring(7).trim();
  const tokenResult = await verifyFirebaseToken(token);
  if (!tokenResult.valid || !tokenResult.uid) {
    return res.status(401).json({
      success: false,
      code: 'auth/invalid-token',
      error: tokenResult.reason || 'رمز المصادقة غير صالح.'
    });
  }

  if (tokenResult.isAnonymous) {
    return res.status(403).json({
      success: false,
      code: 'auth/anonymous-forbidden',
      error: 'حساب الزائر لا يملك صلاحية حذف الصور.'
    });
  }

  if (!isSafeUidSegment(tokenResult.uid)) {
    return res.status(400).json({
      success: false,
      code: 'auth/invalid-uid',
      error: 'معرّف المستخدم غير صالح.'
    });
  }

  const purpose = parseImagePurpose(req.body?.purpose);
  if (!purpose) {
    return res.status(400).json({
      success: false,
      code: 'imagekit/invalid-purpose',
      error: 'غرض حذف الصورة غير صالح.'
    });
  }

  const fileId = String(req.body?.fileId || '').trim();
  if (!/^[a-zA-Z0-9_-]{6,120}$/.test(fileId)) {
    return res.status(400).json({
      success: false,
      code: 'imagekit/invalid-file-id',
      error: 'معرّف الملف (fileId) غير صالح.'
    });
  }

  if (purpose === 'course_cover' || purpose === 'book_cover') {
    const adminCheck = await verifyAdminRequest(req);
    if (!adminCheck.authorized) {
      return res.status(403).json({
        success: false,
        code: 'auth/admin-required',
        error: adminCheck.reason || 'غير مصرح: حذف أغلفة الدورات والكتب للمشرفة المخولة فقط.'
      });
    }
  }

  const privateKey = getImageKitPrivateKey();
  if (!privateKey) {
    return res.status(503).json({
      success: false,
      code: 'imagekit/not-configured',
      error: 'خدمة ImageKit غير مهيأة على الخادم (IMAGEKIT_PRIVATE_KEY مفقود).'
    });
  }

  const authHeaderValue = buildImageKitBasicAuthHeader(privateKey);

  try {
    // 1. جلب بيانات الملف الحقيقية من ImageKit للتحقق من مسار الملكية وعدم الثقة بالعميل
    const detailsRes = await fetch(
      `${IMAGEKIT_FILES_API_URL}/${encodeURIComponent(fileId)}/details`,
      {
        method: 'GET',
        headers: { Authorization: authHeaderValue },
      }
    );

    if (detailsRes.status === 404) {
      return res.json({ success: true, alreadyDeleted: true });
    }

    if (!detailsRes.ok) {
      return res.status(502).json({
        success: false,
        code: 'imagekit/details-failed',
        error: 'تعذر التحقق من ملكية الملف على ImageKit.'
      });
    }

    const detailsJson: any = await detailsRes.json();
    const authoritativePath = String(detailsJson?.filePath || '');
    const expectedPrefix =
      purpose === 'avatar'
        ? `${IMAGEKIT_ROOT_FOLDER}/user_avatars/${tokenResult.uid}/`
        : purpose === 'course_cover'
          ? `${IMAGEKIT_ROOT_FOLDER}/course_covers/`
          : `${IMAGEKIT_ROOT_FOLDER}/book_covers/`;

    if (!authoritativePath.startsWith(expectedPrefix) || authoritativePath.includes('..')) {
      return res.status(403).json({
        success: false,
        code: 'auth/ownership-mismatch',
        error: 'غير مصرح: معرّف الصورة لا يتبع لحسابك أو للنطاق المطلوب.'
      });
    }

    // 2. تنفيذ الحذف من ImageKit بعد التحقق من الملكية
    const deleteRes = await fetch(
      `${IMAGEKIT_FILES_API_URL}/${encodeURIComponent(fileId)}`,
      {
        method: 'DELETE',
        headers: { Authorization: authHeaderValue },
      }
    );

    if (deleteRes.status === 204 || deleteRes.status === 200 || deleteRes.status === 404) {
      return res.json({ success: true, deletedFileId: fileId });
    }

    return res.status(502).json({
      success: false,
      code: 'imagekit/delete-failed',
      error: `تعذر حذف الصورة من ImageKit (${deleteRes.status}).`
    });
  } catch (err: any) {
    console.error('[IMAGEKIT DELETE ERROR]:', err?.message || 'Delete error');
    return res.status(502).json({
      success: false,
      code: 'imagekit/network-error',
      error: 'تعذر الاتصال بخدمة ImageKit لتنفيذ الحذف.'
    });
  }
});

// معالج الطلبات غير المطابقة للمسارات البرمجية في واجهة التطبيقات البرمجية (API) لمنع سقوطها في الـ SPA Fallback
app.all('/api/*', (req, res) => {
  console.warn(`[API 404] Unmatched API request received: ${req.method} ${req.url}`);
  res.status(404).json({
    success: false,
    error: `المسار البرمجي المطلوب غير موجود: ${req.method} ${req.url}`
  });
});

// معالج الأخطاء العام لضمان إرجاع استجابة JSON دائماً مع حجب تفاصيل التتبع الداخلي
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err?.type === 'entity.too.large') {
    return res.status(413).json({
      success: false,
      code: 'validation/file-too-large',
      error: 'حجم الصورة يتجاوز الحد الأقصى المسموح به للرفع.'
    });
  }
  console.error('[GLOBAL ERROR HANDLER] Caught error:', err?.message || err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'حدث خطأ غير متوقع في الخادم',
    details: process.env.NODE_ENV !== 'production' ? (err.stack || null) : null
  });
});

// تهيئة Vite كوسيط في التطوير، وتقديم الملفات الثابتة في الإنتاج
async function startServer() {

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
