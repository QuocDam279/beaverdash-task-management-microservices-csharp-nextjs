"use client";

/**
 * @page LoginPage
 * @description Trang Đăng nhập Beaverdash với tùy chọn đăng nhập bằng tài khoản Google,
 * tích hợp bộ nút menu dọc điều hướng tính năng hệ thống ở cột trái để đổi tương ứng mockup 3D ở cột phải.
 */

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/components/providers/AuthProvider";
import { LoginShowcase } from "./components/LoginShowcase";

interface NavSection {
  title: string;
  desc: string;
  icon: React.ReactNode;
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/tasks";
  const { login, isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Quản lý state phần tính năng đang chọn để hiển thị ở cột phải
  const [activeSection, setActiveSection] = React.useState<number>(0);

  const navSections: NavSection[] = [
    {
      title: "Không gian làm việc",
      desc: "Quản lý công việc bằng bảng kéo thả, lịch biểu và sơ đồ Gantt.",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" />
        </svg>
      ),
    },
    {
      title: "Trợ lý AI",
      desc: "Tự động lập kế hoạch, đề xuất việc cần làm và soạn thảo thông minh.",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 21l-.813-5.096L3 15l5.096-.813L9 9l.813 5.096L15 15l-5.187.904zM18.007 7.007L17 10l-1.007-2.993L13 6l2.993-1.007L17 2l1.007 2.993L21 6l-2.993 1.007z" />
        </svg>
      ),
    },
    {
      title: "Đồng bộ thời gian thực",
      desc: "Cập nhật tiến độ dự án thời gian thực và kết nối đội nhóm tức thì.",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    },
  ];

  React.useEffect(() => {
    if (isAuthenticated) {
      router.push(redirect);
    }
  }, [isAuthenticated, router, redirect]);

  React.useEffect(() => {
    const lastScrollTime = { current: 0 };
    
    const handleWheel = (e: WheelEvent) => {
      const target = e.target as HTMLElement;
      const isInsideScrollable = target.closest(".overflow-y-auto, .overflow-y-scroll");
      if (isInsideScrollable) {
        const scrollable = isInsideScrollable as HTMLElement;
        const canScrollDown = scrollable.scrollHeight > scrollable.clientHeight && scrollable.scrollTop < (scrollable.scrollHeight - scrollable.clientHeight - 2);
        const canScrollUp = scrollable.scrollTop > 2;
        if ((e.deltaY > 0 && canScrollDown) || (e.deltaY < 0 && canScrollUp)) {
          return;
        }
      }

      const now = Date.now();
      if (now - lastScrollTime.current < 800) return;

      if (e.deltaY > 20) {
        setActiveSection((prev) => {
          const next = prev + 1;
          return next < 3 ? next : prev;
        });
        lastScrollTime.current = now;
      } else if (e.deltaY < -20) {
        setActiveSection((prev) => {
          const next = prev - 1;
          return next >= 0 ? next : prev;
        });
        lastScrollTime.current = now;
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: true });
    return () => {
      window.removeEventListener("wheel", handleWheel);
    };
  }, []);

  const handleGoogleCredentialResponse = React.useCallback(
    async (response: any) => {
      setIsLoading(true);
      setError(null);
      try {
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        const res = await fetch(`${apiBaseUrl}/api/auth/google`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ idToken: response.credential }),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || "Xác thực với hệ thống thất bại.");
        }

        const data = await res.json();
        login(data.token, data.user, redirect);
      } catch (err: any) {
        console.error("Google Auth Error:", err);
        setError(err.message || "Đã xảy ra lỗi kết nối với máy chủ.");
        setIsLoading(false);
      }
    },
    [login, redirect]
  );

  const callbackRef = React.useRef(handleGoogleCredentialResponse);
  React.useEffect(() => {
    callbackRef.current = handleGoogleCredentialResponse;
  }, [handleGoogleCredentialResponse]);

  React.useEffect(() => {
    const initGoogle = () => {
      const google = typeof window !== "undefined" ? (window as any).google : undefined;
      console.log("[Google Auth] initGoogle triggered. Google available:", !!google);
      if (google) {
        const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
        console.log("[Google Auth] Client ID:", clientId);
        if (!clientId) {
          console.error("[Google Auth] NEXT_PUBLIC_GOOGLE_CLIENT_ID is missing!");
        }
        if (!(window as any).google_initialized) {
          console.log("[Google Auth] Initializing Google SDK...");
          google.accounts.id.initialize({
            client_id: clientId || "",
            callback: (response: any) => callbackRef.current(response),
            auto_select: false,
            use_fedcm: false,
          });
          (window as any).google_initialized = true;
        }

        const btnElement = document.getElementById("google-signin-btn");
        console.log("[Google Auth] Button container found:", !!btnElement);
        if (btnElement) {
          btnElement.innerHTML = "";
          google.accounts.id.renderButton(btnElement, {
            theme: "outline",
            size: "medium",
            width: "280",
            text: "signin_with",
            shape: "rectangular",
            logo_alignment: "center",
          });
          console.log("[Google Auth] renderButton called successfully.");
        }
      }
    };

    initGoogle();
    const timer = setTimeout(initGoogle, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex min-h-screen w-full bg-[#FAF9F5] font-sans selection:bg-amber-200/50 selection:text-[#5c3a21]">
      {/* LEFT PANEL: Sign In Form & Features navigation */}
      <div className="flex flex-col justify-between w-full lg:w-[45%] xl:w-[40%] bg-[#FAF9F5] p-8 sm:p-12 md:p-16 z-10 shadow-[0_0_40px_rgba(43,34,26,0.02)] border-r border-stone-200/60 relative overflow-hidden shrink-0">
        {/* Subtle background radial glow */}
        <div className="absolute bottom-[-150px] left-[-150px] w-[300px] h-[300px] rounded-full bg-gradient-to-br from-[#854d0e]/5 to-transparent blur-[60px] pointer-events-none" />

        <div className="flex items-center justify-between animate-fade-slide-up select-none">
          <span className="text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200/60 px-2.5 py-1 rounded-full">
            v1.0.0 Stable
          </span>
        </div>

        {/* Center Auth Container */}
        <div className="flex-1 flex flex-col justify-center items-center max-w-[360px] mx-auto w-full py-4">
          {/* Logo */}
          <div className="mb-3 animate-fade-slide-up delay-100 flex justify-center items-center">
            <Image src="/logo.svg" alt="Beaverdash Logo" width={56} height={56} className="object-contain select-none" priority />
          </div>

          <div className="space-y-0.5 mb-4 animate-fade-slide-up delay-200 text-center">
            <h1 className="text-xl font-bold tracking-tight text-[#2b221a]">Đăng nhập BeaverDash</h1>
            <p className="text-xs text-stone-500 leading-relaxed">
              Truy cập nhanh không gian làm việc của bạn bằng tài khoản Google.
            </p>
          </div>

          {/* Features Navigation (Left Panel Menu) */}
          <div className="w-full space-y-2 mb-5 animate-fade-slide-up delay-250">
            {navSections.map((sec, idx) => {
              const isActive = idx === activeSection;
              return (
                <button
                  key={idx}
                  onClick={() => setActiveSection(idx)}
                  className={`w-full flex items-center gap-3.5 p-3 rounded-xl border text-left cursor-pointer transition-all duration-300 ${
                    isActive
                      ? "bg-white border-stone-200 shadow-[0_4px_12px_rgba(133,77,14,0.05)] text-amber-700"
                      : "bg-transparent hover:bg-white/40 border-transparent text-stone-600"
                  }`}
                >
                  <div className={`p-2.5 rounded-lg shrink-0 transition-colors ${
                    isActive ? "bg-amber-50 text-amber-700" : "bg-stone-100 text-stone-400"
                  }`}>
                    {sec.icon}
                  </div>
                  <div className="space-y-0.5 min-w-0">
                    <h4 className="text-xs font-bold text-[#2b221a] leading-none">{sec.title}</h4>
                    <p className="text-[10px] text-stone-550 truncate leading-tight">{sec.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {error && (
            <div className="w-full rounded-lg bg-red-50 border border-red-200/60 p-3.5 text-xs text-red-600 font-medium mb-5 animate-fade-slide-up">
              <div className="flex gap-2">
                <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>{error}</span>
              </div>
            </div>
          )}

          {/* Button Container */}
          <div className="relative min-h-[50px] w-full animate-fade-slide-up delay-300 flex justify-center items-center">
            {isLoading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-white/95 z-20 rounded-xl">
                <svg className="animate-spin h-5 w-5 text-amber-700" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4} />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span className="text-[10px] text-stone-600 font-bold">Xác thực tài khoản Google...</span>
              </div>
            )}
            <div
              id="google-signin-btn"
              className={`w-full flex justify-center transition-all duration-300 ${
                isLoading ? "opacity-0 pointer-events-none scale-95" : "opacity-100 scale-100"
              }`}
            />
          </div>

        </div>

        {/* Footer */}
        <div className="animate-fade-slide-up delay-400 text-center w-full">
          <p className="text-[10px] text-[#6b6e76] leading-normal text-center">
            Bằng việc tiếp tục, bạn đồng ý với{" "}
            <a href="#" className="underline hover:text-[#854d0e] transition-colors">Điều khoản</a>
            {" "}và{" "}
            <a href="#" className="underline hover:text-[#854d0e] transition-colors">Chính sách bảo mật</a>
            {" "}của chúng tôi.
          </p>
        </div>
      </div>

      {/* RIGHT PANEL: Showcase dynamically rendered based on activeSection */}
      <LoginShowcase activeSection={activeSection} />
    </div>
  );
}

export default function LoginPage() {
  return (
    <React.Suspense fallback={
      <div className="flex min-h-screen w-full items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-2 select-none">
          <svg className="animate-spin h-6 w-6 text-[#1868db]" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4} />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="text-[10px] text-slate-400 font-bold">Đang tải trang đăng nhập...</span>
        </div>
      </div>
    }>
      <LoginContent />
    </React.Suspense>
  );
}
