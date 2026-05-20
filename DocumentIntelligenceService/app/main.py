"""
Điểm khởi chạy chính của Beaverdash DocumentIntelligence Service.

- Cấu hình FastAPI app với CORS middleware.
- Tự động tạo bảng database khi khởi động.
- Include các router API v1 (documents, chat, webhooks).
- Health check endpoint tại root "/".
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.database import Base, engine

# Import tất cả models để SQLAlchemy biết và tạo bảng
from app.models import user, project, document, chat  # noqa: F401


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan event handler – chạy khi app khởi động và shutdown.

    Startup: tạo tất cả bảng trong database nếu chưa tồn tại.
    """
    # ── Startup ───────────────────────────────────────────────────────
    Base.metadata.create_all(bind=engine)
    yield
    # ── Shutdown ──────────────────────────────────────────────────────
    # Có thể thêm cleanup logic ở đây nếu cần


app = FastAPI(
    title="Beaverdash DocumentIntelligence Service",
    description=(
        "RAG-based document intelligence service for the Beaverdash "
        "project management system. Provides document upload, chunking, "
        "embedding, and AI-powered chat with project context."
    ),
    version="1.0.0",
    lifespan=lifespan,
)

# ── CORS Middleware ───────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── API Routers ───────────────────────────────────────────────────────────
from app.api.v1 import documents as documents_router
from app.api.v1 import chat as chat_router
from app.api.v1 import webhooks as webhooks_router

app.include_router(
    documents_router.router,
    prefix="/api/v1",
    tags=["Documents"],
)

app.include_router(
    chat_router.router,
    prefix="/api/v1",
    tags=["Chat"],
)

app.include_router(
    webhooks_router.router,
    prefix="/api/v1",
    tags=["Webhooks"],
)


# ── Health Check ──────────────────────────────────────────────────────────
@app.get("/", tags=["Health"])
async def health_check():
    """Kiểm tra trạng thái hoạt động của service."""
    return {
        "service": "Beaverdash DocumentIntelligence Service",
        "status": "healthy",
        "version": "1.0.0",
    }
