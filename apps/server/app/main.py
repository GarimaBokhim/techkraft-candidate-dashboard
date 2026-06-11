from app.database import engine
from app.routers import auth, candidates
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import SQLModel

app = FastAPI(title="TechKraft Recruitment API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def init_db():
    import app.models

    SQLModel.metadata.create_all(engine)


app.include_router(auth.router)
app.include_router(candidates.router)


@app.on_event("startup")
def on_startup():
    init_db()


@app.get("/")
def root():
    return {"message": "TechKraft Recruitment API"}
