import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, String, Text, Float, DateTime
from database import Base


class Report(Base):
    __tablename__ = "reports"

    id          = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    title       = Column(String, nullable=False)
    description = Column(Text)
    lat         = Column(Float)
    lon         = Column(Float)
    status      = Column(String, default="open")  # open | in_review | resolved | revoked
    created_at  = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at  = Column(DateTime)
