"use client";

import * as React from "react";

/**
 * @component AIShowcase
 * @description Phần minh họa cách Trợ lý AI hoạt động thông qua giao diện Chat mini tự động và mô hình quy trình.
 */
export function AIShowcase() {
  const [activeStep, setActiveStep] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 4);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  const workflowSteps = [
    {
      title: "1. Nhận yêu cầu",
      desc: "Người dùng nhập câu lệnh hội thoại tự nhiên yêu cầu lập kế hoạch.",
    },
    {
      title: "2. Phân tích ngữ nghĩa",
      desc: "Trợ lý AI bóc tách thông tin, xác định các nhiệm vụ cần thực hiện và mức độ ưu tiên.",
    },
    {
      title: "3. Tự động khởi tạo",
      desc: "Hệ thống tự tạo các thẻ công việc tương ứng trên bảng Kanban.",
    },
    {
      title: "4. Đồng bộ đội ngũ",
      desc: "Gửi thông báo và cập nhật tức thì đến màn hình của mọi thành viên.",
    },
  ];

  return (
    <section id="ai-showcase" className="space-y-10 py-8 select-none">
      
      {/* Header */}
      <div className="text-center max-w-xl mx-auto space-y-3">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#2b221a]">
          Trải nghiệm Quy trình Tự động hóa bằng AI
        </h2>
        <p className="text-xs text-stone-500 leading-relaxed">
          Xem cách Beaver AI biến đổi những câu lệnh văn bản thô sơ thành cấu trúc công việc hoàn chỉnh chỉ trong vài giây.
        </p>
      </div>

      {/* Showcase layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 items-center max-w-6xl mx-auto px-4">
        
        {/* Left Side: Mock AI Chat UI (3 cols) */}
        <div className="lg:col-span-3 bg-white border border-stone-200/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[340px] justify-between">
          
          {/* Header */}
          <div className="bg-[#FAF9F5] border-b border-stone-200 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-600 animate-pulse" />
              <span className="text-xs font-bold text-[#2b221a]">Beaver AI Planner</span>
            </div>
            <span className="text-[8px] font-extrabold text-stone-500 bg-stone-100 border border-stone-200 px-2 py-0.5 rounded uppercase">Đang đồng bộ</span>
          </div>

          {/* Conversation view */}
          <div className="flex-1 p-4 space-y-4 text-xs overflow-y-auto scrollbar-none text-left">
            {/* User prompt */}
            {activeStep >= 0 && (
              <div className="flex justify-end animate-fade-slide-up">
                <div className="max-w-[80%] bg-[#854d0e] text-white px-3.5 py-2.5 rounded-2xl rounded-tr-none font-medium shadow-md shadow-amber-700/10">
                  Lên kế hoạch phát triển phiên bản di động (Mobile App) trong tháng này.
                </div>
              </div>
            )}

            {/* AI thinking */}
            {activeStep === 1 && (
              <div className="flex justify-start animate-fade-slide-up">
                <div className="bg-stone-100 text-stone-500 px-3.5 py-2 rounded-2xl rounded-tl-none flex items-center gap-1.5 shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-stone-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-stone-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-stone-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}

            {/* AI Response Text */}
            {activeStep >= 2 && (
              <div className="flex justify-start animate-fade-slide-up">
                <div className="max-w-[85%] bg-stone-100/80 text-stone-800 px-3.5 py-2.5 rounded-2xl rounded-tl-none leading-relaxed border border-stone-200/60">
                  Tôi đã phân tích yêu cầu và tự động thiết lập 3 đầu việc sau trên bảng Kanban:
                </div>
              </div>
            )}

            {/* AI Created Checklist Card */}
            {activeStep >= 3 && (
              <div className="flex justify-start animate-fade-slide-up delay-100">
                <div className="max-w-[95%] w-full bg-[#FAF9F5]/50 border border-stone-200/85 rounded-xl p-3 space-y-2 relative overflow-hidden shadow-md">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-600" />
                  <div className="flex items-center justify-between text-[9px] border-b border-stone-200 pb-1.5">
                    <span className="font-extrabold text-amber-700 uppercase tracking-wide">Beaver AI Checklist</span>
                    <span className="font-extrabold text-emerald-600 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded-md">Khởi tạo</span>
                  </div>
                  <div className="space-y-1.5 text-[10.5px] text-stone-700">
                    <p className="font-bold">✓ 1. Nghiên cứu UI/UX ứng dụng di động đối thủ</p>
                    <p className="font-bold">✓ 2. Thiết kế màn hình đăng nhập và trang chủ trên Figma</p>
                    <p className="font-bold">✓ 3. Thiết lập dự án Flutter/React Native ban đầu</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Fake Input */}
          <div className="bg-[#FAF9F5]/80 border-t border-stone-200 p-2.5 flex items-center justify-between text-stone-500">
            <span className="text-[10px]">Đang xem AI xử lý yêu cầu...</span>
            <span className="text-xs">🤖</span>
          </div>
        </div>

        {/* Right Side: Step-by-Step workflow description (2 cols) */}
        <div className="lg:col-span-2 space-y-4 text-left">
          {workflowSteps.map((step, idx) => {
            const isCurrent = idx === activeStep;
            return (
              <div
                key={idx}
                className={`p-3.5 rounded-xl border transition-all duration-300 ${
                  isCurrent
                    ? "bg-white border-amber-600/40 shadow-md shadow-amber-700/5 translate-x-2"
                    : "bg-transparent border-transparent opacity-40"
                }`}
              >
                <h4 className={`text-xs font-extrabold leading-none ${isCurrent ? "text-amber-700" : "text-stone-600"}`}>
                  {step.title}
                </h4>
                <p className="text-[11px] text-stone-500 mt-1.5 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            );
          })}
        </div>

      </div>

    </section>
  );
}
