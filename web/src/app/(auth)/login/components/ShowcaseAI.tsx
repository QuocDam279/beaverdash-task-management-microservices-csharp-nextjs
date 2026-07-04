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
        await new Promise((r) => setTimeout(r, 1800));
        if (!active) break;
        
        setStep(1); // User message (with attachment)
        await new Promise((r) => setTimeout(r, 2200));
        if (!active) break;
        
        setStep(2); // AI starts typing...
        await new Promise((r) => setTimeout(r, 1200));
        if (!active) break;
        
        setStep(3); // AI proposes plan (sprint + tasks + assignees)
        await new Promise((r) => setTimeout(r, 4500));
        if (!active) break;

        setStep(4); // User confirms
        await new Promise((r) => setTimeout(r, 1500));
        if (!active) break;

        setStep(5); // AI executes tools (sprints first, then tasks/subtasks)
        await new Promise((r) => setTimeout(r, 3800));
        if (!active) break;

        setStep(6); // AI completes and outputs final message
        await new Promise((r) => setTimeout(r, 6500)); // Keep displayed before loop restarts
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
          <span className="text-[10px] font-bold tracking-widest text-[#1868db] uppercase">Trợ lý Trí tuệ Nhân tạo</span>
          <h2 className="text-xl font-bold text-slate-800">Tự động hóa Quy trình & Lập kế hoạch</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Phân tích tài liệu kế hoạch, lập giai đoạn làm việc và tự động khởi tạo, phân công công việc chính xác cho từng thành viên theo chuyên môn.
          </p>
        </div>

        {/* Animated Chat Container */}
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xl overflow-hidden flex flex-col min-h-[360px] justify-between transition-all duration-500 ease-in-out">
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
          <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs scrollbar-none min-h-[250px] max-h-[280px]">
            {/* Initial empty message state */}
            {step === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 py-12 select-none">
                <span className="text-3xl mb-2">🤖</span>
                <p className="text-[10px] font-bold">Trợ lý AI sẵn sàng hỗ trợ</p>
                <p className="text-[9px] max-w-[220px] mt-1 text-slate-400">Đính kèm tài liệu yêu cầu hoặc chat trực tiếp để bắt đầu lập kế hoạch tự động...</p>
              </div>
            )}

            {/* User Message */}
            {step >= 1 && (
              <div className="flex flex-col items-end gap-1.5 animate-fade-slide-up">
                <div className="flex items-center gap-1.5 bg-blue-50/80 border border-blue-100 rounded-lg px-2.5 py-1 text-[9px] font-bold text-[#1868db]">
                  📄 Kế_hoạch_Dự_án.pdf (35 KB)
                </div>
                <div className="max-w-[85%] bg-[#1868db] text-white px-3.5 py-2.5 rounded-2xl rounded-tr-none shadow-sm shadow-[#1868db]/10">
                  <p className="leading-relaxed font-medium">Hãy phân tích tài liệu đính kèm này, lên kế hoạch Giai đoạn 1 và phân công công việc cho cả nhóm giúp tôi.</p>
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
                <div className="max-w-[88%] bg-slate-100 text-slate-800 px-3.5 py-2.5 rounded-2xl rounded-tl-none leading-relaxed border border-slate-200/20 text-left space-y-1">
                  <p>Tôi đã đọc hiểu tài liệu <b>Kế_hoạch_Dự_án.pdf</b>. Dưới đây là kế hoạch đề xuất cho dự án của bạn:</p>
                  <div className="pl-2.5 border-l-2 border-amber-600/60 my-1.5 space-y-1 text-[10.5px]">
                    <p>📅 <b>Giai đoạn 1 (02/07 - 16/07):</b> Phát triển trang chủ bán hàng</p>
                    <p>• <b>Công việc (Bắt buộc):</b> Thiết kế giao diện Figma (Người thực hiện: Linh Chi)</p>
                    <p>• <b>Công việc (Quan trọng):</b> Cài đặt hệ thống dữ liệu (Người thực hiện: Minh Anh)</p>
                  </div>
                  <p className="text-[10px] text-slate-500">Bạn có đồng ý khởi tạo toàn bộ giai đoạn, công việc và nhiệm vụ này lên bảng không?</p>
                </div>
              </div>
            )}

            {/* User Confirm */}
            {step >= 4 && (
              <div className="flex justify-end animate-fade-slide-up">
                <div className="max-w-[85%] bg-[#1868db] text-white px-3.5 py-2 rounded-2xl rounded-tr-none shadow-sm">
                  <p className="leading-relaxed font-medium">Đồng ý, tạo kế hoạch này lên bảng giúp tôi.</p>
                </div>
              </div>
            )}

            {/* AI Tool Execution log */}
            {step >= 5 && (
              <div className="flex justify-start animate-fade-slide-up">
                <div className="max-w-[90%] w-full bg-white border border-slate-200/80 rounded-xl shadow-md p-3 space-y-2 relative overflow-hidden">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#1868db] to-purple-500" />
                  <div className="flex items-center justify-between border-b border-slate-100 pb-1.5 font-bold">
                    <span className="text-[#1868db] text-[9.5px]">⚙️ TRỢ LÝ AI ĐANG KHỞI TẠO CÔNG VIỆC</span>
                    {step >= 6 ? (
                      <span className="text-emerald-600 text-[8.5px] font-extrabold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">HOÀN THÀNH</span>
                    ) : (
                      <span className="text-amber-600 text-[8.5px] font-extrabold animate-pulse">ĐANG CHẠY...</span>
                    )}
                  </div>
                  <div className="space-y-1 text-[9.5px] text-slate-600 font-medium">
                    <div className="flex items-center gap-1.5">
                      <span className="text-emerald-500">✔</span>
                      <span>Khởi tạo Giai đoạn 1 (Mục tiêu: Phát triển trang chủ bán hàng)</span>
                    </div>
                    {step >= 6 ? (
                      <>
                        <div className="flex items-center gap-1.5">
                          <span className="text-emerald-500">✔</span>
                          <span>Tạo công việc chính: Thiết kế giao diện Figma (Mức độ: Bắt buộc)</span>
                        </div>
                        <div className="flex items-center gap-1.5 pl-3.5 border-l border-slate-200 text-slate-500 text-[9px]">
                          <span className="text-emerald-500">✔</span>
                          <span>Giao nhiệm vụ: Vẽ khung giao diện trang chủ cho Linh Chi</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-emerald-500">✔</span>
                          <span>Tạo công việc chính: Cài đặt hệ thống dữ liệu (Mức độ: Quan trọng)</span>
                        </div>
                        <div className="flex items-center gap-1.5 pl-3.5 border-l border-slate-200 text-slate-500 text-[9px]">
                          <span className="text-emerald-500">✔</span>
                          <span>Giao nhiệm vụ: Thiết kế sơ đồ dữ liệu cho Minh Anh</span>
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <span className="animate-spin text-amber-500">⏳</span>
                        <span>Đang khởi tạo các công việc và phân bổ nhiệm vụ con...</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* AI Final Response */}
            {step >= 6 && (
              <div className="flex justify-start animate-fade-slide-up">
                <div className="max-w-[88%] bg-emerald-50/60 text-slate-800 px-3.5 py-2.5 rounded-2xl rounded-tl-none leading-relaxed border border-emerald-100/50">
                  Tôi đã khởi tạo thành công <b>Giai đoạn 1</b> và tự động phân bổ công việc, nhiệm vụ cho <b>Linh Chi</b> và <b>Minh Anh</b> lên bảng công việc tức thì! 🎉
                </div>
              </div>
            )}
          </div>

          {/* Simulated Chat Input Box */}
          <div className="border-t border-slate-100 p-3 bg-slate-50/70 flex items-center gap-2 select-none">
            <div className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-[10px] text-slate-400 flex items-center justify-between">
              <span>Hỏi Beaver AI hoặc giao việc...</span>
              <div className="flex items-center gap-2 text-slate-400 text-xs">
                <span className="cursor-pointer hover:text-slate-600">🎙️</span>
                <span className="cursor-pointer hover:text-slate-[#1868db] font-bold">📎</span>
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

          {/* Node 1: Work Planning */}
          <div
            onMouseEnter={() => setHoveredNode(1)}
            onMouseLeave={() => setHoveredNode(null)}
            className={`absolute top-6 left-2 z-10 px-2.5 py-1.5 rounded-xl bg-white border shadow-sm hover:scale-105 transition-all duration-300 cursor-pointer flex flex-col items-center w-[92px] ${
              hoveredNode === 1 ? "border-blue-500 text-blue-600 shadow-md shadow-blue-500/5" : "border-slate-200/80 text-slate-600"
            }`}
          >
            <span className="text-[9px] font-extrabold text-center leading-tight">Lập kế hoạch làm việc</span>
          </div>

          {/* Node 2: Auto-assign Member */}
          <div
            onMouseEnter={() => setHoveredNode(2)}
            onMouseLeave={() => setHoveredNode(null)}
            className={`absolute top-6 right-2 z-10 px-2.5 py-1.5 rounded-xl bg-white border shadow-sm hover:scale-105 transition-all duration-300 cursor-pointer flex flex-col items-center w-[92px] ${
              hoveredNode === 2 ? "border-purple-500 text-purple-600 shadow-md shadow-purple-500/5" : "border-slate-200/80 text-slate-600"
            }`}
          >
            <span className="text-[9px] font-extrabold text-center leading-tight">Phân việc tự động</span>
          </div>

          {/* Node 3: Read Attachments */}
          <div
            onMouseEnter={() => setHoveredNode(3)}
            onMouseLeave={() => setHoveredNode(null)}
            className={`absolute bottom-6 left-2 z-10 px-2.5 py-1.5 rounded-xl bg-white border shadow-sm hover:scale-105 transition-all duration-300 cursor-pointer flex flex-col items-center w-[92px] ${
              hoveredNode === 3 ? "border-cyan-500 text-cyan-600 shadow-md shadow-cyan-500/5" : "border-slate-200/80 text-slate-600"
            }`}
          >
            <span className="text-[9px] font-extrabold text-center leading-tight">Đọc tệp đính kèm</span>
          </div>

          {/* Node 4: Progress Report */}
          <div
            onMouseEnter={() => setHoveredNode(4)}
            onMouseLeave={() => setHoveredNode(null)}
            className={`absolute bottom-6 right-2 z-10 px-2.5 py-1.5 rounded-xl bg-white border shadow-sm hover:scale-105 transition-all duration-300 cursor-pointer flex flex-col items-center w-[92px] ${
              hoveredNode === 4 ? "border-emerald-500 text-emerald-600 shadow-md shadow-emerald-500/5" : "border-slate-200/80 text-slate-600"
            }`}
          >
            <span className="text-[9px] font-extrabold text-center leading-tight">Báo cáo tiến độ</span>
          </div>
        </div>
      </div>
    </div>
  );
}

