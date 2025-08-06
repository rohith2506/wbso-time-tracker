from app.db.base import Base, engine
from app.models import User, TimeEntry

def init_db() -> None:
    # Create tables
    Base.metadata.create_all(bind=engine)
