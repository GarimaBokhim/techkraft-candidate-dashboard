# from enum import Enum
# from uuid import uuid4

# from fastapi import APIRouter, Depends
# from fastapi.exceptions import HTTPException
# from pydantic import BaseModel
# from sqlmodel import Session, select

# from .. import schemas
# from ..models import User

# router = APIRouter(prefix="/users", tags=["Users"])


# users: list[User] = []


# class Status(str, Enum):
#     new = "new"
#     reviewed = "reviewed"
#     hired = "hired"
#     rejected = "rejected"


# class Candidate(BaseModel):
#     id: str
#     name: str
#     email: str
#     role_applied: str
#     status: Status
#     skills: list[str]
#     internal_notes: str | None
#     created_at: str


# @router.post("/", response_model=schemas.User)
# def create_user(user: dict, db: Session = Depends(get_db)):
#     new_user = User(id=str(uuid4()), **user)
#     db.add(new_user)
#     db.commit()
#     db.refresh(new_user)

#     return new_user


# @router.get("/users")
# def get_users(db: Session = Depends(get_db)):
#     users = db.execute(select(User)).scalars().all()
#     return {"users": users}


# @router.get("/users/{user_id}")
# def get_user(user_id: str, db: Session = Depends(get_db)):
#     user = db.get(User, user_id)

#     if not user:
#         raise HTTPException(status_code=404, detail="User not found")

#     return {"user": user}
