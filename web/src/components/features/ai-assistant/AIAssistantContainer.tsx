"use client";

import * as React from "react";
import { useAIAssistant } from "@/hooks/useAIAssistant";
import { AIAssistantSidebar } from "./AIAssistantSidebar";
import { AIAssistantChatViewport } from "./AIAssistantChatViewport";
import { AIAssistantInput } from "./AIAssistantInput";

interface ContainerProps {
  projectId: string;
}

export function AIAssistantContainer({ projectId }: ContainerProps) {
  const {
    sessions,
    activeSessionId,
    setActiveSessionId,
    messages,
    inputText,
    setInputText,
    isSessionsLoading,
    isHistoryLoading,
    isSending,
    countdown,
    handleCreateSession,
    handleSendMessage,
    handleRenameSession,
    handleDeleteSession,
    handleStopAssistant,
  } = useAIAssistant(projectId);

  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const handleSuggestionClick = (promptText: string) => {
    handleSendMessage(promptText);
  };

  return (
    <div className="flex h-full w-full bg-[#f8fafc] overflow-hidden select-none">
      {/* 1. LEFT PANEL: AI Chat Sessions */}
      <AIAssistantSidebar
        sessions={sessions}
        activeSessionId={activeSessionId}
        setActiveSessionId={setActiveSessionId}
        isSessionsLoading={isSessionsLoading}
        onCreateSession={handleCreateSession}
        onRenameSession={handleRenameSession}
        onDeleteSession={handleDeleteSession}
      />

      {/* 2. RIGHT PANEL: Chat Viewport & Input */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#f8fafc]">
        {/* Chat Header */}
        <div className="h-11 px-4 border-b border-slate-200 bg-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700">Trợ lý lập kế hoạch AI</span>
            <span className="text-[9px] bg-blue-50 text-[#1868db] font-bold px-1.5 py-0.2 rounded border border-blue-100 flex items-center gap-0.5 animate-pulse">
              <span>Model: Gemini 3.1</span>
            </span>
          </div>
          <span className="text-[10px] text-slate-400 font-semibold italic">Phân rã dự án thành các Tasks & Subtasks</span>
        </div>

        {/* Message Container Viewport */}
        <AIAssistantChatViewport
          messages={messages}
          isHistoryLoading={isHistoryLoading}
          isSending={isSending}
          onSuggestionClick={handleSuggestionClick}
          messagesEndRef={messagesEndRef}
        />

        {/* Input Bar Section */}
        <AIAssistantInput
          inputText={inputText}
          setInputText={setInputText}
          isSending={isSending}
          countdown={countdown}
          onSubmit={handleSendMessage}
          onStop={handleStopAssistant}
          hasActiveSession={!!activeSessionId}
        />
      </div>
    </div>
  );
}
