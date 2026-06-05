"use client";

import * as React from "react";
import { ShowcaseKanban } from "./ShowcaseKanban";
import { ShowcaseCalendar } from "./ShowcaseCalendar";
import { ShowcaseGantt } from "./ShowcaseGantt";

export function ShowcaseWorkspace() {
  const boardRef = React.useRef<HTMLDivElement>(null);
  const [tiltX, setTiltX] = React.useState(0);
  const [tiltY, setTiltY] = React.useState(0);
  const [isBoardHovered, setIsBoardHovered] = React.useState(false);
  const [currentSubTab, setCurrentSubTab] = React.useState<number>(0);
  const lastInteractionTime = React.useRef<number>(Date.now());

  const handleBoardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const board = boardRef.current;
    if (!board) return;
    const rect = board.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const maxTilt = 8;
    const rotateY = ((x - rect.width / 2) / (rect.width / 2)) * maxTilt;
    const rotateX = -((y - rect.height / 2) / (rect.height / 2)) * maxTilt;
    setTiltX(rotateX);
    setTiltY(rotateY);
  };

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
      {/* Kanban Board Container */}
      <div className="relative w-full max-w-[820px] perspective-1000 flex flex-col items-center">
        <div
          ref={boardRef}
          onMouseMove={handleBoardMouseMove}
          onMouseEnter={() => setIsBoardHovered(true)}
          onMouseLeave={() => {
            setIsBoardHovered(false);
            setTiltX(0);
            setTiltY(0);
          }}
          className="rounded-2xl w-full p-6 shadow-xl border border-slate-200/60 backdrop-blur-xl mb-8 preserve-3d transition-tilt bg-white/50"
          style={{
            transform: isBoardHovered
              ? `rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(1.02)`
              : "rotateX(0deg) rotateY(0deg) scale(1)",
            boxShadow: isBoardHovered
              ? "0 30px 60px -15px rgba(100, 116, 139, 0.25), 0 0 40px -10px rgba(24, 104, 219, 0.1)"
              : "0 15px 35px -15px rgba(100, 116, 139, 0.15)",
          }}
        >
          {/* Sub-tab Switcher inside Mockup */}
          <div className="flex gap-1.5 mb-5 bg-slate-200/40 p-1 rounded-lg w-fit border border-slate-200/60 text-[11px] preserve-3d">
            {["Bảng kéo thả", "Lịch biểu", "Sơ đồ Gantt"].map((t, idx) => {
              const isSubActive = idx === currentSubTab;
              return (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentSubTab(idx);
                    lastInteractionTime.current = Date.now(); // Reset timer instantly on click
                  }}
                  className={`px-3.5 py-1 rounded-md transition-all duration-300 font-semibold cursor-pointer ${
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

          {currentSubTab === 0 && <ShowcaseKanban isBoardHovered={isBoardHovered} />}
          {currentSubTab === 1 && <ShowcaseCalendar />}
          {currentSubTab === 2 && <ShowcaseGantt />}
        </div>

        {/* Heading */}
        <div className="text-center max-w-[500px]">
          <h2 className="text-lg font-bold text-slate-800 mb-2">Không gian làm việc và Bảng nhiệm vụ</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Theo dõi và quản lý toàn bộ công việc trực quan trên bảng Kanban. Sắp xếp các cột trạng thái và phân công công việc dễ dàng.
          </p>
        </div>
      </div>
    </div>
  );
}
