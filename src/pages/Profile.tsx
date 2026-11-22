import React, { useState, useEffect, useRef } from 'react';
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
import {
  Mail,
  Award,
  BookOpen,
  ShieldCheck,
  Camera,
  Sparkles,
  Edit3,
  Save,
  LogOut,
  Flame,
  Upload,
  X,
  AlertCircle,
  Check,
  RotateCcw
} from 'lucide-react';

const splitNameFallback = (fullName?: string): { first: string; last: string } => {
  const clean = (fullName || '').trim();
  if (!clean) return { first: '', last: '' };
  const parts = clean.split(/\s+/);
  return {
    first: parts[0] || '',
    last: parts.slice(1).join(' ')
  };
};

interface PendingImage {
  file: File;
  previewUrl: string;
}

export const Profile: React.FC = () => {
  const { currentUser, userProfile, updateProfileData, signOut, isGuest } = useAuth();
  const { showSuccess, showError, showInfo } = useToast();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const uploadControllerRef = useRef<ImageUploadController | null>(null);
  const uploadInFlightRef = useRef<boolean>(false);

  const suggested = splitNameFallback(userProfile?.displayName || userProfile?.name);

  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState(userProfile?.firstName || suggested.first);
  const [lastName, setLastName] = useState(userProfile?.lastName || suggested.last);
  const [bio, setBio] = useState(userProfile?.bio || '');
  const [level, setLevel] = useState<'مبتدئ' | 'متوسط' | 'متقدم'>(userProfile?.level || 'مبتدئ');
  const [photoError, setPhotoError] = useState(false);

  const [pendingAvatar, setPendingAvatar] = useState<PendingImage | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [avatarErrorMsg, setAvatarErrorMsg] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (userProfile) {
      const nextSuggested = splitNameFallback(userProfile.displayName || userProfile.name);
      setFirstName(userProfile.firstName || nextSuggested.first);
      setLastName(userProfile.lastName || nextSuggested.last);
      setBio(userProfile.bio || '');
      setLevel(userProfile.level || 'مبتدئ');
      setPhotoError(false);
    }
  }, [userProfile]);

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

  const resolvedFullName = `${firstName} ${lastName}`.trim() || userProfile?.displayName || userProfile?.name || 'طالب/ة العلم';
  const emailDisplay = currentUser?.email || userProfile?.email || '';
  const displayedAvatarUrl = pendingAvatar?.previewUrl || userProfile?.photoURL || '';

  const clearPendingAvatar = () => {
    if (pendingAvatar?.previewUrl) {
      URL.revokeObjectURL(pendingAvatar.previewUrl);
    }
    setPendingAvatar(null);
    setAvatarErrorMsg(null);
  };

  const handleAvatarSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !currentUser || isGuest || uploadingPhoto || uploadInFlightRef.current) return;

    const check = await validateImageFileWithSignature(file, IMAGEKIT_AVATAR_MAX_BYTES);
    if (!check.valid) {
      const msg = check.error || 'نوع أو حجم الصورة غير مدعوم.';
      setAvatarErrorMsg(msg);
      showError('صورة غير صالحة', msg);
      return;
    }

    setAvatarErrorMsg(null);
    if (pendingAvatar?.previewUrl) {
      URL.revokeObjectURL(pendingAvatar.previewUrl);
    }

    const previewUrl = URL.createObjectURL(file);
    setPendingAvatar({ file, previewUrl });
    setPhotoError(false);
  };

  const handleSaveAvatar = async () => {
    if (!pendingAvatar || !currentUser || isGuest || uploadingPhoto || uploadInFlightRef.current) return;

    uploadInFlightRef.current = true;
    const { file } = pendingAvatar;
    const oldFileId = userProfile?.photoFileId;
    setAvatarErrorMsg(null);
    setUploadingPhoto(true);
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
        await updateProfileData({
          photoURL: uploaded.url,
          photoFileId: uploaded.fileId,
        });
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

      // حذف الصورة القديمة على ImageKit فقط بعد نجاح حفظ Firestore وعدم مطابقة المعرّف الجديد
      if (oldFileId && oldFileId !== uploaded.fileId) {
        await deleteImageKitFile(oldFileId, 'avatar');
      }

      URL.revokeObjectURL(pendingAvatar.previewUrl);
      setPendingAvatar(null);
      setPhotoError(false);
      showSuccess('تم تحديث الصورة', 'تم رفع وحفظ صورة ملفك الشخصي بنجاح.');
    } catch (err: any) {
      if (err instanceof ImageUploadCanceledError || err?.code === 'imagekit/canceled') {
        showInfo('تم إلغاء الرفع', 'تم إيقاف رفع الصورة والاحتفاظ بالصورة السابقة.');
        return;
      }

      // إذا فشل تحديث Firestore بعد نجاح الرفع، نحذف الصورة اليتيمة الجديدة ونحتفظ بالصورة القديمة
      if (newlyUploadedFileId) {
        await deleteImageKitFile(newlyUploadedFileId, 'avatar');
      }

      const msg =
        err?.message ||
        'تعذر رفع أو حفظ الصورة، يرجى التحقق من الاتصال والمحاولة مجدداً.';
      setAvatarErrorMsg(msg);
      showError('فشل تحديث الصورة', msg);
    } finally {
      uploadControllerRef.current = null;
      uploadInFlightRef.current = false;
      setUploadingPhoto(false);
      setUploadProgress(0);
    }
  };

  const handleCancelUpload = () => {
    uploadControllerRef.current?.cancel();
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanFirst = firstName.trim();
    const cleanLast = lastName.trim();

    if (cleanFirst.length < 2 || cleanFirst.length > 40) {
      showError('الاسم الأول غير صالح', 'يجب أن يكون الاسم الأول بين حرفين و40 حرفاً.');
      return;
    }
    if (cleanLast.length < 2 || cleanLast.length > 40) {
      showError('الكنية غير صالحة', 'يجب أن تكون الكنية بين حرفين و40 حرفاً.');
      return;
    }

    setSaving(true);
    try {
      const fullName = `${cleanFirst} ${cleanLast}`;
      await updateProfileData({
        firstName: cleanFirst,
        lastName: cleanLast,
        displayName: fullName,
        name: fullName,
        bio: bio.trim().slice(0, 300),
        level
      });
      showSuccess('تم التحديث', 'تم حفظ بيانات ملفك الشخصي بنجاح.');
      setIsEditing(false);
    } catch (err: any) {
      showError('خطأ في التحديث', err?.message || 'لم نتمكن من حفظ التغييرات حالياً.');
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      showSuccess('تم تسجيل الخروج', 'تم إنهاء جلستك بأمان.');
    } catch {
      showError('خطأ في الخروج', 'تعذر تسجيل الخروج، يرجى المحاولة مرة أخرى.');
    }
  };

  // أوسمة ديناميكية تعتمد على إحصائيات حقيقية من Firebase
  const isEarlyBirdUnlocked = (userProfile?.streak || 0) > 0;
  const isWriterUnlocked = (userProfile?.completedBooksCount || 0) >= 1 || (userProfile?.streak || 0) >= 7;
  const isFinisherUnlocked = (userProfile?.completedMutunCount || 0) > 0;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-12" dir="rtl">
      {/* الترويسة وبطاقة الهوية */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-36 bg-gradient-to-r from-emerald-800 via-teal-800 to-amber-700 opacity-90"></div>
        <div className="absolute top-4 left-6 z-10 flex items-center gap-2 bg-amber-400/20 backdrop-blur-md px-3 py-1 rounded-full border border-amber-300/30 text-amber-100 text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>{userProfile?.role === 'admin' ? 'المشرفة العامة' : 'مقيد بالبرنامج الأكاديمي'}</span>
        </div>

        <div className="relative pt-20 flex flex-col sm:flex-row items-center sm:items-end gap-6">
          <div className="relative">
            <div className="w-28 h-28 rounded-3xl bg-white dark:bg-slate-800 p-1.5 shadow-2xl border-2 border-amber-400 overflow-hidden">
              {displayedAvatarUrl && !photoError ? (
                <img
                  src={displayedAvatarUrl}
                  alt={resolvedFullName}
                  referrerPolicy="no-referrer"
                  onError={() => {
                    if (!pendingAvatar) {
                      setPhotoError(true);
                    }
                  }}
                  className="w-full h-full rounded-2xl object-cover"
                />
              ) : (
                <div className="w-full h-full rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white text-4xl font-black font-serif">
                  {resolvedFullName.charAt(0) || 'ط'}
                </div>
              )}
            </div>

            {pendingAvatar && (
              <span className="absolute -top-2 right-0 bg-amber-500 text-white text-[10px] font-black px-2 py-0.5 rounded-lg shadow-md">
                معاينة
              </span>
            )}

            {!isGuest && (
              <>
                <button
                  type="button"
                  disabled={uploadingPhoto}
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-1 right-1 p-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl shadow-lg transition-transform active:scale-95 disabled:opacity-50 cursor-pointer"
                  title="اختيار صورة شخصية جديدة"
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
              </>
            )}
          </div>

          <div className="flex-1 text-center sm:text-right space-y-2.5 w-full">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black font-serif text-slate-800 dark:text-slate-100">
                  {resolvedFullName}
                </h1>
                {emailDisplay && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-mono inline-flex items-center gap-1.5 mt-1" dir="ltr">
                    <Mail className="w-3.5 h-3.5 text-emerald-600" /> {emailDisplay}
                  </p>
                )}
              </div>

              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 font-bold text-xs inline-flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-700 transition-all self-center sm:self-auto cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" /> تعديل البيانات والنبذة
                </button>
              )}
            </div>

            {!isGuest && !pendingAvatar && !uploadingPhoto && (
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-0.5">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[11px] font-bold transition-colors cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>تغيير الصورة الشخصية</span>
                </button>
              </div>
            )}

            {pendingAvatar && !uploadingPhoto && (
              <div className="p-3 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 max-w-md mx-auto sm:mx-0">
                <div className="text-right min-w-0">
                  <p className="text-xs font-extrabold text-emerald-900 dark:text-emerald-200 truncate">
                    معاينة الصورة المختارة: {pendingAvatar.file.name}
                  </p>
                  <p className="text-[10px] text-emerald-700 dark:text-emerald-400">
                    اضغطي «حفظ الصورة» لبدء الرفع الفعلي وتحديث ملفك الشخصي.
                  </p>
                </div>
                <div className="flex items-center justify-center sm:justify-end gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={handleSaveAvatar}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black inline-flex items-center gap-1.5 shadow-sm cursor-pointer"
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

            {uploadingPhoto && (
              <div className="max-w-md mx-auto sm:mx-0 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-emerald-200 dark:border-emerald-800/50 space-y-2">
                <div className="flex items-center justify-between gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                  <span>جاري رفع الصورة الجديدة...</span>
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

            {avatarErrorMsg && !uploadingPhoto && (
              <div className="max-w-md mx-auto sm:mx-0 p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-bold space-y-2 text-right">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{avatarErrorMsg}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAvatarErrorMsg(null)}
                    className="text-rose-400 hover:text-rose-600 shrink-0 cursor-pointer"
                    aria-label="إغلاق رسالة الخطأ"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                {pendingAvatar && (
                  <div className="flex items-center justify-end">
                    <button
                      type="button"
                      onClick={handleSaveAvatar}
                      className="px-3 py-1 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-black inline-flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>إعادة المحاولة</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* النبذة العلمية وتعديل البيانات */}
        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
          {isEditing ? (
            <form onSubmit={handleSave} className="space-y-4 animate-slide-up">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold mb-2 text-slate-700 dark:text-slate-300">
                    الاسم الأول *
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    maxLength={40}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-2 text-slate-700 dark:text-slate-300">
                    الكنية / اسم العائلة *
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    maxLength={40}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold mb-2 text-slate-700 dark:text-slate-300">
                  المستوى الأكاديمي
                </label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value as 'مبتدئ' | 'متوسط' | 'متقدم')}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                >
                  <option value="مبتدئ">مبتدئ (مرحلة التأصيل)</option>
                  <option value="متوسط">متوسط (مرحلة البناء والتحصيل)</option>
                  <option value="متقدم">متقدم (مرحلة التمكن العلمي)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold mb-2 text-slate-700 dark:text-slate-300">
                  نبذة عن همتك وهدفك العلمي في المنصة
                </label>
                <textarea
                  rows={3}
                  maxLength={300}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="اكتب نبذة مختصرة عن هدفك العلمي..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs leading-relaxed focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={saving || uploadingPhoto}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black text-xs shadow-md hover:opacity-95 inline-flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'جاري الحفظ...' : 'حفظ التعديلات'}</span>
                </button>
              </div>
            </form>
          ) : (
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl">
              {bio || 'لا توجد نبذة بعد — يمكنكِ إضافة نبذة تعريفية وهدفكِ العلمي من زر التعديل.'}
            </p>
          )}
        </div>
      </div>

      {/* شريط الإحصائيات الأكاديمية */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm text-center">
          <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-2">
            <BookOpen className="w-5 h-5" />
          </div>
          <span className="block text-xl font-black text-slate-800 dark:text-slate-100">{userProfile?.completedMutunCount || 0}</span>
          <span className="text-[11px] text-slate-500 font-bold">متون مشروحة المقررة</span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm text-center">
          <div className="w-10 h-10 bg-amber-100 dark:bg-amber-950/60 text-amber-600 rounded-xl flex items-center justify-center mx-auto mb-2">
            <Award className="w-5 h-5" />
          </div>
          <span className="block text-xl font-black text-slate-800 dark:text-slate-100">{userProfile?.completedBooksCount || 0}</span>
          <span className="text-[11px] text-slate-500 font-bold">كتب منجزة ومعتمدة</span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm text-center">
          <div className="w-10 h-10 bg-orange-100 dark:bg-orange-950/60 text-orange-600 rounded-xl flex items-center justify-center mx-auto mb-2">
            <Flame className="w-5 h-5" />
          </div>
          <span className="block text-xl font-black text-slate-800 dark:text-slate-100">{userProfile?.streak || 0}</span>
          <span className="text-[11px] text-slate-500 font-bold">أيام الاستمرار والورد</span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm text-center">
          <div className="w-10 h-10 bg-purple-100 dark:bg-purple-950/60 text-purple-600 rounded-xl flex items-center justify-center mx-auto mb-2">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <span className="block text-xl font-black text-slate-800 dark:text-slate-100">{userProfile?.level || 'مبتدئ'}</span>
          <span className="text-[11px] text-slate-500 font-bold">الرتبة الأكاديمية</span>
        </div>
      </div>

      {/* قسم الإنجازات والأوسمة */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
        <h3 className="text-lg font-black font-serif text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-500" /> أوسمة المجالس العلمية
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className={`p-4 rounded-2xl border transition-all flex items-center gap-3 ${
            isEarlyBirdUnlocked
              ? 'bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-950/30 dark:to-slate-800/50 border-amber-200/60 dark:border-amber-800/40'
              : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 opacity-60'
          }`}>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black shadow-md shrink-0 ${
              isEarlyBirdUnlocked ? 'bg-amber-500 text-white' : 'bg-slate-300 dark:bg-slate-700 text-slate-500'
            }`}>
              {isEarlyBirdUnlocked ? '🎖️' : '🔒'}
            </div>
            <div>
              <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200">الباكر في طلب العلم</h4>
              <p className="text-[10px] text-slate-500 mt-0.5">
                {isEarlyBirdUnlocked ? 'المواظبة على الورد اليومي ومجالس العلم' : 'يتطلب تسجيل حضور الورد اليومي'}
              </p>
            </div>
          </div>

          <div className={`p-4 rounded-2xl border transition-all flex items-center gap-3 ${
            isWriterUnlocked
              ? 'bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-950/30 dark:to-slate-800/50 border-emerald-200/60 dark:border-emerald-800/40'
              : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 opacity-60'
          }`}>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black shadow-md shrink-0 ${
              isWriterUnlocked ? 'bg-emerald-600 text-white' : 'bg-slate-300 dark:bg-slate-700 text-slate-500'
            }`}>
              {isWriterUnlocked ? '📜' : '🔒'}
            </div>
            <div>
              <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200">صاحب القلم المقيد</h4>
              <p className="text-[10px] text-slate-500 mt-0.5">
                {isWriterUnlocked ? 'أتممتِ إنجاز كتاب معتمد أو مواظبة ٧ أيام' : 'يتطلب إنجاز كتاب معتمد أو استمرار ٧ أيام'}
              </p>
            </div>
          </div>

          <div className={`p-4 rounded-2xl border transition-all flex items-center gap-3 ${
            isFinisherUnlocked
              ? 'bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/30 dark:to-slate-800/50 border-purple-200/60 dark:border-purple-800/40'
              : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 opacity-60'
          }`}>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black shadow-md shrink-0 ${
              isFinisherUnlocked ? 'bg-purple-600 text-white' : 'bg-slate-300 dark:bg-slate-700 text-slate-500'
            }`}>
              {isFinisherUnlocked ? '🎓' : '🔒'}
            </div>
            <div>
              <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200">خاتم المتون والكتب</h4>
              <p className="text-[10px] text-slate-500 mt-0.5">
                {isFinisherUnlocked ? 'إتمام المتون والكتب المقررة' : 'يتطلب إتمام كتاب أو متن بالكامل'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* زر تسجيل الخروج في الأسفل */}
      <div className="text-center pt-4">
        <button
          onClick={handleSignOut}
          className="px-6 py-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 text-rose-600 dark:text-rose-400 font-black text-xs inline-flex items-center gap-2 border border-rose-200 dark:border-rose-800 transition-all cursor-pointer"
        >
          <LogOut className="w-4 h-4" /> تسجيل الخروج من المنصة
        </button>
      </div>
    </div>
  );
};
