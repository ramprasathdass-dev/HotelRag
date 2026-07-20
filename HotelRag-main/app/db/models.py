from sqlalchemy import Column, DateTime, Integer, String
from sqlalchemy.sql import func

from app.db.database import Base


class Reservation(Base):
    __tablename__ = "reservations"

    reservation_id = Column(String, primary_key=True, index=True)
    access_token = Column(String, nullable=False, index=True)
    guest_name = Column(String, nullable=False)
    email = Column(String, nullable=False)
    room_type = Column(String, nullable=False)
    check_in = Column(String, nullable=False)
    check_out = Column(String, nullable=False)
    guest_count = Column(Integer, default=1, nullable=False)
    arrival_time = Column(String, nullable=True)
    occasion = Column(String, nullable=True)
    add_on_summary = Column(String, nullable=True)
    special_request = Column(String, nullable=True)
    status = Column(String, default="confirmed", nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
