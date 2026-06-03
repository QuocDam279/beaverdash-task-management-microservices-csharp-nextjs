"use client";

/**
 * @page LoginPage
 * @description Trang Đăng nhập Beaverdash với tùy chọn đăng nhập bằng tài khoản Google,
 * hiển thị bảng giới thiệu tính năng tương tác (FeaturesShowcase), logo tương tác 3D và cột đồ họa Showcase 3D Parallax bên phải.
 */

import * as React from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { LoginShowcase } from "./components/LoginShowcase";
import { Interactive3DLogo } from "./components/Interactive3DLogo";
import { FeaturesShowcase } from "./components/FeaturesShowcase";

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (isAuthenticated) {
      router.push("/tasks");
    }
  }, [isAuthenticated, router]);

  const handleGoogleCredentialResponse = React.useCallback(
    async (response: any) => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch("http://localhost:5000/api/auth/google", {
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
        login(data.token, data.user);
      } catch (err: any) {
        console.error("Google Auth Error:", err);
        setError(err.message || "Đã xảy ra lỗi kết nối với máy chủ.");
        setIsLoading(false);
      }
    },
    [login]
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
    <div className="flex min-h-screen w-full bg-slate-50 font-sans selection:bg-[#1868db]/20 selection:text-[#1868db]">
      {/* LEFT PANEL: Sign In Form & Features */}
      <div className="flex flex-col justify-between w-full lg:w-[45%] xl:w-[40%] bg-white p-8 sm:p-12 md:p-16 z-10 shadow-[0_0_40px_rgba(0,0,0,0.03)] border-r border-slate-100 relative overflow-hidden">
        {/* Subtle background radial glow */}
        <div className="absolute bottom-[-150px] left-[-150px] w-[300px] h-[300px] rounded-full bg-gradient-to-br from-[#1868db]/5 to-transparent blur-[60px] pointer-events-none" />

        <div className="flex items-center justify-between animate-fade-slide-up select-none">
          <span className="text-xs font-semibold text-[#1868db] bg-[#1868db]/10 px-2.5 py-1 rounded-full">
            v1.0.0 Stable
          </span>
        </div>

        {/* Center Auth Container */}
        <div className="flex-1 flex flex-col justify-center items-center max-w-[360px] mx-auto w-full py-6">
          {/* Logo 3D */}
          <div className="mb-4 animate-fade-slide-up delay-100 flex justify-center items-center">
            <Interactive3DLogo width={56} height={56} />
          </div>

          <div className="space-y-1 mb-4 animate-fade-slide-up delay-200 text-center">
            <h1 className="text-xl font-bold tracking-tight text-[#292a2e]">Đăng nhập Beaverdash</h1>
            <p className="text-xs text-[#505258] leading-relaxed">
              Truy cập nhanh không gian làm việc của bạn bằng tài khoản Google.
            </p>
          </div>

          {/* Features Checklist / Interactive Tabs */}
          <div className="w-full animate-fade-slide-up delay-250">
            <FeaturesShowcase />
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
                <svg className="animate-spin h-5 w-5 text-[#1868db]" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4} />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span className="text-[10px] text-[#505258] font-bold">Xác thực tài khoản Google...</span>
              </div>
            )}
            <div
              id="google-signin-btn"
              className={`w-full flex justify-center transition-all duration-300 ${
                isLoading ? "opacity-0 pointer-events-none scale-95" : "opacity-100 scale-100"
              }`}
            />
          </div>

          {/* Trust stats indicators */}
          <div className="flex justify-between items-center w-full max-w-[280px] mt-5 border-t border-slate-100 pt-4 text-[9px] text-slate-400 font-bold select-none uppercase tracking-wider animate-fade-slide-up delay-350">
            <span>5K+ Users</span>
            <span className="h-1 w-1 bg-slate-300 rounded-full" />
            <span>99.9% Uptime</span>
            <span className="h-1 w-1 bg-slate-300 rounded-full" />
            <span>SSL Secured</span>
          </div>
        </div>

        {/* Footer */}
        <div className="animate-fade-slide-up delay-400">
          <p className="text-[10px] text-[#6b6e76] leading-normal text-center sm:text-left">
            Bằng việc tiếp tục, bạn đồng ý với{" "}
            <a href="#" className="underline hover:text-[#1868db] transition-colors">Điều khoản</a>
            {" "}và{" "}
            <a href="#" className="underline hover:text-[#1868db] transition-colors">Chính sách bảo mật</a>
            {" "}của chúng tôi.
          </p>
        </div>
      </div>

      {/* RIGHT PANEL: Showcase 3D Parallax */}
      <LoginShowcase />
    </div>
  );
}
