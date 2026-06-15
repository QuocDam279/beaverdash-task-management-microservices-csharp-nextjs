"use client";

import * as React from "react";
import Link from "next/link";

/**
 * @component PricingGrid
 * @description Bảng hiển thị các gói dịch vụ (Free, Pro, Enterprise) của BeaverDash.
 */
export function PricingGrid() {
  const plans = [
    {
      name: "Cá nhân (Free)",
      price: "$0",
      desc: "Trải nghiệm quản lý dự án cơ bản và lập lịch cá nhân.",
      features: [
        "Tạo tối đa 3 dự án",
        "Bảng Kanban & Lịch biểu cơ bản",
        "10 câu lệnh Trợ lý AI/tháng",
        "Lưu trữ tệp tối đa 100MB",
      ],
      cta: "Bắt đầu miễn phí",
      isPopular: false,
    },
    {
      name: "Đội nhóm (Pro)",
      price: "$8",
      desc: "Nâng tầm năng suất làm việc nhóm thời gian thực với AI nâng cao.",
      features: [
        "Không giới hạn số lượng dự án",
        "Đồng bộ thời gian thực SignalR",
        "Không giới hạn câu lệnh Trợ lý AI",
        "Lưu trữ tệp tối đa 10GB/thành viên",
        "Hỗ trợ ưu tiên 24/7",
      ],
      cta: "Thử nghiệm Pro miễn phí",
      isPopular: true,
    },
    {
      name: "Doanh nghiệp",
      price: "Liên hệ",
      desc: "Bảo mật cấp độ cao nhất, tùy biến luồng AI và tích hợp riêng biệt.",
      features: [
        "Mọi tính năng gói Đội nhóm Pro",
        "Máy chủ lưu trữ dữ liệu riêng biệt",
        "Fine-tune AI theo tài liệu nội bộ",
        "Tích hợp SSO / SAML bảo mật",
        "Đội ngũ kỹ thuật hỗ trợ chuyên dụng",
      ],
      cta: "Liên hệ bán hàng",
      isPopular: false,
    },
  ];

  return (
    <section id="pricing" className="space-y-10 py-8 select-none">
      
      {/* Header */}
      <div className="text-center max-w-xl mx-auto space-y-3">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#2b221a]">
          Lựa chọn Gói dịch vụ phù hợp với bạn
        </h2>
        <p className="text-xs text-stone-500 leading-relaxed">
          Đăng ký miễn phí, nâng cấp bất cứ lúc nào để mở khóa các tính năng AI & cộng tác nhóm nâng cao.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto px-4 items-stretch">
        {plans.map((p, idx) => (
          <div
            key={idx}
            className={`bg-white/80 border rounded-2xl p-6 flex flex-col justify-between transition-all duration-300 relative ${
              p.isPopular
                ? "border-amber-700 shadow-[0_15px_40px_-10px_rgba(180,83,9,0.1)] md:scale-105 z-10"
                : "border-stone-200/80 hover:border-stone-300 shadow-xl"
            }`}
          >
            {/* Ambient glow for popular plan */}
            {p.isPopular && (
              <div className="absolute inset-0 -z-10 rounded-2xl bg-amber-500/5 blur-xl pointer-events-none" />
            )}

            {/* Popular Badge */}
            {p.isPopular && (
              <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-widest bg-amber-750 text-white shadow-md">
                Phổ biến nhất
              </span>
            )}

            {/* Title & Price */}
            <div className="space-y-4 text-left">
              <div>
                <h3 className="text-sm font-bold text-stone-800">{p.name}</h3>
                <p className="text-[11px] text-stone-500 mt-1 leading-normal">{p.desc}</p>
              </div>
              <div className="flex items-baseline gap-1 py-2 border-y border-stone-150">
                <span className="text-2xl sm:text-3xl font-extrabold text-[#2b221a]">{p.price}</span>
                {p.price !== "Liên hệ" && <span className="text-[10px] text-stone-400 font-bold">/thành viên/tháng</span>}
              </div>

              {/* Feature list */}
              <ul className="space-y-2.5 pt-2 text-[10.5px] text-stone-600">
                {p.features.map((f, fIdx) => (
                  <li key={fIdx} className="flex items-center gap-2">
                    <span className="text-amber-700 font-extrabold">✓</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* CTA Button */}
            <div className="pt-6">
              <Link
                href="/login"
                className={`w-full block text-center text-xs font-bold py-2.5 rounded-xl transition-all duration-300 active:scale-97 ${
                  p.isPopular
                    ? "bg-gradient-to-r from-amber-700 to-[#78350f] hover:from-amber-600 hover:to-[#5c2d12] text-white shadow-lg shadow-amber-700/10"
                    : "bg-white hover:bg-stone-50 border border-stone-200 text-stone-700 hover:text-[#2b221a]"
                }`}
              >
                {p.cta}
              </Link>
            </div>

          </div>
        ))}
      </div>

    </section>
  );
}
