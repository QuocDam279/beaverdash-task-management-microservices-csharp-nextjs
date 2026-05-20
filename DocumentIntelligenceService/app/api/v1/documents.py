"""
Documents API - Upload, liệt kê và xóa tài liệu dự án.
"""
import uuid
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user_id
from app.models.document import Document
from app.models.project import ProjectMember
from app.schemas.document_schema import DocumentListItem, DocumentListResponse, DocumentUploadResponse
from app.services import document_service

router = APIRouter(prefix="/documents", tags=["Documents"])


def _check_project_access(user_id: uuid.UUID, project_id: uuid.UUID, db: Session):
    """Kiểm tra quyền truy cập dự án của user."""
    is_member = db.query(ProjectMember).filter(
        ProjectMember.project_id == project_id,
        ProjectMember.user_id == user_id
    ).first()
    if not is_member:
        raise HTTPException(status_code=403, detail="Bạn không có quyền truy cập dự án này.")


@router.post("", response_model=DocumentUploadResponse, status_code=201)
async def upload_document(
    file: UploadFile = File(...),
    project_id: uuid.UUID = Form(...),
    user_id: uuid.UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """
    Upload tài liệu lên dự án.
    - Validate quyền truy cập project
    - Tính checksum (Checksum Guard chặn trùng lặp)
    - Trích xuất văn bản, chunking, tạo embedding
    - Lưu vào database
    """
    _check_project_access(user_id, project_id, db)

    file_bytes = await file.read()
    if not file_bytes:
        raise HTTPException(status_code=400, detail="File rỗng.")

    try:
        doc = await document_service.process_document(
            file_bytes=file_bytes,
            file_name=file.filename or "unknown",
            mime_type=file.content_type or "application/octet-stream",
            user_id=user_id,
            project_id=project_id,
            db=db
        )
    except ValueError as e:
        raise HTTPException(status_code=409, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi xử lý tài liệu: {str(e)}")

    return DocumentUploadResponse(
        id=doc.id,
        file_name=doc.file_name,
        status=doc.status.value if doc.status else "unknown",
        created_at=doc.created_at
    )


@router.get("", response_model=DocumentListResponse)
def list_documents(
    project_id: uuid.UUID,
    user_id: uuid.UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Lấy danh sách tài liệu của dự án (kiểm tra quyền thành viên)."""
    _check_project_access(user_id, project_id, db)

    docs = db.query(Document).filter(
        Document.project_id == project_id
    ).order_by(Document.created_at.desc()).all()

    items = [
        DocumentListItem(
            id=d.id,
            file_name=d.file_name,
            mime_type=d.mime_type,
            file_size=d.file_size,
            status=d.status.value if d.status else "unknown",
            created_at=d.created_at
        )
        for d in docs
    ]

    return DocumentListResponse(documents=items)


@router.delete("/{document_id}", status_code=204)
def delete_document(
    document_id: uuid.UUID,
    user_id: uuid.UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Xóa tài liệu + cascade delete chunks (FK ON DELETE CASCADE)."""
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Tài liệu không tồn tại.")

    _check_project_access(user_id, doc.project_id, db)

    db.delete(doc)
    db.commit()
