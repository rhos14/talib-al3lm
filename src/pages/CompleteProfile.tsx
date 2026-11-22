import React, { useState, useEffect, useRef } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import {
  deleteImageKitFile,
  IMAGEKIT_AVATAR_MAX_BYTES,
  ImageUploadCanceledError,
  ImageUploadController,
  logImageDiagnostic,
  startImageKitUpload,
  validateImageFileWithSignature
} from '../lib/imagekitMedia';
import { isValidRemoteImageUrl } from '../lib/storageMedia';
import {
  Camera,
  LogOut,
  Sparkles,
  UserCheck,
  Upload,
  AlertCircle,
  Check,
  X,
  RotateCcw
} from 'lucide-react';

const splitSuggestedName = (fullName?: string | null): { first: string; last: string } => {
  const clean = (fullName || '').trim();
  if (!clean || clean === 'طالب/ة علم' || clean === 'المشرف/ة العام/ة') {
    return { first: '', last: '' };
  }
  const parts = clean.split(/\s+/);
  if (parts.length === 1) {
    return { first: parts[0], last: '' };
  }
  return {
    first: parts[0],
    last: parts.slice(1).join(' ')
  };
};

interface PendingImage {
  file: File;
  previewUrl: string;
}

export const CompleteProfile: React.FC = () => {
  const { currentUser, userProfile, completeProfile, patchLocalProfile, signOut } = useAuth();
  const { showSuccess, showError, showInfo } = useToast();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const uploadControllerRef = useRef<ImageUploadController | null>(null);
  const uploadInFlightRef = useRef<boolean>(false);

  const suggested = splitSuggestedName(userProfile?.displayName || currentUser?.displayName);

  const [firstName, setFirstName] = useState<string>(userProfile?.firstName || suggested.first);
  const [lastName, setLastName] = useState<string>(userProfile?.lastName || suggested.last);
  const [photoURL, setPhotoURL] = useState<string>(userProfile?.photoURL || currentUser?.photoURL || '');
  const [photoFileId, setPhotoFileId] = useState<string>(userProfile?.photoFileId || '');
  const [level, setLevel] = useState<'مبتدئ' | 'متوسط' | 'متقدم'>(userProfile?.level || 'مبتدئ');

  const [pendingAvatar, setPendingAvatar] = useState<PendingImage | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [uploadedFileIds, setUploadedFileIds] = useState<string[]>([]);

  useEffect(() => {
    const nextSuggested = splitSuggestedName(userProfile?.displayName || currentUser?.displayName);
    setFirstName((prev) => prev || userProfile?.firstName || nextSuggested.first);
    setLastName((prev) => prev || userProfile?.lastName || nextSuggested.last);
    setPhotoURL((prev) => prev || userProfile?.photoURL || currentUser?.photoURL || '');
    setPhotoFileId((prev) => prev || userProfile?.photoFileId || '');
    if (userProfile?.level) {
      setLevel(userProfile.level);
    }
  }, [userProfile, currentUser]);

  useEffect(() => {
    return () => {
      if (pendingAvatar?.previewUrl) {
        URL.revokeObjectURL(pendingAvatar.previewUrl);
      }
    };
  }, [pendingAvatar]);

  useEffect(() => {
    return () => {
      uploadControllerRef.current?.cancel();
    };
  }, []);

  const displayedPhotoUrl = pendingAvatar?.previewUrl || photoURL;

  const clearPendingAvatar = () => {
    if (pendingAvatar?.previewUrl) {
      URL.revokeObjectURL(pendingAvatar.previewUrl);
    }
    setPendingAvatar(null);
  };

  const handleAvatarSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !currentUser || uploading || uploadInFlightRef.current) return;

    const validation = await validateImageFileWithSignature(file, IMAGEKIT_AVATAR_MAX_BYTES);
    if (!validation.valid) {
      const msg = validation.error || 'ملف الصورة غير صالح.';
      setErrorMsg(msg);
      showError('صورة غير صالحة', msg);
      return;
    }

    setErrorMsg(null);
    if (pendingAvatar?.previewUrl) {
      URL.revokeObjectURL(pendingAvatar.previewUrl);
    }
    const previewUrl = URL.createObjectURL(file);
    setPendingAvatar({ file, previewUrl });
  };

  const handleSaveSelectedAvatar = async () => {
    if (!pendingAvatar || !currentUser || uploading || uploadInFlightRef.current) return;

    uploadInFlightRef.current = true;
    const { file } = pendingAvatar;
    const oldFileId = photoFileId || userProfile?.photoFileId;
    setErrorMsg(null);
    setUploading(true);
    setUploadProgress(0);

    let newlyUploadedFileId: string | null = null;

    try {
      const controller = startImageKitUpload('avatar', file, IMAGEKIT_AVATAR_MAX_BYTES, {
        onProgress: (pct) => setUploadProgress(pct),
      });
      uploadControllerRef.current = controller;

      const uploaded = await controller.promise;
      newlyUploadedFileId = uploaded.fileId;

      try {
        await setDoc(
          doc(db, 'users', currentUser.uid),
          { photoURL: uploaded.url, photoFileId: uploaded.fileId },
          { merge: true }
        );
      } catch (fsErr: any) {
        logImageDiagnostic({
          stage: 'firestore_update',
          purpose: 'avatar',
          errorCode: String(fsErr?.code || 'firestore/update-failed'),
          errorMessage: fsErr?.message || String(fsErr),
        });
        throw new Error(
          fsErr?.message || 'تم رفع الصورة ولكن تعذر حفظ الرابط في قاعدة البيانات (Firestore).'
        );
      }

      patchLocalProfile({ photoURL: uploaded.url, photoFileId: uploaded.fileId });
      setPhotoURL(uploaded.url);
      setPhotoFileId(uploaded.fileId);
      setUploadedFileIds((prev) => [...prev, uploaded.fileId]);

      if (oldFileId && oldFileId !== uploaded.fileId) {
        await deleteImageKitFile(oldFileId, 'avatar');
      }

      URL.revokeObjectURL(pendingAvatar.previewUrl);
      setPendingAvatar(null);
      showSuccess('تم رفع الصورة', 'تم رفع وحفظ صورة ملفك الشخصي بنجاح.');
    } catch (err: any) {
      if (err instanceof ImageUploadCanceledError || err?.code === 'imagekit/canceled') {
        showInfo('تم إلغاء الرفع', 'تم إيقاف رفع الصورة والاحتفاظ بالصورة السابقة.');
        return;
      }

      if (newlyUploadedFileId) {
        await deleteImageKitFile(newlyUploadedFileId, 'avatar');
      }

      const msg = err?.message || 'تعذر رفع أو حفظ الصورة الشخصية، يرجى المحاولة مجدداً.';
      setErrorMsg(msg);
      showError('فشل رفع الصورة', msg);
    } finally {
      uploadControllerRef.current = null;
      uploadInFlightRef.current = false;
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleCancelUpload = () => {
    uploadControllerRef.current?.cancel();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanFirst = firstName.trim();
    const cleanLast = lastName.trim();
    const cleanPhoto = photoURL.trim();

    if (cleanFirst.length < 2 || cleanFirst.length > 40) {
      const msg = 'يرجى إدخال الاسم الأول بشكل صحيح (من حرفين إلى 40 حرفاً).';
      setErrorMsg(msg);
      showError('بيانات غير مكتملة', msg);
      return;
    }

    if (cleanLast.length < 2 || cleanLast.length > 40) {
      const msg = 'يرجى إدخال الكنية أو اسم العائلة بشكل صحيح (من حرفين إلى 40 حرفاً).';
      setErrorMsg(msg);
      showError('بيانات غير مكتملة', msg);
      return;
    }

    if (uploading) {
      showError('جاري الرفع', 'يرجى الانتظار حتى يكتمل رفع الصورة الشخصية.');
      return;
    }

    if (pendingAvatar) {
      const msg = 'لديك صورة مختارة في المعاينة لم تُرفع بعد. اضغطي «حفظ الصورة» أولاً أو ألغِ الاختيار.';
      setErrorMsg(msg);
      showError('الصورة بانتظار الحفظ', msg);
      return;
    }

    if (!cleanPhoto || !isValidRemoteImageUrl(cleanPhoto)) {
      const msg = 'يرجى اختيار ورفع صورة الملف الشخصي أولاً قبل المتابعة إلى المنصة.';
      setErrorMsg(msg);
      showError('الصورة الشخصية مطلوبة', msg);
      return;
    }

    setSaving(true);
    const oldFileId = userProfile?.photoFileId;

    try {
      await completeProfile({
        firstName: cleanFirst,
        lastName: cleanLast,
        photoURL: cleanPhoto,
        ...(photoFileId ? { photoFileId } : {}),
        level
      });

      if (currentUser) {
        const idsToCleanup = new Set<string>();
        if (oldFileId && oldFileId !== photoFileId) {
          idsToCleanup.add(oldFileId);
        }
        uploadedFileIds.forEach((fid) => {
          if (fid && fid !== photoFileId) idsToCleanup.add(fid);
        });
        for (const unusedId of idsToCleanup) {
          await deleteImageKitFile(unusedId, 'avatar');
        }
      }

      showSuccess('مبارك إتمام التسجيل!', `أهلاً بكِ يا ${cleanFirst} ${cleanLast} في مجالس طلبة العلم.`);
    } catch (err: any) {
      const msg = err?.message || 'تعذر حفظ بيانات الملف الشخصي في قاعدة البيانات، يرجى المحاولة مرة أخرى.';
      setErrorMsg(msg);
      showError('تعذر الحفظ', msg);
    } finally {
      setSaving(false);
    }
  };

  const handleCancelAndSignOut = async () => {
    try {
      await signOut();
    } catch {
      showError('خطأ', 'تعذر تسجيل الخروج، يرجى المحاولة مرة أخرى.');
    }
  };

  return (
    <div className="max-w-xl mx-auto my-8 px-4 animate-fade-in" dir="rtl">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-l from-emerald-800 via-teal-800 to-emerald-900 text-white p-6 sm:p-8 text-center relative">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-300/30 text-amber-200 text-xs font-bold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>خطوة أخيرة لفتح أبواب المنصة</span>
          </div>
          <h1 className="text-2xl font-black font-serif">استكمال بيانات الملف الشخصي</h1>
          <p className="text-xs text-emerald-100/85 mt-1.5 leading-relaxed">
            يرجى إدخال اسمكِ الأول وكنيتكِ وإرفاق صورتكِ الشخصية لاعتماد ملفكِ قبل متابعة المجالس العلمية.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-bold space-y-2">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
              {pendingAvatar && !uploading && (
                <div className="flex items-center justify-end">
                  <button
                    type="button"
                    onClick={handleSaveSelectedAvatar}
                    className="px-3 py-1 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-black inline-flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>إعادة المحاولة</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* صورة الملف الشخصي */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <div className="w-28 h-28 rounded-3xl bg-slate-100 dark:bg-slate-800 p-1 shadow-lg border-2 border-emerald-500/40 overflow-hidden">
                {displayedPhotoUrl ? (
                  <img
                    src={displayedPhotoUrl}
                    alt="صورة الملف الشخصي"
                    referrerPolicy="no-referrer"
                    className="w-full h-full rounded-2xl object-cover"
                    onError={() => {
                      if (!pendingAvatar) {
                        setPhotoURL('');
                      }
                    }}
                  />
                ) : (
                  <div className="w-full h-full rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white text-3xl font-black font-serif">
                    {firstName.trim().charAt(0) || 'ط'}
                  </div>
                )}
              </div>

              {pendingAvatar && (
                <span className="absolute -top-2 right-0 bg-amber-500 text-white text-[10px] font-black px-2 py-0.5 rounded-lg shadow-md">
                  معاينة
                </span>
              )}

              <button
                type="button"
                disabled={uploading || saving}
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 p-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl shadow-lg transition-transform active:scale-95 disabled:opacity-50 cursor-pointer"
                title="اختيار صورة شخصية"
              >
                <Camera className="w-4 h-4" />
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleAvatarSelected}
                className="hidden"
              />
            </div>

            <div className="text-center space-y-2 w-full max-w-sm">
              {!pendingAvatar && !uploading && (
                <button
                  type="button"
                  disabled={uploading || saving}
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-bold hover:bg-emerald-100 transition-colors cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{photoURL ? 'اختيار صورة أخرى' : 'اختيار صورة الملف الشخصي *'}</span>
                </button>
              )}

              {pendingAvatar && !uploading && (
                <div className="p-3 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 space-y-2">
                  <p className="text-xs font-extrabold text-emerald-900 dark:text-emerald-200 truncate">
                    معاينة: {pendingAvatar.file.name}
                  </p>
                  <div className="flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={handleSaveSelectedAvatar}
                      className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black inline-flex items-center gap-1.5 shadow-sm cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>حفظ الصورة</span>
                    </button>
                    <button
                      type="button"
                      onClick={clearPendingAvatar}
                      className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>إلغاء</span>
                    </button>
                  </div>
                </div>
              )}

              {uploading && (
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-emerald-200 dark:border-emerald-800/50 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-emerald-700 dark:text-emerald-300">
                    <span>جاري رفع الصورة...</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono">{uploadProgress}%</span>
                      <button
                        type="button"
                        onClick={handleCancelUpload}
                        className="px-2 py-0.5 rounded-lg bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 text-[10px] font-black cursor-pointer"
                      >
                        إلغاء الرفع
                      </button>
                    </div>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                    <div
                      className="h-full bg-emerald-600 transition-all duration-150"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              <p className="text-[11px] text-slate-400">
                الصيغ المسموحة: JPG، JPEG، PNG، WebP (بحد أقصى 5 ميجابايت)
              </p>
            </div>
          </div>

          {/* الاسم الأول والكنية */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold mb-1.5 text-slate-700 dark:text-slate-300">
                الاسم الأول *
              </label>
              <input
                type="text"
                required
                maxLength={40}
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="مثال: عائشة"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold mb-1.5 text-slate-700 dark:text-slate-300">
                الكنية / اسم العائلة *
              </label>
              <input
                type="text"
                required
                maxLength={40}
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="مثال: الفهد"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* المستوى العلمي */}
          <div>
            <label className="block text-xs font-bold mb-2 text-slate-700 dark:text-slate-300">
              المستوى العلمي الحالي
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['مبتدئ', 'متوسط', 'متقدم'] as const).map((lvl) => (
                <button
                  type="button"
                  key={lvl}
                  onClick={() => setLevel(lvl)}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    level === lvl
                      ? 'bg-emerald-600 border-emerald-600 text-white shadow-md'
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          {currentUser?.email && (
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
              <span>البريد الموثق للحساب:</span>
              <span className="font-mono font-bold text-slate-700 dark:text-slate-300" dir="ltr">
                {currentUser.email}
              </span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="submit"
              disabled={saving || uploading}
              className="flex-1 py-3 px-5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-sm shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {saving ? (
                <span>جاري حفظ الملف الشخصي...</span>
              ) : (
                <>
                  <UserCheck className="w-4 h-4" />
                  <span>حفظ وإكمال الملف الشخصي</span>
                </>
              )}
            </button>

            <button
              type="button"
              disabled={saving || uploading}
              onClick={handleCancelAndSignOut}
              className="py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>تسجيل الخروج</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
