import React, { useState, useEffect } from 'react';
import { resolveFileUrl } from '../../types';
import { DEFAULT_COURSE_COVER, DEFAULT_BOOK_COVER } from '../../lib/storageMedia';

interface CoverImageProps {
  src?: string | null;
  alt: string;
  type: 'course' | 'book';
  className?: string;
}

export const CoverImage: React.FC<CoverImageProps> = ({ src, alt, type, className = '' }) => {
  const fallback = type === 'book' ? DEFAULT_BOOK_COVER : DEFAULT_COURSE_COVER;
  const resolved = resolveFileUrl(src);
  const [imgSrc, setImgSrc] = useState<string>(resolved || fallback);

  useEffect(() => {
    setImgSrc(resolveFileUrl(src) || fallback);
  }, [src, fallback]);

  return (
    <img
      src={imgSrc}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => {
        if (imgSrc !== fallback) {
          setImgSrc(fallback);
        }
      }}
      className={className}
    />
  );
};
