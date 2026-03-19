from typing import Optional
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database import SessionLocal
from models.project import ProjectCard
from models.notification import Notification

router = APIRouter()


# --------------- Pydantic schemas ---------------

class ProjectCreate(BaseModel):
    title: str
    description: Optional[str] = None
    institution: str
    status: Optional[str] = "active"
    lat: Optional[float] = None
    lon: Optional[float] = None


class ProjectUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    institution: Optional[str] = None
    status: Optional[str] = None
    lat: Optional[float] = None
    lon: Optional[float] = None


class ProjectOut(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    institution: str
    status: str
    lat: Optional[float] = None
    lon: Optional[float] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


# --------------- Dependency ---------------

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# --------------- Routes ---------------

@router.get("/", response_model=list[ProjectOut])
def list_projects(status: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(ProjectCard)
    if status:
        query = query.filter(ProjectCard.status == status)
    return query.all()


@router.post("/", response_model=ProjectOut, status_code=201)
def create_project(payload: ProjectCreate, db: Session = Depends(get_db)):
    project = ProjectCard(**payload.model_dump())
    db.add(project)
    # Auto-notify citizens about the new project
    db.add(Notification(
        type="INFO",
        title=f"New project announced: {payload.title}",
        body=payload.description or f"A new {payload.status} project by {payload.institution} has been registered.",
        lat=payload.lat,
        lon=payload.lon,
    ))
    db.commit()
    db.refresh(project)
    return project


@router.get("/{project_id}", response_model=ProjectOut)
def get_project(project_id: str, db: Session = Depends(get_db)):
    project = db.query(ProjectCard).filter(ProjectCard.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project


@router.put("/{project_id}", response_model=ProjectOut)
def update_project(project_id: str, payload: ProjectUpdate, db: Session = Depends(get_db)):
    project = db.query(ProjectCard).filter(ProjectCard.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(project, key, value)
    project.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(project)
    return project


@router.delete("/{project_id}", status_code=204)
def delete_project(project_id: str, db: Session = Depends(get_db)):
    project = db.query(ProjectCard).filter(ProjectCard.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    db.delete(project)
    db.commit()
