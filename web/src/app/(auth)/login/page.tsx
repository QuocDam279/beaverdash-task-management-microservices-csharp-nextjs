"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardBody, CardFooter } from "@/components/ui/Card";
import { useAuth } from "@/components/providers/AuthProvider";

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // If already authenticated, the AuthProvider will redirect, but we can prevent double rendering
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
      if (google) {
        const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
        
        if (!clientId) {
          console.warn("NEXT_PUBLIC_GOOGLE_CLIENT_ID env variable is not set.");
        }

        // Initialize Google Sign-In SDK only once globally
        if (!(window as any).google_initialized) {
          google.accounts.id.initialize({
            client_id: clientId || "",
            callback: (response: any) => callbackRef.current(response),
            auto_select: false,
            use_fedcm: false, // Opt-out of FedCM to resolve console errors on localhost
          });
          (window as any).google_initialized = true;
        }

        const btnElement = document.getElementById("google-signin-btn");
        if (btnElement) {
          google.accounts.id.renderButton(btnElement, {
            theme: "outline",
            size: "large",
            width: "352", // Matches modern layouts
            text: "signin_with",
            shape: "rectangular",
          });
        }

      }
    };

    // Run on load
    initGoogle();

    // Check again after 1 sec as fallback
    const timer = setTimeout(initGoogle, 1000);
    return () => {
      clearTimeout(timer);
    };
  }, []);

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-slate-50 p-4 font-sans selection:bg-[#1868db]/20 selection:text-[#1868db]">
      <Card className="w-full max-w-[400px] border border-slate-200 bg-white p-2 shadow-[0_8px_12px_rgba(30,31,33,0.15),0_0_1px_rgba(30,31,33,0.31)] transition-all duration-200">
        <CardHeader className="flex flex-col items-center text-center space-y-3 pb-4">
          {/* Beaverdash Logo (Custom SVG) */}
          <div className="flex h-14 w-14 items-center justify-center rounded-lg overflow-hidden">
            <img
              src="/logo.svg"
              alt="Beaverdash Logo"
              className="h-full w-full object-contain"
            />
          </div>
          <div className="space-y-1">
            <h1 className="text-xl font-bold tracking-tight text-[#292a2e]">
              Đăng nhập vào Beaverdash
            </h1>
            <p className="text-xs text-[#505258]">
              Hệ thống quản lý công việc và bảng Kanban thông minh
            </p>
          </div>
        </CardHeader>
 
        <CardBody className="space-y-4 pt-2">
          <div className="text-center text-sm text-[#505258] leading-relaxed">
            Chào mừng bạn quay trở lại. Hãy sử dụng tài khoản Google để truy cập vào không gian làm việc của bạn.
          </div>
 
          {error && (
            <div className="rounded-[4px] bg-red-50 border border-red-200 p-3 text-xs text-red-600 font-medium">
              {error}
            </div>
          )}
 
          {/* Google Sign-in Button Container */}
          <div className="flex flex-col items-center justify-center py-2 relative min-h-[50px] w-full">
            {isLoading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-white z-10">
                <svg
                  className="animate-spin h-5 w-5 text-[#1868db]"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span className="text-xs text-slate-500 font-semibold">Đang xác thực thông tin...</span>
              </div>
            )}
            <div
              id="google-signin-btn"
              className={`w-full flex justify-center transition-opacity duration-200 ${
                isLoading ? "opacity-0 pointer-events-none" : "opacity-100"
              }`}
            />
          </div>
        </CardBody>

        <CardFooter className="text-center pt-2">
          <p className="text-[10px] text-[#6b6e76] leading-normal w-full">
            Bằng việc tiếp tục, bạn đồng ý với Điều khoản dịch vụ và Chính sách bảo mật của Beaverdash.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
