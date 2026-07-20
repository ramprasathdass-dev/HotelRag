from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_root_endpoint_serves_frontend():
    response = client.get("/")
    assert response.status_code == 200
    assert "Grand Azure Bay Hotel" in response.text


def test_health_endpoint_returns_health_payload():
    response = client.get("/health")
    assert response.status_code == 200
    payload = response.json()
    assert payload["status"] == "ok"


def test_chat_endpoint_returns_response():
    response = client.post(
        "/chat",
        json={"message": "What is the cancellation policy?"},
    )
    assert response.status_code == 200
    payload = response.json()
    assert payload["answer"]
    assert payload["intent"] in {"rag", "tool", "mixed", "chitchat"}


def test_create_reservation_endpoint():
    response = client.post(
        "/reservation/create",
        json={
            "guest_name": "Ada Lovelace",
            "email": "ada@example.com",
            "room_type": "deluxe",
            "check_in": "2026-08-01",
            "check_out": "2026-08-03",
            "guest_count": 2,
            "arrival_time": "Evening arrival",
            "occasion": "Anniversary",
            "add_on_summary": "Airport pickup, Spa ritual",
            "special_request": "High floor if available",
        },
    )
    assert response.status_code == 200
    payload = response.json()
    assert payload["reservation_id"]
    assert payload["status"] == "confirmed"
    assert payload["access_token"]
    assert payload["arrival_time"] == "Evening arrival"
    assert payload["occasion"] == "Anniversary"
    assert payload["add_on_summary"] == "Airport pickup, Spa ritual"
    assert payload["created_at"]


def test_view_and_cancel_reservation_with_access_token():
    created = client.post(
        "/reservation/create",
        json={
            "guest_name": "Katherine Johnson",
            "email": "kj@example.com",
            "room_type": "ocean suite",
            "check_in": "2026-09-10",
            "check_out": "2026-09-14",
            "guest_count": 3,
            "arrival_time": "Afternoon arrival",
            "occasion": "Family holiday",
            "add_on_summary": "Sunrise breakfast",
        },
    ).json()

    response = client.post(
        "/reservation/view",
        json={
            "reservation_id": created["reservation_id"],
            "access_token": created["access_token"],
        },
    )
    assert response.status_code == 200
    assert response.json()["guest_count"] == 3
    assert response.json()["occasion"] == "Family holiday"

    cancelled = client.post(
        "/reservation/cancel",
        json={
            "reservation_id": created["reservation_id"],
            "access_token": created["access_token"],
        },
    )
    assert cancelled.status_code == 200
    assert cancelled.json()["status"] == "cancelled"
