import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, String, Text, Float, DateTime, Boolean, Integer, ForeignKey
from sqlalchemy.orm import relationship

from database import Base


class Poll(Base):
    __tablename__ = "polls"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String, nullable=False)
    description = Column(Text)
    lat = Column(Float)
    lon = Column(Float)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    options = relationship("PollOption", back_populates="poll", cascade="all, delete-orphan")


class PollOption(Base):
    __tablename__ = "poll_options"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    poll_id = Column(String, ForeignKey("polls.id", ondelete="CASCADE"), nullable=False)
    text = Column(String, nullable=False)
    votes = Column(Integer, default=0)

    poll = relationship("Poll", back_populates="options")
