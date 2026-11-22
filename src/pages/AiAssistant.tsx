import React, { useState } from 'react';
import { Sparkles, Send, Bot, User, BookOpen, CheckCircle, RefreshCw, Layers } from 'lucide-react';
import { INITIAL_MUTUN } from '../data/mockCurriculum';
import { Matn } from '../types';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  matnTitle?: string;
}

export const AiAssistant: React.FC = () => {
  const defaultMatn: Matn = INITIAL_MUTUN[0] || {
    id: 'default',
    title: 'متن الأصول الثلاثة',
    author: 'الشيخ محمد بن عبد الوهاب',
    category: 'العقيدة',
    level: 'مبتدئ',
    description: 'شرح متن الأصول الثلاثة في توحيد الربوبية والإلهية والولاء والبراء',
    totalChapters: 3
  };

  const [selectedMatn, setSelectedMatn] = useState<Matn>(defaultMatn);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg-1',
      sender: 'assistant',
      text: `أهلاً بك يا طالب العلم! أنا مُراجعك الذكي المتخصص في اختبار المتون الشرعية. اختر متناً من القائمة واطلب مني اختبارك فيه، أو اسألني عن شرح جملة مُشكلة.`,
      matnTitle: defaultMatn.title
    }
  ]);

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg: Message = { id: `m-${Date.now()}`, sender: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    // محاكاة استجابة المعلم الذكي التفاعلية لضمان عدم تعطل الـ Preview
    setTimeout(() => {
      let replyText = '';
      const lower = userMsg.text;

      if (lower.includes('اختبرني') || lower.includes('سؤال')) {
        replyText = `أحسنت بطلب الاختبار في متن "${selectedMatn.title}".\n\nالسؤال المنهجي الأول:\nاذكر الدليل من القرآن الكريم على المسألة الأولى المذكورة في صدر هذا المتن؟ وما وجه الدلالة منه؟`;
      } else if (lower.includes('شرح') || lower.includes('معنى')) {
        replyText = `أما هذه الجملة في متن "${selectedMatn.title}"، فقد قرر شارحوها أن معناها يرتكز على إخلاص التوجه لله وحده، والتحذير من مسالك أهل الجهل، وهو موافق لما قرره شيخ الإسلام في فتاواه.`;
      } else {
        replyText = `بارك الله في همتك. لقد استوعبت جوابك في متن "${selectedMatn.title}".\nهل تحب أن أنتقل معك للباب التالي أم تحب أن أعطيك تمريناً لتثبيت الحفظ؟`;
      }

      setMessages(prev => [...prev, {
        id: `m-${Date.now() + 1}`,
        sender: 'assistant',
        text: replyText,
        matnTitle: selectedMatn.title
      }]);
      setLoading(false);
    }, 900);
  };

  const handleQuickPrompt = (promptText: string) => {
    setInput(promptText);
  };

  return (
    <div className="space-y-6 pb-16 animate-fade-in max-w-4xl mx-auto h-[calc(100vh-140px)] flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4 shrink-0">
        <div>
          <h2 className="text-2xl font-black font-serif text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Sparkles className="w-7 h-7 text-emerald-600 inline animate-pulse" />
            المُراجع الذكي للمتون الشرعية (AI)
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            مُدارسة الحفظ واختبار المتون المعتمدة ومراجعة الشوارد العلمية لحظياً
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-400">تحديد المتن:</span>
          <select
            value={selectedMatn.id}
            onChange={e => {
              const found = INITIAL_MUTUN.find(m => m.id === e.target.value);
              if (found) setSelectedMatn(found);
            }}
            aria-label="تحديد المتن الشرعي"
            className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-extrabold text-emerald-700 dark:text-emerald-300 focus:outline-hidden"
          >
            {INITIAL_MUTUN.length > 0 ? (
              INITIAL_MUTUN.map(m => <option key={m.id} value={m.id}>{m.title}</option>)
            ) : (
              <option value={defaultMatn.id}>{defaultMatn.title}</option>
            )}
          </select>
        </div>
      </div>

      {/* منطقة المحادثة التفاعلية */}
      <div className="flex-1 overflow-y-auto space-y-4 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-slate-200 dark:border-slate-800">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex items-start gap-3.5 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
              msg.sender === 'user'
                ? 'bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900'
                : 'bg-gradient-to-br from-emerald-600 to-teal-600 text-white'
            }`}>
              {msg.sender === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
            </div>

            <div className={`max-w-[80%] p-4 rounded-3xl font-serif text-sm leading-relaxed whitespace-pre-line shadow-xs ${
              msg.sender === 'user'
                ? 'bg-emerald-600 text-white rounded-tl-xs'
                : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tr-xs border border-slate-200/80 dark:border-slate-700/80'
            }`}>
              {msg.matnTitle && msg.sender === 'assistant' && (
                <div className="text-[10px] font-sans font-extrabold text-emerald-600 dark:text-emerald-400 mb-2 flex items-center gap-1 border-b border-slate-100 dark:border-slate-700 pb-1">
                  <BookOpen className="w-3 h-3" /> مدارسة: {msg.matnTitle}
                </div>
              )}
              {msg.text}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-emerald-600 text-white flex items-center justify-center">
              <RefreshCw className="w-4 h-4 animate-spin" />
            </div>
            <div className="p-3.5 bg-white dark:bg-slate-800 rounded-2xl text-xs text-slate-400 animate-pulse">
              يتأمل المُراجع في متن {selectedMatn.title} ويستخرج لك مسألة...
            </div>
          </div>
        )}
      </div>

      {/* التوصيات السريعة */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 shrink-0">
        <span className="text-[11px] font-bold text-slate-400 shrink-0">مقترحات:</span>
        <button
          onClick={() => handleQuickPrompt(`اختبرني بسؤال في متن ${selectedMatn.title}`)}
          className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border hover:border-emerald-500 text-xs font-bold text-slate-600 dark:text-slate-300 shrink-0 transition-colors"
        >
          اختبرني بسؤال في المتن
        </button>
        <button
          onClick={() => handleQuickPrompt(`اشرح لي المسألة الأولى في متن ${selectedMatn.title}`)}
          className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border hover:border-emerald-500 text-xs font-bold text-slate-600 dark:text-slate-300 shrink-0 transition-colors"
        >
          اشرح لي مطلع المتن
        </button>
      </div>

      {/* شريط الكتابة */}
      <form onSubmit={handleSend} className="flex gap-2 shrink-0">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder={`اسأل المعلم الذكي عن متن "${selectedMatn.title}" أو اطلب اختبارك...`}
          className="flex-1 px-5 py-3.5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-serif"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black flex items-center justify-center shadow-lg shadow-emerald-600/20 hover:opacity-95 transition-all disabled:opacity-50"
        >
          <Send className="w-5 h-5 rtl:rotate-180" />
        </button>
      </form>
    </div>
  );
};
