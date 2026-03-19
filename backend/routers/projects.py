from typing import Optional
from datetime import datetime, timezone
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
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
    project_type: Optional[str] = "infrastructure"
    status: Optional[str] = "active"
    completion_pct: Optional[int] = 0
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    apartments: Optional[int] = None
    image_url: Optional[str] = None
    lat: Optional[float] = None
    lon: Optional[float] = None


class ProjectUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    institution: Optional[str] = None
    project_type: Optional[str] = None
    status: Optional[str] = None
    completion_pct: Optional[int] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    apartments: Optional[int] = None
    image_url: Optional[str] = None
    lat: Optional[float] = None
    lon: Optional[float] = None


class ProjectOut(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    institution: str
    project_type: str = "infrastructure"
    status: str
    completion_pct: int = 0
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    apartments: Optional[int] = None
    image_url: Optional[str] = None
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


@router.post("/{project_id}/image", response_model=ProjectOut)
async def upload_image(project_id: str, file: UploadFile = File(...), db: Session = Depends(get_db)):
    project = db.query(ProjectCard).filter(ProjectCard.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    uploads_dir = Path("uploads")
    uploads_dir.mkdir(exist_ok=True)
    suffix = Path(file.filename or "image.jpg").suffix or ".jpg"
    filename = f"{project_id}{suffix}"
    file_path = uploads_dir / filename
    with open(file_path, "wb") as f:
        f.write(await file.read())
    project.image_url = f"/uploads/{filename}"
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
