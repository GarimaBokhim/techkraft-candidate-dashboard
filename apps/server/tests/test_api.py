import pytest
from app.auth import hash_password
from app.database import get_session
from app.main import app
from app.models import User, UserRole
from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine

sqlite_url = "sqlite:///:memory:"
engine = create_engine(sqlite_url, connect_args={"check_same_thread": False})


def override_get_session():
    with Session(engine) as session:
        yield session


app.dependency_overrides[get_session] = override_get_session

client = TestClient(app)


@pytest.fixture(autouse=True)
def prepare_db():
    SQLModel.metadata.create_all(engine)
    yield
    SQLModel.metadata.drop_all(engine)


@pytest.fixture
def admin_user():
    with Session(engine) as session:
        user = User(
            full_name="Admin",
            email="admin@test.com",
            username="admin",
            hashed_password=hash_password("password"),
            role=UserRole.admin,
        )
        session.add(user)
        session.commit()
        session.refresh(user)
        return user


@pytest.fixture
def reviewer1():
    with Session(engine) as session:
        user = User(
            full_name="Rev 1",
            email="rev1@test.com",
            username="rev1",
            hashed_password=hash_password("password"),
            role=UserRole.reviewer,
        )
        session.add(user)
        session.commit()
        session.refresh(user)
        return user


@pytest.fixture
def reviewer2():
    with Session(engine) as session:
        user = User(
            full_name="Rev 2",
            email="rev2@test.com",
            username="rev2",
            hashed_password=hash_password("password"),
            role=UserRole.reviewer,
        )
        session.add(user)
        session.commit()
        session.refresh(user)
        return user


def test_create_candidate(admin_user):
    response = client.post(
        "/auth/login", json={"email": "admin@test.com", "password": "password"}
    )
    token = response.json()["access_token"]

    headers = {"Authorization": f"Bearer {token}"}

    candidate_data = {
        "name": "John Doe",
        "email": "john@example.com",
        "role_applied": "Frontend Engineer",
        "skills": ["React", "TypeScript"],
        "internal_notes": "Very promising",
    }

    res = client.post("/candidates", json=candidate_data, headers=headers)
    assert res.status_code == 201
    data = res.json()
    assert data["name"] == "John Doe"
    assert data["internal_notes"] == "Very promising"


def test_reviewer_cannot_see_internal_notes(admin_user, reviewer1):
    admin_token = client.post(
        "/auth/login", json={"email": "admin@test.com", "password": "password"}
    ).json()["access_token"]

    candidate_res = client.post(
        "/candidates",
        json={
            "name": "Jane Doe",
            "email": "jane@example.com",
            "role_applied": "Backend Engineer",
            "skills": ["Python", "FastAPI"],
            "internal_notes": "Admin secret note",
        },
        headers={"Authorization": f"Bearer {admin_token}"},
    )

    candidate_id = candidate_res.json()["id"]
    rev_token = client.post(
        "/auth/login", json={"email": "rev1@test.com", "password": "password"}
    ).json()["access_token"]

    res = client.get(
        f"/candidates/{candidate_id}", headers={"Authorization": f"Bearer {rev_token}"}
    )
    assert res.status_code == 200
    assert res.json()["internal_notes"] is None


def test_reviewer_only_sees_own_scores(reviewer1, reviewer2, admin_user):
    admin_token = client.post(
        "/auth/login", json={"email": "admin@test.com", "password": "password"}
    ).json()["access_token"]

    candidate_res = client.post(
        "/candidates",
        json={
            "name": "Bob Smith",
            "email": "bob@example.com",
            "role_applied": "Fullstack",
            "skills": ["React", "Python"],
        },
        headers={"Authorization": f"Bearer {admin_token}"},
    )

    candidate_id = candidate_res.json()["id"]
    rev1_token = client.post(
        "/auth/login", json={"email": "rev1@test.com", "password": "password"}
    ).json()["access_token"]
    client.post(
        f"/candidates/{candidate_id}/scores",
        json={"category": "Technical", "score": 4, "note": "Good code"},
        headers={"Authorization": f"Bearer {rev1_token}"},
    )
    rev2_token = client.post(
        "/auth/login", json={"email": "rev2@test.com", "password": "password"}
    ).json()["access_token"]
    client.post(
        f"/candidates/{candidate_id}/scores",
        json={"category": "Communication", "score": 5, "note": "Clear communication"},
        headers={"Authorization": f"Bearer {rev2_token}"},
    )
    res1 = client.get(
        f"/candidates/{candidate_id}", headers={"Authorization": f"Bearer {rev1_token}"}
    )
    assert len(res1.json()["scores"]) == 1
    assert res1.json()["scores"][0]["category"] == "Technical"

    res_admin = client.get(
        f"/candidates/{candidate_id}",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert len(res_admin.json()["scores"]) == 2
