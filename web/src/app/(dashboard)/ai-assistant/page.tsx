"use client";

/**
 * @page Beaver Assistant (AI Assistant)
 * @description Trang điều phối giao diện Trợ lý Beaver AI: Quản lý dự án, tài liệu RAG, phiên chat và trò chuyện streaming.
 */

import * as React from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { api } from "@/lib/api";
import {
  mockDocuments,
  mockChatSessions,
  mockChatMessages,
  generateMockAssistantResponse,
} from "@/lib/mock-chat-data";
import { ChatHistory, DocumentManager, ChatWindow } from "@/components/features/ai-assistant";
import { Document, AiChatSession, AiChatMessage } from "@/types/chat";

export default function AiAssistantPage() {
  const { user } = useAuth();
  const currentUser = user || { id: "unknown", displayName: "User" };
  const [projects, setProjects] = React.useState<any[]>([]);
  const [selectedProjId, setSelectedProjId] = React.useState<string>("");

  // States
  const [documents, setDocuments] = React.useState<Document[]>(mockDocuments);
  const [sessions, setSessions] = React.useState<AiChatSession[]>(mockChatSessions);
  const [messages, setMessages] = React.useState<AiChatMessage[]>(mockChatMessages);
  const [activeSessionId, setActiveSessionId] = React.useState<string | null>(null);
  const [isThinking, setIsThinking] = React.useState(false);
  const [showHistory, setShowHistory] = React.useState(false);
  const [showDocs, setShowDocs] = React.useState(false);

  // Fetch real projects
  React.useEffect(() => {
    api.get("/projects")
      .then((data: any) => {
        setProjects(data || []);
        if (data && data.length > 0) {
          setSelectedProjId(data[0].id);
        }
      })
      .catch((err) => console.error("Error fetching projects for AI assistant:", err));
  }, []);

  // Filter lists by selected project
  const filteredDocs = documents.filter((d) => d.projectId === selectedProjId);
  const filteredSessions = sessions.filter((s) => s.projectId === selectedProjId);
  const activeSessionMessages = messages.filter((m) => m.sessionId === activeSessionId);

  // Set default active session when project changes
  React.useEffect(() => {
    if (!selectedProjId) return;
    const projectSessions = sessions.filter((s) => s.projectId === selectedProjId);
    if (projectSessions.length > 0) {
      setActiveSessionId(projectSessions[0].id);
    } else {
      setActiveSessionId(null);
    }
  }, [selectedProjId, sessions]);

  // Session Handlers
  const handleCreateSession = () => {
    const newSessionId = `session-${Date.now()}`;
    const newSession: AiChatSession = {
      id: newSessionId,
      userId: currentUser.id,
      projectId: selectedProjId,
      title: "Hội thoại mới",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const welcomeMsg: AiChatMessage = {
      id: `msg-${Date.now()}`,
      sessionId: newSessionId,
      role: "assistant",
      content: `Xin chào! Tôi là Trợ lý AI Beaver. Tôi đã sẵn sàng hỗ trợ bạn phân tích các tài liệu trong dự án "${
        projects.find((p) => p.id === selectedProjId)?.name || ""
      }". Hãy đặt câu hỏi cho tôi nhé!`,
      usedDocuments: null,
      toolCalls: null,
      toolResults: null,
      createdAt: new Date().toISOString(),
    };

    setSessions((prev) => [newSession, ...prev]);
    setMessages((prev) => [...prev, welcomeMsg]);
    setActiveSessionId(newSessionId);
  };

  const handleDeleteSession = (id: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== id));
    setMessages((prev) => prev.filter((m) => m.sessionId !== id));
  };

  // Document Handlers
  const handleUploadDocument = (fileName: string, fileSize: number, mimeType: string) => {
    const newDocId = `doc-${Date.now()}`;
    const newDoc: Document = {
      id: newDocId,
      userId: currentUser.id,
      projectId: selectedProjId,
      sourceType: null,
      fileName,
      mimeType,
      storageUri: `/docs/${fileName}`,
      fileSize,
      pageCount: Math.floor(Math.random() * 15) + 2,
      checksum: `sha256-${Math.random().toString(36).substring(3, 11)}`,
      status: "processing",
      errorMessage: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setDocuments((prev) => [newDoc, ...prev]);

    // Simulate completion
    setTimeout(() => {
      setDocuments((prev) =>
        prev.map((d) => (d.id === newDocId ? { ...d, status: "completed" } : d))
      );
    }, 3000);
  };

  const handleDeleteDocument = (id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
  };

  // Send Message & Response Simulation
  const handleSendMessage = (content: string) => {
    if (!activeSessionId) return;

    const userMsg: AiChatMessage = {
      id: `msg-${Date.now()}`,
      sessionId: activeSessionId,
      role: "user",
      content,
      usedDocuments: null,
      toolCalls: null,
      toolResults: null,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);

    // Update Session title if it was default
    setSessions((prev) =>
      prev.map((s) =>
        s.id === activeSessionId && s.title === "Hội thoại mới"
          ? { ...s, title: content.length > 25 ? `${content.substring(0, 25)}...` : content }
          : s
      )
    );

    setIsThinking(true);

    setTimeout(() => {
      const response = generateMockAssistantResponse(content, selectedProjId);
      setIsThinking(false);

      const assistantMsgId = `msg-${Date.now() + 1}`;
      const emptyAssistantMsg: AiChatMessage = {
        id: assistantMsgId,
        sessionId: activeSessionId,
        role: "assistant",
        content: "",
        usedDocuments: response.usedDocuments,
        toolCalls: null,
        toolResults: null,
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, emptyAssistantMsg]);

      // Stream character by character
      let index = 0;
      const fullText = response.content;
      const interval = setInterval(() => {
        if (index <= fullText.length) {
          setMessages((prev) =>
            prev.map((m) => (m.id === assistantMsgId ? { ...m, content: fullText.substring(0, index) } : m))
          );
          index += 3; // stream 3 chars at a time for smooth speed
        } else {
          clearInterval(interval);
        }
      }, 20);
    }, 1500);
  };

  return (
    <div className="h-[calc(100vh-3.5rem)] overflow-hidden flex flex-col bg-white">
      {/* Top Banner Select Project */}
      <div className="px-6 py-3.5 border-b border-slate-200 bg-white flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-xl shrink-0">🦫</span>
          <div className="min-w-0">
            <h1 className="text-sm font-bold text-slate-800 leading-tight">Trợ lý Beaver</h1>
            <p className="text-[10px] text-slate-400 font-semibold mt-0.5 whitespace-nowrap md:whitespace-normal truncate md:overflow-visible">
              Hỏi đáp RAG ngữ cảnh dự án kết hợp tài liệu đính kèm
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Toggle History (mobile only) */}
          <button
            onClick={() => {
              setShowHistory(!showHistory);
              if (showDocs) setShowDocs(false);
            }}
            className={`md:hidden px-2.5 py-1.5 rounded border border-slate-200 text-xs font-semibold hover:bg-slate-100 transition-colors cursor-pointer flex items-center gap-1 ${
              showHistory ? "bg-[#1868db]/10 text-[#1868db] border-[#1868db]/20" : "bg-slate-50 text-slate-650"
            }`}
            title="Lịch sử trò chuyện"
          >
            <span>💬</span>
            <span className="text-[10px]">Hội thoại</span>
          </button>

          {/* Toggle Documents (tablet & mobile) */}
          <button
            onClick={() => {
              setShowDocs(!showDocs);
              if (showHistory) setShowHistory(false);
            }}
            className={`lg:hidden px-2.5 py-1.5 rounded border border-slate-200 text-xs font-semibold hover:bg-slate-100 transition-colors cursor-pointer flex items-center gap-1 ${
              showDocs ? "bg-[#1868db]/10 text-[#1868db] border-[#1868db]/20" : "bg-slate-50 text-slate-650"
            }`}
            title="Kho tri thức"
          >
            <span>📁</span>
            <span className="text-[10px]">Tài liệu</span>
          </button>

          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Chọn dự án:</label>
          <select
            value={selectedProjId}
            onChange={(e) => setSelectedProjId(e.target.value)}
            className="text-xs font-semibold px-2.5 py-1.5 border border-slate-200 rounded bg-slate-50 hover:bg-slate-100 cursor-pointer focus:outline-none focus:border-[#1868db] w-full md:w-64 max-w-[280px] truncate"
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Feature Layout */}
      <div className="flex-1 flex min-h-0 overflow-hidden relative">
        {/* Chat History Panel */}
        <div className={`
          absolute md:static inset-y-0 left-0 z-30 w-64 bg-[#fafbfc] border-r border-slate-200 transition-transform duration-200 shrink-0
          ${showHistory ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}>
          <ChatHistory
            sessions={filteredSessions}
            activeSessionId={activeSessionId}
            onSelectSession={(id) => {
              setActiveSessionId(id);
              setShowHistory(false);
            }}
            onCreateSession={() => {
              handleCreateSession();
              setShowHistory(false);
            }}
            onDeleteSession={handleDeleteSession}
          />
        </div>

        {/* Chat Window Panel */}
        <ChatWindow
          messages={activeSessionMessages}
          isThinking={isThinking}
          onSendMessage={handleSendMessage}
        />

        {/* Document Manager Panel */}
        <div className={`
          absolute lg:static inset-y-0 right-0 z-30 w-80 bg-[#fafbfc] border-l border-slate-200 transition-transform duration-200 shrink-0
          ${showDocs ? "translate-x-0" : "translate-x-full lg:translate-x-0"}
        `}>
          <DocumentManager
            documents={filteredDocs}
            onUploadDocument={handleUploadDocument}
            onDeleteDocument={handleDeleteDocument}
          />
        </div>

        {/* Backdrop for mobile overlays */}
        {(showHistory || showDocs) && (
          <div
            onClick={() => {
              setShowHistory(false);
              setShowDocs(false);
            }}
            className="absolute inset-0 bg-slate-900/15 backdrop-blur-xs z-20 lg:hidden"
          />
        )}
      </div>
    </div>
  );
}
