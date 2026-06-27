from pydantic import BaseModel, Field
from uuid import UUID
from typing import Optional


class UserEventSchema(BaseModel):
    id: UUID = Field(alias="Id")
    email: str = Field(alias="Email")
    display_name: str = Field(alias="DisplayName")
    avatar: Optional[str] = Field(None, alias="Avatar")

    class Config:
        populate_by_name = True

