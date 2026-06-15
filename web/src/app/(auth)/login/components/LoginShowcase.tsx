"use client";

/**
 * @component LoginShowcase
 * @description Hiển thị cột bên phải của trang Đăng nhập với giao diện tương tác theo các Tab điều hướng từ cột trái.
 * Phân phối việc hiển thị cho các subcomponent tính năng tương ứng.
 */

import * as React from "react";
import { ShowcaseWorkspace } from "./ShowcaseWorkspace";
import { ShowcaseAI } from "./ShowcaseAI";
import { ShowcaseSignalR } from "./ShowcaseSignalR";

interface LoginShowcaseProps {
  activeSection: number;
}

export function LoginShowcase({ activeSection }: LoginShowcaseProps) {
  return (
    <div className="hidden lg:flex flex-col flex-1 relative bg-gradient-to-br from-[#FAF9F5] via-[#fcfbf9] to-[#f4f2eb] overflow-hidden h-screen select-none justify-center items-center px-12 xl:px-16 border-l border-stone-200/60">
      
      {/* Decorative Grid Overlay & Global Glows */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(139,127,116,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(139,127,116,0.04)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none z-0" />
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-amber-600/5 blur-[120px] animate-drift-one pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[10%] w-[600px] h-[600px] rounded-full bg-orange-600/5 blur-[140px] animate-drift-two pointer-events-none" />

      <div key={activeSection} className="w-full max-w-[960px] animate-fade-slide-up flex flex-col justify-center items-center min-h-[460px] relative z-10">
        {activeSection === 0 && <ShowcaseWorkspace />}
        {activeSection === 1 && <ShowcaseAI />}
        {activeSection === 2 && <ShowcaseSignalR />}
      </div>

      {/* FOOTER */}
      <div className="absolute bottom-8 right-12 z-20 text-[10px] text-stone-400 font-semibold font-mono">
        © 2026 BEAVERDASH MICROSERVICES PROJECT. ALL RIGHTS RESERVED.
      </div>
    </div>
  );
}
