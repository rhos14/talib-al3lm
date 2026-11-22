import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, getDocs, setDoc, doc, deleteDoc } from 'firebase/firestore';

export function useLocalOrCloudStorage<T extends { id: string }>(collectionName: string, initialData: T[]) {
  const { currentUser } = useAuth();
  const scopeId = currentUser && !currentUser.isAnonymous ? currentUser.uid : 'guest';
  const storageKey = `talaba_local_${scopeId}_${collectionName}`;

  const [items, setItems] = useState<T[]>(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        /* ignore */
      }
    }
    return initialData;
  });

  const [loading, setLoading] = useState<boolean>(false);

  // إعادة ضبط البيانات عند تبديل الحساب أو تسجيل الخروج ومزامنتها من Firestore عند التسجيل
  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        setItems(JSON.parse(saved));
      } catch {
        setItems(initialData);
      }
    } else {
      setItems(initialData);
    }

    if (!currentUser || currentUser.isAnonymous) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    const fetchData = async () => {
      try {
        const colRef = collection(db, 'users', currentUser.uid, collectionName);
        const snap = await getDocs(colRef);
        if (cancelled) return;
        if (!snap.empty) {
          const cloudItems = snap.docs.map(d => d.data() as T);
          setItems(cloudItems);
          localStorage.setItem(storageKey, JSON.stringify(cloudItems));
        } else {
          for (const item of initialData) {
            await setDoc(doc(db, 'users', currentUser.uid, collectionName, item.id), item);
          }
        }
      } catch (err) {
        if (!cancelled) {
          console.warn(`تعذر المزامنة السحابية لمجموعة ${collectionName}:`, err);
          handleFirestoreError(err, OperationType.GET, `users/${currentUser.uid}/${collectionName}`);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchData();

    return () => {
      cancelled = true;
    };
  }, [currentUser?.uid, currentUser?.isAnonymous, collectionName, storageKey]);

  const saveItem = async (item: T) => {
    const updated = items.some(i => i.id === item.id)
      ? items.map(i => (i.id === item.id ? item : i))
      : [item, ...items];

    setItems(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));

    if (currentUser && !currentUser.isAnonymous) {
      try {
        await setDoc(doc(db, 'users', currentUser.uid, collectionName, item.id), item);
      } catch (e) {
        console.warn('الحفظ في السحاب تعذر، تم الحفظ محلياً:', e);
        handleFirestoreError(e, OperationType.WRITE, `users/${currentUser.uid}/${collectionName}/${item.id}`);
      }
    }
  };

  const removeItem = async (id: string) => {
    const updated = items.filter(i => i.id !== id);
    setItems(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));

    if (currentUser && !currentUser.isAnonymous) {
      try {
        await deleteDoc(doc(db, 'users', currentUser.uid, collectionName, id));
      } catch (e) {
        console.warn('الحذف من السحاب تعذر، تم الحذف محلياً:', e);
        handleFirestoreError(e, OperationType.DELETE, `users/${currentUser.uid}/${collectionName}/${id}`);
      }
    }
  };

  return { items, setItems, saveItem, removeItem, loading };
}
