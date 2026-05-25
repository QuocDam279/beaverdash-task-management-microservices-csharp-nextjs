"use client";

import * as React from "react";
import { Sidebar, TopHeader } from "@/components/layout";
import { useAuth } from "@/components/providers/AuthProvider";

/**
 * Dashboard Layout — Shell bố cục chính.
 * Chỉ chịu trách nhiệm kết hợp Sidebar, TopHeader và vùng nội dung.
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-white">
        <svg
          className="animate-spin h-8 w-8 text-[#1868db]"
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
      </div>
    );
  }

  const currentUser = user || { displayName: "", email: "", avatar: null }; // Fallback to empty user if not authenticated (will be redirected by AuthProvider)

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-white text-[#292a2e] font-sans">
      {/* LEFT SIDEBAR */}
      <Sidebar />

      {/* RIGHT SIDE CONTAINER */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden bg-white">
        {/* TOP GLOBAL HEADER */}
        <TopHeader currentUser={currentUser} />

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 min-h-0 overflow-auto bg-white">
          {children}
        </main>
      </div>
    </div>
  );
}
