from typing import Optional
from datetime import datetime

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database import SessionLocal
from models.sensor import Sensor

router = APIRouter()


# --------------- Pydantic schemas ---------------

class SensorOut(BaseModel):
    id: str
    name: Optional[str] = None
    aqi: Optional[int] = None
    pm25: Optional[float] = None
    lat: Optional[float] = None
    lon: Optional[float] = None
    recorded_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


# --------------- Dependency ---------------

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# --------------- Routes ---------------

@router.get("/", response_model=list[SensorOut])
def list_sensors(db: Session = Depends(get_db)):
    return db.query(Sensor).all()
