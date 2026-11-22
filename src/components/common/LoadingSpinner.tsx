import React from 'react';
import { BookOpen } from 'lucide-react';

interface Props {
  fullScreen?: boolean;
  message?: string;
}

export const LoadingSpinner: React.FC<Props> = ({ fullScreen = false, message = "جاري تحميل مجالس العلم..." }) => {
  const content = (
    <div className="flex flex-col items-center justify-center gap-4 p-8">
      <div className="relative flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-emerald-200 dark:border-emerald-900 rounded-full animate-ping"></div>
        <div className="absolute w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
        <BookOpen className="w-5 h-5 text-emerald-600 animate-pulse absolute" />
      </div>
      <p className="text-sm font-medium text-slate-600 dark:text-slate-400 animate-pulse">{message}</p>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-sm">
        {content}
      </div>
    );
  }

  return content;
};
