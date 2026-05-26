"""
RAG Service - Truy vấn tìm kiếm ngữ cảnh (Context Retrieval) bằng cosine similarity.
Sử dụng pgvector để so sánh khoảng cách vector trên bảng document_chunks.
"""
import logging
import uuid

from sqlalchemy import text
from sqlalchemy.orm import Session

from app.services import embedding_service

logger = logging.getLogger(__name__)


async def retrieve_context(
    query: str,
    project_id: uuid.UUID,
    db: Session,
    top_k: int = 5
) -> list[dict]:
    """
    Tìm kiếm các chunks tài liệu liên quan nhất với câu hỏi.

    1. Embed câu hỏi qua Ollama BGE-M3
    2. Truy vấn cosine similarity trên document_chunks lọc theo project_id
    3. Trả về top_k kết quả kèm dẫn chứng

    Returns:
        list[dict]: Danh sách chunks liên quan, mỗi item chứa:
            - chunk_id, content, document_id, file_name, chunk_index, similarity_score
    """
    # 1. Sinh embedding cho câu hỏi
    query_embedding = await embedding_service.get_embedding(query)
    embedding_str = "[" + ",".join(str(x) for x in query_embedding) + "]"

    # 2. Truy vấn cosine similarity bằng pgvector operator <=>
    sql = text("""
        SELECT
            child.id AS chunk_id,
            COALESCE(parent.content, child.content) AS content,
            child.document_id,
            d.file_name,
            child.chunk_index,
            child.token_count,
            child.metadata AS chunk_metadata,
            1 - (child.embedding <=> CAST(:query_embedding AS vector)) AS similarity_score
        FROM document_chunks child
        JOIN documents d ON child.document_id = d.id
        LEFT JOIN document_chunks parent ON child.parent_id = parent.id
        WHERE child.project_id = :project_id
          AND child.embedding IS NOT NULL
        ORDER BY child.embedding <=> CAST(:query_embedding AS vector) ASC
        LIMIT :top_k
    """)

    result = db.execute(sql, {
        "query_embedding": embedding_str,
        "project_id": str(project_id),
        "top_k": top_k
    })

    chunks = []
    for row in result:
        chunks.append({
            "chunk_id": str(row.chunk_id),
            "content": row.content,
            "document_id": str(row.document_id),
            "file_name": row.file_name,
            "chunk_index": row.chunk_index,
            "token_count": row.token_count,
            "metadata": row.chunk_metadata,
            "similarity_score": float(row.similarity_score) if row.similarity_score else 0.0
        })

    logger.info(
        f"RAG retrieval: tìm thấy {len(chunks)} chunks cho project {project_id} "
        f"(top_k={top_k}, query='{query[:50]}...')"
    )

    return chunks
