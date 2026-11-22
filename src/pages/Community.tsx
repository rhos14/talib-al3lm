import React, { useState } from 'react';
import { CommunityPost } from '../types';
import { INITIAL_POSTS } from '../data/mockCurriculum';
import { useLocalOrCloudStorage } from '../hooks/useFirestore';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { Modal } from '../components/common/Modal';
import { 
  Users2, 
  MessageSquare, 
  Heart, 
  Plus, 
  Send, 
  Sparkles,
  BookOpen,
  Share2
} from 'lucide-react';

export const Community: React.FC = () => {
  const { items: posts, saveItem } = useLocalOrCloudStorage<CommunityPost>('posts', INITIAL_POSTS);
  const { userProfile, currentUser } = useAuth();
  const { showSuccess, showError } = useToast();

  const [isNewOpen, setIsNewOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [category, setCategory] = useState<CommunityPost['category']>('مسألة فقهية');

  const [activeCommentsPost, setActiveCommentsPost] = useState<CommunityPost | null>(null);
  const [commentInput, setCommentInput] = useState('');

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !body) return;

    const newPost: CommunityPost = {
      id: `post_${Math.random().toString(36).substring(2, 9)}`,
      authorId: currentUser?.uid || 'guest-author',
      authorName: userProfile?.displayName || 'طالب علم باحث',
      authorLevel: userProfile?.level || 'مبتدئ',
      title,
      body,
      category,
      createdAt: 'الآن',
      likes: 1,
      commentsCount: 0
    };

    await saveItem(newPost);
    showSuccess("نُشرت المسألة", "طرحت مسألتك في مجلس المباحثة العلمية");
    setIsNewOpen(false);
    setTitle(''); setBody('');
  };

  const handleLike = async (post: CommunityPost) => {
    const updated = { ...post, likes: post.likes + 1 };
    await saveItem(updated);
  };

  return (
    <div className="space-y-6 pb-16 animate-fade-in max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h2 className="text-2xl font-black font-serif text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Users2 className="w-7 h-7 text-emerald-600 inline" />
            ملتقى المدارسة والمباحثة الفقهية
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            طرح المسائل، تكرار الشوارد، وطلب المشورة المنهجية بأدب وإنصاف
          </p>
        </div>
        <button
          onClick={() => setIsNewOpen(true)}
          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-1.5 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>طرح مسألة علمية</span>
        </button>
      </div>

      <div className="space-y-4">
        {posts.length === 0 ? (
          <div className="text-center py-12 px-4 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl bg-slate-50/50 dark:bg-slate-900/40">
            <MessageSquare className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <h3 className="font-bold text-slate-800 dark:text-slate-200">لا توجد مباحثات بعد</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
              تصفح المجالس وطرح مسألة علمية للمدارسة الفقهية والحديثية مع بقية الطلاب والطالبات.
            </p>
          </div>
        ) : (
          posts.map(post => (
            <div
              key={post.id}
              className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-slate-300 transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-700 text-white font-bold flex items-center justify-center text-sm shadow-xs">
                    {post.authorName.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">{post.authorName}</h4>
                      <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-md">
                        {post.authorLevel || 'طالب علم'}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400">{post.createdAt}</span>
                  </div>
                </div>

                <span className="text-xs font-bold px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {post.category}
                </span>
              </div>

              <h3 className="font-bold font-serif text-lg text-slate-900 dark:text-slate-100 mb-2 leading-snug">
                {post.title}
              </h3>
              <p className="text-sm font-serif text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line opacity-90">
                {post.body}
              </p>

              <div className="flex items-center justify-between pt-4 mt-5 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handleLike(post)}
                    className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-rose-500 transition-colors group active:scale-90"
                  >
                    <Heart className="w-4 h-4 group-hover:fill-rose-500" />
                    <span className="font-mono">{post.likes}</span>
                  </button>

                  <button
                    onClick={() => setActiveCommentsPost(post)}
                    className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-emerald-600 transition-colors"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>مدارسة ومباحثة ({post.commentsCount})</span>
                  </button>
                </div>

                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(`${post.title}\n\n${post.body}`);
                    showSuccess("تم نسخ المسألة للمشاركة");
                  }}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <Modal isOpen={isNewOpen} onClose={() => setIsNewOpen(false)} title="طرح مسألة أو فائدة للمدارسة">
        <form onSubmit={handleCreatePost} className="space-y-4">
          <div>
            <label className="block text-xs font-bold mb-1.5">عنوان المسألة</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="مثال: الإشكال في فهم العلة القاصرة والمتعدية في القياس"
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold mb-1.5">الباب الشرعي</label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value as any)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold"
            >
              {['مسألة فقهية', 'فوائد حديثية', 'نصيحة لطالب العلم', 'استفسار منهجي', 'نقاش عام'].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold mb-1.5">تفاصيل المسألة أو الفائدة</label>
            <textarea
              value={body}
              onChange={e => setBody(e.target.value)}
              placeholder="اكتب هنا وجه الإشكال أو نص الأثر المحقق للمناقشة..."
              required
              rows={6}
              className="w-full p-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-serif leading-loose focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm shadow-md mt-4"
          >
            نشر في ملتقى الطلبة
          </button>
        </form>
      </Modal>

      {/* نافذة التعليقات والمباحثة */}
      {activeCommentsPost && (
        <Modal isOpen={!!activeCommentsPost} onClose={() => setActiveCommentsPost(null)} title="مجلس مدارسة المسألة">
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border">
              <h4 className="font-bold text-sm font-serif">{activeCommentsPost.title}</h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed whitespace-pre-line font-serif">
                {activeCommentsPost.body}
              </p>
            </div>

            <div className="py-6 text-center text-xs text-slate-400 font-serif">
              «المناظرة في العلم عبادة، ولتكن بنية ظهور الحق»
            </div>

            <div className="flex gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <input
                type="text"
                value={commentInput}
                onChange={e => setCommentInput(e.target.value)}
                placeholder="أضف تعليقك المنهجي أو جواب المسألة بأدب..."
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
              <button
                onClick={() => {
                  if(!commentInput) return;
                  showSuccess("أُضيف الجواب", "جُزيت خيراً على إثراء المجلس");
                  setCommentInput('');
                  setActiveCommentsPost(null);
                }}
                className="px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold flex items-center justify-center"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
