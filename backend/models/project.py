import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, String, Text, Float, DateTime

from database import Base


class ProjectCard(Base):
    __tablename__ = "projects"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String, nullable=False)
    description = Column(Text)
    institution = Column(String, nullable=False)
    status = Column(String, default="active")  # active | planned | completed
    lat = Column(Float)
    lon = Column(Float)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, onupdate=lambda: datetime.now(timezone.utc))
