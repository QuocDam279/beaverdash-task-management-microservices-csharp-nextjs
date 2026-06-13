"use client";

import * as React from "react";
import { EmojiPicker } from "./EmojiPicker";
import { ChatMessageList } from "./ChatMessageList";
import { ChatSidebar } from "./ChatSidebar";
import { useChat } from "@/hooks/useChat";

interface ChatContainerProps {
  roomId: string;
  roomType: "project" | "team";
  roomName: string;
}

export function ChatContainer({ roomId, roomType, roomName }: ChatContainerProps) {
  const {
    messages,
    inputText,
    setInputText,
    isConnected,
    isLoading,
    error,
    toastMessage,
    showEmojiPicker,
    setShowEmojiPicker,
    isSendingFile,
    isDragging,
    chatLimit,
    isLoadingOlder,
    isSidebarOpen,
    setIsSidebarOpen,
    sidebarTab,
    setSidebarTab,
    messagesContainerRef,
    messagesEndRef,
    fileInputRef,
    handleScroll,
    handleSend,
    handleDeleteMessage,
    handleKeyDown,
    handlePaste,
    handleFileChange,
    handleAttachmentClick,
    handleDragEnter,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleEmojiSelect,
    fetchHistory,
    currentUser,
    sharedMedia,
    sharedFiles,
    sharedLinks,
  } = useChat(roomId, roomType);

  return (
    <div 
      className="flex flex-row h-full w-full bg-white dark:bg-[#1d2125] select-none relative overflow-hidden"
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Left Column: Chat Area */}
      <div className="flex flex-col flex-1 h-full min-w-0 overflow-hidden relative">
        
        {/* Drag and Drop Overlay */}
        {isDragging && (
          <div className="absolute inset-0 z-50 bg-blue-500/10 dark:bg-blue-500/5 backdrop-blur-xs flex items-center justify-center p-6 transition-all duration-200 pointer-events-none">
            <div className="w-full h-full border-2 border-dashed border-blue-500 rounded-2xl flex flex-col items-center justify-center bg-white/95 dark:bg-[#1d2125]/95 shadow-xl animate-in zoom-in-95 duration-150">
              <div className="w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-500 flex items-center justify-center mb-4 shadow-sm animate-bounce">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
              </div>
              <p className="text-sm font-bold text-slate-800 dark:text-[#deebff]">
                Thả tệp vào đây để gửi
              </p>
              <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 mt-1">
                Hỗ trợ hình ảnh, tài liệu (tối đa 10MB)
              </p>
            </div>
          </div>
        )}

        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="*/*"
        />

        {/* Toast Notification */}
        {toastMessage && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 bg-slate-900/90 dark:bg-white/95 text-white dark:text-slate-900 text-xs font-bold px-4 py-2 rounded-full shadow-lg transition-all duration-300">
            {toastMessage}
          </div>
        )}

        {/* Header Info */}
        <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0 bg-white dark:bg-[#1d2125] z-10 shadow-3xs">
          <div className="flex items-center gap-3 min-w-0">
            {/* Group Chat Icon */}
            <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500 flex items-center justify-center shrink-0">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-bold text-slate-800 dark:text-[#deebff] truncate">
                {roomName}
              </h2>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={`h-1.5 w-1.5 rounded-full ${isConnected ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`} />
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">
                  {isConnected ? "Kênh trực tuyến" : "Mất kết nối"}
                </span>
              </div>
            </div>
          </div>

          {/* Action Icons */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              title="Thông tin trò chuyện & Tệp đính kèm"
              className={`p-2 rounded-full transition-all cursor-pointer ${
                isSidebarOpen 
                  ? "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 scale-105" 
                  : "text-blue-500 hover:bg-slate-100 dark:hover:bg-slate-850"
              }`}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
            </button>
          </div>
        </div>

        {/* Main Chat Viewport */}
        <div
          ref={messagesContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto py-4 custom-chat-scrollbar bg-slate-50/30 dark:bg-[#1e2227]/20 flex flex-col min-h-0"
        >
          {/* Scroll up loading indicator */}
          {isLoadingOlder && (
            <div className="flex items-center justify-center py-2 shrink-0 select-none">
              <div className="animate-spin rounded-full h-4.5 w-4.5 border-2 border-slate-200 dark:border-slate-700 border-t-blue-500 dark:border-t-blue-400" />
            </div>
          )}

          {isLoading ? (
            <div className="h-full flex items-center justify-center select-none flex-1">
              <div className="flex flex-col items-center gap-2">
                <svg className="animate-spin h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span className="text-[10px] text-slate-400 font-bold">Đang tải lịch sử...</span>
              </div>
            </div>
          ) : error ? (
            <div className="h-full flex items-center justify-center p-6 text-center select-none flex-1">
              <div className="text-slate-500 text-xs space-y-2">
                <span>⚠️</span>
                <p className="font-semibold text-slate-700 dark:text-slate-350">{error}</p>
                <button
                  onClick={() => fetchHistory(chatLimit, false)}
                  className="text-xs text-blue-500 hover:underline font-bold cursor-pointer"
                >
                  Thử lại
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 min-h-0">
              <ChatMessageList
                messages={messages}
                currentUser={currentUser}
                onDeleteMessage={handleDeleteMessage}
              />
            </div>
          )}

          {/* Loading Indicator for File Uploading */}
          {isSendingFile && (
            <div className="flex justify-end w-full px-4 mt-2 select-none animate-pulse shrink-0">
              <div className="max-w-[70%] bg-blue-50/50 dark:bg-blue-950/25 border border-blue-100 dark:border-blue-950/40 rounded-2xl px-4 py-2 flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400">
                <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Đang tải tệp lên...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Typing Footer */}
        <div className="px-5 py-4 border-t border-slate-100 dark:border-slate-800 shrink-0 bg-white dark:bg-[#1d2125]">
          <div className="flex items-center gap-2.5">
            {/* Actions panel */}
            <div className="flex items-center shrink-0">
              <button
                onClick={handleAttachmentClick}
                title="Đính kèm ảnh/tệp"
                className="p-1.5 rounded-full text-blue-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                </svg>
              </button>
            </div>

            {/* Text Input area - Pill design */}
            <form onSubmit={handleSend} className="flex-1 flex items-center gap-2.5 bg-slate-100 dark:bg-slate-800/80 rounded-full pl-4 pr-2 py-1.5 transition-all focus-within:ring-2 focus-within:ring-blue-500/10 focus-within:bg-slate-100/70 dark:focus-within:bg-slate-800">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                onPaste={handlePaste}
                placeholder={`Nhập tin nhắn (hỗ trợ dán ảnh)...`}
                rows={1}
                maxLength={1000}
                className="flex-1 resize-none border-0 bg-transparent p-0 text-xs font-semibold text-slate-800 dark:text-[#deebff] placeholder-slate-400 focus:ring-0 focus:outline-none min-h-[18px] max-h-[100px] scrollbar-none custom-chat-scrollbar py-0.5"
              />
              
              {/* Emoji Button */}
              <button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className={`p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer shrink-0 ${
                  showEmojiPicker ? "bg-slate-200 dark:bg-slate-700 text-blue-600" : "text-blue-500"
                }`}
                title="Chọn emoji"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                  <line x1="9" y1="9" x2="9.01" y2="9" />
                  <line x1="15" y1="9" x2="15.01" y2="9" />
                </svg>
              </button>

              {/* Send Button */}
              <button
                type="submit"
                disabled={!inputText.trim() || !isConnected}
                className={`p-1.5 rounded-full flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                  inputText.trim() && isConnected
                    ? "bg-blue-500 text-white hover:bg-blue-600 shadow-md scale-105 active:scale-95"
                    : "bg-slate-200 dark:bg-slate-700/50 text-slate-400 dark:text-slate-600 cursor-not-allowed"
                }`}
                title="Gửi tin nhắn"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={inputText.trim() && isConnected ? "translate-x-[0.5px]" : ""}>
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </form>
          </div>
        </div>
        
      </div>

      {/* Right Column: Shared Media/Files Sidebar */}
      <ChatSidebar
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        sidebarTab={sidebarTab}
        setSidebarTab={setSidebarTab}
        sharedMedia={sharedMedia}
        sharedFiles={sharedFiles}
        sharedLinks={sharedLinks}
      />

      {showEmojiPicker && (
        <EmojiPicker
          onSelect={handleEmojiSelect}
          onClose={() => setShowEmojiPicker(false)}
        />
      )}
    </div>
  );
}
