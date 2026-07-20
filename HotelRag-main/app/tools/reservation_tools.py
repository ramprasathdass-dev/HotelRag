import uuid
from typing import Dict, Optional

from app.db.crud import create_reservation_record, get_reservation_record, update_reservation_status


def _serialize_reservation(record, include_access_token: bool = False) -> Dict[str, str | int | None]:
    payload: Dict[str, str | int | None] = {
        "reservation_id": record.reservation_id,
        "status": record.status,
        "guest_name": record.guest_name,
        "email": record.email,
        "room_type": record.room_type,
        "check_in": record.check_in,
        "check_out": record.check_out,
        "guest_count": record.guest_count,
        "arrival_time": record.arrival_time,
        "occasion": record.occasion,
        "add_on_summary": record.add_on_summary,
        "special_request": record.special_request,
        "created_at": record.created_at.isoformat() if record.created_at else None,
        "updated_at": record.updated_at.isoformat() if record.updated_at else None,
    }
    if include_access_token:
        payload["access_token"] = record.access_token
    return payload


def create_reservation(
    *,
    guest_name: str,
    email: str,
    room_type: str,
    check_in: str,
    check_out: str,
    guest_count: int = 1,
    arrival_time: Optional[str] = None,
    occasion: Optional[str] = None,
    add_on_summary: Optional[str] = None,
    special_request: Optional[str] = None,
) -> Dict[str, str | int | None]:
    reservation_id = f"GAB-{uuid.uuid4().hex[:8].upper()}"
    access_token = uuid.uuid4().hex[:12].upper()
    record = create_reservation_record(
        reservation_id=reservation_id,
        access_token=access_token,
        guest_name=guest_name,
        email=email,
        room_type=room_type,
        check_in=check_in,
        check_out=check_out,
        guest_count=guest_count,
        arrival_time=arrival_time,
        occasion=occasion,
        add_on_summary=add_on_summary,
        special_request=special_request,
    )
    return _serialize_reservation(record, include_access_token=True)


def view_reservation(
    reservation_id: str,
    access_token: Optional[str] = None,
    include_access_token: bool = False,
) -> Optional[Dict[str, str | int | None]]:
    record = get_reservation_record(reservation_id, access_token)
    if record is None:
        return None
    return _serialize_reservation(record, include_access_token=include_access_token)


def cancel_reservation(
    reservation_id: str,
    access_token: Optional[str] = None,
    include_access_token: bool = False,
) -> Dict[str, str | int | None]:
    record = update_reservation_status(reservation_id, "cancelled", access_token)
    if record is None:
        raise ValueError("Reservation not found")
    return _serialize_reservation(record, include_access_token=include_access_token)
