from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
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

    class Config:
        from_attributes = True

class AIChatSessionWithMessagesResponse(AIChatSessionResponse):
    messages: List[AIChatMessageResponse] = []

    class Config:
        from_attributes = True

class AIChatSessionUpdate(BaseModel):
    title: str
