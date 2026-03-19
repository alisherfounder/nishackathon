from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import text

from database import SessionLocal, engine, Base
from models.project import ProjectCard
from models.notification import Notification
from models.sensor import Sensor
from models.poll import Poll, PollOption
from models.request import Request
from routers import projects, notifications, sensors, polls, requests


def _seed_if_empty():
    db = SessionLocal()
    try:
        if db.query(ProjectCard).first() is None:
            from seed import seed
            seed()
    finally:
        db.close()


NEW_PROJECT_COLUMNS = [
    "ALTER TABLE projects ADD COLUMN project_type TEXT DEFAULT 'infrastructure'",
    "ALTER TABLE projects ADD COLUMN completion_pct INTEGER DEFAULT 0",
    "ALTER TABLE projects ADD COLUMN start_date TEXT",
    "ALTER TABLE projects ADD COLUMN end_date TEXT",
    "ALTER TABLE projects ADD COLUMN apartments INTEGER",
    "ALTER TABLE projects ADD COLUMN image_url TEXT",
]

NEW_NOTIFICATION_COLUMNS = [
    "ALTER TABLE notifications ADD COLUMN geometry TEXT",
]


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    # Run migrations
    with engine.connect() as conn:
        for stmt in NEW_PROJECT_COLUMNS + NEW_NOTIFICATION_COLUMNS:
            try:
                conn.execute(text(stmt))
                conn.commit()
            except Exception:
                pass
    _seed_if_empty()
    yield


app = FastAPI(
    title="Alatau SuperApp API",
    description="Civic intelligence platform for Alatau City, Kazakhstan",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve uploaded images
uploads_dir = Path("uploads")
uploads_dir.mkdir(exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

app.include_router(projects.router, prefix="/projects", tags=["Projects"])
app.include_router(notifications.router, prefix="/notifications", tags=["Notifications"])
app.include_router(sensors.router, prefix="/sensors", tags=["Sensors"])
app.include_router(polls.router, prefix="/polls", tags=["Polls"])
app.include_router(requests.router, prefix="/requests", tags=["Requests"])


@app.get("/")
def root():
    return {"message": "AlatauSuperApp is Live!"}
