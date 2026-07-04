"use client";

import * as React from "react";
import { ShowcaseKanban } from "./ShowcaseKanban";
import { ShowcaseCalendar } from "./ShowcaseCalendar";
import { ShowcaseGantt } from "./ShowcaseGantt";

export function ShowcaseWorkspace() {
  const [isBoardHovered, setIsBoardHovered] = React.useState(false);
  const [currentSubTab, setCurrentSubTab] = React.useState<number>(0);
  const lastInteractionTime = React.useRef<number>(0);

  React.useEffect(() => {
    lastInteractionTime.current = Date.now();

    const handleInteraction = () => {
      lastInteractionTime.current = Date.now();
    };

    window.addEventListener("mousemove", handleInteraction);
    window.addEventListener("click", handleInteraction);
    window.addEventListener("keydown", handleInteraction);
    window.addEventListener("touchstart", handleInteraction);

    const interval = setInterval(() => {
      const now = Date.now();
      const idleTime = now - lastInteractionTime.current;
      
      if (idleTime >= 5000) {
        setCurrentSubTab((prev) => (prev + 1) % 3);
        lastInteractionTime.current = now;
      }
    }, 1000);

    return () => {
      window.removeEventListener("mousemove", handleInteraction);
      window.removeEventListener("click", handleInteraction);
      window.removeEventListener("keydown", handleInteraction);
      window.removeEventListener("touchstart", handleInteraction);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="w-full flex flex-col justify-center items-center select-none font-sans text-slate-800">
      {/* SaaS Mockup Container with Floating Widgets */}
      <div className="relative w-full max-w-[920px] flex flex-col items-center py-6 px-8">
        
        {/* Floating Widget 1: Sprint Progress Radial Card */}
        <div className="absolute -top-1 -left-4 bg-white/95 border border-slate-200/80 shadow-xl rounded-xl p-3 flex items-center gap-3 z-20 transition-all duration-300 hover:scale-105 select-none w-44 hover:shadow-2xl">
          <div className="w-9 h-9 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 font-extrabold text-xs">84%</div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold text-slate-800 leading-none">Hoàn thành Sprint</p>
            <p className="text-[8px] text-slate-400 mt-1 leading-none">Tuần 24: Giao diện</p>
          </div>
        </div>

        {/* Floating Widget 2: Performance Graph Card */}
        <div className="absolute -bottom-5 -left-6 bg-white/95 border border-slate-200/80 shadow-xl rounded-xl p-3 flex flex-col gap-1.5 z-20 transition-all duration-300 hover:scale-105 select-none w-44 hover:shadow-2xl">
          <div className="flex justify-between items-center">
            <span className="text-[9px] font-bold text-slate-800">Hiệu suất đội ngũ</span>
            <span className="text-[8.5px] font-extrabold text-emerald-600 bg-emerald-50 px-1 rounded">+35%</span>
          </div>
          <div className="h-6 w-full mt-0.5">
            <svg className="w-full h-full" viewBox="0 0 100 30" preserveAspectRatio="none">
              <path d="M0,25 Q15,5 30,18 T60,8 T90,3 T100,15 L100,30 L0,30 Z" fill="url(#sparkline-grad)" />
              <path d="M0,25 Q15,5 30,18 T60,8 T90,3 T100,15" fill="none" stroke="#1868db" strokeWidth="2" strokeLinecap="round" />
              <defs>
                <linearGradient id="sparkline-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1868db" stopOpacity="0.2"/>
                  <stop offset="100%" stopColor="#1868db" stopOpacity="0"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

        {/* Floating Widget 3: Active Members Card */}
        <div className="absolute -bottom-3 -right-2 bg-white/95 border border-slate-200/80 shadow-xl rounded-xl p-3 flex flex-col gap-2 z-20 transition-all duration-300 hover:scale-105 select-none w-44 hover:shadow-2xl">
          <p className="text-[9.5px] font-bold text-slate-800 border-b border-slate-100 pb-1 flex items-center justify-between">
            <span>Hoạt động (3)</span>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          </p>
          <div className="flex items-center justify-between">
            <div className="flex -space-x-1.5">
              <div className="w-5.5 h-5.5 rounded-full bg-emerald-500 text-[8px] font-extrabold flex items-center justify-center text-white border border-white">LC</div>
              <div className="w-5.5 h-5.5 rounded-full bg-purple-500 text-[8px] font-extrabold flex items-center justify-center text-white border border-white">AI</div>
              <div className="w-5.5 h-5.5 rounded-full bg-pink-500 text-[8px] font-extrabold flex items-center justify-center text-white border border-white">MA</div>
            </div>
            <span className="text-[8px] font-extrabold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100 uppercase tracking-wide">Thời gian thực</span>
          </div>
        </div>

        {/* Browser Mockup Shell */}
        <div
          onMouseEnter={() => setIsBoardHovered(true)}
          onMouseLeave={() => setIsBoardHovered(false)}
          className="rounded-2xl w-full shadow-2xl border border-slate-200/80 backdrop-blur-xl mb-8 transition-all duration-300 bg-white/60 overflow-hidden flex flex-col relative z-10"
          style={{
            transform: isBoardHovered ? "translateY(-4px)" : "translateY(0px)",
            boxShadow: isBoardHovered
              ? "0 30px 60px -15px rgba(100, 116, 139, 0.22), 0 0 40px -10px rgba(24, 104, 219, 0.05)"
              : "0 15px 35px -15px rgba(100, 116, 139, 0.12)",
          }}
        >
          {/* Mock Browser Header (Mac dots & URL) */}
          <div className="bg-slate-100/90 border-b border-slate-200/60 px-4 py-2.5 flex items-center gap-3">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
            </div>
            <div className="flex-1 max-w-sm mx-auto bg-slate-200/60 rounded-md py-0.5 px-3 flex items-center justify-center text-[10px] text-slate-500 font-mono select-none">
              <svg className="w-2.5 h-2.5 text-slate-400 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              workspace/tasks
            </div>
          </div>

          {/* Mock App Container (Main content area only) */}
          <div className="flex flex-1 min-h-[380px] text-left">

            {/* Mock Main Content Area */}
            <div className="flex-1 p-5 flex flex-col justify-start overflow-hidden">
              {/* Tabs Switcher inside Mockup */}
              <div className="flex gap-1.5 mb-4 bg-slate-200/40 p-0.5 rounded-lg w-fit border border-slate-200/60 text-[11px]">
                {["Bảng công việc", "Lịch biểu", "Sơ đồ tiến độ"].map((t, idx) => {
                  const isSubActive = idx === currentSubTab;
                  return (
                    <button
                      key={idx}
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentSubTab(idx);
                        lastInteractionTime.current = Date.now();
                      }}
                      className={`px-3 py-1 rounded-md transition-all duration-300 font-semibold cursor-pointer text-[10px] ${
                        isSubActive
                          ? "bg-white text-slate-800 shadow-sm"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>

              {/* Tab views */}
              <div className="flex-1 flex flex-col justify-center">
                {currentSubTab === 0 && <ShowcaseKanban />}
                {currentSubTab === 1 && <ShowcaseCalendar />}
                {currentSubTab === 2 && <ShowcaseGantt />}
              </div>
            </div>
          </div>
        </div>

        {/* Heading description below mockup */}
        <div className="text-center max-w-[500px]">
          <h2 className="text-lg font-bold text-slate-800 mb-2">Không gian làm việc và Bảng nhiệm vụ</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Theo dõi và quản lý toàn bộ công việc trực quan trên bảng kéo thả. Sắp xếp các cột trạng thái và phân công công việc dễ dàng.
          </p>
        </div>
      </div>
    </div>
  );
}
