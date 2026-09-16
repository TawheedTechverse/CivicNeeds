import uuid
from datetime import datetime

from pydantic import BaseModel, Field

from app.models.report import ReportCategory, ReportPriority, ReportStatus


class ReportCreate(BaseModel):
    title: str = Field(min_length=3, max_length=255)
    description: str = Field(min_length=10)
    category: ReportCategory | None = None
    latitude: float = Field(ge=-90, le=90)
    longitude: float = Field(ge=-180, le=180)
    image_urls: list[str] = Field(default_factory=list)


class ReportUpdate(BaseModel):
    status: ReportStatus | None = None
    priority: ReportPriority | None = None
    category: ReportCategory | None = None
    assigned_to_id: uuid.UUID | None = None


class ReportImageOut(BaseModel):
    id: uuid.UUID
    url: str

    model_config = {"from_attributes": True}


class DuplicateInfo(BaseModel):
    report_id: uuid.UUID
    title: str
    distance_meters: float
    similarity: float


class ReportOut(BaseModel):
    id: uuid.UUID
    title: str
    description: str
    category: ReportCategory
    priority: ReportPriority
    status: ReportStatus
    latitude: float
    longitude: float
    ai_confidence: float | None
    ai_reasoning: str | None
    duplicate_of_id: uuid.UUID | None
    reporter_id: uuid.UUID
    assigned_to_id: uuid.UUID | None
    created_at: datetime
    updated_at: datetime
    images: list[ReportImageOut] = Field(default_factory=list)

    model_config = {"from_attributes": True}


class ReportCreateResponse(BaseModel):
    report: ReportOut
    possible_duplicates: list[DuplicateInfo] = Field(default_factory=list)
