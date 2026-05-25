import { User } from "./auth";
import { Project } from "./project";

/**
 * Document processing status
 */
export type DocumentStatus = "pending" | "processing" | "completed" | "failed";

/**
 * Document metadata model mapped from DocumentIntelligenceService Document
 */
export interface Document {
  id: string; // UUID
  userId: string; // UUID
  user?: User | null;
  projectId: string; // UUID
  project?: Project | null;
  sourceType: string | null;
  fileName: string;
  mimeType: string | null;
  storageUri: string;
  fileSize: number | null;
  pageCount: number | null;
  checksum: string | null;
  status: DocumentStatus;
  errorMessage: string | null;
  createdAt: string; // ISO Date String
  updatedAt: string; // ISO Date String
}

/**
 * Document Chunk model mapped from DocumentIntelligenceService DocumentChunk
 */
export interface DocumentChunk {
  id: string; // UUID
  projectId: string; // UUID
  documentId: string; // UUID
  document?: Document | null;
  chunkIndex: number;
  content: string;
  tokenCount: number;
  embedding?: number[] | null; // Vector embedding
  sparseEmbedding?: Record<string, number> | null;
  metadata?: Record<string, unknown> | null;
  createdAt: string; // ISO Date String
  updatedAt: string; // ISO Date String
}

/**
 * AI Chat Session model mapped from DocumentIntelligenceService AiChatSession
 */
export interface AiChatSession {
  id: string; // UUID
  userId: string; // UUID
  user?: User | null;
  projectId: string; // UUID
  project?: Project | null;
  title: string | null;
  createdAt: string; // ISO Date String
  updatedAt: string; // ISO Date String
}

/**
 * AI Chat Message role types
 */
export type ChatMessageRole = "user" | "assistant" | "system" | "tool";

/**
 * Details of documents used by the AI to answer a prompt (RAG context)
 */
export interface UsedDocumentInfo {
  documentId: string;
  fileName: string;
  chunkIndex: number;
  content: string;
  score?: number;
}

/**
 * OpenAI-style Tool Call definition
 */
export interface ToolCall {
  id: string;
  type: "function";
  function: {
    name: string;
    arguments: string; // stringified JSON
  };
}

/**
 * Tool call execution result payload
 */
export interface ToolResult {
  toolCallId: string;
  output: string;
}

/**
 * AI Chat Message model mapped from DocumentIntelligenceService AiChatMessage
 */
export interface AiChatMessage {
  id: string; // UUID
  sessionId: string; // UUID
  role: ChatMessageRole;
  content: string | null;
  usedDocuments: UsedDocumentInfo[] | null;
  toolCalls: ToolCall[] | null;
  toolResults: ToolResult[] | null;
  createdAt: string; // ISO Date String
}

/**
 * Request payload for creating a chat session
 */
export interface ChatSessionCreate {
  projectId: string;
  title?: string;
}

/**
 * Request payload for sending a chat message
 */
export interface ChatMessageRequest {
  content: string;
}
