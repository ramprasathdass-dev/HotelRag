from app.tools.reservation_tools import create_reservation, view_reservation, cancel_reservation


def test_create_view_cancel_flow():
    reservation = create_reservation(
        guest_name="Grace Hopper",
        email="grace@example.com",
        room_type="suite",
        check_in="2026-09-01",
        check_out="2026-09-04",
        guest_count=2,
        arrival_time="Morning arrival",
        occasion="Workation",
        add_on_summary="Late checkout, Sunrise breakfast",
    )
    found = view_reservation(reservation["reservation_id"], reservation["access_token"])
    assert found is not None
    assert found["arrival_time"] == "Morning arrival"
    assert found["occasion"] == "Workation"
    cancelled = cancel_reservation(reservation["reservation_id"], reservation["access_token"])
    assert cancelled["status"] == "cancelled"
