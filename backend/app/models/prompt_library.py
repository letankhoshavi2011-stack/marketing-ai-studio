"""Pydantic models for the Prompt Library feature."""

from datetime import datetime, timezone
from typing import List, Optional
from uuid import uuid4

from pydantic import BaseModel, Field


class InputVariable(BaseModel):
    """A single template variable extracted from a prompt template."""
    name: str
    description: str = ""
    required: bool = True


class PromptInDB(BaseModel):
    """Full prompt document as stored in MongoDB."""
    prompt_id: str = Field(default_factory=lambda: str(uuid4()))
    workspace_id: str
    agent_id: str
    category: str
    name: str
    description: str = ""
    system_prompt: str
    prompt_template: str
    input_variables: List[InputVariable] = Field(default_factory=list)
    is_default: bool = False
    is_active: bool = True
    model_tier: str = "quality"
    temperature: float = 0.7
    created_by: str = "system"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    version: int = 1


class PromptCreate(BaseModel):
    """Payload for creating a new prompt."""
    name: str
    agent_id: str
    category: str
    description: str = ""
    system_prompt: str
    prompt_template: str
    model_tier: str = "quality"
    temperature: float = 0.7


class PromptUpdate(BaseModel):
    """Payload for updating an existing prompt (all fields optional)."""
    name: Optional[str] = None
    description: Optional[str] = None
    system_prompt: Optional[str] = None
    prompt_template: Optional[str] = None
    model_tier: Optional[str] = None
    temperature: Optional[float] = None


class PromptResponse(BaseModel):
    """Response model returned to the client."""
    prompt_id: str
    workspace_id: str
    agent_id: str
    category: str
    name: str
    description: str
    system_prompt: str
    prompt_template: str
    input_variables: List[InputVariable]
    is_default: bool
    is_active: bool
    model_tier: str
    temperature: float
    created_by: str
    created_at: datetime
    updated_at: datetime
    version: int
