"use client";

/**
 * @component LoginShowcase
 * @description Hiển thị cột bên phải của trang Đăng nhập với giao diện cuộn đa tầng (Scrollable Showcase) gồm 4 khu vực tương tác:
 * 1. Bảng Kanban 3D Parallax & Chỉ báo cuộn.
 * 2. Trợ lý AI Terminal & Sơ đồ Mind-Map SVG tương tác phát sáng.
 * 3. SignalR Activity Stream cập nhật thời gian thực & Card rọi sáng theo chuột (Spotlight Cards).
 * 4. Team Analytics Dashboard với Biểu đồ tiến độ SVG & Thẻ thành viên 3D lật mở thông tin.
 */

import * as React from "react";
import { Interactive3DLogo } from "./Interactive3DLogo";

interface Activity {
  id: number;
  user: string;
  action: string;
  target: string;
  time: string;
  color: string;
}

export function LoginShowcase() {
  // States cho Phần 1 (Kanban 3D)
  const boardRef = React.useRef<HTMLDivElement>(null);
  const [tiltX, setTiltX] = React.useState(0);
  const [tiltY, setTiltY] = React.useState(0);
  const [isBoardHovered, setIsBoardHovered] = React.useState(false);

  // States cho Phần 2 (AI Terminal & Mind-Map)
  const [typedText, setTypedText] = React.useState("");
  const [hoveredNode, setHoveredNode] = React.useState<number | null>(null);
  const fullText = "beaverdash --ai-copilot --generate-project-mindmap";

  // States cho Phần 3 (Live SignalR Activities)
  const [activities, setActivities] = React.useState<Activity[]>([
    { id: 1, user: "Quốc Đàm", action: "kéo thẻ #BD-104 sang", target: "Đang làm", time: "Vừa xong", color: "bg-blue-500" },
    { id: 2, user: "Trợ lý AI", action: "gợi ý 5 checklist công việc cho", target: "#BD-92", time: "3 giây trước", color: "bg-purple-500" },
    { id: 3, user: "Alex Nguyen", action: "bình luận vào thẻ", target: "#BD-88", time: "1 phút trước", color: "bg-pink-500" },
    { id: 4, user: "Hệ thống", action: "đồng bộ tiến độ thành công với", target: "Server", time: "5 phút trước", color: "bg-emerald-500" },
  ]);
  const [spotlightCoords, setSpotlightCoords] = React.useState<{ [key: number]: { x: number; y: number } }>({});

  // States cho Phần 4 (Team Dashboard & Analytics)
  const [hoveredTeamCard, setHoveredTeamCard] = React.useState<number | null>(null);

  // 1. Logic xoay bảng Kanban 3D
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

  // 2. Logic gõ lệnh giả lập AI
  React.useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      setTypedText(fullText.slice(0, index));
      index = (index + 1) % (fullText.length + 15); // Loop and pause at end
    }, 80);
    return () => clearInterval(interval);
  }, []);

  // 3. Logic đẩy Log Live Hoạt động mô phỏng (SignalR)
  React.useEffect(() => {
    const pool = [
      { user: "Quốc Đàm", action: "kéo thẻ hoàn thành", target: "#BD-72 (Tài liệu)", color: "bg-blue-500" },
      { user: "Trợ lý AI", action: "phân loại khẩn cấp cho thẻ", target: "#BD-88", color: "bg-purple-500" },
      { user: "Alex Nguyen", action: "bắt đầu xử lý task", target: "#BD-92 (Hoạt họa)", color: "bg-pink-500" },
      { user: "Hệ thống", action: "sao lưu cơ sở dữ liệu lên", target: "Cloud Database", color: "bg-emerald-500" },
      { user: "Quốc Đàm", action: "gán người thực hiện task #BD-104 cho", target: "Alex Nguyen", color: "bg-blue-500" },
    ];
    let poolIndex = 0;
    const interval = setInterval(() => {
      setActivities((prev) => {
        const newItem = {
          id: Date.now(),
          user: pool[poolIndex].user,
          action: pool[poolIndex].action,
          target: pool[poolIndex].target,
          time: "Vừa xong",
          color: pool[poolIndex].color,
        };
        poolIndex = (poolIndex + 1) % pool.length;
        return [newItem, ...prev.slice(0, 3)];
      });
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  // Logic spotlight rọi sáng cho các card log
  const handleSpotlightMouseMove = (id: number, e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setSpotlightCoords((prev) => ({
      ...prev,
      [id]: { x: e.clientX - rect.left, y: e.clientY - rect.top },
    }));
  };

  return (
    <div className="hidden lg:flex flex-col flex-1 relative bg-gradient-to-br from-[#0a0d1a] via-[#0f172a] to-[#1a1f38] overflow-y-auto scrollbar-none h-screen scroll-smooth select-none">
      
      {/* Decorative Grid Overlay & Global Glows */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none z-0" />
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-blue-600/10 blur-[120px] animate-drift-one pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[10%] w-[600px] h-[600px] rounded-full bg-purple-900/10 blur-[140px] animate-drift-two pointer-events-none" />

      {/* TOP BRANDING (Sticky / Float) */}
      <div className="absolute top-8 left-12 z-20 flex items-center gap-1 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/5 bg-slate-900/20">
        <Interactive3DLogo width={20} height={20} className="-ml-3" />
        <span className="text-white font-semibold tracking-wider text-xs -ml-1">BEAVERDASH</span>
      </div>

      {/* ================= SECTION 1: KANBAN SHOWCASE & SCROLL INDICATOR ================= */}
      <div className="h-screen w-full flex flex-col justify-center items-center px-12 xl:px-16 relative shrink-0 z-10">
        
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
            className="glassmorphism rounded-2xl w-full p-6 shadow-2xl border border-white/10 backdrop-blur-xl mb-8 preserve-3d transition-tilt"
            style={{
              transform: isBoardHovered
                ? `rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(1.02)`
                : "rotateX(0deg) rotateY(0deg) scale(1)",
              boxShadow: isBoardHovered
                ? "0 35px 70px -15px rgba(0, 0, 0, 0.5), 0 0 50px -10px rgba(24, 104, 219, 0.25)"
                : "0 20px 45px -15px rgba(0, 0, 0, 0.3)",
            }}
          >
            {/* Fake Board Header */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5 preserve-3d">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
                <span className="text-white/40 text-xs ml-2">beaverdash-workspace / project-alpha</span>
              </div>
              <div className="flex gap-1.5">
                <div className="w-6 h-6 rounded-md bg-white/5 flex items-center justify-center text-white/50 text-[10px]">⌥</div>
                <div className="w-6 h-6 rounded-md bg-white/5 flex items-center justify-center text-white/50 text-[10px]">⌘</div>
              </div>
            </div>

            {/* Columns Grid */}
            <div className="grid grid-cols-3 gap-4 preserve-3d">
              {/* Column 1 */}
              <div className="space-y-4 preserve-3d">
                <div className="flex items-center justify-between text-white/60 text-xs font-semibold px-1">
                  <span>Cần làm</span>
                  <span className="bg-white/10 px-1.5 py-0.5 rounded text-[10px]">2</span>
                </div>
                
                <div className="preserve-3d transition-transform duration-300" style={{ transform: isBoardHovered ? "translateZ(25px)" : "translateZ(0px)" }}>
                  <div className="glassmorphism-card rounded-xl p-4 space-y-3 cursor-pointer hover:glassmorphism-card-active transition-all duration-300 transform animate-float-slow">
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] bg-blue-500/20 text-blue-300 font-semibold px-2 py-0.5 rounded">Tính năng</span>
                      <span className="text-white/30 text-[9px]">#BD-104</span>
                    </div>
                    <h4 className="text-white/95 text-xs font-semibold leading-relaxed">Xây dựng lại UI trang đăng nhập</h4>
                    <div className="flex justify-between items-center pt-2">
                      <div className="flex -space-x-1.5">
                        <div className="w-5 h-5 rounded-full bg-purple-500 text-[8px] font-bold flex items-center justify-center text-white border border-slate-900">QD</div>
                        <div className="w-5 h-5 rounded-full bg-teal-500 text-[8px] font-bold flex items-center justify-center text-white border border-slate-900">AG</div>
                      </div>
                      <span className="text-[9px] text-white/40 font-semibold">Hôm nay</span>
                    </div>
                  </div>
                </div>

                <div className="preserve-3d transition-transform duration-300" style={{ transform: isBoardHovered ? "translateZ(40px)" : "translateZ(0px)" }}>
                  <div className="glassmorphism-card rounded-xl p-4 space-y-3 cursor-pointer hover:glassmorphism-card-active transition-all duration-300 transform animate-float-fast">
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] bg-amber-500/20 text-amber-300 font-semibold px-2 py-0.5 rounded">Cải tiến</span>
                      <span className="text-white/30 text-[9px]">#BD-92</span>
                    </div>
                    <h4 className="text-white/95 text-xs font-semibold leading-relaxed">Thêm hiệu ứng hoạt họa tinh tế</h4>
                    <div className="flex justify-between items-center pt-2">
                      <div className="w-5 h-5 rounded-full bg-blue-500 text-[8px] font-bold flex items-center justify-center text-white border border-slate-900 font-semibold">AG</div>
                      <span className="text-[9px] text-white/40 font-semibold">2 ngày trước</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Column 2 */}
              <div className="space-y-4 preserve-3d">
                <div className="flex items-center justify-between text-white/60 text-xs font-semibold px-1">
                  <span>Đang làm</span>
                  <span className="bg-[#1868db]/30 text-[#1868db] font-bold px-1.5 py-0.5 rounded text-[10px]">1</span>
                </div>

                <div className="preserve-3d transition-transform duration-300" style={{ transform: isBoardHovered ? "translateZ(55px)" : "translateZ(0px)" }}>
                  <div className="glassmorphism-card-active rounded-xl p-4 space-y-3 cursor-pointer hover:scale-[1.02] transition-all duration-300 transform animate-float-medium">
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] bg-purple-500/20 text-purple-300 font-semibold px-2 py-0.5 rounded">Refactor</span>
                      <span className="text-white/30 text-[9px]">#BD-88</span>
                    </div>
                    <h4 className="text-white/95 text-xs font-semibold leading-relaxed">Tối ưu hóa Google Auth API</h4>
                    
                    <div className="space-y-1">
                      <div className="flex justify-between text-[9px]">
                        <span className="text-white/50">Tiến độ</span>
                        <span className="text-blue-400 font-semibold">75%</span>
                      </div>
                      <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
                        <div className="bg-[#1868db] h-full w-[75%]" />
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-2">
                      <div className="w-5 h-5 rounded-full bg-pink-500 text-[8px] font-bold flex items-center justify-center text-white border border-slate-900">QD</div>
                      <span className="text-[9px] text-blue-300 font-semibold bg-blue-500/10 px-1.5 py-0.5 rounded">Khẩn cấp</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Column 3 */}
              <div className="space-y-4 preserve-3d">
                <div className="flex items-center justify-between text-white/60 text-xs font-semibold px-1">
                  <span>Hoàn thành</span>
                  <span className="bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded text-[10px]">1</span>
                </div>

                <div className="preserve-3d transition-transform duration-300" style={{ transform: isBoardHovered ? "translateZ(30px)" : "translateZ(0px)" }}>
                  <div className="glassmorphism-card rounded-xl p-4 space-y-3 opacity-60 cursor-pointer hover:opacity-100 hover:glassmorphism-card-active transition-all duration-300 transform animate-float-slow">
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-semibold px-2 py-0.5 rounded">Tài liệu</span>
                      <span className="text-white/30 text-[9px]">#BD-72</span>
                    </div>
                    <h4 className="text-white/95 text-xs font-semibold leading-relaxed line-through">Cập nhật file README.md</h4>
                    <div className="flex justify-between items-center pt-2">
                      <div className="w-5 h-5 rounded-full bg-emerald-600 text-[8px] font-bold flex items-center justify-center text-white border border-slate-900">QD</div>
                      <span className="text-[9px] text-emerald-400 font-semibold">Đã xong</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Heading */}
          <div className="text-center max-w-[500px]">
            <h2 className="text-xl font-bold text-white mb-2">Quản lý Kanban & Phân bổ Công việc Thông minh</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Trải nghiệm hệ thống bảng kéo thả trực quan kết hợp chiều sâu tương tác hiện đại. Sắp xếp mọi nguồn lực gọn gàng, hiệu quả.
            </p>
          </div>
        </div>

        {/* Scroll indicator mouse */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 opacity-40 hover:opacity-90 transition-opacity duration-300 cursor-pointer">
          <span className="text-[9px] uppercase tracking-widest text-slate-400 font-bold">Cuộn để xem thêm</span>
          <div className="w-4 h-7 border border-slate-400 rounded-full flex justify-center p-0.5">
            <div className="w-1 h-1 bg-[#1868db] rounded-full animate-scroll-wheel" />
          </div>
        </div>
      </div>

      {/* ================= SECTION 2: AI DEVELOPER CONSOLE & MIND-MAP ================= */}
      <div className="h-screen w-full flex flex-col justify-center px-12 xl:px-20 relative shrink-0 z-10 border-t border-white/5">
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-8 items-center w-full max-w-[900px] mx-auto">
          
          {/* AI Terminal console (Left 3 columns on big screens) */}
          <div className="xl:col-span-3 space-y-4">
            <div className="flex flex-col gap-2">
              <span className="text-[9px] font-bold tracking-widest text-[#1868db] uppercase">Trí tuệ nhân tạo</span>
              <h2 className="text-2xl font-bold text-white">AI Copilot Terminal</h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Hệ thống tự động phân tích và trực quan hóa toàn bộ tiến độ, mối liên kết nhiệm vụ dự án. Trả kết quả sơ đồ công việc dạng đồ thị mạng lưới kết nối trực quan.
              </p>
            </div>

            {/* Glass Console Screen */}
            <div className="glassmorphism rounded-xl border border-white/10 p-4 font-mono text-[11px] text-[#1868db] leading-relaxed shadow-lg relative overflow-hidden h-[150px]">
              <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-3 text-[9px] text-slate-500">
                <span>SYSTEM CONSOLE - ACTIVE DEEP LEARNING</span>
                <span className="flex h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
              </div>
              <div className="space-y-1">
                <div className="flex gap-2">
                  <span className="text-slate-500">guest@beaverdash:~#</span>
                  <span className="text-white font-semibold">{typedText}</span>
                  <span className="animate-pulse">|</span>
                </div>
                <div className="text-slate-400 mt-2 text-[10px]">
                  {typedText.length > 30 ? (
                    <div className="space-y-1 animate-fade-slide-up">
                      <p className="text-emerald-400">✔ Loading AIAssistantService reasoning engine...</p>
                      <p className="text-emerald-400">✔ Processing project-alpha metadata (12 nodes, 3 columns)</p>
                      <p className="text-white">✔ Mindmap generated! Plotting dynamic interactive SVG tree...</p>
                    </div>
                  ) : (
                    <p className="text-slate-500">Waiting for query instruction...</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Mindmap Visual (Right 2 columns) */}
          <div className="xl:col-span-2 flex justify-center items-center">
            <div className="relative glassmorphism rounded-2xl border border-white/10 p-6 shadow-2xl w-[260px] h-[260px] flex items-center justify-center">
              
              {/* Mindmap Nodes using absolute divs and SVG links */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 200 200">
                {/* Node paths that light up when hovered */}
                <line x1="100" y1="100" x2="35" y2="45" stroke={hoveredNode === 1 ? "#1868db" : "rgba(255,255,255,0.06)"} strokeWidth={hoveredNode === 1 ? "2" : "1"} className="transition-all duration-300" />
                <line x1="100" y1="100" x2="165" y2="45" stroke={hoveredNode === 2 ? "#a855f7" : "rgba(255,255,255,0.06)"} strokeWidth={hoveredNode === 2 ? "2" : "1"} className="transition-all duration-300" />
                <line x1="100" y1="100" x2="35" y2="155" stroke={hoveredNode === 3 ? "#06b6d4" : "rgba(255,255,255,0.06)"} strokeWidth={hoveredNode === 3 ? "2" : "1"} className="transition-all duration-300" />
                <line x1="100" y1="100" x2="165" y2="155" stroke={hoveredNode === 4 ? "#10b981" : "rgba(255,255,255,0.06)"} strokeWidth={hoveredNode === 4 ? "2" : "1"} className="transition-all duration-300" />
              </svg>

              {/* Central Core Node */}
              <div
                className={`z-10 w-14 h-14 rounded-full border border-blue-500/30 flex items-center justify-center transition-all duration-500 cursor-pointer shadow-lg bg-[#0e172e] ${
                  hoveredNode ? "scale-110 shadow-blue-500/20 border-blue-500" : "scale-100"
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#1868db] to-purple-600 flex items-center justify-center text-white text-[9px] font-bold text-center leading-tight">
                  AI Core
                </div>
              </div>

              {/* Node 1: Kanban */}
              <div
                onMouseEnter={() => setHoveredNode(1)}
                onMouseLeave={() => setHoveredNode(null)}
                className="absolute top-6 left-6 z-10 px-2.5 py-1.5 rounded-lg glassmorphism-card border border-white/10 hover:border-blue-500 hover:scale-105 transition-all duration-300 cursor-pointer flex flex-col items-center"
              >
                <span className="text-[9px] font-bold text-blue-300 uppercase">Kanban</span>
                <span className="text-[8px] text-white/50">8 Active Tasks</span>
              </div>

              {/* Node 2: Security */}
              <div
                onMouseEnter={() => setHoveredNode(2)}
                onMouseLeave={() => setHoveredNode(null)}
                className="absolute top-6 right-6 z-10 px-2.5 py-1.5 rounded-lg glassmorphism-card border border-white/10 hover:border-purple-500 hover:scale-105 transition-all duration-300 cursor-pointer flex flex-col items-center"
              >
                <span className="text-[9px] font-bold text-purple-300 uppercase">Security</span>
                <span className="text-[8px] text-white/50">SSL Token API</span>
              </div>

              {/* Node 3: Realtime */}
              <div
                onMouseEnter={() => setHoveredNode(3)}
                onMouseLeave={() => setHoveredNode(null)}
                className="absolute bottom-6 left-6 z-10 px-2.5 py-1.5 rounded-lg glassmorphism-card border border-white/10 hover:border-cyan-400 hover:scale-105 transition-all duration-300 cursor-pointer flex flex-col items-center"
              >
                <span className="text-[9px] font-bold text-cyan-300 uppercase">Sync Feed</span>
                <span className="text-[8px] text-white/50">SignalR Web</span>
              </div>

              {/* Node 4: Charts */}
              <div
                onMouseEnter={() => setHoveredNode(4)}
                onMouseLeave={() => setHoveredNode(null)}
                className="absolute bottom-6 right-6 z-10 px-2.5 py-1.5 rounded-lg glassmorphism-card border border-white/10 hover:border-emerald-400 hover:scale-105 transition-all duration-300 cursor-pointer flex flex-col items-center"
              >
                <span className="text-[9px] font-bold text-emerald-300 uppercase">Analytics</span>
                <span className="text-[8px] text-white/50">Performance</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= SECTION 3: SIGNALR LIVE ACTIVITY FEED ================= */}
      <div className="h-screen w-full flex flex-col justify-center px-12 xl:px-20 relative shrink-0 z-10 border-t border-white/5">
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-8 items-center w-full max-w-[900px] mx-auto">
          
          {/* Info Panel (Right on widescreen) */}
          <div className="xl:col-span-2 space-y-4">
            <span className="text-[9px] font-bold tracking-widest text-emerald-400 uppercase">Kết nối thời gian thực</span>
            <h2 className="text-2xl font-bold text-white">SignalR Live Event</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Mọi thay đổi trạng thái thẻ Kanban, chỉnh sửa thành viên hay bình luận phản hồi đều được truyền phát trực tiếp (Live synchronization) tức thì.
            </p>
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wide">Connected via WebSockets</span>
            </div>
          </div>

          {/* Scrolling Log Stream (Left on widescreen) */}
          <div className="xl:col-span-3 space-y-3">
            {activities.map((act) => {
              const coords = spotlightCoords[act.id] || { x: 0, y: 0 };
              return (
                <div
                  key={act.id}
                  onMouseMove={(e) => handleSpotlightMouseMove(act.id, e)}
                  className="relative glassmorphism-card rounded-xl p-4 border border-white/10 hover:border-slate-400/30 overflow-hidden cursor-pointer select-none transition-all duration-300 flex justify-between items-center group shadow-md"
                >
                  {/* Spotlight Radial Background */}
                  <div
                    className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{
                      background: `radial-gradient(120px circle at ${coords.x}px ${coords.y}px, rgba(24, 104, 219, 0.15), transparent 70%)`,
                    }}
                  />

                  <div className="flex items-center gap-3 relative z-10">
                    <span className={`w-2.5 h-2.5 rounded-full ${act.color} animate-pulse-glow shrink-0`} />
                    <div className="space-y-0.5">
                      <p className="text-xs text-white/90 font-medium">
                        <span className="font-bold text-blue-300">{act.user}</span> {act.action}{" "}
                        <span className="font-bold text-white bg-white/10 px-1.5 py-0.5 rounded text-[10px]">{act.target}</span>
                      </p>
                      <span className="text-[9px] text-slate-500 font-semibold uppercase tracking-wider">{act.time}</span>
                    </div>
                  </div>

                  <span className="text-[9px] text-slate-500 group-hover:text-blue-400 group-hover:translate-x-1 transition-all font-bold uppercase relative z-10 shrink-0">
                    Live Feed
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ================= SECTION 4: TEAM DASHBOARD & ANALYTICS ================= */}
      <div className="h-screen w-full flex flex-col justify-center px-12 xl:px-20 relative shrink-0 z-10 border-t border-white/5">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-10 items-center w-full max-w-[900px] mx-auto">
          
          {/* Left Column: Progress Area Chart */}
          <div className="space-y-4">
            <span className="text-[9px] font-bold tracking-widest text-purple-400 uppercase">Thống kê & Đồ thị</span>
            <h2 className="text-2xl font-bold text-white">Năng suất Đội ngũ</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Theo dõi nhịp độ hoàn thành công việc chi tiết. Hệ thống tự động vẽ biểu đồ tốc độ (Velocity) giúp định lượng tiến trình chính xác.
            </p>

            {/* Glowing Custom Area Chart (SVG) */}
            <div className="glassmorphism rounded-xl border border-white/10 p-5 shadow-lg relative overflow-hidden">
              <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold mb-4">
                <span>BÁO CÁO TIẾN ĐỘ SPRINT 1</span>
                <span className="text-blue-400">92% HOÀN THÀNH</span>
              </div>

              <svg className="w-full h-32" viewBox="0 0 400 120">
                <defs>
                  <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1868db" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#1868db" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                {/* Horizontal grid lines */}
                <line x1="0" y1="30" x2="400" y2="30" stroke="rgba(255,255,255,0.05)" />
                <line x1="0" y1="60" x2="400" y2="60" stroke="rgba(255,255,255,0.05)" />
                <line x1="0" y1="90" x2="400" y2="90" stroke="rgba(255,255,255,0.05)" />
                {/* Area path */}
                <path d="M 0 100 Q 50 35 100 80 T 200 25 T 300 85 T 400 15 L 400 120 L 0 120 Z" fill="url(#chartGrad)" />
                {/* Line path */}
                <path d="M 0 100 Q 50 35 100 80 T 200 25 T 300 85 T 400 15" fill="none" stroke="#1868db" strokeWidth="2.5" />
                {/* Glowing points */}
                <circle cx="100" cy="80" r="4" className="text-blue-500 fill-current animate-pulse-glow" />
                <circle cx="200" cy="25" r="4" className="text-indigo-400 fill-current animate-pulse-glow" />
                <circle cx="400" cy="15" r="4" className="text-purple-400 fill-current animate-pulse-glow" />
              </svg>
            </div>
          </div>

          {/* Right Column: Interactive 3D Stacked Team Cards */}
          <div className="relative h-[280px] flex items-center justify-center">
            
            {/* Team Stack Card 1: Quốc Đàm */}
            <div
              onMouseEnter={() => setHoveredTeamCard(1)}
              onMouseLeave={() => setHoveredTeamCard(null)}
              className="absolute left-4 w-[240px] glassmorphism-card rounded-2xl border border-white/10 p-5 shadow-2xl cursor-pointer select-none transition-all duration-500 z-10"
              style={{
                transform: hoveredTeamCard === 1
                  ? "translateY(-30px) scale(1.08) rotate(-2deg)"
                  : hoveredTeamCard !== null
                    ? "translateY(0px) scale(0.92) opacity-40 blur-[1px]"
                    : "translateY(-20px) rotate(-6deg)",
              }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center font-bold text-white text-xs">QD</div>
                <div>
                  <h4 className="text-xs font-bold text-white">Quốc Đàm</h4>
                  <span className="text-[9px] text-slate-400">Product Owner</span>
                </div>
              </div>
              <div className="space-y-2 border-t border-white/5 pt-3 text-[10px] text-slate-300">
                <div className="flex justify-between">
                  <span>Khối lượng:</span>
                  <span className="font-bold text-blue-400">85% (6 Tasks)</span>
                </div>
                <div className="flex justify-between">
                  <span>Hiệu suất:</span>
                  <span className="font-bold text-emerald-400">98% Đúng hạn</span>
                </div>
              </div>
            </div>

            {/* Team Stack Card 2: AI Copilot */}
            <div
              onMouseEnter={() => setHoveredTeamCard(2)}
              onMouseLeave={() => setHoveredTeamCard(null)}
              className="absolute w-[240px] glassmorphism-card-active rounded-2xl border border-blue-500/20 p-5 shadow-2xl cursor-pointer select-none transition-all duration-500 z-10"
              style={{
                transform: hoveredTeamCard === 2
                  ? "translateY(-40px) scale(1.08) rotate(0deg)"
                  : hoveredTeamCard !== null
                    ? "translateY(0px) scale(0.92) opacity-40 blur-[1px]"
                    : "translateY(10px) rotate(0deg)",
              }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#1868db] to-purple-600 flex items-center justify-center font-bold text-white text-xs">AI</div>
                <div>
                  <h4 className="text-xs font-bold text-white">AI Copilot</h4>
                  <span className="text-[9px] text-[#1868db] font-bold">Automation Agent</span>
                </div>
              </div>
              <div className="space-y-2 border-t border-white/5 pt-3 text-[10px] text-slate-300">
                <div className="flex justify-between">
                  <span>Gợi ý đã tạo:</span>
                  <span className="font-bold text-blue-400">189 Ý tưởng</span>
                </div>
                <div className="flex justify-between">
                  <span>Thời gian tiết kiệm:</span>
                  <span className="font-bold text-emerald-400">~12h / Tuần</span>
                </div>
              </div>
            </div>

            {/* Team Stack Card 3: Alex Nguyen */}
            <div
              onMouseEnter={() => setHoveredTeamCard(3)}
              onMouseLeave={() => setHoveredTeamCard(null)}
              className="absolute right-4 w-[240px] glassmorphism-card rounded-2xl border border-white/10 p-5 shadow-2xl cursor-pointer select-none transition-all duration-500 z-10"
              style={{
                transform: hoveredTeamCard === 3
                  ? "translateY(-30px) scale(1.08) rotate(2deg)"
                  : hoveredTeamCard !== null
                    ? "translateY(0px) scale(0.92) opacity-40 blur-[1px]"
                    : "translateY(40px) rotate(6deg)",
              }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center font-bold text-white text-xs">AN</div>
                <div>
                  <h4 className="text-xs font-bold text-white">Alex Nguyen</h4>
                  <span className="text-[9px] text-slate-400">Lead Developer</span>
                </div>
              </div>
              <div className="space-y-2 border-t border-white/5 pt-3 text-[10px] text-slate-300">
                <div className="flex justify-between">
                  <span>Khối lượng:</span>
                  <span className="font-bold text-blue-400">70% (3 Tasks)</span>
                </div>
                <div className="flex justify-between">
                  <span>Hiệu suất:</span>
                  <span className="font-bold text-emerald-400">92% Đúng hạn</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
    </div>
  );
}
