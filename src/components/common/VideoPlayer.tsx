import React, { useRef, useState, useEffect } from 'react';
import { resolveFileUrl, getYoutubeId } from '../../types';
import { Play, Pause, Volume2, VolumeX, Maximize, AlertCircle, Video, ExternalLink, RefreshCw } from 'lucide-react';

interface VideoPlayerProps {
  url?: string;
  title?: string;
  poster?: string;
  className?: string;
}

/**
 * مكون مشغل الفيديو المتطور والديناميكي (VideoPlayer)
 * يدعم كشف روابط يوتيوب وعرضها تلقائياً بـ iframe،
 * أو تشغيل الملفات المباشرة (مثل Firebase Storage) بمشغل HTML5 مخصص وأنيق،
 * مع معالجة كاملة للأخطاء باللغة العربية.
 */
export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  url = '',
  title = 'عرض الفيديو الشرحي',
  poster,
  className = '',
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const resolvedUrl = resolveFileUrl(url);

  // التحقق من نوع الرابط (يوتيوب أم ملف مباشر)
  const youtubeId = getYoutubeId(resolvedUrl);
  const isYoutube = !!youtubeId;

  // إعادة ضبط حالة الأخطاء والتشغيل عند تغيير الرابط
  useEffect(() => {
    setHasError(false);
    setErrorMessage(null);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
  }, [resolvedUrl]);

  // إدارة التشغيل والإيقاف للملف المباشر
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play()
        .then(() => setIsPlaying(true))
        .catch((err) => {
          console.error("فشل تشغيل الفيديو:", err);
          setHasError(true);
          setErrorMessage("عذراً، تعذر تشغيل الفيديو تلقائياً. يرجى الضغط للتشغيل.");
        });
    }
  };

  // تحديث وقت التشغيل الحالي والمدة الكلية
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  // التحكم بالصوت
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setVolume(value);
    setIsMuted(value === 0);
    if (videoRef.current) {
      videoRef.current.volume = value;
      videoRef.current.muted = value === 0;
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    videoRef.current.muted = nextMute;
    if (nextMute) {
      videoRef.current.volume = 0;
    } else {
      videoRef.current.volume = volume || 0.5;
    }
  };

  // التحكم في سرعة التشغيل
  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  // الانتقال لوقت محدد في الفيديو
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  // ملء الشاشة
  const handleFullscreen = () => {
    if (!containerRef.current) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      containerRef.current.requestFullscreen().catch((err) => {
        console.error("تعذر تفعيل ملء الشاشة:", err);
      });
    }
  };

  // معالجة الأخطاء
  const handleVideoError = () => {
    setHasError(true);
    setErrorMessage("عذراً، لم نتمكن من تشغيل هذا الملف. قد يكون التنسيق غير مدعوم أو الرابط غير صالح.");
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "00:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // إعادة تحميل محاولة التشغيل
  const handleRetry = () => {
    setHasError(false);
    setErrorMessage(null);
    if (videoRef.current) {
      videoRef.current.load();
    }
  };

  // إذا لم يتم توفير رابط
  if (!resolvedUrl) {
    return (
      <div className={`w-full min-h-[300px] flex flex-col items-center justify-center bg-slate-900/50 rounded-2xl border-2 border-dashed border-slate-700 p-8 text-center text-slate-400 ${className}`}>
        <Video className="w-12 h-12 text-slate-500 mb-3 animate-pulse" />
        <p className="font-bold text-sm">بانتظار رابط الفيديو...</p>
        <p className="text-xs text-slate-500 mt-1">يرجى إضافة رابط يوتيوب أو ملف مباشر لعرض المحتوى</p>
      </div>
    );
  }

  // 1. في حال كان الرابط يوتيوب (YouTube Embed Player)
  if (isYoutube) {
    return (
      <div className={`w-full bg-black rounded-2xl overflow-hidden border border-slate-800 shadow-2xl flex flex-col relative aspect-video ${className}`}>
        <div className="relative flex-1 bg-black w-full h-full">
          <iframe
            src={`https://www.youtube.com/embed/${youtubeId}?autoplay=0&rel=0&modestbranding=1&controls=1&showinfo=0`}
            title={title}
            className="w-full h-full border-0 absolute inset-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
        
        {/* شريط معلومات يوتيوب السفلي الأنيق */}
        <div className="bg-slate-950 px-5 py-3 border-t border-slate-900 flex items-center justify-between gap-4 text-right">
          <div className="space-y-0.5">
            <h4 className="font-black text-xs text-slate-200 tracking-wide line-clamp-1">{title}</h4>
            <p className="text-[10px] text-slate-500">مشاهدة مباشرة ومستمرة عبر منصة يوتيوب</p>
          </div>
          <span className="shrink-0 flex items-center gap-1 text-[10px] bg-red-950/40 text-red-400 border border-red-900/40 px-2.5 py-1 rounded-full font-bold">
            <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
            بث يوتيوب
          </span>
        </div>
      </div>
    );
  }

  // 2. في حال حدوث خطأ تشغيل للملف المباشر
  if (hasError) {
    return (
      <div className={`w-full min-h-[300px] flex flex-col items-center justify-center bg-slate-950 rounded-2xl border border-red-900/30 p-8 text-center space-y-4 shadow-xl ${className}`} dir="rtl">
        <div className="w-14 h-14 rounded-full bg-red-950/50 border border-red-800/30 flex items-center justify-center text-red-400">
          <AlertCircle className="w-8 h-8" />
        </div>
        <div className="space-y-1 max-w-md">
          <h4 className="text-sm font-black text-slate-200">فشل تشغيل المحتوى المرئي</h4>
          <p className="text-xs text-slate-400 leading-relaxed">{errorMessage || 'عذراً، تعذر الوصول إلى ملف الفيديو أو تحميله.'}</p>
        </div>
        <div className="flex flex-wrap gap-2.5 justify-center pt-2">
          <button
            onClick={handleRetry}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs transition-colors border border-slate-700"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            إعادة المحاولة
          </button>
          <a
            href={resolvedUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition-colors shadow-lg shadow-emerald-950/20"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            فتح الرابط المباشر
          </a>
        </div>
      </div>
    );
  }

  // 3. في حال كان ملفاً مباشراً (HTML5 Video Custom Player)
  return (
    <div 
      ref={containerRef}
      className={`group/player relative w-full bg-black rounded-2xl overflow-hidden border border-slate-800 shadow-2xl flex flex-col aspect-video select-none ${className}`}
      dir="rtl"
    >
      {/* مشغل الفيديو الأصلي */}
      <div className="relative flex-1 bg-black flex items-center justify-center w-full h-full overflow-hidden">
        <video
          ref={videoRef}
          src={resolvedUrl}
          poster={poster}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onError={handleVideoError}
          onClick={togglePlay}
          className="w-full h-full object-contain cursor-pointer"
          playsInline
        />

        {/* زر تشغيل ضخم في المنتصف يظهر عند التوقف المؤقت */}
        {!isPlaying && !hasError && (
          <button 
            onClick={togglePlay}
            className="absolute p-5 rounded-full bg-emerald-600/90 text-white hover:bg-emerald-500 hover:scale-110 transition-all duration-300 shadow-xl shadow-emerald-950/40 border border-emerald-400/20 cursor-pointer"
          >
            <Play className="w-8 h-8 fill-current translate-x-[-1px]" />
          </button>
        )}

        {/* تدرج سفلي لتسهيل قراءة أزرار التحكم */}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none opacity-0 group-hover/player:opacity-100 transition-opacity duration-300" />
      </div>

      {/* لوحة التحكم الاحترافية والذكية للمشغل (تظهر تلقائياً عند تمرير الفأرة) */}
      <div className="absolute bottom-0 inset-x-0 p-4 space-y-3 bg-gradient-to-t from-slate-950 via-slate-950/95 to-transparent border-t border-slate-900/30 opacity-0 group-hover/player:opacity-100 focus-within:opacity-100 transition-opacity duration-300 z-10 text-right">
        
        {/* شريط التمرير والسحب (Seekbar) */}
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-mono text-slate-400 font-bold shrink-0">{formatTime(currentTime)}</span>
          <input
            type="range"
            min={0}
            max={duration || 0}
            step={0.1}
            value={currentTime}
            onChange={handleSeek}
            className="flex-1 h-1.5 rounded-lg bg-slate-800 accent-emerald-500 cursor-pointer hover:accent-emerald-400 transition-colors"
          />
          <span className="text-[10px] font-mono text-slate-400 font-bold shrink-0">{formatTime(duration)}</span>
        </div>

        {/* أزرار التحكم الفرعية وسرعة التشغيل والصوت */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* تشغيل وإيقاف مؤقت */}
            <button
              onClick={togglePlay}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-100 transition-colors"
              title={isPlaying ? "إيقاف مؤقت" : "تشغيل"}
            >
              {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
            </button>

            {/* التحكم بالصوت وكتمه */}
            <div className="flex items-center gap-2 group/volume">
              <button
                onClick={toggleMute}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-100 transition-colors"
                title={isMuted ? "إلغاء الكتم" : "كتم الصوت"}
              >
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-16 h-1 rounded-lg bg-slate-800 accent-emerald-500 cursor-pointer opacity-0 group-hover/volume:opacity-100 focus:opacity-100 transition-opacity duration-200"
              />
            </div>

            {/* عنوان الفيديو */}
            <div className="hidden sm:block">
              <h5 className="text-xs font-black text-slate-200 line-clamp-1">{title}</h5>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* سرعة التشغيل */}
            <div className="flex items-center bg-slate-900 rounded-lg border border-slate-800 px-1.5 py-0.5">
              {[1, 1.25, 1.5, 2].map((speed) => (
                <button
                  key={speed}
                  onClick={() => handleSpeedChange(speed)}
                  className={`px-2 py-1 rounded text-[9px] font-bold transition-all ${
                    playbackSpeed === speed 
                      ? 'bg-emerald-600 text-white' 
                      : 'text-slate-400 hover:text-slate-100'
                  }`}
                >
                  {speed}x
                </button>
              ))}
            </div>

            {/* ملء الشاشة */}
            <button
              onClick={handleFullscreen}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-100 transition-colors"
              title="شاشة كاملة"
            >
              <Maximize className="w-5 h-5" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
