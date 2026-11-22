import React, { useRef, useState, useEffect } from 'react';
import { resolveFileUrl, getYoutubeId } from '../../types';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  RotateCw, 
  Volume2, 
  VolumeX, 
  FastForward, 
  Maximize, 
  Minimize, 
  Clock, 
  CheckCircle2,
  ListRestart,
  AlertTriangle
} from 'lucide-react';

interface MediaStudyPlayerProps {
  videoUrl?: string;
  audioUrl?: string;
  title: string;
  initialTime?: number;
  onTimeUpdate?: (currentTime: number, duration: number, percentage: number) => void;
  onFinished?: () => void;
}

export const MediaStudyPlayer: React.FC<MediaStudyPlayerProps> = ({
  videoUrl,
  audioUrl,
  title,
  initialTime = 0,
  onTimeUpdate,
  onFinished
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [duration, setDuration] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [volume, setVolume] = useState<number>(0.8);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState<boolean>(false);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [resumePrompt, setResumePrompt] = useState<boolean>(false);
  const [mediaError, setMediaError] = useState<string | null>(null);

  const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2];
  
  const resolvedAudioUrl = resolveFileUrl(audioUrl);
  const resolvedVideoUrl = resolveFileUrl(videoUrl);

  const youtubeId = resolvedVideoUrl ? getYoutubeId(resolvedVideoUrl) : null;
  const isYoutube = !!youtubeId;

  const targetAudioUrl = resolvedAudioUrl;
  const targetVideoUrl = resolvedVideoUrl;

  const hasValidVideo = !!(resolvedVideoUrl && resolvedVideoUrl.trim() !== "" && resolvedVideoUrl !== "null" && resolvedVideoUrl !== "undefined");
  const hasValidAudio = !!(resolvedAudioUrl && resolvedAudioUrl.trim() !== "" && resolvedAudioUrl !== "null" && resolvedAudioUrl !== "undefined");

  const activeRef = hasValidVideo ? videoRef : audioRef;

  // Reset media error when source changes
  useEffect(() => {
    setMediaError(null);
  }, [videoUrl, audioUrl]);

  const handleMediaError = (e: React.SyntheticEvent<HTMLMediaElement, Event>) => {
    const target = e.currentTarget;
    console.warn("Media element encountered an error during playback/loading:", target.error);
    setMediaError("تعذر تشغيل هذا الملف. يرجى التأكد من صلاحية الرابط المرفوع أو جرب تشغيله في متصفح آخر.");
  };

  // Sync initial time / resume prompt
  useEffect(() => {
    setIsPlaying(false);
    setIsFinished(false);
    
    if (isYoutube) {
      setResumePrompt(false);
      return;
    }

    const checkMediaExistence = async (url: string, type: string) => {
        try {
            const response = await fetch(url, { method: 'HEAD' });
            console.log(`[MEDIA CHECK] ${type} URL: ${url}, Status: ${response.status}`);
        } catch (error) {
            console.error(`[MEDIA CHECK] Error checking ${type} URL: ${url}`, error);
        }
    };

    if (hasValidVideo) checkMediaExistence(resolvedVideoUrl, 'Video');
    if (hasValidAudio) checkMediaExistence(resolvedAudioUrl, 'Audio');

    const media = activeRef.current;
    if (media) {
      const currentUrl = hasValidVideo ? targetVideoUrl : (hasValidAudio ? targetAudioUrl : null);
      if (currentUrl) {
        try {
          media.load();
        } catch (e) {
          console.warn("Media load error:", e);
        }
      }
      media.currentTime = 0;
      
      if (initialTime > 5) {
        setResumePrompt(true);
      } else {
        setResumePrompt(false);
      }
    }
  }, [resolvedVideoUrl, targetAudioUrl, isYoutube, hasValidVideo, hasValidAudio]);

  const handleResumeDecision = (resume: boolean) => {
    const media = activeRef.current;
    if (media) {
      if (resume) {
        media.currentTime = initialTime;
      } else {
        media.currentTime = 0;
      }
      media.play().then(() => setIsPlaying(true)).catch(() => {});
    }
    setResumePrompt(false);
  };

  const togglePlay = () => {
    const media = activeRef.current;
    if (!media) return;

    if (isPlaying) {
      media.pause();
      setIsPlaying(false);
    } else {
      media.play().then(() => {
        setIsPlaying(true);
      }).catch(err => {
        console.warn("Playback failed:", err);
      });
    }
  };

  const skip = (seconds: number) => {
    const media = activeRef.current;
    if (!media) return;
    media.currentTime = Math.min(Math.max(0, media.currentTime + seconds), duration);
    setCurrentTime(media.currentTime);
  };

  const handleTimeUpdate = () => {
    const media = activeRef.current;
    if (!media) return;

    setCurrentTime(media.currentTime);
    const progressPercent = duration > 0 ? (media.currentTime / duration) * 100 : 0;
    
    if (onTimeUpdate) {
      onTimeUpdate(media.currentTime, duration, progressPercent);
    }

    // Mark finished if >= 98%
    if (progressPercent >= 98 && !isFinished) {
      setIsFinished(true);
      if (onFinished) {
        onFinished();
      }
    }
  };

  const handleLoadedMetadata = () => {
    const media = activeRef.current;
    if (!media) return;
    setDuration(media.duration || 0);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    setVolume(v);
    setIsMuted(v === 0);
    const media = activeRef.current;
    if (media) {
      media.volume = v;
      media.muted = v === 0;
    }
  };

  const toggleMute = () => {
    const media = activeRef.current;
    if (!media) return;
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    media.muted = nextMuted;
    if (!nextMuted && volume === 0) {
      setVolume(0.5);
      media.volume = 0.5;
    }
  };

  const changeSpeed = (rate: number) => {
    setPlaybackRate(rate);
    setShowSpeedMenu(false);
    const media = activeRef.current;
    if (media) {
      media.playbackRate = rate;
    }
  };

  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = progressRef.current?.getBoundingClientRect();
    if (!rect || duration === 0) return;
    
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const percentage = clickX / width;
    
    const media = activeRef.current;
    if (media) {
      media.currentTime = percentage * duration;
      setCurrentTime(media.currentTime);
    }
  };

  // Format Time (e.g. 01:23)
  const formatTime = (timeInSeconds: number) => {
    if (isNaN(timeInSeconds)) return "00:00";
    const hours = Math.floor(timeInSeconds / 3600);
    const minutes = Math.floor((timeInSeconds % 3600) / 60);
    const seconds = Math.floor(timeInSeconds % 60);

    const pad = (n: number) => n.toString().padStart(2, '0');
    
    if (hours > 0) {
      return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    }
    return `${pad(minutes)}:${pad(seconds)}`;
  };

  if (isYoutube) {
    return (
      <div className="bg-slate-950 text-slate-100 rounded-2xl overflow-hidden border border-slate-800 shadow-xl flex flex-col relative w-full h-full min-h-[420px] justify-between">
        <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden aspect-video">
          <iframe
            src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1&controls=1&showinfo=0`}
            title={title}
            className="w-full h-full aspect-video min-h-[350px] border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
        
        {/* Simple Info Footer */}
        <div className="bg-slate-950/95 border-t border-slate-900 px-5 py-4 flex items-center justify-between gap-4">
          <div className="space-y-1">
            <h4 className="font-extrabold text-sm text-slate-200 tracking-wide line-clamp-1">{title}</h4>
            <p className="text-[10px] text-slate-500 font-medium">عرض مباشر وتلقائي من يوتيوب مع دعم التحكم الكامل</p>
          </div>
          <span className="text-[10px] bg-emerald-950/50 text-emerald-400 border border-emerald-900/40 px-2 py-1 rounded-lg font-bold">
            بث يوتيوب
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-950 text-slate-100 rounded-2xl overflow-hidden border border-slate-800 shadow-xl flex flex-col relative w-full h-full min-h-[420px] justify-between">
      
      {/* Media Source & Resume Modal inside container */}
      {resumePrompt && (
        <div className="absolute inset-0 z-30 bg-slate-950/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-emerald-600/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <ListRestart className="w-8 h-8 animate-pulse" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-black text-white">هل تريد المتابعة من حيث توقفت؟</h4>
            <p className="text-xs text-slate-400">لقد استمعت سابقاً إلى {formatTime(initialTime)} من هذا الشرح.</p>
          </div>
          <div className="flex gap-2.5 w-full max-w-xs pt-2">
            <button
              onClick={() => handleResumeDecision(true)}
              className="flex-1 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition-colors"
            >
              نعم، تابع الاستماع
            </button>
            <button
              onClick={() => handleResumeDecision(false)}
              className="flex-1 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition-colors"
            >
              البدء من الأول
            </button>
          </div>
        </div>
      )}

      {/* Hidden Media Nodes */}
      {hasValidVideo ? (
        <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden aspect-video">
          {mediaError ? (
            <div className="absolute inset-0 bg-slate-950/95 flex flex-col items-center justify-center p-6 text-center text-xs space-y-2 z-10">
              <AlertTriangle className="w-8 h-8 text-amber-500 animate-pulse" />
              <span className="font-bold text-slate-300">حدث خطأ في تحميل الفيديو</span>
              <span className="text-[10px] text-slate-500 max-w-xs">{mediaError}</span>
            </div>
          ) : null}
          <video
            ref={videoRef}
            src={targetVideoUrl}
            onClick={togglePlay}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onError={handleMediaError}
            className="w-full h-full max-h-[380px] object-contain"
            playsInline
          />
          {/* Overlay gradient at bottom */}
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
        </div>
      ) : hasValidAudio ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gradient-to-b from-slate-900 to-slate-950 relative overflow-hidden">
          {mediaError ? (
            <div className="absolute inset-0 bg-slate-950/95 flex flex-col items-center justify-center p-6 text-center text-xs space-y-2 z-10">
              <AlertTriangle className="w-8 h-8 text-amber-500 animate-pulse" />
              <span className="font-bold text-slate-300">تعذر تحميل الملف الصوتي</span>
              <span className="text-[10px] text-slate-500 max-w-xs">{mediaError}</span>
            </div>
          ) : null}
          {/* Audio Visualizer Waves (Static CSS or pulse) */}
          <div className="relative w-28 h-28 rounded-full bg-emerald-600/10 border border-emerald-500/20 flex items-center justify-center mb-6 shadow-2xl">
            <div className={`absolute inset-0 rounded-full bg-emerald-500/5 animate-ping ${isPlaying ? 'duration-1000' : 'paused'}`} />
            <div className="p-4 bg-emerald-600 text-white rounded-full shadow-lg shadow-emerald-600/30">
              <svg className="w-8 h-8 fill-current animate-bounce" viewBox="0 0 24 24">
                <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M12,6A6,6 0 0,0 6,12A6,6 0 0,0 12,18A6,6 0 0,0 18,12A6,6 0 0,0 12,6M12,8A4,4 0 0,1 16,12A4,4 0 0,1 12,16A4,4 0 0,1 8,12A4,4 0 0,1 12,8Z" />
              </svg>
            </div>
          </div>
          <audio
            ref={audioRef}
            src={targetAudioUrl}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onError={handleMediaError}
            className="hidden"
          />
          <h4 className="font-extrabold text-sm text-slate-300 text-center tracking-wide max-w-sm line-clamp-1 mb-1 font-serif">{title}</h4>
          <p className="text-[10px] text-slate-500 font-medium">تسجيل صوتي بجودة عالية ومزود بأدوات تحكم احترافية</p>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center p-12 bg-slate-900 text-slate-400 text-xs text-center space-y-2">
          <VolumeX className="w-8 h-8 text-slate-600" />
          <span className="font-bold font-serif text-slate-300">لا يوجد ملف وسائط متاح حالياً</span>
          <span className="text-[10px] text-slate-500">يرجى الانتظار حتى يتم تحميل رابط الصوت/الفيديو من قاعدة البيانات بشكل صحيح</span>
        </div>
      )}

      {/* Control Bar */}
      <div className="bg-slate-950/95 border-t border-slate-900 px-4 py-4 space-y-3.5 z-10">
        
        {/* Progress Timeline */}
        <div className="space-y-1">
          <div 
            ref={progressRef}
            onClick={handleProgressBarClick}
            className="w-full bg-slate-800 h-1.5 rounded-full cursor-pointer relative group overflow-hidden"
          >
            {/* Played Area */}
            <div 
              className="bg-emerald-600 h-full transition-all duration-75 relative"
              style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
            >
              {/* Slider thumb inside */}
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
          
          {/* Time text markers */}
          <div className="flex justify-between text-[10px] font-mono text-slate-500 font-bold">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Playback Buttons row */}
        <div className="flex items-center justify-between gap-3">
          
          {/* Left: Volume & Speed Controls */}
          <div className="flex items-center gap-3">
            {/* Speed Trigger */}
            <div className="relative">
              <button
                onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800/80 text-slate-300 text-[10px] font-mono transition-colors"
                title="سرعة التشغيل"
              >
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>{playbackRate}x</span>
              </button>

              {showSpeedMenu && (
                <div className="absolute bottom-full left-0 mb-2 w-24 bg-slate-900 border border-slate-800 rounded-xl shadow-xl overflow-hidden z-20 animate-fade-in py-1">
                  {speeds.map(s => (
                    <button
                      key={s}
                      onClick={() => changeSpeed(s)}
                      className={`w-full text-left font-mono px-3 py-1.5 text-xs transition-colors block ${
                        playbackRate === s 
                          ? 'bg-emerald-900/40 text-emerald-400 font-bold' 
                          : 'hover:bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {s}x
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Volume bar */}
            <div className="flex items-center gap-1 bg-slate-900/50 border border-slate-900/80 rounded-lg px-2 py-1">
              <button onClick={toggleMute} className="text-slate-400 hover:text-white transition-colors">
                {isMuted ? <VolumeX className="w-3.5 h-3.5 text-red-400" /> : <Volume2 className="w-3.5 h-3.5" />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-12 h-1 accent-emerald-600 bg-slate-800 rounded-lg cursor-pointer appearance-none"
              />
            </div>
          </div>

          {/* Center: Main Playback Controls */}
          <div className="flex items-center gap-2">
            {/* Backward 10s */}
            <button 
              onClick={() => skip(-10)}
              className="p-2 hover:bg-slate-900 rounded-full text-slate-400 hover:text-white transition-colors"
              title="رجوع 10 ثواني"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Play/Pause Main */}
            <button
              onClick={togglePlay}
              className="p-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full shadow-lg shadow-emerald-950/20 active:scale-95 transition-all"
              title={isPlaying ? "إيقاف مؤقت" : "تشغيل"}
            >
              {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
            </button>

            {/* Forward 10s */}
            <button 
              onClick={() => skip(10)}
              className="p-2 hover:bg-slate-900 rounded-full text-slate-400 hover:text-white transition-colors"
              title="تقديم 10 ثواني"
            >
              <RotateCw className="w-4 h-4" />
            </button>
          </div>

          {/* Right: Finished Badge */}
          <div className="flex items-center">
            {isFinished ? (
              <span className="text-[10px] bg-emerald-950/50 text-emerald-400 border border-emerald-900/40 px-2 py-1 rounded-lg font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> تم السماع
              </span>
            ) : (
              <span className="text-[9px] text-slate-500 font-mono font-medium">
                {duration > 0 ? `${Math.round((currentTime / duration) * 100)}%` : '0%'}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
