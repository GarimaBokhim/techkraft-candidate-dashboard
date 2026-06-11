import uuid
from datetime import datetime, timezone
from enum import Enum
from typing import Optional

from sqlalchemy import Column
from sqlalchemy.dialects.sqlite import JSON
from sqlmodel import Field, SQLModel


class UserRole(str, Enum):
    admin = "admin"
    reviewer = "reviewer"


class CandidateStatus(str, Enum):
    new = "new"
    reviewed = "reviewed"
    hired = "hired"
    rejected = "rejected"
    archived = "archived"


class User(SQLModel, table=True):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    full_name: str
    email: str = Field(index=True, unique=True)
    username: str = Field(index=True, unique=True)
    hashed_password: str
    role: UserRole = Field(default=UserRole.reviewer)  # role is NEVER from client


class Candidate(SQLModel, table=True):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    name: str
    email: str = Field(index=True)
    role_applied: str = Field(index=True)
    status: CandidateStatus = Field(default=CandidateStatus.new, index=True)
    skills: list[str] = Field(default_factory=list, sa_column=Column(JSON))
    internal_notes: Optional[str] = None  # admin-only
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    deleted_at: Optional[datetime] = None


class Score(SQLModel, table=True):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    candidate_id: str = Field(index=True, foreign_key="candidate.id")
    category: str
    score: int = Field(ge=1, le=5)
    reviewer_id: str = Field(foreign_key="user.id")
    note: Optional[str] = None
    created_at: str = Field(
        default_factory=lambda: datetime.now(timezone.utc).isoformat()
    )
