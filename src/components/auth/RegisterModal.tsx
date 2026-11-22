import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { UserPlus, Sparkles } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
}

export const RegisterModal: React.FC<Props> = ({ isOpen, onClose, onSwitchToLogin }) => {
  const { signInWithGoogle, signUpWithEmail, loading } = useAuth();
  const { showSuccess, showError } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      showError('خطأ في التحقق', 'يرجى إدخال البريد الإلكتروني وكلمة المرور');
      return;
    }
    if (password.length < 6) {
      showError('كلمة المرور قصيرة', 'يجب أن تتكون كلمة المرور من 6 أحرف على الأقل');
      return;
    }
    if (password !== confirmPassword) {
      showError('عدم تطابق كلمة المرور', 'كلمة المرور وتأكيد كلمة المرور غير متطابقتين');
      return;
    }

    try {
      await signUpWithEmail(email.trim(), password);
      showSuccess('تم إنشاء الحساب', 'يرجى استكمال اسمكِ الأول وكنيتكِ وصورتكِ الشخصية للمتابعة.');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      onClose();
    } catch (err: any) {
      console.warn('فشل إنشاء الحساب:', err);
      const code = err?.code || '';
      if (code === 'auth/email-already-in-use') {
        showError('البريد مسجل مسبقاً', 'هذا البريد الإلكتروني مرتبط بحساب موجود، يمكنكِ تسجيل الدخول مباشرة.');
      } else if (code === 'auth/invalid-email') {
        showError('بريد إلكتروني غير صالح', 'يرجى التحقق من صيغة البريد الإلكتروني المدخل.');
      } else if (code === 'auth/weak-password') {
        showError('كلمة مرور ضعيفة', 'يرجى اختيار كلمة مرور أقوى (6 أحرف فأكثر).');
      } else {
        showError('تعذر إنشاء الحساب', 'حدث خطأ أثناء إنشاء الحساب، يرجى المحاولة مجدداً.');
      }
    }
  };

  const handleGoogleSignup = async () => {
    try {
      await signInWithGoogle();
      showSuccess('تمت المصادقة بنجاح', 'يرجى مراجعة واستكمال بيانات ملفكِ الشخصي للمتابعة.');
      onClose();
    } catch (e: any) {
      showError('تعذر الاتصال بـ Google', 'يرجى المحاولة مرة أخرى.');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="الانضمام لركب طلبة العلم">
      <div className="space-y-5">
        <div className="text-center">
          <div className="w-12 h-12 bg-teal-100 dark:bg-teal-950/80 rounded-2xl flex items-center justify-center mx-auto mb-2 text-teal-600">
            <UserPlus className="w-6 h-6" />
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            «مَن سلك طريقاً يلتمس فيه علماً سهّل الله له به طريقاً إلى الجنة»
          </p>
        </div>

        <button
          onClick={handleGoogleSignup}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 p-3 rounded-xl border-2 border-emerald-500/30 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 font-bold text-slate-800 dark:text-slate-100 transition-colors cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <span>التسجيل باستخدام حساب Google</span>
        </button>

        <div className="relative flex items-center justify-center">
          <div className="border-t border-slate-200 dark:border-slate-800 w-full absolute"></div>
          <span className="bg-white dark:bg-slate-900 px-3 text-xs text-slate-400 relative z-10">
            أو التسجيل بالبريد الإلكتروني
          </span>
        </div>

        <form onSubmit={handleRegisterSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold mb-1.5">البريد الإلكتروني</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="student@example.com"
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden text-left font-mono"
              dir="ltr"
            />
          </div>

          <div>
            <label className="block text-xs font-bold mb-1.5">كلمة المرور</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden text-left font-mono"
              dir="ltr"
            />
          </div>

          <div>
            <label className="block text-xs font-bold mb-1.5">تأكيد كلمة المرور</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden text-left font-mono"
              dir="ltr"
            />
          </div>

          <p className="text-[11px] text-slate-500 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-200/70 dark:border-slate-700/60">
            بعد إنشاء الحساب مباشرة ستنتقل إلى صفحة استكمال الملف الشخصي لإدخال الاسم الأول والكنية ورفع الصورة الشخصية.
          </p>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-extrabold text-sm shadow-lg shadow-emerald-600/20 hover:opacity-95 transition-all mt-2 cursor-pointer"
          >
            إنشاء الحساب والمتابعة لاستكمال الملف
          </button>
        </form>

        <div className="pt-2 text-center text-xs text-slate-500">
          لديك حساب مسبقاً؟{' '}
          <button onClick={onSwitchToLogin} className="text-emerald-600 font-bold hover:underline cursor-pointer">
            تسجيل الدخول
          </button>
        </div>
      </div>
    </Modal>
  );
};
