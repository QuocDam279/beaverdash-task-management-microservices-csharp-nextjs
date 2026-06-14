"use client";

import * as React from "react";

/**
 * @page GlobalError
 * @description Bắt lỗi ở cấp cao nhất — bao gồm cả root layout.
 * Đây là fallback cuối cùng của ứng dụng. File này PHẢI tự render thẻ <html> và <body>
 * vì khi lỗi xảy ra ở root layout, toàn bộ cây component bị unmount.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error("Global Error:", error);
  }, [error]);

  return (
    <html lang="vi">
      <body style={{ margin: 0, fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif" }}>
        <div style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #f8fafc 0%, #ffffff 50%, #fef2f2 100%)",
          padding: "24px",
        }}>
          <div style={{
            textAlign: "center",
            maxWidth: "440px",
          }}>
            {/* Error Icon */}
            <div style={{
              width: 80,
              height: 80,
              borderRadius: 16,
              background: "linear-gradient(135deg, #fef2f2, #fff7ed)",
              border: "1px solid #fecaca",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 24,
              boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
            }}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" style={{ color: "#ef4444" }}>
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
                <path d="M12 8v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <circle cx="12" cy="16" r="1" fill="currentColor" />
              </svg>
            </div>

            {/* Heading */}
            <h1 style={{
              fontSize: 24,
              fontWeight: 800,
              color: "#292a2e",
              margin: "0 0 12px",
              letterSpacing: "-0.025em",
            }}>
              Lỗi hệ thống nghiêm trọng
            </h1>

            {/* Description */}
            <p style={{
              fontSize: 14,
              color: "#505258",
              lineHeight: 1.6,
              margin: "0 0 24px",
            }}>
              Ứng dụng gặp phải lỗi nghiêm trọng và không thể tiếp tục hoạt động. Vui lòng thử tải lại trang.
            </p>

            {/* Error detail */}
            {error?.message && (
              <div style={{
                padding: "10px 14px",
                borderRadius: 8,
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                marginBottom: 24,
                textAlign: "left",
              }}>
                <code style={{
                  fontSize: 11,
                  color: "#dc2626",
                  fontFamily: "monospace",
                  wordBreak: "break-all",
                }}>
                  {error.message}
                </code>
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <button
                onClick={reset}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "10px 24px",
                  background: "#1868db",
                  color: "#ffffff",
                  fontSize: 14,
                  fontWeight: 700,
                  border: "none",
                  borderRadius: 8,
                  cursor: "pointer",
                  boxShadow: "0 2px 8px rgba(24,104,219,0.25)",
                }}
              >
                ↻ Tải lại trang
              </button>
              <a
                href="/tasks"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "10px 24px",
                  background: "#ffffff",
                  color: "#292a2e",
                  fontSize: 14,
                  fontWeight: 700,
                  border: "1px solid #e2e8f0",
                  borderRadius: 8,
                  textDecoration: "none",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                }}
              >
                ⌂ Về trang chủ
              </a>
            </div>

            {/* Footer */}
            <p style={{
              fontSize: 10,
              color: "#94a3b8",
              marginTop: 40,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              fontWeight: 600,
            }}>
              BeaverDash · Quản lý dự án sinh viên
            </p>
          </div>
        </div>
      </body>
    </html>
  );
}
