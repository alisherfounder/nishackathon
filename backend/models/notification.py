import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, String, Text, Float, DateTime

from database import Base


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    type = Column(String, nullable=False)  # POLL | DANGER | JAM | ROAD | INFO
    title = Column(String, nullable=False)
    body = Column(Text)
    lat = Column(Float)
    lon = Column(Float)
    geometry = Column(Text)  # JSON array of [[lon, lat], ...] for ROAD type
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
