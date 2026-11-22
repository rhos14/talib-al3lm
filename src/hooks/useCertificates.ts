import { useState, useEffect } from 'react';
import { collection, doc, setDoc, deleteDoc, onSnapshot, query, orderBy, where, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Certificate, CertificateRequest, UserProfile } from '../types';
import { useAuth } from './useAuth';

// Mock values for demo/offline preview
const DEMO_REQUESTS: CertificateRequest[] = [];

const DEMO_CERTIFICATES: Certificate[] = [];

export function useCertificates() {
  const { userProfile, currentUser, isAdmin } = useAuth();
  const [requests, setRequests] = useState<CertificateRequest[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);

  const certReqStorageKey = currentUser?.uid ? `talaba_local_${currentUser.uid}_certificate_requests` : 'talaba_local_guest_certificate_requests';
  const certStorageKey = currentUser?.uid ? `talaba_local_${currentUser.uid}_certificates` : 'talaba_local_guest_certificates';

  useEffect(() => {
    let unsubs: (() => void)[] = [];

    if (!currentUser) {
      setRequests([]);
      setCertificates([]);
      setLoading(false);
      return;
    }

    try {
      // 1. Listen for certificate requests
      const reqCol = collection(db, 'certificate_requests');
      const reqQuery = isAdmin 
        ? query(reqCol, orderBy('timestamp', 'desc'))
        : query(reqCol, where('studentId', '==', currentUser.uid));

      const unsubReq = onSnapshot(reqQuery, (snap) => {
        if (!snap.empty) {
          const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as CertificateRequest));
          setRequests(list);
        } else {
          const localReqs = localStorage.getItem(certReqStorageKey);
          if (localReqs) {
            try {
              const parsed = JSON.parse(localReqs) as CertificateRequest[];
              setRequests(isAdmin ? parsed : parsed.filter(r => r.studentId === currentUser.uid));
            } catch {
              setRequests(DEMO_REQUESTS);
            }
          } else {
            setRequests(DEMO_REQUESTS);
          }
        }
        setLoading(false);
      }, (err) => {
        console.warn("Firestore reqs listening error, using local:", err);
        const localReqs = localStorage.getItem(certReqStorageKey);
        if (localReqs) {
          try {
            const parsed = JSON.parse(localReqs) as CertificateRequest[];
            setRequests(isAdmin ? parsed : parsed.filter(r => r.studentId === currentUser.uid));
          } catch {
            setRequests(DEMO_REQUESTS);
          }
        } else {
          setRequests(DEMO_REQUESTS);
        }
        setLoading(false);
      });

      // 2. Listen for certificates
      // Admin sees all certificates, student sees only their own
      const certCol = collection(db, 'certificates');
      const certQuery = isAdmin
        ? query(certCol, orderBy('createdAt', 'desc'))
        : query(certCol, where('studentId', '==', currentUser.uid));

      const unsubCert = onSnapshot(certQuery, (snap) => {
        if (!snap.empty) {
          const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as Certificate));
          setCertificates(list);
        } else {
          const localCerts = localStorage.getItem(certStorageKey);
          if (localCerts) {
            try {
              const parsed = JSON.parse(localCerts) as Certificate[];
              setCertificates(isAdmin ? parsed : parsed.filter(c => c.studentId === currentUser.uid));
            } catch {
              setCertificates(DEMO_CERTIFICATES);
            }
          } else {
            setCertificates(DEMO_CERTIFICATES);
          }
        }
      }, (err) => {
        console.warn("Firestore certs listening error, using local:", err);
        const localCerts = localStorage.getItem(certStorageKey);
        if (localCerts) {
          try {
            const parsed = JSON.parse(localCerts) as Certificate[];
            setCertificates(isAdmin ? parsed : parsed.filter(c => c.studentId === currentUser.uid));
          } catch {
            setCertificates(DEMO_CERTIFICATES);
          }
        } else {
          setCertificates(DEMO_CERTIFICATES);
        }
      });

      unsubs = [unsubReq, unsubCert];
    } catch (e) {
      console.warn("Certificates onSnapshot failed, using local fallback:", e);
      setLoading(false);
    }

    return () => unsubs.forEach(fn => fn());
  }, [userProfile?.uid, currentUser?.uid, isAdmin]);

  // Request a certificate
  const requestCertificate = async (
    studentProfile: UserProfile,
    courseId: string,
    courseTitle: string,
    bookId: string,
    bookTitle: string,
    isFinalSession?: boolean
  ) => {
    const requestId = `${studentProfile.uid}_${bookId}`;
    const newRequest: CertificateRequest = {
      id: requestId,
      studentId: studentProfile.uid,
      studentName: studentProfile.displayName || studentProfile.name || 'طالب/ة العلم',
      studentEmail: studentProfile.email,
      courseId,
      courseTitle,
      bookId,
      bookTitle,
      timestamp: new Date().toISOString(),
      status: 'pending',
      isFinalSession: !!isFinalSession
    };

    // Update state & localStorage
    setRequests(prev => {
      const exists = prev.some(r => r.id === requestId);
      const updated = exists ? prev.map(r => r.id === requestId ? newRequest : r) : [newRequest, ...prev];
      localStorage.setItem(certReqStorageKey, JSON.stringify(updated));
      return updated;
    });

    // Try Firestore
    if (currentUser && !currentUser.isAnonymous) {
      try {
        await setDoc(doc(db, 'certificate_requests', requestId), newRequest);
      } catch (err) {
        console.warn("Failed saving request to Firestore:", err);
      }
    }
  };

  // Issue Certificate
  const issueCertificate = async (
    requestId: string,
    studentId: string,
    studentName: string,
    courseName: string,
    bookName: string,
    date: string,
    certificateNumber: string,
    issuedBy: string,
    fileUrl?: string
  ) => {
    const certId = `cert-${studentId}-${Date.now()}`;
    const newCert: Certificate = {
      id: certId,
      studentId,
      studentName,
      courseName,
      bookName,
      date,
      certificateNumber,
      issuedBy,
      createdAt: new Date().toISOString(),
      fileUrl
    };

    // Update local certificates
    setCertificates(prev => {
      const updated = [newCert, ...prev];
      localStorage.setItem(certStorageKey, JSON.stringify(updated));
      return updated;
    });

    // Mark request as issued locally
    setRequests(prev => {
      const updated = prev.map(r => r.id === requestId ? { ...r, status: 'issued' as const } : r);
      localStorage.setItem(certReqStorageKey, JSON.stringify(updated));
      return updated;
    });

    // Save to Firestore
    if (currentUser && !currentUser.isAnonymous) {
      try {
        await setDoc(doc(db, 'certificates', certId), newCert);
        await setDoc(doc(db, 'certificate_requests', requestId), { status: 'issued' }, { merge: true });
        
        const studentNotificationId = `notif-cert-issued-${Date.now()}`;
        const studentNotif = {
          id: studentNotificationId,
          title: 'صدرت شهادتكِ الرسمية المباركة 🎓✨',
          body: `مبارك لكِ! قامت المشرفة باعتماد وإصدار شهادة نجاحكِ في كتاب: "${bookName}". يمكنكِ الآن عرضها، تحميلها كـ PDF، أو طباعتها من صندوق الشهادات!`,
          type: 'success',
          timestamp: new Date().toISOString(),
          isRead: false
        };
        await setDoc(doc(db, 'users', studentId, 'notifications', studentNotificationId), studentNotif);
      } catch (err) {
        console.warn("Failed saving certificate to Firestore:", err);
      }
    }
  };

  // Delete/Revoke Certificate
  const deleteCertificate = async (certId: string) => {
    const prevCertificates = [...certificates];

    setCertificates(prev => {
      const updated = prev.filter(c => c.id !== certId);
      localStorage.setItem(certStorageKey, JSON.stringify(updated));
      return updated;
    });

    if (currentUser && !currentUser.isAnonymous) {
      try {
        await deleteDoc(doc(db, 'certificates', certId));
      } catch (err) {
        console.error("[deleteCertificate] Error occurred. Rolling back UI and localStorage.", err);
        setCertificates(prevCertificates);
        localStorage.setItem(certStorageKey, JSON.stringify(prevCertificates));
        throw err;
      }
    }
  };

  // Delete Request
  const deleteRequest = async (requestId: string) => {
    const prevRequests = [...requests];

    setRequests(prev => {
      const updated = prev.filter(r => r.id !== requestId);
      localStorage.setItem(certReqStorageKey, JSON.stringify(updated));
      return updated;
    });

    if (currentUser && !currentUser.isAnonymous) {
      try {
        await deleteDoc(doc(db, 'certificate_requests', requestId));
      } catch (err) {
        console.error("[deleteRequest] Error occurred. Rolling back UI and localStorage.", err);
        setRequests(prevRequests);
        localStorage.setItem(certReqStorageKey, JSON.stringify(prevRequests));
        throw err;
      }
    }
  };

  return {
    requests,
    certificates,
    loading,
    requestCertificate,
    issueCertificate,
    deleteCertificate,
    deleteRequest
  };
}
