from typing import Optional

from sqlalchemy.orm import Session

from app.db.database import SessionLocal
from app.db.models import Reservation


def get_db() -> Session:
    db = SessionLocal()
    try:
        return db
    except Exception:
        db.close()
        raise


def create_reservation_record(
    *,
    reservation_id: str,
    access_token: str,
    guest_name: str,
    email: str,
    room_type: str,
    check_in: str,
    check_out: str,
    guest_count: int,
    arrival_time: str | None,
    occasion: str | None,
    add_on_summary: str | None,
    special_request: str | None,
) -> Reservation:
    db = get_db()
    reservation = Reservation(
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
        status="confirmed",
    )
    db.add(reservation)
    db.commit()
    db.refresh(reservation)
    db.close()
    return reservation


def get_reservation_record(reservation_id: str, access_token: str | None = None) -> Optional[Reservation]:
    db = get_db()
    query = db.query(Reservation).filter(Reservation.reservation_id == reservation_id)
    if access_token is not None:
        query = query.filter(Reservation.access_token == access_token)
    reservation = query.first()
    db.close()
    return reservation


def update_reservation_status(
    reservation_id: str,
    status: str,
    access_token: str | None = None,
) -> Optional[Reservation]:
    db = get_db()
    query = db.query(Reservation).filter(Reservation.reservation_id == reservation_id)
    if access_token is not None:
        query = query.filter(Reservation.access_token == access_token)
    reservation = query.first()
    if reservation is None:
        db.close()
        return None
    reservation.status = status
    db.commit()
    db.refresh(reservation)
    db.close()
    return reservation
