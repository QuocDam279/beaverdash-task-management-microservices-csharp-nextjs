import { Document, AiChatSession, AiChatMessage } from "@/types/chat";
import { mockUsers } from "./mock-data";

export const mockDocuments: Document[] = [
  {
    id: "doc-1",
    userId: mockUsers[0].id,
    projectId: "p1a2b3c4-d5e6-7f8g-9h0i-j1k2l3m4n5o6",
    sourceType: null,
    fileName: "Yeu_cau_He_thong_Beaverdash_v1.2.pdf",
    mimeType: "application/pdf",
    storageUri: "/docs/srs.pdf",
    fileSize: 2516582, // 2.4 MB
    pageCount: 18,
    checksum: "sha256-a1b2c3d4",
    status: "completed",
    errorMessage: null,
    createdAt: "2026-05-10T08:00:00Z",
    updatedAt: "2026-05-10T08:05:00Z",
  },
  {
    id: "doc-2",
    userId: mockUsers[0].id,
    projectId: "p1a2b3c4-d5e6-7f8g-9h0i-j1k2l3m4n5o6",
    sourceType: null,
    fileName: "Kien_truc_Microservices_Design.docx",
    mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    storageUri: "/docs/architecture.docx",
    fileSize: 1887436, // 1.8 MB
    pageCount: 12,
    checksum: "sha256-b2c3d4e5",
    status: "completed",
    errorMessage: null,
    createdAt: "2026-05-12T09:30:00Z",
    updatedAt: "2026-05-12T09:32:00Z",
  },
  {
    id: "doc-3",
    userId: mockUsers[1].id,
    projectId: "p2b3c4d5-e6f7-8g9h-0i1j-2k3l4m5n6o7p",
    sourceType: null,
    fileName: "Landing_Page_SEO_Plan.xlsx",
    mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    storageUri: "/docs/seo.xlsx",
    fileSize: 348160, // 340 KB
    pageCount: null,
    checksum: "sha256-c3d4e5f6",
    status: "completed",
    errorMessage: null,
    createdAt: "2026-05-14T14:00:00Z",
    updatedAt: "2026-05-14T14:01:00Z",
  },
  {
    id: "doc-4",
    userId: mockUsers[0].id,
    projectId: "p3c4d5e6-f7g8-9h0i-1j2k-3l4m5n6o7p8q",
    sourceType: null,
    fileName: "RAG_Research_Paper_Overview.pdf",
    mimeType: "application/pdf",
    storageUri: "/docs/rag_paper.pdf",
    fileSize: 4404019, // 4.2 MB
    pageCount: 24,
    checksum: "sha256-d4e5f6g7",
    status: "completed",
    errorMessage: null,
    createdAt: "2026-05-18T10:00:00Z",
    updatedAt: "2026-05-18T10:05:00Z",
  },
];

export const mockChatSessions: AiChatSession[] = [
  {
    id: "session-1",
    userId: mockUsers[0].id,
    projectId: "p1a2b3c4-d5e6-7f8g-9h0i-j1k2l3m4n5o6",
    title: "Tìm hiểu kiến trúc Beaverdash",
    createdAt: "2026-05-22T08:00:00Z",
    updatedAt: "2026-05-22T08:30:00Z",
  },
  {
    id: "session-2",
    userId: mockUsers[0].id,
    projectId: "p3c4d5e6-f7g8-9h0i-1j2k-3l4m5n6o7p8q",
    title: "Giải thích cơ chế Hybrid Search RAG",
    createdAt: "2026-05-22T09:00:00Z",
    updatedAt: "2026-05-22T09:15:00Z",
  },
];

export const mockChatMessages: AiChatMessage[] = [
  // Session 1: Beaverdash Architecture
  {
    id: "msg-1-1",
    sessionId: "session-1",
    role: "assistant",
    content: "Xin chào! Tôi là Trợ lý AI Beaver. Tôi có thể đọc các tài liệu đính kèm trong dự án **Beaverdash Task Management** và trả lời câu hỏi liên quan đến kiến trúc microservices hay tài liệu đặc tả của bạn. Hãy gửi câu hỏi nhé!",
    usedDocuments: null,
    toolCalls: null,
    toolResults: null,
    createdAt: "2026-05-22T08:00:00Z",
  },
  {
    id: "msg-1-2",
    sessionId: "session-1",
    role: "user",
    content: "Dự án Beaverdash sử dụng những công nghệ gì và kiến trúc thế nào?",
    usedDocuments: null,
    toolCalls: null,
    toolResults: null,
    createdAt: "2026-05-22T08:05:00Z",
  },
  {
    id: "msg-1-3",
    sessionId: "session-1",
    role: "assistant",
    content: `Dựa trên tài liệu **Kien_truc_Microservices_Design.docx**, dự án **Beaverdash** được thiết kế dưới dạng hệ sinh thái microservices chạy trên nền tảng .NET 8 (C#) cho phần backend và Next.js (TypeScript) cho phần frontend.

Các dịch vụ chính bao gồm:
1. **Identity Service**: Quản lý người dùng, phân quyền JWT.
2. **Project Service**: Quản lý các dự án, bảng Kanban, công việc và công việc con (subtasks).
3. **Document Intelligence Service**: Trích xuất dữ liệu, chunking và embedding tài liệu để phục vụ truy vấn RAG.
4. **Notification Service**: Gửi thông báo real-time qua WebSockets.

Hệ thống sử dụng **PostgreSQL** làm cơ sở dữ liệu chính, **RabbitMQ** để truyền tin nhắn bất đồng bộ giữa các microservices, và **Redis** để lưu cache phiên làm việc.`,
    usedDocuments: [
      {
        documentId: "doc-2",
        fileName: "Kien_truc_Microservices_Design.docx",
        chunkIndex: 1,
        content: "Hệ thống Beaverdash áp dụng kiến trúc Microservices phân tán trên nền tảng C# .NET Core 8. Gồm IdentityService, ProjectService và DocumentIntelligenceService. Giao tiếp qua RabbitMQ Message Broker.",
      },
    ],
    toolCalls: null,
    toolResults: null,
    createdAt: "2026-05-22T08:06:00Z",
  },

  // Session 2: Hybrid Search RAG
  {
    id: "msg-2-1",
    sessionId: "session-2",
    role: "assistant",
    content: "Chào Quốc Đảm! Tôi có thể giúp gì cho bạn về dự án nghiên cứu **Công nghệ RAG & Vector Database**?",
    usedDocuments: null,
    toolCalls: null,
    toolResults: null,
    createdAt: "2026-05-22T09:00:00Z",
  },
  {
    id: "msg-2-2",
    sessionId: "session-2",
    role: "user",
    content: "Cơ chế Hybrid Search hoạt động như thế nào trong RAG?",
    usedDocuments: null,
    toolCalls: null,
    toolResults: null,
    createdAt: "2026-05-22T09:10:00Z",
  },
  {
    id: "msg-2-3",
    sessionId: "session-2",
    role: "assistant",
    content: `Theo tài liệu **RAG_Research_Paper_Overview.pdf**, cơ chế **Hybrid Search** kết hợp giữa hai phương pháp tìm kiếm để tối ưu kết quả truy xuất ngữ cảnh:
1. **Dense Retrieval (Vector Search)**: Sử dụng các mô hình Embedding (như \`text-embedding-3-small\`) để chuyển đổi văn bản thành các vector số thực. Phương pháp này rất mạnh trong việc nắm bắt **ngữ nghĩa** (semantic meaning) và các câu hỏi diễn đạt khác biệt nhưng có cùng ý nghĩa.
2. **Sparse Retrieval (Keyword Search)**: Sử dụng các thuật toán tần suất từ như **BM25**. Phương pháp này cực kỳ hiệu quả khi tìm kiếm các **từ khóa chính xác**, mã hiệu, tên riêng, thuật ngữ kỹ thuật viết tắt.

**Kết hợp kết quả (Reciprocal Rank Fusion - RRF)**:
Sau khi lấy kết quả từ cả Dense và Sparse Search, hệ thống áp dụng công thức RRF để tính toán lại điểm xếp hạng của từng đoạn văn bản, mang lại các đoạn trích chất lượng cao nhất cho Mô hình ngôn ngữ lớn (LLM) trả lời câu hỏi.`,
    usedDocuments: [
      {
        documentId: "doc-4",
        fileName: "RAG_Research_Paper_Overview.pdf",
        chunkIndex: 3,
        content: "Hybrid Search kết hợp thế mạnh của Dense Retrieval (nắm bắt ngữ nghĩa thông qua Cosine Similarity trên Dense Vector) và Sparse Retrieval (tìm từ khóa chính xác bằng thuật toán BM25). Hai danh sách kết quả được xếp hạng lại thông qua RRF (Reciprocal Rank Fusion).",
      },
    ],
    toolCalls: null,
    toolResults: null,
    createdAt: "2026-05-22T09:12:00Z",
  },
];

// Helper to simulate Beaver assistant response
export function generateMockAssistantResponse(prompt: string, projectId: string): {
  content: string;
  usedDocuments: { documentId: string; fileName: string; chunkIndex: number; content: string }[];
} {
  const normalized = prompt.toLowerCase();
  
  if (projectId === "p1a2b3c4-d5e6-7f8g-9h0i-j1k2l3m4n5o6") {
    // Project 1 Beaverdash
    if (normalized.includes("api") || normalized.includes("cổng") || normalized.includes("gateway")) {
      return {
        content: "Trong dự án **Beaverdash**, tất cả các API requests của Client đều đi qua **YARP (Yet Another Reverse Proxy)** đóng vai trò làm API Gateway. Gateway chịu trách nhiệm định tuyến, gỡ lỗi tiêu đề, phân tải và áp dụng Rate Limiting bảo vệ các microservices nội bộ.",
        usedDocuments: [
          {
            documentId: "doc-2",
            fileName: "Kien_truc_Microservices_Design.docx",
            chunkIndex: 5,
            content: "API Gateway sử dụng YARP Proxy của Microsoft để định tuyến các API và tích hợp Rate Limiting.",
          }
        ]
      };
    }
    if (normalized.includes("db") || normalized.includes("database") || normalized.includes("dữ liệu")) {
      return {
        content: "Dự án sử dụng **PostgreSQL** làm Database lưu trữ thông tin thực thể (User, Project, Task, Subtask). Ngoài ra, microservice **DocumentIntelligence** sử dụng phần mở rộng **pgvector** để lưu trữ các vector embedding của các chunks tài liệu phục vụ tìm kiếm ngữ nghĩa.",
        usedDocuments: [
          {
            documentId: "doc-2",
            fileName: "Kien_truc_Microservices_Design.docx",
            chunkIndex: 8,
            content: "PostgreSQL với pgvector được dùng làm vector database lưu trữ embedding phục vụ RAG.",
          }
        ]
      };
    }
    return {
      content: `Cảm ơn bạn đã hỏi về dự án **Beaverdash Task Management**. Tôi đã tìm kiếm trong tài liệu đặc tả của dự án và thấy thông tin liên quan đến câu hỏi của bạn. 
      
Hệ thống Beaverdash hỗ trợ quản lý dự án linh hoạt, phân công thành viên, tạo lịch biểu (Calendar), xem tiến độ Gantt Chart và bình luận thời gian thực. Bạn có muốn tìm hiểu thêm về phân hệ cụ thể nào không (ví dụ: SignalR Notifications,pgvector, RabbitMQ)?`,
      usedDocuments: [
        {
          documentId: "doc-1",
          fileName: "Yeu_cau_He_thong_Beaverdash_v1.2.pdf",
          chunkIndex: 0,
          content: "Đặc tả yêu cầu hệ thống Beaverdash gồm các tính năng chính: Bảng Kanban, Sơ đồ Gantt, Lịch biểu Dự án, Trung tâm thông báo real-time và Trợ lý RAG.",
        }
      ]
    };
  } else if (projectId === "p2b3c4d5-e6f7-8g9h-0i1j-2k3l4m5n6o7p") {
    // Project 2 Landing Page
    if (normalized.includes("seo") || normalized.includes("từ khóa") || normalized.includes("google")) {
      return {
        content: "Dựa trên kế hoạch **Landing_Page_SEO_Plan.xlsx**, chiến dịch SEO tập trung vào nhóm từ khóa chính như: `Task Management System`, `Next.js Kanban Board`, và `Microservice Project App`. Kế hoạch bao gồm tối ưu Meta Tags, cải thiện Core Web Vitals (Next.js SSR) để đạt điểm số tối đa Lighthouse.",
        usedDocuments: [
          {
            documentId: "doc-3",
            fileName: "Landing_Page_SEO_Plan.xlsx",
            chunkIndex: 0,
            content: "Bảng từ khóa SEO trọng điểm gồm: Task Management, Agile Kanban, NextJS App, Microservices CSharp. Target: Top 10 Google Search trong 3 tháng.",
          }
        ]
      };
    }
    return {
      content: "Tôi đã duyệt tài liệu dự án **Landing Page sản phẩm**. Dự án này đang tập trung tối ưu hóa giao diện chuyển đổi người dùng đăng ký sớm và lập kế hoạch SEO tổng thể. Bạn có thể hỏi tôi về các thẻ từ khóa SEO hoặc công nghệ tối ưu Landing Page.",
      usedDocuments: [
        {
          documentId: "doc-3",
          fileName: "Landing_Page_SEO_Plan.xlsx",
          chunkIndex: 1,
          content: "Landing Page sử dụng Next.js App Router, triển khai Vercel, tối ưu hóa CSS Tailwind và hình ảnh qua next/image.",
        }
      ]
    };
  } else {
    // RAG Project 3
    if (normalized.includes("vector") || normalized.includes("database") || normalized.includes("kho")) {
      return {
        content: "Vector Database đóng vai trò lưu trữ các embedding (mảng số thực nhiều chiều). Trong các hệ thống RAG, các ứng dụng thường so sánh Cosine Similarity giữa Vector truy vấn của người dùng với Vector của các chunk tài liệu đã lưu để lấy ra các đoạn văn bản tương đồng nhất.",
        usedDocuments: [
          {
            documentId: "doc-4",
            fileName: "RAG_Research_Paper_Overview.pdf",
            chunkIndex: 7,
            content: "Các Vector Database phổ biến hiện nay gồm pgvector, Pinecone, Qdrant, Milvus. Chúng hỗ trợ tìm kiếm lân cận gần nhất (ANN) bằng các chỉ mục HNSW hoặc IVF-Flat.",
          }
        ]
      };
    }
    return {
      content: "Trợ lý Beaver đã sẵn sàng đồng hành cùng dự án **Nghiên cứu Công nghệ RAG & Vector Database**. Hãy hỏi tôi bất kỳ khái niệm RAG nào như Chunking strategy, Embedding models, Reranking, Hybrid Search hay Evaluation (Ragas, TruLens).",
      usedDocuments: [
        {
          documentId: "doc-4",
          fileName: "RAG_Research_Paper_Overview.pdf",
          chunkIndex: 2,
          content: "RAG (Retrieval-Augmented Generation) tăng cường khả năng của LLM bằng cách truy xuất các thông tin cập nhật hoặc tài liệu nội bộ từ cơ sở dữ liệu tri thức bên ngoài.",
        }
      ]
    };
  }
}
