from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from sqlalchemy import text
from database import SessionLocal, engine, Base
from models.project import ProjectCard
from models.notification import Notification
from models.sensor import Sensor
from models.poll import Poll, PollOption
from routers import projects, notifications, sensors, polls


def _seed_if_empty():
    """Run seed data only when the database has no projects."""
    db = SessionLocal()
    try:
        if db.query(ProjectCard).first() is None:
            from seed import seed
            seed()
    finally:
        db.close()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create all tables
    Base.metadata.create_all(bind=engine)
    # Migrate: add geometry column to notifications if missing
    with engine.connect() as conn:
        try:
            conn.execute(text("ALTER TABLE notifications ADD COLUMN geometry TEXT"))
            conn.commit()
        except Exception:
            pass  # Column already exists
    # Seed if empty
    _seed_if_empty()
    yield


app = FastAPI(
    title="Alatau SuperApp API",
    description="Civic intelligence platform for Almaty, Kazakhstan",
    version="0.1.0",
    lifespan=lifespan,
)

# CORS — allow everything for hackathon
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(projects.router, prefix="/projects", tags=["Projects"])
app.include_router(notifications.router, prefix="/notifications", tags=["Notifications"])
app.include_router(sensors.router, prefix="/sensors", tags=["Sensors"])
app.include_router(polls.router, prefix="/polls", tags=["Polls"])


@app.get("/")
def root():
    return {"message": "AlatauSuperApp is Live!"}
