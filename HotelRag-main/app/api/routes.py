from fastapi import APIRouter, HTTPException

from app.api.schemas import (
    ChatRequest,
    ChatResponse,
    ReservationCreateRequest,
    ReservationLookupRequest,
    ReservationResponse,
)
from app.services.assistant import AssistantService

router = APIRouter()
assistant = AssistantService()


@router.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest):
    return assistant.handle_message(request.message)


@router.post("/reservation/create", response_model=ReservationResponse)
def create_reservation(request: ReservationCreateRequest):
    return assistant.create_reservation(
        guest_name=request.guest_name,
        email=request.email,
        room_type=request.room_type,
        check_in=request.check_in,
        check_out=request.check_out,
        guest_count=request.guest_count,
        arrival_time=request.arrival_time,
        occasion=request.occasion,
        add_on_summary=request.add_on_summary,
        special_request=request.special_request,
    )


@router.post("/reservation/view", response_model=ReservationResponse)
def view_reservation_secure(request: ReservationLookupRequest):
    try:
        return assistant.view_reservation(request.reservation_id, request.access_token)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.post("/reservation/cancel", response_model=ReservationResponse)
def cancel_reservation_secure(request: ReservationLookupRequest):
    try:
        return assistant.cancel_reservation(request.reservation_id, request.access_token)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.get("/reservation/view/{reservation_id}", response_model=ReservationResponse)
def view_reservation(reservation_id: str):
    try:
        return assistant.view_reservation(reservation_id)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.post("/reservation/cancel/{reservation_id}", response_model=ReservationResponse)
def cancel_reservation(reservation_id: str):
    try:
        return assistant.cancel_reservation(reservation_id)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
