"use client";

import * as React from "react";

export function ShowcaseAI() {
  const [step, setStep] = React.useState(0);
  const [hoveredNode, setHoveredNode] = React.useState<number | null>(null);

  React.useEffect(() => {
    let active = true;
    
    const runSequence = async () => {
      setStep(0);
      await new Promise((r) => setTimeout(r, 1000));
      if (!active) return;
      
      setStep(1); // User message appears
      await new Promise((r) => setTimeout(r, 2000));
      if (!active) return;
      
      setStep(2); // AI starts typing...
      await new Promise((r) => setTimeout(r, 1500));
      if (!active) return;
      
      setStep(3); // AI response text appears
      await new Promise((r) => setTimeout(r, 2500));
      if (!active) return;
      
      setStep(4); // AI task list card pops up
    };

    runSequence();

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="w-full grid grid-cols-1 xl:grid-cols-5 gap-8 items-start font-sans text-slate-800">
      {/* AI Assistant Chat Showcase (Left 3 columns) */}
      <div className="xl:col-span-3 space-y-4 text-left min-h-[480px] flex flex-col justify-start">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-bold tracking-widest text-[#1868db] uppercase">Trợ lý trí tuệ nhân tạo</span>
          <h2 className="text-xl font-bold text-slate-800">Tự động hóa công việc thông minh</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Chỉ với những câu lệnh hội thoại tự nhiên, Trợ lý AI sẽ giúp bạn tự động hóa quy trình quản lý dự án, phân tích công việc và lập kế hoạch ngay lập tức.
          </p>
        </div>

        {/* Animated Chat Container */}
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xl overflow-hidden flex flex-col min-h-[140px] h-auto transition-all duration-500 ease-in-out">
          {/* Header */}
          <div className="bg-slate-50 border-b border-slate-100 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-75" />
              </div>
              <span className="text-xs font-bold text-slate-700">Trợ lý AI của bạn</span>
            </div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Hỗ trợ 24/7</span>
          </div>

          {/* Conversation Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs scrollbar-none">
            {/* User Message */}
            {step >= 1 && (
              <div className="flex justify-end animate-fade-slide-up">
                <div className="max-w-[80%] bg-[#1868db] text-white px-3.5 py-2.5 rounded-2xl rounded-tr-none shadow-sm shadow-[#1868db]/10">
                  <p className="leading-relaxed">Hãy lập kế hoạch thiết kế giao diện trang chủ Beaverdash trong tuần này.</p>
                </div>
              </div>
            )}

            {/* AI Typing Indicator */}
            {step === 2 && (
              <div className="flex justify-start animate-fade-slide-up">
                <div className="bg-slate-100 text-slate-500 px-4 py-3 rounded-2xl rounded-tl-none flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}

            {/* AI Response Text */}
            {step >= 3 && (
              <div className="flex justify-start animate-fade-slide-up">
                <div className="max-w-[85%] bg-slate-100 text-slate-800 px-3.5 py-2.5 rounded-2xl rounded-tl-none leading-relaxed">
                  Chào bạn! Dựa trên yêu cầu của bạn, tôi đã phân tích và tự động đề xuất kế hoạch triển khai dưới đây:
                </div>
              </div>
            )}

            {/* AI Created Tasks */}
            {step >= 4 && (
              <div className="flex justify-start animate-fade-slide-up delay-100">
                <div className="max-w-[90%] w-full bg-white border border-slate-200/80 rounded-xl shadow-md p-3.5 space-y-3 relative overflow-hidden">
                  {/* Decorative Left Accent Border */}
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#1868db] to-purple-500" />
                  
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="text-[10px] font-bold text-[#1868db] uppercase tracking-wider">Danh sách công việc đề xuất</span>
                    <span className="text-[9px] font-semibold bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full border border-emerald-100">Hoàn thành</span>
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
                        <p className="text-[9px] text-slate-500 mt-0.5">Mức độ ưu tiên: <span className="text-red-500 font-semibold">Cao</span></p>
                      </div>
                    </div>

                    {/* Task Item 2 */}
                    <div className="flex items-start gap-2.5">
                      <div className="mt-0.5 w-4 h-4 rounded border border-slate-300 bg-slate-50 flex items-center justify-center shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-800 text-[11px] leading-tight">Xây dựng bản vẽ giao diện chi tiết trên Figma</p>
                        <p className="text-[9px] text-slate-500 mt-0.5">Mức độ ưu tiên: <span className="text-red-500 font-semibold">Cao</span></p>
                        
                        {/* Subtasks / Việc cần làm */}
                        <div className="mt-2 ml-1 pl-3 border-l border-slate-200 space-y-1.5">
                          <div className="flex items-center gap-2">
                            <div className="w-3.5 h-3.5 rounded-full border border-emerald-500 bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                              <svg className="w-2 h-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                            <span className="text-[9px] text-slate-600 line-through">Phác thảo bố cục và cấu trúc các phần</span>
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
        </div>
      </div>

      {/* Interactive Mindmap Visual (Right 2 columns) */}
      <div className="xl:col-span-2 flex justify-center items-center xl:pt-16">
        <div className="relative bg-white/50 border border-slate-200/60 p-6 shadow-xl w-[260px] h-[260px] flex items-center justify-center rounded-2xl backdrop-blur-xl">
          {/* Mindmap Links */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 200 200">
            <line x1="100" y1="100" x2="40" y2="45" stroke={hoveredNode === 1 ? "#1868db" : "rgba(148, 163, 184, 0.2)"} strokeWidth={hoveredNode === 1 ? "2" : "1"} className="transition-all duration-300" />
            <line x1="100" y1="100" x2="160" y2="45" stroke={hoveredNode === 2 ? "#a855f7" : "rgba(148, 163, 184, 0.2)"} strokeWidth={hoveredNode === 2 ? "2" : "1"} className="transition-all duration-300" />
            <line x1="100" y1="100" x2="40" y2="155" stroke={hoveredNode === 3 ? "#06b6d4" : "rgba(148, 163, 184, 0.2)"} strokeWidth={hoveredNode === 3 ? "2" : "1"} className="transition-all duration-300" />
            <line x1="100" y1="100" x2="160" y2="155" stroke={hoveredNode === 4 ? "#10b981" : "rgba(148, 163, 184, 0.2)"} strokeWidth={hoveredNode === 4 ? "2" : "1"} className="transition-all duration-300" />
          </svg>

          {/* Central Core Node */}
          <div
            className={`z-10 w-16 h-16 rounded-full border border-purple-200 flex items-center justify-center transition-all duration-500 cursor-pointer shadow-md bg-white ${
              hoveredNode ? "scale-110 shadow-purple-500/10 border-purple-400" : "scale-100"
            }`}
          >
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-purple-500 to-[#1868db] flex items-center justify-center text-white text-[10px] font-bold text-center leading-tight">
              Trợ lý AI
            </div>
          </div>

          {/* Node 1: Auto-create Task */}
          <div
            onMouseEnter={() => setHoveredNode(1)}
            onMouseLeave={() => setHoveredNode(null)}
            className="absolute top-6 left-1.5 z-10 px-2.5 py-1.5 rounded-lg bg-white border border-slate-200/80 shadow-sm hover:border-blue-500 hover:scale-105 transition-all duration-300 cursor-pointer flex flex-col items-center w-[90px]"
          >
            <span className="text-[9px] font-bold text-blue-600 text-center leading-tight">Tự động tạo Công việc</span>
          </div>

          {/* Node 2: Suggest Checklist / Subtask */}
          <div
            onMouseEnter={() => setHoveredNode(2)}
            onMouseLeave={() => setHoveredNode(null)}
            className="absolute top-6 right-1.5 z-10 px-2.5 py-1.5 rounded-lg bg-white border border-slate-200/80 shadow-sm hover:border-purple-500 hover:scale-105 transition-all duration-300 cursor-pointer flex flex-col items-center w-[90px]"
          >
            <span className="text-[9px] font-bold text-purple-600 text-center leading-tight">Đề xuất Việc cần làm</span>
          </div>

          {/* Node 3: Project Analysis */}
          <div
            onMouseEnter={() => setHoveredNode(3)}
            onMouseLeave={() => setHoveredNode(null)}
            className="absolute bottom-6 left-1.5 z-10 px-2.5 py-1.5 rounded-lg bg-white border border-slate-200/80 shadow-sm hover:border-cyan-500 hover:scale-105 transition-all duration-300 cursor-pointer flex flex-col items-center w-[90px]"
          >
            <span className="text-[9px] font-bold text-cyan-600 text-center leading-tight">Đọc hiểu Dự án</span>
          </div>

          {/* Node 4: Update Progress */}
          <div
            onMouseEnter={() => setHoveredNode(4)}
            onMouseLeave={() => setHoveredNode(null)}
            className="absolute bottom-6 right-1.5 z-10 px-2.5 py-1.5 rounded-lg bg-white border border-slate-200/80 shadow-sm hover:border-emerald-500 hover:scale-105 transition-all duration-300 cursor-pointer flex flex-col items-center w-[90px]"
          >
            <span className="text-[9px] font-bold text-emerald-600 text-center leading-tight">Cập nhật Tiến độ</span>
          </div>
        </div>
      </div>
    </div>
  );
}
