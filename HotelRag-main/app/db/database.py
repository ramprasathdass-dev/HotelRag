from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

DATABASE_URL = "sqlite:///./hotel_assistant.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
Base = declarative_base()


def _ensure_reservation_schema() -> None:
    additions = {
        "access_token": "ALTER TABLE reservations ADD COLUMN access_token VARCHAR NOT NULL DEFAULT ''",
        "guest_count": "ALTER TABLE reservations ADD COLUMN guest_count INTEGER NOT NULL DEFAULT 1",
        "arrival_time": "ALTER TABLE reservations ADD COLUMN arrival_time VARCHAR",
        "occasion": "ALTER TABLE reservations ADD COLUMN occasion VARCHAR",
        "add_on_summary": "ALTER TABLE reservations ADD COLUMN add_on_summary VARCHAR",
        "special_request": "ALTER TABLE reservations ADD COLUMN special_request VARCHAR",
    }
    with engine.begin() as connection:
        columns = {
            row[1]
            for row in connection.exec_driver_sql("PRAGMA table_info(reservations)").fetchall()
        }
        for column_name, statement in additions.items():
            if column_name not in columns:
                connection.exec_driver_sql(statement)


def init_db() -> None:
    from app.db.models import Reservation  # noqa: F401

    Base.metadata.create_all(bind=engine)
    _ensure_reservation_schema()
