import asyncio
from typing import Optional

from app.auth import get_current_user
from app.database import get_session
from app.models import Candidate, CandidateStatus, Score, User, UserRole
from app.schemas import (
    CandidateCreate,
    CandidateDetailOut,
    CandidateOut,
    InternalNotesUpdate,
    ScoreCreate,
    ScoreOut,
)
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, or_
from sqlmodel import Session, col, select

router = APIRouter(prefix="/candidates", tags=["candidates"])


def _to_out(candidate: Candidate, include_notes: bool) -> CandidateOut:
    data = CandidateOut(
        id=candidate.id,
        name=candidate.name,
        email=candidate.email,
        role_applied=candidate.role_applied,
        status=candidate.status,
        skills=candidate.skills,
        created_at=candidate.created_at,
        internal_notes=candidate.internal_notes if include_notes else None,
    )
    return data


@router.post("", response_model=CandidateOut, status_code=201)
def create_candidate(
    data: CandidateCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    candidate = Candidate(
        name=data.name,
        email=data.email,
        role_applied=data.role_applied,
        skills=(data.skills),
        internal_notes=data.internal_notes,
    )
    session.add(candidate)
    session.commit()
    session.refresh(candidate)
    return _to_out(candidate, include_notes=current_user.role == UserRole.admin)


@router.get("", response_model=dict)
def list_candidates(
    status: Optional[CandidateStatus] = None,
    role_applied: Optional[str] = None,
    skill: Optional[str] = None,
    keyword: Optional[str] = None,
    offset: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=50),
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):

    query = select(Candidate).where(col(Candidate.deleted_at).is_(None))
    if status:
        query = query.where(Candidate.status == status)

    if role_applied:
        query = query.where(Candidate.role_applied == role_applied)

    if skill:
        query = query.where(func.json_extract(Candidate.skills, "$").like(f"%{skill}%"))

    if keyword:
        query = query.where(
            or_(
                col(Candidate.name).like(f"%{keyword}%"),
                col(Candidate.email).like(f"%{keyword}%"),
            )
        )

    total = len(session.exec(query).all())

    results = session.exec(query.offset(offset).limit(limit)).all()

    is_admin = current_user.role == UserRole.admin

    return {
        "total": total,
        "offset": offset,
        "limit": limit,
        "items": [_to_out(c, include_notes=is_admin) for c in results],
    }


@router.get("/{candidate_id}", response_model=CandidateDetailOut)
def get_candidate(
    candidate_id: str,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    candidate = session.get(Candidate, candidate_id)
    if not candidate or candidate.deleted_at:
        raise HTTPException(status_code=404, detail="Candidate not found")
    query = select(Score).where(Score.candidate_id == candidate_id)

    if current_user.role == UserRole.reviewer:
        query = query.where(Score.reviewer_id == current_user.id)

    scores = session.exec(query).all()

    base_data = _to_out(
        candidate, include_notes=current_user.role == UserRole.admin
    ).model_dump()

    base_data["scores"] = [
        ScoreOut(
            id=s.id,
            category=s.category,
            score=s.score,
            reviewer_id=s.reviewer_id,
            note=s.note,
            created_at=s.created_at,
        )
        for s in scores
    ]

    return CandidateDetailOut(**base_data)


@router.post("/{candidate_id}/scores", response_model=ScoreOut, status_code=201)
def submit_score(
    candidate_id: str,
    data: ScoreCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    candidate = session.get(Candidate, candidate_id)
    if not candidate or candidate.deleted_at:
        raise HTTPException(status_code=404, detail="Candidate not found")

    score = Score(
        candidate_id=candidate_id,
        category=data.category,
        score=data.score,
        reviewer_id=current_user.id,
        note=data.note,
    )
    session.add(score)
    session.commit()
    session.refresh(score)
    return ScoreOut(
        id=score.id,
        category=score.category,
        score=score.score,
        reviewer_id=score.reviewer_id,
        note=score.note,
        created_at=score.created_at,
    )


@router.post("/{candidate_id}/summary")
async def generate_summary(
    candidate_id: str,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    candidate = session.get(Candidate, candidate_id)
    if not candidate or candidate.deleted_at:
        raise HTTPException(status_code=404, detail="Candidate not found")

    await asyncio.sleep(2)

    return {
        "candidate_id": candidate_id,
        "summary": (
            f"{candidate.name} is applying for {candidate.role_applied}. "
            f"They have skills in {', '.join(candidate.skills)}. "
            "This is a mock AI-generated summary."
        ),
    }


@router.patch("/{candidate_id}/internal-notes", response_model=CandidateOut)
def update_internal_notes(
    candidate_id: str,
    data: InternalNotesUpdate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != UserRole.admin:
        raise HTTPException(status_code=403, detail="Not allowed")

    candidate = session.get(Candidate, candidate_id)
    if not candidate or candidate.deleted_at:
        raise HTTPException(status_code=404, detail="Candidate not found")

    candidate.internal_notes = data.internal_notes

    session.add(candidate)
    session.commit()
    session.refresh(candidate)

    return _to_out(candidate, include_notes=True)
