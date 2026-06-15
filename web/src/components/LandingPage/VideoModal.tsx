"use client";

import * as React from "react";

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoSrc: string;
}

/**
 * @component VideoModal
 * @description Hộp thoại nổi (modal) chất lượng cao hiển thị video giới thiệu với nền kính mờ.
 */
export function VideoModal({ isOpen, onClose, videoSrc }: VideoModalProps) {
  // Ngăn cuộn trang body khi modal đang mở
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Lắng nghe phím ESC để đóng modal
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-stone-950/85 backdrop-blur-md p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* Nút đóng góc trên bên phải */}
      <button
        onClick={onClose}
        className="absolute top-6 right-6 text-stone-400 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10 cursor-pointer z-10"
        title="Đóng (Esc)"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth="2.5"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Vùng chứa Video */}
      <div
        className="relative w-full max-w-4xl aspect-video rounded-2xl overflow-hidden bg-black shadow-2xl border border-stone-800 animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()} // Ngăn sự kiện click lan ra ngoài làm đóng modal
      >
        <video
          src={videoSrc}
          className="w-full h-full object-contain"
          controls
          autoPlay
          playsInline
        >
          Trình duyệt của bạn không hỗ trợ xem video trực tiếp.
        </video>
      </div>
    </div>
  );
}
