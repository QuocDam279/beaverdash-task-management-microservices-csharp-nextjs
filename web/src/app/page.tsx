import * as React from "react";
import { Metadata } from "next";
import {
  Navbar,
  HeroSection,
  FeaturesGrid,
  AIShowcase,
  PricingGrid,
  FAQAccordion,
  Footer
} from "@/components/LandingPage";

export const metadata: Metadata = {
  title: "BeaverDash - Quản lý công việc thông minh với AI",
  description: "Trực quan hóa bảng Kanban, sơ đồ Gantt và tối ưu hóa tiến độ làm việc đội nhóm tự động nhờ Trợ lý AI.",
};

export default function Home() {
  return (
    <div className="min-h-screen bg-[#FAF9F5] text-[#2b221a] selection:bg-amber-200/50 selection:text-[#5c3a21] font-sans overflow-x-hidden relative">
      
      {/* Background soft warm glowing blur shapes */}
      <div className="absolute top-[-5%] left-[-10%] w-[500px] h-[500px] rounded-full bg-amber-500/5 blur-[150px] pointer-events-none" />
      <div className="absolute top-[40%] right-[-10%] w-[500px] h-[500px] rounded-full bg-orange-500/5 blur-[150px] pointer-events-none" />

      {/* Landing Navigation Header */}
      <Navbar />

      {/* Main Sections Wrapper */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 pt-28 pb-10 space-y-24 sm:space-y-32">
        <HeroSection />
        <FeaturesGrid />
        <AIShowcase />
        <PricingGrid />
        <FAQAccordion />
      </main>

      {/* Footer Info */}
      <Footer />

    </div>
  );
}

