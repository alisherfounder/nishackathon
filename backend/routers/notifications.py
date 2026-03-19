from typing import Optional
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database import SessionLocal
from models.notification import Notification

router = APIRouter()


# --------------- Pydantic schemas ---------------

class NotificationCreate(BaseModel):
    type: str  # POLL | DANGER | JAM
    title: str
    body: Optional[str] = None
    lat: Optional[float] = None
    lon: Optional[float] = None


class NotificationOut(BaseModel):
    id: str
    type: str
    title: str
    body: Optional[str] = None
    lat: Optional[float] = None
    lon: Optional[float] = None
    created_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


# --------------- Dependency ---------------

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# --------------- Routes ---------------

@router.get("/", response_model=list[NotificationOut])
def list_notifications(type: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(Notification)
    if type:
        query = query.filter(Notification.type == type)
    return query.all()


@router.post("/", response_model=NotificationOut, status_code=201)
def create_notification(payload: NotificationCreate, db: Session = Depends(get_db)):
    notification = Notification(**payload.model_dump())
    db.add(notification)
    db.commit()
    db.refresh(notification)
    return notification


@router.delete("/{notification_id}", status_code=204)
def delete_notification(notification_id: str, db: Session = Depends(get_db)):
    notification = db.query(Notification).filter(Notification.id == notification_id).first()
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    db.delete(notification)
    db.commit()
