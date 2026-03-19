import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, String, Text, DateTime
from database import Base


class Request(Base):
    __tablename__ = "requests"

    id             = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    requester_type = Column(String, nullable=False)   # "individual" | "business"
    identifier     = Column(String, nullable=False)   # ИИН (individual) or БИН (business), 12 digits
    request_type   = Column(String, nullable=False)   # see constants below
    description    = Column(Text)
    address        = Column(String, nullable=False)
    status         = Column(String, default="pending")  # pending | under_review | approved | rejected
    created_at     = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at     = Column(DateTime)
