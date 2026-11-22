import React, { createContext, useState, useEffect, useRef, useCallback } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
  signInAnonymously,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile as firebaseUpdateProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, googleProvider, db } from '../lib/firebase';
import { UserProfile } from '../types';
import { clearAllUserSessionCaches, isValidRemoteImageUrl } from '../lib/storageMedia';
import { buildApiUrl } from '../lib/apiClient';

export function isProfileComplete(profile: UserProfile | null): boolean {
  if (!profile) return false;
  if (profile.profileCompleted === false) return false;
  const hasFirst = Boolean(profile.firstName && profile.firstName.trim().length > 0);
  const hasLast = Boolean(profile.lastName && profile.lastName.trim().length > 0);
  const hasPhoto = Boolean(profile.photoURL && profile.photoURL.trim().length > 0);
  return hasFirst && hasLast && hasPhoto;
}

interface CompleteProfileInput {
  firstName: string;
  lastName: string;
  photoURL: string;
  photoFileId?: string;
  level?: 'مبتدئ' | 'متوسط' | 'متقدم';
}

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isGuest: boolean;
  isAdmin: boolean;
  profileLoadError: string | null;
  refreshClaims: () => Promise<void>;
  reloadUserProfile: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, name?: string) => Promise<void>;
  signInAsGuest: () => Promise<void>;
  signOut: () => Promise<void>;
  completeProfile: (input: CompleteProfileInput) => Promise<void>;
  updateProfileData: (data: Partial<UserProfile>) => Promise<void>;
  patchLocalProfile: (data: Partial<UserProfile>) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_EMAIL = 'wwwhalafaisal18@gmail.com';

const createGuestProfile = (uid = 'guest-visitor'): UserProfile => ({
  uid,
  name: 'طالب/ة علم (زائر)',
  displayName: 'طالب/ة علم (زائر)',
  firstName: 'زائر',
  lastName: 'كريم',
  profileCompleted: true,
  email: 'guest@talaba.elm',
  role: 'student',
  createdAt: new Date().toISOString(),
  level: 'مبتدئ',
  streak: 0,
  completedMutunCount: 0,
  completedBooksCount: 0,
  joinDate: new Date().toLocaleDateString('ar-SA')
});

const stripUndefined = <T extends Record<string, any>>(obj: T): T => {
  const result: Record<string, any> = {};
  Object.keys(obj).forEach((k) => {
    if (obj[k] !== undefined) {
      result[k] = obj[k];
    }
  });
  return result as T;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isGuest, setIsGuest] = useState<boolean>(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [profileLoadError, setProfileLoadError] = useState<string | null>(null);

  const localGuestRef = useRef<boolean>(false);
  const pendingEnsuresRef = useRef<Map<string, Promise<UserProfile>>>(new Map());

  const resolveAdminStatus = useCallback(async (user: User): Promise<{ isAdmin: boolean; hasAdminClaim: boolean }> => {
    let hasAdminClaim = false;
    const isEmailVerified = !!user.emailVerified;
    try {
      const tokenResult = await user.getIdTokenResult();
      if (tokenResult.claims.admin === true || tokenResult.claims.role === 'admin') {
        hasAdminClaim = true;
      }
    } catch (tokenErr) {
      console.warn('Could not read custom claims:', tokenErr);
    }

    const userEmail = (user.email || '').toLowerCase();
    const isRootAdminEmail = userEmail === ADMIN_EMAIL.toLowerCase();

    if (!hasAdminClaim && isRootAdminEmail && isEmailVerified) {
      try {
        const token = await user.getIdToken();
        const syncRes = await fetch(buildApiUrl('/api/admin/claims/sync-self'), {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        if (syncRes.ok) {
          const refreshed = await user.getIdTokenResult(true);
          if (refreshed.claims.admin === true) {
            hasAdminClaim = true;
          }
        }
      } catch (syncErr) {
        console.warn('Auto-sync admin claim note:', syncErr);
      }
    }

    const finalIsAdmin = (hasAdminClaim && isEmailVerified) || (isRootAdminEmail && isEmailVerified);
    return { isAdmin: finalIsAdmin, hasAdminClaim };
  }, []);

  const loadOrCreateUserProfile = useCallback(
    async (user: User, effectiveRole: 'admin' | 'student', hasAdminClaim: boolean): Promise<UserProfile> => {
      if (user.isAnonymous) {
        return createGuestProfile(user.uid);
      }

      const existingPromise = pendingEnsuresRef.current.get(user.uid);
      if (existingPromise) {
        return existingPromise;
      }

      const promise = (async () => {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data() as UserProfile;
          return {
            ...data,
            uid: user.uid,
            role: effectiveRole
          };
        }

        const fallbackName = user.displayName?.trim() || (effectiveRole === 'admin' ? 'المشرف/ة العام/ة' : 'طالب/ة علم');
        const newProfile: UserProfile = stripUndefined({
          uid: user.uid,
          name: fallbackName,
          displayName: fallbackName,
          email: user.email || '',
          role: hasAdminClaim ? effectiveRole : 'student',
          createdAt: new Date().toISOString(),
          level: 'مبتدئ',
          streak: 0,
          completedMutunCount: 0,
          completedBooksCount: 0,
          photoURL: user.photoURL || undefined,
          joinDate: new Date().toLocaleDateString('ar-SA'),
          profileCompleted: false
        });

        await setDoc(docRef, newProfile);
        return {
          ...newProfile,
          role: effectiveRole
        };
      })();

      pendingEnsuresRef.current.set(user.uid, promise);
      try {
        return await promise;
      } finally {
        pendingEnsuresRef.current.delete(user.uid);
      }
    },
    []
  );

  const refreshClaims = async () => {
    if (!auth.currentUser) return;
    try {
      const tokenResult = await auth.currentUser.getIdTokenResult(true);
      const hasClaim = tokenResult.claims.admin === true || tokenResult.claims.role === 'admin';
      const isVerified = !!auth.currentUser.emailVerified;
      const isRootAdmin = (auth.currentUser.email || '').toLowerCase() === ADMIN_EMAIL.toLowerCase();

      const finalAdmin = (hasClaim && isVerified) || (isRootAdmin && isVerified);
      setIsAdmin(finalAdmin);
      setUserProfile((prev) => (prev ? { ...prev, role: finalAdmin ? 'admin' : 'student' } : null));
    } catch (err) {
      console.warn('Could not refresh token claims:', err);
    }
  };

  const reloadUserProfile = useCallback(async () => {
    const user = auth.currentUser;
    if (!user) return;
    setLoading(true);
    setProfileLoadError(null);
    try {
      const { isAdmin: finalIsAdmin, hasAdminClaim } = await resolveAdminStatus(user);
      setIsAdmin(finalIsAdmin);
      const profile = await loadOrCreateUserProfile(user, finalIsAdmin ? 'admin' : 'student', hasAdminClaim);
      setUserProfile(profile);
    } catch (err: any) {
      console.warn('تعذر إعادة تحميل ملف تعريف Firestore:', err);
      setProfileLoadError('تعذر الاتصال بقاعدة البيانات لتحميل ملفك الشخصي. يرجى المحاولة مجدداً.');
    } finally {
      setLoading(false);
    }
  }, [loadOrCreateUserProfile, resolveAdminStatus]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      setProfileLoadError(null);

      if (user) {
        localGuestRef.current = false;
        setCurrentUser(user);
        setIsGuest(user.isAnonymous);

        if (user.isAnonymous) {
          setIsAdmin(false);
          setUserProfile(createGuestProfile(user.uid));
          setLoading(false);
          return;
        }

        try {
          const { isAdmin: finalIsAdmin, hasAdminClaim } = await resolveAdminStatus(user);
          setIsAdmin(finalIsAdmin);
          const effectiveRole: 'admin' | 'student' = finalIsAdmin ? 'admin' : 'student';
          const profile = await loadOrCreateUserProfile(user, effectiveRole, hasAdminClaim);
          setUserProfile(profile);
        } catch (error) {
          console.warn('تعذر جلب أو إنشاء ملف تعريف Firestore:', error);
          setProfileLoadError('تعذر تحميل ملفك الشخصي من قاعدة البيانات. يرجى إعادة المحاولة.');
          setUserProfile(null);
        }
      } else {
        setCurrentUser(null);
        setIsAdmin(false);
        if (localGuestRef.current) {
          setIsGuest(true);
          setUserProfile(createGuestProfile());
        } else {
          setIsGuest(false);
          setUserProfile(null);
        }
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, [loadOrCreateUserProfile, resolveAdminStatus]);

  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      localGuestRef.current = false;
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('خطأ في تسجيل الدخول عبر Google:', error);
      setLoading(false);
      throw error;
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    setLoading(true);
    try {
      localGuestRef.current = false;
      await signInWithEmailAndPassword(auth, email.trim(), pass);
    } catch (error) {
      console.error('خطأ في تسجيل الدخول بالبريد:', error);
      setLoading(false);
      throw error;
    }
  };

  const signUpWithEmail = async (email: string, pass: string, name?: string) => {
    setLoading(true);
    try {
      localGuestRef.current = false;
      const cleanEmail = email.trim();
      const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, pass);
      const user = userCredential.user;

      if (name?.trim()) {
        await firebaseUpdateProfile(user, { displayName: name.trim() });
      }

      const profile = await loadOrCreateUserProfile(user, 'student', false);
      setIsAdmin(false);
      setIsGuest(false);
      setCurrentUser(user);
      setUserProfile(profile);
    } catch (error) {
      console.error('خطأ في إنشاء الحساب الجديد:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signInAsGuest = async () => {
    setLoading(true);
    try {
      await signInAnonymously(auth);
    } catch (error) {
      console.warn('تعذر الاتصال بالمصادقة المجهولة، تفعيل الزائر المحلي:', error);
      localGuestRef.current = true;
      setCurrentUser(null);
      setIsGuest(true);
      setIsAdmin(false);
      setProfileLoadError(null);
      setUserProfile(createGuestProfile());
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      localGuestRef.current = false;
      await firebaseSignOut(auth);
      clearAllUserSessionCaches();
      setCurrentUser(null);
      setUserProfile(null);
      setIsGuest(false);
      setIsAdmin(false);
      setProfileLoadError(null);
    } catch (error) {
      console.error('خطأ في تسجيل الخروج:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const completeProfile = async ({ firstName, lastName, photoURL, photoFileId, level }: CompleteProfileInput) => {
    const user = auth.currentUser;
    if (!user || user.isAnonymous) {
      throw new Error('يجب تسجيل الدخول بحساب فعلي أولاً لاستكمال الملف الشخصي.');
    }

    const cleanFirst = firstName.trim();
    const cleanLast = lastName.trim();
    const cleanPhoto = photoURL.trim();
    const cleanFileId = photoFileId?.trim();

    if (!cleanFirst || !cleanLast) {
      throw new Error('يرجى إدخال الاسم الأول والكنية.');
    }
    if (!cleanPhoto || !isValidRemoteImageUrl(cleanPhoto)) {
      throw new Error('صورة الملف الشخصي يجب أن تكون مرفوعة بنجاح إلى المخزن السحابي (رابط https صالح) قبل الحفظ.');
    }

    const fullName = `${cleanFirst} ${cleanLast}`;
    const docRef = doc(db, 'users', user.uid);

    const payload = stripUndefined({
      firstName: cleanFirst,
      lastName: cleanLast,
      name: fullName,
      displayName: fullName,
      photoURL: cleanPhoto,
      ...(cleanFileId !== undefined ? { photoFileId: cleanFileId } : {}),
      profileCompleted: true,
      ...(level ? { level } : {})
    });

    await setDoc(docRef, payload, { merge: true });

    try {
      await firebaseUpdateProfile(user, {
        displayName: fullName,
        photoURL: cleanPhoto
      });
    } catch (authProfileErr) {
      console.warn('تم الحفظ في قاعدة البيانات وتعذر تحديث بيانات Auth الثانوية:', authProfileErr);
    }

    setUserProfile((prev) =>
      prev
        ? {
            ...prev,
            ...payload
          }
        : {
            uid: user.uid,
            email: user.email || '',
            role: isAdmin ? 'admin' : 'student',
            createdAt: new Date().toISOString(),
            streak: 0,
            completedMutunCount: 0,
            completedBooksCount: 0,
            joinDate: new Date().toLocaleDateString('ar-SA'),
            ...payload
          }
    );
  };

  const patchLocalProfile = useCallback((data: Partial<UserProfile>) => {
    const clean = stripUndefined({ ...data });
    setUserProfile((prev) => (prev ? { ...prev, ...clean } : prev));
  }, []);

  const updateProfileData = async (data: Partial<UserProfile>) => {
    const sanitizedData = stripUndefined({ ...data });
    delete (sanitizedData as any).role;
    delete (sanitizedData as any).uid;
    delete (sanitizedData as any).email;
    delete (sanitizedData as any).totalStudyHours;
    delete (sanitizedData as any).points;

    if (sanitizedData.firstName !== undefined && sanitizedData.lastName !== undefined) {
      const fullName = `${sanitizedData.firstName.trim()} ${sanitizedData.lastName.trim()}`.trim();
      if (fullName) {
        sanitizedData.displayName = fullName;
        sanitizedData.name = fullName;
      }
    }

    if (sanitizedData.photoURL !== undefined) {
      const trimmedPhoto = String(sanitizedData.photoURL || '').trim();
      if (trimmedPhoto && !isValidRemoteImageUrl(trimmedPhoto)) {
        throw new Error('رابط الصورة الشخصية غير صالح للحفظ. يرجى رفع الصورة أولاً إلى المخزن السحابي.');
      }
      sanitizedData.photoURL = trimmedPhoto;
    }

    if (isGuest || !currentUser || currentUser.isAnonymous) {
      setUserProfile((prev) => (prev ? { ...prev, ...sanitizedData } : prev));
      return;
    }

    // لا ترسل حقول الإنجاز المحمية قواعدياً إلى Firestore مباشرة من العميل
    const firestorePayload = { ...sanitizedData };
    delete (firestorePayload as any).streak;
    delete (firestorePayload as any).lastStreakDate;
    delete (firestorePayload as any).completedMutunCount;
    delete (firestorePayload as any).completedBooksCount;

    if (Object.keys(firestorePayload).length > 0) {
      const docRef = doc(db, 'users', currentUser.uid);
      await setDoc(docRef, firestorePayload, { merge: true });
    }

    const authUpdates: { displayName?: string; photoURL?: string } = {};
    if (sanitizedData.displayName) authUpdates.displayName = sanitizedData.displayName;
    if (sanitizedData.photoURL) authUpdates.photoURL = sanitizedData.photoURL;
    if (Object.keys(authUpdates).length > 0 && auth.currentUser) {
      try {
        await firebaseUpdateProfile(auth.currentUser, authUpdates);
      } catch (err) {
        console.warn('تعذر مزامنة ملف Firebase Auth:', err);
      }
    }

    setUserProfile((prev) => (prev ? { ...prev, ...sanitizedData } : prev));
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        loading,
        isGuest,
        isAdmin,
        profileLoadError,
        refreshClaims,
        reloadUserProfile,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        signInAsGuest,
        signOut,
        completeProfile,
        updateProfileData,
        patchLocalProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
