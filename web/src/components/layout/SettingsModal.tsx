"use client";

import * as React from "react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [activeTab, setActiveTab] = React.useState<"theme" | "guide">("theme");
  const [theme, setTheme] = React.useState<"light" | "dark">("light");
  const [openSection, setOpenSection] = React.useState<string | null>("board");

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const isDark = document.documentElement.classList.contains("dark");
      setTheme(isDark ? "dark" : "light");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleThemeChange = (newTheme: "light" | "dark") => {
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setTheme("dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setTheme("light");
    }
    // Phát event để các thành phần khác có thể cập nhật nếu cần
    window.dispatchEvent(new Event("theme-change"));
  };

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  return (
    <div className="fixed inset-0 bg-black/45 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#22272b] rounded-lg border border-slate-200 dark:border-[#353e47] shadow-2xl w-full max-w-lg animate-in fade-in zoom-in-95 duration-200 overflow-hidden flex flex-col h-[560px]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-[#2c3338] flex justify-between items-center bg-slate-50/50 dark:bg-[#1d2125]/50 shrink-0">
          <div className="flex items-center gap-2">
            <svg
              className="text-[#1868db] dark:text-[#579dff] w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <h2 className="text-sm font-bold text-[#292a2e] dark:text-[#deebff] uppercase tracking-wide">
              Cài đặt hệ thống
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 cursor-pointer p-0.5 rounded hover:bg-slate-100 dark:hover:bg-[#2c3338] transition-colors"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 dark:border-[#2c3338] bg-[#fafbfc] dark:bg-[#1d2125] shrink-0">
          <button
            onClick={() => setActiveTab("theme")}
            className={`flex-1 py-3 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === "theme"
                ? "border-[#1868db] text-[#1868db] dark:border-[#579dff] dark:text-[#579dff]"
                : "border-transparent text-[#505258] hover:text-[#292a2e] dark:text-slate-400 dark:hover:text-[#deebff]"
            }`}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
            </svg>
            Giao diện
          </button>
          <button
            onClick={() => setActiveTab("guide")}
            className={`flex-1 py-3 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === "guide"
                ? "border-[#1868db] text-[#1868db] dark:border-[#579dff] dark:text-[#579dff]"
                : "border-transparent text-[#505258] hover:text-[#292a2e] dark:text-slate-400 dark:hover:text-[#deebff]"
            }`}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            Hướng dẫn & Gợi ý
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 min-h-0">
          {activeTab === "theme" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div>
                <h3 className="text-xs font-bold text-[#292a2e] dark:text-[#deebff] uppercase tracking-wide mb-1">
                  Chọn chủ đề hiển thị
                </h3>
                <p className="text-xs text-[#6b6e76] dark:text-slate-400">
                  Tùy chỉnh giao diện Beaverdash phù hợp với môi trường làm việc của bạn.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Light Mode Option */}
                <button
                  onClick={() => handleThemeChange("light")}
                  className={`flex flex-col items-center p-4 rounded-lg border-2 text-left transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer ${
                    theme === "light"
                      ? "border-[#1868db] bg-[#1868db]/5 dark:border-[#579dff] dark:bg-[#579dff]/10 shadow-sm"
                      : "border-slate-200 hover:border-slate-300 dark:border-[#353e47] dark:hover:border-slate-500 bg-white dark:bg-[#22272b]"
                  }`}
                >
                  <div className="w-full h-24 bg-slate-100 rounded-md mb-3 flex items-center justify-center border border-slate-200 relative overflow-hidden">
                    {/* Visual mockup of Light Theme */}
                    <div className="absolute top-2 left-2 right-2 h-3 bg-white border border-slate-200 rounded flex items-center px-1 gap-1">
                      <div className="w-1 h-1 bg-[#1868db] rounded-full"></div>
                      <div className="w-6 h-0.5 bg-slate-300 rounded"></div>
                    </div>
                    <div className="absolute bottom-2 left-2 w-10 h-14 bg-white border border-slate-200 rounded p-1 space-y-1">
                      <div className="w-full h-1 bg-[#1868db] rounded-xs"></div>
                      <div className="w-3/4 h-0.5 bg-slate-200 rounded-xs"></div>
                      <div className="w-1/2 h-0.5 bg-slate-200 rounded-xs"></div>
                    </div>
                    <div className="absolute bottom-2 right-2 w-14 h-14 bg-white border border-slate-200 rounded p-1 grid grid-cols-2 gap-1">
                      <div className="bg-slate-50 border border-slate-200 rounded-xs p-0.5">
                        <div className="w-full h-0.5 bg-slate-400 rounded-xs"></div>
                        <div className="w-2/3 h-0.5 bg-slate-200 rounded-xs mt-0.5"></div>
                      </div>
                      <div className="bg-slate-50 border border-slate-200 rounded-xs p-0.5">
                        <div className="w-full h-0.5 bg-slate-400 rounded-xs"></div>
                      </div>
                    </div>

                    <div className="absolute bg-white rounded-full p-1.5 shadow-md z-10 text-amber-500 border border-slate-200">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m2.828 0l-.707-.707m12.728-12.728l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs font-bold text-[#292a2e] dark:text-[#deebff]">Giao diện Sáng</span>
                    {theme === "light" && (
                      <span className="bg-[#1868db] dark:bg-[#579dff] text-white dark:text-[#22272b] rounded-full p-0.5">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </span>
                    )}
                  </div>
                </button>

                {/* Dark Mode Option */}
                <button
                  onClick={() => handleThemeChange("dark")}
                  className={`flex flex-col items-center p-4 rounded-lg border-2 text-left transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer ${
                    theme === "dark"
                      ? "border-[#1868db] bg-[#1868db]/5 dark:border-[#579dff] dark:bg-[#579dff]/10 shadow-sm"
                      : "border-slate-200 hover:border-slate-300 dark:border-[#353e47] dark:hover:border-slate-500 bg-white dark:bg-[#22272b]"
                  }`}
                >
                  <div className="w-full h-24 bg-[#161a1d] rounded-md mb-3 flex items-center justify-center border border-[#2c3338] relative overflow-hidden">
                    {/* Visual mockup of Dark Theme */}
                    <div className="absolute top-2 left-2 right-2 h-3 bg-[#1d2125] border border-[#2c3338] rounded flex items-center px-1 gap-1">
                      <div className="w-1 h-1 bg-[#1868db] rounded-full"></div>
                      <div className="w-6 h-0.5 bg-[#454f59] rounded"></div>
                    </div>
                    <div className="absolute bottom-2 left-2 w-10 h-14 bg-[#1d2125] border border-[#2c3338] rounded p-1 space-y-1">
                      <div className="w-full h-1 bg-[#1868db] rounded-xs"></div>
                      <div className="w-3/4 h-0.5 bg-[#2c3338] rounded-xs"></div>
                      <div className="w-1/2 h-0.5 bg-[#2c3338] rounded-xs"></div>
                    </div>
                    <div className="absolute bottom-2 right-2 w-14 h-14 bg-[#1d2125] border border-[#2c3338] rounded p-1 grid grid-cols-2 gap-1">
                      <div className="bg-[#161a1d] border border-[#2c3338] rounded-xs p-0.5">
                        <div className="w-full h-0.5 bg-[#8c9bab] rounded-xs"></div>
                        <div className="w-2/3 h-0.5 bg-[#2c3338] rounded-xs mt-0.5"></div>
                      </div>
                      <div className="bg-[#161a1d] border border-[#2c3338] rounded-xs p-0.5">
                        <div className="w-full h-0.5 bg-[#8c9bab] rounded-xs"></div>
                      </div>
                    </div>

                    <div className="absolute bg-[#1d2125] rounded-full p-1.5 shadow-md z-10 text-indigo-400 border border-[#2c3338]">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs font-bold text-[#292a2e] dark:text-[#deebff]">Giao diện Tối</span>
                    {theme === "dark" && (
                      <span className="bg-[#1868db] dark:bg-[#579dff] text-white dark:text-[#22272b] rounded-full p-0.5">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </span>
                    )}
                  </div>
                </button>
              </div>
            </div>
          )}

          {activeTab === "guide" && (
            <div className="space-y-3 animate-in fade-in duration-200 pb-2">
              <div className="mb-4">
                <h3 className="text-xs font-bold text-[#292a2e] dark:text-[#deebff] uppercase tracking-wide mb-1">
                  Cách sử dụng Beaverdash
                </h3>
                <p className="text-xs text-[#6b6e76] dark:text-slate-400">
                  Tìm hiểu nhanh các tính năng quan trọng để tối ưu hóa hiệu suất quản lý dự án.
                </p>
              </div>

              {/* Accordion container */}
              <div className="space-y-3">
                {/* 1. Bảng công việc */}
                <div className="border border-slate-200 dark:border-[#353e47] rounded-lg overflow-hidden bg-white dark:bg-[#22272b] transition-all duration-200 hover:border-slate-300 dark:hover:border-slate-600">
                  <button
                    onClick={() => toggleSection("board")}
                    className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-[#2c3338]/50 transition-colors text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center text-[#1868db] dark:text-[#579dff] shrink-0">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                        </svg>
                      </div>
                      <span className="text-xs font-bold text-[#292a2e] dark:text-[#deebff]">Bảng công việc</span>
                    </div>
                    <svg
                      className={`w-3.5 h-3.5 text-slate-400 dark:text-slate-500 transition-transform duration-200 ${openSection === "board" ? "transform rotate-90" : ""}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                  {openSection === "board" && (
                    <div className="px-4 pb-4 pt-2.5 bg-slate-50/30 dark:bg-[#1d2125]/30 border-t border-slate-100 dark:border-[#2c3338] text-xs text-[#505258] dark:text-slate-300 space-y-2.5 leading-relaxed">
                      <p>
                        • <strong>Kéo thả tiện lợi:</strong> Hệ thống cho phép bạn chuyển đổi vị trí các công việc giữa các cột trạng thái bằng cách nhấp giữ và di chuyển chuột. Tiến độ công việc sẽ được lưu trữ và cập nhật ngay lập tức.
                      </p>
                      <p>
                        • <strong>Quản lý số lượng công việc:</strong> Bạn có thể đặt số lượng tối đa công việc được phép xử lý đồng thời trong mỗi cột. Nếu số lượng công việc vượt quá mức quy định, cột đó sẽ đổi màu cảnh báo giúp bạn dễ dàng phát hiện khối lượng công việc đang bị quá tải để có biện pháp xử lý kịp thời.
                      </p>
                    </div>
                  )}
                </div>

                {/* 2. Quy tắc thời hạn */}
                <div className="border border-slate-200 dark:border-[#353e47] rounded-lg overflow-hidden bg-white dark:bg-[#22272b] transition-all duration-200 hover:border-slate-300 dark:hover:border-slate-600">
                  <button
                    onClick={() => toggleSection("dates")}
                    className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-[#2c3338]/50 transition-colors text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center text-emerald-500 dark:text-emerald-400 shrink-0">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <span className="text-xs font-bold text-[#292a2e] dark:text-[#deebff]">Thời hạn công việc</span>
                    </div>
                    <svg
                      className={`w-3.5 h-3.5 text-slate-400 dark:text-slate-500 transition-transform duration-200 ${openSection === "dates" ? "transform rotate-90" : ""}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                  {openSection === "dates" && (
                    <div className="px-4 pb-4 pt-2.5 bg-slate-50/30 dark:bg-[#1d2125]/30 border-t border-slate-100 dark:border-[#2c3338] text-xs text-[#505258] dark:text-slate-300 space-y-2.5 leading-relaxed">
                      <p>
                        • <strong>Liên kết thời gian:</strong> Hạn hoàn thành của mỗi công việc luôn phải nằm trong khoảng thời gian hoạt động của dự án. Hệ thống tự động ngăn chặn việc đặt hạn chót của công việc muộn hơn hạn chót của dự án.
                      </p>
                      <p>
                        • <strong>Quản lý nhiệm vụ phụ:</strong> Thời gian bắt đầu và kết thúc của các nhiệm vụ nhỏ bên trong công việc cũng phải tuân thủ khung thời gian của công việc chính. Khi có sự thay đổi thời gian không hợp lệ, hệ thống sẽ đưa ra thông báo cảnh báo trực tiếp để bạn điều chỉnh lại.
                      </p>
                    </div>
                  )}
                </div>

                {/* 3. Trợ lý ảo */}
                <div className="border border-slate-200 dark:border-[#353e47] rounded-lg overflow-hidden bg-white dark:bg-[#22272b] transition-all duration-200 hover:border-slate-300 dark:hover:border-slate-600">
                  <button
                    onClick={() => toggleSection("ai")}
                    className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-[#2c3338]/50 transition-colors text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-purple-50 dark:bg-purple-950/30 flex items-center justify-center text-purple-500 dark:text-purple-400 shrink-0">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                      </div>
                      <span className="text-xs font-bold text-[#292a2e] dark:text-[#deebff]">Trợ lý trí tuệ nhân tạo</span>
                    </div>
                    <svg
                      className={`w-3.5 h-3.5 text-slate-400 dark:text-slate-500 transition-transform duration-200 ${openSection === "ai" ? "transform rotate-90" : ""}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                  {openSection === "ai" && (
                    <div className="px-4 pb-4 pt-2.5 bg-slate-50/30 dark:bg-[#1d2125]/30 border-t border-slate-100 dark:border-[#2c3338] text-xs text-[#505258] dark:text-slate-300 space-y-2.5 leading-relaxed">
                      <p>
                        • <strong>Trò chuyện trực tiếp:</strong> Bạn có thể truy cập mục trò chuyện với trợ lý ảo tại thẻ riêng trong phần chi tiết dự án để trao đổi trực tiếp.
                      </p>
                      <p>
                        • <strong>Tự động tạo công việc:</strong> Thay vì phải tự thao tác bằng tay, bạn chỉ cần nhắn yêu cầu tạo công việc mới, trợ lý ảo sẽ tự động nhận diện thông tin và tạo công việc trên hệ thống cho bạn.
                      </p>
                    </div>
                  )}
                </div>

                {/* 4. Cập nhật tức thì */}
                <div className="border border-slate-200 dark:border-[#353e47] rounded-lg overflow-hidden bg-white dark:bg-[#22272b] transition-all duration-200 hover:border-slate-300 dark:hover:border-slate-600">
                  <button
                    onClick={() => toggleSection("realtime")}
                    className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-[#2c3338]/50 transition-colors text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center text-amber-500 dark:text-amber-400 shrink-0">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                      </div>
                      <span className="text-xs font-bold text-[#292a2e] dark:text-[#deebff]">Cập nhật tức thì</span>
                    </div>
                    <svg
                      className={`w-3.5 h-3.5 text-slate-400 dark:text-slate-500 transition-transform duration-200 ${openSection === "realtime" ? "transform rotate-90" : ""}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                  {openSection === "realtime" && (
                    <div className="px-4 pb-4 pt-2.5 bg-slate-50/30 dark:bg-[#1d2125]/30 border-t border-slate-100 dark:border-[#2c3338] text-xs text-[#505258] dark:text-slate-300 space-y-2.5 leading-relaxed">
                      <p>
                        • <strong>Kết nối liên tục:</strong> Hệ thống tự động đồng bộ hóa các thay đổi mới nhất từ mọi thành viên trong dự án mà bạn không cần tải lại trang.
                      </p>
                      <p>
                        • <strong>Nhận thông báo tức thời:</strong> Khi đồng nghiệp gửi bình luận mới, di chuyển vị trí công việc, hoặc phân công công việc mới cho bạn, hệ thống sẽ gửi thông báo trực tiếp đến bạn ngay lập tức.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-slate-200 dark:border-[#353e47] bg-slate-50/50 dark:bg-[#1d2125]/50 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="bg-[#1868db] hover:bg-[#0052cc] dark:bg-[#579dff] dark:hover:bg-[#4c8be0] text-white dark:text-[#1d2125] text-xs font-bold px-4 py-2 rounded-[4px] cursor-pointer transition-colors shadow-sm"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
