from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field

class WorkspaceDocumentBase(BaseModel):
    workspace_id: str
    campaign_id: Optional[str] = None
    agent_id: Optional[str] = None
    source_card_id: Optional[str] = None
    filename: str
    content_type: str
    size_bytes: int
    extracted_text: str
    file_type: Optional[str] = None
    content_length: Optional[int] = None
    gcs_path: Optional[str] = None
    gcs_url: Optional[str] = None

class WorkspaceDocumentCreate(WorkspaceDocumentBase):
    pass

class WorkspaceDocumentInDB(WorkspaceDocumentBase):
    id: Optional[str] = Field(default=None, alias="_id")
    created_at: datetime = Field(default_factory=datetime.utcnow)

class WorkspaceDocumentResponse(WorkspaceDocumentBase):
    id: str
    created_at: datetime
    # We may omit extracted_text from list responses if it's huge, but let's include it for now.
    extracted_text: Optional[str] = None
