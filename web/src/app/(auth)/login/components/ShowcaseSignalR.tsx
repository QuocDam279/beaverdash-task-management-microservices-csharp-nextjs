"use client";

import * as React from "react";

interface Activity {
  id: number;
  type: "notification" | "chat";
  user: string;
  avatarText: string;
  avatarColor: string;
  content: string;
  time: string;
  badge: string;
  badgeColor: string;
}

export function ShowcaseSignalR() {
  const [activities, setActivities] = React.useState<Activity[]>([
    {
      id: 1,
      type: "chat",
      user: "Linh Chi",
      avatarText: "LC",
      avatarColor: "from-emerald-500 to-teal-400",
      content: "Tôi vừa tải lên bản phác thảo giao diện trang chủ trong mục Tài liệu nhé!",
      time: "Vừa xong",
      badge: "Trò chuyện",
      badgeColor: "bg-blue-50/80 text-blue-600 border-blue-100",
    },
    {
      id: 2,
      type: "notification",
      user: "Hải Nam",
      avatarText: "HN",
      avatarColor: "from-amber-500 to-orange-400",
      content: "đã thêm Minh Anh vào nhóm làm việc của dự án.",
      time: "3 giây trước",
      badge: "Thông báo",
      badgeColor: "bg-purple-50/80 text-purple-600 border-purple-100",
    },
    {
      id: 3,
      type: "chat",
      user: "Minh Anh",
      avatarText: "MA",
      avatarColor: "from-pink-500 to-rose-400",
      content: "Chào cả nhà! Để tôi thiết kế sơ đồ dữ liệu trước nhé.",
      time: "1 phút trước",
      badge: "Trò chuyện",
      badgeColor: "bg-blue-50/80 text-blue-600 border-blue-100",
    },
    {
      id: 4,
      type: "notification",
      user: "Linh Chi",
      avatarText: "LC",
      avatarColor: "from-emerald-500 to-teal-400",
      content: "đã bình luận trong công việc 'Thiết kế giao diện đăng nhập'.",
      time: "5 phút trước",
      badge: "Thông báo",
      badgeColor: "bg-purple-50/80 text-purple-600 border-purple-100",
    },
  ]);
  const [spotlightCoords, setSpotlightCoords] = React.useState<{ [key: number]: { x: number; y: number } }>({});

  React.useEffect(() => {
    const pool = [
      {
        type: "notification",
        user: "Trợ lý AI",
        avatarText: "AI",
        avatarColor: "from-purple-500 to-indigo-500",
        content: "đã tự động gán nhiệm vụ 'Vẽ khung giao diện trang chủ' cho Linh Chi.",
        badge: "Thông báo",
        badgeColor: "bg-purple-50/80 text-purple-600 border-purple-100",
      },
      {
        type: "chat",
        user: "Hải Nam",
        avatarText: "HN",
        avatarColor: "from-amber-500 to-orange-400",
        content: "Ok Linh Chi, để tôi xem bản vẽ rồi duyệt sơ đồ dữ liệu cho Minh Anh.",
        badge: "Trò chuyện",
        badgeColor: "bg-blue-50/80 text-blue-600 border-blue-100",
      },
      {
        type: "notification",
        user: "Minh Anh",
        avatarText: "MA",
        avatarColor: "from-pink-500 to-rose-400",
        content: "đã hoàn thành nhiệm vụ 'Thiết kế sơ đồ dữ liệu'.",
        badge: "Thông báo",
        badgeColor: "bg-purple-50/80 text-purple-600 border-purple-100",
      },
      {
        type: "chat",
        user: "Linh Chi",
        avatarText: "LC",
        avatarColor: "from-emerald-500 to-teal-400",
        content: "Tuyệt quá! Mọi người làm việc nhanh thật sự, thông báo nhảy liên tục luôn.",
        badge: "Trò chuyện",
        badgeColor: "bg-blue-50/80 text-blue-600 border-blue-100",
      },
    ];
    let poolIndex = 0;
    const interval = setInterval(() => {
      setActivities((prev) => {
        const newItem = {
          id: Date.now(),
          type: pool[poolIndex].type as "chat" | "notification",
          user: pool[poolIndex].user,
          avatarText: pool[poolIndex].avatarText,
          avatarColor: pool[poolIndex].avatarColor,
          content: pool[poolIndex].content,
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
        <span className="text-[10px] font-bold tracking-widest text-[#1868db] uppercase">Cập nhật tức thì</span>
        <h2 className="text-xl font-bold text-slate-800">Thông báo & Trò chuyện tức thời</h2>
        <p className="text-xs text-slate-500 leading-relaxed font-normal">
          Hệ thống tự động đồng bộ và gửi thông báo tức thời, cùng tin nhắn trò chuyện nhóm ngay khi có bất kỳ thay đổi nào từ thành viên khác mà không cần tải lại trang.
        </p>
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wide">Kết nối thời gian thực: Hoạt động</span>
        </div>
      </div>

      {/* Scrolling Log Stream (Left 3 columns) */}
      <div className="xl:col-span-3 space-y-3.5 w-full relative min-h-[350px] overflow-hidden p-2 rounded-2xl bg-slate-200/20 border border-slate-200/10">
        
        {/* Stream Items */}
        {activities.map((act) => {
          const coords = spotlightCoords[act.id] || { x: 0, y: 0 };
          const isChat = act.type === "chat";
          return (
            <div
              key={act.id}
              onMouseMove={(e) => handleSpotlightMouseMove(act.id, e)}
              className={`relative border rounded-2xl p-4 overflow-hidden cursor-pointer select-none transition-all duration-300 flex justify-between items-center group shadow-md ${
                isChat 
                  ? "bg-blue-50/25 border-blue-100 hover:bg-blue-50/40" 
                  : "bg-white/75 border-slate-200/50 hover:bg-white hover:border-slate-300"
              }`}
            >
              <div
                className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                  background: isChat
                    ? `radial-gradient(140px circle at ${coords.x}px ${coords.y}px, rgba(24, 104, 219, 0.05), transparent 75%)`
                    : `radial-gradient(140px circle at ${coords.x}px ${coords.y}px, rgba(168, 85, 247, 0.05), transparent 75%)`,
                }}
              />

              <div className="flex items-start gap-3.5 relative z-10 text-left min-w-0 flex-1">
                {/* User Avatar */}
                <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${act.avatarColor} text-white flex items-center justify-center font-bold text-[11px] uppercase shadow-sm shrink-0 mt-0.5`}>
                  {act.avatarText}
                </div>
                
                <div className="space-y-1 min-w-0 flex-1 pr-4">
                  <div className="text-xs text-slate-700 leading-normal">
                    <span className="font-bold text-slate-800">{act.user}</span>{" "}
                    {isChat ? (
                      <span className="text-slate-650 bg-white/80 border border-slate-100 rounded-lg px-2.5 py-1.5 mt-1 block shadow-2xs font-normal max-w-sm italic">
                        {`"${act.content}"`}
                      </span>
                    ) : (
                      <>
                        <span className="text-slate-500">{act.content}</span>
                      </>
                    )}
                  </div>
                  <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider block pt-0.5">{act.time}</span>
                </div>
              </div>

              <span className={`text-[9px] font-bold px-2.5 py-1 rounded-full border ${act.badgeColor} relative z-10 shrink-0 select-none uppercase tracking-wide self-start mt-1`}>
                {act.badge}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
