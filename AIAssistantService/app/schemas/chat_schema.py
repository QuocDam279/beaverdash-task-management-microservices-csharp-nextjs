from pydantic import BaseModel, field_serializer
from uuid import UUID
from datetime import datetime, timezone
from typing import List, Optional, Any

class AIChatMessageCreate(BaseModel):
    content: str

class AIChatMessageResponse(BaseModel):
    id: UUID
    session_id: UUID
    role: str
    content: Optional[str] = None
    tool_calls: Optional[List[Any]] = None
    tool_results: Optional[List[Any]] = None
    thought_signature: Optional[str] = None
    created_at: datetime

    @field_serializer("created_at")
    def serialize_created_at(self, dt: datetime) -> str:
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        if dt.tzinfo == timezone.utc:
            return dt.strftime("%Y-%m-%dT%H:%M:%S.%fZ")
        return dt.isoformat()

    class Config:
        from_attributes = True

class AIChatSessionCreate(BaseModel):
    project_id: UUID
    title: Optional[str] = None

class AIChatSessionResponse(BaseModel):
    id: UUID
    user_id: UUID
    project_id: UUID
    title: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    @field_serializer("created_at", "updated_at")
    def serialize_datetimes(self, dt: datetime) -> str:
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        if dt.tzinfo == timezone.utc:
            return dt.strftime("%Y-%m-%dT%H:%M:%S.%fZ")
        return dt.isoformat()

    class Config:
        from_attributes = True

class AIChatSessionWithMessagesResponse(AIChatSessionResponse):
    messages: List[AIChatMessageResponse] = []

    class Config:
        from_attributes = True

class AIChatSessionUpdate(BaseModel):
    title: str
