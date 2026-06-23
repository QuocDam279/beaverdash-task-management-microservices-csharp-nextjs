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

  // Auto-scroll to the bottom of the chat viewport when messages load, update, or streaming status changes
  React.useEffect(() => {
    if (!isHistoryLoading) {
      // Use standard requestAnimationFrame or small timeout to ensure layout has updated
      const timer = setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 60);
      return () => clearTimeout(timer);
    }
  }, [messages, isSending, isHistoryLoading]);

  const handleSuggestionClick = (promptText: string) => {
    handleSendMessage(promptText);
  };

  return (
    <div className="flex h-full w-full bg-[#f8fafc] dark:bg-[#161a1d] overflow-hidden select-none">
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
      <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-[#1d2125]">
        {/* Chat Header */}
        <div className="h-13 px-6 border-b border-slate-200/65 dark:border-[#2c3338] bg-white dark:bg-[#1d2125] flex items-center shrink-0">
          <span className="text-xs font-extrabold text-slate-800 dark:text-[#deebff] tracking-tight uppercase truncate">
            {sessions.find((s) => s.id === activeSessionId)?.title || "Trợ lý BeaverDash"}
          </span>
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
          projectId={projectId}
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
