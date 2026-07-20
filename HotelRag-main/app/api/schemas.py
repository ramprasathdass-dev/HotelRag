from typing import Any, Dict, List, Optional

from pydantic import BaseModel, EmailStr, Field


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=500)


class ChatResponse(BaseModel):
    answer: str
    intent: str
    sources: List[str] = Field(default_factory=list)
    reservation_id: Optional[str] = None


class ReservationCreateRequest(BaseModel):
    guest_name: str = Field(..., min_length=1)
    email: EmailStr
    room_type: str = Field(..., min_length=1)
    check_in: str
    check_out: str
    guest_count: int = Field(default=1, ge=1, le=8)
    arrival_time: Optional[str] = Field(default=None, max_length=40)
    occasion: Optional[str] = Field(default=None, max_length=80)
    add_on_summary: Optional[str] = Field(default=None, max_length=200)
    special_request: Optional[str] = Field(default=None, max_length=300)


class ReservationLookupRequest(BaseModel):
    reservation_id: str = Field(..., min_length=5)
    access_token: str = Field(..., min_length=6)


class ReservationResponse(BaseModel):
    reservation_id: str
    status: str
    guest_name: str
    email: str
    room_type: str
    check_in: str
    check_out: str
    guest_count: int
    arrival_time: Optional[str] = None
    occasion: Optional[str] = None
    add_on_summary: Optional[str] = None
    special_request: Optional[str] = None
    access_token: Optional[str] = None
    message: Optional[str] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None
