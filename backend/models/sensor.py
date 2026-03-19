import uuid

from sqlalchemy import Column, String, Integer, Float, DateTime

from database import Base


class Sensor(Base):
    __tablename__ = "sensors"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String)
    aqi = Column(Integer)  # 0-500
    pm25 = Column(Float)
    lat = Column(Float)
    lon = Column(Float)
    recorded_at = Column(DateTime)
