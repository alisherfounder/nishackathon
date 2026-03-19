from typing import Optional
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database import SessionLocal
from models.poll import Poll, PollOption

router = APIRouter()


# --------------- Pydantic schemas ---------------

class PollOptionCreate(BaseModel):
    text: str


class PollCreate(BaseModel):
    title: str
    description: Optional[str] = None
    lat: Optional[float] = None
    lon: Optional[float] = None
    options: list[PollOptionCreate]


class PollOptionOut(BaseModel):
    id: str
    text: str
    votes: int

    model_config = {"from_attributes": True}


class PollOut(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    lat: Optional[float] = None
    lon: Optional[float] = None
    is_active: bool
    created_at: Optional[datetime] = None
    options: list[PollOptionOut] = []

    model_config = {"from_attributes": True}


class VoteRequest(BaseModel):
    option_id: str


# --------------- Dependency ---------------

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# --------------- Routes ---------------

@router.get("/", response_model=list[PollOut])
def list_polls(active: Optional[bool] = None, db: Session = Depends(get_db)):
    query = db.query(Poll)
    if active is not None:
        query = query.filter(Poll.is_active == active)
    return query.all()


@router.post("/", response_model=PollOut, status_code=201)
def create_poll(payload: PollCreate, db: Session = Depends(get_db)):
    if len(payload.options) < 2:
        raise HTTPException(status_code=400, detail="A poll needs at least 2 options")
    poll = Poll(
        title=payload.title,
        description=payload.description,
        lat=payload.lat,
        lon=payload.lon,
    )
    for opt in payload.options:
        poll.options.append(PollOption(text=opt.text))
    db.add(poll)
    db.commit()
    db.refresh(poll)
    return poll


@router.get("/{poll_id}", response_model=PollOut)
def get_poll(poll_id: str, db: Session = Depends(get_db)):
    poll = db.query(Poll).filter(Poll.id == poll_id).first()
    if not poll:
        raise HTTPException(status_code=404, detail="Poll not found")
    return poll


@router.post("/{poll_id}/vote", response_model=PollOut)
def vote_poll(poll_id: str, payload: VoteRequest, db: Session = Depends(get_db)):
    poll = db.query(Poll).filter(Poll.id == poll_id).first()
    if not poll:
        raise HTTPException(status_code=404, detail="Poll not found")
    if not poll.is_active:
        raise HTTPException(status_code=400, detail="This poll is closed")
    option = db.query(PollOption).filter(
        PollOption.id == payload.option_id,
        PollOption.poll_id == poll_id,
    ).first()
    if not option:
        raise HTTPException(status_code=404, detail="Option not found")
    option.votes += 1
    db.commit()
    db.refresh(poll)
    return poll


@router.delete("/{poll_id}", status_code=204)
def delete_poll(poll_id: str, db: Session = Depends(get_db)):
    poll = db.query(Poll).filter(Poll.id == poll_id).first()
    if not poll:
        raise HTTPException(status_code=404, detail="Poll not found")
    db.delete(poll)
    db.commit()
