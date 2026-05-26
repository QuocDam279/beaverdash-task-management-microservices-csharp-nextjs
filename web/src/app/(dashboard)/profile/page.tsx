"use client";

import * as React from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { Avatar } from "@/components/ui/Avatar";
import { api } from "@/lib/api";
import { useAlertConfirm } from "@/components/providers/AlertConfirmProvider";

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const { alert } = useAlertConfirm();

  const [displayName, setDisplayName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [successMessage, setSuccessMessage] = React.useState("");

  React.useEffect(() => {
    if (user) {
      setDisplayName(user.displayName);
      setEmail(user.email);
    }
  }, [user]);

  React.useEffect(() => {
    if (!user?.email) return;

    const syncProfile = async () => {
      try {
        const freshUser = await api.get(`/users?email=${user.email}`);
        if (freshUser) {
          const hasMissingFields = !user.createdAt;
          const isDifferent = freshUser.displayName !== user.displayName || freshUser.avatar !== user.avatar;
          
          if (hasMissingFields || isDifferent) {
            updateUser({
              ...user,
              ...freshUser,
            });
          }
        }
      } catch (err) {
        console.error("Failed to sync profile:", err);
      }
    };

    syncProfile();
  }, [user?.email]);

  if (!user) {
    return (
      <div className="flex min-h-[400px] w-full items-center justify-center bg-white p-6 rounded-lg border border-slate-200">
        <div className="flex flex-col items-center gap-2">
          <svg className="animate-spin h-6 w-6 text-[#1868db]" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="text-xs text-slate-500 font-semibold">Đang tải thông tin...</span>
        </div>
      </div>
    );
  }

  const currentUser = user;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim() || !email.trim()) return;

    try {
      await api.put(`/users/${currentUser.id}`, {
        email: email.trim(),
        displayName: displayName.trim(),
        avatar: currentUser.avatar
      });

      const updatedUser = {
        ...currentUser,
        displayName: displayName.trim(),
        email: email.trim(),
        avatar: currentUser.avatar,
        updatedAt: new Date().toISOString(),
      };

      updateUser(updatedUser);

      // Trigger update event for components like TopHeader
      window.dispatchEvent(new Event("user-profile-updated"));

      setSuccessMessage("Cập nhật thông tin tài khoản thành công!");
      setTimeout(() => {
        setSuccessMessage("");
      }, 4000);
    } catch (err: any) {
      console.error("Failed to update profile:", err);
      alert(err.message || "Đã xảy ra lỗi khi cập nhật thông tin tài khoản.", "Thất bại", "danger");
    }
  };

  const handleCancel = () => {
    if (currentUser) {
      setDisplayName(currentUser.displayName);
      setEmail(currentUser.email);
    }
    setSuccessMessage("");
  };

  // Format date helper
  const formattedJoinDate = (() => {
    if (!currentUser.createdAt) return "Chưa rõ";
    const date = new Date(currentUser.createdAt);
    if (isNaN(date.getTime()) || date.getFullYear() <= 1970) {
      return "Chưa rõ";
    }
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  })();

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Title Header */}
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-xl font-bold text-[#292a2e]">Trang cá nhân</h1>
        <p className="text-xs text-slate-500 mt-1">
          Quản lý thông tin tài khoản Beaverdash của bạn.
        </p>
      </div>

      {successMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-md flex items-center gap-2 animate-in fade-in duration-200">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-emerald-600">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          {successMessage}
        </div>
      )}

      {/* Profile Banner Card Header */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xs">
        {/* Banner with gradient */}
        <div className="h-32 bg-gradient-to-r from-[#1868db] to-[#0747a6] relative" />
        
        {/* User Info Row */}
        <div className="px-6 pb-6 relative flex flex-col sm:flex-row sm:items-end gap-4 -mt-14 sm:-mt-10">
          <div className="relative shrink-0">
            <Avatar
              src={currentUser.avatar}
              alt={displayName || "User"}
              className="h-24 w-24 rounded-full border-4 border-white bg-slate-50 object-cover shadow-sm"
            />
          </div>
          <div className="flex-1 min-w-0 sm:pb-1">
            <h2 className="text-base font-bold text-[#292a2e] leading-tight truncate">
              {displayName || "Người dùng"}
            </h2>
            <p className="text-xs text-slate-500 font-semibold truncate mt-1">
              {email}
            </p>
          </div>
        </div>
      </div>

      {/* Details & Form Grid */}
      <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Summary Card */}
        <div className="md:col-span-1 border border-slate-200 rounded-lg p-5 bg-white space-y-4 flex flex-col justify-start">
          <h3 className="text-xs font-bold text-[#292a2e] uppercase tracking-wider">Tóm tắt tài khoản</h3>
          
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
              <span className="text-lg">📅</span>
              <div>
                <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Ngày tham gia</p>
                <p className="text-xs font-bold text-slate-700 mt-0.5">{formattedJoinDate}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Profile Form Details */}
        <div className="md:col-span-2 border border-slate-200 rounded-lg p-5 bg-white space-y-4">
          <h3 className="text-sm font-bold text-[#292a2e] border-b border-slate-100 pb-2">
            Thông tin tài khoản
          </h3>

          <div className="space-y-3.5">
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1.5">
                Họ và tên
              </label>
              <input
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-[4px] bg-white text-[#292a2e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1868db] focus-visible:border-transparent transition-all placeholder:text-slate-400"
                placeholder="Nhập họ và tên..."
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1.5">
                Địa chỉ Email
              </label>
              <input
                type="email"
                disabled
                value={email}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-[4px] bg-slate-50 text-slate-400 cursor-not-allowed focus-visible:outline-none placeholder:text-slate-400"
                placeholder="Nhập địa chỉ email..."
              />
            </div>
          </div>

          {/* Form Actions footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-[4px] cursor-pointer transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-[#1868db] hover:bg-[#0052cc] active:bg-[#0747a6] rounded-[4px] cursor-pointer shadow-xs transition-colors"
            >
              Lưu thay đổi
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
