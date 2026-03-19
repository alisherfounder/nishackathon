import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, String, Text, Float, DateTime, Integer

from database import Base


class ProjectCard(Base):
    __tablename__ = "projects"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String, nullable=False)
    description = Column(Text)
    institution = Column(String, nullable=False)
    project_type = Column(String, default="infrastructure")  # residential|commercial|infrastructure|education|tech|tourism|industrial
    status = Column(String, default="active")  # active | planned | completed
    completion_pct = Column(Integer, default=0)
    start_date = Column(String)   # YYYY-MM-DD
    end_date = Column(String)     # YYYY-MM-DD
    apartments = Column(Integer)  # optional, for residential projects
    image_url = Column(Text)
    lat = Column(Float)
    lon = Column(Float)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, onupdate=lambda: datetime.now(timezone.utc))
