import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  UploadTask,
  UploadTaskSnapshot,
} from 'firebase/storage';
import { auth, storage } from './firebase';

export const ALLOWED_IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
] as const;

export const ALLOWED_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif'] as const;

export const AVATAR_MAX_BYTES = 5 * 1024 * 1024; // 5MB
export const COVER_MAX_BYTES = 10 * 1024 * 1024; // 10MB

export type StorageUploadStage =
  | 'preflight_validation'
  | 'preflight_network'
  | 'preflight_auth'
  | 'bucket_probe'
  | 'upload_resumable'
  | 'get_download_url'
  | 'firestore_update';

export class UploadCanceledError extends Error {
  readonly code = 'storage/canceled';
  constructor(message = 'تم إلغاء عملية رفع الصورة بناءً على طلبك.') {
    super(message);
    this.name = 'UploadCanceledError';
  }
}

export class StorageBucketNotFoundError extends Error {
  readonly code = 'storage/bucket-not-found';
  constructor(
    message = 'حاوية التخزين السحابي (Firebase Storage Bucket) غير موجودة أو لم يتم تفعيل الخدمة في مشروع Firebase بعد.'
  ) {
    super(message);
    this.name = 'StorageBucketNotFoundError';
  }
}

function isDevMode(): boolean {
  try {
    return Boolean((import.meta as any)?.env?.DEV);
  } catch {
    return false;
  }
}

export function getSafeAuthStateForDiagnostics() {
  const user = auth?.currentUser ?? null;
  if (!user) {
    return {
      isAuthenticated: false,
      isAnonymous: false,
      uidPrefix: null,
      emailVerified: false,
    };
  }
  return {
    isAuthenticated: true,
    isAnonymous: Boolean(user.isAnonymous),
    uidPrefix: user.uid ? `${user.uid.slice(0, 6)}***` : null,
    emailVerified: Boolean(user.emailVerified),
  };
}

export interface StorageDiagnosticInfo {
  stage: StorageUploadStage;
  targetPath: string;
  bucket?: string | null;
  errorCode: string;
  errorMessage: string;
  bytesTransferred?: number;
  totalBytes?: number;
  attempt?: number;
  bucketStatus?: 'reachable' | 'missing' | 'unreachable';
}

export function logStorageDiagnostic(info: StorageDiagnosticInfo): void {
  if (!isDevMode()) return;
  console.error('[Firebase Storage Diagnostic]', {
    stage: info.stage,
    targetPath: info.targetPath,
    bucket: info.bucket || storage?.app?.options?.storageBucket || null,
    authState: getSafeAuthStateForDiagnostics(),
    errorCode: info.errorCode,
    errorMessage: info.errorMessage,
    ...(info.bytesTransferred !== undefined ? { bytesTransferred: info.bytesTransferred } : {}),
    ...(info.totalBytes !== undefined ? { totalBytes: info.totalBytes } : {}),
    ...(info.attempt !== undefined ? { attempt: info.attempt } : {}),
    ...(info.bucketStatus ? { bucketStatus: info.bucketStatus } : {}),
  });
}

const createSvgDataUri = (svg: string): string =>
  `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;

export const DEFAULT_COURSE_COVER = createSvgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 240">
  <defs>
    <linearGradient id="cg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#065f46"/>
      <stop offset="55%" stop-color="#0f766e"/>
      <stop offset="100%" stop-color="#134e4a"/>
    </linearGradient>
  </defs>
  <rect width="320" height="240" fill="url(#cg)"/>
  <circle cx="265" cy="48" r="72" fill="#f59e0b" fill-opacity="0.14"/>
  <circle cx="52" cy="196" r="64" fill="#34d399" fill-opacity="0.12"/>
  <rect x="20" y="20" width="280" height="200" rx="18" fill="none" stroke="#fbbf24" stroke-opacity="0.28" stroke-width="1.5"/>
  <g transform="translate(160 116)" fill="none" stroke="#fef3c7" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
    <path d="M-44 -26 C-22 -34 -6 -28 0 -18 C6 -28 22 -34 44 -26 L44 26 C22 18 6 24 0 34 C-6 24 -22 18 -44 26 Z" fill="#fef3c7" fill-opacity="0.12"/>
    <path d="M0 -18 L0 34"/>
    <path d="M-28 -8 L-10 -12 M-28 6 L-10 2 M10 -12 L28 -8 M10 2 L28 6" stroke-opacity="0.75"/>
  </g>
</svg>
`);

export const DEFAULT_BOOK_COVER = createSvgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 320">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#1e293b"/>
      <stop offset="60%" stop-color="#064e3b"/>
      <stop offset="100%" stop-color="#0f766e"/>
    </linearGradient>
  </defs>
  <rect width="240" height="320" fill="url(#bg)"/>
  <rect x="0" y="0" width="22" height="320" fill="#022c22" fill-opacity="0.55"/>
  <rect x="26" y="18" width="196" height="284" rx="12" fill="none" stroke="#fbbf24" stroke-opacity="0.45" stroke-width="2"/>
  <rect x="34" y="26" width="180" height="268" rx="8" fill="none" stroke="#fde68a" stroke-opacity="0.2" stroke-width="1"/>
  <circle cx="124" cy="148" r="44" fill="#fbbf24" fill-opacity="0.12" stroke="#fbbf24" stroke-opacity="0.4" stroke-width="1.5"/>
  <g transform="translate(124 148)" fill="none" stroke="#fef3c7" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M-20 -14 L12 -14 C18 -14 22 -10 22 -4 L22 18 L-14 18 C-18 18 -22 15 -22 11 L-22 -10 C-22 -12 -20 -14 -16 -14"/>
    <path d="M-22 11 C-22 8 -18 5 -14 5 L22 5"/>
    <path d="M-8 -4 L12 -4"/>
  </g>
</svg>
`);

export function validateImageFile(
  file: File,
  maxBytes: number
): { valid: boolean; error?: string } {
  if (!file) {
    return { valid: false, error: 'لم يتم اختيار ملف صورة.' };
  }

  const fileNameLower = (file.name || '').toLowerCase();
  const mimeLower = (file.type || '').toLowerCase();

  if (mimeLower === 'image/svg+xml' || fileNameLower.endsWith('.svg')) {
    return {
      valid: false,
      error: 'ملفات SVG غير مسموح برفعها لأسباب أمنية. الصيغ المسموحة: JPG، PNG، WebP، GIF.',
    };
  }

  const hasAllowedMime = (ALLOWED_IMAGE_MIME_TYPES as readonly string[]).includes(mimeLower);
  const hasAllowedExt = ALLOWED_IMAGE_EXTENSIONS.some((ext) => fileNameLower.endsWith(ext));

  if (mimeLower) {
    if (!hasAllowedMime) {
      return {
        valid: false,
        error: 'نوع الملف غير مدعوم. يُسمح فقط بصور JPG أو PNG أو WebP أو GIF.',
      };
    }
  } else if (!hasAllowedExt) {
    return {
      valid: false,
      error: 'امتداد الصورة غير مدعوم. يُسمح فقط بصور JPG أو PNG أو WebP أو GIF.',
    };
  }

  if (file.size <= 0) {
    return { valid: false, error: 'ملف الصورة فارغ أو تالف.' };
  }

  if (file.size > maxBytes) {
    const maxMb = Math.round(maxBytes / (1024 * 1024));
    return {
      valid: false,
      error: `حجم الصورة يتجاوز الحد الأقصى المسموح (${maxMb} ميجابايت).`,
    };
  }

  return { valid: true };
}

export function inferImageContentType(file: File): string {
  const mimeLower = (file.type || '').toLowerCase().trim();
  if ((ALLOWED_IMAGE_MIME_TYPES as readonly string[]).includes(mimeLower)) {
    return mimeLower;
  }
  const nameLower = (file.name || '').toLowerCase();
  if (nameLower.endsWith('.png')) return 'image/png';
  if (nameLower.endsWith('.webp')) return 'image/webp';
  if (nameLower.endsWith('.gif')) return 'image/gif';
  return 'image/jpeg';
}

export function isValidRemoteImageUrl(url?: string | null): boolean {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (!trimmed) return false;
  const lower = trimmed.toLowerCase();
  if (
    lower.startsWith('blob:') ||
    lower.startsWith('data:') ||
    lower.startsWith('javascript:') ||
    lower.startsWith('vbscript:')
  ) {
    return false;
  }
  return lower.startsWith('https://') || lower.startsWith('http://');
}

export function classifyStorageErrorCode(err: any): string {
  const rawCode = String(err?.code || '').toLowerCase().trim();
  if (rawCode) return rawCode;

  const message = String(err?.message || '').toLowerCase();
  const serverResponse = String(err?.serverResponse || '').toLowerCase();
  const combined = `${message} ${serverResponse}`;

  if (err instanceof UploadCanceledError) return 'storage/canceled';
  if (err instanceof StorageBucketNotFoundError) return 'storage/bucket-not-found';
  if (combined.includes('bucket does not exist') || (combined.includes('404') && combined.includes('not found'))) {
    return 'storage/bucket-not-found';
  }
  if (combined.includes('auth/user-token-expired') || combined.includes('unauthenticated') || combined.includes('401')) {
    return 'storage/unauthenticated';
  }
  if (combined.includes('unauthorized') || combined.includes('permission') || combined.includes('403')) {
    return 'storage/unauthorized';
  }
  if (combined.includes('retry-limit-exceeded') || combined.includes('max retry time')) {
    return 'storage/retry-limit-exceeded';
  }
  if (combined.includes('network') || combined.includes('offline') || combined.includes('failed to fetch')) {
    return 'network/offline-or-timeout';
  }
  return 'storage/unknown';
}

export function formatFirebaseStorageError(err: any, stage?: StorageUploadStage): string {
  const code = classifyStorageErrorCode(err);
  const message = String(err?.message || '').trim();
  const devCodeSuffix = isDevMode() ? ` [${code}${stage ? ` @ ${stage}` : ''}]` : '';

  if (code === 'storage/canceled') {
    return 'تم إلغاء رفع الصورة بناءً على طلبك.';
  }
  if (code === 'storage/unauthenticated') {
    return `المستخدم غير مصادق عليه أو انتهت جلسة الدخول (${code}). يرجى إعادة تسجيل الدخول والمحاولة مرة أخرى.${devCodeSuffix}`;
  }
  if (code === 'storage/unauthorized') {
    return `تم رفض الرفع لعدم توفر الصلاحية (${code}): تأكد من أن مسار الحساب أو صلاحيات المشرفة مطابقة لقواعد Firebase Storage المنشورة.${devCodeSuffix}`;
  }
  if (code === 'storage/bucket-not-found' || code === 'storage/project-not-found') {
    const bucket = storage?.app?.options?.storageBucket || 'المحدد في الإعدادات';
    return `تعذر الرفع لأن حاوية التخزين السحابي (${bucket}) غير موجودة أو لم يتم تفعيل Firebase Storage في مشروع Firebase بعد (${code}).${devCodeSuffix}`;
  }
  if (code === 'storage/quota-exceeded') {
    return `تم تجاوز السعة التخزينية المتاحة في Firebase Storage.${devCodeSuffix}`;
  }
  if (code === 'storage/retry-limit-exceeded') {
    return `انتهت مهلة إعادة المحاولة للوصول إلى خادم Firebase Storage (${code}). قد يكون السبب ضعف الشبكة، أو حظر CORS، أو عدم تفعيل حاوية Storage / عدم نشر القواعد في Firebase.${devCodeSuffix}`;
  }
  if (code === 'network/offline-or-timeout') {
    return `تعذر الاتصال بالشبكة أثناء الرفع. يرجى التحقق من اتصال الإنترنت ثم إعادة المحاولة.${devCodeSuffix}`;
  }
  if (code === 'storage/invalid-checksum') {
    return `حدث تلف في بيانات الصورة أثناء النقل (${code}). يرجى إعادة المحاولة.${devCodeSuffix}`;
  }
  if (code === 'storage/unknown') {
    return `حدث خطأ غير معروف من خادم Firebase Storage (storage/unknown)${message ? `: ${message}` : ''}.${devCodeSuffix}`;
  }
  if (message) {
    return `تعذر رفع الصورة إلى Firebase Storage: ${message}${devCodeSuffix}`;
  }
  return `تعذر رفع الصورة إلى المخزن السحابي، يرجى المحاولة مرة أخرى.${devCodeSuffix}`;
}

export async function probeStorageBucketAvailability(
  bucketName: string,
  timeoutMs = 3500
): Promise<'reachable' | 'missing' | 'unreachable'> {
  if (!bucketName || typeof fetch !== 'function') return 'unreachable';
  const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
  const timer = controller ? setTimeout(() => controller.abort(), timeoutMs) : null;

  try {
    const res = await fetch(
      `https://storage.googleapis.com/storage/v1/b/${encodeURIComponent(bucketName)}`,
      {
        method: 'GET',
        signal: controller?.signal,
      }
    );

    if (res.status === 404) {
      let bodyText = '';
      try {
        bodyText = (await res.text()).toLowerCase();
      } catch {
        // ignore read failure
      }
      if (!bodyText || bodyText.includes('does not exist') || bodyText.includes('not found')) {
        return 'missing';
      }
    }

    return 'reachable';
  } catch {
    return 'unreachable';
  } finally {
    if (timer !== null) clearTimeout(timer);
  }
}

export function extractStoragePathFromUrl(url?: string | null): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (
    !trimmed.includes('firebasestorage.googleapis.com') &&
    !trimmed.includes('.firebasestorage.app')
  ) {
    return null;
  }

  try {
    const parsed = new URL(trimmed);
    const bucketMarker = '/o/';
    const idx = parsed.pathname.indexOf(bucketMarker);
    if (idx === -1) return null;
    const encodedPath = parsed.pathname.slice(idx + bucketMarker.length);
    if (!encodedPath) return null;
    return decodeURIComponent(encodedPath);
  } catch {
    return null;
  }
}

export interface ResumableUploadOptions {
  onProgress?: (pct: number) => void;
  onStateChange?: (snapshot: UploadTaskSnapshot) => void;
  requireAuth?: boolean;
  maxTransientRetries?: number;
}

export interface ResumableUploadController {
  task: UploadTask | null;
  promise: Promise<string>;
  cancel: () => void;
}

function isTransientRetryableStorageError(code: string): boolean {
  return (
    code === 'storage/retry-limit-exceeded' ||
    code === 'network/offline-or-timeout'
  );
}

export function startResumableImageUpload(
  storagePath: string,
  file: File,
  maxBytes: number,
  options: ResumableUploadOptions = {}
): ResumableUploadController {
  const {
    onProgress,
    onStateChange,
    requireAuth = true,
    maxTransientRetries = 1,
  } = options;

  let activeTask: UploadTask | null = null;
  let retryDelayTimer: ReturnType<typeof setTimeout> | null = null;
  let canceledByUser = false;
  let settled = false;
  let rejectOuter: ((reason?: any) => void) | null = null;

  const clearRetryTimer = () => {
    if (retryDelayTimer !== null) {
      clearTimeout(retryDelayTimer);
      retryDelayTimer = null;
    }
  };

  const cancel = () => {
    if (settled) return;
    canceledByUser = true;
    clearRetryTimer();
    if (activeTask) {
      try {
        activeTask.cancel();
      } catch {
        // ignore cancel invocation errors
      }
    } else if (rejectOuter) {
      settled = true;
      rejectOuter(new UploadCanceledError());
    }
  };

  const promise = new Promise<string>((resolve, reject) => {
    rejectOuter = reject;

    const fail = (err: Error) => {
      if (settled) return;
      settled = true;
      clearRetryTimer();
      reject(err);
    };

    const runSingleUploadAttempt = (
      attemptNumber: number,
      configuredBucket: string
    ): Promise<string> => {
      return new Promise<string>((resolveAttempt, rejectAttempt) => {
        if (canceledByUser) {
          rejectAttempt(new UploadCanceledError());
          return;
        }

        const contentType = inferImageContentType(file);
        const fileRef = ref(storage, storagePath);
        const uploadTask = uploadBytesResumable(fileRef, file, { contentType });
        activeTask = uploadTask;

        let lastBytesTransferred = 0;
        let lastTotalBytes = file.size;

        uploadTask.on(
          'state_changed',
          (snapshot) => {
            lastBytesTransferred = snapshot.bytesTransferred;
            lastTotalBytes = snapshot.totalBytes || file.size;
            onStateChange?.(snapshot);

            if (snapshot.totalBytes > 0) {
              const pct = Math.min(
                100,
                Math.max(0, Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100))
              );
              onProgress?.(pct);
            }
          },
          (err) => {
            activeTask = null;
            if (canceledByUser || String(err?.code || '').toLowerCase() === 'storage/canceled') {
              logStorageDiagnostic({
                stage: 'upload_resumable',
                targetPath: storagePath,
                bucket: configuredBucket,
                errorCode: 'storage/canceled',
                errorMessage: err?.message || 'Upload canceled by user',
                bytesTransferred: lastBytesTransferred,
                totalBytes: lastTotalBytes,
                attempt: attemptNumber,
              });
              rejectAttempt(new UploadCanceledError());
              return;
            }

            const errorCode = classifyStorageErrorCode(err);
            logStorageDiagnostic({
              stage: 'upload_resumable',
              targetPath: storagePath,
              bucket: configuredBucket,
              errorCode,
              errorMessage: err?.message || String(err),
              bytesTransferred: lastBytesTransferred,
              totalBytes: lastTotalBytes,
              attempt: attemptNumber,
            });
            rejectAttempt(err);
          },
          async () => {
            activeTask = null;
            if (canceledByUser) {
              rejectAttempt(new UploadCanceledError());
              return;
            }
            try {
              const url = await getDownloadURL(uploadTask.snapshot.ref);
              if (!isValidRemoteImageUrl(url)) {
                throw new Error('الرابط الناتج من getDownloadURL غير صالح.');
              }
              onProgress?.(100);
              resolveAttempt(url);
            } catch (urlErr: any) {
              const errorCode = classifyStorageErrorCode(urlErr);
              logStorageDiagnostic({
                stage: 'get_download_url',
                targetPath: storagePath,
                bucket: configuredBucket,
                errorCode,
                errorMessage: urlErr?.message || String(urlErr),
                attempt: attemptNumber,
              });
              const wrapped = new Error(formatFirebaseStorageError(urlErr, 'get_download_url'));
              (wrapped as any).code = errorCode;
              rejectAttempt(wrapped);
            }
          }
        );
      });
    };

    const run = async () => {
      // 1. فحص الملف محلياً
      const check = validateImageFile(file, maxBytes);
      if (!check.valid) {
        const errMsg = check.error || 'ملف الصورة غير صالح.';
        logStorageDiagnostic({
          stage: 'preflight_validation',
          targetPath: storagePath,
          errorCode: 'validation/invalid-image',
          errorMessage: errMsg,
        });
        fail(new Error(errMsg));
        return;
      }

      // 2. فحص حالة الشبكة
      if (typeof navigator !== 'undefined' && navigator.onLine === false) {
        const offlineErr = new Error(formatFirebaseStorageError({ message: 'offline' }, 'preflight_network'));
        logStorageDiagnostic({
          stage: 'preflight_network',
          targetPath: storagePath,
          errorCode: 'network/offline-or-timeout',
          errorMessage: 'Browser reports navigator.onLine === false',
        });
        fail(offlineErr);
        return;
      }

      // 3. فحص إعداد حاوية التخزين
      const configuredBucket = storage?.app?.options?.storageBucket || '';
      if (!configuredBucket) {
        const bucketErr = new StorageBucketNotFoundError(
          'إعداد حاوية التخزين السحابي (storageBucket) مفقود في ملف إعدادات Firebase.'
        );
        logStorageDiagnostic({
          stage: 'bucket_probe',
          targetPath: storagePath,
          errorCode: 'storage/bucket-not-found',
          errorMessage: bucketErr.message,
        });
        fail(bucketErr);
        return;
      }

      // 4. فحص المصادقة وتحديث التوكن
      if (requireAuth) {
        const user = auth.currentUser;
        if (!user || user.isAnonymous) {
          const authErr = new Error(
            formatFirebaseStorageError({ code: 'storage/unauthenticated' }, 'preflight_auth')
          );
          logStorageDiagnostic({
            stage: 'preflight_auth',
            targetPath: storagePath,
            bucket: configuredBucket,
            errorCode: 'storage/unauthenticated',
            errorMessage: 'auth.currentUser is null or anonymous',
          });
          fail(authErr);
          return;
        }
        try {
          await user.getIdToken();
        } catch (tokenErr: any) {
          const code = classifyStorageErrorCode(tokenErr) || 'storage/unauthenticated';
          logStorageDiagnostic({
            stage: 'preflight_auth',
            targetPath: storagePath,
            bucket: configuredBucket,
            errorCode: code,
            errorMessage: tokenErr?.message || 'Failed to retrieve Firebase Auth ID token',
          });
          fail(new Error(formatFirebaseStorageError({ code: 'storage/unauthenticated' }, 'preflight_auth')));
          return;
        }
      }

      // 5. فحص جاهزية حاوية Storage الفعلية قبل انتظار مهلة إعادة المحاولة
      const preflightBucketStatus = await probeStorageBucketAvailability(configuredBucket);
      if (preflightBucketStatus === 'missing') {
        const missingErr = new StorageBucketNotFoundError();
        logStorageDiagnostic({
          stage: 'bucket_probe',
          targetPath: storagePath,
          bucket: configuredBucket,
          bucketStatus: 'missing',
          errorCode: 'storage/bucket-not-found',
          errorMessage: `Bucket "${configuredBucket}" returned HTTP 404 (The specified bucket does not exist).`,
        });
        fail(new Error(formatFirebaseStorageError(missingErr, 'bucket_probe')));
        return;
      }

      // 6. تنفيذ الرفع مع إعادة المحاولة التلقائية الآمنة للأخطاء الشبكية المؤقتة على نفس المسار
      for (let attempt = 0; attempt <= maxTransientRetries; attempt++) {
        if (canceledByUser) {
          fail(new UploadCanceledError());
          return;
        }

        try {
          const downloadUrl = await runSingleUploadAttempt(attempt + 1, configuredBucket);
          if (!settled) {
            settled = true;
            resolve(downloadUrl);
          }
          return;
        } catch (attemptErr: any) {
          if (canceledByUser || attemptErr instanceof UploadCanceledError) {
            fail(new UploadCanceledError());
            return;
          }

          const code = classifyStorageErrorCode(attemptErr);

          // إذا فشل بـ retry-limit-exceeded أو unknown نتحقق إن كانت الحاوية مفقودة أم الشبكة هي السبب
          if (code === 'storage/retry-limit-exceeded' || code === 'storage/unknown') {
            const postStatus = await probeStorageBucketAvailability(configuredBucket);
            if (postStatus === 'missing') {
              const missingErr = new StorageBucketNotFoundError();
              logStorageDiagnostic({
                stage: 'bucket_probe',
                targetPath: storagePath,
                bucket: configuredBucket,
                bucketStatus: 'missing',
                errorCode: 'storage/bucket-not-found',
                errorMessage: `Upload failed with ${code} because bucket "${configuredBucket}" does not exist (404).`,
                attempt: attempt + 1,
              });
              fail(new Error(formatFirebaseStorageError(missingErr, 'bucket_probe')));
              return;
            }
          }

          const canAutoRetry =
            attempt < maxTransientRetries &&
            isTransientRetryableStorageError(code) &&
            (typeof navigator === 'undefined' || navigator.onLine !== false);

          if (canAutoRetry) {
            onProgress?.(0);
            await new Promise<void>((waitResolve) => {
              retryDelayTimer = setTimeout(() => {
                retryDelayTimer = null;
                waitResolve();
              }, 1500);
            });
            continue;
          }

          fail(new Error(formatFirebaseStorageError(attemptErr, 'upload_resumable')));
          return;
        }
      }
    };

    run().catch((unexpectedErr) => {
      const code = classifyStorageErrorCode(unexpectedErr);
      logStorageDiagnostic({
        stage: 'upload_resumable',
        targetPath: storagePath,
        errorCode: code,
        errorMessage: unexpectedErr?.message || String(unexpectedErr),
      });
      fail(new Error(formatFirebaseStorageError(unexpectedErr, 'upload_resumable')));
    });
  });

  return {
    get task() {
      return activeTask;
    },
    promise,
    cancel,
  };
}

export async function uploadImageToStorage(
  storagePath: string,
  file: File,
  maxBytes: number,
  onProgress?: (pct: number) => void
): Promise<string> {
  const controller = startResumableImageUpload(storagePath, file, maxBytes, { onProgress });
  return controller.promise;
}

function resolveSafeImageExt(file: File): string {
  const extMatch = (file.name || '').toLowerCase().match(/\.(jpg|jpeg|png|webp|gif)$/);
  const ext = extMatch ? extMatch[1] : (file.type.split('/')[1] || 'jpg').toLowerCase();
  return ext === 'jpeg' ? 'jpg' : ext;
}

export function buildAvatarStoragePath(uid: string, file: File): string {
  const safeExt = resolveSafeImageExt(file);
  return `user_avatars/${uid}/${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${safeExt}`;
}

export function buildCourseCoverStoragePath(file: File): string {
  const safeExt = resolveSafeImageExt(file);
  return `course_covers/${Date.now()}_${Math.random().toString(36).substring(2, 11)}.${safeExt}`;
}

export function buildBookCoverStoragePath(file: File): string {
  const safeExt = resolveSafeImageExt(file);
  return `book_covers/${Date.now()}_${Math.random().toString(36).substring(2, 11)}.${safeExt}`;
}

export async function deleteStorageObjectByUrl(url?: string | null): Promise<void> {
  const storagePath = extractStoragePathFromUrl(url);
  if (!storagePath) return;
  try {
    await deleteObject(ref(storage, storagePath));
  } catch (err) {
    console.warn('Could not clean up Storage object:', err);
  }
}

export async function deleteOldAvatarIfOwnedStorage(
  uid: string,
  oldUrl?: string | null,
  newUrl?: string | null
): Promise<void> {
  if (!oldUrl || oldUrl === newUrl) return;
  const storagePath = extractStoragePathFromUrl(oldUrl);
  if (!storagePath || !storagePath.startsWith(`user_avatars/${uid}/`)) {
    return;
  }
  try {
    await deleteObject(ref(storage, storagePath));
  } catch (err) {
    console.warn('Could not remove previous user avatar from Storage:', err);
  }
}

export async function deleteOldCoverIfUnusedStorage(
  folder: 'course_covers' | 'book_covers',
  oldUrl?: string | null,
  newUrl?: string | null,
  otherReferencedUrls: Array<string | undefined | null> = []
): Promise<void> {
  if (!oldUrl || oldUrl === newUrl) return;
  const isStillReferenced = otherReferencedUrls.some((u) => u && u.trim() === oldUrl.trim());
  if (isStillReferenced) return;

  const storagePath = extractStoragePathFromUrl(oldUrl);
  if (!storagePath || !storagePath.startsWith(`${folder}/`)) {
    return;
  }

  try {
    await deleteObject(ref(storage, storagePath));
  } catch (err) {
    console.warn(`Could not remove previous ${folder} file from Storage:`, err);
  }
}

export function clearAllUserSessionCaches(): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const k = window.localStorage.key(i);
      if (!k) continue;
      if (
        k === 'last_user_uid' ||
        k.startsWith('activeTab_') ||
        k.startsWith('lectures_') ||
        k.startsWith('talaba_local_')
      ) {
        keysToRemove.push(k);
      }
    }
    keysToRemove.forEach((k) => window.localStorage.removeItem(k));
  } catch (err) {
    console.warn('Could not clear local session caches:', err);
  }
}
