from typing import Optional
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database import SessionLocal
from models.report import Report

router = APIRouter()

VALID_STATUSES = ["open", "in_review", "resolved", "revoked"]


class ReportCreate(BaseModel):
    title: str
    description: Optional[str] = None
    lat: Optional[float] = None
    lon: Optional[float] = None


class ReportUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None


class ReportOut(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    lat: Optional[float] = None
    lon: Optional[float] = None
    status: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/", response_model=list[ReportOut])
def list_reports(status: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(Report)
    if status:
        query = query.filter(Report.status == status)
    return query.order_by(Report.created_at.desc()).all()


@router.post("/", response_model=ReportOut, status_code=201)
def create_report(payload: ReportCreate, db: Session = Depends(get_db)):
    report = Report(**payload.model_dump())
    db.add(report)
    db.commit()
    db.refresh(report)
    return report


@router.get("/{report_id}", response_model=ReportOut)
def get_report(report_id: str, db: Session = Depends(get_db)):
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return report


@router.put("/{report_id}", response_model=ReportOut)
def update_report(report_id: str, payload: ReportUpdate, db: Session = Depends(get_db)):
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    if payload.status and payload.status not in VALID_STATUSES:
        raise HTTPException(status_code=422, detail=f"status must be one of {VALID_STATUSES}")
    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(report, key, value)
    report.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(report)
    return report


@router.delete("/{report_id}", status_code=204)
def revoke_report(report_id: str, db: Session = Depends(get_db)):
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    db.delete(report)
    db.commit()
