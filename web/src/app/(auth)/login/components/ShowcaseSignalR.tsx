"use client";

import * as React from "react";

interface Activity {
  id: number;
  user: string;
  avatarText: string;
  avatarColor: string;
  action: string;
  target: string;
  time: string;
  badge: string;
  badgeColor: string;
}

export function ShowcaseSignalR() {
  const [activities, setActivities] = React.useState<Activity[]>([
    {
      id: 1,
      user: "Quốc Đàm",
      avatarText: "QĐ",
      avatarColor: "from-blue-500 to-sky-400",
      action: "đã chuyển trạng thái",
      target: "Thiết kế Wireframe -> Đang tiến hành",
      time: "Vừa xong",
      badge: "Bảng công việc",
      badgeColor: "bg-blue-50 text-blue-600 border-blue-100",
    },
    {
      id: 2,
      user: "Linh Chi",
      avatarText: "LC",
      avatarColor: "from-emerald-500 to-teal-400",
      action: "đã hoàn thành nhiệm vụ",
      target: "Nghiên cứu hành vi người dùng",
      time: "3 giây trước",
      badge: "Công việc",
      badgeColor: "bg-emerald-50 text-emerald-600 border-emerald-100",
    },
    {
      id: 3,
      user: "Trợ lý AI",
      avatarText: "AI",
      avatarColor: "from-purple-500 to-indigo-500",
      action: "đã đề xuất 3 việc cần làm cho",
      target: "Thiết kế giao diện Figma",
      time: "1 phút trước",
      badge: "Hệ thống",
      badgeColor: "bg-purple-50 text-purple-600 border-purple-100",
    },
    {
      id: 4,
      user: "Minh Anh",
      avatarText: "MA",
      avatarColor: "from-pink-500 to-rose-400",
      action: "đã gửi bình luận mới",
      target: "Đã cập nhật bảng màu thiết kế theo feedback của sếp",
      time: "5 phút trước",
      badge: "Thảo luận",
      badgeColor: "bg-pink-50 text-pink-600 border-pink-100",
    },
  ]);
  const [spotlightCoords, setSpotlightCoords] = React.useState<{ [key: number]: { x: number; y: number } }>({});
  
  // Real-time Multiplayer Cursors State
  const [cursors, setCursors] = React.useState([
    { id: 1, name: "Linh Chi", color: "bg-emerald-500", stroke: "#10b981", x: 80, y: 90 },
    { id: 2, name: "Hải Nam", color: "bg-amber-500", stroke: "#f59e0b", x: 260, y: 180 },
  ]);

  React.useEffect(() => {
    const pool = [
      {
        user: "Hải Nam",
        avatarText: "HN",
        avatarColor: "from-amber-500 to-orange-400",
        action: "đã cập nhật hạn chót",
        target: "Bản thiết kế Figma -> ngày 10/06/2026",
        badge: "Thời hạn",
        badgeColor: "bg-amber-50 text-amber-600 border-amber-100",
      },
      {
        user: "Quốc Đàm",
        avatarText: "QĐ",
        avatarColor: "from-blue-500 to-sky-400",
        action: "đã phân quyền thành viên mới",
        target: "Thêm Minh Anh vào ban thiết kế",
        badge: "Thành viên",
        badgeColor: "bg-sky-50 text-sky-600 border-sky-100",
      },
      {
        user: "Trợ lý AI",
        avatarText: "AI",
        avatarColor: "from-purple-500 to-indigo-500",
        action: "đã cập nhật mô tả tự động cho",
        target: "Kiểm thử phiên bản di động",
        badge: "Hệ thống",
        badgeColor: "bg-purple-50 text-purple-600 border-purple-100",
      },
      {
        user: "Linh Chi",
        avatarText: "LC",
        avatarColor: "from-emerald-500 to-teal-400",
        action: "đã di chuyển cột trạng thái",
        target: "Cần làm -> Đang thực hiện",
        badge: "Bảng công việc",
        badgeColor: "bg-blue-50 text-blue-600 border-blue-100",
      },
    ];
    let poolIndex = 0;
    const interval = setInterval(() => {
      setActivities((prev) => {
        const newItem = {
          id: Date.now(),
          user: pool[poolIndex].user,
          avatarText: pool[poolIndex].avatarText,
          avatarColor: pool[poolIndex].avatarColor,
          action: pool[poolIndex].action,
          target: pool[poolIndex].target,
          time: "Vừa xong",
          badge: pool[poolIndex].badge,
          badgeColor: pool[poolIndex].badgeColor,
        };
        poolIndex = (poolIndex + 1) % pool.length;
        
        // Update previous item times
        const updatedPrev = prev.map((act, index) => {
          if (index === 0) return { ...act, time: "10 giây trước" };
          if (index === 1) return { ...act, time: "1 phút trước" };
          return act;
        });

        return [newItem, ...updatedPrev.slice(0, 3)];
      });
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  // Smooth Cursor Drifting Animation Loop
  React.useEffect(() => {
    let frameId: number;
    let angle1 = 0;
    let angle2 = Math.PI;

    const animate = () => {
      angle1 += 0.006;
      angle2 += 0.008;

      const x1 = 120 + Math.cos(angle1) * 75 + Math.sin(angle1 * 1.5) * 15;
      const y1 = 100 + Math.sin(angle1) * 60;

      const x2 = 280 + Math.cos(angle2) * 85;
      const y2 = 180 + Math.sin(angle2 * 1.8) * 45;

      setCursors([
        { id: 1, name: "Linh Chi", color: "bg-emerald-500", stroke: "#10b981", x: x1, y: y1 },
        { id: 2, name: "Hải Nam", color: "bg-amber-500", stroke: "#f59e0b", x: x2, y: y2 },
      ]);

      frameId = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(frameId);
  }, []);

  const handleSpotlightMouseMove = (id: number, e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setSpotlightCoords((prev) => ({
      ...prev,
      [id]: { x: e.clientX - rect.left, y: e.clientY - rect.top },
    }));
  };

  return (
    <div className="w-full grid grid-cols-1 xl:grid-cols-5 gap-8 items-center font-sans text-slate-800">
      {/* Info Panel (Right 2 columns in layout, but standard placement) */}
      <div className="xl:col-span-2 space-y-4 text-left order-first xl:order-last select-none">
        <span className="text-[10px] font-bold tracking-widest text-[#1868db] uppercase">Đồng bộ thời gian thực</span>
        <h2 className="text-xl font-bold text-slate-800">Kết nối đội nhóm tức thì</h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          Mọi thay đổi từ trạng thái công việc, bình luận thảo luận, phân công thành viên cho đến các cập nhật của Trợ lý AI đều được đồng bộ ngay lập tức tới tất cả màn hình của dự án mà không cần tải lại trang.
        </p>
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wide">Đã kết nối thời gian thực (SignalR)</span>
        </div>
      </div>

      {/* Scrolling Log Stream (Left 3 columns) */}
      <div className="xl:col-span-3 space-y-3.5 w-full relative min-h-[350px] overflow-hidden p-2 rounded-2xl bg-slate-200/20 border border-slate-250/10">
        
        {/* Collaborative multiplayer cursor overlays */}
        {cursors.map((cursor) => (
          <div
            key={cursor.id}
            className="absolute pointer-events-none z-30 transition-all duration-75 ease-out select-none"
            style={{ left: `${cursor.x}px`, top: `${cursor.y}px` }}
          >
            <svg className="w-4.5 h-4.5 text-white drop-shadow-[0_1.5px_3px_rgba(0,0,0,0.15)]" viewBox="0 0 24 24" fill="currentColor">
              <path
                fill={cursor.stroke}
                stroke="white"
                strokeWidth="1.5"
                d="M4.5 3V17.5L9.2 13L13.8 21L16.8 19.3L12.3 11.5L18.3 11.5L4.5 3Z"
              />
            </svg>
            <span className={`ml-3 mt-1.5 block px-1.5 py-0.5 rounded text-[8px] font-extrabold text-white shadow-md leading-none ${cursor.color}`}>
              {cursor.name}
            </span>
          </div>
        ))}

        {/* Stream Items */}
        {activities.map((act) => {
          const coords = spotlightCoords[act.id] || { x: 0, y: 0 };
          return (
            <div
              key={act.id}
              onMouseMove={(e) => handleSpotlightMouseMove(act.id, e)}
              className="relative bg-white/75 hover:bg-white border border-slate-200/50 hover:border-slate-300 rounded-2xl p-4 overflow-hidden cursor-pointer select-none transition-all duration-300 flex justify-between items-center group shadow-md"
            >
              <div
                className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                  background: `radial-gradient(140px circle at ${coords.x}px ${coords.y}px, rgba(24, 104, 219, 0.08), transparent 75%)`,
                }}
              />

              <div className="flex items-center gap-3.5 relative z-10 text-left min-w-0 flex-1">
                {/* User Avatar */}
                <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${act.avatarColor} text-white flex items-center justify-center font-bold text-[11px] uppercase shadow-sm shrink-0`}>
                  {act.avatarText}
                </div>
                
                <div className="space-y-1 min-w-0 flex-1 pr-4">
                  <div className="text-xs text-slate-700 leading-normal">
                    <span className="font-bold text-slate-800">{act.user}</span>{" "}
                    <span className="text-slate-500">{act.action}</span>{" "}
                    <span className="font-semibold text-[#1868db] bg-[#1868db]/5 px-2 py-0.5 rounded border border-[#1868db]/10 inline-block max-w-full truncate align-middle text-[10.5px]">
                      {act.target}
                    </span>
                  </div>
                  <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider block">{act.time}</span>
                </div>
              </div>

              <span className={`text-[9px] font-bold px-2.5 py-1 rounded-full border ${act.badgeColor} relative z-10 shrink-0 select-none uppercase tracking-wide`}>
                {act.badge}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
