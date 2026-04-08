import uuid
from datetime import datetime
from sqlalchemy import String, Text, Integer, Float, Boolean, DateTime, JSON, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base
import enum


def new_id() -> str:
    return str(uuid.uuid4())


class Priority(str, enum.Enum):
    APPLY_NOW = "APPLY_NOW"
    PREPARE_THEN_APPLY = "PREPARE_THEN_APPLY"
    SKIP = "SKIP"


class TopicCategory(str, enum.Enum):
    DSA = "DSA"
    BACKEND = "BACKEND"
    SYSTEM_DESIGN = "SYSTEM_DESIGN"
    LANGUAGE = "LANGUAGE"
    BEHAVIORAL = "BEHAVIORAL"


class TopicStatus(str, enum.Enum):
    NOT_STARTED = "NOT_STARTED"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    NEEDS_REVIEW = "NEEDS_REVIEW"


class UserProfile(Base):
    __tablename__ = "user_profiles"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    name: Mapped[str] = mapped_column(String(200))
    resume_text: Mapped[str | None] = mapped_column(Text)
    parsed_profile: Mapped[dict | None] = mapped_column(JSON)
    embedding: Mapped[list | None] = mapped_column(JSON)
    target_role: Mapped[str | None] = mapped_column(String(200))
    target_companies: Mapped[list | None] = mapped_column(JSON)
    dsa_level: Mapped[int] = mapped_column(Integer, default=2)
    backend_level: Mapped[int] = mapped_column(Integer, default=6)
    system_design_level: Mapped[int] = mapped_column(Integer, default=4)
    hours_per_week: Mapped[int] = mapped_column(Integer, default=15)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    jobs: Mapped[list["Job"]] = relationship(back_populates="user")
    roadmap_items: Mapped[list["RoadmapItem"]] = relationship(back_populates="user")


class Job(Base):
    __tablename__ = "jobs"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    user_id: Mapped[str] = mapped_column(ForeignKey("user_profiles.id"))
    title: Mapped[str] = mapped_column(String(300))
    company: Mapped[str] = mapped_column(String(200))
    url: Mapped[str | None] = mapped_column(Text)
    source: Mapped[str] = mapped_column(String(50))
    raw_description: Mapped[str] = mapped_column(Text)
    parsed_requirements: Mapped[dict | None] = mapped_column(JSON)
    embedding: Mapped[list | None] = mapped_column(JSON)
    match_score: Mapped[float | None] = mapped_column(Float)
    match_analysis: Mapped[dict | None] = mapped_column(JSON)
    priority: Mapped[str | None] = mapped_column(String(30))
    is_notified: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    user: Mapped["UserProfile"] = relationship(back_populates="jobs")


class RoadmapItem(Base):
    __tablename__ = "roadmap_items"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    user_id: Mapped[str] = mapped_column(ForeignKey("user_profiles.id"))
    phase: Mapped[str] = mapped_column(String(100))
    module_id: Mapped[str] = mapped_column(String(100))
    category: Mapped[str] = mapped_column(String(50))
    topic: Mapped[str] = mapped_column(String(300))
    subtopics: Mapped[list | None] = mapped_column(JSON)
    difficulty: Mapped[str] = mapped_column(String(20))
    estimated_hours: Mapped[float] = mapped_column(Float, default=1.0)
    resources: Mapped[list | None] = mapped_column(JSON)
    practice_problems: Mapped[list | None] = mapped_column(JSON)
    status: Mapped[str] = mapped_column(String(20), default=TopicStatus.NOT_STARTED.value)
    score: Mapped[float | None] = mapped_column(Float)
    notes: Mapped[str | None] = mapped_column(Text)
    week_number: Mapped[int] = mapped_column(Integer)
    order_index: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime)

    user: Mapped["UserProfile"] = relationship(back_populates="roadmap_items")


class CompanyIntel(Base):
    __tablename__ = "company_intel"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    company_name: Mapped[str] = mapped_column(String(200), unique=True)
    intel_data: Mapped[dict] = mapped_column(JSON)
    last_updated: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class MockSession(Base):
    __tablename__ = "mock_sessions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    user_id: Mapped[str] = mapped_column(ForeignKey("user_profiles.id"))
    company: Mapped[str | None] = mapped_column(String(200))
    session_type: Mapped[str] = mapped_column(String(50))
    question_data: Mapped[dict] = mapped_column(JSON)
    answer_text: Mapped[str | None] = mapped_column(Text)
    code: Mapped[str | None] = mapped_column(Text)
    evaluation: Mapped[dict | None] = mapped_column(JSON)
    score: Mapped[float | None] = mapped_column(Float)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
