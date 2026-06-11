from app.auth import hash_password
from app.database import engine
from app.models import User, UserRole
from sqlmodel import Session, SQLModel, select

SQLModel.metadata.create_all(engine)

with Session(engine) as session:
    existing = session.exec(
        select(User).where(User.email == "admin@techkraft.com")
    ).first()
    if not existing:
        admin = User(
            full_name="Admin",
            email="admin@techkraft.com",
            username="admin",
            hashed_password=hash_password("admin123"),
            role=UserRole.admin,
        )
        session.add(admin)
        session.commit()
        print("Admin created: admin@techkraft.com / Admin123")
    else:
        print("Admin already exists")
