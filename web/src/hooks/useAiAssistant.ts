import * as React from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { api } from "@/lib/api";
import { Document, AiChatSession, AiChatMessage } from "@/types/chat";

// Mapping helpers (snake_case from python backend to camelCase in typescript frontend)
const mapDocument = (d: any): Document => ({
  id: d.id,
  userId: d.user_id,
  projectId: d.project_id,
  sourceType: d.source_type,
  fileName: d.file_name,
  mimeType: d.mime_type,
  storageUri: d.storage_uri || "",
  fileSize: d.file_size,
  pageCount: d.page_count,
  checksum: d.checksum,
  status: d.status,
  errorMessage: d.error_message,
  createdAt: d.created_at,
  updatedAt: d.updated_at || d.created_at,
});

const mapSession = (s: any): AiChatSession => ({
  id: s.id,
  userId: s.user_id,
  projectId: s.project_id,
  title: s.title,
  createdAt: s.created_at,
  updatedAt: s.updated_at,
});

const mapMessage = (m: any): AiChatMessage => ({
  id: m.id,
  sessionId: m.session_id,
  role: m.role,
  content: m.content,
  usedDocuments: (m.used_documents || []).map((doc: any) => ({
    documentId: doc.document_id,
    fileName: doc.file_name,
    chunkIndex: doc.chunk_index,
    content: doc.content || "",
    score: doc.similarity_score,
  })),
  toolCalls: m.tool_calls,
  toolResults: m.tool_results,
  createdAt: m.created_at,
});

export function useAiAssistant() {
  const { user } = useAuth();
  const currentUser = user || { id: "unknown", displayName: "User" };

  // Core lists
  const [projects, setProjects] = React.useState<any[]>([]);
  const [selectedProjId, setSelectedProjId] = React.useState<string>("");
  const [documents, setDocuments] = React.useState<Document[]>([]);
  const [sessions, setSessions] = React.useState<AiChatSession[]>([]);
  const [messages, setMessages] = React.useState<AiChatMessage[]>([]);
  
  // Navigation states
  const [activeSessionId, setActiveSessionId] = React.useState<string | null>(null);
  const [isThinking, setIsThinking] = React.useState(false);
  const [showHistory, setShowHistory] = React.useState(false);
  const [showDocs, setShowDocs] = React.useState(false);

  // 1. Fetch projects on mount
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

  // 2. Fetch documents and sessions when project changes
  React.useEffect(() => {
    if (!selectedProjId) return;

    // Fetch documents
    api.get(`/v1/documents?project_id=${selectedProjId}`)
      .then((res: any) => {
        setDocuments((res.documents || []).map(mapDocument));
      })
      .catch((err) => console.error("Error fetching documents:", err));

    // Fetch sessions
    api.get(`/v1/chat/sessions?project_id=${selectedProjId}`)
      .then((res: any) => {
        const mapped = (res || []).map(mapSession);
        setSessions(mapped);
        if (mapped.length > 0) {
          setActiveSessionId(mapped[0].id);
        } else {
          setActiveSessionId(null);
        }
      })
      .catch((err) => console.error("Error fetching sessions:", err));
  }, [selectedProjId]);

  // 3. Fetch messages when active session changes
  React.useEffect(() => {
    if (!activeSessionId) {
      setMessages([]);
      return;
    }

    api.get(`/v1/chat/sessions/${activeSessionId}/messages`)
      .then((res: any) => {
        setMessages((res || []).map(mapMessage));
      })
      .catch((err) => console.error("Error fetching messages for session:", err));
  }, [activeSessionId]);

  // Create new session
  const handleCreateSession = async () => {
    if (!selectedProjId) return;
    try {
      const res = await api.post("/v1/chat/sessions", {
        project_id: selectedProjId,
        title: "Cuộc trò chuyện mới",
      });
      const newSession = mapSession(res);
      setSessions((prev) => [newSession, ...prev]);
      setActiveSessionId(newSession.id);
      
      // Default welcome message
      const welcomeMsg: AiChatMessage = {
        id: `welcome-${Date.now()}`,
        sessionId: newSession.id,
        role: "assistant",
        content: `Xin chào! Tôi là Trợ lý AI Beaver. Tôi đã sẵn sàng hỗ trợ bạn phân tích tài liệu trong dự án. Hãy đặt câu hỏi cho tôi!`,
        usedDocuments: null,
        toolCalls: null,
        toolResults: null,
        createdAt: new Date().toISOString(),
      };
      setMessages([welcomeMsg]);
    } catch (err) {
      console.error("Error creating session:", err);
    }
  };

  // Delete session
  const handleDeleteSession = async (id: string) => {
    try {
      await api.delete(`/v1/chat/sessions/${id}`);
      setSessions((prev) => prev.filter((s) => s.id !== id));
      setMessages((prev) => prev.filter((m) => m.sessionId !== id));
      if (activeSessionId === id) {
        setActiveSessionId(null);
      }
    } catch (err) {
      console.error("Error deleting session:", err);
    }
  };

  // Upload document
  const handleUploadDocument = async (file: File) => {
    if (!selectedProjId) return;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("project_id", selectedProjId);

    // Call real backend upload
    const res = await api.post("/v1/documents", formData);
    const newDoc = mapDocument(res);
    setDocuments((prev) => [newDoc, ...prev]);

    // Poll for status completion
    const pollInterval = setInterval(() => {
      api.get(`/v1/documents?project_id=${selectedProjId}`)
        .then((resList: any) => {
          const list = (resList.documents || []).map(mapDocument);
          const updated = list.find((d: any) => d.id === newDoc.id);
          if (updated) {
            setDocuments((prev) =>
              prev.map((d) => (d.id === newDoc.id ? updated : d))
            );
            if (updated.status === "completed" || updated.status === "failed") {
              clearInterval(pollInterval);
            }
          }
        })
        .catch((err) => {
          console.error("Error polling document status:", err);
          clearInterval(pollInterval);
        });
    }, 2000);
  };

  // Delete document
  const handleDeleteDocument = async (id: string) => {
    try {
      await api.delete(`/v1/documents/${id}`);
      setDocuments((prev) => prev.filter((d) => d.id !== id));
    } catch (err) {
      console.error("Error deleting document:", err);
    }
  };

  // Send chat message
  const handleSendMessage = async (content: string) => {
    if (!activeSessionId) return;

    const userMsg: AiChatMessage = {
      id: `user-temp-${Date.now()}`,
      sessionId: activeSessionId,
      role: "user",
      content,
      usedDocuments: null,
      toolCalls: null,
      toolResults: null,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsThinking(true);

    try {
      const res = await api.post(`/v1/chat/sessions/${activeSessionId}/messages`, { content });
      setIsThinking(false);

      const assistantMsg = mapMessage(res);
      const assistantMsgId = assistantMsg.id;
      const fullText = assistantMsg.content || "";

      // Append assistant message with empty content first, then stream characters
      const emptyMsg: AiChatMessage = {
        ...assistantMsg,
        content: "",
      };
      setMessages((prev) => [...prev, emptyMsg]);

      let index = 0;
      const interval = setInterval(() => {
        if (index <= fullText.length) {
          setMessages((prev) =>
            prev.map((m) => (m.id === assistantMsgId ? { ...m, content: fullText.substring(0, index) } : m))
          );
          index += 3;
        } else {
          clearInterval(interval);
        }
      }, 15);

      // Re-fetch sessions to update titles (if modified by LLM)
      api.get(`/v1/chat/sessions?project_id=${selectedProjId}`)
        .then((resList: any) => setSessions((resList || []).map(mapSession)))
        .catch((err) => console.error("Error updating sessions title:", err));

    } catch (err: any) {
      setIsThinking(false);
      const errorMsg: AiChatMessage = {
        id: `error-${Date.now()}`,
        sessionId: activeSessionId,
        role: "assistant",
        content: `Không thể kết nối dịch vụ AI: ${err.message || err}`,
        usedDocuments: null,
        toolCalls: null,
        toolResults: null,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    }
  };

  // Download document file
  const handleDownloadDocument = async (id: string, fileName: string) => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("beaverdash_token") : null;
      const response = await fetch(`http://localhost:5000/api/v1/documents/${id}/download`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!response.ok) {
        throw new Error(`Download failed: ${response.statusText}`);
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Lỗi khi tải tài liệu:", err);
      alert("Không thể tải xuống tài liệu này.");
    }
  };

  // Update session title
  const handleUpdateSessionTitle = async (id: string, title: string) => {
    try {
      const res = await api.patch(`/v1/chat/sessions/${id}`, { title });
      const updatedSession = mapSession(res);
      setSessions((prev) =>
        prev.map((s) => (s.id === id ? updatedSession : s))
      );
    } catch (err) {
      console.error("Error updating session title:", err);
    }
  };

  return {
    currentUser,
    projects,
    selectedProjId,
    setSelectedProjId,
    documents,
    sessions,
    messages,
    activeSessionId,
    setActiveSessionId,
    isThinking,
    showHistory,
    setShowHistory,
    showDocs,
    setShowDocs,
    handleCreateSession,
    handleDeleteSession,
    handleUploadDocument,
    handleDeleteDocument,
    handleSendMessage,
    handleDownloadDocument,
    handleUpdateSessionTitle,
  };
}
