import os
import uuid
from datetime import datetime, timedelta

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from pydantic import BaseModel

load_dotenv()

app = FastAPI(title="VibeModel API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://vibemodel.ai",
        "https://www.vibemodel.ai",
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5500",
        "http://localhost:5500",
        "*",  # Restrict to specific origins in production
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class DemoBooking(BaseModel):
    name: str
    email: str
    companyName: str
    country: str
    date: str   # YYYY-MM-DD  (unused directly — time ISO contains full datetime)
    time: str   # ISO string e.g. "2025-02-25T06:00:00+05:30"
    message: str = ""


def _get_calendar_service():
    creds = Credentials(
        token=None,
        refresh_token=os.getenv("GOOGLE_REFRESH_TOKEN"),
        token_uri="https://oauth2.googleapis.com/token",
        client_id=os.getenv("GOOGLE_CLIENT_ID"),
        client_secret=os.getenv("GOOGLE_CLIENT_SECRET"),
        scopes=["https://www.googleapis.com/auth/calendar"],
    )
    return build("calendar", "v3", credentials=creds)


@app.get("/")
async def root():
    return {"message": "VibeModel API is running"}


@app.post("/api/book-demo")
async def book_demo(booking: DemoBooking):
    host_email = os.getenv("HOST_EMAIL", "balagei.vibeai@gmail.com")
    secondary_email = os.getenv("SECONDARY_HOST_EMAIL", "balagei@vibemodel.ai")

    try:
        service = _get_calendar_service()

        # Parse the IST ISO string — Python 3.11+ handles "+05:30" natively
        start_dt = datetime.fromisoformat(booking.time)
        end_dt = start_dt + timedelta(minutes=30)

        event = {
            "summary": f"VibeModel Demo – {booking.name} ({booking.companyName})",
            "description": (
                f"Demo request received from the VibeModel website.\n\n"
                f"Name: {booking.name}\n"
                f"Email: {booking.email}\n"
                f"Company: {booking.companyName}\n"
                f"Country: {booking.country}\n\n"
                f"Notes:\n{booking.message or 'None provided.'}"
            ),
            "start": {
                "dateTime": start_dt.isoformat(),
                "timeZone": "Asia/Kolkata",
            },
            "end": {
                "dateTime": end_dt.isoformat(),
                "timeZone": "Asia/Kolkata",
            },
            "attendees": [
                {"email": host_email, "displayName": "VibeModel Team"},
                {"email": secondary_email, "displayName": "VibeModel Team"},
                {"email": booking.email, "displayName": booking.name},
            ],
            "conferenceData": {
                "createRequest": {
                    "requestId": str(uuid.uuid4()),
                    "conferenceSolutionKey": {"type": "hangoutsMeet"},
                }
            },
            "reminders": {
                "useDefault": False,
                "overrides": [
                    {"method": "email", "minutes": 1440},   # 24 hours before
                    {"method": "email", "minutes": 30},     # 30 minutes before
                    {"method": "popup", "minutes": 10},
                ],
            },
        }

        created_event = service.events().insert(
            calendarId=host_email,
            body=event,
            conferenceDataVersion=1,
            sendUpdates="all",   # sends email invites to all attendees
        ).execute()

        return {
            "success": True,
            "eventId": created_event.get("id"),
            "meetLink": created_event.get("hangoutLink", ""),
        }

    except HttpError as e:
        raise HTTPException(status_code=500, detail=f"Google Calendar error: {e}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
