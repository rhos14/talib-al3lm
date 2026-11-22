import React, { useState } from 'react';
import { Faidah } from '../types';
import { INITIAL_FAWAID } from '../data/mockCurriculum';
import { useLocalOrCloudStorage } from '../hooks/useFirestore';
import { useToast } from '../hooks/useToast';
import { Modal } from '../components/common/Modal';
import { 
  Bookmark, 
  Plus, 
  Search, 
  Star, 
  Trash2, 
  Tag, 
  BookOpen, 
  Copy,
  Download
} from 'lucide-react';

export const Fawaid: React.FC = () => {
  const { items: fawaid, saveItem, removeItem } = useLocalOrCloudStorage<Faidah>('fawaid', INITIAL_FAWAID);
  const { showSuccess } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterFavOnly, setFilterFavOnly] = useState(false);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);

  // حقول الفائدة الجديدة
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('الفقه');
  const [sourceBook, setSourceBook] = useState('');
  const [sheikh, setSheikh] = useState('');

  const filtered = fawaid.filter(f => {
    const matchSearch = f.title.includes(searchQuery) || f.content.includes(searchQuery);
    const matchFav = !filterFavOnly || f.isFavorite;
    return matchSearch && matchFav;
  });

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;

    const newFaidah: Faidah = {
      id: `faid_${Math.random().toString(36).substring(2, 9)}`,
      title,
      content,
      category,
      sourceBook: sourceBook || 'قيد حر',
      sheikh: sheikh || undefined,
      createdAt: new Date().toLocaleDateString('ar-SA'),
      tags: [category, 'فوائد']
    };

    await saveItem(newFaidah);
    showSuccess("تم التقييد بامتياز", "أُضيفت الفائدة إلى دفترك المنهجي");
    setIsNewModalOpen(false);
    setTitle(''); setContent(''); setSourceBook(''); setSheikh('');
  };

  const toggleFavorite = async (faid: Faidah) => {
    await saveItem({ ...faid, isFavorite: !faid.isFavorite });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showSuccess("تم النسخ", "يمكنك الآن لصق الفائدة ومشاركتها مع إخوانك");
  };

  const exportFawaidJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(fawaid, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute("download", "talaba_fawaid_backup.json");
    dlAnchor.click();
    showSuccess("تم التصدير", "حُفظت نسخة احتياطية من جميع فوائدك");
  };

  return (
    <div className="space-y-6 pb-16 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h2 className="text-2xl font-black font-serif text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Bookmark className="w-7 h-7 text-emerald-600 inline" />
            دفتر الفوائد والفرائد الشرعية
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            «العلم صيد والكتابة قيده». مستودعك الخاص لتقييد النفائس العلمية وتصنيفها
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={exportFawaidJson}
            className="px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span className="hidden sm:inline">تصدير الدفتر</span>
          </button>
          <button
            onClick={() => setIsNewModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/20 flex items-center gap-1.5 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>تقييد فائدة جديدة</span>
          </button>
        </div>
      </div>

      {/* شريط البحث والفرز */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="بحث في متن الفائدة أو عنوانها..."
            className="w-full pr-10 pl-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
          />
        </div>
        <button
          onClick={() => setFilterFavOnly(!filterFavOnly)}
          className={`w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${
            filterFavOnly
              ? 'bg-amber-500 text-white shadow-md'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
          }`}
        >
          <Star className={`w-4 h-4 ${filterFavOnly ? 'fill-white' : ''}`} />
          <span>النفائس المميزة فقط</span>
        </button>
      </div>

      {/* قائمة الفوائد */}
      <div className="grid grid-cols-1 gap-4">
        {filtered.map(faid => (
          <div
            key={faid.id}
            className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-emerald-500/40 transition-all duration-200 relative group"
          >
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[11px] font-black">
                  {faid.category}
                </span>
                <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
                  <BookOpen className="w-3 h-3" /> {faid.sourceBook} {faid.sheikh ? `(${faid.sheikh})` : ''}
                </span>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => copyToClipboard(`${faid.title}\n\n${faid.content}\n— المصدر: ${faid.sourceBook}`)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  title="نسخ الفائدة"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button
                  onClick={() => toggleFavorite(faid)}
                  className={`p-1.5 rounded-lg transition-colors ${
                    faid.isFavorite ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/50' : 'text-slate-300 hover:text-slate-400'
                  }`}
                  title="تحديد كنفيسة مميزة"
                >
                  <Star className={`w-4 h-4 ${faid.isFavorite ? 'fill-amber-500' : ''}`} />
                </button>
                <button
                  onClick={() => removeItem(faid.id)}
                  className="p-1.5 rounded-lg text-slate-300 hover:text-rose-500 transition-colors"
                  title="حذف القيد"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <h3 className="text-lg font-bold font-serif text-slate-900 dark:text-slate-100 mb-2">
              {faid.title}
            </h3>
            <p className="text-sm font-serif text-slate-700 dark:text-slate-300 leading-loose whitespace-pre-line bg-slate-50/70 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800/80">
              {faid.content}
            </p>

            {faid.tags.length > 0 && (
              <div className="flex items-center gap-1.5 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/60">
                <Tag className="w-3 h-3 text-slate-400 shrink-0" />
                {faid.tags.map((t, idx) => (
                  <span key={idx} className="text-[10px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                    #{t}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* نافذة إضافة فائدة جديدة */}
      <Modal isOpen={isNewModalOpen} onClose={() => setIsNewModalOpen(false)} title="صيد فائدة علمية جديدة">
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold mb-1.5">عنوان الفائدة أو المسألة</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="مثال: ضابط المشقة التي تجلب التيسير"
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold mb-1.5">العلم الشرعي</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold"
              >
                {['العقيدة', 'الفقه', 'الحديث', 'النحو', 'أصول الفقه', 'الرقائق'].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold mb-1.5">اسم المصدر / الكتاب</label>
              <input
                type="text"
                value={sourceBook}
                onChange={e => setSourceBook(e.target.value)}
                placeholder="مثال: الأشباه والنظائر"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold mb-1.5">نص الفائدة المحقق</label>
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="اكتب هنا الفريدة العلمية بأكملها..."
              required
              rows={5}
              className="w-full p-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-serif leading-loose focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm shadow-md mt-4"
          >
            حفظ وتقييد في الدفتر
          </button>
        </form>
      </Modal>
    </div>
  );
};
