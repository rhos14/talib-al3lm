import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { LogIn, Sparkles, ArrowRight, BookOpen } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToRegister: () => void;
  onForgotPassword?: () => void;
}

export const LoginModal: React.FC<Props> = ({ isOpen, onClose, onSwitchToRegister, onForgotPassword }) => {
  const { signInWithGoogle, signInWithEmail, signInAsGuest, loading } = useAuth();
  const { showSuccess, showError } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
      showSuccess("حيّاك الله في مجلسك", "تم التحقق من حساب Google بنجاح");
      onClose();
    } catch (err) {
      showError("تعذر الاتصال", "يرجى المحاولة مرة أخرى أو استخدام الدخول التفاعلي السريع");
    }
  };

  const handleGuestLogin = async () => {
    try {
      await signInAsGuest();
      showSuccess("مرحباً بك كزائر كريم", "يمكنك الآن استعراض جميع المتون والمحاضرات بسهولة");
      onClose();
    } catch (err) {
      showError("حدث خطأ في الدخول كزائر");
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      showError("تنبيه", "يرجى تعبئة جميع الحقول");
      return;
    }
    try {
      await signInWithEmail(email.trim(), password);
      showSuccess("تم تسجيل الدخول بنجاح", "أهلاً بك في مجالس المنصة");
      setPassword('');
      onClose();
    } catch (err: any) {
      console.warn("فشل الدخول بـ Firebase Auth:", err);
      showError("بيانات الدخول غير صحيحة", "يرجى التأكد من البريد الإلكتروني وكلمة المرور أو الدخول كزائر للمعاينة");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="دخول طالب العلم">
      <div className="space-y-6">
        <div className="text-center pb-2">
          <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-950/80 rounded-2xl flex items-center justify-center mx-auto mb-3 text-emerald-600">
            <BookOpen className="w-6 h-6" />
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            أدخل إلى حسابك لمزامنة الأوراد والمتون والفوائد المقيدة عبر جميع أجهزتك
          </p>
        </div>

        {/* زر الدخول المباشر السريع للزوار (الأفضل للتجربة الفورية) */}
        <button
          onClick={handleGuestLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2.5 p-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold shadow-lg shadow-emerald-600/25 transition-all duration-200 active:scale-98"
        >
          <Sparkles className="w-5 h-5" />
          <span>دخول سريع للمعاينة (توصية فورية)</span>
        </button>

        <div className="relative flex items-center justify-center">
          <div className="border-t border-slate-200 dark:border-slate-800 w-full absolute"></div>
          <span className="bg-white dark:bg-slate-900 px-3 text-xs text-slate-400 relative z-10">أو عبر حساب Google</span>
        </div>

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 p-3 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 font-bold text-slate-700 dark:text-slate-200 transition-colors"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
          </svg>
          <span>المتابعة باستخدام Google</span>
        </button>

        <form onSubmit={handleManualSubmit} className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-bold mb-1.5 text-slate-700 dark:text-slate-300">البريد الإلكتروني</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden text-sm"
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">كلمة المرور</label>
              {onForgotPassword && (
                <button
                  type="button"
                  onClick={() => { onClose(); onForgotPassword(); }}
                  className="text-[11px] text-amber-600 dark:text-amber-400 hover:underline font-bold"
                >
                  نسيت كلمة المرور؟
                </button>
              )}
            </div>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden text-sm"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-slate-800 dark:bg-slate-700 hover:bg-slate-700 dark:hover:bg-slate-600 text-white font-bold text-sm transition-colors"
          >
            دخول مباشر بالبريد
          </button>
        </form>

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
          <p className="text-xs text-slate-500">
            ليس لديك حساب بعد؟{' '}
            <button
              onClick={onSwitchToRegister}
              className="text-emerald-600 font-bold hover:underline inline-flex items-center gap-1"
            >
              إنشاء حساب جديد <ArrowRight className="w-3 h-3" />
            </button>
          </p>
        </div>
      </div>
    </Modal>
  );
};
