from fastapi import FastAPI, APIRouter, HTTPException
from fastapi.responses import RedirectResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Google Calendar Config
GOOGLE_CLIENT_ID = os.environ.get('GOOGLE_CLIENT_ID', '')
GOOGLE_CLIENT_SECRET = os.environ.get('GOOGLE_CLIENT_SECRET', '')
REDIRECT_URI = os.environ.get('GOOGLE_REDIRECT_URI', '')

app = FastAPI()
api_router = APIRouter(prefix="/api")

# Models
class ContactMessage(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: EmailStr
    company: Optional[str] = None
    message: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ContactMessageCreate(BaseModel):
    name: str
    email: EmailStr
    company: Optional[str] = None
    message: str

class MeetingRequest(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: EmailStr
    company: Optional[str] = None
    date: str
    time: str
    timezone: str = "UTC"
    notes: Optional[str] = None
    status: str = "pending"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class MeetingRequestCreate(BaseModel):
    name: str
    email: EmailStr
    company: Optional[str] = None
    date: str
    time: str
    timezone: str = "UTC"
    notes: Optional[str] = None

# Routes
@api_router.get("/")
async def root():
    return {"message": "Klyron Consulting API"}

@api_router.get("/health")
async def health_check():
    return {"status": "healthy", "service": "klyron-consulting"}

# Contact endpoints
@api_router.post("/contact", response_model=dict)
async def create_contact_message(input: ContactMessageCreate):
    contact_obj = ContactMessage(**input.model_dump())
    doc = contact_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.contact_messages.insert_one(doc)
    return {"success": True, "message": "Message sent successfully", "id": contact_obj.id}

@api_router.get("/contact", response_model=List[dict])
async def get_contact_messages():
    messages = await db.contact_messages.find({}, {"_id": 0}).to_list(1000)
    return messages

# Meeting scheduling endpoints
@api_router.post("/meetings", response_model=dict)
async def create_meeting_request(input: MeetingRequestCreate):
    meeting_obj = MeetingRequest(**input.model_dump())
    doc = meeting_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.meeting_requests.insert_one(doc)
    return {
        "success": True, 
        "message": "Meeting request submitted successfully", 
        "id": meeting_obj.id,
        "meeting": {
            "id": meeting_obj.id,
            "name": meeting_obj.name,
            "email": meeting_obj.email,
            "date": meeting_obj.date,
            "time": meeting_obj.time,
            "status": meeting_obj.status
        }
    }

@api_router.get("/meetings", response_model=List[dict])
async def get_meeting_requests():
    meetings = await db.meeting_requests.find({}, {"_id": 0}).to_list(1000)
    return meetings

@api_router.get("/meetings/{meeting_id}", response_model=dict)
async def get_meeting(meeting_id: str):
    meeting = await db.meeting_requests.find_one({"id": meeting_id}, {"_id": 0})
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    return meeting

@api_router.patch("/meetings/{meeting_id}/status", response_model=dict)
async def update_meeting_status(meeting_id: str, status: str):
    result = await db.meeting_requests.update_one(
        {"id": meeting_id},
        {"$set": {"status": status}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Meeting not found")
    return {"success": True, "message": f"Meeting status updated to {status}"}

# Available time slots (simplified for now without Google Calendar)
@api_router.get("/available-slots")
async def get_available_slots(date: str):
    # Default available slots (9 AM to 5 PM, 1-hour slots)
    default_slots = [
        "09:00", "10:00", "11:00", "12:00", 
        "13:00", "14:00", "15:00", "16:00", "17:00"
    ]
    
    # Get booked slots for the date
    booked_meetings = await db.meeting_requests.find(
        {"date": date, "status": {"$ne": "cancelled"}},
        {"_id": 0, "time": 1}
    ).to_list(100)
    
    booked_times = [m["time"] for m in booked_meetings]
    available_slots = [slot for slot in default_slots if slot not in booked_times]
    
    return {"date": date, "available_slots": available_slots}

# Google Calendar OAuth endpoints (for future integration)
@api_router.get("/oauth/calendar/status")
async def calendar_status():
    """Check if Google Calendar is configured"""
    is_configured = bool(GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET)
    return {
        "configured": is_configured,
        "message": "Google Calendar integration ready" if is_configured else "Google Calendar not configured"
    }

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
