import { auth } from './firebase';
import { buildApiUrl } from './apiClient';

export const IMAGEKIT_ID = 'fvxlchn3o';

export const IMAGEKIT_URL_ENDPOINT = (
  ((import.meta as any)?.env?.VITE_IMAGEKIT_URL_ENDPOINT as string | undefined) ||
  'https://ik.imagekit.io/fvxlchn3o'
).replace(/\/+$/, '');

export const IMAGEKIT_PUBLIC_KEY = (
  ((import.meta as any)?.env?.VITE_IMAGEKIT_PUBLIC_KEY as string | undefined) || ''
).trim();

export const ALLOWED_IMAGEKIT_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
] as const;

export const ALLOWED_IMAGEKIT_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'] as const;

export const IMAGEKIT_AVATAR_MAX_BYTES = 5 * 1024 * 1024; // 5MB
export const IMAGEKIT_COVER_MAX_BYTES = 10 * 1024 * 1024; // 10MB

export type ImageUploadPurpose = 'avatar' | 'course_cover' | 'book_cover';

export type ImageUploadStage =
  | 'preflight_validation'
  | 'preflight_network'
  | 'preflight_auth'
  | 'server_upload'
  | 'firestore_update'
  | 'server_delete';

export interface ImageUploadResult {
  url: string;
  fileId: string;
  filePath?: string;
  size?: number;
  format?: string;
}

export interface ImageUploadController {
  promise: Promise<ImageUploadResult>;
  cancel: () => void;
}

export class ImageUploadCanceledError extends Error {
  readonly code = 'imagekit/canceled';
  constructor(message = 'تم إلغاء رفع الصورة بناءً على طلبك.') {
    super(message);
    this.name = 'ImageUploadCanceledError';
  }
}

function isDevMode(): boolean {
  try {
    return Boolean((import.meta as any)?.env?.DEV);
  } catch {
    return false;
  }
}

export function getSafeAuthSummaryForImageDiagnostics() {
  const user = auth?.currentUser ?? null;
  if (!user) {
    return { isAuthenticated: false, isAnonymous: false, uidPrefix: null };
  }
  return {
    isAuthenticated: true,
    isAnonymous: Boolean(user.isAnonymous),
    uidPrefix: user.uid ? `${user.uid.slice(0, 6)}***` : null,
  };
}

export function logImageDiagnostic(info: {
  stage: ImageUploadStage;
  purpose: ImageUploadPurpose;
  errorCode: string;
  errorMessage: string;
  httpStatus?: number;
}): void {
  if (!isDevMode()) return;
  console.error('[ImageKit Upload Diagnostic]', {
    stage: info.stage,
    purpose: info.purpose,
    endpoint: IMAGEKIT_URL_ENDPOINT,
    authState: getSafeAuthSummaryForImageDiagnostics(),
    errorCode: info.errorCode,
    errorMessage: info.errorMessage,
    ...(info.httpStatus !== undefined ? { httpStatus: info.httpStatus } : {}),
  });
}

export function isImageKitUrl(url?: string | null): boolean {
  if (!url || typeof url !== 'string') return false;
  return url.trim().toLowerCase().startsWith(IMAGEKIT_URL_ENDPOINT.toLowerCase());
}

export function detectBrowserImageSignature(bytes: Uint8Array): 'jpeg' | 'png' | 'webp' | null {
  if (!bytes || bytes.length < 12) return null;

  // رفض أي محتوى نصي/SVG/HTML مقنّع
  let headText = '';
  const sampleLen = Math.min(bytes.length, 64);
  for (let i = 0; i < sampleLen; i++) {
    headText += String.fromCharCode(bytes[i]);
  }
  const lowerHead = headText.trimStart().toLowerCase();
  if (
    lowerHead.startsWith('<svg') ||
    lowerHead.startsWith('<!doctype') ||
    lowerHead.startsWith('<html') ||
    lowerHead.startsWith('<?xml') ||
    lowerHead.startsWith('<script')
  ) {
    return null;
  }

  // JPEG: FF D8 FF
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return 'jpeg';
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return 'png';
  }

  // WebP: RIFF....WEBP
  if (
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return 'webp';
  }

  return null;
}

export function validateImageFileMetadata(
  file: File,
  maxBytes: number
): { valid: boolean; error?: string } {
  if (!file) {
    return { valid: false, error: 'لم يتم اختيار ملف صورة.' };
  }

  const fileNameLower = (file.name || '').toLowerCase();
  const mimeLower = (file.type || '').toLowerCase().trim();

  if (mimeLower === 'image/svg+xml' || fileNameLower.endsWith('.svg')) {
    return {
      valid: false,
      error: 'ملفات SVG غير مسموح برفعها لأسباب أمنية. الصيغ المسموحة: JPG، JPEG، PNG، WebP.',
    };
  }

  const hasAllowedMime = (ALLOWED_IMAGEKIT_MIME_TYPES as readonly string[]).includes(mimeLower);
  const hasAllowedExt = ALLOWED_IMAGEKIT_EXTENSIONS.some((ext) => fileNameLower.endsWith(ext));

  if (mimeLower) {
    if (!hasAllowedMime) {
      return {
        valid: false,
        error: 'نوع الملف غير مدعوم. يُسمح فقط بصور JPG أو JPEG أو PNG أو WebP.',
      };
    }
  } else if (!hasAllowedExt) {
    return {
      valid: false,
      error: 'امتداد الصورة غير مدعوم. يُسمح فقط بصور JPG أو JPEG أو PNG أو WebP.',
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

export async function validateImageFileWithSignature(
  file: File,
  maxBytes: number
): Promise<{ valid: boolean; detectedFormat?: 'jpeg' | 'png' | 'webp'; error?: string }> {
  const basic = validateImageFileMetadata(file, maxBytes);
  if (!basic.valid) {
    return basic;
  }

  try {
    const headerBuf = await file.slice(0, 64).arrayBuffer();
    const headerBytes = new Uint8Array(headerBuf);
    const detected = detectBrowserImageSignature(headerBytes);
    if (!detected) {
      return {
        valid: false,
        error: 'محتوى الملف الفعلي لا يطابق صورة صالحة (JPG، JPEG، PNG، WebP).',
      };
    }
    return { valid: true, detectedFormat: detected };
  } catch {
    return {
      valid: false,
      error: 'تعذر قراءة محتوى ملف الصورة للتحقق من سلامته.',
    };
  }
}

export function startImageKitUpload(
  purpose: ImageUploadPurpose,
  file: File,
  maxBytes: number,
  options: { onProgress?: (pct: number) => void } = {}
): ImageUploadController {
  const { onProgress } = options;

  let activeXhr: XMLHttpRequest | null = null;
  let canceledByUser = false;
  let settled = false;
  let rejectOuter: ((reason?: any) => void) | null = null;

  const cancel = () => {
    if (settled) return;
    canceledByUser = true;
    if (activeXhr) {
      try {
        activeXhr.abort();
      } catch {
        // ignore abort error
      }
    } else if (rejectOuter) {
      settled = true;
      rejectOuter(new ImageUploadCanceledError());
    }
  };

  const promise = new Promise<ImageUploadResult>((resolve, reject) => {
    rejectOuter = reject;

    const fail = (err: Error) => {
      if (settled) return;
      settled = true;
      reject(err);
    };

    const run = async () => {
      // 1. فحص محتوى الصورة الفعلي وحجمها
      const check = await validateImageFileWithSignature(file, maxBytes);
      if (canceledByUser) {
        fail(new ImageUploadCanceledError());
        return;
      }
      if (!check.valid) {
        const msg = check.error || 'ملف الصورة غير صالح.';
        logImageDiagnostic({
          stage: 'preflight_validation',
          purpose,
          errorCode: 'validation/invalid-image',
          errorMessage: msg,
        });
        fail(new Error(msg));
        return;
      }

      // 2. فحص حالة الشبكة
      if (typeof navigator !== 'undefined' && navigator.onLine === false) {
        const offlineMsg = 'لا يوجد اتصال بالإنترنت حالياً. يرجى التحقق من الشبكة ثم المحاولة مجدداً.';
        logImageDiagnostic({
          stage: 'preflight_network',
          purpose,
          errorCode: 'network/offline',
          errorMessage: offlineMsg,
        });
        fail(new Error(offlineMsg));
        return;
      }

      // 3. فحص المصادقة وجلب Firebase ID Token
      const user = auth?.currentUser;
      if (!user || user.isAnonymous) {
        const authMsg = 'يجب تسجيل الدخول بحساب فعلي أولاً قبل رفع الصور.';
        logImageDiagnostic({
          stage: 'preflight_auth',
          purpose,
          errorCode: 'auth/unauthenticated',
          errorMessage: authMsg,
        });
        fail(new Error(authMsg));
        return;
      }

      let idToken = '';
      try {
        idToken = await user.getIdToken();
      } catch (tokenErr: any) {
        const tokenMsg = 'تعذر التحقق من جلسة الدخول الحالية. يرجى إعادة تسجيل الدخول والمحاولة مجدداً.';
        logImageDiagnostic({
          stage: 'preflight_auth',
          purpose,
          errorCode: 'auth/token-error',
          errorMessage: tokenErr?.message || tokenMsg,
        });
        fail(new Error(tokenMsg));
        return;
      }

      if (canceledByUser) {
        fail(new ImageUploadCanceledError());
        return;
      }

      // 4. إرسال الملف ثنائياً عبر الخادم (Express -> ImageKit) مع تتبع التقدم الحقيقي
      await new Promise<void>((resolveXhr, rejectXhr) => {
        const xhr = new XMLHttpRequest();
        activeXhr = xhr;

        xhr.open('POST', buildApiUrl(`/api/images/upload?purpose=${encodeURIComponent(purpose)}`), true);
        xhr.setRequestHeader('Authorization', `Bearer ${idToken}`);
        xhr.setRequestHeader('Content-Type', 'application/octet-stream');
        xhr.setRequestHeader('X-File-Name', encodeURIComponent(file.name || 'image.jpg'));

        xhr.upload.onprogress = (evt) => {
          if (evt.lengthComputable && evt.total > 0) {
            // نسبة النقل إلى الخادم (0% - 90%) ثم تكتمل 100% عند تأكيد ImageKit
            const transferPct = Math.min(90, Math.max(1, Math.round((evt.loaded / evt.total) * 90)));
            onProgress?.(transferPct);
          }
        };

        xhr.onabort = () => {
          activeXhr = null;
          rejectXhr(new ImageUploadCanceledError());
        };

        xhr.onerror = () => {
          activeXhr = null;
          const netMsg = 'انقطع الاتصال بالخادم أثناء رفع الصورة. يرجى التحقق من الشبكة والمحاولة مجدداً.';
          logImageDiagnostic({
            stage: 'server_upload',
            purpose,
            errorCode: 'network/xhr-error',
            errorMessage: netMsg,
          });
          rejectXhr(new Error(netMsg));
        };

        xhr.onload = () => {
          activeXhr = null;
          if (canceledByUser) {
            rejectXhr(new ImageUploadCanceledError());
            return;
          }

          let parsed: any = null;
          try {
            parsed = JSON.parse(xhr.responseText || '{}');
          } catch {
            parsed = null;
          }

          if (xhr.status >= 200 && xhr.status < 300 && parsed?.success && parsed?.url && parsed?.fileId) {
            onProgress?.(100);
            settled = true;
            resolve({
              url: String(parsed.url),
              fileId: String(parsed.fileId),
              filePath: parsed.filePath ? String(parsed.filePath) : undefined,
              size: typeof parsed.size === 'number' ? parsed.size : file.size,
              format: parsed.format ? String(parsed.format) : check.detectedFormat,
            });
            resolveXhr();
            return;
          }

          const errCode = parsed?.code || `http/${xhr.status}`;
          const errMsg =
            parsed?.error ||
            `تعذر رفع الصورة إلى خادم الصور (رمز الاستجابة: ${xhr.status}).`;

          logImageDiagnostic({
            stage: 'server_upload',
            purpose,
            errorCode: errCode,
            errorMessage: errMsg,
            httpStatus: xhr.status,
          });

          const err = new Error(errMsg);
          (err as any).code = errCode;
          (err as any).httpStatus = xhr.status;
          rejectXhr(err);
        };

        xhr.send(file);
      });
    };

    run().catch((err) => {
      if (canceledByUser || err instanceof ImageUploadCanceledError) {
        fail(new ImageUploadCanceledError());
        return;
      }
      fail(err instanceof Error ? err : new Error('تعذر إتمام رفع الصورة.'));
    });
  });

  return { promise, cancel };
}

export async function deleteImageKitFile(
  fileId?: string | null,
  purpose: ImageUploadPurpose = 'avatar'
): Promise<boolean> {
  const cleanId = (fileId || '').trim();
  if (!cleanId) return false;

  const user = auth?.currentUser;
  if (!user || user.isAnonymous) return false;

  try {
    const token = await user.getIdToken();
    const res = await fetch(buildApiUrl('/api/images/delete'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ fileId: cleanId, purpose }),
    });

    if (!res.ok) {
      let msg = `HTTP ${res.status}`;
      try {
        const j = await res.json();
        msg = j?.error || msg;
      } catch {
        // ignore parse failure
      }
      logImageDiagnostic({
        stage: 'server_delete',
        purpose,
        errorCode: `delete/${res.status}`,
        errorMessage: msg,
        httpStatus: res.status,
      });
      return false;
    }

    return true;
  } catch (err: any) {
    logImageDiagnostic({
      stage: 'server_delete',
      purpose,
      errorCode: 'delete/network-error',
      errorMessage: err?.message || String(err),
    });
    return false;
  }
}

export async function cleanupReplacedImageKitCover(params: {
  purpose: 'course_cover' | 'book_cover';
  oldFileId?: string | null;
  oldUrl?: string | null;
  newFileId?: string | null;
  newUrl?: string | null;
  otherItems?: Array<{ imageUrl?: string | null; imageFileId?: string | null }>;
}): Promise<void> {
  const {
    purpose,
    oldFileId,
    oldUrl,
    newFileId,
    newUrl,
    otherItems = [],
  } = params;

  const cleanOldId = (oldFileId || '').trim();
  if (!cleanOldId) {
    // لا نحذف الصور القديمة التي لا تملك fileId على ImageKit (مثل الروابط القديمة أو روابط Firebase Storage)
    return;
  }

  if (cleanOldId === (newFileId || '').trim()) return;
  if (oldUrl && newUrl && oldUrl.trim() === newUrl.trim()) return;

  const stillReferenced = otherItems.some((item) => {
    if (item.imageFileId && item.imageFileId.trim() === cleanOldId) return true;
    if (oldUrl && item.imageUrl && item.imageUrl.trim() === oldUrl.trim()) return true;
    return false;
  });
  if (stillReferenced) return;

  await deleteImageKitFile(cleanOldId, purpose);
}
