"use client";

import * as React from "react";

export function ShowcaseAI() {
  const [step, setStep] = React.useState(0);
  const [hoveredNode, setHoveredNode] = React.useState<number | null>(null);

  React.useEffect(() => {
    let active = true;
    
    const runSequence = async () => {
      while (active) {
        setStep(0);
        await new Promise((r) => setTimeout(r, 1500));
        if (!active) break;
        
        setStep(1); // User message
        await new Promise((r) => setTimeout(r, 2200));
        if (!active) break;
        
        setStep(2); // AI starts typing...
        await new Promise((r) => setTimeout(r, 1200));
        if (!active) break;
        
        setStep(3); // AI response text
        await new Promise((r) => setTimeout(r, 2500));
        if (!active) break;
        
        setStep(4); // AI task list card pops up
        await new Promise((r) => setTimeout(r, 5500)); // Keep displayed before loop restarts
      }
    };

    runSequence();

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="w-full grid grid-cols-1 xl:grid-cols-5 gap-8 items-center font-sans text-slate-800">
      {/* AI Assistant Chat Showcase (Left 3 columns) */}
      <div className="xl:col-span-3 space-y-4 text-left min-h-[480px] flex flex-col justify-between">
        <div className="flex flex-col gap-1 select-none">
          <span className="text-[10px] font-bold tracking-widest text-[#1868db] uppercase">Trợ lý trí tuệ nhân tạo</span>
          <h2 className="text-xl font-bold text-slate-800">Tự động hóa công việc thông minh</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Chỉ với những câu lệnh hội thoại tự nhiên, Trợ lý AI sẽ giúp bạn tự động hóa quy trình quản lý dự án, phân tích công việc và lập kế hoạch ngay lập tức.
          </p>
        </div>

        {/* Animated Chat Container */}
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xl overflow-hidden flex flex-col min-h-[350px] justify-between transition-all duration-500 ease-in-out">
          {/* Header */}
          <div className="bg-slate-50 border-b border-slate-100 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-75" />
              </div>
              <span className="text-xs font-bold text-slate-700">Beaver AI Agent</span>
            </div>
            <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-200/50 px-2 py-0.5 rounded-md">Hoạt động</span>
          </div>

          {/* Conversation Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs scrollbar-none min-h-[220px]">
            {/* Initial empty message state */}
            {step === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-350 py-8 select-none">
                <span className="text-3xl mb-2">🤖</span>
                <p className="text-[10px] font-bold">Trợ lý AI sẵn sàng hỗ trợ</p>
                <p className="text-[9px] max-w-[200px] mt-1 text-slate-400">Đặt câu hỏi để bắt đầu lập kế hoạch dự án tự động...</p>
              </div>
            )}

            {/* User Message */}
            {step >= 1 && (
              <div className="flex justify-end animate-fade-slide-up">
                <div className="max-w-[80%] bg-[#1868db] text-white px-3.5 py-2.5 rounded-2xl rounded-tr-none shadow-sm shadow-[#1868db]/10">
                  <p className="leading-relaxed font-medium">Hãy lập kế hoạch thiết kế giao diện trang chủ Beaverdash trong tuần này.</p>
                </div>
              </div>
            )}

            {/* AI Typing Indicator */}
            {step === 2 && (
              <div className="flex justify-start animate-fade-slide-up">
                <div className="bg-slate-100 text-slate-500 px-4 py-3 rounded-2xl rounded-tl-none flex items-center gap-1.5 shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}

            {/* AI Response Text */}
            {step >= 3 && (
              <div className="flex justify-start animate-fade-slide-up">
                <div className="max-w-[85%] bg-slate-100 text-slate-800 px-3.5 py-2.5 rounded-2xl rounded-tl-none leading-relaxed border border-slate-200/30">
                  Chào bạn! Dựa trên yêu cầu của bạn, tôi đã phân tích và tự động đề xuất kế hoạch triển khai dưới đây:
                </div>
              </div>
            )}

            {/* AI Created Tasks */}
            {step >= 4 && (
              <div className="flex justify-start animate-fade-slide-up delay-100">
                <div className="max-w-[95%] w-full bg-white border border-slate-200/80 rounded-xl shadow-md p-3.5 space-y-3 relative overflow-hidden">
                  {/* Decorative Left Accent Border */}
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#1868db] to-purple-500" />
                  
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="text-[9.5px] font-bold text-[#1868db] uppercase tracking-wider">Kế hoạch đề xuất tự động</span>
                    <span className="text-[8.5px] font-bold bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full border border-emerald-100">Hoàn thành</span>
                  </div>

                  <div className="space-y-2">
                    {/* Task Item 1 */}
                    <div className="flex items-start gap-2.5">
                      <div className="mt-0.5 w-4 h-4 rounded border border-emerald-500 bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                        <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-800 text-[11px] leading-tight">Thiết kế khung dây (Wireframe) sơ bộ</p>
                        <p className="text-[8.5px] text-slate-400 mt-0.5">Ưu tiên: <span className="text-red-500 font-bold">Cao</span></p>
                      </div>
                    </div>

                    {/* Task Item 2 */}
                    <div className="flex items-start gap-2.5">
                      <div className="mt-0.5 w-4 h-4 rounded border border-slate-300 bg-slate-50 flex items-center justify-center shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-800 text-[11px] leading-tight">Xây dựng bản vẽ giao diện chi tiết trên Figma</p>
                        <p className="text-[8.5px] text-slate-400 mt-0.5">Ưu tiên: <span className="text-red-500 font-bold">Cao</span></p>
                        
                        {/* Subtasks */}
                        <div className="mt-2 ml-1 pl-3 border-l border-slate-200 space-y-1.5">
                          <div className="flex items-center gap-2">
                            <div className="w-3.5 h-3.5 rounded-full border border-emerald-500 bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                              <svg className="w-2 h-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                            <span className="text-[9px] text-slate-400 line-through">Phác thảo bố cục và cấu trúc</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-3.5 h-3.5 rounded-full border border-slate-300 bg-slate-50 shrink-0" />
                            <span className="text-[9px] text-slate-600">Định nghĩa bảng màu sắc và phông chữ</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Simulated Chat Input Box */}
          <div className="border-t border-slate-100 p-3 bg-slate-50/70 flex items-center gap-2 select-none">
            <div className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-[10px] text-slate-400 flex items-center justify-between">
              <span>Hỏi Beaver AI hoặc giao việc...</span>
              <div className="flex items-center gap-2 text-slate-350 text-xs">
                <span className="cursor-pointer hover:text-slate-600">🎙️</span>
                <span className="cursor-pointer hover:text-slate-600">📎</span>
              </div>
            </div>
            <button className="bg-[#1868db] hover:bg-blue-600 text-white p-2 rounded-xl text-[10px] transition-colors shadow-md shadow-blue-500/10 cursor-pointer">
              <svg className="w-3 h-3 rotate-90" fill="currentColor" viewBox="0 0 24 24">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Mindmap Visual (Right 2 columns) */}
      <div className="xl:col-span-2 flex justify-center items-center xl:pt-12 select-none">
        <div className="relative bg-white/75 border border-slate-200/60 p-6 shadow-xl w-[280px] h-[280px] flex items-center justify-center rounded-2xl backdrop-blur-xl overflow-hidden hover:shadow-2xl transition-all duration-300">
          
          {/* Neon Glow Rings in Background */}
          <div className="absolute w-[200px] h-[200px] rounded-full border border-purple-500/5 animate-pulse" />
          <div className="absolute w-[140px] h-[140px] rounded-full border border-blue-500/5 animate-ping opacity-20" />

          {/* Mindmap Links */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 200 200">
            <line x1="100" y1="100" x2="45" y2="45" stroke={hoveredNode === 1 ? "#1868db" : "rgba(148, 163, 184, 0.25)"} strokeWidth={hoveredNode === 1 ? "2.5" : "1.2"} className="transition-all duration-300" />
            <line x1="100" y1="100" x2="155" y2="45" stroke={hoveredNode === 2 ? "#a855f7" : "rgba(148, 163, 184, 0.25)"} strokeWidth={hoveredNode === 2 ? "2.5" : "1.2"} className="transition-all duration-300" />
            <line x1="100" y1="100" x2="45" y2="155" stroke={hoveredNode === 3 ? "#06b6d4" : "rgba(148, 163, 184, 0.25)"} strokeWidth={hoveredNode === 3 ? "2.5" : "1.2"} className="transition-all duration-300" />
            <line x1="100" y1="100" x2="155" y2="155" stroke={hoveredNode === 4 ? "#10b981" : "rgba(148, 163, 184, 0.25)"} strokeWidth={hoveredNode === 4 ? "2.5" : "1.2"} className="transition-all duration-300" />
          </svg>

          {/* Central Core Node */}
          <div
            className={`z-10 w-16 h-16 rounded-full border border-purple-200/80 flex items-center justify-center transition-all duration-500 cursor-pointer shadow-md bg-white ${
              hoveredNode ? "scale-110 shadow-purple-500/10 border-purple-400" : "scale-100"
            }`}
          >
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-purple-500 to-[#1868db] flex items-center justify-center text-white text-[10px] font-bold text-center leading-tight shadow-inner">
              Trợ lý AI
            </div>
          </div>

          {/* Node 1: Auto-create Task */}
          <div
            onMouseEnter={() => setHoveredNode(1)}
            onMouseLeave={() => setHoveredNode(null)}
            className={`absolute top-6 left-2 z-10 px-2.5 py-1.5 rounded-xl bg-white border shadow-sm hover:scale-105 transition-all duration-300 cursor-pointer flex flex-col items-center w-[92px] ${
              hoveredNode === 1 ? "border-blue-500 text-blue-600 shadow-md shadow-blue-500/5" : "border-slate-200/80 text-slate-600"
            }`}
          >
            <span className="text-[9px] font-extrabold text-center leading-tight">Tự động tạo Công việc</span>
          </div>

          {/* Node 2: Suggest Checklist */}
          <div
            onMouseEnter={() => setHoveredNode(2)}
            onMouseLeave={() => setHoveredNode(null)}
            className={`absolute top-6 right-2 z-10 px-2.5 py-1.5 rounded-xl bg-white border shadow-sm hover:scale-105 transition-all duration-300 cursor-pointer flex flex-col items-center w-[92px] ${
              hoveredNode === 2 ? "border-purple-500 text-purple-600 shadow-md shadow-purple-500/5" : "border-slate-200/80 text-slate-600"
            }`}
          >
            <span className="text-[9px] font-extrabold text-center leading-tight">Đề xuất Việc cần làm</span>
          </div>

          {/* Node 3: Project Analysis */}
          <div
            onMouseEnter={() => setHoveredNode(3)}
            onMouseLeave={() => setHoveredNode(null)}
            className={`absolute bottom-6 left-2 z-10 px-2.5 py-1.5 rounded-xl bg-white border shadow-sm hover:scale-105 transition-all duration-300 cursor-pointer flex flex-col items-center w-[92px] ${
              hoveredNode === 3 ? "border-cyan-500 text-cyan-600 shadow-md shadow-cyan-500/5" : "border-slate-200/80 text-slate-600"
            }`}
          >
            <span className="text-[9px] font-extrabold text-center leading-tight">Đọc hiểu Dự án</span>
          </div>

          {/* Node 4: Update Progress */}
          <div
            onMouseEnter={() => setHoveredNode(4)}
            onMouseLeave={() => setHoveredNode(null)}
            className={`absolute bottom-6 right-2 z-10 px-2.5 py-1.5 rounded-xl bg-white border shadow-sm hover:scale-105 transition-all duration-300 cursor-pointer flex flex-col items-center w-[92px] ${
              hoveredNode === 4 ? "border-emerald-500 text-emerald-600 shadow-md shadow-emerald-500/5" : "border-slate-200/80 text-slate-600"
            }`}
          >
            <span className="text-[9px] font-extrabold text-center leading-tight">Cập nhật Tiến độ</span>
          </div>
        </div>
      </div>
    </div>
  );
}
