from typing import Optional
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, field_validator
from sqlalchemy.orm import Session

from database import SessionLocal
from models.request import Request

router = APIRouter()

# --------------- Constants ---------------

INDIVIDUAL_REQUEST_TYPES = [
    "document_retrieval",
    "non_commercial_building",
    "land_use_permit",
    "property_registration",
    "construction_permit",
    "utility_connection",
    "fence_garage_permit",
]

BUSINESS_REQUEST_TYPES = [
    "apartment_building",
    "shopping_center",
    "office_building",
    "hotel",
    "industrial_facility",
    "parking_lot",
    "restaurant_cafe",
    "mixed_use_development",
]

VALID_STATUSES = ["pending", "under_review", "approved", "rejected", "changes_requested"]


# --------------- Pydantic schemas ---------------

class RequestCreate(BaseModel):
    requester_type: str   # "individual" | "business"
    identifier: str       # 12-digit ИИН or БИН
    request_type: str
    description: Optional[str] = None
    address: str

    @field_validator("requester_type")
    @classmethod
    def validate_requester_type(cls, v: str) -> str:
        if v not in ("individual", "business"):
            raise ValueError("requester_type must be 'individual' or 'business'")
        return v

    @field_validator("identifier")
    @classmethod
    def validate_identifier(cls, v: str) -> str:
        digits = v.replace(" ", "").replace("-", "")
        if not digits.isdigit() or len(digits) != 12:
            raise ValueError("identifier must be exactly 12 digits (ИИН or БИН)")
        return digits


class RequestUpdate(BaseModel):
    status: Optional[str] = None
    description: Optional[str] = None
    address: Optional[str] = None

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and v not in VALID_STATUSES:
            raise ValueError(f"status must be one of {VALID_STATUSES}")
        return v


class RequestOut(BaseModel):
    id: str
    requester_type: str
    identifier: str
    request_type: str
    description: Optional[str] = None
    address: str
    status: str
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

@router.get("/", response_model=list[RequestOut])
def list_requests(
    requester_type: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
):
    query = db.query(Request)
    if requester_type:
        query = query.filter(Request.requester_type == requester_type)
    if status:
        query = query.filter(Request.status == status)
    return query.order_by(Request.created_at.desc()).all()


@router.post("/", response_model=RequestOut, status_code=201)
def create_request(payload: RequestCreate, db: Session = Depends(get_db)):
    # Validate request_type against requester_type
    valid_types = INDIVIDUAL_REQUEST_TYPES if payload.requester_type == "individual" else BUSINESS_REQUEST_TYPES
    if payload.request_type not in valid_types:
        raise HTTPException(status_code=422, detail=f"Invalid request_type for {payload.requester_type}")
    req = Request(**payload.model_dump())
    db.add(req)
    db.commit()
    db.refresh(req)
    return req


@router.get("/{request_id}", response_model=RequestOut)
def get_request(request_id: str, db: Session = Depends(get_db)):
    req = db.query(Request).filter(Request.id == request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")
    return req


@router.put("/{request_id}", response_model=RequestOut)
def update_request(request_id: str, payload: RequestUpdate, db: Session = Depends(get_db)):
    req = db.query(Request).filter(Request.id == request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")
    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(req, key, value)
    req.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(req)
    return req


@router.delete("/{request_id}", status_code=204)
def delete_request(request_id: str, db: Session = Depends(get_db)):
    req = db.query(Request).filter(Request.id == request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")
    db.delete(req)
    db.commit()
