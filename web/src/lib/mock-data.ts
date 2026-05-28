import { User } from "@/types/auth";
import { Project } from "@/types/project";
import { BoardColumn, TaskItem, SubTask, Comment, Attachment, Notification } from "@/types/task";
import { Team, TeamMember } from "@/types/team";

// ==========================================
// 1. MOCK USERS (Danh sách người dùng giả lập)
// ==========================================
export const mockUsers: User[] = [
  {
    id: "u1a2b3c4-d5e6-7f8g-9h0i-j1k2l3m4n5o6",
    email: "quocdam@beaverdash.com",
    displayName: "Quốc Đảm",
    avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=QuocDam",
    createdAt: "2026-05-20T08:00:00Z",
    updatedAt: "2026-05-21T09:00:00Z"
  },
  {
    id: "u2b3c4d5-e6f7-8g9h-0i1j-2k3l4m5n6o7p",
    email: "alex.smith@beaverdash.com",
    displayName: "Alex Smith",
    avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Alex",
    createdAt: "2026-05-20T09:30:00Z",
    updatedAt: "2026-05-20T09:30:00Z"
  },
  {
    id: "u3c4d5e6-f7g8-9h0i-1j2k-3l4m5n6o7p8q",
    email: "taylor.wong@beaverdash.com",
    displayName: "Taylor Wong",
    avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Taylor",
    createdAt: "2026-05-21T02:15:00Z",
    updatedAt: "2026-05-21T02:15:00Z"
  }
];

// ==========================================
// 1.5. MOCK TEAMS (Danh sách đội nhóm giả lập)
// ==========================================
export const mockTeams: Team[] = [
  {
    id: "t1a2b3c4-d5e6-7f8g-9h0i-j1k2l3m4n5o6",
    name: "Đội Phát triển Beaverdash",
    description: "Nhóm chịu trách nhiệm thiết kế, xây dựng và phát triển hệ thống quản lý công việc Beaverdash.",
    ownerUserId: mockUsers[0].id,
    createdAt: "2026-05-20T08:00:00Z",
    updatedAt: "2026-05-21T09:00:00Z"
  },
  {
    id: "t2b3c4d5-e6f7-8g9h-0i1j-2k3l4m5n6o7p",
    name: "Ban Quản lý Tài chính",
    description: "Nhóm giám sát ngân sách và lập báo cáo tài chính doanh nghiệp đa quốc gia.",
    ownerUserId: mockUsers[0].id,
    createdAt: "2026-05-20T10:00:00Z",
    updatedAt: "2026-05-21T07:30:00Z"
  }
];

export const mockTeamMembers: TeamMember[] = [
  {
    teamId: "t1a2b3c4-d5e6-7f8g-9h0i-j1k2l3m4n5o6",
    userId: mockUsers[0].id, // Quốc Đảm
    role: "Owner",
    joinedAt: "2026-05-20T08:00:00Z"
  },
  {
    teamId: "t1a2b3c4-d5e6-7f8g-9h0i-j1k2l3m4n5o6",
    userId: mockUsers[1].id, // Alex Smith
    role: "Member",
    joinedAt: "2026-05-20T09:30:00Z"
  },
  {
    teamId: "t1a2b3c4-d5e6-7f8g-9h0i-j1k2l3m4n5o6",
    userId: mockUsers[2].id, // Taylor Wong
    role: "Member",
    joinedAt: "2026-05-21T02:15:00Z"
  },
  {
    teamId: "t2b3c4d5-e6f7-8g9h-0i1j-2k3l4m5n6o7p",
    userId: mockUsers[0].id, // Quốc Đảm
    role: "Owner",
    joinedAt: "2026-05-20T10:00:00Z"
  },
  {
    teamId: "t2b3c4d5-e6f7-8g9h-0i1j-2k3l4m5n6o7p",
    userId: mockUsers[2].id, // Taylor Wong
    role: "Member",
    joinedAt: "2026-05-21T03:00:00Z"
  }
];

// ==========================================
// 2. MOCK PROJECTS (Danh sách dự án giả lập)
// ==========================================
export const mockProjects: Project[] = [
  {
    id: "p1a2b3c4-d5e6-7f8g-9h0i-j1k2l3m4n5o6",
    teamId: "t1a2b3c4-d5e6-7f8g-9h0i-j1k2l3m4n5o6",
    team: mockTeams[0],
    name: "Beaverdash Task Management",
    description: "Hệ thống quản lý công việc và bảng Kanban cộng tác nhóm, tích hợp microservices backend C# .NET và AI trợ lý ảo.",
    status: "Đang thực hiện",
    progress: 0,
    startDate: "2026-05-01T00:00:00Z",
    dueDate: "2026-08-31T23:59:59Z",
    isPublic: false,
    shareToken: null,
    createdByUserId: mockUsers[0].id,
    createdAt: "2026-05-01T08:00:00Z",
    updatedAt: "2026-05-21T10:00:00Z"
  },
  {
    id: "p2b3c4d5-e6f7-8g9h-0i1j-2k3l4m5n6o7p",
    teamId: "t1a2b3c4-d5e6-7f8g-9h0i-j1k2l3m4n5o6",
    team: mockTeams[0],
    name: "Thiết kế Landing Page sản phẩm",
    description: "Xây dựng trang giới thiệu sản phẩm Beaverdash, thu hút đăng ký trải nghiệm sớm và tối ưu hóa SEO.",
    status: "Đã hoàn thành",
    progress: 0,
    startDate: "2026-04-10T00:00:00Z",
    dueDate: "2026-05-15T18:00:00Z",
    isPublic: true,
    shareToken: "landing-page-token-9988",
    createdByUserId: mockUsers[1].id,
    createdAt: "2026-04-10T09:00:00Z",
    updatedAt: "2026-05-15T18:30:00Z"
  },
  {
    id: "p3c4d5e6-f7g8-9h0i-1j2k-3l4m5n6o7p8q",
    teamId: null,
    team: null,
    name: "Nghiên cứu Công nghệ RAG & Vector Database",
    description: "Tìm hiểu các kỹ thuật chunking tài liệu văn bản, tối ưu hóa mô hình LLM embedding và tích hợp pgvector vào PostgreSQL.",
    status: "Đã hoàn thành",
    progress: 0,
    startDate: "2026-02-01T00:00:00Z",
    dueDate: "2026-03-31T23:59:59Z",
    isPublic: false,
    shareToken: null,
    createdByUserId: mockUsers[0].id,
    createdAt: "2026-02-01T08:00:00Z",
    updatedAt: "2026-03-31T23:59:59Z"
  },
  {
    id: "p4d5e6f7-g8h9-0i1j-2k3l-4m5n6o7p8q9r",
    teamId: "t2b3c4d5-e6f7-8g9h-0i1j-2k3l4m5n6o7p",
    team: mockTeams[1],
    name: "Hệ thống Quản lý và Tự động hóa quy trình phân tích báo cáo tài chính doanh nghiệp đa quốc gia tích hợp các module trí tuệ nhân tạo và xử lý ngôn ngữ tự nhiên nâng cao nhằm tối ưu hóa hiệu quả hoạt động",
    description: "Dự án quy mô lớn kéo dài nhiều năm nhằm chuyển đổi toàn bộ quy trình kế toán, kiểm toán thủ công lỗi thời bằng giải pháp đám mây hiện đại. Hệ thống tích hợp các agent AI thông minh tự động đọc hiểu các file PDF báo cáo tài chính dài hàng ngàn trang, phân tích đối chiếu số liệu tài chính thời gian thực, lập bảng biểu xu hướng thị trường toàn cầu và tự động phát hiện các chỉ số rủi ro bất thường gửi cảnh báo đến ban giám đốc.",
    status: "Chưa bắt đầu",
    progress: 0,
    startDate: "2026-06-01T00:00:00Z",
    dueDate: "2027-12-31T23:59:59Z",
    isPublic: false,
    shareToken: null,
    createdByUserId: mockUsers[0].id,
    createdAt: "2026-05-20T10:00:00Z",
    updatedAt: "2026-05-21T07:30:00Z"
  }
];

// ==========================================
// 3. MOCK KANBAN DATA (Bảng công việc dự án 1)
// ==========================================
export const mockBoardColumns: BoardColumn[] = [
  {
    id: "col-todo",
    projectId: mockProjects[0].id,
    name: "Cần làm (To Do)",
    position: 0,
    wipLimit: 10,
    isDone: false,
    createdAt: "2026-05-01T08:05:00Z",
    updatedAt: "2026-05-01T08:05:00Z"
  },
  {
    id: "col-in-progress",
    projectId: mockProjects[0].id,
    name: "Đang làm (In Progress)",
    position: 1,
    wipLimit: 5,
    isDone: false,
    createdAt: "2026-05-01T08:05:00Z",
    updatedAt: "2026-05-01T08:05:00Z"
  },
  {
    id: "col-in-review",
    projectId: mockProjects[0].id,
    name: "Đang duyệt (In Review)",
    position: 2,
    wipLimit: 3,
    isDone: false,
    createdAt: "2026-05-01T08:05:00Z",
    updatedAt: "2026-05-01T08:05:00Z"
  },
  {
    id: "col-done",
    projectId: mockProjects[0].id,
    name: "Hoàn thành (Done)",
    position: 3,
    wipLimit: null,
    isDone: true,
    createdAt: "2026-05-01T08:05:00Z",
    updatedAt: "2026-05-01T08:05:00Z"
  }
];

// MOCK COMMENTS & ATTACHMENTS (Dùng lồng ghép cho TaskItems)
const mockCommentsForTask3: Comment[] = [
  {
    id: "c1-task3",
    userId: mockUsers[0].id, // Quốc Đảm
    user: mockUsers[0],
    subTaskId: "sub-task3-3", // CORS Subtask
    content: "Đang gặp lỗi chứng chỉ SSL khi YARP gateway chuyển tiếp yêu cầu đến IdentityService (cổng 5001). Tôi đính kèm file log chi tiết ở bên dưới.",
    createdAt: "2026-05-21T03:45:00Z",
    updatedAt: "2026-05-21T03:45:00Z",
    attachments: [
      {
        id: "att1-c1",
        commentId: "c1-task3",
        fileName: "ssl_connection_error.log",
        fileUrl: "https://example.com/files/ssl_connection_error.log",
        fileType: "text/plain",
        fileSizeBytes: 24500,
        createdAt: "2026-05-21T03:44:00Z"
      }
    ]
  },
  {
    id: "c2-task3",
    userId: mockUsers[1].id, // Alex Smith
    user: mockUsers[1],
    subTaskId: "sub-task3-3",
    content: "Hãy thử tắt xác minh chứng chỉ SSL HTTPS ở môi trường local trong file Program.cs của ApiGateway: set `DangerousAcceptAnyServerCertificateValidator` thành true xem.",
    createdAt: "2026-05-21T04:10:00Z",
    updatedAt: "2026-05-21T04:10:00Z",
    attachments: []
  }
];

export const mockTaskItems: TaskItem[] = [
  // Cột To Do
  {
    id: "task-1",
    boardColumnId: "col-todo",
    assigneeUserId: mockUsers[1].id, // Alex Smith
    assigneeUser: mockUsers[1],
    title: "Thiết kế UI Dashboard quản trị dự án",
    description: "Xây dựng các màn hình mockup Figma cho bảng điều khiển trung tâm (Dashboard) bao gồm biểu đồ tiến độ công việc, hoạt động gần đây của thành viên và phân bổ nguồn lực.",
    priority: "Medium",
    startDate: "2026-05-22T08:00:00Z",
    dueDate: "2026-05-30T17:00:00Z",
    sortOrder: 1.0,
    createdByUserId: mockUsers[0].id,
    createdByUser: mockUsers[0],
    assignedAt: "2026-05-21T05:00:00Z",
    completedAt: null,
    deletedAt: null,
    createdAt: "2026-05-21T05:00:00Z",
    updatedAt: "2026-05-21T05:00:00Z",
    subTasks: [
      {
        id: "sub-task1-1",
        taskId: "task-1",
        assigneeUserId: mockUsers[1].id,
        assigneeUser: mockUsers[1],
        title: "Vẽ phác thảo Wireframe các khối thông tin",
        isCompleted: true,
        dueDate: "2026-05-24T17:00:00Z",
        sortOrder: 0,
        createdAt: "2026-05-21T05:00:00Z",
        updatedAt: "2026-05-22T17:00:00Z",
        deletedAt: null
      },
      {
        id: "sub-task1-2",
        taskId: "task-1",
        assigneeUserId: mockUsers[1].id,
        assigneeUser: mockUsers[1],
        title: "Thiết kế độ nét cao (Hi-fi) cho giao diện sáng/tối trên Figma",
        isCompleted: false,
        dueDate: "2026-05-29T17:00:00Z",
        sortOrder: 1,
        createdAt: "2026-05-21T05:00:00Z",
        updatedAt: "2026-05-21T05:00:00Z",
        deletedAt: null
      }
    ]
  },
  {
    id: "task-2",
    boardColumnId: "col-todo",
    assigneeUserId: mockUsers[0].id, // Quốc Đảm
    assigneeUser: mockUsers[0],
    title: "Cấu hình Docker Compose cho các dịch vụ cơ sở hạ tầng",
    description: "Thiết lập cấu hình file docker-compose.yml để chạy PostgreSQL database (bao gồm khởi tạo 3 database riêng lẻ) và RabbitMQ Message Broker phục vụ cho truyền thông điệp bất đồng bộ.",
    priority: "High",
    startDate: "2026-05-21T09:00:00Z",
    dueDate: "2026-05-24T18:00:00Z",
    sortOrder: 2.0,
    createdByUserId: mockUsers[0].id,
    createdByUser: mockUsers[0],
    assignedAt: "2026-05-21T09:10:00Z",
    completedAt: null,
    deletedAt: null,
    createdAt: "2026-05-21T09:05:00Z",
    updatedAt: "2026-05-21T09:10:00Z",
    subTasks: []
  },

  // Cột In Progress
  {
    id: "task-3",
    boardColumnId: "col-in-progress",
    assigneeUserId: mockUsers[0].id, // Quốc Đảm
    assigneeUser: mockUsers[0],
    title: "Tích hợp API Gateway sử dụng YARP .NET",
    description: "Cấu hình dự án ApiGateway làm cổng ngõ trung tâm. Sử dụng thư viện YARP để chuyển hướng yêu cầu HTTP đến các service chạy nội bộ phía sau như Identity và Project Management.",
    priority: "Critical",
    startDate: "2026-05-18T08:00:00Z",
    dueDate: "2026-05-23T17:00:00Z",
    sortOrder: 1.0,
    createdByUserId: mockUsers[0].id,
    createdByUser: mockUsers[0],
    assignedAt: "2026-05-18T08:30:00Z",
    completedAt: null,
    deletedAt: null,
    createdAt: "2026-05-18T08:00:00Z",
    updatedAt: "2026-05-21T04:10:00Z",
    subTasks: [
      {
        id: "sub-task3-1",
        taskId: "task-3",
        assigneeUserId: mockUsers[0].id,
        assigneeUser: mockUsers[0],
        title: "Cài đặt gói YARP.ReverseProxy NuGet",
        isCompleted: true,
        dueDate: "2026-05-18T12:00:00Z",
        sortOrder: 0,
        createdAt: "2026-05-18T08:00:00Z",
        updatedAt: "2026-05-18T11:45:00Z",
        deletedAt: null
      },
      {
        id: "sub-task3-2",
        taskId: "task-3",
        assigneeUserId: mockUsers[0].id,
        assigneeUser: mockUsers[0],
        title: "Khai báo định tuyến Route & Cluster trong appsettings.Development.json",
        isCompleted: true,
        dueDate: "2026-05-19T17:00:00Z",
        sortOrder: 1,
        createdAt: "2026-05-18T08:00:00Z",
        updatedAt: "2026-05-19T16:30:00Z",
        deletedAt: null
      },
      {
        id: "sub-task3-3",
        taskId: "task-3",
        assigneeUserId: mockUsers[0].id,
        assigneeUser: mockUsers[0],
        title: "Xử lý cấu hình Cross-Origin Resource Sharing (CORS) cho phép client Next.js truy cập",
        isCompleted: false,
        dueDate: "2026-05-22T17:00:00Z",
        sortOrder: 2,
        createdAt: "2026-05-18T08:00:00Z",
        updatedAt: "2026-05-20T08:00:00Z",
        deletedAt: null,
        comments: mockCommentsForTask3
      }
    ]
  },

  // Cột In Review
  {
    id: "task-4",
    boardColumnId: "col-in-review",
    assigneeUserId: mockUsers[2].id, // Taylor Wong
    assigneeUser: mockUsers[2],
    title: "Xây dựng Identity Service và xác thực Google OAuth",
    description: "Thiết kế các API đăng ký, đăng nhập và tích hợp Google OAuth nhận ID Token, xác minh thông tin và trả về JWT cho phía client Next.js quản lý phiên đăng nhập.",
    priority: "High",
    startDate: "2026-05-12T08:00:00Z",
    dueDate: "2026-05-22T17:00:00Z",
    sortOrder: 1.0,
    createdByUserId: mockUsers[0].id,
    createdByUser: mockUsers[0],
    assignedAt: "2026-05-12T09:00:00Z",
    completedAt: null,
    deletedAt: null,
    createdAt: "2026-05-12T08:00:00Z",
    updatedAt: "2026-05-21T06:00:00Z",
    subTasks: [
      {
        id: "sub-task4-1",
        taskId: "task-4",
        assigneeUserId: mockUsers[2].id,
        assigneeUser: mockUsers[2],
        title: "Tạo Entity User và thiết lập migrations cơ sở dữ liệu Identity",
        isCompleted: true,
        dueDate: "2026-05-14T17:00:00Z",
        sortOrder: 0,
        createdAt: "2026-05-12T08:00:00Z",
        updatedAt: "2026-05-14T15:20:00Z",
        deletedAt: null
      },
      {
        id: "sub-task4-2",
        taskId: "task-4",
        assigneeUserId: mockUsers[2].id,
        assigneeUser: mockUsers[2],
        title: "Viết AuthController xử lý flow Token JWT",
        isCompleted: true,
        dueDate: "2026-05-19T17:00:00Z",
        sortOrder: 1,
        createdAt: "2026-05-12T08:00:00Z",
        updatedAt: "2026-05-19T17:00:00Z",
        deletedAt: null
      }
    ]
  },

  // Cột Done
  {
    id: "task-5",
    boardColumnId: "col-done",
    assigneeUserId: mockUsers[1].id, // Alex Smith
    assigneeUser: mockUsers[1],
    title: "Thiết lập cấu hình dự án Next.js & Tailwind CSS v4",
    description: "Khởi tạo thư mục dự án web mới chứa frontend, thiết lập framework Next.js cấu hình TypeScript và cài đặt framework CSS Tailwind v4 mới nhất theo kiến trúc App Router.",
    priority: "Low",
    startDate: "2026-05-21T09:00:00Z",
    dueDate: "2026-05-21T17:00:00Z",
    sortOrder: 1.0,
    createdByUserId: mockUsers[0].id,
    createdByUser: mockUsers[0],
    assignedAt: "2026-05-21T09:42:00Z",
    completedAt: "2026-05-21T10:00:00Z",
    deletedAt: null,
    createdAt: "2026-05-21T09:42:00Z",
    updatedAt: "2026-05-21T10:00:00Z",
    subTasks: [
      {
        id: "sub-task5-1",
        taskId: "task-5",
        assigneeUserId: mockUsers[1].id,
        assigneeUser: mockUsers[1],
        title: "Chạy lệnh create-next-app thiết lập thư mục web",
        isCompleted: true,
        dueDate: "2026-05-21T11:00:00Z",
        sortOrder: 0,
        createdAt: "2026-05-21T09:42:00Z",
        updatedAt: "2026-05-21T09:43:00Z",
        deletedAt: null
      },
      {
        id: "sub-task5-2",
        taskId: "task-5",
        assigneeUserId: mockUsers[1].id,
        assigneeUser: mockUsers[1],
        title: "Cài đặt clsx, tailwind-merge và viết hàm tiện ích cn()",
        isCompleted: true,
        dueDate: "2026-05-21T12:00:00Z",
        sortOrder: 1,
        createdAt: "2026-05-21T09:42:00Z",
        updatedAt: "2026-05-21T09:59:00Z",
        deletedAt: null
      }
    ]
  }
];

// ==========================================
// 8. MOCK NOTIFICATIONS (Danh sách thông báo giả lập)
// ==========================================
export const mockNotifications: Notification[] = [
  {
    id: "notif-1",
    userId: "u1a2b3c4-d5e6-7f8g-9h0i-j1k2l3m4n5o6",
    actorUserId: "u2b3c4d5-e6f7-8g9h-0i1j-2k3l4m5n6o7p",
    actorUser: mockUsers[1],
    type: "TaskAssigned",
    content: "Alex Smith đã giao công việc 'Tối ưu hóa NextJS' cho bạn.",
    actionUrl: "/projects/p1a2b3c4-d5e6-7f8g-9h0i-j1k2l3m4n5o6/board",
    isRead: false,
    isSentViaEmail: false,
    emailSentAt: null,
    createdAt: "2026-05-22T14:30:00Z"
  },
  {
    id: "notif-2",
    userId: "u1a2b3c4-d5e6-7f8g-9h0i-j1k2l3m4n5o6",
    actorUserId: "u3c4d5e6-f7g8-9h0i-1j2k-3l4m5n6o7p8q",
    actorUser: mockUsers[2],
    type: "CommentAdded",
    content: "Taylor Wong đã bình luận trong 'Thiết kế giao diện sơ đồ Gantt': 'Trông rất chuyên nghiệp!'",
    actionUrl: "/projects/p1a2b3c4-d5e6-7f8g-9h0i-j1k2l3m4n5o6/gantt",
    isRead: false,
    isSentViaEmail: false,
    emailSentAt: null,
    createdAt: "2026-05-22T10:15:00Z"
  },
  {
    id: "notif-3",
    userId: "u1a2b3c4-d5e6-7f8g-9h0i-j1k2l3m4n5o6",
    actorUserId: "u3c4d5e6-f7g8-9h0i-1j2k-3l4m5n6o7p8q",
    actorUser: mockUsers[2],
    type: "ProjectInvitation",
    content: "Taylor Wong đã thêm bạn vào dự án 'Landing Page sản phẩm'.",
    actionUrl: "/projects/p2b3c4d5-e6f7-8g9h-0i1j-2k3l4m5n6o7p/board",
    isRead: true,
    isSentViaEmail: false,
    emailSentAt: null,
    createdAt: "2026-05-21T09:00:00Z"
  },
  {
    id: "notif-4",
    userId: "u1a2b3c4-d5e6-7f8g-9h0i-j1k2l3m4n5o6",
    actorUserId: "u2b3c4d5-e6f7-8g9h-0i1j-2k3l4m5n6o7p",
    actorUser: mockUsers[1],
    type: "TaskDeadline",
    content: "Hạn chót của công việc 'Tích hợp AI' đã cận kề (Ngày 30/05/2026).",
    actionUrl: "/projects/p1a2b3c4-d5e6-7f8g-9h0i-j1k2l3m4n5o6/calendar",
    isRead: true,
    isSentViaEmail: false,
    emailSentAt: null,
    createdAt: "2026-05-20T17:45:00Z"
  }
];

