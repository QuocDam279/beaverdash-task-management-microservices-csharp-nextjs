"use client";

import * as React from "react";

interface EmailListInputProps {
  emails: string[];
  onChange: (emails: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  onValidateEmail?: (email: string) => Promise<string | null>;
}

export default function EmailListInput({
  emails,
  onChange,
  placeholder = "Nhập email...",
  disabled = false,
  onValidateEmail,
}: EmailListInputProps) {
  const [inputValue, setInputValue] = React.useState("");
  const [isValidating, setIsValidating] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Auto refocus when validation completes (transitioning from true to false)
  const prevIsValidating = React.useRef(isValidating);
  React.useEffect(() => {
    if (prevIsValidating.current && !isValidating) {
      inputRef.current?.focus();
    }
    prevIsValidating.current = isValidating;
  }, [isValidating]);

  const handleAddEmail = async () => {
    const trimmed = inputValue.trim().toLowerCase();
    if (!trimmed) return;

    // Simple email regex validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      setError("Email không đúng định dạng.");
      inputRef.current?.focus();
      return;
    }

    if (emails.includes(trimmed)) {
      setError("Email này đã được thêm vào danh sách.");
      inputRef.current?.focus();
      return;
    }

    if (onValidateEmail) {
      try {
        setIsValidating(true);
        setError(null);
        const validationError = await onValidateEmail(trimmed);
        if (validationError) {
          setError(validationError);
          return;
        }
      } catch (err) {
        setError("Lỗi kiểm tra tính hợp lệ của email.");
        return;
      } finally {
        setIsValidating(false);
      }
    }

    onChange([...emails, trimmed]);
    setInputValue("");
    setError(null);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault(); // Prevent form submission
      handleAddEmail();
    }
  };

  const handleRemoveEmail = (indexToRemove: number) => {
    onChange(emails.filter((_, idx) => idx !== indexToRemove));
    inputRef.current?.focus();
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            ref={inputRef}
            type="text"
            disabled={disabled || isValidating}
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              if (error) setError(null); // Clear error when typing
            }}
            onKeyDown={handleKeyDown}
            placeholder={isValidating ? "Đang xác thực email..." : placeholder}
            className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-[4px] bg-white text-[#292a2e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1868db] focus-visible:border-transparent transition-all disabled:opacity-60"
          />
        </div>
        <button
          type="button"
          disabled={disabled || isValidating || !inputValue.trim()}
          onClick={(e) => {
            e.preventDefault();
            handleAddEmail();
          }}
          className="bg-[#1868db] hover:bg-[#0052cc] active:bg-[#0747a6] text-white p-2 rounded-[4px] transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center shrink-0 min-w-[32px] min-h-[30px]"
          title="Thêm email"
        >
          {isValidating ? (
            /* Visual loading spinner */
            <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          ) : (
            /* Visual SVG Plus Icon */
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          )}
        </button>
      </div>

      {error && (
        <p className="text-[10px] text-red-500 font-semibold mt-0.5">
          ⚠️ {error}
        </p>
      )}

      {/* List of added emails displayed below */}
      {emails.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1.5 max-h-32 overflow-y-auto custom-chat-scrollbar">
          {emails.map((email, idx) => (
            <div
              key={email}
              className="inline-flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-[4px] text-[11px] text-[#292a2e] font-medium transition-all hover:border-slate-300"
            >
              <span className="truncate max-w-[200px]">{email}</span>
              <button
                type="button"
                disabled={disabled}
                onClick={() => handleRemoveEmail(idx)}
                className="text-slate-400 hover:text-red-500 cursor-pointer disabled:opacity-50 p-0.5 rounded transition-all hover:bg-slate-200/50"
                title="Xóa email"
              >
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
