from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.db.init_db import init_db
from app.api.api_v1.api import api_router

app = FastAPI(
    title="WBSO Time Tracker API",
    description="API for tracking R&D time for WBSO compliance",
    version="1.0.0"
)

# Set up CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(api_router, prefix="/api/v1")

@app.on_event("startup")
async def startup_event():
    # Initialize database and create tables
    init_db()

@app.get("/")
async def root():
    return {"message": "WBSO Time Tracker API"}

@app.get("/test")
async def test():
    return {"status": "working", "config_loaded": settings.PROJECT_NAME}

@app.get("/test-db")
async def test_db():
    try:
        from app.db.session import get_db
        from app.db.base import engine
        from sqlalchemy import text
        
        # Test database connection
        with engine.connect() as connection:
            result = connection.execute(text("SELECT 1 as test"))
            test_value = result.fetchone()[0]
            
        return {
            "status": "database_connected", 
            "database_url": settings.DATABASE_URL,
            "test_query_result": test_value
        }
    except Exception as e:
        return {"status": "database_error", "error": str(e)}

@app.get("/test-register")
async def test_register():
    """Test endpoint to verify user creation works"""
    try:
        from app.db.session import get_db
        from app.schemas.user import UserCreate
        from app.crud.user import create_user, get_user_by_email
        from datetime import datetime
        
        # Create a test user
        db = next(get_db())
        
        # Check if test user already exists
        existing_user = get_user_by_email(db, "test@example.com")
        if existing_user:
            return {"status": "user_already_exists", "user_id": existing_user.id}
        
        test_user_data = UserCreate(
            email="test@example.com",
            password="testpassword123",
            project_name="Test WBSO Project",
            wbso_application_number="WBSO-2024-TEST",
            project_start_date=datetime(2024, 1, 1),
            project_end_date=datetime(2024, 12, 31),
            approved_hours=1500.0
        )
        
        user = create_user(db, test_user_data)
        
        return {
            "status": "user_created_successfully",
            "user_id": user.id,
            "email": user.email,
            "project_name": user.project_name
        }
        
    except Exception as e:
        return {"status": "error", "error": str(e)}

@app.get("/test-time-entry")
async def test_time_entry():
    """Test endpoint to verify time entry creation works"""
    try:
        from app.db.session import get_db
        from app.schemas.time_entry import TimeEntryCreate
        from app.crud.time_entry import create_time_entry, get_time_entries
        from app.crud.user import get_user_by_email
        from datetime import datetime
        
        db = next(get_db())
        
        # Get the test user we created earlier
        user = get_user_by_email(db, "test@example.com")
        if not user:
            return {"status": "error", "error": "Test user not found. Run /test-register first"}
        
        # Create a test time entry
        test_entry_data = TimeEntryCreate(
            date=datetime(2024, 8, 5),
            hours=7.5,
            project_phase="Research",
            activity_description="Conducted thermal analysis experiments on composite materials to determine optimal curing parameters for the new AI-powered material analysis system",
            technical_challenge="Technical uncertainty about temperature-dependent material properties and their impact on automated defect detection algorithms"
        )
        
        entry = create_time_entry(db, test_entry_data, user_id=user.id)
        
        # Get all entries for this user
        all_entries = get_time_entries(db, user.id)
        
        return {
            "status": "time_entry_created_successfully",
            "entry_id": entry.id,
            "user_id": entry.user_id,
            "date": entry.date.isoformat(),
            "hours": entry.hours,
            "total_entries": len(all_entries)
        }
        
    except Exception as e:
        return {"status": "error", "error": str(e)}
