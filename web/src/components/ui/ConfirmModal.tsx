"use client";

import * as React from "react";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string | React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void | Promise<void>;
  onClose: () => void;
  variant?: "danger" | "warning" | "info" | "success";
}

export function ConfirmModal({
  isOpen,
  title,
  message,
  confirmLabel = "Xác nhận",
  cancelLabel,
  onConfirm,
  onClose,
  variant = "info",
}: ConfirmModalProps) {
  const [isPending, setIsPending] = React.useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setIsPending(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setIsPending(true);
    try {
      await onConfirm();
      onClose();
    } catch (err) {
      console.error("Confirmation action failed:", err);
    } finally {
      setIsPending(false);
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case "danger":
        return {
          button: "bg-red-600 hover:bg-red-700 text-white border-0 focus:ring-red-500",
          iconBg: "bg-red-50 text-red-500",
          icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-6 w-6">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          ),
        };
      case "warning":
        return {
          button: "bg-amber-500 hover:bg-amber-600 text-white border-0 focus:ring-amber-500",
          iconBg: "bg-amber-50 text-amber-600",
          icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-6 w-6">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          ),
        };
      case "success":
        return {
          button: "bg-emerald-600 hover:bg-emerald-700 text-white border-0 focus:ring-emerald-500",
          iconBg: "bg-emerald-50 text-emerald-600",
          icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-6 w-6">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          ),
        };
      case "info":
      default:
        return {
          button: "bg-[#1868db] hover:bg-[#1456b8] text-white border-0 focus:ring-[#1868db]",
          iconBg: "bg-blue-50 text-[#1868db]",
          icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-6 w-6">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
          ),
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div className="fixed inset-0 bg-black/45 backdrop-blur-xs flex items-center justify-center z-50 p-4 select-none animate-in fade-in duration-200">
      {/* Backdrop click closer */}
      <div className="absolute inset-0" onClick={isPending ? undefined : onClose} />
      
      <div className="relative bg-white rounded-lg border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        {/* Content Container */}
        <div className="p-6 flex gap-4">
          {/* Icon Column */}
          <div className={`p-2.5 rounded-lg shrink-0 h-11 w-11 flex items-center justify-center ${styles.iconBg}`}>
            {styles.icon}
          </div>
          
          {/* Text Column */}
          <div className="flex-1 space-y-1">
            <h3 className="text-sm font-bold text-[#292a2e] leading-snug">
              {title}
            </h3>
            <div className="text-xs text-[#505258] leading-relaxed break-words whitespace-pre-wrap">
              {message}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-2.5 shrink-0">
          {cancelLabel && (
            <button
              type="button"
              disabled={isPending}
              onClick={onClose}
              className="bg-transparent hover:bg-slate-100 disabled:opacity-50 text-[#505258] text-xs font-bold px-4 py-2 rounded-[4px] border border-slate-200 cursor-pointer transition-colors disabled:cursor-not-allowed"
            >
              {cancelLabel}
            </button>
          )}
          <button
            type="button"
            disabled={isPending}
            onClick={handleConfirm}
            className={`min-w-[80px] font-bold text-xs px-4 py-2 rounded-[4px] cursor-pointer transition-colors disabled:cursor-not-allowed flex items-center justify-center gap-1.5 ${styles.button}`}
          >
            {isPending ? (
              <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : null}
            {isPending ? "Đang xử lý..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
