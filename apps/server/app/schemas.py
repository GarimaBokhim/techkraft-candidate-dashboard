from datetime import datetime, timezone
from typing import Optional

from app.models import UserRole
from pydantic import BaseModel, EmailStr, field_validator
from sqlalchemy import JSON, Column
from sqlmodel import Field


class RegisterRequest(BaseModel):
    full_name: str
    email: EmailStr
    username: str
    password: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: UserRole


class CandidateCreate(BaseModel):
    name: str
    email: EmailStr
    role_applied: str
    skills: list[str] = Field(default_factory=list, sa_column=Column(JSON))
    internal_notes: Optional[str] = None


class CandidateOut(BaseModel):
    id: str
    name: str
    email: str
    role_applied: str
    status: str
    skills: list[str] = Field(default_factory=list, sa_column=Column(JSON))
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    internal_notes: Optional[str] = None

    @field_validator("skills", mode="before")
    @classmethod
    def parse_skills(cls, v):
        if isinstance(v, str):
            return [s.strip() for s in v.split(",") if s.strip()]
        return v


class ScoreCreate(BaseModel):
    category: str
    score: int
    note: Optional[str] = None

    @field_validator("score")
    @classmethod
    def validate_score(cls, v):
        if not 1 <= v <= 5:
            raise ValueError("Score must be between 1 and 5")
        return v


class ScoreOut(BaseModel):
    id: str
    category: str
    score: int
    reviewer_id: str
    note: Optional[str]
    created_at: str


class CandidateDetailOut(CandidateOut):
    scores: list[ScoreOut] = []


class InternalNotesUpdate(BaseModel):
    internal_notes: str


# class UserRole(str, Enum):
#     admin = "admin"
#     reviewer = "reviewer"


# class UserCreate(BaseModel):
#     fullName: str
#     email: str
#     username: str
#     role: UserRole


# class User(SQLModel, table=True):
#     id: str = Field(primary_key=True)
#     full_name: str
#     email: str
#     username: str
#     hashed_password: str
#     role: UserRole
