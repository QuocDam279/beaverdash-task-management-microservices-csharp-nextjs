import * as React from "react";
import { api } from "@/lib/api";

export interface ChatMessage {
  id: string;
  role: string;
  content: string | null;
  tool_calls: Array<{ name: string; args: any }> | null;
  tool_results: Array<{ name: string; result: string }> | null;
  created_at: string;
}

export interface ChatSession {
  id: string;
  title: string | null;
  created_at: string;
  updated_at: string;
}

export function isSessionActive(messages: ChatMessage[]): boolean {
  if (messages.length === 0) return false;
  const lastMsg = messages[messages.length - 1];
  
  if (lastMsg.role === "user") return true;
  if (lastMsg.role === "tool") return true;
  if (lastMsg.role === "assistant") {
    if (lastMsg.tool_calls && lastMsg.tool_calls.length > 0) {
      return true;
    }
    if (lastMsg.content) {
      if (
        lastMsg.content.includes("Hệ thống đang bận hoặc quá tải") ||
        lastMsg.content.includes("Quá trình có thể lâu hơn chút do quá nhiều yêu cầu")
      ) {
        return true;
      }
    }
  }
  return false;
}

export function useAIAssistant(projectId: string) {
  const [sessions, setSessions] = React.useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = React.useState<string | null>(null);
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [inputText, setInputText] = React.useState("");
  const [isSessionsLoading, setIsSessionsLoading] = React.useState(true);
  const [isHistoryLoading, setIsHistoryLoading] = React.useState(false);
  const [isSending, setIsSending] = React.useState(false);
  const [countdown, setCountdown] = React.useState<number>(0);
  const [error, setError] = React.useState<string | null>(null);

  const lastProcessedMsgId = React.useRef<string | null>(null);

  const fetchMessages = React.useCallback(async (sessionId: string, silent = false) => {
    try {
      if (!silent) {
        setIsHistoryLoading(true);
      }
      const data = await api.get(`/v1/chat/sessions/${sessionId}/messages`);
      if (data) {
        const msgs = data.messages || [];
        setMessages(msgs);
        
        // Auto-detect if session has an active background task
        const active = isSessionActive(msgs);
        setIsSending(active);
      }
    } catch (err) {
      console.error("Failed to load message history:", err);
    } finally {
      if (!silent) {
        setIsHistoryLoading(false);
      }
    }
  }, []);

  const fetchSessions = React.useCallback(async () => {
    try {
      setIsSessionsLoading(true);
      setError(null);
      const data = await api.get(`/v1/chat/sessions?project_id=${projectId}`);
      const sessionsList = data || [];
      setSessions(sessionsList);
      
      setActiveSessionId((prev) => {
        if (!prev && sessionsList.length > 0) {
          return sessionsList[0].id;
        }
        return prev;
      });
    } catch (err: any) {
      console.error("Failed to load chat sessions:", err);
      setError(err.message || "Không thể tải danh sách phiên trò chuyện.");
    } finally {
      setIsSessionsLoading(false);
    }
  }, [projectId]);

  React.useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  React.useEffect(() => {
    if (activeSessionId) {
      fetchMessages(activeSessionId);
    } else {
      setMessages([]);
      setIsSending(false);
    }
  }, [activeSessionId, fetchMessages]);

  React.useEffect(() => {
    let intervalId: any = null;
    if (isSending && activeSessionId) {
      intervalId = setInterval(() => {
        fetchMessages(activeSessionId, true);
      }, 2500);
    }
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isSending, activeSessionId, fetchMessages]);

  React.useEffect(() => {
    if (messages.length === 0) return;
    const lastMsg = messages[messages.length - 1];
    if (
      lastMsg.role === "assistant" &&
      lastMsg.content?.includes("thử lại sau 1 phút") &&
      lastProcessedMsgId.current !== lastMsg.id
    ) {
      lastProcessedMsgId.current = lastMsg.id;
      setCountdown(60);
      setIsSending(false);
    }
  }, [messages]);

  React.useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const handleCreateSession = async () => {
    try {
      const timeStr = new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
      const title = `Hội thoại ${timeStr}`;
      const newSession = await api.post("/v1/chat/sessions", {
        project_id: projectId,
        title,
      });
      if (newSession) {
        setSessions((prev) => [newSession, ...prev]);
        setActiveSessionId(newSession.id);
      }
    } catch (err: any) {
      console.error("Failed to create chat session:", err);
    }
  };

  const handleSendMessage = async (
    text: string,
    attachment?: { fileName: string; fileSize: string; content: string } | null
  ) => {
    if ((!text.trim() && !attachment) || isSending) return;
    let sessionId = activeSessionId;

    try {
      setIsSending(true);
      setInputText("");

      if (!sessionId) {
        const timeStr = new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
        const newSession = await api.post("/v1/chat/sessions", {
          project_id: projectId,
          title: `Hội thoại ${timeStr}`,
        });
        if (newSession) {
          setSessions((prev) => [newSession, ...prev]);
          setActiveSessionId(newSession.id);
          sessionId = newSession.id;
        } else {
          throw new Error("Không thể tạo phiên hội thoại tự động.");
        }
      }

      if (!sessionId) return;

      let payloadContent = text;
      if (attachment) {
        payloadContent = JSON.stringify({
          attachment,
          text,
        });
      }

      const userMsg: ChatMessage = {
        id: Math.random().toString(),
        role: "user",
        content: payloadContent,
        tool_calls: null,
        tool_results: null,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, userMsg]);

      // Call API post which triggers background execution and returns immediately
      const aiReply = await api.post(`/v1/chat/sessions/${sessionId}/messages`, {
        content: payloadContent,
      });

      if (aiReply) {
        // Poll for changes immediately
        await fetchMessages(sessionId, true);
      }

      setSessions((prev) =>
        prev.map((s) => (s.id === sessionId ? { ...s, updated_at: new Date().toISOString() } : s))
      );
    } catch (err: any) {
      console.error("Error sending message:", err);
      if (sessionId) {
        try {
          await fetchMessages(sessionId, true);
        } catch (_) {
          // ignore
        }
      }
      
      const active = isSessionActive(messages);
      if (!active) {
        const errMsg: ChatMessage = {
          id: Math.random().toString(),
          role: "assistant",
          content: "❌ Không thể kết nối với máy chủ AI. Vui lòng kiểm tra kết nối mạng và thử lại.",
          tool_calls: null,
          tool_results: null,
          created_at: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, errMsg]);
        setIsSending(false);
      }
    }
  };

  const handleRenameSession = async (sessionId: string, newTitle: string) => {
    if (!newTitle.trim()) return;
    try {
      const updated = await api.patch(`/v1/chat/sessions/${sessionId}`, {
        title: newTitle,
      });
      if (updated) {
        setSessions((prev) =>
          prev.map((s) => (s.id === sessionId ? { ...s, title: newTitle } : s))
        );
      }
    } catch (err) {
      console.error("Failed to rename chat session:", err);
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    try {
      await api.delete(`/v1/chat/sessions/${sessionId}`);
      setSessions((prev) => {
        const filtered = prev.filter((s) => s.id !== sessionId);
        if (activeSessionId === sessionId) {
          if (filtered.length > 0) {
            setActiveSessionId(filtered[0].id);
          } else {
            setActiveSessionId(null);
            setMessages([]);
          }
        }
        return filtered;
      });
    } catch (err) {
      console.error("Failed to delete chat session:", err);
    }
  };

  const handleStopAssistant = async () => {
    if (!activeSessionId) return;
    try {
      setIsSending(false);
      setCountdown(0);
      const res = await api.post(`/v1/chat/sessions/${activeSessionId}/stop`);
      if (res) {
        await fetchMessages(activeSessionId, true);
      }
    } catch (err) {
      console.error("Failed to stop assistant:", err);
    }
  };

  return {
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
    error,
    handleCreateSession,
    handleSendMessage,
    handleRenameSession,
    handleDeleteSession,
    handleStopAssistant,
  };
}
