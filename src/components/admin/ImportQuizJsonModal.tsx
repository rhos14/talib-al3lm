import React, { useState } from 'react';
import { 
  X, 
  FileCode, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Copy, 
  Check, 
  Layers, 
  Loader2, 
  HelpCircle,
  AlertTriangle,
  ArrowRight,
  ListOrdered
} from 'lucide-react';
import { CourseLectureItem, LectureQuizQuestion, QuizQuestionType } from '../../types';

interface ImportQuizJsonModalProps {
  isOpen: boolean;
  onClose: () => void;
  lecture: CourseLectureItem;
  existingQuestions: LectureQuizQuestion[];
  onSaveBatch: (questions: LectureQuizQuestion[]) => Promise<void>;
  showSuccess: (title: string, message?: string) => void;
  showError: (title: string, message?: string) => void;
}

interface ParsedQuestionItem {
  type: QuizQuestionType;
  question: string;
  options?: string[];
  correctAnswer: string;
  points: number;
  isDuplicate?: boolean;
  duplicateQuestionId?: string;
}

const SAMPLE_JSON_TEMPLATE = `[
  {
    "type": "multiple_choice",
    "question": "ما هو الركن الأعظم في دين الإسلام بعد الشهادتين؟",
    "options": [
      "إقام الصلاة",
      "إيتاء الزكاة",
      "صوم رمضان",
      "حج البيت لمن استطاع إليه سبيلا"
    ],
    "correctAnswer": "إقام الصلاة",
    "points": 1
  },
  {
    "type": "true_false",
    "question": "توحيد الربوبية هو إفراد الله تعالى بالخلق والملك والتدبير.",
    "options": ["صح", "خطأ"],
    "correctAnswer": "صح",
    "points": 1
  },
  {
    "type": "short_answer",
    "question": "ما هو أول واجب على المكلف؟",
    "correctAnswer": "التوحيد",
    "points": 1
  }
]`;

export const ImportQuizJsonModal: React.FC<ImportQuizJsonModalProps> = ({
  isOpen,
  onClose,
  lecture,
  existingQuestions,
  onSaveBatch,
  showSuccess,
  showError
}) => {
  const [jsonInput, setJsonInput] = useState<string>('');
  const [parsedQuestions, setParsedQuestions] = useState<ParsedQuestionItem[]>([]);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [skipDuplicates, setSkipDuplicates] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [hasPreviewed, setHasPreviewed] = useState<boolean>(false);
  const [copiedSample, setCopiedSample] = useState<boolean>(false);

  if (!isOpen) return null;

  // تنظيف وتطبيع النص المدخل لإزالة كتل الماركداون (Markdown Code Fences) إن وجدت
  const cleanJsonString = (raw: string): string => {
    let text = raw.trim();
    // إزالة كتل الماركداون مثل ```json ... ``` أو ``` ... ```
    if (text.startsWith('```')) {
      text = text.replace(/^```(?:json)?\s*/i, '');
      text = text.replace(/\s*```$/, '');
    }
    return text.trim();
  };

  // تطبيع إجابة صح وخطأ لتتوافق مع نظام الموقع (true / false)
  const normalizeTrueFalseAnswer = (ans: any): string | null => {
    if (typeof ans === 'boolean') {
      return ans ? 'true' : 'false';
    }
    if (typeof ans !== 'string') return null;
    const clean = ans.trim().toLowerCase();
    if (['true', 'صح', 'صحيح', 'صواب', 'نعم', '1'].includes(clean)) {
      return 'true';
    }
    if (['false', 'خطأ', 'خاطئ', 'خاطئة', 'لا', '0'].includes(clean)) {
      return 'false';
    }
    return null;
  };

  // دالة فحص ومعاينة الأسئلة
  const handleValidateAndPreview = () => {
    setParseErrors([]);
    setParsedQuestions([]);
    setHasPreviewed(false);

    const cleaned = cleanJsonString(jsonInput);
    if (!cleaned) {
      setParseErrors(['يرجى لصق نص كود JSON للأسئلة في المربع أدناه قبل المعاينة.']);
      return;
    }

    let parsedData: any;
    try {
      parsedData = JSON.parse(cleaned);
    } catch (err: any) {
      setParseErrors([
        `صيغة JSON غير صالحة: ${err.message || 'يرجى التأكد من صحة علامات التنصيص والفواصل والأقواس'}`
      ]);
      return;
    }

    // استخراج مصفوفة الأسئلة سواء كانت مصفوفة مباشرة أو كائناً يحتوي على حقل questions
    let rawList: any[] = [];
    if (Array.isArray(parsedData)) {
      rawList = parsedData;
    } else if (parsedData && Array.isArray(parsedData.questions)) {
      rawList = parsedData.questions;
    } else {
      setParseErrors([
        'يجب أن يكون محتوى JSON مصفوفة أسئلة `[...]` أو كائناً يحتوي على قائمة `{"questions": [...]}`.'
      ]);
      return;
    }

    if (rawList.length === 0) {
      setParseErrors(['مصفوفة الأسئلة فارغة! يرجى إدراج سؤال واحد على الأقل.']);
      return;
    }

    const errors: string[] = [];
    const validQuestions: ParsedQuestionItem[] = [];

    // مجموعة نصوص الأسئلة الموجودة مسبقاً في هذه المحاضرة للكشف عن التكرار
    const existingTextsMap = new Map<string, string>();
    existingQuestions.forEach(q => {
      existingTextsMap.set(q.question.trim().toLowerCase(), q.id);
    });

    rawList.forEach((item, idx) => {
      const qIndex = idx + 1;

      if (!item || typeof item !== 'object') {
        errors.push(`السؤال #${qIndex}: البيانات يجب أن تكون كائناً صالحاً.`);
        return;
      }

      // 1. فحص نص السؤال
      if (!item.question || typeof item.question !== 'string' || !item.question.trim()) {
        errors.push(`السؤال #${qIndex}: نص السؤال (question) مفقود أو فارغ.`);
        return;
      }
      const questionText = item.question.trim();

      // 2. فحص وتطبيع نوع السؤال
      let rawType = typeof item.type === 'string' ? item.type.trim().toLowerCase() : '';
      let normalizedType: QuizQuestionType | null = null;

      if (['multiple_choice', 'mcq', 'multiple', 'اختيار من متعدد', 'اختيار متعدد'].includes(rawType)) {
        normalizedType = 'multiple_choice';
      } else if (['true_false', 'tf', 'boolean', 'صح وخطأ', 'صح أو خطأ', 'صح/خطأ'].includes(rawType)) {
        normalizedType = 'true_false';
      } else if (['short_answer', 'short', 'text', 'إجابة قصيرة', 'اجابة قصيرة'].includes(rawType)) {
        normalizedType = 'short_answer';
      } else {
        errors.push(`السؤال #${qIndex}: نوع السؤال "${item.type}" غير مدعوم. الأنواع المقبولة: multiple_choice أو true_false أو short_answer.`);
        return;
      }

      // 3. الدرجة
      let points = 1;
      if (typeof item.points === 'number' && item.points > 0) {
        points = item.points;
      } else if (item.points !== undefined && !isNaN(Number(item.points)) && Number(item.points) > 0) {
        points = Number(item.points);
      }

      // 4. التحقق بحسب النوع
      if (normalizedType === 'multiple_choice') {
        if (!Array.isArray(item.options) || item.options.length < 2) {
          errors.push(`السؤال #${qIndex} (اختيار متعدد): يجب توفير مصفوفة خيارات (options) تحتوي على خيارين على الأقل.`);
          return;
        }

        const cleanedOptions = item.options.map((opt: any) => String(opt || '').trim()).filter((opt: string) => opt.length > 0);
        if (cleanedOptions.length < 2) {
          errors.push(`السؤال #${qIndex} (اختيار متعدد): الخيارات المتاحة فارغة أو غير كافية (مطلوب خياران غير فارغين على الأقل).`);
          return;
        }

        if (!item.correctAnswer || typeof item.correctAnswer !== 'string' || !item.correctAnswer.trim()) {
          errors.push(`السؤال #${qIndex}: الإجابة الصحيحة (correctAnswer) غير محددة.`);
          return;
        }

        const rawCorrect = String(item.correctAnswer).trim();
        // التحقق من أن الإجابة الصحيحة موجودة فعلياً بين الخيارات (مع التسامح في الفراغات)
        const matchedOption = cleanedOptions.find(opt => opt.toLowerCase() === rawCorrect.toLowerCase());
        if (!matchedOption) {
          errors.push(`السؤال #${qIndex}: الإجابة الصحيحة ("${rawCorrect}") غير موجودة ضمن مصفوفة الخيارات المتاحة: [${cleanedOptions.map(o => `"${o}"`).join('، ')}].`);
          return;
        }

        const existingId = existingTextsMap.get(questionText.toLowerCase());

        validQuestions.push({
          type: 'multiple_choice',
          question: questionText,
          options: cleanedOptions,
          correctAnswer: matchedOption,
          points,
          isDuplicate: !!existingId,
          duplicateQuestionId: existingId
        });

      } else if (normalizedType === 'true_false') {
        const tfNormalized = normalizeTrueFalseAnswer(item.correctAnswer);
        if (!tfNormalized) {
          errors.push(`السؤال #${qIndex} (صح وخطأ): قيمة الإجابة الصحيحة ("${item.correctAnswer}") غير صالحة. المقبول: "صح" أو "خطأ" أو "true" أو "false".`);
          return;
        }

        const existingId = existingTextsMap.get(questionText.toLowerCase());

        validQuestions.push({
          type: 'true_false',
          question: questionText,
          options: ['صح', 'خطأ'],
          correctAnswer: tfNormalized,
          points,
          isDuplicate: !!existingId,
          duplicateQuestionId: existingId
        });

      } else if (normalizedType === 'short_answer') {
        if (!item.correctAnswer || typeof item.correctAnswer !== 'string' || !item.correctAnswer.trim()) {
          errors.push(`السؤال #${qIndex} (إجابة قصيرة): الإجابة النموذجية (correctAnswer) مفقودة أو فارغة.`);
          return;
        }

        const existingId = existingTextsMap.get(questionText.toLowerCase());

        validQuestions.push({
          type: 'short_answer',
          question: questionText,
          correctAnswer: item.correctAnswer.trim(),
          points,
          isDuplicate: !!existingId,
          duplicateQuestionId: existingId
        });
      }
    });

    if (errors.length > 0) {
      setParseErrors(errors);
      setParsedQuestions([]);
      setHasPreviewed(false);
      return;
    }

    setParsedQuestions(validQuestions);
    setHasPreviewed(true);
  };

  // إدراج النموذج الجاهز في مربع النص
  const handleInsertSampleTemplate = () => {
    setJsonInput(SAMPLE_JSON_TEMPLATE);
    setParseErrors([]);
    setParsedQuestions([]);
    setHasPreviewed(false);
  };

  // نسخ النموذج التجريبي
  const handleCopySample = () => {
    navigator.clipboard.writeText(SAMPLE_JSON_TEMPLATE);
    setCopiedSample(true);
    setTimeout(() => setCopiedSample(false), 2000);
  };

  // حفظ الأسئلة فعلياً في قاعدة البيانات
  const handleImportAndSave = async () => {
    if (parsedQuestions.length === 0) {
      showError('لا توجد أسئلة', 'يرجى معاينة الأسئلة والتحقق من صحتها أولاً.');
      return;
    }

    // تصفية الأسئلة المستهدفة وفقاً لخيار تخطي المكرر
    const finalToImport = skipDuplicates
      ? parsedQuestions.filter(q => !q.isDuplicate)
      : parsedQuestions;

    if (finalToImport.length === 0) {
      showError('جميع الأسئلة مكررة', 'جميع الأسئلة التي تمت معاينتها موجودة بالفعل في اختبار هذا الدرس، وتم تخطيها.');
      return;
    }

    setIsSaving(true);
    try {
      const nowIso = new Date().toISOString();
      const currentHighestOrder = existingQuestions.reduce((max, q) => Math.max(max, q.order ?? 0), -1);

      const formattedQuestions: LectureQuizQuestion[] = finalToImport.map((pq, idx) => {
        const uniqueId = `question-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        return {
          id: uniqueId,
          lectureId: lecture.id,
          bookId: lecture.bookId,
          courseId: lecture.courseId,
          type: pq.type,
          question: pq.question,
          options: pq.type === 'multiple_choice' ? pq.options : (pq.type === 'true_false' ? ['صح', 'خطأ'] : undefined),
          correctAnswer: pq.correctAnswer,
          points: pq.points,
          order: currentHighestOrder + 1 + idx,
          createdAt: nowIso
        };
      });

      await onSaveBatch(formattedQuestions);
      showSuccess(
        'تم استيراد الأسئلة بنجاح! ✅',
        `تم حفظ ${formattedQuestions.length} سؤال في قاعدة البيانات بنجاح لدرس "${lecture.title}".`
      );
      onClose();
    } catch (err: any) {
      console.error('Error importing questions batch:', err);
      showError('فشل الاستيراد والحفظ', err.message || 'حدث خطأ أثناء حفظ الأسئلة في قاعدة البيانات.');
    } finally {
      setIsSaving(false);
    }
  };

  const duplicateCount = parsedQuestions.filter(q => q.isDuplicate).length;
  const newCount = parsedQuestions.filter(q => !q.isDuplicate).length;
  const questionsToSaveCount = skipDuplicates ? newCount : parsedQuestions.length;

  return (
    <div className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div 
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-7 max-w-4xl w-full shadow-2xl space-y-5 max-h-[94vh] overflow-y-auto text-right animate-fade-in"
        dir="rtl"
      >
        {/* ترويسة النافذة */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-purple-100 dark:bg-purple-950/80 text-purple-600 dark:text-purple-300">
                <FileCode className="w-5 h-5" />
              </span>
              <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                استيراد أسئلة الاختبار من JSON (NotebookLM)
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              المحاضرة المستهدفة: <span className="font-bold text-slate-700 dark:text-slate-200">«{lecture.title}»</span> (معرّف المحاضرة والكتاب والدورة يتم ربطها تلقائياً)
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl bg-slate-100 dark:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* شريط الإجراءات المساعدة والنماذج */}
        <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-xs">
          <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
            <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
            <span>يدعم أنواع الأسئلة الثلاثة: اختيار من متعدد، صح وخطأ، وإجابة قصيرة مباشرة.</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleInsertSampleTemplate}
              className="px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-purple-700 dark:text-purple-300 font-bold rounded-xl border border-purple-200 dark:border-purple-800/60 transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>إدراج نموذج JSON تجريبي</span>
            </button>
            <button
              type="button"
              onClick={handleCopySample}
              className="px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl border border-slate-200 dark:border-slate-700 transition-colors flex items-center gap-1.5 shadow-2xs"
              title="نسخ النموذج التجريبي للحافظة"
            >
              {copiedSample ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSample ? 'تم النسخ' : 'نسخ النموذج'}</span>
            </button>
            {jsonInput && (
              <button
                type="button"
                onClick={() => {
                  setJsonInput('');
                  setParsedQuestions([]);
                  setParseErrors([]);
                  setHasPreviewed(false);
                }}
                className="px-3 py-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 font-bold rounded-xl transition-colors"
              >
                مسح
              </button>
            )}
          </div>
        </div>

        {/* مربع لصق الـ JSON */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
            الصق مصفوفة JSON للأسئلة هنا:
          </label>
          <textarea
            value={jsonInput}
            onChange={e => {
              setJsonInput(e.target.value);
              if (hasPreviewed) {
                setHasPreviewed(false);
                setParsedQuestions([]);
              }
            }}
            rows={8}
            placeholder={`[\n  {\n    "type": "multiple_choice",\n    "question": "نص السؤال...",\n    "options": ["خيار 1", "خيار 2", "خيار 3"],\n    "correctAnswer": "خيار 1",\n    "points": 1\n  }\n]`}
            className="w-full p-4 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-950 text-emerald-400 font-mono text-xs leading-relaxed focus:ring-2 focus:ring-purple-500 focus:outline-hidden text-left"
            dir="ltr"
            spellCheck={false}
          />
        </div>

        {/* تنبيه الأخطاء إن وجدت */}
        {parseErrors.length > 0 && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs space-y-2 animate-fade-in">
            <div className="flex items-center gap-2 font-bold text-sm text-rose-700 dark:text-rose-300">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>تعذر اعتماد البيانات - يرجى تصحيح الأخطاء التالية:</span>
            </div>
            <ul className="list-disc list-inside space-y-1 pr-2">
              {parseErrors.map((err, idx) => (
                <li key={idx} className="leading-relaxed">{err}</li>
              ))}
            </ul>
          </div>
        )}

        {/* قسم المعاينة عند اكتمال الفحص بنجاح */}
        {hasPreviewed && parsedQuestions.length > 0 && (
          <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800 animate-fade-in">
            {/* ملخص الإحصاءات وشريط منع التكرار */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="font-bold text-xs text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>نتائج الفحص:</span>
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-slate-800">
                  إجمالي الأسئلة: {parsedQuestions.length}
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 text-xs font-bold">
                  أسئلة جديدة: {newCount}
                </span>
                {duplicateCount > 0 && (
                  <span className="px-2.5 py-1 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-xs font-bold flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>مكررة وموجودة مسبقاً: {duplicateCount}</span>
                  </span>
                )}
              </div>

              {duplicateCount > 0 && (
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700 dark:text-slate-300 select-none">
                  <input
                    type="checkbox"
                    checked={skipDuplicates}
                    onChange={e => setSkipDuplicates(e.target.checked)}
                    className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                  />
                  <span>تخطي الأسئلة المكررة ذات النص المماثل (موصى به)</span>
                </label>
              )}
            </div>

            {/* بطاقات معاينة كل سؤال */}
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {parsedQuestions.map((q, idx) => {
                const isWillSkip = q.isDuplicate && skipDuplicates;

                return (
                  <div
                    key={idx}
                    className={`p-4 rounded-2xl border text-xs space-y-2 transition-all ${
                      isWillSkip
                        ? 'bg-slate-100/60 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-60'
                        : q.isDuplicate
                        ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800/80'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-2xs'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold flex items-center justify-center font-mono">
                          {idx + 1}
                        </span>
                        <span className="font-bold text-slate-900 dark:text-white text-sm">
                          {q.question}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="px-2 py-0.5 rounded-md font-bold text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {q.type === 'multiple_choice' ? 'اختيار متعدد' : q.type === 'true_false' ? 'صح وخطأ' : 'إجابة قصيرة'}
                        </span>
                        <span className="px-2 py-0.5 rounded-md font-bold text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                          {q.points} {q.points === 1 ? 'درجة' : 'درجات'}
                        </span>
                        {q.isDuplicate && (
                          <span className="px-2 py-0.5 rounded-md font-bold text-[10px] bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            <span>{isWillSkip ? 'سيتم تخطيه (مكرر)' : 'مكرر موجود مسبقاً'}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* تفاصيل الخيارات بحسب النوع */}
                    {q.type === 'multiple_choice' && q.options && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {q.options.map((opt, oIdx) => {
                          const isCorrect = opt === q.correctAnswer;
                          return (
                            <span
                              key={oIdx}
                              className={`px-2.5 py-1 rounded-lg border text-xs flex items-center gap-1 font-sans ${
                                isCorrect
                                  ? 'bg-emerald-100 dark:bg-emerald-950/80 border-emerald-400 text-emerald-800 dark:text-emerald-200 font-bold'
                                  : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                              }`}
                            >
                              {opt}
                              {isCorrect && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                            </span>
                          );
                        })}
                      </div>
                    )}

                    {q.type === 'true_false' && (
                      <div className="text-xs pt-1">
                        <span className="text-slate-500 dark:text-slate-400">الإجابة الصحيحة: </span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">
                          {q.correctAnswer === 'true' ? 'صحيحة (صح) ✓' : 'خاطئة (خطأ) ✗'}
                        </span>
                      </div>
                    )}

                    {q.type === 'short_answer' && (
                      <div className="text-xs pt-1">
                        <span className="text-slate-500 dark:text-slate-400">الإجابة النموذجية: </span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">
                          "{q.correctAnswer}"
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* أزرار الإجراءات السفلية */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="w-full sm:w-auto px-5 py-2.5 rounded-2xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition-colors"
          >
            إلغاء
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleValidateAndPreview}
              disabled={isSaving || !jsonInput.trim()}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <FileCode className="w-4 h-4 text-purple-600" />
              <span>معاينة الأسئلة</span>
            </button>

            <button
              type="button"
              onClick={handleImportAndSave}
              disabled={isSaving || !hasPreviewed || questionsToSaveCount === 0}
              className="flex-1 sm:flex-none px-6 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>جاري الحفظ في Firebase...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    استيراد وحفظ الأسئلة ({questionsToSaveCount})
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
