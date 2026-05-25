"use client";

import * as React from "react";

interface AvatarProps {
  src: string | null | undefined;
  alt: string;
  className?: string;
  title?: string;
}

/**
 * Avatar Component
 * Handles Google avatar loading failures (e.g. 403 Forbidden) and null/undefined values
 * by automatically falling back to a Dicebear SVG avatar based on the user's name.
 */
export function Avatar({ src, alt, className = "", title }: AvatarProps) {
  const getDicebearUrl = React.useCallback((name: string) => {
    return `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(name || "User")}`;
  }, []);

  const isInvalidSrc = (url: any) => {
    if (!url) return true;
    const s = String(url).trim().toLowerCase();
    return s === "" || s === "null" || s === "undefined";
  };

  const initialSrc = isInvalidSrc(src) ? getDicebearUrl(alt) : src!;
  const [imgSrc, setImgSrc] = React.useState<string>(initialSrc);

  // Sync state when src or alt changes
  React.useEffect(() => {
    setImgSrc(isInvalidSrc(src) ? getDicebearUrl(alt) : src!);
  }, [src, alt, getDicebearUrl]);

  const handleError = () => {
    const fallback = getDicebearUrl(alt);
    if (imgSrc !== fallback) {
      setImgSrc(fallback);
    }
  };

  return (
    <img
      src={imgSrc}
      alt={alt}
      title={title || alt}
      onError={handleError}
      className={className}
      referrerPolicy="no-referrer"
    />
  );
}
