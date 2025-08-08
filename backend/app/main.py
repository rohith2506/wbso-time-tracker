from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.db.init_db import init_db
from app.api.api_v1.api import api_router
import os

app = FastAPI(
    title="WBSO Time Tracker API",
    description="API for tracking R&D time for WBSO compliance",
    version="1.0.0"
)

# Set up CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(api_router, prefix="/api/v1")

# Serve React static files (if build folder exists)
if os.path.exists("static"):
    app.mount("/static", StaticFiles(directory="static"), name="static")
    
    # Catch-all route to serve React app for any non-API routes
    @app.get("/{full_path:path}")
    async def serve_react_app(full_path: str):
        # Don't serve React for API routes
        if full_path.startswith("api/"):
            return {"detail": "Not found"}
        
        # Serve React's index.html for all other routes
        return FileResponse("static/index.html")

@app.on_event("startup")
async def startup_event():
    # Initialize database and create tables
    init_db()

@app.get("/")
async def root():
    return {"message": "WBSO Time Tracker API"}
