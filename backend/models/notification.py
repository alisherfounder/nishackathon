import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, String, Text, Float, DateTime

from database import Base


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    type = Column(String, nullable=False)  # POLL | DANGER | JAM
    title = Column(String, nullable=False)
    body = Column(Text)
    lat = Column(Float)
    lon = Column(Float)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
